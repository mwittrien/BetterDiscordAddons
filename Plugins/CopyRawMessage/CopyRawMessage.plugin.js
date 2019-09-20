//META{"name":"CopyRawMessage"}*//

class CopyRawMessage {
	getName () {return "CopyRawMessage";}

	getVersion () {return "1.0.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a entry in the contextmenu when you right click a message that allows you to copy the raw contents of a message.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"Message":"componentDidMount"
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
		if (instance.props && instance.props.message && instance.props.message.content && instance.props.target && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const itemgroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: BDFDB.LanguageStrings.COPY_TEXT + " (Raw)",
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-copyraw-contextMenuItem`,
						action: e => {
							BDFDB.closeContextMenu(menu);
							BDFDB.LibraryRequires.electron.clipboard.write({text:instance.props.message.content});
						}
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	onMessageOptionPopout (instance, popout, returnvalue) {
		if (instance.props.message && instance.props.channel && instance._reactInternalFiber.memoizedProps.target && !popout.querySelector(".copyrawmessage-itembtn")) {
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, BDFDB.LanguageStrings.DELETE);
			const copyItem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: BDFDB.LanguageStrings.COPY_TEXT + " (Raw)",
				className: `${BDFDB.disCN.optionpopoutitem} BDFDB-popoutMenuItem ${this.name}-popoutMenuItem ${this.name}-copyraw-popoutMenuItem`,
				action: e => {
					BDFDB.LibraryRequires.electron.clipboard.write({text:instance.props.message.content});
					instance.props.onClose();
				}
			});
			children.splice(index, 0, copyItem);
		}
	} 

	processMessage (instance, wrapper, returnvalue) {
		if (instance.props && typeof instance.props.renderButtons == "function" && !wrapper.querySelector(BDFDB.dotCN.optionpopoutbutton) && BDFDB.getReactValue(instance, "props.message.author.id") != 1) {
			let buttonwrap = wrapper.querySelector(BDFDB.dotCN.messagebuttoncontainer);
			if (buttonwrap) {
				let optionPopoutButton = BDFDB.htmlToElement(`<div tabindex="0" class="${BDFDB.disCN.optionpopoutbutton}" aria-label="More Options" role="button"><svg name="OverflowMenu" class="${BDFDB.disCN.optionpopoutbuttonicon}" aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0z"></path><path fill="currentColor" d="M12 16c1.1045695 0 2 .8954305 2 2s-.8954305 2-2 2-2-.8954305-2-2 .8954305-2 2-2zm0-6c1.1045695 0 2 .8954305 2 2s-.8954305 2-2 2-2-.8954305-2-2 .8954305-2 2-2zm0-6c1.1045695 0 2 .8954305 2 2s-.8954305 2-2 2-2-.8954305-2-2 .8954305-2 2-2z"></path></g></svg></div>`);
				optionPopoutButton.addEventListener("click", () => {BDFDB.createMessageOptionPopout(optionPopoutButton);});
				buttonwrap.appendChild(optionPopoutButton);
			}
		}
	}
}