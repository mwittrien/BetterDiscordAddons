function receiveMessage(e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo" && e.data.reason == "NewTheme") {
		$("link.previewTheme").remove());
		
		var ele = document.createElement("link");
		$(ele)
			.addClass("previewTheme")
			.attr("type", "text/css")
			.attr("rel", "Stylesheet")
			.attr("href", e.data.url);
			
		$("head").append(ele);
	}
}

window.addEventListener("message", receiveMessage, false);
