const $ = require("jquery");

let utenti = ["Falco", "Ditullo", "Beps", 
    "Leo", "Boca", "Roberto",
    "Paolone" ,"Alessandro", "Digre", "Carbone"];

utenti.forEach(function(utente, index) {
    $("main").append(`
        <div class="utente usr-${index+1} ${utente}">
        <div class="nome-crediti-container">
            <button class="nome">${utente}</button>
            <span class="crediti">500</span>
        </div>
        <div class="utente-wrapper">
        <div class="comandi">
            <button class="book">
            <span>Asta</span>
            </button>
            <input type="number" class="rilancio"/>
            <button class="rilancia">
            Bid
            </button>
        </div>
        <div class="comandi-rapidi">
            <button class="rilancia" increment="1">+1</button>
            <button class="rilancia" increment="5">+5</button>
            <button class="rilancia" increment="10">+10</button>
        </div>
        </div>
    </div>
    `)
});


$("input").prop('disabled', true);
$(".rilancia").prop('disabled', true);

socket.on("update clients", function(count){
    $(".clients-count").text(count);
});
