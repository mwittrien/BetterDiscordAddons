/**
 * @name JoinedAtDate
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.3
 * @description Displays the Joined At Date of a Member in the UserPopout and UserModal
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/JoinedAtDate/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/JoinedAtDate/JoinedAtDate.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "JoinedAtDate",
			"author": "DevilBro",
			"version": "1.3.3",
			"description": "Displays the Joined At Date of a Member in the UserPopout and UserModal"
		},
		"changeLog": {
			"fixed": {
				"User Popout": "No Longer requires you to open the Popout twice"
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
		var _this;
		var loadedUsers, requestedUsers;
		var currentPopout, currentProfile;
		
		return class JoinedAtDate extends Plugin {
			onLoad () {
				_this = this;
				loadedUsers = {};
				requestedUsers = {};

				this.defaults = {
					general: {
						displayText:			{value: true, 			description: "Display '{{presuffix}}' in the Date"}
					},
					places: {
						userPopout:				{value: true, 			description: "User Popouts"},
						userProfile:			{value: true, 			description: "User Profile Modal"}
					},
					dates: {
						joinedAtDate:			{value: {}, 			description: "Joined at Date"},
					}
				};
				
				this.patchedModules = {
					after: {
						UserPopoutContainer: "type",
						UserPopoutInfo: "UserPopoutInfo",
						UserProfileModal: "default",
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
							label: key == "displayText" ? this.defaults.general[key].description.replace("{{presuffix}}", this.labels.joined_at.replace("{{time}}", "").trim()) : this.defaults.general[key].description,
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
							prefix: _ => (this.settings.general.displayText && this.labels.joined_at.split("{{time}}")[0] || "").trim(),
							suffix: _ => (this.settings.general.displayText && this.labels.joined_at.split("{{time}}")[1] || "").trim(),
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

			processUserPopoutContainer (e) {
				currentPopout = e.instance;
			}
			
			processUserPopoutInfo (e) {
				if (currentPopout && e.instance.props.user && this.settings.places.userPopout) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["DiscordTag", "ColoredFluxTag"]});
					if (index > -1) this.injectDate(children, index + 1, e.instance.props.user, currentPopout.props.guildId);
				}
			}

			processUserProfileModal (e) {
				currentProfile = e.instance;
			}
			
			processUserProfileModalHeader (e) {
				if (currentProfile && e.instance.props.user && this.settings.places.userProfile) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["DiscordTag", "ColoredFluxTag"]});
					if (index > -1) this.injectDate(children, index + 1, e.instance.props.user, currentProfile.props.guildId);
				}
			}

			injectDate (children, index, user, guildId) {
				if (!guildId) guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
				if (!BDFDB.ArrayUtils.is(children) || !user || !guildId || user.discriminator == "0000" || !BDFDB.LibraryModules.MemberStore.getMember(guildId, user.id)) return;
				
				if (!loadedUsers[guildId]) loadedUsers[guildId] = {};
				if (!requestedUsers[guildId]) requestedUsers[guildId] = {};
				
				if (!BDFDB.ArrayUtils.is(requestedUsers[guildId][user.id])) {
					requestedUsers[guildId][user.id] = [];
					BDFDB.LibraryModules.APIUtils.get(BDFDB.DiscordConstants.Endpoints.GUILD_MEMBER(guildId, user.id)).then(result => {
						loadedUsers[guildId][user.id] = new Date(result.body.joined_at);
						for (let queuedInstance of requestedUsers[guildId][user.id]) BDFDB.ReactUtils.forceUpdate(queuedInstance);
					});
				}
				children.splice(index, 0, BDFDB.ReactUtils.createElement(class extends BDFDB.ReactUtils.Component {
					render() {
						if (!loadedUsers[guildId][user.id]) {
							if (requestedUsers[guildId][user.id].indexOf(this) == -1) requestedUsers[guildId][user.id].push(this);
							return null;
						}
						else {
							let timestamp = BDFDB.LibraryComponents.DateInput.format(_this.settings.dates.joinedAtDate, loadedUsers[guildId][user.id]);
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
								className: BDFDB.disCNS._joinedatdatedate + BDFDB.disCNS.userinfodate + BDFDB.disCN.textrow,
								children: _this.settings.general.displayText ? _this.labels.joined_at.replace("{{time}}", timestamp) : timestamp
							});
						}
					}
				}));
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							joined_at:							"Присъединил се на {{time}}"
						};
					case "da":		// Danish
						return {
							joined_at:							"Deltog den {{time}}"
						};
					case "de":		// German
						return {
							joined_at:							"Beitritt am {{time}}"
						};
					case "el":		// Greek
						return {
							joined_at:							"Έγινε μέλος στις {{time}}"
						};
					case "es":		// Spanish
						return {
							joined_at:							"Se unió el {{time}}"
						};
					case "fi":		// Finnish
						return {
							joined_at:							"Liittyi {{time}}"
						};
					case "fr":		// French
						return {
							joined_at:							"Rejoint le {{time}}"
						};
					case "hr":		// Croatian
						return {
							joined_at:							"Pridružio se {{time}}"
						};
					case "hu":		// Hungarian
						return {
							joined_at:							"Csatlakozott: {{time}}"
						};
					case "it":		// Italian
						return {
							joined_at:							"Iscritto il {{time}}"
						};
					case "ja":		// Japanese
						return {
							joined_at:							"{{time}}に参加しました"
						};
					case "ko":		// Korean
						return {
							joined_at:							"{{time}}에 가입했습니다."
						};
					case "lt":		// Lithuanian
						return {
							joined_at:							"Prisijungė {{time}}"
						};
					case "nl":		// Dutch
						return {
							joined_at:							"Aangesloten op {{time}}"
						};
					case "no":		// Norwegian
						return {
							joined_at:							"Ble med {{time}}"
						};
					case "pl":		// Polish
						return {
							joined_at:							"Dołączono {{time}}"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							joined_at:							"Entrou em {{time}}"
						};
					case "ro":		// Romanian
						return {
							joined_at:							"S-a înscris pe {{time}}"
						};
					case "ru":		// Russian
						return {
							joined_at:							"Присоединился {{time}}"
						};
					case "sv":		// Swedish
						return {
							joined_at:							"Gick med den {{time}}"
						};
					case "th":		// Thai
						return {
							joined_at:							"เข้าร่วมเมื่อ {{time}}"
						};
					case "tr":		// Turkish
						return {
							joined_at:							"{{time}} tarihinde katıldı"
						};
					case "uk":		// Ukrainian
						return {
							joined_at:							"Приєднався {{time}}"
						};
					case "vi":		// Vietnamese
						return {
							joined_at:							"Đã tham gia vào {{time}}"
						};
					case "zh-CN":	// Chinese (China)
						return {
							joined_at:							"已于{{time}}加入"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							joined_at:							"已於{{time}}加入"
						};
					default:		// English
						return {
							joined_at:							"Joined on {{time}}"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();