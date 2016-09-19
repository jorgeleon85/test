var Wait = function Wait(services, successCallback, errorCallback){
	
	var toLoad = services.length,
		responses = [];

	services
		.forEach(function(service, index){
			service.done(function(data){
				responses[index] = data;
				if(--toLoad === 0) {
					successCallback(responses);
				}
			});
		});
}

module.exports = Wait;