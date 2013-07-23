/**
 * Arena5 HTML canvas game.
 * Scenes for CanvasMark Rendering Benchmark - March 2013
 *  
 * (C) 2013 Kevin Roast kevtoast@yahoo.com @kevinroast
 * 
 * Please see: license.txt
 * You are welcome to use this code, but I would appreciate an email or tweet
 * if you do anything interesting with it!
 */


/**
 * Arena root namespace.
 * 
 * @namespace Arena
 */
if (typeof Arena == "undefined" || !Arena)
{
   var Arena = {};
}


/**
 * Arena prerenderer class.
 * 
 * @namespace Arena
 * @class Arena.Prerenderer
 */
(function()
{
   Arena.Prerenderer = function()
   {
      this.images = [];
      this._renderers = [];
      return this;
   };
   
   Arena.Prerenderer.prototype =
   {
      /**
       * Image list. Keyed by renderer ID - returning an array also. So to get
       * the first image output by prerenderer with id "default": images["default"][0]
       * 
       * @public
       * @property images
       * @type Array
       */
      images: null,
      
      _renderers: null,
      
      /**
       * Add a renderer function to the list of renderers to execute
       * 
       * @param fn {function}    Callback to execute to perform prerender
       *                         Passed canvas element argument - to execute against - the
       *                         callback is responsible for setting appropriate width/height
       *                         of the buffer and should not assume it is cleared.
       *                         Should return Array of images from prerender process
       * @param id {string}      Id of the prerender - used to lookup images later
       */
      addRenderer: function addRenderer(fn, id)
      {
         this._renderers[id] = fn;
      },
      
      /**
       * Execute all prerender functions - call once all renderers have been added
       */
      execute: function execute()
      {
         var buffer = document.createElement('canvas');
         for (var id in this._renderers)
         {
            this.images[id] = this._renderers[id].call(this, buffer);
         }
      }
    };
})();


/**
 * Arena main Benchmark Test class.
 * 
 * @namespace Arena
 * @class Arena.Test
 */
(function()
{
   Arena.Test = function(benchmark)
   {
      // generate the single player actor - available across all scenes
      this.player = new Arena.Player(new Vector(GameHandler.width / 2, GameHandler.height / 2), new Vector(0, 0), 0);
      
      // add benchmark scene
      benchmark.addBenchmarkScene(new Arena.BenchmarkScene(this, benchmark.scenes.length, 0));
      
      // perform prerender steps - create bitmap graphics to use later
      var pr = new Arena.Prerenderer();
      // function to generate a set of point particle images
      var fnPointRenderer = function(buffer, colour)
         {
            var imgs = [];
            for (var size=4; size<=10; size+=2)
            {
               var width = size << 1;
               buffer.width = buffer.height = width;
               var ctx = buffer.getContext('2d');
               var radgrad = ctx.createRadialGradient(size, size, size >> 1, size, size, size);  
               radgrad.addColorStop(0, colour);
               radgrad.addColorStop(1, "#000");
               ctx.fillStyle = radgrad;
               ctx.fillRect(0, 0, width, width);
               var img = new Image();
               img.src = buffer.toDataURL("image/png");
               imgs.push(img);
            }
            return imgs;
         };
      // add the various point particle image prerenderers based on above function
      // default explosion colour
      pr.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, "rgb(255,125,50)");
         }, "points_rgb(255,125,50)");
      // Tracker: enemy particles
      pr.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, "rgb(255,96,0)");
         }, "points_rgb(255,96,0)");
      // Borg: enemy particles
      pr.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, "rgb(0,255,64)");
         }, "points_rgb(0,255,64)");
      // Splitter: enemy particles
      pr.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, "rgb(148,0,255)");
         }, "points_rgb(148,0,255)");
      // Bomber: enemy particles
      pr.addRenderer(function(buffer) {
            return fnPointRenderer.call(this, buffer, "rgb(255,0,255)");
         }, "points_rgb(255,0,255)");
      // add the smudge explosion particle image prerenderer
      pr.addRenderer(function(buffer) {
            var imgs = [];
            for (var size=8; size<=64; size+=8)
            {
               var width = size << 1;
               buffer.width = buffer.height = width;
               var ctx = buffer.getContext('2d');
               var radgrad = ctx.createRadialGradient(size, size, size >> 3, size, size, size);  
               radgrad.addColorStop(0, "rgb(255,125,50)");
               radgrad.addColorStop(1, "#000");
               ctx.fillStyle = radgrad;
               ctx.fillRect(0, 0, width, width);
               var img = new Image();
               img.src = buffer.toDataURL("image/png");
               imgs.push(img);
            }
            return imgs;
         }, "smudges");
      pr.addRenderer(function(buffer) {
            var imgs = [];
            var size = 40;
            buffer.width = buffer.height = size;
            var ctx = buffer.getContext('2d');
            
            // draw bullet primary weapon
            var rf = function(width, height)
            {
               ctx.beginPath();
               ctx.moveTo(0, height);
               ctx.lineTo(width, 0);
               ctx.lineTo(width, -height);
               ctx.lineTo(0, -height*0.5);
               ctx.lineTo(-width, -height);
               ctx.lineTo(-width, 0);
               ctx.closePath();
               ctx.fill();
            };
            ctx.shadowBlur = 8;
            ctx.globalCompositeOperation = "lighter";
            ctx.translate(size/2, size/2);
            ctx.shadowColor = "rgb(255,255,255)";
            ctx.fillStyle = "rgb(255,220,75)";
            rf.call(this, 10, 15)
            ctx.shadowColor = "rgb(255,100,100)";
            ctx.fillStyle = "rgb(255,50,50)";
            rf.call(this, 10 * 0.75, 15 * 0.75);
            
            var img = new Image();
            img.src = buffer.toDataURL("image/png");
            imgs.push(img);
            return imgs;
         }, "playerweapon");
      pr.execute();
      GameHandler.prerenderer = pr;
   };
   
   Arena.Test.prototype =
   {
      /**
       * Reference to the single game player actor
       */
      player: null,
      
      /**
       * Lives count
       */
      lives: 1,
      
      /**
       * Current game score 
       */
      score: 0,
      
      /**
       * High score
       */
      highscore: 0,
      
      /**
       * Last score
       */
      lastscore: 0,
      
      /**
       * Current multipler
       */
      scoreMultiplier: 1
   };
})();


