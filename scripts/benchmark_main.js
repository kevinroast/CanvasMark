/**
 * CanvasMark HTML5 Canvas Rendering Benchmark - March 2013
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


window.addEventListener('load', onloadHandler, false);

/**
 * Global window onload handler
 */
var g_splashImg = new Image();
function onloadHandler()
{
   // once the slash screen is loaded, bootstrap the main benchmark class
   g_splashImg.src = 'images/canvasmark2013.jpg';
   g_splashImg.onload = function()
   {
      // init our game with Game.Main derived instance
      GameHandler.init();
      GameHandler.start(new Benchmark.Main());
   };
}


/**
 * Benchmark root namespace.
 * 
 * @namespace Benchmark
 */
if (typeof Benchmark == "undefined" || !Benchmark)
{
   var Benchmark = {};
}


/**
 * Benchmark main class.
 * 
 * @namespace Benchmark
 * @class Benchmark.Main
 */
(function()
{
   Benchmark.Main = function()
   {
      Benchmark.Main.superclass.constructor.call(this);
      
      // create the scenes that are directly part of the Benchmark container
      var infoScene = new Benchmark.InfoScene(this);
      
      // add the info scene - must be added first
      this.scenes.push(infoScene);
      
      // create the Test instances that the benchmark should manage
      // each Test instance will add child scenes to the benchmark
      var loader = new Game.Preloader();
      this.asteroidsTest = new Asteroids.Test(this, loader);
      this.arenaTest = new Arena.Test(this, loader);
      this.featureTest = new Feature.Test(this, loader);
      
      // add benchmark completed scene
      this.scenes.push(new Benchmark.CompletedScene(this));
      
      // the benchmark info scene is displayed first and responsible for allowing the
      // benchmark to start once images required by the game engines have been loaded
      loader.onLoadCallback(function() {
         infoScene.ready();
      });
   };
   
   extend(Benchmark.Main, Game.Main,
   {
      asteroidsTest: null,
      arenaTest: null,
      featureTest: null,
      
      addBenchmarkScene: function addBenchmarkScene(scene)
      {
         this.scenes.push(scene);
      }
   });
})();


/**
 * Benchmark Benchmark Info Scene scene class.
 * 
 * @namespace Benchmark
 * @class Benchmark.InfoScene
 */
(function()
{
   Benchmark.InfoScene = function(game)
   {
      this.game = game;
      
      // allow start via mouse click - also for starting benchmark on touch devices
      var me = this;
      var fMouseDown = function(e)
      {
         if (e.button == 0)
         {
            if (me.imagesLoaded)
            {
               me.start = true;
               return true;
            }
         }
      };
      GameHandler.canvas.addEventListener("mousedown", fMouseDown, false);
      
      Benchmark.InfoScene.superclass.constructor.call(this, false, null);
   };
   
   extend(Benchmark.InfoScene, Game.Scene,
   {
      game: null,
      start: false,
      imagesLoaded: false,
      sceneStarted: null,
      loadingMessage: false,
      
      /**
       * Scene completion polling method
       */
      isComplete: function isComplete()
      {
         return this.start;
      },
      
      onInitScene: function onInitScene()
      {
         this.playable = false;
         this.start = false;
         this.yoff = 1;
      },
      
      onRenderScene: function onRenderScene(ctx)
      {
         ctx.save();
         if (this.imagesLoaded)
         {
            // splash logo image dimensions
            var w = 640, h = 640;
            if (this.yoff < h - 1)
            {
               // liquid fill bg effect
               ctx.drawImage(g_splashImg, 0, 0, w, this.yoff, 0, 0, w, this.yoff);
               ctx.drawImage(g_splashImg, 0, this.yoff, w, 2, 0, this.yoff, w, h-this.yoff);
               this.yoff++;
            }
            else
            {
               var toff = (GameHandler.height/2 + 196), tsize = 40;
               ctx.drawImage(g_splashImg, 0, toff-tsize+12, w, tsize, 0, toff-tsize+12, w, tsize);
               ctx.shadowBlur = 6;
               ctx.shadowColor = "#000";
               // alpha fade bounce in a single tertiary statement using a single counter
               // first 64 values of 128 perform a fade in, for second 64 values, fade out
               ctx.globalAlpha = (this.yoff % 128 < 64) ? ((this.yoff % 64) / 64) : (1 - ((this.yoff % 64) / 64));
               
               Game.centerFillText(ctx, "Click or press SPACE to run CanvasMark", "18pt Helvetica", toff, "#fff");
            }
            this.yoff++;
         }
         else if (!this.loadingMessage)
         {
            Game.centerFillText(ctx, "Please wait... Loading Images...", "18pt Helvetica", GameHandler.height/2, "#eee");
            this.loadingMessage = true;
         }
         ctx.restore();
      },
      
      /**
       * Callback from image preloader when all images are ready
       */
      ready: function ready()
      {
         this.imagesLoaded = true;
         if (location.search === "?auto=true")
         {
            this.start = true;
         }
      },
      
      onKeyDownHandler: function onKeyDownHandler(keyCode)
      {
         switch (keyCode)
         {
            case KEY.SPACE:
            {
               if (this.imagesLoaded)
               {
                  this.start = true;
               }
               return true;
               break;
            }
         }
      }
   });
})();


