var knapsack = (function () {
    // Event manager (see backbone.js for a "real" implementation)
    //   .on(event_string,callback)
    //   .trigger(event,data)
    function EventManager() {
	var handlers = {};   // maps event_string -> list of callbacks

	// arrange for callback when event_string is triggered
	function on(event_string,callback) {
	    // current list of callbacks for this event_string
	    var cblist = handlers[event_string];

	    // ah, first time event_string has been mentioned;
	    if (cblist === undefined) {
		cblist = [];   // empty list
		handlers[event_string] = cblist;
	    }

	    // add callback to list
	    cblist.push(callback);
	}

	// call all the callbacks associated with event_string,
	// provide data as the argument
	function trigger(event_string,data) {
	    // current list of callbacks for this event_string
	    var cblist = handlers[event_string];

	    if (cblist !== undefined)
		for (var i = 0; i < cblist.length; i += 1)
		    cblist[i](data);
	}

	// externally accessible vars & functions
	return {on: on, trigger: trigger};
    }

    // exports:
    //   on(event_string,callback)  // add event handler
    //   reset()                  // move all items to house
    //      -- triggers "item moved" event
    //   move_item(item)          // change item location from house to knapsack or vice versa
    //      -- may trigger "item moved" event, with moved item as data
    //   value = get_items()
    //   value = knapsack_weight()
    //   value = knapsack_value()
    function Model(items,knapsack_max) {
	var event_handlers = EventManager();
	var knapsack_weight = 0;
	var knapsack_value = 0;

	// run through list of items and initialize location to "house"
	function reset() {
	    for (var item_name in items) items[item_name].location = "house";
	    knapsack_value = 0;
	    knapsack_weight = 0;
	    event_handlers.trigger("item moved");
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
	    event_handlers.trigger("item moved",item);
	    return true;
	}

	function get_items() { return items; }
	function get_value() { return knapsack_value; }
	function get_weight() { return knapsack_weight; }

	// externally accessible vars & functions
	return {on: event_handlers.on,
		reset: reset,
		move_item: move_item,
		get_items: get_items,
		get_weight: get_weight,
		get_value: get_value };
    }

    // exports:
    //   on(event_string,callback)
    //   item_clicked(item)     // signal item has been clicked
    //     -- may trigger "knapsack overflow" event with offending item as data
    //   reset()                // back to the initial state!
    function Controller(model) {
	var event_handlers = EventManager();

	function item_clicked(item) {
	    if (!model.move_item(item)) {
		// oops, knapsack overflow!
		event_handlers.trigger("knapsack overflow",item);
	    }
	}

	function reset() {
	    model.reset();
	}

	// externally accessible vars & functions
	return { on: event_handlers.on, item_clicked: item_clicked, reset: reset }
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

	// add them to .knapsack div
	div.append(house,knapsack);

	// items have changed location so (re)do item display for
	// house and knapsack using model info
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
	model.on("item moved",position_items);

	// knapsack overflow event
	function show_alert() {
	    // make alert visible for a total of 3 seconds
	    alert.animate({opacity: 1},1000);
	    alert.animate({opacity: 1},1000); // pause
	    alert.animate({opacity: 0},1000);
	}
	controller.on("knapsack overflow",show_alert);

	// externally accessible vars & functions
	return {};
    }

    // add appropriate internals to div.knapsack nodes in DOM
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

	var max_weight = parseFloat(div.attr('data-maxweight') || 20);
	var model = Model(items,max_weight);
	var controller = Controller(model);
	var view = View(div,model,controller);

	// initialize starting location for all items
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
