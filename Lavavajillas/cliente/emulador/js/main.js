$().ready(() => {
	var electro = new Electro({ emulator: true });
	electro.on("connect", function () {
		$("#simulador").removeClass("desconectado");
		$("#estado").text("Conectado");

		// Sensores
		electro._sensors.forEach(sensor => {
			var $x = $("<td />").appendTo($("<tr><td><strong>" + sensor + "</strong></td></tr>").appendTo("#sensors tbody"));
			function time(date) {
				function dd(n) { return (n < 10 ? "0" : "") + n; }
				return dd(date.getHours()) + ":" + dd(date.getMinutes()) + ":" + dd(date.getSeconds());
			}
			electro.on(sensor, (val) => {
				$x.html(val instanceof Date ? time(val) : JSON.stringify(val));
			});
		});

		// Parámetros
		electro._parameters.forEach(param => {
			var $row = $("<tr><td><strong>" + param + "</strong></td></tr>").appendTo("#parameters tbody");
			var $c = $("<td />").appendTo($row);


			if (param == "tamborRevoluciones") {
				let $input = $("<input type='number' name='" + param + "' /> ").appendTo($c);
				$input.val(electro[param]);
				$input.on("change", function () {
					electro[param] = $input.val();
				});
				electro.on(param, val => {
					$input.val(val);
				});
			} else {
				let $input = $("<input type='checkbox' name='" + param + "' /> ").appendTo($c);
				//$input.prop("checked", electro[param]);
				$input.on("change", function () {
					electro[param] = $input.prop('checked');
				});
				electro.on(param, val => {
					$input.prop("checked", val);
				});
			}
		});

		// Puerta
		$("#puertaAbierta").click(function () {
			electro.puertaAbierta = !electro.puertaAbierta;
		});

		// Presencia
		$("#presencia").click(function () {
			electro.presencia = !electro.presencia;
		});


		// Boleanos
		["resistencia", "tomaAgua", "desague", "presencia", "puertaAbierta", "motor"].forEach(x => {
			$("#" + x).addClass("estado");
			electro.on(x, estado => { $("#" + x).toggleClass("activo", estado) });
		});

		// Error o desconexión
		function stop() {
			$("#simulador").addClass("desconectado");
			$("#estado").text("Desconectado");
		}
		electro.on("error", stop);
		electro.on("disconnect", stop);
	});
});