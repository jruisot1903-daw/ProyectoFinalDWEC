import { GestorCitas } from "../js/clases/GestionaCitas.js";
import { Cita } from "../js/clases/Cita.js";
import { crearModalCita } from "./dom.js";

const modalCita = crearModalCita();
const gestor = new GestorCitas();
let pacienteLogueado = null;
let citaSeleccionada = null;
let cita = null;

let login = document.getElementById("login");
let pass = document.getElementById("pass");
let mensajeAyuda = document.getElementById("ayudaContra");
let saludo = document.getElementById("texto");
let err = document.getElementById("err");
let comprobante = false;
let citas = [];

function formatearFecha(fecha) {
    if (!fecha) return "";
    const d = new Date(fecha);

    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    const segundos = String(d.getSeconds()).padStart(2, '0');

    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

document.getElementById("btn-login-user").addEventListener("click", function () {
    cleanErr();
    const nombreIntroducido = login.value.trim().toLowerCase();
    const passIntroducida = pass.value.trim();

    if (nombreIntroducido === "" || passIntroducida === "") {
        err.innerHTML = "Los campos no pueden estar vacíos";
        saludo.innerHTML = "";
        return;
    }
    // Buscar paciente por nombre 
    const paciente = gestor.pacientes.find(p =>
        p.nombre.toLowerCase() === nombreIntroducido
    );

    const medico = gestor.medicos.find(m => 
        m.nombre.toLowerCase() == nombreIntroducido
    );


    if (!paciente) {
        err.innerHTML = "Este usuario no existe en el sistema";
        return;
    }

    // Usamos el DNI como contraseña 
    if (paciente.dni !== passIntroducida) {
        err.innerHTML = "Contraseña incorrecta";
        return;
    }

    // Login correcto 
    pacienteLogueado = paciente;
    comprobante = true;
    err.innerHTML = "";
    saludo.innerHTML = "Bienvenid@: " + paciente.getNombreCompleto();
});

document.getElementById("btn-logout").addEventListener("click", function () {
    if (comprobante) {
        saludo.innerHTML = pacienteLogueado.nombre + " estás saliendo...";
        setTimeout(function () {
            saludo.innerHTML = "";
            err.innerHTML = "";
            login.value = "";
            pass.value = "";
            comprobante = false;
            pacienteLogueado = null;
        }, 500);
    } else {
        err.innerHTML = "No puedes salir si no has iniciado sesión";
    }
});


function cargarDatosIniciales() {
    return Promise.all([
        fetch("../server/pacientes.json")
            .then(r => r.json())
            .then(data => gestor.cargarPacientesDesdeJSON(data)),

        fetch("../server/medicos.json")
            .then(r => r.json())
            .then(data => gestor.cargarMedicosDesdeJSON(data)),

        fetch("../server/citas.json")
            .then(r => r.json())
            .then(data => gestor.cargarCitasDesdeJSON(data))
    ]).then(() => {
        gestor.guardarEnLocalStorage(); // De esta forma hacemos que la ventana emerjente detalleCitas pueda ver la información de la cita
    });
}


function obtenerDatosCitasJson() {
    fetch("../server/citas.json")
        .then(r => r.json())
        .then(data => {
            citas.push(...data);
        })
        .catch(error => err.innerHTML = "El error: " + error);
}

async function guardarEnJson() {
    try {
        // Enviamos el array completo de citas que tiene el gestor actualmente
        const datosAEnviar = gestor.citas;

        const respuesta = await fetch('../server/pintarCitas.php', { // Ponemos donde tenemos nuestro PHP
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosAEnviar)
        });


    } catch (error) {
        err.innerHTML = "Error detallado:", error;
    }
}

async function eliminarCitaJson(idCita) {
    // Filtramos el array local
    gestor.citas = gestor.citas.filter(cita => cita.id != idCita);

    // Actualizamos LocalStorage
    gestor.guardarEnLocalStorage();

    // Enviamos el nuevo array al servidor para que pise el JSON
    await guardarEnJson();
}



function obtenerEventosDesdeGestor() {
    return gestor.citas.map(c => {
        const paciente = gestor.buscarPacientePorId(c.pacienteId);
        const medico = gestor.buscarMedicoPorId(c.medicoId);

        return {
            id: String(c.id),
            title: `${paciente?.nombre || "Paciente"} - ${medico?.nombre || "Médico"}`,
            start: c.inicio,
            end: c.fin,
            backgroundColor: "#003d21"
        };
    });
}

// Pruebas con API de calendario FullCalendar
let calendar;

