# Threshold v18 deployment

Replace `index.html` and `sw.js` together.

## Settings persistence fix

Numeric settings now use one shared save routine:

- Starting absence
- Most sessions per day
- Warm-up steps
- Settle break length

Changes are saved as the value is edited and committed again on change, blur, Enter,
when the app is hidden, and when the page closes.

The app no longer redraws the entire interface during every numeric keystroke, which
could interrupt number-field edits on mobile and installed PWAs.

A small status message confirms when settings have been saved on the device.

The service-worker cache is `threshold-v18`.
