import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDW3izXi3iKhkN5_mnY5oFngvPcOG7SfX4",
    authDomain: "trabajo-en-la-nube-51283.firebaseapp.com",
    projectId: "trabajo-en-la-nube-51283",
    storageBucket: "trabajo-en-la-nube-51283.firebasestorage.app",
    messagingSenderId: "227996026545",
    appId: "1:227996026545:web:90fa728d70d75a74a94490"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const cofresRef = collection(db, "cofres");

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

function obtenerFilasActuales() {
    return Array.from(cuerpoTabla.querySelectorAll("tr")).map(function (fila) {
        return {
            numero: fila.cells[0].textContent.trim(),
            categoria: fila.cells[1].textContent.trim(),
            cantidad: Number(fila.cells[2].textContent)
        };
    });
}

async function importarInventarioInicial() {
    const datosNube = await getDocs(cofresRef);

    if (!datosNube.empty) {
        return;
    }

    let cofres = [];
    const datosLocales = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (datosLocales !== null) {
        try {
            cofres = JSON.parse(datosLocales).map(function (cofre) {
                return {
                    numero: String(cofre.numero).trim(),
                    categoria: String(cofre.categoria).trim(),
                    cantidad: Number(cofre.cantidad)
                };
            });
        } catch (error) {
            cofres = [];
        }
    }

    if (cofres.length === 0) {
        cofres = obtenerFilasActuales();
    }

    cofres = cofres.filter(function (cofre) {
        return (
            cofre.numero !== "" &&
            cofre.categoria !== "" &&
            Number.isInteger(cofre.cantidad) &&
            cofre.cantidad >= 0
        );
    });

    if (cofres.length === 0) {
        return;
    }

    const lote = writeBatch(db);

    cofres.forEach(function (cofre) {
        lote.set(doc(db, "cofres", cofre.numero), cofre);
    });

    await lote.commit();
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const numero = document.getElementById("numeroCofre").value.trim();
    const categoria = document.getElementById("categoriaCofre").value.trim();
    const cantidad = Number(document.getElementById("cantidadItems").value);

    if (numero === "" || categoria === "") {
        alert("Completa todos los campos.");
        return;
    }

    if (!Number.isInteger(cantidad) || cantidad < 0) {
        alert("La cantidad debe ser un número entero válido.");
        return;
    }

    try {
        const referenciaCofre = doc(db, "cofres", numero);
        const cofreExistente = await getDoc(referenciaCofre);

        if (cofreExistente.exists()) {
            alert("Ya existe un cofre con ese número.");
            return;
        }

        await setDoc(referenciaCofre, {
            numero: numero,
            categoria: categoria,
            cantidad: cantidad
        });

        formulario.reset();
    } catch (error) {
        console.error(error);
        alert("No se pudo guardar el cofre en Firebase.");
    }
});

cuerpoTabla.addEventListener("click", async function (evento) {
    const fila = evento.target.closest("tr");

    if (fila === null) {
        return;
    }

    const numero = fila.cells[0].textContent.trim();

    if (evento.target.classList.contains("boton-editar")) {
        const categoriaActual = fila.cells[1].textContent;
        const cantidadActual = fila.cells[2].textContent;

        const nuevaCategoria = prompt("Nueva categoría:", categoriaActual);

        if (nuevaCategoria === null) {
            return;
        }

        if (nuevaCategoria.trim() === "") {
            alert("La categoría no puede quedar vacía.");
            return;
        }

        const nuevaCantidad = prompt("Nueva cantidad de ítems:", cantidadActual);

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

        try {
            await updateDoc(doc(db, "cofres", numero), {
                categoria: nuevaCategoria.trim(),
                cantidad: cantidadNumero
            });
        } catch (error) {
            console.error(error);
            alert("No se pudo editar el cofre en Firebase.");
        }
    }

    if (evento.target.classList.contains("boton-eliminar")) {
        const confirmar = confirm("¿Quieres eliminar el cofre " + numero + "?");

        if (!confirmar) {
            return;
        }

        try {
            await deleteDoc(doc(db, "cofres", numero));
        } catch (error) {
            console.error(error);
            alert("No se pudo eliminar el cofre de Firebase.");
        }
    }
});

async function iniciarInventario() {
    try {
        await importarInventarioInicial();

        onSnapshot(
            cofresRef,
            function (resultado) {
                const cofres = resultado.docs.map(function (documento) {
                    return documento.data();
                });

                cofres.sort(function (a, b) {
                    const diferencia = Number(a.numero) - Number(b.numero);

                    if (!Number.isNaN(diferencia) && diferencia !== 0) {
                        return diferencia;
                    }

                    return String(a.numero).localeCompare(String(b.numero));
                });

                cuerpoTabla.innerHTML = "";

                cofres.forEach(function (cofre) {
                    crearFila(cofre.numero, cofre.categoria, cofre.cantidad);
                });
            },
            function (error) {
                console.error(error);
                alert("No se pudo leer el inventario desde Firebase. Revisa las reglas de Firestore.");
            }
        );
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con Firebase. Revisa la configuración y las reglas.");
    }
}

iniciarInventario();