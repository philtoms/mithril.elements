function testMithrilElements(mock) {
	m.deps(mock)
	
	var custom = {
		controller:function(data){
			if (data) data.spy+=1;
			this.data=data || {};
		},
		view: function(ctrl,ctx){
			if (ctrl.data) ctrl.data.spy++;
			if (typeof ctx === 'function') return m('div',ctx('test1'));
			return m('div',ctx || 'test2')
		}
	}
	var data;
	function reset(){
		data={spy:0};
		m.redraw.strategy('all');
		m.redraw();
	}

	//m.elements
	test(function() {return m.element("custom", custom)}) //as long as it doesn't throw errors, it's fine

	//lifetime - cached controller
	test(function() {
		reset();
		m("custom#1",{},[],data)
		m("custom#1",{},[],data)
		return data.spy==3;
	})	

	//lifetime - unique controller
	test(function() {
		reset();
		m("custom#1",{},[],data)
		m("custom#2",{},[],data)
		return data.spy==4;
	})	

	//lifetime - unique controller (lastId)
	test(function() {
		reset();
		m("custom",{},[],data)
		m("custom",{},[],data)
		return data.spy==4;
	})	

	//lastId reset
	test(function() {
		reset();
		m("custom",{},[],data)
		reset();
		m("custom",{},[],data)
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
	test(function() {return m("custom", "test").children[0] === "test2"})
	test(function() {return m("custom", "test", "test2").children[1] === "test2"})
	test(function() {return m("custom", ["test"]).children[0] === "test2"})

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
	test(function() {return m("custom", {},[],'data')}) //as long as it doesn't throw errors, it's fine

	test(function() {
		var root = mock.document.createElement("div")

		var success = false
		m.render(root, m("custom", {config: function(elem, isInitialized, ctx) {ctx.data = 1}}))
		m.render(root, m("custom", {config: function(elem, isInitialized, ctx) {success = ctx.data === 1}}))
		return success
	})

	// m.template
	test(function() {return m("custom", [m.template('test1')]).children[0].tag === "test1"})
	
}
//mock
testMithrilElements(mock.window);

test.print(function(value) {console.log(value)})
