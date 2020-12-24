const $ = require("jquery");

$(".random-attaccante").on("click", function() {
    socket.emit("get random player", "attaccante");
});

$(".random-difensore").on("click", function() {
    socket.emit("get random player", "difensore");
});

$(".random-centrocampista").on("click", function() {
    socket.emit("get random player", "centrocampista");
});

$(".random-portiere").on("click", function() {
    socket.emit("get random player", "portiere");
});