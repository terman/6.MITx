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
	    return true;
	}

	function get_items() { return items; }
	function get_value() { return knapsack_value; }
	function get_weight() { return knapsack_weight; }

	return {add_observer: observers.add,
		reset: reset,
		move_item: move_item,
		get_items: get_items,
		get_weight: get_weight,
		get_value: get_value };
    }

    // exports:
    //   add_observer()
    //   increment()		// call to process increment request
    function Controller(model) {
	var observers = Observers();

	function item_clicked(item) {
	    if (!model.move_item(item)) {
		// oops, knapsack overflow!
		observers.notify("knapsack overflow");
	    }
	}

	function reset() {
	    model.reset();
	}

	return { add_observer: observers.add, item_clicked: item_clicked, reset: reset }
    }


    // exports:
    //   none
    function View(div,model,controller) {
	// add alert, initially transparent (and hence invisible)
	var alert = $('<div class="alert">Oops! Knapsack capacity exceeded</div>');
	div.append(alert);

	// add captions to each image
	var items = model.get_items();
	for (var item_name in items) {
	    var item = items[item_name];
	    var idiv = $('<div class="item"></div>');
	    idiv.append(item.image);
	    idiv.append($('<br>'));
	    idiv.append('$'+item.value+', '+item.weight+'kg');
	    item.image[0].item = item;    // provide info for click hanlder
	    item.image = idiv;
	}

	// attach click handler to top-most div, since moving DOM objects on and off
	// page clears any event bindings
	div.on("click",function(event) {
		controller.item_clicked(event.target.item);
	    });

	// set up house display
	var house = $('<div class="location"><div class="header"><img src="house.png"></div><div class="items"></div><div class="footer">Click item to move to knapsack</div></div>');
	var house_items = house.find('.items');

	// set up knapsack display
	var knapsack = $('<div class="location"><div class="header"><img src="burglar.png">($<span id="value">0</span>, <span id=weight>0</span>kg)</div><div class="items"></div><div class="footer">Click item to move to house</div></div>');
	var knapsack_items = knapsack.find('.items');
	var weight = knapsack.find('#weight');
	var value = knapsack.find('#value');

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
	    weight.text(model.get_weight());
	    value.text(model.get_value());
	}

	// make alter visible for 3 seconds
	function show_alert() {
	    alert.animate({opacity: 1},1000);
	    alert.animate({opacity: 1},1000); // pause
	    alert.animate({opacity: 0},1000);
	}

	// handle notifications from the model, controller
	function notify(message) {
	    if (message == "item moved") position_items();
	    if (message == "knapsack overflow") show_alert();
	}
	model.add_observer(notify);
	controller.add_observer(notify);

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
		var item = {image: image, name: name, value: value, weight: weight};
		items[name] = item;
	    });
	div.empty();  // clear it out!

	var model = Model(items,parseFloat(div.attr('data-maxweight')));   // max weight in knapsack: 20
	var controller = Controller(model);
	var view = View(div,model,controller);

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
