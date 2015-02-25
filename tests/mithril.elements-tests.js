function testMithrilElements(mock) {
	m.deps(mock)
	
	var testdata, root;

	window.test_setup = function(){
		root = mock.document.createElement("div")
		testdata={ctrlCalls:0,viewCalls:0}
		m.redraw.strategy('all');
		mock.requestAnimationFrame.$resolve()
	}

	var custom = {
		controller:function(){
			testdata.ctrlCalls++;
		},
		view: function(ctrl){
			testdata.viewCalls++;
			return m('div',ctrl.attrs||{},ctrl.inner||'test');
		}
	}

	var customWithArgs = function(args){
		return {
			view: function(ctrl) {
				testdata.state = args;
				return 'test'+ (args || '');
			}
		};
	}


	// basic element syntax
	test(function() {return m(custom)}) //as long as it doesn't throw errors, it's fine
	test(function() {return m(custom,{className:'x'}).attrs.className==' x'})
	test(function() {return m(custom,{className:'x'},custom).children[0]==custom})
	test(function() {
		m(customWithArgs(123)).module.view()
		return testdata.state == 123
	})

	// composition
	test(function() {
		m.module(root,custom)
		return root.childNodes[0].childNodes[0].nodeValue === "test"
	})

	// rendering
	test(function() {
		m.render(root,custom)
		return root.childNodes[0].childNodes[0].nodeValue === "test"
	})
	test(function() {
		m.render(root,m(custom))
		return root.childNodes[0].childNodes[0].nodeValue === "test"
	})

	test(function() {
		m.render(root,m(customWithArgs(123)))
		return root.childNodes[0].nodeValue === "test123"
	})

	// identity
	test(function() {
		m.render(root,m(custom))
		m.redraw.strategy('diff');
		m.render(root,m(custom))
		return testdata.ctrlCalls==1 && testdata.viewCalls==2
	})

	test(function() {
		m.redraw.strategy('all');
		m.render(root,m('div',[custom]))
		m.redraw.strategy('diff');
		m.render(root,m('div',[custom]))
		return testdata.ctrlCalls==1 && testdata.viewCalls==2
	})

	test(function() {
		m.redraw.strategy('all');
		m.render(root,m('div',[custom]))
		m.redraw.strategy('diff');
		m.render(root,custom)
		return testdata.ctrlCalls == testdata.viewCalls
	})

	// entity id
	test(function() {
		m.render(root,m(custom, {id:'x'}))
		m.redraw.strategy('diff');
		m.render(root,m(custom, {id:'x'}))
		return testdata.ctrlCalls==1 && testdata.viewCalls==2
	})

	test(function() {
		m.redraw.strategy('all');
		m.render(root,m('div',[m(custom, {id:'x'})]))
		m.redraw.strategy('diff');
		m.render(root,m('div',[m(custom, {id:'x'})]))
		return testdata.ctrlCalls==1 && testdata.viewCalls==2
	})

	test(function() {
		m.redraw.strategy('all');
		m.render(root,m('div',[m(custom, {id:'x'})]))
		m.redraw.strategy('diff');
		m.render(root,m(custom, {id:'x'}))
		return testdata.ctrlCalls==1 && testdata.viewCalls==2
	})

	return;
	// m.element - default ctrl
	test(function() {
		m.element("custom1", {
			view: function(ctrl){
				ctrl.state.spy++;
			}
		})
		var data = {spy:0};
		m("custom1", {state:data})
		return data.spy===1;
	}) 

	//lifetime - cached controller
	test(function() {
		reset();
		m("custom#1",{state:data})
		m("custom#1",{state:data})
		return data.spy==3;
	})	

	//lifetime - unique controller
	test(function() {
		reset();
		m("custom#1",{state:data})
		m("custom#2",{state:data})
		return data.spy==4;
	})	

	//lifetime - unique controller (lastId)
	test(function() {
		reset();
		m("custom",{state:data})
		m("custom",{state:data})
		return data.spy==4;
	})	

	//lastId reset
	test(function() {
		reset();
		m("custom",{state:data})
		reset();
		m("custom",{state:data})
		return data.spy==2;
	})	

	//m - selector
	test(function() {return m("custom").tag === "div"})	
	test(function() {return m("custom.foo").tag === "div"})
	test(function() {return m("custom.foo").attrs.className === "foo"})

	test(function() {return m("custom#foo").attrs.id === "foo"})
	test(function() {return m("custom#foo.bar").attrs.id === "foo"})
	test(function() {return m("custom#foo.bar").attrs.className === "bar"})

	// m - children
	test(function() {return m("custom", "test").children[0] === "test"})
	test(function() {return m("custom", "test", "test2").children[1] === "test2"})
	test(function() {return m("custom", ["test"]).children[0] === "test"})

	// m - functor children
	test(function() {return m("custom", function(data){	return data	}).children[0] === "test1"})
	test(function() {return m("custom", {}, function(data){	return data	}).children[0] === "test1"})

	//m - passthrough
	test(function() {return m("div").tag === "div"})	
	test(function() {return m("div.foo").tag === "div"})
	test(function() {return m("div.foo").attrs.className === "foo"})
	test(function() {return m("div", "test").children[0] === "test"})
	test(function() {return m("div", "test", "test2").children[1] === "test2"})
	test(function() {return m("div", ["test"]).children[0] === "test"})
	test(function() {return m("div", {title: "bar"}, "test").attrs.title === "bar"})
	test(function() {return m("div", {title: "bar"}, "test").children[0] === "test"})
	test(function() {return m("div", {title: "bar"}, ["test"]).children[0] === "test"})
	test(function() {return m("div", {title: "bar"}, m("div")).children[0].tag === "div"})
	test(function() {return m("div", {title: "bar"}, [m("div")]).children[0].tag === "div"})
	test(function() {return m("div", {title: "bar"}, "test0", "test1", "test2", "test3").children[3] === "test3"}) // splat
	test(function() {return m("div", {title: "bar"}, m("div"), m("i"), m("span")).children[2].tag === "span"})
	test(function() {return m("div", ["a", "b"]).children.length === 2})
	test(function() {return m("div", [m("div")]).children[0].tag === "div"})
	test(function() {return m("div", m("div")).children[0].tag === "div"}) //yes, this is expected behavior: see method signature
	test(function() {return m("div", [{foo: "bar"}])}) //as long as it doesn't throw errors, it's fine

	//m - state
	test(function() {
		reset();
		m("custom", {state:data})
		return data.spy===2
	})
	test(function() {return m("custom", {state:data}).attrs.state===undefined})

	// m - template
	test(function() {return m("custom", [m('$test1')]).children[0].tag === "test1"})

	// m - compiled template
	test(function() {return m("custom", [m('$test1.foo')]).children[0].attrs.className === "foo"})

}
//mock
testMithrilElements(mock.window);

test.print(function(value) {console.log(value)})
