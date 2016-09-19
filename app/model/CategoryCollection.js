'use strict';

function CategoryCollection() {

    var scope = {
        collection: []
    }

    var add = function addCategory(id, name, description, products) {
        scope.collection.push({
            id: id,
            name: name,
            description: description,
            products: products,
            add: function(name, description, price) {
                var self = this;
                self.products.push({
                    id: nextId(self.products),
                    name: name,
                    description: description,
                    price: price
                });
                self.products = self.products.sort(sort);
            },
            remove: function(id) {
                var self = this;
                self.products = self.products.filter(function(e) {
                    return e.id != id
                });
            }
        });
    }

    var addProduct = function addProduct(data, category) {
        category.products = category.products.push({
            id: nextId(category.products),
            name: data.name,
            description: data.description,
            price: data.price
        });
        category.products = category.products.sort(sort);
    }

    var sort = function sort(a, b) {
        return a.price - b.price;
    }

    var load = function loadCategory(data, products) {
        scope.collection = [];
        if (data && data.length > 0) {
            data.forEach(function(ele) {
                add(ele.id, ele.name, ele.description, products.findAll(ele.products).sort(sort));
            });
        }
    }

    var find = function find(id) {
        return scope.collection.find(function(ele) {
            return ele.id.toString() === id.toString();
        })
    }

    var get = function getCategory(index) {
        return scope.collection[index];
    }

    var nextId = function nextId(products) {
        if (products.length === 0) {
            return 1;
        } else {
            return Math.max.apply(null, products.map(function(e) {
                return e.id
            })) + 1;
        }
    }

    return {
        add: add,
        load: load,
        find: find,
        items: function() {
            return scope.collection
        },
        addProduct: addProduct,
        get: get
    };
}

module.exports = CategoryCollection;