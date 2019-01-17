//META{"name":"SteamProfileLink"}*//

class SteamProfileLink {
	getName () {return "SteamProfileLink";}

	getVersion () {return "1.0.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Opens any Steam links in Steam instead of your internet browser.";}

	//legacy
	load () {}

	start () {
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {
				BDFDB.loaded = true;
				this.initialize();
			});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.loadMessage(this);
			
			BDFDB.addEventListener(this, document, "click", "a[href^='https://steamcommunity.'],a[href^='https://store.steampowered.']", e => {
				e.originalEvent.preventDefault();
				e.originalEvent.stopImmediatePropagation();
				if (require("electron").shell.openExternal("steam://openurl/" + e.currentTarget.href));
				else window.open(e.currentTarget.href, "_blank");
			});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {			
			BDFDB.unloadMessage(this);
		}
	}
}