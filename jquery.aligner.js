/*************************************************
**  jQuery Aligner 0.5
**  Copyright Jared Hardy, licensed MIT
**************************************************/

(function($) {
	$.fn.aligner = function(options) {
		
		// Methods 
		var align = {
			getOffset : function(item) {
				 return item.offset().left;
			},
			
			// Draw the grid
			drawGrid : function(id, offset) {
				var i,
						unitWidth = opts.columnWidth + opts.gutterWidth,
						columnHeight = $(document).height();
						$gridCanvas = document.getElementById(id);
										
				if($gridCanvas.getContext) {
					var ctx = $gridCanvas.getContext('2d');
					
					// Clear the canvas for redrawing if the window is resized
					ctx.clearRect(0,0, $gridCanvas.width, $gridCanvas.height);
					// Column Color.
					ctx.fillStyle = opts.gridColor;
					
					// Draw each column on the canvas with gutter in between
					for(i = 0; i < opts.columns; i++) {
						ctx.fillRect(unitWidth * i, 0, opts.columnWidth, columnHeight);
					}
				}
			},
			
			// draw the baseline
			drawBaseline : function(id) {
				var y,
						$baselineCanvas = document.getElementById(id),
						lineSize = opts.baselineHeight;
				
				// Size the baseline canvas to the width of the window and update if window is resized
				$(baselineCanvas).attr({"width" : $(window).width(), "height": $(document).height()});
								
				if($baselineCanvas.getContext) {
					var ctx = $baselineCanvas.getContext('2d');
					
					// Clear the baseline canvas for redrawing if window is resized
					ctx.clearRect(0, 0, $baselineCanvas.width, $baselineCanvas.height);
					// Baseline Color
					ctx.strokeStyle = opts.baselineColor;
					ctx.lineWidth = 1;
					
					// Draw each baseline at the specified height
					for (y = 0; y < $(document).height(); y += lineSize) {
						ctx.beginPath();
						ctx.moveTo(0, (y+lineSize) - 0.5);
						ctx.lineTo($baselineCanvas.width, y + lineSize);
						ctx.stroke();
					}
				}
			},
			
			resize : function(offset) {
				
				// Update the aligner's left postion to keep it over content
				$("#gridCanvas").css("left", offset);
			},
			
			// Add the canvases to the page and draw the grid and baseline
			setUp : function(gridId,baselineId, offset) {
				var fullWidth = ((opts.columnWidth + opts.gutterWidth) * opts.columns) - opts.gutterWidth,
						gridCanvas = $('<canvas />').attr({"id" : "gridCanvas",	 "width" : fullWidth, "height": $(document).height(), "style" : "position: absolute; top: 0; left: 0; display: none;"}),
						baselineCanvas = $('<canvas />').attr({"id" : "baselineCanvas", "style" : "position: absolute; top: 0; left: 0; display: none;"});
				
				$("body").append(gridCanvas).append(baselineCanvas);
				align.drawGrid(gridId);
				align.resize(offset);
				align.drawBaseline(baselineId);
			}, 
			
			init : function(obj) {
					align.setUp("gridCanvas", "baselineCanvas", align.getOffset(obj));
				
			}
		};
		
		var opts = $.extend({}, $.fn.aligner.defaults, options);
		
			$(document).keypress(function(e) {
				if(e.keyCode === 103) {
					$("#gridCanvas").toggle();

				} 

				if(e.keyCode === 98) {
					$("#baselineCanvas").toggle();
				}
			});

			$(window).bind("resize", function() {
					align.resize(align.getOffset($this));
					align.drawBaseline("baselineCanvas");
			});
		
		
		
		return align.init($(this[0]));
	
	};
	
	$.fn.aligner.defaults = {
		
		columnWidth: 60,
		gutterWidth: 20,
		columns: 12,
		baselineHeight: 16,
		gridColor: "rgba(255, 0, 0, 0.3)",
		baselineColor: "rgba(255, 0, 0, 1)"
	};

})(jQuery);