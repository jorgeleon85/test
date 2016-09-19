var PubSub = require('../util/PubSub');

function CategoryCollection () {

	var collection = [];

	var add = function addCategory(id, name, description, products){
		collection.push({id: id, name: name, description: description, products: products});
	}

	var load = function loadCategory(data, products){
		data.forEach(function(ele){
			add(ele.id, ele.name, ele.description, products.findAll(ele.products).sort(function(a, b){
				return a.price - b.price;
			}));
		})
	}

	var get = function getCategory(index){
		return collection[index];
	}

	var print = function print(){
		console.log(collection);
	}

	return {
		add: add,
		load: load,
		items: collection,
		print: print,
		get: get
	};
}

module.exports = CategoryCollection;