document.addEventListener('DOMContentLoaded', function () {
    cleanErr();

    obtenerDatosCitasJson(); // Llamamos a la función para que nada mas se carge la pagina tengamos los datos del json


    cargarDatosIniciales().then(() => {
        const calendarEl = document.getElementById('calendar');


        calendar = new FullCalendar.Calendar(calendarEl, {
            // Configuración de Vista
            initialView: 'timeGridWeek', // Vista semanal con horas
            locale: 'es',                // Interfaz en español
            firstDay: 1,                 // Empieza en Lunes

            // Control de Horarios
            slotMinTime: '08:00:00',     // Hora inicio jornada
            slotMaxTime: '21:00:00',     // Hora fin jornada
            slotDuration: '00:15:00',    // Intervalos de 15 minutos
            snapDuration: '00:15:00',    // Obligamos al cursor salte de 15 en 15 
            allDaySlot: false,           // Quita la fila de "Todo el día"
            nowIndicator: true,          // Nos marca con una linea por donde vamos correspondiente con la hora actual

            // Restricciones de horarios
            businessHours: [
                {
                    daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
                    startTime: '08:00:00', // Apertura mañana
                    endTime: '15:00:00'    // Cierre mañana
                },
                {
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '16:00:00',
                    endTime: '21:00:00'
                }
            ],

            // Interactividad de Reservas
            selectable: true,            // Permite hacer clic y arrastrar
            selectOverlap: false,        // No permite reservar sobre otra cita
            selectMirror: true,          // Muestra un marcador mientras arrastras
            editable: false,              // No Permite mover citas ya creadas
            selectConstraint: 'businessHours', // Solos las nos permite las horas que hayamos dicho que trabajamos

            // Bloqueamos las posibles reservas en horarios o dias que tan han pasado 
            selectAllow: function (selectInfo) {
                const hoy = new Date();
                const fechaFutura = selectInfo.start >= hoy;
                const duracionMs = selectInfo.end - selectInfo.start;
                const dentroDelTiempo = duracionMs <= 900000;
                // Solo permite si la fecha de inicio es mayor o igual a hoy y ya no nos permite a la hora de hacer click en una casilla para crear la cita poder desplazar el rato y coger 
                // más tramo horario del que deberíamos coger
                return fechaFutura && dentroDelTiempo;
            },

            // Crear Reserva
            select: function (info) {
                cleanErr();
                if (!pacienteLogueado) {
                    err.innerHTML = "Debes iniciar sesión para reservar.";
                    calendar.unselect();
                    return;
                }

                // Asignamos un medico random al paciente
                const medicoId = Math.floor(Math.random() * 10) + 1;
                const nuevaCita = new Cita(Date.now(), pacienteLogueado.id, medicoId, info.startStr, info.endStr, "pendiente");
                cita = nuevaCita;
                // Guardar en gestor 
                gestor.agregarCita(nuevaCita); gestor.guardarEnLocalStorage();
                // Añadir al calendario 
                calendar.addEvent({
                    id: nuevaCita.id,
                    title: `${pacienteLogueado.nombre} - ${gestor.buscarMedicoPorId(medicoId).nombre}`,
                    start: nuevaCita.inicio,
                    end: nuevaCita.fin,
                    backgroundColor: "#003d21"
                });

                guardarEnJson();// guardamos la cita en el archivo de citas.json
                cambiarEstado(); // cambiamos el estado de las citas que sean mas viejas del dia de hoy
                calendar.unselect(); // Limpia la selección tras terminar
            },

            // Lógica al hacer clic en una cita existente
            eventClick: function (info) {
                cleanErr();
                const cita = gestor.citas.find(c => c.id == info.event.id);

                if (!pacienteLogueado || cita.pacienteId !== pacienteLogueado.id) {
                    err.innerHTML = "Solo puedes gestionar tus propias citas.";
                    return;
                }

                citaSeleccionada = cita;

                modalCita.setDatos(
                    gestor.buscarPacientePorId(cita.pacienteId).getNombreCompleto(),
                    gestor.buscarMedicoPorId(cita.medicoId).nombre,
                    formatearFecha(cita.inicio),
                    formatearFecha(cita.fin)
                );

                modalCita.abrir();
            },


            events: obtenerEventosDesdeGestor()
        });

        calendar.render();
    });


});

// Interacción modal 

document.getElementById("btnCerrar").onclick = () => modalCita.cerrar();

document.getElementById("btnEliminar").onclick = () => {
    if (!citaSeleccionada) return;

    if (confirm("¿Seguro que deseas eliminar esta cita?")) {
        gestor.eliminarCita(citaSeleccionada.id);
        gestor.guardarEnLocalStorage();

        const evento = calendar.getEventById(citaSeleccionada.id);
        if (evento) evento.remove();
        eliminarCitaJson(citaSeleccionada.id); //eliminamos la cita "vieja" 
        calendar.render(); //eliminamos la cita visualmente

        modalCita.cerrar();
    }
};

