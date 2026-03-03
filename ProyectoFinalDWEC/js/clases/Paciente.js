export class Paciente {
    constructor(DNI, nombre, apellidos) {
        this.DNI = DNI;
        this.nombre = nombre;
        this.apellidos = apellidos;
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellidos}`;
    }

    validarDNI() {
        const regex = /^[0-9]{8}[A-Z]$/;
        return regex.test(this.DNI);
    }
}
