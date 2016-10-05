// ==UserScript==
// @name         Bierdopje Move
// @namespace    http://www.bierdopje.com
// @version      0.3.1
// @description  Allows you to move and position the blocks on the homepage.
// @updateURL 	 https://github.com/Bierdopje-Community/Bierdopje-Move/raw/master/BierdopjeMove.user.js
// @match        http://*.bierdopje.com/
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @require      http://code.jquery.com/jquery-1.10.2.js
// @require      http://code.jquery.com/ui/1.11.4/jquery-ui.js
// @author       Tom
// @copyright    2016+, Tom
// ==/UserScript==
/* jshint -W097 */
'use strict';

$(function() {
    // Change cursor on block headers
    $(".header").css('cursor', 'pointer');
    
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
    
    // Load the blocks collapse state.
    var collapsedBlocks = [];
    collapsedBlocks = getCollapsedBlocks();
    restoreCollapsedBlocks(collapsedBlocks);
    
    // Load the blocks in the right order.
    restoreOrder();
    
    col1.addClass("connectedSortable");
    col2.addClass("connectedSortable");
    
    // Collapsing feature
    $('.sortable1 > .block > .header').click(function() {
        collapseFeature($(this));
        
        return false;
    });
    $('.sortable2 > .block > .header').click(function() {
        collapseFeature($(this));
        
        return false;
    });
    
    function collapseFeature(me) {
        var body = me.next();
        var blockId = me.parent().attr("id");
        
        body.slideToggle("slow", function() {
            if (body.is(":hidden")) {
                collapsedBlocks.push(blockId);
                console.log("hiddenarray: " + collapsedBlocks);
            } else {
                collapsedBlocks = deleteFromArrayByValue(collapsedBlocks, blockId);
                console.log("visiblearray: " + collapsedBlocks);
            }
            GM_setValue("collapsedBlocks", collapsedBlocks);
        });  
    };
    
    function getCollapsedBlocks() {
        // Check for data in storage.
        if (GM_getValue("collapsedBlocks")) {
            return GM_getValue("collapsedBlocks");
            console.log("Found data in collapsedBlocks GM: " + collapsedBlocks);
        } else {
            return [];
        }
    };
    
    function restoreCollapsedBlocks(cBlocks) {
        var i;
        for (i = 0; i < cBlocks.length; i++) {
            var target = document.getElementById(cBlocks[i]);
            $(target).children(".body").hide();
        }
    };
    
    function deleteFromArrayByValue(array, value) {
        // todo?:
        // https://api.jquery.com/jQuery.inArray/
        var i = array.length;
        while (i--) {
            if (array[i] === value) {
                array.splice(i, 1);
            }
        }
        
        return array;
    };
    
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
            GM_setValue("blockOrder1", cooked1.join('|'));
            GM_setValue("blockOrder2", cooked2.join('|'));
        }
    });
    
    function restoreOrder() {
        var order1 = GM_getValue("blockOrder1");
        var order2 = GM_getValue("blockOrder2");
        if (!order1 || !order2) return;
        
        console.log("order1: " + order1);
        console.log("order2: " + order2);
        
        var SavedID1 = order1.split('|');
        var SavedID2 = order2.split('|');
        
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
});
