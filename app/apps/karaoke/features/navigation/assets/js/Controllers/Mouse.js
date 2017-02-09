Package('Gsp.Navigate', {
	Mouse : new Class({
		Extends : Sapphire.Eventer,

		initialize : function()
		{
			this.parent();

			// Store out last cursor position. This will help us determine if the user
			// actually intended to move the mouse, or if the browser is sending
			// faulty "mouse move" events when scrolling in the grid via keyboard.
			this.lastPos = {
				x: 0,
				y: 0
			};

			SAPPHIRE.application.listen('ready', this.onReady.bind(this));
		},

		onReady : function()
		{
			$(document).mousemove(this.onMouseMove.bind(this));
			GSP.navigation.listen('grid-setup', this.onGridSetup.bind(this));
		},

		onGridSetup : function(root)
		{
			root.find('.navigable').each(function(idx, el)
			{
				var selector = $(el);
				if (selector.is(':hidden')) return;

				selector.unbind('mouseenter');
				selector.mouseenter(this.onMouseEnter.bind(this, selector));
			}.bind(this));
		},

		onMouseEnter : function(selector)
		{
			this.fire('action-down', 'enter', selector);
		},

		onMouseMove : function(e)
		{
			e.preventDefault();

			var currPos = {
				x: e.clientX + document.body.scrollLeft,
				y: e.clientY + document.body.scrollTop
			};

			if(this.lastPos.x != currPos.x && this.lastPos.y != currPos.y)
			{
				this.lastPos = currPos;
				this.fire('activate');
			}
		}
	})
});

GSP.input.registerInputDevice('mouse-input', new Gsp.Navigate.Mouse());
