webvowl.nodes.BaseNode = (function () {

	// Constructor, private variables and privileged methods
	var base = function () {
		webvowl.BaseElement.call(this);

		var that = this,
		// Basic attributes
			complement,
			instances,
			intersection,
			union,
		// Additional attributes
			disjointWith,
		// Style attributes
			indication,
			textAttribute,
		// Fixed Location attributes
			locked = false,
			frozen = false,
			pinned = false,
		// Element containers
			nodeElement;


		// Properties
		this.complement = function (p) {
			if (!arguments.length) return complement;
			complement = p;
			return this;
		};

		this.disjointWith = function (p) {
			if (!arguments.length) return disjointWith;
			disjointWith = p;
			return this;
		};

		this.indication = function (p) {
			if (!arguments.length) return indication;
			indication = p;
			return this;
		};

		this.instances = function (p) {
			if (!arguments.length) return instances;
			instances = p;
			return this;
		};

		this.intersection = function (p) {
			if (!arguments.length) return intersection;
			intersection = p;
			return this;
		};

		this.nodeElement = function (p) {
			if (!arguments.length) return nodeElement;
			nodeElement = p;
			return this;
		};

		this.textAttribute = function (p) {
			if (!arguments.length) return textAttribute;
			textAttribute = p;
			return this;
		};

		this.union = function (p) {
			if (!arguments.length) return union;
			union = p;
			return this;
		};


		// Functions
		this.locked = function (p) {
			if (!arguments.length) return locked;
			locked = p;
			applyFixedLocationAttributes();
			return this;
		};

		this.frozen = function (p) {
			if (!arguments.length) return frozen;
			frozen = p;
			applyFixedLocationAttributes();
			return this;
		};

		this.pinned = function (p) {
			if (!arguments.length) return pinned;
			pinned = p;
			applyFixedLocationAttributes();
			return this;
		};

		function applyFixedLocationAttributes() {
			if (that.locked() || that.frozen() || that.pinned()) {
				that.fixed = true;
			} else {
				that.fixed = false;
			}
		}


		// Reused functions TODO refactor
		this.addMouseListeners = function () {
			// Empty node
			if (!that.nodeElement()) {
				console.warn(this);
				return;
			}

			that.nodeElement().selectAll("*")
				.on("mouseover", onMouseOver)
				.on("mouseout", onMouseOut);
		};

		function onMouseOver() {
			if (that.mouseEntered()) {
				return;
			}

			var selectedNode = that.nodeElement().node(),
				nodeContainer = selectedNode.parentNode;

			// Append hovered element as last child to the container list.
			nodeContainer.appendChild(selectedNode);

			that.nodeElement().selectAll("rect, circle:last-of-type").classed("hovered", true);

			that.mouseEntered(true);
		}

		function onMouseOut() {
			that.nodeElement().selectAll("rect, circle:last-of-type").classed("hovered", false);

			that.mouseEntered(false);
		}

	};

	base.prototype = Object.create(webvowl.BaseElement.prototype);
	base.prototype.constructor = base;

	// Define d3 properties
	Object.defineProperties(base, {
		"index": {writable: true},
		"x": {writable: true},
		"y": {writable: true},
		"px": {writable: true},
		"py": {writable: true},
		"fixed": {writable: true},
		"weight": {writable: true}
	});


	return base;
}());