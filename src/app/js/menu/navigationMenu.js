/**
 * Contains the navigation "engine"
 *
 * @param graph the associated webvowl graph
 * @returns {{}}
 */
module.exports = function (graph) {
	var navigationMenu = {},
		allMenuEntries = [],
		visibleEntries = [],
		objectContainer = d3.select("#optionsMenu"),
		buttonLeft = d3.select("#LeftButton"),
		buttonRight = d3.select("#RightButton");

	navigationMenu.setup = function () {
		var objects = objectContainer.node().children;
		var i;
		for (i = 0; i < objects.length; i++) {
			allMenuEntries.push(objects[i]);
		}
		setupButtons();
		for (i = 0; i < allMenuEntries.length - 2; i++) {
			allMenuEntries[i].style.display = "block";
			visibleEntries[i] = 1;
		}
	};

	function setupButtons() {
		buttonLeft.on("mouseover", function () {
			var searchMenu = graph.options().searchMenu();
			searchMenu.hideSearchEntries();
		});
		buttonRight.on("mouseover", function () {
			var searchMenu = graph.options().searchMenu();
			searchMenu.hideSearchEntries();
		});

		buttonLeft.on("click", function () {
			var i;
			var currentTopValue;
			var objTopValue;
			if (visibleEntries[0] === 1) {
				return;
			} else {
				var elementToShow = visibleEntries.indexOf(1) - 1;
				var anchorLeft = visibleEntries.indexOf(1);
				for (i = anchorLeft + 1; i < visibleEntries.length; i++) {
					visibleEntries[i] = 0;
					allMenuEntries[i].style.display = "none";
				}
				visibleEntries[elementToShow] = 1;
				allMenuEntries[elementToShow].style.display = "block";
				// try to fill from right now;
				for (i = anchorLeft + 1; i < visibleEntries.length; i++) {
					visibleEntries[i] = 0;
					allMenuEntries[i].style.display = "block";
					currentTopValue = allMenuEntries[elementToShow].getBoundingClientRect().top;
					objTopValue = allMenuEntries[i].getBoundingClientRect().top;
					if (currentTopValue === objTopValue) {
						visibleEntries[i] = 1;
					} else {
						allMenuEntries[i].style.display = "none";
						visibleEntries[i] = 0;
						break;
					}
				}
			 	// repair if needed;
				checkArrowRequirement();

				var bothVisible=checkBothArrows();
				var lastIndex=visibleEntries.lastIndexOf(1);

				if (!bothVisible){
					// disable the last entry;
					visibleEntries[lastIndex]=0;
					allMenuEntries[lastIndex].style.display="none";
				}

				 	// try to fill from left ; now
				var anchorRight=visibleEntries.lastIndexOf(1);
				for (i=anchorRight-1;i>=0;i--){
					visibleEntries[i]=0;
					allMenuEntries[i].style.display="block";
					currentTopValue = allMenuEntries[elementToShow].getBoundingClientRect().top;
					objTopValue= allMenuEntries[i].getBoundingClientRect().top;
					if (currentTopValue===objTopValue){
						visibleEntries[i]=1;
					}else{
						allMenuEntries[i].style.display="none";
						visibleEntries[i]=0;
						break;
					}
				}
				// repair if needed;
				checkArrowRequirement();
				bothVisible=checkBothArrows();
				if (!bothVisible){
					// disable the last entry;
					lastIndex=visibleEntries.indexOf(1);
					if (lastIndex!==-1) {
						visibleEntries[lastIndex] = 0;
						allMenuEntries[lastIndex].style.display = "none";
					}
				}
				// todo: check why we need 3 times this;
				checkArrowRequirement();
				bothVisible=checkBothArrows();
				if (!bothVisible){
					// disable the last entry;
					lastIndex=visibleEntries.indexOf(1);
					if (lastIndex!==-1) {
						visibleEntries[lastIndex] = 0;
						allMenuEntries[lastIndex].style.display = "none";
					}
				}
				checkArrowRequirement();
				bothVisible=checkBothArrows();
				if (!bothVisible){
					// disable the last entry;
					lastIndex=visibleEntries.indexOf(1);
					if (lastIndex!==-1) {
						visibleEntries[lastIndex] = 0;
						allMenuEntries[lastIndex].style.display = "none";
					}
				}
				checkArrowRequirement();
			}
   		    setArrowHighlighting();
		});
		buttonRight.on("click", function () {
			// set the first 0 to zero;
			// check if last element is 1;
			if (visibleEntries[visibleEntries.length - 1] === 1) {
				return;
			} else {
				var elementToShow=visibleEntries.lastIndexOf(1)+1;

				var anchorRight=visibleEntries.lastIndexOf(1);
				// hide everything from anchorRight
				var i;
				for (i=anchorRight-1;i>=0;i--){
					visibleEntries[i]=0;
					allMenuEntries[i].style.display="none";
				}
				visibleEntries[elementToShow]=1;
				allMenuEntries[elementToShow].style.display="block";

				for (i=anchorRight-1;i>=0;i--){
					visibleEntries[i]=0;
					allMenuEntries[i].style.display="block";

					var currentTopValue = allMenuEntries[elementToShow].getBoundingClientRect().top;
					var objTopValue= allMenuEntries[i].getBoundingClientRect().top;
					if (currentTopValue===objTopValue){
						visibleEntries[i]=1;
					}else{
						allMenuEntries[i].style.display="none";
						visibleEntries[i]=0;
						break;
					}

				}
				// repair if needed;
				checkArrowRequirement();
				var bothVisible=checkBothArrows();
				if (!bothVisible){
					// disable the last entry;
					var lastIndex=visibleEntries.indexOf(1);
					if (lastIndex!==-1) {
						visibleEntries[lastIndex] = 0;
						allMenuEntries[lastIndex].style.display = "none";
					}
				}
			}
			setArrowHighlighting();
		});
	}


	navigationMenu.updateVisibilityStatus = function () {
		// assumptions:
		// about is always first element, we take its top pos
		// we neglect the last 2 value because it is the arrow object
		var i;
		var firstOne = visibleEntries.indexOf(1);
		if (firstOne===-1){
			fillFromBeginning();
			firstOne = visibleEntries.indexOf(1);
		}
		var currentTopValue = allMenuEntries[firstOne].getBoundingClientRect().top;
		var objTopValue;
		for (i = 0; i < allMenuEntries.length - 2; i++) {
			objTopValue = allMenuEntries[i].getBoundingClientRect().top;

			if (objTopValue === currentTopValue) {
				visibleEntries[i] = 1;
			} else {
				visibleEntries[i] = 0;
				allMenuEntries[i].style.display = "none";
			}
		}
		// get anchors;
		var anchorLeft=visibleEntries.indexOf(1);
		var anchorRight=visibleEntries.lastIndexOf(1);

		if (anchorLeft===-1 && anchorRight===-1){
			fillFromBeginning();
			anchorLeft=visibleEntries.indexOf(1);
			anchorRight=visibleEntries.lastIndexOf(1);
		}
		// try to add more entries;
		for (i = anchorLeft+1; i < allMenuEntries.length - 2; i++) {
			// enable the value;
			allMenuEntries[i].style.display="block";
			currentTopValue = allMenuEntries[anchorLeft].getBoundingClientRect().top;
			objTopValue= allMenuEntries[i].getBoundingClientRect().top;

			if (currentTopValue===objTopValue){
				visibleEntries[i]=1;
			}else{
				allMenuEntries[i].style.display="none";
				visibleEntries[i]=0;
				break;
			}
		}
		checkArrowRequirement();

		var bothVisible=checkBothArrows();
		var lastIndex;
		if (!bothVisible && anchorLeft===0){
			// disable the last entry;
			lastIndex=visibleEntries.lastIndexOf(1);
			if (lastIndex!==-1) {
				visibleEntries[lastIndex] = 0;
				allMenuEntries[lastIndex].style.display="none";
			}
		}

		if (anchorLeft!==0 || anchorRight!==visibleEntries.length){
			 //try to add elements to menu
			anchorRight=visibleEntries.lastIndexOf(1);

			if (anchorRight>=1){
				// hide everything from anchorRight
				for (i=anchorRight-1;i>=0;i--){
					visibleEntries[i]=0;
					allMenuEntries[i].style.display="none";
				}
				for (i=anchorRight-1;i>=0;i--) {
					visibleEntries[i] = 0;
					allMenuEntries[i].style.display = "block";

					currentTopValue = allMenuEntries[anchorRight].getBoundingClientRect().top;
					objTopValue = allMenuEntries[i].getBoundingClientRect().top;
					if (currentTopValue === objTopValue) {
						visibleEntries[i] = 1;
					} else {
						allMenuEntries[i].style.display = "none";
						visibleEntries[i] = 0;
						break;
					}
				}
			}
			// repair if needed;
			checkArrowRequirement();
			bothVisible=checkBothArrows();
			if (!bothVisible){
				// disable the last entry;
				lastIndex=visibleEntries.indexOf(1);
				if (lastIndex!==-1) {
					visibleEntries[lastIndex] = 0;
					allMenuEntries[lastIndex].style.display = "none";
				}
			}
		}
		// sanity check
		if (visibleEntries.indexOf(1)===-1){
			fillFromBeginning();
		}

		setArrowHighlighting();
	};

	function fillFromBeginning() {
		visibleEntries[0]=1;
		allMenuEntries[0].style.display="block";
	}

	function checkArrowRequirement(){
		// hides if not needed
		var leftArrowId = allMenuEntries.length - 2;
		var rightArrowId = allMenuEntries.length - 1;
		allMenuEntries[leftArrowId].style.display = "none";
		allMenuEntries[rightArrowId].style.display = "none";
		if (visibleEntries.indexOf(0) !== -1) {
			allMenuEntries[leftArrowId].style.display = "block";
			allMenuEntries[rightArrowId].style.display = "block";
		}
	}

	function checkBothArrows(){
		if (visibleEntries.indexOf(0) === -1) {
			return true; // no need to show them
		}
		var leftArrowId = allMenuEntries.length - 2;
		var rightArrowId = allMenuEntries.length - 1;
		var firstElement=visibleEntries.indexOf(1);
		if (firstElement===-1){
			fillFromBeginning(); // panic: no elements are visible
			firstElement=visibleEntries.indexOf(1);
		}

		var currentTopValue = allMenuEntries[firstElement].getBoundingClientRect().top;
		var leftTopValue= allMenuEntries[leftArrowId].getBoundingClientRect().top;
		var rightTopValue= allMenuEntries[rightArrowId].getBoundingClientRect().top;

		allMenuEntries[leftArrowId].style.display = "block";
		allMenuEntries[rightArrowId].style.display = "block";

		var bothVisible=false;
		if (currentTopValue===leftTopValue && currentTopValue === rightTopValue){
			bothVisible=true;
		}
		return bothVisible;
	}


	function setArrowHighlighting() {
		if (visibleEntries[visibleEntries.length - 1] !== 1) {
			buttonRight.classed("highlighted", true);
		} else {
			buttonRight.classed("highlighted", false);
		}
		if (visibleEntries[0] !== 1) {
			buttonLeft.classed("highlighted", true);
		} else {
			buttonLeft.classed("highlighted", false);
		}
	}

	return navigationMenu;
};
