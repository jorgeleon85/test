'use strict';

var Defer = require('./DeferHelper');
/**
 * Cache library used as proxy of JSONService, will cache data from the done
 * callback, but NOT the error callback
 * @param {function} Service: internal low-level service instance
                     passed as depencency for unit test mock
 * @param {object} newOptions: cache configuration for type of storage and ttl
 * @returns {Object} defer object with done and error methods
 */
var HttpCache = function(Service, newOptions) {

    newOptions = newOptions || {};

    // default cache options
    var options = {
        // use localStorage by default
        storage: newOptions.storage || window.localStorage,
        // time-to-live for data in cache in miliseconds, default to 5 minutes
        ttl: newOptions.ttl || 5 * 60 * 1000
    }

    // proxy request to internal service request with 
    var request = function request(endpoint, options) {
        var cached = lookup(endpoint),
            doneData = null,
            errorData = null,
            doneCallback = null,
            errorCallback = null;

        if (cached) {
            // if data was found in cache, return it in a mocked defer
            return Defer(cached, null);
        }

        // execute internal service request with the same parameters
        Service.request(endpoint, options)
            .done(function(data) {
                // save success data from cache
                save(endpoint, data);
                // return mockup defer object with data from request
                doneData = data;
                doneCallback && doneCallback(doneData);
            })
            .error(function(data) {
                // return mockup defer object with error from request
                // and NOT cache it
                errorData = data;
                errorCallback && errorCallback(errorData);
            })


        // mockup defer object with chaining
        var obj = {
            done: function(callback) {
                doneCallback = callback;
                if (doneCallback && doneData) {
                    callback(doneData);
                }
                return obj;
            },
            error: function(callback) {
                errorCallback = callback;
                if (errorCallback && errorData) {
                    errorCallback(errorData);
                }
                return obj;
            }
        }
        return obj;
    }

    // recover data from cache and only return it if ttl is respected
    var lookup = function lookup(key) {

        // load data from cache
        var now = new Date().getTime(),
            saved = options.storage.getItem(key),
            data;

        if (saved) {
            // if data was found it is parsed
            data = JSON.parse(saved);
            if (options.ttl > now - data.timestamp) {
                // time-to-leave was respected, return data
                return data.payload;
            } else {
                // data is expired, remove it from cache
                options.storage.removeItem(key);
            }
        }
        return null;
    }

    // save data to cache with a timestamp to control expiration
    var save = function save(key, data) {
        try {
            // parse data to string and save it to cache
            // use try/catch in case of cache full or security constraint
            options.storage.setItem(key, JSON.stringify({
                timestamp: new Date().getTime(),
                payload: data
            }));
        } catch (e) {
            return false;
        }
        return true;
    }

    // flush data from cache
    var flush = function flush(){
    	options.storage.clear();
    }

    // exported api
    return {
        request: request,
        lookup: lookup,
        save: save,
        flush: flush
    }
}

module.exports = HttpCache;