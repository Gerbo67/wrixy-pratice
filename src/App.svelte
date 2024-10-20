<script>
    import {onMount} from 'svelte';
    import LogoWrixy from './components/LogoWrixy.svelte';
    import Page from './components/Page.svelte';
    import {booksPage} from './store/index';


    let data = [];

    const getDummyData = (page) => {
        let totalBooks = 50; // Total ficticio de libros disponibles
        let pageSize = 10;
        let totalPages = Math.ceil(totalBooks / pageSize);

        let start = (page - 1) * pageSize;
        let books = [];
        const images = [
            './img/posters/Libro1.png',
            './img/posters/Libro2.png',
            './img/posters/Libro3.png',
            './img/posters/Libro4.png'
        ];

        for (let i = start; i < start + pageSize && i < totalBooks; i++) {
            books.push({
                IdBook: i + 1,
                Title: `Libro ${i + 1}`,
                UrlImg: images[Math.floor(Math.random() * images.length)], // Selección aleatoria de imagen
                NumViews: Math.floor(Math.random() * 500),
                NumComments: Math.floor(Math.random() * 100),
                NumLikes: Math.floor(Math.random() * 200),
                Descriptions: `Descripción del libro ${i + 1}`
            });
        }

        return {
            status: 200,
            data: {
                currentPage: page,
                totalPages,
                data: books
            }
        };
    };

    const fetchDummyData = (page) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getDummyData(page));
            }, 2000);
        });
    };

    onMount(async () => {
        try {
            // Simulación de respuesta de la API
            let response = await fetchDummyData(1);


            // Verificación del status de la respuesta simulado
            switch (response.status) {
                case 200: {
                    booksPage.set(response.data);
                    data = response.data.data;
                }
                    break;
                case 422: {
                    alert('Se ha enviado una pagina incorrecta');
                }
                    break;
                case 204: {
                    alert('No hay datos en esa pagina');
                }
                    break;
                default: {
                    alert('Internal Error');
                }
            }
        } catch (e) {
            alert('Error en consulta');
            console.log(e);
        }
    });
</script>

<style>
    :global(:root) {
        --small: 576px;
        --medium: 768px;
        --large: 992px;
        --extra-large: 1200px;
        --extra-extra-large: 1400px;

        --height-header: 4.8rem;
        --header-elements: 160px;

        --widht-card: 12vw;
        --height-card: auto;

        --font-family: 'Mukta', sans-serif;

        --primary: #B77FDC;
        --sub-primary: #F0C4FE;
        --secondary: #F9EBFD;
        --background: #FDF9FF;
        --white: #FFF;
        --dark-shadow: #00000042;
        --dark: #AC9DA9AA;
        --dark-primary: #55464A;
        --sub-secondary: #E1BBED;


        --z-back: -10;
        --z-normal: 1;
        --z-tooltip: 10;
        --z-fixed: 100;
        --z-modal: 1000;
    }

    body {
        background-color: var(--background);
    }

    main {
        display: inline;
        padding: 0;
        margin: 0;
        height: 100%;
    }

    .loader-container {
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background: var(--secondary);
        filter: opacity(.9);
        color: var(--primary);
    }

    .loader {
        animation: loader 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        width: 2.5vw;
        height: 2.5vw;
        min-width: 40px;
        min-height: 40px;
    }

    @keyframes loader {
        0% {
            transform: scale(4);
        }
        50% {
            transform: scale(3);
            filter: opacity(0.7);
        }
        100% {
            transform: scale(4);
        }
    }
</style>

<main>
    {#if data.length > 0}
        <div>
            <Page/>
        </div>
    {:else}
        <div class="loader-container">
            <div class="loader">
                <LogoWrixy/>
            </div>
        </div>
    {/if}
</main>