/**
 * Benchmark CompletedScene scene class.
 * 
 * @namespace Benchmark
 * @class Benchmark.CompletedScene
 */
(function()
{
   Benchmark.CompletedScene = function(game)
   {
      this.game = game;
      
      // construct the interval to represent the Game Over text effect
      var interval = new Game.Interval("CanvasMark Completed!", this.intervalRenderer);
      Benchmark.CompletedScene.superclass.constructor.call(this, false, interval);
   };
   
   extend(Benchmark.CompletedScene, Game.Scene,
   {
      game: null,
      exit: false,
      
      /**
       * Scene init event handler
       */
      onInitScene: function onInitScene()
      {
         this.game.fps = 1;
         this.interval.reset();
         this.exit = false;
      },
      
      /**
       * Scene completion polling method
       */
      isComplete: function isComplete()
      {
         return true;
      },
      
      intervalRenderer: function intervalRenderer(interval, ctx)
      {
         ctx.clearRect(0, 0, GameHandler.width, GameHandler.height);
         var score = GameHandler.benchmarkScoreCount;
         if (interval.framecounter === 0)
         {
            var browser = BrowserDetect.browser + " " + BrowserDetect.version;
            var OS = BrowserDetect.OS;
            
            if (location.search === "?auto=true")
            {
               alert(score);
            }
            else
            {
               // write results to browser
               $("#results").html("<p>CanvasMark Score: " + score + " (" + browser + " on " + OS + ")</p>");
               // tweet this result link
               var tweet = "http://twitter.com/home/?status=" + browser + " (" + OS + ") scored " + score + " in the CanvasMark HTML5 benchmark! Test your browser: http://bit.ly/canvasmark %23javascript %23html5";
               $("#tweetlink").attr('href', tweet.replace(/ /g, "%20"));
               $("#results-wrapper").fadeIn();
            }
         }
         Game.centerFillText(ctx, interval.label, "18pt Helvetica", GameHandler.height/2 - 32, "white");
         Game.centerFillText(ctx, "Benchmark Score: " + score, "14pt Helvetica", GameHandler.height/2, "white");
         
         interval.complete = (this.exit || interval.framecounter++ > 400);
      },
      
      onKeyDownHandler: function onKeyDownHandler(keyCode)
      {
         switch (keyCode)
         {
            case KEY.SPACE:
            {
               this.exit = true;
               return true;
               break;
            }
         }
      }
   });
})();


var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "Unknown Browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "Unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "IE",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
		   string: navigator.userAgent,
		   subString: "iPhone",
		   identity: "iOS"
	   },
	   {
		   string: navigator.userAgent,
		   subString: "iPod",
		   identity: "iOS"
	   },
	   {
		   string: navigator.userAgent,
		   subString: "iPad",
		   identity: "iOS"
	   },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]
};
BrowserDetect.init();