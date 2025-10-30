class Carro {
    constructor() {
        this.items = [];
    }

    static loadStorage() {
        // Cargar el carrito desde localStorage
        this.items = JSON.parse(localStorage.getItem("carro")) || [];
        this.display();
    }

    static saveStorage() {
        // Guardar el carrito en localStorage
        localStorage.setItem("carro", JSON.stringify(this.items));
    }

    static addPokemon(data) {
        // Verificar si el carrito ya tiene 6 elementos
        if (this.items.length >= 6) {
            // Mostrar un toast de advertencia
            this.showToast("El carrito está lleno. No puedes añadir más de 6 Pokémon.", "warning");
            return; // Salir de la función sin añadir el Pokémon
        }

        // Si existe en el carrito, aumenta en 1 su cantidad; si no, lo añade
        let index = this.items.findIndex((item) => item.id == data.id);
        if (index === -1) {
            this.items.push({
                id: data.id,
                name: data.name,
                img: data.img,
                quantity: 1,
            });
        } else {
            this.items[index].quantity++;
        }
        this.saveStorage(); // Guardar en localStorage
        this.display();

        // Mostrar un toast de notificación
        this.showToast(`${data.name} ha sido añadido al carrito.`, "success");
    }

    static removePokemon(id) {
        // Borra el Pokémon del carrito
        let index = this.items.findIndex((item) => item.id == id);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.saveStorage(); // Guardar en localStorage
            this.display();
        }
    }

    static removeAll() {
        // Borra todo el carrito
        localStorage.removeItem("carro");
        this.items = [];
        this.display();
    }

    static display() {
        // Mostrar el contenido del carrito
        let carrito = document.querySelector("#carro");
        carrito.innerHTML = "";

        for (let item of this.items) {
            carrito.innerHTML += `
                <div class="carro-item">
                    <img src="${item.img}" alt="${item.name}">
                    <span>${item.name} (x${item.quantity})</span>
                    <button class="btn btn-danger btn-sm" onclick="Carro.removePokemon(${item.id})">X</button>
                </div>
            `;
        }

        if (this.items.length > 0) {
            carrito.innerHTML += `
                <div class="mt-3">
                    <strong>Total: ${this.items.length} Pokémon</strong>
                </div>
            `;
        } else {
            carrito.innerHTML = "<p>El carrito está vacío.</p>";
        }
    }
    static showToast(message, type = "success") {
        const toastContainer = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.setAttribute("role", "alert");
        toast.setAttribute("aria-live", "assertive");
        toast.setAttribute("aria-atomic", "true");
    
        let toastClass = "";
        if (type === "success") {
            toastClass = "bg-success text-white";
        } else if (type === "warning") {
            toastClass = "bg-warning text-dark";
        }
    
        toast.innerHTML = `
            <div class="toast-header ${toastClass}">
                <strong class="me-auto">${type === "success" ? "¡Éxito!" : "Advertencia"}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
    
        toastContainer.appendChild(toast);
    
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000,
        });
    
        bsToast.show();
    }
    
}

// Cargar el carrito al iniciar la página
Carro.loadStorage();