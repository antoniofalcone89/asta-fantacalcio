const $ = require("jquery");
const _ = require("underscore");
import Swal from 'sweetalert2';

import "../sass/style.scss";
import fineAsta from "./client";
import "./setupUtenti";
import "./random-player";

$(".number").on("keypress", function () {
    return event.charCode >= 48 && event.charCode <= 57;
});

$(".timer-playpause").on("click", function () {
    let timerIsPlaying = $(".timer").hasClass("playing");
    if (!timerIsPlaying) {
        socket.emit("play timer");
        return;
    }
});

$('.calciatore-attuale').on('blur', function () {
    let giocatore = $(this).text();
    console.log("chiamato giocatore :: " + giocatore);
    let data = {
        astaAttuale: 0,
        migliorOfferente: "",
        calciatore: giocatore
    }
    socket.emit("update giocatore chiamato", data)
});

$(".calciatore-attuale").on('keydown', function (e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        $('.calciatore-attuale').blur()
    }
});

$(".random-player").on("click", function () {
    $(".get-giocatore-layer").addClass("is-open");
    socket.emit("open random layer");
});

$(".get-giocatore-layer .close").on("click", function () {
    $(".get-giocatore-layer").removeClass("is-open");
    socket.emit("close random layer");
});

$(".reset-all").on("click", function () {
    let data = {
        astaAttuale: 0,
        migliorOfferente: "",
        calciatore: "GIOCATORE"
    }
    fineAsta();
    $(".miglior-offerente").removeClass("winner");
    $(".timer").text("TIMER");
    socket.emit("reset data", data);
});

$("body").on("click", ".rimuovi-giocatore", function () {
    let utente = $(".liste-layer").attr("user");
    let giocatore = $(this).parents("li").find(".giocatore-in-lista").text();
    let crediti = parseInt($(this).parents("li").find(".crediti-giocatore-assegnato").text());
    let $element = $(this).parents("li");

    Swal.fire({
        title: 'Sei sicuro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'No, annulla',
        confirmButtonText: 'Si, veloc!'
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit("remove giocatore assegnato", utente, giocatore);
            socket.emit("aggiungi crediti giocatore", utente, crediti);
            $element.detach();
            Swal.fire(
                'Fatto',
                'Giocatore eliminato dalla tua lista',
                'success'
            )
        }
    });
});

$(".plus-button").on("click", function () {
    Swal.mixin({
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2']
    }).queue([
        {
            title: 'Nome giocatore'
        },
        'Crediti'
    ]).then((result) => {
        let utente = $(".liste-layer").attr("user");
        let creditiUtente = parseInt($(`.${utente} .crediti`).text());

        if (result.value.includes("")
            || isNaN(parseInt(result.value[1]))
            || !isNaN(parseInt(result.value[0]))) {
            Swal.fire({
                title: 'Error!',
                text: 'Riempi correttamente tutti i campi',
                icon: 'error',
                confirmButtonText: 'Ve bun'
            });
            return;
        };

        let crediti = parseInt(result.value[1]);
        if (crediti > creditiUtente) {
            Swal.fire({
                title: 'Error!',
                text: 'Non hai abbastanza crediti',
                icon: 'error',
                confirmButtonText: 'Ve bun'
            });
            return;
        }

        if (result.value) {
            let giocatore = result.value[0];

            let data = {
                migliorOfferente: utente,
                giocatore: giocatore,
                valore: crediti
            }

            socket.emit("aggiorna crediti giocatore", utente, crediti);
            socket.emit("assegna giocatore", data);

            $(".lista-container ul").append(
                `<li>
                    <button class="rimuovi-giocatore"></button>
                    <span class="giocatore-in-lista">${giocatore}</span>
                    <span class="crediti-giocatore-assegnato">${crediti}</span>
                </li>`
            )

            const answers = JSON.stringify(result.value)
            Swal.fire({
                title: 'Fatto!',
                html: `
              Hai inserito:
              <pre><code>${answers}</code></pre>
            `,
                confirmButtonText: 'Tvb!'
            })
        }
    });
});

