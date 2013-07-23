/**
 * Asteroid actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.Asteroid
 */
(function()
{
   Asteroids.Asteroid = function(p, v, s, t)
   {
      Asteroids.Asteroid.superclass.constructor.call(this, p, v);
      this.size = s;
      this.health = s;
      
      // randomly select an asteroid image bitmap
      if (t === undefined)
      {
         t = randomInt(1, 4);
      }
      eval("this.animImage=g_asteroidImg" + t);
      this.type = t;
      
      // randomly setup animation speed and direction
      this.animForward = (Math.random() < 0.5);
      this.animSpeed = 0.25 + Math.random();
      this.animLength = this.ANIMATION_LENGTH;
      this.rotation = randomInt(0, 180);
      this.rotationSpeed = randomInt(-1, 1) / 25;
      
      return this;
   };
   
   extend(Asteroids.Asteroid, Game.SpriteActor,
   {
      ANIMATION_LENGTH: 180,
      
      /**
       * Asteroid size - values from 1-4 are valid.
       */
      size: 0,
      
      /**
       * Asteroid type i.e. which bitmap it is drawn from
       */
      type: 1,
      
      /**
       * Asteroid health before it's destroyed
       */
      health: 0,
      
      /**
       * Retro graphics mode rotation orientation and speed
       */
      rotation: 0,
      rotationSpeed: 0,
      
      /**
       * Asteroid rendering method
       */
      onRender: function onRender(ctx)
      {
         var rad = this.size * 8;
         ctx.save();
         if (BITMAPS)
         {
            // render asteroid graphic bitmap
            // bitmap is rendered slightly large than the radius as the raytraced asteroid graphics do not
            // quite touch the edges of the 64x64 sprite - this improves perceived collision detection
            this.renderSprite(ctx, this.position.x - rad - 2, this.position.y - rad - 2, (rad * 2)+4, true);
         }
         else
         {
            // draw asteroid outline circle
            ctx.shadowColor = ctx.strokeStyle = "white";
            ctx.translate(this.position.x, this.position.y);
            ctx.scale(this.size * 0.8, this.size * 0.8);
            ctx.rotate(this.rotation += this.rotationSpeed);
            ctx.lineWidth = (0.8 / this.size) * 2;
            ctx.beginPath();
            // asteroid wires
            switch (this.type)
            {
               case 1:
                  ctx.moveTo(0,10);
                  ctx.lineTo(8,6);
                  ctx.lineTo(10,-4);
                  ctx.lineTo(4,-2);
                  ctx.lineTo(6,-6);
                  ctx.lineTo(0,-10);
                  ctx.lineTo(-10,-3);
                  ctx.lineTo(-10,5);
                  break;
               case 2:
                  ctx.moveTo(0,10);
                  ctx.lineTo(8,6);
                  ctx.lineTo(10,-4);
                  ctx.lineTo(4,-2);
                  ctx.lineTo(6,-6);
                  ctx.lineTo(0,-10);
                  ctx.lineTo(-8,-8);
                  ctx.lineTo(-6,-3);
                  ctx.lineTo(-8,-4);
                  ctx.lineTo(-10,5);
                  break;
               case 3:
                  ctx.moveTo(-4,10);
                  ctx.lineTo(1,8);
                  ctx.lineTo(7,10);
                  ctx.lineTo(10,-4);
                  ctx.lineTo(4,-2);
                  ctx.lineTo(6,-6);
                  ctx.lineTo(0,-10);
                  ctx.lineTo(-10,-3);
                  ctx.lineTo(-10,5);
                  break;
               case 4:
                  ctx.moveTo(-8,10);
                  ctx.lineTo(7,8);
                  ctx.lineTo(10,-2);
                  ctx.lineTo(6,-10);
                  ctx.lineTo(-2,-8);
                  ctx.lineTo(-6,-10);
                  ctx.lineTo(-10,-6);
                  ctx.lineTo(-7,0);
                  break;
            }
            ctx.closePath();
            ctx.stroke();
         }
         ctx.restore();
      },
      
      radius: function radius()
      {
         return this.size * 8;
      },
      
      /**
       * Asteroid hit by player bullet
       * 
       * @param force of the impacting bullet, -1 for instant kill
       * @return true if destroyed, false otherwise
       */
      hit: function hit(force)
      {
         if (force !== -1)
         {
            this.health -= force;
         }
         else
         {
            // instant kill
            this.health = 0;
         }
         return !(this.alive = (this.health > 0));
      }
   });
})();


/**
 * Enemy Ship actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.EnemyShip
 */
