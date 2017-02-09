Package('Karaoke.Navigate', {
	Keyboard : new Class({
		Extends : Sapphire.Eventer,

		initialize : function()
		{
			this.parent();

			SAPPHIRE.application.listen('ready', this.onReady.bind(this));
		},

		onReady : function()
		{
			$(document).keydown(this.onKeyDown.bind(this));
		},

		onKeyDown : function(e)
		{
			var focused = $(':focus');
			var action = '';
			this.fire('activate');
			switch (e.which)
			{
				case 9:  //tab, swallow!
					e.preventDefault();
					break;

				case 8:  // backspace
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA') return;
					e.preventDefault();
					action = 'back';
					break;
				case 108:
				case 13: // enter
					action = 'select';
					break;
				case 27:  // escape
					action = 'back';
					break;
				case 67:  // 'c'
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA') return;
					action = 'cheer';
					break;
				case 33:  // page up
					action = 'page-up';
					break;
				case 34:  // page down
					action = 'page-down';
					break;
				case 100:
				case 37:
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA')
					{
						var cursor = focused.getCursorPosition();
						if (cursor > 0) return;
					}
					action = 'left';
					break;
				case 104:
				case 38:
					action = 'up';
					break;
				case 102:
				case 39:
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA')
					{
						var cursor = focused.getCursorPosition();

						if (cursor < focused.val().length) return;
					}
					action = 'right';
					break;
				case 98:
				case 40:
					action = 'down';
					break;
				case 73:
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA') return;
					action = 'i';
					break;
				case 79:
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA') return;
					action = 'menu';
					break;
				case 80:
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA') return;
					action = 'p';
					break;
				default:
					return;
			}

			this.fire('action-down', action);

			e.preventDefault();
		},

		onKeyUp : function(e)
		{
			var focused = $(':focus');
			var action = '';

			this.fire('activate');
			switch (e.which)
			{
				case 104:
				case 38:
					action = 'up';
					break;
				case 98:
				case 40:
					action = 'down';
					break;
				default:
					return;
			}
			this.fire('action-up', action);
			e.preventDefault();
		}
	})
});

KARAOKE.input.registerInputDevice('keyboard-input', new Karaoke.Navigate.Keyboard());
