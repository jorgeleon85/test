(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// load service dependencies
var CategoryService = require('./service/CategoryService');
var ProductService = require('./service/ProductService');

// load model dependencies
var CategoryCollection = require('./model/CategoryCollection');
var ProductCollection = require('./model/ProductCollection');

// load view dependencies
var CategoryView = require('./view/CategoryView');
var ProductView = require('./view/ProductView');
var ActionView = require('./view/ActionView');
var NotificationView = require('./view/NotificationView');

// observer (publish/register) implementation
var Observer = require('./util/PubSub');

// util library to do multiple ajax request
var wait = require('./util/Wait');

/**
 * Controller constructor to load category informacion and proxy the Cache functionality
 * @constructor
 * @returns {Object} the current module and list of all dependencies
 */

var indexController = (function() {

    // initialize observer
    var observer = new Observer(),
        // initialize services
        categoryService = new CategoryService(),
        productService = new ProductService(),
        // initialize collections  with no data
        categoryCollection = new CategoryCollection(),
        productCollection = new ProductCollection(),
        // initialize views
        categoryView = new CategoryView(
        document.getElementById('categoryContainer'),
        observer),
        productView = new ProductView(
        document.getElementById('productContainer'),
        document.getElementById('totalContainer'),
        observer),
        actionView = new ActionView(observer),
        notificationView = new NotificationView(
        document.getElementById('noticeContainer'),
        observer),
        // reference to the current category selected in the category dropdown
        currentCategory = null,
        // function to load or reload data
        loadAndRender;

    observer.register('/reset', function() {
        // reload all data
        loadAndRender();
    });

    observer.register('/new-product', function(data) {
        // add new product to current category and re-render product view
        if(currentCategory) {
            currentCategory.add(data.name, data.description, data.price);
            productView.render(currentCategory.products);
        } else {
            observer.publish('/notice', "Can not add a product if no category is selected");
        }
    });

    observer.register('/delete-product', function(id) {
        // remove product from current category and re-render product view
        currentCategory.remove(id);
        productView.render(currentCategory.products);
    });

    observer.register('/category-changed', function(newCurrentCategory){
        // current category was changed, update reference and re-render product view
        currentCategory = newCurrentCategory;
        productView.render(currentCategory.products);
    });

    observer.register('/flush', function(newCurrentCategory){
        // flush cache used by services, next refresh will have to execute new ajax calls
        categoryService.flush();
        productService.flush();
    });

    loadAndRender = function loadAndRender() {
        // load both product and category services simultaneously
        wait(
            [productService.get(), categoryService.get()],
            function(successData, errorMsg) {

                // all services were completed though any could have failed
                if (successData[0]) {
                    // successData[0] has data, service was successful, load products
                    productCollection.load(successData[0]);
                } else if (errorMsg[0]) {
                    productCollection.load([]);
                    // successData[0] has no data, it means productService failed,
                    // error should be in errorMsg[0] so notify of error and not load data
                    observer.publish('/notice', errorMsg[0]);
                }

                if (successData[1]) {
                    // successData[1] has data, service was successful, load categories
                    categoryCollection.load(successData[1], productCollection);
                } else if (errorMsg[1]) {
                    // successData[1] has no data, it means categoryService failed,
                    // error should be in errorMsg[1] so notify of error and not load data
                    categoryCollection.load([], productCollection);
                    observer.publish('/notice', errorMsg[1]);
                }

                // render category view with given data
                categoryView.render(categoryCollection);

                if (!currentCategory) {
                    // first time loading data, choose the first category as selected by default
                    currentCategory = categoryCollection.get(0);
                } else {
                    // data was reloaded so there's already a current category,
                    // update current category with data from category collection in case of changes
                    currentCategory = categoryCollection.find(currentCategory.id);
                }

                if (currentCategory) {
                    // current category can still be null if category service failed or has no data
                    // re-render products only if there's category data
                    categoryView.setSelected(currentCategory);
                    productView.render(currentCategory.products);
                } else {
                    productView.render([]);
                }
            });
    };

    // load and render by default the first time
    loadAndRender();

    // return module and dependencies
    return {
        module: indexController,
        dependencies: [
            observer,
            categoryService,
            productService,
            categoryCollection,
            productCollection,
            categoryView,
            productView,
            actionView,
            notificationView,
            currentCategory,
            loadAndRender
        ]
    };

})();

module.exports = indexController;
},{"./model/CategoryCollection":2,"./model/ProductCollection":3,"./service/CategoryService":4,"./service/ProductService":6,"./util/PubSub":9,"./util/Wait":10,"./view/ActionView":11,"./view/CategoryView":12,"./view/NotificationView":13,"./view/ProductView":14}],2:[function(require,module,exports){
'use strict';

/**
 * Collection factory for category information
 * @returns {Object} an object with public methods: add, load, find, items, get
 */

function CategoryCollection() {

    var scope = {
        collection: []
    }

    // public function to add a new category
    var add = function addCategory(id, name, description, products) {
        scope.collection.push({
            id: id,
            name: name,
            description: description,
            products: products,
            // public function to add a new product in current category
            add: function(name, description, price) {
                var self = this;
                // append new product to end of collection
                self.products.push({
                    id: nextId(self.products),
                    name: name,
                    description: description,
                    price: price
                });
                // re-sort products after insertion
                self.products = self.products.sort(sort);
            },
            remove: function(id) {
                // remove a product by id from the current category item
                var self = this;
                self.products = self.products.filter(function(e) {
                    return e.id != id
                });
            }
        });
    }

    // public sorting function by price, internally used after loading of inserting products
    var sort = function sort(a, b) {
        return a.price - b.price;
    }

    // populate data collection with raw data provided from the category service
    var load = function loadCategory(data, products) {

        // empty the current collection to prevent duplicated items
        scope.collection = [];

        // if data is an array, iterate through it and fill the collection
        if (data && data.length > 0) {
            data.forEach(function(ele) {
                add(ele.id, ele.name, ele.description, products.findAll(ele.products).sort(sort));
            });
        }
    }

    // public function to find a specific category by id
    var find = function find(id) {
        return scope.collection.find(function(ele) {
            return ele.id.toString() === id.toString();
        })
    }

    // public function to get a category item by position
    var get = function getCategory(index) {
        return scope.collection[index];
    }

    // get the next available id from the product list
    // by getting the current max + 1
    var nextId = function nextId(products) {
        if (products.length === 0) {
            return 1;
        } else {
            return Math.max.apply(null, products.map(function(e) {
                return e.id
            })) + 1;
        }
    }

    // callback to pass the underlying collection
    var items = function() {
        return scope.collection;
    }

    // export public api
    return {
        add: add,
        load: load,
        find: find,
        items: items,
        get: get
    };
}

module.exports = CategoryCollection;
},{}],3:[function(require,module,exports){
'use strict';

/**
 * Collection factory for product information
 * @returns {Object} an object with public methods: add, load,
 *                   findAll, items, nextId
 */

function ProductCollection() {

    var scope = {
        collection: []
    }

    // public function to add a new category
    function add(id, name, description, price) {
        scope.collection.push({
            id: id,
            name: name,
            description: description,
            price: price
        });
    }

    // populate data collection with raw data provided from the category service
    var load = function load(data) {
        scope.collection = [];
        if (data && data.length > 0) {
            data.forEach(function(item) {
                add(item.id, item.name, item.description, item.price);
            });
        }
    }

    // public function to get an array of products given an array of one or more ids
    var findAll = function findAll(ids) {
        if (ids && ids.length > 0) {
            return scope.collection.filter(function(item) {
                return ids.indexOf(item.id) !== -1
            });
        } else {
            return [];
        }
    }

    // get the next available id from the product list
    // by getting the current max + 1
    var nextId = function nextId() {
        if (scope.collection.length === 0) {
            return 1;
        } else {
            return Math.max.apply(null, scope.collection.map(function(e) {
                return e.id
            })) + 1;
        }
    }

    // callback to pass the underlying collection
    var items = function() {
        return scope.collection;
    }

    // export public api
    return {
        add: add,
        load: load,
        findAll: findAll,
        items: items,
        nextId: nextId
    };
}

module.exports = ProductCollection;
},{}],4:[function(require,module,exports){
'use strict';

/**
 * Service constructor to load category informacion and proxy the Cache functionality
 * @returns {Object} an object with methods get and flush
 */


var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

var CategoryService = function(){

	// instantiate a low level service wrapped in a cache proxy
	var service = new HttpCache(JSONService(XMLHttpRequest));

	// public get method to encapsulate service request
	var get = function get(){
		return service.request('services/categories');
	}

	// public flush method to release items from service cache
	var flush = function flush(){
		service.flush();
		return true;
	}

	// export public api
	return {
		get: get,
		flush: flush
	}
}

module.exports = CategoryService;
},{"../util/HttpCache":8,"./JSONService":5}],5:[function(require,module,exports){
'use strict';

/**
 * Low level service implementation for AJAX functionality
 * @constructor
 * @param {function} XMLHttpRequest object or mockup for unit testing
 * @returns {function, function}
 */

var JSONService = function(Request) {

    // low level function to actually execute the ajax request
    var request = function(endpoint, options) {

        var doneCallback = null,
            doneData = null,
            errorCallback = null,
            errorData = null,
            defer = null,
            request,

        // defer object used with ajax response to allow async execution
        defer = {
            done: function doneFunction(callback) {
                doneCallback = callback;
                if (doneCallback && doneData) {
                    doneCallback(doneData);
                }
                return defer;
            },
            error: function errorFunction(callback) {
                errorCallback = callback;
                if (callback && errorData) {
                    errorCallback(errorData);
                }
                return defer;
            }
        };

        // will always use GET by default, but can be configured to use other methods
        options = options || {};
        options.method = options.method || 'GET';

        // standard AJAX request code
        request = new Request();
        request.open(options.method, endpoint, true);
        request.onreadystatechange = function onreadystatechange() {
            if (this.readyState == 4 && this.status == 200) {
                
                // request is ready and successful
                var data = null,
                    isValid = true;

                try {
                    // parse retrieved data to JSON and catch syntax errors
                    data = JSON.parse(this.responseText);
                } catch (e) {
                    isValid = false;
                }

                if (isValid) {
                    // execute done in refer object to indicate successful request
                    doneData = data;
                    doneCallback && doneCallback(data);
                } else {
                    // execute fail in refer object and specify syntax error
                    errorData = "There was a problem parsing data from endpoint "+endpoint+", please check data syntax and try again using reset button";
                    errorCallback && errorCallback(errorData);
                }
            } else if (this.readyState == 4 && this.status >= 300) {
                // request ready but failed for some reason
                errorData = "There was a problem getting data from the endpoint "+endpoint+", please try again using reset button";
                errorCallback && errorCallback(errorData);
            }
        };
        // execute request and return defer object
        request.send();
        return defer;
    }

    // method to flush cache, required by HttpProxy interface
    var flush = function flush(){
        // returns false because flush was not successful
        return false;
    };

    // export public api
    return {
        request: request,
        flush: flush
    }
};

module.exports = JSONService;
},{}],6:[function(require,module,exports){
'use strict';

var JSONService = require('./JSONService'),
	HttpCache = require('../util/HttpCache');

/**
 * Service constructor to load category informacion and proxy the Cache functionality
 * @constructor
 * @returns {Object} an object with methods get and flush
 */
var ProductService = function(){

	// instantiate a low level service wrapped in a cache proxy
	var service = new HttpCache(JSONService(XMLHttpRequest));

	// public get method to encapsulate service request
	var get = function get(){
		return service.request('services/products');
	}

	// public flush method to release items from service cache
	var flush = function flush(){
		service.flush();
		return true;
	}

	// export public api
	return {
		get: get,
		flush: flush
	}
}

module.exports = ProductService;
},{"../util/HttpCache":8,"./JSONService":5}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
'use strict';

var Defer = require('./DeferHelper');
/**
 * Cache library used as proxy of JSONService, will cache data from the done
 * callback, but NOT the error callback
 * @param {function} Service: internal low-level service instance
                     passed as depencency for unit test mock
 * @param {object} newOptions: cache configuration for type of storage and ttl
 * @returns {Object} defer object with done and error methods
 */
var HttpCache = function(Service, newOptions) {

    newOptions = newOptions || {};

    // default cache options
    var options = {
        // use localStorage by default
        storage: newOptions.storage || window.localStorage,
        // time-to-live for data in cache in miliseconds, default to 5 minutes
        ttl: newOptions.ttl || 5 * 60 * 1000
    }

    // proxy request to internal service request with 
    var request = function request(endpoint, options) {
        var cached = lookup(endpoint),
            doneData = null,
            errorData = null,
            doneCallback = null,
            errorCallback = null;

        if (cached) {
            // if data was found in cache, return it in a mocked defer
            return Defer(cached, null);
        }

        // execute internal service request with the same parameters
        Service.request(endpoint, options)
            .done(function(data) {
                // save success data from cache
                save(endpoint, data);
                // return mockup defer object with data from request
                doneData = data;
                doneCallback && doneCallback(doneData);
            })
            .error(function(data) {
                // return mockup defer object with error from request
                // and NOT cache it
                errorData = data;
                errorCallback && errorCallback(errorData);
            })


        // mockup defer object with chaining
        var obj = {
            done: function(callback) {
                doneCallback = callback;
                if (doneCallback && doneData) {
                    callback(doneData);
                }
                return obj;
            },
            error: function(callback) {
                errorCallback = callback;
                if (errorCallback && errorData) {
                    errorCallback(errorData);
                }
                return obj;
            }
        }
        return obj;
    }

    // recover data from cache and only return it if ttl is respected
    var lookup = function lookup(key) {

        // load data from cache
        var now = new Date().getTime(),
            saved = options.storage.getItem(key),
            data;

        if (saved) {
            // if data was found it is parsed
            data = JSON.parse(saved);
            if (options.ttl > now - data.timestamp) {
                // time-to-leave was respected, return data
                return data.payload;
            } else {
                // data is expired, remove it from cache
                options.storage.removeItem(key);
            }
        }
        return null;
    }

    // save data to cache with a timestamp to control expiration
    var save = function save(key, data) {
        try {
            // parse data to string and save it to cache
            // use try/catch in case of cache full or security constraint
            options.storage.setItem(key, JSON.stringify({
                timestamp: new Date().getTime(),
                payload: data
            }));
        } catch (e) {
            return false;
        }
        return true;
    }

    // flush data from cache
    var flush = function flush(){
    	options.storage.clear();
    }

    // exported api
    return {
        request: request,
        lookup: lookup,
        save: save,
        flush: flush
    }
}

module.exports = HttpCache;
},{"./DeferHelper":7}],9:[function(require,module,exports){
'use strict';

/**
 * Custom observer implementation that uses publish/register methods
 * @returns {Object} public methods to the observer: register,
 *                   publish and release
 */
var PubSub = function PubSub() {

    // list of channels
    var channels = {};

    // register a subscriber to a channel
    var register = function(channel, callback) {
        if (!channels[channel]) {
            channels[channel] = [];
        }
        channels[channel].push(callback);
    }

    // remove a subscripber from a given channel
    var release = function(channel, callback) {
        if (channels[channel]) {
            channels[channel] = channels[channel].filter(function(element) {
                return element !== callback
            });
        }
    }

    // publish a message to a channel
    var publish = function(channel, data) {
        if (channels[channel]) {
            channels[channel].forEach(function(client) {
                client(data);
            });
            return true;
        } else {
            return false;
        }
    }

    // export public api
    return {
        publish: publish,
        register: register,
        release: release
    }
};

module.exports = PubSub;
},{}],10:[function(require,module,exports){
'use strict';

/**
 * Utititly to wait for several requests simultaneously
 * @param {array} services: pub/sub instance
 * @param {function} callback: executes with two arrays:
 *      Array 1: has an entry with the successful result of each service in the same order
 *      Array 2: has an entry with the error result of each service in the same order
 */
var Wait = function Wait(services, callback) {

    var toLoad = services.length, // countdown to amount of services expected
        responses = [], // list of data from success responses
        errors = []; // list of data from error responses

    services
        .forEach(function(service, index) {
            
            // executes the defer methods (done, error) from all the services
            service
                .done(function(data) {
                    // set the success data in the same position it was passed to this function
                    responses[index] = data;
                    if (--toLoad === 0) {
                        // if countdown is down to zero execute callback with success and error response
                        callback(responses, errors);
                    }
                })
                .error(function(msg) {
                    // set the error data in the same position it was passed to this function
                    errors[index] = msg;
                    if (--toLoad === 0) {
                        // if countdown is down to zero execute callback with success and error response
                        callback(responses, errors);
                    }
                })
        });
}

module.exports = Wait;
},{}],11:[function(require,module,exports){
'use strict';

/**
 * View container actions such as add product, reset button and flush cache
 * @param {function} observer: pub/sub instance
 */
var ActionView = function ( observer ) {

    // lookup node elements for input and actions
    var productName = document.getElementById('productName'),
        productDescription = document.getElementById('productDescription'),
        productPrice = document.getElementById('productPrice'),
        addAction = document.getElementById('add'),
        resetAction = document.getElementById('reset'),
        flushAction = document.getElementById('flush');

    // create message to add a new product
    var addHandler = function addHandler(){
        observer.publish('/new-product', {name: productName.value, description: productDescription.value, price: productPrice.value});
    }

    // create message to have data reset
    var resetHandler = function resetHandler(){
        observer.publish('/reset');
    }

    // create message for flushing cache
    var flushHandler = function flushHandler(){
        observer.publish('/flush');
    }

    // bind events to add products, reset data and flush cache
    addAction.addEventListener("click", addHandler, false);
    resetAction.addEventListener("click", resetHandler, false);
    flushAction.addEventListener("click", flushHandler, false);
};

module.exports = ActionView;
},{}],12:[function(require,module,exports){
'use strict';

/**
 * View to control category data in a select
 * @param {DOM Element} container: select DOM element to contain the options
 * @param {object} observer: pub/sub instance to publish category changes
 * @returns {Object} public methods to the view: register,
 */
var CategoryView = function(container, observer) {

    var categoryCollection = null, // reference to category model
        selectedCategory = null; // current category selected

    var render = function(collection) {
        
        // remove old items from category dropdown
        categoryCollection = collection;
        while (container.firstChild) {
            container.firstChild.remove();
        }

        // iterate over category items and populate category dropdown
        categoryCollection.items().forEach(function(item) {
            var option = document.createElement('option');
            option.innerText = item.name;
            option.setAttribute('value', item.id);
            container.appendChild(option);
        });

        // pre-select the current category
        if(selectedCategory) {
            container.value = selectedCategory.id;
        }

        return container;
    };

    // update the current category after changed in the dropdown
    var updateHandler = function updateHandler(e) {
        var id = e.target.value,
            categoryElement = categoryCollection.find(id);
        observer.publish('/category-changed', categoryElement);
    }

    // update category if changed from outside
    var setSelected = function setSelected(newSelectedCategory) {
        selectedCategory = newSelectedCategory;
        if(selectedCategory){
            container.value = selectedCategory.id;
        }
    }

    // bind changes from category dropdown
    container.addEventListener("change", updateHandler, false);

    // export public api
    return {
        render: render,
        setSelected: setSelected
    };
};

module.exports = CategoryView;
},{}],13:[function(require,module,exports){
'use strict';

/**
 * View show notifications for errors
 * @param {DOM Element} container: node to show messages to users
 * @param {object} observer: pub/sub instance to publish category changes
 * @returns {Object} public methods to the view: render
 */
var NotificationView = function(container, observer) {

    // render an event to the 
    var render = function(msg) {
        var element = document.createElement("div");

        // append a message to the container
        element.setAttribute('class', 'errorMsg');
        element.innerText = msg;
        container.appendChild(element);

        // remove notice after 10 seconds
        setTimeout(function(){
            element.remove();
        }, 10000);

        return element;
    };

    // listen for notice notifications and render them
    observer.register('/notice', function(msg) {
        render(msg);
    });

    // export public api
    return {
        render: render
    };

};

module.exports = NotificationView;
},{}],14:[function(require,module,exports){
'use strict';

/**
 * View to control category data in a select
 * @param {DOM Element} container: select DOM element to contain the options
 * @param {object} observer: pub/sub instance to publish category changes
 * @returns {Object} public methods to the view: render
 */
var ProductView = function ( container, totalContainer, observer ) {

    // It'd be better to use a templating library for this
    // but I'm manually creating DOM elements for simplicity
    var render = function (productCollection) {
        
        // remove all current products from container first
        while(container.firstChild){
            container.firstChild.remove();
        }

        // iterate over products in the category and add those to the container
        if(productCollection && productCollection.length > 0) {
            productCollection.forEach(function(product){
                var element = document.createElement('li'),
                    name = document.createElement('span'),
                    text = document.createElement('span'),
                    description = document.createElement('span'),
                    price = document.createElement('span'),
                    action = document.createElement('a');

                name.innerText = product.name;
                price.innerText = product.price;
                description.innerText = product.description;
                name.setAttribute('class', 'products__item__name'),
                price.setAttribute('class', 'products__item__price'),
                element.setAttribute('class', 'products__item'),
                text.setAttribute('class', 'products__texts'),
                
                action.innerText = 'Delete';
                action.setAttribute('class', 'deleteBtn');
                action.setAttribute('href', '#');
                description.setAttribute('class', 'products__item__tooltiptext');
                
                action.productId = product.id;
                text.appendChild(name);
                text.appendChild(price);
                element.appendChild(text);
                element.appendChild(action);
                element.appendChild(description);
                container.appendChild(element);
            });

            if(totalContainer) {
                var total = productCollection.length;
                if(total > 1){
                    totalContainer.innerText = total.toString() + " items in the list";
                } else {
                    totalContainer.innerText = total.toString() + " item in the list";
                }
            }
            
        } else {
            totalContainer.innerText = "0 items in the list";
        }
        
    };

    // publish message to delete a product
    // uses event delegation to add handler once to the container
    var removeHandler = function removeHandler(e){
        if (e.target && e.target.matches(".deleteBtn")) {
            observer.publish('/delete-product', e.target.productId);
        }
        e.preventDefault();
    }

    // bind remove function to delete inputs
    container.addEventListener("click", removeHandler, false);

    // export public api
    return {
        render: render
    };

};

module.exports = ProductView;
},{}]},{},[1]);
