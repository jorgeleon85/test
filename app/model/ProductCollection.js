var PubSub = require('../util/PubSub');

function ProductCollection () {

	var collection = [];

	function add(id, name, description, price){
		collection.push({
			id: id,
			name: name,
			description: description,
			price: price
		});
	}

	var load = function load(data){
		data.forEach(function(item, index){
			add(item.id, item.name, item.description, item.price);
		});
	}

	var findAll = function findAll(ids){
		if(ids) {
			return collection.filter(function(item){
				return ids.indexOf(item.id) !== -1
			});
		} else {
			return [];
		}
	}

	var sort = function sort(){
		collection = collection.sort(function(a, b){
			return a.price - b.price;
		})
	}

	var print = function print(){
		console.log(collection);
	}

	return {
		add: add,
		load: load,
		findAll: findAll,
		print: print,
		items: collection
	};
}

module.exports = ProductCollection;