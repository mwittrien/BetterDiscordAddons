//META{"name":"SteamProfileLink","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SteamProfileLink","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SteamProfileLink/SteamProfileLink.plugin.js"}*//

var SteamProfileLink = (_ => {
	var settings = {};
	
	return class SteamProfileLink {
		getName () {return "SteamProfileLink";}

		getVersion () {return "1.0.9";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Opens any Steam links in Steam instead of your internet browser.";}

		constructor () {
			this.changelog = {
				"improved":[["Support links","Also works for support links now"]]
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					useChromium: 			{value:false,			description:"Use inbuilt browser instead of default if fails to open Steam"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [];
			
			settingsItems = settingsItems.concat(this.createSelects(false));
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);

				BDFDB.ListenerUtils.add(this, document, "click", "a[href^='https://steamcommunity.'], a[href^='https://help.steampowered.'], a[href^='https://store.steampowered.'], a[href*='a.akamaihd.net/'][href*='steam']", e => {this.openInSteam(e, e.currentTarget.href);});
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.PluginUtils.clear(this);
			}
		}

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		openInSteam (e, url) {
			BDFDB.ListenerUtils.stopEvent(e);
			BDFDB.LibraryRequires.request(url, (error, response, body) => {
				if (BDFDB.LibraryRequires.electron.shell.openExternal("steam://openurl/" + response.request.href));
				else BDFDB.DiscordUtils.openLink(response.request.href, settings.useChromium);
			});
		}
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
		}
	}
})();

module.exports = SteamProfileLink;