// after jQuery loaded
$(document).ready(function() {

	// constants
	var constants = {
		notes: 14,
		cookieOptions: { expires: 30 },
		computed: {}
	};
	// defaults
	var defaults = {
		movement: 'left-to-right',
		stripes: 15,
		speed: 20,
		stripeColor: '#999',
		backgroundColor: '#CCC',
		metronome: 'off',
		frequency: 0.05,
		stopAfter: '',
		fullscreen: 'on',
		framesPerSecond: 120
	};
	// settings
	var settings = {
		isFullscreen: function() {
			return (document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement);
		},
		isFullscreenAvailable: function() {
			return (canvas.requestFullscreen || canvas.webkitRequestFullScreen || canvas.mozRequestFullScreen || canvas.msRequestFullscreen);
		},
		canvasSize: function() {
			return (settings.computed.isMovementHorizontal ? canvas.width : canvas.height);
		},
		computed: {} // computed settings placeholder (allows calling frequently without recalculating)
	};
	// runtime/state variables
	var runtime = {
		// frame rate variables
		timeLastFrameDrawn: null,
		timeSinceLastFrameDrawn: null,
		stripeOffsetActual: 0,
		stripeOffsetRounded: 0,
		lastStripeOffsetRounded: 0,
		playNoteHandle: null,
		previousNoteIndex: 0,
		currentNoteIndex: 0,
		isDrawing: false,
		isPlaying: false,
		stopAfterHandle: null
	};
	
	// compute constants
	constants.computed.noteElements = {};
	$('audio[data-note]').each(function() {
		var $this = $(this);
		constants.computed.noteElements[$this.attr('data-note')] = $this[0];
	});
	// add cookie support to constants
	Cookies.set('testCookieSupport', 'yes') // set test cookie
	if (Cookies.get('testCookieSupport') == 'yes') { // try to read test cookie
		// if support exists, set on
		constants.computed.cookieSupport = true;
		Cookies.remove('testCookieSupport'); // remove test cookie
	} else {
		// if support does not exist, set off
		constants.computed.cookieSupport = false;
	}
	
	// canvas and context
	var canvas = document.getElementById('app-canvas');
	var context = canvas.getContext('2d');
	
	// call resize
	resizeCanvas();
	// check if fullscreen is available
	if (!settings.isFullscreenAvailable()) {
		// if no, remove fullscreen option
		defaults.fullscreen = 'off';
		$('#settings-fullscreen').val('off');
		$('#settings-fullscreen option[value=off]').html('Off - Not available in this browser');
		$('#settings-fullscreen').prop('disabled', true);
	}

	// popup explanations
	$('a[data-popup]').on('click', function() {
		var $this = $(this);
		// set title
		$('#modal-popup .modal-title').html($this.parent().html().replace(/(<([^>]+)>)/ig, '').replace('(?)', '')); // strip tags and link
		// set text
		$('#modal-popup .modal-body p').html($this.attr('data-popup'));
		// show modal
		$('#modal-popup').modal();
		return false;
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
	
	// settings run button
	$('#settings-run-button').on('click', function() {
		// save settings
		settings.movement = $('#settings-movement').val();
		settings.stripes = parseInt($('#settings-stripes').val());
		settings.speed = parseInt($('#settings-speed').val());
		settings.stripeColor = $('#settings-color-stripe').spectrum('get').toHexString();
		settings.backgroundColor = $('#settings-color-background').spectrum('get').toHexString();
		settings.metronome = ($('#settings-metronome').val() == 'on');
		settings.frequency = parseFloat($('#settings-frequency').val());
		settings.stopAfter = parseInt($('#settings-stop-after').val());
		settings.fullscreen = ($('#settings-fullscreen').val() == 'on');
		// update saved settings
		updateSavedSettings();
		// compute settings
		computeSettings();
		// apply settings
		runtime.stripeOffsetActual = 0;
		runtime.stripeOffsetRounded = 0;
		runtime.lastStripeOffsetRounded = -1;
		// enable metronome if on
		if (settings.metronome) {
			// set note handle
			runtime.playNoteHandle = setInterval(playNextNote, settings.computed.noteSeconds * 1000);
			// reset note indexes
			runtime.currentNoteIndex = 0;
			runtime.previousNoteIndex = -1;
			// set playing
			runtime.isPlaying = true;
			// loop through all audio
			for (var note in constants.computed.noteElements) {
				// quickly toggle each on and off
				var noteElement = constants.computed.noteElements[note];
				noteElement.play();
				noteElement.pause();
			}
		}
		// set stop after
		if (settings.stopAfter > 0) {
			runtime.stopAfterHandle = setTimeout(returnToSettings, settings.stopAfter * 1000);
		}
		// start fullscreen if available
		if (settings.isFullscreenAvailable() && settings.fullscreen) {
			if (canvas.requestFullScreen) {
				canvas.requestFullScreen();
			} else if (canvas.webkitRequestFullScreen) {
				canvas.webkitRequestFullScreen();
			} else if (canvas.mozRequestFullScreen) {
				canvas.mozRequestFullScreen(); 
			} else if (canvas.msRequestFullscreen) {
				canvas.msRequestFullscreen();
			}
		}
		// hide settings panel
		$('.container').hide();
		// show app panel
		$('#app-panel').show();
		// scroll to top
		scrollToTop();
		// start first animation frame
		runtime.isDrawing = true;
		window.requestAnimationFrame(drawCanvasFrame);
		// play first note if metronome is on
		if (settings.metronome) {
			playNextNote();
		}
	});

	// settings reset button
	$('#settings-reset-button').on('click', function() {
		// reset defaults
		resetDefaults();
		// update saved settings
		updateSavedSettings();
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
	
	// resize canvas to full screen
	function resizeCanvas() {
		// get window size
		var windowWidth = $(window).innerWidth();
		var windowHeight = $(window).innerHeight();
		// track if changed
		var hasChanged = false;
		if (canvas.width != windowWidth) {
			// update width on change
			canvas.setAttribute('width', parseInt(windowWidth));
			hasChanged = true;
		}
		if (canvas.height != windowHeight) {
			// update height on change
			hasChanged = true;
			canvas.setAttribute('height', parseInt(windowHeight));
		}
		// clear computed settings on change
		if (hasChanged) {
			computeSettings();
		}
	}
	$(window).on('resize', resizeCanvas);
	
	// when metronome changed
	$('#settings-metronome').on('change', function() {
		var $this = $(this);
		// enable or disable frequency based on whether metronome is on
		$('#settings-frequency').prop('disabled', ($this.val() != 'on'));
	});

	// when fullscreen changed
	$(document).bind('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
		// check if fullscreen turned off and app running
		if (!settings.isFullscreen() && $('#app-panel').is(':visible')) {
			// if yes, return to settings
			returnToSettings();
		}
	});
	
	// enforce integer-only inputs
	$('.integers-only').on('blur', function() {
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
		if ($this.attr('id') == 'settings-stop-after' && cleanVal == 0) {
			cleanVal = '';
		}
		if (cleanVal != $this.val()) {
			$this.val(cleanVal);
		}
	});
	
	// enforce decimals-only inputs
	$('.decimals-only').on('blur', function() {
		var $this = $(this);
		var cleanVal = $this.val().replace(/[^0-9\.]/g, '');
		if (!$.isNumeric(cleanVal)) {
			cleanVal = 0;
		}
		if (!cleanVal) {
			switch ($this.attr('id')) {
				case 'settings-frequency':
					cleanVal = defaults.frequency;
					break;
			}
		}
		if (cleanVal != $this.val()) {
			$this.val(cleanVal);
			return false;
		}
	});
	
	// on frequency update
	$('#settings-frequency').on('keydown blur', function(e) {
		var $this = $(this);
		var val = parseFloat($this.val());
		// only enforce on blur
		if (e.type == 'blur') {
			// require 1 or less
			if (val > 1.0) {
				$this.val('1');
			}
			// do not allow 0
			else if (val == 0) {
				$this.val(defaults.frequency);
			}
		}
		$('#settings-frequency-explanation').html(Math.round(1.0 / parseFloat($this.val()), 5));
	});
	
	// draw canvas frame
	function drawCanvasFrame() {
		// draw using framerate
		var timeNow = Date.now();
		runtime.timeSinceLastFrameDrawn = timeNow - runtime.timeLastFrameDrawn;
		if (runtime.timeSinceLastFrameDrawn > settings.computed.msPerFrame) {
			runtime.timeLastFrameDrawn = timeNow - (runtime.timeSinceLastFrameDrawn % settings.computed.msPerFrame);
			// only draw if animation has moved
			if (runtime.lastStripeOffsetRounded != runtime.stripeOffsetRounded) {
				// stop drawing
				context.save();
				// clear frame
				context.clearRect(0, 0, canvas.width, canvas.height);
				// draw stripes
				context.fillStyle = settings.stripeColor;
				for (var barPixelCoord = -settings.computed.stripeSize * 4 + runtime.stripeOffsetRounded; barPixelCoord < settings.canvasSize() + settings.computed.stripeSize * 2; barPixelCoord += settings.computed.stripeSize * 2) {
					if (settings.computed.isMovementHorizontal) {
						context.fillRect(barPixelCoord + runtime.stripeOffsetRounded, 0, settings.computed.stripeSize, canvas.height);
					} else {
						context.fillRect(0, barPixelCoord + runtime.stripeOffsetRounded, canvas.width, settings.computed.stripeSize);
					}
				}
				// draw background
				context.fillStyle = settings.backgroundColor;
				for (var barPixelCoord = -settings.computed.stripeSize * 3 + runtime.stripeOffsetRounded; barPixelCoord < settings.canvasSize() + settings.computed.stripeSize * 2; barPixelCoord += settings.computed.stripeSize * 2) {
					if (settings.computed.isMovementHorizontal) {
						context.fillRect(barPixelCoord + runtime.stripeOffsetRounded, 0, settings.computed.stripeSize, canvas.height);
					} else {
						context.fillRect(0, barPixelCoord + runtime.stripeOffsetRounded, canvas.width, settings.computed.stripeSize);
					}
				}
				// resume drawing
				context.restore();
			}
			// move
			if (settings.computed.isMovementForward) {
				runtime.stripeOffsetActual += settings.computed.movePixelsPerFrame;
				if (runtime.stripeOffsetActual >= settings.computed.stripeSize * 2) {
					runtime.stripeOffsetActual = 0;
				}
			} else {
				runtime.stripeOffsetActual -= settings.computed.movePixelsPerFrame;
				if (runtime.stripeOffsetActual <= -settings.computed.stripeSize * 2) {
					runtime.stripeOffsetActual = 0;
				}
			}
			// update last
			runtime.lastStripeOffsetRounded = runtime.stripeOffsetRounded;
			// round
			runtime.stripeOffsetRounded = Math.round(runtime.stripeOffsetActual * 2) / 2;
		}
		// continue to next animation frame if drawing
		if (runtime.isDrawing) {
			window.requestAnimationFrame(drawCanvasFrame);
		}
	}
	
	// restore default settings on load
	resetDefaults();
	// attempt to load saved settings if they exist
	restoreSavedSettings();
	
	// helper functions

	// scroll to top smoothly
	function scrollToTop() {
		$('html,body').animate({ scrollTop: 0 }, 'fast');
	}
	
	// re-compute settings
	function computeSettings() {
		settings.computed = {};
		settings.computed.isMovementHorizontal = (settings.movement == 'left-to-right' || settings.movement == 'right-to-left');
		settings.computed.isMovementForward = (settings.movement == 'left-to-right' || settings.movement == 'top-to-bottom');
		settings.computed.msPerFrame = (1000 / defaults.framesPerSecond);
		settings.computed.stripeSize = (settings.canvasSize() / settings.stripes);
		settings.computed.movePixelsPerFrame = (settings.canvasSize() / (settings.speed * defaults.framesPerSecond));
		settings.computed.noteSeconds = (1.0 / settings.frequency) / parseFloat(constants.notes);
		settings.computed.scaleSeconds = (1.0 / settings.frequency);
	}
	
	// update saved settings
	function updateSavedSettings() {
		setSavedSetting('mdds.app.settings.movement', $('#settings-movement').val());
		setSavedSetting('mdds.app.settings.stripes', $('#settings-stripes').val());
		setSavedSetting('mdds.app.settings.speed', $('#settings-speed').val());
		setSavedSetting('mdds.app.settings.metronome', $('#settings-metronome').val());
		setSavedSetting('mdds.app.settings.frequency', $('#settings-frequency').val());
		setSavedSetting('mdds.app.settings.stopAfter', $('#settings-stop-after').val());
		setSavedSetting('mdds.app.settings.fullscreen', $('#settings-fullscreen').val());
		setSavedSetting('mdds.app.settings.stripeColor', $('#settings-color-stripe').spectrum('get').toHexString());
		setSavedSetting('mdds.app.settings.backgroundColor', $('#settings-color-background').spectrum('get').toHexString());
	}
	
	// restore saved settings
	function restoreSavedSettings() {
		if (getSavedSetting('mdds.app.settings.movement')) {
			$('#settings-movement').val(getSavedSetting('mdds.app.settings.movement'));
		}
		if (getSavedSetting('mdds.app.settings.stripes')) {
			$('#settings-stripes').val(getSavedSetting('mdds.app.settings.stripes'));
		}
		if (getSavedSetting('mdds.app.settings.speed')) {
			$('#settings-speed').val(getSavedSetting('mdds.app.settings.speed'));
		}
		if (getSavedSetting('mdds.app.settings.metronome')) {
			$('#settings-metronome').val(getSavedSetting('mdds.app.settings.metronome'));
		}
		if (getSavedSetting('mdds.app.settings.frequency')) {
			$('#settings-frequency').val(getSavedSetting('mdds.app.settings.frequency'));
		}
		if (getSavedSetting('mdds.app.settings.stopAfter')) {
			$('#settings-stop-after').val(getSavedSetting('mdds.app.settings.stopAfter'));
		}
		if (getSavedSetting('mdds.app.settings.fullscreen')) {
			$('#settings-fullscreen').val(getSavedSetting('mdds.app.settings.fullscreen'));
		}
		if (getSavedSetting('mdds.app.settings.stripeColor')) {
			$('#settings-color-stripe').spectrum({
				color: getSavedSetting('mdds.app.settings.stripeColor')
			});
		}
		if (getSavedSetting('mdds.app.settings.backgroundColor')) {
			$('#settings-color-background').spectrum({
				color: getSavedSetting('mdds.app.settings.backgroundColor')
			});
		}
		// update dependent settings elements
		updateDependentSettingsElements();
	}
	
	// get saved setting
	function getSavedSetting(name) {
		// check if cookies are supported
		if (constants.computed.cookieSupport) {
			// if yes, read and return cookie value
			return Cookies.get(name);
		} else {
			// if no, read and return local storage value
			return localStorage.getItem(name);
		}
	}

	// set saved setting
	function setSavedSetting(name, value) {
		// check if cookies are supported
		if (constants.computed.cookieSupport) {
			// if yes, set cookie value
			Cookies.set(name, value, constants.cookieOptions);
		} else {
			// if no, set local storage value
			localStorage.setItem(name, value);
		}
	}
	
	// reset defaults
	function resetDefaults() {
		// inputs
		$('#settings-movement').val(defaults.movement);
		$('#settings-stripes').val(defaults.stripes);
		$('#settings-speed').val(defaults.speed);
		$('#settings-metronome').val(defaults.metronome);
		$('#settings-frequency').val(defaults.frequency);
		$('#settings-stop-after').val(defaults.stopAfter);
		$('#settings-fullscreen').val(defaults.fullscreen);
		// color pickers
		$('#settings-color-stripe').spectrum({
			color: defaults.stripeColor
		});
		$('#settings-color-background').spectrum({
			color: defaults.backgroundColor
		});
		// update dependent settings elements
		updateDependentSettingsElements();
	}

	// update dependent settings elements
	function updateDependentSettingsElements() {
		$('#settings-metronome').trigger('change');
		$('#settings-frequency').trigger('blur');
	}
	
	// exit app and return to settings
	function returnToSettings() {
		// clear stop after handle if it exists
		if (runtime.stopAfterHandle !== null) {
			clearTimeout(runtime.stopAfterHandle);
			runtime.stopAfterHandle = null;
		}
		// check if fullscreen
		if (settings.isFullscreenAvailable() && settings.isFullscreen()) {
			// if yes, stop fullscreen
			if (document.fullScreenElement) {
				document.cancelFullScreen();
			} else if (document.webkitIsFullScreen) {
				document.webkitCancelFullScreen();
			} else if (document.mozFullScreen) {
				document.mozCancelFullScreen(); 
			} else if (document.msFullscreenElement) {
				document.msExitFullscreen();
			}
		}
		// disable metronome if set
		if (settings.metronome) {
			// clear play note handle
			clearInterval(runtime.playNoteHandle);
			runtime.playNoteHandle = null;
		}
		// unset drawing
		runtime.isDrawing = false;
		// unset playing
		runtime.isPlaying = false;
		// hide app panel
		$('#app-panel').hide();
		// show settings panel
		$('.container').show();
		// scroll to top
		scrollToTop();
	}
	
	// play next note
	function playNextNote() {
		// stop previous note and rewind if playing
		var previousNote = noteForIndex(runtime.previousNoteIndex);
		if (previousNote) {
			var previousNoteElement = constants.computed.noteElements[previousNote];
			previousNoteElement.pause();
			previousNoteElement.currentTime = 0;
		}
		// reset and play current note
		var currentNote = noteForIndex(runtime.currentNoteIndex);
		var currentNoteElement = constants.computed.noteElements[currentNote];
		currentNoteElement.play();
		// update previous note index
		runtime.previousNoteIndex = runtime.currentNoteIndex;
		// increment note index
		runtime.currentNoteIndex++;
		if (runtime.currentNoteIndex == constants.notes) {
			runtime.currentNoteIndex = 0;
		}
	}
	
	// get note based on index
	function noteForIndex(noteIndex) {
		// write out each note for clarity
		switch (noteIndex) {
			case 0:
				return 'c1';
			case 1:
				return 'd1';
			case 2:
				return 'e1';
			case 3:
				return 'f1';
			case 4:
				return 'g1';
			case 5:
				return 'a1';
			case 6:
				return 'b1';
			case 7:
				return 'c2';
			case 8:
				return 'b1';
			case 9:
				return 'a1';
			case 10:
				return 'g1';
			case 11:
				return 'f1';
			case 12:
				return 'e1';
			case 13:
				return 'd1';
			default:
				return null;
		}
	}
	
});