# Leaflet Tag Filter Button
Adds tag filter control for marker to LeafLet

Required [Leaflet.EasyButton](https://github.com/CliffCloud/Leaflet.EasyButton)

Check out the [demo](https://leaflet-tag-filter-button.herokuapp.com)

Usage
-----

Simple usage :

```

var map = L.map('map');
L.tagFilterButton({
	data: ['fast', 'slow']
}).addTo( map );

```

Set data from external url/ajax :


```

var map = L.map('map');
L.tagFilterButton({
	data: function(callback) {
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


Authors
-------

* Mehmet Aydemir