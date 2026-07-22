export const SETTING_LIMITS=Object.freeze({
  startDuration:{min:1,max:7200},
  dailyCap:{min:1,max:3},
  warmups:{min:0,max:6},
  restLength:{min:0,max:600}
});

export function bindNumberSetting({
  input,limits,getValue,setValue,canEdit,save,confirm,toast
}){
  let editing=false;
  const {min,max}=limits;

  function commit(showConfirmation){
    if(canEdit&&!canEdit()){
      input.value=getValue();
      if(showConfirmation&&toast){
        toast("Finish the current session before changing this setting.");
      }
      editing=false;
      return false;
    }

    const raw=String(input.value).trim();
    if(raw===""){
      input.value=getValue();
      editing=false;
      return false;
    }

    const value=Number(raw);
    if(!Number.isInteger(value)||value<min||value>max){
      input.value=getValue();
      if(showConfirmation&&toast){
        toast(`Enter a whole number from ${min} to ${max}.`);
      }
      editing=false;
      return false;
    }

    setValue(value);
    save();
    input.value=value;
    editing=false;
    if(showConfirmation&&confirm) confirm();
    return true;
  }

  input.addEventListener("focus",()=>{
    editing=true;
    setTimeout(()=>input.select(),0);
  });
  input.addEventListener("click",()=>{
    if(editing) input.select();
  });
  input.addEventListener("change",()=>commit(true));
  input.addEventListener("blur",()=>commit(false));
  input.addEventListener("keydown",event=>{
    if(event.key==="Enter"){
      event.preventDefault();
      if(commit(true)) input.blur();
    }
    if(event.key==="Escape"){
      event.preventDefault();
      input.value=getValue();
      editing=false;
      input.blur();
    }
  });

  return function flush(){
    if(document.activeElement===input) input.blur();
    else commit(false);
  };
}
