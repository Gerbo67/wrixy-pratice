<script>
    const showMenu = () => {
        const nav = document.getElementById('main-nav');
        const header = document.getElementById('header-nav');

        if (nav.style.right === '0vw') {
            nav.style.right = '-80vw';
            header.style.borderRadius = '0 0 2rem 2rem';
        } else {
            nav.style.right = '0vw';
            header.style.borderRadius = '0 0 0rem 2rem';
        }
    }
</script>

<style>
    header {
        position: fixed;
        z-index: var(--z-fixed);
        width: 100%;
        height: var(--height-header);
        background: var(--white);
        border-radius: 0 0 2rem 2rem;
        display: flex;
        box-shadow: 0 4px 4px var(--dark-shadow);
    }

    .header-elements {
        width: 100%;
        margin: 2.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .header-logo__img {
        width: 160px;
        height: auto;
    }

    .header-search {
        display: flex;
        justify-content: center;
        color: var(--primary);
        height: calc(var(--header-elements) * 0.25);
        background-color: var(--secondary);
        border-radius: 10px;
    }

    .header-search__elements {
        display: flex;
        margin: 0.8rem;
        align-items: center;
    }

    .header-search__prefix:active, .header-search__suffix:active {
        transform: scale(0.8);
    }

    .header-search__input {
        width: 30rem;
        height: 100%;
        border: none;
        background-color: transparent;
        margin: 0 1rem;
        font-family: var(--font-family);
        font-weight: 500;
        color: var(--dark);
    }

    .header-search__input::placeholder {
        color: var(--dark)
    }

    .header-profile {
        width: 160px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--primary);
        font-size: calc(var(--header-elements) * 0.25);
    }

    .header-profile > span {
        font-size: 1.2rem;
        font-weight: 800;
    }

    .main-menu-toggle {
        font-size: calc(var(--header-elements) * 0.16);
        color: var(--primary);
        display: none;
    }

    .main-menu-toggle:active {
        font-size: calc(var(--header-elements) * 0.1);
    }

    .header-profile.small, .header-search.small {
        display: none;
    }


    @media (max-width: 1000px) {
        .header-search.length, .header-profile.length {
            display: none;
        }

        .header-search.small, .header-profile.small {
            display: flex;
        }

        .header-profile.small {
            width: 100%;
            font-size: 3rem;
            display: flex;
            flex-flow: column;
            justify-content: center;
        }

        .header-search__input {
            width: 100%;
        }

        .header-search__elements {
            width: 100%;
        }

        .main-nav {
            position: fixed;
            height: calc(100vh - var(--height-header));
            width: 70vw;
            background: white;
            box-shadow: -4px 10px 4px var(--dark-shadow);
            top: 4.3rem;
            right: -80vw;
            transition: right .3s;
            padding-top: 1rem;
            z-index: var(--z-tooltip);
            display: flex;
            flex-flow: column;
        }

        .main-nav__block {
            margin: 20px;
            display: flex;
            flex-flow: column;
            justify-content: flex-end;
        }

        .main-menu-toggle {
            display: flex;
            width: 32px;
            justify-content: center;
        }

    }
</style>

<header id="header-nav">
    <div class="main-nav" id="main-nav">
        <div class="main-nav__block">
            <div class="header-profile small">
                <i class="fas fa-user-circle"></i><span>Iniciar sesión</span>
            </div>
            <div class="header-search small">
                <div class="header-search__elements">
                    <div class="header-search__prefix">
                        <i class="fas fa-search"></i>
                    </div>
                    <input class="header-search__input" type="text" placeholder="Descubre una nueva aventura">
                </div>
            </div>
        </div>
    </div>
    <div class="header-elements">
        <div class="header-logo">
            <img class="header-logo__img" src="./img/wrixylogo.png" alt="Logo Wrixy">
        </div>
        <div class="main-menu-toggle" id="main-menu-toggle" on:click={showMenu}><i class="fas fa-bars"></i></div>
        <div class="header-search length">
            <div class="header-search__elements">
                <div class="header-search__prefix">
                    <i class="fas fa-search"></i>
                </div>
                <input class="header-search__input" type="text" placeholder="Descubre una nueva aventura">
                <div class="header-search__suffix">
                    <i class="fas fa-filter"></i>
                </div>
            </div>
        </div>
        <div class="header-profile length">
            <span style="font-family: 'Mukta', sans-serif">Iniciar sesión</span><i class="fas fa-user-circle"></i>
        </div>
    </div>
</header>