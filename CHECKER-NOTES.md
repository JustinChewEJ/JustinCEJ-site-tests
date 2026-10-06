# Independent checker notes

Tests are derived only from SPEC.md and the rendered live website. No website source or diff was inspected.

## Live verification, 2026-10-06

Chromium against `https://justinchewej.github.io/JustinCEJ-site/`: 11 passed, 1 skipped. TypeScript checks passed. The initial run had two fixture-related failures: repository URLs used an unrelated account while the observed API request was for JustinChewEJ. The rendered card constructed the link using that account and the fixture name. Fixtures now use the account requested by the browser; the exact expected repository link assertion is retained. No confirmed site failures were found.

- SPEC.md:6 does not specify the repository API endpoint, card markup, exact fallback copy, ordering, or null-field behavior. Network mocking targets the public GitHub REST repository endpoint observed in browser requests. Empty/error checks use semantic wording, not exact copy. Null fields, pagination and ordering are outside the specified assertions.
- SPEC.md:7 does not specify link destinations beyond their services; tests check mailto, GitHub and LinkedIn destinations.
- SPEC.md:9 does not define arrow icons (text glyphs, SVGs, font icons, images, or CSS shapes). The arrow check is explicitly skipped pending a definition and visual review. Gradient checks inspect computed background images, including pseudo-elements; image contents require visual review.
- SPEC.md:12 says readable colours without a contrast threshold or scope. Automated checks verify changing computed body colours and unequal foreground/background; this does not certify readability. A contrast standard and target elements are needed for that assertion.
- SPEC.md:13 defines a fresh session but not new-tab behavior. A new isolated browser context represents a fresh session; same-tab reload is checked separately.
- SPEC.md:14 specifies visible focus without a size/contrast threshold. The keyboard test verifies an outline or shadow and exercises Enter and Space. Visual focus visibility remains subject to review.
