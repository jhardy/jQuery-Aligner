jQuery Aligner
=============


** This plugin is still in its very early stages, there is probably lots of bugs to be found **

See aligner in action with this [quick demo](http://dl.dropbox.com/u/1274637/aligner-demo/index.html)

Aligner is a jQuery plugin to aid in aligning elements to a grid and baseline in the browsers. The plugin adds a few html canvas elements to your page, one is for a grid overlay, one  for a baseline overlay and one for a ruler and guides. You specify the column width, gutter width, column count and baseline height, Aligner then draws the grid and baseline onto the canvases.

All the aligner options can be set via javascript (see usage example below), or you can press the 'a' key and set all the options from the aligner menu panels.

To toggle the canvases visibility, simple push the 'g' to show the grid, 'b' to show the baseline and 'r' to show the rulers and guides. To add a guide simply click on the ruler area and drag the guide down similar to photoshop. 




##Usage


Obviously you will need jQuery to use this plugin, so be sure you have that before using this plugin. 

Include the jquery.aligner.js and aligner.css files

To create the grid and baseline canvases, call the .aligner() method on the grid container element with your grid and baseline dimensions, the plugin will overlay the generated grid on top of the container. 

    $("#container").aligner({
      columnWidth : 63,
      gutterWidth: 30,
      columns: 10,
      baselineHeight: 18  
    });

This will create a 10 column, 900px wide, grid overlay that has 63px wide columns and 30px wide gutters. The baseline overlay will have a baseline height of 18px. 

Optionally you can specify the color of the columns and the baseline, the example below will create a columns and baselines that are blue instead of the default red.

     $("#container").aligner({
        columnWidth : 60,
        gutterWidth: 20,
        columns: 12,
        baselineHeight: 8,
        gridColor : "hsla(220, 100%, 45%, 0.4)",
        baselineColor: "#00f"
      });
      

For the gridColor it is recommended that you use a hsla or rgba color with an alpha value less than 1, this way your columns will be transparent and you will be able to see the content below the grid overlay.


TO DO
=====

This is a early preview release so there maybe be a few bugs to work out. Planned features are as follows

 	* Demos with better documentation.
 	* Alternate grid style.
 	* More keyboard shortcuts for toggling grid and baseline visibilities and stack order.
 	* Responsive guides
	* test test test

