/**
 * The Navigate Input class is in charge of being the central location for
 * delegate input events in the correct locations.
 *
 * It will capture all input events and determine what should happen to it.
 * The default behavior will be fired as an event
 */

Package('Karaoke.Navigate', {
	Input : new Class({
		Extends : Sapphire.Eventer,

		initialize : function()
		{
			this.parent();

			this.inputName = '';
			this.devices = {};
			this.defaultDevice = '';

			// Used to throttle input spam through transitions.
			this.inputQueue = [];
			this.inputQueue.isFrozen = false;
			this.inputQueue.pumper = null;

			// The list of actions that need to be hijacked from the standard input
			// stream.
			this.registeredActions = {};

			SAPPHIRE.application.listen('ready', this.onReady.bind(this));
		},

		onReady : function()
		{
			Object.each(this.devices, function(device, name)
			{
				device.listen('action-down', this.onActionDown.bind(this, name));
				device.listen('action-up', this.onActionUp.bind(this, name));
				device.listen('activate', this.onActivate.bind(this, name));
			}, this);

			this.fire('device-change', this.defaultDevice);
		},

		onActivate : function(name)
		{
			// Save our input device if it was different than the last device.
			if(this.inputName !== name)
			{
				this.inputName = name;
				this.fire('device-change', this.inputName);
			}
		},

		// Called by input devices to set themselves up
		registerInputDevice : function(name, device, defaultDevice)
		{
			defaultDevice = (defaultDevice === undefined) ? false : defaultDevice;
			this.devices[name] = device;
			if (defaultDevice === true) this.defaultdevice = name;
		},

		// On input down events
		onActionDown : function(name, action, data)
		{
		// ignore actions if not from the current device
			if (this.inputName != name) return;

			// At the moment the queue is limited to length 1 to avoid
			// some race conditions. Later can extend this with a more
			// thorough implementation.
			if (this.inputQueue.length > 0)
				return;

			// Stop pumping the queue if new input has come in.
			clearTimeout( this.inputQueue.pumper );
			this.inputQueue.pumper = null;

			this.inputQueue.push( {
				name: name,
				action: action,
				data: data,
				type: 'down'
			} );

			if (!this.inputQueue.isFrozen)
				this.processNextInput();
		},

		// On input up events
		onActionUp : function(name, action, data)
		{
		// ignore actions if not from the current device
			if (this.inputName != name) return;

			// At the moment the queue is limited to length 1 to avoid
			// some race conditions. Later can extend this with a more
			// thorough implementation.
			if (this.inputQueue.length > 0)
				return;

			// Stop pumping the queue if new input has come in.
			clearTimeout( this.inputQueue.pumper );
			this.inputQueue.pumper = null;

			this.inputQueue.push( {
				name: name,
				action: action,
				data: data,
				type: 'up'
			} );

			if (!this.inputQueue.isFrozen)
				this.processNextInput();
		},

		processNextInput : function()
		{
			var input = this.inputQueue.shift();

			if (!input) return;

			// See if we need to run a different routine for our input.
			if(this.registeredActions[input.action])
			{
				var fn = this.registeredActions[input.action];
				if(typeof fn === 'function')
				{
					fn();
				}
			}
			// Run the default behavior for our input.
			else
			{
				if(input.type == 'down')
					this.fire('inputDown', input);
				else
					this.fire('inputUp', input);
			}

			// Pump the queue after it's unfrozen. The time delay is a bit of
			// a kludge but avoids some race conditions. Should revisit this.
			if (this.inputQueue.length && !this.inputQueue.frozen )
			{
				this.inputQueue.pumper = setTimeout( this.processNextInput.bind(this), 250 );
			}
		},


		/**
		 * Call this method to prevent the Input Delegator from delegating events.
		 */
		freezeInput : function()
		{
			this.inputQueue.isFrozen = true;
		},

		/**
		 * Call this method to resume input delegation.
		 */
		thawInput : function()
		{
			this.inputQueue.isFrozen = false;
			this.processNextInput();
		},

		/**
		 * Registers a page, to be ready to hijack the default input path
		 * @param hash of the buttons we want to hijack from the normal input
		 * 	routine.
		 * @return bool TRUE if we successfully registered the actions.
		 */
		registerActions : function(actions)
		{
			if(Object.getLength(actions) < 1)
			{
				return false;
			}

			Object.each(actions, function(action, input) {
				this.registeredActions[input] = action;
			}, this);

			return true;
		},

		unregister : function()
		{
			this.registeredActions.empty();
		}

	})
});

KARAOKE.input = new Karaoke.Navigate.Input();
