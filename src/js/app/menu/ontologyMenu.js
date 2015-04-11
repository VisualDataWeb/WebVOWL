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
		loadingProgress = d3.select("#loading-progress"),
		ontologyMenuTimeout,
		cachedConversions = {};

	ontologyMenu.setup = function () {
		setupUriListener();

		setupConverterButtons();
		setupUploadButton();

		d3.select("#error-description-button").on("click", function () {
			var errorContainer = d3.select("#error-description-container");
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
		var fileKey = "file=";
		if (hashParameter.substr(0, fileKey.length) === fileKey) {
			var filename = hashParameter.slice(fileKey.length);

			loadOntologyFromFile(filename);
		} else if (hashParameter.substr(0, iriKey.length) === iriKey) {
			var iri = hashParameter.slice(iriKey.length);
			loadOntologyFromUri("converter.php?iri=" + encodeURIComponent(iri), iri);

			d3.select("#converter-option").classed("selected-ontology", true);
		} else {
			// id of an existing ontology as parameter
			loadOntologyFromUri(jsonBasePath + hashParameter + ".json", hashParameter);

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

	function loadOntologyFromUri(relativePath, requestedUri) {
		var cachedOntology = cachedConversions[relativePath];
		var trimmedRequestedUri = requestedUri.replace(/\/$/g, "");
		var filename = trimmedRequestedUri.slice(trimmedRequestedUri.lastIndexOf("/") + 1);


		if (cachedOntology) {
			loadOntologyFromText(cachedOntology, undefined, filename);
		} else {
			displayLoadingIndicators();
			d3.xhr(relativePath, "application/json", function (error, request) {
				var loadingSuccessful = !error;
				var errorInfo;

				var jsonText;
				if (loadingSuccessful) {
					jsonText = request.responseText;
					cachedConversions[relativePath] = jsonText;
				} else {
					if (error.status === 404) {
						errorInfo = "Converter.php was not found. Please make sure that PHP is running."
					}
				}

				loadOntologyFromText(jsonText, undefined, filename);

				setLoadingStatus(loadingSuccessful, error ? error.response : undefined, errorInfo);
				hideLoadingInformations();
			});
		}
	}

	function setupConverterButtons() {
		var iriConverterButton = d3.select("#iri-converter-button");
		var iriConverterInput = d3.select("#iri-converter-input");

		iriConverterInput.on("input", function () {
			keepOntologySelectionOpenShortly();

			var inputIsEmpty = iriConverterInput.property("value") === "";
			iriConverterButton.attr("disabled", inputIsEmpty || undefined);
		}).on("click", function () {
			keepOntologySelectionOpenShortly();
		});

		d3.select("#iri-converter-form").on("submit", function () {
			location.hash = "iri=" + iriConverterInput.property("value");
			iriConverterInput.property("value", "");
			iriConverterInput.on("input")();

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
			var newHashParameter = "file=" + selectedFile.name;
			// Trigger the reupload manually, because the iri is not changing
			if (location.hash === "#" + newHashParameter) {
				loadOntologyFromFile();
			} else {
				location.hash = newHashParameter;
			}
		});
	}

	function loadOntologyFromFile(filename) {
		var input = d3.select("#file-converter-input"),
			uploadButton = d3.select("#file-converter-button");

		var cachedOntology = cachedConversions[filename];
		if (cachedOntology) {
			loadOntologyFromText(cachedOntology, filename);
			setLoadingStatus(true);
			return;
		}

		var selectedFile = input.property("files")[0];
		// No selection -> this was triggered by the iri. Unequal names -> reuploading another file
		if (!selectedFile || (filename && (filename !== selectedFile.name))) {
			loadOntologyFromText(undefined, undefined);
			setLoadingStatus(false, undefined, "No cached version of \"" + filename + "\" was found. Please reupload the file.");
			return;
		} else {
			filename = selectedFile.name;
		}

		displayLoadingIndicators();
		uploadButton.property("disabled", true);

		var formData = new FormData();
		formData.append("ontology", selectedFile);

		var xhr = new XMLHttpRequest();
		xhr.open("POST", "converter.php", true);

		xhr.onload = function () {
			uploadButton.property("disabled", false);

			if (xhr.status === 200) {
				var trimmedFilename = filename.split(".")[0];
				loadOntologyFromText(xhr.responseText, trimmedFilename);
				cachedConversions[filename] = xhr.responseText;
			} else {
				setLoadingStatus(false, xhr.responseText);
			}
			hideLoadingInformations();
		};

		xhr.send(formData);
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

	function setLoadingStatus(success, description, information) {
		loadingError.classed("hidden", success);

		var errorInfo = d3.select("#error-info");
		if (information) {
			errorInfo.text(information);
		} else {
			errorInfo.html("Ontology could not be loaded.<br>Is it a valid OWL ontology? Please check with <a target=\"_blank\"" +
			"href=\"http://mowl-power.cs.man.ac.uk:8080/validator/\">OWL Validator</a>.");
		}

		var descriptionMissing = !description;
		d3.select("#error-description-button").classed("hidden", descriptionMissing);
		d3.select("#error-description-container").classed("hidden", descriptionMissing);
		d3.select("#error-description").text(description || "");
	}

	function hideLoadingInformations() {
		loadingProgress.classed("hidden", true);
	}

	return ontologyMenu;
};
