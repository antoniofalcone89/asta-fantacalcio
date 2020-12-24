//routes.js
//initialize express router
const router = require('express').Router();
const db = require("./db-new");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var jsonParser = bodyParser.urlencoded({ extended: true });

//set default API response
router.get('/test', function (req, res) {
    res.json({
        status: 'API Works',
        message: 'Welcome to FirstRest API'
    });
});

router.get("/astevinte/:user", (req, res) => {
    let utente = req.params.user;
    db.getAsteVinteUtente(utente).then(function (data) {
        res.json({
            status: 'Ok',
            message: 'getAsteVinteUtente API',
            data: data
        });
    });
});

// router.post("/aggiornacreditiutente", jsonParser, (req, res) => {
//     let user = req.body.utente;
//     let crediti = req.body.crediti;
//     console.log("aggiorno crediti utente");
//     db.updateCreditiUtente(user, crediti).then(function (result) {
//         console.log("crediti aggiornati utente :: " + user + " crediti :: -" + crediti);
//     });
// });

router.post("/assegnagiocatore", jsonParser, (req, res) => {
    let utente = req.body.utente;
    let valore = req.body.valore;
    let giocatore = req.body.giocatore;
    console.log("aggiorno crediti utente");
    db.insertAssegnato(utente, giocatore, valore).then(function (result) {
        console.log("giocatore assegnato");
    });
});

router.post("/removeassegnato", jsonParser, (req, res) => {
    let utente = req.body.utente;
    let giocatore = req.body.giocatore;
    console.log("aggiorno crediti utente");
    db.insertAssegnato(utente, giocatore).then(function (result) {
        console.log("rimosso giocatore da lista utente :: " + utente);
    });
});

router.post("/aggiungicrediti", jsonParser, (req, res) => {
    let utente = req.body.utente;
    let crediti = req.body.crediti;
    console.log("aggiorno crediti utente");
    db.aggiungiCreditiUtente(utente, crediti).then(function (result) {
        console.log("crediti aggiunti utente :: " + utente + " crediti :: +" + crediti);
    });
});


//Export API routes
module.exports = router;