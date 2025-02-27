/**
 * Point d'entrée principal du jeu
 */

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le jeu
    const game = new Game();
    
    // Vérifier si Labyrinthos.js est chargé
    if (typeof LABY === 'undefined') {
        showMessage('Erreur: Labyrinthos.js n\'est pas chargé. Veuillez rafraîchir la page.', 8000);
        console.error('Labyrinthos.js n\'est pas chargé. Assurez-vous que le script est correctement inclus.');
    }
    
    // Paramètres d'URL pour les tests
    const urlParams = new URLSearchParams(window.location.search);
    const autostart = urlParams.get('autostart');
    
    // Démarrer automatiquement le jeu si demandé
    if (autostart === 'true') {
        setTimeout(() => {
            game.startGame();
        }, 500);
    }
    
    // Export de l'instance de jeu pour le débogage en console
    window.gameInstance = game;
});

// Fonction utilitaire pour précharger des images (utilisée plus tard pour les sprites)
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

// Fonction pour supprimer le flou sur l'interface lors du chargement
function removeLoadingEffects() {
    document.body.classList.remove('loading');
    document.getElementById('loading-screen').classList.add('hidden');
}