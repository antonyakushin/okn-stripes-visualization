// defaults
var defaults = {
	stripeColor: '#999',
	backgroundColor: '#FFF'
}

// after jQuery loaded
$(document).ready(function() {

	// popup explanations
	$('a:not([data-popup=""])').on('click', function() {
		$this = $(this);
		// set title
		$('#modal-popup .modal-title').html($this.parent().html().replace(/(<([^>]+)>)/ig, '').replace('(?)', '')); // strip tags and link
		// set text
		$('#modal-popup .modal-body p').html($this.attr('data-popup'));
		// show modal
		$('#modal-popup').modal();
		return false;
	});

	// set up elements
	$('#settings-color-stripe').spectrum({
		color: defaults.stripeColor
	});
	$('#settings-color-background').spectrum({
		color: defaults.backgroundColor
	});

	// attach events to panel elements
	
	// disclaimer button
	$('#disclaimer-button').on('click', function() {
		// hide disclaimer panel
		$('#disclaimer-panel').hide();
		// show settings panel
		$('#settings-panel').show();
		// scroll to top
		scrollToTop();
	});
	
	// settings button
	$('#settings-button').on('click', function() {
		// apply settings
		
		// TODO
		
		// hide settings panel
		$('.container').hide();
		// show app panel
		$('#app-panel').show();
		// scroll to top
		scrollToTop();
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

	// scroll to top smoothly
	function scrollToTop() {
		$('html,body').animate({ scrollTop: 0 }, 'fast');
	}
	
	// exit app and return to settings
	function returnToSettings() {
		// stop app
		
		// TODO
		
		// hide app panel
		$('#app-panel').hide();
		// show settings panel
		$('.container').show();
		// scroll to top
		scrollToTop();
	}

});