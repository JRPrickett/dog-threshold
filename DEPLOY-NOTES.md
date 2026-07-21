# Threshold v19 deployment

Replace `index.html` and `sw.js` together.

## Numeric settings editing fix

The previous autosave routine validated numeric fields on every keystroke. If a field
already contained `2`, typing `3` could briefly produce `23`, causing the field to be
rejected and reset to `2`.

Numeric settings now:

- Select the current value when tapped or focused
- Allow normal typing without validation interrupting the edit
- Save when the field loses focus, changes, or Enter is pressed
- Restore the previous value only if the completed entry is invalid
- Support Escape to cancel an edit
- Use a numeric mobile keyboard hint

This applies to starting absence, maximum sessions per day, warm-up steps, and settle
break length.

The service-worker cache is `threshold-v19`.
