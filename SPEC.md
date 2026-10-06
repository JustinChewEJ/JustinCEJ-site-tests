# JustinCEJ-site specification

## Conventions
- All six sections exist with ids: #hero #about #skills #projects #repos #contact.
- No horizontal scroll at a viewport width of 375px.
- #repos lists public GitHub repositories as cards with name, description, primary language, star count and link, or shows a plain message when there are none or the request fails.
- #hero and #contact each contain email, GitHub and LinkedIn links.
- All GitHub and LinkedIn links open in a new tab.
- The design uses no gradients or arrow icons.

## Issue #1: dark-mode toggle
- A button in the navigation toggles a dark class on body and switches between readable light and dark colours.
- The selected mode survives reloads in the same tab for that tab's session. A fresh session starts in light mode.
- The button works with the keyboard, has visible focus, and exposes its current state with aria-pressed.

## Issue #4: back-to-top button
- Add a back-to-top button available while scrolling; the existing footer link may remain.
- The button is hidden while any part of #hero remains in the viewport, and visible when #hero's bottom edge is at or above the viewport's top edge. Past hero means its bottom edge, not its top edge.
- Clicking the button returns the page to the top and hides the button.
- The button has the accessible name Back to top, supports keyboard activation, and has visible keyboard focus.
- The button is responsive, uses no gradients or arrow icons, and causes no horizontal overflow at a viewport width of 375px.
