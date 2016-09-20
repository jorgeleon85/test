'use strict';

/**
 * View to control category data in a select
 * @param {DOM Element} container: select DOM element to contain the options
 * @param {object} observer: pub/sub instance to publish category changes
 * @returns {Object} public methods to the view: render
 */
var ProductView = function ( container, observer ) {

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
            });
        }
        
    };

    // publish message to delete a product
    // uses event delegation to add handler once to the container
    var removeHandler = function removeHandler(e){
        if (e.target && e.target.matches("input.deleteBtn")) {
            observer.publish('/delete-product', e.target.productId);
        }
    }

    // bind remove function to delete inputs
    container.addEventListener("click", removeHandler, false);

    // export public api
    return {
        render: render
    };

};

module.exports = ProductView;