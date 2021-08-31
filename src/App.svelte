<script>
    import {onMount} from 'svelte';
    import LogoWrixy from './components/LogoWrixy.svelte';
    import Page from './components/Page.svelte';
    import {booksPage} from './store/index';

    let data = [];

    onMount(async () => {
        try {

            // declaracion de headers
            const headers = new Headers({
                'Content-Type': 'application/json'
            });

            // asignacion datos iniciales
            const dataInit = {
                method: 'POST',
                headers,
                body: JSON.stringify({page: 1}),
            }

            // verificar SSL
            const protocolo = window.location.protocol != 'https:' ? 'http' : 'https';

            // consulta con url
            let response = await fetch(`${protocolo}://wrixybackend.herokuapp.com/books`, dataInit);

            // verificacion status
            switch (response.status) {
                case 200: {
                    response = await response.json();
                    booksPage.set(response);
                    data = response.data;
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
            alert('Error en consulta')
            console.log(e);
        }
    })
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