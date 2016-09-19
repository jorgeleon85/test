var JSONService = function(HttpRequest){

	var request = function(endpoint, options){

		var nop = function nop(){},
			doneCallback = null,
			doneData = null,
			errorCallback = null,
			errorData = null;
			defer = null;

		defer = {
			done: function doneFunction(callback){
				doneCallback = callback;
				if(doneCallback && doneData) {
					doneCallback(doneData);
				}
				return defer;
			},
			error: function errorFunction(callback){
				errorCallback = callback;
				if(callback && errorData) {
					errorCallback(errorData);
				}
				return defer;
			}
		};

		options = options || {};
		options.method = options.method || 'GET';
		options.datatype = options.datatype || 'JSON';
		
		var request = new HttpRequest();
		request.open(options.method, endpoint, true);
		request.onreadystatechange = function () {
			if(this.readyState == 4 && this.status == 200) {
				var data = null,
					isValid = true;
				
				try {
					data = JSON.parse(this.responseText);
				}
				catch(e){
					isValid = false;
				}

				if(isValid){
					doneData = data;
					doneCallback && doneCallback(data);
				} else {
					errorData = "There was a problem parsing data from endpoint, please check data syntax and try again using reset button";
					errorCallback && errorCallback(errorData);
				}
			}
			else if(this.readyState == 4 && this.status >= 300) {
				errorData = "There was a problem getting data from the endpoint, please try again using reset button";
				errorCallback && errorCallback(errorData);
			}
		};
		request.send();
		return defer;
	}

	return {
		request: request
	}
};

module.exports = JSONService;