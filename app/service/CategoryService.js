'use strict';

var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var CategoryService = function(){

	var service = new HttpCache(JSONService(XMLHttpRequest));

	var getData = function getData(){
		return service.request('services/categories');
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

module.exports = CategoryService;