var counter = (function () {
    // Event manager (see backbone.js for a "real" implementation)
    //   .on(event_string,callback)
    //   .trigger(event,data)
    function EventManager() {
	var handlers = {};   // maps event_string -> list of callbacks

	// arrange for callback when event_string is triggered
	function on(event_string,callback) {
	    // current list of callbacks for this event_string
	    var cblist = handlers[event_string];

	    // ah, first time event_string has been mentioned
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
    //   on(event_string.callback)
    //   increment()		  // increment counter value
    //     -- triggers "increment" event with updated value as data
    //   value = get_count()      // returns current counter value
    function Model() {
	var count = 0;
	var event_handlers = EventManager();

	function increment() {
	    count += 1;
	    event_handlers.trigger("increment",count);
	}

	function get_count() {
	    return count;
	}
	
	return {on: event_handlers.on, increment: increment, get_count: get_count};
    }

    // exports:
    //   increment()		// call to process increment request
    function Controller(model) {
	function increment() {
	    // not much logic to handling this user input :)
	    model.increment();
	}

	return { increment: increment };
    }


    // exports:
    //   none
    function View(div,model,controller,color) {
	// user a simple div containing text to display counter value
	var display = $('<div class="view">The current value of the counter is <span>0</span>.</div>');
	var counter_value = display.find('span');
	display.css("background-color",color || "white");
	div.append(display);
	update_display(model.get_count());

	// update display when model changes
	function update_display(value) {
	    counter_value.text(value);
	}
	model.on("increment",update_display);

	return {};
    }


    function setup(div) {
	var model = Model();
	var controller = Controller(model);
	var view = View(div,model,controller);
	var view2 = View(div,model,controller,'#E0FFE0');

	var button = $('<button>Increment</button>');
	button.on("click",controller.increment);
	div.append(button);
    }

    // items accessible to outsiders
    return { setup: setup };
}());


$(document).ready(function() {
    $('.counter').each(function() {
	    counter.setup($(this));
    });
});
