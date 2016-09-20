'use strict';

/**
 * Custom observer implementation that uses publish/register methods
 * @returns {Object} public methods to the observer: register,
 *                   publish and release
 */
var PubSub = function PubSub() {

    // list of channels
    var channels = {};

    // register a subscriber to a channel
    var register = function(channel, callback) {
        if (!channels[channel]) {
            channels[channel] = [];
        }
        channels[channel].push(callback);
    }

    // remove a subscripber from a given channel
    var release = function(channel, callback) {
        if (channels[channel]) {
            channels[channel] = channels[channel].filter(function(element) {
                return element !== callback
            });
        }
    }

    // publish a message to a channel
    var publish = function(channel, data) {
        if (channels[channel]) {
            channels[channel].forEach(function(client) {
                client(data);
            });
            return true;
        } else {
            return false;
        }
    }

    // export public api
    return {
        publish: publish,
        register: register,
        release: release
    }
};

module.exports = PubSub;