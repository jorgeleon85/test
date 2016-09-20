'use strict';

/**
 * View show notifications for errors
 * @param {DOM Element} container: node to show messages to users
 * @param {object} observer: pub/sub instance to publish category changes
 * @returns {Object} public methods to the view: render
 */
var NotificationView = function(container, observer) {

    // render an event to the 
    var render = function(msg) {
        var element = document.createElement("div"),
            button = document.createElement('button');

        // append a message to the container
        element.setAttribute('class', 'errorMsg');
        element.innerText = msg;
        button.setAttribute('class', 'close');
        button.innerText = 'X';
        element.appendChild(button);
        container.appendChild(element);

        // remove notice after 5 seconds
        setTimeout(function(){
            element.remove();
        }, 5000);

        return element;
    };

    // listen for notice notifications and render them
    observer.register('/notice', function(msg) {
        render(msg);
    });

    // export public api
    return {
        render: render
    };

};

module.exports = NotificationView;