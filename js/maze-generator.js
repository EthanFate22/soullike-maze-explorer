/**
 * Classe MazeGenerator - Génère et gère le labyrinthe
 */
class MazeGenerator {
    constructor(level = 1) {
        this.level = level;
        this.width = MAZE_CONFIG.BASE_WIDTH + Math.floor(level * MAZE_CONFIG.COMPLEXITY_MULTIPLIER);
        this.height = MAZE_CONFIG.BASE_HEIGHT + Math.floor(level * MAZE_CONFIG.COMPLEXITY_MULTIPLIER);
        this.tileMap = null;
        this.playerStart = { x: 0, y: 0 };
        this.exit = { x: 0, y: 0 };
        this.items = [];
        this.clues = [];
        
        // Génération du labyrinthe
        this.generate();
    }
    
    generate() {
        // Utilisation de Labyrinthos.js pour la génération
        this.tileMap = new LABY.TileMap({
            width: this.width,
            height: this.height
        });
        
        // Remplir la carte avec des murs
        this.tileMap.fill(TILE_TYPES.WALL);
        
        // Appliquer l'algorithme de génération (Recursive Backtracking pour un labyrinthe complexe)
        // Note: on alterne entre plusieurs algorithmes pour avoir des zones différentes
        if (this.level % 3 === 0) {
            // Pour les niveaux divisibles par 3, utiliser RecursiveDivision
            LABY.mazes.RecursiveDivision(this.tileMap, {});
        } else if (this.level % 3 === 1) {
            // Pour les niveaux qui donnent un reste de 1 lors de la division par 3, utiliser RecursiveBacktrack
            LABY.mazes.RecursiveBacktrack(this.tileMap, {});
        } else {
            // Pour les niveaux qui donnent un reste de 2 lors de la division par 3, utiliser GrowingTree
            LABY.mazes.GrowingTree(this.tileMap, {});
        }
        
        // Convertir la représentation du labyrinthe
        // Dans LABY, les chemins sont 0 et les murs sont 1
        // Nous voulons inverser cela pour notre système de types de tuiles
        this.convertMaze();
        
        // Placer le joueur, la sortie et les objets
        this.placeFeaturesAndItems();
    }
    
    convertMaze() {
        // Création d'une nouvelle grille pour stocker notre labyrinthe converti
        const convertedMaze = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = y * this.width + x;
                // Dans LABY, 0 représente un passage et 1 un mur
                // Ici, on convertit 0 en FLOOR (2) et 1 en WALL (1)
                if (this.tileMap.data[idx] === 0) {
                    convertedMaze[idx] = TILE_TYPES.FLOOR;
                } else {
                    convertedMaze[idx] = TILE_TYPES.WALL;
                }
            }
        }
        
        // Remplacer la grille d'origine par notre grille convertie
        this.tileMap.data = convertedMaze;
    }
    
    placeFeaturesAndItems() {
        // Trouver un point de départ (un espace ouvert proche du coin supérieur gauche)
        const startRegion = {
            x: randomInt(1, Math.floor(this.width * 0.3)),
            y: randomInt(1, Math.floor(this.height * 0.3))
        };
        
        // S'assurer que le point de départ est un espace ouvert
        while (this.getTileAt(startRegion.x, startRegion.y) !== TILE_TYPES.FLOOR) {
            startRegion.x = (startRegion.x + 1) % this.width;
            if (startRegion.x === 0) {
                startRegion.y = (startRegion.y + 1) % this.height;
            }
        }
        
        this.playerStart = {
            x: startRegion.x * TILE_SIZE + TILE_SIZE / 2,
            y: startRegion.y * TILE_SIZE + TILE_SIZE / 2
        };
        
        // Trouver un point de sortie (loin du point de départ)
        const exitRegion = {
            x: randomInt(Math.floor(this.width * 0.7), this.width - 2),
            y: randomInt(Math.floor(this.height * 0.7), this.height - 2)
        };
        
        // S'assurer que la sortie est un espace ouvert
        while (this.getTileAt(exitRegion.x, exitRegion.y) !== TILE_TYPES.FLOOR) {
            exitRegion.x = (exitRegion.x - 1 + this.width) % this.width;
            if (exitRegion.x === this.width - 1) {
                exitRegion.y = (exitRegion.y - 1 + this.height) % this.height;
            }
        }
        
        // Définir la sortie
        this.exit = { x: exitRegion.x, y: exitRegion.y };
        this.setTileAt(exitRegion.x, exitRegion.y, TILE_TYPES.EXIT);
        
        // Placer des objets dans le labyrinthe
        this.placeItems();
        
        // Placer des indices (clues) dans le labyrinthe
        this.placeClues();
    }
    
    placeItems() {
        this.items = [];
        
        // Nombre d'objets à placer basé sur la taille du labyrinthe et la densité d'objets
        const itemCount = Math.floor(this.width * this.height * MAZE_CONFIG.ITEM_DENSITY);
        
        for (let i = 0; i < itemCount; i++) {
            let x, y;
            
            // Trouver un emplacement valide pour l'objet (un sol, pas près du joueur ou de la sortie)
            do {
                x = randomInt(1, this.width - 2);
                y = randomInt(1, this.height - 2);
            } while (
                this.getTileAt(x, y) !== TILE_TYPES.FLOOR ||
                (distance(x, y, this.playerStart.x / TILE_SIZE, this.playerStart.y / TILE_SIZE) < 5) ||
                (distance(x, y, this.exit.x, this.exit.y) < 5)
            );
            
            // Placer l'objet
            this.setTileAt(x, y, TILE_TYPES.ITEM);
            this.items.push({ x, y });
        }
    }
    
    placeClues() {
        this.clues = [];
        
        // Créer un chemin d'indices vers la sortie
        const pathLength = 3; // Nombre d'indices à placer
        
        // Calculer la direction générale vers la sortie
        const directionX = this.exit.x - this.playerStart.x / TILE_SIZE;
        const directionY = this.exit.y - this.playerStart.y / TILE_SIZE;
        
        for (let i = 1; i <= pathLength; i++) {
            // Placer les indices à intervalles réguliers vers la sortie
            const progress = i / (pathLength + 1);
            const targetX = Math.floor(this.playerStart.x / TILE_SIZE + directionX * progress);
            const targetY = Math.floor(this.playerStart.y / TILE_SIZE + directionY * progress);
            
            // Trouver une case libre près de la cible
            let found = false;
            const searchRadius = 5;
            
            for (let offsetY = -searchRadius; offsetY <= searchRadius && !found; offsetY++) {
                for (let offsetX = -searchRadius; offsetX <= searchRadius && !found; offsetX++) {
                    const x = clamp(targetX + offsetX, 1, this.width - 2);
                    const y = clamp(targetY + offsetY, 1, this.height - 2);
                    
                    if (this.getTileAt(x, y) === TILE_TYPES.FLOOR) {
                        this.setTileAt(x, y, TILE_TYPES.CLUE);
                        this.clues.push({ x, y });
                        found = true;
                    }
                }
            }
        }
    }
    
    // Récupérer le type de tuile à une position donnée
    getTileAt(x, y) {
        // Vérifier que les coordonnées sont dans les limites
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return TILE_TYPES.WALL; // Considérer hors-limites comme un mur
        }
        
        const idx = y * this.width + x;
        return this.tileMap.data[idx];
    }
    
    // Définir le type de tuile à une position donnée
    setTileAt(x, y, tileType) {
        // Vérifier que les coordonnées sont dans les limites
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        
        const idx = y * this.width + x;
        this.tileMap.data[idx] = tileType;
    }
}