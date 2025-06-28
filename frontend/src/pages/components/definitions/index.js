import buttonDef from './button.json';
import linkDef from './link.json';
import textDef from './text.json';
import mapDef from './map.json';

export const ComponentDefinitions = {
  button: buttonDef,
  link: linkDef,
  text: textDef,
  map: mapDef,
};

export const ComponentList = Object.values(ComponentDefinitions); 