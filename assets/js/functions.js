function initJapan(meta, svgElementClickHandler) {
    var prefecture_territory_set = JAPAN.set();
    var prefecture_name_set = JAPAN.set();
    var totals_per_prefecture_name_set = JAPAN.set();
    var totals_per_sake_classification_set = JAPAN.set();
    var totals_per_prefecture_name_polygon_set = JAPAN.set();
    var region_legend_polygon_set = JAPAN.set();
    var region_pie_slice_set = JAPAN.set();
    var region_legend_description_set = JAPAN.set();
    var lines_set = JAPAN.set();
    var regionNamesToRegionPieSlices = {};
    var regionNamesToRegionLegendPolygons = {};
    var regionNamesToRegionLegendDescriptions = {};

    console.log(meta);

    initPrefecturePaths();
    initPrefectureNames();
    drawHeadings();
    fillPrefecturesByRegions();
    drawRegionPieChart();
    bindEventsToRegionLegendAndPieChart();
    drawTotalPerPrefectureNameBreakdown();
    drawTotalPerSakeClassificationBreakdown();
    drawPointerLines();
    bindEventsToPrefectureTerritory();
    bindEventsToPrefectureNames();
    assignStyleAttributesToSvgSets();
    attachClickHandlerToSvgSets();
    //runWebsiteLoadRegionFlickerEffect(region_legend_description_set);

    function drawHeadings() {
        var heading = JAPAN.text(370, 40, "Find " + meta['total'] + " Sake Brands");
        heading.attr(MAIN_HEADING_TEXT_ATTRIBUTES);
        var sub_heading_by_regions = JAPAN.text(178, 100, "By Region");
        sub_heading_by_regions.attr(SUB_HEADING_TEXT_ATTRIBUTES);
        var sub_heading_by_prefecture = JAPAN.text(778, 200, "By Prefecture");
        sub_heading_by_prefecture.attr(SUB_HEADING_TEXT_ATTRIBUTES);
        var sub_heading_by_grade = JAPAN.text(820, 100, "By Premium Grade");
        sub_heading_by_grade.attr(SUB_HEADING_TEXT_ATTRIBUTES);
    }

    function fillPrefecturesByRegions() {
        for (var i = 0; i < NUMBER_OF_REGIONS; i++) {
            var region_name = INDEX_TO_REGION_NAME[i];
            var range = REGION_NAME_TO_PREFECTURE_INDEX_RANGE[region_name];
            var region_color = REGION_NAME_TO_COLOR[region_name];
            fillPrefectureRangesByRegion(region_color, range[0], range[1]);
        }
    }

    function bindEventsToRegionLegendAndPieChart() {
        for (var i = 0; i < NUMBER_OF_REGIONS; i++) {
            var region_name = INDEX_TO_REGION_NAME[i];
            bindPieSliceAnimationEvent(regionNamesToRegionPieSlices[region_name], region_name);

            var range = REGION_NAME_TO_PREFECTURE_INDEX_RANGE[region_name];
            bindRegionLegendPolygon(region_name, range[0], range[1]);
            bindRegionLegendDescription(region_name, range[0], range[1]);
        }
    }

    function bindRegionLegendPolygon(region_name, start, limit) {
        var poly = regionNamesToRegionLegendPolygons[region_name];
        var slice = regionNamesToRegionPieSlices[region_name];
        bindRegionLegendEvents(slice, poly, poly, start, limit)
    }

    function bindRegionLegendDescription(region_name, start, limit) {
        var poly = regionNamesToRegionLegendPolygons[region_name];
        var description = regionNamesToRegionLegendDescriptions[region_name];
        var slice = regionNamesToRegionPieSlices[region_name];
        bindRegionLegendEvents(slice, description, poly, start, limit);
    }

    function bindRegionLegendEvents(slice, eventSource, toAnimate, start, limit) {
        handleMouseEvents(eventSource[0], toAnimate, POLYGON_TRANSFORM_SCALE_UP, TRANSFORM_SCALE_NORMAL, triggerMouseOverEvent, triggerMouseOutEvent);
        function triggerMouseOverEvent() {
            triggerPieSliceEvent(slice.events, "mouseover");
            for (var idx = start; idx < limit; idx++) {
                triggerPrefectureMouseEvent(idx, MOUSEOVER_EVENT, true);
            }
        }

        function triggerMouseOutEvent() {
            triggerPieSliceEvent(slice.events, "mouseout");
            for (var idx = start; idx < limit; idx++) {
                triggerPrefectureMouseEvent(idx, MOUSEOUT_EVENT, true);
            }
        }
    }

    function triggerPieSliceEvent(events, eventName) {
        $.each(events, function (index, event) {
            if (event && event.name === eventName) {
                event.f();
            }
        });
    }

    function drawRegionPieChart() {
        var data = [];
        var legendLabels = [];
        var colors = [];
        var hoverTitles = [];
        var sliceHandles = [];
        var total = meta['total'];
        $.each(meta['byRegion'], function (regionName, regionData) {
            data.push(regionData['total']);
            hoverTitles.push(regionData['name'] + " (" + calculateMarketSharePercentage(regionData['total']) + "%)");
            colors.push(REGION_NAME_TO_COLOR[regionData['name']]);
            sliceHandles.push(regionData['name']);
            legendLabels.push(regionData['name'] + " (" + regionData['total'] + ")");
        });

        var pie = JAPAN.pielicious(110, 200, 90, {
            data: data,
            colors: colors,
            titles: hoverTitles,
            handles: sliceHandles,
            hrefs: [],
            gradient: {darkness: 12, lightness: 9, degrees: 180},
            cursor: "pointer",
            marker: "rect",
            threeD: {height: 10, tilt: 0.8},
            legend: {labels: legendLabels, x: 228, y: 128, fontSize: 14, fontFamily: PALATINO_FONT_FAMILY},
            evolution: true,
            orientation: 211,
            animation: "elastic"
        });

        for (var index = 0; index < pie.slices.length; index++) {
            var slice = pie.slices[index];
            var name = slice.handle;
            regionNamesToRegionPieSlices[name] = slice;
            region_pie_slice_set.push(slice);

            var marker = pie.markers[index];
            regionNamesToRegionLegendPolygons[name] = marker;
            region_legend_polygon_set.push(marker);

            var text = pie.descriptions[index];
            regionNamesToRegionLegendDescriptions[name] = text;
            region_legend_description_set.push(text);
        }

        function calculateMarketSharePercentage(sliceValue) {
            return (sliceValue / (total / 100)).toFixed(1);
        }
    }

    function drawTotalPerPrefectureNameBreakdown() {
        var sortedPrefectureNames = sortedKeys(meta['byPrefecture']);
        var prefecture_name_total_poly_x_coord = 560;
        var prefecture_name_total_x_coord = 600;
        var prefecture_name_total_poly_y_coord = 227;
        var prefecture_name_total_y_coord = 236;
        var prefectureCounter = 0;
        $.each(sortedPrefectureNames, function (index, prefectureName) {
            var total = meta['byPrefecture'][prefectureName]['total'];
            var prefecture_region = PREFECTURE_NAME_TO_REGION_NAME[prefectureName];
            var region_color = REGION_NAME_TO_COLOR[prefecture_region];
            var prefectureIndex = PREFECTURE_NAME_TO_INDEX[prefectureName];

            var poly = JAPAN.path("M " + prefecture_name_total_poly_x_coord + ", " + prefecture_name_total_poly_y_coord + " l 28,0  0,16  -28,0  0,-16z");
            poly.attr(getPolygonAttributes(prefectureName, region_color));
            totals_per_prefecture_name_polygon_set.push(poly);

            var poly_text = JAPAN.text(prefecture_name_total_x_coord, prefecture_name_total_y_coord, prefectureName + " (" + total + ")");
            totals_per_prefecture_name_set.push(poly_text);
            bindAnimationEvent(poly, poly_text, prefectureIndex);

            prefecture_name_total_y_coord += 30;
            prefecture_name_total_poly_y_coord += 30;
            prefectureCounter++;
            if (prefectureCounter % 14 == 0) {
                prefecture_name_total_poly_x_coord += 170;
                prefecture_name_total_x_coord += 170;
                prefecture_name_total_poly_y_coord = 227;
                prefecture_name_total_y_coord = 236;
            }
        });
    }

    function drawTotalPerSakeClassificationBreakdown() {
        var totalJD = meta['byClassification']['Junmai Daiginjo']['total'];
        var totalJG = meta['byClassification']['Junmai Ginjo']['total'];
        var totalJ = meta['byClassification']['Junmai']['total'];
        var totalTJ = meta['byClassification']['Tokubetsu Junmai']['total'];

        totals_per_sake_classification_set.push(JAPAN.text(690, 130, "Junmai Daiginjo (" + totalJD + ")"));
        totals_per_sake_classification_set.push(JAPAN.text(850, 130, "Junmai Ginjo (" + totalJG + ")"));
        totals_per_sake_classification_set.push(JAPAN.text(690, 160, "Tokubetsu Junmai (" + totalTJ + ")"));
        totals_per_sake_classification_set.push(JAPAN.text(850, 160, "Junmai (" + totalJ + ")"));
    }

    function drawPointerLines() {
        lines_set.push(JAPAN.path("M441 501 429 451")); // Tokyo
        lines_set.push(JAPAN.path("M411 513 422 463")); // Kanagawa
        lines_set.push(JAPAN.path("M275 565 280 540")); // Wakayama
        lines_set.push(JAPAN.path("M256 545 274 500")); // Osaka
        lines_set.attr({"stroke": POINTER_LINE_COLOR, "stroke-width": "0.5"});
        var round_border = JAPAN.path("M301,615 L276,615 L185,687");
        round_border.attr({fill: "none", "fill-opacity": 1, "fill-rule": "nonzero", "stroke": "#551111"});
        round_border.scale(3.0);
    }

    function bindEventsToPrefectureTerritory() {
        for (var prefectureArrayIndex in PREFECTURE_PATHS) {
            (function (prefecture) {
                var scaleUp = PREFECTURE_TRANSFORM_SCALE_UP;
                if (INDEX_TO_PREFECTURE[prefectureArrayIndex] === HOKKAIDO_REGION) {
                    scaleUp = HOKKAIDO_PREFECTURE_TRANSFORM_SCALE_UP;
                } else if (INDEX_TO_PREFECTURE[prefectureArrayIndex] === "Okinawa") {
                    scaleUp = OKINAWA_TRANSFORM_SCALE_UP;
                }

                handleMouseEvents(prefecture[0], prefecture, scaleUp, TRANSFORM_SCALE_NORMAL);
                prefecture.attr(getTotalByPrefectureTitleAttribute(prefectureArrayIndex));
                prefecture.localId = prefectureArrayIndex;
                prefecture.isPrefecture = true;
                var glow = prefecture.glow().attr({opacity: "0.1"});
                prefecture.activeGlow = glow;
                glow.hide();
                prefecture_territory_set.push(prefecture);

                var prefectureName = INDEX_TO_PREFECTURE[prefectureArrayIndex];
                PREFECTURE_NAMES[prefectureArrayIndex].attr({'text': prefectureName});
                PREFECTURE_NAMES[prefectureArrayIndex].localId = prefectureArrayIndex;
            })(PREFECTURE_PATHS[prefectureArrayIndex]);
        }
    }

    function bindEventsToPrefectureNames() {
        for (var nameArrayIndex in PREFECTURE_NAMES) {
            (function (prefectureNameText) {
                var scaleUp = PREFECTURE_TRANSFORM_SCALE_UP;
                if (INDEX_TO_PREFECTURE[nameArrayIndex] === HOKKAIDO_REGION) {
                    scaleUp = HOKKAIDO_PREFECTURE_TRANSFORM_SCALE_UP;
                } else if (INDEX_TO_PREFECTURE[nameArrayIndex] === "Okinawa") {
                    scaleUp = OKINAWA_TRANSFORM_SCALE_UP;
                }

                handleMouseEvents(prefectureNameText[0], PREFECTURE_PATHS[nameArrayIndex], scaleUp, TRANSFORM_SCALE_NORMAL);
                prefectureNameText.attr(getTotalByPrefectureTitleAttribute(nameArrayIndex));
                prefecture_name_set.push(prefectureNameText);
            })(PREFECTURE_NAMES[nameArrayIndex]);
        }
    }

    function assignStyleAttributesToSvgSets() {
        prefecture_territory_set.attr({"fill-rule": "nonzero", cursor: "pointer", stroke: BORDER_STROKE_COLOR, "stroke-width": BORDER_STROKE_WIDTH});
        prefecture_name_set.attr(MAP_TEXT_ATTRIBUTES);
        totals_per_prefecture_name_set.attr(MAP_LEGEND_TEXT_ATTRIBUTES);
        totals_per_sake_classification_set.attr(MAP_LEGEND_TEXT_ATTRIBUTES);
    }

    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    function bindPieSliceAnimationEvent(sliceNamePoly, region_name) {
        // Pie slice will be animated on mouse [over|out] through the region legend/description mouse [over|out] events
        handleMouseEvents(sliceNamePoly[0], null, PIE_SLICE_TRANSFORM_SCALE_UP, TRANSFORM_SCALE_NORMAL, triggerMouseOverEvent, triggerMouseOutEvent);

        function triggerMouseOverEvent() {
            triggerRegionMouseEvent(region_name, MOUSEOVER_EVENT);
        }

        function triggerMouseOutEvent() {
            triggerRegionMouseEvent(region_name, MOUSEOUT_EVENT);
        }
    }

    function bindAnimationEvent(prefectureNamePoly, prefectureNameText, prefectureIndex) {
        handleMouseEvents(prefectureNamePoly[0], prefectureNamePoly, POLYGON_TRANSFORM_SCALE_UP, TRANSFORM_SCALE_NORMAL, triggerMouseOverEvent, triggerMouseOutEvent);
        handleMouseEvents(prefectureNameText[0], prefectureNamePoly, POLYGON_TRANSFORM_SCALE_UP, TRANSFORM_SCALE_NORMAL, triggerMouseOverEvent, triggerMouseOutEvent);

        function triggerMouseOverEvent() {
            triggerPrefectureMouseEvent(prefectureIndex, MOUSEOVER_EVENT, false);
        }

        function triggerMouseOutEvent() {
            triggerPrefectureMouseEvent(prefectureIndex, MOUSEOUT_EVENT, false);
        }
    }

    function triggerPrefectureMouseEvent(index, eventName, isTriggeredByRegion) {
        var prefecture = PREFECTURE_PATHS[index];
        if (isTriggeredByRegion) {
            $(prefecture[0]).data('isTriggeredByRegion', true);
        }
        $(prefecture[0]).trigger(eventName);
    }

    function triggerRegionMouseEvent(regionName, eventName) {
        var region = regionNamesToRegionLegendPolygons[regionName];
        $(region[0]).trigger(eventName);
    }

    function getPolygonAttributes(region_name, region_color) {
        return {'title': region_name, 'fill': region_color, 'fill-rule': "nonzero", 'stroke': WHITE_COLOR, 'stroke-width': '0.1', 'cursor': 'pointer'};
    }

    function getTotalByPrefectureTitleAttribute(index) {
        var prefectureName = INDEX_TO_PREFECTURE[index];
        var prefectureTotalBrands = meta['byPrefecture'][prefectureName]
        var total = is(prefectureTotalBrands, "undefined") ? 0 : prefectureTotalBrands['total'];
        return {'title': prefectureName + ' (' + total + ')'}
    }

    function attachClickHandlerToSvgSets() {
        prefecture_territory_set.click(svgElementClickHandler);
        prefecture_name_set.click(svgElementClickHandler);
        region_legend_polygon_set.click(svgElementClickHandler);
        region_pie_slice_set.click(svgElementClickHandler);
        region_legend_description_set.click(svgElementClickHandler);
        totals_per_prefecture_name_set.click(svgElementClickHandler);
        totals_per_sake_classification_set.click(svgElementClickHandler);
        totals_per_prefecture_name_polygon_set.click(svgElementClickHandler);
    }
}

function renderResultPage(results, targetSelector) {
    var html = "";
    var metaToGenerate = {};
    $.each(results, function () {
        var brand = this;
        var id = "sake-parameter-meta-" + brand['_id'];
        metaToGenerate[id] = {'smv': brand['smv'], 'acidity': brand['acidity']};

        var website_url = brand['website'];
        if (website_url !== 'n/a') {
            website_url = '<a href="' + website_url + '" title="' + brand['brewery'] + '" target="_blank">' + getHostname(website_url) + '</a>';
        }

        var postFermentationHandling = brand['postFermentationHandling'];
        var yeastStarter = brand['yeastStarter'];

        var fermentation = '';
        if (postFermentationHandling !== 'n/a') {
            $.each(postFermentationHandling, function () {
                var ferm = this;
                fermentation += '<a class="tooltip" href="javascript:void(0)" title="' + ferm['description'] + '">' + ferm['name'] + '</a>, ';
            });
            fermentation = "<div class='sake-parameter-stats-fermentation'><span class='heading'>Post-fermentation</span>: " + fermentation.substring(0, fermentation.length - 2) + "</div>";
        }

        var yeast = '';
        if (yeastStarter !== 'n/a') {
            yeast += '<a class="tooltip" href="javascript:void(0)" title="' + yeastStarter['description'] + '">' + yeastStarter['name'] + '</a>, ';
            yeast = "<div class='sake-parameter-stats-yeast'><span class='heading'>Yeast starter</span>: " + yeast.substring(0, yeast.length - 2) + "</div>";
        }

        html += " <div class='flex-container-row'>"
        html += "     <div class='flex-item product-photo-container'>";
        html += "         <img src='" + brand['productPhoto'] + "' />";
        html += "     </div>";
        html += "     <div class='flex-item sake-parameters-container body'>";
        html += "       <div class='sake-parameter-brand-name heading'>" + brand['name'] + "</div>";
        html += "       <div class='sake-parameter-description'>" + brand['description'] + "</div>";
        html += "       <div class='flex-container-column sake-parameter-stats'>";
        html += "           <div class='sake-parameter-stats-classification'><span class='heading'>Classification</span>: " + brand['classification'] + "</div>";
        html += "           <div class='sake-parameter-stats-type'><span class='heading'>Grade</span>: " + brand['grade'] + "</div>";
        html += "           <div class='sake-parameter-stats-seimaibuai'><span class='heading'>Seimaibuai</span>: " + brand['seimaibuai'] + "</div>";
        html += "           <div class='sake-parameter-stats-amino-acid-level'><span class='heading'>Amino Acid Level</span>: " + brand['aminoAcidLevel'] + "</div>";
        html += "           <div class='sake-parameter-stats-alcohol'><span class='heading'>Alcohol</span>: " + brand['alcohol'] + "</div>";
        html += "           <div class='sake-parameter-stats-water'><span class='heading'>Water</span>: " + brand['water'] + "</div>";
        html += "           <div class='sake-parameter-stats-rice'><span class='heading'>Rice</span>: " + brand['rice'] + "</div>";
        html += "           <div class='sake-parameter-stats-brewery'><span class='heading'>Brewery</span>: " + brand['brewery'] + "</div>";
        html += "           <div class='sake-parameter-stats-website'><span class='heading'>Website</span>: " + website_url + "</div>";
        html += "           <div class='sake-parameter-stats-prefecture'><span class='heading'>Prefecture</span>: " + brand['prefecture'] + "</div>";
        html += "           <div class='sake-parameter-stats-region'><span class='heading'>Region</span>: " + brand['region'] + "</div>";
        html += fermentation;
        html += yeast;
        html += "       </div>";
        html += "       <div class='sake-parameter-meta' id='" + id + "'></div>";
        html += "     </div>";
        html += " </div>";
    });

    $(targetSelector).html(html);
    $.each(metaToGenerate, function (key, values) {
        drawMetaContaier(key, values['smv'], values['acidity']);
    });

    $('a.tooltip').tooltip({ tooltipClass: "custom-tooltip-styling" });
    $('a.tooltip').tooltip("option", "position", { my: "left bottom-5", at: "center top" });

    function getHostname(href) {
        var link = document.createElement("a");
        link.href = href;
        return link.hostname;
    };
}

