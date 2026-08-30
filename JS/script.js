const formulario = document.getElementById("formularioCofre");
const cuerpoTabla = document.getElementById("cuerpoTabla");

const CLAVE_ALMACENAMIENTO = "inventarioMinecraft";

function crearFila(numero, categoria, cantidad) {
    const fila = document.createElement("tr");

    const celdaNumero = fila.insertCell();
    const celdaCategoria = fila.insertCell();
    const celdaCantidad = fila.insertCell();
    const celdaAcciones = fila.insertCell();

    celdaNumero.textContent = numero;
    celdaCategoria.textContent = categoria;
    celdaCantidad.textContent = cantidad;

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.type = "button";
    botonEditar.classList.add("boton-editar");

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.type = "button";
    botonEliminar.classList.add("boton-eliminar");

    celdaAcciones.appendChild(botonEditar);
    celdaAcciones.appendChild(botonEliminar);
    cuerpoTabla.appendChild(fila);
}

function guardarInventario() {
    const cofres = [];

    cuerpoTabla.querySelectorAll("tr").forEach(function (fila) {
        const celdas = fila.querySelectorAll("td");

        cofres.push({
            numero: celdas[0].textContent,
            categoria: celdas[1].textContent,
            cantidad: celdas[2].textContent
        });
    });

    localStorage.setItem(
        CLAVE_ALMACENAMIENTO,
        JSON.stringify(cofres)
    );
}

function cargarInventario() {
    const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (datosGuardados === null) {
        guardarInventario();
        return;
    }

    const cofres = JSON.parse(datosGuardados);
    cuerpoTabla.innerHTML = "";

    cofres.forEach(function (cofre) {
        crearFila(
            cofre.numero,
            cofre.categoria,
            cofre.cantidad
        );
    });
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const numero = document.getElementById("numeroCofre").value;
    const categoria = document.getElementById("categoriaCofre").value.trim();
    const cantidad = document.getElementById("cantidadItems").value;

    const numeroRepetido = Array.from(
        cuerpoTabla.querySelectorAll("tr")
    ).some(function (fila) {
        return fila.cells[0].textContent === numero;
    });

    if (numeroRepetido) {
        alert("Ya existe un cofre con ese número.");
        return;
    }

    crearFila(numero, categoria, cantidad);
    guardarInventario();
    formulario.reset();
});

cuerpoTabla.addEventListener("click", function (evento) {
    const fila = evento.target.closest("tr");

    if (evento.target.classList.contains("boton-editar")) {
        const categoriaActual = fila.cells[1].textContent;
        const cantidadActual = fila.cells[2].textContent;

        const nuevaCategoria = prompt(
            "Nueva categoría:",
            categoriaActual
        );

        if (nuevaCategoria === null) {
            return;
        }

        if (nuevaCategoria.trim() === "") {
            alert("La categoría no puede quedar vacía.");
            return;
        }

        const nuevaCantidad = prompt(
            "Nueva cantidad de ítems:",
            cantidadActual
        );

        if (nuevaCantidad === null) {
            return;
        }

        const cantidadNumero = Number(nuevaCantidad);

        if (
            nuevaCantidad.trim() === "" ||
            !Number.isInteger(cantidadNumero) ||
            cantidadNumero < 0
        ) {
            alert("La cantidad debe ser un número entero válido.");
            return;
        }

        fila.cells[1].textContent = nuevaCategoria.trim();
        fila.cells[2].textContent = cantidadNumero;
        guardarInventario();
    }

    if (evento.target.classList.contains("boton-eliminar")) {
        fila.remove();
        guardarInventario();
    }
});

cargarInventario();