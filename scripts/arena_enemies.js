/**
 * Enemy Ship actor class.
 * 
 * @namespace Arena
 * @class Arena.EnemyShip
 */
(function()
{
   Arena.EnemyShip = function(scene, type)
   {
      // enemy score multiplier based on type buy default - but some enemies
      // will tweak this in the individual setup code later
      this.type = this.scoretype = type;
      
      // generate enemy at start position - not too close to the player
      var p, v = null;
      while (!v)
      {
         p = new Vector(Rnd() * scene.world.size, Rnd() * scene.world.size);
         if (scene.player.position.distance(p) > 220)
         {
            v = new Vector(0,0);
         }
      }
      Arena.EnemyShip.superclass.constructor.call(this, p, v);
      
      // 3D sprite object - must be created after constructor call
      var me = this;
      var obj = new K3D.K3DObject();
      with (obj)
      {
         drawmode = "wireframe";
         shademode = "depthcue";
         depthscale = 32;
         linescale = 3;
         perslevel = 256;
         
         switch (type)
         {
            case 0:
               // Dumbo: blue stretched cubiod
               me.radius = 22;
               me.playerDamage = 10;
               me.colorRGB = "rgb(0,128,255)";
               color = [0,128,255];
               addphi = -1.0; addgamma = -0.75;
               init(
                  [{x:-20,y:-20,z:12}, {x:-20,y:20,z:12}, {x:20,y:20,z:12}, {x:20,y:-20,z:12}, {x:-10,y:-10,z:-12}, {x:-10,y:10,z:-12}, {x:10,y:10,z:-12}, {x:10,y:-10,z:-12}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
                  []);
               break;
            
            case 1:
               // Zoner: yellow diamond
               me.radius = 22;
               me.playerDamage = 10;
               me.colorRGB = "rgb(255,255,0)";
               color = [255,255,0];
               addphi = 0.5; addgamma = -0.5; addtheta = -1.0;
               init(
                  [{x:-20,y:-20,z:0}, {x:-20,y:20,z:0}, {x:20,y:20,z:0}, {x:20,y:-20,z:0}, {x:0,y:0,z:-20}, {x:0,y:0,z:20}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:0,b:4}, {a:1,b:4}, {a:2,b:4}, {a:3,b:4}, {a:0,b:5}, {a:1,b:5}, {a:2,b:5}, {a:3,b:5}],
                  []);
               break;
            
            case 2:
               // Tracker: red flattened square
               me.radius = 22;
               me.health = 2;
               me.playerDamage = 15;
               me.colorRGB = "rgb(255,96,0)";
               color = [255,96,0];
               addgamma = 1.0;
               init(
                  [{x:-20,y:-20,z:5}, {x:-20,y:20,z:5}, {x:20,y:20,z:5}, {x:20,y:-20,z:5}, {x:-15,y:-15,z:-5}, {x:-15,y:15,z:-5}, {x:15,y:15,z:-5}, {x:15,y:-15,z:-5}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
                  []);
               break;
            
            case 3:
               // Borg: big green cube
               me.radius = 52;
               me.health = 5;
               me.playerDamage = 25;
               me.colorRGB = "rgb(0,255,64)";
               color = [0,255,64];
               depthscale = 96;  // tweak for larger object
               addphi = -1.5;
               init(
                  [{x:-40,y:-40,z:40}, {x:-40,y:40,z:40}, {x:40,y:40,z:40}, {x:40,y:-40,z:40}, {x:-40,y:-40,z:-40}, {x:-40,y:40,z:-40}, {x:40,y:40,z:-40}, {x:40,y:-40,z:-40}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
                  []);
               break;
            
            case 4:
               // Dodger: small cyan cube
               me.radius = 25;
               me.playerDamage = 10;
               me.colorRGB = "rgb(0,255,255)";
               color = [0,255,255];
               addphi = 0.5; addtheta = -3.0;
               init(
                  [{x:-20,y:-20,z:20}, {x:-20,y:20,z:20}, {x:20,y:20,z:20}, {x:20,y:-20,z:20}, {x:-20,y:-20,z:-20}, {x:-20,y:20,z:-20}, {x:20,y:20,z:-20}, {x:20,y:-20,z:-20}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
                  []);
               break;
            
            case 5:
               // Splitter: medium purple pyrimid (converts to 2x smaller versions when hit)
               me.radius = 25;
               me.health = 3;
               me.playerDamage = 20;
               me.colorRGB = "rgb(148,0,255)";
               color = [148,0,255];
               depthscale = 56;  // tweak for larger object
               addphi = 3.0;
               init(
                  [{x:-30,y:-20,z:0}, {x:0,y:-20,z:30}, {x:30,y:-20,z:0}, {x:0,y:-20,z:-30}, {x:0,y:30,z:0}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:0,b:4}, {a:1,b:4}, {a:2,b:4}, {a:3,b:4}],
                  []);
               break;
            
            case 6:
               // Bomber: medium magenta star - dodge bullets, dodge player!
               me.radius = 28;
               me.health = 5;
               me.playerDamage = 20;
               me.colorRGB = "rgb(255,0,255)";
               color = [255,0,255];
               depthscale = 56;  // tweak for larger object
               addgamma = -5.0;
               init(
                  [{x:-30,y:-30,z:10}, {x:-30,y:30,z:10}, {x:30,y:30,z:10}, {x:30,y:-30,z:10}, {x:-15,y:-15,z:-15}, {x:-15,y:15,z:-15}, {x:15,y:15,z:-15}, {x:15,y:-15,z:-15}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
                  []);
               break;
            
            case 99:
               // Splitter-mini: see Splitter above
               me.scoretype = 4;    // override default score type setting
               me.dropsMutliplier = false;
               me.radius = 12;
               me.health = 1;
               me.playerDamage = 5;
               me.colorRGB = "rgb(148,0,211)";
               color = [148,0,211];
               depthscale = 16;  // tweak for smaller object
               addphi = 5.0;
               init(
                  [{x:-15,y:-10,z:0}, {x:0,y:-10,z:15}, {x:15,y:-10,z:0}, {x:0,y:-10,z:-15}, {x:0,y:15,z:0}],
                  [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:0,b:4}, {a:1,b:4}, {a:2,b:4}, {a:3,b:4}],
                  []);
               break;
         }
      }
      this.setK3DObject(obj);
      
      return this;
   };
   
   extend(Arena.EnemyShip, Arena.K3DActor,
   {
      BULLET_RECHARGE: 50,
      SPAWN_LENGTH: 20, // TODO: replace this with anim state machine
      aliveTime: 0,     // TODO: replace this with anim state machine
      type: 0,
      scoretype: 0,
      dropsMutliplier: true,
      health: 1,
      colorRGB: null,
      playerDamage: 0,
      bulletRecharge: 0,
      hit: false, // TODO: replace with state? - "extends" default render state...?
      
      onUpdate: function onUpdate(scene)
      {
         // TODO: replace this with anim state machine
         if (++this.aliveTime < this.SPAWN_LENGTH)
         {
            // TODO: needs enemy state implemented so can test for "alive" state
            //       for collision detection?
            //       other methods can then test state such as onRender()
            //       SPAWNED->ALIVE->DEAD
            return;
         }
         else if (this.aliveTime === this.SPAWN_LENGTH)
         {
            // initial vector needed for some enemy types - others will set later
            this.vector = new Vector(4 * (Rnd < 0.5 ? 1 : -1), 4 * (Rnd < 0.5 ? 1 : -1));
         }
         switch (this.type)
         {
            case 0:
               // dumb - change direction randomly
               if (Rnd() < 0.01)
               {
                  this.vector.y = -(this.vector.y + (0.5 - Rnd()));
               }
               break;
            
            case 1:
               // randomly reorientate towards player ("perception level")
               // so player can avade by moving around them
               if (Rnd() < 0.04)
               {
                  // head towards player - generate a vector pointed at the player
                  // by calculating a vector between the player and enemy positions
                  var v = scene.player.position.nsub(this.position);
                  // scale resulting vector down to fixed vector size i.e. speed
                  this.vector = v.scaleTo(4);
               }
               break;
            
            case 2:
               // very perceptive and faster - this one is mean
               if (Rnd() < 0.2)
               {
                  var v = scene.player.position.nsub(this.position);
                  this.vector = v.scaleTo(8);
               }
               break;
            
            case 3:
               // fast dash towards player, otherwise it slows down
               if (Rnd() < 0.03)
               {
                  var v = scene.player.position.nsub(this.position);
                  this.vector = v.scaleTo(12);
               }
               else
               {
                  this.vector.scale(0.95);
               }
               break;
            
            case 4:
               // perceptive and fast - and tries to dodgy bullets!
               var dodged = false;
               
               // if we are close to the player then don't try and dodge,
               // otherwise enemy might dash away rather than go for the kill
               if (scene.player.position.nsub(this.position).length() > 150)
               {
                  var p = this.position,
                      r = this.radius + 50;  // bullet "distance" perception
                  
                  // look at player bullets list - are any about to hit?
                  for (var i=0, j=scene.playerBullets.length, bullet, n; i < j; i++)
                  {
                     bullet = scene.playerBullets[i];
                     
                     // test the distance against the two radius combined
                     if (bullet.position.distance(p) <= bullet.radius + r)
                     {
                        // if so attempt a fast sideways dodge!
                        var v = bullet.position.nsub(p).scaleTo(12);
                        // randomise dodge direction a bit
                        v.rotate((n = Rnd()) < 0.5 ? n*PIO4 : -n*PIO4);
                        v.invert();
                        this.vector = v;
                        dodged = true;
                        break;
                     }
                  }
               }
               if (!dodged && Rnd() < 0.04)
               {
                  var v = scene.player.position.nsub(this.position);
                  this.vector = v.scaleTo(8);
               }
               break;
            
            case 5:
               if (Rnd() < 0.04)
               {
                  var v = scene.player.position.nsub(this.position);
                  this.vector = v.scaleTo(5);
               }
               break;
            
            case 6:
               // if we are near the player move away
               // if we are far from the player move towards
               var v = scene.player.position.nsub(this.position);
               if (v.length() > 400)
               {
                  // move closer
                  if (Rnd() < 0.08) this.vector = v.scaleTo(8);
               }
               else if (v.length() < 350)
               {
                  // move away
                  if (Rnd() < 0.08) this.vector = v.invert().scaleTo(8);
               }
               else
               {
                  // slow down into a firing position
                  this.vector.scale(0.8);
                  
                  // reguarly fire at the player
                  if (GameHandler.frameCount - this.bulletRecharge > this.BULLET_RECHARGE && scene.player.alive)
                  {
                     // update last fired frame and generate a bullet
                     this.bulletRecharge = GameHandler.frameCount;
                     
                     // generate a vector pointed at the player
                     // by calculating a vector between the player and enemy positions
                     // then scale to a fixed size - i.e. bullet speed
                     var v = scene.player.position.nsub(this.position).scaleTo(10);
                     // slightly randomize the direction to apply some accuracy issues
                     v.x += (Rnd() * 2 - 1);
                     v.y += (Rnd() * 2 - 1);
                     
                     var bullet = new Arena.EnemyBullet(this.position.clone(), v, 10);
                     scene.enemyBullets.push(bullet);
                  }
               }
               break;
            
            case 99: 
               if (Rnd() < 0.04)
               {
                  var v = scene.player.position.nsub(this.position);
                  this.vector = v.scaleTo(8);
               }
               break;
         }
      },
      
      /**
       * Enemy rendering method
       * 
       * @param ctx {object} Canvas rendering context
       * @param world {object} World metadata
       */
      onRender: function onRender(ctx, world)
      {
         ctx.save();
         if (this.worldToScreen(ctx, world, this.radius))
         {
            // render 3D sprite
            if (!this.hit)
            {
               ctx.shadowColor = this.colorRGB;
            }
            else
            {
               // override colour with plain white for "hit" effect
               ctx.shadowColor = "white";
               var oldColor = this.k3dObject.color;
               this.k3dObject.color = [255,255,255];
               this.k3dObject.shademode = "plain";
            }
            // TODO: replace this with anim state machine test...
            // TODO: adjust RADIUS for collision etc. during spawn!
            if (this.aliveTime < this.SPAWN_LENGTH)
            {
               // nifty scaling effect as an enemy spawns into position
               var scale = 1 - (this.SPAWN_LENGTH - this.aliveTime) / this.SPAWN_LENGTH;
               if (scale <= 0) scale = 0.01;
               else if (scale > 1) scale = 1;
               ctx.scale(scale, scale);
            }
            this.renderK3D(ctx);
            if (this.hit)
            {
               // restore colour and depthcue rendering mode
               this.k3dObject.color = oldColor;
               this.k3dObject.shademode = "depthcue";
               this.hit = false;
            }
         }
         ctx.restore();
      },
      
      damageBy: function damageBy(force)
      {
         // record hit - will change enemy colour for a single frame
         this.hit = true;
         if (force === -1 || (this.health -= force) <= 0)
         {
            this.alive = false;
         }
         return !this.alive;
      },
      
      onDestroyed: function onDestroyed(scene, player)
      {
         if (this.type === 5)
         {
            // Splitter enemy divides into two smaller ones
            var enemy = new Arena.EnemyShip(scene, 99);
            // update position and vector
            // TODO: move this as option in constructor
            enemy.vector = this.vector.nrotate(PIO2);
            enemy.position = this.position.nadd(enemy.vector);
            scene.enemies.push(enemy);
            
            enemy = new Arena.EnemyShip(scene, 99);
            enemy.vector = this.vector.nrotate(-PIO2);
            enemy.position = this.position.nadd(enemy.vector);
            scene.enemies.push(enemy);
         }
      }
   });
})();
