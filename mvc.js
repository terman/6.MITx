var counter = (function () {
    function Observers() {
	var observers = [];

	function add(observer) {
	    observers.push(observer);
	}

	function remove(observer) {
	    var i = observers.indexOf(observer);
	    if (i != -1) observers.splice(i,1);
	}

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
    function Model() {
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
    function Controller(model) {
	function increment() {
	    model.increment();
	}

	return { increment: increment };
    }


    // exports:
    //   none
    function View(div,model,controller) {
	var display = $('<p>The current value of the counter is <span>0</span>.</p>');
	var counter_value = display.find('span');

	var button = $('<button>Increment</button>');
	button.on("click",controller.increment);

	function update_display() {
	    counter_value.text(String(model.get_count()));
	}

	function notification(message) {
	    if (message == "increment") update_display();
	}

	model.add_observer(notification);

	div.append(display,button);
	update_display();

	return {};
    }


    function setup(div) {
	var model = Model();
	var controller = Controller(model);
	var view = View(div,model,controller);

	var view2 = View(div,model,controller);
    }

    // items accessible to outsiders
    return { setup: setup };
}());


$(document).ready(function() {
    $('.counter').each(function() {
	    counter.setup($(this));
    });
});
