var PubSub = function PubSub(){

	var channels = {};

	var register = function(channel, callback){
		if(!channels[channel]) {
			channels[channel] = [];
		}
		channels[channel].push(callback);
	}

	var release = function(channel, callback){
		if(channels[channel]) {
			channels[channel] = channels[channel].filter(function(element){
				return element !== callback
			});
		}
	}

	var publish = function(channel, data){
		if(channels[channel]){
			var clients = channels[channel];
			channels[channel].forEach(function(client){
				client(data);
			});
			return true;
		}
		else {
			return false;
		}
	}

	return {
		publish: publish,
		register: register,
		release: release
	}
};

module.exports = PubSub;