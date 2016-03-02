(function() {

    L.Control.TagFilterButton = L.Control.extend({

        options: {
            icon: "fa-filter", //buton icon default is fa-filter
            onSelectionComplete: null, // the callback function for selected tags
            data: null, // the data to be used for tags popup, it can be array or function
            clearText: 'clear', // the text of the clear button

            ajaxData: null // it can be used for remote data TODO: implement it!
        },

        _map: null,
        _container: null,
        _easyButton: null,
        _tagEl: null,
        _selectedTags: [],
        _removedMarkers: [],

        _preparePopup: function(data) {
            for (var i = 0; i < data.length; i++) {
                var div = L.DomUtil.create('div', '', this._container);
                var label = L.DomUtil.create('label', '', div);
                var text = data[i];
                var value = data[i];
                if (typeof text == 'object' && Object.keys(data[i]) == 2) { // key,value
                    text = data[i].name;
                    value = data[i].value;
                }
                var checked = this._selectedTags.indexOf(value) !== -1;
                label.innerHTML = '<input type="checkbox" ' + (checked ? 'checked="true"' : '') + 'data-value="' + value + '" class="regular-checkbox"/><label></label> ' + text;
                label.style.width = '100%';

                L.DomEvent.addListener(label, 'dblclick', L.DomEvent.stop);
                L.DomEvent.addListener(label, 'click', function(e) {
                    L.DomEvent.stop(e);
                    var checkbox = this.getElementsByTagName("input")[0];
                    checkbox.checked = !checkbox.checked;
                });
            }
            this._container.style.display = "block";
        },

        _clearSelections: function(e) {
            L.DomEvent.stop(e);
            this._selectedTags = [];
            var checkboxContainer = (this._container.getElementsByTagName('div')[0]),
                childCount = this._container.childElementCount,
                children = this._container.children,
                childCheckbox, i;

            this._selectedTags = [];

            for (i = 0; i < childCount; i++) {
                childCheckbox = children[i].getElementsByTagName('input')[0];
                if (childCheckbox && childCheckbox.checked) {
                    childCheckbox.checked = false;
                }
            }
        },

        _showTagFilterPopup: function() {

            this._easyButton.button.style.display = "none";

            if (!this._container) {
                throw 'container is not initialized!';
            }

            if (!this.options.data && !this.options.ajaxData) {
                throw 'data is empty!';
            }

            this._container.innerHTML = '<a href="#">' + this.options.clearText + '</a>';
            var clearButton = this._container.getElementsByTagName('a')[0];
            L.DomEvent.addListener(this._container, 'click', this._clearSelections.bind(this));

            if (this.options.data) {
                if (typeof this.options.data === 'function') {
                    this._preparePopup(this.options.data());
                } else {
                    this._preparePopup(this.options.data);
                }
            }

        },

        hide: function(accept) {

            if (this._container.style.display == "none") {
                return;
            }

            if (this._container) {
                this._container.style.display = "none";
            }

            var checkboxContainer = (this._container.getElementsByTagName('div')[0]),
                childCount = this._container.childElementCount,
                children = this._container.children,
                childCheckbox, i, j;

            this._selectedTags = [];

            for (i = 0; i < childCount; i++) {
                childCheckbox = children[i].getElementsByTagName('input')[0];
                if (childCheckbox && childCheckbox.checked) {
                    this._selectedTags.push(childCheckbox.getAttribute('data-value'));
                }
            }

            for (i = 0; i < this._removedMarkers.length; i++) {
                for (j = 0; j < this._removedMarkers[i].options.tags.length; j++) {
                    if (this._selectedTags.length == 0 || this._selectedTags.indexOf(this._removedMarkers[j].options.tags[i]) !== -1) {
                        this._map.addLayer(this._removedMarkers[i]);
                        break;
                    }
                }
            }

            this._removedMarkers = [];

            if (this._selectedTags.length > 0) {
                this._map.eachLayer(function(layer) {
                    if (layer && layer.options && layer.options.tags) {
                        var found = false;
                        for (var i = 0; i < layer.options.tags.length; i++) {
                            found = this._selectedTags.indexOf(layer.options.tags[i]) !== -1;
                        }
                        if (!found) {
                            this._removedMarkers.push(layer);
                        }
                    }
                }.bind(this));

                for (i = 0; i < this._removedMarkers.length; i++) {
                    this._map.removeLayer(this._removedMarkers[i]);
                }
            }

            if (this.options.onSelectionComplete && typeof this.options.onSelectionComplete == 'function') {
                this.options.onSelectionComplete.call(this, this._selectedTags);
            }

            this._easyButton.button.style.display = "block";
        },

        initialize: function(options) {
            L.Util.setOptions(this, options || {});
        },

        addTo: function(map) {
            this._map = map;
            this._easyButton = L.easyButton(this.options.icon, this._showTagFilterPopup.bind(this)).addTo(map);
            this._container = L.DomUtil.create('div', 'tag-filter-tags-container', this._easyButton._container);
            this._tagEl = L.DomUtil.create('ul', '', this._container);
            this._map.on('dragstart click', this.hide, this);
            L.DomEvent.addListener(this._container, 'dblclick', L.DomEvent.stop);
            L.DomEvent.addListener(this._container, 'click', L.DomEvent.stop);
            return this;
        },

        onRemove: function(map) {
            this._container.parentNode.removeChild(this._container);
            return this;
        }

    });

    L.control.tagFilterButton = function(options) {
        return new L.Control.TagFilterButton(options);
    };

}).call(this);