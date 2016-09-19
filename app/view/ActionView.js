var ActionView = function ( observer ) {

    var productName = document.getElementById('productName'),
        productDescription = document.getElementById('productDescription'),
        productPrice = document.getElementById('productPrice'),
        addAction = document.getElementById('add'),
        resetAction = document.getElementById('reset');

    var addHandler = function addHandler(){
        observer.publish('/new-product', {name: productName.value, description: productDescription.value, price: productPrice.value});
    }

    var resetHandler = function resetHandler(){
        observer.publish('/reset');
    }

    addAction.addEventListener("click", addHandler, false);
    resetAction.addEventListener("click", resetHandler, false);

};

module.exports = ActionView;