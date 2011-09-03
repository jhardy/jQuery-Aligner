/*************************************************
**  jQuery Aligner 0.6
**  Copyright Jared Hardy, licensed MIT
**************************************************/
(function ($) {
    $.fn.aligner = function (options) {

        var container = $(this[0]);

        // Methods
        var align = {
            getOffset: function (item) {
                return item.offset().left;
            },

            // Draw the grid
            drawGrid: function (id, offset) {

                // check for localStorage grid settings
                opts.gridColor = (localStorage.getItem("alignerGridColor") === null) ? opts.gridColor : localStorage.alignerGridColor;
                opts.columns = (localStorage.getItem("alignerColumnCount") === null) ? opts.columns : parseInt(localStorage.alignerColumnCount, 10);
                opts.columnWidth = (localStorage.getItem("alignerColumnWidth") === null) ? opts.columnWidth : parseInt(localStorage.alignerColumnWidth, 10);
                opts.gutterWidth = (localStorage.getItem("alignerGutterWidth") === null) ? opts.gutterWidth : parseInt(localStorage.alignerGutterWidth, 10);

                var i, unitWidth = opts.columnWidth + opts.gutterWidth,
                    columnHeight = documentSize.height;
                $gridCanvas = document.getElementById(id), fullWidth = ((opts.columnWidth + opts.gutterWidth) * opts.columns) - opts.gutterWidth;

                // resize grid canvas
                $($gridCanvas).attr({
                    "width": fullWidth,
                    "height": documentSize.height
                });

                if ($gridCanvas.getContext) {
                    var ctx = $gridCanvas.getContext('2d');

                    // Clear the canvas for redrawing if the window is resized
                    ctx.clearRect(0, 0, $gridCanvas.width, $gridCanvas.height);
                    // Column Color.
                    ctx.fillStyle = opts.gridColor;

                    // Draw each column on the canvas with gutter in between
                    for (i = 0; i < opts.columns; i++) {
                        ctx.fillRect(unitWidth * i, 0, opts.columnWidth, columnHeight);
                    }
                }
            },

            // draw the baseline
            drawBaseline: function (id) {

                // check for baseline settings in local storage
                opts.baselineHeight = (localStorage.getItem("alignerBaselineHeight") === null) ? opts.baselineHeight : parseInt(localStorage.alignerBaselineHeight, 10);
                opts.baselineColor = (localStorage.getItem("alignerBaselineColor") === null) ? opts.baselineColor : localStorage.alignerBaselineColor;

                var y, $baselineCanvas = document.getElementById(id),
                    lineSize = opts.baselineHeight;

                // Size the baseline canvas to the width of the window and update if window is resized
                $($baselineCanvas).attr({
                    "width": documentSize.width,
                    "height": documentSize.height
                });

                if ($baselineCanvas.getContext) {
                    var ctx = $baselineCanvas.getContext('2d');

                    // Clear the baseline canvas for redrawing if window is resized
                    ctx.clearRect(0, 0, $baselineCanvas.width, $baselineCanvas.height);
                    // Baseline Color
                    ctx.strokeStyle = opts.baselineColor;
                    ctx.lineWidth = 1;

                    // Draw each baseline at the specified height
                    for (var y = 0; y < $(document).height(); y += lineSize) {

                        ctx.beginPath();
                        ctx.moveTo(0, (y + lineSize) - 0.5);
                        ctx.lineTo($baselineCanvas.width, y + lineSize);
                        ctx.stroke();
                    }
                }
            },

            drawRulers: function () {
                // check to see if guide color is in local storage
                opts.guideColor = (localStorage.getItem("alignerGuideColor") === null) ? opts.guideColor : localStorage.alignerGuideColor;

                var $rulerCanvas = document.getElementById("rulerCanvas"),
                    $guideCanvas = $("#guideCanvas"),
                    size, currentGuide, selectedGuide, draggedFromRuler = false,
                    onExistingGuide = false,
                    guides = [],
                    mouseDownLocation, pixelMarkerVert = $("<div />").attr({
                        "id": "alignerPixelVert",
                        "class": 'alignerPixelMarker'
                    }),
                    pixelMarkerHorz = $("<div />").attr({
                        "id": "alignerPixelHorz",
                        "class": 'alignerPixelMarker'
                    });
                guides = (localStorage["alignerGuidesCount"] > 0) ? loadGuides(guides) : [];

                // size ruler canvas to fill full document width height
                $($rulerCanvas).attr({
                    "width": documentSize.width,
                    "height": documentSize.height
                });
                // size guide canvas to full full document width and height
                $guideCanvas.css({
                    "width": documentSize.width,
                    "height": documentSize.height
                });
                // add ruler pixel markers
                $guideCanvas.append(pixelMarkerVert).append(pixelMarkerHorz);

                if ($rulerCanvas.getContext) {
                    var ctx = $rulerCanvas.getContext('2d');

                    // ruler styles
                    ctx.clearRect(0, 0, $rulerCanvas.width, $rulerCanvas.height);
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.strokeStyle = "#333"
                    ctx.fillRect(20, 0, documentSize.width, 20);
                    ctx.fillRect(0, 0, 20, documentSize.height);
                    ctx.lineWidth = 1;

                    // draw horizontal ruler
                    for (var i = 2; i < documentSize.width; i++) {
                        size = markSize(i);
                        ctx.beginPath();
                        ctx.moveTo(i * 5, 0);
                        ctx.lineTo(i * 5, size);
                        ctx.stroke();
                    }

                    // draw vertical ruler
                    for (var j = 2; j < documentSize.height; j++) {
                        size = markSize(j);
                        ctx.beginPath();
                        ctx.moveTo(0, j * 5);
                        ctx.lineTo(size, j * 5);
                        ctx.stroke();
                    }
                }

                // add listener to aligner guides and and assign guide with the mousedown event to the current guide
                $(".alignerGuide").live('mousedown', function (e) {
                    moveGuide = true;
                    currentGuide = $(e.target);

                });


                // add listener to guide canvas for adding and moving guides
                $guideCanvas.bind({
                    mousedown: function (event) {
                        // store mouse location from top of page to test if mouse down event happened within the ruler canvas area
                        mouseDownLocation = event.pageY - $(window).scrollTop();

                        // if mousedown event happens within the horizontal ruler
                        if (event.pageX > 20 && mouseDownLocation < 20 && !guidesLocked) {

                            // create new guide
                            var newGuide = drawGuide("horz");
                            // guide is moving
                            moveGuide = true;
                            // set dragged from ruler true
                            draggedFromRuler = true;
                            //store new guide in the guides array
                            guides.push(newGuide);

                            // add guide to dom
                            $("#guideCanvas").append(newGuide);

                        }

                        // if mousedown event happens within the vertical ruler
                        if (event.pageX < 20 && event.pageY > 20 && !guidesLocked) {

                            var newGuide = drawGuide("vert");
                            moveGuide = true;
                            draggedFromRuler = true;
                            guides.push(newGuide);
                            $("#guideCanvas").append(newGuide);
                        }

                        // Listen for mousemove and move correct guide
                        $(window).bind('mousemove', function (e) {
                            // set guide to move to a current guide or a new new guide dragged from ruler
                            selectedGuide = (draggedFromRuler) ? $(guides[guides.length - 1]) : currentGuide;
                            // if mousedown
                            if (moveGuide && !guidesLocked) {
                                // if a horizontal guide move it on the correct axis
                                if (selectedGuide.hasClass("horz")) {
                                    e.preventDefault();
                                    pixelMarkerHorz.show().css('top', e.pageY - (pixelMarkerHorz.outerHeight() / 2)).text(e.pageY + "px");
                                    selectedGuide.css('top', e.pageY);
                                    // else this is a vertical guide and move it on the correct axis
                                } else {
                                    pixelMarkerVert.show().css('left', e.pageX - (pixelMarkerVert.outerWidth() / 2)).text(e.pageX + "px")
                                    selectedGuide.css('left', e.pageX);
                                }
                            }

                        });
                    },

                    // remove listeners on mouse up
                    mouseup: function (e) {
                        // draged from ruler is false
                        draggedFromRuler = false;
                        // guide is not moving
                        moveGuide = false;

                        // remove horizontal guide if dragged and mouseup event is <= 5px from top of document
                        if (selectedGuide.hasClass("horz")) {
                            if (e.pageY < 5) {
                                selectedGuide.remove();
                            }
                            // remove vertical guide if dragged and mouseup event is <= 5px from left of document
                        } else {
                            if (e.pageX < 5) {
                                selectedGuide.remove();
                            }
                        }

                        // fade out pixel marker
                        setTimeout(function () {
                            $(".alignerPixelMarker").fadeOut();
                        }, 500);

                        // remove mousemove listner
                        $(window).unbind('mousemove');

                        // save guide positions into localstorage
                        saveGuides(guides);
                    }
                });
            },

            addOptions: function () {
                //  options panel markup
                var gridHtml = '<div class="alignerGrids alignerPanel"><label for="aligner-number-of-columns">Number of Columns:</label><input type="text" id="aligner-number-of-columns"/><label for="aligner-column-width">Column Width:</label><input type="text"  id="aligner-column-width" /><label for="aligner-gutter-width">Gutter Width:</label><input type="text" id="aligner-gutter-width" /><label for="aligner-grid-color">Column Color:</label><input type="text" id="aligner-grid-color" /> <button id="aligner-update-grid" class="alignerButton">Update Grid</button><button id="aligner-clear-grid" class="alignerClearSettings alignerButton">Clear Settings</button></div>',
                    baselineHtml = '<div class="alignerBaseline alignerPanel"><label for="aligner-baseline">Baseline Height:</label><input type="text" id="aligner-baseline" /><label for="aligner-baseline-color">Baseline Color:</label><input type="text" id="aligner-baseline-color" /><button id="aligner-udpate-baseline" class="alignerButton">Update Baseline</button><button id="aligner-clear-baseline" class="alignerClearSettings alignerButton">Clear Settings</button></div>',
                    guidesHtml = '<div class="alignerGuides alignerPanel"><label for="aligner-guide-color">Guide Color:</label><input type="text" id="aligner-guides-color" /><div class="alignerCheckbox"><label for="aligner-lock-guides">Lock Guides</label><input type="checkbox" id="aligner-lock-guides"></div><div class="alignerCheckbox"><label for="aligner-guides-responsive">Responsive Guides <br/>(to do)</label><input type="checkbox" id="aligner-guides-responsive /"></div><button id="aligner-update-guides" class="alignerButton">Update Guides</button><button id="aligner-clear-guides" class="alignerClearSettings alignerButton">Clear Settings</button></div>',
                    optionsPanels = '<div id="alignerOptionsPanels"><div id="alignerOptionsHeader"><ul><li class="activeTab">Grid</li><li>Rulers & Guides</li><li>Baseline</li></ul><div id="alignerPanelsClose">x</div></div>' + gridHtml + guidesHtml + baselineHtml + '</div>';

                // add panels to dom
                $('body').append(optionsPanels);


                var panels = $(".alignerPanel"),
                    optionsPanel = $("#alignerOptionsPanels"),
                    optionButtons = optionsPanel.find('li'),
                    edgeDistance = {};

                // listener for clicking option panel tabs and showing correct panel
                optionButtons.click(function (e) {
                    optionButtons.removeClass("activeTab");
                    var target = $(e.target);
                    panels.hide()
                    target.addClass("activeTab")
                    $(panels[target.index()]).show();

                });

                // listner for closing panel
                $("#alignerPanelsClose").click(function () {
                    optionsPanel.hide();
                });

                // listner for moving options panel around screen, * TO DO * add collision detection at window edges
                $("#alignerOptionsHeader").bind({
                    mousedown: function (e) {

                        edgeDistance.x = e.pageX - optionsPanel.offset().left;
                        edgeDistance.y = e.pageY - optionsPanel.offset().top;
                        $(window).bind('mousemove', function (event) {
                            optionsPanel.css({
                                'top': event.pageY - edgeDistance.y,
                                'left': event.pageX - edgeDistance.x
                            });

                        });
                    },
                    mouseup: function () {
                        $(window).unbind('mousemove');
                    }
                });
            },

            // add listeners for option panel inputs
            optionListeners: function () {
                // grid options
                var gridColumnCount = $("#aligner-number-of-columns"),
                    gridColumnWidth = $("#aligner-column-width"),
                    gridGutterWidth = $("#aligner-gutter-width"),
                    gridColor = $("#aligner-grid-color"),
                    // baseline options
                    baselineHeight = $("#aligner-baseline"),
                    baselineColor = $("#aligner-baseline-color"),
                    // guide options
                    // ** TO DO: Get Responsive guides working
                    guidesResponsive = $("#aligner-guides-responsive"),
                    guidesLock = $("#aligner-lock-guides"),
                    guidesColor = $("#aligner-guides-color"),
                    // clear local storage settings ** TO DO: clear individual panel options **
                    clearSettings = $(".alignerClearSettings");

                // set grid input values
                gridColumnCount.val(opts.columns);
                gridColumnWidth.val(opts.columnWidth);
                gridGutterWidth.val(opts.gutterWidth);
                gridColor.val(opts.gridColor);

                // set baline input values
                baselineHeight.val(opts.baselineHeight);
                baselineColor.val(opts.baselineColor);

                // set guide input values
                guidesColor.val(opts.guideColor);

                // update grid values
                $("#aligner-update-grid").click(function () {
                    opts.columns = parseInt(gridColumnCount.val(), 10);
                    opts.columnWidth = parseInt(gridColumnWidth.val(), 10);
                    opts.gutterWidth = parseInt(gridGutterWidth.val(), 10);
                    opts.gridColor = gridColor.val();

                    // save grid values into local storage
                    saveGrid(opts.gridColor, opts.columns, opts.columnWidth, opts.gutterWidth);
                    // redraw updated grid
                    align.drawGrid("gridCanvas");
                });

                // update baseline values
                $("#aligner-udpate-baseline").click(function () {

                    opts.baselineHeight = parseInt(baselineHeight.val(), 10);
                    opts.baselineColor = baselineColor.val();

                    // save baseline values into local storage
                    saveBaseline(opts.baselineColor, opts.baselineHeight);
                    // redraw updated baseline
                    align.drawBaseline("baselineCanvas");
                });

                // lock guides if options is selected ** TO DO: integrate with keyboard shortcut **
                $("#aligner-lock-guides").change(function () {
                    guidesLocked = (guidesLocked) ? false : true;
                });

                // update guide values
                $("#aligner-update-guides").click(function () {

                    opts.guideColor = guidesColor.val();
                    // save guide color in local storage
                    localStorage.alignerGuideColor = opts.guideColor;
                    // change guide color
                    $(".alignerGuide").css("border-top", "solid 1px " + opts.guideColor);

                });

                // clear local storage settings and remove guides
                clearSettings.click(function () {
                    localStorage.clear();
                    $(".alignerGuide").remove();
                });
            },

            // items to update on window resize
            resize: function (offset) {
                windowSize = {
                    'height': $(window).height(),
                    "width": $(window).width()
                };
                // Update the grids left postion to keep it over content
                $("#gridCanvas").css("left", offset);

                // redraw baselines
                align.drawBaseline("baselineCanvas");
                // redraw rulers
                align.drawRulers();

            },

            // Add the canvases to the page and draw the grid and baseline and ruler
            setUp: function (gridId, baselineId, offset) {
                var gridCanvas = $('<canvas />').attr({
                    "id": "gridCanvas",
                    "style": "position: absolute; top: 0; left: 0; display: none;"
                }),
                    baselineCanvas = $('<canvas />').attr({
                        "id": "baselineCanvas",
                        "style": "position: absolute; top: 0; left: 0; display: none;"
                    }),
                    rulerCanvas = $('<canvas />').attr({
                        "id": "rulerCanvas",
                        "style": "position: fixed; top: 0; left: 0; display: none;"
                    }),
                    guideCanvas = $("<div />").attr({
                        "id": "guideCanvas",
                        "style": "position: absolute; top: 0; left: 0; display: none;"
                    });
                alignerOptions = $("<div />").attr({
                    "id": "alignerOptions"
                });


                $("body").append(gridCanvas).append(baselineCanvas).append(rulerCanvas).append(guideCanvas).append(alignerOptions);
                align.drawGrid(gridId);
                align.resize(offset);
                align.drawBaseline(baselineId);
                align.drawRulers();
                align.addOptions();
                align.optionListeners();

            },

            init: function (obj) {
                align.setUp("gridCanvas", "baselineCanvas", align.getOffset(obj));
            }
        };

        var opts = $.extend({}, $.fn.aligner.defaults, options),
            windowSize = {
                'height': $(window).height(),
                "width": $(window).width()
            },
            documentSize = {
                'height': $(document).height(),
                "width": $(document).width()
            },
            container = $(this[0]),
            guidesLocked = false,
            somethingHasFocus;

        // listener to prevent keyboard shortcuts from when something has focus
        $("*").live({
            focus: function () {
                somethingHasFocus = true;
            },

            blur: function () {
                somethingHasFocus = false;
            }
        });

        // keyboard short cuts for toggeling visibily of items
        $(document).keypress(function (e) {

            if (somethingHasFocus) {
                return
            } else {
                if (e.which === 103) {
                    $("#gridCanvas").toggle();
                }

                if (e.which === 98) {
                    $("#baselineCanvas").toggle();
                }

                if (e.which === 114) {
                    $("#rulerCanvas").toggle();
                    $("#guideCanvas").toggle();
                }

                if (e.which === 97) {
                    $("#alignerOptionsPanels").toggle();

                }

                if (e.which === 108) {
                    guidesLocked = (guidesLocked) ? false : true;
                }
            }

        });

        $(window).bind("resize", function () {
            windowSize = {
                'height': $(window).height(),
                "width": $(window).width()
            };
            documentSize = {
                'height': $(document).height(),
                "width": $(document).width()
            };
            align.resize(align.getOffset(container));
        });

        // Set ruler mark size


        function markSize(num) {

            smallMark = 5, mediumMark = 10, largeMark = 15;

            num = num * 5;

            if (num % 100 === 0) {
                return largeMark;
            } else if (num % 25 === 0) {
                return mediumMark;
            } else {
                return smallMark;
            }
        }

        function drawGuide(o, style) {

            // var to hold new guide attributes
            var guideAttr = (style) ? style : ""
            // create guide container
            guide = $("<div />");

            // if a style is passed, use that style
            if (style) {
                guideAttr = style;
                // else use the default styles
            } else {
                if (o === "vert") {
                    guideAttr = "height: 100%; width: 2px; position: absolute; top: 20px; border-left: solid 1px " + opts.guideColor + "; cursor: pointer;";
                } else if (o === "horz") {
                    guideAttr = "height: 2px; width: 100%; position: absolute; top: 20px; border-top: solid 1px " + opts.guideColor + "; cursor: pointer;";
                }
            }

            // apply attributes and classes
            guide.attr({
                "class": "alignerGuide " + o,
                "style": guideAttr
            });
            return guide;

        }

        // save guides into local storage


        function saveGuides(guides) {

            localStorage.alignerGuidesCount = guides.length;

            for (var i = 0; i < guides.length; i++) {

                localStorage["alignerGuide" + i + "Class"] = $(guides[i]).attr("class");
                localStorage["alignerGuide" + i + "Style"] = $(guides[i]).attr("style");

            };
        }


        // load guides from local storage


        function loadGuides(guides) {

            var tempGuide, tempClass, tempStyle
            regX = /horz$/,
                numOfGuides = parseInt(localStorage["alignerGuidesCount"], 10)

                guides = [];

            for (var i = 0; i < numOfGuides; i++) {

                tempClass = (regX.test(localStorage["alignerGuide" + i + "Class"])) ? "horz" : "vert";
                tempStyle = localStorage["alignerGuide" + i + "Style"]
                tempGuide = drawGuide(tempClass, tempStyle);

                guides.push(tempGuide);
                $("#guideCanvas").append(tempGuide);

            }

            return guides;
        }

        // save grid options into local storage
        function saveGrid(localGridColor, localColumnCount, localColumnWidth, localGutterWidth) {

            localStorage.alignerGridColor = localGridColor;
            localStorage.alignerColumnCount = localColumnCount;
            localStorage.alignerColumnWidth = localColumnWidth;
            localStorage.alignerGutterWidth = localGutterWidth;


        }

        // save baselinbe options into local storage
        function saveBaseline(localBaselineColor, localBaselineHeight) {
            localStorage.alignerBaselineColor = localBaselineColor;
            localStorage.alignerBaselineHeight = localBaselineHeight;
        }


        return align.init($(this[0]));
    };

    $.fn.aligner.defaults = {

        columnWidth: 60,
        gutterWidth: 20,
        columns: 12,
        baselineHeight: 16,
        gridColor: "rgba(255, 0, 0, 0.3)",
        baselineColor: "rgba(255, 0, 0, 1)",
        guideColor: "#6afeff"
    };

})(jQuery);