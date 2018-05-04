window.onload = function () {
	window.parent.postMessage({origin:"DiscordPreview",reason:"OnLoad"},"*");
};
window.onkeyup = function (e) {
	window.parent.postMessage({origin:"DiscordPreview",reason:"KeyUp",key:e.which},"*");
};
window.onmessage = function (e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo") {
		switch (e.data.reason) {
			case "OnLoad":
				document.body.innerHTML = document.body.innerHTML.replace(new RegExp("REPLACE_USERNAMESMALL", "g"), e.data.username.toLowerCase());
				document.body.innerHTML = document.body.innerHTML.replace(new RegExp("REPLACE_USERNAME", "g"), e.data.username);
				document.body.innerHTML = document.body.innerHTML.replace(new RegExp("REPLACE_USERID", "g"), e.data.id);
				document.body.innerHTML = document.body.innerHTML.replace(new RegExp("REPLACE_AVATAR", "g"), e.data.avatar.split('"').join(''));
				document.body.innerHTML = document.body.innerHTML.replace(new RegExp("REPLACE_DISCRIMINATOR", "g"), e.data.discriminator);
				if (e.data.nativecss) {
					var theme = document.createElement("link");
					theme.classList.add(e.data.reason);
					theme.rel = "stylesheet";
					theme.href = e.data.nativecss;
					document.head.appendChild(theme);
				}
				document.body.firstElementChild.style.display = "flex";
				break;
			case "NewTheme":
			case "CustomCSS":
			case "ThemeFixer":
				document.querySelectorAll("style." + e.data.reason).forEach(theme => theme.remove());
				if (e.data.checked) {
					var theme = document.createElement("style");
					theme.classList.add(e.data.reason);
					theme.innerText = e.data.css;
					document.head.appendChild(theme);
				}
				break;
			case "DarkLight":
				if (e.data.checked) {
					document.body.innerHTML = document.body.innerHTML.replace(new RegExp("theme-dark", "g"), "theme-light");
				}
				else {
					document.body.innerHTML = document.body.innerHTML.replace(new RegExp("theme-light", "g"), "theme-dark");
				}
				break;
		}
	}
};
