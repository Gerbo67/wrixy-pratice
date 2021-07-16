<script>
    export let book = [];

    window.addEventListener("load", () => {
        size();
    });

    window.addEventListener("resize", () => {
        size();
    });

    const size = () => {
        const CardId = document.getElementsByClassName('Card');
        for (let i = 0; i < CardId.length; i++) {
            CardId[i].style.height = CardId[i].offsetWidth * 1.57 + 'px';
            CardId[i].style.fontSize = CardId[i].offsetWidth * 0.13 + 'px';
        }
    }

    const countDesign = (num) => {
        if (num >= 1000) {
            return `${num / 1000}k`
        } else if (num >= 1000000) {
            return `${num / 1000000}M`
        } else {
            return num;
        }
    }

    const descriptionDesign = (text) => {
        let length = 400;
        if (text.length > length) {
            return text.substring(0, length - 3) + "...";
        }
        return text;
    }
</script>

<style>
    .Card {
        width: 100%;
        min-width: var(--widht-card);
        height: calc(1.57 * var(--widht-card));
        cursor: pointer;
        transition: transform 400ms, height 200ms;
        padding: 0.1px;
        border-radius: 5px;
        font-size: 200%;
        background-size: cover !important;
    }

    .Card:hover {
        transform: scale(1.2);
        z-index: var(--z-modal);
    }

    .Card:active {
        transform: scale(1.1);
        transition: transform 100ms;
    }

    .Card:hover > .Card__Content {
        display: block;
    }

    .Card:hover > .CardFooterActive {
        display: none;
    }

    .NotPoster {
        padding: 0.1px;
        background: linear-gradient(var(--sub-primary), var(--primary)) !important;
        display: inline-flex;
        justify-content: center;
        align-items: center;
    }

    .Poster {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-family: var(--font-family);
        font-size: 0.5em;
        line-height: 1.0;

    }

    .Poster__Content {
        margin-bottom: 30%;
        color: var(--dark-primary);
    }

    .Poster__Title {
        white-space: normal;
        font-weight: 800;

        width: 10em;
    }

    .Poster__Autor {
        padding-top: 1em;
        font-size: 0.8em;
        font-weight: bold;
    }

    .Poster__Img {
        width: 7em;
    }

    .Card__Content {
        display: none;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        background-color: black;
        opacity: 0.8;
    }

    .CardHeader {
        width: 100%;
        height: 20%;
        padding: 0.1px;
    }

    .ContentTitle {
        height: 100%;
        margin: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.1px;
        font-family: var(--font-family);
        font-weight: 600;
        font-size: 0.7em;
        line-height: 1.1;
        text-align: center;
        color: white;
    }

    .CardBody {
        width: 100%;
        height: 65%;
        padding: 0.1px;
    }

    .ContentDescription {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1rem 1rem 0 1rem;
        font-family: var(--font-family);
        font-size: 0.35em;
        color: white;
    }

    .CardFooter {
        width: 100%;
        height: 15%;
        padding: 0.1px;
        font-size: 0.5em;
    }

    .CardFooterActive {
        width: 100%;
        height: 100%;
        padding: 0.1px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        font-size: 0.5em;
    }

    .CardFooterActive .ContentIcons {
        width: 100%;
        height: 15%;
        border-radius: 5px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.86) 50%);
    }

    .ContentIcons {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;
        color: white;
        font-family: var(--font-family);
    }

    .IconCount {
        margin-left: 0.5rem;
    }

    @media (max-width: 1000px) {
        .Card {
            width: 100%;
            min-width: 15vw;
            height: calc(1.57 * 15vw);
            padding: 0.1px;
            border-radius: 5px;
            font-size: 100%;
        }

        .CardHeader__Title {
            font-size: 0.72em;
            margin: 0 0.4rem;
        }

        .CardFooter {
            font-size: 0.5em;
        }

        .CardFooterActive {
            font-size: 0.5em;
        }

        .ContentDescription {
            margin: 0.6rem 0.4rem;
            line-height: 3em;
            font-size: 0.2em;
        }
    }
</style>

{#if book.UrlImg != ''}
    <div class="Card" style='background: url("{book.UrlImg}");'>
        <div class="Card__Content">
            <div class="CardHeader">
                <div class="ContentTitle">
                    <span class="CardHeader__Title">{book.Title}</span>
                </div>
            </div>
            <div class="CardBody">
                <div class="ContentDescription">
                    <span class="CardBody__Description">{descriptionDesign(book.Descriptions)}</span>
                </div>
            </div>
            <div class="CardFooter">
                <div class="ContentIcons">
                    <div class="CardFooterIcons"><i class="fas fa-eye"></i><span
                            class="IconCount">{countDesign(book.NumViews)}</span></div>
                    <div class="CardFooterIcons"><i class="fas fa-comments"></i><span
                            class="IconCount">{countDesign(book.NumComments)}</span></div>
                    <div class="CardFooterIcons"><i class="fas fa-heart"></i><span
                            class="IconCount">{countDesign(book.NumLikes)}</span></div>
                </div>
            </div>
        </div>
        <div class="CardFooterActive">
            <div class="ContentIcons">
                <div class="CardFooterIcons"><i class="fas fa-eye"></i><span
                        class="IconCount">{countDesign(book.NumViews)}</span></div>
                <div class="CardFooterIcons"><i class="fas fa-comments"></i><span
                        class="IconCount">{countDesign(book.NumComments)}</span></div>
                <div class="CardFooterIcons"><i class="fas fa-heart"></i><span
                        class="IconCount">{countDesign(book.NumLikes)}</span></div>
            </div>
        </div>
    </div>
{:else }
    <div class="Card NotPoster">
        <div class="Poster">
            <div class="Poster__Content">
                <img class="Poster__Img" src="./img/LogoPoster.png" alt="WrixyLogo">
                <p class="Poster__Title">{book.Title}</p>
                <p class="Poster__Autor">By: Anonimo</p>
            </div>
        </div>
        <div class="Card__Content">
            <div class="CardHeader">
                <div class="ContentTitle">
                    <span class="CardHeader__Title">{book.Title}</span>
                </div>
            </div>
            <div class="CardBody">
                <div class="ContentDescription">
                    <span class="CardBody__Description">{descriptionDesign(book.Descriptions)}</span>
                </div>
            </div>
            <div class="CardFooter">
                <div class="ContentIcons">
                    <div class="CardFooterIcons"><i class="fas fa-eye"></i><span
                            class="IconCount">{countDesign(book.NumViews)}</span></div>
                    <div class="CardFooterIcons"><i class="fas fa-comments"></i><span
                            class="IconCount">{countDesign(book.NumComments)}</span></div>
                    <div class="CardFooterIcons"><i class="fas fa-heart"></i><span
                            class="IconCount">{countDesign(book.NumLikes)}</span></div>
                </div>
            </div>
        </div>
        <div class="CardFooterActive">
            <div class="ContentIcons">
                <div class="CardFooterIcons"><i class="fas fa-eye"></i><span
                        class="IconCount">{countDesign(book.NumViews)}</span></div>
                <div class="CardFooterIcons"><i class="fas fa-comments"></i><span
                        class="IconCount">{countDesign(book.NumComments)}</span></div>
                <div class="CardFooterIcons"><i class="fas fa-heart"></i><span
                        class="IconCount">{countDesign(book.NumLikes)}</span></div>
            </div>
        </div>
    </div>
{/if}