const express = require("express");
const path = require("path");
const socket = require("socket.io");
const port = process.env.PORT || 8080;
const app = express();
const server = app.listen(port);
const db = require("./src/javascript/db-new");
const quotazioni = require("./src/javascript/quotazioni");
const apiRoutes = require("./src/javascript/routes");
let giocatoreAssegnato = 0;
let creditiAggiornati = 0;
let giocatoreInLista = 0;

let clients = [];

let AstaCountdown, portieri, difensori, attaccanti, centrocampisti;

// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname + "/dist"));

app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/api', apiRoutes);

// send the user to index html page inspite of the url
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname + "/dist", "index.html"));
});

//quotazioni
quotazioni.getQuotazioni("quotazioni.csv")
  .then(data => {
    portieri = quotazioni.filterQuotazioni(data, "P");
    difensori = quotazioni.filterQuotazioni(data, "D");
    attaccanti = quotazioni.filterQuotazioni(data, "A");
    centrocampisti = quotazioni.filterQuotazioni(data, "C");
});

// Socket setup
const io = socket(server, {
  pingTimeout: 60000
});

let timerIsPlaying = false;

const initRoom = () => {
  db.connect().then(function() {
    console.log("connected to mongodb");
    getRoomDataFromDB();
    getGiocatoriAsta();
    getCreditiUtenti();
  });
}

io.on("connection", function (socket) {
  console.log("Made socket connection");
  initRoom();
  let clientsCount = socket.client.conn.server.clientsCount;
  console.log(clientsCount + " users connected");
  updateClients(clientsCount);
  clients.push(socket.id);

  socket.on('disconnect', function() {
    let clientsCount = socket.client.conn.server.clientsCount;
    updateClients(clientsCount);
    console.log("client disconnect -- " + clientsCount + " users connected");
  });
    
  socket.on('play timer', () => {
    console.log("play timer");
    if(!timerIsPlaying) {
      countDown(socket);
    }
  });
    
  socket.on('reset bid', (player) => {
    console.log("reset bid");
    io.sockets.emit("reset bid");    
    mongoUpdateBid(0, "", player);
  });
    
  socket.on('assegna giocatore', (data) => {
    if(giocatoreInLista === 0) {
      giocatoreInLista = 1;
      console.log("assegna giocatore", data.migliorOfferente, data.giocatore, data.valore);
      assignFineAsta(data.migliorOfferente, data.giocatore, data.valore);
    }
  });  
    
  socket.on('remove giocatore assegnato', (utente, giocatore) => {
    console.log("remove giocatore assegnato", utente, giocatore);
    removeAssegnato(utente, giocatore);
  });  
    
  socket.on('aggiorna crediti giocatore', (user, crediti) => {
    if(creditiAggiornati === 0) {
      creditiAggiornati = 1;
      console.log("aggiorna crediti giocatore", user, crediti);
      updateCreditiUtente(user, crediti);
    }
  });  
    
  socket.on('aggiorna crediti utenti', () => {
    console.log("aggiorna crediti utenti");
    getCreditiUtenti();
  });  
    
  socket.on('aggiungi crediti giocatore', (user, crediti) => {
    console.log("aggiungi crediti giocatore", user, crediti);
    aggiungiCreditiUtente(user, crediti);
  });  
    
  socket.on('update giocatore chiamato', (data) => {   
    console.log("update giocatore chiamato");
    mongoUpdateBid(data.astaAttuale, data.migliorOfferente, data.calciatore);
    mongoUpdateGiocatori([]);
    io.sockets.emit("reset bid"); 
    io.sockets.emit("reset vincitore asta");
    io.sockets.emit("update giocatore chiamato", data.calciatore); 
  });
    
  socket.on('get random player', (ruolo) => {
    console.log("getRandomPlayer:: " + ruolo);
    const player = getRandomPlayer(ruolo);
    io.sockets.emit("get random player", player);
  });

  socket.on('update giocatori in asta', (giocatori) => {
    console.log("aggiorno giocatori in asta");
    mongoUpdateGiocatori(giocatori);
    io.sockets.emit("get giocatori asta", giocatori);        
  });

  socket.on('open random layer', () => {
    console.log("open random layer");    
    updateOpenLayer(true);
    io.sockets.emit("open random layer");
  });

  socket.on('close random layer', () => {
    console.log("close random layer");  
    updateOpenLayer(false);
    io.sockets.emit("close random layer");
  });

  socket.on('rilancio event', data => {
    console.log('rilancio');
    giocatoreAssegnato = 0;
    creditiAggiornati = 0;
    giocatoreInLista = 0;
    
    clearInterval(AstaCountdown);
    countDown(socket);

    io.sockets.emit("update room data", data);    
    mongoUpdateBid(data.astaAttuale, data.migliorOfferente, data.calciatore);
  });

  socket.on('reset data', data => {
    console.log('reset all');
    
    clearInterval(AstaCountdown);

    io.sockets.emit("update room data", data);    
    mongoUpdateBid(data.astaAttuale, data.migliorOfferente, data.calciatore);
    mongoUpdateGiocatori([]);
    io.sockets.emit("reset giocatori asta");
  });
});

