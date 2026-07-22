export function el(id){
  return document.getElementById(id);
}

export function esc(value){
  return String(value).replace(/[<>&]/g,character=>({
    "<":"&lt;",
    ">":"&gt;",
    "&":"&amp;"
  })[character]);
}

export function escAttr(value){
  return esc(value).replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
