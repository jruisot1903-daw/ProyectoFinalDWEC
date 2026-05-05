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

// Verifica si el usuario actual es el Administrador General
function esAdmin() {
    return rolLogeado === "paciente" && String(pacienteLogueado?.id) === "1";
}

// --- Lógica de Médicos: Ver Agenda ---

function mostrarAgendaMedico(fechaStr) {
    const idLogueado = String(pacienteLogueado.id);

    const agenda = gestor.citas.filter(c => {
        const d = new Date(c.inicio);
        const fechaCita = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const esMismoDia = fechaCita === fechaStr;

        if (esAdmin()) {
            return esMismoDia;
        } else {
            return String(c.medicoId) === idLogueado && esMismoDia;
        }
    });

    agenda.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    modalAgenda.renderizar(fechaStr, agenda, gestor, pacienteLogueado);
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

function obtenerEventosDesdeGestor() {
    if (!comprobante || !pacienteLogueado) return [];

    let citasAMostrar = [];
    const idLogueado = String(pacienteLogueado.id);

    if (esAdmin()) {
        citasAMostrar = gestor.citas;
    } else if (rolLogeado === "medico") {
        citasAMostrar = gestor.citas.filter(c => String(c.medicoId) === idLogueado);
    } else if (rolLogeado === "paciente") {
        citasAMostrar = gestor.citas.filter(c => String(c.pacienteId) === idLogueado);
    }

    return citasAMostrar.map(c => {
        const paciente = gestor.buscarPacientePorId(c.pacienteId);
        const medico = gestor.buscarMedicoPorId(c.medicoId);
        const yaPaso = new Date(c.inicio) < new Date();

        return {
            id: String(c.id),
            title: esAdmin()
                ? `[P:${paciente?.nombre || "N/A"}] [Dr:${medico?.nombre || "N/A"}]`
                : `${paciente?.nombre || "P"} - ${medico?.nombre || "M"}`,
            start: c.inicio,
            end: c.fin,
            backgroundColor: yaPaso ? "#003d21" : "#006e3b",
            borderColor: esAdmin() ? "#ff0000" : (yaPaso ? "#666" : "#000"),
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

    if (paciente && paciente.dni === passIntroducida) {
        rolLogeado = "paciente";
        pacienteLogueado = paciente;
    } else if (medico && medico.dni === passIntroducida) {
        rolLogeado = "medico";
        pacienteLogueado = medico;
    } else {
        err.innerHTML = "Usuario no registrado o contraseña incorrecta";
        return;
    }

    comprobante = true;
    const nombreDisplay = pacienteLogueado.getNombreCompleto();
    const prefix = rolLogeado === "medico" ? "Dr. " : "";
    const adminTag = esAdmin() ? "ADMIN" : rolLogeado;

    saludo.innerHTML = `Bienvenid@ (${adminTag}): ${prefix}${nombreDisplay}`;

    if (calendar) {
        calendar.setOption('selectable', rolLogeado === "paciente" || esAdmin());
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

// --- Calendario ---

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
                // Solo si el usuario es médico y está logueado o si es Admin
                if (comprobante && (rolLogeado === "medico" || esAdmin())) {
                    mostrarAgendaMedico(info.dateStr.split("T")[0]);
                }
            },

            // Crear Reserva

            select: function (info) {
                cleanErr();

                //Solo pacientes o el Admin pueden crear citas

                if (rolLogeado !== "paciente" && !esAdmin()) {
                    calendar.unselect();
                    return;
                }

                let idPacienteAsignado = pacienteLogueado.id;

                if (esAdmin()) {
                    const busqueda = prompt("ADMIN: Introduce el DNI del paciente:");
                    if (!busqueda) { calendar.unselect(); return; }
                    const pEncontrado = gestor.pacientes.find(p => p.dni.toLowerCase() === busqueda.toLowerCase());
                    if (!pEncontrado) {
                        alert("Paciente no encontrado.");
                        calendar.unselect(); return;
                    }
                    idPacienteAsignado = pEncontrado.id;
                }

                // Restricción 1 cita/día
                const fechaIntento = info.startStr.split("T")[0];
                const yaTieneCita = gestor.citas.some(c => {
                    const d = new Date(c.inicio);
                    const fechaCita = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    return String(c.pacienteId) === String(idPacienteAsignado) && fechaCita === fechaIntento;
                });

                if (yaTieneCita) {
                    err.innerHTML = "Este paciente ya tiene una cita hoy.";
                    calendar.unselect(); return;
                }

                const medicoId = Math.floor(Math.random() * 10) + 1;
                const nuevaCita = new Cita(Date.now(), idPacienteAsignado, medicoId, info.startStr, info.endStr, "pendiente");

                gestor.agregarCita(nuevaCita);
                gestor.guardarEnLocalStorage();
                guardarEnJson();

                calendar.addEvent({
                    id: String(nuevaCita.id),
                    title: esAdmin() ? `[ADMIN] ${gestor.buscarPacientePorId(idPacienteAsignado).nombre}` : `${pacienteLogueado.nombre}`,
                    start: nuevaCita.inicio,
                    end: nuevaCita.fin,
                    backgroundColor: esAdmin() ? "#d32f2f" : "#003d21"
                });
                calendar.unselect();
            },
            eventClick: function (info) {
                cleanErr();
                const cita = gestor.citas.find(c => String(c.id) === String(info.event.id));
                if (!cita) return;

                const idActivo = String(pacienteLogueado.id);
                let tienePermiso = esAdmin() || (rolLogeado === "medico" && String(cita.medicoId) === idActivo) || (rolLogeado === "paciente" && String(cita.pacienteId) === idActivo);

                if (!tienePermiso) {
                    err.innerHTML = "No tienes permiso.";
                    return;
                }

                citaSeleccionada = cita;
                modalCita.setDatos(
                    gestor.buscarPacientePorId(cita.pacienteId).getNombreCompleto(),
                    gestor.buscarMedicoPorId(cita.medicoId).getNombreCompleto(),
                    formatearFecha(cita.inicio),
                    formatearFecha(cita.fin));
                modalCita.abrir();
            }
        });
        calendar.render();
    });
});

