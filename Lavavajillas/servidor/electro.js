// Librería Electro para el servidor (NO MOFIFICAR PARA LA PRÁCTICA)

const Evented = require("events");
const WebSocketServer = require("websocket").server;

class Electro extends Evented {
	constructor(sensors, parameters, httpServer, debug = false) {
		super();

		sensors.clientes = 0;

		this.debug = function (...args) {
			if (debug) console.log("electro:", ...args);
		};

		var wsServer = new WebSocketServer({
			httpServer: httpServer,
			autoAcceptConnections: false
		});

		var connections = []

		var send = (connection, command, data) => {
			if (!connection) {
				this.debug(">>>", "Conexiones:", connections.length, "Accion:", command, "Datos:", data);
				return connections.forEach(connection => send(connection, command, data));
			}
			connection.send(JSON.stringify({ command, data }));
		};

		wsServer.on("request", request => {
			var connection = request.accept("electro", request.origin);
			this.clientes++;
			connections.push(connection);
			this.debug("Conexion establecida por un cliente. Ahora son:", connections.length);

			connection.on("message", message => {
				if (message.type !== "utf8") {
					console.warn("Mensaje recibido que no es textual", message);
					return;
				}
				var msg = JSON.parse(message.utf8Data);
				this.debug("<<<", "Accion:", msg.command, "Datos:", msg.data)
				switch (msg.command) {
					case "connect":
						send(connection, "properties", { sensors: sensors, parameters: parameters });
						break;

					case "value":
						this[msg.data.name] = msg.data.value;
						break;
				}
			});

			connection.on("close", (reasonCode, description) => {
				connections.splice(connections.indexOf(connection), 1);
				this.clientes--;
				this.debug("Cliente desconectado. Ahora son:", connections.length);
			});
		});

		[sensors, parameters].forEach(props =>
			Object.keys(props).forEach(p => {
				Object.defineProperty(this, p, {
					get: () => props[p],
					set: value => {
						var prev = props[p];
						props[p] = value;
						this.emit(p, value, prev);
						send(null, "value", { name: p, value });
					}
				})
			})
		);
	}
}

exports.Electro = Electro;