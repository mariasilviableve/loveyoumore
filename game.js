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
            gravity: { y: 1500 }, 
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
let monete; 
let mazziGroup; 
let score = 0;
let fioriRaccolti = 0; 
let isGameOver = false;
let vittoriaRaggiunta = false; 

let scoreText;
let fioriText;
let gameOverText;
let restartText;
let vittoriaText;
let ragazza;

function preload() {
    let graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Pavimento
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(0, 0, 390, 400); 
    graphics.generateTexture('pavimento', 390, 400);
    
    // Giocatore
    graphics.clear(); graphics.fillStyle(0xFF0000, 1); graphics.fillRect(0, 0, 40, 40); graphics.generateTexture('protagonista', 40, 40);

    // Ostacoli
    graphics.clear(); graphics.fillStyle(0x003399, 1); graphics.fillRect(0, 0, 100, 50); graphics.generateTexture('vagone', 100, 50);
    graphics.clear(); graphics.fillStyle(0x32CD32, 1); graphics.fillRect(0, 0, 150, 60); graphics.generateTexture('flixbus', 150, 60);
    graphics.clear(); graphics.fillStyle(0x8B4513, 1); graphics.fillRect(0, 0, 30, 50); graphics.generateTexture('barbone', 30, 50);
    
    // Moneta e Bottone
    graphics.clear(); graphics.fillStyle(0xFFD700, 1); graphics.fillCircle(10, 10, 10); graphics.generateTexture('moneta', 20, 20);
    graphics.clear(); graphics.fillStyle(0xFFFFFF, 0.5); graphics.fillCircle(30, 30, 30); graphics.generateTexture('bottone', 60, 60);

    // Fiori e Finale
    graphics.clear(); graphics.fillStyle(0xFF69B4, 1); graphics.fillRect(0, 0, 25, 25); graphics.generateTexture('mazzo', 25, 25);
    graphics.clear(); graphics.fillStyle(0x800080, 1); graphics.fillRect(0, 0, 40, 50); graphics.generateTexture('ragazza', 40, 50);
    graphics.clear(); graphics.fillStyle(0xE30022, 1); graphics.fillCircle(8, 8, 8); graphics.generateTexture('cuore', 16, 16);
}

