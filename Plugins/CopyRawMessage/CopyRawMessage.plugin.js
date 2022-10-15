/**
 * @name CopyRawMessage
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.1.4
 * @description Allows you to copy the raw Contents of a Message
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CopyRawMessage/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/CopyRawMessage/CopyRawMessage.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		return class CopyRawMessage extends Plugin {
			onLoad () {
				this.modulePatches = {
					after: [
						"MessageActionsContextMenu",
						"MessageToolbar"
					]
				};
			}
			
			onStart () {}
			
			onStop () {}

			onMessageContextMenu (e) {
				if (e.instance.props.message) {
					let content = e.instance.props.message.content;
					let messageString = [e.instance.props.message.content, BDFDB.ArrayUtils.is(e.instance.props.message.attachments) && e.instance.props.message.attachments.map(n => n.url)].flat(10).filter(n => n).join("\n");
					let selectedText = document.getSelection().toString().trim();
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
							type: "Message",
							hint: hint && (_ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							})),
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
							}),
							action: _ => BDFDB.LibraryModules.WindowUtils.copy(messageString)
						}),
						embedString && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw Embed)",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-embed"),
							type: "Embed",
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
							}),
							action: _ => BDFDB.LibraryModules.WindowUtils.copy(embedString)
						}),
						embedData && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Embed JSON)",
							type: "Embed JSON",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-embed-json"),
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
							}),
							action: _ => BDFDB.LibraryModules.WindowUtils.copy(JSON.stringify(embedData))
						})
					].filter(n => n);
					if (entries.length) {
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-link"});
						children.splice(index > -1 ? index + 1 : children.length, 0, entries.length > 1 ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-raw-submenu"),
							children: entries.map(n => {
								n.props.label = n.props.type;
								delete n.props.type;
								delete n.props.icon;
								return n;
							})
						}) : entries);
					}
				}
			}

			processMessageActionsContextMenu (e) {
				if (e.instance.props.message && e.instance.props.message.content) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-link"});
					children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-message-raw"),
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
						}),
						action: _ => BDFDB.LibraryModules.WindowUtils.copy(e.instance.props.message.content)
					}));
				}
			}
		
			processMessageToolbar (e) {
				if (e.instance.props.expanded && e.instance.props.message && e.instance.props.channel) {
					e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						key: "copy-message-raw",
						text: BDFDB.LanguageUtils.LanguageStrings.COPY_TEXT + " (Raw)",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCN.messagetoolbarbutton,
							onClick: _ => {
								BDFDB.LibraryModules.WindowUtils.copy(e.instance.props.message.content);
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
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();