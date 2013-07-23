/**
 * Particle emitter effect actor class.
 * 
 * A simple particle emitter, that does not recycle particles, but sets itself as expired() once
 * all child particles have expired.
 * 
 * Requires a function known as the emitter that is called per particle generated.
 * 
 * @namespace Arena
 * @class Arena.Particles
 */
(function()
{
   /**
    * Constructor
    * 
    * @param p {Vector} Emitter position
    * @param v {Vector} Emitter velocity
    * @param count {Integer} Number of particles
    * @param fnEmitter {Function} Emitter function to call per particle generated
    */
   Arena.Particles = function(p, v, count, fnEmitter)
   {
      Arena.Particles.superclass.constructor.call(this, p, v);
      
      // generate particles based on the supplied emitter function
      this.particles = new Array(count);
      for (var i=0; i<count; i++)
      {
         this.particles[i] = fnEmitter.call(this, i);
      }
      
      return this;
   };
   
   extend(Arena.Particles, Game.Actor,
   {
      particles: null,
      
      /**
       * Particle effect rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx, world)
      {
         ctx.save();
         ctx.shadowBlur = 0;
         ctx.globalCompositeOperation = "lighter";
         for (var i=0, particle, viewposition; i<this.particles.length; i++)
         {
            particle = this.particles[i];
            
            // update particle and test for lifespan
            if (particle.update())
            {
               viewposition = Game.worldToScreen(particle.position, world, particle.size);
               if (viewposition)
               {
                  ctx.save();
                  ctx.translate(viewposition.x, viewposition.y);
                  ctx.scale(world.scale, world.scale);
                  particle.render(ctx);
                  ctx.restore();
               }
            }
            else
            {
               // particle no longer alive, remove from list
               this.particles.splice(i, 1);
            }
         }
         ctx.restore();
      },
      
      expired: function expired()
      {
         return (this.particles.length === 0);
      }
   });
})();


/**
 * Default Arena Particle structure.
 * Currently supports three particle types; dot, line and smudge.
 */
function ArenaParticle(position, vector, size, type, lifespan, fadelength, colour)
{
   this.position = position;
   this.vector = vector;
   this.size = size;
   this.type = type;
   this.lifespan = lifespan;
   this.fadelength = fadelength;
   this.colour = colour ? colour : "rgb(255,125,50)"; // default colour if none set
   // randomize rotation speed and angle for line particle
   if (type === 1)
   {
      this.rotate = Rnd() * TWOPI;
      this.rotationv = Rnd() - 0.5;
   }
   
   this.update = function()
   {
      this.position.add(this.vector);
      return (--this.lifespan !== 0);
   };
   
   this.render = function(ctx)
   {
  	   // NOTE: the try/catch here is to handle where FireFox gets
  	   //       upset when rendering images outside the canvas area
      try
	  	{
         ctx.globalAlpha = (this.lifespan < this.fadelength ? ((1 / this.fadelength) * this.lifespan) : 1);
         switch (this.type)
         {
            case 0:  // point (prerendered image)
               // prerendered images for each enemy colour with health > 1
               // lookup based on particle colour e.g. points_rgb(x,y,z)
               ctx.drawImage(
                  GameHandler.prerenderer.images["points_" + this.colour][this.size], 0, 0);
               break;
            case 1:  // line
               var s = this.size;
               ctx.rotate(this.rotate);
               this.rotate += this.rotationv;
               // specific line colour - for enemy explosion pieces
               ctx.strokeStyle = this.colour;
               ctx.lineWidth = 2.0;
               ctx.beginPath();
               ctx.moveTo(-s, -s);
               ctx.lineTo(s, s);
               ctx.closePath();
               ctx.stroke();
               break;
            case 2:  // smudge (prerendered image)
      		  	ctx.drawImage(GameHandler.prerenderer.images["smudges"][this.size - 4], 0, 0);
      		  	break;
         }
      }
      catch (error)
      {
         if (console !== undefined) console.log(error.message);
      }
   };
}


/**
 * Enemy explosion - Particle effect actor class.
 * 
 * @namespace Arena
 * @class Arena.EnemyExplosion
 */
(function()
{
   /**
    * Constructor
    */
   Arena.EnemyExplosion = function(p, v, enemy)
   {
      Arena.EnemyExplosion.superclass.constructor.call(this, p, v, 16, function()
         {
            // randomise start position slightly
            var pos = p.clone();
            pos.x += randomInt(-5, 5);
            pos.y += randomInt(-5, 5);
            // randomise radial direction vector - speed and angle, then add parent vector
            switch (randomInt(0, 2))
            {
               case 0:
                  var t = new Vector(0, randomInt(20, 25));
                  t.rotate(Rnd() * TWOPI);
                  t.add(v);
                  return new ArenaParticle(
                     pos, t, ~~(Rnd() * 4), 0, 20, 15);
               case 1:
                  var t = new Vector(0, randomInt(5, 10));
                  t.rotate(Rnd() * TWOPI);
                  t.add(v);
                  // create line particle - size based on enemy type
                  return new ArenaParticle(
                     pos, t, (enemy.type !== 3 ? Rnd() * 5 + 5 : Rnd() * 10 + 10), 1, 20, 15, enemy.colorRGB);
               case 2:
                  var t = new Vector(0, randomInt(2, 4));
                  t.rotate(Rnd() * TWOPI);
                  t.add(v);
                  return new ArenaParticle(
                     pos, t, ~~(Rnd() * 4 + 4), 2, 20, 15);
            }
         });
      
      return this;
   };
   
   extend(Arena.EnemyExplosion, Arena.Particles);
})();


/**
 * Enemy impact effect - Particle effect actor class.
 * Used when an enemy is hit by player bullet but not destroyed.
 * 
 * @namespace Arena
 * @class Arena.EnemyImpact
 */
(function()
{
   /**
    * Constructor
    */
   Arena.EnemyImpact = function(p, v, enemy)
   {
      Arena.EnemyImpact.superclass.constructor.call(this, p, v, 5, function()
         {
            // slightly randomise vector angle - then add parent vector
            var t = new Vector(0, Rnd() < 0.5 ? randomInt(-5, -10) : randomInt(5, 10));
            t.rotate(Rnd() * PIO2 - PIO4);
            t.add(v);
            return new ArenaParticle(
               p.clone(), t, ~~(Rnd() * 4), 0, 15, 10, enemy.colorRGB);
         });
      
      return this;
   };
   
   extend(Arena.EnemyImpact, Arena.Particles);
})();


/**
 * Bullet impact effect - Particle effect actor class.
 * Used when an bullet hits an object and is destroyed.
 * 
 * @namespace Arena
 * @class Arena.BulletImpactEffect
 */
(function()
{
   /**
    * Constructor
    */
   Arena.BulletImpactEffect = function(p, v, enemy)
   {
      Arena.BulletImpactEffect.superclass.constructor.call(this, p, v, 3, function()
         {
            return new ArenaParticle(
               p.clone(), v.nrotate(Rnd()*PIO8), ~~(Rnd() * 4), 0, 15, 10);
         });
      
      return this;
   };
   
   extend(Arena.BulletImpactEffect, Arena.Particles);
})();


/**
 * Player explosion - Particle effect actor class.
 * 
 * @namespace Arena
 * @class Arena.PlayerExplosion
 */
(function()
{
   /**
    * Constructor
    */
   Arena.PlayerExplosion = function(p, v)
   {
      Arena.PlayerExplosion.superclass.constructor.call(this, p, v, 20, function()
         {
            // randomise start position slightly
            var pos = p.clone();
            pos.x += randomInt(-5, 5);
            pos.y += randomInt(-5, 5);
            // randomise radial direction vector - speed and angle, then add parent vector
            switch (randomInt(1,2))
            {
               case 1:
                  var t = new Vector(0, randomInt(5, 8));
                  t.rotate(Rnd() * TWOPI);
                  t.add(v);
                  return new ArenaParticle(
                     pos, t, Rnd() * 5 + 5, 1, 25, 15, "white");
               case 2:
                  var t = new Vector(0, randomInt(5, 10));
                  t.rotate(Rnd() * TWOPI);
                  t.add(v);
                  return new ArenaParticle(
                     pos, t, ~~(Rnd() * 4 + 4), 2, 25, 15);
            }
         });
      
      return this;
   };
   
   extend(Arena.PlayerExplosion, Arena.Particles);
})();


/**
 * Text indicator effect actor class.
 * 
 * @namespace Arena
 * @class Arena.TextIndicator
 */
(function()
{
   Arena.TextIndicator = function(p, v, msg, textSize, colour, fadeLength)
   {
      this.fadeLength = (fadeLength ? fadeLength : this.DEFAULT_FADE_LENGTH);
      Arena.TextIndicator.superclass.constructor.call(this, p, v, this.fadeLength);
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
   
   extend(Arena.TextIndicator, Game.EffectActor,
   {
      DEFAULT_FADE_LENGTH: 16,
      fadeLength: 0,
      textSize: 22,
      msg: null,
      colour: "rgb(255,255,255)",
      
      /**
       * Text indicator effect rendering method
       * 
       * @param ctx {object} Canvas rendering context
       */
      onRender: function onRender(ctx, world)
      {
         ctx.save();
         if (this.worldToScreen(ctx, world, 128))
         {
            var alpha = (1.0 / this.fadeLength) * this.lifespan;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 0;
            Game.fillText(ctx, this.msg, this.textSize + "pt Courier New", 0, 0, this.colour);
         }
         ctx.restore();
      }
   });
})();


/**
 * Score indicator effect actor class.
 * 
 * @namespace Arena
 * @class Arena.ScoreIndicator
 */
(function()
{
   Arena.ScoreIndicator = function(p, v, score, textSize, prefix, colour, fadeLength)
   {
      var msg = score.toString();
      if (prefix)
      {
         msg = prefix + ' ' + msg;
      }
      Arena.ScoreIndicator.superclass.constructor.call(this, p, v, msg, textSize, colour, fadeLength);
      return this;
   };
   
   extend(Arena.ScoreIndicator, Arena.TextIndicator,
   {
   });
})();
