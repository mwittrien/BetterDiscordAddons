//META{"name":"CopyRawMessage","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CopyRawMessage","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CopyRawMessage/CopyRawMessage.plugin.js"}*// 

var CopyRawMessage = (_ => {	
	return class CopyRawMessage {
		getName () {return "CopyRawMessage";}

		getVersion () {return "1.0.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a entry in the contextmenu when you right click a message that allows you to copy the raw contents of a message.";}

		constructor () {
			this.changelog = {
				"fixed":[["Message Update","Fixed the plugin for the new Message Update"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
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
			if (e.instance.props.message && e.instance.props.message.content) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
							hint: BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("Copy_Raw") : null,
							action: _ => {
								BDFDB.ContextMenuUtils.close(e.instance);
								BDFDB.LibraryRequires.electron.clipboard.write({text:e.instance.props.message.content});
							}
						})
					]
				}));
			}
		}

		onMessageOptionToolbar (e) {
			if (!e.instance.props.hasMorePopout && e.instance.props.message && e.instance.props.channel) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {key: ["mark-unread"]});
				children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCNS.messagetoolbarbutton,
						onClick: _ => {BDFDB.LibraryRequires.electron.clipboard.write({text:e.instance.props.message.content});},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCNS.messagetoolbaricon,
							name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
						})
					})
				}));
			}
		}

		onMessageOptionContextMenu (e) {
			if (e.instance.props.message && e.instance.props.channel) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {key: ["mark-unread"]});
				children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
					label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
					hint: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCNS.messagetoolbaricon,
						name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
					}),
					action: _ => {
						e.instance.props.onClose();
						BDFDB.LibraryRequires.electron.clipboard.write({text:e.instance.props.message.content});
					}
				}));
			}
		}
	}
})();