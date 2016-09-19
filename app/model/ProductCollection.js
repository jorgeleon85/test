var PubSub = require('../util/PubSub');

function ProductCollection () {

	var scope = {
		collection: []
	}

	function add(id, name, description, price){
		scope.collection.push({
			id: id,
			name: name,
			description: description,
			price: price
		});
	}

	var load = function load(data){
		scope.collection = [];
		if(data && data.length > 0) {
			data.forEach(function(item, index){
				add(item.id, item.name, item.description, item.price);
			});
		}
	}

	var findAll = function findAll(ids){
		if(ids) {
			return scope.collection.filter(function(item){
				return ids.indexOf(item.id) !== -1
			});
		} else {
			return [];
		}
	}

	var sort = function sort(){
		scope.collection = scope.collection.sort(function(a, b){
			return a.price - b.price;
		})
	}

	var print = function print(){
		console.log(scope.collection);
	}

	var nextId = function nextId(){
		if(scope.collection.length === 0){
			return 1;
		} else {
			return Math.max.apply(null, scope.collection.map(function(e){return e.id})) + 1;
		}
	}

	return {
		add: add,
		load: load,
		findAll: findAll,
		print: print,
		items: function(){ return scope.collection },
		nextId: nextId
	};
}

module.exports = ProductCollection;