(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var CategoryService = require('./service/CategoryService');
var ProductService = require('./service/ProductService');

var CategoryCollection = require('./model/CategoryCollection');
var ProductCollection = require('./model/ProductCollection');

var CategoryView = require('./view/CategoryView');
var ProductView = require('./view/ProductView');

var Wait = require('./util/Wait');

var Controller = (function() {

	var categoryService = CategoryService(),
		productService = ProductService(),
		categoryCollection = CategoryCollection(),
		productCollection = ProductCollection(),
		categoryView,
		ProductView,
		currentCategory;

	Wait([categoryService.get(), productService.get()], function(successData){
	
		productCollection.load(successData[1]);
		categoryCollection.load(successData[0], productCollection);

		productCollection.print();
		categoryCollection.print();

		categoryView = CategoryView(document.getElementById('categoryContainer'));
		categoryView.render(categoryCollection);

		currentCategory = categoryCollection.get(0);
		categoryView.setSelected(currentCategory);

		productView = ProductView(document.getElementById('productContainer'));
		productView.render(currentCategory.products);

		categoryView.selectedChanged(function(newCurrentCategory){
			currentCategory = newCurrentCategory;
			productView.render(currentCategory.products);
		});

	});

})();

},{"./model/CategoryCollection":2,"./model/ProductCollection":3,"./service/CategoryService":4,"./service/ProductService":6,"./util/Wait":10,"./view/CategoryView":11,"./view/ProductView":12}],2:[function(require,module,exports){
var PubSub = require('../util/PubSub');

function CategoryCollection () {

	var collection = [];

	var add = function addCategory(id, name, description, products){
		collection.push({id: id, name: name, description: description, products: products});
	}

	var load = function loadCategory(data, products){
		data.forEach(function(ele){
			add(ele.id, ele.name, ele.description, products.findAll(ele.products).sort(function(a, b){
				return a.price - b.price;
			}));
		})
	}

	var get = function getCategory(index){
		return collection[index];
	}

	var print = function print(){
		console.log(collection);
	}

	return {
		add: add,
		load: load,
		items: collection,
		print: print,
		get: get
	};
}

module.exports = CategoryCollection;

},{"../util/PubSub":9}],3:[function(require,module,exports){
var PubSub = require('../util/PubSub');

function ProductCollection () {

	var collection = [];

	function add(id, name, description, price){
		collection.push({
			id: id,
			name: name,
			description: description,
			price: price
		});
	}

	var load = function load(data){
		data.forEach(function(item, index){
			add(item.id, item.name, item.description, item.price);
		});
	}

	var findAll = function findAll(ids){
		if(ids) {
			return collection.filter(function(item){
				return ids.indexOf(item.id) !== -1
			});
		} else {
			return [];
		}
	}

	var sort = function sort(){
		collection = collection.sort(function(a, b){
			return a.price - b.price;
		})
	}

	var print = function print(){
		console.log(collection);
	}

	return {
		add: add,
		load: load,
		findAll: findAll,
		print: print,
		items: collection
	};
}

module.exports = ProductCollection;
},{"../util/PubSub":9}],4:[function(require,module,exports){
var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var CategoryService = function(){

	var service = HttpCache(JSONService(XMLHttpRequest));

	var getData = function getData(){
		return service.request('services/categories');
	}

	return {
		get: getData
	}
}

module.exports = CategoryService;
},{"../util/HttpCache":8,"./JSONService":5}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"../util/HttpCache":8,"./JSONService":5}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
var Defer = require('./DeferHelper');

