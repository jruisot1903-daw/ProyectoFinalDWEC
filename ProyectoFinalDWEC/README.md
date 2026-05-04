# Sistema de Gestión de Citas - Hospital de Antequera

Aplicación web interactiva para la gestión de consultas médicas, desarrollada con la identidad corporativa de la **Junta de Andalucía**.

---

## Descripción del Proyecto
La aplicación cuenta con una pantalla principal de acceso global. Al interactuar con ella, el usuario accede al sistema de calendario con su usuario ya sea **paciente** o **medico**, permitiendo una gestión integral de citas en tiempo real.

## Stack Técnico y Estructura
- **Interfaz:** HTML5, CSS3 y Manipulación del DOM.
- **Librerías:** FullCalendar API.
- **Persistencia de Datos:** 
  - `localStorage` para sesiones y estados rápidos.
  - Archivos `.json` (Simulación de BBDD): `Medicos.json`, `Citas.json`, `Pacientes.json`.
- **Comunicación:** Fetch API con Promesas (`Promise.all`).

---

## Modelo de Datos (Clases)
- **Medico:** `id_med`, `nombre`, `apellidos`, `especialidad`, `telefono`, `dni_medico`.
- **Cita_medica:** `id_cita`, `fecha_cita`, `hora_cita`, `id_med`, `DNI_paciente`.
- **Paciente:** `DNI`, `nombre`, `apellidos`.

---

## Funcionalidades Implementadas
- [x] **Gestión de Citas:** Crear, borrar y modificar citas con actualización en el JSON.
- [x] **Lógica de Validación:** 
  - Tramos horarios estrictos (cada 15 min).
  - Control de duplicidad (un paciente no puede repetir cita el mismo día con el mismo médico).
- [x] **Perfiles Diferenciados:** 
  - **Pacientes:** Reservan y editan sus propias citas.
  - **Médicos:** Visualizan agenda diaria en lista y gestionan estados de la cita (Realizada/No realizada).
- [x] **Diseño:** Ventanas auxiliares mediante modales dinámicos y estilos corporativos oficiales.

---

## Eventos de Usuario

| Evento | Descripción |
| :--- | :--- |
| **Click** | Navegación, login y gestión de modales. |
| **Mouseover/out** | Feedback visual: las citas cambian a colores aleatorios. |
| **Keyup (Enter)** | Personalización estética: cambia el color de la UI de la flecha y la linea del calendario aleatoriamente. |
| **Focus/Blur** | Mensaje de ayuda dinámico en el campo de contraseña (DNI). |

---

## Flujo de Trabajo
1. **Inicio:** Click en cualquier punto para entrar al calendario.
2. **Login:** El sistema detecta el rol mediante el DNI.
3. **Uso Paciente:** Click en hueco libre para reservar. Click en cita propia para editar/borrar.
4. **Uso Médico:** Click en bordes/huecos para ver lista diaria ordenada. Click en cita para cambiar estado.

---

## Notas de Desarrollo
> [!IMPORTANT]
> **Gestión Horaria:** Se ha detectado un desfase de 2 horas al guardar en el JSON mediante `toLocaleString` (diferencia Meridiano vs Dispositivo). El sistema lo corrige automáticamente en la visualización web.

> [!NOTE]
> Actualmente, el sistema trata a todos los especialistas bajo la lógica de "Médico de Cabecera" para restringir el exceso de citas diarias por paciente.


> [!NOTE]
> Se Dispondra de un Usuario general , el cual podra ver todas las reservas de todos los pacientes, y tendra total libertad para modificar / crearlas /borrar citas.

