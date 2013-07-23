/**
 * Weapon system base class for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.Weapon
 */
(function()
{
   Asteroids.Weapon = function(player)
   {
      this.player = player;
      return this;
   };
   
   Asteroids.Weapon.prototype =
   {
      WEAPON_RECHARGE: 3,
      weaponRecharge: 0,
      player: null,
      
      fire: function()
      {
         // now test we did not fire too recently
         if (GameHandler.frameCount - this.weaponRecharge > this.WEAPON_RECHARGE)
         {
            // ok, update last fired frame and we can now generate a bullet
            this.weaponRecharge = GameHandler.frameCount;
            
            return this.doFire();
         }
      },
      
      doFire: function()
      {
      }
   };
})();


/**
 * Basic primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.PrimaryWeapon
 */
(function()
{
   Asteroids.PrimaryWeapon = function(player)
   {
      Asteroids.PrimaryWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.PrimaryWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         // generate a vector rotated to the player heading and then add the current player
         // vector to give the bullet the correct directional momentum
         var t = new Vector(0.0, -8.0);
         t.rotate(this.player.heading * RAD);
         t.add(this.player.vector);
         
         return new Asteroids.Bullet(this.player.position.clone(), t, this.player.heading);
      }
   });
})();


/**
 * Twin Cannons primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.TwinCannonsWeapon
 */
(function()
{
   Asteroids.TwinCannonsWeapon = function(player)
   {
      Asteroids.TwinCannonsWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.TwinCannonsWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t = new Vector(0.0, -8.0);
         t.rotate(this.player.heading * RAD);
         t.add(this.player.vector);
         
         return new Asteroids.BulletX2(this.player.position.clone(), t, this.player.heading);
      }
   });
})();


/**
 * V Spray Cannons primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.VSprayCannonsWeapon
 */
(function()
{
   Asteroids.VSprayCannonsWeapon = function(player)
   {
      this.WEAPON_RECHARGE = 5;
      Asteroids.VSprayCannonsWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.VSprayCannonsWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t, h;
         
         var bullets = [];
         
         h = this.player.heading - 15;
         t = new Vector(0.0, -7.0).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
         
         h = this.player.heading;
         t = new Vector(0.0, -7.0).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
         
         h = this.player.heading + 15;
         t = new Vector(0.0, -7.0).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h));
         
         return bullets;
      }
   });
})();


/**
 * Side Guns additional primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.SideGunWeapon
 */
(function()
{
   Asteroids.SideGunWeapon = function(player)
   {
      this.WEAPON_RECHARGE = 5;
      Asteroids.SideGunWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.SideGunWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t, h;
         
         var bullets = [];
         
         h = this.player.heading - 90;
         t = new Vector(0.0, -8.0).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h, 25));
         
         h = this.player.heading + 90;
         t = new Vector(0.0, -8.0).rotate(h * RAD).add(this.player.vector);
         bullets.push(new Asteroids.Bullet(this.player.position.clone(), t, h, 25));
         
         return bullets;
      }
   });
})();


/**
 * Rear Gun additional primary weapon for the player actor.
 * 
 * @namespace Asteroids
 * @class Asteroids.RearGunWeapon
 */
(function()
{
   Asteroids.RearGunWeapon = function(player)
   {
      this.WEAPON_RECHARGE = 5;
      Asteroids.RearGunWeapon.superclass.constructor.call(this, player);
      return this;
   };
   
   extend(Asteroids.RearGunWeapon, Asteroids.Weapon,
   {
      doFire: function()
      {
         var t = new Vector(0.0, -8.0);
         var h = this.player.heading + 180;
         t.rotate(h * RAD);
         t.add(this.player.vector);
         
         return new Asteroids.Bullet(this.player.position.clone(), t, h, 25);
      }
   });
})();


/**
 * Player Bullet actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.Bullet
 */
