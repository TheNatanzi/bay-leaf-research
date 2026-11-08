/* Lossless startup snapshot. Every decoded object is independent, including repeated rooms. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BayLeafDataCodec=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 function decode(payload){
  if(payload?.format!=='bayleaf-intern-v1')return payload;
  const nodes=payload.nodes;
  if(!Array.isArray(nodes))throw Error('Invalid research snapshot');
  function expand(id,parent=nodes.length){
   if(!Number.isInteger(id)||id<0||id>=parent||id>=nodes.length)throw Error('Invalid or cyclic snapshot reference');
   const node=nodes[id];if(!Array.isArray(node)||node.length!==2)throw Error('Invalid snapshot node');
   const [kind,value]=node;
   if(kind==='s'){if(typeof value!=='string')throw Error('Invalid snapshot string');return value;}
   if(kind==='p'){if(value!==null&&!['number','boolean'].includes(typeof value))throw Error('Invalid snapshot primitive');return value;}
   if(!Array.isArray(value))throw Error('Invalid snapshot collection');
   if(kind==='a')return value.map(child=>expand(child,id));
   if(kind==='o'){
    if(value.length%2)throw Error('Invalid snapshot object');
    const out={};
    for(let i=0;i<value.length;i+=2){const key=expand(value[i],id);if(typeof key!=='string')throw Error('Invalid snapshot key');Object.defineProperty(out,key,{value:expand(value[i+1],id),enumerable:true,writable:true,configurable:true});}
    return out;
   }
   throw Error('Unknown snapshot node');
  }
  return expand(payload.root);
 }
 return {decode};
});
