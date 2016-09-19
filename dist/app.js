(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CategoryService = require('./service/CategoryService');
var ProductService = require('./service/ProductService');

var CategoryCollection = require('./model/CategoryCollection');
var ProductCollection = require('./model/ProductCollection');

var CategoryView = require('./view/CategoryView');
var ProductView = require('./view/ProductView');
var ActionView = require('./view/ActionView');
var NotificationView = require('./view/NotificationView');

var Observer = require('./util/PubSub');

var Wait = require('./util/Wait');

var Controller = (function() {

	'use strict';

	var observer = Observer(),
		categoryService = CategoryService(),
		productService = ProductService(),
		categoryCollection = CategoryCollection(),
		productCollection = ProductCollection(),
		categoryView = CategoryView(document.getElementById('categoryContainer'), observer),
		productView = ProductView(document.getElementById('productContainer'), observer),
		actionView = ActionView(observer),
		notificationView = NotificationView(document.getElementById('noticeContainer'), observer),
		currentCategory = null,
		loadAndRender;

	observer.register('/reset', function(){
		loadAndRender();
	});
	
	observer.register('/new-product', function(data){
		currentCategory.add(data.name, data.description, data.price);
		productView.render(currentCategory.products);
	});

	observer.register('/delete-product', function(id){
		currentCategory.remove(id);
		productView.render(currentCategory.products);
	});

	categoryView.selectedChanged(function(newCurrentCategory){
		currentCategory = newCurrentCategory;
		productView.render(currentCategory.products);
	});

	var loadAndRender = function loadAndRender(){

		Wait([productService.get(), categoryService.get()], function(successData, errorMsg){
		
			if(successData[0]){
				productCollection.load(successData[0]);
			} else if(errorMsg[0]) {
				observer.publish('/notice', errorMsg[0]);
			}

			if(successData[1]){
				categoryCollection.load(successData[1], productCollection);
			} else if(errorMsg[1]) {
				observer.publish('/notice', errorMsg[1]);
			}

			categoryView.render(categoryCollection);
			
			if(!currentCategory) {
				currentCategory = categoryCollection.get(0);
			} else {
				currentCategory = categoryCollection.find(currentCategory.id);
			}

			if(currentCategory) {
				categoryView.setSelected(currentCategory);
				productView.render(currentCategory.products);
			}
			
		});
	}

	loadAndRender();

})();

},{"./model/CategoryCollection":2,"./model/ProductCollection":3,"./service/CategoryService":4,"./service/ProductService":6,"./util/PubSub":9,"./util/Wait":10,"./view/ActionView":11,"./view/CategoryView":12,"./view/NotificationView":13,"./view/ProductView":14}],2:[function(require,module,exports){
var PubSub = require('../util/PubSub');

function CategoryCollection () {

	var scope = {
		collection: []
	}

	var add = function addCategory(id, name, description, products){
		scope.collection.push({id: id, name: name, description: description, products: products,
			add: function(name, description, price){
				var self = this;
				self.products.push({id: nextId(self.products), name: name, description: description, price: price});
				self.products = self.products.sort(sort);
			},
			remove: function(id){
				var self = this;
				self.products = self.products.filter(function(e){ return e.id != id});
			}
		});
	}

	var addProduct = function addProduct(data, category){
		category.products = category.products.push({id: nextId(category.products), name: data.name, description: data.description, price: data.price});
		category.products = category.products.sort(sort);
	}

	var sort = function sort(a, b){
		return a.price - b.price;
	}

	var load = function loadCategory(data, products){
		scope.collection = [];
		if(data && data.length > 0) {
			data.forEach(function(ele){
				add(ele.id, ele.name, ele.description, products.findAll(ele.products).sort(sort));
			});
		}
	}

	var find = function find(id) {
		return scope.collection.find(function(ele){
			return ele.id.toString() === id.toString();
		})
	}

	var get = function getCategory(index){
		return scope.collection[index];
	}

	var nextId = function nextId(products){
		if(products.length === 0){
			return 1;
		} else {
			return Math.max.apply(null, products.map(function(e){return e.id})) + 1;
		}
	}

	var print = function print(){
		console.log(scope.collection);
	}

	return {
		add: add,
		load: load,
		find: find,
		items: function(){ return scope.collection },
		addProduct: addProduct,
		print: print,
		get: get
	};
}

module.exports = CategoryCollection;

},{"../util/PubSub":9}],3:[function(require,module,exports){
var PubSub = require('../util/PubSub');

function ProductCollection () {

	var scope = {
		collection: []
	}

	function add(id, name, description, price){
		scope.collection.push({
			id: id,
			name: name,
			description: description,
			price: price
		});
	}

	var load = function load(data){
		scope.collection = [];
		if(data && data.length > 0) {
			data.forEach(function(item, index){
				add(item.id, item.name, item.description, item.price);
			});
		}
	}

	var findAll = function findAll(ids){
		if(ids) {
			return scope.collection.filter(function(item){
				return ids.indexOf(item.id) !== -1
			});
		} else {
			return [];
		}
	}

	var sort = function sort(){
		scope.collection = scope.collection.sort(function(a, b){
			return a.price - b.price;
		})
	}

	var print = function print(){
		console.log(scope.collection);
	}

	var nextId = function nextId(){
		if(scope.collection.length === 0){
			return 1;
		} else {
			return Math.max.apply(null, scope.collection.map(function(e){return e.id})) + 1;
		}
	}

	return {
		add: add,
		load: load,
		findAll: findAll,
		print: print,
		items: function(){ return scope.collection },
		nextId: nextId
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
var Wait = function Wait(services, callback, errorCallback){
	
	var toLoad = services.length,
		responses = [],
		errors = [];

	services
		.forEach(function(service, index){
			service
				.done(function(data){
					responses[index] = data;
					if(--toLoad === 0) {
						callback(responses, errors);
					}
				})
				.error(function(msg){
					errors[index] = msg;
					if(--toLoad === 0) {
						callback(responses, errors);
					}
				})
		});
}

module.exports = Wait;
},{}],11:[function(require,module,exports){
var ActionView = function ( observer ) {

    var productName = document.getElementById('productName'),
        productDescription = document.getElementById('productDescription'),
        productPrice = document.getElementById('productPrice'),
        addAction = document.getElementById('add'),
        resetAction = document.getElementById('reset');

    var addHandler = function addHandler(){
        observer.publish('/new-product', {name: productName.value, description: productDescription.value, price: productPrice.value});
    }

    var resetHandler = function resetHandler(){
        observer.publish('/reset');
    }

    addAction.addEventListener("click", addHandler, false);
    resetAction.addEventListener("click", resetHandler, false);

};

module.exports = ActionView;
},{}],12:[function(require,module,exports){

var CategoryView = function ( container, observer ) {

    var element = document.createElement("select"),
        categoryCollection = null,
        selectedCategory = null,
        selectedCategoryChanged = function(){},
        options = {};

    element.setAttribute('id', 'productCategory')

    var render = function (_categoryCollection) {
        categoryCollection = _categoryCollection;
        while(element.firstChild){
            element.firstChild.remove();
        }
        options = {};

        categoryCollection.items().forEach(function(item){
            var option = document.createElement('option');
            option.innerText = item.name;
            option.setAttribute('value', item.id);
            if(selectedCategory && item.id == selectedCategory.id) {
                option.selected = true;
            }
            options[item.id] = option;
            element.appendChild(option);
        });
        container.appendChild(element);
        return element;
    };

    var updateHandler = function updateHandler(e){
        var id = e.target.value,
            categoryElement = categoryCollection.find(id);
        selectedCategoryChanged(categoryElement);
    }

    var setSelected = function setSelected(newSelectedCategory){
        if(selectedCategory){
            options[selectedCategory.id].selected = false;
        }
        selectedCategory = newSelectedCategory;
        options[selectedCategory.id].selected = true;
    }

    var selectedChanged = function selectedChanged(callback){
        selectedCategoryChanged = callback;
    }


    element.addEventListener("change", updateHandler, false);

    return {
        render: render,
        setSelected: setSelected,
        selectedChanged: selectedChanged
    };
};

module.exports = CategoryView;
},{}],13:[function(require,module,exports){
var NotificationView = function ( container, observer ) {

    var render = function (msg) {
        var element = document.createElement("div"),
            button = document.createElement('button');

        element.setAttribute('class', 'errorMsg');
        element.innerText = msg;
        button.setAttribute('class', 'close');
        button.innerText = 'X';
        element.appendChild(button);
        container.appendChild(element);
        return element;
    };

    observer.register('/notice', function(msg){
        render(msg);
    });
    
};

module.exports = NotificationView;
},{}],14:[function(require,module,exports){
var ProductView = function ( container, observer ) {

    var productNodes = {};

    var render = function (productCollection) {
        // It'd be better to use a templating library for this
        // but I'm manually creating DOM elements for simplicity
        while(container.firstChild){
            container.firstChild.remove();
        }
        productNodes = {};
        if(productCollection && productCollection.length > 0) {
            productCollection.forEach(function(product){
                var element = document.createElement('li'),
                    name = document.createElement('span'),
                    price = document.createElement('span'),
                    action = document.createElement('input');

                name.innerText = product.name;
                price.innerText = product.price;
                action.setAttribute('type', 'button');
                action.setAttribute('value', 'Delete');
                action.setAttribute('class', 'deleteBtn');
                action.productId = product.id;
                element.appendChild(name);
                element.appendChild(price);
                element.appendChild(action);
                container.appendChild(element);
                productNodes[action.productId] = {element: element}
            });
        }
        
    };

    var removeHandler = function removeHandler(e){
        if (e.target && e.target.matches("input.deleteBtn")) {
            //productNodes[e.target.productId].element.remove();
            //delete productNodes[e.target.productId];
            observer.publish('/delete-product', e.target.productId);
        }
    }

    container.addEventListener("click", removeHandler, false);

    return {
        render: render
    };

};

module.exports = ProductView;
},{}]},{},[1]);