// --- Acciones del Modal Cita ---

document.getElementById("btnCerrar").onclick = () => modalCita.cerrar();

document.getElementById("btnEliminar").onclick = async () => {
    if (!citaSeleccionada) return;
    if (confirm("¿Eliminar cita?")) {
        gestor.eliminarCita(citaSeleccionada.id);
        gestor.guardarEnLocalStorage();
        calendar.getEventById(String(citaSeleccionada.id))?.remove();
        await guardarEnJson();
        modalCita.cerrar();
    }
};

document.getElementById("btnModificar").onclick = async () => {
    if (!citaSeleccionada) return;
    cleanErr();
    let eleccionAdmin = "";

    if (esAdmin()) {
        eleccionAdmin = prompt("1. Modo Médico (Estado)\n2. Modo Paciente (Horarios)");
        if (eleccionAdmin !== "1" && eleccionAdmin !== "2") {
            err.innerHTML = "Opción inválida.";
            return;
        }
    }

    //Lógica de Médico (Estado) 

    if (rolLogeado === "medico" || eleccionAdmin === "1") {
        const estado = prompt("Estado (realizada/no realizada):", citaSeleccionada.estado)?.toLowerCase();
        if (estado === "realizada" || estado === "no realizada") {
            citaSeleccionada.estado = estado;
            gestor.guardarEnLocalStorage();
            await guardarEnJson();
            modalCita.cerrar();
            return;
        } else {
            err.innerHTML = "Estado no válido.";
            return;
        }
    }

    // Lógica de Paciente (Horarios)

    else if (rolLogeado === "paciente" || eleccionAdmin === "2") {
        const ini = prompt("Inicio (YYYY-MM-DD HH:mm:ss):", formatearFecha(citaSeleccionada.inicio));
        const fin = prompt("Fin (YYYY-MM-DD HH:mm:ss):", formatearFecha(citaSeleccionada.fin));

        if (ini && fin) {
            citaSeleccionada.inicio = new Date(ini.replace(" ", "T")).toISOString();
            citaSeleccionada.fin = new Date(fin.replace(" ", "T")).toISOString();

            // Actualizar visualmente en el calendario
            const eventoCalendario = calendar.getEventById(String(citaSeleccionada.id));
            if (eventoCalendario) {
                eventoCalendario.setDates(citaSeleccionada.inicio, citaSeleccionada.fin);
            }

            gestor.guardarEnLocalStorage();
            await guardarEnJson();
            modalCita.cerrar();
        }
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