function create() {
    isGameOver = false;
    vittoriaRaggiunta = false;
    
    // TRUCCO PER TESTARE IL FINALE: Cambia a 0 quando vuoi giocare per davvero!
    score = 240; 
    fioriRaccolti = 0;

    this.cameras.main.setBackgroundColor('#87CEEB'); 

    // Pavimento e Giocatore
    let platforms = this.physics.add.staticGroup();
    ground = platforms.create(195, 750, 'pavimento'); 

    player = this.physics.add.sprite(80, 400, 'protagonista');
    player.setCollideWorldBounds(true); 

    obstacles = this.physics.add.group();
    monete = this.physics.add.group();
    mazziGroup = this.physics.add.group();

    this.physics.add.collider(player, platforms);
    
    // Collisione intelligente ostacoli
    this.physics.add.collider(player, obstacles, function(playerHit, obstacleHit) {
        if (!obstacleHit.isBarbone && playerHit.body.touching.down && obstacleHit.body.touching.up) {
            // Cammina sopra i veicoli
        } else {
            hitObstacle.call(this, playerHit, obstacleHit);
        }
    }, null, this);

    this.physics.add.overlap(monete, obstacles, daiEuro, null, this);
    this.physics.add.overlap(player, mazziGroup, raccogliFiore, null, this);

    // TASTO CIRCOLARE EURO
    let btnLancia = this.add.image(340, 780, 'bottone').setInteractive();
    this.add.image(340, 780, 'moneta');

    btnLancia.on('pointerdown', function () {
        if (!isGameOver && !vittoriaRaggiunta) lanciaMoneta.call(this);
    }, this);

    // Salto
    this.input.on('pointerdown', function (pointer, currentlyOver) {
        if (currentlyOver.length > 0 || isGameOver || vittoriaRaggiunta) return;
        if (player.body.touching.down) {
            player.setVelocityY(-750); 
        }
    });

    // TESTI
    scoreText = this.add.text(20, 40, '0 su 250 km', { 
        fontFamily: 'SouthPark', fontSize: '28px', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 5
    });

    fioriText = this.add.text(20, 80, 'Fiori: 0/3', { 
        fontFamily: 'SouthPark', fontSize: '28px', fill: '#FF69B4', stroke: '#000000', strokeThickness: 5
    });

    gameOverText = this.add.text(195, 250, 'GAME OVER', { 
        fontFamily: 'SouthPark', fontSize: '60px', fill: '#FF0000', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5).setVisible(false);

    vittoriaText = this.add.text(195, 250, 'SEI ARRIVATO\nA MILANO!', { 
        fontFamily: 'SouthPark', fontSize: '36px', fill: '#FFD700', stroke: '#000000', strokeThickness: 8, align: 'center'
    }).setOrigin(0.5).setVisible(false);

    restartText = this.add.text(195, 340, 'Premi in qualsiasi punto\nper ricominciare', { 
        fontFamily: 'SouthPark', fontSize: '22px', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 4, align: 'center'
    }).setOrigin(0.5).setVisible(false);

    spawnObstacle.call(this);
    spawnFiore.call(this);
}

function update() {
    if (isGameOver) return;

    if (!vittoriaRaggiunta) {
        player.setX(80);
        score += 0.05; 
        scoreText.setText(Math.floor(score) + ' su 250 km');

        if (score >= 250) {
            innescaVittoria.call(this);
        }
    }

    obstacles.children.iterate(function (o) { if (o && o.x < -200) o.destroy(); });
    monete.children.iterate(function (m) { if (m && m.x > 450) m.destroy(); });
    mazziGroup.children.iterate(function (f) { if (f && f.x < -100) f.destroy(); });
}

function spawnObstacle() {
    if (isGameOver || vittoriaRaggiunta) return;

    let probabilita = Phaser.Math.Between(1, 100);
    let tipoOstacolo = (score > 30 && probabilita <= 25) ? 'barbone' : (probabilita <= 45 ? 'flixbus' : 'vagone');

    let obs = obstacles.create(500, 500, tipoOstacolo);
    obs.body.allowGravity = false;
    obs.setImmovable(true);

    if (tipoOstacolo === 'vagone') {
        obs.setScale(Phaser.Math.Between(1, 3), 1);
        obs.body.updateFromGameObject(); 
        obs.y = 525; 
    } else if (tipoOstacolo === 'flixbus') {
        obs.y = 520; 
    } else {
        obs.y = 525; 
        obs.isBarbone = true; 
    }

    let baseSpeed = 250 + (score * 1.5);
    obs.setVelocityX(-Phaser.Math.Between(baseSpeed, baseSpeed + 80));

    this.time.addEvent({
        delay: Phaser.Math.Between(Math.max(1000, 2000 - (score * 5)), Math.max(1800, 3500 - (score * 5))),
        callback: spawnObstacle,
        callbackScope: this
    });
}

function spawnFiore() {
    if (isGameOver || vittoriaRaggiunta) return;

    if (fioriRaccolti < 3) {
        let altezzaRandom = Phaser.Math.Between(380, 525); 
        let fiore = mazziGroup.create(500, altezzaRandom, 'mazzo');
        fiore.body.allowGravity = false;
        let baseSpeed = 250 + (score * 1.5);
        fiore.setVelocityX(-baseSpeed);
    }

    this.time.addEvent({
        delay: Phaser.Math.Between(4000, 9000),
        callback: spawnFiore,
        callbackScope: this
    });
}

function raccogliFiore(playerHit, fioreHit) {
    fioreHit.destroy(); 
    if (fioriRaccolti < 3) {
        fioriRaccolti++;
        fioriText.setText('Fiori: ' + fioriRaccolti + '/3');
    }
}

function lanciaMoneta() {
    let moneta = monete.create(player.x + 20, player.y, 'moneta');
    moneta.body.allowGravity = false;
    moneta.setVelocityX(500); 
}

function daiEuro(moneta, ostacolo) {
    if (ostacolo.isBarbone) {
        ostacolo.destroy();
    }
    moneta.destroy();
}

function hitObstacle(playerHit, obstacleHit) {
    if (isGameOver || vittoriaRaggiunta) return;
    isGameOver = true;

    this.physics.pause(); 
    playerHit.setTint(0x000000); 
    
    gameOverText.setVisible(true);
    restartText.setVisible(true);
    
    this.time.delayedCall(500, function () {
        this.input.once('pointerdown', function () {
            this.scene.restart();
        }, this);
    }, [], this);
}

function innescaVittoria() {
    vittoriaRaggiunta = true;
    
    obstacles.clear(true, true);
    mazziGroup.clear(true, true);

    ragazza = this.physics.add.sprite(450, 525, 'ragazza');
    ragazza.body.allowGravity = false;
    ragazza.setVelocityX(-150);

    this.physics.add.overlap(player, ragazza, trionfoBaci, null, this);
}

function trionfoBaci(playerHit, ragazzaHit) {
    this.physics.pause();
    
    vittoriaText.setVisible(true);
    restartText.y = 420; 
    restartText.setVisible(true);

    let quantitaBaci = fioriRaccolti === 0 ? 2 : (fioriRaccolti * 15) + 5;

    this.add.particles(0, 0, 'cuore', {
        x: ragazzaHit.x - 10,
        y: ragazzaHit.y - 20,
        speed: { min: 150, max: 400 },
        angle: { min: 210, max: 330 }, 
        gravityY: 400,
        lifespan: 3000,
        quantity: quantitaBaci,
        frequency: -1, 
    }).explode();

    this.time.delayedCall(1000, function () {
        this.input.once('pointerdown', function () {
            this.scene.restart();
        }, this);
    }, [], this);
}