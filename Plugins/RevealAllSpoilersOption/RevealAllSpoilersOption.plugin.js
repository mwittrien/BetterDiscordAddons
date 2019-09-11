//META{"name":"RevealAllSpoilersOption","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RevealAllSpoilersOption","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RevealAllSpoilersOption/RevealAllSpoilersOption.plugin.js"}*//

class RevealAllSpoilersOption {
	getName () {return "RevealAllSpoilersOption";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds an entry to the message contextmenu to reveal all spoilers within a messageblock.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"StandardSidebarView":"componentWillUnmount"
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
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	onMessageContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.message && instance.props.target && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			let messagediv = BDFDB.getParentEle(BDFDB.dotCN.messagegroup + "> [aria-disabled]", instance.props.target);
			if (!messagediv || !messagediv.querySelector(BDFDB.dotCN.spoilerhidden)) return;
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue.props.children, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const itemgroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: "Reveal all Spoilers",
						hint: BDFDB.isPluginEnabled("MessageUtilities") ? window.bdplugins.MessageUtilities.plugin.getActiveShortcutString("__Reveal_Spoilers") : null,
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-reveal-contextMenuItem`,
						action: e => {
							BDFDB.closeContextMenu(menu);
							this.revealAllSpoilers(messagediv);
						}
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	revealAllSpoilers (target) {
		let messagediv = BDFDB.getParentEle(BDFDB.dotCN.messagegroup + "> [aria-disabled]", target);
		if (!messagediv) return;
		for (let spoiler of messagediv.querySelectorAll(BDFDB.dotCN.spoilerhidden)) spoiler.click();
	}
}