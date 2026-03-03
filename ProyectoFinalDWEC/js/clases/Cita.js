export class Cita {
    constructor(id, pacienteId, medicoId, inicio, fin, estado = "pendiente") {
        this.id = id;
        this.pacienteId = pacienteId;
        this.medicoId = medicoId;
        this.inicio = new Date(inicio);
        this.fin = new Date(fin);
        this.estado = estado;
    }

    duracionMinutos() {
        return (this.fin - this.inicio) / 1000 / 60;
    }

    esFutura() {
        return this.inicio >= new Date();
    }
}

