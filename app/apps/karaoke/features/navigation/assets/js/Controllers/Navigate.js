 Package('Karaoke.Navigate', {
	Navigate : new Class({
		Extends : Sapphire.Eventer,

		initialize : function()
		{
			this.parent();

			KARAOKE.input.listen('inputUp', this.onInputUp.bind(this));
			KARAOKE.input.listen('inputDown', this.onInputDown.bind(this));
			this.ids = 0;
			this.current = -1;
			this.currentStack = [];

			// Not sure where else to put the history stack
			this.historyStack = [];
			this.ignoreNewPage = false;
		},

	/**********************************************************************************'
		Method: getStopById

		call this method to get the stop for a given id

		Parameters:
			selector    - the navigable item being looked for
	*/
		getStopById : function(id)
		{
			var result = null;

			this.stops.each(function(stop)
			{
				if (stop.id == id) result = stop;
			}, this);

			return result;
		},

	/**********************************************************************************'
		Method: getStop

		call this method to get the stop for a given selector

		Parameters:
			selector    - the navigable item being looked for
	*/
		getStop : function(selector)
		{
			var result = null;
			var id = selector.data('navigate-id');

			this.stops.each(function(stop)
			{
				if (stop.id == id) result = stop;
			}, this);

			return result;
		},

	/**********************************************************************************
	Group: these methods are used to setup the grid
	***********************************************************************************/

	/**********************************************************************************'
		Method: calcBox

		call this method to get the rectangle the defines the given selector

		Parameters:
			selector    - the navigable item being sized

		Returns:
			an object specifying the left, right, top, bottom, width and height
	*/
		calcBox : function(selector)
		{
			var offset = selector.offset();
			var width = selector.width();
			var height = selector.height();
			var scrollHeight = selector[0].scrollHeight;

			var x = offset.left;
			var y = offset.top;

		// in a scrolable container? add the position within the container
			if (selector.hasClass('nav-sub'))
			{
				var position = selector.position();
				y += position.top;
			}

			return {left: x, top: y, right: x + width, bottom: y + height, width: width, height: height};
		},

	/**********************************************************************************'
		Method: getIntersectX

		call this method to find all the stops that overlap the source stop along the x
		axis

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considered
	*/
		getIntersectX : function(stops, source)
		{
			var result = [];
			stops.each(function(stop)
			{
				if (stop.box.right <  source.box.left || source.box.right < stop.box.left) return;
				if (stop.id == source.id) return;

				result.push(stop);
			}, this);

			return result;
		},

	/**********************************************************************************'
		Method: getIntersectY

		call this method to find all the stops that overlap the source stop along the y
		axis

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considered

		Returns:
			an array of stops
	*/
		getIntersectY : function(stops, source)
		{
			var result = [];
			stops.each(function(stop)
			{
				if (stop.id == source.id) return;
				if (stop.box.bottom <  source.box.top || source.box.bottom < stop.box.top) return;

				result.push(stop);
			}, this);

			return result;
		},

	/**********************************************************************************'
		Method: getClosestDeltaX

		call this method to find all the stops that have rights closest to the given x

		Parameters:
			stops      - a subset of all stops that should be checked
			x          - the x position being checked

		Returns:
			the matched stop
	*/
		getClosestDeltaX : function(stops, x)
		{
			var closestDelta = Number.MAX_VALUE;
			var result = null;

			stops.each(function(stop)
			{
				var delta = Math.abs(x - stop.box.right);

				if (delta < closestDelta)
				{
					closestDelta = delta;
					result = stop;
				}
			}, this);

			return result;
		},

	/**********************************************************************************'
		Method: getClosestDeltaY

		call this method to find the stop that has its bottom closest to the given y

		Parameters:
			stops      - a subset of all stops that should be checked
			y          - the y position being checked

		Returns:
			the matched stop
	*/
		getClosestDeltaY : function(stops, y)
		{
			var closestDelta = Number.MAX_VALUE;
			var result = null;

			stops.each(function(stop)
			{
				var delta = Math.abs(y - stop.box.bottom);

				if (delta < closestDelta)
				{
					closestDelta = delta;
					result = stop;
				}
			}, this);

			return result;
		},

	/**********************************************************************************'
		Method: getLowest

		call this method to find all the items closest to the top of the given stop

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getLowest : function(stops, source)
		{
			var lowestY = -10000000;
			var ups = [];

			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var y = stop.box.bottom;

				lowestY = Math.max(y, lowestY);
			}, this);


			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var y = stop.box.bottom;
				if (y == lowestY) ups.push(stop);
			}, this);

			return ups;
		},

	/**********************************************************************************'
		Method: getHighest

		call this method to find all the items closest to the bottom of the given stop

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getHighest : function(stops, source)
		{
			var highestY = Number.MAX_VALUE;
			var downs = [];

			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var y = stop.box.top;

				highestY = Math.min(y, highestY);
			}, this);

			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var y = stop.box.top;
				if (y == highestY) downs.push(stop);
			}, this);

			return downs;
		},

	/**********************************************************************************'
		Method: getRightest

		call this method to find all the items closest to the right of the given stop

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getRightest : function(stops, source)
		{
			var rightestX = -10000000;
			var rights = [];

			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var x = stop.box.right;

				rightestX = Math.max(x, rightestX);
			}, this);

			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var x = stop.box.right;
				if (x == rightestX) rights.push(stop);
			}, this);

			return rights;
		},

	/**********************************************************************************'
		Method: getLeftest

		call this method to find all the items closest to the left of the given stop

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getLeftest : function(stops, source)
		{
			var leftestX = Number.MAX_VALUE;
			var lefts = [];

			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var x = stop.box.left;

				leftestX = Math.min(x, leftestX);
			}, this);

			stops.each(function(stop)
			{
				if (source.id == stop.id) return;

				var x = stop.box.left;
				if (x == leftestX) lefts.push(stop);
			}, this);

			return lefts;
		},

	/**********************************************************************************'
		Method: getUps

		call this method to find all the items above the given stop.

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getUps : function(stops, source)
		{
			var ups = [];

			if (!source.selector.hasClass(this.navClass)) return ups;
			stops.each(function(stop)
			{
				if (source.id == stop.id) return;
				if (!stop.selector.hasClass(this.navClass)) return;
				if (stop.box.bottom > source.box.top) return;

				ups.push(stop);
			}, this);

			return ups;
		},

	/**********************************************************************************'
		Method: getDowns

		call this method to find all the items underneath the given stop.

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getDowns : function(stops, source)
		{
			var downs = [];

			if (!source.selector.hasClass(this.navClass)) return downs;
			stops.each(function(stop)
			{
				if (source.id == stop.id) return;
				if (!stop.selector.hasClass(this.navClass)) return;
				if (stop.box.top < source.box.bottom) return;

				downs.push(stop);
			}, this);

			return downs;
		},

	/**********************************************************************************'
		Method: getLefts

		call this method to find all the items to the left of the given stop.

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getLefts : function(stops, source)
		{
			var lefts = [];

			if (!source.selector.hasClass(this.navClass)) return lefts;
			stops.each(function(stop)
			{
				if (source.id == stop.id) return;
				if (!stop.selector.hasClass(this.navClass)) return;
				if (stop.box.right > source.box.left) return;

				lefts.push(stop);
			}, this);

			return lefts;
		},

	/**********************************************************************************'
		Method: getRights

		call this method to find all the items to the right of the given stop.

		Parameters:
			stops      - a subset of all stops that should be checked
			source     - the stop being considerded

		Returns:
			an array of stops
	*/
		getRights : function(stops, source)
		{
			var rights = [];

			if (!source.selector.hasClass(this.navClass)) return rights;
			stops.each(function(stop)
			{
				if (source.id == stop.id) return;
				if (!stop.selector.hasClass(this.navClass)) return;
				if (stop.box.left < source.box.right) return;

				rights.push(stop);
			}, this);

			return rights;
		},

	/**********************************************************************************'
		Method: getUp

		call this method to find the item above the passed stop. This will be called
		once all the stops have already been gathered.

		Parameter:
			source      - the stop being considered

		Returns:
			the matched stop
	*/
		getUp : function(source)
		{

			var ups = this.getUps(this.stops, source);
			var intersection = this.getIntersectX(ups, source);
			var result = null;

			if (intersection.length != 0)
			{
				var candidates = this.getLowest(intersection, source);

				return this.getClosestDeltaX(candidates, source.box.left);
			}
			else
			{
				return this.getClosestDeltaX(ups, source.box.left);
			}
		},

	/**********************************************************************************'
		Method: getLeft

		call this method to find the item to the left of the passed stop. this will
		be called once all the stops have already been gathered.

		Parameter:
			source      - the stop being considered

		Returns:
			the matched stop
	*/
		getLeft : function(source)
		{
			var lefts = this.getLefts(this.stops, source);
			var intersection = this.getIntersectY(lefts, source);
			var result = null;

			if (intersection.length != 0)
			{
				var candidates = this.getRightest(intersection, source);

				return this.getClosestDeltaY(candidates, source.box.top);
			}
			else
			{
				return this.getClosestDeltaY(lefts, source.box.top);
			}
		},

	/**********************************************************************************'
		Method: getDown

		call this method to find the item underneath the passed stop. this will
		be called once all the stops have already been gathered.

		Parameter:
			source      - the stop being considered

		Returns:
			the matched stop
	*/
		getDown : function(source)
		{
			var downs = this.getDowns(this.stops, source);
			var intersection = this.getIntersectX(downs, source);
			var result = null;

			if (intersection.length != 0)
			{
				var candidates = this.getHighest(intersection, source);
				return this.getClosestDeltaX(candidates, source.box.left);
			}
			else
			{
				return this.getClosestDeltaX(downs, source.box.left);
			}
		},

	/**********************************************************************************'
		Method: getRight

		call this method to find the item to the right of the passed stop. this will
		be called once all the stops have already been gathered.

		Parameter:
			source      - the stop being considered

		Returns:
			the matched stop
	*/
		getRight : function(source)
		{
			var rights = this.getRights(this.stops, source);
			var intersection = this.getIntersectY(rights, source);
			var result = null;

			if (intersection.length != 0)
			{
				var candidates = this.getLeftest(intersection, source);
				return this.getClosestDeltaY(candidates, source.box.bottom);
			}
			else
			{
				var stop = this.getClosestDeltaY(rights, source.box.bottom);

				return stop;
			}
		},

	/**********************************************************************************'
		Method: findTopLeft

		call this method to find the stop in the top left

		Returns:
			the matched stop
	*/
		findTopLeft : function()
		{
			var stops = this.stops;
			var topestY = Number.MAX_VALUE;
			var leftestX = Number.MAX_VALUE;
			var candidates = [];

			stops.each(function(stop)
			{
				var y = stop.box.top;

				topestY = Math.min(y, topestY);
			}, this);

			stops.each(function(stop)
			{
				var y = stop.box.top;
				if (y == topestY) candidates.push(stop);
			}, this);

			stops = candidates;
			var topLeft = null;

			stops.each(function(stop)
			{
				var x = stop.box.left;
				if (x < leftestX)
				{
					leftestX = x;
					topLeft = stop;
				}
			}, this);

			return topLeft;
		},

	/**********************************************************************************'
		Method: setupContainers

		call this method to create stops for all the items within a navigable container

		Parameters:
			root          - a selector for the root item, under which the setup will happen
	*/
		setupContainers : function(root)
		{
			root.find('.nav-container').each(function(idx, el)
			{
				var selector = $(el);

				//this.setupSubGrid(selector, 'navigable');
				this.setupSubGrid(selector, 'sub-nav');
			}.bind(this));
		},

	/**********************************************************************************'
		Method: setupSubGrid

		call this method to setup the grid given a specific root. Each navigable item will
		assigned a unique id. If it already has an id, it will be retained. A new object
		will be added to the list of stops. Each item contain the id, the selector of the item
		and the calculated box for the item. The box will be used to find items to the left,
		right up and down.

		Parameters:
			parent        - a selector for the root DOM element
			navClass      - the class that will be used to find navigable items. if not
							specified it will be assumed to be 'navigable'. It may also be
							sub-nav
	*/
		setupSubGrid : function(parent, navClass)
		{
			parent = parent?parent:$(document.body);
			navClass = navClass?navClass:'navigable';

			this.navClass = navClass;

		/*
			find all the current navigable items and
				2) calculate the box
				3) add it to the list of stops
		*/
			parent.find('.' + navClass).each(function(idx, el)
			{
				var selector = $(el);

				var box = this.calcBox(selector);

				if (selector.is(':hidden') || selector.css('visibility') == 'hidden') return;
				if (box.bottom <= 0 && !selector.hasClass('sub-nav')) return;

				var id = selector.data('navigate-id');
				if (id === undefined)
				{
					id = this.ids;
					this.ids++;
					selector.data('navigate-id', id);
					selector.attr('data-nid', id);
				}

				var stop = this.getStopById(id);
				if (stop) return;

				this.stops.push({id: id, selector : selector, box: box, element: el});
			}.bind(this));

		//	precalc the up, down, left, right elements
			this.stops.each(function(stop)
			{
				if (!stop.selector.hasClass('navigable')) return;
				if (!stop.selector.hasClass(this.navClass)) return;

				if (!stop.up) stop.up = this.getUp(stop);
				if (!stop.down) stop.down = this.getDown(stop);
				if (!stop.left) stop.left = this.getLeft(stop);
				if (!stop.right) stop.right = this.getRight(stop);
			}, this);
		},

	/**********************************************************************************'
		Method: makeContainersNavigable

		call this method to add a navigable class to the items in a nav container. This
		will only make those items that are visible navigable. When the container is scrolled
		the entire grid will be be reset.

		Parameters:
			root        - a selector for the root DOM element
	*/
		makeContainersNavigable : function(root)
		{
			root.find('.nav-container').each(function(idx, el)
			{
				var selector = $(el);
				selector.unbind('scrollstop');
				selector.on('scrollstop', this.onNavScroll.bind(this, selector));
				selector.find('.sub-nav').removeClass('navigable');
				selector.find('.sub-nav').each(function(idx, el)
				{
					var child = $(el);
					var position = child.position();
					var top = position.top;
					var bottom = position.top + child.height();

					if (bottom > 0 && top < selector.height() * 2) child.addClass('navigable');
				}.bind(this));
			}.bind(this));
		},

	/**********************************************************************************
	Group: these methods handle scrollable navigation
	***********************************************************************************/

	/**********************************************************************************'
		Method: checkScroll

		call this function calculate if the move to a new stop position what is within a
		navigable container will require that container to scroll.

		Parameters:
			stop             - stop for the item being navigated to
	*/
		checkScroll : function(stop, force)
		{
			var selector = stop.selector;
			var parent = selector.parent();
			var elHeight = position = bottom = null;

			// Check to see if the currently selected item is in a box that contains
			// a set of un-uniform navigables (meaning the elements aren't set up to
			// render in a nice grid). If so, we need to make sure that the
			// current entire SET is visible.
			if(selector.hasClass('navigable-subset'))
			{
				var navigablesContainer = selector.closest('.navigables-container');
				var elHeight = navigablesContainer.outerHeight(true);
				var position = navigablesContainer.position();
				parent = navigablesContainer.parent();
			}
			else
			{
				var elHeight = selector.outerHeight(true);
				var position = selector.position();
			}


			var fit = Math.floor(parent.height() / elHeight);
			bottom = position.top + elHeight;

			// Calculate the scroll for individual nav items.

			//if (position.top < 0 || position.top > elHeight*2)
			if (position.top < 0 || position.top > Math.floor(elHeight * fit))
			{
				var newPosition = parent.scrollTop() + position.top - Math.floor(fit / 2 * elHeight);
				if (force === 'top') newPosition = parent.scrollTop();
				else if (force === 'bottom') newPosition = parent.scrollTop() + position.top;
				//parent.animate({scrollTop: newPosition + 'px'}, 150, 'swing');
				parent.scrollTop(newPosition);
			}

			else if (bottom > parent.outerHeight(true))
			{
				var newPosition = parent.scrollTop() + elHeight;
				parent.scrollTop(newPosition);
				//parent.animate({scrollTop: newPosition + 'px'}, 150, 'swing');
			}



		},

	/**********************************************************************************'
		Method: scrollDown

		call this function to scroll down the current scrollable navigation stop. This
		function will cause a navigation down if the current item is scrolled to the bottom

	*/
		scrollDown : function()
		{
			var selector = this.currentScroll;
			if(!selector.is(':animated'))
			{
				var scrollTop = selector.scrollTop();
				var scrollHeight = selector.prop('scrollHeight');
				var height = selector.outerHeight();

				if (scrollTop + height >= scrollHeight || scrollHeight <= height)
				{
					this.currentScroll = null;
					this.down();
					return 0;
				}

				scrollTop += Math.floor(height / 5);
//				selector.animate({scrollTop:  + scrollTop + 'px'}, 150, 'swing');
				selector.scrollTop(scrollTop);
			}
		},

	/**********************************************************************************'
		Method: scrollUp

		call this function to scroll up the current scrollable navigation stop. This
		function will cause a navigation up if the current item is scrolled to the top

	*/
		scrollUp : function()
		{
			var selector = this.currentScroll;
			if(!selector.is(':animated'))
			{
				var scrollTop = selector.scrollTop();
				var height = selector.height();

				if (scrollTop <= 0)
				{
					this.currentScroll = null;
					this.up();
				}

				scrollTop = Math.max(0, scrollTop - Math.floor(height / 5));

				//selector.animate({scrollTop:  + scrollTop + 'px'}, 150, 'swing');
				selector.scrollTop(scrollTop);
			}
		},

	/**********************************************************************************
	Group: these functions move between navigable items
	***********************************************************************************/

	/**********************************************************************************'
		Method: select

		call this function move the current item to the specfied navigable item. The class
		'navigate-current' will be removed from all navigable items and added to the selected.

		Paramters:
			id        - the internal id of the selected item
	*/
		select : function(id)
		{
			var focused = $(':focus');

			this.current = id;
			$('.navigate-current').removeClass('navigate-current');
			var stop = this.getStopById(id);

			if (!stop) return;

			stop.selector.addClass('navigate-current');
			this.fire('selected', stop.selector);

			focused.blur();
			stop.selector.focus();

			this.currentScroll = null;

			if (stop.selector.hasClass('nav-vscroll'))
			{
				this.currentScroll = stop.selector;
			}
		},

	/**********************************************************************************'
		Method: selectDefault

		call this function move to a default item. Called immediately after setting up the
		grid. Will reposition on the previously selected item if it available, or the item
		in the top left.

		Paramters:
			id        - the internal id of the selected item
	*/
		selectDefault : function(focus)
		{
			focus = (focus === undefined)?this.current:focus;

			var stop = this.getStopById(focus);

			if (!stop) stop = this.findTopLeft();
			if (!stop) return;

			stop.selector.addClass('navigate-current');
			this.current = stop.id;

			this.currentScroll = null;
			if (stop.selector.hasClass('nav-vscroll'))
			{
				this.currentScroll = stop.selector;
			}
		},

	/**********************************************************************************'
		Method: up

		call this function to move the current navigable item up. This method relies on
		all the stops having been calculated.
	*/
		up : function()
		{
			if (this.current == -1) return;
			if (this.currentScroll) return this.scrollUp();

			var stop = this.getStopById(this.current);
			if(!stop) return;

			var upStop = stop.up;

			if (!upStop) return this.fire('moveOut', 'up');
			this.select(upStop.id);

			this.checkScroll(upStop);
		},

	/**********************************************************************************'
		Method: down

		call this function to move the current navigable item down. This method relies on
		all the stops having been calculated.
	*/
		down : function()
		{
			if (this.current == -1) return;
			if (this.currentScroll) return this.scrollDown();

			var stop = this.getStopById(this.current);

			if(!stop) return;

			var downStop = stop.down;

			if (!downStop) return this.fire('moveOut', 'down');
			this.select(downStop.id);

			this.checkScroll(downStop);
		},

	/**********************************************************************************'
		Method: left

		call this function to move the current navigable item left. This method relies on
		all the stops having been calculated.
	*/
		left : function()
		{
			if (this.current == -1) return;
			var stop = this.getStopById(this.current);
			if(!stop) return;

			var leftStop = stop.left;

			if (!leftStop) return this.fire('moveOut', 'left');
			this.select(leftStop.id);
		},

	/**********************************************************************************'
		Method: right

		call this function to move the current navigable item right. This method relies on
		all the stops having been calculated.
	*/
		right : function()
		{
			if (this.current == -1) return;

			var stop = this.getStopById(this.current);
			if(!stop) return;

			var rightStop = stop.right;

			if (!rightStop) return this.fire('moveOut', 'right');
			this.select(rightStop.id);
		},

	/**********************************************************************************'
		Method: selectEvent

		call this function to handle the selection of the current stop. This simulates a
		click on that item.
	*/
		selectEvent : function()
		{
			if (this.current == -1) return;
			var stop = this.getStopById(this.current);
			if(stop)
				stop.selector.click();
		},

	/**********************************************************************************
	Group: these functions can be called externally
	***********************************************************************************/

	/**********************************************************************************'
		Method: pushSelected

		call this function to save the current selected item.
	*/
		pushSelected : function()
		{
			this.currentStack.push({current: this.current, root: this.root});
		},

	/**********************************************************************************'
		Method: popSelected

		call this function to reposition the current navigable item to the one on the top
		of the stack
	*/
		popSelected : function()
		{
			var element = this.currentStack.pop();
			var id = element.current;
			var root = element.root;
			this.root = root;
			this.setupGrid(root, id)
		},

	/**********************************************************************************'
		Method: setupGrid

		call this function to setup the navigation grid. This will precalculate the grid
		based on the classes in the current DOM.

		Parameters
			root         - a selector to the root node under which navigation will be
							 setup

		CSS Classes:
			navigable     - use this on all dom elements that can be navigated to
			nav-container - use this for a container of navigable items. This container
							will be assumed to scroll up and down. Navigable items within
							this container will be scrolled into view.
			sub-nav       - use this class to specify navigable items under a nav-container

		Returns
			a promise that will be fulfilled when the grid is setup

	*/
		setupGrid : function(root, focus)
		{
			root = root?root:$(document.body);
			this.root = root;

			var deferred = Q.defer();

		// give dom a chance to settle down
			setTimeout(function()
			{
				$('.navigable').removeClass('navigate-current');
				this.stops = [];
				this.stretches = [];

				this.setupContainers(root);
				this.makeContainersNavigable(root);
				this.setupSubGrid(root);

				this.selectDefault(focus);
				this.fire('grid-setup', root);

				deferred.resolve('');
			}.bind(this), 1);

			return deferred.promise;
		},

		updateGrid : function()
		{
			this.setupGrid(this.root);
		},

	/**********************************************************************************'
		Method: selectThisItem

		call this method to move the current item to a specific dom node.

		Parameters:
			selector             - jQuery selector for the item to make the current item
	*/
		selectThisItem : function(selector)
		{
			var stop = this.getStop(selector)

			if (stop) this.select(stop.id);
		},

	/**********************************************************************************'
		Method: scrollTo

		call this method to scroll a navigable sub element into view in its container

		Parameters:
			selector             - jQuery selector for the item to make visible
	*/
		scrollTo : function(selector)
		{
			if (!selector) return;
			var elHeight = selector.outerHeight(true);
			var position = selector.position();
			var bottom = position.top + elHeight;
			var parent = selector.parent();

			if (position.top < 0 || position.top > elHeight*2)
			{
				var newPos = parent.scrollTop() + position.top;
				parent.scrollTop(newPos);
			}

			else if (bottom > parent.outerHeight(true))
			{
				var newPos = parent.scrollTop() + elHeight;
				parent.scrollTop(newPos);
			}
		},

	/**********************************************************************************
	Group:  event handlers
	***********************************************************************************/

		onInputDown : function(input)
		{
			var action = input.action;
			var data = input.data;
			switch(action)
			{
				case 'up':
					this.up();
					break;
				case 'down':
					this.down();
					break;
				case 'left':
					this.left();
					break;
				case 'right':
					this.right();
					break;
				case 'enter':
					var selector = data;
					var stop = this.getStop(selector);
					if (!stop) return;
					this.select(stop.id);
					break;
				case 'select':
					this.selectEvent();
					break;
				case 'menu':
					this.onMenuOpen();
					break;
				case 'trigger-keyboard':
					// Make sure we have a context for where the user triggered the keyboard
					if(data && data.context)
						this.fire('trigger-keyboard', data.context);
					break;
				// If the page up/page down buttons are pressed on the keyboard.
				case 'page-up':
					this.pageUp();
					break;
				case 'page-down':
					this.pageDown();
					break;
				// If "Y" on the gamepad is pressed, go back to the currently active
				// main navigation item.
				case 'y':
					this.selectMainMenu();
					break;
				default:
					// User hit an accepted input key, but it's not used on a global scope.
					// Fire an event for the key. Perhaps it is used in a specific page.
					this.fire('nav-action-down', action);
					break;
			}
		},

		/**
		 * Called when an input button on a device is released.
		 *
		 */
		onInputUp : function(input)
		{
			var action = input.action;
			var data = input.data;
			switch(action)
			{
				case 'up':
					this.inputUpUp();
					break;
				case 'down':
					this.inputUpDown();
					break;
				default:
					// User hit an accepted input key, but it's not used on a global scope.
					// Fire an event for the key. Perhaps it is used in a specific page.
					this.fire('nav-action-up', action);
					break;
			}
		},

		onMenuOpen : function()
		{
		},

		onNavScroll : function(selector)
		{
			this.setupGrid();
		},

		inputUpUp : function()
		{
		},

		inputUpDown : function()
		{
		},

		selectMainMenu : function()
		{
			this.fire('select-main-menu');
		},

		/**
		 * A few places in  karaoke need to respond to the pageup/down input.
		 * In this case, the only places where this will work is in containers that
		 * have the class "nav-container", since it contains a list of navigables.
		 */
		pageUp : function()
		{
			if (this.current == -1) return;
			if (this.currentScroll) return this.scrollUp();

			// For a page up, we want to get the up-item 2 ups from the current.
			var stop = this.getStopById(this.current);
			if(!stop || !stop.up) return;

			var parent = stop.selector.parent();
			var elHeight = stop.selector.outerHeight(true);
			var fit = Math.floor(parent.height() / elHeight);
			var upStop = stop.up;

			for (var idx = 0; idx < fit && upStop.up; idx++)
				upStop = upStop.up;

			// Check to see if current item is in a nav-container
			if (upStop.selector.parent().hasClass('nav-container'))
			{
				this.currentScroll = upStop.selector;
				this.select(upStop.id);
				this.checkScroll(upStop, 'top');
			}

		},

		pageDown : function()
		{
			if (this.current == -1) return;
			if (this.currentScroll) return this.scrollDown();

			// For a page down, we want to get the down-item 2 downs from the current.
			var stop = this.getStopById(this.current);
			if(!stop || !stop.down) return;

			var parent = stop.selector.parent();
			var elHeight = stop.selector.outerHeight(true);
			var fit = Math.floor(parent.height() / elHeight);
			var downStop = stop.down;

			for (var idx = 0; idx < fit && downStop.down; idx++)
				downStop = downStop.down;

			// Check to see if current item is in a nav-container
			if (downStop.selector.parent().hasClass('nav-container'))
			{
				this.currentScroll = downStop.selector;
				this.select(downStop.id);
				this.checkScroll(downStop, 'bottom');
			}
		}
	})
});

KARAOKE.navigation = new Karaoke.Navigate.Navigate();
