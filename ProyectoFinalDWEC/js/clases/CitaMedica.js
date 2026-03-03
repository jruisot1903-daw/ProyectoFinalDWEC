export class CitaMedica {
    constructor(id_cita, fecha_cita, hora_cita, id_med, DNI_paciente) {
        this.id_cita = id_cita;
        this.fecha_cita = fecha_cita;   
        this.hora_cita = hora_cita;     
        this.id_med = id_med;
        this.DNI_paciente = DNI_paciente;
    }

    getFechaCompleta() {
        return `${this.fecha_cita} ${this.hora_cita}`;
    }

    getDateObject() {
        return new Date(`${this.fecha_cita}T${this.hora_cita}`);
    }
    
}
