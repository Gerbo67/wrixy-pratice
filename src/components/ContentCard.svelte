<script>
    import Card from './Card.svelte';
    import ButtonIcon from './ButtonIcon.svelte';
    import {booksPage} from "../store";
    import LogoWrixy from "./LogoWrixy.svelte";

    export let data = [];

    const HomeLeft = {
        icon: 'fas fa-arrow-circle-left',
        content: 'Anterior',
        position: 'left'
    }

    const HomeRight = {
        icon: 'fas fa-arrow-circle-right',
        content: 'Siguiente',
        position: 'right'
    }

    const size = () => {
        const CardId = document.getElementsByClassName('Card');
        for (let i = 0; i < CardId.length; i++) {
            CardId[i].style.height = CardId[i].offsetWidth * 1.57 + 'px';
            CardId[i].style.fontSize = CardId[i].offsetWidth * 0.13 + 'px';
        }
    }

    const queryPage = async (page) => {
        // inicio de loader
        const BodyCard = document.getElementById('BodyCard');
        const heightBody = BodyCard.offsetHeight;
        const widhtBody = BodyCard.offsetWidth;
        BodyCard.style.opacity = '0';
        const loader = document.getElementById('LoaderCard');
        loader.style.height = `${heightBody}px`;
        loader.style.width = `${widhtBody}px`;
        loader.style.opacity = '1';
        try {
            // declaracion de headers
            const headers = new Headers({
                'Content-Type': 'application/json'
            });

            // asignacion datos iniciales
            const dataInit = {
                method: 'POST',
                headers,
                body: JSON.stringify({page}),
            }

            // verificar SSL
            const protocolo = window.location.protocol != 'https:' ? 'http' : 'https';

            // consulta con url
            let response = await fetch(`${protocolo}://wrixyapi-env.eba-wmdeitqi.us-west-2.elasticbeanstalk.com/books`, dataInit);

            // verificacion status
            switch (response.status) {
                case 200: {
                    response = await response.json();
                    booksPage.set(response);
                    BodyCard.style.opacity = '1';
                    loader.style.opacity = '0';
                    size();
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
                    BodyCard.style.opacity = '1';
                    loader.style.opacity = '0';
                }
            }
        } catch (e) {
            alert('Error en consulta');
            BodyCard.style.opacity = '1';
            loader.style.opacity = '0';
        }
    }

    const updateStoreBook = async (current, total, navigation) => {
        if (navigation === 'Left') {
            if (current > 1) {
                // consulta
                let currentNew = current - 1;
                await queryPage(currentNew);
                buttonsActive();
            }
        } else {
            if (current != total) {
                // consulta
                let currentNew = current + 1;
                await queryPage(currentNew);
                buttonsActive();
            }
        }
    }

    const buttonsActive = () => {
        if ($booksPage.currentPage === $booksPage.totalPages) {
            const buttonRightHome = document.querySelector('#buttonRightHome > div');
            buttonRightHome.style.backgroundColor = "var(--sub-secondary)";

            const buttonLeftHome = document.querySelector('#buttonLeftHome > div');
            buttonLeftHome.style.backgroundColor = "var(--primary)";
        } else {
            const buttonRightHome = document.querySelector('#buttonRightHome > div');
            buttonRightHome.style.backgroundColor = "var(--primary)";

            const buttonLeftHome = document.querySelector('#buttonLeftHome > div');
            buttonLeftHome.style.backgroundColor = "var(--sub-secondary)";
        }

    }

</script>

<style>
    .BodyCard {
        display: flex;
        justify-content: space-around;
        align-items: start;
        width: 100%;
        margin: 4rem 0;
    }

    .BodyCard__Anuncio {
        min-width: 6rem;
        max-width: 10rem;
        height: 20rem;
        border: 10px solid #b67edb;
        z-index: var(--z-normal);
    }

    .BodyCard__Center {
        width: 75vw;
        z-index: var(--z-tooltip);
    }

    .BodyCard__Cards {
        width: 100%;
        height: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--widht-card), 1fr));
        grid-gap: 4rem;
        justify-items: center;
        transition: opacity 500ms;
    }

    .BodyCard_Buttons {
        width: 100%;
        height: 4rem;
        margin-top: 3rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .LoaderCard{
        position: absolute;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        box-shadow: 0 0 10px var(--dark-shadow);
        background: var(--secondary);
        filter: opacity(.9);
        opacity: 0;
        transition: opacity 500ms;
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

    @media (max-width: 1000px) {
        .BodyCard__Anuncio {
            display: none;
        }
    }

</style>

<div id="CardsHome" class="BodyCard">
    <div class="BodyCard__Anuncio"></div>


        <div class="BodyCard__Center">
            <div id ="LoaderCard" class="LoaderCard">
                <div class="loader">
                    <LogoWrixy/>
                </div>
            </div>
            <div id="BodyCard" class="BodyCard__Cards">
                {#each data.data as book (book.IdBook)}
                    <Card {book}/>
                {/each}
            </div>
            <div class="BodyCard_Buttons">
                <div id="buttonLeftHome" class="ButtonClick"
                     on:click={updateStoreBook($booksPage.currentPage, $booksPage.totalPages,'Left')}>
                    <ButtonIcon props={HomeLeft}/>
                </div>
                <div id="buttonRightHome" class="ButtonClick"
                     on:click={updateStoreBook($booksPage.currentPage, $booksPage.totalPages,'Right')}>
                    <ButtonIcon props={HomeRight} active="true"/>
                </div>
            </div>
        </div>

    <div class="BodyCard__Anuncio"></div>
</div>