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

}
//mock
testMithrilElements(mock.window);

test.print(function(value) {console.log(value)})
