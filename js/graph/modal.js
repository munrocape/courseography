/**
 * Creates and returns the main modal content div.
 * @param {string} id The course course.
 * @returns {jQuery} The main modal content div.
 */
function createModalDiv(id) {
    'use strict';

    var contentDiv = $('<div></div>');
    contentDiv.attr('id', 'modal-content-container');
    contentDiv.css('overflow', 'auto');

    var courseDescription = fetchCourseDescription(id);
    var p = $('<p></p>').css('color', 'white').html(courseDescription);
    var bottomContentDiv = $('<div></div>');
    bottomContentDiv.attr('id', 'bottom-content-container');
    var video = setupVideoPlayer(id);
    var timetable = setupTimeslot(id);
    var relatedLinks = setupRelatedLinks(id);

    contentDiv.append(p);
    contentDiv.append(timetable);
    contentDiv.append(bottomContentDiv);

    if (video) {
        bottomContentDiv.append(video);
    }

    bottomContentDiv.append(relatedLinks);

    return contentDiv;
}


/**
 * Sets up and returns the video player, false if the video URL does not exist.
 * TODO: Function should be split up.
 * @param {string} id The course code.
 * @returns {boolean|jQuery}
 */
function setupVideoPlayer(id) {
    'use strict';

    var url = 'http://www.cs.toronto.edu/~liudavid/' + id.toLowerCase() + '.mp4';
    var exists = urlExists(url);

    if (!exists) {
        return false;
    }

    // Not divided up into 'attr' yet because 'controls preload'
    // cannot be added that way...
    var videoDiv = $('<div></div>');
    videoDiv.css('display', 'inline')
            .css('float', 'left')
            .css('width', '100%');
    var video = $('<video id="course_video" class="video-js vjs-default-skin"' +
                  'controls preload="auto" width="100%" height="400"></video>');
    var src = $('<source></source>').attr('src', url)
                                    .attr('type', 'video/mp4');

    video.append(src);
    videoDiv.append(video);

    return videoDiv;
}


/**
 * Returns a formatted course timeslot.
 * @param {string} id The course code.
 * @returns {jQuery}
 */
function setupTimeslot(id) {
    'use strict';

    var courseName;
    var timeslot = $('<div></div>');
    var title = $('<h3></h3>');

    timeslot.append(title);
    timeslot.append($('#timetableMain').children('tbody')
                                       .children('tr')
                                       .first()
                                       .clone());

    $('.searchClass').each(function () {
        courseName = $(this).children('td').first().html();
        if (courseName.indexOf(id) > -1) {
            timeslot.append($(this).clone());
        }
    });

    timeslot.attr('style', 'width: 920px; margin: 0 auto;');

    timeslot.children('.searchClass').children('td').first().remove();
    timeslot.children('tr').children('td').first().remove();
    return timeslot;
}


/**
 * Sets up and returns the related links HTML div element.
 * @param id The course code.
 * @returns {jQuery}
 */
function setupRelatedLinks(id) {
    'use strict';

    var relatedLinksDiv = $('<div></div>').css('display', 'inline')
                                          .css('float', 'right')
                                          .css('width', '45%')
                                          .css('height', '250');
    var title = $('<h3></h3>');
    relatedLinksDiv.append(title);
    return relatedLinksDiv;
}


/**
 * Displays a tooltip for a Node.
 * @param {string} nodeId The Node's ID.
 */
function displayTooltip(nodeId) {
    'use strict';

    var rectObject = $('#' + nodeId).find('rect');

    // The tooltip displays with a width of 222. If the node has an x
    // position of less than 222, the tooltip will be cut off by the svg
    // boundaries. In this case, we display the tooltip on the left.
    var rightSide = rectObject.attr('x') > 222;

    // The tooltip is offset with a 'padding' of 5.
    if (rightSide) {
        var xPos = parseFloat(rectObject.attr('x')) - 65;
    } else {
        var xPos = parseFloat(rectObject.attr('x')) +
                   parseFloat($('#' + nodeId).children('rect').attr('width')) + 5;
    }

    var yPos = rectObject.attr('y');
    var g = createG(nodeId);
    createRect(g, 'node-tooltip', nodeId + '-tooltip', xPos, yPos,
               60, 30, 'black');
    createText(g, nodeId, 'node-tooltip', nodeId + '-tooltip', xPos, yPos,
               60, 30, 'black');
}


