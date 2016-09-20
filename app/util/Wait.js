'use strict';

/**
 * Utititly to wait for several requests simultaneously
 * @param {array} services: pub/sub instance
 * @param {function} callback: executes with two arrays:
 *      Array 1: has an entry with the successful result of each service in the same order
 *      Array 2: has an entry with the error result of each service in the same order
 */
var Wait = function Wait(services, callback) {

    var toLoad = services.length, // countdown to amount of services expected
        responses = [], // list of data from success responses
        errors = []; // list of data from error responses

    services
        .forEach(function(service, index) {
            
            // executes the defer methods (done, error) from all the services
            service
                .done(function(data) {
                    // set the success data in the same position it was passed to this function
                    responses[index] = data;
                    if (--toLoad === 0) {
                        // if countdown is down to zero execute callback with success and error response
                        callback(responses, errors);
                    }
                })
                .error(function(msg) {
                    // set the error data in the same position it was passed to this function
                    errors[index] = msg;
                    if (--toLoad === 0) {
                        // if countdown is down to zero execute callback with success and error response
                        callback(responses, errors);
                    }
                })
        });
}

module.exports = Wait;