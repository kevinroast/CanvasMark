/**
 * Player actor class.
 *
 * @namespace Arena
 * @class Arena.Player
 */
(function()
{
   Arena.Player = function(p, v, h)
   {
      Arena.Player.superclass.constructor.call(this, p, v);
      
      this.energy = this.ENERGY_INIT;
      this.radius = 20;
      this.heading = h;
      
      // setup weapons
      this.primaryWeapons = [];
      this.primaryWeapons["main"] = new Arena.PrimaryWeapon(this);
      
      // 3D sprite object - must be created after constructor call
      var obj = new K3D.K3DObject();
      with (obj)
      {
         drawmode = "wireframe";
         shademode = "depthcue";
         depthscale = 32;
         linescale = 3;
         perslevel = 256;
         
         addphi = -1.0; //addphi = 1.0; addtheta = -1.0; addgamma = -0.75;
         scale = 0.8;    // TODO: pre-scale points? (this is only done once for player, but enemies...)
         init(
            [{x:-30,y:-20,z:0}, {x:-15,y:-25,z:20}, {x:15,y:-25,z:20}, {x:30,y:-20,z:0}, {x:15,y:-25,z:-20}, {x:-15,y:-25,z:-20}, {x:0,y:35,z:0}],
            [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:4}, {a:4,b:5}, {a:5,b:0}, {a:1,b:6}, {a:2,b:6}, {a:4,b:6}, {a:5,b:6}, {a:0,b:6}, {a:3,b:6}],
            [{vertices:[0,1,6]}, {vertices:[1,2,6]}, {vertices:[2,3,6]}, {vertices:[3,4,6]}, {vertices:[4,5,6]}, {vertices:[5,0,6]}, {vertices:[0,1,2,3,4,5]}]
         );
      }
      this.setK3DObject(obj);
      
      return this;
   };
   
   extend(Arena.Player, Arena.K3DActor,
   {
      MAX_PLAYER_VELOCITY: 15.0,
      THRUST_DELAY: 1,
      ENERGY_INIT: 100,
      
      /**
       * Player heading
       */
      heading: 0,
      
      /**
       * Player energy level
       */
      energy: 0,
      
      /**
       * Primary weapon list
       */
      primaryWeapons: null,
      
      /**
       * Engine thrust recharge counter
       */
      thrustRecharge: 0,
      
      /**
       * True if the engine thrust graphics should be rendered next frame
       */
      engineThrust: false,
      
      /**
       * Frame that the player was killed on - to cause a delay before respawning the player
       */
      killedOnFrame: 0,
      
      /**
       * Power up settings - primary weapon bounce
       */
      bounceWeapons: false,
      
      /**
       * Player rendering method
       * 
       * @param ctx {object} Canvas rendering context
       * @param world {object} World metadata
       */
      onRender: function onRender(ctx, world)
      {
         var headingRad = this.heading * RAD;
         
         // transform world to screen - non-visible returns null
         var viewposition = Game.worldToScreen(this.position, world, this.radius);
         if (viewposition)
         {
            // render engine thrust?
            if (this.engineThrust)
            {
               ctx.save();
               // scale ALL graphics... - translate to position apply canvas scaling
               ctx.translate(viewposition.x, viewposition.y);
               ctx.scale(world.scale, world.scale);
               ctx.rotate(headingRad);
               ctx.translate(0, -4);   // slight offset so that collision radius is centered
               ctx.globalAlpha = 0.4 + Rnd() * 0.5;
               ctx.shadowColor = ctx.fillStyle = "rgb(25,125,255)";
               ctx.beginPath();
               ctx.moveTo(-12, 20);
               ctx.lineTo(12, 20);
               ctx.lineTo(0, 50 + Rnd() * 20);
               ctx.closePath();
               ctx.fill();
               ctx.restore();
               this.engineThrust = false;
            }
            
            // render player graphic
            ctx.save();
            ctx.shadowColor = "rgb(255,255,255)";
            ctx.translate(viewposition.x, viewposition.y);
            ctx.scale(world.scale, world.scale);
            ctx.rotate(headingRad);
            ctx.translate(0, -4);   // slight offset so that collision radius is centered
            
            // render 3D sprite
            this.renderK3D(ctx);
            
            ctx.restore();
         }
         //if (DEBUG && !viewposition) console.log("non-visible: " + new Date().getTime());
      },
      
      /**
       * Handle key input to rotate and move the player
       */
      handleInput: function handleInput(input)
      {
         var h = this.heading % 360;
         
         // TODO: hack, fix this to maintain +ve heading or change calculation below...
         if (h < 0) h += 360;
         
         // first section tweens the current rendered heading of the player towards
         // the desired heading - but the next section actually applies a vector
         // TODO: this seems over complicated - must be an easier way to do this...
         if (input.left)
         {
            if (h > 270 || h < 90)
            {
               if (h > 270) this.heading -= ((h - 270) * 0.2);
               else this.heading -= ((h + 90) * 0.2);
            }
            else this.heading += ((270 - h) * 0.2);
         }
         if (input.right)
         {
            if (h < 90 || h > 270)
            {
               if (h < 90) this.heading += ((90 - h) * 0.2);
               else this.heading += ((h - 90) * 0.2);
            }
            else this.heading -= ((h - 90) * 0.2);
         }
         if (input.up)
         {
            if (h < 180)
            {
               this.heading -= (h * 0.2);
            }
            else this.heading += ((360 - h) * 0.2);
         }
         if (input.down)
         {
            if (h < 180)
            {
               this.heading += ((180 - h) * 0.2);
            }
            else this.heading -= ((h - 180) * 0.2);
         }
         
         // second section applies the direct thrust angled vector
         // this ensures a snappy control method with the above heading effect
         var angle = null;
         if (input.left)
         {
            if (input.up) angle = 315;
            else if (input.down) angle = 225;
            else angle = 270;
         }
         else if (input.right)
         {
            if (input.up) angle = 45;
            else if (input.down) angle = 135;
            else angle = 90;
         }
         else if (input.up)
         {
            if (input.left) angle = 315;
            else if (input.right) angle = 45;
            else angle = 0;
         }
         else if (input.down)
         {
            if (input.left) angle = 225;
            else if (input.right) angle = 135;
            else angle = 180;
         }
         if (angle !== null)
         {
            this.thrust(angle);
         }
         else
         {
            // reduce thrust over time if player isn't actively moving
            this.vector.scale(0.9);
         }
      },
      
      /**
       * Execute player forward thrust request
       * Automatically a delay is used between each application - to ensure stable thrust on all machines.
       */
      thrust: function thrust(angle)
      {
         // now test we did not thrust too recently - to stop fast key repeat issues
         if (GameHandler.frameCount - this.thrustRecharge > this.THRUST_DELAY)
         {
            // update last frame count
            this.thrustRecharge = GameHandler.frameCount;
            
            // generate a small thrust vector
            var t = new Vector(0.0, -2.00);
            
            // rotate thrust vector by player current heading
            t.rotate(angle * RAD);
            
            // add player thrust vector to position
            this.vector.add(t);
            
            // player can't exceed maximum velocity - scale vector down if
            // this occurs - do this rather than not adding the thrust at all
            // otherwise the player cannot turn and thrust at max velocity
            if (this.vector.length() > this.MAX_PLAYER_VELOCITY)
            {
               this.vector.scale(this.MAX_PLAYER_VELOCITY / this.vector.length());
            }
         }
         // mark so that we know to render engine thrust graphics
         this.engineThrust = true;
      },
      
      damageBy: function damageBy(enemy)
      {
         this.energy -= enemy.playerDamage;
         if (this.energy <= 0)
         {
            this.energy = 0;
            this.kill();
         }
      },
      
      kill: function kill()
      {
         this.alive = false;
         this.killedOnFrame = GameHandler.frameCount;
      },
      
      /**
       * Fire primary weapon(s)
       * @param bulletList {Array} to add bullet(s) to on success
       * @param heading {Number} bullet heading
       */
      firePrimary: function firePrimary(bulletList, vector, heading)
      {
         // attempt to fire the primary weapon(s)
         // first ensure player is alive
         if (this.alive)
         {
            for (var w in this.primaryWeapons)
            {
               var b = this.primaryWeapons[w].fire(vector, heading);
               if (b)
               {
                  for (var i=0; i<b.length; i++)
                  {
                     bulletList.push(b[i]);
                  }
               }
            }
         }
      },
      
      reset: function reset(persistPowerUps)
      {
         // reset energy, alive status, weapons and power up flags
         this.alive = true;
         if (!persistPowerUps)
         {
            // reset weapons
            this.primaryWeapons = [];
            this.primaryWeapons["main"] = new Arena.PrimaryWeapon(this);
            
            // reset powerup settings
            this.bounceWeapons = false;
         }
         this.energy = this.ENERGY_INIT;
      }
   });
})();


