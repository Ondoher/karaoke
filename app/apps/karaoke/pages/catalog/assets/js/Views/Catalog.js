var TRACK_LIST = 0;
var SEARCH = 'SEARCH';
var RESUME = 'RESUME';
var QUEUE = 'QUEUE';
var ABOUT = 'ABOUT';

Package('Karaoke.Views', {
	Catalog : new Class({
		Extends : Sapphire.View,

		initialize : function()
		{
			this.parent();
			this.selected = 0;
			this.songs = [];
			this.searchMap = {};
			this.focused = TRACK_LIST;
			this.root = $('#catalog-page');
			this.haveQueue = false;

//			$('.catalog-container').nanoScroller({ alwaysVisible: true });

			this.listener = KARAOKE.input.listen('inputDown', this.onInputDown.bind(this));
			this.container = $('#catalog-list');
//			this.container.on('scrollstop', this.onScrolled.bind(this));

			this.tvCanvas = $('#tv-canvas')[0];
			this.tvContext = this.tvCanvas.getContext('2d'),

			this.previewCanvas = $('#preview-canvas')[0];
			this.previewContext = this.previewCanvas.getContext('2d'),

			this.tickInterval =setInterval(this.onTick.bind(this), 10);
			this.setupStatic();
			this.cdgPlaying = false;
			this.lastInput = Date.now();
			this.paused = false;
			this.focused = TRACK_LIST;
			this.searchInput = this.root.find('#search-catalog');
			this.searchInput.on('input', this.onSearchFilter.bind(this));
		},

		renderStatic : function()
		{
			$('#preview-canvas').hide();

			this.tvContext.putImageData(this.samples[Math.floor(this.sampleIndex)], 0, 0);

			this.sampleIndex += 30 / this.FPS; // 1/FPS == 1 second
			if (this.sampleIndex >= this.samples.length) this.sampleIndex = 0;

			var grd = this.tvContext.createLinearGradient(0, this.scanOffsetY, 0, this.scanSize + this.scanOffsetY);

			grd.addColorStop(0, 'rgba(255,255,255,0)');
			grd.addColorStop(0.1, 'rgba(255,255,255,0)');
			grd.addColorStop(0.2, 'rgba(255,255,255,0.2)');
			grd.addColorStop(0.3, 'rgba(255,255,255,0.0)');
			grd.addColorStop(0.45, 'rgba(255,255,255,0.1)');
			grd.addColorStop(0.5, 'rgba(255,255,255,1.0)');
			grd.addColorStop(0.55, 'rgba(255,255,255,0.55)');
			grd.addColorStop(0.6, 'rgba(255,255,255,0.25)');
			//grd.addColorStop(0.8, 'rgba(255,255,255,0.15)');
			grd.addColorStop(1, 'rgba(255,255,255,0)');

			this.tvContext.fillStyle = grd;
			this.tvContext.fillRect(0, this.scanOffsetY, this.tvCanvas.width, this.scanSize + this.scanOffsetY);
			this.tvContext.globalCompositeOperation = "lighter";

			this.scanOffsetY += (this.tvCanvas.height / this.scanSpeed);
			if(this.scanOffsetY > this.tvCanvas.height) this.scanOffsetY = -(this.scanSize / 2);
		},

		setupStatic : function()
		{
			function interpolate(x, x0, y0, x1, y1) {
				return y0 + (y1 - y0)*((x - x0)/(x1 - x0));
			}

			function generateRandomSample(context, w, h) {
				var intensity = [];
				var random = 0;
				var factor = h / 50;

				var intensityCurve = [];
				for(var i = 0; i < Math.floor(h / factor) + factor; i++)
					intensityCurve.push(Math.floor(Math.random() * 15));

				for(var i = 0; i < h; i++) {
					var value = interpolate((i/factor), Math.floor(i / factor), intensityCurve[Math.floor(i / factor)], Math.floor(i / factor) + 1, intensityCurve[Math.floor(i / factor) + 1]);
					intensity.push(value);
				}

				var imageData = context.createImageData(w, h);
				for(var i = 0; i < (w * h); i++) {
					var k = i * 4;
					var color = Math.floor(36 * Math.random());
					// Optional: add an intensity curve to try to simulate scan lines
					color += intensity[Math.floor(i / w)];
					imageData.data[k] = imageData.data[k + 1] = imageData.data[k + 2] = color;
					imageData.data[k + 3] = 255;
				}
				return imageData;
			}

			this.samples = [],
			this.scaleFactor = 2.5; // Noise size
			this.sampleIndex = 0;
			this.scanOffsetY = 0;
			this.scanSize = 0;
			this.FPS = 50;
			this.scanSpeed = this.FPS * 15; // 15 seconds from top to bottom
			this.SAMPLE_COUNT = 10;
			this.showStatic = true;

			this.tvCanvas.width = this.tvCanvas.offsetWidth / this.scaleFactor;
			this.tvCanvas.height = this.tvCanvas.width / (this.tvCanvas.offsetWidth / this.tvCanvas.offsetHeight);
			this.scanSize = (this.tvCanvas.offsetHeight / this.scaleFactor) / 3;
			this.samples = []
			for (var i = 0; i < this.SAMPLE_COUNT; i++)
				this.samples.push(generateRandomSample(this.tvContext, this.tvCanvas.width, this.tvCanvas.height));
		},

		startCdg : function()
		{
			if (!this.songs || this.songsLength <= this.selected) return;
			var selected = this.songs[this.searchMap[this.selected]];
			this.cdgStarted = Date.now();
			this.cdgPlaying = true;
			var name = selected.name;
			var path = selected.path;
			this.cdg = newCdg(path, name);
			console.log('CdgCanvas', CdgCanvas);
			this.cdgCanvas = newCdgCanvas(this.cdg, this.previewCanvas);
			this.cdgCanvas.start();
			$('#preview-canvas').hide();
			$('#tv-canvas').hide();
		},

		stopCdg : function()
		{
			this.cdgPlaying = false;
			$('#tv-canvas').show();
		},

		renderCdg : function()
		{
			$('#preview-canvas').show();
			var now = Date.now();
			var timeOffset = now - this.cdgStarted;
			timeOffset = timeOffset * 8;
			var drew = this.cdgCanvas.updateSurface(timeOffset);
			if (!drew) this.startCdg();
		},

		pause : function()
		{
			this.paused = true;
			clearInterval(this.tickInterval);
			KARAOKE.input.remove('inputDown', this.listener);
		},

		resume : function()
		{
			this.focused = TRACK_LIST;
			this.listener = KARAOKE.input.listen('inputDown', this.onInputDown.bind(this));
			this.tickInterval = setInterval(this.onTick.bind(this), 10);
			this.paused = false;
		},

		setHaveQueue : function(on)
		{
			this.haveQueue = on;

			if (on) this.root.addClass('have-queue');
			else this.root.removeClass('have-queue');
		},

		onTick : function()
		{
			if (this.paused) return;
			var now = Date.now();
			if (this.songsLength === 0 && this.cdgPlaying) this.stopCdg()
			else if (this.songsLength === 0) this.renderStatic();
			else if (!this.cdgPlaying && now - this.lastInput > 2000) this.startCdg();
			else if (this.cdgPlaying &&	 now - this.lastInput < 2000) this.stopCdg();
			else if (this.cdgPlaying) this.renderCdg();
			else this.renderStatic();
		},

		draw : function(songs)
		{
			this.paused = false;
			songs.sort(function(s1, s2)
			{
				return s1.name.toLowerCase().localeCompare(s2.name.toLowerCase());
			});

			this.container.empty();
			this.songs = songs;
			var template;
			this.songsLength = songs.length;

			songs.each(function(song, index)
			{
				template = SAPPHIRE.templates.get('song-template');
				template.find('#song-name').text(song.name);
				template.attr('id', 'song-' + index);
				song.selector = template;

				this.container.append(template);
				this.searchMap[index] = index;
			}, this);

			if (songs.length)
			{
				setTimeout(function()
				{
					this.selected = 0;
					this.top = 0;
					var container = $('.catalog-content')
					var height = container.height();
					this.oneHeight = template.outerHeight();
					this.top = 0;
					this.itemsFit = Math.floor(height / this.oneHeight);
					this.drawSelected();
					this.doScroll();
					this.drawFocus();
				}.bind(this), 1);
				this.noContent(false);
			}
			else
			{
				this.noContent(true);
			}
		},

		busy : function(on)
		{
			if (on) $('#catalog-page').addClass('busy');
			else $('#catalog-page').removeClass('busy');
		},

		noContent : function(on)
		{
			if (on) $('#catalog-page').addClass('no-content');
			else $('#catalog-page').removeClass('no-content');
		},

		drawSelected : function()
		{
			$('.song-item').removeClass('selected');
			$('#song-' + this.selected).addClass('selected');
		},

		doScroll : function()
		{
			if (this.container.scrollTop() !== this.top * this.oneHeight)
			{
				this.container.scrollTop(this.top * this.oneHeight);
			}
		},

		drawFocus : function()
		{
			this.root.find('.can-focus').removeClass('focused');
			this.root.find('.focus-id-' + this.focused).addClass('focused');

			if (this.focused === SEARCH) this.root.find('#search-catalog').focus();
			else this.root.find('#search-catalog').blur();
		},

		checkScroll : function()
		{
			if (this.selected >= this.top + this.itemsFit)
			{
				this.top = this.selected - this.itemsFit / 2;
				this.top = Math.max(this.top, 0);

				this.doScroll();
			}
			else if (this.selected < this.top)
			{
				this.top = this.selected - this.itemsFit / 2;
				this.top = Math.max(this.top, 0);

				this.doScroll();
			}
		},

		up :function()
		{
			this.selected--;
			this.selected = Math.max(this.selected, 0);
			this.drawSelected();
			this.checkScroll();
		},

		down : function()
		{
			this.selected++;
			this.selected = Math.min(this.songsLength - 1, this.selected);
			this.drawSelected();
			this.checkScroll();
		},

		pageUp : function()
		{
			this.top -= this.itemsFit;
			this.top = Math.max(0, this.top);
			this.selected -= this.itemsFit;
			this.selected = Math.max(0, this.selected);
			this.drawSelected();
			this.doScroll();
		},

		pageDown : function()
		{
			this.top += this.itemsFit;
			this.top = Math.min(this.songsLength - this.itemsFit, this.top);
			this.selected += this.itemsFit;
			this.selected = Math.min(this.songsLength - 1, this.selected);
			this.drawSelected();
			this.doScroll();
		},

		onScrolled : function()
		{
			var scrollTop = this.container.scrollTop();
			var top = Math.floor(Math.round(scrollTop / this.oneHeight));
			if (this.selected < top) this.selected = top;
			else if (this.selected > top + this.itemsFit) this.selected = top + this.itemsFit / 2;

			if (top === this.top) return;

			this.top = top;
			this.drawSelected();
			this.doScroll();
		},

		handleTrackListInput : function(action)
		{
			this.lastInput = Date.now();
			switch(action)
			{
				case 'up':
					this.up();
					break;
				case 'down':
					this.down();
					break;
				case 'left':
					this.focused = SEARCH;
					this.drawFocus();
					break;
				case 'right':
					break;
				case 'enter':
				case 'select':
					this.fire('songSelect', this.songs[this.searchMap[this.selected]]);
					break;
				case 'menu':
					break;
				case 'page-up':
					this.pageUp();
					break;
				case 'page-down':
					this.pageDown();
					break;
				default:
					break;
			}
		},

		handleTabsInput : function(action)
		{
			var down = {};
			down[SEARCH] = RESUME;
			down[RESUME] = QUEUE;
			down[QUEUE] = ABOUT;
			down[ABOUT] = SEARCH;

			var up = {};
			up[SEARCH] = ABOUT;
			up[RESUME] = SEARCH;
			up[QUEUE] = RESUME;
			up[ABOUT] = QUEUE;

			if (!this.haveQueue)
			{
				down[SEARCH] = ABOUT;
				up[ABOUT] = SEARCH;
			}

			var event = {
				RESUME: 'resume',
				QUEUE: 'queue',
				ABOUT: 'about',
			}


			switch (action)
			{
				case 'up':
					this.focused = up[this.focused];
					this.drawFocus();
					break;
				case 'down':
					this.focused = down[this.focused];
					this.drawFocus();
					break;
				case 'right':
					if (this.songsLength !== 0)
					{
						this.focused = TRACK_LIST;
						this.drawFocus();
					}
				case 'enter':
				case 'select':
					if (this.focused !== SEARCH)
					{
						var evt = event[this.focused];
						if (evt) this.fire(evt);
					}
					break;
			}
		},

		onInputDown : function(input)
		{
			var action = input.action;
			var data = input.data;
			if (this.focused === TRACK_LIST) this.handleTrackListInput(action);
			else this.handleTabsInput(action);
		},

		onSearchFilter : function()
		{
			var search = this.searchInput.val().toLowerCase().replace(/\W/g, '');
			this.container.find('.song-item').detach();
			var idx = 0;
			this.songs.each(function(song, index) {
				var songSearch = song.name.toLowerCase().replace(/\W/g, '');

				if (search === '' || songSearch.indexOf(search) !== -1) {
					song.selector.attr('id', 'song-' + idx);
					this.container.append(song.selector);
					this.searchMap[idx] = index;
					idx++;
				}
			}, this);

			this.songsLength = idx;
			this.noContent(this.songsLength === 0);

			this.selected = 0;
			this.top = 0;
			var height = this.container.height();
			this.top = 0;
			this.itemsFit = Math.floor(height / this.oneHeight);
			this.drawSelected();
			this.doScroll();
			this.drawFocus();
			this.stopCdg()
			this.lastInput = Date.now();
		}
	})
});
