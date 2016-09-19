'use strict';

var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var ProductService = function(){

	var service = HttpCache(JSONService(XMLHttpRequest));

	var getData = function getData(){
		return service.request('services/products');
	}

	return {
		get: getData
	}
}

module.exports = ProductService;