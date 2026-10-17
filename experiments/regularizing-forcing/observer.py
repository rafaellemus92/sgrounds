"""Paired unforced reference and nudged observer on the mean-zero 2-D torus.

U_t = nu*Delta U - P_sigma((U.grad)U)
V_t = nu*Delta V - P_sigma((V.grad)V) - mu*P_K(V-U) + mu*eta.

The original reference receives neither feedback nor artificial forcing.
Both velocities have zero mean; vorticity alone cannot represent their means.
This is a known-regular 2-D calibration, not a 3-D regularity computation.
"""

from dataclasses import asdict, dataclass

import numpy as np

from solver import Config, Flow


@dataclass(frozen=True)
class ObserverConfig:
    n: int = 48
    dt: float = 0.01
    duration: float = 8.0
    viscosity: float = 0.06
    gain: float = 0.8
    cutoff: int = 2
    noise: float = 0.0
    noise_period: float = 4.0
    record_every: int = 10

    def __post_init__(self):
        Config(n=self.n, dt=self.dt, duration=self.duration,
               viscosity=self.viscosity, record_every=self.record_every)
        if isinstance(self.cutoff, bool) or not isinstance(self.cutoff, int) or self.cutoff < 1:
            raise ValueError("cutoff must be an integer >= 1")
        if not np.isfinite(self.gain) or not np.isfinite(self.noise) or self.gain < 0 or self.noise < 0:
            raise ValueError("gain and noise must be finite and nonnegative")
        if not np.isfinite(self.noise_period) or self.noise_period <= 0:
            raise ValueError("noise_period must be finite and positive")
        if self.cutoff >= self.n/3:
            raise ValueError("observation cutoff must lie inside the resolved Fourier band")


class ObserverFlow:
    def __init__(self, config):
        self.config = config
        self.flow = Flow(Config(n=config.n, dt=config.dt, duration=config.duration,
                                viscosity=config.viscosity, amplitude=0, feedback=0,
                                record_every=config.record_every))
        f = self.flow
        self.observed = (f.k2 <= config.cutoff**2) & f.keep
        self.alpha = min(config.viscosity+config.gain,
                         config.viscosity*(config.cutoff**2+1))
        self.linear = -config.viscosity*f.k2
        self.max_wave = float(np.max(np.abs(f.kx[f.keep])))

    def default_states(self):
        f = self.flow
        reference = f.initial()
        error = f.project(np.sin(f.x) + 0.6*np.cos(f.x+f.y)
                          + 0.4*np.sin(3*f.x-f.y) + 0.3*np.cos(2*f.x+3*f.y))
        error *= 0.5/np.sqrt(f.inner(error, error, f.inv_k2))
        return np.stack((reference, reference+error))

    def noise_hat(self, t):
        # eta = epsilon*cos(2*pi*t/period)*(0,sqrt(2)*sin x).
        # This is observed, divergence free, mean zero, and ||eta||_2 <= epsilon.
        return (self.config.noise*np.cos(2*np.pi*t/self.config.noise_period)
                * self.flow.h1hat)

    def strain(self, reference):
        f = self.flow
        ux, uy = f.velocity_hat(reference)
        ah = 1j*f.kx*ux
        bh = (1j*f.ky*ux+1j*f.kx*uy)/2
        dh = 1j*f.ky*uy
        a, b, d = [np.fft.ifft2(x).real for x in (ah, bh, dh)]
        # For the interpolating polynomial, triangle inequality bounds each entry
        # continuously in space; no grid-only maximum is substituted for a supremum.
        n2 = f.config.n**2
        spectral_bound = float(np.hypot(np.abs(ah).sum()/n2, np.abs(bh).sum()/n2))
        grid_rate = float(np.max(np.hypot((a-d)/2, b)-(a+d)/2))
        return a, b, d, spectral_bound, grid_rate

    def rhs(self, t, state, bound, step_size=None):
        f, c = self.flow, self.config
        U, V = state
        error = V-U
        NU, ux, uy = f.nonlinear(U)
        NV, vx, vy = f.nonlinear(V)
        if step_size is not None:
            cfl = step_size*self.max_wave*max(
                np.max(np.abs(ux))+np.max(np.abs(uy)),
                np.max(np.abs(vx))+np.max(np.abs(vy)))
            if not np.isfinite(cfl) or cfl > 1:
                raise FloatingPointError("paired advective stability guard exceeded; reduce dt")
        noise = self.noise_hat(t)
        correction = -c.gain*self.observed*error
        U_rhs = (NU+self.linear*U)*f.keep
        V_rhs = (NV+self.linear*V+correction+c.gain*noise)*f.keep
        a, b, d, strain_bound, _ = self.strain(U)
        ex, ey = vx-ux, vy-uy
        production = -float(np.mean(a*ex**2+2*b*ex*ey+d*ey**2))
        error_noise = c.gain*f.inner(error, noise, f.inv_k2)
        reference_pal = f.inner(U, U, f.k2)
        observer_pal = f.inner(V, V, f.k2)
        u_energy_rate = -c.viscosity*f.inner(U, U)
        u_enstrophy_rate = -c.viscosity*reference_pal
        correction_work = f.inner(V, correction, f.inv_k2)
        noise_work = c.gain*f.inner(V, noise, f.inv_k2)
        v_energy_rate = -c.viscosity*f.inner(V, V)+correction_work+noise_work
        v_enstrophy_rate = (-c.viscosity*observer_pal + f.inner(V, correction)
                            + c.gain*f.inner(V, noise))
        error_rate = (-c.viscosity*f.inner(error, error)
                      - c.gain*f.inner(error, error, self.observed*f.inv_k2)
                      + production+error_noise)
        derivative = np.stack((U_rhs, V_rhs))
        identity_residual = f.inner(error, V_rhs-U_rhs, f.inv_k2)-error_rate
        rates = np.array([u_energy_rate, u_enstrophy_rate, v_energy_rate,
                          v_enstrophy_rate, error_rate, correction_work, noise_work,
                          error_noise, production, reference_pal, observer_pal, strain_bound])
        bound_rhs = (strain_bound-self.alpha)*bound+c.gain*c.noise
        return derivative, rates, float(bound_rhs), float(identity_residual)

    def step(self, t, state, bound, h):
        k1, r1, b1, e1 = self.rhs(t, state, bound, h)
        k2, r2, b2, e2 = self.rhs(t+h/2, state+h*k1/2, bound+h*b1/2, h)
        k3, r3, b3, e3 = self.rhs(t+h/2, state+h*k2/2, bound+h*b2/2, h)
        k4, r4, b4, e4 = self.rhs(t+h, state+h*k3, bound+h*b3, h)
        return ((state+h*(k1+2*k2+2*k3+k4)/6)*self.flow.keep,
                bound+h*(b1+2*b2+2*b3+b4)/6,
                h*(r1+2*r2+2*r3+r4)/6,
                max(abs(e1), abs(e2), abs(e3), abs(e4)))

    def row(self, t, state, bound, integrals, initial):
        f = self.flow
        U, V = state
        error = V-U
        energy_U = f.inner(U,U,f.inv_k2)/2
        energy_V = f.inner(V,V,f.inv_k2)/2
        energy_e = f.inner(error,error,f.inv_k2)/2
        z_U, z_V = f.inner(U,U)/2, f.inner(V,V)/2
        _, _, _, strain_bound, grid_rate = self.strain(U)
        e_low2 = f.inner(error,error,self.observed*f.inv_k2)
        e_high2 = f.inner(error,error,(~self.observed)*f.inv_k2)
        return dict(time=float(t), reference_energy=energy_U, observer_energy=energy_V,
                    error_L2=float(np.sqrt(max(0,2*energy_e))),
                    error_H1_seminorm=float(np.sqrt(max(0,f.inner(error,error)))),
                    observed_error_L2=float(np.sqrt(max(0,e_low2))),
                    hidden_error_L2=float(np.sqrt(max(0,e_high2))),
                    reference_enstrophy=z_U, observer_enstrophy=z_V,
                    reference_palinstrophy=f.inner(U,U,f.k2),
                    observer_palinstrophy=f.inner(V,V,f.k2),
                    reference_vortex_stretching=0.0,
                    strain_spectral_upper_bound=strain_bound, strain_grid_maximum=grid_rate,
                    accumulated_strain_upper_bound=float(integrals[11]),
                    numerical_tracking_envelope=float(bound),
                    correction_work=float(integrals[5]), noise_work=float(integrals[6]),
                    error_noise_work=float(integrals[7]), strain_error_work=float(integrals[8]),
                    reference_energy_budget_error=energy_U-initial[0]-integrals[0],
                    reference_enstrophy_budget_error=z_U-initial[1]-integrals[1],
                    observer_energy_budget_error=energy_V-initial[2]-integrals[2],
                    observer_enstrophy_budget_error=z_V-initial[3]-integrals[3],
                    error_energy_budget_error=energy_e-initial[4]-integrals[4])


