//META{"name":"SteamProfileLink","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SteamProfileLink","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SteamProfileLink/SteamProfileLink.plugin.js"}*//

class SteamProfileLink {
	getName () {return "SteamProfileLink";}

	getVersion () {return "1.0.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Opens any Steam links in Steam instead of your internet browser.";}

	constructor () {
		this.changelog = {
			"improved":[["Activity + Store Links","Plugin now covers any links in the Discord Activity and Store"]]
		};
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.addEventListener(this, document, "click", "a[href^='https://steamcommunity.'], a[href^='https://store.steampowered.'], a[href*='a.akamaihd.net/'][href*='steam']", e => {this.openInSteam(e, e.currentTarget.href);});

			BDFDB.addEventListener(this, document, "click", BDFDB.dotCN.cardstore + BDFDB.dotCN.cardstoreinteractive, e => {
				let news = BDFDB.getReactValue(e.currentTarget, "return.return.memoizedProps.news");
				if (news && news.url && news.url.includes("steam")) this.openInSteam(e, news.url);
			});
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".urlCheckFrame");

			BDFDB.unloadMessage(this);
		}
	}

	openInSteam (e, url) {
		BDFDB.stopEvent(e);
		BDFDB.LibraryRequires.request(url, (error, response, body) => {
			if (BDFDB.LibraryRequires.electron.shell.openExternal("steam://openurl/" + response.request.href));
			else window.open(response.request.href, "_blank");
		});
	}
}