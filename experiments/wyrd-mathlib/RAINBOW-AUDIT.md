# Independent-checker compatibility and prior-art search limits

Nothing was installed or run. Facts come from the installed toolchain's files, the project tree, and the projects' public pages (22 Oct 2026).

## 1. Independent-checker compatibility

**Setting.** `/home/user/sgrounds/experiments/wyrd-mathlib/lean-toolchain` pins `leanprover/lean4:v4.35.0`; Mathlib is pinned at the same tag (`56a0058`). The installed toolchain `/root/.elan/toolchains/leanprover--lean4---v4.35.0/bin/` already contains `leanchecker`, `leanchecker-paranoid`, `leanexport`, `lean4lean`, `nanoda_bin`, `con-leche`, `con-ron`. So the version-matching question largely dissolves: Lean 4.35.0 (released 2026-10-12) bundles the checkers with the compiler.

**lean4checker.** The repo `leanprover/lean4checker` is archived (25 Mar 2026): "merged into the Lean 4 repository itself, and is now distributed as `leanchecker` with every Lean toolchain (starting from v4.28.0)" (PR #11887). Its tags stop at `v4.29.0-rc8`; there is no `v4.35.0` tag, and none is needed. It replays a module's declarations from `.olean` files through the *same* C++ kernel: "This is not an external verifier, as it uses the Lean kernel itself", but it catches "environment hacking" (metaprogramming that adds declarations the kernel never saw) and `sorryAx`. It trusts the `.olean` format structurally. Mathlib's own daily CI runs `lake env leanchecker --fresh Mathlib` on `ubuntu-latest` and comments that `--fresh` is "currently faster for projects with many modules" (`.lake/packages/mathlib/.github/workflows/daily.yml` lines 68-73; regular CI dropped it as "quite expensive for little benefit"). 4.35.0 adds `leanchecker --from-export file.ndjson` (PR #15050).

**lean4lean** (`digama0/lean4lean`). A port of the C++ kernel to Lean; the README says it "likely shares some implementation bugs with it (it's not really an independent implementation)". TYPES 2025 paper: 20-50 % slower than the C++ kernel, verifies Mathlib. Repo `lean-toolchain` is `v4.33.0-rc2`, sole tag `arena-ecb3b66`; the standalone CLI is `lake env .../lean4lean [--fresh] [--compare] [MOD]`. The bundled binary is what matters here; Lake invokes it as `lean4lean --import <export>`.

**Export route: lean4export + nanoda (and con-leche, con-ron).** `leanprover/lean4export` has a `v4.35.0` tag (12 Oct 2026) and writes NDJSON, format 3.1.0 (`format_ndjson.md`). Lake refuses any exporter but the bundled `leanexport`: "the export format has to match the compiler that produced the oleans". `ammkrn/nanoda_lib` is a Rust checker driven by a JSON config with `permitted_axioms`; on the Lean Kernel Arena (build `e0d76f5`, lean4export 3.1.0, Lean 4.34.1/4.29.1) it rejects 72/72 bad tests, accepts 135/137 good ones, and accepts the `mathlib` test (5.8 GB export) in 6.5 min wall on 4 threads with 6.0 GB RSS, against 32.3 min virtual CPU for the official kernel. `con-leche` (Lean, PR #15130) and `con-ron` (Rust, PR #15153) are new in 4.35.0; secondary reports call con-leche a kernel with a consistency proof and con-ron its Aeneas-verified translation. I found no primary source for those two claims.

**What `lake check` does** (toolchain source `src/lean/lake/Lake/CLI/Check.lean`). `lake check [--from-export <FILE>] [--paranoid] [--inadvisably-no-sandbox]` builds the default targets, exports them with `leanexport`, replays with `leanchecker --silent --from-export`, and fails on any axiom beyond `propext`, `Classical.choice`, `Quot.sound` (`standardAxioms`, line 663). `--paranoid` runs, in sequence and before Lean's own kernel, `leanchecker-paranoid`, `lean4lean --import`, `nanoda_bin` (handed the permitted axioms), `con-leche`, `con-ron`; one rejection fails the run. Requirements: Linux, `bwrap` on PATH or `COMPARATOR_BWRAP` (needs unprivileged user namespaces or setuid bwrap), `git` and `env` on PATH, and a `lake-manifest.json` (present). `mkContext` resolves the sandbox before it looks at `--from-export`, so bwrap is needed on that path too; `--inadvisably-no-sandbox` prints "this run is not trustworthy".

**decide vs native.** `grep` finds no `native_decide`, `decide +native`, `@[extern]`, `implemented_by`, `ofReduceBool` or `_native` in `WyrdMathlib/` (the only hit is the word "decided" in a `Deriv.lean` comment); `../wyrd` has 193 `decide +kernel` and no `native_decide`. `decide +kernel` yields an ordinary `rfl` proof that every checker re-reduces (relying on Nat-literal extensions, which the arena's Mathlib test exercises). In 4.35.0, `Lean.ofReduceBool` and `Lean.trustCompiler` are removed (PR #14953); native evaluation now adds a per-use axiom whose name contains `_native`, which `#print axioms` shows and `lake check` rejects. `Audit.lean`'s comment "never `Lean.ofReduceBool`" is therefore stale in wording; the live rule is "no axiom beyond the three".

**Cost.** The default target `WyrdMathlib` reaches all 8,625 Mathlib modules (1.8 GB of oleans) through `WyrdMathlib.Key -> WyrdMathlib.SharedAir.Locking`, which has `import Mathlib`. So `lake check` here is a whole-Mathlib check: expect the arena's figures (tens of minutes per checker, ~6 GB RAM for nanoda). The rainbow plus `Viewing.lean` alone closes over 2,493 non-core modules (1,995 Mathlib, ~512 MiB of oleans), a quarter of that.

**Conclusion: compatible in principle; blocked on this machine** because `bwrap` is absent (`which bwrap` empty). Commands, from `/home/user/sgrounds/experiments/wyrd-mathlib`:

```
lake build WyrdMathlib.Rainbow.Viewing
lake env leanchecker --fresh WyrdMathlib.Rainbow.Viewing   # same kernel, rainbow closure only, no bwrap needed
lake check --paranoid                                      # six checkers, whole default target; needs bwrap
```

None of these checks that the *statements* say what the prose says; that remains a human reading.

## 2. Prior-art search limits

Sources: `RAINBOW.md` "Note on prior work" and the search log of the 22 Oct 2026 prior-art pass (kept outside the repository).

**What was done.** Local grep over clones of mathlib4 (master `d888143` and pinned), physlib `96a6bc5`, Lean4PHYS `cae9019`, formal-science `89b1e0e`, AFP mirror (10,542 `.thy`), Isabelle, HOL Light, HOL4, set.mm, pvslib, ACL2, math-comp/analysis, UniMath, agda-stdlib, agda-unimath, Mizar MML 5.94.1493; terms: rainbow, snell, refraction/refractive/refract(ed), caustic, optics/optical, paraxial, prism, minimum deviation, geometrical optics, waveguide. Zulip web-public search, 12 terms. Ten Sourcegraph queries. Ten GitHub repository-name searches. Ten physlib PR pages.

**Limits, honestly.**
- GitHub code search and the REST search API were unavailable (no valid auth through the proxy); only repository-name searches ran.
- Zulip search covers web-public streams only; `refraction.json` holds exactly 500 messages, which looks like a page cap, and pagination is not confirmed.
- Four Sourcegraph result streams ended with `done: False` (`lean_rainbow`: 97 matches, 10 inspected; `lean_refract`, `lean_snell`, `isa_optics`).
- The Rocq clone is `rocq-prover/opam` (4,241 package files): metadata, not sources. Coquelicot did not clone.
- Blocked pages: hvg.ece.concordia.ca (503), Siddique's thesis PDF, web.archive.org, dblp, Springer chapters; some papers were read only as abstracts.
- The FormalPhysics miss. `data/FormalPhysics.json` (200 items) has items 85 (Fermat's principle at a flat interface gives `sin θ1/v1 = sin θ2/v2`), 182 (Snell `n1 sin θ1 = n2 sin θ2` from wave speeds), 185 (two-media travel-time derivative). File-level grep did hit the JSON for "snell", but the term list had no "fermat", item 185 contains neither "snell" nor "refract", the items are tagged `field: "Other"`, and a hit inside one 200-item blob was not triaged per item. They were found only by reading the dataset.

**What else a keyword search can miss.** Refraction written as Fermat, eikonal, Descartes ("loi de Descartes"), Huygens, Snellius, lens-maker, ray-transfer/ABCD matrices; non-English identifiers and comments (réfraction, Brechung, 折射, 屈折); course and exercise repositories; Lean 3 `mathlib` and its `archive/`; mathport output; theses (Concordia HVG); proofs stated as a bare `arcsin (sin i / n)` with no optical word at all.

**Three cheapest further checks** (not run now):
1. Re-grep the clones already on disk under `priors/src/` with the second vocabulary (`fermat|eikonal|huygens|descartes|snellius|abcd|ray.?transfer|lens|réfraction|brechung`), and triage per item for JSON datasets.
2. Grep the opam clone's `synopsis`/`description` fields for optics terms, then clone only the handful of Rocq packages that hit; add `leanprover-community/mathlib` (Lean 3) `archive/` and `Counterexamples/`.
3. Query the indexed full-text services the clones bypass: Isabelle FindFacts, MML Query for Mizar, and the Semantic Scholar API for "formal verification" + "geometrical optics"/"Snell", plus the HVG publications list when the host is reachable.