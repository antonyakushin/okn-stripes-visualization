// after jQuery loaded
$(document).ready(function() {

	// defaults
	var defaults = {
		movement: 'left-to-right',
		stripes: 10,
		speed: 10,
		stripeColor: '#999',
		backgroundColor: '#FFF',
		stopAfter: '',
		fullscreen: 'on',
		framesPerSecond: 60
	}
	// settings
	var settings = {
		isFullscreen: function() {
			return (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen);
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
	var $canvas = $('#app-canvas');
	var canvas = document.getElementById('app-canvas');
	var context = canvas.getContext('2d');
	
	// call resize
	resizeCanvas();

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
		if (settings.fullscreen) {
			// start fullscreen
			if (canvas.webkitRequestFullScreen) {
				canvas.webkitRequestFullScreen();
			} else if (canvas.mozRequestFullScreen) {
				canvas.mozRequestFullScreen(); 
			} else {
				canvas.requestFullScreen();
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
		// track if changed
		var hasChanged = false;
		if ($canvas.width() != $(window).innerWidth()) {
			// update width on change
			$canvas.width($(window).innerWidth());
			hasChanged = true;
		}
		if ($canvas.height() != $(window).innerHeight()) {
			// update height on change
			hasChanged = true;
			$canvas.height($(window).innerHeight());
		}
		// clear computed settings on change
		if (hasChanged) {
			computeSettings();
		}
	}
	$(window).on('resize', resizeCanvas);

	// when fullscreen changed
	$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
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
			for (var barPixelCoord = -settings.computed.stripeWidth * 4 + runtime.stripeOffset; barPixelCoord < canvas.width + settings.computed.stripeWidth * 2; barPixelCoord += settings.computed.stripeWidth * 2) {
				if (settings.computed.isMovementHorizontal) {
					context.fillRect(barPixelCoord + runtime.stripeOffset, 0, settings.computed.stripeWidth, canvas.height);
				} else {
					context.fillRect(0, barPixelCoord + runtime.stripeOffset, canvas.width, settings.computed.stripeWidth);
				}
			}
			// draw background
			context.fillStyle = settings.backgroundColor;
			for (var barPixelCoord = -settings.computed.stripeWidth * 3 + runtime.stripeOffset; barPixelCoord < canvas.width + settings.computed.stripeWidth * 2; barPixelCoord += settings.computed.stripeWidth * 2) {
				if (settings.computed.isMovementHorizontal) {
					context.fillRect(barPixelCoord + runtime.stripeOffset, 0, settings.computed.stripeWidth, canvas.height);
				} else {
					context.fillRect(0, barPixelCoord + runtime.stripeOffset, canvas.width, settings.computed.stripeWidth);
				}
			}
			// move
			if (settings.computed.isMovementForward) {
				runtime.stripeOffset += settings.computed.movePixelsPerFrame;
				if (runtime.stripeOffset >= settings.computed.stripeWidth * 2) {
					runtime.stripeOffset = 0;
				}
			} else {
				runtime.stripeOffset -= settings.computed.movePixelsPerFrame;
				if (runtime.stripeOffset <= -settings.computed.stripeWidth * 2) {
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
		settings.computed.stripeWidth = ($canvas.width() / settings.stripes);
		settings.computed.movePixelsPerFrame = (settings.computed.isMovementHorizontal ? canvas.width : canvas.height) / (settings.speed * defaults.framesPerSecond);
	}
	
	// exit app and return to settings
	function returnToSettings() {
		// clear stop after handle if it exists
		if (runtime.stopAfterHandle !== null) {
			clearTimeout(runtime.stopAfterHandle);
			runtime.stopAfterHandle = null;
		}
		// check if fullscreen
		if (settings.isFullscreen()) {
			// if yes, stop fullscreen
			if (document.webkitIsFullScreen) {
				document.webkitCancelFullScreen();
			} else if (document.mozFullScreen) {
				document.mozCancelFullScreen(); 
			} else {
				document.cancelFullScreen();
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