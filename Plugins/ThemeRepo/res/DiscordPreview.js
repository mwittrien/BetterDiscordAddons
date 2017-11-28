$(window).on("message", (e) => {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo" && e.data.reason == "NewTheme") {
		$("link.previewTheme").remove();
		$("head").append(`<link class="previewTheme" type="text/css" rel="Stylesheet" href="${e.data.url}"></link>`);
	}
});
