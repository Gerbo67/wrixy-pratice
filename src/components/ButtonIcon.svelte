<script>
    export let props = '';
    export let active = '';
</script>

<style>

    .ButtonIcon {
        display: flex;
        width: 12rem;
        height: 3rem;
        border-radius: 5px;
        box-shadow: 0 0 4px var(--dark-shadow);
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        font-family: var(--font-family);
        font-weight: 600;
        background-color: var(--sub-secondary);
    }

    .ButtonIcon:active {
        transform: scale(0.9);
    }

    .ButtonIcon__Body {
        width: 60%;
        height: 100%;
        padding: 0.1px;
        margin: auto;
        display: flex;
        justify-content: space-between;
    }

    .ButtonIcon__Text {
        display: flex;
        align-items: center;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .ButtonIcon__Icon {
        display: flex;
        align-items: center;
    }

    .ButtonIcon.true{
        background-color: var(--primary);
    }

</style>


<div class="ButtonIcon {active}">
    <div class="ButtonIcon__Body">
        {#if props.position == 'left'}
            <div class="ButtonIcon__Icon">
                <i class="{props.icon}"></i>
            </div>
            <div class="ButtonIcon__Text">
                <p>{props.content}</p>
            </div>
        {:else }
            <div class="ButtonIcon__Text">
                <p>{props.content}</p>
            </div>
            <div class="ButtonIcon__Icon">
                <i class="{props.icon}"></i>
            </div>
        {/if}
    </div>
</div>

