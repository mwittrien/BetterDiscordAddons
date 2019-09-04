//META{"name":"RevealAllSpoilersOption","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RevealAllSpoilersOption","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RevealAllSpoilersOption/RevealAllSpoilersOption.plugin.js"}*//

class RevealAllSpoilersOption {
	getName () {return "RevealAllSpoilersOption";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds an entry to the message contextmenu to reveal all spoilers within a messageblock.";}

	initConstructor () {
		this.messageContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} revealspoilers-item">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">Reveal all Spoilers</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;
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
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
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

	onMessageContextMenu (instance, menu) {
		if (instance.props && instance.props.message && instance.props.target && !menu.querySelector(".revealspoilers-item")) {
			let messagediv = BDFDB.getParentEle(BDFDB.dotCN.message, instance.props.target);
			if (!messagediv || !messagediv.querySelector(BDFDB.dotCN.spoilerhidden)) return;
			let devgroup = BDFDB.getContextMenuDevGroup(menu);
			let messageContextEntry = BDFDB.htmlToElement(this.messageContextEntryMarkup);
			if (devgroup) devgroup.parentElement.insertBefore(messageContextEntry, devgroup);
			else menu.appendChild(messageContextEntry, menu);
			let revealitem = messageContextEntry.querySelector(".revealspoilers-item");
			revealitem.addEventListener("click", () => {
				instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
				this.revealAllSpoilers(messagediv);
			});
			if (BDFDB.isPluginEnabled("MessageUtilities")) {
				BDFDB.setContextHint(revealitem, window.bdplugins.MessageUtilities.plugin.getActiveShortcutString("__Reveal_Spoilers"));
			}
		}
	}

	revealAllSpoilers (target) {
		let messagediv = BDFDB.getParentEle(BDFDB.dotCN.message, target);
		if (!messagediv) return;
		for (let spoiler of messagediv.querySelectorAll(BDFDB.dotCN.spoilerhidden)) spoiler.click();
	}
}