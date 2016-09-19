'use strict';

var NotificationView = function(container, observer) {

    var render = function(msg) {
        var element = document.createElement("div"),
            button = document.createElement('button');

        element.setAttribute('class', 'errorMsg');
        element.innerText = msg;
        button.setAttribute('class', 'close');
        button.innerText = 'X';
        element.appendChild(button);
        container.appendChild(element);
        return element;
    };

    observer.register('/notice', function(msg) {
        render(msg);
    });

    return {
        render: render
    };

};

module.exports = NotificationView;