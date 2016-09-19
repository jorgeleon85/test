var ItemView = function ( ItemModel, Controller, Container ) {

    var element = document.createElement( "li" ),
        text = document.createElement('span'),
        action = document.createElement('input');

    var render = function () {
        // It'd be better to use a templating library for this
        // but I'm manually creating DOM elements for simplicity
        text.innerText = ItemModel.name;
        action.setAttribute('type', 'button');
        action.setAttribute('value', 'Delete');
        element.appendChild(text);
        element.appendChild(action);
        Container.appendChild(element);
    };

    var removeHandler = function removeHandler(){

    }

    action.addEventListener("click", removeHandler, false);


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
        delete: deleteItem
    };

};