function receiveMessage(e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo") {
		switch (e.data.reason) {
			case "NewTheme":
				document.querySelectorAll("link.previewTheme").forEach(theme => theme.remove());
				
				var theme = document.createElement("link");
				theme.classList.add("previewTheme");
				theme.type = "text/css";
				theme.rel = "Stylesheet";
				theme.href = e.data.url;
					
				document.querySelector("head").appendChild(theme);
				break;
		}
	}
}

window.addEventListener("message", receiveMessage, false);
