var ProductView = function ( container ) {

    var render = function (productCollection) {
        // It'd be better to use a templating library for this
        // but I'm manually creating DOM elements for simplicity
        while(container.firstChild){
            container.firstChild.remove();
        }
        productCollection.forEach(function(product){
            var element = document.createElement('li'),
                name = document.createElement('span'),
                price = document.createElement('span'),
                action = document.createElement('input');

            name.innerText = product.name;
            price.innerText = product.price;
            action.setAttribute('type', 'button');
            action.setAttribute('value', 'Delete');
            action.setAttribute('className', 'deleteBtn');
            action.productId = product.id;
            element.appendChild(name);
            element.appendChild(price);
            element.appendChild(action);
            container.appendChild(element);
        });
        
    };

    var removeHandler = function removeHandler(e){
        if (e.target && e.target.matches("input.deleteBtn")) {
            alert(e.target.productId);
        }
    }

    container.addEventListener("click", removeHandler, false);


    var deleteItem = function deleteItem() {
        if(element.parentElement){
            text.remove();
            action.remove();
            element.remove();
            text = null;
            action = null;
            element = null;
            action.removeEventListener('click', removeHandler, false);
        }
    };

    var updateItem = function updateItem() {
        if(element.parentElement){
            text.innerText();
            action.remove();
            element.remove();
            text = null;
            action = null;
            element = null;
            action.removeEventListener('click', removeHandler, false);
        }
    };

    return {
        render: render
    };

};

module.exports = ProductView;