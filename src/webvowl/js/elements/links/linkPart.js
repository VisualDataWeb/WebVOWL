/**
 * A linkPart reprents a link d3 can use.
 * @param _domain
 * @param _range
 * @param _link
 */
module.exports = function (_domain, _range, _link) {
	var linkPart = {},
		domain = _domain,
		link = _link,
		range = _range;

	// Define d3 properties
	Object.defineProperties(linkPart, {
		"source": {value: domain, writable: true},
		"target": {value: range, writable: true}
	});


	linkPart.domain = function () {
		return domain;
	};

	linkPart.link = function () {
		return link;
	};

	linkPart.range = function () {
		return range;
	};


	return linkPart;
};
