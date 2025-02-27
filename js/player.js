/**
 * Classe Player - Gère le joueur, ses mouvements et son état
 */
class Player {
    constructor(x, y) {
        // Position et mouvement
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE * 0.7;  // Taille du joueur légèrement plus petite que la tuile
        this.height = TILE_SIZE * 0.7;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // États et statistiques
        this.stamina = STAMINA_MAX;
        this.sanity = SANITY_MAX;
        this.isSprinting = false;
        this.isMoving = false;
        this.distanceTraveled = 0;
        
        // Animation
        this.frameCount = 0;
        this.currentFrame = 0;
        this.facingDirection = 'down'; // 'up', 'down', 'left', 'right'
        
        // Contrôles
        this.controls = {
            up: false,
            down: false,
            left: false,
            right: false,
            sprint: false
        };
        
        // Initialisation des contrôles
        this.setupControls();
    }
    
    setupControls() {
        // Gestion des touches enfoncées
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': case 'z': case 'w':
                    this.controls.up = true;
                    break;
                case 'ArrowDown': case 's':
                    this.controls.down = true;
                    break;
                case 'ArrowLeft': case 'q': case 'a':
                    this.controls.left = true;
                    break;
                case 'ArrowRight': case 'd':
                    this.controls.right = true;
                    break;
                case 'Shift':
                    this.controls.sprint = true;
                    break;
            }
        });
        
        // Gestion des touches relâchées
        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp': case 'z': case 'w':
                    this.controls.up = false;
                    break;
                case 'ArrowDown': case 's':
                    this.controls.down = false;
                    break;
                case 'ArrowLeft': case 'q': case 'a':
                    this.controls.left = false;
                    break;
                case 'ArrowRight': case 'd':
                    this.controls.right = false;
                    break;
                case 'Shift':
                    this.controls.sprint = false;
                    break;
            }
        });
    }
    
    update(deltaTime, maze) {
        // Réinitialisation de la vélocité
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Gestion du mouvement selon les touches pressées
        if (this.controls.up) {
            this.velocityY = -1;
            this.facingDirection = 'up';
        }
        if (this.controls.down) {
            this.velocityY = 1;
            this.facingDirection = 'down';
        }
        if (this.controls.left) {
            this.velocityX = -1;
            this.facingDirection = 'left';
        }
        if (this.controls.right) {
            this.velocityX = 1;
            this.facingDirection = 'right';
        }
        
        // Normalisation de la vélocité pour les mouvements en diagonale
        const length = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (length > 0) {
            this.velocityX /= length;
            this.velocityY /= length;
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
        
        // Gestion du sprint
        let speed = PLAYER_SPEED;
        this.isSprinting = this.controls.sprint && this.stamina > 0 && this.isMoving;
        
        if (this.isSprinting) {
            speed *= SPRINT_MULTIPLIER;
            this.stamina = Math.max(0, this.stamina - STAMINA_SPRINT_COST * deltaTime);
        } else if (!this.controls.sprint) {
            this.stamina = Math.min(STAMINA_MAX, this.stamina + STAMINA_REGEN * deltaTime);
        }
        
        // Mise à jour de la position avec détection de collision
        const newX = this.x + this.velocityX * speed * deltaTime;
        const newY = this.y + this.velocityY * speed * deltaTime;
        
        // Vérifiez si le joueur peut se déplacer en x
        if (!this.checkCollision(newX, this.y, maze)) {
            this.x = newX;
        }
        
        // Vérifiez si le joueur peut se déplacer en y
        if (!this.checkCollision(this.x, newY, maze)) {
            this.y = newY;
        }
        
        // Mise à jour de la santé mentale
        this.sanity = Math.max(0, this.sanity - SANITY_DRAIN * deltaTime);
        
        // Animation
        if (this.isMoving) {
            this.frameCount += deltaTime * 10;
            if (this.frameCount >= 4) {
                this.frameCount = 0;
                this.currentFrame = (this.currentFrame + 1) % 4;
            }
            
            // Mise à jour de la distance parcourue
            this.distanceTraveled += speed * deltaTime * 0.01;
        }
        
        // Mise à jour de l'interface utilisateur
        this.updateUI();
    }
    
    checkCollision(newX, newY, maze) {
        // Déterminez les tuiles avec lesquelles le joueur peut entrer en collision
        const playerBox = {
            x: newX - this.width / 2,
            y: newY - this.height / 2,
            width: this.width,
            height: this.height
        };
        
        // Convertissez les coordonnées du joueur en indices de tuiles
        const tileCoords = [
            pixelToTile(playerBox.x, playerBox.y), // Coin supérieur gauche
            pixelToTile(playerBox.x + playerBox.width, playerBox.y), // Coin supérieur droit
            pixelToTile(playerBox.x, playerBox.y + playerBox.height), // Coin inférieur gauche
            pixelToTile(playerBox.x + playerBox.width, playerBox.y + playerBox.height) // Coin inférieur droit
        ];
        
        // Vérifiez si l'une des tuiles est un mur
        for (const coord of tileCoords) {
            if (maze.getTileAt(coord.x, coord.y) === TILE_TYPES.WALL) {
                return true; // Collision détectée
            }
        }
        
        return false; // Pas de collision
    }
    
    // Vérifie si le joueur interagit avec une tuile spéciale
    checkInteractions(maze, game) {
        const currentTile = pixelToTile(this.x, this.y);
        const tileType = maze.getTileAt(currentTile.x, currentTile.y);
        
        switch (tileType) {
            case TILE_TYPES.EXIT:
                game.handleLevelComplete();
                break;
            case TILE_TYPES.ITEM:
                this.sanity = Math.min(SANITY_MAX, this.sanity + SANITY_RECOVERY);
                maze.setTileAt(currentTile.x, currentTile.y, TILE_TYPES.FLOOR);
                showMessage("Vous avez trouvé un objet qui apaise votre esprit.");
                break;
            case TILE_TYPES.CLUE:
                showMessage("Une inscription sur le mur indique que la sortie est proche...");
                maze.setTileAt(currentTile.x, currentTile.y, TILE_TYPES.FLOOR);
                break;
        }
    }
    
    updateUI() {
        // Mise à jour des barres d'état
        document.getElementById('stamina-fill').style.width = `${this.stamina}%`;
        document.getElementById('sanity-fill').style.width = `${this.sanity}%`;
    }
    
    render(ctx, cameraOffsetX, cameraOffsetY) {
        // Dessinez le joueur (pour l'instant, un simple cercle)
        ctx.save();
        
        // Position avec offset de caméra
        const drawX = this.x - cameraOffsetX;
        const drawY = this.y - cameraOffsetY;
        
        // Dessin du corps
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Dessin de la direction du regard
        ctx.fillStyle = '#333';
        let eyeX = drawX;
        let eyeY = drawY;
        const eyeOffset = this.width / 4;
        
        switch (this.facingDirection) {
            case 'up':
                eyeY -= eyeOffset;
                break;
            case 'down':
                eyeY += eyeOffset;
                break;
            case 'left':
                eyeX -= eyeOffset;
                break;
            case 'right':
                eyeX += eyeOffset;
                break;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, this.width / 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}