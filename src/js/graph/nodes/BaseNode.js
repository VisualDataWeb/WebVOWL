webvowl.nodes.BaseNode = (function () {

	// Constructor, private variables and privileged methods
	var base = function () {
		var that = this,
		// Basic attributes
			complement,
			equivalent,
			id,
			instances,
			intersection,
			label,
			type,
			union,
			uri,
		// Additional attributes
			comment,
			disjointWith,
			equivalentBase,
		// Style attributes
			focused = false,
			indication,
			mouseEntered = false,
			styleClass,
			textAttribute,
			visible = true,
		// Fixed Location attributes
			locked = false,
			frozen = false,
			pinned = false,
		// Element containers
			nodeElement;


		// Properties
		this.comment = function (p) {
			if (!arguments.length) return comment;
			comment = p;
			return this;
		};

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

		this.equivalent = function (p) {
			if (!arguments.length) return equivalent;
			equivalent = p;
			return this;
		};

		this.equivalentBase = function (p) {
			if (!arguments.length) return equivalentBase;
			equivalentBase = p;
			return this;
		};

		this.focused = function (p) {
			if (!arguments.length) return focused;
			focused = p;
			return this;
		};

		this.id = function (p) {
			if (!arguments.length) return id;
			id = p;
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

		this.label = function (p) {
			if (!arguments.length) return label;
			label = p;
			return this;
		};

		this.mouseEntered = function (p) {
			if (!arguments.length) return mouseEntered;
			mouseEntered = p;
			return this;
		};

		this.nodeElement = function (p) {
			if (!arguments.length) return nodeElement;
			nodeElement = p;
			return this;
		};

		this.styleClass = function (p) {
			if (!arguments.length) return styleClass;
			styleClass = p;
			return this;
		};

		this.textAttribute = function (p) {
			if (!arguments.length) return textAttribute;
			textAttribute = p;
			return this;
		};

		this.type = function (p) {
			if (!arguments.length) return type;
			type = p;
			return this;
		};

		this.union = function (p) {
			if (!arguments.length) return union;
			union = p;
			return this;
		};

		this.uri = function (p) {
			if (!arguments.length) return uri;
			uri = p;
			return this;
		};

		this.visible = function (p) {
			if (!arguments.length) return visible;
			visible = p;
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