export function fmt(seconds){
  const rounded=Math.round(seconds);
  if(rounded<60) return `${rounded}s`;

  const minutes=Math.floor(rounded/60);
  const remainder=rounded%60;
  if(minutes<60) return `${minutes}:${String(remainder).padStart(2,"0")}`;

  return `${Math.floor(minutes/60)}h ${minutes%60}m`;
}
