// adapted version of this example: http://www.normansblog.de/simple-jquery-accordion/
$(document).ready(function () {
	var triggers = $(".accordion-trigger");
	triggers.not(".accordion-trigger-active").next(".accordion-container").hide();
	triggers.click(function () {
		var selectedTrigger = $(this),
			activeTriggers = $(".accordion-trigger-active");
		if (selectedTrigger.hasClass("accordion-trigger-active")) {
			selectedTrigger.next(".accordion-container").slideToggle("slow");
			selectedTrigger.removeClass("accordion-trigger-active");
		} else {
			activeTriggers.next(".accordion-container").slideToggle("slow");
			activeTriggers.removeClass("accordion-trigger-active");
			selectedTrigger.next(".accordion-container").slideToggle("slow");
			selectedTrigger.addClass("accordion-trigger-active");
		}
	});
});
