var JSONService = require('../../app/service/JSONService');

describe('JSONService', function() {

	var successXMLHttpRequestMock = function(){};
	successXMLHttpRequestMock.prototype = {
		'open': function(){},
		'onreadystatechange': function(){},
		'send': function(){
			this.readyState = 4;
			this.status = 200;
			this.responseText = '[{"id":1,"name":"custom","description":"OOOoo... the USER!!!!!!","products":null},{"id":2,"name":"vegetables","description":"Fresh and crisp.","products":[4,6,12,16]}]';
			this.onreadystatechange();
		}
	}

	var parseErrorXMLHttpRequestMock = function(){};
	parseErrorXMLHttpRequestMock.prototype = {
		'open': function(){},
		'onreadystatechange': function(){},
		'send': function(){
			this.readyState = 4;
			this.status = 404;
			this.onreadystatechange();
		}
	}

	var httpErrorXMLHttpRequestMock = function(){};
	httpErrorXMLHttpRequestMock.prototype = {
		'open': function(){},
		'onreadystatechange': function(){},
		'send': function(){
			this.readyState = 4;
			this.status = 200;
			this.responseText = '[{"id":,"name":"custom","description":"OOOoo... the USER!!!!!!","products":null}]';
			this.onreadystatechange();
		}
	}

	it('parse successful JSON request', function(){

		this.doneCallback = function(data){
			expect(data.length).toBe(2);
			expect(data).toEqual([{"id":1,"name":"custom","description":"OOOoo... the USER!!!!!!","products":null},{"id":2,"name":"vegetables","description":"Fresh and crisp.","products":[4,6,12,16]}]);
		}

		this.errorCallback = function(){}

		spyOn(this, 'doneCallback').and.callThrough();
		spyOn(this, 'errorCallback').and.callThrough();


		this.service = JSONService(successXMLHttpRequestMock);
		var defer = this.service.request('services/categories/');
		expect(defer.done).toBeDefined();
		expect(defer.error).toBeDefined();
		defer
			.done(this.doneCallback)
			.error(this.errorCallback);

		expect(this.doneCallback).toHaveBeenCalled();
		expect(this.errorCallback).not.toHaveBeenCalled();
	});

	it('404 http request error', function(){

		this.doneCallback = function(){}

		this.errorCallback = function(data){
			expect(typeof data).toBe("string");
		}

		spyOn(this, 'doneCallback').and.callThrough();
		spyOn(this, 'errorCallback').and.callThrough();


		this.service = JSONService(httpErrorXMLHttpRequestMock);
		var defer = this.service.request('services/missing-resource/');
		expect(defer.done).toBeDefined();
		expect(defer.error).toBeDefined();
		defer
			.done(this.doneCallback)
			.error(this.errorCallback);

		expect(this.doneCallback).not.toHaveBeenCalled();
		expect(this.errorCallback).toHaveBeenCalled();
	});

	it('syntax error, content can\'t be parsed', function(){

		this.doneCallback = function(){}

		this.errorCallback = function(data){
			expect(typeof data).toBe("string");
		}

		spyOn(this, 'doneCallback').and.callThrough();
		spyOn(this, 'errorCallback').and.callThrough();


		this.service = JSONService(parseErrorXMLHttpRequestMock);
		var defer = this.service.request('services/syntax-error/');
		expect(defer.done).toBeDefined();
		expect(defer.error).toBeDefined();
		defer
			.done(this.doneCallback)
			.error(this.errorCallback);

		expect(this.doneCallback).not.toHaveBeenCalled();
		expect(this.errorCallback).toHaveBeenCalled();
	});

});
