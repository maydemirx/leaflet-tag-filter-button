# Leaflet Tag Filter Button
Adds tag filter control for marker to LeafLet. 

Required [Leaflet.EasyButton](https://github.com/CliffCloud/Leaflet.EasyButton)

Check out the [demo](http://maydemirx.github.io/leaflet-tag-filter-button/)

Usage
-----

Simple usage :

If your markers contains tags option the plugin filters them by selected tags when popup is closed
For example:

```

var map = L.map('map');

var fastMarker = L.marker([50.5, 30.5], { tags: ['fast'] }).addTo(map); 
var slowMarker = L.marker([50.5, 30.5], { tags: ['slow'] }).addTo(map);
var bothMarker = L.marker([50.5, 30.5], { tags: ['fast', 'slow'] }).addTo(map);

L.control.tagFilterButton({
	data: ['fast', 'slow']
}).addTo( map );

```


Set data from external url/ajax :

*note: this option not implemented yet!*

```

var map = L.map('map');
L.tagFilterButton({
	ajaxData: function(callback) {
		$.get('https://leaflet-tag-filter-button.herokuapp.com/data', function(data)) {
			callback(data);
		}
	}
}).addTo( map );


```

Selection complete callback

```

var map = L.map('map');
L.tagFilterButton({
	data: function(callback) {
		$.get('https://leaflet-tag-filter-button.herokuapp.com/data', function(data)) {
			callback(data);
		}
	},
	onSelectionComplete: function(tags) {
		console.log('selected tags are', tags);
	}
}).addTo( map );


```


----------


API Docs
------

### Options

Option                 | Type          | Default              | Description
-----------------------|---------------|----------------------|----------------------------
`icon`               | `String|HTML`  | `fa-filter`          | The button icon. Default is fa-filter. You can use html syntax for the icon for example `<img src="/filter.png">`
`onSelectionComplete`               | `Function`  | `null`    | The callback function for selected tags. It fires when popup is closed and sends selected tags to the callback function as a parameter.
`data`               | `Array|Function`  | `null`    | The data to be used for tags popup, it can be array or function
`clearText`               | `String`  | `clear`    | The text of the clear button

### Methods

Method                          | Returns		| Description
--------------------------------|---------------|----------------------------
`update()`                      | `void`			| Updates markers with last selected tags.
`hasFiltered()`                 | `Boolean`		| returns true if any tag(s) selected otherwise false.
`registerCustomSource(<`[`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)`> source`) | `throws an exception if `source` has no name or `source.hide` function is not implemented`		| Registers `source` object for filtering markers by tags. If you want to to use this function you must implement `hide` function  
`enablePruneCluster(<`[`PruneCluster`](https://github.com/SINTEF-9012/PruneCluster)`> pruneClusterInstance`) | `void`	| Searches markers for filtering on given `pruneClusterInstance` object
`resetCaches(<`[`Boolean`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)`> update?`) | `void` | Resets internal caches. if the `update` parameter sent as true, the `update()` function will be call after cleaning the cache.


----------

Change Log
-----

**v0.0.2 (30.06.2016)**

 - Added multi layer source support. 
 > You can add a new marker container layer source to plugin and the plugin searches on added source.
 
 - Added [PruneCluster](https://github.com/SINTEF-9012/PruneCluster) support.
 > Added [PruneCluster](https://github.com/SINTEF-9012/PruneCluster)  layer source to the plugin as default. You can enable it by enablePruneCluster function.

**v0.0.3 (18.08.2016)**
- Moved css of filter info box from code-side to css-side
- Added resetCaches function for cleaning the internal caches


Authors
-------

* Mehmet Aydemir