(function()
{
   Asteroids.Bullet = function(p, v, h, lifespan)
   {
      Asteroids.Bullet.superclass.constructor.call(this, p, v);
      this.heading = h;
      if (lifespan)
      {
         this.lifespan = lifespan;
      }
      return this;
   };
   
   extend(Asteroids.Bullet, Game.Actor,
   {
      BULLET_WIDTH: 2,
      BULLET_HEIGHT: 6,
      FADE_LENGTH: 5,
      
      /**
       * Bullet heading
       */
      heading: 0.0,
      
      /**
       * Bullet lifespan remaining
       */
      lifespan: 40,
      
      /**
       * Bullet power energy
       */
      powerLevel: 1,
      
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         var width = this.BULLET_WIDTH;
         var height = this.BULLET_HEIGHT;
         ctx.save();
         ctx.globalCompositeOperation = "lighter";
         if (this.lifespan < this.FADE_LENGTH)
         {
            // fade out
            ctx.globalAlpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
         }
         if (BITMAPS)
         {
            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.fillStyle = "rgb(50,255,50)";
         }
         else
         {
            ctx.shadowColor = ctx.strokeStyle = "rgb(50,255,50)";
         }
         // rotate the little bullet rectangle into the correct heading
         ctx.translate(this.position.x, this.position.y);
         ctx.rotate(this.heading * RAD);
         var x = -(width / 2);
         var y = -(height / 2);
         if (BITMAPS)
         {
            ctx.fillRect(x, y, width, height);
            ctx.fillRect(x, y+1, width, height-1);
         }
         else
         {
            ctx.strokeRect(x, y-1, width, height+1);
            ctx.strokeRect(x, y, width, height);
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
      
      radius: function radius()
      {
         // approximate based on average between width and height
         return (this.BULLET_HEIGHT + this.BULLET_WIDTH) / 2;
      },
      
      power: function power()
      {
         return this.powerLevel;
      }
   });
})();


/**
 * Player BulletX2 actor class. Used by the Twin Cannons primary weapon.
 *
 * @namespace Asteroids
 * @class Asteroids.BulletX2
 */
(function()
{
   Asteroids.BulletX2 = function(p, v, h)
   {
      Asteroids.BulletX2.superclass.constructor.call(this, p, v, h);
      this.lifespan = 50;
      this.powerLevel = 2;
      return this;
   };
   
   extend(Asteroids.BulletX2, Asteroids.Bullet,
   {
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         var width = this.BULLET_WIDTH;
         var height = this.BULLET_HEIGHT;
         ctx.save();
         ctx.globalCompositeOperation = "lighter";
         if (this.lifespan < this.FADE_LENGTH)
         {
            // fade out
            ctx.globalAlpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
         }
         if (BITMAPS)
         {
            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.fillStyle = "rgb(50,255,128)";
         }
         else
         {
            ctx.shadowColor = ctx.strokeStyle = "rgb(50,255,128)";
         }
         // rotate the little bullet rectangle into the correct heading
         ctx.translate(this.position.x, this.position.y);
         ctx.rotate(this.heading * RAD);
         var x = -(width / 2);
         var y = -(height / 2);
         if (BITMAPS)
         {
            ctx.fillRect(x - 4, y, width, height);
            ctx.fillRect(x - 4, y+1, width, height-1);
            ctx.fillRect(x + 4, y, width, height);
            ctx.fillRect(x + 4, y+1, width, height-1);
         }
         else
         {
            ctx.strokeRect(x - 4, y-1, width, height+1);
            ctx.strokeRect(x - 4, y, width, height);
            ctx.strokeRect(x + 4, y-1, width, height+1);
            ctx.strokeRect(x + 4, y, width, height);
         }
         ctx.restore();
      },
      
      radius: function radius()
      {
         // double width bullets - so bigger hit area than basic ones
         return (this.BULLET_HEIGHT);
      }
   });
})();


/**
 * Bomb actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.Bomb
 */
