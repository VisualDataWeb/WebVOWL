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

		var textForLanguage = searchLanguage(textObject, "en");
		if (textForLanguage) {
			return textForLanguage;
		}
		textForLanguage = searchLanguage(textObject, "unset");
		if (textForLanguage) {
			return textForLanguage;
		}
		textForLanguage = searchLanguage(textObject, "iriBased");
		if (textForLanguage) {
			return textForLanguage;
		}

		return textObject["default"];
	};


	function searchLanguage (textObject, preferredLanguage) {
		for (var language in textObject) {
			if (language === preferredLanguage && textObject.hasOwnProperty(language)) {
				return textObject[language];
			}
		}
	}

	return function () {
		/* Use a function here to keep a consistent style like webvowl.path.to.module()
		 * despite having just a single languageTools object. */
		return languageTools;
	};
})();
