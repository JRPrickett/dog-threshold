/**
 * Chart rendering remains in app.js during phase one because it is tightly coupled
 * to existing DOM elements. This module is the boundary for the next extraction.
 */
export function chartWindowLabel(mode){
  return mode==="all"?"All sessions":"Recent sessions";
}
