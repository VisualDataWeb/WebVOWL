var OwlClass = require("../../../src/webvowl/js/elements/nodes/implementations/OwlClass");
var RdfsSubClassOf = require("../../../src/webvowl/js/elements/properties/implementations/RdfsSubClassOf");
var ObjectProperty = require("../../../src/webvowl/js/elements/properties/implementations/OwlObjectProperty");

describe("Collapsing of subclassOf properties", function () {
	var collapser;

	beforeEach(function () {
		jasmine.addMatchers({
			toBeInstanceOf: function () {
				return {
					compare: function (actual, expected) {
						return {
							pass: actual instanceof expected
						};
					}
				};
			}
		});
	});

	beforeEach(function () {
		collapser = require("../../../src/webvowl/js/modules/subclassFilter")();
		collapser.enabled(true);
	});


	it("should remove subclasses and their properties", function () {
		var superClass = new OwlClass(),
			subProperty = new RdfsSubClassOf(),
			subclass = new OwlClass();

		subProperty.domain(subclass).range(superClass);

		collapser.filter([superClass, subclass], [subProperty]);

		expect(collapser.filteredNodes().length).toBe(1);
		expect(collapser.filteredNodes()[0]).toBeInstanceOf(OwlClass);
		expect(collapser.filteredProperties().length).toBe(0);
	});

	it("should remove nested subclasses and their properties", function () {
		var superClass = new OwlClass(),
			subProperty = new RdfsSubClassOf(),
			subclass = new OwlClass(),
			subSubProperty = new RdfsSubClassOf(),
			subSubclass = new OwlClass();

		subProperty.domain(subclass).range(superClass);
		subSubProperty.domain(subSubclass).range(subclass);

		collapser.filter([superClass, subclass, subSubclass], [subProperty, subSubProperty]);

		expect(collapser.filteredNodes().length).toBe(1);
		expect(collapser.filteredNodes()[0]).toBeInstanceOf(OwlClass);
		expect(collapser.filteredProperties().length).toBe(0);
	});

	it("should not remove if a subclass is domain of another property", function () {
		var superClass = new OwlClass(),
			subProperty = new RdfsSubClassOf(),
			subclass = new OwlClass(),
			otherProperty = new ObjectProperty(),
			nodes = [superClass, subclass],
			properties = [subProperty, otherProperty];

		subProperty.domain(subclass).range(superClass);
		otherProperty.domain(subclass).range(superClass);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

	it("should not remove if a subclass is range of another property", function () {
		var superClass = new OwlClass(),
			subProperty = new RdfsSubClassOf(),
			subclass = new OwlClass(),
			otherProperty = new ObjectProperty(),
			nodes = [superClass, subclass],
			properties = [subProperty, otherProperty];

		subProperty.domain(subclass).range(superClass);
		otherProperty.domain(superClass).range(subclass);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

	it("should not collapse if a subclass has a subclass with non-subclass properties", function () {
		var superClass = new OwlClass(),
			subProperty = new RdfsSubClassOf(),
			subclass = new OwlClass(),
			subSubclassProperty = new RdfsSubClassOf(),
			subSubclass = new OwlClass(),
			otherProperty = new ObjectProperty(),
			otherNode = new OwlClass(),
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
		var superClass1 = new OwlClass(),
			subProperty1 = new RdfsSubClassOf(),
			superClass2 = new OwlClass(),
			subProperty2 = new RdfsSubClassOf(),
			subclass = new OwlClass(),
			nodes = [superClass1, superClass2, subclass],
			properties = [subProperty1, subProperty2];

		subProperty1.domain(subclass).range(superClass1);
		subProperty2.domain(subclass).range(superClass2);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

	it("should be able to handle circles", function () {
		var loopSubClass = new OwlClass(),
			subProperty = new RdfsSubClassOf(),
			nodes = [loopSubClass],
			properties = [subProperty];

		subProperty.domain(loopSubClass).range(loopSubClass);

		collapser.filter(nodes, properties);

		expect(collapser.filteredNodes()).toEqual(nodes);
		expect(collapser.filteredProperties()).toEqual(properties);
	});

});
