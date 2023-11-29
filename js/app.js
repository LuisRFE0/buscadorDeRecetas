document.addEventListener('DOMContentLoaded', iniciarApp);
function iniciarApp() {
    const selectCategorias = document.querySelector('#categorias');
    const resultado = document.querySelector('#resultado');
    const modal = new bootstrap.Modal('#modal', {});

    if (!seleccionarCategoria) {
        selectCategorias.addEventListener('change', seleccionarCategoria);

    }

    const favoritosDiv = document.querySelector('.favoritos');
    if (favoritosDiv) {
        obtenerFavoritos();
    }

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
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? e.titulo}`;
            recetaImagen.src = strMealThumb ?? e.imagen;


            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');


            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? e.titulo;


            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver receta';
            // recetaButton.dataset.bsTarget = '#modal';
            // recetaButton.dataset.bsToggle = 'modal';
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? e.id);
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



    function mostrarToat(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }



    function obtenerFavoritos() {


        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if (favoritos.length) {
            mostrarRecetas(favoritos);
            return
        }
        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No hay favoritos aun';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        resultado.appendChild(noFavoritos);
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



    /**
     * Destructuring a la receta traida del api y creacion de los elementos en html 
     * @param {receta} receta 
     */
    function mostrarModal(receta) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class='img-fluid' src="${strMealThumb}"/>
            <h3 class="my-3">Instrucciones</h3>
            <p class="">${strInstructions}</p>
            <h3 class='my-3'>Ingredientes y Cantidades</h3>
        `;


        //mostrar cantidades e ingredientes 
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        for (let i = 0; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLI = document.createElement('LI');
                ingredienteLI.classList.add('list-group-item');
                ingredienteLI.textContent = `${ingrediente} - ${cantidad}`;

                listGroup.appendChild(ingredienteLI);
            }
        }
        modalBody.appendChild(listGroup);


        //botones del modal
        crearBotonmodal(receta);

        modal.show();
    }

    /**
     * Crear botones de los modales 
     */
    function crearBotonmodal(receta) {
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col', 'btnM');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar favorito' : 'Guardar Favorito ';

        //Almacenar en local
        btnFavorito.onclick = function () {
            if (!existeStorage(idMeal)) {
                agregarFavotito(idMeal, strMeal, strMealThumb, strInstructions);
                btnFavorito.textContent = 'Eliminar Favorito'
                mostrarToat('Agregado correctamente');
            } else {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToat('Eliminado Correctamente');
                return;

            }
        };



        const btnCerrar = document.createElement('BUTTON');
        btnCerrar.classList.add('btn', 'btn-secondary', 'col', 'btnM');
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.onclick = () => modal.hide();

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrar);

    }

    function agregarFavotito(id, titulo, imagen, instrucciones) {
        const receta = {
            id, titulo, imagen, instrucciones
        }

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));


    }


    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);

    }


}