/**
 * Creates an svg rect object and appends it to #graphRootSVG.
 * @param {string} rectClass Class(es) of the rect.
 * @param {string} rectId The ID of the rect.
 * @param {number} posX The x position of the rect.
 * @param {number} posY The y position of the rect.
 * @param {number} width The width of the rect.
 * @param {number} height The height of the rect.
 * @param {string} color The fill and stroke color of the rect.
 */
function createRect(g, rectClass, rectId, posX, posY, width, height, color) {
    'use strict';

    var rect = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
        .attr('class', rectClass + '-rect ' + rectId + '-rect')
        .attr('id', rectId + '-rect')
        .attr('x', posX)
        .attr('y', posY)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('fill', 'white')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('width', width)
        .attr('height', height);

    g.append(rect);

    $('.tooltip-group').hover(
        function () {
            clearAllTimeouts();
        },
        function () {
            $('.tooltip-group').fadeOut(400, function () {$(this).remove(); });
        });
}


/**
 * Creates an svg text element and appends it to #graphRootSVG.
 * @param {string} nodeId The Node's ID.
 * @param {string} textClass Class(es) of the text element.
 * @param {string} textId The ID of the text element.
 * @param {number} posX The x position of the text element.
 * @param {number} posY The y position of the text element.
 * @param {number} width The width of the text element.
 * @param {number} height The height of the text element.
 * @param {string} color The fill and stroke color of the text element.
 */
function createText(g, nodeId, textClass, textId, posX, posY, width, height, color) {
    'use strict';

    var text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
        .text('Info')
        .attr('class', rectClass + '-text ' + rectId + '-text')
        .attr('id', rectId + '-text')
        .attr('x', parseFloat(posX) + 30)
        .attr('y', parseFloat(posY) + 20);
    g.append(text);
}


/**
 * Sets up and Returns a tooltips SVG g element.
 * @param {string} nodeId
 * @returns {jQuery}
 */
function createG(nodeId) {
    'use strict';

    var g = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    g.attr('class', 'tooltip-group')
        .css('cursor', 'pointer')
        .click(function () {
            openModal(nodeId);
        });
    $('#graphRootSVG').append(g);
    return g;
}


/**
 * Opens the course information modal.
 * @param {string} id The course code.
 * TODO: Needs to be cleaned up.
 */
function openModal(id) {
    'use strict';

    if ($('.modal').length === 0) {
        $('.infoTabs').hide();

        var div = createModalDiv(nodeId);

        div.attr('title', getCourseTitle(id))
           .addClass('modal').dialog({
                autoOpen: true,
                modal: true,
                minWidth: 1000,
                minHeight: 600,
                closeText: 'X',
                open: function(event, ui) {
                        $('.ui-widget-overlay').bind('click', function () {
                                                                  div.dialog('close');
                                                              }); },
                close: function () {
                    $(this).remove();
                    $.each(nodes, function (index, elem) {
                        window[elem].updateSVG();
                    });
                    $('body').css('background', 'rgb(255,255,255)');
                    $('.infoTabs').show();
                }});

        $('.node, .hybrid').attr('data-active', 'unlit');
        $('body').css('background', 'rgb(40,40,40)');
        setMouseCallbacks();
        enableVideoJS();
        $('.tooltip-group').remove();
    }
}


/**
 * Enables VideoJS.
 * Note: Must be called after the video player is set up.
 */
function enableVideoJS() {
    'use strict';

    if (document.getElementsByClassName('vjs-default-skin').length > 0) {
        videojs(document.getElementsByClassName('vjs-default-skin')[0], {},
                function () {});
    }
}
