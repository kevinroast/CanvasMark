/**
 * Basic explosion effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.Explosion
 */
(function()
{
   Asteroids.Explosion = function(p, v, s)
   {
      Asteroids.Explosion.superclass.constructor.call(this, p, v, this.FADE_LENGTH);
      this.size = s;
      return this;
   };
   
   extend(Asteroids.Explosion, Game.EffectActor,
   {
      FADE_LENGTH: 10,
      
      /**
       * Explosion size
       */
      size: 0,
      
      /**
       * Explosion rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         // fade out
         var brightness = Math.floor((255 / this.FADE_LENGTH) * this.lifespan);
         var rad = (this.size * 8 / this.FADE_LENGTH) * this.lifespan;
         var rgb = brightness.toString();
         ctx.save();
         ctx.globalAlpha = 0.75;
         ctx.fillStyle = "rgb(" + rgb + ",0,0)";
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, rad, 0, TWOPI, true);
         ctx.closePath();
         ctx.fill();
         ctx.restore();
      }
   });
})();


/**
 * Player Explosion effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.PlayerExplosion
 */
(function()
{
   Asteroids.PlayerExplosion = function(p, v)
   {
      Asteroids.PlayerExplosion.superclass.constructor.call(this, p, v, this.FADE_LENGTH);
      return this;
   };
   
   extend(Asteroids.PlayerExplosion, Game.EffectActor,
   {
      FADE_LENGTH: 15,
      
      /**
       * Explosion rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         ctx.save();
         var alpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
         ctx.globalCompositeOperation = "lighter";
         ctx.globalAlpha = alpha;
         
         var rad;
         if (this.lifespan > 5 && this.lifespan <= 15)
         {
            var offset = this.lifespan - 5;
            rad = (48 / this.FADE_LENGTH) * offset;
            ctx.fillStyle = "rgb(255,170,30)";
            ctx.beginPath();
            ctx.arc(this.position.x-2, this.position.y-2, rad, 0, TWOPI, true);
            ctx.closePath();
            ctx.fill();
         }
         
         if (this.lifespan > 2 && this.lifespan <= 12)
         {
            var offset = this.lifespan - 2;
            rad = (32 / this.FADE_LENGTH) * offset;
            ctx.fillStyle = "rgb(255,255,50)";
            ctx.beginPath();
            ctx.arc(this.position.x+2, this.position.y+2, rad, 0, TWOPI, true);
            ctx.closePath();
            ctx.fill();
         }
         
         if (this.lifespan <= 10)
         {
            var offset = this.lifespan;
            rad = (24 / this.FADE_LENGTH) * offset;
            ctx.fillStyle = "rgb(255,70,100)";
            ctx.beginPath();
            ctx.arc(this.position.x+2, this.position.y-2, rad, 0, TWOPI, true);
            ctx.closePath();
            ctx.fill();
         }
         
         ctx.restore();
      }
   });
})();


/**
 * Impact effect (from bullet hitting an object) actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.Impact
 */
(function()
{
   Asteroids.Impact = function(p, v)
   {
      Asteroids.Impact.superclass.constructor.call(this, p, v, this.FADE_LENGTH);
      return this;
   };
   
   extend(Asteroids.Impact, Game.EffectActor,
   {
      FADE_LENGTH: 12,
      
      /**
       * Impact effect rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         // fade out alpha
         var alpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
         ctx.save();
         ctx.globalAlpha = alpha * 0.75;
         if (BITMAPS)
         {
            ctx.fillStyle = "rgb(50,255,50)";
         }
         else
         {
            ctx.shadowColor = ctx.strokeStyle = "rgb(50,255,50)";
         }
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, 2, 0, TWOPI, true);
         ctx.closePath();
         if (BITMAPS) ctx.fill(); else ctx.stroke();
         ctx.globalAlpha = alpha;
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, 1, 0, TWOPI, true);
         ctx.closePath();
         if (BITMAPS) ctx.fill(); else ctx.stroke();
         ctx.restore();
      }
   });
})();


/**
 * Text indicator effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.TextIndicator
 */
(function()
{
   Asteroids.TextIndicator = function(p, v, msg, textSize, colour, fadeLength)
   {
      this.fadeLength = (fadeLength ? fadeLength : this.DEFAULT_FADE_LENGTH);
      Asteroids.TextIndicator.superclass.constructor.call(this, p, v, this.fadeLength);
      this.msg = msg;
      if (textSize)
      {
         this.textSize = textSize;
      }
      if (colour)
      {
         this.colour = colour;
      }
      return this;
   };
   
   extend(Asteroids.TextIndicator, Game.EffectActor,
   {
      DEFAULT_FADE_LENGTH: 16,
      fadeLength: 0,
      textSize: 12,
      msg: null,
      colour: "rgb(255,255,255)",
      
      /**
       * Text indicator effect rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         // fade out alpha
         var alpha = (1.0 / this.fadeLength) * this.lifespan;
         ctx.save();
         ctx.globalAlpha = alpha;
         Game.fillText(ctx, this.msg, this.textSize + "pt Courier New", this.position.x, this.position.y, this.colour);
         ctx.restore();
      }
   });
})();


/**
 * Score indicator effect actor class.
 * 
 * @namespace Asteroids
 * @class Asteroids.ScoreIndicator
 */
(function()
{
   Asteroids.ScoreIndicator = function(p, v, score, textSize, prefix, colour, fadeLength)
   {
      var msg = score.toString();
      if (prefix)
      {
         msg = prefix + ' ' + msg;
      }
      Asteroids.ScoreIndicator.superclass.constructor.call(this, p, v, msg, textSize, colour, fadeLength);
      return this;
   };
   
   extend(Asteroids.ScoreIndicator, Asteroids.TextIndicator,
   {
   });
})();


/**
 * Power up collectable.
 * 
 * @namespace Asteroids
 * @class Asteroids.PowerUp
 */
(function()
{
   Asteroids.PowerUp = function(p, v)
   {
      Asteroids.PowerUp.superclass.constructor.call(this, p, v);
      return this;
   };
   
   extend(Asteroids.PowerUp, Game.EffectActor,
   {
      RADIUS: 8,
      pulse: 128,
      pulseinc: 8,
      
      /**
       * Power up rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         ctx.save();
         ctx.globalAlpha = 0.75;
         var col = "rgb(255," + this.pulse.toString() + ",0)";
         if (BITMAPS)
         {
            ctx.fillStyle = col;
            ctx.strokeStyle = "rgb(255,255,128)";
         }
         else
         {
            ctx.lineWidth = 2.0;
            ctx.shadowColor = ctx.strokeStyle = col;
         }
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, this.RADIUS, 0, TWOPI, true);
         ctx.closePath();
         if (BITMAPS)
         {
            ctx.fill();
         }
         ctx.stroke();
         ctx.restore();
         this.pulse += this.pulseinc;
         if (this.pulse > 255)
         {
            this.pulse = 256 - this.pulseinc;
            this.pulseinc =- this.pulseinc;
         }
         else if (this.pulse < 0)
         {
            this.pulse = 0 - this.pulseinc;
            this.pulseinc =- this.pulseinc;
         }
      },
      
      radius: function radius()
      {
         return this.RADIUS;
      },
      
      collected: function collected(game, player, scene)
      {
         // randomly select a powerup to apply
         var message = null;
         switch (randomInt(0, 9))
         {
            case 0:
            case 1:
               // boost energy
               message = "Energy Boost!";
               player.energy += player.ENERGY_INIT/2;
               if (player.energy > player.ENERGY_INIT)
               {
                  player.energy = player.ENERGY_INIT;
               }
               break;
            
            case 2:
               // fire when shieled
               message = "Fire When Shielded!";
               player.fireWhenShield = true;
               break;
            
            case 3:
               // extra life
               message = "Extra Life!";
               game.lives++;
               break;
            
            case 4:
               // slow down asteroids
               message = "Slow Down Asteroids!";
               for (var n = 0, m = scene.enemies.length, enemy; n < m; n++)
               {
                  enemy = scene.enemies[n];
                  if (enemy instanceof Asteroids.Asteroid)
                  {
                     enemy.vector.scale(0.75);
                  }
               }
               break;
            
            case 5:
               // smart bomb
               message = "Smart Bomb!";
               
               var effectRad = 96;
               
               // add a BIG explosion actor at the smart bomb weapon position and vector
               var boom = new Asteroids.Explosion(
                     this.position.clone(), this.vector.clone().scale(0.5), effectRad / 8);
               scene.effects.push(boom);
               
               // test circle intersection with each enemy actor
               // we check the enemy list length each iteration to catch baby asteroids
               // this is a fully fledged smart bomb after all!
               for (var n = 0, enemy, pos = this.position; n < scene.enemies.length; n++)
               {
                  enemy = scene.enemies[n];
                  
                  // test the distance against the two radius combined
                  if (pos.distance(enemy.position) <= effectRad + enemy.radius())
                  {
                     // intersection detected! 
                     enemy.hit(-1);
                     scene.generatePowerUp(enemy);
                     scene.destroyEnemy(enemy, this.vector, true);
                  }
               }
               break;
            
            case 6:
               // twin cannon primary weapon upgrade
               message = "Twin Cannons!";
               player.primaryWeapons["main"] = new Asteroids.TwinCannonsWeapon(player);
               break;
            
            case 7:
               // v spray cannons
               message = "Spray Cannons!";
               player.primaryWeapons["main"] = new Asteroids.VSprayCannonsWeapon(player);
               break;
            
            case 8:
               // rear guns
               message = "Rear Gun!";
               player.primaryWeapons["rear"] = new Asteroids.RearGunWeapon(player);
               break;
            
            case 9:
               // side guns
               message = "Side Guns!";
               player.primaryWeapons["side"] = new Asteroids.SideGunWeapon(player);
               break;
         }
         
         if (message)
         {
            // generate a effect indicator at the destroyed enemy position
            var vec = new Vector(0, -3.0);
            var effect = new Asteroids.TextIndicator(
                  new Vector(this.position.x, this.position.y - this.RADIUS), vec, message, null, null, 32);
            scene.effects.push(effect);
         }
      }
   });
})();
