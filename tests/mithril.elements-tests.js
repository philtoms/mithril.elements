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
			return m('div',ctx);
		}
	}
	var data;
	function reset(){
		data={spy:0};
		m.redraw.strategy('all');
		m.redraw();
	}

	//m.element
	test(function() {return m.element("custom", custom)}) //as long as it doesn't throw errors, it's fine

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

}
//mock
testMithrilElements(mock.window);

test.print(function(value) {console.log(value)})
