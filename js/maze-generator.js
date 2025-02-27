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
        
        // Créer des labyrinthe sectionnés plus complexes selon les niveaux
        if (this.level % 4 === 0) {
            // Pour les niveaux divisibles par 4, utiliser RecursiveDivision
            // puis ajouter des murs supplémentaires pour bloquer certains passages
            LABY.mazes.RecursiveDivision(this.tileMap, {});
            this.addAdditionalWalls(0.3); // Bloquer 30% des passages supplémentaires
        } else if (this.level % 4 === 1) {
            // Pour les niveaux qui donnent un reste de 1, utiliser RecursiveBacktrack
            // qui crée des chemins plus tortueux et longs
            LABY.mazes.RecursiveBacktrack(this.tileMap, {});
        } else if (this.level % 4 === 2) {
            // Pour les niveaux qui donnent un reste de 2, utiliser GrowingTree
            // qui génère des labyrinthes plus asymétriques
            LABY.mazes.GrowingTree(this.tileMap, {});
            this.addAdditionalWalls(0.2); // Bloquer 20% des passages supplémentaires
        } else {
            // Pour les niveaux qui donnent un reste de 3, utiliser une combinaison
            // Diviser le labyrinthe en 4 sections avec des algorithmes différents
            this.createSectionedMaze();
        }
        
        // Convertir la représentation du labyrinthe
        // Dans LABY, les chemins sont 0 et les murs sont 1
        // Nous voulons inverser cela pour notre système de types de tuiles
        this.convertMaze();
        
        // Placer le joueur, la sortie et les objets
        this.placeFeaturesAndItems();
    }
    
    // Méthode pour ajouter des murs supplémentaires aléatoires 
    // afin de bloquer certains passages et rendre le labyrinthe plus complexe
    addAdditionalWalls(blockPercentage) {
        // Identifier les passages potentiels (cases avec 0)
        const passages = [];
        
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const idx = y * this.width + x;
                
                // Si c'est un passage (0) et pas sur le bord
                if (this.tileMap.data[idx] === 0) {
                    const adjacentWalls = this.countAdjacentWalls(x, y);
                    
                    // Si le passage a 2 murs adjacents ou plus (potentiellement dans un couloir)
                    if (adjacentWalls >= 2) {
                        passages.push({ x, y });
                    }
                }
            }
        }
        
        // Sélectionner aléatoirement un pourcentage des passages pour les bloquer
        const numToBlock = Math.floor(passages.length * blockPercentage);
        for (let i = 0; i < numToBlock; i++) {
            const randomIndex = Math.floor(Math.random() * passages.length);
            const passage = passages[randomIndex];
            
            // Vérifier si bloquer ce passage ne crée pas d'îlots inaccessibles
            if (!this.wouldCreateIsland(passage.x, passage.y)) {
                const idx = passage.y * this.width + passage.x;
                this.tileMap.data[idx] = 1; // Bloquer le passage en le transformant en mur
            }
            
            // Retirer ce passage de la liste pour éviter de le sélectionner à nouveau
            passages.splice(randomIndex, 1);
        }
    }
    
    // Vérifier si bloquer ce passage créerait une zone inaccessible
    wouldCreateIsland(x, y) {
        // Implémenter un algorithme de vérification de connectivité (BFS ou flood fill)
        // Simplification : si ce passage est le seul lien entre deux zones, ne pas le bloquer
        
        // Compter le nombre de passages adjacents (diagonales non comprises)
        const adjacentPassages = [];
        
        // Vérifier les 4 directions orthogonales
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];
        
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            const idx = ny * this.width + nx;
            
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                if (this.tileMap.data[idx] === 0) { // Si c'est un passage
                    adjacentPassages.push({ x: nx, y: ny });
                }
            }
        }
        
        // Si moins de 2 passages adjacents, c'est un cul-de-sac, on peut le bloquer
        if (adjacentPassages.length < 2) {
            return false;
        }
        
        // Vérifier si les passages adjacents sont connectés sans passer par (x,y)
        // Pour un prototype simple, on autorise le blocage si pas plus de 2 passages adjacents
        return adjacentPassages.length > 2;
    }
    
    // Compter le nombre de murs adjacents à une position
    countAdjacentWalls(x, y) {
        let count = 0;
        
        // Vérifier les 4 directions orthogonales
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];
        
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            const idx = ny * this.width + nx;
            
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                if (this.tileMap.data[idx] === 1) { // Si c'est un mur
                    count++;
                }
            } else {
                // Considérer hors limites comme des murs
                count++;
            }
        }
        
        return count;
    }
    
    // Crée un labyrinthe divisé en sections avec différents algorithmes
    createSectionedMaze() {
        // Diviser le labyrinthe en 4 sections
        const midX = Math.floor(this.width / 2);
        const midY = Math.floor(this.height / 2);
        
        // Créer 4 sous-cartes
        const topLeft = new LABY.TileMap({ width: midX, height: midY });
        const topRight = new LABY.TileMap({ width: this.width - midX, height: midY });
        const bottomLeft = new LABY.TileMap({ width: midX, height: this.height - midY });
        const bottomRight = new LABY.TileMap({ width: this.width - midX, height: this.height - midY });
        
        // Appliquer différents algorithmes à chaque section
        LABY.mazes.RecursiveBacktrack(topLeft, {});
        LABY.mazes.RecursiveDivision(topRight, {});
        LABY.mazes.GrowingTree(bottomLeft, {});
        
        // Pour la quatrième section, utiliser Eller's Algorithm ou AldousBroder
        if (Math.random() < 0.5) {
            LABY.mazes.Eller(bottomRight, {});
        } else {
            LABY.mazes.AldousBroder(bottomRight, {});
        }
        
        // Fusionner les 4 sections
        this.tileMap.use(topLeft, 0, 0);
        this.tileMap.use(topRight, midX, 0);
        this.tileMap.use(bottomLeft, 0, midY);
        this.tileMap.use(bottomRight, midX, midY);
        
        // Créer quelques passages entre les sections pour assurer la connectivité
        this.createPassagesBetweenSections(midX, midY);
    }
    
    // Crée des passages entre les sections du labyrinthe
    createPassagesBetweenSections(midX, midY) {
        // Créer plusieurs passages entre les sections (pas simplement 1 par frontière)
        const numPassages = 1 + Math.floor(Math.random() * 2); // 1-2 passages par frontière
        
        // Passage horizontal supérieur (entre le haut gauche et haut droit)
        for (let i = 0; i < numPassages; i++) {
            const y = Math.floor(Math.random() * (midY - 2)) + 1;
            this.tileMap.data[y * this.width + midX] = 0; // Créer un passage
        }
        
        // Passage horizontal inférieur (entre le bas gauche et bas droit)
        for (let i = 0; i < numPassages; i++) {
            const y = midY + Math.floor(Math.random() * (this.height - midY - 2)) + 1;
            this.tileMap.data[y * this.width + midX] = 0; // Créer un passage
        }
        
        // Passage vertical gauche (entre le haut gauche et bas gauche)
        for (let i = 0; i < numPassages; i++) {
            const x = Math.floor(Math.random() * (midX - 2)) + 1;
            this.tileMap.data[midY * this.width + x] = 0; // Créer un passage
        }
        
        // Passage vertical droit (entre le haut droit et bas droit)
        for (let i = 0; i < numPassages; i++) {
            const x = midX + Math.floor(Math.random() * (this.width - midX - 2)) + 1;
            this.tileMap.data[midY * this.width + x] = 0; // Créer un passage
        }
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
            x: randomInt(1, Math.floor(this.width * 0.2)),
            y: randomInt(1, Math.floor(this.height * 0.2))
        };
        
        // S'assurer que le point de départ est un espace ouvert
        while (this.getTileAt(startRegion.x, startRegion.y) !== TILE_TYPES.FLOOR) {
            startRegion.x = (startRegion.x + 1) % (Math.floor(this.width * 0.2));
            if (startRegion.x === 0) {
                startRegion.y = (startRegion.y + 1) % (Math.floor(this.height * 0.2));
            }
        }
        
        this.playerStart = {
            x: startRegion.x * TILE_SIZE + TILE_SIZE / 2,
            y: startRegion.y * TILE_SIZE + TILE_SIZE / 2
        };
        
        // Trouver un point de sortie (très loin du point de départ)
        const exitRegion = {
            x: randomInt(Math.floor(this.width * 0.8), this.width - 2),
            y: randomInt(Math.floor(this.height * 0.8), this.height - 2)
        };
        
        // S'assurer que la sortie est un espace ouvert
        while (this.getTileAt(exitRegion.x, exitRegion.y) !== TILE_TYPES.FLOOR) {
            exitRegion.x = (exitRegion.x - 1 + this.width) % this.width;
            if (exitRegion.x >= Math.floor(this.width * 0.8)) {
                exitRegion.y = (exitRegion.y - 1 + this.height) % this.height;
                if (exitRegion.y < Math.floor(this.height * 0.8)) {
                    exitRegion.y = Math.floor(this.height * 0.8);
                }
            } else {
                exitRegion.x = Math.floor(this.width * 0.8);
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
        // Mais avec une limite pour éviter trop d'objets dans de très grands labyrinthes
        const maxItems = 50; // Limiter le nombre maximal d'objets
        let itemCount = Math.floor(this.width * this.height * MAZE_CONFIG.ITEM_DENSITY);
        itemCount = Math.min(itemCount, maxItems); 
        
        // Placer les objets stratégiquement sur le chemin plutôt que complètement au hasard
        
        // Calculer la distance entre le départ et la sortie
        const startTileX = this.playerStart.x / TILE_SIZE;
        const startTileY = this.playerStart.y / TILE_SIZE;
        const totalDistance = distance(startTileX, startTileY, this.exit.x, this.exit.y);
        
        // Placer des objets à intervalles réguliers sur le chemin approximatif
        for (let i = 0; i < itemCount; i++) {
            // Calculer un point sur le chemin approximatif
            const progress = (i + 1) / (itemCount + 1); // Répartir uniformément les objets
            
            // Ajouter un facteur aléatoire pour ne pas les aligner parfaitement
            const jitterX = randomInt(-Math.floor(this.width * 0.2), Math.floor(this.width * 0.2));
            const jitterY = randomInt(-Math.floor(this.height * 0.2), Math.floor(this.height * 0.2));
            
            let x = Math.floor(startTileX + (this.exit.x - startTileX) * progress) + jitterX;
            let y = Math.floor(startTileY + (this.exit.y - startTileY) * progress) + jitterY;
            
            // S'assurer que les coordonnées sont dans les limites
            x = clamp(x, 1, this.width - 2);
            y = clamp(y, 1, this.height - 2);
            
            // Trouver une case libre à proximité si le point calculé n'est pas un sol
            let found = false;
            const searchRadius = 10; // Rayon de recherche plus grand
            
            for (let offsetY = -searchRadius; offsetY <= searchRadius && !found; offsetY++) {
                for (let offsetX = -searchRadius; offsetX <= searchRadius && !found; offsetX++) {
                    const tileX = clamp(x + offsetX, 1, this.width - 2);
                    const tileY = clamp(y + offsetY, 1, this.height - 2);
                    
                    if (this.getTileAt(tileX, tileY) === TILE_TYPES.FLOOR &&
                        distance(tileX, tileY, startTileX, startTileY) > 5 &&
                        distance(tileX, tileY, this.exit.x, this.exit.y) > 5) {
                        // Placer l'objet
                        this.setTileAt(tileX, tileY, TILE_TYPES.ITEM);
                        this.items.push({ x: tileX, y: tileY });
                        found = true;
                    }
                }
            }
        }
    }
    
    placeClues() {
        this.clues = [];
        
        // Créer un chemin d'indices vers la sortie (plus nombreux dans un labyrinthe plus grand)
        // Un indice tous les 20% de la distance environ
        const pathLength = 5 + Math.floor(this.level / 2); // Plus d'indices dans les niveaux avancés
        
        // Calculer la direction générale vers la sortie
        const directionX = this.exit.x - this.playerStart.x / TILE_SIZE;
        const directionY = this.exit.y - this.playerStart.y / TILE_SIZE;
        
        for (let i = 1; i <= pathLength; i++) {
            // Placer les indices à intervalles réguliers vers la sortie
            const progress = i / (pathLength + 1);
            
            // Ajouter une légère déviation aléatoire
            const jitterX = randomFloat(-0.1, 0.1);
            const jitterY = randomFloat(-0.1, 0.1);
            
            const targetX = Math.floor(this.playerStart.x / TILE_SIZE + (directionX * (progress + jitterX)));
            const targetY = Math.floor(this.playerStart.y / TILE_SIZE + (directionY * (progress + jitterY)));
            
            // Trouver une case libre près de la cible
            let found = false;
            const searchRadius = 10; // Rayon de recherche plus grand
            
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