function initPrefecturePaths() {
    // PREFECTURE_PATHS["0"] = JAPAN.path("M200.069,697.212 L199.908,697.228 L199.649,697.139 L199.625,697.024 L199.739,696.942 L199.940,696.923 L200.172,696.955 L200.222,697.086 Z M202.911,694.948 L202.775,695.043 L202.665,695.021 L202.594,694.923 L202.557,694.748 L202.593,694.604 L202.702,694.619 L202.783,694.675 L202.881,694.690 L202.967,694.780 Z M203.825,693.830 L203.730,693.884 L203.640,693.813 L203.608,693.689 L203.658,693.575 L203.769,693.575 L203.870,693.690 L203.886,693.761 Z M202.639,693.516 L202.655,693.624 L202.561,693.649 L202.493,693.599 L202.165,693.538 L202.116,693.512 L202.237,693.446 L202.301,693.283 L202.450,693.283 Z M200.204,692.382 L200.476,692.627 L200.717,692.587 L201.163,692.674 L201.618,692.829 L201.899,692.997 L201.906,693.339 L201.643,693.783 L201.111,694.400 L200.848,694.407 L199.595,694.042 L198.849,693.960 L198.672,693.805 L198.872,693.461 L199.039,693.565 L199.154,693.403 L199.277,693.474 L199.414,693.583 L199.573,693.537 L199.646,693.410 L199.725,692.956 L199.888,692.482 L199.951,692.258 L200.036,692.243 L200.131,692.295 Z M190.784,691.151 L190.947,691.218 L190.963,691.356 L190.871,691.504 L190.714,691.605 L190.589,691.550 L190.104,691.578 L190.000,691.512 L190.000,691.373 L190.084,691.227 L190.220,691.142 L190.367,691.174 Z M205.842,692.118 L205.744,692.684 L205.582,693.177 L205.211,693.513 L204.791,693.552 L204.355,693.419 L204.147,693.168 L204.408,692.859 L204.285,692.762 L204.245,692.609 L204.178,692.466 L203.976,692.396 L203.773,692.351 L203.647,692.262 L203.656,692.170 L203.860,692.124 L203.941,692.034 L204.076,691.819 L204.124,691.767 L204.280,691.748 L204.338,691.915 L204.495,692.057 L204.595,692.122 L204.729,692.155 L205.010,692.158 L205.142,692.134 L205.261,692.076 L205.393,691.897 L205.496,691.662 L205.622,691.461 L205.821,691.379 L205.966,691.269 L206.378,690.504 L206.551,690.282 L206.634,690.246 L206.725,690.337 L206.757,690.502 L206.689,690.629 L206.591,690.732 L206.464,690.966 L206.022,691.565 Z M211.279,689.868 L211.077,689.857 L210.926,689.781 L210.905,689.578 L211.068,689.388 L211.257,689.363 L211.430,689.473 L211.495,689.668 L211.387,689.815 Z M211.277,688.329 L211.318,688.477 L211.091,688.372 L211.081,688.234 L211.185,688.245 Z M217.281,687.765 L216.837,687.805 L216.630,687.755 L216.509,687.594 L216.525,687.435 L216.723,687.373 L216.752,687.234 L216.803,687.102 L216.963,687.084 L217.268,687.225 L217.359,687.349 L217.426,687.617 Z M219.099,688.107 L219.185,688.145 L219.445,688.122 L219.651,688.177 L219.906,688.309 L220.123,688.473 L220.213,688.629 L220.107,688.728 L219.861,688.786 L219.385,688.843 L218.380,688.833 L217.895,688.719 L217.878,688.479 L217.938,688.321 L218.106,687.591 L218.129,687.116 L218.088,686.965 L217.967,686.735 L218.134,686.778 L218.261,686.846 L218.369,686.950 L218.457,687.110 L218.590,687.475 L218.732,687.730 Z M217.895,686.159 L217.945,686.299 L217.868,686.287 L217.862,686.338 L217.714,686.089 L217.812,686.067 Z M198.683,674.894 L198.663,674.897 L198.613,674.887 L198.645,674.808 Z M198.547,674.708 L198.528,674.817 L198.480,674.722 Z M198.142,674.638 L198.121,674.670 L198.092,674.627 Z M197.778,674.558 L197.569,674.598 L197.604,674.455 L197.814,674.408 L197.885,674.412 L197.972,674.566 Z M198.870,674.437 L198.869,674.448 L198.841,674.435 Z M198.586,674.065 L198.586,674.126 L198.549,674.123 Z M289.136,674.929 L289.006,674.935 L288.878,674.899 L288.656,674.806 L288.661,674.644 L288.758,674.456 L288.930,674.240 L289.059,674.175 L289.155,674.197 L289.418,674.410 L289.268,674.570 L289.212,674.690 L289.191,674.823 Z M210.160,673.264 L210.145,673.287 L210.117,673.269 L210.137,673.234 Z M199.575,672.443 L199.563,672.459 L199.560,672.429 Z M199.689,672.562 L199.603,672.583 L199.570,672.468 L199.649,672.419 L199.723,672.527 Z M289.870,673.557 L289.787,673.562 L289.691,673.512 L289.562,673.358 L289.546,673.193 L289.692,673.166 L289.920,673.234 L290.000,673.371 L289.936,673.503 Z M243.206,670.531 L243.115,670.661 L243.020,670.604 L242.991,670.447 L242.992,670.245 L243.038,669.976 L243.134,669.813 L243.251,669.783 L243.315,669.872 L243.328,670.021 L243.238,670.355 Z M250.107,669.455 L250.029,669.616 L249.974,669.559 L249.950,669.471 L250.048,669.322 L250.098,669.339 Z M250.626,668.068 L250.497,668.114 L250.374,668.050 L250.438,667.832 L250.605,667.733 L250.644,667.782 L250.623,667.855 L250.683,667.885 L250.699,667.954 Z M236.568,668.583 L236.494,668.610 L236.417,668.595 L236.274,668.466 L236.159,668.200 L235.944,668.101 L235.692,668.027 L235.502,667.915 L235.436,667.734 L235.544,667.604 L235.744,667.519 L235.958,667.474 L236.080,667.463 L236.288,667.502 L236.490,667.609 L236.655,667.774 L236.753,667.982 L236.754,668.104 L236.717,668.233 L236.552,668.488 Z M241.903,664.997 L241.816,665.090 L241.701,665.084 L241.557,665.109 L241.487,665.049 L241.560,664.907 L241.647,664.830 L241.772,664.807 L241.884,664.861 Z M248.563,663.127 L248.576,663.499 L248.275,663.554 L247.959,663.416 L247.915,663.211 L248.082,663.141 L248.397,663.177 Z M254.422,663.571 L254.403,663.622 L254.268,663.615 L253.886,664.252 L253.638,664.500 L253.329,664.598 L252.802,664.623 L252.645,664.683 L252.560,664.765 L252.455,664.904 L252.366,665.056 L252.328,665.171 L252.362,665.214 L252.487,665.274 L252.480,665.396 L252.439,665.494 L252.050,665.640 L251.834,665.671 L251.614,665.652 L251.430,665.566 L251.199,665.867 L250.580,666.500 L250.437,666.585 L250.295,666.597 L250.189,666.651 L250.144,666.853 L250.061,666.897 L249.242,666.895 L249.116,666.917 L249.020,666.973 L248.867,667.181 L248.915,667.283 L249.052,667.343 L249.169,667.429 L249.227,667.599 L249.265,667.974 L249.321,668.143 L249.444,668.311 L249.694,668.522 L249.807,668.699 L249.594,668.757 L249.362,668.681 L249.120,668.565 L248.878,668.504 L248.729,668.603 L248.122,669.680 L248.043,669.899 L248.010,670.145 L248.091,670.309 L248.281,670.306 L248.498,670.260 L248.658,670.293 L248.546,670.564 L248.338,670.905 L248.087,671.137 L247.842,671.088 L247.685,671.213 L247.489,671.551 L247.309,671.617 L246.620,671.610 L246.688,671.123 L246.448,670.212 L246.478,669.906 L246.717,669.940 L246.946,669.704 L247.125,669.371 L247.217,669.113 L247.429,669.141 L247.584,668.943 L247.679,668.685 L247.713,668.537 L247.677,668.264 L247.515,667.688 L247.475,667.413 L247.499,667.107 L247.604,666.978 L247.797,666.954 L248.189,666.966 L248.338,666.948 L248.473,666.886 L248.532,666.750 L248.575,666.751 L248.755,666.425 L248.777,666.355 L249.174,666.133 L249.627,665.997 L250.038,665.795 L250.308,665.380 L250.336,665.147 L250.260,664.979 L250.082,664.877 L249.539,664.783 L249.438,664.640 L249.430,664.438 L249.444,664.205 L249.356,663.772 L249.361,663.669 L249.445,663.649 L249.849,663.673 L250.374,663.643 L250.639,663.700 L250.801,663.867 L250.780,663.977 L250.697,664.088 L250.650,664.222 L250.731,664.402 L250.834,664.461 L250.957,664.461 L251.457,664.336 L252.089,663.958 L251.999,663.733 L252.095,663.574 L252.578,663.211 L252.633,663.138 L252.693,662.877 L252.860,662.808 L253.000,662.574 L253.447,662.309 L253.550,662.140 L253.597,661.899 L253.785,661.483 L253.794,661.197 L254.683,662.154 L254.755,662.369 L254.668,662.495 L254.663,662.585 L254.753,662.795 L254.702,662.895 L254.585,663.033 L254.423,663.357 Z M250.266,660.812 L250.204,660.845 L250.074,660.824 L249.946,660.767 L249.854,660.661 L249.888,660.538 L249.861,660.439 L249.951,660.321 L250.182,660.318 L250.303,660.458 L250.263,660.688 Z M256.142,659.349 L256.068,659.454 L255.867,659.440 L255.628,659.323 L255.457,659.189 L255.458,659.081 L255.603,659.058 L255.686,658.942 L255.841,658.855 L256.021,658.907 L256.106,659.017 L256.137,659.104 Z M250.262,659.448 L249.953,659.557 L250.071,659.358 L250.677,658.664 L250.775,658.493 L250.841,658.494 L250.747,658.820 L250.540,659.170 Z M258.668,654.235 L258.505,654.377 L258.326,654.709 L258.211,654.826 L258.066,654.773 L258.006,654.974 L257.908,655.006 L257.800,654.979 L257.706,655.003 L257.555,655.116 L257.385,655.149 L257.216,655.109 L257.066,655.000 L257.001,654.872 L256.981,654.705 L256.993,654.542 L257.025,654.421 L257.084,654.305 L257.138,654.275 L257.407,654.240 L257.858,654.307 L258.075,654.305 L258.266,654.198 L258.443,654.056 L259.030,653.795 L259.102,653.876 L258.993,654.044 Z M253.735,648.517 L253.712,648.672 L253.605,648.574 L253.578,648.363 L253.657,648.395 L253.679,648.469 Z M262.060,650.783 L261.901,650.841 L261.696,650.771 L261.608,650.585 L261.578,650.394 L261.544,650.305 L261.291,650.229 L261.249,650.050 L261.346,649.689 L261.111,648.967 L261.173,648.810 L261.222,648.597 L261.293,648.099 L261.355,648.039 L261.533,647.981 L261.902,647.801 L262.116,648.060 L262.253,648.814 L262.386,649.147 L262.511,649.255 L262.670,649.354 L262.803,649.473 L262.861,649.641 L262.798,649.859 L262.519,650.235 L262.395,650.500 L262.241,650.656 Z M265.178,646.173 L265.254,646.219 L265.505,646.208 L265.596,646.220 L265.632,646.263 L265.618,646.453 L265.530,646.595 L265.335,646.431 L265.213,646.384 L265.003,646.394 L264.969,646.377 L264.920,646.265 L264.923,646.126 L265.018,646.006 L265.110,646.074 Z M264.352,646.430 L264.216,646.479 L264.202,646.269 L264.269,646.047 L264.378,645.867 L264.468,645.812 L264.504,645.850 L264.538,645.992 L264.480,646.131 L264.421,646.352 Z M265.080,644.379 L265.208,644.448 L265.633,644.393 L265.480,644.598 L265.416,644.705 L265.431,644.799 L265.575,644.917 L265.848,645.041 L265.951,645.114 L266.285,645.062 L266.538,645.278 L266.575,645.545 L266.269,645.649 L266.065,645.446 L266.000,645.363 L265.881,645.433 L265.883,645.516 L265.822,645.612 L265.750,645.669 L265.573,645.419 L265.562,645.382 L265.432,645.371 L265.187,645.415 L265.081,645.383 L265.042,645.292 L265.017,644.969 L264.995,644.848 L264.681,644.393 L264.609,644.194 L264.782,644.126 L265.151,644.128 Z M274.024,642.833 L273.825,642.929 L273.575,642.917 L273.077,642.760 L273.789,642.152 L274.280,641.868 L274.417,641.752 L274.428,641.973 L274.320,642.304 L274.163,642.628 Z M270.840,640.976 L270.782,641.051 L270.604,641.041 L270.527,641.058 L270.387,641.158 L269.900,641.367 L269.668,641.428 L269.575,641.659 L269.468,641.696 L269.234,641.823 L268.918,642.376 L268.681,642.503 L268.642,642.556 L268.283,642.913 L268.150,642.979 L267.848,642.860 L267.689,642.871 L267.775,643.049 L267.694,643.193 L267.600,643.288 L267.375,643.407 L267.509,643.523 L267.801,643.722 L267.930,643.852 L267.321,644.246 L267.220,644.263 L267.164,644.539 L267.015,644.546 L266.811,644.490 L266.588,644.577 L266.735,644.662 L266.852,644.844 L266.909,645.028 L266.870,645.112 L266.751,645.065 L266.424,644.748 L265.833,644.352 L265.759,644.188 L265.772,644.001 L265.764,643.822 L265.631,643.680 L265.482,643.873 L265.321,643.879 L264.921,643.682 L264.524,643.596 L264.355,643.536 L264.202,643.415 L264.202,643.334 L264.399,643.249 L264.498,643.261 L264.604,643.333 L264.931,643.227 L265.308,643.330 L265.648,643.342 L265.873,642.966 L265.449,642.961 L265.285,642.885 L265.148,642.700 L265.307,642.595 L265.434,642.478 L265.566,642.382 L265.847,642.326 L265.933,642.283 L266.170,642.102 L266.335,641.925 L266.344,641.895 L266.643,641.863 L266.913,641.883 L267.132,641.818 L267.290,641.536 L267.509,641.618 L267.724,641.550 L267.899,641.382 L268.005,641.167 L268.087,641.301 L268.206,641.381 L268.480,641.531 L268.675,641.044 L268.989,640.774 L269.743,640.357 L269.603,640.811 L269.633,640.935 L269.818,640.981 L269.951,640.917 L270.069,640.755 L270.286,640.354 L270.214,640.090 L270.281,640.000 L270.451,640.010 L270.570,640.194 L270.682,640.621 L270.728,640.705 L270.847,640.856 Z");
    // PREFECTURE_PATHS["0"].scale(4.0); // Okinawa
    // http://petercollingridge.appspot.com/svg-transforms
    PREFECTURE_PATHS["0"] = JAPAN.path("M80.276 783.006 L79.632 783.07 L78.596 782.714 L78.5 782.254 L78.956 781.926 L79.76 781.85 L80.688 781.978 L80.888 782.502 ZM91.644 773.95 L91.1 774.33 L90.66 774.242 L90.376 773.85 L90.228 773.15 L90.372 772.574 L90.808 772.634 L91.132 772.858 L91.524 772.918 L91.868 773.278 ZM95.3 769.478 L94.92 769.694 L94.56 769.41 L94.432 768.914 L94.632 768.458 L95.076 768.458 L95.48 768.918 L95.544 769.202 ZM90.556 768.222 L90.62 768.654 L90.244 768.754 L89.972 768.554 L88.66 768.31 L88.464 768.206 L88.948 767.942 L89.204 767.29 L89.8 767.29 ZM80.816 763.686 L81.904 764.666 L82.868 764.506 L84.652 764.854 L86.472 765.474 L87.596 766.146 L87.624 767.514 L86.572 769.29 L84.444 771.758 L83.392 771.786 L78.38 770.326 L75.396 769.998 L74.688 769.378 L75.488 768.002 L76.156 768.418 L76.616 767.77 L77.108 768.054 L77.656 768.49 L78.292 768.306 L78.584 767.798 L78.9 765.982 L79.552 764.086 L79.804 763.19 L80.144 763.13 L80.524 763.338 ZM43.136 758.762 L43.788 759.03 L43.852 759.582 L43.484 760.174 L42.856 760.578 L42.356 760.358 L40.416 760.47 L40 760.206 L40 759.65 L40.336 759.066 L40.88 758.726 L41.468 758.854 ZM103.368 762.63 L102.976 764.894 L102.328 766.866 L100.844 768.21 L99.164 768.366 L97.42 767.834 L96.588 766.83 L97.632 765.594 L97.14 765.206 L96.98 764.594 L96.712 764.022 L95.904 763.742 L95.092 763.562 L94.588 763.206 L94.624 762.838 L95.44 762.654 L95.764 762.294 L96.304 761.434 L96.496 761.226 L97.12 761.15 L97.352 761.818 L97.98 762.386 L98.38 762.646 L98.916 762.778 L100.04 762.79 L100.568 762.694 L101.044 762.462 L101.572 761.746 L101.984 760.806 L102.488 760.002 L103.284 759.674 L103.864 759.234 L105.512 756.174 L106.204 755.286 L106.536 755.142 L106.9 755.506 L107.028 756.166 L106.756 756.674 L106.364 757.086 L105.856 758.022 L104.088 760.418 ZM125.116 753.63 L124.308 753.586 L123.704 753.282 L123.62 752.47 L124.272 751.71 L125.028 751.61 L125.72 752.05 L125.98 752.83 L125.548 753.418 ZM125.108 747.474 L125.272 748.066 L124.364 747.646 L124.324 747.094 L124.74 747.138 ZM149.124 745.218 L147.348 745.378 L146.52 745.178 L146.036 744.534 L146.1 743.898 L146.892 743.65 L147.008 743.094 L147.212 742.566 L147.852 742.494 L149.072 743.058 L149.436 743.554 L149.704 744.626 ZM156.396 746.586 L156.74 746.738 L157.78 746.646 L158.604 746.866 L159.624 747.394 L160.492 748.05 L160.852 748.674 L160.428 749.07 L159.444 749.302 L157.54 749.53 L153.52 749.49 L151.58 749.034 L151.512 748.074 L151.752 747.442 L152.424 744.522 L152.516 742.622 L152.352 742.018 L151.868 741.098 L152.536 741.27 L153.044 741.542 L153.476 741.958 L153.828 742.598 L154.36 744.058 L154.928 745.078 ZM151.58 738.794 L151.78 739.354 L151.472 739.306 L151.448 739.51 L150.856 738.514 L151.248 738.426 ZM74.732 693.734 L74.652 693.746 L74.452 693.706 L74.58 693.39 ZM74.188 692.99 L74.112 693.426 L73.92 693.046 ZM72.568 692.71 L72.484 692.838 L72.368 692.666 ZM71.112 692.39 L70.276 692.55 L70.416 691.978 L71.256 691.79 L71.54 691.806 L71.888 692.422 ZM75.48 691.906 L75.476 691.95 L75.364 691.898 ZM74.344 690.418 L74.344 690.662 L74.196 690.65 ZM436.544 693.874 L436.024 693.898 L435.512 693.754 L434.624 693.382 L434.644 692.734 L435.032 691.982 L435.72 691.118 L436.236 690.858 L436.62 690.946 L437.672 691.798 L437.072 692.438 L436.848 692.918 L436.764 693.45 ZM120.64 687.214 L120.58 687.306 L120.468 687.234 L120.548 687.094 ZM78.3 683.93 L78.252 683.994 L78.24 683.874 ZM78.756 684.406 L78.412 684.49 L78.28 684.03 L78.596 683.834 L78.892 684.266 ZM439.48 688.386 L439.148 688.406 L438.764 688.206 L438.248 687.59 L438.184 686.93 L438.768 686.822 L439.68 687.094 L440 687.642 L439.744 688.17 ZM252.824 676.282 L252.46 676.802 L252.08 676.574 L251.964 675.946 L251.968 675.138 L252.152 674.062 L252.536 673.41 L253.004 673.29 L253.26 673.646 L253.312 674.242 L252.952 675.578 ZM280.428 671.978 L280.116 672.622 L279.896 672.394 L279.8 672.042 L280.192 671.446 L280.392 671.514 ZM282.504 666.43 L281.988 666.614 L281.496 666.358 L281.752 665.486 L282.42 665.09 L282.576 665.286 L282.492 665.578 L282.732 665.698 L282.796 665.974 ZM226.272 668.49 L225.976 668.598 L225.668 668.538 L225.096 668.022 L224.636 666.958 L223.776 666.562 L222.768 666.266 L222.008 665.818 L221.744 665.094 L222.176 664.574 L222.976 664.234 L223.832 664.054 L224.32 664.01 L225.152 664.166 L225.96 664.594 L226.62 665.254 L227.012 666.086 L227.016 666.574 L226.868 667.09 L226.208 668.11 ZM247.612 654.146 L247.264 654.518 L246.804 654.494 L246.228 654.594 L245.948 654.354 L246.24 653.786 L246.588 653.478 L247.088 653.386 L247.536 653.602 ZM274.252 646.666 L274.304 648.154 L273.1 648.374 L271.836 647.822 L271.66 647.002 L272.328 646.722 L273.588 646.866 ZM297.688 648.442 L297.612 648.646 L297.072 648.618 L295.544 651.166 L294.552 652.158 L293.316 652.55 L291.208 652.65 L290.58 652.89 L290.24 653.218 L289.82 653.774 L289.464 654.382 L289.312 654.842 L289.448 655.014 L289.948 655.254 L289.92 655.742 L289.756 656.134 L288.2 656.718 L287.336 656.842 L286.456 656.766 L285.72 656.422 L284.796 657.626 L282.32 660.158 L281.748 660.498 L281.18 660.546 L280.756 660.762 L280.576 661.57 L280.244 661.746 L276.968 661.738 L276.464 661.826 L276.08 662.05 L275.468 662.882 L275.66 663.29 L276.208 663.53 L276.676 663.874 L276.908 664.554 L277.06 666.054 L277.284 666.73 L277.776 667.402 L278.776 668.246 L279.228 668.954 L278.376 669.186 L277.448 668.882 L276.48 668.418 L275.512 668.174 L274.916 668.57 L272.488 672.878 L272.172 673.754 L272.04 674.738 L272.364 675.394 L273.124 675.382 L273.992 675.198 L274.632 675.33 L274.184 676.414 L273.352 677.778 L272.348 678.706 L271.368 678.51 L270.74 679.01 L269.956 680.362 L269.236 680.626 L266.48 680.598 L266.752 678.65 L265.792 675.006 L265.912 673.782 L266.868 673.918 L267.784 672.974 L268.5 671.642 L268.868 670.61 L269.716 670.722 L270.336 669.93 L270.716 668.898 L270.852 668.306 L270.708 667.214 L270.06 664.91 L269.9 663.81 L269.996 662.586 L270.416 662.07 L271.188 661.974 L272.756 662.022 L273.352 661.95 L273.892 661.702 L274.128 661.158 L274.3 661.162 L275.02 659.858 L275.108 659.578 L276.696 658.69 L278.508 658.146 L280.152 657.338 L281.232 655.678 L281.344 654.746 L281.04 654.074 L280.328 653.666 L278.156 653.29 L277.752 652.718 L277.72 651.91 L277.776 650.978 L277.424 649.246 L277.444 648.834 L277.78 648.754 L279.396 648.85 L281.496 648.73 L282.556 648.958 L283.204 649.626 L283.12 650.066 L282.788 650.51 L282.6 651.046 L282.924 651.766 L283.336 652.002 L283.828 652.002 L285.828 651.502 L288.356 649.99 L287.996 649.09 L288.38 648.454 L290.312 647.002 L290.532 646.71 L290.772 645.666 L291.44 645.39 L292 644.454 L293.788 643.394 L294.2 642.718 L294.388 641.754 L295.14 640.09 L295.176 638.946 L298.732 642.774 L299.02 643.634 L298.672 644.138 L298.652 644.498 L299.012 645.338 L298.808 645.738 L298.34 646.29 L297.692 647.586 ZM281.064 637.406 L280.816 637.538 L280.296 637.454 L279.784 637.226 L279.416 636.802 L279.552 636.31 L279.444 635.914 L279.804 635.442 L280.728 635.43 L281.212 635.99 L281.052 636.91 ZM304.568 631.554 L304.272 631.974 L303.468 631.918 L302.512 631.45 L301.828 630.914 L301.832 630.482 L302.412 630.39 L302.744 629.926 L303.364 629.578 L304.084 629.786 L304.424 630.226 L304.548 630.574 ZM281.048 631.95 L279.812 632.386 L280.284 631.59 L282.708 628.814 L283.1 628.13 L283.364 628.134 L282.988 629.438 L282.16 630.838 ZM314.672 611.098 L314.02 611.666 L313.304 612.994 L312.844 613.462 L312.264 613.25 L312.024 614.054 L311.632 614.182 L311.2 614.074 L310.824 614.17 L310.22 614.622 L309.54 614.754 L308.864 614.594 L308.264 614.158 L308.004 613.646 L307.924 612.978 L307.972 612.326 L308.1 611.842 L308.336 611.378 L308.552 611.258 L309.628 611.118 L311.432 611.386 L312.3 611.378 L313.064 610.95 L313.772 610.382 L316.12 609.338 L316.408 609.662 L315.972 610.334 ZM294.94 588.226 L294.848 588.846 L294.42 588.454 L294.312 587.61 L294.628 587.738 L294.716 588.034 ZM328.24 597.29 L327.604 597.522 L326.784 597.242 L326.432 596.498 L326.312 595.734 L326.176 595.378 L325.164 595.074 L324.996 594.358 L325.384 592.914 L324.444 590.026 L324.692 589.398 L324.888 588.546 L325.172 586.554 L325.42 586.314 L326.132 586.082 L327.608 585.362 L328.464 586.398 L329.012 589.414 L329.544 590.746 L330.044 591.178 L330.68 591.574 L331.212 592.05 L331.444 592.722 L331.192 593.594 L330.076 595.098 L329.58 596.158 L328.964 596.782 ZM340.712 578.85 L341.016 579.034 L342.02 578.99 L342.384 579.038 L342.528 579.21 L342.472 579.97 L342.12 580.538 L341.34 579.882 L340.852 579.694 L340.012 579.734 L339.876 579.666 L339.68 579.218 L339.692 578.662 L340.072 578.182 L340.44 578.454 ZM337.408 579.878 L336.864 580.074 L336.808 579.234 L337.076 578.346 L337.512 577.626 L337.872 577.406 L338.016 577.558 L338.152 578.126 L337.92 578.682 L337.684 579.566 ZM340.32 571.674 L340.832 571.95 L342.532 571.73 L341.92 572.55 L341.664 572.978 L341.724 573.354 L342.3 573.826 L343.392 574.322 L343.804 574.614 L345.14 574.406 L346.152 575.27 L346.3 576.338 L345.076 576.754 L344.26 575.942 L344 575.61 L343.524 575.89 L343.532 576.222 L343.288 576.606 L343 576.834 L342.292 575.834 L342.248 575.686 L341.728 575.642 L340.748 575.818 L340.324 575.69 L340.168 575.326 L340.068 574.034 L339.98 573.55 L338.724 571.73 L338.436 570.934 L339.128 570.662 L340.604 570.67 ZM376.096 565.49 L375.3 565.874 L374.3 565.826 L372.308 565.198 L375.156 562.766 L377.12 561.63 L377.668 561.166 L377.712 562.05 L377.28 563.374 L376.652 564.67 ZM363.36 558.062 L363.128 558.362 L362.416 558.322 L362.108 558.39 L361.548 558.79 L359.6 559.626 L358.672 559.87 L358.3 560.794 L357.872 560.942 L356.936 561.45 L355.672 563.662 L354.724 564.17 L354.568 564.382 L353.132 565.81 L352.6 566.074 L351.392 565.598 L350.756 565.642 L351.1 566.354 L350.776 566.93 L350.4 567.31 L349.5 567.786 L350.036 568.25 L351.204 569.046 L351.72 569.566 L349.284 571.142 L348.88 571.21 L348.656 572.314 L348.06 572.342 L347.244 572.118 L346.352 572.466 L346.94 572.806 L347.408 573.534 L347.636 574.27 L347.48 574.606 L347.004 574.418 L345.696 573.15 L343.332 571.566 L343.036 570.91 L343.088 570.162 L343.056 569.446 L342.524 568.878 L341.928 569.65 L341.284 569.674 L339.684 568.886 L338.096 568.542 L337.42 568.302 L336.808 567.818 L336.808 567.494 L337.596 567.154 L337.992 567.202 L338.416 567.49 L339.724 567.066 L341.232 567.478 L342.592 567.526 L343.492 566.022 L341.796 566.002 L341.14 565.698 L340.592 564.958 L341.228 564.538 L341.736 564.07 L342.264 563.686 L343.388 563.462 L343.732 563.29 L344.68 562.566 L345.34 561.858 L345.376 561.738 L346.572 561.61 L347.652 561.69 L348.528 561.43 L349.16 560.302 L350.036 560.63 L350.896 560.358 L351.596 559.686 L352.02 558.826 L352.348 559.362 L352.824 559.682 L353.92 560.282 L354.7 558.334 L355.956 557.254 L358.972 555.586 L358.412 557.402 L358.532 557.898 L359.272 558.082 L359.804 557.826 L360.276 557.178 L361.144 555.574 L360.856 554.518 L361.124 554.158 L361.804 554.198 L362.28 554.934 L362.728 556.642 L362.912 556.978 L363.388 557.582 Z");
    PREFECTURE_PATHS["1"] = JAPAN.path("M59.1,594.7 L57.6,593.7 L57.7,590.0 L60.2,591.0 Z M69.4,577.3 L72.4,576.9 L69.2,582.5 L67.9,583.4 L67.8,581.1 L63.3,582.0 L62.7,579.1 L68.7,576.4 Z M72.6,572.9 L72.0,575.6 L70.6,575.6 L70.4,573.5 Z M55.7,575.3 L60.0,574.6 L61.8,576.0 L61.5,584.5 L58.4,587.6 L54.3,590.2 L52.6,590.5 L53.5,587.7 L51.4,588.2 L54.0,585.8 L52.6,582.8 Z M66.3,593.2 L70.1,589.2 L72.3,585.1 L73.2,586.2 L73.8,583.9 L76.0,581.8 L77.8,578.3 L76.9,575.9 L79.9,573.8 L81.2,572.0 L72.4,572.4 L77.8,569.3 L79.8,569.3 L78.7,567.1 L79.0,564.0 L73.6,558.4 L73.4,555.7 L75.6,555.3 L77.4,552.3 L79.8,550.8 L82.0,550.8 L84.1,549.3 L85.8,549.8 L89.6,552.6 L94.0,555.3 L95.5,555.4 L96.4,553.4 L95.6,549.5 L98.8,548.9 L101.2,550.9 L103.7,555.8 L104.7,559.0 L105.3,564.1 L107.6,566.4 L104.2,567.4 L102.8,570.0 L99.0,573.8 L97.2,577.1 L94.5,578.6 L93.3,581.9 L96.1,589.0 L94.4,592.0 L95.0,596.3 L92.3,595.6 L89.3,597.7 L87.3,597.3 L84.3,598.3 L80.4,597.9 L75.9,594.1 L69.2,595.8 Z");
    PREFECTURE_PATHS["2"] = JAPAN.path("M128.6,572.5 L127.4,574.7 L126.5,573.7 L124.1,576.2 L123.0,578.7 L121.6,578.7 L120.4,580.9 L122.3,583.1 L119.0,584.4 L120.2,586.2 L117.9,587.2 L115.9,591.3 L112.7,600.2 L108.4,610.5 L109.1,615.9 L107.7,622.4 L105.8,623.8 L104.7,628.2 L102.1,633.4 L98.6,632.4 L97.4,629.2 L95.0,628.2 L96.4,626.4 L97.1,623.6 L95.8,621.7 L91.2,619.7 L90.2,616.0 L88.9,614.2 L86.3,612.8 L85.9,607.9 L82.6,604.5 L79.8,599.0 L80.4,597.9 L84.3,598.3 L87.3,597.3 L89.3,597.7 L92.3,595.6 L95.0,596.3 L94.4,592.0 L96.1,589.0 L93.3,581.9 L94.5,578.6 L97.2,577.1 L99.0,573.8 L102.8,570.0 L104.2,567.4 L107.6,566.4 L108.8,567.3 L113.0,567.1 L115.6,570.8 L117.7,570.2 L121.8,570.3 L123.6,567.9 L126.8,569.2 L127.3,572.3 Z");
    PREFECTURE_PATHS["3"] = JAPAN.path("M36.1,696.6 L37.8,697.3 L38.6,700.0 L36.3,699.5 Z M64.8,672.2 L71.4,677.2 L70.0,681.0 L66.9,683.2 L63.2,683.4 L61.3,682.6 L59.7,677.7 L59.5,675.1 L61.4,675.1 Z M51.5,669.9 L54.5,671.4 L55.1,672.8 L53.1,673.3 Z M39.1,615.0 L36.7,614.5 L39.4,610.7 L40.9,610.2 L42.4,607.7 L42.8,610.3 Z M46.0,604.6 L48.0,607.4 L46.1,607.6 L44.1,605.8 Z M88.9,657.0 L89.7,659.8 L89.0,663.6 L87.8,665.3 L86.6,670.0 L85.3,670.2 L83.4,674.5 L82.9,678.3 L79.1,679.3 L78.9,673.4 L82.4,670.4 L83.4,668.0 L83.3,664.4 L86.0,661.2 L86.4,659.2 Z M95.0,628.2 L91.8,628.9 L89.1,632.7 L92.6,634.6 L91.2,636.7 L93.5,637.0 L90.4,639.2 L88.3,639.3 L86.9,642.2 L84.5,643.9 L79.1,645.1 L73.4,648.0 L74.0,645.0 L77.3,642.9 L79.4,637.4 L80.4,632.8 L78.9,628.4 L77.3,627.1 L77.3,623.1 L73.4,620.8 L75.4,619.3 L78.3,620.0 L78.4,622.0 L79.9,622.5 L81.7,620.4 L82.3,616.9 L81.2,615.8 L77.7,614.7 L74.7,616.5 L70.6,624.0 L69.9,627.7 L71.5,633.3 L74.7,635.6 L73.5,639.5 L71.3,640.7 L68.8,639.9 L67.9,637.1 L66.3,635.9 L60.2,635.1 L57.2,635.1 L56.7,630.0 L53.8,627.2 L55.6,626.8 L58.1,628.9 L60.9,626.2 L63.1,620.9 L63.5,618.0 L60.8,613.3 L58.0,611.3 L57.7,609.7 L60.3,603.5 L58.8,599.2 L60.2,597.9 L59.4,595.7 L62.3,594.2 L63.4,595.8 L66.3,593.2 L69.2,595.8 L75.9,594.1 L80.4,597.9 L79.8,599.0 L82.6,604.5 L85.9,607.9 L86.3,612.8 L88.9,614.2 L90.2,616.0 L91.2,619.7 L95.8,621.7 L97.1,623.6 L96.4,626.4 Z");
    PREFECTURE_PATHS["4"] = JAPAN.path("M106.2,529.4 L109.3,531.1 L114.5,531.7 L118.9,527.7 L121.5,527.6 L124.5,528.6 L126.5,532.8 L126.4,537.3 L124.5,540.8 L122.4,540.1 L122.0,542.0 L120.4,543.0 L118.0,542.0 L116.6,543.1 L116.7,546.2 L120.6,547.5 L124.5,547.1 L128.7,548.7 L131.9,547.9 L130.5,550.9 L127.7,554.0 L131.7,554.5 L129.6,556.3 L135.4,557.6 L132.1,558.1 L130.8,561.0 L135.3,564.2 L132.2,568.4 L133.7,569.3 L130.5,571.0 L129.2,570.1 L128.6,572.5 L127.3,572.3 L126.8,569.2 L123.6,567.9 L121.8,570.3 L117.7,570.2 L115.6,570.8 L113.0,567.1 L108.8,567.3 L107.6,566.4 L105.3,564.1 L104.7,559.0 L103.7,555.8 L101.2,550.9 L98.8,548.9 L95.6,549.5 L96.4,553.4 L95.5,555.4 L94.0,555.3 L89.6,552.6 L90.7,549.8 L90.0,545.6 L91.1,540.1 L93.2,536.9 L96.0,534.4 L98.1,533.9 L103.7,534.7 Z");
    PREFECTURE_PATHS["5"] = JAPAN.path("M73.4,555.7 L73.6,551.0 L71.0,547.9 L71.1,546.2 L72.7,543.7 L75.7,542.7 L77.1,540.5 L79.1,539.6 L79.0,535.7 L74.7,536.9 L69.1,532.5 L60.4,532.0 L61.3,530.4 L65.4,529.4 L63.1,527.2 L66.0,524.6 L68.9,523.8 L68.8,525.4 L71.9,526.7 L74.9,526.7 L75.5,523.7 L73.4,524.8 L78.5,520.6 L78.1,517.8 L79.8,515.5 L82.3,514.6 L85.5,514.8 L87.8,512.6 L93.3,512.9 L96.4,515.5 L98.0,513.5 L100.3,512.4 L99.6,516.6 L97.9,519.1 L99.6,519.5 L99.4,522.6 L101.1,527.1 L102.5,528.5 L106.2,529.4 L103.7,534.7 L98.1,533.9 L96.0,534.4 L93.2,536.9 L91.1,540.1 L90.0,545.6 L90.7,549.8 L89.6,552.6 L85.8,549.8 L84.1,549.3 L82.0,550.8 L79.8,550.8 L77.4,552.3 L75.6,555.3 Z");
    PREFECTURE_PATHS["6"] = JAPAN.path("M71.0,547.9 L68.8,547.3 L67.1,545.3 L62.4,548.9 L65.3,555.1 L64.4,556.5 L60.6,555.3 L57.9,553.8 L54.2,549.6 L54.3,546.1 L51.0,544.3 L48.7,539.1 L51.2,537.0 L52.4,539.5 L52.5,536.3 L53.6,534.1 L50.7,531.1 L52.1,529.9 L53.9,532.0 L53.0,528.6 L53.8,526.9 L56.0,527.4 L57.8,529.2 L56.8,530.6 L59.6,532.5 L60.4,532.0 L69.1,532.5 L74.7,536.9 L79.0,535.7 L79.1,539.6 L77.1,540.5 L75.7,542.7 L72.7,543.7 L71.1,546.2 Z");
    PREFECTURE_PATHS["7"] = JAPAN.path("M13.1,557.5 L11.9,559.1 L10.1,557.8 L10.5,555.7 Z M15.3,554.9 L14.5,557.6 L12.9,554.9 L14.2,555.4 Z M18.3,553.9 L18.1,555.6 L15.8,554.5 L16.8,552.0 Z M41.8,548.5 L42.8,548.6 L42.3,549.7 L39.6,551.3 Z M21.8,547.5 L21.9,550.0 L24.4,549.2 L24.4,551.1 L20.9,553.5 L20.7,555.8 L18.6,557.2 L19.1,553.1 L16.7,551.1 L19.8,549.9 L19.8,547.1 L21.1,548.0 L21.5,545.6 L23.2,544.2 Z M25.0,537.0 L24.0,537.8 L22.1,536.6 L24.6,535.5 Z M41.5,532.2 L41.6,534.3 L36.2,541.5 L33.3,542.6 L32.5,540.4 L35.2,539.6 L35.0,537.8 L36.3,536.9 L36.8,534.6 L38.9,534.3 Z M50.7,532.2 L48.6,533.1 L48.0,532.6 L49.5,530.2 Z M51.6,514.0 L52.8,515.8 L52.0,518.0 L50.2,517.9 L49.4,519.6 L47.2,517.3 L47.5,513.9 L49.1,511.4 L51.9,513.0 Z M33.4,489.9 L36.5,489.5 L38.0,490.4 L36.8,491.9 L34.5,497.7 L32.1,499.3 L30.4,498.3 L31.4,492.7 L32.5,488.7 Z M9.2,557.1 L10.3,559.2 L10.0,561.7 L11.9,564.9 L6.8,564.8 L6.5,567.6 L5.3,565.9 L1.9,566.1 L0.0,564.8 L2.3,562.5 L2.4,558.2 L4.0,557.3 L4.6,559.2 Z M38.6,479.1 L37.4,478.0 L39.1,473.9 L41.2,474.3 L43.2,472.2 L44.8,472.1 L44.8,476.9 L43.1,480.6 L40.2,483.2 L40.1,487.2 L40.8,488.0 L39.0,489.9 L37.3,489.8 L38.5,487.5 L36.8,487.9 L37.2,486.0 L35.6,487.2 L36.3,482.3 Z M64.4,556.5 L63.7,557.8 L60.3,559.2 L62.0,561.0 L65.6,559.8 L69.3,561.1 L70.3,564.1 L69.3,569.0 L65.5,570.3 L63.9,572.1 L61.3,572.6 L60.1,570.2 L60.2,568.2 L63.7,566.3 L62.7,563.4 L59.4,562.9 L56.8,564.3 L53.7,564.7 L51.0,568.2 L48.8,569.1 L46.3,571.5 L46.3,570.3 L48.8,566.5 L46.9,560.7 L45.4,560.9 L43.4,556.1 L42.3,554.9 L42.3,552.5 L44.8,547.4 L47.6,549.8 L47.7,551.3 L49.8,553.3 L48.1,558.0 L49.9,559.9 L51.6,558.3 L56.1,560.2 L53.7,556.1 L54.7,552.1 L52.4,549.7 L50.1,550.3 L49.2,548.6 L47.2,549.0 L47.6,545.6 L46.3,544.3 L45.8,546.7 L43.9,542.4 L40.8,541.5 L41.7,536.4 L42.8,533.7 L44.7,534.8 L48.6,535.1 L51.2,537.0 L48.7,539.1 L51.0,544.3 L54.3,546.1 L54.2,549.6 L57.9,553.8 L60.6,555.3 Z");
    PREFECTURE_PATHS["8"] = JAPAN.path("M149.8,518.6 L150.8,520.3 L154.9,518.6 L156.5,518.8 L155.1,520.3 L152.8,520.9 L152.4,522.9 L150.8,521.3 L146.4,521.8 L145.5,518.7 L148.2,517.6 Z M142.5,493.4 L142.8,498.1 L145.1,504.3 L148.7,506.4 L148.4,508.6 L146.9,510.1 L146.8,515.6 L143.9,517.4 L143.7,522.7 L139.3,524.9 L142.0,520.6 L137.3,518.1 L136.2,516.5 L133.0,514.0 L130.5,515.3 L130.0,514.3 L132.0,512.9 L129.8,511.7 L128.6,512.4 L126.9,511.1 L122.8,511.7 L122.0,513.5 L118.9,511.1 L117.4,513.3 L115.9,513.1 L115.4,510.4 L112.4,514.2 L110.4,515.2 L108.5,513.9 L106.8,514.7 L106.5,512.5 L104.3,509.8 L101.8,508.7 L97.3,513.1 L96.1,512.7 L97.1,510.0 L96.8,507.4 L95.4,505.1 L98.1,502.0 L96.6,497.4 L98.0,494.0 L99.0,494.4 L103.2,493.3 L100.3,492.0 L101.3,490.4 L102.5,491.9 L105.0,491.5 L107.2,492.3 L108.5,494.5 L108.7,491.6 L111.9,491.5 L109.9,494.5 L114.4,493.9 L114.9,492.8 L118.0,492.8 L120.0,488.5 L122.6,487.2 L124.3,484.5 L125.8,484.5 L126.0,482.5 L129.1,482.3 L129.7,487.0 L128.0,490.3 L128.8,493.5 L131.5,494.4 L130.7,496.3 L131.2,499.1 L137.9,500.1 L140.2,497.6 L140.0,495.3 Z");
    PREFECTURE_PATHS["9"] = JAPAN.path("M160.2,510.6 L160.8,512.8 L156.5,511.8 L158.8,510.0 L159.3,508.1 Z M168.6,508.7 L167.6,509.0 L165.8,507.9 L166.7,507.3 Z M175.5,504.7 L174.7,507.1 L172.6,507.6 L172.1,506.1 Z M151.0,504.2 L149.9,503.6 L151.3,501.9 L153.0,502.5 Z M148.7,506.4 L145.1,504.3 L142.8,498.1 L142.5,493.4 L142.3,491.7 L145.2,488.1 L147.0,484.5 L147.5,481.9 L151.3,479.1 L152.4,479.9 L158.1,478.9 L161.3,479.7 L167.5,477.9 L166.7,475.7 L167.9,474.1 L171.0,472.5 L174.9,468.0 L180.8,467.8 L183.0,468.8 L185.8,468.8 L189.7,469.4 L190.9,470.0 L192.3,472.5 L192.1,478.1 L193.7,482.1 L194.3,490.7 L196.1,495.5 L195.7,497.1 L191.4,502.6 L189.5,503.5 L190.1,501.1 L188.1,498.7 L187.2,501.0 L185.3,502.4 L185.9,504.9 L184.5,504.6 L181.6,506.2 L181.0,503.2 L182.3,502.0 L183.3,503.3 L184.8,501.4 L181.5,500.2 L181.6,501.7 L178.9,502.8 L174.8,502.8 L172.5,503.9 L171.9,502.8 L169.0,504.4 L169.2,506.1 L166.5,506.3 L165.2,508.6 L163.1,506.3 L161.1,507.4 L159.1,502.8 L159.2,499.3 L157.0,499.7 L154.8,498.8 L152.0,500.4 L148.2,504.1 Z");
    PREFECTURE_PATHS["10"] = JAPAN.path("M229.3,488.6 L225.7,487.4 L228.3,489.0 L223.4,491.5 L223.0,493.3 L220.5,493.9 L219.2,492.7 L216.6,492.5 L214.4,493.6 L215.0,494.7 L218.1,493.0 L219.0,494.6 L216.5,496.0 L214.5,499.5 L210.1,498.7 L209.0,499.5 L208.2,497.3 L205.7,495.4 L200.5,498.1 L196.6,499.4 L198.8,496.9 L195.7,497.1 L196.1,495.5 L194.3,490.7 L193.7,482.1 L192.1,478.1 L192.3,472.5 L190.9,470.0 L194.7,468.2 L196.4,465.5 L200.5,464.7 L203.8,458.7 L204.9,458.5 L209.6,460.1 L213.2,462.7 L217.0,459.5 L219.2,459.4 L219.8,461.1 L222.6,461.7 L224.4,463.5 L225.8,467.4 L231.6,466.4 L234.3,464.8 L234.0,468.9 L230.7,473.3 L228.6,475.0 L227.9,483.3 L229.8,486.2 Z");
    PREFECTURE_PATHS["11"] = JAPAN.path("M188.4,424.0 L187.8,422.0 L189.5,420.7 L189.9,421.7 Z M188.3,420.3 L186.8,422.8 L184.4,421.8 L184.0,423.5 L182.8,422.4 L186.4,419.5 Z M199.5,417.0 L198.1,417.1 L197.3,419.1 L194.7,418.6 L192.3,416.0 L193.5,412.4 L196.7,410.5 L199.7,414.7 Z M129.1,482.3 L131.8,482.4 L136.2,480.9 L137.0,478.9 L142.0,475.8 L144.8,472.7 L151.9,467.5 L155.1,466.5 L159.0,461.6 L164.0,458.2 L168.2,456.8 L169.7,454.1 L169.8,452.1 L168.6,450.0 L173.2,449.7 L172.1,449.0 L177.6,447.5 L181.5,447.6 L181.8,446.5 L184.0,446.5 L186.4,444.1 L188.7,446.1 L195.1,446.3 L192.4,447.6 L190.2,448.3 L191.9,451.2 L194.3,452.9 L193.1,459.4 L192.0,460.5 L187.7,462.5 L187.9,464.8 L185.8,468.8 L183.0,468.8 L180.8,467.8 L174.9,468.0 L171.0,472.5 L167.9,474.1 L166.7,475.7 L167.5,477.9 L161.3,479.7 L158.1,478.9 L152.4,479.9 L151.3,479.1 L147.5,481.9 L147.0,484.5 L145.2,488.1 L142.3,491.7 L142.5,493.4 L140.0,495.3 L140.2,497.6 L137.9,500.1 L131.2,499.1 L130.7,496.3 L131.5,494.4 L128.8,493.5 L128.0,490.3 L129.7,487.0 Z");
    PREFECTURE_PATHS["12"] = JAPAN.path("M190.9,470.0 L189.7,469.4 L185.8,468.8 L187.9,464.8 L187.7,462.5 L192.0,460.5 L193.1,459.4 L194.3,452.9 L191.9,451.2 L190.2,448.3 L192.4,447.6 L192.6,449.4 L194.9,451.1 L198.2,451.7 L199.2,450.2 L204.6,448.6 L210.2,450.5 L217.0,450.4 L220.7,449.7 L221.7,450.6 L229.4,449.8 L231.6,448.2 L234.4,447.7 L236.1,450.4 L236.8,455.3 L238.7,460.4 L238.6,463.8 L235.9,465.5 L234.3,464.8 L231.6,466.4 L225.8,467.4 L224.4,463.5 L222.6,461.7 L219.8,461.1 L219.2,459.4 L217.0,459.5 L213.2,462.7 L209.6,460.1 L204.9,458.5 L203.8,458.7 L200.5,464.7 L196.4,465.5 L194.7,468.2 Z");
    PREFECTURE_PATHS["13"] = JAPAN.path("M162.3,518.6 L161.1,517.7 L163.4,515.9 L162.9,518.1 Z M180.9,509.8 L179.2,512.3 L178.2,512.2 L178.7,509.6 Z M182.1,507.0 L183.1,507.9 L182.2,509.0 L179.9,508.0 Z M179.9,507.5 L176.4,508.7 L177.6,506.4 L176.8,505.9 L179.3,504.1 Z M199.9,518.2 L201.9,518.9 L202.4,519.6 L202.3,524.1 L201.5,526.1 L198.1,526.0 L194.4,527.3 L186.7,527.4 L183.1,528.7 L180.4,533.1 L178.2,535.4 L176.7,540.2 L173.2,542.8 L168.1,542.4 L167.8,545.2 L169.9,548.3 L169.8,549.4 L165.6,552.0 L164.8,554.3 L161.3,557.1 L159.0,555.8 L160.7,562.7 L160.4,565.4 L159.3,566.8 L154.7,565.5 L154.5,567.3 L152.7,565.1 L154.1,562.5 L152.4,559.6 L153.2,557.7 L151.9,552.7 L154.1,554.3 L156.8,551.9 L154.6,548.7 L156.2,547.7 L152.1,547.9 L150.6,547.1 L152.1,546.2 L151.6,542.3 L152.7,541.4 L151.2,540.3 L148.4,540.1 L143.2,542.4 L141.1,544.2 L140.4,543.1 L136.4,544.5 L142.4,540.9 L146.7,540.0 L152.7,537.2 L156.5,533.3 L160.5,532.0 L163.6,529.7 L164.5,527.9 L164.5,525.2 L165.7,521.1 L167.3,521.0 L168.2,517.1 L172.0,514.6 L174.2,514.2 L175.4,510.9 L178.5,515.3 L180.2,520.2 L182.5,521.2 L189.4,519.0 L192.9,519.5 L196.6,520.7 Z");
    PREFECTURE_PATHS["14"] = JAPAN.path("M225.4,542.8 L223.2,545.9 L221.8,549.7 L220.5,555.5 L215.1,548.9 L214.6,547.4 L212.5,546.3 L211.0,543.6 L204.8,541.9 L203.9,541.0 L198.8,541.7 L193.1,544.1 L192.6,545.9 L189.0,546.9 L187.2,548.5 L185.1,548.5 L184.1,554.4 L181.4,556.7 L177.4,561.8 L174.3,562.7 L173.1,566.0 L173.1,569.7 L171.5,569.9 L171.1,572.1 L173.3,574.9 L173.6,576.7 L171.6,576.3 L169.4,573.7 L165.3,575.1 L163.2,574.4 L161.5,572.5 L158.1,574.0 L158.1,571.8 L161.9,567.0 L159.3,566.8 L160.4,565.4 L160.7,562.7 L159.0,555.8 L161.3,557.1 L164.8,554.3 L165.6,552.0 L169.8,549.4 L169.9,548.3 L167.8,545.2 L168.1,542.4 L173.2,542.8 L176.7,540.2 L178.2,535.4 L180.4,533.1 L183.1,528.7 L186.7,527.4 L194.4,527.3 L198.1,526.0 L201.5,526.1 L205.0,527.7 L207.7,528.1 L211.8,530.1 L213.1,529.0 L215.5,529.2 L216.7,532.2 L216.8,535.4 L220.5,536.7 L220.2,538.8 L221.4,541.6 Z");
    PREFECTURE_PATHS["15"] = JAPAN.path("M201.5,526.1 L202.3,524.1 L202.4,519.6 L209.2,515.7 L211.9,515.5 L214.4,517.0 L219.3,515.8 L221.1,514.2 L224.4,513.5 L232.0,514.1 L233.0,512.0 L240.9,511.0 L240.6,513.8 L239.0,516.9 L238.4,519.8 L238.9,522.1 L239.9,521.5 L242.0,524.4 L242.1,526.5 L239.8,528.8 L243.8,529.9 L237.0,532.8 L236.6,534.0 L228.8,538.2 L229.2,538.8 L226.1,540.9 L225.4,542.8 L221.4,541.6 L220.2,538.8 L220.5,536.7 L216.8,535.4 L216.7,532.2 L215.5,529.2 L213.1,529.0 L211.8,530.1 L207.7,528.1 L205.0,527.7 Z");
    PREFECTURE_PATHS["16"] = JAPAN.path("M231.4,497.8 L230.1,501.5 L229.2,499.7 L226.8,501.7 L225.5,499.3 L223.4,499.4 L223.8,496.9 L231.2,495.9 Z M202.4,519.6 L201.9,518.9 L199.9,518.2 L201.9,515.8 L202.3,511.0 L199.4,507.3 L201.3,508.4 L204.8,509.0 L208.0,506.6 L211.7,505.0 L214.6,503.0 L216.6,504.2 L219.7,504.6 L222.5,503.1 L222.8,505.9 L224.9,504.6 L226.8,506.3 L226.2,507.6 L229.9,510.0 L231.4,510.0 L233.0,512.0 L232.0,514.1 L224.4,513.5 L221.1,514.2 L219.3,515.8 L214.4,517.0 L211.9,515.5 L209.2,515.7 Z");
    PREFECTURE_PATHS["17"] = JAPAN.path("M234.3,464.8 L235.9,465.5 L238.6,463.8 L238.7,460.4 L236.8,455.3 L236.1,450.4 L234.4,447.7 L241.0,444.8 L243.0,445.5 L250.8,445.7 L253.2,446.2 L253.2,450.3 L254.6,453.0 L256.2,453.9 L258.9,453.0 L259.6,453.8 L259.6,457.8 L258.5,459.9 L255.0,459.2 L254.4,462.0 L255.6,463.6 L260.1,466.3 L263.2,466.2 L264.6,469.5 L269.9,471.7 L271.9,474.2 L269.4,476.2 L270.3,477.8 L270.3,479.8 L272.9,482.2 L272.4,487.3 L272.8,490.3 L271.4,491.9 L268.7,491.0 L264.0,491.6 L264.8,493.5 L262.6,493.3 L257.2,494.2 L254.0,493.2 L246.2,487.0 L244.4,486.4 L236.7,486.5 L236.6,485.4 L234.2,487.9 L232.3,487.3 L231.2,488.9 L229.3,488.6 L229.8,486.2 L227.9,483.3 L228.6,475.0 L230.7,473.3 L234.0,468.9 Z M252.9,497.4 L254.7,495.1 L256.5,496.3 L254.6,499.6 L251.2,503.4 L251.5,507.1 L252.9,510.3 L248.1,512.1 L246.7,513.2 L243.9,513.5 L241.5,508.8 L242.6,507.0 L244.0,507.1 L247.3,501.9 L249.6,500.3 L250.8,498.2 Z");
    PREFECTURE_PATHS["18"] = JAPAN.path("M282.7,489.4 L279.0,498.7 L280.5,501.6 L280.4,506.4 L279.5,507.2 L274.8,508.6 L272.1,508.5 L261.7,510.7 L258.4,510.2 L257.9,509.3 L258.7,508.5 L262.7,507.6 L267.2,503.8 L269.3,501.4 L271.1,498.1 L271.4,491.9 L272.8,490.3 L272.4,487.3 L272.9,482.2 L270.3,479.8 L270.3,477.8 L273.8,479.0 L276.7,482.2 L278.5,480.6 L280.8,482.9 L282.9,487.1 Z");
    PREFECTURE_PATHS["19"] = JAPAN.path("M279.5,507.2 L280.4,506.4 L280.5,501.6 L279.0,498.7 L282.7,489.4 L287.3,492.5 L291.2,491.5 L294.0,492.9 L295.1,492.1 L296.4,494.9 L295.1,495.5 L295.4,498.6 L301.0,502.2 L300.9,504.2 L296.7,505.8 L295.6,507.7 L296.9,511.3 L297.2,514.1 L296.6,519.3 L295.5,522.8 L296.0,524.3 L292.2,525.3 L290.3,528.6 L285.9,532.1 L284.8,530.5 L279.7,529.9 L277.9,530.7 L276.5,529.2 L277.2,526.3 L275.1,520.3 L278.5,515.7 L281.5,514.0 L279.9,511.2 Z");
    PREFECTURE_PATHS["20"] = JAPAN.path("M294.0,489.4 L295.1,492.1 L294.0,492.9 L291.2,491.5 L287.3,492.5 L282.7,489.4 L282.9,487.1 L280.8,482.9 L278.5,480.6 L276.7,482.2 L273.8,479.0 L270.3,477.8 L269.4,476.2 L271.9,474.2 L269.9,471.7 L264.6,469.5 L263.2,466.2 L260.1,466.3 L255.6,463.6 L254.4,462.0 L255.0,459.2 L258.5,459.9 L259.6,457.8 L259.6,453.8 L258.9,453.0 L256.2,453.9 L254.6,453.0 L253.2,450.3 L253.2,446.2 L255.6,447.2 L258.0,445.1 L259.6,445.0 L261.8,443.0 L267.2,441.8 L269.9,445.8 L268.1,447.2 L265.2,451.3 L267.5,450.2 L267.0,452.4 L270.6,454.2 L270.7,452.9 L275.1,451.5 L276.1,452.9 L274.6,454.0 L274.8,457.6 L277.1,460.8 L283.4,463.1 L285.5,462.9 L288.5,466.5 L288.0,468.8 L288.5,473.1 L287.4,478.3 L289.3,484.8 L290.9,484.9 L293.9,488.0 Z");
    PREFECTURE_PATHS["21"] = JAPAN.path("M294.0,489.4 L293.9,488.0 L290.9,484.9 L289.3,484.8 L287.4,478.3 L288.5,473.1 L288.0,468.8 L288.5,466.5 L285.5,462.9 L287.7,461.2 L290.3,461.2 L291.6,459.7 L293.0,455.7 L294.7,456.8 L298.9,455.1 L299.3,453.4 L301.2,452.4 L300.6,449.3 L302.2,448.2 L305.6,449.7 L307.9,455.0 L309.1,455.0 L310.7,461.6 L309.2,467.4 L309.9,470.4 L311.4,473.7 L309.4,482.0 L307.9,483.9 L303.2,485.7 L298.8,485.0 L297.0,488.3 Z");
    PREFECTURE_PATHS["22"] = JAPAN.path("M295.1,492.1 L294.0,489.4 L297.0,488.3 L298.8,485.0 L303.2,485.7 L307.9,483.9 L309.4,482.0 L311.4,473.7 L309.9,470.4 L314.4,469.2 L318.1,472.8 L320.2,473.8 L321.4,476.0 L322.9,479.1 L319.3,480.9 L319.3,482.9 L317.4,486.8 L314.2,490.7 L313.4,494.6 L314.0,497.6 L317.5,498.9 L321.9,502.6 L325.7,504.1 L328.0,506.5 L327.9,509.2 L326.6,511.4 L327.1,513.5 L324.6,515.0 L325.5,512.9 L323.6,512.2 L319.6,512.6 L320.5,511.0 L317.6,511.6 L317.8,512.9 L314.1,514.0 L312.7,513.3 L312.3,515.3 L310.7,514.8 L308.5,516.3 L305.4,517.1 L303.9,518.4 L304.3,521.1 L302.0,520.4 L300.6,522.2 L302.9,524.7 L302.5,526.8 L301.0,525.7 L299.6,528.9 L295.9,530.1 L294.4,532.1 L291.2,539.4 L289.6,538.5 L286.4,534.5 L285.9,532.1 L290.3,528.6 L292.2,525.3 L296.0,524.3 L295.5,522.8 L296.6,519.3 L297.2,514.1 L296.9,511.3 L295.6,507.7 L296.7,505.8 L300.9,504.2 L301.0,502.2 L295.4,498.6 L295.1,495.5 L296.4,494.9 Z");
    PREFECTURE_PATHS["23"] = JAPAN.path("M285.9,532.1 L286.4,534.5 L289.6,538.5 L291.2,539.4 L288.8,542.4 L289.7,543.6 L286.6,546.4 L284.4,547.0 L281.6,550.5 L281.9,548.3 L277.0,547.5 L269.7,544.5 L267.6,542.4 L267.5,540.4 L265.5,538.7 L268.5,537.5 L265.2,534.4 L262.1,533.4 L259.3,528.9 L256.0,528.3 L257.6,525.2 L256.6,524.1 L259.7,522.8 L260.1,521.4 L257.6,520.0 L259.1,517.5 L261.3,517.0 L259.6,512.7 L256.9,510.7 L257.9,509.3 L258.4,510.2 L261.7,510.7 L272.1,508.5 L274.8,508.6 L279.5,507.2 L279.9,511.2 L281.5,514.0 L278.5,515.7 L275.1,520.3 L277.2,526.3 L276.5,529.2 L277.9,530.7 L279.7,529.9 L284.8,530.5 Z");
    PREFECTURE_PATHS["24"] = JAPAN.path("M322.9,479.1 L321.4,476.0 L320.2,473.8 L320.6,469.3 L324.2,464.1 L325.6,464.6 L331.2,462.9 L333.7,464.7 L335.4,467.7 L340.2,469.9 L343.8,468.8 L348.6,471.3 L353.4,469.0 L353.0,470.5 L354.3,472.8 L358.4,472.0 L363.0,472.8 L361.5,478.0 L358.1,481.5 L357.5,484.0 L353.9,488.6 L350.4,490.1 L349.3,493.9 L349.4,496.4 L344.5,497.4 L336.8,499.7 L332.1,500.0 L334.4,496.2 L335.8,498.0 L343.1,493.6 L344.1,491.8 L343.2,490.4 L340.3,489.4 L338.3,490.8 L332.5,490.6 L330.3,488.3 L331.3,484.1 L329.7,486.9 L328.6,490.8 L330.3,492.8 L330.6,494.6 L326.3,492.4 L326.8,488.6 L325.5,486.3 L325.5,482.5 L327.8,478.5 L327.6,476.2 L326.2,478.9 Z");
    PREFECTURE_PATHS["25"] = JAPAN.path("M276.1,452.9 L277.3,452.8 L277.2,455.0 L278.9,455.4 L282.5,453.3 L282.2,456.2 L285.2,455.8 L284.1,453.2 L285.9,452.2 L288.5,454.3 L288.3,452.4 L290.3,452.0 L289.0,449.6 L292.8,450.8 L295.1,449.9 L294.4,445.4 L296.9,443.8 L298.5,448.6 L299.9,443.5 L299.0,441.1 L296.2,438.2 L296.4,435.9 L295.1,434.1 L296.8,431.8 L298.6,427.9 L303.4,421.6 L305.9,420.2 L308.0,422.3 L308.6,425.0 L312.6,427.3 L317.0,427.5 L320.2,430.6 L323.8,430.8 L322.7,436.8 L325.6,439.5 L326.4,441.9 L325.0,443.9 L322.0,444.5 L319.2,444.2 L313.2,445.2 L308.8,444.3 L307.5,445.3 L305.6,449.7 L302.2,448.2 L300.6,449.3 L301.2,452.4 L299.3,453.4 L298.9,455.1 L294.7,456.8 L293.0,455.7 L291.6,459.7 L290.3,461.2 L287.7,461.2 L285.5,462.9 L283.4,463.1 L277.1,460.8 L274.8,457.6 L274.6,454.0 Z");
    PREFECTURE_PATHS["26"] = JAPAN.path("M323.8,430.8 L325.2,427.5 L327.5,424.3 L326.2,420.9 L327.8,420.8 L329.2,418.7 L332.7,419.9 L333.1,422.0 L335.7,420.0 L336.3,418.6 L339.8,415.3 L345.5,414.4 L355.8,418.1 L357.9,421.1 L355.5,425.8 L354.5,430.0 L355.7,434.1 L351.2,440.4 L347.9,441.3 L345.8,444.3 L350.2,447.6 L352.6,452.2 L353.3,457.0 L355.2,458.7 L355.8,463.4 L354.2,464.4 L354.6,466.4 L353.4,469.0 L348.6,471.3 L343.8,468.8 L340.2,469.9 L335.4,467.7 L333.7,464.7 L331.2,462.9 L325.6,464.6 L324.2,464.1 L320.6,469.3 L320.2,473.8 L318.1,472.8 L314.4,469.2 L309.9,470.4 L309.2,467.4 L310.7,461.6 L309.1,455.0 L307.9,455.0 L305.6,449.7 L307.5,445.3 L308.8,444.3 L313.2,445.2 L319.2,444.2 L322.0,444.5 L325.0,443.9 L326.4,441.9 L325.6,439.5 L322.7,436.8 Z");
    PREFECTURE_PATHS["27"] = JAPAN.path("M398.1,441.5 L401.1,443.4 L405.8,444.5 L407.5,447.9 L409.9,451.0 L413.0,453.0 L412.4,458.2 L411.4,459.8 L405.8,462.8 L404.5,465.3 L396.8,466.6 L390.7,463.7 L389.5,469.0 L389.6,473.0 L388.1,475.0 L384.8,473.6 L383.7,469.6 L382.8,468.5 L379.4,468.3 L379.1,465.3 L379.9,458.4 L378.3,453.3 L377.4,450.0 L378.7,447.9 L377.9,446.0 L379.4,443.1 L382.0,442.6 L384.9,438.3 L387.4,439.3 L387.9,441.2 L393.2,441.6 L394.6,443.4 Z");
    PREFECTURE_PATHS["28"] = JAPAN.path("M363.0,472.8 L358.4,472.0 L354.3,472.8 L353.0,470.5 L353.4,469.0 L354.6,466.4 L354.2,464.4 L355.8,463.4 L355.2,458.7 L353.3,457.0 L352.6,452.2 L350.2,447.6 L345.8,444.3 L347.9,441.3 L351.2,440.4 L355.7,434.1 L354.5,430.0 L355.5,425.8 L357.9,421.1 L355.8,418.1 L358.3,415.6 L361.9,408.6 L362.6,405.0 L362.7,400.1 L365.3,398.8 L368.5,393.5 L372.9,395.4 L373.1,398.1 L374.2,399.0 L376.4,397.7 L380.6,396.7 L382.7,396.9 L383.3,394.6 L387.0,391.1 L390.7,389.9 L393.4,390.6 L394.0,394.2 L397.4,398.9 L397.6,403.1 L390.9,405.2 L390.3,407.2 L388.5,407.7 L387.3,410.2 L386.1,414.9 L388.3,418.1 L393.7,417.5 L395.2,419.0 L395.3,422.4 L393.7,424.2 L394.3,428.1 L392.9,429.0 L394.5,431.3 L394.4,435.2 L397.6,438.1 L397.5,439.0 L398.1,441.5 L394.6,443.4 L393.2,441.6 L387.9,441.2 L387.4,439.3 L384.9,438.3 L382.0,442.6 L379.4,443.1 L377.9,446.0 L378.7,447.9 L377.4,450.0 L378.3,453.3 L376.2,456.4 L376.0,460.5 L374.9,462.2 L375.4,464.4 L373.8,466.6 L368.2,469.4 Z");
    PREFECTURE_PATHS["29"] = JAPAN.path("M411.5,477.6 L410.8,480.5 L411.9,480.7 L411.1,483.1 L412.8,484.6 L413.1,489.0 L411.1,490.2 L409.3,493.6 L407.6,495.2 L407.3,499.0 L405.3,498.5 L401.2,501.4 L398.9,498.9 L397.9,495.2 L399.1,494.2 L398.2,491.3 L398.4,488.3 L399.8,487.0 L398.9,483.7 L399.8,481.5 L404.4,481.4 L400.6,477.2 L396.5,476.3 L391.1,478.1 L388.9,481.0 L389.5,483.4 L383.8,486.2 L382.3,489.0 L382.7,490.3 L380.9,493.1 L377.9,495.4 L376.9,498.7 L378.4,500.9 L371.4,497.9 L365.5,497.1 L361.7,498.3 L357.6,496.7 L349.4,496.4 L349.3,493.9 L350.4,490.1 L353.9,488.6 L357.5,484.0 L358.1,481.5 L361.5,478.0 L363.0,472.8 L368.2,469.4 L373.8,466.6 L375.4,464.4 L374.9,462.2 L376.0,460.5 L376.2,456.4 L378.3,453.3 L379.9,458.4 L379.1,465.3 L379.4,468.3 L382.8,468.5 L383.7,469.6 L384.8,473.6 L388.1,475.0 L389.6,473.0 L389.5,469.0 L390.7,463.7 L396.8,466.6 L404.5,465.3 L407.7,465.4 L408.2,469.6 L407.0,471.4 L407.1,473.5 L408.5,476.2 Z");
    PREFECTURE_PATHS["30"] = JAPAN.path("M362.7,400.1 L362.6,405.0 L361.9,408.6 L358.3,415.6 L355.8,418.1 L345.5,414.4 L339.8,415.3 L336.3,418.6 L335.7,420.0 L333.1,422.0 L332.7,419.9 L329.2,418.7 L327.8,420.8 L326.2,420.9 L325.9,415.0 L327.1,409.3 L326.7,405.7 L327.2,401.3 L328.6,399.8 L330.6,393.7 L332.8,391.4 L337.6,390.8 L335.3,394.6 L335.9,396.2 L341.4,399.9 L347.9,400.1 L349.8,398.4 L351.6,392.9 L354.4,391.5 L358.6,390.7 L361.5,393.7 Z");
    PREFECTURE_PATHS["31"] = JAPAN.path("M338.0,382.1 L337.7,383.2 L334.1,384.1 L332.8,381.9 Z M326.2,420.9 L327.5,424.3 L325.2,427.5 L323.8,430.8 L320.2,430.6 L317.0,427.5 L312.6,427.3 L308.6,425.0 L308.0,422.3 L305.9,420.2 L308.7,417.5 L310.5,416.8 L313.8,413.8 L322.0,403.6 L324.0,400.6 L326.9,394.3 L326.7,391.7 L327.4,389.2 L325.8,384.7 L326.2,382.4 L324.4,381.8 L324.4,380.1 L326.8,375.2 L326.4,373.3 L327.5,371.8 L331.0,370.1 L334.4,370.2 L341.1,366.4 L347.9,364.7 L349.9,365.9 L349.8,368.7 L346.2,369.3 L345.5,371.6 L346.5,372.8 L345.0,375.6 L342.7,375.1 L340.6,375.8 L339.0,378.7 L336.9,380.2 L333.9,378.4 L331.9,381.9 L331.5,385.3 L333.7,384.9 L336.3,386.1 L337.1,384.3 L338.2,385.1 L337.6,390.8 L332.8,391.4 L330.6,393.7 L328.6,399.8 L327.2,401.3 L326.7,405.7 L327.1,409.3 L325.9,415.0 Z");
    PREFECTURE_PATHS["32"] = JAPAN.path("M362.7,400.1 L361.5,393.7 L358.6,390.7 L361.2,390.2 L369.2,387.3 L375.0,384.1 L376.7,382.3 L379.2,382.8 L382.2,381.9 L385.2,379.8 L389.4,375.7 L393.6,373.3 L397.8,366.6 L400.0,364.8 L401.8,361.7 L403.5,355.9 L405.4,352.9 L412.9,347.6 L418.6,345.7 L421.9,343.3 L425.7,339.3 L426.6,337.6 L427.8,328.1 L429.0,324.5 L431.1,320.4 L436.6,322.8 L436.3,326.4 L437.2,328.2 L440.3,329.3 L442.3,331.1 L441.6,334.5 L439.2,336.0 L436.4,335.9 L435.6,336.9 L435.0,342.2 L433.1,349.6 L434.4,352.0 L437.0,353.8 L429.9,363.2 L430.6,367.6 L430.2,368.2 L425.6,368.2 L424.2,370.1 L417.8,370.9 L417.1,371.9 L417.7,374.9 L415.9,380.1 L418.6,384.8 L418.7,389.4 L417.6,393.7 L412.7,389.4 L411.8,391.1 L408.8,392.3 L408.4,395.5 L406.6,396.5 L405.5,398.9 L403.0,399.9 L402.4,401.5 L397.6,403.1 L397.4,398.9 L394.0,394.2 L393.4,390.6 L390.7,389.9 L387.0,391.1 L383.3,394.6 L382.7,396.9 L380.6,396.7 L376.4,397.7 L374.2,399.0 L373.1,398.1 L372.9,395.4 L368.5,393.5 L365.3,398.8 Z M385.8,344.5 L383.4,345.3 L382.8,344.0 L383.7,340.2 L385.9,336.7 L390.3,332.8 L391.8,330.2 L393.5,329.8 L393.1,333.5 L390.6,339.9 L390.4,341.6 L395.4,341.3 L395.3,343.1 L391.9,349.6 L387.6,352.4 L383.7,353.6 L382.3,352.0 L384.0,351.6 L384.7,348.7 L386.8,346.0 Z");
    PREFECTURE_PATHS["33"] = JAPAN.path("M438.8,573.2 L436.6,572.6 L434.8,569.1 L435.9,568.4 L440.1,571.3 Z M427.4,527.5 L425.6,526.4 L425.9,524.9 L428.3,524.0 L429.0,525.1 Z M418.1,513.6 L416.9,513.4 L417.4,511.2 L418.8,509.9 Z M424.8,498.0 L421.2,496.9 L421.2,492.5 L424.3,493.7 Z M440.9,447.7 L441.7,451.4 L440.9,454.4 L438.7,454.1 L438.0,455.7 L436.9,454.4 L438.4,458.6 L437.9,459.9 L434.6,458.6 L428.7,455.1 L426.4,456.1 L426.0,460.7 L423.4,457.6 L417.6,455.9 L413.0,453.0 L409.9,451.0 L407.5,447.9 L405.8,444.5 L409.2,442.6 L410.9,443.8 L418.8,445.9 L423.0,448.5 L424.8,448.7 L427.6,447.5 L428.6,448.7 L437.0,446.9 Z");
    PREFECTURE_PATHS["34"] = JAPAN.path("M417.6,393.7 L417.7,394.4 L422.9,395.8 L422.1,398.2 L423.2,399.4 L421.8,401.9 L420.8,407.6 L422.9,409.4 L425.9,410.4 L421.7,420.3 L425.5,424.9 L431.0,425.4 L433.3,428.1 L434.1,430.4 L431.7,429.1 L428.1,428.5 L426.6,429.1 L423.1,427.0 L420.4,426.7 L413.2,424.6 L410.6,428.4 L409.6,431.1 L399.5,435.5 L397.6,438.1 L394.4,435.2 L394.5,431.3 L392.9,429.0 L394.3,428.1 L393.7,424.2 L395.3,422.4 L395.2,419.0 L393.7,417.5 L388.3,418.1 L386.1,414.9 L387.3,410.2 L388.5,407.7 L390.3,407.2 L390.9,405.2 L397.6,403.1 L402.4,401.5 L403.0,399.9 L405.5,398.9 L406.6,396.5 L408.4,395.5 L408.8,392.3 L411.8,391.1 L412.7,389.4 Z");
    PREFECTURE_PATHS["35"] = JAPAN.path("M455.3,395.1 L455.8,402.7 L456.4,404.6 L454.6,406.5 L455.2,412.8 L454.9,414.7 L452.2,419.6 L450.6,419.4 L446.8,420.8 L444.6,420.9 L442.4,423.3 L440.4,423.7 L438.5,426.4 L435.2,428.0 L433.3,428.1 L431.0,425.4 L425.5,424.9 L421.7,420.3 L425.9,410.4 L422.9,409.4 L420.8,407.6 L421.8,401.9 L423.2,399.4 L422.1,398.2 L422.9,395.8 L426.2,393.3 L428.5,392.5 L434.8,389.0 L439.0,387.8 L441.6,385.5 L445.2,385.2 L450.3,386.8 L453.5,389.2 L455.1,391.7 Z");
    PREFECTURE_PATHS["36"] = JAPAN.path("M437.0,433.8 L435.4,432.9 L434.1,430.4 L433.3,428.1 L435.2,428.0 L438.5,426.4 L440.4,423.7 L442.4,423.3 L444.6,420.9 L446.8,420.8 L450.6,419.4 L452.2,419.6 L454.9,414.7 L455.2,412.8 L454.6,406.5 L456.4,404.6 L455.8,402.7 L455.3,395.1 L457.1,396.0 L461.6,400.2 L464.3,401.1 L467.6,397.7 L467.3,395.5 L472.3,397.8 L476.0,398.8 L473.9,402.4 L472.1,409.3 L469.5,414.5 L469.0,417.8 L469.2,422.2 L467.3,424.7 L467.8,430.3 L470.3,437.1 L475.6,446.5 L478.2,449.9 L476.0,449.5 L472.7,446.0 L466.7,442.8 L463.3,442.6 L459.8,443.2 L459.0,444.3 L453.2,444.8 L450.8,444.3 L445.0,441.5 L443.6,440.3 L438.9,433.9 Z");
    PREFECTURE_PATHS["37"] = JAPAN.path("M404.5,465.3 L405.8,462.8 L411.4,459.8 L412.4,458.2 L413.0,453.0 L417.6,455.9 L423.4,457.6 L426.0,460.7 L426.4,456.1 L428.7,455.1 L434.6,458.6 L437.9,459.9 L435.1,462.0 L432.4,462.5 L433.9,463.2 L432.6,469.7 L435.8,471.2 L435.5,473.9 L433.0,475.2 L433.9,476.9 L431.1,476.8 L430.8,474.0 L431.6,473.6 L428.7,469.1 L426.5,469.4 L423.8,468.6 L416.9,470.0 L413.6,472.2 L414.0,476.8 L412.6,476.1 L411.5,477.6 L408.5,476.2 L407.1,473.5 L407.0,471.4 L408.2,469.6 L407.7,465.4 Z");
    PREFECTURE_PATHS["38"] = JAPAN.path("M434.1,430.4 L435.4,432.9 L437.0,433.8 L438.6,436.6 L441.4,444.4 L440.9,447.7 L437.0,446.9 L428.6,448.7 L427.6,447.5 L424.8,448.7 L423.0,448.5 L418.8,445.9 L410.9,443.8 L409.2,442.6 L405.8,444.5 L401.1,443.4 L398.1,441.5 L397.5,439.0 L397.6,438.1 L399.5,435.5 L409.6,431.1 L410.6,428.4 L413.2,424.6 L420.4,426.7 L423.1,427.0 L426.6,429.1 L428.1,428.5 L431.7,429.1 Z");
    PREFECTURE_PATHS["39"] = JAPAN.path("M440.9,454.4 L441.7,451.4 L440.9,447.7 L441.4,444.4 L438.6,436.6 L437.0,433.8 L438.9,433.9 L443.6,440.3 L445.0,441.5 L450.8,444.3 L453.2,444.8 L459.0,444.3 L459.8,443.2 L463.3,442.6 L466.7,442.8 L472.7,446.0 L476.0,449.5 L478.2,449.9 L478.3,452.1 L477.0,450.9 L473.0,452.3 L470.8,452.0 L468.3,453.7 L464.1,457.6 L461.8,461.1 L460.4,466.1 L461.4,469.8 L460.6,474.6 L458.9,475.3 L457.9,477.6 L456.9,476.9 L454.7,478.4 L450.8,477.9 L449.5,480.0 L445.3,482.5 L444.2,486.2 L442.9,487.7 L439.7,488.0 L439.0,486.4 L436.3,484.5 L440.3,484.0 L439.5,482.2 L439.9,480.2 L439.2,474.3 L440.7,473.1 L440.1,469.9 L437.6,469.0 L439.2,468.3 L440.0,466.1 L441.8,466.7 L442.1,464.0 L446.1,461.7 L448.6,458.6 L448.9,455.8 L446.3,453.2 L444.1,452.6 L442.1,455.2 Z");
    PREFECTURE_PATHS["40"] = JAPAN.path("M422.9,395.8 L417.7,394.4 L417.6,393.7 L418.7,389.4 L418.6,384.8 L415.9,380.1 L417.7,374.9 L417.1,371.9 L417.8,370.9 L424.2,370.1 L425.6,368.2 L430.2,368.2 L430.6,367.6 L429.9,363.2 L437.0,353.8 L440.0,354.5 L444.6,354.3 L446.6,356.8 L449.2,357.1 L450.8,358.4 L454.4,357.7 L457.0,354.9 L456.9,347.4 L458.8,348.2 L461.8,347.8 L465.9,350.7 L468.0,350.2 L470.8,351.2 L472.3,355.1 L474.9,356.4 L478.0,355.1 L478.2,351.5 L481.0,350.9 L483.2,355.0 L484.3,358.4 L485.0,374.5 L483.8,381.4 L483.8,385.6 L482.0,393.3 L477.4,396.0 L476.0,398.8 L472.3,397.8 L467.3,395.5 L467.6,397.7 L464.3,401.1 L461.6,400.2 L457.1,396.0 L455.3,395.1 L455.1,391.7 L453.5,389.2 L450.3,386.8 L445.2,385.2 L441.6,385.5 L439.0,387.8 L434.8,389.0 L428.5,392.5 L426.2,393.3 Z");
    PREFECTURE_PATHS["41"] = JAPAN.path("M456.9,347.4 L457.0,354.9 L454.4,357.7 L450.8,358.4 L449.2,357.1 L446.6,356.8 L444.6,354.3 L440.0,354.5 L437.0,353.8 L434.4,352.0 L433.1,349.6 L435.0,342.2 L435.6,336.9 L436.4,335.9 L439.2,336.0 L441.6,334.5 L442.3,331.1 L440.3,329.3 L437.2,328.2 L436.3,326.4 L436.6,322.8 L431.1,320.4 L433.0,315.7 L437.3,311.2 L439.4,308.0 L443.4,294.3 L446.3,295.1 L448.1,294.6 L452.2,297.5 L455.2,298.8 L459.9,299.6 L462.7,301.5 L464.8,304.8 L466.7,305.3 L469.7,310.6 L469.0,315.5 L466.9,316.3 L467.4,321.7 L468.6,324.4 L467.6,327.7 L466.2,329.3 L464.0,334.5 L463.5,338.8 L461.6,341.6 L457.4,343.7 Z");
    PREFECTURE_PATHS["42"] = JAPAN.path("M466.7,305.3 L470.6,304.9 L474.8,302.1 L476.9,302.3 L483.7,305.7 L487.5,305.9 L487.6,308.0 L488.7,309.7 L491.3,311.2 L495.0,308.4 L498.1,309.7 L499.6,308.3 L499.7,305.7 L500.8,303.9 L501.4,300.4 L506.5,301.3 L507.7,306.6 L506.4,304.8 L504.6,305.2 L504.7,307.8 L502.3,310.5 L504.1,312.7 L500.2,315.4 L502.7,316.4 L500.3,319.6 L503.3,321.9 L502.1,322.4 L500.5,325.8 L503.1,331.9 L502.5,333.5 L498.9,330.0 L499.4,328.7 L495.5,327.0 L491.8,327.7 L490.0,328.8 L489.0,331.0 L488.3,328.8 L487.0,328.8 L485.2,331.6 L486.4,332.3 L484.1,334.6 L482.3,338.0 L480.8,343.6 L480.6,347.4 L481.0,350.9 L478.2,351.5 L478.0,355.1 L474.9,356.4 L472.3,355.1 L470.8,351.2 L468.0,350.2 L465.9,350.7 L461.8,347.8 L458.8,348.2 L456.9,347.4 L457.4,343.7 L461.6,341.6 L463.5,338.8 L464.0,334.5 L466.2,329.3 L467.6,327.7 L468.6,324.4 L467.4,321.7 L466.9,316.3 L469.0,315.5 L469.7,310.6 Z");
    PREFECTURE_PATHS["43"] = JAPAN.path("M474.8,302.1 L470.6,304.9 L466.7,305.3 L464.8,304.8 L462.7,301.5 L459.9,299.6 L455.2,298.8 L452.2,297.5 L448.1,294.6 L446.3,295.1 L443.4,294.3 L444.3,289.3 L445.3,286.4 L447.6,284.6 L449.6,276.5 L450.1,266.2 L449.0,261.8 L446.9,259.2 L443.7,258.6 L442.5,260.0 L439.5,260.1 L437.8,257.0 L437.5,253.3 L441.8,255.4 L444.7,252.8 L447.4,247.9 L448.6,242.9 L449.2,237.4 L446.4,233.9 L448.2,233.8 L450.5,232.4 L452.6,233.1 L458.9,233.2 L461.9,231.7 L467.5,235.1 L473.5,234.3 L478.2,230.9 L480.5,231.7 L481.7,233.2 L482.2,236.9 L480.9,242.7 L478.4,245.6 L477.8,250.8 L477.9,254.9 L478.9,259.5 L476.2,260.3 L475.8,261.7 L477.3,263.8 L476.0,266.8 L476.9,270.3 L474.5,274.1 L471.3,281.8 L472.5,285.9 L474.9,288.8 L476.2,291.8 L475.0,293.1 L474.8,295.9 L476.1,297.1 Z");
    PREFECTURE_PATHS["44"] = JAPAN.path("M507.4,233.1 L509.6,236.1 L513.2,243.4 L512.2,245.3 L514.4,247.3 L513.1,249.4 L513.7,251.2 L517.1,253.9 L516.8,257.2 L517.9,259.1 L519.3,265.1 L518.4,267.2 L517.9,272.2 L520.3,270.3 L520.2,272.8 L521.5,274.8 L519.6,277.2 L517.4,278.5 L519.0,279.2 L520.4,277.4 L520.3,280.5 L518.5,280.7 L515.8,284.5 L518.5,283.5 L518.6,284.6 L516.2,286.1 L515.6,288.3 L517.3,288.2 L516.6,291.1 L513.7,292.7 L516.0,294.7 L515.4,295.6 L512.8,295.6 L514.7,296.8 L513.0,297.1 L513.9,298.7 L509.6,298.8 L509.2,302.2 L506.8,299.9 L506.5,301.3 L501.4,300.4 L500.8,303.9 L499.7,305.7 L499.6,308.3 L498.1,309.7 L495.0,308.4 L491.3,311.2 L488.7,309.7 L487.6,308.0 L487.5,305.9 L483.7,305.7 L476.9,302.3 L474.8,302.1 L476.1,297.1 L474.8,295.9 L475.0,293.1 L476.2,291.8 L474.9,288.8 L472.5,285.9 L471.3,281.8 L474.5,274.1 L476.9,270.3 L476.0,266.8 L477.3,263.8 L475.8,261.7 L476.2,260.3 L478.9,259.5 L477.9,254.9 L477.8,250.8 L478.4,245.6 L480.9,242.7 L483.5,244.2 L486.6,241.8 L494.1,237.5 L496.0,238.2 L500.1,236.9 L502.4,237.5 L504.1,235.1 Z");
    PREFECTURE_PATHS["45"] = JAPAN.path("M446.4,233.9 L446.4,228.6 L445.5,226.7 L443.4,226.5 L445.0,224.1 L447.1,222.5 L448.4,219.6 L450.1,218.4 L452.3,219.5 L455.5,217.6 L456.9,217.8 L458.9,213.6 L459.9,206.6 L461.5,208.5 L462.6,206.0 L459.9,205.7 L459.1,202.7 L457.2,201.6 L459.3,201.5 L460.3,199.0 L460.7,195.6 L463.9,198.7 L465.5,199.4 L467.0,197.8 L469.4,197.8 L471.1,200.0 L470.7,203.6 L472.1,212.7 L473.1,214.6 L476.5,215.3 L479.0,211.8 L478.6,209.2 L479.4,207.6 L481.7,208.3 L482.6,210.8 L485.9,212.0 L487.4,213.8 L489.9,212.0 L491.7,207.2 L492.3,202.4 L493.1,200.8 L491.7,197.0 L489.1,195.1 L488.6,197.0 L485.5,199.5 L482.7,198.9 L481.6,199.9 L478.7,200.4 L477.0,202.0 L475.3,201.2 L475.3,198.9 L477.8,188.7 L480.3,184.9 L480.5,182.8 L482.7,185.0 L487.2,186.6 L490.2,190.1 L493.0,191.7 L496.7,190.8 L499.4,188.1 L498.2,193.5 L497.1,200.5 L496.9,206.5 L497.6,216.3 L498.8,223.0 L500.0,226.6 L501.7,229.1 L503.7,228.9 L507.4,233.1 L504.1,235.1 L502.4,237.5 L500.1,236.9 L496.0,238.2 L494.1,237.5 L486.6,241.8 L483.5,244.2 L480.9,242.7 L482.2,236.9 L481.7,233.2 L480.5,231.7 L478.2,230.9 L473.5,234.3 L467.5,235.1 L461.9,231.7 L458.9,233.2 L452.6,233.1 L450.5,232.4 L448.2,233.8 Z");
    PREFECTURE_PATHS["46"] = JAPAN.path("M431.9,157.8 L429.9,158.5 L429.2,153.5 L430.0,151.9 L433.9,150.3 L434.4,150.9 L432.9,153.5 Z M627.4,88.2 L628.4,86.1 L624.0,84.1 L626.8,84.6 L629.4,86.1 Z M582.1,61.3 L580.9,61.8 L576.7,60.6 L578.2,60.3 Z M492.2,19.2 L488.4,17.1 L487.8,14.2 L490.1,12.4 L492.2,13.5 L494.4,16.6 Z M483.7,3.6 L485.2,3.2 L485.9,4.4 L485.4,9.1 L484.6,10.5 L483.3,6.8 Z M622.5,56.9 L624.0,53.8 L626.8,50.2 L628.0,52.6 L627.4,56.4 L625.6,59.1 L624.8,63.1 L622.0,67.1 L620.1,72.0 L620.5,72.8 L619.4,77.9 L620.9,80.9 L623.7,83.8 L625.6,87.9 L627.4,93.6 L630.0,98.2 L626.9,96.3 L626.7,97.7 L628.8,99.5 L633.7,100.3 L637.8,95.9 L640.4,94.0 L642.7,93.4 L645.4,94.1 L640.8,97.2 L639.0,97.4 L637.5,99.5 L635.7,104.2 L633.4,103.5 L628.4,104.2 L626.0,105.8 L622.5,107.0 L624.0,108.8 L620.2,111.1 L618.6,113.3 L614.1,113.4 L613.1,111.1 L610.3,112.2 L609.9,114.7 L611.4,116.1 L610.0,116.6 L605.1,115.7 L601.7,116.5 L598.1,115.6 L596.9,113.7 L591.0,115.0 L586.3,117.4 L581.2,121.4 L578.1,125.5 L573.1,130.1 L571.0,132.8 L566.9,139.8 L563.7,146.1 L563.0,150.3 L563.5,153.9 L562.1,160.6 L559.9,164.0 L556.0,159.7 L550.6,156.3 L543.6,154.0 L536.3,149.9 L533.4,149.0 L527.2,144.7 L523.3,140.5 L519.7,140.0 L516.9,138.3 L515.0,136.1 L511.3,134.2 L508.1,133.4 L502.2,134.2 L498.0,135.9 L492.4,140.4 L486.6,143.9 L484.1,147.4 L482.7,148.1 L481.1,146.8 L483.0,146.3 L480.5,144.4 L480.1,142.6 L474.4,136.0 L472.8,135.3 L467.4,135.2 L465.0,135.9 L462.4,138.6 L460.5,141.9 L459.2,145.7 L459.3,149.9 L463.8,153.0 L468.0,157.0 L473.7,155.8 L475.7,157.2 L477.9,160.8 L480.3,162.9 L482.6,165.9 L486.3,167.3 L489.8,170.3 L490.0,171.5 L487.1,172.5 L483.7,175.2 L479.2,173.0 L475.7,172.5 L473.4,173.6 L474.3,171.4 L473.5,170.0 L471.2,170.4 L469.8,174.0 L464.6,176.5 L463.9,178.2 L464.3,181.9 L462.8,184.3 L458.4,185.6 L456.1,189.3 L452.3,188.7 L450.2,187.4 L448.4,181.9 L449.7,175.7 L452.1,170.7 L453.5,169.9 L454.3,165.7 L454.1,162.6 L450.2,156.9 L446.8,155.3 L445.3,152.7 L442.0,150.3 L441.4,147.3 L443.5,143.2 L444.3,140.1 L443.8,134.6 L445.4,131.2 L451.4,129.8 L454.2,127.4 L455.8,124.5 L458.4,126.8 L459.9,126.4 L460.2,124.3 L462.4,120.7 L466.7,116.8 L467.5,115.2 L464.6,109.7 L461.2,106.2 L460.9,104.3 L462.0,100.9 L465.1,100.3 L466.3,98.7 L470.7,102.0 L473.0,104.5 L477.1,107.1 L484.2,105.6 L484.2,107.9 L489.2,109.4 L491.1,108.8 L496.0,104.4 L498.3,99.2 L497.8,95.9 L495.9,93.0 L495.6,90.9 L496.6,89.3 L494.7,83.1 L496.3,79.5 L501.1,77.2 L502.9,75.6 L504.8,72.7 L505.7,66.8 L505.1,57.1 L505.5,55.4 L508.1,50.3 L509.5,42.3 L509.2,34.6 L508.1,29.1 L507.1,25.9 L502.6,16.3 L502.5,12.3 L504.6,8.1 L504.2,4.4 L505.0,3.1 L505.9,5.3 L510.2,4.3 L511.8,3.1 L513.2,0.0 L514.6,0.2 L517.7,5.2 L523.1,9.8 L533.7,22.6 L536.8,28.7 L539.6,32.2 L548.6,42.1 L553.2,46.2 L561.1,51.3 L562.9,54.2 L567.9,57.0 L575.4,59.7 L572.2,60.1 L573.9,63.2 L575.8,63.7 L580.6,63.6 L582.9,61.9 L586.9,62.0 L588.6,63.0 L587.2,64.3 L586.6,66.5 L588.6,66.7 L590.1,62.7 L591.5,64.1 L593.7,68.1 L595.8,69.6 L598.3,70.2 L602.2,70.8 L607.9,71.0 L610.9,69.6 L617.7,61.0 Z");//map.path("M122.246 76.6501c-0.0341,0 -0.0477,0.0272 -0.0681,0.0545 -0.0272,0.0375 -0.0545,0.0613 -0.0545,0.109 0,0.109 0.0476,0.1635 0.0545,0.2725l0.0648 0c0.0306,0 0.0442,-0.0239 0.0715,-0.0273 0.1431,-0.0306 0.2213,-0.0817 0.3678,-0.0817l0 -0.1635c-0.1192,-0.1329 -0.2555,-0.1635 -0.436,-0.1635zm18.3118 -50.9024c-0.0613,0.0818 -0.0954,0.1329 -0.1499,0.218 -0.075,0.1193 -0.184,0.1396 -0.2588,0.2589 -0.0681,0.109 -0.0545,0.1976 -0.0545,0.327 0,0.1703 -0.017,0.2759 0.0409,0.436 0.0408,0.1158 0.1192,0.1567 0.1907,0.2589 0.0272,0.0374 0.0272,0.0715 0.0545,0.1089 0.1226,0.1602 0.2214,0.235 0.3951,0.3407 0.0886,0.0545 0.1567,0.0817 0.2316,0.1498 0.0545,0.0478 0.075,0.1227 0.1499,0.1227 0.0272,0 0.0306,-0.034 0.0545,-0.0409 0.0851,-0.034 0.1329,-0.0851 0.218,-0.1226 0.0954,-0.0409 0.1465,-0.092 0.218,-0.1635 0.017,-0.017 0.0409,-0.0204 0.0545,-0.0409 0.1329,-0.1839 0.218,-0.3168 0.218,-0.545 0,-0.0818 -0.0306,-0.1226 -0.0409,-0.2044 -0.0204,-0.1396 -0.0375,-0.2146 -0.0545,-0.3542 -0.0136,-0.109 -0.0136,-0.1738 -0.0545,-0.2725 -0.034,-0.0851 -0.126,-0.0851 -0.218,-0.0954 -0.2077,-0.0239 -0.3679,-0.0409 -0.4905,-0.2044 -0.0612,-0.0817 -0.1157,-0.1226 -0.2043,-0.1771 -0.0852,-0.0511 -0.1329,-0.109 -0.2351,-0.109l-0.1056 0 0.0409 0.109zm-1.4715 -2.8067c-0.0375,0.0954 -0.0681,0.1771 -0.1635,0.218 -0.1022,0.0442 -0.1737,0.0272 -0.2861,0.0272 0.017,0.1159 0.0409,0.1772 0.0409,0.293 0,0.2078 -0.0545,0.3235 -0.0545,0.5314 0,0.1158 0.0545,0.1703 0.0954,0.2793 0.0442,0.126 0.0578,0.2077 0.1226,0.327 0.0239,0.0477 0.0647,0.0578 0.0817,0.109 0.0409,0.1158 0.0137,0.1976 0.0137,0.3236 0,0.0851 0.0238,0.1362 0.0136,0.2214 -0.0034,0.0306 -0.0136,0.0511 -0.0136,0.0817 0,0.0647 0.0442,0.1226 0.109,0.1226 0.0578,0 0.1192,-0.0238 0.1226,-0.0817 0,-0.0307 -0.0136,-0.0512 -0.0136,-0.0818 0,-0.109 0.0408,-0.1668 0.0545,-0.2725 0.0341,-0.235 0.0374,-0.3746 0.0544,-0.6131 0.0069,-0.092 0.0342,-0.143 0.0342,-0.235l0 -0.5791c0,-0.1941 0.0136,-0.3031 -0.0342,-0.4939 -0.0203,-0.092 -0.1056,-0.1157 -0.1771,-0.1771zm-16.1045 45.1799c0,0.0579 0.0511,0.0818 0.0681,0.1363 0.017,0.0613 0.0239,0.0987 0.0272,0.1635l-0.0408 0.327c0.0069,0.0408 0.0102,0.075 0.0272,0.109 0.0239,0.0477 0.092,0.0442 0.109,0.0954 0.0136,0.0374 0.0136,0.0681 0.0136,0.1089 0.0103,0.1465 0.017,0.2385 0.0818,0.3679 0.0784,-0.0579 0.1329,-0.0885 0.218,-0.1362 0.0477,-0.0273 0.0681,-0.0613 0.1226,-0.0818 0.0988,-0.034 0.1976,-0.0511 0.2317,-0.1499 0.0442,-0.1226 0.0374,-0.2111 0.0545,-0.3406 0.0204,-0.143 0.0408,-0.2247 0.0681,-0.3678 0.0477,-0.2555 -0.0239,-0.4667 0.1498,-0.654 0.0886,-0.0954 0.1533,-0.1533 0.2453,-0.2453 0.0715,-0.0715 0.1363,-0.1295 0.1363,-0.2316 0,-0.0818 -0.0886,-0.1635 -0.1636,-0.1363 -0.0476,0.0171 -0.0612,0.0613 -0.0953,0.0954 -0.0545,0.0545 -0.0954,0.0851 -0.1635,0.1226 -0.1738,0.0954 -0.3031,0.0954 -0.5042,0.109 -0.126,0.0103 -0.2213,-0.0272 -0.3269,0.0409 -0.0512,0.0306 -0.0409,0.092 -0.0546,0.1499 -0.0238,0.0885 -0.0714,0.1329 -0.109,0.218 -0.0476,0.109 -0.0953,0.1771 -0.0953,0.2997zm58.1099 -16.704c0.0784,0.2555 0.1123,0.4257 0.2997,0.6131 0.0715,0.0715 0.1397,0.0954 0.218,0.1635 0.126,0.109 0.1941,0.1941 0.2453,0.3542 -0.1397,-0.034 -0.2283,-0.0783 -0.3134,-0.1907 -0.0306,-0.0409 -0.0681,-0.0579 -0.0818,-0.109 -0.0203,-0.0715 -0.0805,-0.105 -0.1555,-0.105 -0.0852,0 -0.0897,-0.0312 -0.1714,-0.0176 -0.1091,0.017 -0.1738,0.0136 -0.2862,0.0136 0.0034,0.017 -0.0068,0.0375 0,0.0545 0.0273,0.0477 0.0784,0.0579 0.0954,0.109 0.0204,0.0579 0,0.1193 0.0409,0.1635 0.0408,0.0443 0.1021,0.0136 0.1635,0.0272 0.0205,0.0034 0.0341,0.0239 0.0545,0.0273 0.0851,0.0272 0.1499,0.0205 0.2316,0.0545 0.109,0.0442 0.1669,0.0987 0.2725,0.1499 -0.1193,0.017 -0.218,0.0409 -0.2725,0.1498l0 0.109c0.126,0 0.2214,-0.0204 0.327,0.0409 0.1022,0.0614 0.1295,0.1669 0.2452,0.2044 0.1704,0.0545 0.2828,-0.0204 0.4633,0 0.0545,0.0034 0.0851,0.0409 0.1396,0.0409l0.1193 0 0.0136 -0.0545c-0.1771,-0.0885 -0.252,-0.1703 -0.4087,-0.2725 -0.5098,-0.3263 0.1365,-0.0186 0.2997,0.0545 0.0409,0.017 0.0647,0.0408 0.109,0.0545 0.0614,0.0205 0.1022,0.0136 0.1635,0.0272 0.1056,0.0239 0.1635,0.0818 0.2725,0.0818 0.092,0 0.1465,-0.0545 0.2043,-0.1227 0.0954,-0.109 0.1738,-0.1464 0.2589,-0.2588 0.0545,-0.0715 0.0784,-0.1226 0.1363,-0.1908 0.0953,-0.109 0.1873,-0.1328 0.2861,-0.2316 0.0987,-0.0988 0.1805,-0.126 0.2725,-0.2316 0.0715,-0.0851 0.1022,-0.1499 0.1907,-0.218 0.1704,-0.1294 0.2862,-0.201 0.3815,-0.3951 0.017,0.0068 0.0443,-0.0137 0.0545,0 0.0478,0.0545 0.0614,0.1192 0.1227,0.1635 0.0953,0.0715 0.1839,0.075 0.3066,0.0817l0.7833 -0.1499c0.0648,0.0137 0.1193,0.0205 0.1635,0.0682 0.075,0.0817 0.0682,0.1668 0.0682,0.2793 0,0.0715 -0.0613,0.109 -0.1226,0.143 -0.0749,0.0443 -0.1227,0.0682 -0.2044,0.0954 -0.143,0.0477 -0.218,0.0886 -0.3543,0.1499 -0.109,0.0477 -0.1771,0.0681 -0.2725,0.1362 -0.1192,0.0851 -0.1907,0.1908 -0.3406,0.1908 -0.0954,0 -0.1499,-0.0409 -0.2453,-0.0545 -0.017,-0.0068 -0.0442,0.017 -0.0544,0 -0.0204,-0.034 -0.0239,-0.0715 -0.0409,-0.109 -0.0375,-0.0818 -0.0681,-0.1329 -0.0954,-0.218 -0.1907,0.1907 -0.1465,0.3985 -0.3134,0.6131 -0.0953,0.1226 -0.2282,0.1056 -0.3406,0.2044 -0.0681,0.0613 -0.0783,0.1295 -0.109,0.218 -0.017,0.0545 -0.0409,0.0817 -0.0545,0.1362 -0.0545,0.1874 -0.0272,0.3066 -0.0817,0.4905 -0.0273,0.0954 -0.0885,0.1465 -0.1363,0.2316 -0.0647,0.1124 -0.0851,0.1942 -0.0954,0.327l-0.0817 0.0137c-0.0647,-0.0376 -0.1056,-0.0682 -0.1635,-0.1091 -0.0647,-0.0476 -0.109,-0.0953 -0.1907,-0.0953 -0.1805,0 -0.2828,0.0408 -0.4633,0.0545 -0.3713,0.0272 -0.579,0.075 -0.9401,0.1499 -0.2656,0.0545 -0.4462,0.0102 -0.6813,0.1498 -0.1328,0.0784 -0.2146,0.1193 -0.3406,0.2044 -0.0647,0.0443 -0.1056,0.075 -0.1635,0.1226 -0.0783,0.0648 -0.1158,0.1499 -0.218,0.1499 -0.1328,0 -0.126,-0.1738 -0.1907,-0.2861 -0.1023,0.0511 -0.1669,0.0749 -0.2725,0.1226 -0.0851,0.0375 -0.1669,0.0442 -0.218,0.1226 -0.0784,0.1159 -0.0681,0.2146 -0.0681,0.3543 0,0.1192 -0.017,0.2213 0.0681,0.2997 0.0681,0.0648 0.1329,0.075 0.218,0.109 -0.0511,0.0443 -0.0851,0.0818 -0.1532,0.0818l-0.2964 0c-0.0239,0.0375 -0.0545,0.0647 -0.0681,0.109 -0.0409,0.1226 0.0033,0.2521 -0.109,0.3133 -0.1636,0.0886 -0.2828,0.0954 -0.4497,0.1772 -0.0886,0.0442 -0.0817,0.1498 -0.109,0.2452 -0.0238,0.0784 -0.0817,0.1192 -0.1499,0.1635 -0.1737,0.1192 -0.3065,0.1499 -0.5177,0.1499 -0.235,0 -0.3645,-0.092 -0.5995,-0.109 -0.1192,-0.0068 -0.1703,-0.0818 -0.2725,-0.1363 -0.0886,-0.0476 -0.1362,-0.0885 -0.218,-0.1498 -0.0408,-0.0307 -0.0953,-0.0545 -0.0953,-0.109 0,-0.0613 0.0612,-0.0818 0.0817,-0.1363 0.0136,-0.0409 0.0239,-0.0715 0.0409,-0.109 0.0749,0.0545 0.1396,0.075 0.218,0.1226 0.1021,0.0648 0.109,0.218 0.2316,0.218 0.0443,0 0.0681,-0.0272 0.109,-0.0408 0.0647,-0.0204 0.1021,-0.0375 0.1499,-0.0818 0.0851,-0.0784 0.1465,-0.1193 0.218,-0.2044 0.0375,-0.0442 0.0954,-0.0612 0.0954,-0.1226 0,-0.0851 -0.0512,-0.1329 -0.1227,-0.1771 -0.0784,-0.0477 -0.1396,-0.0818 -0.235,-0.0818l-0.3339 0c-0.126,0 -0.2111,-0.0851 -0.2486,-0.2044 -0.1124,0.1499 -0.1601,0.2759 -0.327,0.3679 -0.0408,0.0205 -0.0647,0.0443 -0.109,0.0545 -0.1022,0.0239 -0.1703,-0.034 -0.2725,-0.0136 -0.218,0.0409 -0.3508,0.1295 -0.4768,0.3134 -0.0682,0.1022 -0.1227,0.1737 -0.1227,0.2997 0,0.1669 0.0545,0.2589 0.1227,0.4088 0.0511,0.1124 0.0954,0.1839 0.1635,0.2861 0.0442,0.0681 0.0885,0.1022 0.1362,0.1635 0.0136,0.0205 0.0443,0.017 0.0545,0.0409 0.0103,0.0238 -0.0068,0.0442 0,0.0681 -0.2759,0.0034 -0.4292,0.0136 -0.7051,0.0136 -0.0511,0 -0.0784,-0.0239 -0.126,-0.0409 -0.0851,-0.0067 -0.1363,0.0034 -0.2044,-0.0408 -0.0306,-0.0204 -0.0442,-0.0682 -0.0851,-0.0682l-0.8788 0c-0.1874,0 -0.2929,-0.0545 -0.4803,-0.0545 -0.1601,0 -0.2214,0.1499 -0.3815,0.1499 -0.218,0 -0.3406,-0.0749 -0.545,-0.1499 -0.109,-0.0408 -0.1771,-0.0783 -0.2861,-0.1226 -0.0818,-0.034 -0.1396,-0.0545 -0.218,-0.0954 -0.0478,-0.0238 -0.109,-0.0408 -0.109,-0.0953 0,-0.0545 0.0204,-0.0852 0.0136,-0.1363 -0.0034,-0.0272 -0.0306,-0.0442 -0.0545,-0.0545 -0.075,-0.0409 -0.1362,-0.034 -0.218,-0.0681 -0.0851,-0.034 -0.126,-0.109 -0.2214,-0.109l-0.3338 0c-0.0885,0 -0.1329,0.0341 -0.2214,0.0409 -0.2725,0.0205 -0.4257,0.0784 -0.6812,0.1635 -0.2283,0.0783 -0.3406,0.1703 -0.5587,0.2725 -0.1498,0.0681 -0.2521,0.0817 -0.3951,0.1635 -0.0817,0.0477 -0.1329,0.075 -0.218,0.109 -0.1022,0.0442 -0.1498,0.1022 -0.2588,0.1362 -0.0784,0.0239 -0.1193,0.0648 -0.1908,0.0954 -0.1704,0.0784 -0.2725,0.1362 -0.436,0.2316 -0.0851,0.0478 -0.1465,0.0579 -0.2316,0.109 -0.235,0.1465 -0.3509,0.2453 -0.5314,0.4496 -0.1601,0.1805 -0.2895,0.2555 -0.4496,0.436 -0.0239,0.0273 -0.0341,0.0545 -0.0545,0.0818 -0.0954,0.1192 -0.1907,0.1498 -0.2998,0.2588 -0.0681,0.0682 -0.1022,0.1193 -0.1634,0.1908 -0.0818,0.092 -0.1465,0.1329 -0.2317,0.218l-0.5995 0.5995c-0.0851,0.0851 -0.1634,0.1124 -0.2452,0.2044 -0.0614,0.0715 -0.092,0.1295 -0.1635,0.1907 -0.0477,0.0409 -0.092,0.0511 -0.1363,0.0954 -0.0749,0.075 -0.0987,0.1362 -0.1771,0.2044 -0.1362,0.1192 -0.2248,0.1839 -0.3542,0.3133 -0.1124,0.1124 -0.1976,0.1533 -0.2998,0.2725 -0.0681,0.0784 -0.0886,0.1431 -0.1635,0.218 -0.1056,0.1056 -0.1771,0.1499 -0.2861,0.2589 -0.0715,0.1805 -0.1703,0.2657 -0.2588,0.436 -0.1023,0.1976 -0.1261,0.327 -0.2589,0.5041 -0.0648,0.0886 -0.126,0.1295 -0.1908,0.218 -0.0817,0.109 -0.109,0.1908 -0.1907,0.2997 -0.1057,0.1397 -0.184,0.2147 -0.2862,0.3543 -0.0681,0.092 -0.1362,0.1329 -0.1907,0.2316 -0.0477,0.0886 -0.075,0.1431 -0.1226,0.2316 -0.0239,0.0478 -0.0614,0.0715 -0.0818,0.1226 -0.0477,0.1227 -0.092,0.1908 -0.1634,0.2998 -0.1023,0.1533 -0.1329,0.2623 -0.2181,0.4224 -0.0477,0.0886 -0.0783,0.1396 -0.1226,0.2316 -0.0341,0.0681 -0.0647,0.1056 -0.0954,0.1771 -0.0987,0.2249 -0.1362,0.3679 -0.1907,0.6131 -0.0375,0.1805 -0.0818,0.2794 -0.0818,0.4633 0,0.1328 0.0239,0.2112 0.0546,0.3406 0.0203,0.0851 0.0306,0.1431 0.0681,0.218 0.0748,0.1431 0.1498,0.2316 0.1498,0.3951 0,0.1295 -0.0544,0.201 -0.0544,0.3304l0 0.5246c0,0.109 -0.0443,0.1702 -0.0682,0.2759 -0.0341,0.1465 -0.0477,0.235 -0.0681,0.3815 -0.0136,0.0886 -0.0205,0.1396 -0.0272,0.2316 -0.0034,0.0647 0.0169,0.1022 0,0.1635 -0.0342,0.126 -0.1329,0.1737 -0.2317,0.2589 -0.109,0.092 -0.1362,0.1873 -0.2043,0.3133 -0.0512,0.0988 -0.0715,0.1738 -0.0954,0.2861 -0.0069,0.0375 -0.0239,0.0682 -0.0273,0.109 -0.0341,0.2759 -0.0136,0.4327 -0.0545,0.7085 -0.2112,-0.0681 -0.2521,-0.2452 -0.3815,-0.4223 -0.0749,-0.1057 -0.1567,-0.1329 -0.2589,-0.218 -0.0714,-0.0613 -0.0886,-0.1329 -0.1226,-0.218 -0.1192,-0.2929 -0.2521,-0.4599 -0.5177,-0.6404 -0.109,-0.0749 -0.1567,-0.1396 -0.2725,-0.2044 -0.218,-0.1226 -0.3509,-0.1873 -0.5586,-0.327 -0.1329,-0.0885 -0.2044,-0.1668 -0.327,-0.2725 -0.0851,-0.0715 -0.1192,-0.143 -0.218,-0.2043 -0.109,-0.0682 -0.1738,-0.0988 -0.2861,-0.1499 -0.2453,-0.1124 -0.3985,-0.1533 -0.6677,-0.2044 -0.2213,-0.0408 -0.3474,-0.034 -0.5722,-0.0545 -0.1941,-0.017 -0.3406,-0.0375 -0.4632,-0.1907 -0.0478,-0.0613 -0.0682,-0.1227 -0.1363,-0.1635 -0.0784,-0.0476 -0.1328,-0.0545 -0.218,-0.0818 -0.2385,-0.0783 -0.3781,-0.1021 -0.6267,-0.1498 -0.126,-0.0239 -0.2147,-0.0204 -0.327,-0.0818 -0.0478,-0.0239 -0.0614,-0.0681 -0.0954,-0.109 -0.0545,-0.0647 -0.0988,-0.0954 -0.1499,-0.1635 -0.1056,-0.143 -0.1771,-0.2452 -0.3406,-0.3134 -0.2044,-0.0851 -0.3202,-0.1668 -0.4905,-0.3133 -0.1703,-0.1465 -0.327,-0.1601 -0.4769,-0.327 -0.1703,-0.0988 -0.2758,-0.1158 -0.4632,-0.1771 -0.0851,-0.0273 -0.1362,-0.0613 -0.218,-0.0954 -0.1635,-0.0682 -0.2691,-0.092 -0.4224,-0.1908 -0.2077,-0.1328 -0.3372,-0.1975 -0.5313,-0.3406 -0.0648,-0.0476 -0.0886,-0.0987 -0.1499,-0.1499 -0.1908,-0.1669 -0.31,-0.2555 -0.5178,-0.3951 -0.2043,-0.1396 -0.3031,-0.2486 -0.4768,-0.4224 -0.1805,-0.1805 -0.1976,-0.3746 -0.4088,-0.5177 -0.2895,-0.1975 -0.5313,-0.1396 -0.8719,-0.2316 -0.1227,-0.034 -0.1908,-0.0648 -0.2998,-0.1226 -0.1533,-0.0818 -0.2521,-0.1397 -0.3679,-0.2726 -0.0919,-0.1056 -0.1805,-0.126 -0.2725,-0.2316 -0.0681,-0.0783 -0.0953,-0.1396 -0.1635,-0.218 -0.0715,-0.0851 -0.1362,-0.126 -0.2043,-0.2179 -0.0443,-0.0613 -0.0681,-0.1091 -0.1226,-0.1636 -0.184,-0.1838 -0.3134,-0.2656 -0.545,-0.3814 -0.1193,-0.0579 -0.1942,-0.0954 -0.3271,-0.1227 -0.3167,-0.0647 -0.4938,-0.1226 -0.8038,-0.218 -0.2214,-0.0681 -0.3611,-0.0715 -0.5859,-0.1226 -0.092,-0.0204 -0.1532,-0.0409 -0.2452,-0.0545 -0.2555,-0.0409 -0.3985,-0.0681 -0.6574,-0.0681l-0.3611 0c-0.0988,0 -0.1566,0.0409 -0.2486,0.0681 -0.1738,0.0545 -0.2692,0.0954 -0.436,0.1771 -0.1874,0.092 -0.3032,0.126 -0.4905,0.218 -0.1124,0.0545 -0.1771,0.0851 -0.2861,0.1499 -0.1124,0.0647 -0.1568,0.1396 -0.2726,0.2044 -0.1328,0.0715 -0.1873,0.1601 -0.2997,0.2588 -0.0409,0.0342 -0.0886,0.0375 -0.1362,0.0682 -0.0511,0.0341 -0.0545,0.0817 -0.109,0.109 -0.017,0.0068 -0.0375,-0.0034 -0.0545,0 -0.0818,0.0613 -0.1227,0.0886 -0.2044,0.1498 -0.0681,0.0512 -0.1022,0.1023 -0.1635,0.1635 -0.184,0.184 -0.2997,0.2862 -0.4769,0.4769 -0.0579,0.0647 -0.1124,0.0851 -0.1771,0.1499 -0.0579,0.0579 -0.092,0.1124 -0.1635,0.1498 -0.0239,0.0103 -0.0442,0.0069 -0.0681,0.0137 -0.0478,0.0136 -0.075,0.0408 -0.1227,0.0545 -0.1601,0.0477 -0.2622,0.0851 -0.3814,0.2044 -0.0818,0.0817 -0.1227,0.1498 -0.2044,0.2316 -0.2623,0.2622 -0.3917,0.4292 -0.6404,0.7085 -0.1668,0.1873 -0.2759,0.2759 -0.4496,0.4496 -0.0715,0.0715 -0.1193,0.1159 -0.1635,0.2044 -0.0205,0.0442 -0.0375,0.0783 -0.0545,0.1226 -0.0205,0.0477 -0.0273,0.109 -0.0818,0.109 -0.0238,0 -0.0341,-0.0239 -0.0544,-0.0273 -0.1124,-0.0204 -0.1805,-0.0578 -0.2725,-0.1226 -0.0887,-0.0647 -0.1193,-0.1329 -0.2044,-0.2044 -0.0681,-0.0578 -0.1635,-0.0851 -0.1635,-0.1771 0,-0.1021 0.0681,-0.1566 0.0681,-0.2589 0,-0.0476 -0.0579,-0.0579 -0.0954,-0.0817 -0.0375,-0.0239 -0.0715,-0.0409 -0.109,-0.0681 -0.0783,-0.0613 -0.1022,-0.1294 -0.1498,-0.218 -0.0273,-0.0545 -0.0307,-0.1022 -0.0409,-0.1635 -0.0239,-0.1363 -0.0784,-0.2044 -0.109,-0.3407 -0.0205,-0.0953 -0.0272,-0.1566 -0.0681,-0.2452 -0.0443,-0.0987 -0.1159,-0.1294 -0.1908,-0.2044 -0.1873,-0.1873 -0.2997,-0.3065 -0.545,-0.4087 -0.1056,-0.0409 -0.184,-0.0545 -0.2725,-0.1227 -0.109,-0.0851 -0.109,-0.1974 -0.1498,-0.3269 -0.0443,-0.1397 -0.1295,-0.1975 -0.2044,-0.327 -0.0648,-0.1124 -0.1295,-0.1635 -0.2044,-0.2725 -0.0647,-0.0988 -0.1192,-0.1771 -0.2316,-0.218 -0.0375,-0.0136 -0.0681,-0.0103 -0.109,-0.0136 -0.1295,-0.0137 -0.2044,-0.0273 -0.3339,-0.0273 -0.2213,0 -0.344,0.0409 -0.5653,0.0409 -0.1397,0 -0.218,-0.0545 -0.3577,-0.0545l-0.3475 0c-0.0476,0 -0.0681,0.0409 -0.1157,0.0409l-0.4429 0c-0.1328,0 -0.1805,0.109 -0.2758,0.2043 -0.1193,0.2862 -0.2283,0.4463 -0.4497,0.6676 -0.0579,0.0579 -0.1056,0.0784 -0.1635,0.1363 -0.1498,0.1498 -0.2793,0.2316 -0.3406,0.436 -0.0375,0.126 -0.0477,0.2112 -0.109,0.327 -0.1532,0.2861 -0.1873,0.4768 -0.2861,0.7902 -0.0817,0.2589 -0.1226,0.4156 -0.1771,0.6813 -0.0069,0.0408 -0.0409,0.0613 -0.0409,0.1056l0 0.7221c0,0.1771 -0.0273,0.2895 0.0409,0.453 0.0715,0.1771 0.201,0.2861 0.3951,0.2997 0.1702,0.0137 0.2725,-0.0272 0.436,0.0137 0.1941,0.0477 0.2759,0.1499 0.436,0.2725 0.2316,0.1771 0.3406,0.2997 0.5586,0.4904 0.0987,0.0852 0.1771,0.1159 0.2725,0.2044 0.1533,0.1397 0.2793,0.1976 0.3815,0.3815 0.0476,0.0886 0.0818,0.1499 0.1635,0.2044 0.0476,0.0306 0.0784,0.0681 0.1362,0.0681 0.0341,0 0.0375,-0.017 0.0682,-0.0272 0.143,-0.0103 0.218,-0.0613 0.3542,-0.0954 0.092,-0.0239 0.1532,-0.0068 0.2453,-0.0273 0.2009,-0.0476 0.31,-0.1226 0.5177,-0.1226 0.1874,0 0.31,0.0443 0.4496,0.1635 0.0818,0.0715 0.143,0.1056 0.2044,0.1908 0.0375,0.0545 0.0885,0.1159 0.1226,0.1771 0.1124,0.0545 0.1499,0.1396 0.2044,0.2453 0.0442,0.0817 0.0749,0.1328 0.109,0.2179 0.0272,0.0682 0.0408,0.1193 0.0817,0.1772 0.1022,0.1362 0.1908,0.184 0.327,0.2861 0.201,0.1499 0.3134,0.2452 0.4905,0.4223 0.1908,0.1908 0.218,0.3816 0.4088,0.5723 0.0578,0.0579 0.1056,0.092 0.1635,0.1499 0.1566,0.1567 0.2077,0.293 0.3951,0.4087 0.1396,0.0851 0.2384,0.1056 0.3951,0.1635 0.2111,0.0784 0.3373,0.1124 0.5586,0.1499 0.126,0.0205 0.201,0.0306 0.327,0.0545 0.0851,0.0136 0.1908,0.0375 0.1908,0.126l0 0.293c0,0.1123 -0.0409,0.218 0.0409,0.2895 0.0884,0.0783 0.2009,0.0375 0.2861,0.1226 -0.0682,0.1056 -0.075,0.1874 -0.1499,0.2861 -0.0306,0.0409 -0.0443,0.0954 -0.0954,0.0954 -0.0715,0 -0.1158,-0.0136 -0.1874,-0.0136 -0.1566,0 -0.235,0.0954 -0.3439,0.2043 -0.075,0.075 -0.1329,0.1159 -0.1908,0.2044 -0.0545,0.0818 -0.075,0.1568 -0.1635,0.2044 -0.0545,0.0306 -0.1022,0.0238 -0.1635,0.0409 -0.1159,0.0341 -0.1738,0.0851 -0.2861,0.1226 -0.1295,0.0409 -0.2044,0.0851 -0.327,0.1499 -0.0409,0.0204 -0.0614,0.0681 -0.109,0.0681 -0.1124,0 -0.1192,-0.1363 -0.1771,-0.2317 -0.0545,-0.0884 -0.1124,-0.1328 -0.2044,-0.1771 -0.2044,-0.1021 -0.3168,-0.1668 -0.5178,-0.2725 -0.1532,-0.0783 -0.2657,-0.0715 -0.4359,-0.109 -0.0443,-0.0102 -0.0784,-0.0375 -0.1227,-0.0408 -0.1192,-0.0136 -0.1907,-0.0068 -0.3133,-0.0136 -0.1023,-0.0068 -0.1568,-0.0273 -0.2589,-0.0273 -0.126,0 -0.2113,0 -0.3134,0.0681 -0.0886,0.0579 -0.1124,0.1329 -0.1771,0.218 -0.0306,0.0409 -0.0545,0.0818 -0.109,0.0818 -0.0614,0 -0.0954,-0.0613 -0.0954,-0.1227 0,-0.0578 0.0409,-0.0885 0.0682,-0.1362 0.0339,-0.0613 0.0476,-0.1056 0.0817,-0.1635 0.0375,-0.0613 0.109,-0.0885 0.109,-0.1635 0,-0.1329 -0.1192,-0.1737 -0.218,-0.2589 -0.0954,-0.0817 -0.1601,-0.1635 -0.2861,-0.1635 -0.1295,0 -0.1942,0.0851 -0.2861,0.1772 -0.0648,0.0647 -0.1159,0.1022 -0.1635,0.1771 -0.1363,0.2043 -0.2555,0.3066 -0.3134,0.545 -0.0205,0.0851 -0.0273,0.1431 -0.0681,0.218 -0.0239,0.0477 -0.0648,0.0545 -0.109,0.0817 -0.0682,0.0409 -0.1056,0.0715 -0.1772,0.109 -0.1567,0.0818 -0.2486,0.1329 -0.3951,0.2316 -0.0681,0.0443 -0.1056,0.109 -0.1907,0.109 -0.109,0 -0.1704,-0.0238 -0.2725,-0.0545 -0.0579,-0.017 -0.0886,-0.0545 -0.1499,-0.0545 -0.0545,0 -0.0647,0.0614 -0.0817,0.109 -0.0239,0.0648 -0.0341,0.109 -0.0545,0.1771 -0.0443,0.1397 -0.0614,0.2249 -0.0954,0.3679 -0.0478,0.2113 -0.0512,0.3406 -0.0681,0.5586 -0.0034,0.0648 -0.0273,0.1023 -0.0273,0.1669l0 0.3339c0,0.1975 0.1226,0.2963 0.1226,0.4938 0,0.0682 0.0273,0.1432 -0.0272,0.1772 -0.0545,0.0341 -0.1023,0.0272 -0.1635,0.0409 -0.1363,0.0341 -0.2112,0.0578 -0.3406,0.109 -0.3067,0.1226 -0.4905,0.1634 -0.7903,0.2997 -0.1226,0.0545 -0.201,0.0954 -0.3134,0.1635 -0.0613,0.0375 -0.1226,0.0477 -0.1634,0.109 -0.0478,0.075 -0.0648,0.1329 -0.0954,0.218 -0.0512,0.1396 -0.092,0.218 -0.1499,0.3542 -0.0409,0.092 -0.0715,0.1568 -0.1363,0.2317 -0.0442,0.0511 -0.0783,0.109 -0.1498,0.109 -0.0681,0 -0.1022,-0.0273 -0.1635,-0.0545 -0.0886,-0.0375 -0.1431,-0.0749 -0.218,-0.1363 -0.0886,-0.0749 -0.1295,-0.1771 -0.2453,-0.1771 -0.2077,0 -0.3236,0.0681 -0.5313,0.0681 -0.0954,0 -0.1363,-0.0885 -0.1908,-0.1635 -0.092,-0.1226 -0.1465,-0.2044 -0.218,-0.3406 -0.1192,-0.2248 -0.201,-0.361 -0.2997,-0.5995 -0.075,-0.1874 -0.0614,-0.3167 -0.1363,-0.5041 -0.0681,-0.1635 -0.0817,-0.2725 -0.109,-0.4497 -0.0136,-0.0919 -0.0545,-0.1498 -0.0545,-0.2452 0,-0.1669 0.0443,-0.2589 0.0818,-0.4224 0.0204,-0.0885 0.0954,-0.1226 0.0954,-0.2146l0 -0.3337c0,-0.0512 0.034,-0.075 0.0545,-0.1193 0.0578,-0.1293 0.1123,-0.2077 0.1907,-0.327 0.1124,-0.1702 0.1499,-0.2861 0.2725,-0.4496 0.0612,-0.0817 0.0988,-0.1329 0.1499,-0.218 0.0375,-0.0647 0.0987,-0.092 0.1226,-0.1635 0.0272,-0.0885 0.017,-0.1499 0.0272,-0.2452 0.0137,-0.1329 0.017,-0.2078 0.0273,-0.3406l0.0954 0 0.1635 0.0408c0.126,-0.0612 0.1771,-0.1702 0.1771,-0.3065 0,-0.201 -0.0239,-0.3168 0.0272,-0.511 0.017,-0.0612 0.0307,-0.0987 0.0409,-0.1635 0,-0.2043 0.0273,-0.3303 0.0273,-0.5347 0,-0.1568 -0.0579,-0.235 -0.0818,-0.3918 -0.0205,-0.1465 -0.0409,-0.2213 -0.0545,-0.3678 -0.0102,-0.0954 -0.0102,-0.1635 -0.0545,-0.2453 -0.1022,-0.1839 -0.1976,-0.2691 -0.327,-0.436 -0.075,-0.0987 -0.0886,-0.1771 -0.1499,-0.2861 -0.0613,-0.109 -0.1158,-0.1702 -0.1634,-0.2861 -0.0648,-0.1533 -0.1124,-0.235 -0.1908,-0.3815 -0.0341,-0.0648 -0.0442,-0.1329 -0.109,-0.1635 -0.0954,-0.0476 -0.1669,-0.0579 -0.2725,-0.0818 -0.2657,-0.0612 -0.4599,0.0034 -0.6812,-0.1498 -0.1159,-0.0784 -0.1568,-0.1738 -0.218,-0.2998 -0.0614,-0.1226 -0.1023,-0.1975 -0.1499,-0.327 -0.0987,-0.2691 -0.2146,-0.4496 -0.4769,-0.5586 -0.126,-0.0511 -0.2044,-0.0885 -0.327,-0.1499 -0.1498,-0.0748 -0.2588,-0.1838 -0.2588,-0.3542 0,-0.1158 0.0136,-0.1874 -0.0137,-0.2998 -0.0408,-0.1668 -0.0953,-0.2622 -0.0953,-0.436 0,-0.1838 0.0817,-0.2827 0.1771,-0.4359 0.1226,-0.1975 0.2044,-0.3065 0.327,-0.5042 0.1056,-0.1737 0.1362,-0.3031 0.1771,-0.5041 0.0375,-0.1907 0.0681,-0.3065 0.0681,-0.5041 0,-0.4802 -0.0953,-0.746 -0.0953,-1.2262l0 -0.1601c0,-0.2418 0.0136,-0.3781 0.0136,-0.6199 0,-0.2658 0.1362,-0.3985 0.1362,-0.6643 0.1158,-0.1294 0.2453,-0.1771 0.3951,-0.2588 0.0648,-0.034 0.0954,-0.0852 0.1636,-0.109 0.1056,-0.0375 0.1737,-0.0204 0.2861,-0.0273 0.0681,-0.0034 0.109,-0.0239 0.1771,-0.0272 0.1907,-0.0136 0.2997,-0.0715 0.4905,-0.0545 0.1056,0.0068 0.1702,-0.0103 0.2725,-0.0273 0.0885,-0.0136 0.1601,-0.0136 0.218,-0.0817 0.0545,-0.0648 0.0409,-0.1363 0.0545,-0.218 0.0067,-0.0511 0.0442,-0.0715 0.0817,-0.109 0.0545,-0.0545 0.0954,-0.0885 0.1635,-0.1226 0.1396,-0.0715 0.2214,-0.1193 0.3679,-0.1636 0.0647,-0.0169 0.1124,-0.0136 0.1635,-0.0545 0.0681,-0.0578 0.0579,-0.1293 0.0681,-0.2179 0.0136,-0.1158 0.0511,-0.1874 0.1227,-0.2725 0.1429,-0.1635 0.1702,-0.3065 0.2179,-0.5178 0.017,0.0136 0.0443,0.0103 0.0545,0.0273 0.0239,0.0375 0.0204,0.0817 0.0545,0.109 0.0477,0.0408 0.109,0.0136 0.1635,0.0408 0.0239,0.0103 0.0204,0.0375 0.0409,0.0545 0.0784,0.0648 0.1362,0.109 0.1771,0.2044 0.0512,0.1226 0.0512,0.2078 0.109,0.327 0.0852,-0.0204 0.1329,-0.0511 0.218,-0.0681 0.1226,-0.0239 0.201,-0.017 0.327,-0.0273 0.0204,-0.1601 0.0682,-0.2452 0.0682,-0.4053 0,-0.0238 0.0136,-0.034 0.0136,-0.0579 0,-0.0545 -0.0273,-0.0851 -0.0273,-0.1396 0,-0.0818 0.0137,-0.1431 0.0682,-0.201 0.0306,-0.034 0.0783,-0.0375 0.1089,-0.0681 0.1227,-0.1227 0.1294,-0.2487 0.2453,-0.3815 0.1157,-0.1329 0.1532,-0.2317 0.2452,-0.3816 0.092,-0.1498 0.1772,-0.2282 0.2317,-0.3951 0.0102,-0.0374 0.0102,-0.0748 0.0272,-0.109 0.0136,-0.0272 0.034,-0.034 0.0545,-0.0545 0.1226,-0.1226 0.235,-0.1532 0.3951,-0.218 0.0852,-0.034 0.1363,-0.0647 0.218,-0.109 0.1567,-0.0817 0.2453,-0.1532 0.3679,-0.2861 0.0885,-0.0987 0.1362,-0.1635 0.218,-0.2725 0.0409,-0.0545 0.0954,-0.0817 0.0954,-0.1498 0,-0.1635 -0.1533,-0.2112 -0.2317,-0.3543 -0.0783,-0.143 -0.092,-0.2452 -0.1771,-0.3815 -0.0545,-0.092 -0.1499,-0.0954 -0.218,-0.1771 -0.0409,-0.0511 -0.0375,-0.0988 -0.0545,-0.1635 -0.0442,-0.1601 -0.0987,-0.2453 -0.1907,-0.3815 -0.1533,-0.2248 -0.2828,-0.3338 -0.4769,-0.5177 -0.0681,-0.0648 -0.109,-0.1158 -0.1635,-0.1908 -0.092,-0.126 -0.2214,-0.1465 -0.2861,-0.2861 -0.017,-0.0409 -0.0239,-0.0784 -0.0409,-0.1226 -0.0613,-0.1601 -0.1362,-0.2453 -0.1907,-0.4088l0.2725 -0.8447 0 -0.327 -0.0273 -0.109 0.0137 -0.0545 0.2724 0 0.109 0.0272c0.1056,-0.017 0.1669,-0.034 0.2725,-0.0409 0.1567,-0.0102 0.2793,-0.0203 0.3815,-0.1362 0.0545,-0.1703 0.1499,-0.2555 0.1635,-0.436 0.0613,0.0239 0.1022,0.0341 0.1635,0.0545 0.1227,0.0443 0.1499,0.1431 0.2589,0.218 0.1226,0.0851 0.2418,0.0851 0.327,0.2044 0.0409,0.0579 0.0511,0.1022 0.0817,0.1635 0.092,0.1874 0.1499,0.3576 0.3543,0.4087 0.1465,0.0342 0.2555,0.0034 0.3815,0.0818 0.0409,0.0238 0.0579,0.0613 0.0954,0.0953 -0.0069,0.017 -0.0034,0.0409 -0.0137,0.0545 -0.0306,0.0376 -0.0953,0.0443 -0.0953,0.0954 0,0.0682 0.0545,0.1023 0.109,0.1363 0.0919,0.0579 0.1634,0.0613 0.2724,0.0681 0.1397,0.0102 0.2112,0.0579 0.3271,0.1362 0.1362,0.092 0.2179,0.1601 0.3814,0.1908 0.0885,0.017 0.1669,0.0034 0.2317,0.0681 0.0476,0.0478 0.0681,0.0988 0.0681,0.1669l0 0.2555 0.1601 0c0.2145,0 0.3235,-0.092 0.5348,-0.1363 0.1771,-0.034 0.2827,-0.0204 0.4632,-0.0408 0.235,-0.0273 0.3542,-0.1227 0.5723,-0.2044 0.1056,-0.0375 0.1702,-0.0511 0.2724,-0.0954 0.0648,-0.0272 0.092,-0.0817 0.1635,-0.0817 0.1227,0 0.2316,0.0953 0.2316,0.2179 0,0.0546 -0.0408,0.0818 -0.0408,0.1363 0,0.0477 0.034,0.0681 0.0545,0.109 0.0647,0.1159 0.1396,0.1533 0.2452,0.2316 0.1465,0.109 0.2316,0.1738 0.3952,0.2589 0.1838,0.0954 0.2895,0.1465 0.4904,0.2044 0.126,0.0341 0.1942,0.0953 0.327,0.0953 0.2078,0 0.3236,-0.0511 0.5178,-0.1226 0.0851,-0.0306 0.1465,-0.0408 0.218,-0.0953 0.0647,-0.0477 0.0851,-0.1022 0.1498,-0.1499 0.0682,-0.0512 0.1124,-0.0682 0.1772,-0.1227 0.0612,-0.0511 0.092,-0.0919 0.1499,-0.1498 0.0545,-0.0545 0.1056,-0.0749 0.1634,-0.1226 0.0852,-0.0715 0.1329,-0.1329 0.2044,-0.218 0.2656,-0.3065 0.3985,-0.4973 0.6268,-0.8312 0.0442,-0.0681 0.0647,-0.1192 0.1226,-0.1771 0.0715,-0.0715 0.1362,-0.109 0.1771,-0.2043 0.0613,-0.1466 0.0818,-0.2384 0.109,-0.3952 0.0068,-0.0375 0.034,-0.0647 0.034,-0.1056l0 -0.4428c0,-0.0851 0.0069,-0.1294 0.0205,-0.2146 -0.0239,-0.3202 -0.0715,-0.4905 -0.1771,-0.7902 -0.0136,-0.0477 -0.0409,-0.075 -0.0545,-0.1226 -0.0478,-0.1601 -0.1023,-0.2453 -0.2044,-0.3815 -0.0477,-0.0648 -0.0987,-0.092 -0.1362,-0.1635 -0.0409,-0.0784 -0.0614,-0.1363 -0.0954,-0.218 -0.0239,-0.0614 -0.0545,-0.0954 -0.0545,-0.1635 0,-0.1124 0.0545,-0.1704 0.0954,-0.2725 0.034,-0.092 0.0375,-0.1533 0.0681,-0.2453 0.0306,-0.0953 0.109,-0.1431 0.109,-0.2452 0,-0.1192 -0.0034,-0.1941 -0.0545,-0.2998 -0.0648,-0.1328 -0.1499,-0.1907 -0.2044,-0.3269 -0.0306,-0.0784 -0.0375,-0.1363 -0.0545,-0.218 -0.0341,-0.1738 -0.0681,-0.2759 -0.109,-0.4497 -0.0375,-0.1532 -0.0681,-0.235 -0.1226,-0.3815 -0.0205,-0.0545 -0.0545,-0.0783 -0.0545,-0.1362 0,-0.1192 0.0239,-0.1874 0.0545,-0.2997 0.017,-0.0648 0.0204,-0.109 0.0545,-0.1636 0.0136,-0.0204 0.0375,-0.0204 0.0545,-0.0408 0.1021,-0.1227 0.1771,-0.1976 0.2725,-0.327 0.0409,-0.0545 0.0954,-0.092 0.0954,-0.1635 0,-0.0443 -0.0409,-0.0648 -0.0409,-0.109 0,-0.0784 0.0885,-0.092 0.1499,-0.1363 0.0817,-0.0613 0.126,-0.1192 0.218,-0.1635 0.1396,-0.0681 0.2282,-0.1056 0.3814,-0.1362 0.1499,-0.0306 0.2317,-0.0715 0.3816,-0.109 0.0681,-0.017 0.1328,-0.0205 0.1634,-0.0817 0.0409,-0.0852 0.0818,-0.1772 0.1772,-0.1772 0.0749,0 0.1157,0.0409 0.1907,0.0409 0.0715,0 0.0988,-0.0648 0.1499,-0.109 0.1158,-0.1056 0.2077,-0.1431 0.327,-0.2452 0.1907,-0.1669 0.2589,-0.3168 0.327,-0.5587 0.0749,-0.2589 0.126,-0.402 0.218,-0.654 0.0511,-0.1431 0.1124,-0.2248 0.1124,-0.3781 0,-0.4224 -0.0034,-0.6574 -0.0034,-1.0797 0,-0.3543 -0.0069,-0.5655 -0.0069,-0.9197 0,-0.3441 0.0341,-0.5348 0.0341,-0.8788 0,-0.3406 -0.0033,-0.5348 -0.0545,-0.872 -0.0205,-0.1295 -0.0545,-0.2077 -0.0681,-0.3406 -0.0069,-0.0647 0.0102,-0.1023 0,-0.1635 -0.0102,-0.0648 -0.0545,-0.0954 -0.0545,-0.1635 0,-0.0273 0.034,-0.0273 0.0545,-0.0409 0.0511,-0.0375 0.1056,-0.0375 0.1635,-0.0681 0.109,-0.0614 0.1465,-0.1499 0.2044,-0.2589 0.1056,-0.201 0.1293,-0.3406 0.2316,-0.545 0.0613,-0.126 0.092,-0.2043 0.1635,-0.327 0.0375,-0.0647 0.0749,-0.0987 0.109,-0.1635 0.1056,-0.1976 0.143,-0.3236 0.1771,-0.5449 0.0239,-0.1704 0.0136,-0.2794 0.0409,-0.4497 0.0375,-0.2316 0.0817,-0.3645 0.109,-0.5995 0.0102,-0.1056 -0.0103,-0.1668 0,-0.2724 0.0136,-0.1159 0.0954,-0.1602 0.1226,-0.2726 0.0476,-0.1941 0.0409,-0.3167 0.0409,-0.5177 0,-0.9707 -0.1431,-1.5157 -0.2316,-2.4797 -0.0579,-0.2964 -0.1193,-0.4666 -0.1499,-0.763 -0.0034,-0.0545 -0.0341,-0.0818 -0.0409,-0.1363 -0.0239,-0.1464 -0.0375,-0.2316 -0.0817,-0.3678 -0.0136,-0.0443 -0.0409,-0.0648 -0.0545,-0.109 -0.0886,-0.2419 -0.1124,-0.3884 -0.1635,-0.6404 -0.0307,-0.1499 -0.075,-0.2316 -0.109,-0.3815 -0.0579,-0.2486 -0.0784,-0.3951 -0.1499,-0.6404 -0.0511,-0.1737 -0.0681,-0.2861 -0.1362,-0.4496 -0.0239,-0.0647 -0.0579,-0.0987 -0.0818,-0.1635 -0.126,-0.31 -0.2589,-0.4632 -0.4087,-0.763 -0.1363,-0.2725 -0.1465,-0.4564 -0.2725,-0.7357 -0.0478,-0.109 -0.0648,-0.184 -0.1227,-0.2861 -0.0953,-0.1669 -0.1498,-0.2828 -0.1498,-0.4769 0.0238,-0.1567 0.0238,-0.2657 0.0817,-0.4087 0.034,-0.0887 0.0954,-0.126 0.1499,-0.2044 0.0272,-0.0375 0.034,-0.0715 0.0545,-0.109 0.0408,-0.0681 0.1021,-0.092 0.1362,-0.1635 0.0409,-0.0851 0.0545,-0.1499 0.0545,-0.2452 0,-0.0852 -0.0408,-0.1329 -0.0408,-0.2181 0,-0.0851 0.0647,-0.1192 0.1226,-0.1771 0.092,-0.092 0.1702,-0.1431 0.2316,-0.2588 0.0784,-0.1465 0.1226,-0.2419 0.1226,-0.4088 0,-0.1022 -0.0579,-0.1499 -0.0954,-0.2452 -0.0341,-0.0887 -0.0272,-0.1533 -0.0408,-0.2453 -0.0239,-0.1499 -0.0205,-0.2385 -0.0205,-0.3917l0 -0.3304c0.0443,0.0375 0.058,0.0851 0.1022,0.1226 0.0204,0.017 0.0477,0.0136 0.0681,0.0273 0.0886,0.0578 0.1227,0.126 0.1772,0.218 0.1021,0.1635 0.201,0.2997 0.3951,0.2997 0.1226,0 0.1566,-0.1158 0.2589,-0.1771 0.0203,-0.0102 0.0272,-0.0409 0.0545,-0.0409 0.0545,0 0.0612,0.0579 0.109,0.0818 0.0715,0.0375 0.1328,0.0545 0.218,0.0545 0.1396,0 0.2077,-0.0852 0.327,-0.1499 0.1056,-0.0579 0.1702,-0.1023 0.2725,-0.1635 0.2179,-0.1363 0.2383,-0.3372 0.2997,-0.5859 0.0273,-0.1123 0.0749,-0.1635 0.109,-0.2725 0.0443,-0.1328 0.0545,-0.2725 0.1907,-0.3133 0.1022,-0.0307 0.1669,-0.0342 0.2726,-0.0545 0.1021,-0.0205 0.2111,-0.0852 0.2724,0 0.092,0.126 0.0613,0.2452 0.1363,0.3814 0.0511,0.0921 0.1157,0.1227 0.2043,0.1772 0.1976,0.1226 0.2453,0.2997 0.2726,0.5313 0.0136,0.1158 0.0612,0.1772 0.1226,0.2725 0.0817,0.1261 0.1532,0.201 0.2861,0.2725 0.1124,0.0579 0.1702,0.1158 0.2725,0.1908 0.0988,0.0715 0.1771,0.1124 0.2589,0.2044 0.0511,0.126 0.1737,0.1635 0.2861,0.2452 0.0988,0.0715 0.1294,0.1635 0.2316,0.2316 0.218,0.143 0.2929,0.2929 0.4633,0.4905 0.1601,0.1839 0.1737,0.3406 0.2997,0.545 0.143,0.2316 0.2827,0.3201 0.436,0.545 0.1124,0.1669 0.1533,0.2895 0.2997,0.436 0.0546,0.0545 0.1057,0.0749 0.1636,0.1226 0.2111,0.1839 0.3303,0.2964 0.4768,0.5314 0.0681,0.1124 0.1363,0.1635 0.2316,0.2589 0.0988,0.0987 0.126,0.1805 0.218,0.2861 0.1669,0.1941 0.2147,0.3508 0.4088,0.5177 0.1328,0.1158 0.1839,0.2078 0.2997,0.3407 0.1363,0.1566 0.2419,0.2418 0.3134,0.4359 0.0204,0.0613 0.0067,0.1158 0.0273,0.1772 0.0339,0.0953 0.1056,0.126 0.1498,0.218 0.0749,0.1532 0.1465,0.2213 0.2044,0.3815 0.1056,0.2861 0.0851,0.5041 0.2861,0.7357 0.0954,0.109 0.1635,0.1499 0.2589,0.2589 0.1669,0.1941 0.2419,0.327 0.3679,0.545 0.0375,0.0647 0.0442,0.1123 0.0817,0.1771 0.034,0.0612 0.0612,0.1021 0.0954,0.1635 0.0375,0.0715 0.0987,0.1021 0.1362,0.1771 0.1363,0.2759 0.2929,0.3883 0.4633,0.6404 0.0647,0.0987 0.0851,0.1669 0.1362,0.2725 0.0917,-0.0229 0.1172,0.1172 0.1908,0.1907 0.1362,0.1363 0.2146,0.2214 0.3406,0.3679 0.1737,0.201 0.2384,0.361 0.4496,0.5177 0.126,0.092 0.2146,0.1329 0.3406,0.2317 0.0409,0.0306 0.0477,0.0681 0.0818,0.1089 0.0953,0.1124 0.1668,0.1669 0.2589,0.2862 0.0476,0.0612 0.0681,0.109 0.1226,0.1635 0.0953,0.0953 0.1771,0.1329 0.2452,0.2452 0.1056,0.1703 0.1396,0.2793 0.2452,0.4496 0.0546,0.092 0.1363,0.1056 0.2181,0.1772 0.1293,0.1123 0.2111,0.1601 0.3406,0.2725 0.0612,0.0511 0.0851,0.1021 0.1499,0.1498 0.252,0.1874 0.3985,0.2964 0.6676,0.4633 0.0612,0.0375 0.0987,0.0748 0.1635,0.109 0.109,0.0612 0.1737,0.092 0.2861,0.1498 0.143,0.0749 0.2146,0.1363 0.3406,0.2317 0.109,0.0817 0.1805,0.126 0.2725,0.2316 0.034,0.0409 0.0715,0.0579 0.109,0.0954 0.0443,0.0442 0.0613,0.0817 0.109,0.1226 0.1226,0.1056 0.2044,0.1669 0.327,0.2725 0.1226,0.1056 0.1839,0.1941 0.327,0.2725 0.1021,0.0545 0.1737,0.0885 0.2725,0.1498 0.0851,0.0512 0.1566,0.0716 0.218,0.1499 0.0885,0.1124 0.1056,0.201 0.1771,0.327 0.0476,0.0852 0.0954,0.1363 0.1499,0.218 0.0749,0.1124 0.109,0.1908 0.218,0.2725 0.1362,0.1022 0.2316,0.1294 0.3815,0.2044 0.1056,0.0511 0.1635,0.092 0.2725,0.1362 0.109,0.0443 0.1839,0.0682 0.2861,0.1227 0.3167,0.1702 0.4735,0.3236 0.8175,0.436 0.2316,0.1702 0.4155,0.2588 0.6812,0.3678 0.1294,0.0477 0.1975,0.1227 0.327,0.1635 0.1227,0.0409 0.2044,0.0204 0.327,0.0545 0.2656,0.0749 0.4019,0.1975 0.654,0.2998 -0.1704,-0.0273 -0.2725,-0.0818 -0.436,-0.109 -0.1635,-0.0273 -0.2725,-0.0137 -0.436,-0.0545 -0.0886,-0.0205 -0.1295,-0.0818 -0.2248,-0.0818 -0.0409,0 -0.0613,0.0273 -0.1022,0.0273 0.0204,0.0817 0.0068,0.143 0.0273,0.218 0.0612,0.2247 0.218,0.327 0.3815,0.4905 0.0612,0.0612 0.0953,0.1362 0.1635,0.1907 0.2452,0.1975 0.4427,0.2998 0.763,0.2998 0.1362,0 0.1907,-0.109 0.327,-0.109 0.0953,0 0.1293,0.0817 0.218,0.109 0.1226,0.0408 0.2043,0.0272 0.327,0.0545 0.0748,0.0136 0.1362,0.0545 0.2179,0.0545 0.2044,0 0.4361,-0.0954 0.4361,-0.2998 0,-0.1431 -0.1499,-0.184 -0.2726,-0.2452 -0.2043,-0.109 -0.3202,-0.1976 -0.545,-0.2725 -0.2043,-0.0682 -0.3611,-0.0342 -0.545,-0.1363 -0.1022,-0.0545 -0.1362,-0.1362 -0.2452,-0.1907 0.4633,0.0749 0.7085,0.1907 1.1445,0.3542 0.218,0.0818 0.3542,0.1226 0.545,0.2453 0.5177,0.0817 0.8447,0.0545 1.3352,0.218 0.2112,0.0681 0.361,0.0681 0.545,0.1907 0.034,0.0204 -0.0136,0.0749 0,0.109 -0.1771,0.0409 -0.2793,0.0818 -0.436,0.1635 -0.1567,0.0817 -0.2997,0.1703 -0.2997,0.3543 0,0.1771 0.0612,0.2792 0.1362,0.436 0.0409,0.0817 0.0409,0.2179 0.1363,0.2179 0.0885,0 0.143,-0.0477 0.218,-0.0817 0.1294,-0.0614 0.2452,-0.0954 0.327,-0.218 0.1157,-0.1771 0.1021,-0.3339 0.1362,-0.545 0.0273,-0.1704 0.0545,-0.2725 0.0545,-0.4496 0.2111,0.034 0.3338,-0.0069 0.545,0 0.0409,0.2656 0.1908,0.4019 0.1908,0.6676 0,0.0409 -0.0342,0.0749 -0.0273,0.109 0.034,0.1362 0.1226,0.1975 0.1635,0.327 0.0545,0.1702 0.0817,0.2793 0.1635,0.436 0.1702,0.3065 0.3883,0.4291 0.7085,0.5722 0.1226,0.0545 0.1975,0.0682 0.327,0.109 0.4019,0.1294 0.6607,0.1567 1.09,0.1908 0.218,0.0136 0.3337,0.0817 0.5517,0.0817l0.6404 0c0.3951,0 0.62,-0.0341 1.0151,-0.0817 0.2111,-0.0205 0.3474,-0.0136 0.545,-0.0818 0.1907,-0.0681 0.2656,-0.1976 0.436,-0.2997 0.3474,-0.2113 0.5859,-0.3339 0.8447,-0.654 0.0885,-0.1159 0.1226,-0.218 0.218,-0.327 0.0682,-0.0818 0.143,-0.1226 0.1908,-0.218 0.143,-0.2589 0.1975,-0.4429 0.4087,-0.654 0.252,-0.2521 0.5109,-0.293 0.763,-0.545 0.218,-0.218 0.3883,-0.3134 0.6267,-0.5177 0.2044,-0.1772 0.3134,-0.293 0.545,-0.436 0.3474,-0.2113 0.2862,-0.5927 0.4633,-0.9537 0.2247,-0.4566 0.5382,-0.5656 0.7902,-1.0083 0.0341,0.0204 0.0954,0 0.109,0.0273 0.0886,0.1362 0.0478,0.2724 0.0818,0.436 0.0205,0.1226 0.109,0.1907 0.109,0.3201l0 0.5586c0,0.0477 -0.0477,0.0614 -0.0545,0.1022 -0.0545,0.3134 -0.1567,0.4905 -0.327,0.763 -0.0682,0.1158 -0.0885,0.2111 -0.1635,0.327 -0.0545,0.0885 -0.143,0.0885 -0.218,0.1635 -0.2794,0.2793 -0.1772,0.5995 -0.2725,0.981 -0.0342,0.1363 -0.1022,0.2044 -0.1635,0.327 -0.1363,0.2589 -0.3339,0.361 -0.4633,0.6267 -0.0613,0.1227 -0.0749,0.2044 -0.1362,0.3271 -0.2249,0.4496 -0.5178,0.6267 -0.7085,1.0899 -0.075,0.1908 -0.0272,0.3338 -0.0272,0.545 0,0.218 -0.0409,0.3542 -0.1363,0.545 -0.0545,0.1158 -0.1363,0.1908 -0.1363,0.327 0,0.3883 0.0954,0.6131 0.2181,0.981 0.0545,0.1703 0.0817,0.2725 0.1635,0.436 0.1021,0.2111 0.1702,0.3474 0.2997,0.545 0.109,0.1635 0.2725,0.1635 0.436,0.2725 0.1566,0.1021 0.1975,0.2588 0.2453,0.436 0.0544,0.2044 0.1157,0.3337 0.1634,0.545 0.0409,0.1635 0.0273,0.2792 0.0818,0.436 0.109,0.2928 0.1975,0.4563 0.2452,0.7629 0.0613,0.3816 0.1022,0.6336 0.1908,1.0083z");
}

