<script>
    import HeaderG from './HeaderG.svelte';
    import Home from './Home.svelte';

    export let data = [];
</script>

<style>
    .bodyclass{
        padding: 0.1px;
    }
</style>
<div class="bodyclass">
    <HeaderG/>
    <Home {data}/>
</div>

