/**
 * Classe Game - Gère l'état et la logique du jeu
 */
class Game {
    constructor() {
        // Initialisation des éléments du jeu
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);
        this.currentLevel = 1;
        this.currentMaze = null;
        this.player = null;
        
        // Variables de temps et boucle de jeu
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.isRunning = false;
        
        // Statistiques de jeu
        this.stats = {
            attempts: 0,
            totalDistance: 0
        };
        
        // Sons du jeu
        this.sounds = {
            ambient: null,
            footsteps: null,
            breathing: null,
            doorOpen: null,
            itemPickup: null
        };
        
        // Gestionnaires d'événements
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Gestionnaire pour le bouton de démarrage
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
        
        // Gestionnaire pour le bouton de redémarrage
        document.getElementById('restart-button').addEventListener('click', () => {
            this.startGame();
        });
    }
    
    loadSounds() {
        // Dans un jeu complet, nous chargerions ici les sons
        // Pour le prototype, nous les simulerons
        console.log('Chargement des sons simulé');
    }
    
    startGame() {
        // Initialisation du jeu
        this.currentLevel = 1;
        this.stats.attempts++;
        
        // Masquer les écrans de menu
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('death-screen').classList.add('hidden');
        
        // Générer le premier labyrinthe
        this.generateNewLevel();
        
        // Démarrer la boucle de jeu
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Charger les sons
        this.loadSounds();
        
        // Afficher un message de bienvenue
        showMessage("Bienvenue dans le labyrinthe. Trouvez la sortie avant de perdre la raison...", 5000);
    }
    
    generateNewLevel() {
        // Générer un nouveau labyrinthe
        this.currentMaze = new MazeGenerator(this.currentLevel);
        
        // Créer le joueur au point de départ
        this.player = new Player(
            this.currentMaze.playerStart.x,
            this.currentMaze.playerStart.y
        );
        
        // Afficher un message de niveau
        showMessage(`Niveau ${this.currentLevel}`, 3000);
    }
    
    gameLoop(timestamp) {
        // Calculer le delta time (en secondes)
        this.deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        // Limiter le deltaTime pour éviter les problèmes avec des framerates très bas
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        
        // Mettre à jour l'état du jeu
        this.update();
        
        // Effectuer le rendu
        this.renderer.render(this);
        
        // Continuer la boucle si le jeu est en cours
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    update() {
        // Mettre à jour le joueur
        this.player.update(this.deltaTime, this.currentMaze);
        
        // Vérifier les interactions du joueur avec le labyrinthe
        this.player.checkInteractions(this.currentMaze, this);
        
        // Vérifier les conditions de défaite
        if (this.player.sanity <= 0) {
            this.handleGameOver();
        }
    }
    
    handleLevelComplete() {
        // Augmenter le niveau
        this.currentLevel++;
        
        // Effet de transition
        screenShake(this.canvas, 10, 1000);
        
        // Prévenir le joueur
        showMessage("Vous avez trouvé la sortie ! Préparez-vous pour le niveau suivant...", 3000);
        
        // Générer le niveau suivant après un délai
        setTimeout(() => {
            this.generateNewLevel();
        }, 3000);
    }
    
    handleGameOver() {
        // Arrêter la boucle de jeu
        this.isRunning = false;
        
        // Mettre à jour les statistiques
        this.stats.totalDistance += this.player.distanceTraveled;
        
        // Afficher l'écran de mort
        const deathScreen = document.getElementById('death-screen');
        deathScreen.classList.remove('hidden');
        
        // Mettre à jour les statistiques affichées
        document.getElementById('distance-stat').textContent = Math.floor(this.stats.totalDistance);
        document.getElementById('attempts-stat').textContent = this.stats.attempts;
    }
}