function initPrefectureNames() {
    PREFECTURE_NAMES["0"] = JAPAN.text(310, 670);
    PREFECTURE_NAMES["1"] = JAPAN.text(63, 582);
    PREFECTURE_NAMES["2"] = JAPAN.text(110, 605);
    PREFECTURE_NAMES["3"] = JAPAN.text(58, 623);
    PREFECTURE_NAMES["4"] = JAPAN.text(117, 557);
    PREFECTURE_NAMES["5"] = JAPAN.text(85, 523);
    PREFECTURE_NAMES["6"] = JAPAN.text(64, 540);
    PREFECTURE_NAMES["7"] = JAPAN.text(36, 563);
    PREFECTURE_NAMES["8"] = JAPAN.text(100, 500);
    PREFECTURE_NAMES["9"] = JAPAN.text(170, 492);
    PREFECTURE_NAMES["10"] = JAPAN.text(210, 482);
    PREFECTURE_NAMES["11"] = JAPAN.text(150, 465);
    PREFECTURE_NAMES["12"] = JAPAN.text(211, 453);
    PREFECTURE_NAMES["13"] = JAPAN.text(161, 532);
    PREFECTURE_NAMES["14"] = JAPAN.text(197, 536);
    PREFECTURE_NAMES["15"] = JAPAN.text(232, 523);
    PREFECTURE_NAMES["16"] = JAPAN.text(213, 507);
    PREFECTURE_NAMES["17"] = JAPAN.text(251, 476);
    PREFECTURE_NAMES["18"] = JAPAN.text(253, 551);
    PREFECTURE_NAMES["19"] = JAPAN.text(289, 510);
    PREFECTURE_NAMES["20"] = JAPAN.text(275, 467);
    PREFECTURE_NAMES["21"] = JAPAN.text(299, 476);
    PREFECTURE_NAMES["22"] = JAPAN.text(312, 505);
    PREFECTURE_NAMES["23"] = JAPAN.text(271, 569);
    PREFECTURE_NAMES["24"] = JAPAN.text(343, 479);
    PREFECTURE_NAMES["25"] = JAPAN.text(310, 435);
    PREFECTURE_NAMES["26"] = JAPAN.text(330, 453);
    PREFECTURE_NAMES["27"] = JAPAN.text(395, 456);
    PREFECTURE_NAMES["28"] = JAPAN.text(374, 432);
    PREFECTURE_NAMES["29"] = JAPAN.text(382, 488);
    PREFECTURE_NAMES["30"] = JAPAN.text(344, 407);
    PREFECTURE_NAMES["31"] = JAPAN.text(303, 415);
    PREFECTURE_NAMES["32"] = JAPAN.text(395, 373);
    PREFECTURE_NAMES["33"] = JAPAN.text(458, 503);
    PREFECTURE_NAMES["34"] = JAPAN.text(406, 412);
    PREFECTURE_NAMES["35"] = JAPAN.text(438, 402);
    PREFECTURE_NAMES["36"] = JAPAN.text(460, 429);
    PREFECTURE_NAMES["37"] = JAPAN.text(415, 518);
    PREFECTURE_NAMES["38"] = JAPAN.text(420, 438);
    PREFECTURE_NAMES["39"] = JAPAN.text(457, 470);
    PREFECTURE_NAMES["40"] = JAPAN.text(452, 377);
    PREFECTURE_NAMES["41"] = JAPAN.text(439, 312);
    PREFECTURE_NAMES["42"] = JAPAN.text(484, 337);
    PREFECTURE_NAMES["43"] = JAPAN.text(462, 267);
    PREFECTURE_NAMES["44"] = JAPAN.text(497, 273);
    PREFECTURE_NAMES["45"] = JAPAN.text(475, 222);
    PREFECTURE_NAMES["46"] = JAPAN.text(550, 90);
}

