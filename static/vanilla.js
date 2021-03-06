(function($) {
	$.vanilla = function() {
		var c1 = $('#overCanvas')[0],
			ctx1 = c1.getContext("2d");

        var c2 = $('#underCanvas')[0],
    		ctx2 = c2.getContext("2d");

        ctx1.clearRect(0, 0, c1.width, c1.height);
        ctx2.clearRect(0, 0, c2.width, c2.height);

		var rect = c1.getBoundingClientRect();
		var canvasLeft = rect.left, canvasTop = rect.top;

		var canvas = $('canvas')[0];
		var blocks = $('#blocks')[0];

        var curr_param = 0;
        var radius_params = [[32, 80], [13.2, 100], [9.3, 120],
                             [7, 140], [5.5, 160], [4.7, 180],
                             [4, 200], [3.3, 220], [2.7, 240]]
		var circles = initializeCircles(250, 240, 9, radius_params[0][0], radius_params[0][1]);

		var already_clicked = [];

		var toggled = false, toggledTo = null;

		var pathPassed = [], clicked = [], measures = [], time = [];

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
				time.push(Date.now());
				$.each(circles, function(index) {
      				if (toggledFrom == this) {
      					circles[index].active = false;
						already_clicked.push(index);
      					if (already_clicked.length == 9) {
      						circles[0].active = true;
							toSeq = [];
							clicked_round = clicked.slice(clicked.length - 9, clicked.length);
							$.each(circles, function() {
				      			toSeq.push(new Point(this.x, this.y));
							});
							throughput = $.throughput(clicked_round.slice(0, 8), toSeq.slice(1,9),
													  clicked_round.slice(1, 9),
													  this.r, time, 2 * radius_params[curr_param][1]);
							time = [];
							//console.log(throughput)
							if (curr_param < radius_params.length - 1) {
								already_clicked = [];
                                curr_param += 1;
								circles = initializeCircles(250, 240, 9, radius_params[curr_param][0],
															radius_params[curr_param][1]);
                            }
                            else {
                                alert("Thanks for the participation!")
                            }
							circles = initializeCircles(250, 240, 9, radius_params[curr_param][0],
														radius_params[curr_param][1]);
      					}
      					else {
      						circles[(index + 4) % 9].active = true;
      					}

						if (clicked.length > 1) {
							var toArg = new Point(this.x, this.y)
							measures = $.accuracyMeasure(clicked[clicked.length - 2],
													     toArg, this.r, pathPassed)
						}
      				}
				});
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
			}

    	});
	}
})(jQuery);

function initializeCircles(centerX, centerY, n, radius, largeRadius) {
    var c1 = $('#overCanvas')[0],
        ctx1 = c1.getContext("2d");

    var a = (Math.PI * 2) / n;

    var circles = [];
    for(i = 0; i < n; ++i) {
        var circleX = centerX + largeRadius*Math.cos(a*i);
        var circleY = centerY + largeRadius*Math.sin(a*i);
        var circleActive = false;
        if (i == 0) {
            circleActive = true;
        }
        circles.push({ x: circleX, y: circleY, r: radius, active: circleActive })
    }

    ctx1.clearRect(0, 0, c1.width, c1.height);
    $.each(circles, function() {
        drawCircle(this.x, this.y, this.r, this.active, ctx1);
    });

    return circles;
}


function drawCircle(x, y, r, active, ctx1) {
    ctx1.beginPath();
    ctx1.arc(x, y, r, 0, Math.PI * 2); // 0 - 2pi is a full circle
    ctx1.lineWidth = 1.5;
    ctx1.strokeStyle = '#000000';
    ctx1.stroke();

    ctx1.shadowColor   = '#201e1e';
    ctx1.shadowOffsetX = 5;
    ctx1.shadowOffsetY = 7;
    ctx1.shadowBlur    = 15;

    if (active == false) {
        ctx1.fillStyle = 'white';

    }
    if (active == true) {
        ctx1.fillStyle = '#FF0000';
    }
    ctx1.fill();
}
