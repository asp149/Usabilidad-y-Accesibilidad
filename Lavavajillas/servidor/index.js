const os = require("os");
const path = require("path");
const Lavavajillas = require("./lavavajillas.js").Lavavajillas;
const httpServer = require("http").createServer();
const express = require("express");
const { exit } = require("process");

var debug = false;
var port = 8080;

for (let i = 2; i < process.argv.length; i++) {
    switch (process.argv[i]) {

        case "-v": debug = true; break;
        case "-p": port = parseInt(process.argv[++i]); break;
        default: console.error("Opción '" + process.argv[i] + "' incorrecta"); exit(1);
    }
}

console.log("\
---------------------------------------------------\n\
Usabilidad y Accesibilidad          Curso 2022-2023\n\
---------------------------------------------------\n\
");

console.log("Puerto:", port, "(puede cambiarse mediante la opción -p <puerto>)")
console.log("Mensajes:", debug ? "Activados" : "Desactivados (pueden activarse mediante la opción -v)")
console.log();
console.log("Acceso web:");
console.log(" - Emulador accesible en: http://SERVIDOR:" + port + "/emulador");
console.log(" - Interfaz accesible en: http://SERVIDOR:" + port + "/interfaz");
console.log();
console.log("SERVIDOR es la dirección IP o nombre de este equipo. Puede utilizar 'localhost' si accede de forma local.");
const ifaces = os.networkInterfaces();
for (var dev in ifaces) {
    ifaces[dev].forEach(function (details) {
        if (details.family == 'IPv4') {
            console.log(" - " + details.address + " (" + dev +")");
        }
    });
}
console.log();

var app = express();
httpServer.on("request", app);
app.use("/", express.static(path.resolve(__dirname, "../cliente")));

httpServer.listen(port, () => {
    console.log("Servidor iniciado y escuchando en puerto:", port);
    console.log("Pulse Control-C para parar el servidor.")
    new Lavavajillas(httpServer, debug);
});