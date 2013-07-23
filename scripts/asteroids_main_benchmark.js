/**
 * Asteroids HTML5 Canvas Game
 * Scenes for CanvasMark Rendering Benchmark - March 2013 
 *
 * @email kevtoast at yahoo dot com
 * @twitter kevinroast
 *
 * (C) 2013 Kevin Roast
 * 
 * Please see: license.txt
 * You are welcome to use this code, but I would appreciate an email or tweet
 * if you do anything interesting with it!
 */


// Globals
var BITMAPS = true;
var GLOWEFFECT = false;
var g_asteroidImg1 = new Image();
var g_asteroidImg2 = new Image();
var g_asteroidImg3 = new Image();
var g_asteroidImg4 = new Image();
var g_shieldImg = new Image();
var g_backgroundImg = new Image();
var g_playerImg = new Image();
var g_enemyshipImg = new Image();


/**
 * Asteroids root namespace.
 * 
 * @namespace Asteroids
 */
if (typeof Asteroids == "undefined" || !Asteroids)
{
   var Asteroids = {};
}


/**
 * Asteroids benchmark test class.
 * 
 * @namespace Asteroids
 * @class Asteroids.Test
 */
(function()
{
   Asteroids.Test = function(benchmark, loader)
   {
      // get the image graphics loading
      loader.addImage(g_backgroundImg, './images/bg3_1.jpg');
      loader.addImage(g_playerImg, './images/player.png');
      loader.addImage(g_asteroidImg1, './images/asteroid1.png');
      loader.addImage(g_asteroidImg2, './images/asteroid2.png');
      loader.addImage(g_asteroidImg3, './images/asteroid3.png');
      loader.addImage(g_asteroidImg4, './images/asteroid4.png');
      loader.addImage(g_enemyshipImg, './images/enemyship1.png');
      
      // generate the single player actor - available across all scenes
      this.player = new Asteroids.Player(new Vector(GameHandler.width / 2, GameHandler.height / 2), new Vector(0.0, 0.0), 0.0);
      
      // add the Asteroid game benchmark scenes
      for (var level, i=0, t=benchmark.scenes.length; i<4; i++)
      {
         level = new Asteroids.BenchMarkScene(this, t+i, i+1);// NOTE: asteroids indexes feature from 1...
         benchmark.addBenchmarkScene(level);
      }
   };
   
   Asteroids.Test.prototype =
   {
      /**
       * Reference to the single game player actor
       */
      player: null,
      
      /**
       * Lives count (only used to render overlay graphics during benchmark mode)
       */
      lives: 3
   };
})();


/**
 * Asteroids Benchmark scene class.
 * 
 * @namespace Asteroids
 * @class Asteroids.BenchMarkScene
 */
