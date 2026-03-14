Audit this project for dependency vulnerabilities and fix them safely.

Steps:
1. Run `npm audit` and report all vulnerabilities grouped by severity (critical, high, moderate, low)
2. Run `npm audit fix` to apply non-breaking updates
3. Run `npm run test` to verify nothing broke
4. If tests pass, summarize what was fixed and what (if anything) remains unfixed and why (e.g. requires breaking change)
5. If tests fail, revert the audit fix with `git checkout package.json package-lock.json` and report which packages caused failures

Rules:
* Never run `npm audit fix --force` — it may introduce breaking changes
* Do not upgrade packages beyond what `npm audit fix` selects automatically
* If vulnerabilities remain after the safe fix, list them with their CVE IDs and recommended manual actions
