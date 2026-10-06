# Independent checker notes

Tests are derived only from SPEC.md and the rendered live website. No website source or diff was inspected.

## Live verification, 2026-10-06

Chromium against `https://justinchewej.github.io/JustinCEJ-site/`: 11 passed, 1 skipped. TypeScript checks passed. The initial run had two fixture-related failures: repository URLs used an unrelated account while the observed API request was for JustinChewEJ. The rendered card constructed the link using that account and the fixture name. Fixtures now use the account requested by the browser; the exact expected repository link assertion is retained. No confirmed site failures were found.

## Issue #4 test-first baseline, 2026-10-06

Five new independent tests cover SPEC.md:17–21 before implementation begins. The unchanged live site fails all five because it has no button with accessible name `Back to top`; its existing footer link does not satisfy the new button requirement. This is an expected red baseline, not an ambiguous failure. Existing tests were not modified and none of the new requirements were skipped.

The wording is explicit: past hero means the hero's **bottom edge** is at or above the viewport's top, not that its top edge has passed. The boundary test checks initial hidden state, a partially visible hero with 20px remaining, and the bottom-edge boundary. Other tests cover click-to-top/hide, keyboard Enter activation/focus, and a 375px viewport.

The new no-arrow assertion detects common Unicode arrow glyphs in text and pseudo-element content. The earlier definition ambiguity still applies to image, SVG and CSS-drawn shapes, which require visual review. Visible focus uses the same outline-or-shadow check as Issue #1; no numerical contrast threshold is specified.

## Issue #4 independent local verification, 2026-10-06

After the builder supplied the rendered site at `http://127.0.0.1:8000`, the unchanged full suite initially returned 15 passed, 1 failed and the existing arrow-definition skip. The failed SPEC.md:18 test never reached its visibility assertion: Chromium rounded the requested fractional scroll position, leaving the hero bottom at `0.046875px` rather than at or above zero.

The checker corrected only the boundary scroll setup to `Math.ceil(window.scrollY + hero.getBoundingClientRect().bottom)`, so the requested position reaches the first whole pixel at or past the hero bottom. The strict `bottom <= 0` precondition and visible-button assertion remain unchanged. This fixes test geometry rather than changing the acceptance requirement.

The full local Chromium suite then returned **16 passed, 1 existing skip**, including all five new Issue #4 tests. TypeScript checks passed. This follows the five expected live failures recorded before implementation in test-first commit `5d21595`. No site source or diff was read and no site files were edited.

## Keyboard test timing correction, 2026-10-06

Root reported that CI run `37432677224` also failed SPEC.md:20 after 60 Tab attempts, with the button alternating hidden/visible. Rendered-browser investigation showed that Tabs from the page start focus navigation links and scroll back into the hero, hiding the button; subsequent content focus scrolls past the hero and reveals it. Live repository loading changes the number of intervening links. The original local browser reached the button on Tab 21, so the report does not by itself establish a keyboard accessibility defect.

SPEC.md:20 now uses a deterministic empty GitHub response and waits for its rendered message, and requests the browser's supported reduced-motion preference before navigation. It still reaches the button through actual Tab presses and asserts accessible name, visibility, keyboard focus styling, Enter activation, page-top return and hidden state. It does not programmatically focus the button or change site behavior. A separate rendered-browser probe with these settings reached the visible button on Tab 20 in ten consecutive runs.

The committed Playwright keyboard test passed all three repeats, and the full local suite passed **16 tests with 1 existing skip**. No product files were edited.

- SPEC.md:6 does not specify the repository API endpoint, card markup, exact fallback copy, ordering, or null-field behavior. Network mocking targets the public GitHub REST repository endpoint observed in browser requests. Empty/error checks use semantic wording, not exact copy. Null fields, pagination and ordering are outside the specified assertions.
- SPEC.md:7 does not specify link destinations beyond their services; tests check mailto, GitHub and LinkedIn destinations.
- SPEC.md:9 does not define arrow icons (text glyphs, SVGs, font icons, images, or CSS shapes). The arrow check is explicitly skipped pending a definition and visual review. Gradient checks inspect computed background images, including pseudo-elements; image contents require visual review.
- SPEC.md:12 says readable colours without a contrast threshold or scope. Automated checks verify changing computed body colours and unequal foreground/background; this does not certify readability. A contrast standard and target elements are needed for that assertion.
- SPEC.md:13 defines a fresh session but not new-tab behavior. A new isolated browser context represents a fresh session; same-tab reload is checked separately.
- SPEC.md:14 specifies visible focus without a size/contrast threshold. The keyboard test verifies an outline or shadow and exercises Enter and Space. Visual focus visibility remains subject to review.
