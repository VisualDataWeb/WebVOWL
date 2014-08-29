/**
 * Contains a collection of mathematical functions with some additional data
 * used for WebVOWL.
 */
webvowl.util.math = (function () {

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
	 * Calculates an additional point for the link path. This curve point
	 * will ensure, that no links overlap each other completely.
	 * @param linkStart the position where the link starts - might differ from link.source
	 * @param linkEnd the position where the link ends - might differ from link.target
	 * @param link the associated link
	 * @param linkDistanceMultiplier is multiplied with the default distance two parallel links
	 *                               have from each other
	 * @returns {{x: number, y: number}}
	 */
	math.calculateCurvePoint = function (linkStart, linkEnd, link, linkDistanceMultiplier) {
		var distance = calculateLayeredLinkDistance(link, linkDistanceMultiplier),

		// Find the center of the two points,
			dx = linkEnd.x - linkStart.x,
			dy = linkEnd.y - linkStart.y,

			cx = linkStart.x + dx / 2,
			cy = linkStart.y + dy / 2,

			n = math.calculateNormalVector(linkStart, linkEnd, distance);

		// Every second link shoud be drawn on the opposite of the center
		if (link.layerIndex() % 2 !== 0) {
			n.x = -n.x;
			n.y = -n.y;
		}

		/*
		 If there is a link from A to B, the normal vector will point to the left
		 in movement direction.
		 It there is a link from B to A, the normal vector should point to the right of his
		 own direction to not overlay the other link.
		 */
		if (link.domain().index < link.range().index) {
			n.x = -n.x;
			n.y = -n.y;
		}

		return {"x": cx + n.x, "y": cy + n.y};
	};

	/**
	 * Calculates the height of the layer of the passed link.
	 * @param link the associated link
	 * @param linkDistanceMultiplier is multplied with the default distance
	 * @returns {number}
	 */
	function calculateLayeredLinkDistance(link, linkDistanceMultiplier) {
		var level = Math.floor((link.layerIndex() - link.layerCount() % 2) / 2) + 1,
			distance = 0;
		switch (level) {
			case 1:
				distance = 20;
				break;
			case 2:
				distance = 45;
				break;
		}
		return distance * linkDistanceMultiplier;
	}

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

			x1 = Math.cos(arcFrom) * node.radius(),
			y1 = Math.sin(arcFrom) * node.radius(),

			x2 = Math.cos(arcTo) * node.radius(),
			y2 = Math.sin(arcTo) * node.radius(),

			fixPoint1 = {"x": node.x + x1, "y": node.y + y1},
			fixPoint2 = {"x": node.x + x2, "y": node.y + y2},

			distanceMultiplier = 2.5,
			dx = ((x1 + x2) / 2) * distanceMultiplier,
			dy = ((y1 + y2) / 2) * distanceMultiplier,
			curvePoint = {"x": node.x + dx, "y": node.y + dy};
		link.curvePoint(curvePoint);

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
			innerDistance;

		if (target instanceof webvowl.nodes.RoundNode) {
			innerDistance = target.radius();
		} else {
			var m_link = Math.abs(dy / dx),
				m_rect = target.height() / target.width();

			if (m_link <= m_rect) {
				var timesX = dx / (target.width() / 2),
					rectY = dy / timesX;
				innerDistance = Math.sqrt(Math.pow(target.width() / 2, 2) + Math.pow(rectY, 2));
			} else {
				var timesY = dy / (target.height() / 2),
					rectX = dx / timesY;
				innerDistance = Math.sqrt(Math.pow(target.height() / 2, 2) + Math.pow(rectX, 2));
			}
		}

		var length = Math.sqrt(dx * dx + dy * dy),
			ratio = (length - (innerDistance + additionalDistance)) / length,
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
