/**
 * Contains the logic for the ontology listing and conversion.
 *
 * @returns {{}}
 */
webvowlApp.ontologyMenu = function () {

	var ontologyMenu = {};

	ontologyMenu.setup = function () {
		setupConverterButton();
	};

	function setupConverterButton() {
		d3.select("#iri-converter-form").on("submit", function() {
			location.hash = "iri=" + d3.select("#iri-converter-input").property("value");

			// abort the form submission because we set the hash parameter manually to prevent the ? attached in chrome
			d3.event.preventDefault();
			return false;
		});
	}

	return ontologyMenu;
};
