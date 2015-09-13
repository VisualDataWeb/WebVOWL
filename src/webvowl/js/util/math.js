var RoundNode = require("../elements/nodes/RoundNode.js");

/**
 * Contains a collection of mathematical functions with some additional data
 * used for WebVOWL.
 */
module.exports = (function () {

	var math = {},
		loopFunction = d3.svg.line()
			.x(function (d) {
				return d.x;
			})
			.y(function (d) {
				return d.y;
			})
			.interpolate("cardinal")
			.tension(-1);


	/**
	 * Calculates the normal vector of the path between the two nodes.
	 * @param source the first node
	 * @param target the second node
	 * @param length the length of the calculated normal vector
	 * @returns {{x: number, y: number}}
	 */
	math.calculateNormalVector = function (source, target, length) {
		var dx = target.x - source.x,
			dy = target.y - source.y,

			nx = -dy,
			ny = dx,

			vlength = Math.sqrt(nx * nx + ny * ny),
			ratio = length / vlength;

		return {"x": nx * ratio, "y": ny * ratio};
	};

	/**
	 * Calculates the path for a link, if it is a loop. Currently only working for circlular nodes.
	 * @param link the link
	 * @returns {*}
	 */
	math.calculateLoopPath = function (link) {
		var node = link.domain(),
			loopShiftAngle = 360 / link.loopCount(),
			loopAngle = Math.min(60, loopShiftAngle * 0.8),

			arcFrom = calculateRadian(loopShiftAngle * link.loopIndex()),
			arcTo = calculateRadian((loopShiftAngle * link.loopIndex()) + loopAngle),

			x1 = Math.cos(arcFrom) * node.actualRadius(),
			y1 = Math.sin(arcFrom) * node.actualRadius(),

			x2 = Math.cos(arcTo) * node.actualRadius(),
			y2 = Math.sin(arcTo) * node.actualRadius(),

			fixPoint1 = {"x": node.x + x1, "y": node.y + y1},
			fixPoint2 = {"x": node.x + x2, "y": node.y + y2},

			distanceMultiplier = 2.5,
			dx = ((x1 + x2) / 2) * distanceMultiplier,
			dy = ((y1 + y2) / 2) * distanceMultiplier,
			curvePoint = {"x": node.x + dx, "y": node.y + dy};

		return loopFunction([fixPoint1, curvePoint, fixPoint2]);
	};

	/**
	 * Calculates the radian of an angle.
	 * @param angle the angle
	 * @returns {number}
	 */
	function calculateRadian(angle) {
		angle = angle % 360;
		if (angle < 0) {
			angle = angle + 360;
		}
		var arc = (2 * Math.PI * angle) / 360;
		if (arc < 0) {
			arc = arc + (2 * Math.PI);
		}
		return arc;
	}

	/**
	 * Calculates the point where the link between the source and target node
	 * intersects the border of the target node.
	 * @param source the source node
	 * @param target the target node
	 * @param additionalDistance additional distance the
	 * @returns {{x: number, y: number}}
	 */
	math.calculateIntersection = function (source, target, additionalDistance) {
		var dx = target.x - source.x,
			dy = target.y - source.y,
			length = Math.sqrt(dx * dx + dy * dy);

		var innerDistance = target.distanceToBorder(dx, dy);

		var ratio = (length - (innerDistance + additionalDistance)) / length,
			x = dx * ratio + source.x,
			y = dy * ratio + source.y;

		return {x: x, y: y};
	};


	return function () {
		/* Use a function here to keep a consistent style like webvowl.path.to.module()
		 * despite having just a single math object. */
		return math;
	};
})();
