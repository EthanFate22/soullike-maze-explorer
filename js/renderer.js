/**
 * Classe Renderer - Gère l'affichage du jeu
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Images et textures
        this.textures = {
            wall: null,
            floor: null,
            exit: null,
            item: null,
            clue: null
        };
        
        // Offset de la caméra
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;
        
        // Lumière et effet de flickering
        this.flickerIntensity = 0;
        this.lastFlickerTime = 0;
        
        // Distorsion d'affichage (effet backroom)
        this.distortionEffect = {
            active: true,
            time: 0,
            intensity: 0.03
        };
        
        // Redimensionnement du canvas
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Charger les textures
        this.loadTextures();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    loadTextures() {
        // Nous utiliserons des textures procédurales pour le prototype
        // Dans une version finale, on chargerait des images
        
        // Créer une texture de mur
        this.textures.wall = this.generateWallTexture();
        
        // Créer une texture de sol
        this.textures.floor = this.generateFloorTexture();
        
        // Créer une texture de sortie
        this.textures.exit = this.generateExitTexture();
        
        // Créer une texture d'objet
        this.textures.item = this.generateItemTexture();
        
        // Créer une texture d'indice
        this.textures.clue = this.generateClueTexture();
    }
    
    generateWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Fond de la texture
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        
        // Ajouter des détails (joints, irrégularités, etc.)
        ctx.fillStyle = '#222';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * TILE_SIZE;
            const y = Math.random() * TILE_SIZE;
            const size = Math.random() * 10 + 5;
            ctx.fillRect(x, y, size, size);
        }
        
        // Ajouter des lignes pour simuler des briques
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        
        // Lignes horizontales
        for (let y = 0; y < TILE_SIZE; y += TILE_SIZE / 4) {
            const offset = (y % (TILE_SIZE / 2) === 0) ? 0 : TILE_SIZE / 8;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(TILE_SIZE, y);
            ctx.stroke();
        }
        
        // Lignes verticales
        for (let x = 0; x < TILE_SIZE; x += TILE_SIZE / 8) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, TILE_SIZE);
            ctx.stroke();
        }
        
        return canvas;
    }
    
    generateFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Fond de la texture
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        
        // Ajouter des détails (taches, motifs, etc.)
        ctx.fillStyle = '#3a3a3a';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * TILE_SIZE;
            const y = Math.random() * TILE_SIZE;
            const size = Math.random() * 5 + 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Ajouter une ligne horizontale et verticale pour créer l'effet de carrelage
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(TILE_SIZE, 0);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, TILE_SIZE);
        ctx.stroke();
        
        return canvas;
    }
    
    generateExitTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Fond de la texture (même que le sol)
        ctx.drawImage(this.textures.floor, 0, 0);
        
        // Dessiner une sortie (porte/échelle)
        ctx.fillStyle = '#aaa';
        ctx.fillRect(TILE_SIZE * 0.2, TILE_SIZE * 0.1, TILE_SIZE * 0.6, TILE_SIZE * 0.8);
        
        // Détails de la porte
        ctx.fillStyle = '#333';
        ctx.fillRect(TILE_SIZE * 0.35, TILE_SIZE * 0.4, TILE_SIZE * 0.3, TILE_SIZE * 0.5);
        
        // Poignée
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.arc(TILE_SIZE * 0.75, TILE_SIZE * 0.5, TILE_SIZE * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    generateItemTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Fond de la texture (même que le sol)
        ctx.drawImage(this.textures.floor, 0, 0);
        
        // Dessiner un objet (une lumière/lanterne)
        ctx.fillStyle = '#ffb';
        ctx.beginPath();
        ctx.arc(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Aura lumineuse
        const gradient = ctx.createRadialGradient(
            TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 10,
            TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    generateClueTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');
        
        // Fond de la texture (même que le sol)
        ctx.drawImage(this.textures.floor, 0, 0);
        
        // Dessiner un symbole/marque sur le mur
        ctx.fillStyle = '#f55';
        ctx.font = `${TILE_SIZE / 3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', TILE_SIZE / 2, TILE_SIZE / 2);
        
        // Ajouter quelques taches de sang
        ctx.fillStyle = '#a00';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * TILE_SIZE;
            const y = Math.random() * TILE_SIZE;
            const size = Math.random() * 5 + 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return canvas;
    }
    
    // Mettre à jour la position de la caméra pour suivre le joueur
    updateCamera(playerX, playerY) {
        this.cameraOffsetX = playerX - this.canvas.width / 2;
        this.cameraOffsetY = playerY - this.canvas.height / 2;
    }
    
    // Mettre à jour l'effet de scintillement des lumières
    updateLightFlicker(deltaTime) {
        // Ajouter un effet de scintillement aléatoire
        this.lastFlickerTime += deltaTime;
        
        if (this.lastFlickerTime > 0.1) { // Changer l'intensité toutes les 100ms
            this.lastFlickerTime = 0;
            this.flickerIntensity = randomFloat(0.8, 1.2);
        }
        
        // Mettre à jour l'effet de distorsion
        this.distortionEffect.time += deltaTime;
    }
    
    // Dessiner le labyrinthe
    renderMaze(maze, player) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner l'arrière-plan
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculer les tuiles visibles
        const startX = Math.floor(this.cameraOffsetX / TILE_SIZE);
        const startY = Math.floor(this.cameraOffsetY / TILE_SIZE);
        const endX = Math.ceil((this.cameraOffsetX + this.canvas.width) / TILE_SIZE);
        const endY = Math.ceil((this.cameraOffsetY + this.canvas.height) / TILE_SIZE);
        
        // Distance maximale de vue
        const viewDistance = RENDER_CONFIG.VIEW_DISTANCE * TILE_SIZE;
        
        // Dessiner les tuiles dans la zone visible
        for (let y = Math.max(0, startY); y < Math.min(maze.height, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(maze.width, endX); x++) {
                const tileType = maze.getTileAt(x, y);
                
                if (tileType === TILE_TYPES.EMPTY) continue;
                
                // Calculer la position de la tuile sur l'écran
                const drawX = x * TILE_SIZE - this.cameraOffsetX;
                const drawY = y * TILE_SIZE - this.cameraOffsetY;
                
                // Calculer la distance du joueur à cette tuile
                const tileDistanceToPlayer = distance(
                    player.x, player.y,
                    x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2
                );
                
                // Appliquer un effet de fog of war basé sur la distance
                let alpha = 1.0;
                if (tileDistanceToPlayer > viewDistance * 0.5) {
                    alpha = Math.max(0, 1 - (tileDistanceToPlayer - viewDistance * 0.5) / (viewDistance * 0.5));
                }
                
                // Assombrir davantage les tuiles en fonction de la santé mentale du joueur
                alpha *= Math.max(0.5, player.sanity / SANITY_MAX);
                
                // Appliquer l'effet de scintillement aux lumières
                if (tileType === TILE_TYPES.ITEM) {
                    alpha *= this.flickerIntensity;
                }
                
                // Dessiner la texture de la tuile avec l'opacité calculée
                ctx.globalAlpha = alpha;
                
                // Choisir la texture en fonction du type de tuile
                let texture;
                switch (tileType) {
                    case TILE_TYPES.WALL:
                        texture = this.textures.wall;
                        break;
                    case TILE_TYPES.FLOOR:
                        texture = this.textures.floor;
                        break;
                    case TILE_TYPES.EXIT:
                        texture = this.textures.exit;
                        break;
                    case TILE_TYPES.ITEM:
                        texture = this.textures.item;
                        break;
                    case TILE_TYPES.CLUE:
                        texture = this.textures.clue;
                        break;
                    default:
                        texture = this.textures.floor;
                }
                
                // Appliquer la distorsion si active
                if (this.distortionEffect.active) {
                    const waveX = Math.sin(this.distortionEffect.time * 2 + y * 0.1) * this.distortionEffect.intensity * TILE_SIZE;
                    const waveY = Math.cos(this.distortionEffect.time * 3 + x * 0.1) * this.distortionEffect.intensity * TILE_SIZE;
                    ctx.drawImage(texture, drawX + waveX, drawY + waveY);
                } else {
                    ctx.drawImage(texture, drawX, drawY);
                }
            }
        }
        
        // Réinitialiser l'opacité
        ctx.globalAlpha = 1.0;
    }
    
    // Appliquer un effet de vignette sur l'écran
    applyVignette() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Créer un dégradé radial depuis le centre vers les bords
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, Math.min(width, height) * 0.3,
            width / 2, height / 2, Math.min(width, height) * 0.7
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    
    // Appliquer un effet d'aberration chromatique
    applyChromaticAberration(intensity = 0.005) {
        const ctx = this.ctx;
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Version simplifiée : décaler les canaux rouge et bleu
        // Pour une implementation complète, il faudrait utiliser des shaders WebGL
        const offsetX = Math.floor(this.canvas.width * intensity);
        const offsetY = Math.floor(this.canvas.height * intensity);
        
        // Temporaire, pour simuler l'effet sans vraiment l'implémenter
        // (l'implémentation réelle nécessite plus de complexité)
        ctx.drawImage(this.canvas, offsetX, 0, this.canvas.width - offsetX, this.canvas.height, 0, 0, this.canvas.width - offsetX, this.canvas.height);
    }
    
    // Appliquer tous les effets post-processing
    applyPostProcessing(player) {
        // Appliquer l'effet de vignette
        this.applyVignette();
        
        // Appliquer l'aberration chromatique si la santé mentale du joueur est basse
        if (player.sanity < SANITY_MAX * 0.5) {
            const intensity = 0.005 + (1 - player.sanity / SANITY_MAX) * 0.01;
            this.applyChromaticAberration(intensity);
        }
    }
    
    // Rendu complet d'une frame
    render(game) {
        // Mettre à jour la position de la caméra
        this.updateCamera(game.player.x, game.player.y);
        
        // Mettre à jour l'effet de scintillement
        this.updateLightFlicker(game.deltaTime);
        
        // Dessiner le labyrinthe
        this.renderMaze(game.currentMaze, game.player);
        
        // Dessiner le joueur
        game.player.render(this.ctx, this.cameraOffsetX, this.cameraOffsetY);
        
        // Appliquer les effets post-processing
        this.applyPostProcessing(game.player);
    }
}