const countDown = () => {
  let counter = 15;
  AstaCountdown = setInterval(function(){
    io.sockets.emit("counter", counter);
    counter--;
    if (counter === -1) {
      io.sockets.emit("counter", "END");
      clearInterval(AstaCountdown);
      timerIsPlaying = false;
    }
  }, 1000);
}

const getRandomPlayer = (ruolo) => {
  let result;
  let index, giocatore;
  switch(ruolo) {
    case("attaccante"):
      index = Math.floor(Math.random() * attaccanti.length);
      giocatore = attaccanti[index];
      attaccanti.splice(index, 1);
      console.log("new array length:: " + attaccanti.length);
      console.log("pick player index:: " + index, " player:: " + giocatore.Nome);
      result = giocatore;
      break;
    case("portiere"):
      index = Math.floor(Math.random() * portieri.length);
      giocatore = portieri[index];
      portieri.splice(index, 1);
      console.log("new array length:: " + portieri.length);
      console.log("pick player index:: " + index, " player:: " + giocatore.Nome);
      result = giocatore;
    break;
    case("difensore"):
      index = Math.floor(Math.random() * difensori.length);
      giocatore = difensori[index];
      difensori.splice(index, 1);
      console.log("new array length:: " + difensori.length);
      console.log("pick player index:: " + index, " player:: " + giocatore.Nome);
      result = giocatore;
    break;
    case("centrocampista"):
      index = Math.floor(Math.random() * centrocampisti.length);
      giocatore = centrocampisti[index];
      centrocampisti.splice(index, 1);
      console.log("new array length:: " + centrocampisti.length);
      console.log("pick player index:: " + index, " player:: " + giocatore.Nome);
      result = giocatore;
    break;
  }
  return result;
}

const updateClients = (count) => {
  console.log("updateClients");
  io.sockets.emit("update clients", count);
}

const mongoUpdateBid = (puntata, utente, calciatore) => {
  console.log("puntata ::: " + puntata);
  db.updateBid(puntata, utente, calciatore);
}

const updateOpenLayer = (value) => {
  db.updateOpenLayer(value);
}

const getRoomDataFromDB = () => {
  db.getRoomData().then(function(roomInfo) {
    console.log("get room data and update clients");    
    io.sockets.emit("update room data", roomInfo[0]);
  });
}

const assignFineAsta = (utente, giocatore, valore) => {
  db.insertAssegnato(utente, giocatore, valore).then(function() {
    console.log("giocatore assegnato");
  });
}

const removeAssegnato = (utente, giocatore) => {
  db.removeAssegnato(utente, giocatore).then(function() {
    console.log("rimosso giocatore da lista utente :: " + utente);
  });
}

const updateCreditiUtente = (user, crediti) => {
  if(giocatoreAssegnato === 0) {
    db.updateCreditiUtente(user, crediti).then(function() {
      giocatoreAssegnato = 1;
      console.log("crediti aggiornati utente DA NON FARE :: " + user + " crediti :: -" + crediti);
      getCreditiUtenti();
    });
  }
  
}

const aggiungiCreditiUtente = (user, crediti) => {
  db.aggiungiCreditiUtente(user, crediti).then(function(result) {
    console.log("crediti aggiunti utente :: " + user + " crediti :: +" + crediti);
    getCreditiUtenti();
  });
}

const getCreditiUtenti = () => {
  db.getCreditiUtenti().then(function(result) {
    console.log("get crediti utente");
    io.sockets.emit("update crediti utenti", result);
  });
}

const getGiocatoriAsta = async () => {
  db.getRoomData().then(function(roomInfo) {
    const giocatori = roomInfo[0].giocatoriInAsta;
    console.log("giocatori in asta", giocatori);
    io.sockets.emit("get giocatori asta", giocatori);
  });
}

const mongoUpdateGiocatori = (giocatori) => {
  console.log("update giocatori in asta");
  db.updateGiocatoriInAsta(giocatori);
}