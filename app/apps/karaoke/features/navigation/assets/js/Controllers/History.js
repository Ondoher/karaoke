Package('Gsp.Navigate', {
	History : new Class({
		Extends : Sapphire.Eventer,

		initialize : function()
		{
			this.parent();

			SAPPHIRE.history.listen('internalChange', this.onHistoryInternalChange.bind(this));
			SAPPHIRE.history.listen('externalChange', this.onHistoryExternalChange.bind(this));
			GSP.input.listen('inputDown', this.onInputDown.bind(this));
			this.historyStack = [];
		},

		back : function()
		{
		// Check to make sure that we can even go back first.
			if(this.historyStack.length > 1)
			{
				window.history.back();
			}
		},

		onInputDown : function(input)
		{
			var action = input.action;
			var data = input.data;
			switch(action)
			{
				case 'back':
					this.back();
					break;
			}
		},

		onHistoryInternalChange : function(first)
		{
			this.historyStack.push(true);
		},

		onHistoryExternalChange : function(first)
		{
		// this is an external change. this assumes the only change is back
			this.historyStack.pop();
		}
	})
});

GSP.history = new Gsp.Navigate.History();
