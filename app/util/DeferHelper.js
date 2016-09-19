'use strict';

var DeferHelper = function DeferHelper(doneData, errorData){
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