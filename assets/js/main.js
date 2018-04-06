$(document).ready(function() {
    
    /* ===== Affix Sidebar ===== */
    /* Ref: http://getbootstrap.com/javascript/#affix-examples */

        
    $('#doc-menu').affix({
        offset: {
            top: ($('#header').outerHeight(true) + $('#doc-header').outerHeight(true)) + 45,
            bottom: ($('#footer').outerHeight(true) + $('#promo-block').outerHeight(true)) + 75
        }
    });
    
    /* Hack related to: https://github.com/twbs/bootstrap/issues/10236 */
    $(window).on('load resize', function() {
        $(window).trigger('scroll'); 
    });

    /* Activate scrollspy menu */
    $('body').scrollspy({target: '#doc-nav', offset: 100});
    
    /* Smooth scrolling */
    $('a.scrollto').on('click', function(e){
        //store hash
        var target = this.hash;    
        e.preventDefault();
        $('body').scrollTo(target, 800, {offset: 0, 'axis':'y'});
        
    });
    
    
    /* ======= jQuery Responsive equal heights plugin ======= */
    /* Ref: https://github.com/liabru/jquery-match-height */
    
     $('#cards-wrapper .item-inner').matchHeight();
     $('#showcase .card').matchHeight();
     
    /* Bootstrap lightbox */
    /* Ref: http://ashleydw.github.io/lightbox/ */

    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(e) {
        e.preventDefault();
        $(this).ekkoLightbox();
    });    


    var simpleUsageMap = L.map('simple-usage-map').setView([36.86, 30.75], 12);
    var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWF5ZGVtaXJ4IiwiYSI6ImNpbGIweWdmMDAwM3h2cWx6a2QxaTc5YmMifQ.dpkSDE4DYKn6in5ODl_pWg', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(simpleUsageMap);


    var fastMarker = L.marker([36.8963965256, 30.7087719440], { tags: ['fast'] }).addTo(simpleUsageMap).bindPopup('fast'); 
    var slowMarker = L.marker([36.8967740487, 30.7107782364], { tags: ['slow'] }).addTo(simpleUsageMap).bindPopup('slow');
    var bothMarker = L.marker([36.8881768737, 30.7024331594], { tags: ['fast', 'slow'] }).addTo(simpleUsageMap).bindPopup('fast & slow');

    //

    L.control.tagFilterButton({
        data: ['fast', 'slow', 'none'],
        icon: '<img src="filter.png">',
        filterOnEveryClick: true
    }).addTo( simpleUsageMap );



   var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            osm = L.tileLayer(osmUrl, {
                maxZoom: 18,
                attribution: osmAttrib
            });

        // initialize the map on the "map" div with a given center and zoom
        var releatedUsageMap = L.map('releated-usage-map').setView([50.5, 30.5], 12).addLayer(osm);

    L.marker([50.521, 30.52], { tags: ['tomato', 'active'] }).bindPopup('tomato, active').addTo(releatedUsageMap); 
    L.marker([50.487, 30.54], { tags: ['tomato', 'ended'] }).bindPopup('tomato, ended').addTo(releatedUsageMap);
    L.marker([50.533, 30.5], { tags: ['tomato', 'ended'] }).bindPopup('tomato, ended').addTo(releatedUsageMap);
    L.marker([50.54, 30.48], { tags: ['strawberry', 'active'] }).bindPopup('strawberry, active').addTo(releatedUsageMap);
    L.marker([50.505, 30.46], { tags: ['strawberry', 'ended'] }).bindPopup('strawberry, ended').addTo(releatedUsageMap);
    L.marker([50.5, 30.43], { tags: ['cherry', 'active'] }).bindPopup('cherry, active').addTo(releatedUsageMap);
    L.marker([50.48, 30.5], { tags: ['cherry', 'ended'] }).bindPopup('cherry, ended').addTo(releatedUsageMap);

    var statusFilterButton = L.control.tagFilterButton({
        data: ['active', 'ended'],
      filterOnEveryClick: true,
      icon: '<i class="fa fa-suitcase"></i>',
    }).addTo( releatedUsageMap );

    var foodFilterButton = L.control.tagFilterButton({
        data: ['tomato', 'cherry', 'strawberry'],
      filterOnEveryClick: true,
        icon: '<i class="fa fa-pagelines"></i>',
    }).addTo( releatedUsageMap );

    foodFilterButton.addToReleated(statusFilterButton);

    jQuery('.easy-button-button').click(function() {
        target = jQuery('.easy-button-button').not(this);
        target.parent().find('.tag-filter-tags-container').css({
            'display' : 'none',
        });
    });


});