(function()
{
   Asteroids.BenchMarkScene = function(game, test, feature)
   {
      this.game = game;
      this.test = test;
      this.feature = feature;
      this.player = game.player;
      
      var msg = "Test " + test + " - Asteroids - ";
      switch (feature)
      {
         case 1: msg += "Bitmaps"; break;
         case 2: msg += "Vectors"; break;
         case 3: msg += "Bitmaps, shapes, text"; break;
         case 4: msg += "Shapes, shadows, blending"; break;
      }
      var interval = new Game.Interval(msg, this.intervalRenderer);
      Asteroids.BenchMarkScene.superclass.constructor.call(this, true, interval);
      
      // generate background starfield
      for (var star, i=0; i<this.STARFIELD_SIZE; i++)
      {
         star = new Asteroids.Star();
         star.init();
         this.starfield.push(star);
      }
   };
   
   extend(Asteroids.BenchMarkScene, Game.Scene,
   {
      STARFIELD_SIZE: 32,
      
      game: null,
      
      test: 0,
      
      /**
       * Local reference to the game player actor
       */
      player: null,
      
      /**
       * Top-level list of game actors sub-lists
       */
      actors: null,
      
      /**
       * List of player fired bullet actors
       */
      playerBullets: null,
      
      /**
       * List of enemy actors (asteroids, ships etc.)
       */
      enemies: null,
      
      /**
       * List of enemy fired bullet actors
       */
      enemyBullets: null,
      
      /**
       * List of effect actors
       */
      effects: null,
      
      /**
       * Background scrolling bitmap x position
       */
      backgroundX: 0,
      
      /**
       * Background starfield star list
       */
      starfield: [],
      
      /**
       * Update each individual star in the starfield background
       */
      updateStarfield: function updateStarfield(ctx)
      {
         for (var s, i=0, j=this.starfield.length; i<j; i++)
         {
            s = this.starfield[i];
            s.render(ctx);
            s.z -= s.VELOCITY * 0.1;
            if (s.z < 0.1 || s.prevx > GameHandler.height || s.prevy > GameHandler.width)
            {
               s.init();
            }
         }
      },
      
      /**
       * Scene init event handler
       */
      onInitScene: function onInitScene()
      {
         // generate the actors and add the actor sub-lists to the main actor list
         this.actors = [];
         this.enemies = [];
         this.actors.push(this.enemies);
         this.actors.push(this.playerBullets = []);
         this.actors.push(this.enemyBullets = []);
         this.actors.push(this.effects = []);
         
         this.actors.push([this.player]);
         
         // reset the player position
         with (this.player)
         {
            position.x = GameHandler.width / 2;
            position.y = GameHandler.height / 2;
            vector.x = 0.0;
            vector.y = 0.0;
            heading = 0.0;
         }
         
         // tests 1-2 display asteroids in various modes
         switch (this.feature)
         {
            case 1:
            {
               // start with 10 asteroids - more will be added if framerate is acceptable
               for (var i=0; i<10; i++)
               {
                  this.enemies.push(this.generateAsteroid(Math.random()+1.0, ~~(Math.random()*4) + 1));
               }
               this.testScore = 10;
               break;
            }
            case 2:
            {
               // start with 10 asteroids - more will be added if framerate is acceptable
               for (var i=0; i<10; i++)
               {
                  this.enemies.push(this.generateAsteroid(Math.random()+1.0, ~~(Math.random()*4) + 1));
               }
               this.testScore = 20;
               break;
            }
            case 3:
            {
               // test 3 generates lots of enemy ships that fire
               for (var i=0; i<10; i++)
               {
                  this.enemies.push(new Asteroids.EnemyShip(this, i%2));
               }
               this.testScore = 10;
               break;
            }
            case 4:
            {
               this.testScore = 25;
               break;
            }
         }
         
         // tests 2 in wireframe, all others are bitmaps
         BITMAPS = !(this.feature === 2);
         
         // reset interval flag
         this.interval.reset();
      },
      
      /**
       * Scene before rendering event handler
       */
      onBeforeRenderScene: function onBeforeRenderScene(benchmark)
      {
         // add items to the test
         if (benchmark)
         {
            switch (this.feature)
            {
               case 1:
               case 2:
               {
                  var count;
                  switch (this.feature)
                  {
                     case 1:
                        count = 10;
                        break;
                     case 2:
                        count = 5;
                        break;
                  }
                  for (var i=0; i<count; i++)
                  {
                     this.enemies.push(this.generateAsteroid(Math.random()+1.0, ~~(Math.random()*4) + 1));
                  }
                  break;
               }
               case 3:
               {
                  if (Date.now() - this.sceneStartTime > this.testState)
                  {
                     this.testState += 20;
                     for (var i=0; i<2; i++)
                     {
                        this.enemies.push(new Asteroids.EnemyShip(this, i%2));
                     }
                     this.enemies[0].hit();
                     this.destroyEnemy(this.enemies[0], new Vector(0, 1));
                  }
                  break;
               }
               case 4:
               {
                  if (Date.now() - this.sceneStartTime > this.testState)
                  {
                     this.testState += 25;
                     
                     // spray forward guns
                     for (var i=0; i<=~~(this.testState/500); i++)
                     {
                        h = this.player.heading - 15;
                        t = new Vector(0.0, -7.0).rotate(h * RAD).add(this.player.vector);
                        this.playerBullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
                        h = this.player.heading;
                        t = new Vector(0.0, -7.0).rotate(h * RAD).add(this.player.vector);
                        this.playerBullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
                        h = this.player.heading + 15;
                        t = new Vector(0.0, -7.0).rotate(h * RAD).add(this.player.vector);
                        this.playerBullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
                     }
                     
                     // side firing guns also
                     h = this.player.heading - 90;
                     t = new Vector(0.0, -8.0).rotate(h * RAD).add(this.player.vector);
                     this.playerBullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h, 25));
                     
                     h = this.player.heading + 90;
                     t = new Vector(0.0, -8.0).rotate(h * RAD).add(this.player.vector);
                     this.playerBullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h, 25));
                     
                     // update player heading to rotate
                     this.player.heading += 8;
                  }
                  break;
               }
            }
         }
         
         // update all actors using their current vector
         this.updateActors();
      },
      
      /**
       * Scene rendering event handler
       */
      onRenderScene: function onRenderScene(ctx)
      {
         // setup canvas for a render pass and apply background
         if (BITMAPS)
         {
            // draw a scrolling background image
            ctx.drawImage(g_backgroundImg, this.backgroundX++, 0, GameHandler.width, GameHandler.height, 0, 0, GameHandler.width, GameHandler.height);
            if (this.backgroundX == (g_backgroundImg.width / 2))
            {
               this.backgroundX = 0;
            }
            ctx.shadowBlur = 0;
         }
         else
         {
            // clear the background to black
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, GameHandler.width, GameHandler.height);
            
            // glowing vector effect shadow
            ctx.shadowBlur = GLOWEFFECT ? 8 : 0;
            
            // update and render background starfield effect
            this.updateStarfield(ctx);
         }
         
         // render the game actors
         this.renderActors(ctx);
         
         // render info overlay graphics
         this.renderOverlay(ctx);
      },
      
      /**
       * Randomly generate a new large asteroid. Ensures the asteroid is not generated
       * too close to the player position!
       * 
       * @param speedFactor {number} Speed multiplier factor to apply to asteroid vector
       */
      generateAsteroid: function generateAsteroid(speedFactor, size)
      {
         while (true)
         {
            // perform a test to check it is not too close to the player
            var apos = new Vector(Math.random()*GameHandler.width, Math.random()*GameHandler.height);
            if (this.player.position.distance(apos) > 125)
            {
               var vec = new Vector( ((Math.random()*2)-1)*speedFactor, ((Math.random()*2)-1)*speedFactor );
               var asteroid = new Asteroids.Asteroid(
                  apos, vec, size ? size : 4);
               return asteroid;
            }
         }
      },
      
      /**
       * Update the actors position based on current vectors and expiration.
       */
      updateActors: function updateActors()
      {
         for (var i = 0, j = this.actors.length; i < j; i++)
         {
            var actorList = this.actors[i];
            
            for (var n = 0; n < actorList.length; n++)
            {
               var actor = actorList[n];
               
               // call onUpdate() event for each actor
               actor.onUpdate(this);
               
               // expiration test first
               if (actor.expired())
               {
                  actorList.splice(n, 1);
               }
               else
               {
                  // update actor using its current vector
                  actor.position.add(actor.vector);
                  
                  // handle traversing out of the coordinate space and back again
                  if (actor.position.x >= GameHandler.width)
                  {
                     actor.position.x = 0;
                  }
                  else if (actor.position.x < 0)
                  {
                     actor.position.x = GameHandler.width - 1;
                  }
                  if (actor.position.y >= GameHandler.height)
                  {
                     actor.position.y = 0;
                  }
                  else if (actor.position.y < 0)
                  {
                     actor.position.y = GameHandler.height - 1;
                  }
               }
            }
         }
      },
      
      /**
       * Blow up an enemy.
       * 
       * An asteroid may generate new baby asteroids and leave an explosion
       * in the wake.
       * 
       * Also applies the score for the destroyed item.
       * 
       * @param enemy {Game.Actor} The enemy to destory and add score for
       * @param parentVector {Vector} The vector of the item that hit the enemy
       * @param player {boolean} If true, the player was the destroyed
       */
      destroyEnemy: function destroyEnemy(enemy, parentVector)
      {
         if (enemy instanceof Asteroids.Asteroid)
         {
            // generate baby asteroids
            this.generateBabyAsteroids(enemy, parentVector);
            
            // add an explosion actor at the asteriod position and vector
            var boom = new Asteroids.Explosion(enemy.position.clone(), enemy.vector.clone(), enemy.size);
            this.effects.push(boom);
            
            // generate a score effect indicator at the destroyed enemy position
            var vec = new Vector(0, -(Math.random()*2 + 0.5));
            var effect = new Asteroids.ScoreIndicator(
                  new Vector(enemy.position.x, enemy.position.y), vec, Math.floor(100 + (Math.random()*100)));
            this.effects.push(effect);
         }
         else if (enemy instanceof Asteroids.EnemyShip)
         {
            // add an explosion actor at the asteriod position and vector
            var boom = new Asteroids.Explosion(enemy.position.clone(), enemy.vector.clone(), 4);
            this.effects.push(boom);
            
            // generate a score text effect indicator at the destroyed enemy position
            var vec = new Vector(0, -(Math.random()*2 + 0.5));
            var effect = new Asteroids.ScoreIndicator(
                  new Vector(enemy.position.x, enemy.position.y), vec, Math.floor(100 + (Math.random()*100)));
            this.effects.push(effect);
         }
      },
      
      /**
       * Generate a number of baby asteroids from a detonated parent asteroid. The number
       * and size of the generated asteroids are based on the parent size. Some of the
       * momentum of the parent vector (e.g. impacting bullet) is applied to the new asteroids.
       *
       * @param asteroid {Asteroids.Asteroid} The parent asteroid that has been destroyed
       * @param parentVector {Vector} Vector of the impacting object e.g. a bullet
       */
      generateBabyAsteroids: function generateBabyAsteroids(asteroid, parentVector)
      {
         // generate some baby asteroid(s) if bigger than the minimum size
         if (asteroid.size > 1)
         {
            for (var x=0, xc=Math.floor(asteroid.size/2); x<xc; x++)
            {
               var babySize = asteroid.size - 1;
               
               var vec = asteroid.vector.clone();
               
               // apply a small random vector in the direction of travel
               var t = new Vector(0.0, -(Math.random() * 3));
               
               // rotate vector by asteroid current heading - slightly randomized
               t.rotate(asteroid.vector.theta() * (Math.random()*Math.PI));
               vec.add(t);
               
               // add the scaled parent vector - to give some momentum from the impact
               vec.add(parentVector.clone().scale(0.2));
               
               // create the asteroid - slightly offset from the centre of the old one
               var baby = new Asteroids.Asteroid(
                     new Vector(asteroid.position.x + (Math.random()*5)-2.5, asteroid.position.y + (Math.random()*5)-2.5),
                     vec, babySize, asteroid.type);
               this.enemies.push(baby);
            }
         }
      },
      
      /**
       * Render each actor to the canvas.
       * 
       * @param ctx {object} Canvas rendering context
       */
      renderActors: function renderActors(ctx)
      {
         for (var i = 0, j = this.actors.length; i < j; i++)
         {
            // walk each sub-list and call render on each object
            var actorList = this.actors[i];
            
            for (var n = actorList.length - 1; n >= 0; n--)
            {
               actorList[n].onRender(ctx);
            }
         }
      },
      
      /**
       * Render player information HUD overlay graphics.
       * 
       * @param ctx {object} Canvas rendering context
       */
      renderOverlay: function renderOverlay(ctx)
      {
         ctx.save();
         
         // energy bar (100 pixels across, scaled down from player energy max)
         ctx.strokeStyle = "rgb(50,50,255)";
         ctx.strokeRect(4, 4, 101, 6);
         ctx.fillStyle = "rgb(100,100,255)";
         var energy = this.player.energy;
         if (energy > this.player.ENERGY_INIT)
         {
            // the shield is on for "free" briefly when he player respawns
            energy = this.player.ENERGY_INIT;
         }
         ctx.fillRect(5, 5, (energy / (this.player.ENERGY_INIT / 100)), 5);
         
         // lives indicator graphics
         for (var i=0; i<this.game.lives; i++)
         {
            if (BITMAPS)
            {
               ctx.drawImage(g_playerImg, 0, 0, 64, 64, 350+(i*20), 0, 16, 16);
            }
            else
            {
               ctx.save();
               ctx.shadowColor = ctx.strokeStyle = "rgb(255,255,255)";
               ctx.translate(360+(i*16), 8);
               ctx.beginPath();
               ctx.moveTo(-4, 6);
               ctx.lineTo(4, 6);
               ctx.lineTo(0, -6);
               ctx.closePath();
               ctx.stroke();
               ctx.restore();
            }
         }
         
         // score display
         Game.fillText(ctx, "00000000", "12pt Courier New", 120, 12, "white");
         
         // high score
         Game.fillText(ctx, "HI: 00000000", "12pt Courier New", 220, 12, "white");
         
         // Benchmark - information output
         if (this.sceneCompletedTime)
         {
            Game.fillText(ctx, "TEST " + this.feature + " COMPLETED: " + this.getTransientTestScore(), "20pt Courier New", 4, 40, "white");
         }
         Game.fillText(ctx, "SCORE: " + this.getTransientTestScore(), "12pt Courier New", 0, GameHandler.height - 42, "lightblue");
         Game.fillText(ctx, "TSF: " + Math.round(GameHandler.frametime) + "ms", "12pt Courier New", 0, GameHandler.height - 22, "lightblue");
         Game.fillText(ctx, "FPS: " + GameHandler.lastfps, "12pt Courier New", 0, GameHandler.height - 2, "lightblue");
         
         ctx.restore();
      }
   });
})();


