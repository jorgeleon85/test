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