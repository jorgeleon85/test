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