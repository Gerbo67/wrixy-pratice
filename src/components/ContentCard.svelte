<script>
    import Card from './Card.svelte';

    export let data = 0;
</script>

<style>
    .BodyCard{
        display: flex;
        justify-content: space-around;
        align-items: start;
        width: 100%;
        margin: 4rem 0;
    }

    .BodyCard__Anuncio{
        min-width: 6rem;
        max-width: 10rem;
        height: 30vh;
        border: 10px solid #b67edb;
        z-index: var(--z-normal);
    }

    .BodyCard__Cards{
        width: 75vw;
        height: auto;
        z-index: var(--z-tooltip);
        display: grid;
        grid-template-columns: repeat(auto-fill,minmax(var(--widht-card),1fr));
        grid-gap: 4rem;
        justify-items: center;
        /*background-color: antiquewhite;*/
    }

    @media (max-width: 1000px) {
        .BodyCard__Anuncio{
            display: none;
        }
    }

</style>

<div class="BodyCard">
    <div class="BodyCard__Anuncio"></div>
    <div class="BodyCard__Cards">
       <Card />
       <Card />
       <Card />
       <Card />
       <Card />
       <Card />
       <Card />
    </div>
    <div class="BodyCard__Anuncio"></div>
</div>