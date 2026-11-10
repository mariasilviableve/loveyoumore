const config = {
    type: Phaser.AUTO,
    // Dimensioni base del gioco (es. in formato verticale per telefono)
    width: 390, 
    height: 844,
    // Questo serve per adattare il gioco a qualsiasi schermo mobile
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Gravità per far cadere il personaggio
            debug: false // Metti a true se vuoi vedere i riquadri di collisione
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Variabili globali
let player;

// 1. Qui carichiamo le immagini e i suoni (lo faremo dopo)
function preload() {
    // Esempio: this.load.image('sfondo', 'assets/sfondo.png');
}

// 2. Qui creiamo gli elementi sullo schermo all'avvio
function create() {
    // Sfondo temporaneo per capire se funziona
    this.cameras.main.setBackgroundColor('#87CEEB'); // Azzurro cielo

    // Più avanti qui aggiungeremo il giocatore, le piattaforme e il tasto per saltare
}

// 3. Qui mettiamo le regole che si ripetono ogni frame (es. muovere il personaggio)
function update() {
    
}