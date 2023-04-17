// Librería Lavavajillas para el servidor (NO MOFIFICAR PARA LA PRÁCTICA)

const Electro = require("./electro.js").Electro;

class Lavavajillas extends Electro {
	constructor(httpServer, debug) {
		var temp = 22; // temperatura por defecto (exterior)

		// Inicializar las propiedades del electrodoméstico
		super({ // sensores
			reloj: null,
			puertaAbierta: false,
			temperatura: temp,
			presencia: false,
			nivelAgua: 0,
			consumo: 0
		}, { // actuadores
			resistencia: false,
			aperturaDetergente: false,
			aperturaAbrillandador: false,
			motor: false,
			tomaAgua: false,
			desague: false,
		}, httpServer, debug);

		setInterval(() => { // cada segundo
			this.reloj = new Date(); // actualizar la hora
			// Consumo
			var consumo = 1;
			if (this.resistencia) consumo += 40;
			if (this.motor) consumo += 5;
			this.consumo += consumo;

			if (this.puertaAbierta) {
				this.temperatura = Math.max(temp, this.temperatura - 1);
			} else {
				this.temperatura = Math.max(temp, this.temperatura + (this.resistencia ? 1 : 0) - 0.5);
			}
			if (this.tomaAgua) {
				this.nivelAgua = Math.min(100, this.nivelAgua + 5);
			}
			if (this.desague) {
				this.nivelAgua = Math.max(0, this.nivelAgua - 5);
			}

		}, 1000);
	}
}

exports.Lavavajillas = Lavavajillas;