var HttpCache = function(Service, newOptions){

	newOptions = newOptions || {};
	
	var options = {
		storage: newOptions.storage || window.localStorage,
		ttl: newOptions.ttl || 5 * 60 * 1000
	}

	var request = function request(endpoint, options){
		var cached = lookup(endpoint),
			objectRet = null,
			doneData = null,
			errorData = null,
			doneCallback = null,
			errorCallback = null;

		if(cached) {
			return Defer(cached, null);
		}

		Service.request(endpoint, options)
			.done(function(data){
				save(endpoint, data);
				doneData = data;
				doneCallback && doneCallback(doneData);
			})
			.error(function(data){
				errorData = data;
				errorCallback && errorCallback(errorData);
			})

		var obj = {
			done: function(callback){
				doneCallback = callback;
				if(doneCallback && doneData){
					callback(doneData);
				}
				return obj;
			},
			error: function(callback){
				errorCallback = callback;
				if(errorCallback && errorData){
					errorCallback(errorData);
				}
				return obj;
			}
		}
		return obj;
	}

	var lookup = function lookup(key){
		var now = new Date().getTime(),
			saved = options.storage.getItem(key),
			data;

		if(saved) {
			data = JSON.parse(saved);
			if(options.ttl > now - data.timestamp) {
				return data.payload;
			} else {
				options.storage.removeItem(key);
			}
		}
		return null;
	}

	var save = function save(key, data){
		try {
			options.storage.setItem(key, JSON.stringify({
				timestamp: new Date().getTime(),
				payload: data
			}));
		} catch (e) {
			return false;
		}
		return true;
	}

	return {
		request: request,
		lookup: lookup,
		save: save
	}
}

module.exports = HttpCache;
},{"./DeferHelper":7}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){

var CategoryView = function ( container ) {

    var element = document.createElement("select"),
        selectedCategory = null,
        options = {};

    var render = function (categoryCollection) {
        while(container.firstChild){
            container.firstChild.remove();
        }
        categoryCollection.items.forEach(function(item){
            var option = document.createElement('option');
            option.innerText = item.name;
            option.setAttribute('value', item.id);
            if(item.id == selected.id) {
                option.selected = true;
            }
            options[item.id] = option;
            element.appendChild(option);
        });
        container.appendChild(element);
        return element;
    };

    var updateHandler = function updateHandler(){
        console.log('arguments', arguments);
    }

    var setSelected = function setSelected(newSelectedCategory){
        options[selectedCategory.id].selected = false;
        selectedCategory = newSelectedCategory;
        options[selectedCategory.id].selected = true;
    }


    element.addEventListener("change", updateHandler, false);

    return {
        render: render,
        setSelected: setSelected,
        selectedChanged: selectedChanged
    };
};

module.exports = CategoryView;
},{}],12:[function(require,module,exports){
var ProductView = function ( container ) {

    var render = function (productCollection) {
        // It'd be better to use a templating library for this
        // but I'm manually creating DOM elements for simplicity
        while(container.firstChild){
            container.firstChild.remove();
        }
        productCollection.forEach(function(product){
            var element = document.createElement('li'),
                name = document.createElement('span'),
                price = document.createElement('span'),
                action = document.createElement('input');

            name.innerText = product.name;
            price.innerText = product.price;
            action.setAttribute('type', 'button');
            action.setAttribute('value', 'Delete');
            action.setAttribute('className', 'deleteBtn');
            action.productId = product.id;
            element.appendChild(name);
            element.appendChild(price);
            element.appendChild(action);
            container.appendChild(element);
        });
        
    };

    var removeHandler = function removeHandler(e){
        if (e.target && e.target.matches("input.deleteBtn")) {
            alert(e.target.productId);
        }
    }

    container.addEventListener("click", removeHandler, false);


    var deleteItem = function deleteItem() {
        if(element.parentElement){
            text.remove();
            action.remove();
            element.remove();
            text = null;
            action = null;
            element = null;
            action.removeEventListener('click', removeHandler, false);
        }
    };

    var updateItem = function updateItem() {
        if(element.parentElement){
            text.innerText();
            action.remove();
            element.remove();
            text = null;
            action = null;
            element = null;
            action.removeEventListener('click', removeHandler, false);
        }
    };

    return {
        render: render
    };

};

module.exports = ProductView;
},{}]},{},[1]);
