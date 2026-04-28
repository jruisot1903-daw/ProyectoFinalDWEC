export class Medico {
    constructor(id_med, nombre, apellidos,dni, especialidad, telefono) {
        this.id_med = id_med;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.especialidad = especialidad;
        this.telefono = telefono;
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellidos}`;
    }

    validarTelefono() {
        const regex = /^[0-9]{9}$/;
        return regex.test(this.telefono);
    }
}
