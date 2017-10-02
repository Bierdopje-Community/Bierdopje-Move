// ==UserScript==
// @name         Bierdopje Move
// @namespace    http://www.bierdopje.com
// @version      0.1
// @description  Allows you to move and positioning the blocks on the homepage.
// @match        http://*.bierdopje.com/
// @run-at       document-start
// @require      http://code.jquery.com/jquery-1.10.2.js
// @require      http://code.jquery.com/ui/1.11.4/jquery-ui.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js
// @copyright    2016+, Tom
// ==/UserScript==
/* jshint -W097 */
'use strict';

//-------------------------------//
//   NOTICE:                     //
// The code is not what I wanted //
// it to be. It's rather ugly,   //
// but it gets the job done.     //
// Enjoy.                        //
//-------------------------------//

$(function() {
    // Fix position of the billboard.
    var billboardStyle = {
        position: "relative",
        top:      "5px",
        left:     "15px"
    };
    $("#billboards").css(billboardStyle);
    
    // Identify and add appropriate classes to the columns and blocks.
    var col1 = $("#col1");
    var col2 = $("#col2");
    
    col1.addClass("sortable1");
    col2.addClass("sortable2");
    
    // Find each block and add their state + make them serializable.
    $('.sortable1 .block').each(function(i, obj) {
        $(this).addClass("ui-state-default");
        $(this).attr('id', "i_" + (i+1));
    });
    $('.sortable2 .block').each(function(j, obj) {
        $(this).addClass("ui-state-default");
        $(this).attr('id', "j_" + (j+1));
    });
    
    // Load the blocks in the right order.
    restoreOrder();
    
    col1.addClass("connectedSortable");
    col2.addClass("connectedSortable");
    
    // Actual sorting.
    $(".sortable1, .sortable2").sortable({
        connectWith: ".connectedSortable",
        cursor:    "move",
        handle:    ".block_title",
        items :    ".ui-state-default",
        update: function (event, ui) {
            var cooked1 = [];
            var cooked2 = [];
            $(".sortable1").each(function(index, domEle) {
                    cooked1[index] = $(domEle).sortable('toArray', {key: 'i', attribute: 'id'});
                }
            );
            $(".sortable2").each(function(index, domEle) {
                    cooked2[index] = $(domEle).sortable('toArray', {key: 'j', attribute: 'id'});
                }
            );
            $.cookie('blockOrder1', cooked1.join('|'));
            $.cookie('blockOrder2', cooked2.join('|'));
        }
    });
    
    function restoreOrder() {
        var cookie1 = $.cookie('blockOrder1');
        var cookie2 = $.cookie('blockOrder2');
        if (!cookie1 || !cookie2) return;
        
        console.log("cookie1: " + cookie1);
        console.log("cookie2: " + cookie2);
        
        var SavedID1 = cookie1.split('|');
        var SavedID2 = cookie2.split('|');
        
        for (var u=0, ul=SavedID1.length; u < ul; u++) {
            SavedID1[u] = SavedID1[u].split(',');
        }
        for (var u=0, ul=SavedID2.length; u < ul; u++) {
            SavedID2[u] = SavedID2[u].split(',');
        }
        for (var Scolumn=0, n = SavedID1.length; Scolumn < n; Scolumn++) {
            for (var Sitem=0, m = SavedID1[Scolumn].length; Sitem < m; Sitem++) {
                
                console.log(" checking first column " + SavedID1[Scolumn][Sitem]);
                
                if (SavedID1[Scolumn][Sitem].indexOf("i") >= 0) {
                    console.log("found i");
                    $(".sortable1").eq(Scolumn).append($(".sortable1").children("#" + SavedID1[Scolumn][Sitem]));
                } else {
                    console.log("found j (other column)");
                    $(".sortable1").eq(Scolumn).append($(".sortable2").children("#" + SavedID1[Scolumn][Sitem]));
                }
                
            }
        }
        for (var Scolumn=0, n = SavedID2.length; Scolumn < n; Scolumn++) {
            for (var Sitem=0, m = SavedID2[Scolumn].length; Sitem < m; Sitem++) {
                
                console.log(" checking second column " + SavedID2[Scolumn][Sitem]);
                
                if (SavedID2[Scolumn][Sitem].indexOf("i") >= 0) {
                    console.log("found i (other column)");
                    $(".sortable2").eq(Scolumn).append($(".sortable1").children("#" + SavedID2[Scolumn][Sitem]));
                } else {
                    console.log("found j");
                    $(".sortable2").eq(Scolumn).append($(".sortable2").children("#" + SavedID2[Scolumn][Sitem]));
                }
                
            }
        }
    }
    
    function getOrder() {
        //var cookies = document.cookie;
        return $.cookie("blockOrder");
    }
    
    function setOrder(order) {
        // document.cookie="blockOrder=" + order;
        $.cookie('blockOrder', order);
        console.log("NEW ORDER: " + order);
    }
});