function fillPrefectureRangesByRegion(region_color, start, limit) {
    var region_set = JAPAN.set();
    for (var idx = start; idx < limit; idx++) {
        region_set.push(PREFECTURE_PATHS[idx]);
    }
    region_set.attr({"fill": region_color});
}


function handleMouseEvents(jQueryEventSource, raphaelElementToAnimate, scaleUp, scaleNormal, funcWhenMouseOver, funcWhenMouseOut) {
    $(jQueryEventSource).on(MOUSEOVER_EVENT, function () {
        if (isNot(raphaelElementToAnimate, "null")) {
            if (isNot(raphaelElementToAnimate.isPrefecture, "undefined") && raphaelElementToAnimate.isPrefecture === true) {
                raphaelElementToAnimate.activeGlow.attr({"opacity": "0.1"});

                var isTriggeredByRegion = $(jQueryEventSource).data('isTriggeredByRegion');
                if (is(isTriggeredByRegion, "undefined") || isTriggeredByRegion !== true) {
                    raphaelElementToAnimate.activeGlow.toFront();
                }
                raphaelElementToAnimate.activeGlow.show();
            }
            raphaelElementToAnimate.toFront();
            var localId = raphaelElementToAnimate.localId;
            if (isNot(localId, "undefined")) {
                var currentPrefectureName = PREFECTURE_NAMES[localId];
                currentPrefectureName.toFront();
            }
            raphaelElementToAnimate.animate({transform: scaleUp}, ANIMATION_DELAY_MILLIS);
        }
        if (is(funcWhenMouseOver, "function")) {
            funcWhenMouseOver();
        }
    });

    $(jQueryEventSource).on(MOUSEOUT_EVENT, function () {
        if (isNot(raphaelElementToAnimate, "null")) {
            raphaelElementToAnimate.toBack();
            if (isNot(raphaelElementToAnimate.isPrefecture, "undefined") && raphaelElementToAnimate.isPrefecture === true) {
                raphaelElementToAnimate.activeGlow.hide();
            }
            raphaelElementToAnimate.animate({transform: scaleNormal}, ANIMATION_DELAY_MILLIS);
        }
        if (is(funcWhenMouseOut, "function")) {
            funcWhenMouseOut();
        }
    });
}

