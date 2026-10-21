# JustinCEJ-site specification

## Conventions
- Every menu item is its own page with one of these ids: #hero (Overview), #about, #experience, #skills, #projects, #repos, #contact. The URL hash chooses the page (for example `/#projects`); with no hash, #hero shows. Only the chosen page is visible, and browser back and forward move between pages.
- No horizontal scroll at a viewport width of 375px.
- The #repos page lists public GitHub repositories as cards with name, description, primary language, star count and link, or shows a plain message when there are none or the request fails.
- The #hero page and the #contact page each contain email, GitHub and LinkedIn links.
- All GitHub and LinkedIn links open in a new tab.
- The design uses no gradients or arrow icons. The one exception is the back-to-top button's up chevron (Issue #4), added at Justin's request on 2026-10-20.

## Issue #1: dark-mode toggle
- A button in the navigation toggles a dark class on body and switches between readable light and dark colours.
- The selected mode survives reloads in the same tab for that tab's session. A fresh session starts in light mode.
- The button works with the keyboard, has visible focus, and exposes its current state with aria-pressed.

## Issue #4: back-to-top button
- A back-to-top button is available while scrolling a page that is taller than the window. The footer no longer has a separate Back to top link.
- The button is hidden on pages that are not taller than the window. On longer pages it is hidden until the page has scrolled 200px or more, and visible from then on.
- Clicking the button returns the current page to the top, keeps the same page open, and hides the button.
- The button has the accessible name Back to top, supports keyboard activation, and has visible keyboard focus.
- The button is a small round icon button showing an up chevron. It is responsive, uses no gradients, and causes no horizontal overflow at a viewport width of 375px.
