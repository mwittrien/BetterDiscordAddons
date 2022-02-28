/**
 * @name UserNotes
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.9
 * @description Allows you to write User Notes locally
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/UserNotes/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/UserNotes/UserNotes.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "UserNotes",
			"author": "DevilBro",
			"version": "1.0.9",
			"description": "Allows you to write User Notes locally"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
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
				if (e.instance.props.user && e.subType == "useBlockUserItem") {
					if (e.returnvalue.length) e.returnvalue.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuSeparator, {}));
					e.returnvalue.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.user_note,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "user-note"),
						action: _ => this.openNotesModal(e.instance.props.user)
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

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							user_note:							"Потребителска бележка"
						};
					case "da":		// Danish
						return {
							user_note:							"Brugernote"
						};
					case "de":		// German
						return {
							user_note:							"Benutzer Notiz"
						};
					case "el":		// Greek
						return {
							user_note:							"Σημείωση χρήστη"
						};
					case "es":		// Spanish
						return {
							user_note:							"Nota de usuario"
						};
					case "fi":		// Finnish
						return {
							user_note:							"Käyttäjän huomautus"
						};
					case "fr":		// French
						return {
							user_note:							"Note de l'utilisateur"
						};
					case "hr":		// Croatian
						return {
							user_note:							"Napomena korisnika"
						};
					case "hu":		// Hungarian
						return {
							user_note:							"Felhasználói megjegyzés"
						};
					case "it":		// Italian
						return {
							user_note:							"Nota dell'utente"
						};
					case "ja":		// Japanese
						return {
							user_note:							"ユーザーノート"
						};
					case "ko":		// Korean
						return {
							user_note:							"사용자 참고"
						};
					case "lt":		// Lithuanian
						return {
							user_note:							"Vartotojo pastaba"
						};
					case "nl":		// Dutch
						return {
							user_note:							"Opmerking van de gebruiker"
						};
					case "no":		// Norwegian
						return {
							user_note:							"Brukermerknad"
						};
					case "pl":		// Polish
						return {
							user_note:							"Uwaga użytkownika"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							user_note:							"Nota do usuário"
						};
					case "ro":		// Romanian
						return {
							user_note:							"Notă utilizator"
						};
					case "ru":		// Russian
						return {
							user_note:							"Примечание пользователя"
						};
					case "sv":		// Swedish
						return {
							user_note:							"Användaranteckning"
						};
					case "th":		// Thai
						return {
							user_note:							"หมายเหตุผู้ใช้"
						};
					case "tr":		// Turkish
						return {
							user_note:							"Kullanıcı notu"
						};
					case "uk":		// Ukrainian
						return {
							user_note:							"Примітка користувача"
						};
					case "vi":		// Vietnamese
						return {
							user_note:							"Ghi chú của người dùng"
						};
					case "zh-CN":	// Chinese (China)
						return {
							user_note:							"用户须知"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							user_note:							"用戶須知"
						};
					default:		// English
						return {
							user_note:							"User Note"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();