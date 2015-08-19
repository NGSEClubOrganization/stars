var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update});

//initializers

var cursors;

var pad1;
var pad2;

var winner = "";

var x = 1;

var playerA;
    var ta  = 0;
    var hpa = 100;
    var txta;
var playerB;
    var tb  = 0;
    var hpb = 100;
    var txtb;

var asteroids;
var asteroid;

var bullet;
var bullets;

var explosionEmitter;

// load images and resources
function preload() {

    game.load.image('space',    'assets/deep-space.jpg');
    game.load.image('bullet',   'assets/bullets.png');
    game.load.image('shipa',    'assets/shipa.png');
    game.load.image('shipb',    'assets/shipb.png');
    game.load.image('asteroid', 'assets/asteroid2.png')
    game.load.image('explosionParticle', 'assets/explosionParticle.png');

}

function create() {
    //control setup
    game.input.gamepad.start();
    
	this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

    pad1 = game.input.gamepad.pad1;
    pad2 = game.input.gamepad.pad2;

    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A spacey background
    game.add.tileSprite(0, 0, game.width, game.height, 'space');

    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 20 of them*
    bullets.createMultiple(20, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);

    //  playerA ship
    playerA = game.add.sprite(650, 300, 'shipa');
    playerA.anchor.set(0.5,0.5);
    playerA.rotation = Math.PI/2;

    //  playerB ship
    playerB = game.add.sprite(150, 300, 'shipb');
    playerB.anchor.set(0.5,0.5);
    playerB.rotation = 3*Math.PI/2;

    //  and their physics settings
    game.physics.enable(playerA, Phaser.Physics.ARCADE);

    playerA.body.drag.set(100);
    playerA.body.maxVelocity.set(200);

    game.physics.enable(playerB, Phaser.Physics.ARCADE);

    playerB.body.drag.set(100);
    playerB.body.maxVelocity.set(200);

    //asteroid
    asteroids = game.add.group();

    asteroids.create(game.world.centerX, game.height/4*1, 'asteroid');
    asteroids.create(game.world.centerX, game.height/4*2, 'asteroid');
    asteroids.create(game.world.centerX, game.height/4*3, 'asteroid');

    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;

    asteroids.setAll('anchor.x', 0.5);
    asteroids.setAll('anchor.y', 0.5);
    asteroids.setAll('scale', new Phaser.Point(1.5,1.5));

    //asteroid physics
    game.physics.enable(asteroids, Phaser.Physics.ARCADE);

    asteroids.setAll('body.drag', 10);
    asteroids.setAll('body.maxVelocity', 150);
    
    // emitters
    explosionEmitter = game.add.emitter();
    explosionEmitter.makeParticles('explosionParticle');
    explosionEmitter.gravity = 0;

    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

    //text set up
    txta = game.add.text(game.width-100,    50, "", { font: "30px Arial", fill: "#ff0044", align: "center" });
    txtb = game.add.text(100,               50, "", { font: "30px Arial", fill: "#ff0044", align: "center" });
	
	game.input.onDown.add(goFull, this);
}

function goFull() {
        console.log('gothere')
	    if (game.scale.isFullScreen) {
	        game.scale.stopFullScreen();
	    }
	    else {
	        game.scale.startFullScreen(false);
	    }
}

function particleBurst(x,y) {

    //  Position the emitter where the mouse/touch event was
    explosionEmitter.x = x
    explosionEmitter.y = y;

    //  The first parameter sets the effect to "explode" which means all particles are emitted at once
    //  The second gives each particle a 2000ms lifespan
    //  The third is ignored when using burst/explode mode
    //  The final parameter (10) is how many particles will be emitted in this single burst
    explosionEmitter.start(true, 200, null, 5);

}

