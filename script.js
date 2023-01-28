$(".image-slider-range").on("input change", function(event) {
	var element = $(this).parents(".image-slider");
	var pos = event.target.value;
	
	element.find(".image-slider-before").css({width: pos + "%"});
	element.find(".image-slider-button").css({left: "calc(" + pos + "% - 18px)"});
});