'use strict';

/**
 * Service constructor to load category informacion and proxy the Cache functionality
 * @returns {Object} an object with methods get and flush
 */


var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var CategoryService = function(){

	// instantiate a low level service wrapped in a cache proxy
	var service = new HttpCache(JSONService(XMLHttpRequest));

	// public get method to encapsulate service request
	var get = function get(){
		return service.request('services/categories');
	}

	// public flush method to release items from service cache
	var flush = function flush(){
		service.flush();
		return true;
	}

	// export public api
	return {
		get: get,
		flush: flush
	}
}

module.exports = CategoryService;