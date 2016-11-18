(function($) {
	$.blurry = function() {
		var c1 = $('#overCanvas')[0],
			ctx1 = c1.getContext("2d");

		var c2 = $('#underCanvas')[0],
			ctx2 = c2.getContext("2d");

		ctx1.clearRect(0, 0, c1.width, c1.height);
	    ctx2.clearRect(0, 0, c2.width, c2.height);

		var rect = c1.getBoundingClientRect();
		var canvasLeft = rect.left, canvasTop = rect.top;

		var img = new Image();
		var imgIndex = 0;
		var pixelValue = 1;

		// turn off image smoothing - this will give the pixelated effect
		ctx2.mozImageSmoothingEnabled = false;
		ctx2.webkitImageSmoothingEnabled = false;
		ctx2.imageSmoothingEnabled = false;

		// wait until image is actually available
		img.onload = pixelate;

		// some image, we are not struck with CORS restrictions as we
		// do not use pixel buffer to pixelate, so any image will do
		img.src = '/static/img/image.jpg';

		var canvas = $('canvas')[0];
		var blocks = $('#blocks')[0];

		var curr_param = 0
		var radius_params = [[50, 100], [45, 115], [30, 130],
                             [25, 145], [20, 160], [15, 175],
                             [15, 190], [15, 210], [10, 230]]
		var circles = initializeCircles(250, 240, 9, radius_params[curr_param][0],
										radius_params[curr_param][1]);

		var toggled = false, toggledTo = null;

		var move = [], pathPassed = [], clicked = [], measures = []

		c1.onclick = function(e) { // After each click
			ctx1.clearRect(0,0,c1.width,c1.height);
			toggled = false;

			var rect = this.getBoundingClientRect(); // get abs. position of canvas
  			canvasTop = rect.top;
      		canvasLeft = rect.left;

      		var positionClicked = new Point(e.clientX, e.clientY);
      		var relativePositionClicked = positionClicked.relativePosition(canvasTop, canvasLeft);
      		var normalizedPositionClicked = relativePositionClicked.normalizedPosition(c1.width, c1.height);

      		clicked.push(positionClicked)

      		$.each(circles, function() {
      			drawCircle(this.x, this.y, this.r, false, ctx1);
      			if (ctx1.isPointInPath(relativePositionClicked.x, relativePositionClicked.y) &&
      				this.active == true) {
      				toggled = true;
      				toggledFrom = this;
      			}
			});

			if (toggled == true) {
				pixelValue = modifyPixelValue(pixelValue, true, false);
      			pixelate();

				$.each(circles, function(index) {
      				if (toggledFrom == this) {
      					circles[index].active = false;
      					if (index == circles.length - 1) {
      						circles[0].active = true;
							if (curr_param < radius_params.length - 1) {
                                curr_param += 1;
                            }
                            else {
                                alert("Thanks for the participation!")
                            }
							circles = initializeCircles(250, 240, 9, radius_params[curr_param][0],
														radius_params[curr_param][1]);
      					}
      					else {
      						circles[index + 1].active = true;
      					}

						if (clicked.length > 1) {
							var toArg = new Point(this.x, this.y)
							measures = $.accuracyMeasure(clicked[clicked.length - 2],
													     toArg, this.r, pathPassed)
							console.log(measures)
						}
      				}
				});
			}
			else {
				pixelValue = modifyPixelValue(pixelValue, false, false);
      			pixelate();
			}

			$.each(circles, function() {
      			drawCircle(this.x, this.y, this.r, this.active, ctx1);
			});

			pathPassedString = "";
			$.each(pathPassed, function(index) {
				pathPassedString += pathPassed[index].asString();
			});

			$.get (
				url = "add",
				data = {'session_id': 1, 'end_click': clicked[clicked.length-1].asString(),
						'move_path': pathPassedString, 'tre': measures[0], 'tac': measures[1],
						'mdc': measures[2], 'odc': measures[3], 'mv': measures[4], 'me': measures[5],
						'mo': measures[6]},
				success = function(data) {
					console.log('successfully inserted');
				}
			);

			move = [];
  			pathPassed = [];
		};

		$(document).mousemove(function(e){
      		var positionPassed = new Point(e.clientX, e.clientY);
      		var relativePositionPassed = positionPassed.relativePosition(canvasTop, canvasLeft);
      		var normalizedPositionPassed = relativePositionPassed.normalizedPosition(c1.width, c1.height);

			if ((normalizedPositionPassed.x > 0 && normalizedPositionPassed.x < 1) &&
				(normalizedPositionPassed.y > 0 && normalizedPositionPassed.y < 1)) {

				pathPassed.push(positionPassed);
				ctx1.shadowColor = "#000000";
                ctx1.shadowOffsetX = 0;
                ctx1.shadowOffsetY = 0;
                ctx1.shadowBlur    = 0;
				ctx1.fillStyle="#FF0000";
				ctx1.fillRect(relativePositionPassed.x,relativePositionPassed.y,1.5,1.5);

				move.push("(" + normalizedPositionPassed.x.toFixed(2).toString() + "," +
					normalizedPositionPassed.y.toFixed(2).toString() + ")");
			}

    	});

		function pixelate() {
    		// if in play mode use that value, else use slider value
    		var size = pixelValue * 0.02,

        		// cache scaled width and height
       		    w = canvas.width * size,
        		h = canvas.height * size;

    		// draw original image to the scaled size
    		ctx2.drawImage(img, 0, 0, w, h);

    		// then draw that scaled image thumb back to fill canvas
    		// As smoothing is off the result will be pixelated
    		ctx2.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
		}


    	function modifyPixelValue(pixelValue, targetHit, penalize) {
    		if (targetHit == true) {
    			if (pixelValue < 10) {
      				pixelValue += 0.2;
      			}
      			else if (pixelValue < 50) {
      				pixelValue++;
      			}
    		}
    		else if (penalize == true && pixelValue - 0.5 >= 1) {
    			pixelValue -= 0.5;
    		}
    		return pixelValue;
    	}
	}
})(jQuery);
