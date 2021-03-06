/**
 * Enables graph dragging.
 */
function enableGraphDragging() {
    /* Extending the jQuery draggable option to be fitted with right click for either graph or graphRootSVG.
     This also disables the context menu for graphRootSVG, but not for the tab.*/
    $.extend($.ui.draggable.prototype, {
        _mouseInit: function() {
            var context = this;
            if (!this.options.mouseButton) {
                this.options.mouseButton = 1;
            }

            $.ui.mouse.prototype._mouseInit.apply(this, arguments);
            this.started = false;
        },
        _mouseDown: function(event) {

            (this._mouseStarted && this._mouseUp(event));

            this._mouseDownEvent = event;

            var that = this,
                btnIsLeft = (event.which === this.options.mouseButton),

                elIsCancel = (typeof this.options.cancel === 'string' && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                return true;
            }

            this.mouseDelayMet = !this.options.delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(function () {
                    that.mouseDelayMet = true;
                }, this.options.delay);
            }

            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(event) !== false);
                if (!this._mouseStarted) {
                    event.preventDefault();
                    return true;
                }
            }

            // This is apparently for Gecko and Opera, but I haven't tested it out yet.
            if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
                $.removeData(event.target, this.widgetName + '.preventClickEvent');
            }

            this._mouseMoveDelegate = function(event) {
                return that._mouseMove(event);
            };
            this._mouseUpDelegate = function(event) {
                return that._mouseUp(event);
            };

            $(document)
                .bind('mousemove.' + this.widgetName, this._mouseMoveDelegate)
                .bind('mouseup.' + this.widgetName, this._mouseUpDelegate);

            event.preventDefault();

            mouseHandled = true;
            return true;
        }
    });

    $('#graphRootSVG').draggable({
        mouseButton: 3
    });
}


/**
 * Disables Tab key.
 * @param {object} event The keydown event.
 * @returns {boolean} Whether the key is the tab key.
 */
document.onkeydown = function (event) {
    'use strict';

    if (event.which === 9) { // 9 is the Tab key.
        return false;
    }
};


/**
 * Initializes interface to cookie settings; blank interface if no cookies exist
 * TODO: Function too long
 */
function initializeGraphSettings() {
    'use strict';

    // Clear FCE count and 'Check My POSt!' tab
    FCEs = 0;
    FCEs100 = 0;
    FCEs200 = 0;
    FCEs300 = 0;
    FCEs400 = 0;
    FCEsMAT = 0;
    clickedCourses = [];
    $('#FCEcount').html('0.0');

    // Clear 'My Courses' tab
    $('#courseGrid').empty();

    active200s = [];
    active300s = [];
    active400s = [];
    projectCourses = [];
    $('input:checkbox').attr('checked', false);
    $('input:text').attr('value', '');

    // Set initial node status
    $.each(nodes, function (i, node) {

        var nodeStatus = getCookie(window[node].name);

        if (nodeStatus.length === 0) {
            nodeStatus = 'inactive';
        }

        if (initiallyTakeable.indexOf(node) > -1 && nodeStatus === 'inactive') {
            window[node].status = 'takeable';
        } else {
            window[node].status = nodeStatus;
        }

        // Check the courses with FCE reqs
        if (window[node].hybrid === false) {
            updatePOSt(node, window[node].isSelected());
            if (window[node].status === 'active' || window[node].status === 'overridden') {
                updateClickedCourses(node, true);
            }
        }
    });

    $.each(nodes, function (i, node) {
        window[node].updateSVG();
        $.each(window[node].outEdges, function (i, edge) {
            edge.updateStatus();
        });
    });

    updateFCECount();

    updatePostInterface();
    updateMajorPostInterface();
    updateMinorPostInterface();

    // Clear any active focus
    if (activeFocus !== '') {
        $('.focusTabs').tabs('option', 'active', false);
        $('ellipse.spotlight').remove();
        clearFocus();
    }

    CSC318.updateStatus();
    CSC454.updateStatus();
    CSC494.updateStatus();
    CSC495.updateStatus();
}


/**
 * Resets graph to default (no Nodes selected).
 */
function reset() {
    'use strict';

    // Set initial node status
    $.each(nodes, function (i, node) {
        if (initiallyTakeable.indexOf(node) > -1) {
            window[node].status = 'takeable';
        } else {
            window[node].status = 'inactive';
        }
        setCookie(window[node].name, window[node].status);

        window[node].updateSVG();
    });

    // Edges
    $('path').attr('data-active', 'inactive');

    // Clear 'My Courses' tab
    $('#courseGrid').empty();

    // Clear any active focus
    if (activeFocus !== '') {
        $('.focusTabs').tabs('option', 'active', false);
        $('ellipse.spotlight').remove();
        clearFocus();
    }

    // Clear FCE count and 'Check My POSt!' tab
    FCEs = 0;
    FCEs100 = 0;
    FCEs200 = 0;
    FCEs300 = 0;
    FCEs400 = 0;
    FCEsMAT = 0;
    clickedCourses = [];
    $('#FCEcount').html('0.0');

    active200s = [];
    active300s = [];
    active400s = [];
    projectCourses = [];
    $('input:checkbox').attr('checked', false);
    $('input:text').attr('value', '');

    updatePostInterface();
    updateMajorPostInterface();
    updateMinorPostInterface();
}


/**
 * Removes all tool-tips.
 */
function removeToolTips() {
    'use strict';

    $('.tooltip-group').remove();
}


/**
 * Clears all timeouts.
 */
function clearAllTimeouts() {
    'use strict';

    for(var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }

    timeouts = [];
}

/**
 * Returns whether the url exists.
 * @param {string} url The URL.
 * @returns {boolean} Whether the url exists.
 */
function urlExists(url) {
    'use strict';

    var exists;
    $.ajax({
        type: 'HEAD',
        async: false,
        url: url,
        success: function (){
            exists = true;
        },
        error: function () {
            exists = false;
        }
    });

    return exists;
}