$(".comandi .rilancia").on("click", function () {
    const $pressedButton = $(this);
    const utente = $pressedButton.parents(".utente").find(".nome").text();
    const rilancio = $pressedButton.prev("input").val();
    const calciatore = $(".calciatore-attuale").text();
    const puntataAttuale = parseInt($(".bid-attuale").text());
    const creditiUtente = parseInt($pressedButton.parents(".utente").find(".crediti").text());

    if (rilancio <= puntataAttuale) {
        Swal.fire({
            title: 'Error!',
            text: 'La migliore offerta attuale è superiore o uguale a quella che hai inserito',
            icon: 'error',
            confirmButtonText: 'Ve bun'
        });
        return;
    }

    if (rilancio > creditiUtente) {
        Swal.fire({
            title: 'Error!',
            text: 'Non hai abbastanza crediti',
            icon: 'error',
            confirmButtonText: 'Ve bun'
        });
        return;
    }

    if (rilancio >= 500) {
        Swal.fire({
            title: 'Error!',
            text: 'Limite 500, cretino',
            icon: 'error',
            confirmButtonText: 'Ve bun'
        });
        return;
    }

    let data = {
        astaAttuale: rilancio,
        migliorOfferente: utente,
        calciatore: calciatore
    }
    socket.emit("rilancio event", data);
});

$(".comandi-rapidi .rilancia").on("click", function () {
    const $pressedButton = $(this);
    const increment = parseInt($pressedButton.attr("increment"));
    const utente = $pressedButton.parents(".utente").find(".nome").text();
    const calciatore = $(".calciatore-attuale").text();
    const puntataAttuale = parseInt($(".bid-attuale").text());
    const creditiUtente = parseInt($pressedButton.parents(".utente").find(".crediti").text());
    const rilancio = puntataAttuale + increment;

    if (rilancio > 500) {
        Swal.fire({
            title: 'Error!',
            text: 'Con il rilancio si supera il limite di 500',
            icon: 'error',
            confirmButtonText: 'Ve bun'
        });
        return;
    }

    if (rilancio > creditiUtente) {
        Swal.fire({
            title: 'Error!',
            text: 'Non hai abbastanza crediti',
            icon: 'error',
            confirmButtonText: 'Ve bun'
        });
        return;
    }

    let data = {
        astaAttuale: rilancio,
        migliorOfferente: utente,
        calciatore: calciatore
    }

    socket.emit("rilancio event", data);
});

function getAsteVinte(utente) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/api/asteVinte/${utente}`,
            type: 'GET',
            success: function (data) {
                resolve(data)
            },
            error: function (error) {
                reject(error)
            },
        })
    })
}

const setAsteVinte = (data) => {
    if (!data) {
        $(".liste-layer").addClass("is-open");
        $("html").addClass("lockScroll");
        $("aside").addClass("locked");
        return;
    }

    let lista = data.asteVinte;
    lista.forEach(elem => {
        $(".lista-container ul").append(
            `<li>
                <button class="rimuovi-giocatore"></button>
                <span class="giocatore-in-lista">${elem.giocatore}</span>
                <span class="crediti-giocatore-assegnato">${elem.costo}</span>
            </li>`
        )
    });
    $(".liste-layer").addClass("is-open");
    $("aside").addClass("locked");
}

$(".nome").on("click", function () {
    $(".lista-container ul").empty();
    let user = $(this).text();
    getAsteVinte(user).then((result) => {
        $(".liste-layer").attr("user", user);
        setAsteVinte(result.data);
    });
});

$(".overlay").on("click", function () {
    $(".layer .close").click();
});

$(".liste-layer .close").on("click", function () {
    $(".liste-layer").removeClass("is-open");
    $("html").removeClass("lockScroll");
    $("aside").removeClass("locked");
    $(".liste-layer").attr("user", "");
});

$(".book").on("click", function () {
    let $this = $(this);
    let $utente = $this.parents(".utente");
    $utente.find("input").prop('disabled', function (i, v) { return !v; });
    $utente.find(".rilancia").prop('disabled', function (i, v) { return !v; });
    $utente.toggleClass("in-asta");

    let giocatoriArray = giocatoriInAsta($utente);
    socket.emit("update giocatori in asta", giocatoriArray);
});

const giocatoriInAsta = ($giocatore) => {
    let nome = $giocatore.find(".nome").text();
    let giocatoriInAsta = $.map($(".giocatori-asta p"), $.text);
    let updatedList;

    let isInGame = giocatoriInAsta.includes(nome);
    if (isInGame) {
        updatedList = giocatoriInAsta.filter(function (value, index, giocatoriInAsta) { return value != nome; });
        $(`aside .${nome}`).remove();
        $(`.${nome}`).find("input").prop('disabled', true);
        $(`.${nome}`).find(".rilancia").prop('disabled', true);
        $(`.${nome}`).removeClass("in-asta");
        return updatedList;
    } else {
        giocatoriInAsta.unshift(nome);
        return giocatoriInAsta;
    }
};