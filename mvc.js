var counter = (function () {
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
    //   increment()		  // increment counter value
    //   value = get_count()      // returns current counter value
    function CounterModel() {
	var count = 0;
	var observers = Observers();

	function increment() {
	    count += 1;
	    observers.notify("increment");
	}

	function get_count() {
	    return count;
	}
	
	return {add_observer: observers.add, increment: increment, get_count: get_count};
    }

    // exports:
    //   increment()		// call to process increment request
    function CounterController(model) {
	function increment() {
	    model.increment();
	}

	return { increment: increment };
    }


    // exports:
    //   none
    function CounterView(div,model,controller,color) {
	var display = $('<div class="view">The current value of the counter is <span>0</span>.</div>');
	var counter_value = display.find('span');
	display.css("background-color",color || "white");

	function update_display() {
	    counter_value.text(String(model.get_count()));
	}

	function notification(message) {
	    if (message == "increment") update_display();
	}

	model.add_observer(notification);

	div.append(display);
	update_display();

	return {};
    }


    function setup(div) {
	var model = CounterModel();
	var controller = CounterController(model);
	var view = CounterView(div,model,controller);
	var view2 = CounterView(div,model,controller,'#E0FFE0');

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
