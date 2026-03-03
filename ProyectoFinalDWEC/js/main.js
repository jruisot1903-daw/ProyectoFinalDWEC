let login = document.getElementById("login");
let pass = document.getElementById("pass");
let saludo = document.getElementById("texto");
let err = document.getElementById("err");
let comprobante = false;

document.getElementById("btn-login-user").addEventListener("click", function () {
    if (login.value == "" || pass.value == "") {
        err.innerHTML = "Los campos no pueden estar vacios"
        login.value = "";
        pass.value = "";
        saludo.innerHTML = "";

    } else if (login.value == "Soto" && pass.value == 1234) {
        err.innerHTML = "";
        saludo.innerHTML = "Bienvenid@: " + login.value;
        comprobante = true;
    } else {
        err.innerHTML = "EL usuario o la contraseña son incorrectos";
        login.value = "";
        pass.value = "";
    }

})

document.getElementById("btn-logout").addEventListener("click", function () {
    if (comprobante) {
        saludo.innerHTML = login.value + " estas saliendo...";
        setTimeout(function () {
            saludo.innerHTML = "";
            err.innerHTML = "";
            login.value = "";
            pass.value = "";
            comprobante = false;
        }, 500);
    }    else {
         err.innerHTML = "No puedes salir si no has iniciado sesión";
    
    }
})


// PRUEBAS CON API DE CALENDARIO FULLCALENDAR
document.addEventListener('DOMContentLoaded', function () {
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
            console.log(login.value);
            if (login.value) {
                calendar.addEvent({
                    title: login.value,
                    start: info.startStr,
                    end: info.endStr,
                    color: '#2c3e50'
                });
                console.log("Datos para el servidor:", {
                    inicio: info.startStr,
                    fin: info.endStr,
                    usuario: login.value
                });
            }
            calendar.unselect(); // Limpia la selección tras terminar
        },

        // Lógica al hacer clic en una cita existente
        eventClick: function (info) {
            if (confirm("¿Deseas eliminar esta reserva?")) {
                info.event.remove();
            }
        },

        // Carga de Reservas (Ejemplo de datos iniciales)
        events: [
            {
                title: 'Reserva',
                start: '2026-03-06T10:45:00',
                end: '2026-03-06T11:00:00',
                backgroundColor: '#e74c3c'
            }
        ]
    });

    calendar.render();
});