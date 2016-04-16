// defaults
var defaults = {
	movement: 'left-to-right',
	stripes: 10,
	speed: 10,
	stripeColor: '#999',
	backgroundColor: '#FFF',
	stopAfter: 10,
	fullscreen: 'on'
}

// after jQuery loaded
$(document).ready(function() {

	// popup explanations
	$('a:not([data-popup=""])').on('click', function() {
		var $this = $(this);
		// set title
		$('#modal-popup .modal-title').html($this.parent().html().replace(/(<([^>]+)>)/ig, '').replace('(?)', '')); // strip tags and link
		// set text
		$('#modal-popup .modal-body p').html($this.attr('data-popup'));
		// show modal
		$('#modal-popup').modal();
		return false;
	});

	// defaults
	$('#settings-movement').val(defaults.movement);
	$('#settings-stripes').val(defaults.stripes);
	$('#settings-speed').val(defaults.speed);
	$('#settings-stop-after').val(defaults.stopAfter);
	$('#settings-fullscreen').val(defaults.fullscreen);
	
	// color pickers
	$('#settings-color-stripe').spectrum({
		color: defaults.stripeColor
	});
	$('#settings-color-background').spectrum({
		color: defaults.backgroundColor
	});

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
	
	// enforce integer-only inputs
	$('.integers-only').on('keydown blur', function() {
		var $this = $(this);
		var cleanVal = $this.val().replace(/[^0-9]/g, '');
		if (!cleanVal) {
			switch ($this.attr('id')) {
				case 'settings-movement':
					cleanVal = defaults.movement;
					break;
				case 'settings-stripes':
					cleanVal = defaults.stripes;
					break;
				case 'settings-speed':
					cleanVal = defaults.speed;
					break;
				case 'settings-stop-after':
					cleanVal = defaults.stopAfter;
					break;
				case 'settings-fullscreen':
					cleanVal = defaults.fullscreen;
					break;
			}
		}
		if (cleanVal != $this.val()) {
			$this.val(cleanVal);
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