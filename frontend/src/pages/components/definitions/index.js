import buttonDef from './button.json';
import linkDef from './link.json';

import attendDef from './attend.json';
import textDef from './text.json';
import mapDef from './map.json';
export const ComponentDefinitions = {
  [textDef.type]: textDef,
  [buttonDef.type]: buttonDef,
  [linkDef.type]: linkDef,
  [attendDef.type]: attendDef,
  map: mapDef,
};

export const ComponentList = Object.values(ComponentDefinitions); 