function is(o, type) {
    type = String(type).toLowerCase();
    return  (type == "null" && o === null) ||
        (type == typeof o) ||
        (type == "object" && o === Object(o)) ||
        (type == "array" && Array.isArray && Array.isArray(o)) ||
        Object.prototype.toString.call(o).slice(8, -1).toLowerCase() == type;
}

function isNot(o, type) {
    return !is(o, type);
}

function drawMetaContaier(divId, smvValue, acidityValue) {
    var xOffset = 15;

    var metaSvg = new Raphael(document.getElementById(divId), 275, 215);
    var textsSet = metaSvg.set();

    textsSet.push(_drawSmv(metaSvg, smvValue, xOffset));
    textsSet.push(_drawAcidity(metaSvg, acidityValue, xOffset));

    textsSet.push(metaSvg.text(xOffset, 50, "Dry"));
    textsSet.push(metaSvg.text(252, 50, "Sweet"));
    textsSet.push(metaSvg.text(20, 150, "Light"));
    textsSet.push(metaSvg.text(255, 150, "Rich"));
    textsSet.push(_drawTickLabels(metaSvg, SMV_TICK_LABELS, xOffset, 84));
    textsSet.push(_drawTickLabels(metaSvg, ACIDITY_TICK_LABELS, xOffset, 184));
    textsSet.attr(META_GRADIENT_TEXT_ATTRIBUTES);

    function _drawTickLabels(metaSvg, labels, xOffsetTranslate, yOffsetTranslate) {
        var tickLabelSet = metaSvg.set();
        $.each(labels, function (index, label) {
            var x = index * 40;
            var y = 14;
            var tickLabel = metaSvg.text(x, y, label);
            tickLabelSet.push(tickLabel);
        });
        tickLabelSet.translate(xOffsetTranslate, yOffsetTranslate);
        return tickLabelSet;
    }

    function _drawSmv(metaSvg, smvValue, xOffset) {
        _drawGradient(metaSvg, SMV_GRADIENT_COLORS, xOffset, 84);

        var smvPath = ((smvValue * 5) + 120) + xOffset;
        var smvTick = metaSvg.path("M" + smvPath + ",56 V61");
        _drawTicks(metaSvg, SMV_TICK_PATHS, smvTick);

        var smvHeading = metaSvg.text(130, 30, "Sake Meter Value");
        smvHeading.attr(SUB_HEADING_TEXT_ATTRIBUTES);

        var smvMarker = metaSvg.text(smvPath, 50, "V");
        smvMarker.attr({"title": smvValue, "cursor": "pointer"});
        return smvMarker;
    }

    function _drawAcidity(metaSvg, acidityValue, xOffset) {
        _drawGradient(metaSvg, ACIDITY_GRADIENT_COLORS, xOffset, 184);

        var acidityPath = (acidityValue * 80) + xOffset;
        var acidityTick = metaSvg.path("M" + acidityPath + ",156 V161");
        _drawTicks(metaSvg, ACIDITY_TICK_PATHS, acidityTick);

        var acidityHeading = metaSvg.text(132, 130, "Acidity");
        acidityHeading.attr(SUB_HEADING_TEXT_ATTRIBUTES);

        var acidityText = metaSvg.text(acidityPath, 150, "V");
        acidityText.attr({"title": acidityValue, "cursor": "pointer"});
        return acidityText;
    }

    function _drawTicks(metaSvg, tickPaths, customTick) {
        var ticksSet = metaSvg.set();
        ticksSet.push(customTick);
        $.each(tickPaths, function (index, path) {
            ticksSet.push(metaSvg.path(path));
        });
        ticksSet.translate(0.5, 0.5);
        ticksSet.attr({"fill": "none", "stroke": "#000000", "shape-rendering": "crispEdges", "opacity": "1.0"});
    }

    function _drawGradient(metaSvg, gradientColors, xOffsetTranslate, yOffsetTranslate) {
        var gradientColorsSet = metaSvg.set();
        $.each(gradientColors, function (index, rgb) {
            var x = (index * 2.4);
            var y = -21;
            if (index == gradientColors.length - 1) {
                --x;
                --x;
            }
            var rect = metaSvg.rect(x, y, 5, 20);
            rect.attr({'fill': rgb});
            gradientColorsSet.push(rect);
        });
        gradientColorsSet.translate(xOffsetTranslate, yOffsetTranslate);
        gradientColorsSet.attr({'stroke': 'none'});
    }
}

