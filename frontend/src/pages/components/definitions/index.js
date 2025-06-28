import textDef from './text.json';
import buttonDef from './button.json';
import linkDef from './link.json';

export const ComponentDefinitions = {
  [textDef.type]: textDef,
  [buttonDef.type]: buttonDef,
  [linkDef.type]: linkDef,
};

export const ComponentList = Object.values(ComponentDefinitions); 