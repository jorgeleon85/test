'use strict';

/**
 * Low level service implementation for AJAX functionality
 * @constructor
 * @param {function} XMLHttpRequest object or mockup for unit testing
 * @returns {function, function}
 */

var JSONService = function(Request) {

    // low level function to actually execute the ajax request
    var request = function(endpoint, options) {

        var doneCallback = null,
            doneData = null,
            errorCallback = null,
            errorData = null,
            defer = null,
            request,

        // defer object used with ajax response to allow async execution
        defer = {
            done: function doneFunction(callback) {
                doneCallback = callback;
                if (doneCallback && doneData) {
                    doneCallback(doneData);
                }
                return defer;
            },
            error: function errorFunction(callback) {
                errorCallback = callback;
                if (callback && errorData) {
                    errorCallback(errorData);
                }
                return defer;
            }
        };

        // will always use GET by default, but can be configured to use other methods
        options = options || {};
        options.method = options.method || 'GET';

        // standard AJAX request code
        request = new Request();
        request.open(options.method, endpoint, true);
        request.onreadystatechange = function onreadystatechange() {
            if (this.readyState == 4 && this.status == 200) {
                
                // request is ready and successful
                var data = null,
                    isValid = true;

                try {
                    // parse retrieved data to JSON and catch syntax errors
                    data = JSON.parse(this.responseText);
                } catch (e) {
                    isValid = false;
                }

                if (isValid) {
                    // execute done in refer object to indicate successful request
                    doneData = data;
                    doneCallback && doneCallback(data);
                } else {
                    // execute fail in refer object and specify syntax error
                    errorData = "There was a problem parsing data from endpoint "+endpoint+", please check data syntax and try again using reset button";
                    errorCallback && errorCallback(errorData);
                }
            } else if (this.readyState == 4 && this.status >= 300) {
                // request ready but failed for some reason
                errorData = "There was a problem getting data from the endpoint "+endpoint+", please try again using reset button";
                errorCallback && errorCallback(errorData);
            }
        };
        // execute request and return defer object
        request.send();
        return defer;
    }

    // method to flush cache, required by HttpProxy interface
    var flush = function flush(){
        // returns false because flush was not successful
        return false;
    };

    // export public api
    return {
        request: request,
        flush: flush
    }
};

module.exports = JSONService;