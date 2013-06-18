var knapsack = (function () {
    // implement Observable interface
    function Observers() {
	var observers = [];

	// add a new callback function to the list of observers
	function add(observer) {
	    observers.push(observer);
	}

	// remove observer from list
	function remove(observer) {
	    var i = observers.indexOf(observer);
	    if (i != -1) observers.splice(i,1);
	}

	// invoke each callback with message argument
	function notify(message) {
	    for (var i = 0; i < observers.length; i += 1) {
		observers[i](message);
	    }
	}

	return {add: add, remove: remove, notify: notify};
    }


    // exports:
    //   add_observer(observer)   // call observer("increment") when counter increments
    //   move_item(item)          // change item location from house to knapsack or vice versa
    //   value = get_items()
    //   value = knapsack_weight()
    //   value = knapsack_value()
    function Model(items,knapsack_max) {
	var observers = Observers();
	var knapsack_weight = 0;
	var knapsack_value = 0;

	// run through list of items and initialize location to "house"
	function reset() {
	    for (var item_name in items) items[item_name].location = "house";
	    knapsack_value = 0;
	    knapsack_weight = 0;
	    observers.notify("item moved");
	}

	// return true if move was okay, false if knapsack capacity exceeded
	function move_item(item) {
	    if (item.location == "house") {
		if (knapsack_weight + item.weight > knapsack_max)
		    return false;
		item.location = "knapsack";
		knapsack_weight += item.weight;
		knapsack_value += item.value;
	    }
	    else {
		item.location = "house";
		knapsack_weight -= item.weight;
		knapsack_value -= item.value;
	    }
	    observers.notify("item moved");
	}

	function get_items() { return items; }
	function knapsack_value() { return knapsack_value; }
	function knapsack_weight() { return knapsack_value; }

	return {add_observer: observers.add,
		reset: reset,
		move_item: move_item,
		get_items: get_items,
		knapsack_weight: knapsack_weight,
		knapsack_value: knapsack_value };
    }

    // exports:
    //   increment()		// call to process increment request
    function Controller(model) {
	function item_clicked(item) {
	    if (!model.move_item(item)) {
		// oops, knapsack overflow!
	    }
	}

	function reset() {
	    model.reset();
	}

	return { item_clicked: item_clicked, reset: reset }
    }


    // exports:
    //   none
    function View(div,model,controller) {
	// set up house display
	var house = $('<div class="location"><div class="header">House</div><div class="items"></div><div class="footer">Click item to move to knapsack</div></div>');
	var house_items = house.find('.items');

	// set up knapsack display
	var knapsack = $('<div class="location"><div class="header">Knapsack</div><div class="items"></div><div class="footer">Click item to move to house</div></div>');
	var knapsack_items = knapsack.find('.items');

	div.append(house,knapsack);
	position_items();

	// set up item display for house and knapsack using model info
	function position_items() {
	    // clear out both locations
	    house_items.empty();
	    knapsack_items.empty();

	    // now add items back to their current location
	    var items = model.get_items();
	    for (var item_name in items) {
		var item = items[item_name];
		if (item.location == "house") house_items.append(item.image);
		else knapsack_items.append(item.image);
	    }
	}

	// handle notifications from the model
	function notify(message) {
	    if (message == "item moved") position_items();
	}
	model.add_observer(notify);

	return {};
    }


    function setup(div) {
	// extract item list from div body
	var items = {};
	div.find('img').each(function () {
		var image = $(this);
		var name = image.attr('data-name');
		var value = parseFloat(image.attr('data-value'));
		var weight = parseFloat(image.attr('data-weight'));
		items[name] = {image: image, name: name, value: value, weight: weight};
		image.addClass('item');  // let css set image dimensions, etc.
	    });
	div.empty();  // clear it out!

	var model = Model(items,parseFloat(div.attr('data-maxweight')));   // max weight in knapsack: 20
	var controller = Controller(model);
	var view = View(div,model,controller);

	// clicking on image invokes controller
	for (var item_name in items) {
	    var item = items[item_name];
	    item.image.on("click",
			  function (event) { console.log('img click');}, // controller.item_clicked(event.data); },
			  item);
	}

	model.reset();
    }

    // items accessible to outsiders
    return { setup: setup };
}());


$(document).ready(function() {
    $('.knapsack').each(function() {
	    knapsack.setup($(this));
    });
});
