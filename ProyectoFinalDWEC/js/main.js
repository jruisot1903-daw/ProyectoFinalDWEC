import { GestorCitas } from "../js/clases/GestionaCitas.js";
import { Cita } from "../js/clases/Cita.js";
const gestor = new GestorCitas();
let pacienteLogueado = null;

let login = document.getElementById("login");
let pass = document.getElementById("pass");
let saludo = document.getElementById("texto");
let err = document.getElementById("err");
let comprobante = false;

document.getElementById("btn-login-user").addEventListener("click", function () {
    const nombreIntroducido = login.value.trim().toLowerCase();
    const passIntroducida = pass.value.trim();

    if (nombreIntroducido === "" || passIntroducida === "") {
        err.innerHTML = "Los campos no pueden estar vacíos";
        saludo.innerHTML = ""; return;
    }
    // Buscar paciente por nombre 
    const paciente = gestor.pacientes.find(p =>
        p.nombre.toLowerCase() === nombreIntroducido
    );

    if (!paciente) {
        err.innerHTML = "Este usuario no existe en el sistema";
        return;
    }

    // Por ahora usamos el DNI como contraseña 
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
            .then(data => gestor.cargarCitasDesdeJSON(data))]);
}


function obtenerEventosDesdeGestor() {
    return gestor.citas.map(c => {
        const paciente = gestor.buscarPacientePorId(c.pacienteId);
        const medico = gestor.buscarMedicoPorId(c.medicoId);

        return {
            id: c.id,
            title: `${paciente?.nombre || "Paciente"} - ${medico?.nombre || "Médico"}`,
            start: c.inicio,
            end: c.fin,
            backgroundColor: "#2c3e50"
        };
    });
}

// PRUEBAS CON API DE CALENDARIO FULLCALENDAR
document.addEventListener('DOMContentLoaded', function () {
    cargarDatosIniciales().then(() => {
        const calendarEl = document.getElementById('calendar');

        const calendar = new FullCalendar.Calendar(calendarEl, {
            // Configuración de Vista y Lenguaje
            initialView: 'timeGridWeek', // Vista semanal con horas
            locale: 'es',                // Interfaz en español
            firstDay: 1,                 // Empieza en Lunes

            // Control de Horarios (Agenda de Reservas)
            slotMinTime: '08:00:00',     // Hora inicio jornada
            slotMaxTime: '20:00:00',     // Hora fin jornada
            slotDuration: '00:15:00',    // Intervalos de 15 minutos
            allDaySlot: false,           // Quita la fila de "Todo el día"
            nowIndicator: true,          // Nos marca con una linea por donde vamos para el tema de las reservas

            // Restricciones de horarios
            businessHours: [
                {
                    daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
                    startTime: '08:00', // Apertura mañana
                    endTime: '15:00'    // Cierre mañana
                },
                {
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '16:00',
                    endTime: '20:00'
                }
            ],

            // Interactividad de Reservas
            selectable: true,            // Permite hacer clic y arrastrar
            selectOverlap: false,        // NO permite reservar sobre otra cita
            selectMirror: true,          // Muestra un marcador mientras arrastras
            editable: false,              // NO Permite mover citas ya creadas
            selectConstraint: 'businessHours', // Solos las nos permite las horas que hayamos dicho que trabajamos

            // Bloqueamos las posibles reservas en horarios o dias que tan han pasado 
            selectAllow: function (selectInfo) {
                const ahora = new Date();
                // Solo permite si la fecha de inicio es mayor o igual a "ahora"
                return selectInfo.start >= ahora;
            },

            // Lógica al seleccionar una hora (Crear Reserva)
            select: function (info) {
                if (!pacienteLogueado) {
                    alert("Debes iniciar sesión para reservar.");
                    calendar.unselect();
                    return;
                }

                // Por ahora asignamos médico fijo (luego lo hacemos dinámico) 
                const medicoId = 1;
                const nuevaCita = new Cita(Date.now(), pacienteLogueado.id, medicoId, info.startStr, info.endStr, "pendiente");
                // Guardar en gestor 
                gestor.agregarCita(nuevaCita); gestor.guardarEnLocalStorage();
                // Añadir al calendario 
                calendar.addEvent({
                    id: nuevaCita.id,
                    title: `${pacienteLogueado.nombre} - ${gestor.buscarMedicoPorId(medicoId).nombre}`,
                    start: nuevaCita.inicio,
                    end: nuevaCita.fin,
                    backgroundColor: "#2c3e50"
                });
                calendar.unselect(); // Limpia la selección tras terminar
            },

            // Lógica al hacer clic en una cita existente
            eventClick: function (info) {
                const cita = gestor.citas.find(c => c.id == info.event.id);
                if (!pacienteLogueado || cita.pacienteId !== pacienteLogueado.id) {
                    alert("Solo puedes eliminar tus propias citas.");
                    return;
                }

                if (confirm("¿Deseas eliminar esta reserva?")) {
                    gestor.eliminarCita(info.event.id);
                    gestor.guardarEnLocalStorage();
                    info.event.remove();
                }
            },


            events: obtenerEventosDesdeGestor()
        });
        calendar.render();
    });


});