describe("Collapsing of subclassOf properties", function () {
	var collapser;

	beforeEach(function () {
		this.addMatchers({
			toBeInstanceOf: function (expected) {
				return this.actual instanceof expected;
			}
		});
	});

	beforeEach(function () {
		collapser = webvowl.modules.subclassCollapser();
		collapser.enabled(true);
	});


	it("should remove subclasses and their properties", function () {
		var superClass = new webvowl.nodes.owlclass(),
			subProperty = new webvowl.labels.rdfssubclassof(),
			subclass = new webvowl.nodes.owldeprecatedclass();

		subProperty.domain(subclass).range(superClass);

		collapser.filter([superClass, subclass], [subProperty]);

		expect(collapser.filteredNodes().length).toBe(1);
		expect(collapser.filteredNodes()[0]).toBeInstanceOf(webvowl.nodes.owlclass);
		expect(collapser.filteredProperties().length).toBe(0);
	});

	it("should remove nested subclasses and their properties", function () {
		var superClass = new webvowl.nodes.owlclass(),
			subProperty = new webvowl.labels.rdfssubclassof(),
			subclass = new webvowl.nodes.owldeprecatedclass(),
			subSubProperty = new webvowl.labels.rdfssubclassof(),
			subSubclass = new webvowl.nodes.owldeprecatedclass();

		subProperty.domain(subclass).range(superClass);
		subSubProperty.domain(subSubclass).range(subclass);

		collapser.filter([superClass, subclass, subSubclass], [subProperty, subSubProperty]);

		expect(collapser.filteredNodes().length).toBe(1);
		expect(collapser.filteredNodes()[0]).toBeInstanceOf(webvowl.nodes.owlclass);
		expect(collapser.filteredProperties().length).toBe(0);
	});

	it("should not remove if a subclass is domain of another property", function () {
		var superClass = new webvowl.nodes.owlclass(),
			subProperty = new webvowl.labels.rdfssubclassof(),
			subclass = new webvowl.nodes.owldeprecatedclass(),
			otherProperty = new webvowl.labels.owlobjectproperty(),
			nodes = [superClass, subclass],
			properties = [subProperty, otherProperty];

		subProperty.domain(subclass).range(superClass);
		otherProperty.domain(subclass).range(superClass);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

	it("should not remove if a subclass is range of another property", function () {
		var superClass = new webvowl.nodes.owlclass(),
			subProperty = new webvowl.labels.rdfssubclassof(),
			subclass = new webvowl.nodes.owldeprecatedclass(),
			otherProperty = new webvowl.labels.owlobjectproperty(),
			nodes = [superClass, subclass],
			properties = [subProperty, otherProperty];

		subProperty.domain(subclass).range(superClass);
		otherProperty.domain(superClass).range(subclass);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

	it("should not collapse if a subclass has a subclass with non-subclass properties", function () {
		var superClass = new webvowl.nodes.owlclass(),
			subProperty = new webvowl.labels.rdfssubclassof(),
			subclass = new webvowl.nodes.owldeprecatedclass(),
			subSubclassProperty = new webvowl.labels.rdfssubclassof(),
			subSubclass = new webvowl.nodes.owldeprecatedclass(),
			otherProperty = new webvowl.labels.owlobjectproperty(),
			otherNode = new webvowl.nodes.owlthing(),
			nodes = [superClass, subclass, subSubclass, otherNode],
			properties = [subProperty, subSubclassProperty, otherProperty];

		subProperty.domain(subclass).range(superClass);
		subSubclassProperty.domain(subSubclass).range(subclass);
		otherProperty.domain(otherNode).range(subSubclass);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

	it("should not collapse if a subclass has multiple superclasses", function () {
		var superClass1 = new webvowl.nodes.owlclass(),
			subProperty1 = new webvowl.labels.rdfssubclassof(),
			superClass2 = new webvowl.nodes.owlclass(),
			subProperty2 = new webvowl.labels.rdfssubclassof(),
			subclass = new webvowl.nodes.owldeprecatedclass(),
			nodes = [superClass1, superClass2, subclass],
			properties = [subProperty1, subProperty2];

		subProperty1.domain(subclass).range(superClass1);
		subProperty2.domain(subclass).range(superClass2);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

});