/**
 * Player score multiplier collectable class.
 *
 * @namespace Arena
 * @class Arena.Multiplier
 */
(function()
{
   Arena.Multiplier = function(p, v, h)
   {
      Arena.Multiplier.superclass.constructor.call(this, p, v, this.LIFESPAN);
      this.radius = 10;
      this.rotation = 0;
      return this;
   };
   
   extend(Arena.Multiplier, Game.EffectActor,
   {
      LIFESPAN: 250,
      FADE_LENGTH: 16,
      rotation: 0,
      
      /**
       * Multiplier collectable rendering method
       * 
       * @param ctx {object} Canvas rendering context
       * @param world {object} World metadata
       */
      onRender: function onRender(ctx, world)
      {
         // transform world to screen - non-visible returns null
         var viewposition = Game.worldToScreen(this.position, world, this.radius);
         if (viewposition)
         {
            var r = this.radius * 0.6;
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            if (this.lifespan < this.FADE_LENGTH)
            {
               ctx.globalAlpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
            }
            ctx.strokeStyle = ctx.shadowColor = "rgb(255,180,0)";
            ctx.translate(viewposition.x, viewposition.y);
            ctx.scale(world.scale, world.scale);
            ctx.rotate(this.rotation);
            ctx.strokeRect(-r, -r, this.radius*1.2, this.radius*1.2);
            ctx.restore();
            this.rotation += 0.02;
         }
      },
      
      collected: function collected(game, player, scene)
      {
         if (++game.scoreMultiplier % 10 === 0)
         {
            // display multiplier to player every large increment
            var vec = new Vector(0, -5.0).add(this.vector);
            scene.effects.push(new Arena.TextIndicator(
               this.position.clone(), vec, "x" + game.scoreMultiplier, 32, "white", 32));
         }
      }
   });
})();


