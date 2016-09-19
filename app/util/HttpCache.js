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

    var options = {
        storage: newOptions.storage || window.localStorage,
        ttl: newOptions.ttl || 5 * 60 * 1000
    }

    var request = function request(endpoint, options) {
        var cached = lookup(endpoint),
            doneData = null,
            errorData = null,
            doneCallback = null,
            errorCallback = null;

        if (cached) {
            return Defer(cached, null);
        }

        Service.request(endpoint, options)
            .done(function(data) {
                save(endpoint, data);
                doneData = data;
                doneCallback && doneCallback(doneData);
            })
            .error(function(data) {
                errorData = data;
                errorCallback && errorCallback(errorData);
            })

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

    var lookup = function lookup(key) {
        var now = new Date().getTime(),
            saved = options.storage.getItem(key),
            data;

        if (saved) {
            data = JSON.parse(saved);
            if (options.ttl > now - data.timestamp) {
                return data.payload;
            } else {
                options.storage.removeItem(key);
            }
        }
        return null;
    }

    var save = function save(key, data) {
        try {
            options.storage.setItem(key, JSON.stringify({
                timestamp: new Date().getTime(),
                payload: data
            }));
        } catch (e) {
            return false;
        }
        return true;
    }

    var flush = function flush(){
    	options.storage.clear();
    }

    return {
        request: request,
        lookup: lookup,
        save: save,
        flush: flush
    }
}

module.exports = HttpCache;