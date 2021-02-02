/**
 * @name CopyRawMessage
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CopyRawMessage
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CopyRawMessage/CopyRawMessage.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CopyRawMessage/CopyRawMessage.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CopyRawMessage",
			"author": "DevilBro",
			"version": "1.1.2",
			"description": "Add a entry in the contextmenu when you right click a message that allows you to copy the raw contents of a message"
		},
		"changeLog": {
			"improved": {
				"Quick Action": "Added Icon to quick action bar. Holding shift while hovering a message shows the quick action bar"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var settings = {};
	
		return class CopyRawMessage extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						copyOnlySelected:		{value: true, 				description: "Only copy selected text of a message"}
					}
				};
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
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
								BDFDB.LibraryRequires.electron.clipboard.write({text: messageString});
							}
						}),
						embedString && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw Embed)",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-embed"),
							action: _ => {
								BDFDB.LibraryRequires.electron.clipboard.write({text: embedString});
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
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-message-raw"),
						icon: _ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.menuicon,
								name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
							});
						},
						action: _ => {
							BDFDB.LibraryRequires.electron.clipboard.write({text: e.instance.props.message.content});
						}
					}));
				}
			}
		
			onMessageOptionToolbar (e) {
				if (e.instance.props.expanded && e.instance.props.message && e.instance.props.channel) {
					e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						key: "copy-message-raw",
						text: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCN.messagetoolbarbutton,
							onClick: _ => {
								BDFDB.LibraryRequires.electron.clipboard.write({text: e.instance.props.message.content});
							},
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.messagetoolbaricon,
								name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
							})
						})
					}));
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();