/**
 * @name LastMessageDate
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.2.8
 * @description Displays the Last Message Date of a Member for the current Server/DM in the UserPopout and UserModal
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/LastMessageDate/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/LastMessageDate/LastMessageDate.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "LastMessageDate",
			"author": "DevilBro",
			"version": "1.2.8",
			"description": "Displays the Last Message Date of a Member for the current Server/DM in the UserPopout and UserModal"
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
		var loadedUsers, requestedUsers, languages;
		var currentPopout, currentProfile;
		
		return class LastMessageDate extends Plugin {
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
						lastMessageDate:		{value: {}, 			description: "Last Message Date"},
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
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dirtyDispatch", {after: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == BDFDB.DiscordConstants.ActionTypes.MESSAGE_CREATE && e.methodArguments[0].message) {
						let message = e.methodArguments[0].message;
						let guildId = message.guild_id || message.channel_id;
						if (guildId && loadedUsers[guildId] && loadedUsers[guildId][message.author.id]) {
							loadedUsers[guildId][message.author.id] = new Date(message.timestamp);
						}
					}
				}});

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
							label: key == "displayText" ? this.defaults.general[key].description.replace("{{presuffix}}", this.labels.last_message.replace("{{time}}", "").trim()) : this.defaults.general[key].description,
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
							prefix: _ => (this.settings.general.displayText && this.labels.last_message.split("{{time}}")[0] || "").trim(),
							suffix: _ => (this.settings.general.displayText && this.labels.last_message.split("{{time}}")[1] || "").trim(),
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

			injectDate ( children, index, user, guildId) {
				if (!guildId) guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
				if (!BDFDB.ArrayUtils.is(children) || !user || user.discriminator == "0000") return;
				let isGuild = guildId && guildId != BDFDB.DiscordConstants.ME;
				guildId = isGuild ? guildId : BDFDB.LibraryModules.LastChannelStore.getChannelId();
				if (!guildId) return;
				
				if (!loadedUsers[guildId]) loadedUsers[guildId] = {};
				if (!requestedUsers[guildId]) requestedUsers[guildId] = {};
				
				if (!BDFDB.ArrayUtils.is(requestedUsers[guildId][user.id])) {
					requestedUsers[guildId][user.id] = [];
					BDFDB.LibraryModules.APIUtils.get({
						url: isGuild ? BDFDB.DiscordConstants.Endpoints.SEARCH_GUILD(guildId) : BDFDB.DiscordConstants.Endpoints.SEARCH_CHANNEL(guildId),
						query: BDFDB.LibraryModules.APIEncodeUtils.stringify({author_id: user.id})
					}).then(result => {
						if (typeof result.body.retry_after != "number") {
							if (result.body.messages && Array.isArray(result.body.messages[0])) {
								for (let message of result.body.messages[0]) if (message.hit && message.author.id == user.id) loadedUsers[guildId][user.id] = new Date(message.timestamp);
							}
							else loadedUsers[guildId][user.id] = null;
							for (let queuedInstance of requestedUsers[guildId][user.id]) BDFDB.ReactUtils.forceUpdate(queuedInstance);
						}
						else {
							delete requestedUsers[guildId][user.id];
							BDFDB.TimeUtils.timeout(_ => this.injectDate(children, index, user), result.body.retry_after + 500);
						}
					});
				}
				children.splice(index, 0, BDFDB.ReactUtils.createElement(class extends BDFDB.ReactUtils.Component {
					render() {
						if (loadedUsers[guildId][user.id] === undefined) {
							if (requestedUsers[guildId][user.id].indexOf(this) == -1) requestedUsers[guildId][user.id].push(this);
							return null;
						}
						else {
							let timestamp = loadedUsers[guildId][user.id] ? BDFDB.LibraryComponents.DateInput.format(_this.settings.dates.lastMessageDate, loadedUsers[guildId][user.id]) : "---";
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
								className: BDFDB.disCNS._lastmessagedatedate + BDFDB.disCNS.userinfodate + BDFDB.disCN.textrow,
								children: _this.settings.general.displayText ? _this.labels.last_message.replace("{{time}}", timestamp) : timestamp
							});
						}
					}
				}));
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							last_message:						"Последно съобщение на {{time}}"
						};
					case "da":		// Danish
						return {
							last_message:						"Sidste besked den {{time}}"
						};
					case "de":		// German
						return {
							last_message:						"Letzte Nachricht am {{time}}"
						};
					case "el":		// Greek
						return {
							last_message:						"Τελευταίο μήνυμα στις {{time}}"
						};
					case "es":		// Spanish
						return {
							last_message:						"Último mensaje el {{time}}"
						};
					case "fi":		// Finnish
						return {
							last_message:						"Viimeinen viesti {{time}}"
						};
					case "fr":		// French
						return {
							last_message:						"Dernier message le {{time}}"
						};
					case "hr":		// Croatian
						return {
							last_message:						"Posljednja poruka {{time}}"
						};
					case "hu":		// Hungarian
						return {
							last_message:						"Utolsó üzenet: {{time}}"
						};
					case "it":		// Italian
						return {
							last_message:						"Ultimo messaggio il {{time}}"
						};
					case "ja":		// Japanese
						return {
							last_message:						"{{time}}の最後のメッセージ"
						};
					case "ko":		// Korean
						return {
							last_message:						"{{time}}의 마지막 메시지"
						};
					case "lt":		// Lithuanian
						return {
							last_message:						"Paskutinis pranešimas {{time}}"
						};
					case "nl":		// Dutch
						return {
							last_message:						"Laatste bericht op {{time}}"
						};
					case "no":		// Norwegian
						return {
							last_message:						"Siste melding {{time}}"
						};
					case "pl":		// Polish
						return {
							last_message:						"Ostatnia wiadomość {{time}}"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							last_message:						"Última mensagem em {{time}}"
						};
					case "ro":		// Romanian
						return {
							last_message:						"Ultimul mesaj pe {{time}}"
						};
					case "ru":		// Russian
						return {
							last_message:						"Последнее сообщение в {{time}}"
						};
					case "sv":		// Swedish
						return {
							last_message:						"Senaste meddelandet {{time}}"
						};
					case "th":		// Thai
						return {
							last_message:						"ข้อความล่าสุดเมื่อ {{time}}"
						};
					case "tr":		// Turkish
						return {
							last_message:						"{{time}} tarihindeki son mesaj"
						};
					case "uk":		// Ukrainian
						return {
							last_message:						"Останнє повідомлення {{time}}"
						};
					case "vi":		// Vietnamese
						return {
							last_message:						"Tin nhắn cuối cùng vào {{time}}"
						};
					case "zh-CN":	// Chinese (China)
						return {
							last_message:						"{{time}}上的最后一条消息"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							last_message:						"{{time}}上的最後一條消息"
						};
					default:		// English
						return {
							last_message:						"Last Message on {{time}}"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();