# Upstream helpers for frontend-slides-frontend-slides

The files listed below were recovered from [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) at commit `9906a34d640d2111f724544cbc50f7f130569ae1`. The repository ID is `1143767804`.

They retain the upstream **MIT** license reproduced in [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt). This notice applies to the listed support files; it does not replace the license metadata of other catalog files. Preserve the upstream license and this attribution when redistributing them.

License wording is unchanged; text-only trailing whitespace and EOF blank lines are normalized. Original license: https://github.com/zarazhangrui/frontend-slides/blob/9906a34d640d2111f724544cbc50f7f130569ae1/LICENSE

| Local file | Original upstream path | Original Git blob SHA | Import changes |
| --- | --- | --- | --- |
| `scripts/extract-pptx.py` | `scripts/extract-pptx.py` | `498e2a5e4c9d3f11bec09a3ca54cd6731491a0e3` | content unchanged |
| `scripts/export-pdf.sh` | `scripts/export-pdf.sh` | `8493d84faea2752cc065f313ac917641e7902b98` | stored without executable bit; invoke via its interpreter; AAS security adaptation: loopback-only confined static server; requires preinstalled Playwright and Chromium and performs no automatic dependency or browser downloads |

PDF export uses the AAS-authored `scripts/lib/confined-server.mjs`, licensed under the repository MIT license. It binds only to `127.0.0.1`, checks the Host header, permits only GET/HEAD, and maps requests to files indexed and checked inside the selected deck before the server starts. Traversal and symlinks outside the deck are rejected. The index is bounded to 10,000 files and skips `.git`, `.next`, `.cache`, and `node_modules`. The exporter requires Playwright and Chromium to already exist in the deck project; it does not install packages or download browser binaries. If dependencies are missing it prints the explicit install commands and exits. The regression test is repository-owned at `tools/scripts/tests/upstream_helper_server.test.js`. The upstream deployment helper is excluded for unsafe asset-path handling and temporary-directory cleanup.