/**
 * Arena Game scene class.
 * 
 * @namespace Arena
 * @class Arena.BenchmarkScene
 */
(function()
{
   Arena.BenchmarkScene = function(game, test, feature)
   {
      this.game = game;
      this.test = test;
      this.feature = feature;
      this.player = game.player;
      
      var msg = "Test " + test + " - Arena5 - Vectors, shadows, bitmaps, text";
      var interval = new Game.Interval(msg, this.intervalRenderer);
      Arena.BenchmarkScene.superclass.constructor.call(this, true, interval);
   };
   
   extend(Arena.BenchmarkScene, Game.Scene,
   {
      test: 0,
      game: null,
      
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
       * List of collectables actors
       */
      collectables: null,
      
      /**
       * Displayed score (animates towards actual score)
       */
      scoredisplay: 0,
      
      /**
       * Scene init event handler
       */
      onInitScene: function onInitScene()
      {
         // generate the actors and add the actor sub-lists to the main actor list
         this.actors = [];
         this.actors.push(this.enemies = []);
         this.actors.push(this.playerBullets = []);
         this.actors.push(this.enemyBullets = []);
         this.actors.push(this.effects = []);
         this.actors.push(this.collectables = []);
         
         // start view centered in the game world
         this.world.viewx = this.world.viewy = (this.world.size / 2) - (this.world.viewsize / 2);
         
         this.testScore = 10;
         
         // reset player
         this.resetPlayerActor();
      },
      
      /**
       * Restore the player to the game - reseting position etc.
       */
      resetPlayerActor: function resetPlayerActor(persistPowerUps)
      {
         this.actors.push([this.player]);
         
         // reset the player position - centre of world
         with (this.player)
         {
            position.x = position.y = this.world.size / 2;
            vector.x = vector.y = heading = 0;
            reset(persistPowerUps);
         }
      },
      
      /**
       * Scene before rendering event handler
       */
      onBeforeRenderScene: function onBeforeRenderScene(benchmark)
      {
         var p = this.player,
             w = this.world;
         
         // update view position based on new player position
         var viewedge = w.viewsize * 0.2;
         if (p.position.x > viewedge && p.position.x < w.size - viewedge)
         {
            w.viewx = p.position.x - w.viewsize * 0.5;
         }
         if (p.position.y > viewedge && p.position.y < w.size - viewedge)
         {
            w.viewy = p.position.y - w.viewsize * 0.5;
         }
         
         if (benchmark)
         {
            if (Date.now() - this.sceneStartTime > this.testState)
            {
               this.testState += 500;
               for (var i=0; i<2; i++)
               {
                  this.enemies.push(new Arena.EnemyShip(this, (this.enemies.length % 6) + 1));
               }
               this.enemies[0].damageBy(100);
               this.destroyEnemy(this.enemies[0], new Vector(0,1), this.player)
            }
         }
         
         // update all actors using their current vector in the game world
         this.updateActors();
      },
      
      /**
       * Scene rendering event handler
       */
      onRenderScene: function onRenderScene(ctx)
      {
         ctx.clearRect(0, 0, GameHandler.width, GameHandler.height);
         
         // glowing vector effect shadow
         ctx.shadowBlur = (DEBUG && DEBUG.DISABLEGLOWEFFECT) ? 0 : 8;
         
         // render background effect - wire grid
         this.renderBackground(ctx);
         
         // render the game actors
         this.renderActors(ctx);
         
         // render info overlay graphics
         this.renderOverlay(ctx);
         
         // detect bullet collisions
         this.collisionDetectBullets();
      },
      
      /**
       * Render background effects for the scene
       */
      renderBackground: function renderBackground(ctx)
      {
         // render background effect - wire grid
         // manually transform world to screen for this effect and therefore
         // assume there is a horizonal and vertical "wire" every N units
         ctx.save();
         ctx.strokeStyle = "rgb(0,30,60)";
         ctx.lineWidth = 1.0;
         ctx.shadowBlur = 0;
         ctx.beginPath();
         
         var UNIT = 100;
         var w = this.world;
             xoff = UNIT - w.viewx % UNIT,
             yoff = UNIT - w.viewy % UNIT,
             // calc top left edge of world (prescaled)
             x1 = (w.viewx >= 0 ? 0 : -w.viewx) * w.scale,
             y1 = (w.viewy >= 0 ? 0 : -w.viewy) * w.scale,
             // calc bottom right edge of world (prescaled)
             x2 = (w.viewx < w.size - w.viewsize ? w.viewsize : w.size - w.viewx) * w.scale,
             y2 = (w.viewy < w.size - w.viewsize ? w.viewsize : w.size - w.viewy) * w.scale;
         
         // plot the grid wires that make up the background
         for (var i=0, j=w.viewsize/UNIT; i<j; i++)
         {
            // check we are in bounds of the visible world before drawing grid line segments
            if (xoff + w.viewx > 0 && xoff + w.viewx < w.size)
            {
               ctx.moveTo(xoff * w.scale, y1);
               ctx.lineTo(xoff * w.scale, y2);
            }
            if (yoff + w.viewy > 0 && yoff + w.viewy < w.size)
            {
               ctx.moveTo(x1, yoff * w.scale);
               ctx.lineTo(x2, yoff * w.scale);
            }
            xoff += UNIT;
            yoff += UNIT;
         }
         
         ctx.closePath();
         ctx.stroke();
         
         // render world edges
         ctx.strokeStyle = "rgb(60,128,90)";
         ctx.lineWidth = 1;
         ctx.beginPath();
         
         if (w.viewx <= 0)
         {
            xoff = -w.viewx;
            ctx.moveTo(xoff * w.scale, y1);
            ctx.lineTo(xoff * w.scale, y2);
         }
         else if (w.viewx >= w.size - w.viewsize)
         {
            xoff = w.size - w.viewx;
            ctx.moveTo(xoff * w.scale, y1);
            ctx.lineTo(xoff * w.scale, y2);
         }
         if (w.viewy <= 0)
         {
            yoff = -w.viewy;
            ctx.moveTo(x1, yoff * w.scale);
            ctx.lineTo(x2, yoff * w.scale);
         }
         else if (w.viewy >= w.size - w.viewsize)
         {
            yoff = w.size - w.viewy;
            ctx.moveTo(x1, yoff * w.scale);
            ctx.lineTo(x2, yoff * w.scale);
         }
         
         ctx.closePath();
         ctx.stroke();
         ctx.restore();
      },
      
      /**
       * Update the scene actors based on current vectors and expiration.
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
                  
                  // TODO: different behavior for traversing out of the world space?
                  //       add behavior flag to Actor i.e. bounce, invert, disipate etc.
                  //       - could add method to actor itself - so would handle internally...
                  if (actor === this.player)
                  {
                     if (actor.position.x >= this.world.size ||
                         actor.position.x < 0 ||
                         actor.position.y >= this.world.size ||
                         actor.position.y < 0)
                     {
                        actor.vector.invert();
                        actor.vector.scale(0.75);
                        actor.position.add(actor.vector);
                     }
                  }
                  else
                  {
                     var bounceX = false,
                         bounceY = false;
                     if (actor.position.x >= this.world.size)
                     {
                        actor.position.x = this.world.size;
                        bounceX = true;
                     }
                     else if (actor.position.x < 0)
                     {
                        actor.position.x = 0;
                        bounceX = true;
                     }
                     if (actor.position.y >= this.world.size)
                     {
                        actor.position.y = this.world.size;
                        bounceY = true;
                     }
                     else if (actor.position.y < 0)
                     {
                        actor.position.y = 0;
                        bounceY = true
                     }
                     // bullets don't bounce - create an effect at the arena boundry instead
                     if ((bounceX || bounceY) &&
                         ((actor instanceof Arena.Bullet && !this.player.bounceWeapons) ||
                          actor instanceof Arena.EnemyBullet))
                     {
                        // replace bullet with a particle effect at the same position and vector
                        var vec = actor.vector.nscale(0.5);
                        this.effects.push(new Arena.BulletImpactEffect(actor.position.clone(), vec));
                        // remove bullet actor from play
                        actorList.splice(n, 1);
                     }
                     else
                     {
                        if (bounceX)
                        {
                           var h = actor.vector.thetaTo2(new Vector(0, 1));
                           actor.vector.rotate(h*2);
                           actor.vector.scale(0.9);
                           actor.position.add(actor.vector);
                           // TODO: add "interface" for actor with heading?
                           //       or is hasProperty() more "javascript"
                           if (actor.hasOwnProperty("heading")) actor.heading += (h*2)/RAD;
                        }
                        if (bounceY)
                        {
                           var h = actor.vector.thetaTo2(new Vector(1, 0));
                           actor.vector.rotate(h*2);
                           actor.vector.scale(0.9);
                           actor.position.add(actor.vector);
                           if (actor.hasOwnProperty("heading")) actor.heading += (h*2)/RAD;
                        }
                     }
                  }
               }
            }
         }
      },
      
      /**
       * Detect bullet collisions with enemy actors.
       */
      collisionDetectBullets: function collisionDetectBullets()
      {
         var bullet, bulletRadius, bulletPos;
         
         // collision detect player bullets with enemies
         // NOTE: test length each loop as list length can change
         for (var i = 0; i < this.playerBullets.length; i++)
         {
            bullet = this.playerBullets[i];
            bulletRadius = bullet.radius;
            bulletPos = bullet.position;
            
            // test circle intersection with each enemy actor
            for (var n = 0, m = this.enemies.length, enemy, z; n < m; n++)
            {
               enemy = this.enemies[n];
               
               // test the distance against the two radius combined
               if (bulletPos.distance(enemy.position) <= bulletRadius + enemy.radius)
               {
                  // test for area effect bomb weapon
                  var effectRad = bullet.effectRadius();
                  //if (effectRad === 0)
                  {
                     // impact the enemy with the bullet - may destroy it or just damage it
                     if (enemy.damageBy(bullet.power()))
                     {
                        // destroy the enemy under the bullet
                        this.destroyEnemy(enemy, bullet.vector, true);
                        this.generateMultiplier(enemy);
                        this.generatePowerUp(enemy);
                     }
                     else
                     {
                        // add bullet impact effect to show the bullet hit
                        var effect = new Arena.EnemyImpact(
                           bullet.position.clone(),
                           bullet.vector.nscale(0.5 + Rnd() * 0.5), enemy);
                        this.effects.push(effect);
                     }
                  }
                  
                  // remove this bullet from the actor list as it has been destroyed
                  this.playerBullets.splice(i, 1);
                  break;
               }
            }
         }
      },
      
      /**
       * Destroy an enemy. Replace with appropriate effect.
       * Also applies the score for the destroyed item if the player caused it.
       * 
       * @param enemy {Game.EnemyActor} The enemy to destory and add score for
       * @param parentVector {Vector} The vector of the item that hit the enemy
       * @param player {boolean} If true, the player was the destroyer
       */
      destroyEnemy: function destroyEnemy(enemy, parentVector, player)
      {
         // add an explosion actor at the enemy position and vector
         var vec = enemy.vector.clone();
         // add scaled parent vector - to give some momentum from the impact
         vec.add(parentVector.nscale(0.2));
         this.effects.push(new Arena.EnemyExplosion(enemy.position.clone(), vec, enemy));
         
         if (player)
         {
            // increment score
            var inc = (enemy.scoretype + 1) * 5 * this.game.scoreMultiplier;
            this.game.score += inc;
            
            // generate a score effect indicator at the destroyed enemy position
            var vec = new Vector(0, -5.0).add(enemy.vector.nscale(0.5));
            this.effects.push(new Arena.ScoreIndicator(
                  new Vector(enemy.position.x, enemy.position.y - 16), vec, inc));
            
            // call event handler for enemy
            enemy.onDestroyed(this, player);
         }
      },
      
      /**
       * Generate score multiplier(s) for player to collect after enemy is destroyed
       */
      generateMultiplier: function generateMultiplier(enemy)
      {
         if (enemy.dropsMutliplier)
         {
            var count = randomInt(1, (enemy.type < 5 ? enemy.type : 4));
            for (var i=0; i<count; i++)
            {
               this.collectables.push(new Arena.Multiplier(enemy.position.clone(),
                  enemy.vector.nscale(0.2).rotate(Rnd() * TWOPI)));
            }
         }
      },
      
      /**
       * Generate powerup for player to collect after enemy is destroyed
       */
      generatePowerUp: function generatePowerUp(enemy)
      {
         if (this.player.energy !== this.player.ENERGY_INIT && Rnd() < 0.1)
         {
            this.collectables.push(new Arena.EnergyBoostPowerup(enemy.position.clone(),
               enemy.vector.nscale(0.5).rotate(Rnd() * TWOPI)));
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
               actorList[n].onRender(ctx, this.world);
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
         var w = this.world,
             width = GameHandler.width,
             height = GameHandler.height;
         
         ctx.save();
         ctx.shadowBlur = 0;
         
         // energy bar (scaled down from player energy max)
         var ewidth = ~~(100 * w.scale * 2),
             eheight = ~~(4 * w.scale * 2);
         ctx.strokeStyle = "rgb(128,128,50)";
         ctx.strokeRect(4, 4, ewidth+1, 4 + eheight);
         ctx.fillStyle = "rgb(255,255,150)";
         ctx.fillRect(5, 5, (this.player.energy / (this.player.ENERGY_INIT / ewidth)), 3 + eheight);
         
         // score display - update towards the score in increments to animate it
         var font12pt = Game.fontFamily(w, 12),
             font12size = Game.fontSize(w, 12);
         var score = this.game.score,
             inc = (score - this.scoredisplay) * 0.1;
         this.scoredisplay += inc;
         if (this.scoredisplay > score)
         {
            this.scoredisplay = score;
         }
         var sscore = Ceil(this.scoredisplay).toString();
         // pad with zeros
         for (var i=0, j=8-sscore.length; i<j; i++)
         {
            sscore = "0" + sscore;
         }
         Game.fillText(ctx, sscore, font12pt, width * 0.2 + width * 0.1, font12size + 2, "white");
         
         // high score
         // TODO: add method for incrementing score so this is not done here
         if (score > this.game.highscore)
         {
            this.game.highscore = score;
         }
         sscore = this.game.highscore.toString();
         // pad with zeros
         for (var i=0, j=8-sscore.length; i<j; i++)
         {
            sscore = "0" + sscore;
         }
         Game.fillText(ctx, "HI: " + sscore, font12pt, width * 0.4 + width * 0.1, font12size + 2, "white");
         
         // score multiplier indicator
         Game.fillText(ctx, "x" + this.game.scoreMultiplier, font12pt, width * 0.7 + width * 0.1, font12size + 2, "white");
         
         // Benchmark - information output
         if (this.sceneCompletedTime)
         {
            Game.fillText(ctx, "TEST " + this.test + " COMPLETED: " + this.getTransientTestScore(), "20pt Courier New", 4, 40, "white");
         }
         Game.fillText(ctx, "SCORE: " + this.getTransientTestScore(), "12pt Courier New", 0, GameHandler.height - 42, "lightblue");
         Game.fillText(ctx, "TSF: " + Math.round(GameHandler.frametime) + "ms", "12pt Courier New", 0, GameHandler.height - 22, "lightblue");
         Game.fillText(ctx, "FPS: " + GameHandler.lastfps, "12pt Courier New", 0, GameHandler.height - 2, "lightblue");
         
         ctx.restore();
      },
      
      screenCenterVector: function screenCenterVector()
      {
         // transform to world position - to get the center of the game screen
         var m = new Vector(GameHandler.width*0.5, GameHandler.height*0.5);
         m.scale(1 / this.world.scale);
         m.x += this.world.viewx;
         m.y += this.world.viewy;
         return m;
      }
   });
})();
