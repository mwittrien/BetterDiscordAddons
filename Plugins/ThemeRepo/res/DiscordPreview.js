function receiveMessage(e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo" && e.data.reason == "NewTheme") {
		document.querySelectorAll("link.previewTheme").forEach(theme => theme.remove());
		
		var theme = document.createElement("link");
		theme.classList.add("previewTheme");
		theme.type = "text/css";
		theme.rel = "Stylesheet";
		theme.href = e.data.url;
			
		document.querySelector("head").appendChild(theme);
	}
}

window.addEventListener("message", receiveMessage, false);
