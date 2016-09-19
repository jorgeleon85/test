'use strict';

var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var ProductService = function(){

	var service = new HttpCache(JSONService(XMLHttpRequest));

	var getData = function getData(){
		return service.request('services/products');
	}

	var flush = function flush(){
		service.flush();
		return true;
	}

	return {
		get: getData,
		flush: flush
	}
}

module.exports = ProductService;