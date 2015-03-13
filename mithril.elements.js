/*
 * Mithril.Elements
 * Copyright (c) 2014 Phil Toms (@PhilToms3).
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

'use strict';
var m = (function app(window, mithril) {

  var OBJECT = '[object Object]', STRING = '[object String]', ARRAY = "[object Array]";
  var type = {}.toString;
  var graph={}, unloads=[], elements={};

  // save the mithril API 
  mithril = mithril || require('mithril');
  var render = mithril.render;

  function merge(obj1,obj2,filter) {
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
    var module = elements[cell.tag], attrs = cell.attrs, children = cell.children, data = {tag:cell.tag,attrs:attrs,children:[]};

    // calculate position for new node and check if it already exists.
    // Note that model entity id takes precidence over node position - 
    //  handles model state change at a specific node position, eg:
    //    data list changes
    var id = cell.tag + ((attrs.state && attrs.state.id)? attrs.state.id : d + '' + p);
    var node = graph[id];

    // composition: [module -> ctrl] -> children -> [view] -> cell
    if (module && !node) {
      node = new (module.controller || function(s,c){this.state=s; this.ctx=c;})(attrs.state || {},ctx);
      if (node.onunload) unloads.push(node.onunload);
      graph[id] =  node; 
    }
    for (var i=0, l=children.length; i<l; i++) {
      data.children[i] = compose(children[i], id, i, node);
    }
    if (module) {
      node.inner = children.length>1? children:children[0];
      node.attrs = cell.attrs;
      data = compose(module.view(node),d,p,ctx);
      if (data.attrs) merge(data.attrs,attrs,'state');
    }

    // tidy up tag
    if (data.tag && data.tag[0]==='$'){
      data.tag=data.tag.substr(1);
    }
    return data;
  }

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

  mithril.element = function(tag, module){
    if (type.call(tag) !== STRING) throw new Error('tag m.element(tag, module) should be a string');
    if (elements[tag]) throw new Error('tag "' + tag + '" already registered as element');
    // nothing more to do here, element initialization is lazily
    // deferred to first redraw
    return (elements[tag] = module);
  };

  return mithril;

})(typeof window != "undefined" ? window : {},m);

if (typeof module != "undefined" && module !== null && module.exports) module.exports = m;
else if (typeof define == "function" && define.amd) define(function() {return m});