function runWebsiteLoadRegionFlickerEffect(legend_polygon_description_set) {
    var index = legend_polygon_description_set.length - 1;

    function setMouseOverTimeout() {
        if (index === -1) {
            return;
        }
        setTimeout(function () {
            $(legend_polygon_description_set[index][0]).mouseover();
            setMouseOutTimeout();
        }, ANIMATION_DELAY_MILLIS);
    }

    function setMouseOutTimeout() {
        if (index === -1) {
            return;
        }
        setTimeout(function () {
            $(legend_polygon_description_set[index][0]).mouseout();
            --index;
            setMouseOverTimeout();
        }, ANIMATION_DELAY_MILLIS + 100);
    }

    setMouseOverTimeout();
}

function generateMetaData(brands) {
    var meta = {};
    meta['total'] = 0;
    meta['byRegion'] = {};
    meta['byPrefecture'] = {};
    meta['byClassification'] = {};
    meta['byGrade'] = {};
    meta['bySeimaibuai'] = {};

    $.each(brands, function (index, brand) {
        var region = brand['region'];
        var prefecture = brand['prefecture'];
        var grade = brand['grade'];
        var classification = brand['classification'];
        var seimaibuai = brand['seimaibuai'];

        if (meta['byRegion'][region] == null) {
            meta['byRegion'][region] = {'name': region, 'total': 0};
        }

        if (meta['byPrefecture'][prefecture] == null) {
            meta['byPrefecture'][prefecture] = {'name': prefecture, 'total': 0};
        }

        if (meta['byClassification'][classification] == null) {
            meta['byClassification'][classification] = {'name': classification, 'total': 0};
        }

        if (meta['byGrade'][grade] == null) {
            meta['byGrade'][grade] = {'name': grade, 'total': 0};
        }

        if (meta['bySeimaibuai'][seimaibuai] == null) {
            meta['bySeimaibuai'][seimaibuai] = {'name': seimaibuai, 'total': 0};
        }

        ++meta['byPrefecture'][prefecture]['total'];
        ++meta['byRegion'][region]['total'];
        ++meta['byClassification'][classification]['total'];
        ++meta['byGrade'][grade]['total'];
        ++meta['bySeimaibuai'][seimaibuai]['total'];
        ++meta['total'];
    });

    return meta;
}
