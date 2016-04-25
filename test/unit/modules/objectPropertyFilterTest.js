var OwlClass = require("../../../src/webvowl/js/elements/nodes/implementations/OwlClass");
var OwlThing = require("../../../src/webvowl/js/elements/nodes/implementations/OwlThing");
var ObjectProperty = require(
	"../../../src/webvowl/js/elements/properties/implementations/OwlObjectProperty");
var DatatypeProperty = require(
	"../../../src/webvowl/js/elements/properties/implementations/OwlDatatypeProperty");
var Link = require("../../../src/webvowl/js/elements/links/PlainLink");

describe("Filtering of object properties", function () {
	var filter;

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
		filter = require("../../../src/webvowl/js/modules/objectPropertyFilter")();
		filter.enabled(true);
	});

	it("should remove object properties", function () {
		var domain = new OwlClass();
		var range = new OwlClass();
		var objectProperty = new ObjectProperty();

		objectProperty.domain(domain).range(range);

		filter.filter([domain, range], [objectProperty]);

		expect(filter.filteredNodes()).toEqual([domain, range]);
		expect(filter.filteredProperties().length).toBe(0);
	});

	it("should remove things without any other properties", function () {
		var domain = new OwlThing();
		var range = new OwlThing();
		var objectProperty = new ObjectProperty();

		objectProperty.domain(domain).range(range);
		var objectPropertyLink = new Link(domain, range, objectProperty);
		domain.links([objectPropertyLink]);
		range.links([objectPropertyLink]);

		filter.filter([domain, range], [objectProperty]);

		expect(filter.filteredNodes().length).toBe(0);
		expect(filter.filteredProperties().length).toBe(0);
	});

	it("should keep things with any other properties", function () {
		var domain = new OwlClass();
		var range = new OwlThing();
		var objectProperty = new ObjectProperty();
		var datatypeProperty = new DatatypeProperty();

		objectProperty.domain(domain).range(range);
		datatypeProperty.domain(domain).range(range);
		var objectPropertyLink = new Link(domain, range, objectProperty);
		var datatypePropertyLink = new Link(domain, range, datatypeProperty);
		domain.links([objectPropertyLink, datatypePropertyLink]);
		range.links([objectPropertyLink, datatypePropertyLink]);

		filter.filter([domain, range], [objectProperty, datatypeProperty]);

		expect(filter.filteredNodes()).toEqual([domain, range]);
		expect(filter.filteredProperties()).toEqual([datatypeProperty]);
	});
});
