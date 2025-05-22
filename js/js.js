// Variables Globales  
let vidasJugador = 3;
let vidasEnemigo = 3;
let juegoTerminado = false;
let jugadorId = null;

// Función para obtener el ID del jugador desde el servidor
function unirseAlJuego() {
    fetch("http://localhost:8080/unirse")
        .then(function (res) {
            if (res.ok) {
                res.text().then(function (respuesta) {
                    console.log("ID del jugador:", respuesta)
                    jugadorId = respuesta
                })
            } else {
                console.error("Error al obtener ID del jugador");
            }
        })
        .catch(function (error) {
            console.error("Error al unirse al juego:", error)
        })
}

// Función para iniciar el juego
function iniciarJuego() {
    unirseAlJuego(); // Se une al servidor al cargar

    ocultarElemento('seleccionar-ataque');
    ocultarElemento('reiniciar');

    document.getElementById('boton-seleccionar').addEventListener('click', seleccionarMascotaJugador);
  
document.getElementById('ataque-fuego').addEventListener('click', () => ataqueJugador('FUEGO'));
document.getElementById('ataque-agua').addEventListener('click', () => ataqueJugador('AGUA'));
document.getElementById('ataque-tierra').addEventListener('click', () => ataqueJugador('TIERRA'));

   document.getElementById('button-reiniciar').addEventListener('click', reiniciarJuego);

    // Efecto visual al seleccionar una mascota
    const mascotaLabels = document.querySelectorAll('.mascota-opciones label');
    const inputs = document.querySelectorAll('input[name="mascota"]');

    inputs.forEach((input, index) => {
        input.addEventListener('change', () => {
            mascotaLabels.forEach(label => label.classList.remove('seleccionada'));
            mascotaLabels[index].classList.add('seleccionada');
        });
    });
}

// ✅ MODIFICADO: Enviar nombre del mokepon al backend
function seleccionarMascotaJugador() {
    if (!jugadorId) {
        alert("No se pudo obtener ID del jugador. Intenta de nuevo.");
        return;
    }

    ocultarElemento('seleccionar-mascota');
    mostrarElemento('seleccionar-ataque');

    const inputHipodoge = document.getElementById('hipodoge');
    const inputCapipepo = document.getElementById('capipepo');
    const inputRatigueya = document.getElementById('ratigueya');
    const spanMascotaJugador = document.getElementById('mascota-jugador');

    let mascotaSeleccionada = "";

    if (inputHipodoge.checked) {
        mascotaSeleccionada = 'Hipodoge';
    } else if (inputCapipepo.checked) {
        mascotaSeleccionada = 'Capipepo';
    } else if (inputRatigueya.checked) {
        mascotaSeleccionada = 'Ratigueya';
    } else {
        alert('Selecciona una mascota');
        mostrarElemento('seleccionar-mascota');
        return;
    }

    spanMascotaJugador.innerHTML = mascotaSeleccionada;

    // ✅ Enviar al servidor
    fetch(`http://localhost:8080/mokepon/${jugadorId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mokepon: mascotaSeleccionada
        })
    }).then(res => {
        if (!res.ok) {
            console.error("Error al asignar mokepon");
        }
    }).catch(err => {
        console.error("Error de red al enviar mokepon:", err);
    });

    seleccionarMascotaEnemigo();
}

function seleccionarMascotaEnemigo() {
    const spanMascotaEnemigo = document.getElementById('mascota-enemigo');
    const mascota = ['Hipodoge', 'Capipepo', 'Ratigueya'][aleatorio(0, 2)];
    spanMascotaEnemigo.innerHTML = mascota;
}

function ataqueJugador(ataque) {
    if (juegoTerminado) return;
    const ataqueEnemigo = ataqueAleatorioEnemigo();
    combate(ataque, ataqueEnemigo);
}

function ataqueAleatorioEnemigo() {
    return ['FUEGO', 'AGUA', 'TIERRA'][aleatorio(0, 2)];
}

function combate(ataqueJugador, ataqueEnemigo) {
    if (juegoTerminado) return;

    const spanVidasJugador = document.getElementById('vidas-jugador');
    const spanVidasEnemigo = document.getElementById('vidas-enemigo');

    if (ataqueJugador === ataqueEnemigo) {
        crearMensaje("EMPATE", ataqueJugador, ataqueEnemigo);
    } else if (
        (ataqueJugador === 'FUEGO' && ataqueEnemigo === 'TIERRA') ||
        (ataqueJugador === 'AGUA' && ataqueEnemigo === 'FUEGO') ||
        (ataqueJugador === 'TIERRA' && ataqueEnemigo === 'AGUA')
    ) {
        vidasEnemigo = Math.max(vidasEnemigo - 1, 0);
        spanVidasEnemigo.innerHTML = vidasEnemigo;
        crearMensaje("GANASTE", ataqueJugador, ataqueEnemigo);
    } else {
        vidasJugador = Math.max(vidasJugador - 1, 0);
        spanVidasJugador.innerHTML = vidasJugador;
        crearMensaje("PERDISTE", ataqueJugador, ataqueEnemigo);
    }

    revisarVidas();
}

function revisarVidas() {
    if (vidasEnemigo === 0) {
        crearMensajeFinal("🎉 Felicitaciones, GANASTE");
        juegoTerminado = true;
    } else if (vidasJugador === 0) {
        crearMensajeFinal("💀 Lo siento, PERDISTE");
        juegoTerminado = true;
    }
}

function crearMensaje(resultado, ataqueJugador, ataqueEnemigo) {
    const sectionMensajes = document.getElementById('mensajes');
    sectionMensajes.innerHTML = ''; // Limpiar mensajes anteriores

    const parrafo = document.createElement('p');
    parrafo.classList.add('parrafo-sombreado', 'mensaje-fade');
    parrafo.innerHTML = `Tu mascota atacó con <strong>${ataqueJugador}</strong>, la del enemigo con <strong>${ataqueEnemigo}</strong> – <strong>${resultado}</strong>`;
    sectionMensajes.appendChild(parrafo);

    requestAnimationFrame(() => {
        parrafo.classList.add('mostrar');
    });

    setTimeout(() => {
        parrafo.classList.remove('mostrar');
    }, 3000);
}

function crearMensajeFinal(mensaje) {
    const sectionMensajes = document.getElementById('mensajes');
    sectionMensajes.innerHTML = '';

    const parrafo = document.createElement('p');
    parrafo.classList.add('parrafo-sombreado', 'animate-title', 'mensaje-fade');
    parrafo.innerHTML = mensaje;
    sectionMensajes.appendChild(parrafo);

    requestAnimationFrame(() => {
        parrafo.classList.add('mostrar');
    });

    deshabilitarBotones();
    mostrarElemento('reiniciar');
}

function deshabilitarBotones() {
    ['ataque-fuego', 'ataque-agua', 'ataque-tierra'].forEach(id => {
        document.getElementById(id).disabled = true;
    });
}

function reiniciarJuego() {
    location.reload();
}

function ocultarElemento(id) {
    document.getElementById(id).style.display = 'none';
}

function mostrarElemento(id) {
    document.getElementById(id).style.display = 'block';
}

function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Iniciar juego al cargar la página
window.addEventListener('load', iniciarJuego);
