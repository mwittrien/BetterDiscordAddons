//META{"name":"ServerCounter","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerCounter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerCounter/ServerCounter.plugin.js"}*//

var ServerCounter = (_ => {
	return class ServerCounter {
		getName () {return "ServerCounter";}

		getVersion () {return "1.0.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a server counter to the server list.";}

		constructor () {
			this.patchedModules = {
				after: {
					Guilds: "render"
				}
			};
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
				
				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else {
				console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
			}
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.PluginUtils.clear(this);
			}
		}

		
		// Begin of own functions
		
		processGuilds (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ConnectedUnreadDMs"});
			if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.guildouter,
				children: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS.guildslabel + BDFDB.disCN._servercounterservercount,
					children: `${BDFDB.LanguageUtils.LanguageStrings.SERVERS} - ${BDFDB.LibraryModules.FolderStore.getFlattenedGuildIds().length}`
				})
			}));
		}
	}
})();

module.exports = ServerCounter;