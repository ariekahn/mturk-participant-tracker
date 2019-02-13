const event = require("events");

class myEvent extends event {}

const myEventObject = new myEvent();

myEventObject.on("namedEvent", function() {
    console.log("Called namedEvent in myEventObject's attached listener");
});

myEventObject.emit("namedEvent");
