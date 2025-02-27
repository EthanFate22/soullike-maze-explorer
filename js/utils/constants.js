// Constantes du jeu
const TILE_SIZE = 64; // Taille des tuiles (en pixels)
const PLAYER_SPEED = 200; // Vitesse du joueur (pixels/seconde)
const STAMINA_MAX = 100; // Endurance maximale
const STAMINA_REGEN = 10; // Régénération d'endurance par seconde
const STAMINA_SPRINT_COST = 25; // Coût d'endurance par seconde en sprint
const SPRINT_MULTIPLIER = 1.7; // Multiplicateur de vitesse en sprint

const SANITY_MAX = 100; // Santé mentale maximale
const SANITY_DRAIN = 1; // Baisse de santé mentale par seconde
const SANITY_RECOVERY = 5; // Récupération de santé mentale en trouvant des objets

// Types de tuiles
const TILE_TYPES = {
    EMPTY: 0,
    WALL: 1,
    FLOOR: 2,
    EXIT: 3,
    ITEM: 4,
    CLUE: 5
};

// Ambiance sonore
const SOUND_CONFIG = {
    AMBIENT_VOLUME: 0.2,
    FOOTSTEP_VOLUME: 0.1,
    BREATH_VOLUME: 0.15
};

// Configuration du labyrinthe
const MAZE_CONFIG = {
    BASE_WIDTH: 100,        // Largeur de base beaucoup plus grande (était 32)
    BASE_HEIGHT: 100,       // Hauteur de base beaucoup plus grande (était 32)
    COMPLEXITY_MULTIPLIER: 5, // Multiplicateur de complexité augmenté (était 2)
    EXIT_PLACEMENT_DISTANCE: 0.9, // Sortie placée encore plus loin (était 0.8)
    ITEM_DENSITY: 0.01      // Moins d'objets pour rendre l'exploration plus difficile (était 0.02)
};

// Temps de fondu pour les transitions (en ms)
const FADE_DURATION = 1000;

// Constantes de rendu
const RENDER_CONFIG = {
    LIGHT_RADIUS: 4,       // Rayon de lumière réduit (était 5)
    AMBIENT_LIGHT: 0.05,   // Lumière ambiante réduite (était 0.1)
    FOG_DENSITY: 0.3,      // Densité du brouillard augmentée (était 0.2)
    VIEW_DISTANCE: 6       // Distance de vision réduite (était 8)
};