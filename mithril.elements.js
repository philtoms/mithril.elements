/*
 * Mithril.Elements
 * Copyright (c) 2014 Phil Toms (@PhilToms3).
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

'use strict';
var m = (function app(window, mithril) {

  var STRING = '[object String]', FUNCTION = "[object Function]";
  var type = {}.toString;

  // save the mithril API
  mithril = mithril || require('mithril');
  var render = mithril.render;

  var controllers={}, unloads=[];

  function compose(cell,parent,node) {
    if (type.call(cell) == STRING) return cell;
    if (cell.view) cell = m(cell);

    var data = cell, attrs = cell.attrs;
    var id = (attrs.id || attrs.key)? '' + attrs.id + attrs.key : parent + cell.tag + node + Object.keys(cell.attrs).join();
    
    if (cell.module) {
      var instance = controllers[id] = controllers[id] || new (cell.module.controller || function(){})
      instance.inner = cell.children.length>1? cell.children:cell.children[0];
      instance.attrs = cell.attrs;
      if (instance.onunload) unloads.push(instance.onunload);
      data = compose(cell.module.view(instance),id,0);
    }
    else for (var i=0, l=cell.children.length; i<l;i++){

      data.children[i] = compose(cell.children[i], id, i);
    }
    return data;
  }

  mithril.render = function(root, cell, forceRecreation) {
    if (m.redraw.strategy() === 'all'){
      // key into mithril page lifecycle
      controllers={};
      for (var i=0,l=unloads.length;i<l;i++){
        unloads[i]();
      }
    }
    cell = compose(cell,0,0);
    render(root, cell, forceRecreation);
  }

  var m = function(module) { 
    var tag = module.view? '$elm' : module;
    var args = [tag].concat([].slice.call(arguments,1));
    var cell = mithril.apply(null,args);
    if (module.view) {
      cell.module = module;
    }
    return cell;
  };

  m.merge = function(obj1,obj2,filter) {
    var classAttrName = 'class' in obj1 ? 'class' : 'className';
    var classes = obj1[classAttrName]|| '';
    Object.keys(obj2).forEach(function(k){
      if (k.indexOf('class')>=0){
        classes += ' ' + obj2[k];
      } else if ((filter||' ').indexOf(k)<0) {
        obj1[k] = obj2[k];
      }
    }); 
    if (classes && classes.trim()) {
      obj1[classAttrName]=classes.trim();
    }
    return obj1;
  }

  // build the new API
  return m.merge(m,mithril);

})(typeof window != "undefined" ? window : {},m);

if (typeof module != "undefined" && module !== null && module.exports) module.exports = m;
else if (typeof define == "function" && define.amd) define(function() {return m});