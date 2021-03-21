/**
 * @name FriendNotifications
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.6.5
 * @description Shows a Notification when a Friend or a User, you choose to observe, changes their Status
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/FriendNotifications/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/FriendNotifications/FriendNotifications.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "FriendNotifications",
			"author": "DevilBro",
			"version": "1.6.5",
			"description": "Shows a Notification when a Friend or a User, you choose to observe, changes their Status"
		},
		"changeLog": {
			"fixed": {
				"Add Stranger": "Works again"
			},
			"improved": {
				"Time Log Timestamp Format": "Added Option to allow Users to customize the Timestamp Format in the Time Log"
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
		var userStatusStore, timeLog, lastTimes, checkInterval, paginationOffset = {};
		var friendCounter, timeLogList;
		var settings = {}, dates = {}, amounts = {}, notificationStrings = {}, notificationSounds = {}, observedUsers = {};
		
		const statuses = {
			online: {
				value: true,
				name: "STATUS_ONLINE",
				sound: true
			},
			idle: {
				value: false,
				name: "STATUS_IDLE",
				sound: true
			},
			dnd: {
				value: false,
				name: "STATUS_DND",
				sound: true
			},
			playing: {
				value: false,
				checkActivity: true,
				sound: true
			},
			listening: {
				value: false,
				checkActivity: true,
				sound: true
			},
			streaming: {
				value: false,
				checkActivity: true,
				sound: true
			},
			offline: {
				value: true,
				name: "STATUS_OFFLINE",
				sound: true
			},
			mobile: {
				value: false
			},
			custom: {
				value: false
			}
		};
		
		const notificationTypes = {
			DISABLED: {
				button: null,
				value: 0,
				color: ""
			},
			TOAST: {
				button: 0,
				value: 1,
				color: "var(--bdfdb-blurple)"
			},
			DESKTOP: {
				button: 2,
				value: 2,
				color: "STATUS_GREEN"
			}
		};
		
		const FriendOnlineCounterComponent = class FriendOnlineCounter extends BdApi.React.Component {
			componentDidMount() {
				friendCounter = this;
			}
			render() {
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.guildouter,
					children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.guildslabel + BDFDB.disCN._friendnotificationsfriendsonline,
						children: BDFDB.LanguageUtils.LanguageStringsFormat("FRIENDS_ONLINE_HEADER", this.props.amount),
						onClick: _ => _this.showTimeLog()
					})
				});
			}
		};
		
		const TimeLogComponent = class TimeLog extends BdApi.React.Component {
			componentDidMount() {
				timeLogList = this;
			}
			render() {
				return this.props.entries.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PaginatedList, {
					items: this.props.entries,
					amount: 50,
					copyToBottom: true,
					renderItem: (log, i) => [
						i > 0 ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom8
						}) : null,
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
									className: BDFDB.disCN._friendnotificationslogtime,
									children: BDFDB.LibraryComponents.DateInput.format(dates.logDate, log.timestamp)
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AvatarComponents.default, {
									className: BDFDB.disCN._friendnotificationslogavatar,
									src: log.avatar,
									status: log.status,
									size: BDFDB.LibraryComponents.AvatarComponents.Sizes.SIZE_40
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
									className: BDFDB.disCN._friendnotificationslogcontent,
									speed: 1,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
										children: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(log.string))
									})
								})
							]
						})
					]
				}) : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessagesPopoutComponents.EmptyStateBottom, {
					msg: BDFDB.LanguageUtils.LanguageStrings.AUTOCOMPLETE_NO_RESULTS_HEADER,
					image: BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight ? "/assets/9b0d90147f7fab54f00dd193fe7f85cd.svg" : "/assets/308e587f3a68412f137f7317206e92c2.svg"
				})
			}
		};
	
		return class FriendNotifications extends Plugin {
			onLoad () {
				_this = this;
				
				userStatusStore = {};
				timeLog = [];
				lastTimes = {};
				friendCounter = null;

				this.defaults = {
					settings: {
						addOnlineCount:		{value: true, 	description: "Add an Online friend Counter to the Server List (click to open logs)"},
						showDiscriminator:	{value: false, 	description: "Add the User Discriminator"},
						disableForNew:		{value: false, 	description: "Disable Notifications for newly added Friends: "},
						muteOnDND:			{value: false, 	description: "Do not notify me when I am in DnD"},
						openOnClick:		{value: false, 	description: "Open the DM when you click a Notification"}
					},
					notificationstrings: {
						online: 			{value: "$user changed status to '$status'"},
						idle: 				{value: "$user changed status to '$status'"},
						dnd: 				{value: "$user changed status to '$status'"},
						playing: 			{value: "$user started playing '$game'"},
						listening: 			{value: "$user started listening to '$song'"},
						streaming: 			{value: "$user started streaming '$game'"},
						offline: 			{value: "$user changed status to '$status'"},
						custom: 			{value: "$user changed status to '$custom'"}
					},
					notificationsounds: {},
					dates: {
						logDate:			{value: {}, 				description: "Log Timestamp"},
					},
					amounts: {
						toastTime:			{value: 5, 		min: 1,		description: "Amount of Seconds a Toast Notification stays on Screen: "},
						checkInterval:		{value: 10, 	min: 5,		description: "Check Users every X Seconds: "}
					}
				};
			
				this.patchedModules = {
					after: {
						Guilds: "render"
					}
				};
		
				this.css = `
					${BDFDB.dotCN._friendnotificationslogtime} {
						flex: 0 1 auto;
						min-width: 160px;
					}	
					${BDFDB.dotCN._friendnotificationslogavatar} {
						margin: 0 10px;
					}
					${BDFDB.dotCN._friendnotificationslogcontent} {
						max-width: 600px;
					}
					${BDFDB.dotCN._friendnotificationstypelabel} {
						border-radius: 3px;
						padding: 0 3px;
						margin: 0 6px;
					}
					${BDFDB.dotCN._friendnotificationsfriendsonline} {
						cursor: pointer;
					}
					${BDFDB.dotCNS._friendnotificationstimelogmodal + BDFDB.dotCN.messagespopoutemptyplaceholder} {
						position: absolute;
						bottom: 0;
						width: 100%;
					}
				`;
				
				for (let type in statuses) if (statuses[type].sound) {
					this.defaults.notificationsounds["toast" + type] = {value: {url: null, song: null, mute: false}};
					this.defaults.notificationsounds["desktop" + type] = {value: {url: null, song: null, mute: false}};
				}
			}
			
			onStart () {
				this.startInterval();

				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.TimeUtils.clear(checkInterval);
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			getSettingsPanel (collapseStates = {}) {
				let changeAllConfigs = (type, config, notificationType) => {
					let allData = BDFDB.DataUtils.load(this, type);
					if (config == "all") {
						config = "disabled";
						for (let id in allData) allData[id][config] = notificationTypes[notificationType].button == 0 ? false : true;
					}
					else {
						let disabled = BDFDB.ObjectUtils.toArray(allData).every(d => !d.disabled && d[config] == notificationTypes[notificationType].value);
						for (let id in allData) allData[id][config] = notificationTypes[disabled ? "DISABLED" : notificationType].value;
					}
					BDFDB.DataUtils.save(allData, this, type);
					this.SettingsUpdated = true;
					BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
				};
				let successSavedAudio = (type, parsedUrl, parsedData) => {
					if (parsedUrl && parsedData) BDFDB.NotificationUtils.toast(`Sound was saved successfully.`, {type: "success"});
					notificationSounds[type].url = parsedUrl;
					notificationSounds[type].song = parsedData;
					BDFDB.DataUtils.save(notificationSounds[type], this, "notificationsounds", type);
					this.SettingsUpdated = true;
				};
				let createUserList = (users, type, title) => {
					let items = [];
					items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						className: BDFDB.disCNS.settingsrowtitle + BDFDB.disCNS.settingsrowtitledefault + BDFDB.disCN.cursordefault,
						children: [
							"Click on an Option to toggle",
							BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.disCN._friendnotificationstypelabel,
								style: {backgroundColor: "var(--bdfdb-blurple)"},
								children: "Toast"
							}),
							"Notifications for that User: "
						]
					}));
					if ("Notification" in window) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						className: BDFDB.disCNS.settingsrowtitle + BDFDB.disCNS.settingsrowtitledefault + BDFDB.disCN.cursordefault,
						children: [
							"Right-Click on an Option to toggle",
							BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.disCN._friendnotificationstypelabel,
								style: {backgroundColor: BDFDB.DiscordConstants.Colors.STATUS_GREEN},
								children: "Desktop"
							}),
							"Notifications for that User: "
						]
					}));
					items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
						className: BDFDB.disCN.margintop20,
						title: "all",
						settings: Object.keys(statuses),
						data: users,
						pagination: {
							alphabetKey: "username",
							amount: 50,
							offset: paginationOffset[title] || 0,
							onJump: offset => {paginationOffset[title] = offset;}
						},
						getCheckboxColor: value => {
							let color = (BDFDB.ObjectUtils.toArray(notificationTypes).find(n => n.value == value) || {}).color;
							return BDFDB.DiscordConstants.Colors[color] || color;
						},
						getCheckboxValue: (value, event) => {
							let eventValue = (BDFDB.ObjectUtils.toArray(notificationTypes).find(n => n.button == event.button) || {}).value;
							return eventValue == value ? 0 : eventValue;
						},
						renderLabel: data => [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AvatarComponents.default, {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.listavatar, data.disabled && BDFDB.disCN.avatardisabled),
								src: BDFDB.UserUtils.getAvatar(data.id),
								status: BDFDB.UserUtils.getStatus(data.id),
								size: BDFDB.LibraryComponents.AvatarComponents.Sizes.SIZE_40,
								onClick: (e, instance) => {
									let saveData = BDFDB.DataUtils.load(this, type, data.id) || this.createDefaultConfig();
									saveData.disabled = !saveData.disabled;
									BDFDB.DataUtils.save(saveData, this, type, data.id);
									this.SettingsUpdated = true;
									BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
								children: data.username
							})
						],
						onHeaderClick: (config, instance) => {
							changeAllConfigs(type, config, "TOAST");
						},
						onHeaderContextMenu: (config, instance) => {
							changeAllConfigs(type, config, "DESKTOP");
						},
						onCheckboxChange: (value, instance) => {
							let data = BDFDB.DataUtils.load(this, type, instance.props.cardId) || this.createDefaultConfig();
							data[instance.props.settingId] = value;
							BDFDB.DataUtils.save(data, this, type, instance.props.cardId);
							this.SettingsUpdated = true;
						},
						noRemove: type == "friends",
						onRemove: (e, instance) => {
							BDFDB.DataUtils.remove(this, type, instance.props.cardId);
							BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							this.SettingsUpdated = true;
						}
					}));
					return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
						title: title,
						collapseStates: collapseStates,
						dividerTop: true,
						children: items
					});
				};
				
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [], innerItems = [];
						
						let settings = BDFDB.DataUtils.get(this, "settings");
						let amounts = BDFDB.DataUtils.get(this, "amounts");
						let dates = BDFDB.DataUtils.get(this, "dates");
						let notificationStrings = BDFDB.DataUtils.get(this, "notificationstrings");
						let notificationSounds = BDFDB.DataUtils.get(this, "notificationsounds");
						
						let {friendIds, cards} = this.getObserverData();
						
						for (let key in settings) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["settings", key],
							label: this.defaults.settings[key].description,
							value: settings[key]
						}));
						
						for (let key in dates) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.DateInput, Object.assign({}, dates[key], {
							label: this.defaults.dates[key].description,
							onChange: valueObj => {
								this.SettingsUpdated = true;
								dates[key] = valueObj;
								BDFDB.DataUtils.save(dates, this, "dates");
							}
						})));
						
						for (let key in amounts) if (key.indexOf("desktop") == -1 || "Notification" in window) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "TextInput",
							childProps: {
								type: "number"
							},
							plugin: this,
							keys: ["amounts", key],
							label: this.defaults.amounts[key].description,
							basis: "20%",
							min: this.defaults.amounts[key].min,
							max: this.defaults.amounts[key].max,
							value: amounts[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: innerItems
						}));
						
						if (cards.friends.length) settingsItems.push(createUserList(cards.friends, "friends", "Friend-List"));
						
						let strangerId = "";
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Add new Stranger",
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								className: BDFDB.disCN.margintop8,
								align: BDFDB.LibraryComponents.Flex.Align.CENTER,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											className: `input-newstranger`,
											placeholder: "user (id or name#discriminator)",
											value: "",
											onChange: value => strangerId = value
										})
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
										onClick: _ => {
											let userId = strangerId.trim();
											if (userId == BDFDB.UserUtils.me.id) BDFDB.NotificationUtils.toast("Are you seriously trying to stalk yourself?", {type: "danger"});
											else if (friendIds.includes(userId)) BDFDB.NotificationUtils.toast("User is already a friend of yours, please use the 'Friend-List' area to configure them", {type: "danger"});
											else if (Object.keys(cards.nonFriends).includes(userId)) BDFDB.NotificationUtils.toast("User is already being observed as a 'Stranger'", {type: "danger"});
											else {
												let user = /.+#[0-9]{4}/.test(userId) ? BDFDB.LibraryModules.UserStore.findByTag(userId.split("#").slice(0, -1).join("#"), userId.split("#").pop()) : BDFDB.LibraryModules.UserStore.getUser(userId);
												if (user) {
													BDFDB.DataUtils.save(this.createDefaultConfig(), this, "nonfriends", user.id || userId);
													BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
													this.SettingsUpdated = true;
												}
												else BDFDB.NotificationUtils.toast("Please enter a valid UserID of a user that has been loaded in your client", {type: "danger"});
											}
										},
										children: BDFDB.LanguageUtils.LanguageStrings.ADD
									})
								]
							})
						}));
						
						if (cards.nonFriends.length) settingsItems.push(createUserList(cards.nonFriends, "nonfriends", "Stranger-List"));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "LogIn/-Out Timelog",
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Button",
								label: "Overview of LogIns/-Outs of current Session",
								onClick: _ => {this.showTimeLog()},
								children: "Timelog"
							})
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Notification Messages",
							collapseStates: collapseStates,
							children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								className: BDFDB.disCN.marginbottom8,
								children: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCNS.settingsrowtitle + BDFDB.disCNS.settingsrowtitle + BDFDB.disCNS.settingsrowtitledefault + BDFDB.disCN.cursordefault,
									children: [
										"Allows you to configure your own Message Strings for the different Statuses. ",
										BDFDB.ReactUtils.createElement("strong", {children: "$user"}),
										" is the Placeholder for the User Name, ",
										BDFDB.ReactUtils.createElement("strong", {children: "$status"}),
										" for the Status Name, ",
										BDFDB.ReactUtils.createElement("strong", {children: "$statusOld"}),
										" for the previous Status Name, ",
										BDFDB.ReactUtils.createElement("strong", {children: "$custom"}),
										" for the Custom Status, ",
										BDFDB.ReactUtils.createElement("strong", {children: "$game"}),
										" for the Game Name, ",
										BDFDB.ReactUtils.createElement("strong", {children: "$song"}),
										" for the Song Name and ",
										BDFDB.ReactUtils.createElement("strong", {children: "$artist"}),
										" for the Song Artist."
									]
								})
							})].concat(Object.keys(notificationStrings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["notificationstrings", key],
								placeholder: this.defaults.notificationstrings[key].value,
								label: `${BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(key)}: `,
								basis: "80%",
								value: notificationStrings[key]
							})))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Notification Sounds",
							collapseStates: collapseStates,
							children: Object.keys(notificationSounds).map((key, i) => (key.indexOf("desktop") == -1 || "Notification" in window) && [
								i != 0 && key.indexOf("toast") == 0 && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCN.marginbottom8
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									align: BDFDB.LibraryComponents.Flex.Align.CENTER,
									direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
											label: `${key.split(/(desktop)|(toast)/).filter(n => n).map(n => BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(n)).join("-")} Notification Sound: `,
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
											type: "Switch",
											mini: true,
											grow: 0,
											label: "Mute:",
											value: notificationSounds[key].mute,
											onChange: value => {
												notificationSounds[key].mute = value;
												BDFDB.DataUtils.save(notificationSounds, this, "notificationsounds");
											}
										})
									].filter(n => n)
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									align: BDFDB.LibraryComponents.Flex.Align.CENTER,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
												className: `input-${key}src`,
												type: "file",
												filter: ["audio", "video"],
												useFilePath: true,
												placeholder: "Url or Filepath",
												value: notificationSounds[key].url
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											onClick: _ => {
												let source = settingsPanel.props._node.querySelector(`.input-${key}src ` + BDFDB.dotCN.input).value.trim();
												if (!source.length) {
													BDFDB.NotificationUtils.toast(`Sound file was removed.`, {type: "warning"});
													successSavedAudio(key, source, source);
												}
												else if (source.indexOf("http") == 0) BDFDB.LibraryRequires.request(source, (error, response, result) => {
													if (response) {
														let type = response.headers["content-type"];
														if (type && (type.indexOf("octet-stream") > -1 || type.indexOf("audio") > -1 || type.indexOf("video") > -1)) {
															successSavedAudio(key, source, source);
															return;
														}
													}
													BDFDB.NotificationUtils.toast("Use a valid direct link to a video or audio source, they usually end on something like .mp3, .mp4 or .wav", {type: "danger"});
												});
												else BDFDB.LibraryRequires.fs.readFile(source, (error, response) => {
													if (error) BDFDB.NotificationUtils.toast("Could not fetch file, please make sure the file exists", {type: "danger"});
													else successSavedAudio(key, source, `data:audio/mpeg;base64,${response.toString("base64")}`);
												});
											},
											children: BDFDB.LanguageUtils.LanguageStrings.SAVE
										})
									]
								})
							]).flat(10).filter(n => n)
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					
					this.startInterval();
					BDFDB.PatchUtils.forceAllUpdates(this);
				}
			}
		
			processGuilds (e) {
				if (settings.addOnlineCount) {
					if (typeof e.returnvalue.props.children == "function") {
						let childrenRender = e.returnvalue.props.children;
						e.returnvalue.props.children = (...args) => {
							let children = childrenRender(...args);
							this.checkTree(children);
							return children;
						};
					}
					else this.checkTree(e.returnvalue);
				}
			}
			
			checkTree (returnvalue) {
				let tree = BDFDB.ReactUtils.findChild(returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
				if (tree) {
					let childrenRender = tree.props.children;
					tree.props.children = (...args) => {
						let children = childrenRender(...args);
						this.injectCounter(children);
						return children;
					};
				}
				else this.injectCounter(returnvalue);
			}
			
			injectCounter (returnvalue) {
				let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {name: "ConnectedUnreadDMs"});
				if (index > -1) children.splice(index, 0, BDFDB.ReactUtils.createElement(FriendOnlineCounterComponent, {
					amount: BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount()
				}));
			}
			
			getObserverData () {
				let friendIds = BDFDB.LibraryModules.RelationshipStore.getFriendIDs();
				let friendDatas = BDFDB.DataUtils.load(this, "friends"), nonFriendDatas = BDFDB.DataUtils.load(this, "nonfriends");
				let friendCards = [], nonFriendCards = [];
				
				for (let id of friendIds) {
					let user = BDFDB.LibraryModules.UserStore.getUser(id);
					if (user) {
						friendDatas[id] = Object.assign({}, friendDatas[id] || nonFriendDatas[id] || this.createDefaultConfig());
						delete nonFriendDatas[id];
					}
				}
				for (let id in friendDatas) {
					let user = BDFDB.LibraryModules.UserStore.getUser(id);
					if (user) {
						if (!friendIds.includes(id)) {
							nonFriendDatas[id] = Object.assign({}, friendDatas[id]);
							delete friendDatas[id];
						}
						else if (id != BDFDB.UserUtils.me.id) friendCards.push(Object.assign({}, user, friendDatas[id], {
							key: id,
							className: friendDatas[id].disabled ? BDFDB.disCN.hovercarddisabled : ""
						}));
					}
				}
				for (let id in nonFriendDatas) {
					let user = BDFDB.LibraryModules.UserStore.getUser(id);
					if (user && id != BDFDB.UserUtils.me.id) nonFriendCards.push(Object.assign({}, user, nonFriendDatas[id], {
						key: id,
						className: nonFriendDatas[id].disabled ? BDFDB.disCN.hovercarddisabled : ""
					}));
				}

				BDFDB.DataUtils.save(friendDatas, this, "friends");
				BDFDB.DataUtils.save(nonFriendDatas, this, "nonfriends");
				
				return {friendIds, data: {friends: friendDatas, nonFriends: nonFriendDatas}, cards: {friends: friendCards, nonFriends: nonFriendCards}};
			}

			createDefaultConfig () {
				return Object.assign({
					disabled: settings.disableForNew
				}, BDFDB.ObjectUtils.map(statuses, init => notificationTypes[init ? "TOAST" : "DISABLED"].value));
			}

			getStatusWithMobileAndActivity (id, config) {
				let status = {name: BDFDB.UserUtils.getStatus(id), activity: null, custom: false, mobile: BDFDB.LibraryModules.StatusMetaUtils.isMobileOnline(id)};
				let activity = BDFDB.UserUtils.getActivity(id) || BDFDB.UserUtils.getCustomStatus(id);
				if (activity && BDFDB.DiscordConstants.ActivityTypes[activity.type]) {
					let isCustom = activity.type == BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS;
					let activityName = isCustom ? "custom" : BDFDB.DiscordConstants.ActivityTypes[activity.type].toLowerCase();
					if (statuses[activityName] && config[activityName]) {
						Object.assign(status, {name: isCustom ? status.name : activityName, activity: Object.assign({}, activity), custom: isCustom});
						if (activity.type == BDFDB.DiscordConstants.ActivityTypes.STREAMING || activity.type == BDFDB.DiscordConstants.ActivityTypes.LISTENING) delete status.activity.name;
						else if (activity.type == BDFDB.DiscordConstants.ActivityTypes.PLAYING) {
							delete status.activity.details;
							delete status.activity.state;
						}
					}
				}
				return status;
			}
			
			getStatusName (id, status) {
				if (!status) return "";
				let statusName = (BDFDB.LanguageUtils.LanguageStringsCheck[statuses[status.name].name] && BDFDB.LanguageUtils.LanguageStrings[statuses[status.name].name] || this.labels["status_" + status.name] || statuses[status.name].name || "").toLowerCase();
				if (status.mobile && observedUsers[id].mobile) statusName += ` (${BDFDB.LanguageUtils.LanguageStrings.ACTIVE_ON_MOBILE})`;
				return statusName;
			}
			
			compareActivity (id, status) {
				return BDFDB.equals(BDFDB.ObjectUtils.extract(userStatusStore[id].activity, "name", "details", "state", "emoji"), status && BDFDB.ObjectUtils.extract(status.activity, "name", "details", "state", "emoji"));
			}

			startInterval () {
				BDFDB.TimeUtils.clear(checkInterval);
				
				settings = BDFDB.DataUtils.get(this, "settings");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				dates = BDFDB.DataUtils.get(this, "dates");
				notificationStrings = BDFDB.DataUtils.get(this, "notificationstrings");
				notificationSounds = BDFDB.DataUtils.get(this, "notificationsounds");
				
				let {data} = this.getObserverData();
				observedUsers = Object.assign({}, data.nonFriends, data.friends);
				delete observedUsers[BDFDB.UserUtils.me.id];
				
				for (let id in observedUsers) userStatusStore[id] = this.getStatusWithMobileAndActivity(id, observedUsers[id]);
				
				checkInterval = BDFDB.TimeUtils.interval(_ => {
					let amount = BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount();
					if (friendCounter && friendCounter.props.amount != amount) {
						friendCounter.props.amount = amount;
						BDFDB.ReactUtils.forceUpdate(friendCounter);
					}
					for (let id in observedUsers) if (!observedUsers[id].disabled) {
						let user = BDFDB.LibraryModules.UserStore.getUser(id);
						let status = this.getStatusWithMobileAndActivity(id, observedUsers[id]);
						let customChanged = false;
						if (user && observedUsers[id][status.name] && (
							userStatusStore[id].name != status.name ||
							observedUsers[id].mobile && userStatusStore[id].mobile != status.mobile ||
							observedUsers[id].custom && (
								userStatusStore[id].custom != status.custom ||
								(customChanged = status.custom && !this.compareActivity(id, status))
							) ||
							statuses[status.name].checkActivity && !this.compareActivity(id, status)
						)) {
							let EUdata = BDFDB.BDUtils.isPluginEnabled("EditUsers") && BDFDB.DataUtils.load("EditUsers", "users", user.id) || {};
							let name = EUdata.name || user.username;
							let avatar = EUdata.removeIcon ? "" : (EUdata.url || BDFDB.UserUtils.getAvatar(user.id));
							let timestamp = new Date().getTime();
							
							let statusName = this.getStatusName(id, status);
							let oldStatusName = this.getStatusName(id, userStatusStore[id]);
							
							let string = notificationStrings[customChanged ? "custom" : status.name] || "'$user' changed status to '$status'";
							let toastString = BDFDB.StringUtils.htmlEscape(string).replace(/'{0,1}\$user'{0,1}/g, `<strong>${BDFDB.StringUtils.htmlEscape(name)}</strong>${settings.showDiscriminator ? ("#" + user.discriminator) : ""}`).replace(/'{0,1}\$statusOld'{0,1}/g, `<strong>${oldStatusName}</strong>`).replace(/'{0,1}\$status'{0,1}/g, `<strong>${statusName}</strong>`);
							if (status.activity) toastString = toastString.replace(/'{0,1}\$song'{0,1}|'{0,1}\$game'{0,1}/g, `<strong>${status.activity.name || status.activity.details || ""}</strong>`).replace(/'{0,1}\$artist'{0,1}|'{0,1}\$custom'{0,1}/g, `<strong>${[status.activity.emoji && status.activity.emoji.name, status.activity.state].filter(n => n).join(" ") || ""}</strong>`);
							
							timeLog.unshift({
								string: toastString,
								avatar: avatar,
								name: name,
								status: BDFDB.UserUtils.getStatus(user.id),
								timestamp: timestamp
							});
							
							if (!(settings.muteOnDND && BDFDB.UserUtils.getStatus() == BDFDB.DiscordConstants.StatusTypes.DND) && (!lastTimes[user.id] || lastTimes[user.id] != timestamp)) {
								lastTimes[user.id] = timestamp;
								
								let openChannel = _ => {
									if (settings.openOnClick) {
										let DMid = BDFDB.LibraryModules.ChannelStore.getDMFromUserId(user.id)
										if (DMid) BDFDB.LibraryModules.ChannelUtils.selectPrivateChannel(DMid);
										else BDFDB.LibraryModules.DirectMessageUtils.openPrivateChannel(BDFDB.UserUtils.me.id, user.id);
										BDFDB.LibraryModules.WindowUtils.focus();
									}
								};
								if (observedUsers[id][status.name] == notificationTypes.DESKTOP.value) {
									let desktopString = string.replace(/\$user/g, `${name}${settings.showDiscriminator ? ("#" + user.discriminator) : ""}`).replace(/\$status/g, statusName).replace(/\$statusOld/g, oldStatusName);
									if (status.activity) desktopString = desktopString.replace(/\$song|\$game/g, status.activity.name || status.activity.details || "").replace(/\$artist|\$custom/g, [status.activity.emoji && status.activity.emoji.name, status.activity.state].filter(n => n).join(" ") || "");
									let notificationSound = notificationSounds["desktop" + status.name] || {};
									BDFDB.NotificationUtils.desktop(desktopString, {
										icon: avatar,
										silent: notificationSound.mute,
										sound: notificationSound.song,
										onClick: openChannel
									});
								}
								else BDFDB.NotificationUtils.toast(BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(toastString)), {
									timeout: amounts.toastTime * 1000,
									avatar: avatar,
									barColor: BDFDB.UserUtils.getStatusColor(status.name, true),
									onClick: openChannel,
									onShow: _ => {
										let notificationSound = notificationSounds["toast" + status.name] || {};
										if (!notificationSound.mute && notificationSound.song) {
											let audio = new Audio();
											audio.src = notificationSound.song;
											audio.play();
										}
									}
								});
							}
						}
						userStatusStore[id] = status;
					}
				}, amounts.checkInterval * 1000);
			}	

			showTimeLog () {
				let searchTimeout;
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: "LogIn/-Out Timelog",
					subHeader: "",
					className: BDFDB.disCN._friendnotificationstimelogmodal,
					titleChildren: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
						autoFocus: true,
						query: "",
						onChange: (value, instance) => {
							BDFDB.TimeUtils.clear(searchTimeout);
							searchTimeout = BDFDB.TimeUtils.timeout(_ => {
								let searchString = value.toUpperCase();
								timeLogList.props.entries = timeLog.filter(n => n && n.name && n.name.toUpperCase().indexOf(searchString) > -1);
								BDFDB.ReactUtils.forceUpdate(timeLogList);
							}, 1000);
						},
						onClear: instance => {
							timeLogList.props.entries = timeLog;
							BDFDB.ReactUtils.forceUpdate(timeLogList);
						}
					}),
					children: BDFDB.ReactUtils.createElement(TimeLogComponent, {
						entries: timeLog
					})
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							status_listening:					"Слушане",
							status_playing:						"Играе"
						};
					case "da":		// Danish
						return {
							status_listening:					"Hører efter",
							status_playing:						"Spiller"
						};
					case "de":		// German
						return {
							status_listening:					"Hören",
							status_playing:						"Spielen"
						};
					case "el":		// Greek
						return {
							status_listening:					"Ακούγοντας",
							status_playing:						"Παιχνίδι"
						};
					case "es":		// Spanish
						return {
							status_listening:					"Escuchando",
							status_playing:						"Jugando"
						};
					case "fi":		// Finnish
						return {
							status_listening:					"Kuunteleminen",
							status_playing:						"Pelataan"
						};
					case "fr":		// French
						return {
							status_listening:					"Écoute",
							status_playing:						"En jouant"
						};
					case "hr":		// Croatian
						return {
							status_listening:					"Slušanje",
							status_playing:						"Sviranje"
						};
					case "hu":		// Hungarian
						return {
							status_listening:					"Hallgatás",
							status_playing:						"Játék"
						};
					case "it":		// Italian
						return {
							status_listening:					"Ascoltando",
							status_playing:						"Giocando"
						};
					case "ja":		// Japanese
						return {
							status_listening:					"聞いている",
							status_playing:						"遊ぶ"
						};
					case "ko":		// Korean
						return {
							status_listening:					"청취",
							status_playing:						"놀이"
						};
					case "lt":		// Lithuanian
						return {
							status_listening:					"Klausymas",
							status_playing:						"Žaidžia"
						};
					case "nl":		// Dutch
						return {
							status_listening:					"Luisteren",
							status_playing:						"Spelen"
						};
					case "no":		// Norwegian
						return {
							status_listening:					"Lytte",
							status_playing:						"Spiller"
						};
					case "pl":		// Polish
						return {
							status_listening:					"Słuchający",
							status_playing:						"Gra"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							status_listening:					"Ouvindo",
							status_playing:						"Jogando"
						};
					case "ro":		// Romanian
						return {
							status_listening:					"Ascultare",
							status_playing:						"Joc"
						};
					case "ru":		// Russian
						return {
							status_listening:					"Прослушивание",
							status_playing:						"Играет"
						};
					case "sv":		// Swedish
						return {
							status_listening:					"Lyssnande",
							status_playing:						"Spelar"
						};
					case "th":		// Thai
						return {
							status_listening:					"การฟัง",
							status_playing:						"กำลังเล่น"
						};
					case "tr":		// Turkish
						return {
							status_listening:					"Dinleme",
							status_playing:						"Çalma"
						};
					case "uk":		// Ukrainian
						return {
							status_listening:					"Слухання",
							status_playing:						"Гра"
						};
					case "vi":		// Vietnamese
						return {
							status_listening:					"Lắng nghe",
							status_playing:						"Đang chơi"
						};
					case "zh-CN":	// Chinese (China)
						return {
							status_listening:					"倾听",
							status_playing:						"玩"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							status_listening:					"傾聽",
							status_playing:						"玩"
						};
					default:		// English
						return {
							status_listening:					"Listening",
							status_playing:						"Playing"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();