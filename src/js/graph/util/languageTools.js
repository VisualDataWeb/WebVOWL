/**
 * Encapsulates methods which return a label in a specific language for a preferred language.
 */
webvowl.util.languageTools = (function () {

	var languageTools = {};


	languageTools.textForCurrentLanguage = function (textObject, preferredLanguage) {
		if (typeof textObject === "string") {
			return textObject;
		}

		if (textObject.hasOwnProperty(preferredLanguage)) {
			return textObject[preferredLanguage];
		}

		for (var language in textObject) {
			if (textObject.hasOwnProperty(language) && language !== "default") {
				return textObject[language];
			}
		}

		return textObject["default"];
	};


	return function () {
		/* Use a function here to keep a consistent style like webvowl.path.to.module()
		 * despite having just a single languageTools object. */
		return languageTools;
	};
})();
