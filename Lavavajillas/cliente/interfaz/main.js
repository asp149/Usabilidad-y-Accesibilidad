var electro = new Electro();

// Poner el nivel del agua a un objetivo. Cuando lo consigue llama a la función callback
function nivelAgua(objetivo, callback) {
    if (electro.nivelAgua < objetivo) {
        console.log("Llenar de agua hasta el nivel:", objetivo);
        electro.tomaAgua = true;
    }
    else {
        console.log("Vaciar de agua hasta el nivel:", objetivo);
        electro.desague = true;
    }
    function agua(nivel) {
        if (nivel == objetivo) { // esperar a que sea el objetivo
            console.log("Nivel de agua conseguido");
            electro.off("nivelAgua", agua);
            electro.tomaAgua = false;
            electro.desague = false;
            callback();
        }
    }
    electro.on("nivelAgua", agua);
}

electro.on("connect", function () { // Esparar a que la librería se conecte con el electrodoméstico
    console.log("Ya estoy conectado con la electrodoméstico!!")
    console.log("Con este hay " + electro.clientes + " clientes conectados");

    // Actualizar el reloj
    electro.on("reloj", function (hora) {
        let horas = hora.getHours().toString().padStart(2, '0'); // Agregar cero a la izquierda si las horas tienen un solo dígito
        let minutos = hora.getMinutes().toString().padStart(2, '0'); // Agregar cero a la izquierda si los minutos tienen un solo dígito
        document.getElementById("hora").innerHTML = horas + ":" + minutos;
    });
    // Mostrar la temperatura exeterior
    electro.on("temperatura", function (temperatura) {
        document.getElementById("temperatura").innerHTML = temperatura + "°C";
    });
    // Con la presencia del usuario muestro los controles de cocinado
    // electro.on("presencia", function (presente) {
    //     if (presente) {
    //         document.getElementById("controles").style.display = "block";
    //     } else {
    //         document.getElementById("controles").style.display = "none";
    //     }
    // });

    // Obtengo referencia a controles
    var lavar = document.getElementById("lavar");
    var tiempo = document.getElementById("tiempo");
    var temperatura = document.getElementById("temperatura");

    // Solo lavo si está la puerta cerrada
    electro.on("puertaAbierta", function (abierta) {
        lavar.disabled = abierta;
    });

    // Lavar
    lavar.addEventListener("click", function () {
        console.log("Comienzo a lavar. Tiempo:", tiempo.value, "Temperatura:", temperatura.value);
        // Bloquear controles
        lavar.disabled = true;
        tiempo.disabled = true;
        temperatura.disabled = true;

        // Lleno el agua al 100%
        nivelAgua(100, function () {
            electro.aperturaDetergente = true;
            console.log("Abro el detergente y espero 1 seg");
            setTimeout(function () {
                console.log("Cierro el detergente");
                electro.aperturaDetergente = false;
                // Calentar el agua
                electro.resistencia = true;
                function temp(t) { // funcion termostato
                    if (t > temperatura.value) {
                        electro.resistencia = false;
                    }
                    else {
                        electro.resistencia = true;
                    }
                }
                electro.on("temperatura", temp);
                // Esperar el tiempo de lavado
                console.log("Empiezo a lavar")
                electro.motor = true;
                setTimeout(function () {
                    console.log("Fin de lavado");
                    electro.off("temperatura", temp); // quito el termostato
                    electro.motor = false;
                    electro.resistencia = false;
                    nivelAgua(0, function () {
                        // NO está implementado pero habría que hacer el abrillantado (llenando otra vez de agua y abriendo la puerta del abrillantador)
                        lavar.disabled = false;
                        tiempo.disabled = false;
                        temperatura.disabled = false;
                    });
                }, tiempo.value * 1000);
            }, 1000);
        });
    });
});

//Mi codigo
const botonModos = document.getElementById("boton-modos");
// Agregar un evento de clic al botón
if(botonModos != null){
    botonModos.addEventListener("click", function() {
        // Redireccionar a la página "modes.html"
        window.location.href = "modes.html";
      });
}

const botonAtras = document.getElementById("boton-atras");
// Agregar un evento de clic al botón
if(botonAtras != null){
    botonAtras.addEventListener("click", function() {
        // Redireccionar a la página "modes.html"
        window.location.href = "index.html";
      });
}

const modos = [
    {nombre: 'Mañana', hora: '10:00'},
    {nombre: 'Tarde', hora: '17:00'},
    {nombre: 'Madrugada', hora: '01:00'},
    {nombre: 'Modo lluvioso', hora: 'Todo el día'},
    {nombre: 'Modo lluvioso', hora: 'Todo el día'},
    {nombre: 'Modo lluvioso', hora: 'Todo el día'},
    {nombre: 'Modo lluvioso', hora: 'Todo el día'}
  ];

  function construirListaModos() {
    const listaModos = document.querySelector('.lista-modos');
    if(listaModos != null){
         // Crear un elemento de lista para cada modo y agregarlo a la listaModos
        modos.forEach(modo => {
        const modoElemento = document.createElement('div');
        modoElemento.classList.add('modo');
        modoElemento.innerHTML = `
            <span class="nombre-modo">${modo.nombre}</span>
            <span class="hora-modo">${modo.hora}</span>
        `;
        listaModos.appendChild(modoElemento);
        });
    }
    
  }
  document.addEventListener('DOMContentLoaded', construirListaModos);