/**
 * Utilitaires et fonctions d'aide
 */

// Génère un nombre aléatoire entre min (inclus) et max (exclus)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Génère un nombre flottant aléatoire entre min (inclus) et max (inclus)
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Calcule la distance entre deux points
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Limite une valeur entre min et max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Convertit des coordonnées de tuile en coordonnées de pixel
function tileToPixel(tileX, tileY) {
    return {
        x: tileX * TILE_SIZE,
        y: tileY * TILE_SIZE
    };
}

// Convertit des coordonnées de pixel en coordonnées de tuile
function pixelToTile(pixelX, pixelY) {
    return {
        x: Math.floor(pixelX / TILE_SIZE),
        y: Math.floor(pixelY / TILE_SIZE)
    };
}

// Fonction d'interpolation linéaire
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Vérifie si deux rectangles se chevauchent
function rectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Affiche un message à l'écran
function showMessage(text, duration = 3000) {
    const messageEl = document.getElementById('game-message');
    messageEl.textContent = text;
    messageEl.style.opacity = 1;
    
    setTimeout(() => {
        messageEl.style.opacity = 0;
    }, duration);
}

// Convertit des degrés en radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// Génère un identifiant unique
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Fait trembler l'écran
function screenShake(canvas, intensity = 5, duration = 500) {
    const startTime = Date.now();
    const originalTransform = canvas.style.transform;
    
    function updateShake() {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            const xShake = randomFloat(-intensity, intensity);
            const yShake = randomFloat(-intensity, intensity);
            canvas.style.transform = `translate(${xShake}px, ${yShake}px)`;
            requestAnimationFrame(updateShake);
        } else {
            canvas.style.transform = originalTransform;
        }
    }
    
    updateShake();
}