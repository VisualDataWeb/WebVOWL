/**
 * Stores the passed properties in links.
 * @returns {Function}
 */
webvowl.parsing.linkCreator = (function () {
	var linkCreator = {};

	/**
	 * Creates links from the passed properties.
	 * @param properties
	 */
	linkCreator.createLinks = function (properties) {
		var links = groupPropertiesToLinks(properties);

		gatherLinkInformation(links);

		return links;
	};

	/**
	 * Creates links of properties and - if existing - their inverses.
	 * @param properties the properties
	 * @returns {Array}
	 */
	function groupPropertiesToLinks(properties) {
		var links = [];

		properties.forEach(function (property) {
			property._addedToLink = false;
		});

		properties.forEach(function (property) {
			if (!property._addedToLink) {
				var link = webvowl.elements.link();
				link.property(property);
				link.domain(property.domain());
				link.range(property.range());

				property.link(link);
				property._addedToLink = true;

				var inverse = property.inverse();
				if (inverse) {
					link.inverse(inverse);
					inverse.link(link);
					inverse._addedToLink = true;
				}

				links.push(link);
			}
		});
		return links;
	}

	/**
	 * Adds more information like loop or link count to the passed links.
	 * @param links
	 */
	function gatherLinkInformation(links) {
		var i, // index
			l, // array length
			loop,
			layer;

		links.forEach(function (outer) {
			// Count loops
			if (typeof outer.loopCount() === "undefined") {
				var loops = [];
				links.forEach(function (inner) {
					if (outer.domain() === inner.domain() && outer.domain() === inner.range()) {
						loops.push(inner);
					}
				});

				for (i = 0, l = loops.length; i < l; ++i) {
					loop = loops[i];

					loop.loopIndex(i);
					loop.loopCount(l);
					loop.loops(loops);
				}
			}

			// Count overlaying links (loops are included)
			if (typeof outer.layerCount() === "undefined") {
				var layers = [];
				links.forEach(function (inner) {
					if (outer.domain() === inner.domain() && outer.range() === inner.range() ||
						outer.domain() === inner.range() && outer.range() === inner.domain()) {
						layers.push(inner);
					}
				});

				for (i = 0, l = layers.length; i < l; ++i) {
					layer = layers[i];

					layer.layerIndex(i);
					layer.layerCount(l);
					layer.layers(layers);
				}
			}
		});
	}


	return function () {
		// Return a function to keep module interfaces consistent
		return linkCreator;
	};
})();
