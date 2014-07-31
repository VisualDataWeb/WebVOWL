describe("Collapsing of datatypes", function () {
	var collapser;

	beforeEach(function () {
		this.addMatchers({
			toBeInstanceOf: function (expected) {
				return this.actual instanceof expected;
			}
		});
	});

	beforeEach(function () {
		collapser = webvowl.modules.datatypeCollapser();
		collapser.enabled(true);
	});


	it("should remove datatypes with their properties", function () {
		var domain = new webvowl.nodes.owlclass(),
			datatypeProperty = new webvowl.labels.owldatatypeproperty(),
			datatypeClass = new webvowl.nodes.rdfsdatatype();

		datatypeProperty.domain(domain).range(datatypeClass);

		collapser.filter([domain, datatypeClass], [datatypeProperty]);

		expect(collapser.filteredNodes().length).toBe(1);
		expect(collapser.filteredNodes()[0]).toBeInstanceOf(webvowl.nodes.owlclass);
		expect(collapser.filteredProperties().length).toBe(0);
	});

});