(function()
{
   Asteroids.Bomb = function(p, v)
   {
      Asteroids.Bomb.superclass.constructor.call(this, p, v);
      return this;
   };
   
   extend(Asteroids.Bomb, Asteroids.Bullet,
   {
      BOMB_RADIUS: 4,
      FADE_LENGTH: 5,
      EFFECT_RADIUS: 45,
      
      /**
       * Bomb lifespan remaining
       */
      lifespan: 80,
      
      /**
       * Bomb rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         var rad = this.BOMB_RADIUS;
         ctx.save();
         ctx.globalCompositeOperation = "lighter";
         var alpha = 0.8;
         if (this.lifespan < this.FADE_LENGTH)
         {
            // fade out
            alpha = (0.8 / this.FADE_LENGTH) * this.lifespan;
            rad = (this.BOMB_RADIUS / this.FADE_LENGTH) * this.lifespan;
         }
         ctx.globalAlpha = alpha;
         if (BITMAPS)
         {
            ctx.fillStyle = "rgb(155,255,155)";
         }
         else
         {
            ctx.shadowColor = ctx.strokeStyle = "rgb(155,255,155)";
         }
         ctx.translate(this.position.x, this.position.y);
         ctx.rotate(GameHandler.frameCount % 360);
         // account for the fact that stroke() draws around the shape
         if (!BITMAPS) ctx.scale(0.8, 0.8);
         ctx.beginPath()
         ctx.moveTo(rad * 2, 0);
         for (var i=0; i<15; i++)
         {
            ctx.rotate(Math.PI / 8);
            if (i % 2 == 0)
            {
               ctx.lineTo((rad * 2 / 0.525731) * 0.200811, 0);
            }
            else
            {
               ctx.lineTo(rad * 2, 0);
            }
         }
         ctx.closePath();
         if (BITMAPS) ctx.fill(); else ctx.stroke();
         ctx.restore();
      },
      
      /**
       * Area effect weapon radius
       */
      effectRadius: function effectRadius()
      {
         return this.EFFECT_RADIUS;
      },
      
      radius: function radius()
      {
         var rad = this.BOMB_RADIUS;
         if (this.lifespan <= this.FADE_LENGTH)
         {
            rad = (this.BOMB_RADIUS / this.FADE_LENGTH) * this.lifespan;
         }
         return rad;
      }
   });
})();


/**
 * Enemy Bullet actor class.
 *
 * @namespace Asteroids
 * @class Asteroids.EnemyBullet
 */
(function()
{
   Asteroids.EnemyBullet = function(p, v)
   {
      Asteroids.EnemyBullet.superclass.constructor.call(this, p, v);
      return this;
   };
   
   extend(Asteroids.EnemyBullet, Game.Actor,
   {
      BULLET_RADIUS: 4,
      FADE_LENGTH: 5,
      
      /**
       * Bullet lifespan remaining
       */
      lifespan: 60,
      
      /**
       * Bullet rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx)
      {
         var rad = this.BULLET_RADIUS;
         ctx.save();
         ctx.globalCompositeOperation = "lighter";
         var alpha = 0.7;
         if (this.lifespan < this.FADE_LENGTH)
         {
            // fade out and make smaller
            alpha = (0.7 / this.FADE_LENGTH) * this.lifespan;
            rad = (this.BULLET_RADIUS / this.FADE_LENGTH) * this.lifespan;
         }
         ctx.globalAlpha = alpha;
         if (BITMAPS)
         {
            ctx.fillStyle = "rgb(150,255,150)";
         }
         else
         {
            ctx.shadowColor = ctx.strokeStyle = "rgb(150,255,150)";
         }
         
         ctx.beginPath();
         ctx.arc(this.position.x, this.position.y, (rad-1 > 0 ? rad-1 : 0.1), 0, TWOPI, true);
         ctx.closePath();
         if (BITMAPS) ctx.fill(); else ctx.stroke();
         
         ctx.translate(this.position.x, this.position.y);
         ctx.rotate((GameHandler.frameCount % 720) / 2);
         ctx.beginPath()
         ctx.moveTo(rad * 2, 0);
         for (var i=0; i<7; i++)
         {
            ctx.rotate(Math.PI/4);
            if (i%2 == 0)
            {
               ctx.lineTo((rad * 2/0.525731) * 0.200811, 0);
            }
            else
            {
               ctx.lineTo(rad * 2, 0);
            }
         }
         ctx.closePath();
         if (BITMAPS) ctx.fill(); else ctx.stroke();
         
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
      
      radius: function radius()
      {
         var rad = this.BULLET_RADIUS;
         if (this.lifespan <= this.FADE_LENGTH)
         {
            rad = (rad / this.FADE_LENGTH) * this.lifespan;
         }
         return rad;
      }
   });
})();
