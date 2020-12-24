const CSVToJSON = require('csvtojson');
const path = require("path");
const db = require("./db-new");
const _ = require("underscore");

const getQuotazioni = async (file) => {
    try {
        console.log(path.join(__dirname, "..", "quotazioni",  file));
        const filepath = path.join(__dirname, '..',  "quotazioni", file);
        return CSVToJSON().fromFile(filepath);
    } catch (err) {
        console.log(err);
    }
}

const filterQuotazioni = (object, ruolo) => {
    var result = _.filter(object, function(item) {
        return item.R == ruolo
    });
    console.log(result.length + " quotazioni caricate ruolo " + ruolo);
    return result;
}

const insertQuotazioni = () => {
    getQuotazioni("quotazioniA.csv")
    .then(data => {
        db.insertPlayers(data)
        .then(function(result) {
            console.log(result);
        })
        .catch(err => console.log(err));
    });
}

// insertQuotazioni();

let quotazioni = {
    getQuotazioni : getQuotazioni,
    filterQuotazioni : filterQuotazioni
}

module.exports = quotazioni;
