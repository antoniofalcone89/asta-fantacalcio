const $ = require("jquery");

socket.on("counter", function(count, timing) {
    let isNumber = Number.isInteger(count);
    $(".timer").text(count);

    if(count === "END") {
        fineAsta();
        assegnaGiocatore();
        $(".miglior-offerente").addClass("winner");
        let winner = $(".miglior-offerente").text();
        let crediti = $(".bid-attuale").text();
        socket.emit("update giocatori in asta", []);
        socket.emit("aggiorna crediti giocatore", winner, crediti);
    }

    if(isNumber) {
        $(".timer").removeClass("end");        
        $(".timer").addClass("playing");
    } else {
        $(".timer").addClass("end");        
        $(".timer").removeClass("playing");        
    }
});

socket.on("reset vincitore asta", function () {
    $(".miglior-offerente").text("");
    $(".miglior-offerente").removeClass("winner");
});

socket.on("reset bid", function () {
    $(".bid-attuale").text("0");
});

socket.on("update giocatore chiamato", function (calciatore) {
    $(".calciatore-attuale").text(calciatore);
    $(".miglior-offerente").removeClass("winner");
});

socket.on("open random layer", function () {
    $(".random-player").addClass("disabled");
});

socket.on("close random layer", function () {
    $(".random-player").removeClass("disabled");
});

socket.on("get random player", function (player) {
    console.log(player);
    $(".result").text(player.Nome);
    $(".calciatore-attuale").text(player.Nome);
    $(".miglior-offerente").text("");
    $(".miglior-offerente").removeClass("winner");

    setTimeout(function() {
        $(".get-giocatore-layer .close").click();
    }, 1000);

    socket.emit("reset bid", player.Nome);
});

socket.on("update room data", function (data) {
    const astaAttuale = data.astaAttuale;
    const migliorOfferente = data.migliorOfferente;
    const calciatore = data.calciatore;
    
    $(".bid-attuale").text(astaAttuale);
    $(".miglior-offerente").text(migliorOfferente);
    $(".calciatore-attuale").text(calciatore);

    if(data.isRandomLayerOpen) {
        $(".random-player").addClass("disabled");
    } else {
        $(".random-player").removeClass("disabled");
    }
});

socket.on("get giocatori asta", function (giocatoriArray) {
    let giocatoriInAsta = $.map($(".giocatori-asta p"), $.text);
    giocatoriArray.forEach(function(element) {
        if(!giocatoriInAsta.includes(element)) {
            $(".giocatori-asta ul").append(`<li><p class="${element}">${element}</p></li>`);
            $(`.${element}`).find("input").prop('disabled', false);
            $(`.${element}`).find(".rilancia").prop('disabled', false);
            $(`.${element}`).addClass("in-asta");
        }
    });
});

socket.on("update crediti utenti", function (data) {
    data.forEach(element => {
        let user = element.user;
        let crediti = element.crediti;
        $(`.${user} .crediti`).text(crediti);
    });
});

socket.on("reset giocatori asta", function () {
    fineAsta();
    $(".timer").text("TIMER");
});

const fineAsta = () => {
    $("input").prop('disabled', true);
    $(".rilancia").prop('disabled', true);

    $(".giocatori-asta ul li").each((i, elem) => {
        $(elem).remove();
    });
    $(".utente").removeClass("in-asta");
}

const assegnaGiocatore = () => {
    let giocatore = $(".calciatore-attuale").text();
    let valore = parseInt($(".bid-attuale").text());
    let migliorOfferente = $(".miglior-offerente").text();

    let data = {
        giocatore : giocatore,
        valore : valore,
        migliorOfferente : migliorOfferente
    }

    socket.emit("assegna giocatore", data);
}

export default fineAsta;