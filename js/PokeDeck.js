class PokeDeck {
    static aciertos = 0;
    static mejorRacha = localStorage.getItem('mejorRachaPokemon') || 0;
    static cartasActuales = [];
    static juegoActivo = false;

    static actualizarEstadoBotones() {
        const botones = {
            iniciar: document.querySelector('.btn-iniciar'),
            cambiar: document.querySelector('.btn-cambiar'),
            eliminar: document.querySelector('.btn-eliminar'),
            anadir: document.querySelector('.btn-anadir')
        };

        if (this.juegoActivo) {
            // Durante el juego solo el botón de eliminar está activo
            botones.iniciar.disabled = true;
            botones.cambiar.disabled = true;
            botones.anadir.disabled = true;
            botones.eliminar.disabled = false;
            
            // Estilos visuales
            botones.iniciar.classList.add('disabled');
            botones.cambiar.classList.add('disabled');
            botones.anadir.classList.add('disabled');
            botones.eliminar.classList.remove('disabled');
        } else {
            // Fuera del juego, todos los botones disponibles
            Object.values(botones).forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('disabled');
            });
        }
    }

    static async iniciarJuego() {
        this.juegoActivo = true;
        this.actualizarEstadoBotones();
        this.cartasActuales = [];
        let deck = document.querySelector(".deck");
        deck.innerHTML = "";

        const pokemonIds = new Set();
        while (pokemonIds.size < 2) {
            const newId = Utils.randomPokemonNumber();
            pokemonIds.add(newId);
            this.cartasActuales.push(newId);
        }

        for (let id of pokemonIds) {
            await this.addCard(id);
        }

        const segundaCarta = document.querySelectorAll('.card')[1];
        if (segundaCarta) {
            segundaCarta.querySelector('.stats-container').style.display = "none";
        }

        this.mostrarBotonesAdivinanza();
        this.actualizarMarcador();
    }

    static async anadirCarta() {
        if (this.juegoActivo) {
            Carro.showToast("No puedes añadir cartas durante el juego", "warning");
            return;
        }

        if (this.cartasActuales.length >= 6) {
            Carro.showToast("Máximo 6 cartas permitidas", "warning");
            return;
        }

        let newId = Utils.randomPokemonNumber();
        while (this.cartasActuales.includes(newId)) {
            newId = Utils.randomPokemonNumber();
        }

        this.cartasActuales.push(newId);
        await this.addCard(newId);
        this.actualizarMarcador();
    }

    static async cambiarCartas() {
        if (this.juegoActivo) {
            Carro.showToast("No puedes cambiar cartas durante el juego", "warning");
            return;
        }

        if (this.cartasActuales.length === 0) {
            Carro.showToast("No hay cartas para cambiar", "warning");
            return;
        }

        let deck = document.querySelector(".deck");
        deck.innerHTML = "";
        this.cartasActuales = [];

        const cantidad = Math.max(2, this.cartasActuales.length);
        const pokemonIds = new Set();
        
        while (pokemonIds.size < cantidad) {
            const newId = Utils.randomPokemonNumber();
            pokemonIds.add(newId);
            this.cartasActuales.push(newId);
        }

        for (let id of pokemonIds) {
            await this.addCard(id);
        }

        this.actualizarMarcador();
        Carro.showToast("Cartas cambiadas", "success");
    }

    static eliminarCartas() {
        this.juegoActivo = false;
        this.actualizarEstadoBotones();
        this.cartasActuales = [];
        this.aciertos = 0;
        document.querySelector(".deck").innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-card-image fs-1"></i>
                <p>Presiona "Iniciar juego" para comenzar</p>
            </div>
        `;
        this.actualizarMarcador();
        Carro.showToast("Cartas eliminadas", "success");
    }

    static mostrarBotonesAdivinanza() {
        if (!this.juegoActivo || this.cartasActuales.length !== 2) return;

        const deck = document.querySelector(".deck");
        
        const botonesExistente = deck.querySelector('.botones-adivinanza');
        if (botonesExistente) botonesExistente.remove();

        const botonesDiv = document.createElement('div');
        botonesDiv.classList.add('botones-adivinanza', 'mt-3', 'text-center');
        botonesDiv.innerHTML = `
            <p class="mb-2">¿El siguiente Pokémon tiene más o menos stats?</p>
            <button class="btn btn-primary m-1" onclick="PokeDeck.compararStats('mayor')">
                <i class="bi bi-arrow-up"></i> Más
            </button>
            <button class="btn btn-primary m-1" onclick="PokeDeck.compararStats('menor')">
                <i class="bi bi-arrow-down"></i> Menos
            </button>
        `;
        deck.appendChild(botonesDiv);
    }

    static actualizarMarcador() {
        const deck = document.querySelector(".deck");
        const marcadorExistente = deck.querySelector('.marcador-juego');
        
        if (marcadorExistente) marcadorExistente.remove();

        if (this.cartasActuales.length > 0) {
            const marcador = document.createElement("div");
            marcador.classList.add('marcador-juego', 'text-center', 'mt-3', 'p-2', 'bg-light', 'rounded');
            marcador.innerHTML = `
                <div class="fw-bold">Cartas: ${this.cartasActuales.length}/6</div>
                <div>Aciertos: ${this.aciertos}</div>
                <div>Mejor racha: ${this.mejorRacha}</div>
            `;
            deck.appendChild(marcador);
        }
    }

    static compararStats(comparacion) {
        if (!this.juegoActivo || this.cartasActuales.length !== 2) {
            Carro.showToast("Necesitas 2 cartas para jugar", "warning");
            return;
        }

        const cartas = document.querySelectorAll('.card');
        const pokemon1 = cartas[0];
        const pokemon2 = cartas[1];

        pokemon2.querySelector('.stats-container').style.display = "block";

        const stats1 = this.calcularTotalStats(pokemon1);
        const stats2 = this.calcularTotalStats(pokemon2);

        let resultado = false;
        if (comparacion === "mayor") resultado = stats2 > stats1;
        else if (comparacion === "menor") resultado = stats2 < stats1;

        if (resultado) {
            this.aciertos++;
            if (this.aciertos > this.mejorRacha) {
                this.mejorRacha = this.aciertos;
                localStorage.setItem('mejorRachaPokemon', this.mejorRacha);
            }
            Carro.showToast("¡Correcto! Has acertado", "success");
        } else {
            Carro.showToast(`Incorrecto. Aciertos: ${this.aciertos}`, "warning");
            this.aciertos = 0;
        }

        setTimeout(() => {
            this.iniciarJuego();
        }, 2000);
    }

    static calcularTotalStats(card) {
        const stats = card.querySelectorAll('.progress-bar');
        let total = 0;
        stats.forEach(stat => total += parseInt(stat.textContent));
        return total;
    }

    static girarCarta(button) {
        const card = button.closest('.card');
        const cardFront = card.querySelector('.card-front');
        const cardBack = card.querySelector('.card-back');

        if (cardFront.style.display === "none") {
            cardFront.style.display = "block";
            cardBack.style.display = "none";
        } else {
            cardFront.style.display = "none";
            cardBack.style.display = "block";
        }
    }

    static async addCard(pokemonId) {
        const deck = document.querySelector(".deck");
        deck.innerHTML += `
            <div class="card m-2 shadow" style="width: 18rem;" data-pokenumber="${pokemonId}">
                <div class="card-front" style="display: none;">
                    <img src="#" class="card-img-top p-3 bg-light">
                    <div class="card-body text-center">
                        <h5 class="card-title text-primary fw-bold"></h5>
                        <h6 class="card-subtitle mb-2 text-warning"></h6>
                        <p class="card-text text-secondary"></p>
                    </div>
                    
                    <div class="accordion accordion-flush" id="accordionStats-${pokemonId}">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingStats-${pokemonId}">
                                <button class="accordion-button collapsed bg-warning text-primary fw-bold" 
                                        type="button" data-bs-toggle="collapse" 
                                        data-bs-target="#collapseStats-${pokemonId}">
                                    Stats
                                </button>
                            </h2>
                            <div id="collapseStats-${pokemonId}" class="accordion-collapse collapse">
                                <div class="accordion-body stats-container"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="accordion accordion-flush" id="accordionAbilities-${pokemonId}">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingAbilities-${pokemonId}">
                                <button class="accordion-button collapsed bg-warning text-primary fw-bold" 
                                        type="button" data-bs-toggle="collapse" 
                                        data-bs-target="#collapseAbilities-${pokemonId}">
                                    Habilidades
                                </button>
                            </h2>
                            <div id="collapseAbilities-${pokemonId}" class="accordion-collapse collapse">
                                <div class="accordion-body abilities-container"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="accordion accordion-flush" id="accordionMoves-${pokemonId}">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="headingMoves-${pokemonId}">
                                <button class="accordion-button collapsed bg-warning text-primary fw-bold" 
                                        type="button" data-bs-toggle="collapse" 
                                        data-bs-target="#collapseMoves-${pokemonId}">
                                    Movimientos
                                </button>
                            </h2>
                            <div id="collapseMoves-${pokemonId}" class="accordion-collapse collapse">
                                <div class="accordion-body moves-container"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-body d-flex gap-2">
                        <button class="carro-button btn btn-primary flex-grow-1" 
                                data-id="0" data-name="" data-img="" 
                                onclick="Carro.addPokemon(this.dataset)">
                            <i class="bi bi-cart-plus"></i> Añadir
                        </button>
                        <button class="btn btn-danger" 
                                onclick="PokeDeck.eliminarCarta(this)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-back">
                    <img src="./images/reversocarta.png" class="card-img-top p-3 bg-light">
                </div>
                <div class="card-body">
                    <button class="btn btn-secondary w-100" onclick="PokeDeck.girarCarta(this)">
                        <i class="bi bi-arrow-repeat"></i> Girar
                    </button>
                </div>
            </div>
        `;

        const cards = document.querySelectorAll('.card');
        await this.rellenaCarta(cards[cards.length - 1], pokemonId);
    }

    static async rellenaCarta(card, pokemonId) {
        const pokemonData = await Utils.pokeAPI(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!pokemonData) return;

        const isShiny = Math.random() < 0.1;
        const img = card.querySelector('img');
        img.src = isShiny ? pokemonData.sprites.front_shiny : pokemonData.sprites.front_default;

        card.querySelector('h5').textContent = pokemonData.name;
        
        const types = pokemonData.types.map(t => t.type.name).join(", ");
        card.querySelector('h6').textContent = `Type: ${types}`;

        const species = await Utils.pokeAPI(pokemonData.species.url);
        const descripcion = species.flavor_text_entries.find(t => t.language.name === 'es') || 
                        species.flavor_text_entries[0];
        card.querySelector('.card-text').textContent = descripcion.flavor_text;

        const statsContainer = card.querySelector('.stats-container');
        statsContainer.innerHTML = '';
        pokemonData.stats.forEach(stat => {
            statsContainer.innerHTML += `
                <div class="mb-2">
                    <small>${stat.stat.name}</small>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" 
                            style="width: ${stat.base_stat}%" 
                            aria-valuenow="${stat.base_stat}">
                            ${stat.base_stat}
                        </div>
                    </div>
                </div>
            `;
        });

        const abilitiesContainer = card.querySelector('.abilities-container');
        abilitiesContainer.innerHTML = '';
        for (const ability of pokemonData.abilities.slice(0, 4)) {
            const abilityData = await Utils.pokeAPI(ability.ability.url);
            const abilityDesc = abilityData.flavor_text_entries.find(e => e.language.name === 'es') || 
                            abilityData.flavor_text_entries[0];
            
            abilitiesContainer.innerHTML += `
                <div class="mb-2">
                    <strong>${ability.ability.name}</strong>
                    <p class="mb-0 small">${abilityDesc?.flavor_text || 'Descripción no disponible'}</p>
                </div>
            `;
        }

        const movesContainer = card.querySelector('.moves-container');
        movesContainer.innerHTML = '';
        for (const move of pokemonData.moves.slice(0, 4)) {
            const moveData = await Utils.pokeAPI(move.move.url);
            const moveDesc = moveData.flavor_text_entries.find(e => e.language.name === 'es') || 
                        moveData.flavor_text_entries[0];
            
            movesContainer.innerHTML += `
                <div class="mb-2">
                    <strong>${move.move.name}</strong>
                    <p class="mb-0 small">${moveDesc?.flavor_text || 'Descripción no disponible'}</p>
                </div>
            `;
        }

        const carroButton = card.querySelector('.carro-button');
        carroButton.dataset.id = pokemonData.id;
        carroButton.dataset.name = pokemonData.name;
        carroButton.dataset.img = pokemonData.sprites.front_default;
    }

    static eliminarCarta(button) {
        const card = button.closest('.card');
        const pokemonId = parseInt(card.dataset.pokenumber);
        
        this.cartasActuales = this.cartasActuales.filter(id => id !== pokemonId);
        card.remove();
        this.actualizarMarcador();
        Carro.showToast("Carta eliminada", "success");
    }
}