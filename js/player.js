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
        
        // Ajout d'un cooldown pour la récupération d'indices et d'objets
        this.interactionCooldown = 0;
        
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
        
        // Gestion du sprint - Augmenter la vitesse de base pour compenser les grands labyrinthes
        let speed = PLAYER_SPEED * 2.5;
        this.isSprinting = this.controls.sprint && this.stamina > 0 && this.isMoving;
        
        if (this.isSprinting) {
            speed *= SPRINT_MULTIPLIER;
            this.stamina = Math.max(0, this.stamina - STAMINA_SPRINT_COST * deltaTime);
        } else if (!this.controls.sprint) {
            // Régénération de l'endurance plus rapide
            this.stamina = Math.min(STAMINA_MAX, this.stamina + STAMINA_REGEN * 1.5 * deltaTime);
        }
        
        // Mise à jour de la position avec détection de collision
        const newX = this.x + this.velocityX * speed * deltaTime;
        const newY = this.y + this.velocityY * speed * deltaTime;
        
        // Optimisation du mouvement: permettre un glissement le long des murs
        // Vérifier d'abord si les deux directions sont libres
        let canMoveX = !this.checkCollision(newX, this.y, maze);
        let canMoveY = !this.checkCollision(this.x, newY, maze);
        
        // Si les deux directions sont bloquées, essayer de glisser le long des murs
        if (!canMoveX && !canMoveY) {
            // Essayer de glisser un peu moins loin pour éviter de rester coincé
            const slideX = this.x + this.velocityX * speed * deltaTime * 0.5;
            const slideY = this.y + this.velocityY * speed * deltaTime * 0.5;
            
            canMoveX = !this.checkCollision(slideX, this.y, maze);
            canMoveY = !this.checkCollision(this.x, slideY, maze);
        }
        
        // Appliquer le mouvement selon les possibilités
        if (canMoveX) {
            this.x = newX;
        }
        
        if (canMoveY) {
            this.y = newY;
        }
        
        // Mise à jour de la santé mentale - baisse plus lente pour compenser la taille du labyrinthe
        this.sanity = Math.max(0, this.sanity - SANITY_DRAIN * 0.5 * deltaTime);
        
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
        
        // Mise à jour du cooldown d'interaction
        if (this.interactionCooldown > 0) {
            this.interactionCooldown -= deltaTime;
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
        // Vérifier le cooldown d'interaction
        if (this.interactionCooldown > 0) {
            return;
        }
        
        const currentTile = pixelToTile(this.x, this.y);
        const tileType = maze.getTileAt(currentTile.x, currentTile.y);
        
        switch (tileType) {
            case TILE_TYPES.EXIT:
                game.handleLevelComplete();
                this.interactionCooldown = 1.0; // Empêcher les interactions pendant 1 seconde
                break;
            case TILE_TYPES.ITEM:
                // Récupération d'objet - restaure plus de santé mentale pour compenser
                this.sanity = Math.min(SANITY_MAX, this.sanity + SANITY_RECOVERY * 2);
                maze.setTileAt(currentTile.x, currentTile.y, TILE_TYPES.FLOOR);
                showMessage("Vous avez trouvé un objet qui apaise votre esprit.");
                
                // Ajouter un effet visuel
                screenShake(game.canvas, 2, 200);
                this.interactionCooldown = 0.5; // Empêcher les interactions pendant 0.5 seconde
                break;
            case TILE_TYPES.CLUE:
                // Calcul de la distance à la sortie pour donner un indice plus précis
                const exitDistance = distance(currentTile.x, currentTile.y, maze.exit.x, maze.exit.y);
                const totalMazeSize = Math.sqrt(maze.width * maze.width + maze.height * maze.height);
                
                // Message basé sur la distance relative
                let message = "";
                if (exitDistance < totalMazeSize * 0.2) {
                    message = "Une inscription sur le mur indique que la sortie est très proche...";
                } else if (exitDistance < totalMazeSize * 0.4) {
                    message = "Un symbole vous indique la direction générale de la sortie.";
                    
                    // Déterminer la direction approximative
                    const dirX = maze.exit.x - currentTile.x;
                    const dirY = maze.exit.y - currentTile.y;
                    
                    if (Math.abs(dirX) > Math.abs(dirY)) {
                        message += dirX > 0 ? " Elle se trouve à l'est." : " Elle se trouve à l'ouest.";
                    } else {
                        message += dirY > 0 ? " Elle se trouve au sud." : " Elle se trouve au nord.";
                    }
                } else {
                    message = "Une vague indication sur le mur suggère que la sortie est encore loin...";
                }
                
                showMessage(message);
                maze.setTileAt(currentTile.x, currentTile.y, TILE_TYPES.FLOOR);
                this.interactionCooldown = 0.5; // Empêcher les interactions pendant 0.5 seconde
                break;
        }
    }
    
    updateUI() {
        // Mise à jour des barres d'état
        document.getElementById('stamina-fill').style.width = `${this.stamina}%`;
        document.getElementById('sanity-fill').style.width = `${this.sanity}%`;
    }
    
    render(ctx, cameraOffsetX, cameraOffsetY) {
        // Dessinez le joueur
        ctx.save();
        
        // Position avec offset de caméra
        const drawX = this.x - cameraOffsetX;
        const drawY = this.y - cameraOffsetY;
        
        // Dessiner une lueur autour du joueur (source de lumière)
        const gradient = ctx.createRadialGradient(
            drawX, drawY, 0,
            drawX, drawY, this.width * 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.width * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Dessin du corps - ajout d'ombre
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Désactiver les ombres pour les détails
        ctx.shadowColor = 'transparent';
        
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
        
        // Ajouter un effet de "respiration" lorsque le joueur ne bouge pas
        if (!this.isMoving) {
            const breathScale = 1 + Math.sin(Date.now() * 0.003) * 0.02;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drawX, drawY, this.width / 2 * breathScale, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Ajouter un effet de sprint lorsque le joueur sprint
        if (this.isSprinting) {
            ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX, drawY, this.width / 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}