(function()
{
   Asteroids.EnemyShip = function(scene, size)
   {
      this.size = size;
      
      // small ship, alter settings slightly
      if (this.size === 1)
      {
         this.BULLET_RECHARGE = 45;
         this.RADIUS = 8;
      }
      
      // randomly setup enemy initial position and vector
      // ensure the enemy starts in the opposite quadrant to the player
      var p, v;
      if (scene.player.position.x < GameHandler.width / 2)
      {
         // player on left of the screen
         if (scene.player.position.y < GameHandler.height / 2)
         {
            // player in top left of the screen
            p = new Vector(GameHandler.width-48, GameHandler.height-48);
         }
         else
         {
            // player in bottom left of the screen
            p = new Vector(GameHandler.width-48, 48);
         }
         v = new Vector(-(Math.random() + 1 + size), Math.random() + 0.5 + size);
      }
      else
      {
         // player on right of the screen
         if (scene.player.position.y < GameHandler.height / 2)
         {
            // player in top right of the screen
            p = new Vector(0, GameHandler.height-48);
         }
         else
         {
            // player in bottom right of the screen
            p = new Vector(0, 48);
         }
         v = new Vector(Math.random() + 1 + size, Math.random() + 0.5 + size);
      }
      
      // setup SpriteActor values
      this.animImage = g_enemyshipImg;
      this.animLength = this.SHIP_ANIM_LENGTH;
      
      Asteroids.EnemyShip.superclass.constructor.call(this, p, v);
      
      return this;
   };
   
   extend(Asteroids.EnemyShip, Game.SpriteActor,
   {
      SHIP_ANIM_LENGTH: 90,
      RADIUS: 16,
      BULLET_RECHARGE: 60,
      
      /**
       * Enemy ship size - 0 = large (slow), 1 = small (fast)
       */
      size: 0,
      
      /**
       * Bullet fire recharging counter
       */
      bulletRecharge: 0,
      
      onUpdate: function onUpdate(scene)
      {
         // change enemy direction randomly
         if (this.size === 0)
         {
            if (Math.random() < 0.01)
            {
               this.vector.y = -(this.vector.y + (0.25 - (Math.random()/2)));
            }
         }
         else
         {
            if (Math.random() < 0.02)
            {
               this.vector.y = -(this.vector.y + (0.5 - Math.random()));
            }
         }
         
         // regular fire a bullet at the player
         if (GameHandler.frameCount - this.bulletRecharge > this.BULLET_RECHARGE && scene.player.alive)
         {
            // ok, update last fired frame and we can now generate a bullet
            this.bulletRecharge = GameHandler.frameCount;
            
            // generate a vector pointed at the player
            // by calculating a vector between the player and enemy positions
            var v = scene.player.position.clone().sub(this.position);
            // scale resulting vector down to bullet vector size
            var scale = (this.size === 0 ? 5.0 : 6.0) / v.length();
            v.x *= scale;
            v.y *= scale;
            // slightly randomize the direction (big ship is less accurate also)
            v.x += (this.size === 0 ? (Math.random() * 2 - 1) : (Math.random() - 0.5));
            v.y += (this.size === 0 ? (Math.random() * 2 - 1) : (Math.random() - 0.5));
            // - could add the enemy motion vector for correct momentum
            // - but problem is this leads to slow bullets firing back from dir of travel
            // - so pretend that enemies are clever enough to account for this...
            //v.add(this.vector);
            
            var bullet = new Asteroids.EnemyBullet(this.position.clone(), v);
            scene.enemyBullets.push(bullet);
         }
      },
      
      /**
       * Enemy rendering method
       */
      onRender: function onRender(ctx)
      {
         if (BITMAPS)
         {
            // render enemy graphic bitmap
            var rad = this.RADIUS + 2;
            this.renderSprite(ctx, this.position.x - rad, this.position.y - rad, rad * 2, true);
         }
         else
         {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            if (this.size === 0)
            {
               ctx.scale(2, 2);
            }
            
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(8, 3);
            ctx.lineTo(0, 8);
            ctx.lineTo(-8, 3);
            ctx.lineTo(0, -4);
            ctx.closePath();
            ctx.shadowColor = ctx.strokeStyle = "rgb(100,150,100)";
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(4, -4);
            ctx.lineTo(0, 0);
            ctx.lineTo(-4, -4);
            ctx.lineTo(0, -8);
            ctx.closePath();
            ctx.shadowColor = ctx.strokeStyle = "rgb(150,200,150)";
            ctx.stroke();
            
            ctx.restore();
         }
      },
      
      radius: function radius()
      {
         return this.RADIUS;
      }
   });
})();
