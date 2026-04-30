import { GestorCitas } from "../js/clases/GestionaCitas.js";
import { Cita } from "../js/clases/Cita.js";
import { crearModalAgenda, crearModalCita } from "./dom.js";

// --- Inicialización y Variables Globales ---
const modalCita = crearModalCita();
const modalAgenda = crearModalAgenda();
const gestor = new GestorCitas();
let pacienteLogueado = null;
let citaSeleccionada = null;
let calendar;

const login = document.getElementById("login");
const pass = document.getElementById("pass");
const mensajeAyuda = document.getElementById("ayudaContra");
const saludo = document.getElementById("texto");
const err = document.getElementById("err");
let comprobante = false;
let rolLogeado = null;

// --- Funciones de Utilidad ---

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

function cleanErr() {
    err.innerHTML = "";
}

// --- Lógica de Médicos: Ver Agenda ---

function mostrarAgendaMedico(fechaStr) {
    //Filtrar citas igual que antes
    const agenda = gestor.citas.filter(c => {
        const d = new Date(c.inicio);
        const fechaCita = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return String(c.medicoId) === String(pacienteLogueado.id) && fechaCita === fechaStr;
    });

    //Ordenar
    agenda.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

    //Pasar datos al modal y abrir
    modalAgenda.renderizar(fechaStr, agenda, gestor,pacienteLogueado);
    modalAgenda.abrir();
}

// --- Gestión de Datos ---

async function cargarDatosIniciales() {
    try {
        await Promise.all([
            fetch("../server/pacientes.json").then(r => r.json()).then(data => gestor.cargarPacientesDesdeJSON(data)),
            fetch("../server/medicos.json").then(r => r.json()).then(data => gestor.cargarMedicosDesdeJSON(data)),
            fetch("../server/citas.json").then(r => r.json()).then(data => gestor.cargarCitasDesdeJSON(data))
        ]);
        gestor.guardarEnLocalStorage();
    } catch (e) {
        console.error("Error cargando archivos JSON", e);
    }
}

async function guardarEnJson() {
    try {
        await fetch('../server/pintarCitas.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gestor.citas)
        });
    } catch (error) {
        err.innerHTML = "Error al sincronizar con el servidor.";
    }
}

// Hacemos que no nos salga nada sin logearnos y que al logearnos con usuario podamos ver nuestras citas
function obtenerEventosDesdeGestor() {
    if (!comprobante || !pacienteLogueado) return [];

    let citasAMostrar = [];

    // Detectamos el ID del usuario logueado (sea paciente o médico)
    // Usamos || para buscar nombres alternativos si .id falla
    const idLogueado = String(pacienteLogueado.id || pacienteLogueado.idMedico);

    if (rolLogeado === "medico") {
        // Filtramos el medicoId de la cita debe ser igual al ID del médico logueado
        citasAMostrar = gestor.citas.filter(c => String(c.medicoId) === idLogueado);
    } else if (rolLogeado === "paciente") {
        // El pacienteId de la cita debe ser igual al ID del paciente logueado
        citasAMostrar = gestor.citas.filter(c => String(c.pacienteId) === idLogueado);
    }

    // Mapeamos a formato FullCalendar
    return citasAMostrar.map(c => {
        const paciente = gestor.buscarPacientePorId(c.pacienteId);
        const medico = gestor.buscarMedicoPorId(c.medicoId);
        const yaPaso = new Date(c.inicio) < new Date();

        return {
            id: String(c.id),
            title: `${paciente?.nombre || "P"} - ${medico?.nombre || "M"}`,
            start: c.inicio,
            end: c.fin,
            backgroundColor: yaPaso ? "#003d21" : "#006e3b",
            borderColor: yaPaso ? "#666" : "#000",
            textColor: "white"
        };
    });
}

// --- Autenticación ---

