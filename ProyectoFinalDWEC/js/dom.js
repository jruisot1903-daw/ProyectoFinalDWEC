// =========================
// CREACIÓN DEL MODAL
// =========================

export function crearModalCita() {

    const modal = createNode("div");
    modal.id = "modalCita";
    modal.style.position =  "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.45)";
    modal.style.display = "none";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "9999";

    const contenido = createNode("div");

    contenido.style.width = "340px";
    contenido.style.background = "white";
    contenido.style.padding = "20px";
    contenido.style.borderRadius = "12px";
    contenido.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
    contenido.style.fontFamily = "system-ui";

    const titulo = createNode("h2","Detalle de la cita");
    titulo.style.textAlign = "center";
    contenido.appendChild(titulo);

    // Función para crear filas
    function fila(label, id) {
        const f = createNode("div");
        f.style.display = "flex";
        f.style.justifyContent = "space-between";
        f.style.marginBottom = "10px";

        const l = createNode("span");
        l.textContent = label;
        l.style.color = "#666";

        const v = createNode("span");
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
    const acciones = createNode("div");

    acciones.style.display = "flex";
    acciones.style.justifyContent = "space-between";
    acciones.style.marginTop = "20px";

    function boton(texto, color, id) {
        const b = createNode("button",texto);
        b.id = id;
        b.style.padding = "8px 12px";
        b.style.border = "none";
        b.style.borderRadius = "6px";
        b.style.cursor = "pointer";
        b.style.background = color;
        b.style.color = "white";
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


function createNode(tipoNodo, tipoTexto) {
  let nodo;
  let nodoText;

  switch (arguments.length) {
    case 0:
      throw "Se necesita al menos el tipo de elemento a crear.";
      break;
    case 1:
      nodo = document.createElement(tipoNodo);
      break;
    case 2:
      nodo = document.createElement(tipoNodo);
      nodoText = document.createTextNode(tipoTexto);
      nodo.appendChild(nodoText);
      break;
  }

  return nodo;
}
    