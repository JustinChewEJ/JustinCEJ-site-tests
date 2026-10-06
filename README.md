# JustinCEJ-site-tests

Independent browser tests for Justin Chew’s portfolio. Requirements are recorded in SPEC.md.

Run in Windows PowerShell with Node.js installed:

```powershell
npm ci
npx playwright install chromium
$env:BASE_URL = 'https://justinchewej.github.io/JustinCEJ-site/'
npm test
npx playwright show-report
```

`BASE_URL` is mandatory; configuration fails early when it is missing. Only Chromium runs. Tests inspect rendered browser behavior and mock GitHub responses for deterministic success, empty and failure cases. Each test cites its exact SPEC.md line. See CHECKER-NOTES.md for ambiguities and the explicitly skipped arrow-icon check. HTML reports and failure traces are generated locally and ignored by Git.
