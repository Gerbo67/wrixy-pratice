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
            CardId[i].style.height = '' + CardId[i].offsetWidth * 1.57 + 'px';
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
        let length = 450;
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
    }

    .Card:hover {
        transform: scale(1.2);
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
    }

    .Poster__Title {
        white-space: normal;
        font-weight: bold;
        color: var(--dark-primary);
        width: 10em;
    }

    .Poster__Autor{
        padding-top: 1em;
        font-size: 0.8em;
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
        opacity: 0.9;
    }

    .CardHeader {
        width: 100%;
        height: 20%;
        padding: 0.1px;
    }

    .ContentTitle {
        margin: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: var(--font-family);
        font-weight: 600;
        font-size: 0.7em;
        line-height: 1.2;
        text-align: center;
        color: white;
    }

    .CardBody {
        width: 100%;
        height: 60%;
        padding: 0.1px;
    }

    .ContentDescription {
        margin: 1rem;
        font-family: var(--font-family);
        font-size: 0.35em;
        color: white;
    }

    .CardFooter {
        width: 100%;
        height: 20%;
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
        height: 20%;
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
            min-width: 20vw;
        }
    }
</style>

{#if book.UrlImg != ''}
    <div class="Card" style='background: url("{book.UrlImg}"); background-size: cover;'>
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
                <p class="Poster__Autor">Anonimo</p>
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