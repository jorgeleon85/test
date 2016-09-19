var DeferHelper = require('../../app/util/DeferHelper');

describe('DeferHelper', function() {

	var noop = function(){};

	it('return must have done and error methods', function(){
		this.defer = DeferHelper();
		expect(this.defer.done).toBeDefined();
		expect(this.defer.error).toBeDefined();
	});

	it('if only success data is provided, only done should be triggered', function(){
		this.defer = DeferHelper('a', null);
		this.defer
			.done(function(data){
				expect(data).toBe('a');	
			})
			.error(noop);
	});

	it('if only error data is provided, only error should be triggered', function(){
		this.defer = DeferHelper(null, 'b');
		this.defer
			.done(noop)
			.error(function(data){
				expect(data).toBe('b');	
			});
	});

	it('if success & error data is provided, both callbacks should be triggered', function(){
		this.defer = DeferHelper('a', 'b');
		this.defer
			.done(function(data){
				expect(data).toBe('a');	
			})
			.error(function(data){
				expect(data).toBe('b');	
			});
	});

});
