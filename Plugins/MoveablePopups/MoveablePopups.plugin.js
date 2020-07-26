//META{"name":"MoveablePopups","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/MoveablePopups","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/MoveablePopups/MoveablePopups.plugin.js"}*//

var MoveablePopups = (_ => {
	return class MoveablePopups {
		getName () {return "MoveablePopups";}

		getVersion () {return "1.1.7";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "DISCONTINUED";}

		// Legacy
		load () {}

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
				
				BDFDB.ModalUtils.open(this, {
					header: this.name,
					subheader: "Delete?",
					text: `This plugin is discontinued, click "${BDFDB.LanguageUtils.LanguageStrings.DELETE}" to delete all remaining files created by this plugin.`,
					buttons: [{
						color: "RED",
						contents: BDFDB.LanguageUtils.LanguageStrings.DELETE,
						close: true,
						click: _ => {
							BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), `${this.name}.config.json`), _ => {});
							BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), `${this.name}.plugin.js`), _ => {});
						}
					}],
					onClose: _ => {
						BDFDB.BDUtils.disablePlugin(this.name);
					}
				});
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions
	}
})();

module.exports = MoveablePopups;