/**
 * @name CreationDate
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.4.6
 * @description Displays the Creation Date of an Account in the UserPopout and UserModal
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CreationDate/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/CreationDate/CreationDate.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CreationDate",
			"author": "DevilBro",
			"version": "1.4.6",
			"description": "Displays the Creation Date of an Account in the UserPopout and UserModal"
		},
		"changeLog": {
			"fixed": {
				"User Popout": "Fixing Stuff for the User Popout Update, thanks Discord"
			}
		}
	};

	return (window.Lightcord || window.LightCord) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		return class CreationDate extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						displayText:			{value: true, 			description: "Display '{{presuffix}}' in the Date"}
					},
					places: {
						userPopout:				{value: true, 			description: "User Popouts"},
						userProfile:			{value: true, 			description: "User Profile Modal"}
					},
					dates: {
						creationDate:			{value: {}, 			description: "Creation Date"},
					}
				};
				
				this.patchedModules = {
					after: {
						UserPopoutInfo: "UserPopoutInfo",
						UserProfileModalHeader: "default"
					}
				};
				
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: key == "displayText" ? this.defaults.general[key].description.replace("{{presuffix}}", this.labels.created_at.replace("{{time}}", "").trim()) : this.defaults.general[key].description,
							value: this.settings.general[key]
						})));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCN.marginbottom8
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Add Date in:",
							children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCN.marginbottom8
						}));
						
						settingsItems.push(Object.keys(this.defaults.dates).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.DateInput, Object.assign({}, this.settings.dates[key], {
							label: this.defaults.dates[key].description,
							prefix: _ => (this.settings.general.displayText && this.labels.created_at.split("{{time}}")[0] || "").trim(),
							suffix: _ => (this.settings.general.displayText && this.labels.created_at.split("{{time}}")[1] || "").trim(),
							onChange: valueObj => {
								this.SettingsUpdated = true;
								this.settings.dates[key] = valueObj;
								BDFDB.DataUtils.save(this.settings.dates, this, "dates");
							}
						}))));
						
						return settingsItems.flat(10);
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					BDFDB.PatchUtils.forceAllUpdates(this);
				}
			}

			processUserPopoutInfo (e) {
				if (e.instance.props.user && this.settings.places.userPopout) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["DiscordTag", "ColoredFluxTag"]});
					if (index > -1) this.injectDate(children, index + 1, e.instance.props.user);
				}
			}

			processUserProfileModalHeader (e) {
				if (e.instance.props.user && this.settings.places.userProfile) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["DiscordTag", "ColoredFluxTag"]});
					if (index > -1) this.injectDate(children, index + 1, e.instance.props.user);
				}
			}
			
			injectDate (children, index, user) {
				let timestamp = BDFDB.LibraryComponents.DateInput.format(this.settings.dates.creationDate, user.createdAt);
				children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
					className: BDFDB.disCNS._creationdatedate + BDFDB.disCNS.userinfodate + BDFDB.disCN.textrow,
					children: this.settings.general.displayText ? this.labels.created_at.replace("{{time}}", timestamp) : timestamp
				}));
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							created_at:							"Създадено на {{time}}"
						};
					case "da":		// Danish
						return {
							created_at:							"Oprettet den {{time}}"
						};
					case "de":		// German
						return {
							created_at:							"Erstellt am {{time}}"
						};
					case "el":		// Greek
						return {
							created_at:							"Δημιουργήθηκε στις {{time}}"
						};
					case "es":		// Spanish
						return {
							created_at:							"Creado el {{time}}"
						};
					case "fi":		// Finnish
						return {
							created_at:							"Luotu {{time}}"
						};
					case "fr":		// French
						return {
							created_at:							"Créé le {{time}}"
						};
					case "hr":		// Croatian
						return {
							created_at:							"Izrađeno {{time}}"
						};
					case "hu":		// Hungarian
						return {
							created_at:							"Létrehozva: {{time}}"
						};
					case "it":		// Italian
						return {
							created_at:							"Creato il {{time}}"
						};
					case "ja":		// Japanese
						return {
							created_at:							"{{time}}に作成"
						};
					case "ko":		// Korean
						return {
							created_at:							"{{time}}에 생성됨"
						};
					case "lt":		// Lithuanian
						return {
							created_at:							"Sukurta {{time}}"
						};
					case "nl":		// Dutch
						return {
							created_at:							"Gemaakt op {{time}}"
						};
					case "no":		// Norwegian
						return {
							created_at:							"Opprettet {{time}}"
						};
					case "pl":		// Polish
						return {
							created_at:							"Utworzono {{time}}"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							created_at:							"Criado em {{time}}"
						};
					case "ro":		// Romanian
						return {
							created_at:							"Creat la {{time}}"
						};
					case "ru":		// Russian
						return {
							created_at:							"Создано {{time}}"
						};
					case "sv":		// Swedish
						return {
							created_at:							"Skapad {{time}}"
						};
					case "th":		// Thai
						return {
							created_at:							"สร้างเมื่อ {{time}}"
						};
					case "tr":		// Turkish
						return {
							created_at:							"{{time}} tarihinde oluşturuldu"
						};
					case "uk":		// Ukrainian
						return {
							created_at:							"Створено {{time}}"
						};
					case "vi":		// Vietnamese
						return {
							created_at:							"Được tạo vào {{time}}"
						};
					case "zh-CN":	// Chinese (China)
						return {
							created_at:							"创建于{{time}}"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							created_at:							"創建於{{time}}"
						};
					default:		// English
						return {
							created_at:							"Created on {{time}}"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();