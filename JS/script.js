const formulario = document.getElementById("formularioCofre");
const cuerpoTabla = document.getElementById("cuerpoTabla");

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const numero = document.getElementById("numeroCofre").value;
    const categoria = document.getElementById("categoriaCofre").value;
    const cantidad = document.getElementById("cantidadItems").value;

    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${numero}</td>
        <td>${categoria}</td>
        <td>${cantidad}</td>
        <td>
            <button class="boton-eliminar" type="button">
                Eliminar
            </button>
        </td>
    `;

    cuerpoTabla.appendChild(fila);
    formulario.reset();
});

cuerpoTabla.addEventListener("click", function (evento) {
    if (evento.target.classList.contains("boton-eliminar")) {
        evento.target.closest("tr").remove();
    }
});