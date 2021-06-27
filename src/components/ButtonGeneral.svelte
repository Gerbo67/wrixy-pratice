<script>
    export let content = '';
    export let classb = '';
</script>

<style>
    .buttonG {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 12rem;
        height: 3rem;
        border-radius: 5px;
        box-shadow: 0 0 4px var(--dark-shadow);
        color: white;
        cursor: pointer;
        text-align: center;
        font-family: var(--font-family);
        font-weight: 600;
        background-color: var(--sub-secondary);

    }

    .buttonG:active {
        transform: scale(0.8);
    }

    .buttonG__text {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .buttonG.active {
        background-color: var(--primary);
    }

    @media (max-width: 960px) {
        .buttonG {
            width: 8rem;
            font-size: 0.8rem;
        }
    }

    @media (max-width: 660px) {
        .buttonG {
            width: 5.5rem;
            height: 2.5rem;
            font-size: 0.6rem;
        }
    }

</style>

<div class="buttonG {classb}">
    <span class="buttonG__text">{content}</span>
</div>