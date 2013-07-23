/**
 * Feature test scenes for CanvasMark Rendering Benchmark - March 2013
 *  
 * (C) 2013 Kevin Roast kevtoast@yahoo.com @kevinroast
 * 
 * Please see: license.txt
 * You are welcome to use this code, but I would appreciate an email or tweet
 * if you do anything interesting with it!
 */


/**
 * Feature root namespace.
 * 
 * @namespace Feature
 */
if (typeof Feature == "undefined" || !Feature)
{
   var Feature = {};
}

Feature.textureImage = new Image();
Feature.blurImage = new Image();

/**
 * Feature main Benchmark Test class.
 * 
 * @namespace Feature
 * @class Feature.Test
 */
(function()
{
   Feature.Test = function(benchmark, loader)
   {
      loader.addImage(Feature.textureImage, "./images/texture5.png");
      loader.addImage(Feature.blurImage, "./images/fruit.jpg");

      // add benchmark scenes
      var t = benchmark.scenes.length;
      for (var i=0; i<3; i++)
      {
         benchmark.addBenchmarkScene(new Feature.GameScene(this, t+i, i));
      }
   };
   
   Feature.Test.prototype =
   {
   };
})();


(function()
{
   /**
    * Feature.K3DController constructor
    */
   Feature.K3DController = function()
   {
      Feature.K3DController.superclass.constructor.call(this);
   };
   
   extend(Feature.K3DController, K3D.BaseController,
   {
      /**
       * Render tick - should be called from appropriate scene renderer
       */
      render: function(ctx)
      {
         // execute super class method to process render pipelines
         ctx.save();
         ctx.translate(GameHandler.width/2, GameHandler.height/2);
         this.processFrame(ctx);
         ctx.restore();
      }
   });
})();


/**
 * Feature Game scene class.
 * 
 * @namespace Feature
 * @class Feature.GameScene
 */
