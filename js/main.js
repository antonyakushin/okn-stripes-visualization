$(document).ready(function() {

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
		// check if escape key and app panel is visible
		if (e.keyCode == 27 && $('#app-panel').is(':visible')) {
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