window.onload = function () {
	window.parent.postMessage({origin:"DiscordPreview",reason:"OnLoad"},"*");
};
window.onkeyup = function (e) {
	window.parent.postMessage({origin:"DiscordPreview",reason:"KeyUp",key:e.which},"*");
};
window.onmessage = function (e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo") {
		var body = document.querySelector("body"), head = document.querySelector("head"), theme;
		switch (e.data.reason) {
			case "OnLoad":
				head.appendChild(theme);
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_USERNAME", "g"), e.data.username);
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_AVATAR", "g"), e.data.avatar.split('"').join(''));
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_DISCRIMINATOR", "g"), e.data.discriminator);
				if (e.data.nativecss) {
					theme = document.createElement("link");
					theme.classList.add(e.data.reason);
					theme.rel = "stylesheet";
					theme.href = e.data.nativecss;
					head.appendChild(theme);
				}
				break;
			case "NewTheme":
			case "CustomCSS":
			case "ThemeFixer":
				document.querySelectorAll("style." + e.data.reason).forEach(theme => theme.remove());
				if (e.data.checked) {
					theme = document.createElement("style");
					theme.classList.add(e.data.reason);
					theme.innerText = e.data.css;
					head.appendChild(theme);
				}
				break;
			case "DarkLight":
				if (e.data.checked) {
					body.innerHTML = body.innerHTML.replace(new RegExp("theme-dark", "g"), "theme-light");
				}
				else {
					body.innerHTML = body.innerHTML.replace(new RegExp("theme-light", "g"), "theme-dark");
				}
				break;
		}
	}
};
