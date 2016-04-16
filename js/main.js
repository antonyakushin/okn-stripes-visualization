// defaults
var defaults = {
	mainColor: '#999',
	altColor: '#FFF'
}

// after jQuery loaded
$(document).ready(function() {

	// set up elements
	$('#settings-colors-main').spectrum({
		color: defaults.mainColor
	});
	$('#settings-colors-alt').spectrum({
		color: defaults.altColor
	});

	// attach events to panel elements
	
	// disclaimer button
	$('#disclaimer-button').on('click', function() {
		// hide disclaimer panel
		$('#disclaimer-panel').hide();
		// show settings panel
		$('#settings-panel').show();
	});
	
	// settings button
	$('#settings-button').on('click', function() {
		// apply settings
		
		// TODO
		
		// hide settings panel
		$('#settings-panel').hide();
		// show app panel
		$('#app-panel').show();
		// run app
		
		// TODO
		
	});
	
	// app panel
	$('#app-panel').on('click', returnToSettings); // return to settings
	// keypress
	$(document).keyup(function(e) {
		// check if app panel is visible
		if ($('#app-panel').is(':visible')) {
			// if yes, return to settings
			returnToSettings();
		}
	});
	
	// helper functions

	// exit app and return to settings
	function returnToSettings() {
		// stop app
		
		// TODO
		
		// hide app panel
		$('#app-panel').hide();
		// show settings panel
		$('#settings-panel').show();
	}

});