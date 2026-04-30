export class Medico {
    constructor(id, nombre, apellidos, especialidad, telefono,dni) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.especialidad = especialidad;
        this.telefono = telefono;
        this.dni = dni;
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellidos}`;
    }

    validarTelefono() {
        const regex = /^[0-9]{9}$/;
        return regex.test(this.telefono);
    }
}
