'use strict';

var CategoryService = require('./service/CategoryService');
var ProductService = require('./service/ProductService');
var CategoryCollection = require('./model/CategoryCollection');
var ProductCollection = require('./model/ProductCollection');
var CategoryView = require('./view/CategoryView');
var ProductView = require('./view/ProductView');
var ActionView = require('./view/ActionView');
var NotificationView = require('./view/NotificationView');
var Observer = require('./util/PubSub');
var wait = require('./util/Wait');

var indexController = (function() {

    var observer = new Observer(),
        categoryService = new CategoryService(),
        productService = new ProductService(),
        categoryCollection = new CategoryCollection(),
        productCollection = new ProductCollection(),
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
        currentCategory = null,
        loadAndRender;

    observer.register('/reset', function() {
        loadAndRender();
    });

    observer.register('/new-product', function(data) {
        currentCategory.add(data.name, data.description, data.price);
        productView.render(currentCategory.products);
    });

    observer.register('/delete-product', function(id) {
        currentCategory.remove(id);
        productView.render(currentCategory.products);
    });

    observer.register('/category-changed', function(newCurrentCategory){
        currentCategory = newCurrentCategory;
        productView.render(currentCategory.products);
    });

    observer.register('/flush', function(newCurrentCategory){
        categoryService.flush();
        productService.flush();
    });

    loadAndRender = function loadAndRender() {

        wait(
            [productService.get(), categoryService.get()],
            function(successData, errorMsg) {

                if (successData[0]) {
                    productCollection.load(successData[0]);
                } else if (errorMsg[0]) {
                    observer.publish('/notice', errorMsg[0]);
                }

                if (successData[1]) {
                    categoryCollection.load(successData[1], productCollection);
                } else if (errorMsg[1]) {
                    observer.publish('/notice', errorMsg[1]);
                }

                categoryView.render(categoryCollection);

                if (currentCategory === null) {
                    currentCategory = categoryCollection.get(0);
                } else {
                    currentCategory = categoryCollection.find(currentCategory.id);
                }

                if (currentCategory) {
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