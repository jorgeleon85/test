'use strict';

/**
 * View to control category data in a select
 * @param {DOM Element} container: select DOM element to contain the options
 * @param {object} observer: pub/sub instance to publish category changes
 * @returns {Object} public methods to the view: register,
 */
var CategoryView = function(container, observer) {

    var categoryCollection = null, // reference to category model
        selectedCategory = null; // current category selected

    var render = function(collection) {
        
        // remove old items from category dropdown
        categoryCollection = collection;
        while (container.firstChild) {
            container.firstChild.remove();
        }

        // iterate over category items and populate category dropdown
        categoryCollection.items().forEach(function(item) {
            var option = document.createElement('option');
            option.innerText = item.name;
            option.setAttribute('value', item.id);
            container.appendChild(option);
        });

        // pre-select the current category
        if(selectedCategory) {
            container.value = selectedCategory.id;
        }

        return container;
    };

    // update the current category after changed in the dropdown
    var updateHandler = function updateHandler(e) {
        var id = e.target.value,
            categoryElement = categoryCollection.find(id);
        observer.publish('/category-changed', categoryElement);
    }

    // update category if changed from outside
    var setSelected = function setSelected(newSelectedCategory) {
        selectedCategory = newSelectedCategory;
        if(selectedCategory){
            container.value = selectedCategory.id;
        }
    }

    // bind changes from category dropdown
    container.addEventListener("change", updateHandler, false);

    // export public api
    return {
        render: render,
        setSelected: setSelected
    };
};

module.exports = CategoryView;