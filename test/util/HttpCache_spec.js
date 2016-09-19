var HttpCache = require('../../app/util/HttpCache');

describe('HttpCache', function() {

	var errorServiceMockup = {
		request: function(){
			var obj = {
				done: function(){
					return obj;
				},
				error: function(callback){
					setTimeout(function(){
						callback('data-not-to-be-cached');
					}, 50);
					return obj;
				}
			}
			return obj;
		}
	};

	

	var expiredStorageMockup = (function(){
		var cachedData = null;
		return {
			getItem: function(){
				var rawData = JSON.parse(cachedData);
				rawData.timestamp -=  + 15 * 60 * 1000;
				return JSON.stringify(rawData);
			},
			removeItem: function(){},
			setItem: function(data){
				cachedData = data;
			}
		}
	})();

	it('underlying service instance should be call only once', function(done){

		var requestCounter = 0;

		var successServiceMockup = {
			request: function(){
				requestCounter++;
				var obj = {
					done: function(callback){
						setTimeout(function(){
							callback({data: 'data-for-caching'});
						}, 50);
						return obj;
					},
					error: function(){
						return obj;
					}
				}
				return obj;
			}
		};

		var goodStorageMockup = (function(){
			var cachedData = null;
			return {
				getItem: function(){
					return cachedData;
				},
				removeItem: function(){},
				setItem: function(key, data){
					cachedData = data;
				}
			}
		})();

		var self = this;

		self.cache = HttpCache(successServiceMockup, {storage: goodStorageMockup, ttl: 5 * 60 * 1000});

		self.cache.request('/endpoint')
			.done(function(data){
				expect(data).toEqual({data: 'data-for-caching'});
				expect(requestCounter).toBe(1);

				self.cache.request('/endpoint')
					.done(function(data){
						expect(data).toEqual({data: 'data-for-caching'});
						expect(requestCounter).toBe(1);
					});
			});

		setTimeout(function() {
			done();
		}, 200);

		
	});
});