/**
 * Player energy boost powerup collectable class.
 *
 * @namespace Arena
 * @class Arena.EnergyBoostPowerup
 */
(function()
{
   Arena.EnergyBoostPowerup = function(p, v, h)
   {
      Arena.EnergyBoostPowerup.superclass.constructor.call(this, p, v, this.LIFESPAN);
      this.radius = 12;
      this.rotation = 0;
      return this;
   };
   
   extend(Arena.EnergyBoostPowerup, Game.EffectActor,
   {
      LIFESPAN: 350,
      FADE_LENGTH: 16,
      rotation: 0,
      
      /**
       * EnergyBoostPowerup collectable rendering method
       * 
       * @param ctx {object} Canvas rendering context
       * @param world {object} World metadata
       */
      onRender: function onRender(ctx, world)
      {
         // transform world to screen - non-visible returns null
         var viewposition = Game.worldToScreen(this.position, world, this.radius);
         if (viewposition)
         {
            var r = this.radius * 0.6;
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            if (this.lifespan < this.FADE_LENGTH)
            {
               ctx.globalAlpha = (1.0 / this.FADE_LENGTH) * this.lifespan;
            }
            ctx.lineWidth = 2.0;
            ctx.strokeStyle = ctx.shadowColor = "rgb(100,255,0)";
            ctx.translate(viewposition.x, viewposition.y);
            ctx.scale(world.scale, world.scale);
            ctx.rotate(this.rotation);
            ctx.strokeRect(-r, -r, this.radius*1.2, this.radius*1.2);
            ctx.restore();
            this.rotation += 0.05;
         }
      },
      
      collected: function collected(game, player, scene)
      {
         // increment player energy
         player.energy += 25;
         if (player.energy > player.ENERGY_INIT)
         {
            player.energy = player.ENERGY_INIT;
         }
         
         // display indicator
         var vec = new Vector(0, -5.0).add(this.vector);
         scene.effects.push(new Arena.TextIndicator(
            this.position.clone(), vec, "Energy Boost!", 32, "white", 32));
      }
   });
})();
