'use strict';

/**
 * Utility library used mostly by HttpCache to create a defer obj eventhough both 
 * success data & error data are availabe, so it can make cached data async as well
 * @param {object} doneData: sync success data that will be loaded async
 * @param {object} errorData: sync success data that will be loaded async
 * @returns {Object} defer object with done and error methods
 */
var DeferHelper = function DeferHelper(doneData, errorData){
	// defer object with done & error callbacks
	// both methods return same defer object so it can be chainable, example: b.done(foo).error(foo) 
	var deferObj = {
		done: function(callback){
			if(doneData) {
				callback(doneData);
			}
			return deferObj;
		},
		error: function(callback){
			if(errorData) {
				callback(errorData);
			}
			return deferObj;
		}
	};

	return deferObj;
}

module.exports = DeferHelper;