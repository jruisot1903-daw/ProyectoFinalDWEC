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
let saludo = document.getElementById("texto");
let err = document.getElementById("err");
let comprobante = false;
let citas = [];

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    // const opciones = {
    //     year: "numeric",
    //     month: "numeric",
    //     day: "numeric",  Lo tenia en español pero me daba fallo con las fechas y a la hora de trasformarlo donde ponia el dia lo cogia como el mes y viceversa
    //     hour: "2-digit",
    //     minute: "2-digit"
    // };
    return fecha.toLocaleString('en-CA', { hour12: false }); // lo ponemos en Canada para que nos salga en el formato que queremos YYY-MM-DD HH:MM:SS ya que si no fallaba
}

// function formatearFechaSistema(fecha){ Esto lo utilizaba antes cuando lo tenia en español para cuando lo ponia de una forma amigable para el cliente poder trasformarlo depues para el sistema
//     const d = new Date(fecha);  
//     return d.toISOString(); // trasformamos la fecha en una cadena de texto en el formato estandar para que lo reconozca el sistema
// }

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

        // const textoRaw = await respuesta.text(); // Primero leemos como texto para depurar
        
        // const resultado = JSON.parse(textoRaw);
        // console.log("Resultado:", resultado.message);
        
    } catch (error) {
        err.innerHTML= "Error detallado:", error;
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
            id: c.id,
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

document.getElementById("btnModificar").onclick = () => {
    if (!citaSeleccionada) return;

    // Pedimos los datos
    const nuevoInicioStr = prompt("Nueva fecha/hora inicio (Formato: YYYY-MM-DD HH:mm:ss):", formatearFecha(citaSeleccionada.inicio));
    const nuevoFinStr = prompt("Nueva fecha/hora fin (Formato: YYYY-MM-DD HH:mm:ss):", formatearFecha(citaSeleccionada.fin));

    if (nuevoInicioStr && nuevoFinStr) {
        // Convertimos el texto del prompt a objetos Date
        const fechaInicioObj = new Date(nuevoInicioStr);
        const fechaFinObj = new Date(nuevoFinStr);

        // Validamos que las fechas sean válidas antes de seguir
        if (isNaN(fechaInicioObj.getTime()) && isNaN(fechaFinObj.getTime())) {
            err.innerHTML = "Formato de fecha no válido. Usa: YYYY-MM-DD HH:mm:ss";
            return;
        }

        // Actualizar Gestor
        // Buscamos la cita por ID en tu array y actualizamos sus datos
        const citaEnArray = gestor.citas.find(c => c.id == citaSeleccionada.id);
        if (citaEnArray) {
            citaEnArray.inicio = fechaInicioObj;
            citaEnArray.fin = fechaFinObj;
            gestor.guardarEnLocalStorage();
        }
        const nuevaCita = new Cita(Date.now(), pacienteLogueado.id, citaSeleccionada.medicoId, fechaInicioObj, fechaFinObj, "pendiente");
        cita = nuevaCita;

        // Actualizar Calendario
        const eventoViejo = calendar.getEventById(citaSeleccionada.id);
        if (eventoViejo) {
            eliminarCitaJson(citaSeleccionada.id); // Eliminamos la cita ya que la cambiaremos por la nueva
            eventoViejo.remove(); // Eliminamos la posición antigua de la pantalla
        }

        // Necestiamos agregar la cita y guardarlo en el localStorage porque si no al cambiar la hora o la fecha de la cita nos aparecera en pantalla el cambio pero si queremos 
        // interactuar con la cita de nuevo nos dara fallo

        gestor.agregarCita(nuevaCita); gestor.guardarEnLocalStorage();

        // Añadimos la nueva posición
        calendar.addEvent({
            id: nuevaCita.id,
            title: `${pacienteLogueado.nombre} - ${gestor.buscarMedicoPorId(nuevaCita.medicoId).nombre}`,
            start: nuevaCita.inicio,
            end: nuevaCita.fin,
            backgroundColor: "#003d21"
        });
        guardarEnJson(); // guardamos la nueva cita en el .json
        calendar.unselect();
        
        modalCita.cerrar();
    }
};


function cleanErr() {
    err.innerHTML = "";
}