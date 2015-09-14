module.exports = function (_property) {

	var label = {},
		property = _property;

	label.actualRadius = function () {
		return property.actualRadius();
	};

	label.draw = function (container) {
		return property.draw(container);
	};

	label.inverse = function () {
		return property ? property.inverse() : undefined;
	};

	label.property = function () {
		return property;
	};

	// Define d3 properties
	Object.defineProperties(label, {
		"index": {writable: true},
		"x": {writable: true},
		"y": {writable: true},
		"px": {writable: true},
		"py": {writable: true},
		"fixed": {writable: true},
		"weight": {writable: true}
	});


	return label;
};