document.getElementById("btn-login-user").addEventListener("click", function () {
    cleanErr();
    const nombreIntroducido = login.value.trim().toLowerCase();
    const passIntroducida = pass.value.trim();

    if (!nombreIntroducido || !passIntroducida) {
        err.innerHTML = "Los campos no pueden estar vacíos";
        return;
    }

    const paciente = gestor.pacientes.find(p => p.nombre.toLowerCase() === nombreIntroducido);
    const medico = gestor.medicos.find(m => m.nombre.toLowerCase() === nombreIntroducido);

    let usuarioEncontrado = null;

    if (paciente) {
        rolLogeado = "paciente";
        usuarioEncontrado = paciente;
    } else if (medico) {
        rolLogeado = "medico";
        usuarioEncontrado = medico;
    } else {
        err.innerHTML = "Usuario no registrado";
        return;
    }

    if (usuarioEncontrado.dni !== passIntroducida) {
        err.innerHTML = "Contraseña incorrecta";
        return;
    }

    pacienteLogueado = usuarioEncontrado;
    comprobante = true;

    const nombreDisplay = rolLogeado === "paciente" ? pacienteLogueado.getNombreCompleto() : `Dr. ${pacienteLogueado.getNombreCompleto()}`;
    saludo.innerHTML = `Bienvenid@ (${rolLogeado}): ${nombreDisplay}`;

    // REFRESCAR CALENDARIO AL LOGUEAR
    if (calendar) {
        calendar.setOption('selectable', rolLogeado === "paciente");
        calendar.removeAllEvents();
        calendar.addEventSource(obtenerEventosDesdeGestor());
    }
});

document.getElementById("btn-logout").addEventListener("click", function () {
    if (comprobante) {
        saludo.innerHTML = "Cerrando sesión...";
        setTimeout(() => {
            pacienteLogueado = null;
            rolLogeado = null;
            comprobante = false;
            saludo.innerHTML = "";
            login.value = "";
            pass.value = "";
            if (calendar) {
                calendar.setOption('selectable', false);
                calendar.removeAllEvents();
            }
        }, 500);
    }
});

// --- Calendario FullCalendar ---

document.addEventListener('DOMContentLoaded', function () {
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

            selectAllow: function (info) {
                const hoy = new Date();
                return info.start >= hoy && (info.end - info.start <= 900000);
            },
            dateClick: function (info) {
                // Solo si el usuario es médico y está logueado
                if (comprobante && rolLogeado === "medico") {
                    // info.dateStr devuelve algo como "2023-10-25" o "2023-10-25T10:30:00"
                    // Sacamos solo la fecha (YYYY-MM-DD)
                    const fechaSeleccionada = info.dateStr.split("T")[0];
                    mostrarAgendaMedico(fechaSeleccionada);
                }
            },

            // Crear Reserva
            select: function (info) {
                cleanErr();

                // Solo los pacientes reservan
                if (rolLogeado !== "paciente") {
                    calendar.unselect();
                    return;
                }

                // OBTENER EL DÍA QUE SE ESTÁ INTENTANDO RESERVAR (YYYY-MM-DD)
                const fechaIntento = info.startStr.split("T")[0];

                // COMPROBAR SI EL PACIENTE YA TIENE UNA CITA ESE DÍA
                const yaTieneCita = gestor.citas.some(c => {
                    const mismoPaciente = String(c.pacienteId) === String(pacienteLogueado.id);
                     // startsWith como solo funciona con string tenemos que trasformar el tipo date a string
                    const mismaFecha = c.inicio.toISOString().startsWith(fechaIntento); 
                    return mismoPaciente && mismaFecha;
                });

                if (yaTieneCita) {
                    err.innerHTML = "Lo sentimos, no puedes tener más de una cita el mismo día.";
                    calendar.unselect();
                    return; // Detenemos la ejecución aquí
                }

                // Si el paciente no dispone de cita ese dia se le asignamos
                const medicoId = Math.floor(Math.random() * 10) + 1;
                const nuevaCita = new Cita(Date.now(), pacienteLogueado.id, medicoId, info.startStr, info.endStr, "pendiente");

                gestor.agregarCita(nuevaCita);
                gestor.guardarEnLocalStorage();

                calendar.addEvent({
                    id: String(nuevaCita.id),
                    title: `${pacienteLogueado.nombre} - ${gestor.buscarMedicoPorId(medicoId).nombre}`,
                    start: nuevaCita.inicio,
                    end: nuevaCita.fin,
                    backgroundColor: "#003d21"
                });

                guardarEnJson();
                calendar.unselect();
            },

            eventClick: function (info) {
                cleanErr();
                const cita = gestor.citas.find(c => String(c.id) === String(info.event.id));

                if (!cita) return;

                // VALIDACIÓN DE PERMISOS 
                let tienePermiso = false;
                const idActivo = String(pacienteLogueado.id);

                if (rolLogeado === "medico") {
                    tienePermiso = (String(cita.medicoId) === idActivo);
                } else if (rolLogeado === "paciente") {
                    tienePermiso = (String(cita.pacienteId) === idActivo);
                }

                if (!tienePermiso) {
                    err.innerHTML = "No tienes permiso para gestionar esta cita.";
                    return;
                }

                citaSeleccionada = cita;
                const nombrePaciente = gestor.buscarPacientePorId(cita.pacienteId).getNombreCompleto();
                const nombreMedico = gestor.buscarMedicoPorId(cita.medicoId).getNombreCompleto();

                modalCita.setDatos(nombrePaciente, nombreMedico, formatearFecha(cita.inicio), formatearFecha(cita.fin));
                modalCita.abrir();
            },
            events: [] // Se cargan al hacer login
        });

        calendar.render();
    });
});

