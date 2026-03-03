import { Paciente } from "./Paciente.js";
import { Medico } from "./Medico.js";
import { Cita } from "./Cita.js";

export class GestorCitas {

    constructor() {
        this.pacientes = [];
        this.medicos = [];
        this.citas = [];
    }

    // ============================================================
    // PACIENTES
    // ============================================================

    agregarPaciente(paciente) {
        this.pacientes.push(paciente);
    }

    eliminarPaciente(id) {
        this.pacientes = this.pacientes.filter(p => p.id !== id);
        this.citas = this.citas.filter(c => c.pacienteId !== id);
    }

    buscarPacientePorId(id) {
        return this.pacientes.find(p => p.id === id);
    }

    buscarPacientePorNombre(nombre) {
        return this.pacientes.filter(p =>
            p.nombre.toLowerCase().includes(nombre.toLowerCase()) ||
            p.apellidos.toLowerCase().includes(nombre.toLowerCase())
        );
    }

    // ============================================================
    // MÉDICOS
    // ============================================================

    agregarMedico(medico) {
        this.medicos.push(medico);
    }

    eliminarMedico(id) {
        this.medicos = this.medicos.filter(m => m.id !== id);
        this.citas = this.citas.filter(c => c.medicoId !== id);
    }

    buscarMedicoPorId(id) { 
        return this.medicos.find(m => m.id === id || m.id_med === id); 
    }

    buscarMedicoPorEspecialidad(especialidad) {
        return this.medicos.filter(m =>
            m.especialidad.toLowerCase().includes(especialidad.toLowerCase())
        );
    }

    // ============================================================
    // CITAS
    // ============================================================

    agregarCita(cita) {
        this.citas.push(cita);
    }

    eliminarCita(id) {
        this.citas = this.citas.filter(c => c.id !== id);
    }

    citasPorPaciente(idPaciente) {
        return this.citas.filter(c => c.pacienteId === idPaciente);
    }

    citasPorMedico(idMedico) {
        return this.citas.filter(c => c.medicoId === idMedico);
    }

    citasFuturas() {
        return this.citas.filter(c => c.esFutura());
    }

    citasPorFecha(fecha) {
        return this.citas.filter(c =>
            c.inicio.toISOString().slice(0, 10) === fecha
        );
    }

    // ============================================================
    // SINCRONIZACIÓN LOCALSTORAGE
    // ============================================================

    guardarEnLocalStorage() {
        const datos = {
            pacientes: this.pacientes,
            medicos: this.medicos,
            citas: this.citas
        };

        localStorage.setItem("gestorCitas", JSON.stringify(datos));
    }

    cargarDesdeLocalStorage() {
        const datos = JSON.parse(localStorage.getItem("gestorCitas"));
        if (!datos) return;

        this.pacientes = datos.pacientes.map(p =>
            new Paciente(p.id, p.nombre, p.apellidos, p.dni, p.telefono, p.email)
        );

        this.medicos = datos.medicos.map(m =>
            new Medico(m.id, m.nombre, m.apellidos, m.especialidad, m.telefono)
        );

        this.citas = datos.citas.map(c =>
            new Cita(c.id, c.pacienteId, c.medicoId, c.inicio, c.fin, c.estado)
        );
    }

    // ============================================================
    // IMPORTACIÓN DESDE JSON
    // ============================================================

    cargarPacientesDesdeJSON(lista) {
        lista.forEach(p => {
            this.agregarPaciente(
                new Paciente(p.id, p.nombre, p.apellidos, p.dni, p.telefono, p.email)
            );
        });
    }

    cargarMedicosDesdeJSON(lista) {
        lista.forEach(m => {
            this.agregarMedico(
                new Medico(m.id, m.nombre, m.apellidos, m.especialidad,m.telefono)
            );
        });
    }

    cargarCitasDesdeJSON(lista) {
        lista.forEach(c => {
            this.agregarCita(
                new Cita(c.id, c.pacienteId, c.medicoId, c.inicio, c.fin, c.estado)
            );
        });
    }
}
