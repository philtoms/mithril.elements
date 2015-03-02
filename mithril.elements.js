/*
 * Mithril.Elements
 * Copyright (c) 2014 Phil Toms (@PhilToms3).
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

'use strict';
var m = (function app(window, mithril) {

  var STRING = '[object String]', ARRAY = "[object Array]";
  var type = {}.toString;

  // save the mithril API
  mithril = mithril || require('mithril');
  var render = mithril.render;

  /*
   * compose a digraph of the current v-dom
   * @param {cell} new graph input
   * @param {d} node depth
   * @param {p} node position at d
   * @param {ctx} context at d:p
   */
  function compose(cell,d,p,ctx) {
    if (!cell) return '';
    if (type.call(cell) === ARRAY) {
      return cell.map(function(c,i){
        return compose(c,d+''+p,i,ctx);
      });
    }
    if (!cell.tag) return cell;
    var data = cell, attrs = cell.attrs, children = cell.children;

    // calculate position for new node and check if it already exists.
    // Note that model entity id takes precidence over node position - 
    //  handles model state change at a specific node position, eg:
    //    data list changes
    var id = (attrs.id || attrs.key)? 'id' + (attrs.id || '') + (attrs.key || '') : d + cell.tag + p + (Object.keys(attrs).join()||'');
    var node = graph[id];

    // composition: [module -> ctrl] -> children -> [view] -> cell
    if (cell.module) {
      node = node || new (cell.module.controller || function(){})(ctx);
    }
    for (var i=0, l=children.length; i<l; i++) {
      data.children[i] = compose(children[i], id, i, node);
    }
    if (cell.module) {
      node.inner = children.length>1? children:children[0];
      node.attrs = cell.attrs;
      if (node.onunload) unloads.push(node.onunload);
      data = compose(cell.module.view(node),d,p,ctx);
      if (data.attrs) m.merge(data.attrs,attrs)
    }

    if (node) graph[id] =  node; 
    return data;
  }

  var graph={}, unloads=[];
  mithril.render = function(root, cell, forceRecreation) {
    // key into mithril page lifecycle
    if (m.redraw.strategy() === 'all'){
      for (var i=0,l=unloads.length;i<l;i++){
        unloads[i]();
      }
      graph={};
      unloads.length=0;
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