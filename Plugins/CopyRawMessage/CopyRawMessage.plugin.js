//META{"name":"CopyRawMessage"}*//

class CopyRawMessage {
	getName () {return "CopyRawMessage";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a entry in the contextmenu when you right click a message that allows you to copy the raw contents of a message.";}

	initConstructor () {
		this.messageContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} copyrawmessage-item">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">Copy Raw Message</div></span>
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
		if (instance.props && instance.props.message && instance.props.message.content && instance.props.target && !menu.querySelector(".copyrawmessage-item")) {
			let messageContextEntry = BDFDB.htmlToElement(this.messageContextEntryMarkup);
			let devgroup = BDFDB.getContextMenuDevGroup(menu);
			if (devgroup) devgroup.parentElement.insertBefore(messageContextEntry, devgroup);
			else menu.appendChild(messageContextEntry, menu);
			let copyrawmessageitem = messageContextEntry.querySelector(".copyrawmessage-item");
			copyrawmessageitem.addEventListener("click", () => {
				BDFDB.closeContextMenu(menu);
				require("electron").clipboard.write({text:instance.props.message.content});
			});
		}
	}
}