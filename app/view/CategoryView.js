'use strict';

var CategoryView = function(container, observer) {

    var element = document.createElement("select"),
        categoryCollection = null,
        selectedCategory = null,
        selectedCategoryChanged = function() {},
        options = {};

    element.setAttribute('id', 'productCategory')

    var render = function(_categoryCollection) {
        categoryCollection = _categoryCollection;
        while (element.firstChild) {
            element.firstChild.remove();
        }
        options = {};

        categoryCollection.items().forEach(function(item) {
            var option = document.createElement('option');
            option.innerText = item.name;
            option.setAttribute('value', item.id);
            if (selectedCategory && item.id == selectedCategory.id) {
                option.selected = true;
            }
            options[item.id] = option;
            element.appendChild(option);
        });
        container.appendChild(element);
        return element;
    };

    var updateHandler = function updateHandler(e) {
        var id = e.target.value,
            categoryElement = categoryCollection.find(id);
        observer.publish('/category-changed', categoryElement);
    }

    var setSelected = function setSelected(newSelectedCategory) {
        if (selectedCategory) {
            options[selectedCategory.id].selected = false;
        }
        selectedCategory = newSelectedCategory;
        options[selectedCategory.id].selected = true;
    }

    element.addEventListener("change", updateHandler, false);

    return {
        render: render,
        setSelected: setSelected
    };
};

module.exports = CategoryView;