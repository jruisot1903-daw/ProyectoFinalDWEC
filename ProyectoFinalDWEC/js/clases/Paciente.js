export class Paciente {
    constructor(id, nombre, apellidos, dni, telefono, email) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.telefono = telefono;
        this.email = email;
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellidos}`;
    }

    // Ejemplo de validación usando regex
    validarDNI() {
        const regex = /^[0-9]{8}[A-Z]$/;
        return regex.test(this.dni);
    }

    validarTelefono() {
        const regex = /^[679][0-9]{8}$/;
        return regex.test(this.telefono);
    }

    validarEmail() {
        const regex = /^[\w.-]+@[\w.-]+\.\w{2,4}$/;
        return regex.test(this.email);
    }
}

