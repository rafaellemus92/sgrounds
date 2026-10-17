"""Reuse the supplied verifier and add independent 3-D consistency checks.

Only instantaneous resolved trigonometric fields are evaluated in 3-D. There
is no generic 3-D time integrator or regularity certificate in this module.
"""
import hashlib
import importlib.util
from pathlib import Path

import numpy as np


SOURCE = Path(__file__).resolve().parent / "upstream" / "grounding" / "verify_grounding_ns.py"
SOURCE_SHA256 = "03989d8f06eb521c5826f91b0dd1ea59e0cac3c7a057e80f0a327f7c115192c6"


def upstream_module():
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != SOURCE_SHA256:
        raise ValueError("Preserved upstream verifier no longer matches its reviewed checksum")
    spec = importlib.util.spec_from_file_location("grounding_upstream", SOURCE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_identity_checks(seed=20261016, n=24, count=5):
    if isinstance(n,bool) or not isinstance(n,int) or n < 20 or n % 2:
        raise ValueError("n must be even and >=20 to resolve the polynomial products")
    if isinstance(count,bool) or not isinstance(count,int) or count < 1:
        raise ValueError("count must be a positive integer")
    upstream = upstream_module()
    cube = upstream.FourierCube(n)
    inner = upstream.inner
    rows = []
    nu, mu, cutoff = 0.07, 0.8, 2
    for j in range(count):
        U = cube.random_solenoidal(seed+2*j,0.7)
        e = cube.random_solenoidal(seed+2*j+1,0.6)
        V = U+e
        Pe = cube.low(e,cutoff)
        adv_U, adv_V = cube.advect(U,U), cube.advect(V,V)
        rhs_U = nu*cube.laplacian(U)-cube.leray(adv_U)
        rhs_V = nu*cube.laplacian(V)-cube.leray(adv_V)-mu*Pe
        g = cube.gradient(U)
        strain = (g+g.swapaxes(0,1))/2
        contraction = float(np.mean(np.einsum("ixyz,ijxyz,jxyz->xyz",e,strain,e)))
        energy_residual = (inner(e,rhs_V-rhs_U)+nu*cube.gradient_norm2(e)
                           +mu*inner(Pe,Pe)+contraction)
        omega = cube.curl(U)
        stretching = inner(omega,cube.advect(omega,U))
        enstrophy_residual = (inner(omega,cube.curl(rhs_U))
                              +nu*cube.gradient_norm2(omega)-stretching)
        # Independently compare physical and spectral gradient norms, and retain
        # the pressure-gradient part discarded by Leray for an orthogonality check.
        uh = cube.fft(U)
        spectral_grad2 = float(np.sum(cube.k2*np.abs(uh)**2)/n**6)
        pressure_gradient = adv_U-cube.leray(adv_U)
        matrices = np.moveaxis(strain,(0,1),(-2,-1))
        eigenvalues = np.linalg.eigvalsh(matrices)
        compression = np.maximum(0,-eigenvalues[...,0])
        strain_relation_excess = float(np.max(eigenvalues[...,-1]-2*compression))
        row = dict(seed=seed+2*j, error_identity_residual=abs(energy_residual),
                   vorticity_identity_residual=abs(enstrophy_residual),
                   transport_residual=abs(inner(e,cube.advect(V,e))),
                   pressure_work_residual=abs(inner(U,pressure_gradient)),
                   parseval_gradient_residual=abs(spectral_grad2-cube.gradient_norm2(U)),
                   divergence_max=float(np.max(np.abs(cube.divergence(V)))),
                   stretching=float(stretching),
                   trace_strain_max=float(np.max(np.abs(np.trace(matrices,axis1=-2,axis2=-1)))),
                   strain_eigenvalue_relation_excess=strain_relation_excess)
        rows.append(row)
    residual_keys = [k for k in rows[0] if k.endswith("residual")]
    max_residual = max(row[k] for row in rows for k in residual_keys)
    passed = (max_residual < 2e-11 and max(r["divergence_max"] for r in rows)<2e-11
              and max(abs(r["stretching"]) for r in rows)>1e-6
              and max(r["strain_eigenvalue_relation_excess"] for r in rows)<2e-11)
    return dict(source_sha256=SOURCE_SHA256,n=n,count=count,rows=rows,
                max_identity_residual=max_residual,passed=bool(passed),
                interpretation="3-D instantaneous original-PDE identities; no generic 3-D time evolution")


def upstream_reproduction():
    module = upstream_module()
    identities = module.check_nonlinear_identities()
    shears = module.check_invisible_shears()
    tracking,_ = module.check_exact_tracking()
    return dict(source_sha256=SOURCE_SHA256,identities=identities,
                hidden_shears=shears,exact_tracking=tracking)
