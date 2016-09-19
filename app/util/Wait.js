'use strict';

var Wait = function Wait(services, callback) {

    var toLoad = services.length,
        responses = [],
        errors = [];

    services
        .forEach(function(service, index) {
            service
                .done(function(data) {
                    responses[index] = data;
                    if (--toLoad === 0) {
                        callback(responses, errors);
                    }
                })
                .error(function(msg) {
                    errors[index] = msg;
                    if (--toLoad === 0) {
                        callback(responses, errors);
                    }
                })
        });
}

module.exports = Wait;