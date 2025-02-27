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
    BASE_WIDTH: 250,        // Largeur de base encore plus grande (était 100)
    BASE_HEIGHT: 250,       // Hauteur de base encore plus grande (était 100)
    COMPLEXITY_MULTIPLIER: 10, // Complexité extrême (était 5)
    EXIT_PLACEMENT_DISTANCE: 0.95, // Sortie placée extrêmement loin (était 0.9)
    ITEM_DENSITY: 0.005,    // Encore moins d'objets pour augmenter la difficulté (était 0.01)
    WALL_DENSITY: 0.6,      // Pourcentage de passages à bloquer (60% des couloirs potentiels seront murés)
    DEAD_END_RATIO: 0.8,    // Pourcentage de culs-de-sac à conserver (80% - plus c'est élevé, plus il y a d'impasses)
    DISCONNECTION_CHANCE: 0.7, // Probabilité qu'une zone soit intentionnellement séparée des autres
    MIN_PATH_LENGTH: 50     // Longueur minimale du chemin entre l'entrée et la sortie
};

// Temps de fondu pour les transitions (en ms)
const FADE_DURATION = 1000;

// Constantes de rendu
const RENDER_CONFIG = {
    LIGHT_RADIUS: 3,       // Rayon de lumière encore plus réduit (était 4)
    AMBIENT_LIGHT: 0.02,   // Lumière ambiante presque inexistante (était 0.05)
    FOG_DENSITY: 0.4,      // Densité du brouillard augmentée (était 0.3)
    VIEW_DISTANCE: 5       // Distance de vision encore plus réduite (était 6)
};