function update() {

    if(winner===""){

    	txta.setText(hpa.toString());
        txtb.setText(hpb.toString());

		if(pad1 != null && pad2 != null) {

        //A
        
		console.log(pad1.axis(1));

        if (pad1.isDown(8))        
        {
            game.physics.arcade.accelerationFromRotation(playerA.rotation, 200, playerA.body.acceleration);
        }
        else
        {
            playerA.body.acceleration.set(0);
        }

        if (pad1.axis(0)<0)
        {
            playerA.body.angularVelocity = -300;
        }
        
        if (pad1.axis(0)>0)
        {
            playerA.body.angularVelocity = 300;
        }
        
        if(pad1.axis(0) == 0)
        {
            playerA.body.angularVelocity = 0;
        }

        if (pad1.isDown(11))
        {
            ta = fireBullet(playerA, ta);
        }

        screenWrap(playerA);
        game.physics.arcade.collide(playerA, bullets, playerHit, null, this);


        
        //B
        if (pad2.isDown(8))        
        {
            game.physics.arcade.accelerationFromRotation(playerB.rotation, 200, playerB.body.acceleration);
        }
        else
        {
            playerB.body.acceleration.set(0);
        }

        if (pad2.axis(0)<0)
        {
            playerB.body.angularVelocity = -300;
        }
        
        if (pad2.axis(0)>0)
        {
            playerB.body.angularVelocity = 300;
        }
        
        if(pad2.axis(0) == 0)
        {
            playerB.body.angularVelocity = 0;
        }

        if (pad2.isDown(11))
        {
            tb = fireBullet(playerB, tb);
        }

        screenWrap(playerB);
        game.physics.arcade.collide(playerB, bullets, playerHit, null, this);
        


        //bullet screenWrap
        bullets.forEachExists(screenWrap, this);

        //asteroid
        asteroids.forEachExists(screenWrap, this);
        game.physics.arcade.collide(playerA, asteroids, asterCollide, null, this);
        game.physics.arcade.collide(playerB, asteroids, asterCollide, null, this);
        game.physics.arcade.collide(bullets, asteroids, asteroidsAndBulletsCollider, null, this);
        game.physics.arcade.collide(asteroids, asteroids);


        //game over
        if(hpa<=0 || hpb<=0){
            gameover();
        }
        
        } else {
        	console.log("pads are null");
        	console.log("pad1 " + pad1 == null);
        	console.log("pad2: " + pad2 == null);
        }
    }

}

function asteroidsAndBulletsCollider(a,b) {
	particleBurst(a.x,a.y);
}

function asterCollide(player, asteroid) {
	particleBurst(player.x,player.y);
	if(player === playerA) {
		hpa--;
	} else {
		hpb--;
	}
}

function playerHit(player, bullet) {
	particleBurst(bullet.x,bullet.y);
	bullet.kill();
	if(player === playerA) {
		hpa--;
	} else {
		hpb--;
	}
}

function fireBullet (player, bulletTime) {
    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(player.body.x + 16 + Math.cos(-player.body.rotation/180*3.14) * 30, player.body.y + 16 + Math.sin(player.body.rotation/180*3.14) * 30);
            bullet.lifespan = 2000;
            bullet.rotation = player.rotation;
            game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
            return game.time.now + 200;
        }
    }
    return bulletTime;
}

function screenWrap (sprite) {

    if (sprite.x < 0)
    {
        sprite.x = game.width;
    }
    else if (sprite.x > game.width)
    {
        sprite.x = 0;
    }

    if (sprite.y < 0)
    {
        sprite.y = game.height;
    }
    else if (sprite.y > game.height)
    {
        sprite.y = 0;
    }

}

function gameover(){
    if(hpb <= 0){
        winner = "Red Wins";
    }

    if(hpa <= 0){
        winner = "Blue Wins";
    }

    if(hpa <= 0 && hpb <= 0){
        winner = "    Draws";
    }

    txta.setText("");
    txtb.setText("");

    playerA.destroy();
    playerB.destroy();
    bullets.destroy();
    asteroids.destroy();

    var text = game.add.text(game.world.centerX-125, game.world.centerY, winner, { font: "60px Arial", fill: "#ff0044", align: "center" });
}

function render() {

}