/**
 * Starfield star class.
 * 
 * @namespace Asteroids
 * @class Asteroids.Star
 */
(function()
{
   Asteroids.Star = function()
   {
      return this;
   };
   
   Asteroids.Star.prototype =
   {
      MAXZ: 12.0,
      VELOCITY: 1.5,
      MAXSIZE: 5,
      
      x: 0,
      y: 0,
      z: 0,
      prevx: 0,
      prevy: 0,
      
      init: function init()
      {
         // select a random point for the initial location
         this.x = (Math.random() * GameHandler.width - (GameHandler.width * 0.5)) * this.MAXZ;
         this.y = (Math.random() * GameHandler.height - (GameHandler.height * 0.5)) * this.MAXZ;
         this.z = this.MAXZ;
      },
      
      render: function render(ctx)
      {
         var xx = this.x / this.z;
         var yy = this.y / this.z;
         
         var size = 1.0 / this.z * this.MAXSIZE + 1;
         
         ctx.save();
         ctx.fillStyle = "rgb(200,200,200)";
         ctx.beginPath();
         ctx.arc(xx + (GameHandler.width / 2), yy +(GameHandler.height / 2), size/2, 0, TWOPI, true);
         ctx.closePath();
         ctx.fill();
         ctx.restore();
         
         this.prevx = xx;
         this.prevy = yy;
      }
   };
})();
