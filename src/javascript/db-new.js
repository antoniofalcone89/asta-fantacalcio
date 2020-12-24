const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://falconea:fg5247549n@fantacalcio-app.fygqx.mongodb.net/dbtest?retryWrites=true&w=majority";
let client;

function connect() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            if (err) {
                reject(err);
            } else {
                client = db;
                resolve(db);
            }
        });
    });
}

function getRoomData() {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("room1").find().toArray(function (err, result) {
                if (err) throw reject(err);
                console.log("getRoomData ok");
                resolve(result);
            });
    });
}

function updateBid(value, utente, calciatore) {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("room1")
            .updateOne({ roomId: 'fantaciutt' },
                { '$set': { 'astaAttuale': value, 'migliorOfferente': utente, 'calciatore': calciatore } },
                function (err, result) {
                    if (err) throw reject(err);
                    console.log("bid updated");
                    resolve(result);
                });
    });
}

function updateOpenLayer(value) {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("room1")
            .updateOne({ roomId: 'fantaciutt' },
                { '$set': { 'isRandomLayerOpen': value } },
                function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                });
    });
}

function updateGiocatoriInAsta(value) {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("room1")
            .updateOne({ roomId: 'fantaciutt' },
                { '$set': { 'giocatoriInAsta': value } },
                function (err, result) {
                    if (err) throw reject(err);
                    console.log("giocatoriInAsta updated");
                    resolve(result);
                });
    });
}

function insertPlayers(data) {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("giocatori").insertMany(data, function (err, result) {
                if (err) throw reject(err);
                resolve(result);
            });
    });
}

function insertAssegnato(utente, player, valore) {
    return new Promise(function (resolve, reject) {
        const filter = { user: utente };
        const options = { upsert: true };
        client.db("asta-fantacalcio")
            .collection("liste-assegnati")
            .updateOne(filter, { '$addToSet': { "asteVinte": { "giocatore": player, "costo": valore } } }, options, function (err, result) {
                if (err) throw reject(err);
                resolve(result);
            });
    });
}

function removeAssegnato(utente, player) {
    return new Promise(function (resolve, reject) {
        const filter = { user: utente };
        client.db("asta-fantacalcio")
            .collection("liste-assegnati")
            .updateOne(filter,
                { $pull: { 'asteVinte': { giocatore: player } } }
                , function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                });
    });
}

function getAsteVinteUtente(utente) {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("liste-assegnati").findOne({ "user": utente }, function (err, result) {
                if (err) throw reject(err);
                resolve(result);
            });
        db.close();
    });
}

function getCreditiUtenti() {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("liste-assegnati").find({}, { projection: { crediti: 1, user: 1, _id: 0 } }).toArray(function (err, result) {
                if (err) throw reject(err);
                resolve(result);
            });
        db.close();
    });
}

function updateCreditiUtente(user, creditiUtilizzati) {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("liste-assegnati")
            .findOneAndUpdate(
                { "user": user },
                { $inc: { "crediti": -creditiUtilizzati } },
                function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                }
            )
        db.close();
    });
}

function aggiungiCreditiUtente(user, creditiUtilizzati) {
    return new Promise(function (resolve, reject) {
        client.db("asta-fantacalcio")
            .collection("liste-assegnati")
            .findOneAndUpdate(
                { "user": user },
                { $inc: { "crediti": creditiUtilizzati } },
                function (err, result) {
                    if (err) throw reject(err);
                    resolve(result);
                }
            )
        db.close();
    });
}

function close(db) {
    if (db) {
        db.close();
    }
}

let db = {
    connect: connect,
    close: close,
    getRoomData: getRoomData,
    updateGiocatoriInAsta: updateGiocatoriInAsta,
    updateBid: updateBid,
    updateOpenLayer: updateOpenLayer,
    insertAssegnato: insertAssegnato,
    removeAssegnato: removeAssegnato,
    getAsteVinteUtente: getAsteVinteUtente,
    getCreditiUtenti: getCreditiUtenti,
    updateCreditiUtente: updateCreditiUtente,
    aggiungiCreditiUtente: aggiungiCreditiUtente,
    insertPlayers: insertPlayers
}

module.exports = db;