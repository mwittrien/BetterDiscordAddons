function receiveMessage(e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo") {
		switch (e.data.reason) {
			case "OnLoad":
				var body = document.querySelector("body");
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_USERNAME", "g"), e.data.username);
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_AVATAR", "g"), e.data.avatar);
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_DISCRIMINATOR", "g"), e.data.discriminator);
				break;
			case "NewTheme":
				document.querySelectorAll("style.previewTheme").forEach(theme => theme.remove());
				
				var theme = document.createElement("style");
				theme.classList.add("previewTheme");
				theme.innerText = e.data.css;
					
				document.querySelector("head").appendChild(theme);
				break;
			case "DarkLight":
				break;
		}
	}
}

window.addEventListener("message", receiveMessage, false);

window.onload = function () {
	window.parent.postMessage({origin:"DiscordPreview",reason:"OnLoad"},"*");
};
