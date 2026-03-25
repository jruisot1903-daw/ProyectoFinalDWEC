// =========================
// CREACIÓN DEL MODAL
// =========================

export function crearModalCita() {

    const modal = document.createElement("div");
    modal.id = "modalCita";
    Object.assign(modal.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.45)",
        display: "none",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "9999"
    });

    const contenido = document.createElement("div");
    Object.assign(contenido.style, {
        width: "340px",
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        fontFamily: "system-ui"
    });

    const titulo = document.createElement("h2");
    titulo.textContent = "Detalle de la cita";
    titulo.style.textAlign = "center";
    contenido.appendChild(titulo);

    // Función para crear filas
    function fila(label, id) {
        const f = document.createElement("div");
        Object.assign(f.style, {
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px"
        });

        const l = document.createElement("span");
        l.textContent = label;
        l.style.color = "#666";

        const v = document.createElement("span");
        v.id = id;

        f.appendChild(l);
        f.appendChild(v);
        return f;
    }

    contenido.appendChild(fila("Paciente:", "mPaciente"));
    contenido.appendChild(fila("Médico:", "mMedico"));
    contenido.appendChild(fila("Inicio:", "mInicio"));
    contenido.appendChild(fila("Fin:", "mFin"));

    // Botones
    const acciones = document.createElement("div");
    Object.assign(acciones.style, {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "20px"
    });

    function boton(texto, color, id) {
        const b = document.createElement("button");
        b.id = id;
        b.textContent = texto;
        Object.assign(b.style, {
            padding: "8px 12px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            background: color,
            color: "white"
        });
        return b;
    }

    acciones.appendChild(boton("Modificar", "#1976d2", "btnModificar"));
    acciones.appendChild(boton("Eliminar", "#d32f2f", "btnEliminar"));
    acciones.appendChild(boton("Cerrar", "#888", "btnCerrar"));

    contenido.appendChild(acciones);
    modal.appendChild(contenido);
    document.body.appendChild(modal);

    // =========================
    // FUNCIONES PÚBLICAS
    // =========================

    return {
        abrir: () => modal.style.display = "flex",
        cerrar: () => modal.style.display = "none",
        setDatos: (paciente, medico, inicio, fin) => {
            document.getElementById("mPaciente").textContent = paciente;
            document.getElementById("mMedico").textContent = medico;
            document.getElementById("mInicio").textContent = inicio;
            document.getElementById("mFin").textContent = fin;
        }
    };
}
    