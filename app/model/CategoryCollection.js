'use strict';

/**
 * Collection factory for category information
 * @constructor
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

    // public api
    return {
        add: add,
        load: load,
        find: find,
        items: items,
        addProduct: addProduct,
        get: get
    };
}

module.exports = CategoryCollection;