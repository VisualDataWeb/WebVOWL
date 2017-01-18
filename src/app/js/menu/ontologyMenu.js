var unescape = require("lodash/unescape");

/**
 * Contains the logic for the ontology listing and conversion.
 *
 * @returns {{}}
 */
module.exports = function (graph) {

	var ontologyMenu = {},
		DEFAULT_JSON_NAME = "foaf", // This file is loaded by default
		loadingError = d3.select("#loading-error"),
		loadingProgress = d3.select("#loading-progress"),
		ontologyMenuTimeout,
		emptyGraph=false,
		fileToLoad,
		cachedConversions = {},
		loadOntologyFromText;


	String.prototype.beginsWith = function (string) {
		return(this.indexOf(string) === 0);
	};

	ontologyMenu.setup = function (_loadOntologyFromText) {
		loadOntologyFromText = _loadOntologyFromText;

		var menuEntry= d3.select("#select");
		menuEntry.on("mouseover",function(){
			var searchMenu=graph.options().searchMenu();
			searchMenu.hideSearchEntries();
		});

		setupConverterButtons();
		setupUploadButton();

		var descriptionButton = d3.select("#error-description-button").datum({open: false});
		descriptionButton.on("click", function (data) {
			var errorContainer = d3.select("#error-description-container");
			var errorDetailsButton = d3.select(this);

			// toggle the state
			data.open = !data.open;
			var descriptionVisible = data.open;
			if (descriptionVisible) {
				errorDetailsButton.text("Hide error details");
			} else {
				errorDetailsButton.text("Show error details");
			}
			errorContainer.classed("hidden", !descriptionVisible);
		});

		setupUriListener();
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

	ontologyMenu.setIriText=function(text){
		var iriConverterInput = d3.select("#iri-converter-input");
		iriConverterInput.node().value=text;

		var iriConverterButton = d3.select("#iri-converter-button");
		iriConverterButton.attr("disabled", false);
		d3.select("#iri-converter-form").on("submit")();
	};

	function parseUrlAndLoadOntology() {
		// slice the "#" character
		var hashParameter = location.hash.slice(1);

		if (!hashParameter) {
			hashParameter = DEFAULT_JSON_NAME;
		}

		var ontologyOptions = d3.selectAll(".select li").classed("selected-ontology", false);
		emptyGraph=false;
		// IRI parameter
		var iriKey = "iri=";
		var urlKey = "url=";
		var fileKey = "file=";

		if (hashParameter.substr(0, fileKey.length) === fileKey) {
			var filename = decodeURIComponent(hashParameter.slice(fileKey.length));
			loadOntologyFromFile(filename);

		} else if (hashParameter.substr(0, urlKey.length) === urlKey) {
			var url = decodeURIComponent(hashParameter.slice(urlKey.length));
			loadOntologyFromURL("read?json=" + encodeURIComponent(url), url);

		} else if (hashParameter.substr(0, iriKey.length) === iriKey) {
			var iri = decodeURIComponent(hashParameter.slice(iriKey.length));
			loadOntologyFromUri("convert?iri=" + encodeURIComponent(iri), iri);
			d3.select("#converter-option").classed("selected-ontology", true);

		} else {
			// id of an existing ontology as parameter
			loadOntologyFromUri("data/" + hashParameter + ".json", hashParameter);

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

	function loadOntologyFromURL(relativePath,requestedURL){
		fileToLoad=requestedURL;
		var cachedOntology = cachedConversions[relativePath];
		var trimmedRequestedUri = requestedURL.replace(/\/$/g, "");
		var filename = trimmedRequestedUri.slice(trimmedRequestedUri.lastIndexOf("/") + 1);

		// check if requested url is a json;
		var isJSON=requestedURL.toLowerCase().endsWith(".json");
		if (!isJSON){
			ontologyMenu.notValidJsonURL();
			graph.clearGraphData();
			return;
		}

		if (cachedOntology) {
			loadOntologyFromText(cachedOntology, undefined, filename);
			setLoadingStatus(true);
		} else {
			displayLoadingIndicators();
			d3.xhr(relativePath, "application/json", function (error, request) {
				var loadingSuccessful = !error;
				var errorInfo;


				// check if error occurred or responseText is empty
				if ((error!==null && error.status === 500) || (request && request.responseText.length===0)) {
					hideLoadingInformations();
					ontologyMenu.notValidJsonURL();
					cachedConversions[relativePath]=undefined;
					return;
				}
				var jsonText;
				if (loadingSuccessful) {
					jsonText = request.responseText;
					cachedConversions[relativePath] = jsonText;
				} else {
					if (error.status === 404) {
						errorInfo = "Connection to the OWL2VOWL interface could not be established.";
						graph.clearGraphData();
					}
				}

				loadOntologyFromText(jsonText, undefined, filename);
				setLoadingStatus(loadingSuccessful, error ? error.response : undefined, errorInfo);

				if (emptyGraph===true){
					ontologyMenu.notValidJsonFile();
					graph.clearGraphData();
				}

				hideLoadingInformations();
			});
		}
	}

	function loadOntologyFromUri(relativePath, requestedUri) {
		fileToLoad=requestedUri;
		var cachedOntology = cachedConversions[relativePath];
		var trimmedRequestedUri = requestedUri.replace(/\/$/g, "");
		var filename = trimmedRequestedUri.slice(trimmedRequestedUri.lastIndexOf("/") + 1);

		if (cachedOntology) {
			loadOntologyFromText(cachedOntology, undefined, filename);
			setLoadingStatus(true);
		} else {
			displayLoadingIndicators();
			d3.xhr(relativePath, "application/json", function (error, request) {
				var loadingSuccessful = !error;
				var errorInfo;
				if (error!==null && error.status === 500) {
					hideLoadingInformations();
				 	ontologyMenu.emptyGraphError();
				 	return;
				 }



				var jsonText;
				if (loadingSuccessful) {
					jsonText = request.responseText;
					cachedConversions[relativePath] = jsonText;
				} else {
					if (error.status === 404) {
						// check if this is file related and not owl2vowl converter connection error
						// IRI parameter
						var iriKey = "iri=";
						var urlKey = "url=";
						var fileKey = "file=";

						var hashParameter = location.hash.slice(1);
						if (hashParameter.substr(0, fileKey.length) !== fileKey &&
							hashParameter.substr(0, urlKey.length) !== urlKey &&
							hashParameter.substr(0, iriKey.length) !== iriKey) {
							// this is a file related error
							ontologyMenu.emptyGraphError();
						}
						errorInfo = "Connection to the OWL2VOWL interface could not be established.";
						graph.clearGraphData();
					}
				}

				loadOntologyFromText(jsonText, undefined, filename);
				setLoadingStatus(loadingSuccessful, error ? error.response : undefined, errorInfo);

				if (emptyGraph===true){
					ontologyMenu.emptyGraphError();
					graph.clearGraphData();
				}
				hideLoadingInformations();
			});
		}
	}

	ontologyMenu.emptyGraphError=function(){

		emptyGraph=true;
		loadingError.classed("hidden", false);
		var errorInfo = d3.select("#error-info");
		errorInfo.text("There is nothing to visualize.");
		var description="There is no OWL input under the given IRI("+fileToLoad+"). Please try to load the OWL file directly.";
		var descriptionMissing = !description;
		var descriptionVisible = d3.select("#error-description-button").classed("hidden", descriptionMissing).datum().open;
		d3.select("#error-description-container").classed("hidden", descriptionMissing || !descriptionVisible);
		d3.select("#error-description").text((description));
		graph.clearGraphData();

	};

	ontologyMenu.notValidJsonURL=function(){

		emptyGraph=true;
		loadingError.classed("hidden", false);
		var errorInfo = d3.select("#error-info");
		errorInfo.text("Invalid JSON URL");
		var description="There is no JSON input under the given URL("+fileToLoad+"). Please try to load the JSON file directly.";
		var descriptionMissing = !description;
		var descriptionVisible = d3.select("#error-description-button").classed("hidden", descriptionMissing).datum().open;
		d3.select("#error-description-container").classed("hidden", descriptionMissing || !descriptionVisible);
		d3.select("#error-description").text((description));
		graph.clearGraphData();
	};

	ontologyMenu.notValidJsonFile=function(){

		emptyGraph=true;
		loadingError.classed("hidden", false);
		var errorInfo = d3.select("#error-info");
		errorInfo.text("Invalid JSON file");
		var description="The uploaded file is not a valid JSON file. ("+fileToLoad+")";
		var descriptionMissing = !description;
		var descriptionVisible = d3.select("#error-description-button").classed("hidden", descriptionMissing).datum().open;
		d3.select("#error-description-container").classed("hidden", descriptionMissing || !descriptionVisible);
		d3.select("#error-description").text((description));
		graph.clearGraphData();

	};

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
			var inputName=iriConverterInput.property("value");

			// remove first spaces
			var clearedName=inputName.replace(/%20/g," ");
			while (clearedName.beginsWith(" ")){
				clearedName=clearedName.substr(1,clearedName.length);
			}
			// remove ending spaces
			while (clearedName.endsWith(" ")){
				clearedName=clearedName.substr(0,clearedName.length-1);
			}
			// check if iri is actually an url for a json file (ends with .json)
			// create lowercase filenames;
			inputName=clearedName;
			var lc_iri=inputName.toLowerCase();
			if (lc_iri.endsWith(".json")) {
			 	console.log("file is an URL for a json ");
				location.hash = "url=" + inputName;
				iriConverterInput.property("value", "");
				iriConverterInput.on("input")();
			} else {
				location.hash = "iri=" + inputName;
				iriConverterInput.property("value", "");
				iriConverterInput.on("input")();
			}

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
				inputLabel.text("Select ontology file");
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
		var cachedOntology = cachedConversions[filename];
		if (cachedOntology) {
			displayLoadingIndicators();
			loadOntologyFromText(cachedOntology, filename);
			setLoadingStatus(true);
			if (emptyGraph===true){
				ontologyMenu.emptyGraphError();
			}
			hideLoadingInformations();
			return;
		}

		var selectedFile = d3.select("#file-converter-input").property("files")[0];
		// No selection -> this was triggered by the iri. Unequal names -> reuploading another file
		if (!selectedFile || (filename && (filename !== selectedFile.name))) {
			loadOntologyFromText(undefined, undefined);
			setLoadingStatus(false, undefined, "No cached version of \"" + filename + "\" was found. Please reupload the file.");
			graph.clearGraphData();
			return;
		} else {
			filename = selectedFile.name;
		}

		if (filename.match(/\.json$/)) {
			displayLoadingIndicators();
			loadFromJson(selectedFile, filename);
		} else {
			loadFromOntology(selectedFile, filename,true);
		}
	}

	function loadFromJson(file, filename) {
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function () {
			displayLoadingIndicators();
			loadOntologyFromTextAndTrimFilename(reader.result, filename);
			setLoadingStatus(true);
			if (emptyGraph===true){
				ontologyMenu.emptyGraphError();
			}
			hideLoadingInformations();
		};
	}

	function loadFromOntology(selectedFile, filename, fromFile) {
		var uploadButton = d3.select("#file-converter-button");

		displayLoadingIndicators();
		uploadButton.property("disabled", true);

		var formData = new FormData();
		formData.append("ontology", selectedFile);
		var xhr = new XMLHttpRequest();

		xhr.open("POST", "convert", true);
		xhr.onload = function () {
			uploadButton.property("disabled", false);

			if (xhr.status === 200) {
				loadOntologyFromTextAndTrimFilename(xhr.responseText, filename);
				cachedConversions[filename] = xhr.responseText;
			} else {
				loadOntologyFromText(undefined, undefined);
				setLoadingStatus(false, xhr.responseText);
				hideLoadingInformations();
				graph.clearGraphData();

			}
			hideLoadingInformations();
			if (emptyGraph===true && fromFile===true){
				console.log("Failed to convert the file");
				cachedConversions[filename]=undefined;
				ontologyMenu.notValidJsonFile();
			}
		};
		xhr.send(formData);
	}

	function loadOntologyFromTextAndTrimFilename(text, filename) {
		var trimmedFilename = filename.split(".")[0];
		loadOntologyFromText(text, trimmedFilename);
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
			"href=\"http://visualdataweb.de/validator/\">OWL Validator</a>.");
		}

		var descriptionMissing = !description;
		var descriptionVisible = d3.select("#error-description-button").classed("hidden", descriptionMissing).datum().open;
		d3.select("#error-description-container").classed("hidden", descriptionMissing || !descriptionVisible);
		d3.select("#error-description").text(unescape(description));
	}

	function hideLoadingInformations() {
		loadingProgress.classed("hidden", true);
	}

	return ontologyMenu;
};
