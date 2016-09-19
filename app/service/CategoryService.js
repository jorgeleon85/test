'use strict';

/**
 * Service constructor to load category informacion and proxy the Cache functionality
 * @constructor
 * @returns {Object} an object with methods get and flush
 */


var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var CategoryService = function(){

	// instantiate a low level service wrapped in a cache proxy
	var service = new HttpCache(JSONService(XMLHttpRequest));

	// public get method to encapsulate service request
	var getData = function getData(){
		return service.request('services/categories');
	}

	// public flush method to release items from service cache
	var flush = function flush(){
		service.flush();
		return true;
	}

	// export public api
	return {
		get: getData,
		flush: flush
	}
}

module.exports = CategoryService;