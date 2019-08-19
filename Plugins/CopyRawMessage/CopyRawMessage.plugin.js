//META{"name":"CopyRawMessage"}*//

class CopyRawMessage {
	getName () {return "CopyRawMessage";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a entry in the contextmenu when you right click a message that allows you to copy the raw contents of a message.";}

	initConstructor () {
		this.changelog = {
			"added":[["Message 3-dot entry","Added the copy entry to the message 3-dot menu"]]
		};

		this.patchModules = {
			"Message":"componentDidMount",
			"MessageOptionPopout":"componentDidMount"
		};
		
		this.messageCopyRawEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} copyrawmessage-item">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">Copy Raw Message</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.popoutCopyRawEntryMarkup = 
			`<button role="menuitem" type="button" class="${BDFDB.disCNS.optionpopoutitem + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow} copyrawmessage-itembtn">
				<div class="${BDFDB.disCN.buttoncontents}">Copy raw</div>
			</button>`;
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
			let messageCopyRawEntry = BDFDB.htmlToElement(this.messageCopyRawEntryMarkup);
			let devgroup = BDFDB.getContextMenuDevGroup(menu);
			if (devgroup) devgroup.parentElement.insertBefore(messageCopyRawEntry, devgroup);
			else menu.appendChild(messageCopyRawEntry, menu);
			let copyrawmessageitem = messageCopyRawEntry.querySelector(".copyrawmessage-item");
			copyrawmessageitem.addEventListener("click", () => {
				BDFDB.closeContextMenu(menu);
				require("electron").clipboard.write({text:instance.props.message.content});
			});
		}
	}

	processMessage (instance, wrapper) {  
		if (instance.props && typeof instance.props.renderButtons == "function" && !wrapper.querySelector(BDFDB.dotCN.optionpopoutbutton) && BDFDB.getReactValue(instance, "props.message.author.id") != 1) {
			let buttonwrap = wrapper.querySelector(BDFDB.dotCN.messagebuttoncontainer);
			if (buttonwrap) {
				let optionPopoutButton = BDFDB.htmlToElement(`<div class="${BDFDB.disCN.optionpopoutbutton}"></div>`);
				optionPopoutButton.addEventListener("click", () => {BDFDB.createMessageOptionPopout(optionPopoutButton);});
				buttonwrap.appendChild(optionPopoutButton);
			}
		}
	}

	processMessageOptionPopout (instance, wrapper) {
		if (instance.props.message && instance.props.channel && instance._reactInternalFiber.memoizedProps.target && !wrapper.querySelector(".copyrawmessage-itembtn")) {
			let popoutCopyRawEntry = BDFDB.htmlToElement(this.popoutCopyRawEntryMarkup);
			wrapper.appendChild(popoutCopyRawEntry);
			popoutCopyRawEntry.addEventListener("click", () => {
				require("electron").clipboard.write({text:instance.props.message.content});
				instance.props.onClose();
			});
		}
	} 
}