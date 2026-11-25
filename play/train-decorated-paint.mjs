import {attachDecorations} from './train-decoration-3d.mjs?v=marks-88';

// The train loader transfers the car groups out of root before live editing.
export function decoratePaint(model,design){
 const original=model.paint;
 let key='',clear=null;
 function update(d){
  const next=d?.decorations?.length?JSON.stringify(d.decorations):'';
  if(key===next)return;
  clear?.();clear=null;key=next;
  if(next)clear=attachDecorations(model,d);
 }
 update(design);
 model.paint={...original,apply(d){original?.apply(d);update(d);},
  dispose(){clear?.();clear=null;original?.dispose();}};
 return model;
}
