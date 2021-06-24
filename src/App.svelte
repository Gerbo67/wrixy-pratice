<script>
    import {onMount} from 'svelte';
    import LogoWrixy from './components/LogoWrixy.svelte';

    let data = [];

    onMount(async () => {
        try {
            const protocolo = window.location.protocol != 'https:' ? 'http' : 'https';
            let response = await fetch(`${protocolo}://localhost:3000`);
            response = await response.json();
            data = response;

            console.log(response);
        } catch (e) {

        }
    })
</script>

<style>
    :global(:root) {
        --primary: #B77FDC;
        --secondary: #F9EBFD;
        --white: #FFF;
        --dark-shadow: #00000042;
        --dark: #AC9DA9AA;
        --header-elements: 160px;
        --font-family: 'Mukta', sans-serif;

        --z-back: -10;
        --z-normal: 1;
        --z-tooltip: 10;
        --z-fixed: 100;
        --z-modal: 1000;
    }

    main {
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
    <div class="loader-container">
        <div class="loader">
            <LogoWrixy/>
        </div>
    </div>
</main>