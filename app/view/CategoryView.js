
var CategoryView = function ( container ) {

    var element = document.createElement("select"),
        selectedCategory = null,
        options = {};

    var render = function (categoryCollection) {
        while(container.firstChild){
            container.firstChild.remove();
        }
        categoryCollection.items.forEach(function(item){
            var option = document.createElement('option');
            option.innerText = item.name;
            option.setAttribute('value', item.id);
            if(item.id == selected.id) {
                option.selected = true;
            }
            options[item.id] = option;
            element.appendChild(option);
        });
        container.appendChild(element);
        return element;
    };

    var updateHandler = function updateHandler(){
        console.log('arguments', arguments);
    }

    var setSelected = function setSelected(newSelectedCategory){
        options[selectedCategory.id].selected = false;
        selectedCategory = newSelectedCategory;
        options[selectedCategory.id].selected = true;
    }


    element.addEventListener("change", updateHandler, false);

    return {
        render: render,
        setSelected: setSelected,
        selectedChanged: selectedChanged
    };
};

module.exports = CategoryView;