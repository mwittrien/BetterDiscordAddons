//META{"name":"CopyRawMessage","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CopyRawMessage","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CopyRawMessage/CopyRawMessage.plugin.js"}*// 

var CopyRawMessage = (_ => {
	var settings = {};
	
	return class CopyRawMessage {
		getName () {return "CopyRawMessage";}

		getVersion () {return "1.1.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a entry in the contextmenu when you right click a message that allows you to copy the raw contents of a message.";}

		constructor () {
			this.changelog = {
				"improved":[["Only copy selection","Selecting a part of a message/embed and clicking copy raw will now only copy the selected part (including formating symbols like ~, _ and ` etc., can be disabled"]]
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					copyOnlySelected:		{value:true, 				description:"Only copy selected text of a message"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
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

				this.forceUpdateAll();
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

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		onMessageContextMenu (e) {
			if (e.instance.props.message) {
				let content = e.instance.props.message.content;
				let messageString = [e.instance.props.message.content, BDFDB.ArrayUtils.is(e.instance.props.message.attachments) && e.instance.props.message.attachments.map(n => n.url)].flat(10).filter(n => n).join("\n");
				let selectedText = settings.copyOnlySelected && document.getSelection().toString().trim();
				if (selectedText) messageString = BDFDB.StringUtils.extractSelection(messageString, selectedText);
				let embed = BDFDB.DOMUtils.getParent(BDFDB.dotCN.embedwrapper, e.instance.props.target);
				let embedData = e.instance.props.message.embeds[embed ? Array.from(embed.parentElement.querySelectorAll(BDFDB.dotCN.embedwrapper)).indexOf(embed) : -1];
				let embedString = embedData && [embedData.rawTitle, embedData.rawDescription, BDFDB.ArrayUtils.is(embedData.fields) && embedData.fields.map(n => [n.rawName, n.rawValue]), BDFDB.ObjectUtils.is(embedData.image) && embedData.image.url, BDFDB.ObjectUtils.is(embedData.footer) && embedData.footer.text].flat(10).filter(n => n).join("\n");
				if (selectedText) embedString = BDFDB.StringUtils.extractSelection(embedString, selectedText);
				let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("Copy_Raw") : null;
				let entries = [
					messageString && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-message"),
						hint: hint && (_ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							});
						}),
						action: _ => {
							BDFDB.ContextMenuUtils.close(e.instance);
							BDFDB.LibraryRequires.electron.clipboard.write({text:messageString});
						}
					}),
					embedString && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw Embed)",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-embed"),
						action: _ => {
							BDFDB.ContextMenuUtils.close(e.instance);
							BDFDB.LibraryRequires.electron.clipboard.write({text:embedString});
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
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
		}
	}
})();