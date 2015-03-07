/**
 * Contains the logic for the ontology listing and conversion.
 *
 * @returns {{}}
 */
webvowlApp.ontologyMenu = function (loadOntologyFromText) {

	var ontologyMenu = {},
		jsonBasePath = "js/data/",
		defaultJsonName = "foaf", // This file is loaded by default
	// Selections for the app
		loadingError = d3.select("#loading-error"),
		loadingProgress = d3.select("#loading-progress");

	ontologyMenu.setup = function () {
		setupUriListener();

		setupConverterButton();
		setupUploadButton();
	};


	function setupUriListener() {
		// parse the url initially
		parseUrlAndLoadOntology();

		// reload ontology when hash parameter gets changed manually
		d3.select(window).on("hashchange", function () {
			var oldURL = d3.event.oldURL, newURL = d3.event.newURL;

			if (oldURL !== newURL) {
				// don't reload when just the hash parameter gets appended
				if (newURL === oldURL + "#") {
					return;
				}

				updateNavigationHrefs();
				parseUrlAndLoadOntology();
			}
		});

		updateNavigationHrefs();
	}

	/**
	 * Quick fix: update all anchor tags that are used as buttons because a click on them
	 * changes the url and this will load an other ontology.
	 */
	function updateNavigationHrefs() {
		d3.selectAll("#optionsMenu > li > a").attr("href", location.hash || "#");
	}

	function parseUrlAndLoadOntology() {
		// slice the "#" character
		var hashParameter = location.hash.slice(1);

		if (!hashParameter) {
			hashParameter = defaultJsonName;
		}

		var ontologyOptions = d3.selectAll(".select li").classed("selected-ontology", false);

		// IRI parameter
		var iriKey = "iri=";
		if (location.hash === "#file") {
			displayLoadingStatus(false, "No file was uploaded");
		} else if (hashParameter.substr(0, iriKey.length) === iriKey) {
			var iri = hashParameter.slice(iriKey.length);
			loadOntologyFromUri("converter.php?iri=" + encodeURIComponent(iri));

			d3.select("#converter-option").classed("selected-ontology", true);
		} else {
			// id of an existing ontology as parameter
			loadOntologyFromUri(jsonBasePath + hashParameter + ".json");

			ontologyOptions.each(function () {
				var ontologyOption = d3.select(this);
				if (ontologyOption.select("a").size() > 0) {

					if (ontologyOption.select("a").attr("href") === "#" + hashParameter) {
						ontologyOption.classed("selected-ontology", true);
					}
				}
			});
		}
	}

	function loadOntologyFromUri(relativePath) {
		displayLoadingInformations();
		d3.xhr(relativePath, 'application/json', function (error, request) {
			var loadingFailed = !!error;

			displayLoadingStatus(!loadingFailed, error ? error.response : undefined);
			hideLoadingInformations();

			var jsonText;
			if (!loadingFailed) {
				jsonText = request.responseText;
			}

			var filename = relativePath.slice(relativePath.lastIndexOf("/") + 1);
			loadOntologyFromText(jsonText, filename);
		});
	}

	function setupConverterButton() {
		d3.select("#iri-converter-form").on("submit", function() {
			location.hash = "iri=" + d3.select("#iri-converter-input").property("value");

			// abort the form submission because we set the hash parameter manually to prevent the ? attached in chrome
			d3.event.preventDefault();
			return false;
		});
	}

	function setupUploadButton() {
		var input = d3.select("#file-converter-input"),
			uploadButton = d3.select("#file-converter-button");

		input.on("change", function() {
			var selectedFiles = input.property("files");
			uploadButton.property("disabled", selectedFiles.length <= 0);
		});

		uploadButton.on("click", function() {
			var selectedFile = input.property("files")[0];
			if (!selectedFile) {
				return false;
			}

			displayLoadingInformations();
			uploadButton.property("disabled", true);
			location.hash = "file";

			var formData = new FormData();
			formData.append("ontology", selectedFile);

			var xhr = new XMLHttpRequest();
			xhr.open("POST", "converter.php", true);

			xhr.onload = function() {
				uploadButton.property("disabled", false);

				if (xhr.status === 200) {
					loadOntologyFromText(xhr.responseText, selectedFile.name)
				} else {
					displayLoadingStatus(false, xhr.responseText);
				}
				hideLoadingInformations();
			};

			xhr.send(formData);
		});
	}


	function displayLoadingInformations() {
		loadingError.classed("hidden", true);
		loadingProgress.classed("hidden", false);
	}

	function displayLoadingStatus(success, message) {
		if (!success) {
			d3.select("#custom-error-message").text(message || "");
		}
		loadingError.classed("hidden", success);
	}

	function hideLoadingInformations() {
		loadingProgress.classed("hidden", true);
	}

	return ontologyMenu;
};
