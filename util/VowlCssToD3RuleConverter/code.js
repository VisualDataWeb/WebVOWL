var css = require("css"),
	fs = require("fs"),
	filePath = "../../src/css/vowl.css";

fs.readFile(filePath, {encoding: "utf8"}, function (err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log("// inline vowl styles");
		console.log(convertCssToD3Rules(data));
		console.log("\n// remove inline vowl styles");
		console.log(createInlineStyleRemoveCommand(data));
	}
});

function createInlineStyleRemoveCommand(cssText) {
	var selectors = [],
		obj = css.parse(cssText),
		rules = obj.stylesheet.rules;

	rules.forEach(function (rule) {
		if (rule.type === "rule") {
			selectors = selectors.concat(rule.selectors);
		}
	});

	return "d3.selectAll(\"".concat(selectors.join(", "), "\").attr(\"style\", null);");
}

function convertCssToD3Rules(cssText) {
	var d3Rules = "",
		obj = css.parse(cssText),
		rules = obj.stylesheet.rules;


	rules.forEach(function (rule) {
		if (rule.type === "rule") {
			var builder = d3RuleBuilder(),
				selectors = rule.selectors,
				declarations = rule.declarations,
				declaration;

			builder.selectors(selectors);
			for (var i = 0, l = declarations.length; i < l; i++) {
				declaration = declarations[i];
				if (declaration.type === "declaration") {
					builder.addRule(declaration.property, declaration.value);
				}
			}

			d3Rules = d3Rules.concat(builder.build(), "\n");
		}
	});

	return d3Rules;
}

function d3RuleBuilder() {
	var builder = {},
		selector = "",
		rules = [];

	builder.selectors = function (selectors) {
		if (!arguments.length) return selector;

		if (selectors instanceof Array) {
			selector = selectors.join(", ");
		} else {
			selector = selectors;
		}

		return builder;
	};

	builder.addRule = function (name, value) {
		rules.push({name: name, value: value});
		return builder;
	};

	builder.build = function () {
		var result = "d3";

		result = result.concat(".selectAll(\"", selector, "\")");
		for (var i = 0, l = rules.length; i < l; i++) {
			var rule = rules[i];
			result = result.concat(".style(\"", rule.name, "\", \"", rule.value, "\")");
		}
		result = result.concat(";");

		return result;
	};

	return builder;
}