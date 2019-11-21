//META{"name":"RevealAllSpoilersOption","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RevealAllSpoilersOption","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RevealAllSpoilersOption/RevealAllSpoilersOption.plugin.js"}*//

class RevealAllSpoilersOption {
	getName () {return "RevealAllSpoilersOption";}

	getVersion () {return "1.0.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds an entry to the message contextmenu to reveal all spoilers within a messageblock.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	onMessageContextMenu (e) {
		if (e.instance.props.message && e.instance.props.target) {
			let messagediv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagegroup + "> [aria-disabled]," + BDFDB.dotCN.messagegroup + "> * > [aria-disabled]", e.instance.props.target);
			if (!messagediv || !messagediv.querySelector(BDFDB.dotCN.spoilerhidden)) return;
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
			const itemgroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: "Reveal all Spoilers",
						hint: BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Reveal_Spoilers") : null,
						action: _ => {
							BDFDB.ContextMenuUtils.close(e.instance);
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
		let messagediv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagegroup + "> [aria-disabled]," + BDFDB.dotCN.messagegroup + "> * > [aria-disabled]", target);
		if (!messagediv) return;
		for (let spoiler of messagediv.querySelectorAll(BDFDB.dotCN.spoilerhidden)) spoiler.click();
	}
}