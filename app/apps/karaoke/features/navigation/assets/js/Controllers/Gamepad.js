/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http:/ / www.apache.org / licenses / LICENSE - 2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an\ "AS IS\" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mwichary@google.com (Marcin Wichary)
 *
 * Modified by OL2
 * Gamepad is in charge of interpreting/polling input presses.
 */

Package('Gsp.Navigate', {
	Gamepad : new Class({
		Extends : Sapphire.Eventer,

		initialize: function ()
		{
			this.parent();
			SAPPHIRE.application.listen('ready', this.onReady.bind(this));
		},

		onReady : function()
		{
			this.typicalButtonCount = 16;
			this.analogButtonThreshold = 0.8;	// button sensitivity
			this.axisThreshold = 0.7;					// used for analog stick sensitivity

			this.ticking = false;
			this.gamepads = [];
			this.prevRawGamepadTypes = [];
			this.prevTimestamps = [];		// List of timestamps, where index = gamepad id
			this.prevGamepadState = [];

			// We need to throttle the gamepad axis to make it less sensitive to use.
			this.lastThrottleTs = null;
			this.axisThrottleThreshold = 150;
			this.buttonThrottleThreshold = 100;  //ms


			/**
				* The current iteration of the gamepad spec supports 4 axis, with ids 0-3
				*   0: left stick, x-axis
				*   1: left stick, y-axis
				*   2: right stick, x-axis
				*   3: right stick, y-axis
				*/
			this.typical_axis_count = 4;

			var hasGamepadSupport = !! navigator.webkitGetGamepads || !! navigator.webkitGamepads || (navigator.userAgent.indexOf('Firefox/') != -1);
			if (!hasGamepadSupport)
			{
				console.error('Browser does not support the gamepad api.');
			}
			else
			{
				window.addEventListener('MozGamepadConnected', this.onGamepadConnect, false);
				window.addEventListener('MozGamepadDisconnected', this.onGamepadDisconnect, false);

				if ( !! navigator.webkitGamepads || !! navigator.webkitGetGamepads)
				{
					this.startPolling();
				}
			}
		},

		updateGamepads : function(gamepads)
		{
			var padsConnected = false;
			if (gamepads)
			{
				for (var i in gamepads)
				{
					if (gamepads[i])
					{
						padsConnected = true;
					}
				}
			}

			if (padsConnected)
			{
				console.log("[Gamepad] A gamepad has connected");
				this.fire('activate');
			}
			else
			{
				console.log("[Gamepad] No gamepads have connected");
			}
		},

		onGamepadConnect: function (event)
		{
			this.gamepads.push(event.gamepad);
			this.updateGamepads(this.gamepads);
			this.startPolling();
		},

		onGamepadDisconnect: function (event)
		{
			for (var i in this.gamepads) {
				if (this.gamepads[i].index == event.gamepad.index) {
					this.gamepads.splice(i, 1);
					break;
				}
			}
			if (this.gamepads.length == 0) {
				this.stopPolling();
			}
			this.updateGamepads(this.gamepads);
		},

		startPolling: function ()
		{
			console.log('Start gamepad polling');
			if (!this.ticking) {
				this.ticking = true;
				this.tick();
			}
		},

		stopPolling: function ()
		{
			this.ticking = false;
		},

		tick: function ()
		{
			this.pollStatus();
			this.scheduleNextTick();
		},

		// requesting the browser to poll at the next available opportunity
		scheduleNextTick: function ()
		{
			if (this.ticking) {
				if (window.requestAnimationFrame) {
					window.requestAnimationFrame(this.tick.bind(this));
				} else if (window.mozRequestAnimationFrame) {
					window.mozRequestAnimationFrame(this.tick.bind(this));
				} else if (window.webkitRequestAnimationFrame) {
					window.webkitRequestAnimationFrame(this.tick.bind(this));
				}
			}
		},

		/**
		 * Fixme: need to balance the polling for keyup and keydown.
		 * It is necessary to poll via requestAnimationFrame for keyup so we don't
		 * miss it, but that makes the navigation too quick. We possibly want to fix
		 * navigation on the input.js throttling layer, and not necessarily here.
		 */
		pollStatus: function ()
		{
			this.pollGamepads();


			if(this.gamepads.length < 1)
				return;

			for (var i in this.gamepads)
			{
				var gamepad = this.gamepads[i];

				// Skip poll for gamepad if input is NOT updated or if the timestamp
				// in between the two presses are too quick. Only supported in chrome.
				if (gamepad.timestamp && (gamepad.timestamp == this.prevTimestamps[i]))
				{
					continue;
				}


				this.prevTimestamps[i] = gamepad.timestamp;
				var resp = this.updateInputPresses(i,gamepad.timestamp);

				// In this routine, we need to calculate if there was a KEYUP.
				// A KEYUP needs to meet the following requirements:
				//    - Have a 0 value for the button ID we are looking for (5)
				this.checkButtonUp({
					sent: resp,
					gamepadId: i,
					hrTs: gamepad.timestamp
				});

				// Make sure to save the current gamepad state AFTER the keyup check
				this.prevGamepadState[i] = Object.append({}, gamepad);
			}
		},

		/**
		 * Check to see if we have any button up events. We have to fake this since
		 * the current API doesn't distinguish this in the implementation.
		 *
		 */
		checkButtonUp: function(config)
		{
			var length = config.sent.buttons.length;
			if(!this.prevGamepadState[config.gamepadId])
				return;

			for (var i = 0; i < length; i++)
			{
				var lastValue = this.prevGamepadState[config.gamepadId].buttons[i],
					currValue = config.sent.buttons[i];

				// If the button WAS pushed, but it was not sent just now, then that
				// means that it is being held down
				if(currValue === false && lastValue === 1)
				{
					this.sendButton({
						buttonId: i,
						isUpKey: true,
						hrTs: config.hrTs
					});
				}
			}

		},

		pollGamepads: function ()
		{
			var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;

			if (rawGamepads)
			{
				this.gamepads = [];
				var gamepadsChanged = false;
				for (var i = 0; i < rawGamepads.length; i++)
				{
					if (typeof rawGamepads[i] != 'undefined'
						&& typeof rawGamepads[i] != this.prevRawGamepadTypes[i])
					{
						gamepadsChanged = true;
						this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
					}
					if (rawGamepads[i])
					{
						this.gamepads.push(rawGamepads[i]);
					}
				}
				if (gamepadsChanged)
				{
					this.updateGamepads(this.gamepads);
				}
			}
		},

		/**
		 * Reads input presses
		 * @param int ID of the currently used gamepad
		 * @return object with boolean values
		 */
		updateInputPresses: function (gamepadId, hrTs) {
			// Get the data from the polled gamepad.
			var curr_gamepad = this.gamepads[gamepadId];
			var buttonsSent = [],
				axesSent = [];

			for(var i = 0; i < this.typicalButtonCount; i++)
			{
				if(typeof curr_gamepad.buttons == 'undefined')
				{
					continue;
				}
				var sent = this.sendButton({
					value: curr_gamepad.buttons[i],
					gamepadId: gamepadId,
					buttonId: i,
					hrTs: hrTs
				});

				// Keep track of which buttons were sent
				buttonsSent[i] = sent;
			}

			// Go through all of the available axis
			for(var i = 0; i < this.typical_axis_count; i++)
			{
				if(typeof curr_gamepad.axes == 'undefined')
				{
					continue;
				}
				var sent = this.updateAxis({
					axis: i,
					value: curr_gamepad.axes[i],
					gamepadId: gamepadId,
					hrTs: hrTs
				});

				// Keep track of which buttons were sent
				axesSent[i] = sent;
			}

			/** Sending non-standard buttons and axes **/

			if(typeof curr_gamepad.buttons != 'undefined')
			{
				// Support needed specifically for the HOME button on gamepad
				var extraButtonId = this.typicalButtonCount;
				while (typeof curr_gamepad.buttons[extraButtonId] != 'undefined') {
					var sent = this.sendButton({
						value: curr_gamepad.buttons[extraButtonId],
						gamepadId: gamepadId,
						buttonId: extraButtonId,
						hrTs: hrTs
					});

					// Keep track of which buttons were sent
					buttonsSent[extraButtonId] = sent;
					extraButtonId++;
				}
			}


			// var extraAxisId = this.TYPICAL_AXIS_COUNT;
			// while (typeof curr_gamepad.axes[extraAxisId] != 'undefined') {
			//     this.updateAxis(curr_gamepad.axes[extraAxisId], gamepadId, 'extra-axis-' + extraAxisId);
			//     extraAxisId++;
			// }

			return {
				buttons: buttonsSent,
				axes: axesSent
			}
		},

		/**
		 * Finds the button that was pressed and sends it to the input library.
		 * @return bool TRUE if we sent a gamepad press
		 */
		sendButton: function (config)
		{
			// Since entire controller is polled, we need to only find the input
			// button that was selected (when value > threshold). Either that,
			// or make sure that we were using the analog stick.
			if((config.value > this.analogButtonThreshold) || config.isAnalogStick)
			{
				var ts = new Date().getTime();

				// Throttling: make sure we don't spam Navigation with gamepad input

				// If this is our first time checking the hrTs of a gamepad event...
				if(this.lastThrottleTs == null)
				{
					this.lastThrottleTs = ts;
				}
				// It's not our first time. Check to see if the new hrTS meets our req.
				else
				{
					var tsDiff = ts - this.lastThrottleTs,
						threshold = config.isAnalogStick ? this.axisThrottleThreshold : this.buttonThrottleThreshold;

					// See if the timestamp is too small. If it is, we should
					// ignore the current input. Otherwise, a double event will trigger.
					if(tsDiff < threshold)
					{
						// Logger kept for ease of useful debugging.
						// console.log('Too fast! Skipping: ',config.buttonId, this.lastThrottleTs);
						return false;
					}
					else
					{
						// If the input meets the min req for the threshold, continue.
						this.lastThrottleTs = ts;
					}
				}

				var resp = this.getNormalizedAction(config.buttonId);

				this.fire('activate');

				if(config.isUpKey)
					this.fire('action-up', resp.action, {context: resp.context});
				else
					this.fire('action-down', resp.action, {context: resp.context});

				return true;
			}

			return false;
		},

		/**
		 * Non-standard buttons ids are used here for latter mappings to actions.
		 *
		 */
		updateAxis: function (config)
		{
			var axisValue = config.value.toFixed(2);

			/**
			 * Any negative or positive value meeting our threshold requirement
			 * is considered valid. We have a threshold so we don't include/read
			 * all [negligable] values with every gamepad poll.
			 * @return bool TRUE if we sent a gamepad press.
			 */
			if ((axisValue < -this.axisThreshold)
				|| (axisValue > this.axisThreshold))
			{
				// Left stick, x axis
				if (config.axis === 0)
				{
					// Positive value means movement to the RIGHT
					if(axisValue > this.axisThreshold)
						config.buttonId = 55;
					// Negative value means movement to the LEFT
					else
						config.buttonId = 57;
				}
				// Left stick, y axis
				else if(config.axis === 1)
				{
					// Positive value means movement DOWN
					if(axisValue > this.axisThreshold)
						config.buttonId = 56;
					// Negative value means movement UP
					else
						config.buttonId = 54;
				}

				// Right stick, x axis
				else if(config.axis === 2)
				{
					// Positive value means movement to the RIGHT
					if(axisValue > this.axisThreshold)
						config.buttonId = 51;
					// Negative value means movement to the LEFT
					else
						config.buttonId = 53;
				}
				// Right stick, y axis
				else if(config.axis === 3)
				{
					// Positive value means movement DOWN
					if(axisValue > this.axisThreshold)
						config.buttonId = 52;
					// Negative value means movement UP
					else
						config.buttonId = 50;
				}
			}

			if (config.buttonId)
			{
				this.sendButton({
					buttonId: config.buttonId,
					isUpKey: false,
					hrTs: config.hrTs,
					isAnalogStick: true
				})
				return true;
			}
			return false;
		},

		/**
		 * Provided a button id, normalize to a string with a name of the action
		 * intended to be used for that input.
		 *
		 * Note: button ids in the 50s means it was generated from an analog stick
		 *
		 * @param int Id of the button that was just pressed.
		 * @return string The mapping of the button id to an action.
		 */
		getNormalizedAction : function(buttonId)
		{
			var focused = $(':focus');
			var mapped = '';
			var resp = {
				action: null,
				context: null
			};

			switch(buttonId)
			{
				case 1:
					resp.action = 'back';
					break;
				case 12:
				case 54:
					resp.action = 'up';
					break;
				case 13:
				case 56:
					resp.action = 'down';
					break;
				case 14:
				case 57:
					resp.action = 'left';
					break;
				case 15:
				case 55:
					resp.action = 'right';
					break;
				case 0:
					if (focused.prop('tagName') == 'INPUT' || focused.prop('tagName') == 'TEXTAREA')
					{
						resp.action = 'trigger-keyboard';

						// We need to keep track of which input field was selected
						resp.context = focused.attr('id');
					}
					else
					{
						resp.action = 'select';
					}
					break;
				case 2:
					resp.action = 'x';
					break;
				case 3:
					resp.action = 'y';
					break;
				// Left bumper
				case 4:
					resp.action = 'cheer';
					break;
				case 8:
					resp.action = 'menu';
					break;
				default:
					console.log('[Gamepad] Did not map button id to an action: ', buttonId);
			}
			return resp;
		}
	})
});

GSP.input.registerInputDevice('gamepad-input', new Gsp.Navigate.Gamepad());
