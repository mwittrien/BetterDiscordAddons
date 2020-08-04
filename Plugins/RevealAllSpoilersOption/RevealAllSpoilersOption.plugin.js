//META{"name":"RevealAllSpoilersOption","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RevealAllSpoilersOption","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RevealAllSpoilersOption/RevealAllSpoilersOption.plugin.js"}*//

var RevealAllSpoilersOption = (_ => {
	return class RevealAllSpoilersOption {
		getName () {return "RevealAllSpoilersOption";}

		getVersion () {return "1.0.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds an entry to the message contextmenu to reveal all spoilers within a messageblock.";}

		constructor () {
			this.changelog = {
				"fixed":[["Context Menu Update","Fixes for the context menu update, yaaaaaay"]]
			};
		}


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

		onMessageContextMenu (e) {
			if (e.instance.props.message && e.instance.props.target) {
				let messageDiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, e.instance.props.target);
				if (!messageDiv || !messageDiv.querySelector(BDFDB.dotCN.spoilerhidden)) return;
				let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Reveal_Spoilers") : null;
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: "Reveal all Spoilers",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "reveal-all"),
						hint: hint && (_ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							});
						}),
						action: _ => {
							this.revealAllSpoilers(messageDiv);
						}
					})
				}));
			}
		}

		revealAllSpoilers (target) {
			let messageDiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, target);
			if (!messageDiv) return;
			for (let spoiler of messageDiv.querySelectorAll(BDFDB.dotCN.spoilerhidden)) spoiler.click();
		}
	}
})();

module.exports = RevealAllSpoilersOption;