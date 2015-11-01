(function () {
    'use strict';
    $(document).ready(function () {
//        $.getJSON("assets/json/brands.json", function (brands) {
            var brands = window.sakeData.brands;
            var meta = generateMetaData(brands);
            var db = TAFFY(brands);

            initJapan(meta, svgElementClickHandler);

            var foundResults = [];
            var maxResults = 0;

            $('.pagination').pagination({
                cssStyle: 'light-theme',
                displayedPages: 3,
                onPageClick: paginationClickHandler
            });
            $('.pagination').hide();

            function svgElementClickHandler(e) {
                var userQuery = "";
                var dialogTitleSuffix = "";
                var filterObject = {};
                var target = $(e.target);
                if (target.is("path")) {
                    userQuery = target.find('title').text().split('(')[0].trim();
                    filterObject = {prefecture: {is: userQuery}};
                    dialogTitleSuffix = "brands in " + userQuery + " prefecture";
                    if (PREFECTURE_NAME_TO_INDEX[userQuery] === null || PREFECTURE_NAME_TO_INDEX[userQuery] === undefined) {
                        filterObject = {region: {is: userQuery}};
                        dialogTitleSuffix = "brands in " + userQuery + " region";
                    }
                } else if (target.is("tspan")) {
                    userQuery = target.text().split('(')[0].trim();
                    filterObject = {prefecture: {is: userQuery}};
                    dialogTitleSuffix = "brands in " + userQuery + " prefecture";
                    if (PREFECTURE_NAME_TO_INDEX[userQuery] === null || PREFECTURE_NAME_TO_INDEX[userQuery] === undefined) {
                        if (userQuery.indexOf('Junmai') !== -1) {
                            filterObject = {classification: {is: userQuery}};
                            dialogTitleSuffix = userQuery + " brands";
                        } else {
                            filterObject = {region: {is: userQuery}};
                            dialogTitleSuffix = "brands in " + userQuery + " region";
                        }
                    }
                } else {
                    console.log(target);
                }

                if (userQuery !== null) {
                    var results = db(filterObject).order("classificationScore desc, name asc").get();

                    foundResults = results;
                    maxResults = results.length;
                    $('.pagination').pagination('updateItemsOnPage', PAGE_SIZE);
                    $('.pagination').pagination('updateItems', maxResults);

                    var wWidth = $(window).width();
                    var dWidth = wWidth * 0.65;
                    var wHeight = $(window).height();
                    var dHeight = wHeight * 0.7;
                    $("#dialog-container").dialog({
                        title: "Found " + maxResults + " " + dialogTitleSuffix,
                        modal: true,
                        closeOnEscape: true,
                        beforeClose: function (event, ui) {
                            dialogPreDestroy();
                            $(this).dialog("destroy");
                        },
                        open: function(){
                            $('#dialog-container .sake-parameters-container a').blur();
                            $('#dialog-container #focus-grabber').focus();
                        },
                        draggable: false,
                        width: dWidth,
                        height: dHeight,
                        buttons: {
                            Hide: function () {
                                dialogPreDestroy();
                                $(this).dialog("destroy");
                            }
                        }
                    });

                    if (maxResults > 0) {
                        $('.ui-dialog-buttonset').after($('.pagination'));
                        $('.pagination').show();
                    }
                }
                return false;
            }

            function dialogPreDestroy() {
                foundResults = [];
                maxResults = 0;
                $('#results').empty();
                $('body').append($('.pagination'));
                $('.pagination').hide();
            }

            function paginationClickHandler(pageNumber, event) {
                var paginationStartIndex = (pageNumber - 1) * PAGE_SIZE;
                var paginationEndIndex = paginationStartIndex + PAGE_SIZE;
                if (paginationEndIndex > maxResults) {
                    paginationEndIndex = maxResults;
                }
                var currentPage = foundResults.slice(paginationStartIndex, paginationEndIndex);
                renderResultPage(currentPage, '#results');
            }

            //drawMetaContaier("meta-1", -5, 1.8);
        //});
    });
})();
