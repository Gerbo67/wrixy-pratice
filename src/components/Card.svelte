<script>
    window.addEventListener("load", ()=>{
        size();
    });
    window.addEventListener("resize", ()=>{
        size();
    });

    const size = () =>{
        const CardId = document.getElementsByClassName('Card');
        for(let i = 0; i < CardId.length; i++){
            CardId[i].style.height = ''+CardId[i].offsetWidth * 1.57+'px';
            CardId[i].style.fontSize = CardId[i].offsetWidth * 0.13+'px';
        }
    }

</script>

<style>
    .Card{
        width: 100%;
        min-width: var(--widht-card);
        height: calc(1.9 * var(--widht-card));
        background: url("https://d3uyhmwgrp7r7f.cloudfront.net/1611179959785_cover.png");
        background-size: cover;
        cursor: pointer;
        transition: transform 400ms, height 200ms;
        padding: 0.1px;
        border-radius: 5px;
        font-size: 200%;
    }

    .Card:hover{
        transform: scale(1.2);
    }

    .Card:active{
        transform: scale(1.1);
        transition: transform 100ms;
    }

    .Card:hover > .Card__Content{
        display: block;
    }

    .Card:hover > .CardFooterActive{
        display: none;
    }

    .Card__Content{
        display: none;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        background-color: black;
        opacity: 0.9;
    }

    .CardHeader{
        width: 100%;
        height: 20%;
        padding: 0.1px;
    }

    .ContentTitle{
        margin: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: var(--font-family);
        font-weight: 600;
        font-size: 0.7em;
        color: white;
    }

    .CardBody{
        width: 100%;
        height: 60%;
        padding: 0.1px;
    }

    .ContentDescription{
        margin: 1rem;
        font-family: var(--font-family);
        font-size: 0.35em;
        color: white;
    }

    .CardFooter{
        width: 100%;
        height: 20%;
        padding: 0.1px;
        font-size: 0.5em;
    }

    .CardFooterActive{
        width: 100%;
        height: 100%;
        padding: 0.1px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        font-size: 0.5em;
    }

    .CardFooterActive .ContentIcons{
        width: 100%;
        height: 20%;
        border-radius: 5px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.86) 50%);
    }

    .ContentIcons{
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;
        color: white;
    }

    .IconCount{
        margin-left: 0.5rem;
    }
</style>

<div class="Card">
    <div class="Card__Content">
        <div class="CardHeader">
            <div class="ContentTitle">
                    <span class="CardHeader__Title">
                        Muerde o Muere
                    </span>
            </div>
        </div>
        <div class="CardBody">
            <div class="ContentDescription">
                    <span class="CardBody__Description">
                    Esto no va a ser uno de esos típicos libros de
                    autoayuda con consejos abstractos y sin sentido.
                    Estos que te dicen que “sé feliz” y no te dan
                    herramientas concretas para ello. O incluso cuando
                    las dan, son demasiado irreales para aplicarlas a la
                    vida cotidiana. Voy a ser crudo contigo. Seré bruto.
                    Te diré las cosas y la realidad tal cual es. No me
                    voy a cortar un pelo. Te ofenderé, te haré sentir mal,
                    o que incluso la vida parezca una mentira el resto de
                    tus días.
                </span>
            </div>
        </div>
        <div class="CardFooter">
            <div class="ContentIcons">
                <div class="CardFooterIcons"><i class="fas fa-eye"></i><span class="IconCount">857k</span></div>
                <div class="CardFooterIcons"><i class="fas fa-comments"></i><span class="IconCount">525</span></div>
                <div class="CardFooterIcons"><i class="fas fa-heart"></i><span class="IconCount">7.7k</span></div>
            </div>
        </div>
    </div>
    <div class="CardFooterActive">
        <div class="ContentIcons">
            <div class="CardFooterIcons"><i class="fas fa-eye"></i><span class="IconCount">857k</span></div>
            <div class="CardFooterIcons"><i class="fas fa-comments"></i><span class="IconCount">525</span></div>
            <div class="CardFooterIcons"><i class="fas fa-heart"></i><span class="IconCount">7.7k</span></div>
        </div>
    </div>
</div>