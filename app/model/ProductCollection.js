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