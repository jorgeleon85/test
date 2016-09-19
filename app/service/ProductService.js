'use strict';

var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

/**
 * Service constructor to load category informacion and proxy the Cache functionality
 * @constructor
 * @returns {Object} an object with methods get and flush
 */
var ProductService = function(){

	// instantiate a low level service wrapped in a cache proxy
	var service = new HttpCache(JSONService(XMLHttpRequest));

	// public get method to encapsulate service request
	var get = function get(){
		return service.request('services/products');
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

module.exports = ProductService;