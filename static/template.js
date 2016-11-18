(function($) {
    $.templatePlugin = function() {
        var innerContainer = $('<div/>',{
                   'class':'innerContainer',
                    id: 'innerContainer'
                });

		var heroUnit = $('<div/>',{
                   'class':'hero-unit',
                    id: 'hero-unit'
                });

		var navBar = $('<ul/>',{
		            'class':'nav nav-tabs',
		            id: 'navBar'
				});

		// Initialize the canvas
    	var underCanvas = $('<canvas/>',{
                   'class':'canvas',
                    id: 'underCanvas'
                }).prop({
                    width: 500,
                    height: 500
                });

        var overCanvas = $('<canvas/>',{
                   'class':'canvas',
                    id: 'overCanvas'
                }).prop({
                    width: 500,
                    height: 500
                });

        $('#container').append(innerContainer);
        $('#innerContainer').append(heroUnit);
        $('#hero-unit').append(navBar);

        var vanilla='<li id="vanilla" class="active"><a href="#">'+'Vanilla'+'</a></li>';
        var blurry='<li id="blurry"><a href="#">'+'Blurry'+'</a></li>';
        var reveal='<li id="reveal"><a href="#">'+'Reveal'+'</a></li>';
        $("#navBar").append(vanilla);
        $("#navBar").append(blurry);
        $("#navBar").append(reveal);

        $('#hero-unit').append(underCanvas);
        $('#hero-unit').append(overCanvas);

        $('#vanilla')[0].onclick = function(e) {
            $('#vanilla').addClass('active');
            $('#blurry').removeClass('active');
            $('#reveal').removeClass('active');
            $.vanilla();
        }

        $('#blurry')[0].onclick = function(e) {
            $('#vanilla').removeClass('active');
            $('#blurry').addClass('active');
            $('#reveal').removeClass('active');
            $.blurry();
        }

        $('#reveal')[0].onclick = function(e) {
            $('#vanilla').removeClass('active');
            $('#blurry').removeClass('active');
            $('#reveal').addClass('active');
            $.reveal();
        }

    }
})(jQuery);

$.templatePlugin();
$.vanilla();