// --- Acciones del Modal ---

document.getElementById("btnCerrar").onclick = () => modalCita.cerrar();

document.getElementById("btnEliminar").onclick = async () => {
    if (!citaSeleccionada) return;
    if (confirm("¿Seguro que deseas eliminar esta cita?")) {
        gestor.eliminarCita(citaSeleccionada.id);
        gestor.guardarEnLocalStorage();
        const evento = calendar.getEventById(String(citaSeleccionada.id));
        if (evento) evento.remove();
        await guardarEnJson();
        modalCita.cerrar();
    }
};

document.getElementById("btnModificar").onclick = async () => {
    if (!citaSeleccionada) return;
    cleanErr();

    if (rolLogeado === "medico") {
        const nuevoEstado = prompt("Nuevo estado (realizada/no realizada):", citaSeleccionada.estado).toLowerCase();


        if (nuevoEstado === "realizada" || nuevoEstado === "no realizada") {

            if (nuevoEstado) {
                citaSeleccionada.estado = nuevoEstado;
                gestor.guardarEnLocalStorage();
                await guardarEnJson();
                modalCita.cerrar();
            }
            return;
        } else {
            err.innerHTML = "No puedes escribir otra cosa diferente a (realizada/no realizada)";
            return;
        }
    }

    // Lógica de modificación para pacientes...
    const nuevoInicioStr = prompt("Nuevo inicio (YYYY-MM-DD HH:mm:ss):", formatearFecha(citaSeleccionada.inicio));
    const nuevoFinStr = prompt("Nuevo fin (YYYY-MM-DD HH:mm:ss):", formatearFecha(citaSeleccionada.fin));

    if (nuevoInicioStr && nuevoFinStr) {
        const fechaInicioObj = new Date(nuevoInicioStr.replace(" ", "T"));
        const fechaFinObj = new Date(nuevoFinStr.replace(" ", "T"));

        if (isNaN(fechaInicioObj.getTime()) || fechaInicioObj >= fechaFinObj) {
            err.innerHTML = "Fechas inválidas.";
            return;
        }

        citaSeleccionada.inicio = fechaInicioObj.toISOString();
        citaSeleccionada.fin = fechaFinObj.toISOString();

        const ev = calendar.getEventById(String(citaSeleccionada.id));
        if (ev) ev.setDates(fechaInicioObj, fechaFinObj);

        gestor.guardarEnLocalStorage();
        await guardarEnJson();
        modalCita.cerrar();
    }
};

// --- Efectos Visuales ---

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