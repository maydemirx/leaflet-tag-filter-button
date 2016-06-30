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
        _filterInfo: null,
        _selectedTags: [],
        _invisibles: [],

        // GLOBAL FUNCTIONS

        /**
         * @function: update
         * Update markers by last selected tags
         *
         * */
        update: function() {
            var filteredCount = this.layerSources.currentSource.hide.call(this, this.layerSources.currentSource);
            this._showFilterInfo(filteredCount);
        },

        /**
         * @function: hasFiltered
         * returns true if any tag(s) selected otherwise false
         *
         * */
        hasFiltered: function () {
          return this._selectedTags.length > 0;
        },

        /**
         * @function: registerCustomSource
         * Register @source object for filtering markers by tags. If you want to use this function
         * you must implement @hide function.
         * @param source reference of the new marker source. It must have name and source item
         *
         * */
        registerCustomSource: function(source) {
            if (source.name && source.source && typeof source.source.hide === 'function') {
                this.layerSources.sources[source.name] = source.source;
            } else {
                throw 'Layer source is incompatible';
            }
        },

        /**
         * @function: enablePruneCluster
         * @param pruneClusterInstance adds pruneCluster reference to layersources
         *
         * */
        enablePruneCluster: function (pruneClusterInstance) {
            this.registerCustomSource({
                "name": "pruneCluster",
                "source": {
                    pruneCluster: pruneClusterInstance,
                    hide: function(layerSource) {
                        var toBeRemovedFromInvisibles = [], i, j;

                        for (i = 0; i < this._invisibles.length; i++) {
                            for (j = 0; j < this._invisibles[i].data.tags.length; j++) {
                                if (this._selectedTags.length == 0 || this._selectedTags.indexOf(this._invisibles[i].data.tags[j]) !== -1) {
                                    layerSource.pruneCluster.RegisterMarker(this._invisibles[i]);
                                    toBeRemovedFromInvisibles.push(i);
                                    break;
                                }
                            }
                        }

                        while(toBeRemovedFromInvisibles.length > 0) {
                            this._invisibles.splice(toBeRemovedFromInvisibles.pop(), 1);
                        }

                        var removedMarkers = [];
                        var totalCount = 0;

                        if (this._selectedTags.length > 0) {

                            var markers = layerSource.pruneCluster.GetMarkers();
                            for (i = 0; i < markers.length; i++) {
                                if (markers[i].data && markers[i].data.tags) {
                                    totalCount++;
                                    var found = false;
                                    for (var j = 0; j < markers[i].data.tags.length; j++) {
                                        found = this._selectedTags.indexOf(markers[i].data.tags[j]) !== -1;
                                        if (found) {
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        removedMarkers.push(markers[i]);
                                    }
                                }
                            }

                            for (i = 0; i < removedMarkers.length; i++) {
                                this._invisibles.push(removedMarkers[i]);
                            }

                            layerSource.pruneCluster.RemoveMarkers(removedMarkers);

                        }


                        layerSource.pruneCluster.ProcessView();

                        return totalCount - removedMarkers.length;
                    }
                }
            });

            this.layerSources.currentSource = this.layerSources.sources["pruneCluster"];
        },

        layerSources: {

            currentSource: null,

            sources: {
                default: {
                    hide: function() {

                        var toBeRemovedFromInvisibles = [], i;

                        for (i = 0; i < this._invisibles.length; i++) {
                            for (j = 0; j < this._invisibles[i].options.tags.length; j++) {
                                if (this._selectedTags.length == 0 || this._selectedTags.indexOf(this._invisibles[i].options.tags[j]) !== -1) {
                                    this._map.addLayer(this._invisibles[i]);
                                    toBeRemovedFromInvisibles.push(i);
                                    break;
                                }
                            }
                        }

                        while(toBeRemovedFromInvisibles.length > 0) {
                            this._invisibles.splice(toBeRemovedFromInvisibles.pop(), 1);
                        }

                        var removedMarkers = [];
                        var totalCount = 0;

                        if (this._selectedTags.length > 0) {

                            this._map.eachLayer(function(layer) {
                                if (layer && layer.options && layer.options.tags) {
                                    totalCount++;
                                    var found = false;
                                    for (var i = 0; i < layer.options.tags.length; i++) {
                                        found = this._selectedTags.indexOf(layer.options.tags[i]) !== -1;
                                        if (found) {
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        removedMarkers.push(layer);
                                    }
                                }
                            }.bind(this));

                            for (i = 0; i < removedMarkers.length; i++) {
                                this._map.removeLayer(removedMarkers[i]);
                                this._invisibles.push(removedMarkers[i]);
                            }

                        }

                        return totalCount - removedMarkers.length;
                    }
                }
            }
        },

        _showFilterInfo: function(filteredCount) {
            if (this._selectedTags.length > 0) {
                this._filterInfo.innerText = filteredCount.toString();
                this._filterInfo.style.display = "";
            } else {
                this._filterInfo.style.display = "none";
            }
        },

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
            this._filterInfo.style.display = "none";

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

            var filteredCount = this.layerSources.currentSource.hide.call(this, this.layerSources.currentSource);
            this._showFilterInfo(filteredCount);

            if (this.options.onSelectionComplete && typeof this.options.onSelectionComplete == 'function') {
                this.options.onSelectionComplete.call(this, this._selectedTags);
            }

            this._easyButton.button.style.display = "block";
        },

        initialize: function(options) {
            L.Util.setOptions(this, options || {});
            this.layerSources.currentSource = this.layerSources.sources["default"];
        },

        addTo: function(map) {
            this._map = map;
            this._easyButton = L.easyButton(this.options.icon, this._showTagFilterPopup.bind(this)).addTo(map);
            this._container = L.DomUtil.create('div', 'tag-filter-tags-container', this._easyButton._container);

            this._filterInfo = L.DomUtil.create('span', 'label bg-dark-cold-grey', this._easyButton._container);
            this._filterInfo.style.position = "absolute";
            this._filterInfo.style.marginTop = "-5px";
            this._filterInfo.style.marginLeft = "-5px";
            this._filterInfo.style.color = "white";
            this._filterInfo.style.fontSize = "12px";

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