(function()
{
   Feature.GameScene = function(game, test, feature)
   {
      this.game = game;
      this.test = test;
      this.feature = feature;
      
      var msg = "Test " + test + " - ";
      switch (feature)
      {
         case 0: msg += "Plasma - Maths, canvas shapes"; break;
         case 1: msg += "3D Rendering - Maths, polygons, image transforms"; break;
         case 2: msg += "Pixel blur - Math, getImageData, putImageData"; break;
      }
      var interval = new Game.Interval(msg, this.intervalRenderer);
      Feature.GameScene.superclass.constructor.call(this, true, interval);
   };
   
   extend(Feature.GameScene, Game.Scene,
   {
      feature: 0,
      index: 0,
      game: null,
      
      /**
       * Scene init event handler
       */
      onInitScene: function onInitScene()
      {
         switch (this.feature)
         {
            case 0:
            {
               // generate plasma palette
               var palette = [];
               for (var i=0,r,g,b; i<256; i++)
               {
                  r = ~~(128 + 128 * Math.sin(Math.PI * i / 32));
                  g = ~~(128 + 128 * Math.sin(Math.PI * i / 64));
                  b = ~~(128 + 128 * Math.sin(Math.PI * i / 128));
                  palette[i] = "rgb(" + ~~r + "," + ~~g + "," + ~~b + ")";
               }
               this.paletteoffset = 0;
               this.palette = palette;
               
               // size of the plasma pixels ratio - bigger = more calculations and rendering
               this.plasmasize = 8;
               
               this.testScore = 10;
               
               break;
            }
            
            case 1:
            {
               // K3D controller
               this.k3d = new Feature.K3DController();
               // generate 3D objects
               for (var i=0; i<10; i++)
               {
                  this.add3DObject(i);
               }
               
               this.testScore = 10;
               
               break;
            }
            
            case 2:
            {
               this.testScore = 25;
               break;
            }
         }
      },

      add3DObject: function add3DObject(offset)
      {
         var gap = 360/20;
         var obj = new K3D.K3DObject();
         obj.ophi = (360 / gap) * offset;
         obj.otheta = (180 / gap / 2) * offset;
         obj.textures.push(Feature.textureImage);
         with (obj)
         {
            drawmode = "solid";     // one of "point", "wireframe", "solid"
            shademode = "lightsource";    // one of "plain", "depthcue", "lightsource" (solid drawing mode only)
            addgamma = 0.5; addtheta = -1.0; addphi = -0.75;
            aboutx = 150; abouty = -150; aboutz = -50;
            perslevel = 512;
            scale = 13;
            init(
               // describe the points of a simple unit cube
               [{x:-1,y:1,z:-1}, {x:1,y:1,z:-1}, {x:1,y:-1,z:-1}, {x:-1,y:-1,z:-1}, {x:-1,y:1,z:1}, {x:1,y:1,z:1}, {x:1,y:-1,z:1}, {x:-1,y:-1,z:1}],
               // describe the edges of the cube
               [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
               // describe the polygon faces of the cube
               [{color:[255,0,0],vertices:[0,1,2,3],texture:0},{color:[0,255,0],vertices:[0,4,5,1]},{color:[0,0,255],vertices:[1,5,6,2]},{color:[255,255,0],vertices:[2,6,7,3]},{color:[0,255,255],vertices:[3,7,4,0]},{color:[255,0,255],vertices:[7,6,5,4],texture:0}]
            );
         }
         // add another 3D object to the controller
         this.k3d.addK3DObject(obj);
      },
      
      /**
       * Scene before rendering event handler
       */
      onBeforeRenderScene: function onBeforeRenderScene(benchmark)
      {
         if (benchmark)
         {
            switch (this.feature)
            {
               case 0:
               {
                  if (Date.now() - this.sceneStartTime > this.testState)
                  {
                     this.testState+=100;
                     this.plasmasize++;
                  }
                  break;
               }
               case 1:
               {
                  if (Date.now() - this.sceneStartTime > this.testState)
                  {
                     this.testState+=100;
                     this.add3DObject(this.k3d.objects.length);
                  }
                  break;
               }
               case 2:
               {
                  if (Date.now() - this.sceneStartTime > this.testState)
                  {
                     this.testState+=2;
                  }
                  break;
               }
            }
         }
      },
      
      /**
       * Scene rendering event handler
       */
      onRenderScene: function onRenderScene(ctx)
      {
         ctx.clearRect(0, 0, GameHandler.width, GameHandler.height);
         
         // render feature benchmark
         var width = GameHandler.width, height = GameHandler.height;
         switch (this.feature)
         {
            case 0:
            {
               var dist = function dist(a, b, c, d)
               {
                  return Math.sqrt((a - c) * (a - c) + (b - d) * (b - d));
               }
               
               // plasma source width and height - variable benchmark state
               var pwidth = this.plasmasize;
               var pheight = pwidth * (height/width);
               // scale the plasma source to the canvas width/height
               var vpx = width/pwidth, vpy = height/pheight;
               var time = Date.now() / 64;
               
               var colour = function colour(x, y)
               {
                  // plasma function
                  return (128 + (128 * Math.sin(x * 0.0625)) +
                          128 + (128 * Math.sin(y * 0.03125)) +
                          128 + (128 * Math.sin(dist(x + time, y - time, width, height) * 0.125)) +
                          128 + (128 * Math.sin(Math.sqrt(x * x + y * y) * 0.125)) ) * 0.25;
               }
               
               // render plasma effect
               for (var y=0,x; y<pheight; y++)
               {
                  for (x=0; x<pwidth; x++)
                  {
                     // map plasma pixels to canvas pixels using the virtual pixel size
                     ctx.fillStyle = this.palette[~~(colour(x, y) + this.paletteoffset) % 256];
                     ctx.fillRect(Math.floor(x * vpx), Math.floor(y * vpy), Math.ceil(vpx), Math.ceil(vpy));
                  }
               }
               
               // palette cycle speed
               this.paletteoffset++;
               break;
            }
            
            case 1:
            {
               this.k3d.render(ctx);
               break;
            }

            case 2:
            {
               //
               // TODO: add more interesting image!
               //
               var s = this.testState < GameHandler.width ? this.testState : GameHandler.width;
               ctx.drawImage(Feature.blurImage, 0, 0, GameHandler.width, GameHandler.height);
               boxBlurCanvasRGBA( ctx, 0, 0, s, s, s >> 4 + 1, 1 );
               break;
            }
         }
         
         ctx.save();
         ctx.shadowBlur = 0;
         // Benchmark - information output
         if (this.sceneCompletedTime)
         {
            Game.fillText(ctx, "TEST "+this.test+" COMPLETED: "+this.getTransientTestScore(), "20pt Courier New", 4, 40, "white");
         }
         Game.fillText(ctx, "SCORE: " + this.getTransientTestScore(), "12pt Courier New", 0, GameHandler.height - 42, "lightblue");
         Game.fillText(ctx, "TSF: " + Math.round(GameHandler.frametime) + "ms", "12pt Courier New", 0, GameHandler.height - 22, "lightblue");
         Game.fillText(ctx, "FPS: " + GameHandler.lastfps, "12pt Courier New", 0, GameHandler.height - 2, "lightblue");
         ctx.restore();
      }
   });
})();

/*
Superfast Blur - a fast Box Blur For Canvas

Version:    0.5
Author:     Mario Klingemann
Contact:    mario@quasimondo.com
Website: http://www.quasimondo.com/BoxBlurForCanvas
Twitter: @quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr:
https://flattr.com/thing/140066/Superfast-Blur-a-pretty-fast-Box-Blur-Effect-for-CanvasJavascript

Copyright (c) 2011 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
var mul_table = [ 1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1];

var shg_table = [0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];

function boxBlurCanvasRGBA( context, top_x, top_y, width, height, radius, iterations ){
   radius |= 0;
   
   var imageData = context.getImageData( top_x, top_y, width, height );
   var pixels = imageData.data;
   
   var rsum,gsum,bsum,asum,x,y,i,p,p1,p2,yp,yi,yw,idx,pa;      
   var wm = width - 1;
   var hm = height - 1;
   var wh = width * height;
   var rad1 = radius + 1;
    
   var mul_sum = mul_table[radius];
   var shg_sum = shg_table[radius];

   var r = [];
   var g = [];
   var b = [];
   var a = [];
   
   var vmin = [];
   var vmax = [];
  
   while ( iterations-- > 0 ){
      yw = yi = 0;
    
      for ( y=0; y < height; y++ ){
         rsum = pixels[yw]   * rad1;
         gsum = pixels[yw+1] * rad1;
         bsum = pixels[yw+2] * rad1;
         asum = pixels[yw+3] * rad1;
         
         for( i = 1; i <= radius; i++ ){
            p = yw + (((i > wm ? wm : i )) << 2 );
            rsum += pixels[p++];
            gsum += pixels[p++];
            bsum += pixels[p++];
            asum += pixels[p]
         }
         
         for ( x = 0; x < width; x++ ) {
            r[yi] = rsum;
            g[yi] = gsum;
            b[yi] = bsum;
            a[yi] = asum;

            if( y==0) {
               vmin[x] = ( ( p = x + rad1) < wm ? p : wm ) << 2;
               vmax[x] = ( ( p = x - radius) > 0 ? p << 2 : 0 );
            } 
            
            p1 = yw + vmin[x];
            p2 = yw + vmax[x];
              
            rsum += pixels[p1++] - pixels[p2++];
            gsum += pixels[p1++] - pixels[p2++];
            bsum += pixels[p1++] - pixels[p2++];
            asum += pixels[p1]   - pixels[p2];
                
            yi++;
         }
         yw += ( width << 2 );
      }
     
      for ( x = 0; x < width; x++ ) {
         yp = x;
         rsum = r[yp] * rad1;
         gsum = g[yp] * rad1;
         bsum = b[yp] * rad1;
         asum = a[yp] * rad1;
         
         for( i = 1; i <= radius; i++ ) {
           yp += ( i > hm ? 0 : width );
           rsum += r[yp];
           gsum += g[yp];
           bsum += b[yp];
           asum += a[yp];
         }
         
         yi = x << 2;
         for ( y = 0; y < height; y++) {
            
            pixels[yi+3] = pa = (asum * mul_sum) >>> shg_sum;
            if ( pa > 0 )
            {
               pa = 255 / pa;
               pixels[yi]   = ((rsum * mul_sum) >>> shg_sum) * pa;
               pixels[yi+1] = ((gsum * mul_sum) >>> shg_sum) * pa;
               pixels[yi+2] = ((bsum * mul_sum) >>> shg_sum) * pa;
            } else {
               pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
            }           
            if( x == 0 ) {
               vmin[y] = ( ( p = y + rad1) < hm ? p : hm ) * width;
               vmax[y] = ( ( p = y - radius) > 0 ? p * width : 0 );
            } 
           
            p1 = x + vmin[y];
            p2 = x + vmax[y];

            rsum += r[p1] - r[p2];
            gsum += g[p1] - g[p2];
            bsum += b[p1] - b[p2];
            asum += a[p1] - a[p2];

            yi += width << 2;
         }
      }
   }
   
   context.putImageData( imageData, top_x, top_y );
}