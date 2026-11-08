"""Lossless JSON interning for the browser snapshot; canonical research stays unchanged."""
import json

def pack(value):
    nodes=[]
    seen={}
    def intern(node):
        key=json.dumps(node,ensure_ascii=False,separators=(',',':'))
        if key not in seen:
            seen[key]=len(nodes)
            nodes.append(node)
        return seen[key]
    def visit(item):
        if isinstance(item,str):return intern(['s',item])
        if isinstance(item,dict):return intern(['o',[ref for key,value in item.items() for ref in (visit(key),visit(value))]])
        if isinstance(item,list):return intern(['a',[visit(value) for value in item]])
        return intern(['p',item])
    root=visit(value)
    return {'format':'bayleaf-intern-v1','root':root,'nodes':nodes}

def unpack(payload):
    if payload.get('format')!='bayleaf-intern-v1':return payload
    nodes=payload['nodes']
    def expand(index,parent):
        if type(index) is not int or not 0<=index<parent:raise ValueError('Invalid or cyclic snapshot reference')
        kind,value=nodes[index]
        if kind in ('s','p'):return value
        if kind=='a':return [expand(child,index) for child in value]
        if kind=='o':
            if len(value)%2:raise ValueError('Invalid object')
            return {expand(value[i],index):expand(value[i+1],index) for i in range(0,len(value),2)}
        raise ValueError('Unknown snapshot node')
    return expand(payload['root'],len(nodes))
