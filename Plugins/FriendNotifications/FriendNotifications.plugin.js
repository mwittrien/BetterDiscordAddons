//META{"name":"FriendNotifications","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/FriendNotifications","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/FriendNotifications/FriendNotifications.plugin.js"}*//

var FriendNotifications = (_ => {
	var _this;
	var userStatusStore, timeLog, lastTimes, friendCounter, checkInterval, paginationOffset = {};
	var settings = {}, amounts = {}, notificationStrings = {}, notificationSounds = {}, observedUsers = {};
	
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
					onClick: _ => {
						_this.showTimeLog();
					}
				})
			});
		}
	};
		
	return class FriendNotifications {
		getName () {return "FriendNotifications";}

		getVersion () {return "1.5.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Notifies you when a Friend or a User your choose to observe changes their online status, can be configured individually in the settings.";}

		constructor () {
			this.changelog = {
				"added":[["Discriminator","Added option to show discriminator in notifications"]]
			};
			
			this.patchedModules = {
				after: {
					Guilds: "render"
				}
			};
		}

		initConstructor () {
			_this = this;
			
			userStatusStore = {};
			timeLog = [];
			lastTimes = {};
			friendCounter = null;
		
			this.css = `
				${BDFDB.dotCN._friendnotificationslogtime} {
					width: 160px;
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
			`;

			this.defaults = {
				settings: {
					addOnlineCount:		{value:true, 	description:"Adds an online friend counter to the server list (click to open logs)"},
					showDiscriminator:	{value:false, 	description:"Adds the user discriminator"},
					disableForNew:		{value:false, 	description:"Disable Notifications for newly added Friends:"},
					muteOnDND:			{value:false, 	description:"Do not notify me when I am DnD"},
					openOnClick:		{value:false, 	description:"Open the DM when you click a Notification"}
				},
				notificationstrings: {
					online: 			{value:"$user changed status to '$status'",			libString:"STATUS_ONLINE",			init:true},
					mobile: 			{value:"$user changed status to '$status'",			libString:"STATUS_ONLINE_MOBILE",	init:true},
					idle: 				{value:"$user changed status to '$status'",			libString:"STATUS_IDLE",			init:false},
					dnd: 				{value:"$user changed status to '$status'",			libString:"STATUS_DND",				init:false},
					playing: 			{value:"$user started playing '$game'",				statusName:"Playing",				init:false},
					listening: 			{value:"$user started listening to '$song'",		statusName:"Listening",				init:false},
					streaming: 			{value:"$user started streaming '$game'",			libString:"STATUS_STREAMING",		init:false},
					offline: 			{value:"$user changed status to '$status'",			libString:"STATUS_OFFLINE",			init:true}
				},
				notificationsounds: {},
				amounts: {
					toastTime:			{value:5, 		min:1,		description:"Amount of seconds a toast notification stays on screen:"},
					desktopTime:		{value:5, 		min:1,		description:"Amount of seconds a desktop notification stays on screen:"},
					checkInterval:		{value:10, 		min:5,		description:"Check Users every X seconds:"}
				}
			};
			
			for (let type in this.defaults.notificationstrings) {
				this.defaults.notificationsounds["toast" + type] = {value:{url:null,song:null,mute:false}};
				this.defaults.notificationsounds["desktop" + type] = {value:{url:null,song:null,mute:false}};
			}
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			
			let changeNotificationType = (type, userId, desktopon, disableon) => {
				let data = BDFDB.DataUtils.load(this, type, userId) || this.createDefaultConfig();
				data.desktop = desktopon;
				data.disabled = disableon;
				BDFDB.DataUtils.save(data, this, type, userId);
				this.SettingsUpdated = true;
				BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
			};
			let changeAllConfigs = (type, config, enable) => {
				let allData = BDFDB.DataUtils.load(this, type);
				if (config == "type") {
					config = "desktop";
					enable = !enable;
					let disabled = BDFDB.ObjectUtils.toArray(allData).every(d => !d.disabled && d[config] == enable);
					for (let id in allData) allData[id].disabled = disabled;
				}
				for (let id in allData) allData[id][config] = enable;
				BDFDB.DataUtils.save(allData, this, type);
				this.SettingsUpdated = true;
				BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
			};
			let successSavedAudio = (type, parsedUrl, parsedData) => {
				if (parsedUrl && parsedData) BDFDB.NotificationUtils.toast(`Sound was saved successfully.`, {type:"success"});
				notificationSounds[type].url = parsedUrl;
				notificationSounds[type].song = parsedData;
				BDFDB.DataUtils.save(notificationSounds[type], this, "notificationsounds", type);
				this.SettingsUpdated = true;
			};
			let createUserList = (users, type, title) => {
				let items = [];
				items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
					children: [
						"Click on an Icon to toggle",
						BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN._friendnotificationstypelabel,
							style: {backgroundColor: BDFDB.DiscordConstants.Colors.BRAND},
							children: "Toast"
						}),
						"Notifications for that User:"
					]
				}));
				if ("Notification" in window) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
					children: [
						"Right-Click on an Icon to toggle",
						BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN._friendnotificationstypelabel,
							style: {backgroundColor: BDFDB.DiscordConstants.Colors.STATUS_GREEN},
							children: "Desktop"
						}),
						"Notifications for that User:"
					]
				}));
				items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
					className: BDFDB.disCN.margintop20,
					title: "type",
					settings: Object.keys(this.defaults.notificationstrings),
					data: users,
					pagination: {
						alphabetKey: "username",
						amount: 50,
						offset: paginationOffset[title] || 0,
						onJump: offset => {paginationOffset[title] = offset;}
					},
					renderLabel: data => [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AvatarComponents.default, {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.listavatar, data.disabled && BDFDB.disCN.avatardisabled),
							src: BDFDB.UserUtils.getAvatar(data.id),
							status: BDFDB.UserUtils.getStatus(data.id),
							size: BDFDB.LibraryComponents.AvatarComponents.Sizes.SIZE_40,
							onClick: (e, instance) => {
								changeNotificationType(type, data.id, false, !(data.disabled || data.desktop));
							},
							onContextMenu: (e, instance) => {
								changeNotificationType(type, data.id, true, !(data.disabled || !data.desktop));
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
							children: data.username
						})
					],
					onHeaderClick: (config, instance) => {
						changeAllConfigs(type, config, true);
					},
					onHeaderContextMenu: (config, instance) => {
						changeAllConfigs(type, config, false);
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
					dividertop: true,
					children: items
				});
			};
			
			let settings = BDFDB.DataUtils.get(this, "settings");
			let amounts = BDFDB.DataUtils.get(this, "amounts");
			let notificationStrings = BDFDB.DataUtils.get(this, "notificationstrings");
			let notificationSounds = BDFDB.DataUtils.get(this, "notificationsounds");

			let friendIds = BDFDB.LibraryModules.FriendUtils.getFriendIDs();
			let friendsData = BDFDB.DataUtils.load(this, "friends"), nonFriendsData = BDFDB.DataUtils.load(this, "nonfriends");
			let friends = [], nonFriends = [];
			
			let settingsPanel, settingsItems = [], innerItems = [];
			
			for (let id of friendIds) {
				let user = BDFDB.LibraryModules.UserStore.getUser(id);
				if (user) {
					friendsData[id] = Object.assign({}, friendsData[id] || nonFriendsData[id] || this.createDefaultConfig());
					delete nonFriendsData[id];
				}
			}
			for (let id in friendsData) {
				let user = BDFDB.LibraryModules.UserStore.getUser(id);
				if (user) {
					if (!friendIds.includes(id)) {
						nonFriendsData[id] = Object.assign({}, friendsData[id]);
						delete friendsData[id];
					}
					else if (id != BDFDB.UserUtils.me.id) friends.push(Object.assign({}, user, friendsData[id], {key:id, className: friendsData[id].disabled ? "" : (friendsData[id].desktop ? BDFDB.disCN.cardsuccessoutline : BDFDB.disCN.cardbrandoutline)}));
				}
			}
			for (let id in nonFriendsData) {
				let user = BDFDB.LibraryModules.UserStore.getUser(id);
				if (user && id != BDFDB.UserUtils.me.id) nonFriends.push(Object.assign({}, user, nonFriendsData[id], {key:id, className: nonFriendsData[id].disabled ? "" : (nonFriendsData[id].desktop ? BDFDB.disCN.cardsuccessoutline : BDFDB.disCN.cardbrandoutline)}));
			}

			BDFDB.DataUtils.save(friendsData, this, "friends");
			BDFDB.DataUtils.save(nonFriendsData, this, "nonfriends");
			
			for (let key in settings) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			for (let key in amounts) if (key.indexOf("desktop") == -1 || "Notification" in window) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
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
			
			if (friends.length) settingsItems.push(createUserList(friends, "friends", "Friend-List"));
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
								value: ""
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
							onClick: _ => {
								let userId = settingsPanel.querySelector(`.input-newstranger ` + BDFDB.dotCN.input).value.trim();
								if (userId == BDFDB.UserUtils.me.id) BDFDB.NotificationUtils.toast("Are you seriously trying to stalk yourself?", {type:"error"});
								else if (friendIds.includes(userId)) BDFDB.NotificationUtils.toast("User is already a friend of yours. Please use the 'Friend-List' area to configure them.", {type:"error"});
								else if (Object.keys(nonFriends).includes(userId)) BDFDB.NotificationUtils.toast("User is already being observed as a 'Stranger'.", {type:"error"});
								else {
									let user = /.+#[0-9]{4}/.test(userId) ? BDFDB.LibraryModules.UserStore.findByTag(userId.split("#").slice(0, -1).join("#"), userId.split("#").pop()) : BDFDB.LibraryModules.UserStore.getUser(userId);
									if (user) {
										BDFDB.DataUtils.save(this.createDefaultConfig(), this, "nonfriends", userId);
										BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
										this.SettingsUpdated = true;
									}
									else BDFDB.NotificationUtils.toast("Please enter a valid UserID of a user that has been loaded in your client.", {type:"error"});
								}
							},
							children: BDFDB.LanguageUtils.LanguageStrings.ADD
						})
					]
				})
			}));
			if (nonFriends.length) settingsItems.push(createUserList(nonFriends, "nonfriends", "Stranger-List"));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "LogIn/-Out Timelog",
				collapseStates: collapseStates,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					className: BDFDB.disCN.marginbottom8,
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
						className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
						children: [
							"Allows you to configure your own message strings for the different statuses. ",
							BDFDB.ReactUtils.createElement("strong", {children: "$user"}),
							" is the placeholder for the username, ",
							BDFDB.ReactUtils.createElement("strong", {children: "$status"}),
							" for the statusName, ",
							BDFDB.ReactUtils.createElement("strong", {children: "$game"}),
							" for the gamename, ",
							BDFDB.ReactUtils.createElement("strong", {children: "$song"}),
							" for the songname and ",
							BDFDB.ReactUtils.createElement("strong", {children: "$artist"}),
							" for the songartist."
						]
					})
				})].concat(Object.keys(notificationStrings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "TextInput",
					plugin: this,
					keys: ["notificationstrings", key],
					placeholder: this.defaults.notificationstrings[key].value,
					label: `${BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(key)} Message:`,
					basis: "70%",
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
								label: `${key.split(/(desktop)|(toast)/).filter(n => n).map(n => BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(n)).join("-")} Notification Sound:`,
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
									let source = settingsPanel.querySelector(`.input-${key}src ` + BDFDB.dotCN.input).value.trim();
									if (!source.length) {
										BDFDB.NotificationUtils.toast(`Sound file was removed.`, {type:"warn"});
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
										BDFDB.NotificationUtils.toast("Use a valid direct link to a video or audio source. They usually end on something like .mp3, .mp4 or .wav.", {type:"danger"});
									});
									else BDFDB.LibraryRequires.fs.readFile(source, (error, response) => {
										if (error) BDFDB.NotificationUtils.toast("Could not fetch file. Please make sure the file exists.", {type:"danger"});
										else successSavedAudio(key, source, `data:audio/mpeg;base64,${response.toString("base64")}`);
									});
								},
								children: BDFDB.LanguageUtils.LanguageStrings.SAVE
							})
						]
					})
				]).flat(10).filter(n => n)
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

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

				this.startInterval();

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.TimeUtils.clear(checkInterval);
				
				BDFDB.ModuleUtils.forceAllUpdates(this);
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				
				this.startInterval();
				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
		}
		
		processGuilds (e) {
			if (settings.addOnlineCount) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ConnectedUnreadDMs"});
				if (index > -1) children.splice(index, 0, BDFDB.ReactUtils.createElement(FriendOnlineCounterComponent, {
					amount: BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount()
				}));
			}
		}

		createDefaultConfig () {
			return Object.assign({
				desktop: false,
				disabled: settings.disableForNew
			}, BDFDB.ObjectUtils.map(this.defaults.notificationstrings, "init"));
		}

		getStatusWithMobileAndActivity (id, config) {
			let statusName = BDFDB.UserUtils.getStatus(id);
			let status = {statusName, isActivity:false};
			let activity = BDFDB.UserUtils.getActivitiy(id);
			if (activity && BDFDB.DiscordConstants.ActivityTypes[activity.type]) {
				let activityName = BDFDB.DiscordConstants.ActivityTypes[activity.type].toLowerCase();
				if (this.defaults.notificationstrings[activityName] && config[activityName]) {
					status = Object.assign({statusName:activityName, isActivity:true}, activity);
					if (activityName == "listening" || activityName == "streaming") delete status.name;
				}
			}
			if (status.statusName == "online" && BDFDB.LibraryModules.StatusMetaUtils.isMobileOnline(id)) status.statusName = "mobile";
			return status;
		}

		startInterval () {
			BDFDB.TimeUtils.clear(checkInterval);
			
			settings = BDFDB.DataUtils.get(this, "settings");
			amounts = BDFDB.DataUtils.get(this, "amounts");
			notificationStrings = BDFDB.DataUtils.get(this, "notificationstrings");
			notificationSounds = BDFDB.DataUtils.get(this, "notificationsounds");
			
			observedUsers = Object.assign({}, BDFDB.DataUtils.load(this, "nonfriends"), BDFDB.DataUtils.load(this, "friends"));
			
			for (let id in observedUsers) userStatusStore[id] = this.getStatusWithMobileAndActivity(id, observedUsers[id]).statusName;
			
			let toastTime = (amounts.toastTime > amounts.checkInterval ? amounts.checkInterval : amounts.toastTime) * 1000;
			let desktopTime = (amounts.desktopTime > amounts.checkInterval ? amounts.checkInterval : amounts.desktopTime) * 1000;
			
			checkInterval = BDFDB.TimeUtils.interval(_ => {
				let amount = BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount();
				if (friendCounter && friendCounter.props.amount != amount) {
					friendCounter.props.amount = amount;
					BDFDB.ReactUtils.forceUpdate(friendCounter);
				}
				for (let id in observedUsers) if (!observedUsers[id].disabled) {
					let user = BDFDB.LibraryModules.UserStore.getUser(id);
					let status = this.getStatusWithMobileAndActivity(id, observedUsers[id]);
					if (user && userStatusStore[id] != status.statusName && observedUsers[id][status.statusName]) {
						let EUdata = BDFDB.BDUtils.isPluginEnabled("EditUsers") && BDFDB.DataUtils.load("EditUsers", "users", user.id) || {};
						let name = EUdata.name || user.username;
						let avatar = EUdata.removeIcon ? "" : (EUdata.url || BDFDB.UserUtils.getAvatar(user.id));
						let timeString = (new Date()).toLocaleString();
						
						let libString = (this.defaults.notificationstrings[status.statusName].libString ? BDFDB.LanguageUtils.LanguageStrings[this.defaults.notificationstrings[status.statusName].libString] : (this.defaults.notificationstrings[status.statusName].statusName || "")).toLowerCase();
						let string = notificationStrings[status.statusName] || "$user changed status to $status";
						let toastString = BDFDB.StringUtils.htmlEscape(string).replace(/'{0,1}\$user'{0,1}/g, `<strong>${BDFDB.StringUtils.htmlEscape(name)}</strong>${settings.showDiscriminator ? ("#" + user.discriminator) : ""}`).replace(/'{0,1}\$status'{0,1}/g, `<strong>${libString}</strong>`);
						if (status.isActivity) toastString = toastString.replace(/'{0,1}\$song'{0,1}|'{0,1}\$game'{0,1}/g, `<strong>${status.name || status.details}</strong>`).replace(/'{0,1}\$artist'{0,1}/g, `<strong>${status.state}</strong>`);
						
						timeLog.unshift({
							string: toastString,
							avatar: avatar,
							name: name,
							status: BDFDB.UserUtils.getStatus(user.id),
							timeString: timeString
						});
						
						if (!(settings.muteOnDND && BDFDB.UserUtils.getStatus() == BDFDB.DiscordConstants.StatusTypes.DND) && (!lastTimes[user.id] || lastTimes[user.id] != timeString)) {
							lastTimes[user.id] = timeString;
							
							let openChannel = _ => {
								if (settings.openOnClick) {
									let DMid = BDFDB.LibraryModules.ChannelStore.getDMFromUserId(user.id)
									if (DMid) BDFDB.LibraryModules.SelectChannelUtils.selectPrivateChannel(DMid);
									else BDFDB.LibraryModules.DirectMessageUtils.openPrivateChannel(BDFDB.UserUtils.me.id, user.id);
									BDFDB.LibraryRequires.electron.remote.getCurrentWindow().focus();
								}
							};
							if (!observedUsers[id].desktop) {
								if (!document.querySelector(`.friendnotifications-${id}-toast`)) {
									let toast = BDFDB.NotificationUtils.toast(`<div class="toast-inner"><div class="toast-avatar" style="background-image:url(${avatar});"></div><div>${toastString}</div></div>`, {html:true, timeout:toastTime, color:BDFDB.UserUtils.getStatusColor(status.statusName), icon:false, selector:`friendnotifications-${status.statusName}-toast friendnotifications-${id}-toast`});
									toast.addEventListener("click", openChannel);
									let notificationsound = notificationSounds["toast" + status.statusName] || {};
									if (!notificationsound.mute && notificationsound.song) {
										let audio = new Audio();
										audio.src = notificationsound.song;
										audio.play();
									}
								}
							}
							else {
								let desktopString = string.replace(/\$user/g, `${name}${settings.showDiscriminator ? ("#" + user.discriminator) : ""}`).replace(/\$status/g, libString);
								if (status.isActivity) desktopString = desktopString.replace(/\$song|\$game/g, status.name || status.details).replace(/\$artist/g, status.state);
								let notificationsound = notificationSounds["desktop" + status.statusName] || {};
								BDFDB.NotificationUtils.desktop(desktopString, {icon:avatar, timeout:desktopTime, click:openChannel, silent:notificationsound.mute, sound:notificationsound.song});
							}
						}
					}
					userStatusStore[id] = status.statusName;
				}
			}, amounts.checkInterval * 1000);
		}	

		showTimeLog () {
			if (!timeLog.length) BDFDB.NotificationUtils.toast("No logs saved yet", {type: "error"});
			else BDFDB.ModalUtils.open(this, {
				size: "MEDIUM",
				header: "LogIn/-Out Timelog",
				subheader: "",
				className: `${this.name}-Log-modal`,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PaginatedList, {
					items: timeLog,
					amount: 100,
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
									children: `[${log.timeString}]`
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
				})
			});
		}
	}
})();

module.exports = FriendNotifications;