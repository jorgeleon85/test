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