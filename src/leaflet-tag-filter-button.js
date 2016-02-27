(function() {
	
	L.Control.TagFilterButton = L.Control.extend({

		options: {
            icon:"fa-filter",//buton icon default is fa-filter
			data: null, // the data to be used for tags popup, it can be array, or function for ajax response
			onSelectionComplete: null // the callback function for selected tags
		},

        _map: null,

        _showTagFilterPopup: function () {
            alert('clicked');
        },

		initialize: function(options) {
			debugger;
			L.Util.setOptions(this, options || {});
		},

		addTo: function (map) {
            this._map = map;
            L.easyButton(this.options.icon, this._showTagFilterPopup).addTo( map );
		},

		onRemove: function(map) {
			debugger;
			//TODO: implement remove!
		}


	});


    L.control.tagFilterButton = function (options) {
        return new L.Control.TagFilterButton(options);
    };



}).call(this);