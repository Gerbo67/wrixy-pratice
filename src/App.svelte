<script>
    import {onMount} from 'svelte';
    import LogoWrixy from './components/LogoWrixy.svelte';
    import Page from './components/Page.svelte';

    let data = [];

    onMount(async () => {
        try {
            const protocolo = window.location.protocol != 'https:' ? 'http' : 'https';
            let response = await fetch(`${protocolo}://wrixyapi-env.eba-wmdeitqi.us-west-2.elasticbeanstalk.com/`);
            response = await response.json();
            data = response;

            console.log(response);
        } catch (e) {

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

        --widht-card: 13rem;
        --height-card: auto;

        --font-family: 'Mukta', sans-serif;

        --primary: #B77FDC;
        --secondary: #F9EBFD;
        --background: #FDF9FF;
        --white: #FFF;
        --dark-shadow: #00000042;
        --dark: #AC9DA9AA;
        --sub-secondary: #E1BBED;


        --z-back: -10;
        --z-normal: 1;
        --z-tooltip: 10;
        --z-fixed: 100;
        --z-modal: 1000;
    }

    body{
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
            <Page {data}/>
        </div>
    {:else}
        <div class="loader-container">
            <div class="loader">
                <LogoWrixy/>
            </div>
        </div>
    {/if}
</main>