class Electro {
	constructor(options) {
		options = Object.assign({ port: location.port, server: location.hostname, emulator: false }, options || {});
		var { port, server, emulator } = options;
		Object.defineProperties(this, {
			_events: { value: {} },
			_socket: { value: new WebSocket("ws://" + server + ":" + port + "/electro", "electro") }
		});

		var properties = {};

		this._socket.addEventListener("open", (ev) => {
			this.command("connect", { emulator });
		});

		this._socket.addEventListener("error", (ev) => {
			this.emit("error");
		});

		this._socket.addEventListener("close", (ev) => {
			this.emit("disconnect");
		});

		this._socket.addEventListener("message", (ev) => {
			var msg = JSON.parse(ev.data);
			//console.log("<<<", msg.command, msg.data);

			var getValue = (value)  => {
					// Es una fecha?
					if (typeof value === "string" && /^\d\d\d\d\-\d\d\-\d\dT\d\d:\d\d:\d\d.\d\d\dZ$/.test(value)) value = new Date(value);
					return value;
			}

			switch (msg.command) {
				case "properties":
					Object.assign(properties, msg.data.sensors, msg.data.parameters);
					this._sensors = Object.keys(msg.data.sensors); // listado de nombres de sensores
					this._parameters = Object.keys(msg.data.parameters); // listado de nombres de parámetros
					Object.keys(properties).forEach(f => {
						Object.defineProperty(this, f, {
							enumerable: true,
							get: () => properties[f],
							set: (value) => {
								if (!emulator && f in msg.data.sensors) {
									console.warn("No se puede modificar un sensor");
									return;
								}
								this.command("value", { name: f, value});
							}
						});
						//getValue(f, properties[f]);
					});
					this.emit("connect", {});
					Object.keys(properties).forEach(f => this.emit(f, getValue(properties[f])));
					break;

				case "value":
					properties[msg.data.name] = getValue(msg.data.value);
					this.emit(msg.data.name, properties[msg.data.name])
					break;
			}
		});

	}

	command(type, data) {
		//console.log(">>>", type, data);
		this._socket.send(JSON.stringify({ command: type, data }));
	}

	emit(event, ...data) {
		if (!this._events[event]) return;
		this._events[event].forEach(callback => callback(...data));
	}

	on(event, callback) {
		if (!this._events[event]) this._events[event] = [];
		this._events[event].push(callback);
	}

	off(event, callback) {
		if (!this._events[event]) return;
		for (let i = 0 ; i < this._events[event].length ; i ++) {
			if (this._events[event][i] === callback) {
				this._events[event].splice(i, 1);
				i--;
			}
		}
	}
}

