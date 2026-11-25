export const STORAGE_KEY='croncompose.preferences.v1';
export const SECTIONS=['extended','help-user','help-day','help-advanced','help-tz','help-env'];
export function defaultPreferences(){return {theme:'system',density:'comfortable',layout:'workspace',expandedSections:[]};}
export function normalisePreferences(value){
  const defaults=defaultPreferences();
  if (!value||typeof value!=='object') return defaults;
  return {theme:['system','light','dark'].includes(value.theme)?value.theme:defaults.theme,density:['comfortable','compact'].includes(value.density)?value.density:defaults.density,layout:'workspace',expandedSections:Array.isArray(value.expandedSections)?[...new Set(value.expandedSections.filter(s=>SECTIONS.includes(s)))]:[]};
}
export function readPreferences(storage){try{return normalisePreferences(JSON.parse(storage.getItem(STORAGE_KEY)||'null'));}catch{return defaultPreferences();}}
export function writePreferences(storage,value){try{storage.setItem(STORAGE_KEY,JSON.stringify(normalisePreferences(value)));return true;}catch{return false;}}
