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
        currentCategory.add(data.name, data.description, data.price);
        productView.render(currentCategory.products);
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
                    observer.publish('/notice', errorMsg[1]);
                }

                // render category view with given data
                categoryView.render(categoryCollection);

                if (currentCategory === null) {
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
                }
            });
    };

    loadAndRender();

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