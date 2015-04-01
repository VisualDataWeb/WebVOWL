/**
 * Contains the logic for the ontology listing and conversion.
 *
 * @returns {{}}
 */
webvowlApp.ontologyMenu = function (loadFromText) {

	var ontologyMenu = {},
		jsonBasePath = "js/data/",
		defaultJsonName = "foaf", // This file is loaded by default
	// Selections for the app
		loadingError = d3.select("#loading-error"),
		loadingProgress = d3.select("#loading-progress"),
		ontologyMenuTimeout,
		ontologyLoadingSuccessful = false,
		cachedIriConversions = {};

	ontologyMenu.setup = function () {
		setupUriListener();

		setupConverterButton();
		setupUploadButton();

		d3.select("#error-details-button").on("click", function () {
			var errorContainer = d3.select("#error-details-container");
			var errorDetailsButton = d3.select(this);

			var invisible = errorContainer.classed("hidden");
			if (invisible) {
				errorDetailsButton.text("Hide error details");
			} else {
				errorDetailsButton.text("Show error details");
			}
			errorContainer.classed("hidden", !invisible);
		});
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
			setLoadingStatus("No file was uploaded");
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

		// Reset the loaded state to handle upcoming iri changes correctly
		ontologyLoadingSuccessful = false;
	}

	function loadOntologyFromUri(relativePath) {
		var filename = relativePath.slice(relativePath.lastIndexOf("/") + 1);
		var cachedOntology = cachedIriConversions[relativePath];

		displayLoadingIndicators();

		if (cachedOntology) {
			loadOntologyFromText(cachedOntology, filename);
			hideLoadingInformations();
		} else {
			d3.xhr(relativePath, "application/json", function (error, request) {
				var loadingFailed = !!error;

				var jsonText;
				if (!loadingFailed) {
					jsonText = request.responseText;
					cachedIriConversions[relativePath] = jsonText;
				}

				loadOntologyFromText(jsonText, filename);

				setLoadingStatus(error ? error.response : undefined);
				hideLoadingInformations();

				ontologyLoadingSuccessful = false;
			});
		}
	}

	function loadOntologyFromText(jsonText, filename) {
		ontologyLoadingSuccessful = !!jsonText;

		loadFromText(jsonText, filename);
	}

	function setupConverterButton() {
		d3.select("#iri-converter-input").on("input", function () {
			keepOntologySelectionOpenShortly();
		}).on("click", function () {
			keepOntologySelectionOpenShortly();
		});

		d3.select("#iri-converter-form").on("submit", function () {
			location.hash = "iri=" + d3.select("#iri-converter-input").property("value");

			// abort the form submission because we set the hash parameter manually to prevent the ? attached in chrome
			d3.event.preventDefault();
			return false;
		});
	}

	function setupUploadButton() {
		var input = d3.select("#file-converter-input"),
			inputLabel = d3.select("#file-converter-label"),
			uploadButton = d3.select("#file-converter-button");

		input.on("change", function () {
			var selectedFiles = input.property("files");
			if (selectedFiles.length <= 0) {
				inputLabel.text("Please select a file");
				uploadButton.property("disabled", true);
			} else {
				inputLabel.text(selectedFiles[0].name);
				uploadButton.property("disabled", false);

				keepOntologySelectionOpenShortly();
			}
		});

		uploadButton.on("click", function () {
			var selectedFile = input.property("files")[0];
			if (!selectedFile) {
				return false;
			}

			displayLoadingIndicators();
			uploadButton.property("disabled", true);

			var formData = new FormData();
			formData.append("ontology", selectedFile);

			var xhr = new XMLHttpRequest();
			xhr.open("POST", "converter.php", true);

			xhr.onload = function () {
				location.hash = "file";
				uploadButton.property("disabled", false);

				if (xhr.status === 200) {
					loadOntologyFromText(xhr.responseText, selectedFile.name);
				} else {
					loadOntologyFromText(undefined, selectedFile.name);
				}
				setLoadingStatus(xhr.responseText);
				hideLoadingInformations();
			};

			xhr.send(formData);
		});
	}

	function keepOntologySelectionOpenShortly() {
		// Events in the menu should not be considered
		var ontologySelection = d3.select("#select .toolTipMenu");
		ontologySelection.on("click", function () {
			d3.event.stopPropagation();
		}).on("keydown", function () {
			d3.event.stopPropagation();
		});

		ontologySelection.style("display", "block");

		function disableKeepingOpen() {
			ontologySelection.style("display", undefined);

			clearTimeout(ontologyMenuTimeout);
			d3.select(window).on("click", undefined).on("keydown", undefined);
			ontologySelection.on("mouseover", undefined);
		}

		// Clear the timeout to handle fast calls of this function
		clearTimeout(ontologyMenuTimeout);
		ontologyMenuTimeout = setTimeout(function () {
			disableKeepingOpen();
		}, 3000);

		// Disable forced open selection on interaction
		d3.select(window).on("click", function () {
			disableKeepingOpen();
		}).on("keydown", function () {
			disableKeepingOpen();
		});

		ontologySelection.on("mouseover", function () {
			disableKeepingOpen();
		});
	}


	function displayLoadingIndicators() {
		loadingError.classed("hidden", true);
		loadingProgress.classed("hidden", false);
	}

	function setLoadingStatus(message) {
		if (!ontologyLoadingSuccessful) {
			d3.select("#custom-error-message").text(message || "");
			loadOntologyFromText(undefined, undefined);
		}
		loadingError.classed("hidden", ontologyLoadingSuccessful);
	}

	function hideLoadingInformations() {
		loadingProgress.classed("hidden", true);
	}

	return ontologyMenu;
};