def simulate_observer(config, reference0=None, observer0=None):
    pair = ObserverFlow(config)
    f = pair.flow
    state = pair.default_states()
    if reference0 is not None:
        state[0] = f.project(reference0)
    if observer0 is not None:
        state[1] = f.project(observer0)
    initial = [f.inner(state[0],state[0],f.inv_k2)/2,
               f.inner(state[0],state[0])/2,
               f.inner(state[1],state[1],f.inv_k2)/2,
               f.inner(state[1],state[1])/2,
               f.inner(state[1]-state[0],state[1]-state[0],f.inv_k2)/2]
    bound = float(np.sqrt(2*initial[4]))
    integrals = np.zeros(12)
    rows = [pair.row(0,state,bound,integrals,initial)]
    steps = int(np.ceil(config.duration/config.dt))
    h = config.duration/steps
    if h*float(np.max(config.viscosity*f.k2[f.keep]+config.gain*pair.observed[f.keep])) > 2.5:
        raise ValueError("paired explicit diffusion/feedback step too large; reduce dt")
    residual = 0.0
    for j in range(steps):
        state, bound, delta, identity = pair.step(j*h,state,bound,h)
        if not np.isfinite(state).all() or not np.isfinite(bound):
            raise FloatingPointError("nonfinite paired numerical state")
        integrals += delta
        residual = max(residual,identity)
        if (j+1) % config.record_every == 0 or j+1 == steps:
            rows.append(pair.row((j+1)*h,state,bound,integrals,initial))
    budget_keys = [k for k in rows[0] if k.endswith("budget_error")]
    return dict(config=asdict(config), alpha=pair.alpha, rows=rows,
                final_error_L2=rows[-1]["error_L2"],
                final_error_H1_seminorm=rows[-1]["error_H1_seminorm"],
                final_reference_energy=rows[-1]["reference_energy"],
                reference_vortex_stretching="identically zero in this 2-D model",
                max_instantaneous_error_identity_residual=residual,
                max_recorded_budget_error=max(abs(r[k]) for r in rows for k in budget_keys),
                max_recorded_envelope_excess=max(r["error_L2"]-r["numerical_tracking_envelope"] for r in rows),
                sampled_minimum_decay_margin=pair.alpha-max(r["strain_spectral_upper_bound"] for r in rows),
                final_reference_vorticity=np.fft.ifft2(state[0]).real,
                final_observer_vorticity=np.fft.ifft2(state[1]).real)
