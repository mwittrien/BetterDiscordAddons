//META{"name":"RevealAllSpoilersOption","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RevealAllSpoilersOption","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RevealAllSpoilersOption/RevealAllSpoilersOption.plugin.js"}*//

var RevealAllSpoilersOption = (_ => {
	return class RevealAllSpoilersOption {
		getName () {return "RevealAllSpoilersOption";}

		getVersion () {return "1.0.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds an entry to the message contextmenu to reveal all spoilers within a messageblock.";}

		constructor () {
			this.changelog = {
				"fixed":[["Message Update","Fixed the plugin for the new Message Update"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};
		}


		//legacy
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


		// begin of own functions

		onMessageContextMenu (e) {
			if (e.instance.props.message && e.instance.props.target) {
				let messagediv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, e.instance.props.target);
				if (!messagediv || !messagediv.querySelector(BDFDB.dotCN.spoilerhidden)) return;
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
							label: "Reveal all Spoilers",
							hint: BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Reveal_Spoilers") : null,
							action: _ => {
								BDFDB.ContextMenuUtils.close(e.instance);
								this.revealAllSpoilers(messagediv);
							}
						})
					]
				}));
			}
		}

		revealAllSpoilers (target) {
			let messagediv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, target);
			if (!messagediv) return;
			for (let spoiler of messagediv.querySelectorAll(BDFDB.dotCN.spoilerhidden)) spoiler.click();
		}
	}
})();