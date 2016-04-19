// after jQuery loaded
$(document).ready(function() {

	// defaults
	var defaults = {
		movement: 'left-to-right',
		stripes: 15,
		speed: 20,
		stripeColor: '#999',
		backgroundColor: '#CCC',
		stopAfter: '',
		fullscreen: 'on',
		framesPerSecond: 120
	}
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
	}
	// runtime/state variables
	var runtime = {
		// frame rate variables
		timeLastFrameDrawn: null,
		timeSinceLastFrameDrawn: null,
		stripeOffset: 0,
		isDrawing: false,
		stopAfterHandle: null
	}
	
	// canvas and context
	var canvas = document.getElementById('app-canvas');
	var $canvas = $('#app-canvas');
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

	// defaults
	resetDefaults();

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
		settings.stopAfter = parseInt($('#settings-stop-after').val());
		settings.fullscreen = ($('#settings-fullscreen').val() == 'on');
		// compute settings
		computeSettings();
		// apply settings
		if (settings.stopAfter > 0) {
			runtime.stopAfterHandle = setTimeout(returnToSettings, settings.stopAfter * 1000);
		}
		if (settings.isFullscreenAvailable() && settings.fullscreen) {
			// start fullscreen
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
	});
	
	// settings reset button
	$('#settings-reset-button').on('click', function() {
		resetDefaults();
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
			$canvas.css('width', windowWidth); // override css
			hasChanged = true;
		}
		if (canvas.height != windowHeight) {
			// update height on change
			hasChanged = true;
			$canvas.css('height', windowHeight); // override css
		}
		// clear computed settings on change
		if (hasChanged) {
			computeSettings();
		}
	}
	$(window).on('resize', resizeCanvas);

	// when fullscreen changed
	$(document).bind('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function() {
		// check if fullscreen turned off and app running
		if (!settings.isFullscreen() && $('#app-panel').is(':visible')) {
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
		if ($this.attr('id') == 'settings-stop-after' && cleanVal == 0) {
			cleanVal = '';
		}
		if (cleanVal != $this.val()) {
			$this.val(cleanVal);
		}
	});
	
	// draw canvas frame
	function drawCanvasFrame() {
		// draw using framerate
		var timeNow = Date.now();
		runtime.timeSinceLastFrameDrawn = timeNow - runtime.timeLastFrameDrawn;
		if (runtime.timeSinceLastFrameDrawn > settings.computed.msPerFrame) {
			runtime.timeLastFrameDrawn = timeNow - (runtime.timeSinceLastFrameDrawn % settings.computed.msPerFrame);
			// stop drawing
			context.save();
			// clear frame
			context.clearRect(0, 0, canvas.width, canvas.height);
			// draw stripes
			context.fillStyle = settings.stripeColor;
			for (var barPixelCoord = -settings.computed.stripeSize * 4 + runtime.stripeOffset; barPixelCoord < settings.canvasSize() + settings.computed.stripeSize * 2; barPixelCoord += settings.computed.stripeSize * 2) {
				if (settings.computed.isMovementHorizontal) {
					context.fillRect(barPixelCoord + runtime.stripeOffset, 0, settings.computed.stripeSize, canvas.height);
				} else {
					context.fillRect(0, barPixelCoord + runtime.stripeOffset, canvas.width, settings.computed.stripeSize);
				}
			}
			// draw background
			context.fillStyle = settings.backgroundColor;
			for (var barPixelCoord = -settings.computed.stripeSize * 3 + runtime.stripeOffset; barPixelCoord < settings.canvasSize() + settings.computed.stripeSize * 2; barPixelCoord += settings.computed.stripeSize * 2) {
				if (settings.computed.isMovementHorizontal) {
					context.fillRect(barPixelCoord + runtime.stripeOffset, 0, settings.computed.stripeSize, canvas.height);
				} else {
					context.fillRect(0, barPixelCoord + runtime.stripeOffset, canvas.width, settings.computed.stripeSize);
				}
			}
			// move
			if (settings.computed.isMovementForward) {
				runtime.stripeOffset += settings.computed.movePixelsPerFrame;
				if (runtime.stripeOffset >= settings.computed.stripeSize * 2) {
					runtime.stripeOffset = 0;
				}
			} else {
				runtime.stripeOffset -= settings.computed.movePixelsPerFrame;
				if (runtime.stripeOffset <= -settings.computed.stripeSize * 2) {
					runtime.stripeOffset = 0;
				}
			}
			// resume drawing
			context.restore();
		}
		// continue to next animation frame if drawing
		if (runtime.isDrawing) {
			window.requestAnimationFrame(drawCanvasFrame);
		}
	}
	
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
	}
	
	// reset defaults
	function resetDefaults() {
		// inputs
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
		// stop app
		runtime.isDrawing = false;
		// hide app panel
		$('#app-panel').hide();
		// show settings panel
		$('.container').show();
		// scroll to top
		scrollToTop();
	}
	
});