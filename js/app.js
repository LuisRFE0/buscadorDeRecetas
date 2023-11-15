function iniciarApp() {
    const selectCategorias = document.querySelector('#categorias');
    const resultado = document.querySelector('#resultado');
    const modal = new bootstrap.Modal('#modal', {});
    selectCategorias.addEventListener('change', seleccionarCategoria)



    obtenerCategorias();
    /**
     * Api para obtener todas las categorias 
     */
    function obtenerCategorias() {
        fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    }

    /**
     * Mostrar las categorias recibidas de la api e inyectarlas en el select de html
     * @param {Categorias} categorias 
     */
    function mostrarCategorias(categorias = []) {
        categorias.forEach(e => {
            const option = document.createElement('option');
            option.value = e.strCategory;
            option.textContent = e.strCategory;
            selectCategorias.appendChild(option);
        });
    }

    /**
     * Api para recibir las recetas despues de seleccionar la categoria 
     * @param {*} e 
     */
    function seleccionarCategoria(e) {
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)

            .then(respuesta => respuesta.json())
            .then(resultado => {

                mostrarRecetas(resultado.meals)
            }
            )

    }

    /**
     * Mostrar las recestas en el html despues de obtenerlas de la api
     * @param {Recetas} platillos 
     */
    function mostrarRecetas(platillos = []) {
        limpiarHTML(resultado);

        platillos.forEach(e => {

            const { idMeal, strMeal, strMealThumb } = e;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal}`;
            recetaImagen.src = strMealThumb;


            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');


            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal;


            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver receta';
            // recetaButton.dataset.bsTarget = '#modal';
            // recetaButton.dataset.bsToggle = 'modal';
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal);
            }

            //Inyectar en html
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);



        })
    }

    /**
     * Borrar las recetas anteriores a la nueva seleccion de categoria
     * @param {Referencia} selector 
     */
    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }

    /**
     * Consoltar receta selecionada mediante la api 
     * @param {idReceta} id 
     */
    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarModal(resultado.meals[0]))
    }


    function mostrarModal(receta) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
        <img class='img-fluid' src="${strMealThumb}"/>
        <h3 class="my-3">Instrucciones</h3>
        <p class="">${strInstructions}</p>

        `



        modal.show();
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);