'use strict';

var CategoryService = require('./service/CategoryService');
var ProductService = require('./service/ProductService');

var CategoryCollection = require('./model/CategoryCollection');
var ProductCollection = require('./model/ProductCollection');

var CategoryView = require('./view/CategoryView');
var ProductView = require('./view/ProductView');

var Wait = require('./util/Wait');

var Controller = (function() {

	var categoryService = CategoryService(),
		productService = ProductService(),
		categoryCollection = CategoryCollection(),
		productCollection = ProductCollection(),
		categoryView,
		ProductView,
		currentCategory;

	Wait([categoryService.get(), productService.get()], function(successData){
	
		productCollection.load(successData[1]);
		categoryCollection.load(successData[0], productCollection);

		productCollection.print();
		categoryCollection.print();

		categoryView = CategoryView(document.getElementById('categoryContainer'));
		categoryView.render(categoryCollection);

		currentCategory = categoryCollection.get(0);
		categoryView.setSelected(currentCategory);

		productView = ProductView(document.getElementById('productContainer'));
		productView.render(currentCategory.products);

		categoryView.selectedChanged(function(newCurrentCategory){
			currentCategory = newCurrentCategory;
			productView.render(currentCategory.products);
		});

	});

})();
