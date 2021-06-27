<script>
    import ButtonG from './ButtonGeneral.svelte';
    import ContentCard from './ContentCard.svelte';
</script>

<style>
    .home-body {
        width: 100%;
        margin-top: var(--height-header);
    }

    .home-subnav {
        height: calc(var(--height-header) / 1.2);
        display: flex;
        justify-content: center;
    }

    .home-subnav__pad{
        height: 100%;
        width: 75vw;
        border-radius: 0 0 10px 10px;
        background-color: var(--secondary);
    }

    .content-home{
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin: 0.5rem;
    }

    @media (max-width: 1000px) {
        .home-subnav__pad{
            width: 90vw;
        }
    }
</style>

<div class="home-body">
    <div class="home-subnav">
        <div class="home-subnav__pad">
            <div class="content-home">
                <ButtonG content="Recomendados" classb="active"/>
                <ButtonG content="Tendencias" />
                <ButtonG content="Novedades" />
                <ButtonG content="Adultos" />
            </div>
        </div>
    </div>

    <ContentCard/>
</div>