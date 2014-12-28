'use strict';
(function(){

  var OBJECT = '[object Object]', ARRAY = '[object Array]', STRING = '[object String]', FUNCTION = "[object Function]";
  var type = {}.toString;

  // save the mithril API
  var mithril = m;
  var redraw = mithril.redraw;
  var strategy = redraw.strategy;

  function merge(obj1,obj2){
    var classAttrName = 'class' in obj1 ? 'class' : 'className';
    var classes = obj1[classAttrName]|| '';
    Object.keys(obj2).forEach(function(k){
      if (k.indexOf('class')>=0){
        classes += ' ' + obj2[k];
      } else {
        obj1[k] = obj2[k];
      }
    }); 
    if (classes && classes.trim()) {
      obj1[classAttrName]=classes.trim();
    }
    return obj1;
  }

  m.redraw = function(force) { 
    // key into mithril page lifecycle
    if (strategy()==='all'){ 
      controllers={}; 
    } 
    lastId=0;
    return redraw(force); 
  }; 

  m.redraw.strategy = strategy;

  var components = {}, controllers={},lastId=0;
  m = function(module, attrs, children, state) { 
    var tag = module.tag || module;
    var args = [tag].concat([].slice.call(arguments,1));
    var cell = mithril.apply(null,args);
    var hasAttrs = attrs != null && type.call(attrs) === OBJECT && !("tag" in attrs) && !("subtree" in attrs);
    if (!hasAttrs && !children){
      children=attrs;
    }
    attrs = merge(module.attrs || {},cell.attrs);
    var component = components[cell.tag];
    if (component && tag[0]!=='$'){
      // once only element initialization
      var id = cell.tag + ((state && state.id ) || attrs.key || attrs.id || ++lastId);
      var ctrl = controllers[id] || new component.controller(state);
      controllers[id]=ctrl;
      var inner = cell.children[0];
      inner = inner && (type.call(inner) === FUNCTION || inner.template)? inner:undefined;
      var c_cell = component.view(ctrl, inner);
      if (c_cell){
        cell=c_cell;
        merge(cell.attrs,attrs);
        if (!inner){
          cell.children = cell.children.concat(children);
        }
      }
    }
    if (cell.tag[0]==='$'){
      cell.tag=cell.tag.substr(1);
    }
    return cell;
  };

  m.element = function(root, module){
    if (type.call(root) !== STRING) throw new Error('selector m.element(selector, module) should be a string');
    // nothing much to do here, element initialization is lazily
    // deferred to first redraw
    return (components[root] = module);
  };

  m.template = function(){
    // just flag templates and pass them through the mill. 
    var cell = mithril.apply(null,arguments);
    cell.template=true;
    return cell;
  };

  // build the new API
  merge(m,mithril);

})(); 
