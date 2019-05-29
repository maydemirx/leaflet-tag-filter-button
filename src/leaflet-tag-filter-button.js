(function() {

    L.Control.TagFilterButton = L.Control.extend({

        options: {
            icon: "fa-filter", //buton icon default is fa-filter
            onSelectionComplete: null, // the callback function for selected tags
            data: null, // the data to be used for tags popup, it can be array or function
            clearText: 'clear', // the text of the clear button
            filterOnEveryClick: false, // if set as true the plugin do filtering operation on every click event on the checkboxes
            openPopupOnHover: false, // if set as true the popup that contains tags will be open at mouse hover time

            ajaxData: null // it can be used for remote data TODO: implement it!
        },

        _map: null,
        _container: null,
        _easyButton: null,
        _tagEl: null,
        _clearEl: null,
        _filterInfo: null,
        _selectedTags: [],
        _invisibles: null,
        _releatedFilterButtons: null,
        layerSources: null,

        // GLOBAL FUNCTIONS

        /**
         * @function: resetCaches
         * Resets marker caches
         * @param update: if send as true, the @update function is called after cleaning the cache
         * */
        resetCaches: function(update) {
            if (typeof update !== 'boolean')
                update = true;
            this._invisibles = [];
            if (update) {
                this.update();
            }
        },

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

                            var releatedLayers = [];

                            for (var r = 0; r < this._releatedFilterButtons.length; r++) {
                                releatedLayers = releatedLayers.concat(this._releatedFilterButtons[r].getInvisibles());
                            }

                            var markers = layerSource.pruneCluster.GetMarkers();
                            for (i = 0; i < markers.length; i++) {
                                if (releatedLayers.indexOf(markers[i]) == -1 && markers[i].data && markers[i].data.tags) {
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

        /**
         * @function: addToReleated
         * @param other adds another linked tagFilterButton reference to _releatedFilterButtons
         *
         * */
        addToReleated: function(other) {
            if (other && other instanceof L.Control.TagFilterButton && this._releatedFilterButtons.indexOf(other) == -1) {
                this._releatedFilterButtons.push(other);
                return other.addToReleated(this);
            }
            console.error("could not add tagFilterButton instance to releated");
            return false;
        },

        /**
         * @function: getInvisibles
         * @param other gets invisibles layers hiding by this plugin
         *
         * */
        getInvisibles: function() {
            return this._invisibles;
        },

        _prepareLayerSources: function() {

            this.layerSources = new Object();
            this.layerSources["sources"] = new Object();

           this.registerCustomSource({
                "name": "default",
                "source": {
                    hide: function() {

                        var releatedLayers = [];

                        for (var r = 0; r < this._releatedFilterButtons.length; r++) {
                            releatedLayers = releatedLayers.concat(this._releatedFilterButtons[r].getInvisibles());
                        }

                        var toBeRemovedFromInvisibles = [], i;

                        for (i = 0; i < this._invisibles.length; i++) {
                            if (releatedLayers.indexOf(this._invisibles[i]) == -1) {
                                for (j = 0; j < this._invisibles[i].options.tags.length; j++) {
                                    if (this._selectedTags.length == 0 || this._selectedTags.indexOf(this._invisibles[i].options.tags[j]) !== -1) {
                                        this._map.addLayer(this._invisibles[i]);
                                        toBeRemovedFromInvisibles.push(i);
                                        break;
                                    }
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
                                    if (releatedLayers.indexOf(layer) == -1) {
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
            });
            this.layerSources.currentSource = this.layerSources.sources["default"];
        },

        _showFilterInfo: function(filteredCount) {
            if (this._selectedTags.length > 0) {
                this._filterInfo.innerText = filteredCount.toString();
                this._filterInfo.style.display = "";
            } else {
                this._filterInfo.style.display = "none";
            }
        },

        _checkItem: function(item) {
            item.getElementsByClassName('checkbox')[0].style.display = "inline-block";
            item.dataset.checked = "checked";
        },

        _uncheckItem: function(item) {
            item.dataset.checked = "";
            item.getElementsByClassName('checkbox')[0].style.display = "none";
        },

        _onClickToItem: function(e) {
            L.DomEvent.stop(e);
            var li = this.element;
            var context = this.context;
            if (!li.dataset.checked) {
                context._checkItem(li);
            } else {
                context._uncheckItem(li);
            }
            if (context.options.filterOnEveryClick) {
                context.filter.call(context);
            }
        },

        _preparePopup: function(data) {
            
            this._tagEl.innerHTML = '';

            for (var i = 0; i < data.length; i++) {
                var li = L.DomUtil.create('li', 'ripple', this._tagEl);
                var checkbox = L.DomUtil.create('span', 'checkbox', li);
                var a = L.DomUtil.create('a', '', li);
                var text = data[i];
                var value = data[i];
                if (typeof text == 'object' && Object.keys(data[i]).length == 2) { // key,value
                    text = data[i].name;
                    value = data[i].value;
                }
                
                var checked = this._selectedTags.indexOf(value) !== -1;
                if (checked) {
                    checkbox.style.display = "inline-block";
                    li.dataset.checked = "checked";
                }
                checkbox.innerHTML= "&#10004;";
                li.dataset.value = value;
                a.innerText = text;

                L.DomEvent.addListener(li, 'dblclick', this._onClickToItem.bind({ context: this, element: li }));
                L.DomEvent.addListener(li, 'click', this._onClickToItem.bind({ context: this, element: li }));
                
                L.DomEvent.addListener(a, 'dblclick', function(e) {
                    L.DomEvent.stop(e);
                    this.context._onClickToItem.call(this, e);
                }.bind({ context: this, element: li }));

                L.DomEvent.addListener(a, 'click', function(e) {
                    L.DomEvent.stop(e);
                    this.context._onClickToItem.call(this, e);
                }.bind({ context: this, element: li }));


            }
            this._container.style.display = "block";
        },

        _clearSelections: function(e) {
            L.DomEvent.stop(e);
            this._selectedTags = [];
            var childCount = this._tagEl.childElementCount,
                children = this._tagEl.children,
                childCheckbox, i;

            this._selectedTags = [];

            for (i = 0; i < childCount; i++) {
                childCheckbox = children[i];
                if (childCheckbox) {
                    this._uncheckItem(childCheckbox);
                }
            }

            if (this.options.filterOnEveryClick) {
                this.filter();
            }
        },

        _showTagFilterPopup: function() {

            if (this._tagFilterPopupIsOpen()) {
                return;
            }

            this._easyButton.button.style.display = "none";
            this._filterInfo.style.display = "none";

            if (!this._container) {
                throw 'container is not initialized!';
            }

            if (!this.options.data && !this.options.ajaxData) {
                throw 'data is empty!';
            }

            if (this.options.data) {
                if (typeof this.options.data === 'function') {
                    this._preparePopup(this.options.data());
                } else {
                    this._preparePopup(this.options.data);
                }
            }

        },

        _tagFilterPopupIsOpen: function() {
            return this._container.style.display == 'block';
        },

        filter: function(withTags) {
            var checkboxContainer = (this._container.getElementsByTagName('div')[0]),
                childCount = this._tagEl.childElementCount,
                children = this._tagEl.children,
                childCheckbox, i, j;

            this._selectedTags = [];

            if (withTags) {
                var acceptingTags = [];
                for (i = 0; i < withTags.length; i++) {
                    if (this.options.data.indexOf(withTags[i]) !== -1) {
                        acceptingTags.push(withTags[i]);
                    }
                }
                withTags = acceptingTags;
            }

            if (!withTags || !withTags.length) {
                for (i = 0; i < childCount; i++) {
                    childCheckbox = children[i];
                    if (childCheckbox && childCheckbox.dataset.checked) {
                        this._selectedTags.push(childCheckbox.dataset.value);
                    }
                }
            } else {
                this._selectedTags = withTags;
            }

            var filteredCount = this.layerSources.currentSource.hide.call(this, this.layerSources.currentSource);
            this._showFilterInfo(filteredCount);

            if (this.options.onSelectionComplete && typeof this.options.onSelectionComplete == 'function') {
                this.options.onSelectionComplete.call(this, this._selectedTags);
            }
        },

        hide: function(accept) {
            if (this._container && (this._container.style.display == "none" || this._container.style.display == "")) {
                return;
            }
            if (this._container) {
                this._container.style.display = "none";
            }
            this.filter();
            this._easyButton.button.style.display = "block";
        },

        initialize: function(options) {
            this._invisibles = [];
            this._releatedFilterButtons = [];
            L.Util.setOptions(this, options || {});
            this._prepareLayerSources();
        },

        addTo: function(map) {
            this._map = map;
            if (this.options.openPopupOnHover) {
                this._easyButton = L.easyButton(this.options.icon, function() {
                }).addTo(map);
                L.DomEvent.addListener(this._easyButton._container, 'mouseover', this._showTagFilterPopup.bind(this));
            } else {
                this._easyButton = L.easyButton(this.options.icon, this._showTagFilterPopup.bind(this)).addTo(map);
            }
            this._container = L.DomUtil.create('div', 'tag-filter-tags-container', this._easyButton._container);

            if (!L.Browser.touch) {
                L.DomEvent.disableClickPropagation(this._container);
                L.DomEvent.disableScrollPropagation(this._container);
            } else {
                L.DomEvent.on(this._container, 'click', L.DomEvent.stopPropagation);
            }

            this._filterInfo = L.DomUtil.create('span', 'filter-info-box', this._easyButton._container);
            this._showFilterInfo(0);

            this._clearEl = L.DomUtil.create('ul', 'header', this._container);
            this._clearEl.innerHTML = "<li class='ripple'><a>" + this.options.clearText + "</a></li>";

            L.DomEvent.addListener(this._clearEl.getElementsByTagName('a')[0], 'click', this._clearSelections.bind(this));
            L.DomEvent.addListener(this._clearEl.getElementsByTagName('li')[0], 'click', this._clearSelections.bind(this));

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
