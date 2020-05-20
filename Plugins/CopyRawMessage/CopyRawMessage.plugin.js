//META{"name":"CopyRawMessage","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CopyRawMessage","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CopyRawMessage/CopyRawMessage.plugin.js"}*// 

var CopyRawMessage = (_ => {	
	return class CopyRawMessage {
		getName () {return "CopyRawMessage";}

		getVersion () {return "1.0.8";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a entry in the contextmenu when you right click a message that allows you to copy the raw contents of a message.";}

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
			if (e.instance.props.message) {
				let embed = BDFDB.DOMUtils.getParent(BDFDB.dotCN.embedwrapper, e.instance.props.target);
				let embedIndex = embed ? Array.from(embed.parentElement.querySelectorAll(BDFDB.dotCN.embedwrapper)).indexOf(embed) : -1;
				let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("Copy_Raw") : null;
				let entries = [
					e.instance.props.message.content && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-message"),
						hint: hint && (_ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							});
						}),
						action: _ => {
							BDFDB.ContextMenuUtils.close(e.instance);
							BDFDB.LibraryRequires.electron.clipboard.write({text:e.instance.props.message.content});
						}
					}),
					embed && embed.querySelector(BDFDB.dotCN.embeddescription) && e.instance.props.message.embeds[embedIndex] && e.instance.props.message.embeds[embedIndex].rawDescription && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw Embed)",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-embed"),
						action: _ => {
							BDFDB.ContextMenuUtils.close(e.instance);
							BDFDB.LibraryRequires.electron.clipboard.write({text:e.instance.props.message.embeds[embedIndex].rawDescription});
						}
					})
				].filter(n => n);
				if (entries.length) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: entries
					}));
				}
			}
		}

		onMessageOptionContextMenu (e) {
			if (e.instance.props.message && e.instance.props.message.content) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mark-unread"});
				children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-message"),
					icon: _ => {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.menuicon,
							name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
						});
					},
					action: _ => {
						BDFDB.LibraryRequires.electron.clipboard.write({text:e.instance.props.message.content});
					}
				}));
			}
		}
	}
})();