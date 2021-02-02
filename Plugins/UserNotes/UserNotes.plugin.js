/**
 * @name UserNotes
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/UserNotes
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/UserNotes/UserNotes.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/UserNotes/UserNotes.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "UserNotes",
			"author": "DevilBro",
			"version": "1.0.6",
			"description": "Allow you to write your own user notes wihtout a character limit"
		},
		"changeLog": {
			"improved": {
				"Canary Changes": "Preparing Plugins for the changes that are already done on Discord Canary"
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
		return class UserNotes extends Plugin {
			onLoad () {
				this.css = `
					.${this.name}-modal textarea {
						height: 50vh;
					}
				`;
			}
			
			onStart () {}
			
			onStop () {}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					className: BDFDB.disCN.marginbottom8,
					color: BDFDB.LibraryComponents.Button.Colors.RED,
					label: "Delete all Usernotes",
					onClick: _ => {
						BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all usernotes?", _ => {
							BDFDB.DataUtils.remove(this, "notes");
						});
					},
					children: BDFDB.LanguageUtils.LanguageStrings.DELETE
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onUserContextMenu (e) {
				if (e.instance.props.user) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.USERS + " " + BDFDB.LanguageUtils.LanguageStrings.NOTE,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "user-note"),
							action: _ => {
								this.openNotesModal(e.instance.props.user);
							}
						})
					}));
				}
			}

			openNotesModal (user) {
				let note = BDFDB.DataUtils.load(this, "notes", user.id);
				let textarea;
				
				BDFDB.ModalUtils.open(this, {
					size: "LARGE",
					header: BDFDB.LanguageUtils.LanguageStrings.USERS + " " + BDFDB.LanguageUtils.LanguageStrings.NOTE,
					subHeader: user.username,
					scroller: false,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextArea, {
							value: note,
							placeholder: note,
							autoFocus: true,
							ref: instance => {if (instance) textarea = instance;}
						})
					],
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
						color: "BRAND",
						close: true,
						onClick: _ => {
							note = textarea.props.value;
							if (note) BDFDB.DataUtils.save(note, this, "notes", user.id);
							else BDFDB.DataUtils.remove(this, "notes", user.id);
						}
					}]
				});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();