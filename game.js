const config = {
    type: Phaser.AUTO,
    width: 390, 
    height: 844,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1500 }, // Gravità aumentata per salti più reattivi sui treni
            debug: false 
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let ground;
let obstacles;
let score = 0;
let scoreText;
let isGameOver = false;
let gameOverText;

function preload() {
    let graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Pavimento (Verde)
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(0, 0, 390, 50);
    graphics.generateTexture('pavimento', 390, 50);
    
    // Giocatore (Rosso)
    graphics.clear();
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('protagonista', 40, 40);

    // Treno Trenord (Blu) - Largo e calpestabile
    graphics.clear();
    graphics.fillStyle(0x003399, 1);
    graphics.fillRect(0, 0, 180, 50);
    graphics.generateTexture('treno', 180, 50);
}

function create() {
    // Resetta le variabili a ogni riavvio
    isGameOver = false;
    score = 0;

    this.cameras.main.setBackgroundColor('#87CEEB'); 

    // 1. Pavimento
    let platforms = this.physics.add.staticGroup();
    ground = platforms.create(195, 820, 'pavimento'); 

    // 2. Giocatore
    player = this.physics.add.sprite(80, 600, 'protagonista');
    player.setCollideWorldBounds(true); 

    // 3. Gruppo ostacoli
    obstacles = this.physics.add.group();

    // 4. Collisioni fisiche
    this.physics.add.collider(player, platforms);
    
    // COLLISIONE INTELLIGENTE PER CAMMINARE SUI TRENI
    this.physics.add.collider(player, obstacles, function(playerHit, trainHit) {
        if (playerHit.body.touching.down && trainHit.body.touching.up) {
            // Il giocatore è sopra il tetto del treno: nessun Game Over
        } else {
            // Impatto frontale o da sotto
            hitObstacle.call(this, playerHit, trainHit);
        }
    }, null, this);

    // 5. Salto con il touch
    this.input.on('pointerdown', function () {
        if (player.body.touching.down && !isGameOver) {
            player.setVelocityY(-750); 
        }
    });

    // 6. TESTI A SCHERMO
    // Testo per i chilometri (inizializzato a 0 su 250)
    scoreText = this.add.text(20, 40, '0 su 250 km', { 
        fontFamily: 'SouthPark', 
        fontSize: '28px', 
        fill: '#FFFFFF', 
        stroke: '#000000', 
        strokeThickness: 5
    });

    // Scritta GAME OVER gigante e centrale (inizialmente invisibile)
    gameOverText = this.add.text(195, 350, 'GAME OVER', { 
        fontFamily: 'SouthPark', 
        fontSize: '60px', 
        fill: '#FF0000', 
        stroke: '#000000', 
        strokeThickness: 8
    }).setOrigin(0.5).setVisible(false);

    // 7. Avvia il primo treno
    spawnObstacle.call(this);
}

function update() {
    if (isGameOver) return;

    // Impedisce al giocatore di scivolare all'indietro sul tetto del treno
    player.setX(80);

    // I chilometri aumentano costantemente
    score += 0.05; 
    scoreText.setText(Math.floor(score) + ' su 250 km');

    // Distrugge i treni usciti dallo schermo
    obstacles.children.iterate(function (obstacle) {
        if (obstacle && obstacle.x < -150) {
            obstacle.destroy();
        }
    });
}

function spawnObstacle() {
    if (isGameOver) return;

    let train = obstacles.create(500, 770, 'treno');
    
    // Il treno non cade con la gravità ed è inamovibile
    train.body.allowGravity = false;
    train.setImmovable(true);

    // Velocità e difficoltà incrementali in base ai chilometri
    let baseSpeed = 250 + (score * 1.5);
    train.setVelocityX(-Phaser.Math.Between(baseSpeed, baseSpeed + 80));

    let minDelay = Math.max(900, 2000 - (score * 5));
    let maxDelay = Math.max(1600, 3500 - (score * 5));

    this.time.addEvent({
        delay: Phaser.Math.Between(minDelay, maxDelay),
        callback: spawnObstacle,
        callbackScope: this
    });
}

function hitObstacle(playerHit, trainHit) {
    if (isGameOver) return;
    isGameOver = true;

    this.physics.pause(); 
    playerHit.setTint(0x000000); 
    
    gameOverText.setVisible(true);
    
    this.time.delayedCall(2500, function () {
        this.scene.restart();
    }, [], this);
}