function receiveMessage(e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo") {
		switch (e.data.reason) {
			case "NewTheme":
				document.querySelectorAll("style.previewTheme").forEach(theme => theme.remove());
				
				var theme = document.createElement("style");
				theme.classList.add("previewTheme");
				theme.innerText = e.data.css;
					
				document.querySelector("head").appendChild(theme);
				break;
		}
	}
}

window.addEventListener("message", receiveMessage, false);
