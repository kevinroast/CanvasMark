/**
 * Weapon system base class for the player actor.
 * 
 * @namespace Arena
 * @class Arena.Weapon
 */
(function()
{
   Arena.Weapon = function(player)
   {
      this.player = player;
      return this;
   };
   
   Arena.Weapon.prototype =
   {
      rechargeTime: 3,
      weaponRecharged: 0,
      player: null,
      
      fire: function(v, h)
      {
         // now test we did not fire too recently
         if (GameHandler.frameCount - this.weaponRecharged > this.rechargeTime)
         {
            // ok, update last fired frame and we can now generate a bullet
            this.weaponRecharged = GameHandler.frameCount;
            
            return this.doFire(v, h);
         }
      },
      
      doFire: function(v, h)
      {
      }
   };
})();


/**
 * Basic primary weapon for the player actor.
 * 
 * @namespace Arena
 * @class Arena.PrimaryWeapon
 */
(function()
{
   Arena.PrimaryWeapon = function(player)
   {
      Arena.PrimaryWeapon.superclass.constructor.call(this, player);
      this.rechargeTime = this.DEFAULT_RECHARGE;
      return this;
   };
   
   extend(Arena.PrimaryWeapon, Arena.Weapon,
   {
      DEFAULT_RECHARGE: 5,
      bulletCount: 1,   // increase this to output more intense bullet stream
      
      doFire: function(vector, heading)
      {
         var bullets = [],
             count = this.bulletCount,
             total = (count > 2 ? randomInt(count - 1, count) : count);
         for (var i=0; i<total; i++)
         {
            // slightly randomize the spread based on bullet count
            var offset = (count > 1 ? Rnd() * PIO16 * (count-1) : 0),
                h = heading + offset - (PIO32 * (count-1)),
                v = vector.nrotate(offset - (PIO32 * (count-1))).scale(1 + Rnd() * 0.1 - 0.05);
            v.add(this.player.vector);
            
            bullets.push(new Arena.Bullet(this.player.position.clone(), v, h));
         }
         return bullets;
      }
   });
})();


/**
 * Player Bullet actor class.
 *
 * @namespace Arena
 * @class Arena.Bullet
 */
(function()
{
   Arena.Bullet = function(p, v, h, lifespan)
   {
      Arena.Bullet.superclass.constructor.call(this, p, v);
      this.heading = h;
      this.lifespan = (lifespan ? lifespan : this.BULLET_LIFESPAN);
      this.radius = this.BULLET_RADIUS;
      return this;
   };
   
   extend(Arena.Bullet, Game.Actor,
   {
      BULLET_RADIUS: 12,
      BULLET_LIFESPAN: 30,
      FADE_LENGTH: 5,
      
      /**
       * Bullet heading
       */
      heading: 0,
      
      /**
       * Bullet lifespan remaining
       */
      lifespan: 0,
      
      /**
       * Bullet power energy
       */
      powerLevel: 1,
      
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       * @param world {object} World metadata
       */
      onRender: function onRender(ctx, world)
      {
         ctx.save();
         ctx.shadowBlur = 0;
         ctx.globalCompositeOperation = "lighter";
         if (this.worldToScreen(ctx, world, this.BULLET_RADIUS) &&
             this.lifespan < this.BULLET_LIFESPAN - 1)   // hack - to stop draw over player ship
         {
            if (this.lifespan < this.FADE_LENGTH)
            {
               ctx.globalAlpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
            }
            
            // rotate into the correct heading
            ctx.rotate(this.heading * RAD);
            
            // draw bullet primary weapon
            try
            {
               ctx.drawImage(GameHandler.prerenderer.images["playerweapon"][0], -20, -20);
            }
            catch (error)
            {
               if (console !== undefined) console.log(error.message);
            }
         }
         ctx.restore();
      },
      
      /**
       * Actor expiration test
       * 
       * @return true if expired and to be removed from the actor list, false if still in play
       */
      expired: function expired()
      {
         // deduct lifespan from the bullet
         return (--this.lifespan === 0);
      },
      
      /**
       * Area effect weapon radius - zero for primary bullets
       */
      effectRadius: function effectRadius()
      {
         return 0;
      },
      
      power: function power()
      {
         return this.powerLevel;
      }
   });
})();


/**
 * Enemy Bullet actor class.
 *
 * @namespace Arena
 * @class Arena.EnemyBullet
 */
(function()
{
   Arena.EnemyBullet = function(p, v, power)
   {
      Arena.EnemyBullet.superclass.constructor.call(this, p, v);
      this.powerLevel = this.playerDamage = power;
      this.lifespan = this.BULLET_LIFESPAN;
      this.radius = this.BULLET_RADIUS;
      return this;
   };
   
   extend(Arena.EnemyBullet, Game.Actor,
   {
      BULLET_LIFESPAN: 75,
      BULLET_RADIUS: 10,
      FADE_LENGTH: 8,
      powerLevel: 0,
      playerDamage: 0,
      
      /**
       * Bullet lifespan remaining
       */
      lifespan: 0,
      
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       * @param world {object} World metadata
       */
      onRender: function onRender(ctx, world)
      {
         ctx.save();
         ctx.globalCompositeOperation = "lighter";
         if (this.worldToScreen(ctx, world, this.BULLET_RADIUS) &&
             this.lifespan < this.BULLET_LIFESPAN - 1)   // hack - to stop draw over enemy
         {
            if (this.lifespan < this.FADE_LENGTH)
            {
               ctx.globalAlpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
            }
            ctx.shadowColor = ctx.fillStyle = "rgb(150,255,150)";
            
            var rad = this.BULLET_RADIUS - 2;
            ctx.beginPath();
            ctx.arc(0, 0, (rad-1 > 0 ? rad-1 : 0.1), 0, TWOPI, true);
            ctx.closePath();
            ctx.fill();
            
            ctx.rotate((GameHandler.frameCount % 1800) / 5);
            ctx.beginPath()
            ctx.moveTo(rad * 2, 0);
            for (var i=0; i<7; i++)
            {
               ctx.rotate(PIO4);
               if (i%2 === 0)
               {
                  ctx.lineTo((rad * 2 / 0.5) * 0.2, 0);
               }
               else
               {
                  ctx.lineTo(rad * 2, 0);
               }
            }
            ctx.closePath();
            ctx.fill();
         }
         ctx.restore();
      },
      
      /**
       * Actor expiration test
       * 
       * @return true if expired and to be removed from the actor list, false if still in play
       */
      expired: function expired()
      {
         // deduct lifespan from the bullet
         return (--this.lifespan === 0);
      },
      
      power: function power()
      {
         return this.powerLevel;
      }
   });
})();
