/*!
 * oyotabset.js 1.0
 * tested with jQuery 3.4.0
 * http://www.oyoweb.nl
 *
 * © 2022 oYoSoftware
 * MIT License
 *
 * oyotabset is a tool to define an tabset element which is browser independant
 */

function oyoTabset(tabs = 8, tabWidth = 100, tabHeight = 50, tabLineWidth = 2, tabIndent = 25, tabOverlap = 0, pageHeight = 200) {

    var defaultBackgroundColor = "white";
    var defaultOuterLineColor = "#B3CEB3";
    var defaultInnerLineColor = "#527FC3";
    var defaultInnerFillColor = "#B3CEB3";
    var defaultTextColor = "#527FC3";

    var backgroundColor = defaultBackgroundColor;
    var outerLineColor = defaultOuterLineColor;
    var innerLineColor = defaultInnerLineColor;
    var innerFillColor = defaultInnerFillColor;
    var textColor = defaultTextColor;

    var tabHoverMode = "line";
    var innerTabLineWidth = 5;
    var savInnerTabLineWidth = 5;
    var savInnerLineColor;
    var savInnerFillColor;
    var fontSize = $("*").css("font-size");

    var firstEmptyIndex = 0;

    var tabsetIndex = $(".oyotabset").length + 1;

    maxTabIndent = tabWidth / 2;
    if (tabIndent > maxTabIndent) {
        tabIndent = maxTabIndent;
    }

    var length = Math.sqrt(Math.pow(tabIndent, 2) + Math.pow(tabHeight, 2));
    var sin = tabHeight / length;
    var cos = Math.sqrt(1 - Math.pow(sin, 2));
    var tabBorderWidth = Math.sqrt(Math.pow(tabLineWidth, 2) + Math.pow(tabLineWidth * cos / sin, 2));
    var tabBorderHeight = tabHeight - (tabWidth - 2 * tabBorderWidth) / tabWidth * tabHeight - (tabWidth / 2 - tabIndent) * sin / cos;

    var tabset = document.createElement("div");
    $(tabset).attr("class", "oyotabset");
    $(tabset).css("box-sizing", "border-box");
    var tabsetWidth = tabs * tabWidth - (tabs - 1) * tabOverlap;
    $(tabset).width(tabsetWidth);
    $(tabset).height(tabHeight + pageHeight);
    $(tabset).css("position", "relative");
    $(tabset).css("white-space", "nowrap");
    $(tabset).css("overflow-x", "hidden");

    var svgNS = 'http://www.w3.org/2000/svg';

    for (var i = 0; i < tabs; i++) {
        var tab = document.createElement("div");
        $(tab).attr("class", "oyotab");
        if (i === 0) {
            $(tab).addClass("oyoactive");
        }
        $(tab).css("display", "inline");
        $(tab).css("position", "relative");
        if (tabOverlap >= 0) {
            $(tab).css("left", -i * tabOverlap);
        } else {
            $(tab).css("left", -i * tabBorderWidth);
        }
        $(tab).css("z-index", tabs - i);
        $(tabset).append(tab);

        var svg = document.createElementNS(svgNS, "svg");
        if (tabOverlap >= 0) {
            $(svg).width(tabWidth);
        } else {
            $(svg).width(tabWidth - tabOverlap + tabBorderWidth);
        }
        $(svg).height(tabHeight);
        $(tab).append(svg);

        var innerTab = document.createElementNS(svgNS, "polygon");
        $(innerTab).attr("class", "oyoinnertab");
        var clipPathName = "url(#oyotabclip" + tabsetIndex + ")";
        $(innerTab).css("clip-path", clipPathName);
        $(innerTab).attr("stroke-width", 0);
        $(innerTab).attr("stroke", backgroundColor);
        $(innerTab).attr("fill", backgroundColor);
        var state = 2;
        if (i === 0) {
            state = 1;
        }
        var points = getInnerPoints(state);
        $(innerTab).attr("points", points);
        $(svg).append(innerTab);

        var outerTab = document.createElementNS(svgNS, "polygon");
        $(outerTab).attr("class", "oyooutertab");
        if (i === 0) {
            var id = "oyooutertab" + tabsetIndex;
            $(outerTab).attr("id", id);
        }
        var clipPathName = "url(#oyotabclip" + tabsetIndex + ")";
        $(outerTab).css("clip-path", clipPathName);
        $(outerTab).attr("fill", "transparent");
        $(outerTab).attr("stroke-width", 2 * tabLineWidth);
        $(outerTab).attr("stroke", outerLineColor);
        var points = getPoints();
        $(outerTab).attr("points", points);
        $(svg).append(outerTab);

        var tabLine = document.createElementNS(svgNS, "polygon");
        $(tabLine).attr("class", "oyotabline");
        $(tabLine).attr("stroke-width", 0);
        $(tabLine).attr("fill", backgroundColor);
        if (i === 0) {
            var points = getLinePoints();
            $(tabLine).attr("points", points);
        }
        $(svg).append(tabLine);

        var text = document.createElementNS(svgNS, "text");
        $(text).attr("class", "oyotabtext");
        $(text).css("font-size", 12);
        $(text).attr("x", tabWidth / 2);
        $(text).attr("y", (tabHeight + 12) / 2);
        $(text).attr("text-anchor", "middle");
        $(text).attr("fill", textColor);
        $(svg).append(text);

        if (tabOverlap < 0 && i < tabs - 1) {
            var interTabLine = document.createElementNS(svgNS, "polygon");
            $(interTabLine).attr("class", "oyointertabline");
            $(interTabLine).attr("stroke-width", 0);
            $(interTabLine).attr("fill", outerLineColor);
            var points = getInterLinePoints();
            $(interTabLine).attr("points", points);
            $(svg).append(interTabLine);
        }

        var page = document.createElement("div");
        $(page).attr("class", "oyotabpage");
        $(page).width($(tabset).width());
        $(page).height(pageHeight);
        $(page).css("position", "absolute");
        $(page).css("top", tabHeight);
        $(page).css("background", backgroundColor);
        var border = tabBorderWidth + "px solid " + outerLineColor;
        $(page).css("border", border);
        $(page).css("border-top", "0px");
        $(page).css("overflow", "auto");
        $(page).css("z-index", tabs - i);
        $(tabset).append(page);
    }

    var svg = document.createElementNS(svgNS, "svg");
    $(svg).width(0);
    $(svg).height(0);
    $(tabset).append(svg);
    var clipPath = document.createElementNS(svgNS, "clipPath");
    var id = "oyotabclip" + tabsetIndex;
    $(clipPath).attr("id", id);
    $(svg).append(clipPath);
    var use = document.createElementNS(svgNS, "use");
    var href = "#oyooutertab" + tabsetIndex;
    $(use).attr("href", href);
    $(clipPath).append(use);

    var img = document.createElement("img");
    $(img).width(tabs * tabWidth - (tabs - 1) * tabOverlap);
    $(img).height(tabHeight);
    $(img).css("padding", "0px");
    $(img).css("position", "relative");
    $(img).css("top", -tabHeight);
    $(img).css("z-index", 999);
    $(img).css("display", "block");
    $(img).css("opacity", 0);
    var name = "oyotabsetclick" + tabsetIndex;
    $(img).attr("usemap", "#" + name);
    $(tabset).append(img);

    var map = document.createElement("map");
    $(map).attr("name", name);
    $(tabset).append(map);

    for (var i = 0; i < tabs; i++) {
        var area = document.createElement("area");
        $(area).attr("shape", "polygon");
        $(area).attr("href", "#");
        var state = 2;
        if (i === 0) {
            state = 1;
        }
        var coords = getCoords(i, state);
        $(area).attr("coords", coords);
        $(map).append(area);
    }

    $("area", map).on("click", mouseClick);
    $("area", map).on("mouseenter", mouseEnter);
    $("area", map).on("mouseleave", mouseLeave);

    function mouseClick(event) {
        var index = $(event.currentTarget).index();
        setTab($(".oyotab", tabset)[index]);
        event.preventDefault();
    }

    function mouseEnter(event) {
        var index = $(event.currentTarget).index();
        if (!$(".oyotab", tabset).eq(index).hasClass("oyoactive")) {
            $(".oyoinnertab", tabset).eq(index).css("stroke-width", innerTabLineWidth);
            if (tabHoverMode === "line" || tabHoverMode === "mixed") {
                $(".oyoinnertab", tabset).eq(index).css("stroke", innerLineColor);
            }
            if (tabHoverMode === "fill" || tabHoverMode === "mixed") {
                $(".oyoinnertab").eq(index).css("fill", innerFillColor);
            }
        }
    }

    function mouseLeave(event) {
        var index = $(event.currentTarget).index();
        $(".oyoinnertab", tabset).eq(index).css("stroke-width", 0);
        $(".oyoinnertab", tabset).eq(index).css("stroke", backgroundColor);
        $(".oyoinnertab").eq(index).css("fill", backgroundColor);
    }

    function setTab(target) {
        var index = $(target).index() / 2;

        $(".oyotab", tabset).removeClass("oyoactive");
        $(".oyoinnertab", tabset).eq(index).css("stroke", backgroundColor);
        $(".oyoinnertab", tabset).eq(index).css("fill", backgroundColor);
        $(".oyotabline", tabset).attr("points", "");

        var points = getLinePoints();
        $(".oyotabline", tabset).eq(index).attr("points", points);

        var next = false;
        var length = $(".oyotab", tabset).length;
        var counter = length - 2 * index - 1;
        if (counter < 0) {
            counter = 0;
        }
        var state;
        $(".oyotab", tabset).each(function (index, element) {
            if (!next) {
                counter += 1;
                state = 0;
            } else {
                counter -= 1;
                state = 2;
            }
            if (target === element) {
                next = true;
                state = 1;
                $(target).addClass("oyoactive");
            }
            var points = getInnerPoints(state);
            $(".oyoinnertab", tabset).eq(index).attr("points", points);
            var coords = getCoords(index, state);
            $("area", map).eq(index).attr("coords", coords);
            $(element).css("z-index", counter);
            $(".oyotabpage", tabset).eq(index).css("z-index", counter);
        });
    }

    function getPoints() {
        var x1 = tabIndent;
        var y1 = 0;
        var x2 = tabWidth - tabIndent;
        var y2 = 0;
        var x3 = tabWidth;
        var y3 = tabHeight;
        var x4 = 0;
        var y4 = tabHeight;
        var p1 = x1 + "," + y1;
        var p2 = x2 + "," + y2;
        var p3 = x3 + "," + y3;
        var p4 = x4 + "," + y4;
        var points = p1 + "," + p2 + "," + p3 + "," + p4;
        return points;
    }

    function getInnerPoints(state) {
        var x1 = tabIndent - cos * tabBorderWidth + tabBorderWidth;
        var y1 = tabLineWidth;
        var x2 = tabWidth - tabIndent + cos * tabBorderWidth - tabBorderWidth;
        var y2 = tabLineWidth;
        if (x1 > x2) {
            x1 = tabWidth / 2;
            x2 = tabWidth / 2;
            y1 = tabBorderHeight;
            y2 = tabBorderHeight;
        }
        var x3 = tabWidth - tabOverlap / 2 - tabBorderWidth / 2;
        var y3 = tabHeight - tabOverlap / tabIndent / 2 * tabHeight + (tabBorderWidth / 2) * sin / cos;
        if (state === 0) {
            var x4 = tabWidth - tabOverlap + tabLineWidth * cos / sin;
        } else {
            var x4 = tabWidth - tabBorderWidth - cos * tabBorderWidth;
        }
        var y4 = tabHeight - tabLineWidth;
        if (state === 2) {
            var x5 = tabOverlap - tabLineWidth * cos / sin;
        } else {
            var x5 = tabBorderWidth + cos * tabBorderWidth;
        }
        var y5 = tabHeight - tabLineWidth;
        var x6 = tabOverlap / 2 + tabBorderWidth / 2;
        var y6 = tabHeight - tabOverlap / tabIndent / 2 * tabHeight + (tabBorderWidth / 2) * sin / cos;
        var p1 = x1 + "," + y1;
        var p2 = x2 + "," + y2;
        var p3 = x3 + "," + y3;
        var p4 = x4 + "," + y4;
        var p5 = x5 + "," + y5;
        var p6 = x6 + "," + y6;
        var points = p1 + "," + p2 + "," + p3 + "," + p4 + "," + p5 + "," + p6;
        return points;
    }

    function getLinePoints() {
        var x1 = tabBorderWidth + cos * tabBorderWidth + cos / sin;
        var y1 = tabHeight - tabLineWidth - 1;
        var x2 = tabWidth - tabBorderWidth - cos * tabBorderWidth - cos / sin;
        var y2 = tabHeight - tabLineWidth - 1;
        var x3 = tabWidth - tabBorderWidth;
        var y3 = tabHeight;
        var x4 = tabBorderWidth;
        var y4 = tabHeight;
        var p1 = x1 + "," + y1;
        var p2 = x2 + "," + y2;
        var p3 = x3 + "," + y3;
        var p4 = x4 + "," + y4;
        var points = p1 + "," + p2 + "," + p3 + "," + p4;
        return points;
    }

    function getInterLinePoints() {
        var x1 = tabWidth - tabBorderWidth;
        var y1 = tabHeight - tabLineWidth;
        var x2 = tabWidth - tabOverlap + tabBorderWidth;
        var y2 = tabHeight - tabLineWidth;
        var x3 = tabWidth - tabOverlap + tabBorderWidth;
        var y3 = tabHeight;
        var x4 = tabWidth - tabBorderWidth;
        var y4 = tabHeight;
        var p1 = x1 + "," + y1;
        var p2 = x2 + "," + y2;
        var p3 = x3 + "," + y3;
        var p4 = x4 + "," + y4;
        var points = p1 + "," + p2 + "," + p3 + "," + p4;
        return points;
    }

    function getCoords(index, state) {
        var x1 = index * tabWidth + tabIndent - index * tabOverlap;
        var y1 = 0;
        var x2 = (index + 1) * tabWidth - tabIndent - index * tabOverlap;
        var y2 = 0;
        var x3 = (index + 1) * tabWidth - index * tabOverlap - tabOverlap / 2;
        var y3 = tabHeight - tabOverlap / tabIndent / 2 * tabHeight;
        if (state === 0) {
            var x4 = (index + 1) * tabWidth - index * tabOverlap - tabOverlap;
        } else {
            var x4 = (index + 1) * tabWidth - index * tabOverlap;
        }
        var y4 = tabHeight;
        if (state === 2) {
            var x5 = index * tabWidth - index * tabOverlap + tabOverlap;
        } else {
            var x5 = index * tabWidth - index * tabOverlap;
        }
        var y5 = tabHeight;
        var x6 = index * tabWidth - index * tabOverlap + tabOverlap / 2;
        var y6 = tabHeight - tabOverlap / tabIndent / 2 * tabHeight;

        var p1 = x1 + "," + y1;
        var p2 = x2 + "," + y2;
        var p3 = x3 + "," + y3;
        var p4 = x4 + "," + y4;
        var p5 = x5 + "," + y5;
        var p6 = x6 + "," + y6;
        var coords = p1 + "," + p2 + "," + p3 + "," + p4 + "," + p5 + "," + p6;
        return coords;
    }

    tabset.getPage = function (index) {
        var page;
        if (!isNaN(index)) {
            page = $(".oyotabpage", tabset).eq(index);
        } else {
            var name = ".oyotabpage[name='" + index + "']";
            page = $(name, tabset);
        }
        return page;
    };

    tabset.setHoverMode = function (hoverMode, {lineColor, fillColor} = {}, lineWidth) {
        tabHoverMode = hoverMode;
        switch (true) {
            case hoverMode === "none":
                innerLineColor = backgroundColor;
                innerFillColor = backgroundColor;
                innerTabLineWidth = 0;
                break;
            case hoverMode === "line" || hoverMode === "mixed":
                if (lineColor !== undefined) {
                    innerLineColor = lineColor;
                } else {
                    innerLineColor = savInnerLineColor;
                }
                if (lineWidth !== undefined) {
                    innerTabLineWidth = 2 * lineWidth;
                } else {
                    innerTabLineWidth = savInnerTabLineWidth;
                }
                if (hoverMode === "line") {
                    break;
                }
            case hoverMode === "fill" || hoverMode === "mixed":
                if (fillColor !== undefined) {
                    innerFillColor = fillColor;
                } else {
                    innerFillColor = savInnerFillColor;
                }
                if (hoverMode === "fill") {
                    innerTabLineWidth = 0;
                }
                break;
            default:
        }

        if (lineColor !== undefined) {
            savInnerLineColor = lineColor;
        }
        if (fillColor !== undefined) {
            savInnerFillColor = fillColor;
        }
        if (lineWidth !== undefined) {
            savInnerTabLineWidth = 2 * lineWidth;
    }

    };

    tabset.setText = function (text, index = firstEmptyIndex) {
        $(".oyotabtext", tabset).eq(index).html(text);
        $(".oyotabpage", tabset).eq(index).attr("name", text);
        index += 1;
        if (index > firstEmptyIndex) {
            firstEmptyIndex = index;
    }
    };

    tabset.setAutoText = function (textMode, textLength, index = firstEmptyIndex, numericLength = 10, includeZero = true) {
        textMode = textMode.toUpperCase();

        if (textMode === "A" || textMode === "ALPHABET") {
            if (textLength === undefined) {
                textLength = 3;
            }
            var minLength = Math.ceil(24 / (tabs - index));
            if (textLength < minLength) {
                textLength = minLength;
            }
            var count;
            if (textLength === 1) {
                count = 26;
            } else {
                count = Math.ceil(24 / textLength);
            }
            var code = 64;
            for (var i = 0; i < count; i++) {
                var text = "";
                for (var j = 0; j < textLength; j++) {
                    code += 1;
                    if (code > 90) {
                        break;
                    }
                    text += String.fromCharCode(code);
                    if (textLength !== 1 && (text.endsWith("Q") || text.endsWith("X"))) {
                        code += 1;
                        text += String.fromCharCode(code);
                    }
                }
                $(".oyotabtext", tabset).eq(index).html(text);
                $(".oyotabpage", tabset).eq(index).attr("name", text);
                index += 1;
                if (index > firstEmptyIndex) {
                    firstEmptyIndex = index;
                }
            }
        }
        if (textMode === "N" || textMode === "NUMERIC") {
            if (textLength === undefined) {
                textLength = 10;
            }
            if (index === -1) {
                index = firstEmptyIndex;
            }
            var minLength = Math.ceil(numericLength / (tabs - index));
            if (textLength < minLength) {
                textLength = minLength;
            }
            var count = Math.ceil(numericLength / textLength);
            if (includeZero) {
                var number = -1;
            } else {
                var number = 0;
            }
            for (var i = 0; i < count; i++) {
                var text = "";
                for (var j = 0; j < textLength; j++) {
                    number += 1;
                    if (number > numericLength) {
                        number -= 1;
                        break;
                    }
                    if (j === 0) {
                        text += number;
                    }
                }
                if (textLength > 1 && j > 1) {
                    text += "-" + number;
                }
                $(".oyotabtext", tabset).eq(index).html(text);
                $(".oyotabpage", tabset).eq(index).attr("name", text);
                index += 1;
                if (index > firstEmptyIndex) {
                    firstEmptyIndex = index;
                }
            }
    }

    };

    tabset.clearText = function () {
        $(".oyotabtext", tabset).html("");
        firstEmptyIndex = 0;
    };

    tabset.setFont = function (fontSize, color, lineWidth, lineColor) {
        $(".oyotabtext", tabset).css("font-size", fontSize);
        $(".oyotabtext", tabset).attr("y", (tabHeight + fontSize) / 2);
        if (color !== undefined) {
            $(".oyotabtext", tabset).css("fill", color);
        }
        if (lineWidth !== undefined) {
            $(".oyotabtext", tabset).css("stroke-width", lineWidth);
        }
        if (lineColor !== undefined) {
            $(".oyotabtext", tabset).css("stroke", lineColor);
        }
    };

    tabset.changeBackgroundColor = function (color) {
        backgroundColor = color;
        $(".oyoinnertab", tabset).css("fill", color);
        $(".oyotabline", tabset).css("fill", color);
        $(".oyotabpage", tabset).css("background-color", color);
    };

    tabset.changeLineColor = function (color) {
        $(".oyooutertab", tabset).css("stroke", color);
        $(".oyotabpage", tabset).css("border-color", color);
    };

    tabset.resetTabSettings = function () {
        backgroundColor = defaultBackgroundColor;
        $(".oyoinnertab", tabset).css("fill", backgroundColor);
        $(".oyotabline", tabset).css("fill", backgroundColor);
        $(".oyotabpage", tabset).css("background-color", backgroundColor);
        outerLineColor = defaultOuterLineColor;
        $(".oyooutertab", tabset).css("stroke", outerLineColor);
        $(".oyotabpage", tabset).css("border-color", outerLineColor);
        tabHoverMode = "line";
        innerLineColor = defaultInnerLineColor;
        savInnerLineColor = defaultInnerLineColor;
        innerFillColor = defaultInnerFillColor;
        savInnerFillColor = defaultInnerFillColor;
        innerTabLineWidth = 5;
        savInnerTabLineWidth = 5;
        textColor = defaultTextColor;
        $(".oyotabtext", tabset).css("font-size", fontSize);
        $(".oyotabtext", tabset).attr("y", (tabHeight + parseFloat(fontSize)) / 2);
        textColor = defaultTextColor;
        $(".oyotabtext", tabset).css("fill", textColor);
        $(".oyotabtext", tabset).css("stroke-width", 0);
        $(".oyotabtext", tabset).css("stroke", textColor);
    };

    tabset.changePageHeight = function (pageHeight) {
        $(tabset).height(tabHeight + pageHeight);
        $(".oyotabpage", tabset).outerHeight(pageHeight);
    };

    return tabset;
}