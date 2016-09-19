var PubSub = require('../../app/util/PubSub');

describe('PubSub', function() {

	beforeEach(function() {
		this.observer = PubSub();
	});

	it('must get callbacks after register', function(){

		var callbackA = function(data){
			expect(data).toBe('testdata1');
		}

		var callbackB = function(data){
			expect(data).toBe('testdata1');
		}

		var callbackC = function(data){
			expect(data).toBe('testdata2');
		}

		this.observer.register('/test1', callbackA);

		this.observer.register('/test1', callbackB);

		this.observer.register('/test2', callbackC);

		this.observer.publish('/test1', 'testdata1');

		this.observer.publish('/test2', 'testdata2');

		
	});

	it('should not get callbacks calls after release', function(){

		this.callbacks = {
				callbackA: function(data){
					expect(data).toBe('testdata');
				},
				callbackB: function(data){
					expect(data).toBe('testdata');
				}
			};

		spyOn(this.callbacks, 'callbackA').and.callThrough();
		spyOn(this.callbacks, 'callbackB').and.callThrough();

		this.observer.register('/test', this.callbacks.callbackA);

		this.observer.register('/test', this.callbacks.callbackB);

		this.observer.release('/test', this.callbacks.callbackB);

		this.observer.publish('/test', 'testdata');

		expect(this.callbacks.callbackA).toHaveBeenCalled();

		expect(this.callbacks.callbackB).not.toHaveBeenCalled();

		
	});
});
