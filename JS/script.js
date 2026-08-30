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

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.type = "button";
    botonEliminar.classList.add("boton-eliminar");

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
    const categoria = document.getElementById("categoriaCofre").value;
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
    if (evento.target.classList.contains("boton-eliminar")) {
        evento.target.closest("tr").remove();
        guardarInventario();
    }
});

cargarInventario();