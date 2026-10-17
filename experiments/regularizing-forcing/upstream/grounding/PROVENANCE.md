# Preserved supplied grounding files

These four files were supplied in the user's local Codex outputs and are
preserved byte-for-byte. The Markdown note also exists in their Downloads.
The scientific files were inspected before execution. No unrelated local
documents or recordings were imported.

| File | SHA-256 |
|---|---|
| `verify_grounding_ns.py` | `03989d8f06eb521c5826f91b0dd1ea59e0cac3c7a057e80f0a327f7c115192c6` |
| `grounding_ns_requirements.txt` | `02f0ba4fac88d6f9368ba0d29e841913866e97ea03e399bca5a89b1484aa388f` |
| `grounding_ns_results.json` | `94cdab4a1b2e6748b9f4e558eb05385fcfdd245281627c4ae4f792efc82f52b6` |
| `grounding_navier_stokes.md` | `c8a61f2cfbc98cddcca971ad0be5eec73f150e3db412bbda9e2d15ba1f189303` |

The saved report used Python 3.12.14 and NumPy 2.3.5. It was reproduced here
with Python 3.13.5, NumPy 2.5.4 and Matplotlib 3.11.2. The original identity
residuals, exact-shear norms and RK4 error reproduced to the displayed digits.
`results/observer-reference/summary.json` records the fresh checks.

The original script's main function writes beside its own source. It was
therefore rerun from an isolated copy under ignored `runs/`, preserving the
supplied results. The integrated experiment calls its verification functions
without modifying these original files.