document.getElementById("btnModificar").onclick = async () => {
    if (!citaSeleccionada) return;
    err.innerHTML = ""; // Limpiamos errores previos

    // Pedir nuevos datos al usuario
    const nuevoInicioStr = prompt("Formato: YYYY-MM-DD HH:mm:ss", formatearFecha(citaSeleccionada.inicio));
    const nuevoFinStr = prompt("Formato: YYYY-MM-DD HH:mm:ss", formatearFecha(citaSeleccionada.fin));

    if (nuevoInicioStr && nuevoFinStr) {
        // Validar formato visual con Expresión Regular
        const regexFecha = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!regexFecha.test(nuevoInicioStr) || !regexFecha.test(nuevoFinStr)) {
            err.innerHTML = "Error: El formato debe ser exactamente YYYY-MM-DD HH:mm:ss";
            return;
        }

        // Convertir strings a objetos Date
        const fechaInicioObj = new Date(nuevoInicioStr.replace(" ", "T"));
        const fechaFinObj = new Date(nuevoFinStr.replace(" ", "T"));

        // Validar que la fecha sea real
        if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
            err.innerHTML = "Error: Fecha calendario no válida.";
            return;
        }

        // Validar intervalos de 15 minutos
        if (fechaInicioObj.getMinutes() % 15 !== 0 || fechaFinObj.getMinutes() % 15 !== 0) {
            err.innerHTML = "Error: Los minutos deben ser 00, 15, 30 o 45.";
            return;
        }

        // Validar que inicio sea antes que fin
        if (fechaInicioObj >= fechaFinObj) {
            err.innerHTML = "Error: La fecha de inicio debe ser anterior a la de fin.";
            return;
        }

        // Validar que el médico no tiene una consulta ese mismo dia
        const tieneConsulta = gestor.citas.some(cita => {
            if (cita.medicoId === citaSeleccionada.medicoId && cita.id !== citaSeleccionada.id) {
                const inicioC = new Date(cita.inicio);
                const finC = new Date(cita.fin);
                return fechaInicioObj < finC && fechaFinObj > inicioC;
            }
            return false;
        });

        if (tieneConsulta) {
            err.innerHTML = "Error: El médico ya tiene una cita en ese horario.";
            return;
        }

        // Validar que el usuario no tiene una cita ese mismo día
        const tieneCita = gestor.citas.some(cita => {
            if (cita.pacienteId === citaSeleccionada.pacienteId && cita.id !== citaSeleccionada.id) {
                const inicioP = new Date(cita.inicio);
                const finP = new Date(cita.fin);
                return fechaInicioObj < finP && fechaFinObj > inicioP;
            }
            return false;
        });

        if (tieneCita) {
            err.innerHTML = `Error: El paciente ${pacienteLogueado.nombre} ya tiene otra cita en este horario.`;
            return;
        }

        // APLICAR CAMBIOS
        // Buscamos la referencia real en el array del gestor
        const citaEnArray = gestor.citas.find(c => c.id == citaSeleccionada.id);

        if (citaEnArray) {
            // Actualizamos el objeto del gestor (en formato ISO String para el JSON)
            citaEnArray.inicio = fechaInicioObj.toISOString();
            citaEnArray.fin = fechaFinObj.toISOString();

            // Actualizamos el calendario visualmente
            const eventoCalendario = calendar.getEventById(citaSeleccionada.id);
            if (eventoCalendario) {
                eventoCalendario.setDates(fechaInicioObj, fechaFinObj);
            }

            // Guardar y Sincronizar
            gestor.guardarEnLocalStorage();
            await guardarEnJson();

            modalCita.cerrar();

            // Refrescar la referencia global para el próximo click
            citaSeleccionada = citaEnArray;

            // forzar un pequeño refresco visual
            calendar.render();
        }
    }
};


function cambiarEstado() {
    let hoy = new Date();
    let opciones = ["cita realizada", "cita no realizada"];

    const obtenerAleatorio = (arr) => arr[Math.floor(Math.random() * arr.length)];

    gestor.citas.forEach(cita => {
        let fechaCita = new Date(cita.inicio);
        if (fechaCita < hoy && cita.estado === "pendiente") {
            cita.estado = obtenerAleatorio(opciones);
        }
    });

    guardarEnJson();
}



function cleanErr() {
    err.innerHTML = "";
}

// Parte de los eventos sin contar el evento click

document.addEventListener('mouseover', function (e) {
    const evento = e.target.closest('.fc-event');
    if (evento) {
        // Generar un color hexadecimal aleatorio , el numero que nos de lo representamos en un numero hexadecimal y el padStart lo ponemos para que siempre tenga 6 caracteres
        const colorAleatorio = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        evento.style.backgroundColor = colorAleatorio;
    }
});

document.addEventListener('mouseout', function (e) {
    const evento = e.target.closest('.fc-event');
    if (evento) {
        evento.style.backgroundColor = '#003d21';
    }
});


document.addEventListener('keyup', function (e) {
    if (e.key === "Enter") {
        const colorAleatorio = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

        // Seleccionar los elementos de FullCalendar
        const linea = document.querySelector('.fc-timegrid-now-indicator-line');
        const flecha = document.querySelector('.fc-timegrid-now-indicator-arrow');

        if (linea && flecha) {
            // Aplicar el color aleatorio a la línea
            linea.style.setProperty('border-color', colorAleatorio, 'important');
            linea.style.setProperty('box-shadow', `0 0 12px ${colorAleatorio}`, 'important');

            // Aplicar el mismo color a la flecha
            flecha.style.setProperty('border-left-color', colorAleatorio, 'important');
        }
    }
});


pass.addEventListener("focus", () => {
    mensajeAyuda.style.display = "block";
});


pass.addEventListener("blur", () => {
    mensajeAyuda.style.display = "none";
});