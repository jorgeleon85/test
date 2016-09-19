'use strict';

var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var CategoryService = function(){

	var service = HttpCache(JSONService(XMLHttpRequest));

	var getData = function getData(){
		return service.request('services/categories');
	}

	return {
		get: getData
	}
}

module.exports = CategoryService;