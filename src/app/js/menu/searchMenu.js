/**
 * Contains the search "engine"
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function (graph) {
	var searchMenu = {},
		dictionary = [],
		entryNames = [],
		searchLineEdit,
		dropDownContainer,
		mergedStringsList,
		mergedIdList,
		maxEntries = 6,
		dictionaryUpdateRequired = true,
		labelDictionary,
		inputText,
		viewStatusOfSearchEntries = false;

	searchMenu.requestDictionaryUpdate = function () {
		dictionaryUpdateRequired = true;
		// clear possible pre searched entries
		var htmlCollection = dropDownContainer.node().children;
		var numEntries = htmlCollection.length;

		for (var i = 0; i < numEntries; i++)
			htmlCollection[0].remove();
		searchLineEdit.node().value = "";
	};


	function updateSearchDictionary() {
		labelDictionary = graph.getUpdateDictionary();
		dictionaryUpdateRequired = false;
		dictionary = [];
		entryNames = [];
		var idList = [];
		var stringList = [];

		var i;
		for (i = 0; i < labelDictionary.length; i++) {
			var lEntry = labelDictionary[i].labelForCurrentLanguage();
			idList.push(labelDictionary[i].id());
			stringList.push(lEntry);

		}
		mergedStringsList = [];
		mergedIdList = [];
		var indexInStringList=-1;
		var currentString;
		var currentObjectId;

		for (i = 0; i < stringList.length; i++) {
			if (i === 0) {
				// just add the elements
				mergedStringsList.push(stringList[i]);
				mergedIdList.push([]);
				mergedIdList[0].push(idList[i]);
				continue;
			}
			else {
				currentString = stringList[i];
				currentObjectId = idList[i];
				indexInStringList = mergedStringsList.indexOf(currentString);
			}
			if (indexInStringList === -1) {
				mergedStringsList.push(stringList[i]);
				mergedIdList.push([]);
				var lastEntry = mergedIdList.length;
				mergedIdList[lastEntry - 1].push(currentObjectId);
			} else {
				mergedIdList[indexInStringList].push(currentObjectId);
			}
		}

		for (i = 0; i < mergedStringsList.length; i++) {
			var aString = mergedStringsList[i];
			var correspondingIdList = mergedIdList[i];
			var idListResult = "[ ";
			for (var j = 0; j < correspondingIdList.length; j++) {
				idListResult = idListResult + correspondingIdList[j].toString();
				idListResult = idListResult + ", ";
			}
			idListResult = idListResult.substring(0, idListResult.length - 2);
			idListResult = idListResult + " ]";
			if (correspondingIdList.length > 1)
				dictionary.push(aString + " (" + correspondingIdList.length + ")");
			else
				dictionary.push(aString);
			entryNames.push(aString);
		}
	}

	searchMenu.setup = function () {
		// clear dictionary;
		dictionary = [];
		searchLineEdit = d3.select("#search-input-text");
		dropDownContainer = d3.select("#searchEntryContainer");
		searchLineEdit.on("input", userInput);
		searchLineEdit.on("keydown", userNavigation);
		searchLineEdit.on("click", toggleSearchEntryView);
		searchLineEdit.on("mouseover", hoverSearchEntryView);
	};

	function hoverSearchEntryView() {
		searchMenu.showSearchEntries();
	}

	function toggleSearchEntryView() {
		if (viewStatusOfSearchEntries) {
			searchMenu.hideSearchEntries();
		} else {
			searchMenu.showSearchEntries();
		}
	}

	searchMenu.hideSearchEntries = function () {
		dropDownContainer.style("display", "none");
		viewStatusOfSearchEntries = false;
	};

	searchMenu.showSearchEntries = function () {
		dropDownContainer.style("display", "block");
		viewStatusOfSearchEntries = true;
	};

	function userNavigation() {
		if (dictionaryUpdateRequired) {
			updateSearchDictionary();
		}

		var htmlCollection = dropDownContainer.node().children;
		var numEntries = htmlCollection.length;
		if (numEntries === 0)
			return;

		var move = 0;
		var i;
		var selectedEntry = -1;
		for (i = 0; i < numEntries; i++) {
			var atr = htmlCollection[i].getAttribute('class');
			if (atr === "dbEntrySelected") {
				selectedEntry = i;
			}
		}
		if (d3.event.keyCode === 13) {
			if (selectedEntry >= 0 && selectedEntry < numEntries) {
				// simulate onClick event
				htmlCollection[selectedEntry].onclick();
				searchMenu.hideSearchEntries();
			}
		}
		if (d3.event.keyCode === 38) {
			move = -1;
			searchMenu.showSearchEntries();
		}
		if (d3.event.keyCode === 40) {
			move = +1;
			searchMenu.showSearchEntries();
		}

		var newSelection = selectedEntry + move;
		if (newSelection !== selectedEntry) {
			if (newSelection < 0 && selectedEntry <= 0) {
				htmlCollection[0].setAttribute('class', "dbEntrySelected");
			}

			if (newSelection >= numEntries) {
				htmlCollection[selectedEntry].setAttribute('class', "dbEntrySelected");
			}
			if (newSelection >= 0 && newSelection < numEntries) {
				htmlCollection[newSelection].setAttribute('class', "dbEntrySelected");
				if (selectedEntry >= 0)
					htmlCollection[selectedEntry].setAttribute('class', "dbEntry");
			}
		}
	}

	function handleAutoCompletion() {
		/**  pre condition: autoCompletion has already a valid text**/
		var htmlCollection;
		var numEntries;
		inputText = searchLineEdit.node().value;
		var results = [];
		var resultID = [];
		var i;
		var lc_text = inputText.toLowerCase();
		var token;

		for (i = 0; i < dictionary.length; i++) {
			token = dictionary[i].toLowerCase();
			if (token.indexOf(lc_text) > -1) {
				results.push(dictionary[i]);
				resultID.push(i);
			}
		}

		// update the entries in the gui
		htmlCollection = dropDownContainer.node().children;
		numEntries = htmlCollection.length;
		for (i = 0; i < numEntries; i++)
			htmlCollection[0].remove();


		// reorder the results and its ids
		//******************************************
		// create a copy of results;;
		var copyRes = results;
		numEntries = results.length;
		if (numEntries > maxEntries)
			numEntries = maxEntries;


		var newResults = [];
		var newResultsIds = [];

		for (i = 0; i < numEntries; i++) {
			// search for the best entry
			var indexElement = 100000;
			var lengthElement = 10000;
			var bestElement = -1;
			for (var j = 0; j < copyRes.length; j++) {
				token = copyRes[j].toLowerCase();
				var tIe = token.indexOf(lc_text);
				var tLe = token.length;
				if (tIe > -1 && tIe <= indexElement && tLe <= lengthElement) {
					bestElement = j;
					indexElement = tIe;
					lengthElement = tLe;
				}

			}
			newResults.push(copyRes[bestElement]);
			newResultsIds.push(resultID[bestElement]);
			copyRes[bestElement] = "";
		}

		// add the results to the entry menu
		//******************************************
		numEntries = results.length;
		if (numEntries > maxEntries)
			numEntries = maxEntries;

		for (i = 0; i < numEntries; i++) {
			//add results to the dropdown menu
			var testEntry = document.createElement('li');
			testEntry.setAttribute('elementID', newResultsIds[i]);
			testEntry.onclick= function () {
				var id = this.getAttribute("elementId");
				var correspondingIds = mergedIdList[id];

				// autoComplete the text for the user
				var autoComStr = entryNames[id];
				searchLineEdit.node().value = autoComStr;

				graph.resetSearchHighlight();
				graph.highLightNodes(correspondingIds);

				if (autoComStr !== inputText) {
					handleAutoCompletion();
				}
				searchMenu.hideSearchEntries();
			};
			testEntry.setAttribute('class', "dbEntry");
			var createAText = document.createTextNode(newResults[i]);
			testEntry.appendChild(createAText);
			dropDownContainer.node().appendChild(testEntry);
		}
	}



	function userInput() {
		if (dictionaryUpdateRequired) {
			updateSearchDictionary();
		}
		graph.resetSearchHighlight();
		if (dictionary.length === 0) {
			console.log("dictionary is empty");
			return;
		}
		var i;
		var htmlCollection = dropDownContainer.node().children;
		var numEntries = htmlCollection.length;
		var inputText = searchLineEdit.node().value;
		if (inputText.length === 0) {
			for (i = 0; i < numEntries; i++)
				htmlCollection[0].remove();
			return;
		}
		// search in list
		var results = [];
		var resultID = [];

		var lc_text = inputText.toLowerCase();
		var token;

		for (i = 0; i < dictionary.length; i++) {
			token = dictionary[i].toLowerCase();
			if (token.indexOf(lc_text) > -1) {
				results.push(dictionary[i]);
				resultID.push(i);
			}
		}

		//clear the list;
		htmlCollection = dropDownContainer.node().children;
		numEntries = htmlCollection.length;
		for (i = 0; i < numEntries; i++)
			htmlCollection[0].remove();

		// reorder the results and its ids
		//******************************************
		// create a copy of results;;
		var copyRes = results;
		numEntries = results.length;
		if (numEntries > maxEntries)
			numEntries = maxEntries;


		var newResults = [];
		var newResultsIds = [];

		for (i = 0; i < numEntries; i++) {
			// search for the best entry
			var indexElement = 100000;
			var lengthElement = 10000;
			var bestElement = -1;
			for (var j = 0; j < copyRes.length; j++) {
				token = copyRes[j].toLowerCase();
				var tIe = token.indexOf(lc_text);
				var tLe = token.length;
				if (tIe > -1 && tIe <= indexElement && tLe <= lengthElement) {
					bestElement = j;
					indexElement = tIe;
					lengthElement = tLe;
				}
			}
			newResults.push(copyRes[bestElement]);
			newResultsIds.push(resultID[bestElement]);
			copyRes[bestElement] = "";
		}



		/*jshint loopfunc:true */
		//******************************************
		for (i = 0; i < numEntries; i++) {
			//add results to the dropdown menu
			var testEntry;
			testEntry= document.createElement('li');
			testEntry.setAttribute('elementID', newResultsIds[i]);
			testEntry.setAttribute('class', "dbEntry");
			testEntry.onclick= function () {
				var id = this.getAttribute("elementId");
				var correspondingIds = mergedIdList[id];

				// autoComplete the text for the user
				var autoComStr = entryNames[id];
				searchLineEdit.node().value = autoComStr;

				graph.resetSearchHighlight();
				graph.highLightNodes(correspondingIds);

				if (autoComStr !== inputText) {
					handleAutoCompletion();
				}
				searchMenu.hideSearchEntries();
			};
			var createAText = document.createTextNode(newResults[i]);
			testEntry.appendChild(createAText);
			dropDownContainer.node().appendChild(testEntry);
		}
		searchMenu.showSearchEntries();
	}
	return searchMenu;
};
