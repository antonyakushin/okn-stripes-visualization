// store elements as variables
var page = {
	disclaimer: {
		panel: document.getElementById('disclaimer-panel'),
		button: document.getElementById('disclaimer-button')
	},
	settings: {
		panel: document.getElementById('settings-panel'),
		button: document.getElementById('settings-button')
	},
	app: {
		panel: document.getElementById('app-panel'),
		canvas: document.getElementById('app-canvas'),
	}
}

// attach click events to panel buttons
page.disclaimer.button.onclick = function() {
	// hide disclaimer
	hideElement(page.disclaimer.panel);
	// show settings
	showElement(page.settings.panel);
}
page.settings.button.onclick = function() {
	// apply settings
	
	// TODO
	
	// hide settings
	hideElement(page.settings.panel);
	// show app
	showElement(page.app.panel);
	// run app
	
	// TODO
	
}
page.app.panel.onclick = returnToSettings;
document.onkeydown = function(event) {
	// get proper event
    event = event || window.event;
	// check if keycode is escape keycode and app is visible
    if (event.keyCode == 27 && isElementVisible(page.app.panel)) {
		// if yes, return to settings
        returnToSettings();
    }
};
// helper functions

// how or hide element
function showElement(element) {
	element.style.display = 'block';
}
function hideElement(element) {
	element.style.display = 'none';
}
function isElementVisible(element) {
	return (element.style.display == 'block');
}

// exit app and return to settings
function returnToSettings() {
	// stop app
	
	// TODO
	
	// hide app
	hideElement(page.app.panel);
	// show settings
	showElement(page.settings.panel);
}