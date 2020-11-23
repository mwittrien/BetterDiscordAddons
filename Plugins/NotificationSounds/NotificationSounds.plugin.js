/**
 * @name NotificationSounds
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/NotificationSounds
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/NotificationSounds/NotificationSounds.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/NotificationSounds/NotificationSounds.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "NotificationSounds",
			"author": "DevilBro",
			"version": "3.5.7",
			"description": "Allow you to replace the native sounds of Discord with your own"
		},
		"changeLog": {
			"fixed": {
				"New Settings Menu": "Fixed for new settings menu"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
	} : (([Plugin, BDFDB]) => {
		var audios, choices, firedEvents;
		var volumes = {};
		
		const removeAllKey = "REMOVE_ALL_BDFDB_DEVILBRO_DO_NOT_COPY";
		const defaultDevice = "default";
		
		var currentDevice = defaultDevice, createdAudios = {}, repatchIncoming;
		
		/* NEVER CHANGE THE SRC LINKS IN THE PLUGIN FILE, TO ADD NEW SOUNDS ADD THEM IN THE SETTINGS GUI IN THE PLUGINS PAGE */
		const types = {
			"message1":					{implemented: true,		name: "New Chatmessage",			src: "/assets/dd920c06a01e5bb8b09678581e29d56f.mp3",	mute: true,		focus: null,	include: true},
			"dm":						{implemented: true,		name: "Direct Message",				src: "/assets/84c9fa3d07da865278bd77c97d952db4.mp3",	mute: true,		focus: true,	include: false},
			"mentioned":				{implemented: true,		name: "Mentioned",					src: "/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute: true,		focus: true,	include: false},
			"role":						{implemented: true,		name: "Mentioned (role)",			src: "/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute: true,		focus: true,	include: false},
			"everyone":					{implemented: true,		name: "Mentioned (@everyone)",		src: "/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute: true,		focus: true,	include: false},
			"here":						{implemented: true,		name: "Mentioned (@here)",			src: "/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute: true,		focus: true,	include: false},
			"deafen":					{implemented: true,		name: "Voicechat Deafen",			src: "/assets/e4d539271704b87764dc465b1a061abd.mp3",	mute: false,	focus: null,	include: true},
			"mute":						{implemented: true,		name: "Voicechat Mute",				src: "/assets/429d09ee3b86e81a75b5e06d3fb482be.mp3",	mute: false,	focus: null,	include: true},
			"disconnect":				{implemented: true,		name: "Voicechat Disconnect",		src: "/assets/7e125dc075ec6e5ae796e4c3ab83abb3.mp3",	mute: false,	focus: null,	include: true},
			"undeafen":					{implemented: true,		name: "Voicechat Undeafen",			src: "/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3",	mute: false,	focus: null,	include: true},
			"unmute":					{implemented: true,		name: "Voicechat Unmute",			src: "/assets/43805b9dd757ac4f6b9b58c1a8ee5f0d.mp3",	mute: false,	focus: null,	include: true},
			"user_join":				{implemented: true,		name: "Voicechat User Joined",		src: "/assets/5dd43c946894005258d85770f0d10cff.mp3",	mute: false,	focus: null,	include: true},
			"user_leave":				{implemented: true,		name: "Voicechat User Left",		src: "/assets/4fcfeb2cba26459c4750e60f626cebdc.mp3",	mute: false,	focus: null,	include: true},
			"user_moved":				{implemented: true,		name: "Voicechat User Moved",		src: "/assets/e81d11590762728c1b811eadfa5be766.mp3",	mute: false,	focus: null,	include: true},
			"reconnect":				{implemented: false,	name: "Voicechat Reconnect",		src: "/assets/471cfd0005b112ff857705e894bf41a6.mp3",	mute: true,		focus: null,	include: true},
			"ptt_start":				{implemented: true,		name: "Push2Talk Start",			src: "/assets/8b63833c8d252fedba6b9c4f2517c705.mp3",	mute: false,	focus: null,	include: true},
			"ptt_stop":					{implemented: true,		name: "Push2Talk Stop",				src: "/assets/74ab980d6890a0fa6aa0336182f9f620.mp3",	mute: false,	focus: null,	include: true},
			"call_calling":				{implemented: true,		name: "Outgoing Call",				src: "/assets/c6e92752668dde4eee5923d70441579f.mp3",	mute: false,	focus: null,	include: true},
			"call_ringing":				{implemented: true,		name: "Incoming Call",				src: "/assets/84a1b4e11d634dbfa1e5dd97a96de3ad.mp3",	mute: true,		focus: null,	include: true},
			"call_ringing_beat":		{implemented: false,	name: "Incoming Call Beat",			src: "/assets/b9411af07f154a6fef543e7e442e4da9.mp3",	mute: true,		focus: null,	include: true},
			"call_ringing_halloween":	{implemented: false,	name: "Incoming Call Halloween",	src: "/assets/bceeb2ba92c01584dcaafc957f769bae.mp3",	mute: true,		focus: null,	include: true},
			"stream_started":			{implemented: true,		name: "Stream Started",				src: "/assets/9ca817f41727edc1b2f1bc4f1911107c.mp3",	mute: false,	focus: null,	include: true},
			"stream_ended":				{implemented: true,		name: "Stream Ended",				src: "/assets/4e30f98aa537854f79f49a76af822bbc.mp3",	mute: false,	focus: null,	include: true},
			"stream_user_joined":		{implemented: true,		name: "Stream User Joined",			src: "/assets/5827bbf9a67c61cbb0e02ffbf434b654.mp3",	mute: false,	focus: null,	include: true},
			"stream_user_left":			{implemented: true,		name: "Stream User Left",			src: "/assets/7cdcdcbc426cc43583365a671c24b740.mp3",	mute: false,	focus: null,	include: true},
			"ddr-down":					{implemented: true,		name: "HotKeys Window Down",		src: "/assets/71f048f8aa7d4b24bf4268a87cbbb192.mp3",	mute: false,	focus: null,	include: true},
			"ddr-left":					{implemented: true,		name: "HotKeys Window Left",		src: "/assets/1de04408e62b5d52ae3ebbb91e9e1978.mp3",	mute: false,	focus: null,	include: true},
			"ddr-right":				{implemented: true,		name: "HotKeys Window Right",		src: "/assets/2c0433f93db8449e4a82b76dc520cb29.mp3",	mute: false,	focus: null,	include: true},
			"ddr-up":					{implemented: true,		name: "HotKeys Window Up",			src: "/assets/68472713f7a62c7c37e0a6a5d5a1faeb.mp3",	mute: false,	focus: null,	include: true},
			"mention1":					{implemented: false,	name: "Mention Ping",				src: "/assets/fa4d62c3cbc80733bf1f01b9c6f181de.mp3",	mute: true,		focus: null,	include: true},
			"mention2":					{implemented: false,	name: "Mention Ping 2",				src: "/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute: true,		focus: null,	include: true},
			"mention3":					{implemented: false,	name: "Mention Ping 3",				src: "/assets/84c9fa3d07da865278bd77c97d952db4.mp3",	mute: true,		focus: null,	include: true},	
			"message2":					{implemented: false,	name: "New Chatmessage 2",			src: "/assets/15fe810f6cfab609c7fcda61652b9b34.mp3",	mute: true,		focus: null,	include: true},
			"message3":					{implemented: false,	name: "New Chatmessage 3",			src: "/assets/53ce6a92d3c233e8b4ac529d34d374e4.mp3",	mute: true,		focus: null,	include: true},
			"human_man":				{implemented: false,	name: "Human Man Voice",			src: "/assets/a37dcd6272ae41cf49295d58c9806fe3.mp3",	mute: true,		focus: null,	include: true},
			"robot_man":				{implemented: false,	name: "Robot Man Voice",			src: "/assets/66598bea6e59eb8acdf32cf2d9d75ba9.mp3",	mute: true,		focus: null,	include: true},
			"discodo":					{implemented: false,	name: "Discodo Launch",				src: "/assets/ae7d16bb2eea76b9b9977db0fad66658.mp3",	mute: true,		focus: null,	include: true},
			"overlayunlock":			{implemented: false,	name: "Overlay Unlocked",			src: "/assets/ad322ffe0a88436296158a80d5d11baa.mp3",	mute: true,		focus: null,	include: true}
		};

		/* NEVER CHANGE THE SRC LINKS IN THE PLUGIN FILE, TO ADD NEW SOUNDS ADD THEM IN THE SETTINGS GUI IN THE PLUGINS PAGE */
		const defaultAudios = {
			"---": {
				"---":						null
			},
			"Discord": {}
		};
		
		for (let id in types) if (types[id].include) defaultAudios.Discord[types[id].name] = types[id].src;
		
		const WebAudioSound = class WebAudioSound {
			constructor (type) {
				this._name = type;
				this._src = audios[choices[type].category][choices[type].sound] || types[type].src;
				this._volume = choices[type].volume;
			}
			loop () {
				this._ensureAudio().then(audio => {
					audio.loop = true;
					audio.play();
				});
			}
			play () {
				this._ensureAudio().then(audio => {
					audio.loop = false;
					audio.play();
				});
			}
			pause () {
				this._audio.then(audio => {
					audio.pause();
				});
			}
			stop () {
				this._destroyAudio();
			}
			setTime (time) {
				this._audio.then(audio => {
					audio.currentTime = time;
				});
			}
			setLoop (loop) {
				this._audio.then(audio => {
					audio.loop = loop;
				});
			}
			_destroyAudio () {
				if (this._audio) {
					this._audio.then(audio => {
						audio.pause();
						audio.src = "";
					});
					this._audio = null;
				}
			}
			_ensureAudio () {
				return this._audio = this._audio || new Promise((callback, errorCallback) => {
					let audio = new Audio;
					audio.src = this._src && this._src.startsWith("data") ? this._src.replace(/ /g, "") : this._src;
					audio.onloadeddata = _ => {
						audio.volume = Math.min((BDFDB.LibraryModules.MediaDeviceUtils.getOutputVolume() / 100) * (this._volume / 100) * (volumes.globalVolume / 100), 1);
						BDFDB.LibraryModules.PlatformUtils.embedded && audio.setSinkId(currentDevice || defaultDevice);
						callback(audio);
					};
					audio.onerror = _ => {
						return errorCallback(new Error("could not play audio"))
					};
					audio.onended = _ => {
						return this._destroyAudio()
					};
					audio.load();
				}), this._audio;
			}
		};
	
		return class NotificationSounds extends Plugin {
			onLoad() {
				audios = {};
				choices = {};
				firedEvents = {};
				
				this.defaults = {
					volumes: {
						globalVolume:				{value: 100,				description: "Global Notification Sounds Volume"}
					}
				};
				
				this.patchedModules = {
					after: {
						Shakeable: "render"
					}
				};
				
				this.patchPriority = 10;
			}
			
			onStart() {
				if (BDFDB.LibraryModules.PlatformUtils.embedded) {
					let change = _ => {
						if (window.navigator.mediaDevices && window.navigator.mediaDevices.enumerateDevices) {
							window.navigator.mediaDevices.enumerateDevices().then(enumeratedDevices => {
								let id = BDFDB.LibraryModules.MediaDeviceUtils.getOutputDeviceId();
								let allDevices = BDFDB.LibraryModules.MediaDeviceUtils.getOutputDevices();
								let filteredDevices = enumeratedDevices.filter(d => d.kind == "audiooutput" && d.deviceId != "communications");
								let deviceIndex = BDFDB.LibraryModules.ArrayUtils(allDevices).sortBy(d => d.index).findIndex(d => d.id == id);
								let deviceViaId = allDevices[id];
								let deviceViaIndex = filteredDevices[deviceIndex];
								if (deviceViaId && deviceViaIndex && deviceViaIndex.label != deviceViaId.name) deviceViaIndex = filteredDevices.find(d => d.label == deviceViaId.name);
								currentDevice = deviceViaIndex ? deviceViaIndex.deviceId : defaultDevice;
							}).catch(_ => {
								currentDevice = defaultDevice;
							});
						}
					};
					BDFDB.StoreChangeUtils.add(this, BDFDB.LibraryModules.MediaDeviceUtils, change);
					change();
				}
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dirtyDispatch", {before: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == BDFDB.DiscordConstants.ActionTypes.MESSAGE_CREATE && e.methodArguments[0].message) {
						let message = e.methodArguments[0].message;
						let guildId = message.guild_id || null;
						if (!BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildId, message.channel_id) && message.author.id != BDFDB.UserUtils.me.id && !BDFDB.LibraryModules.FriendUtils.isBlocked(message.author.id)) {
							if (!guildId && !(choices.dm.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) {
								this.fireEvent("dm");
								this.playAudio("dm");
								return;
							}
							else if (BDFDB.LibraryModules.MentionUtils.isRawMessageMentioned(message, BDFDB.UserUtils.me.id)) {
								if (message.mentions.length && !this.isSuppressMentionEnabled(guildId, message.channel_id) && !(choices.mentioned.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) for (let mention of message.mentions) if (mention.id == BDFDB.UserUtils.me.id) {
									this.fireEvent("mentioned");
									this.playAudio("mentioned");
									return;
								}
								if (guildId && message.mention_roles.length && !BDFDB.LibraryModules.MutedUtils.isSuppressRolesEnabled(guildId, message.channel_id) && !(choices.role.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) {
									let member = BDFDB.LibraryModules.MemberStore.getMember(guildId, BDFDB.UserUtils.me.id);
									if (member && member.roles.length) for (let roleId of message.mention_roles) if (member.roles.includes(roleId)) {
										this.fireEvent("role");
										this.playAudio("role");
										return;
									}
								}
								if (message.mention_everyone && !BDFDB.LibraryModules.MutedUtils.isSuppressEveryoneEnabled(guildId, message.channel_id)) {
									if (message.content.indexOf("@everyone") > -1 && !(choices.everyone.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) {
										this.fireEvent("everyone");
										this.playAudio("everyone");
										return;
									}
									if (message.content.indexOf("@here") > -1 && !(choices.here.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) {
										this.fireEvent("here");
										this.playAudio("here");
										return;
									}
								}
							}
						}
					}
				}});

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SoundUtils, "playSound", {instead: e => {
					let type = e.methodArguments[0];
					if (!type) return;
					else if (choices[type]) {
						e.stopOriginalMethodCall();
						BDFDB.TimeUtils.timeout(_ => {
							if (type == "message1") {
								if (firedEvents["dm"]) firedEvents["dm"] = false;
								else if (firedEvents["mentioned"]) firedEvents["mentioned"] = false;
								else if (firedEvents["role"]) firedEvents["role"] = false;
								else if (firedEvents["everyone"]) firedEvents["everyone"] = false;
								else if (firedEvents["here"]) firedEvents["here"] = false;
								else this.playAudio(type);
							}
							else this.playAudio(type);
						});
					}
					else e.callOriginalMethodAfterwards();
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SoundUtils, "createSound", {after: e => {
					if (choices[e.methodArguments[0]]) {
						let audio = new WebAudioSound(e.methodArguments[0]);
						createdAudios[e.methodArguments[0]] = audio;
						return audio;
					}
					else BDFDB.LogUtils.warn(`Could not create sound for "${e.methodArguments[0]}".`, this.name);
				}});
				
				
				for (let key in defaultAudios) defaultAudios[key] = BDFDB.ObjectUtils.sort(defaultAudios[key]);

				this.loadAudios();
				this.loadChoices();
				
				let callListenerModule = BDFDB.ModuleUtils.findByProperties("handleRingUpdate");
				if (callListenerModule) {
					callListenerModule.terminate();
					BDFDB.PatchUtils.patch(this, callListenerModule, "handleRingUpdate", {instead: e => {
						if (BDFDB.LibraryModules.CallUtils.getCalls().filter(call => call.ringing.length > 0 && BDFDB.LibraryModules.VoiceUtils.getCurrentClientVoiceChannelId() === call.channelId).length > 0 && !BDFDB.LibraryModules.SoundStateUtils.isSoundDisabled("call_calling") && !BDFDB.LibraryModules.StreamerModeStore.disableSounds) {
							createdAudios["call_calling"].loop();
						}
						else createdAudios["call_calling"].stop();
					}});
					callListenerModule.initialize();
				}
				
				this.forceUpdateAll();
			}
			
			onStop() {
				for (let type in createdAudios) if (createdAudios[type]) createdAudios[type].stop();
			}

			getSettingsPanel (collapseStates = {}) {				
				let createSoundCard = type => {
					return [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCN.marginbottom8,
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
									label: types[type].name
								}),
								types[type].focus != null ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									mini: true,
									grow: 0,
									label: "Mute when Channel focused:",
									value: choices[type].focus,
									onChange: value => {
										choices[type].focus = value;
										this.saveChoice(type, false);
									}
								}) : null,
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									mini: true,
									grow: 0,
									label: "Mute in DnD:",
									value: choices[type].mute,
									onChange: value => {
										choices[type].mute = value;
										this.saveChoice(type, false);
									}
								})
							].filter(n => n)
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCN.marginbottom8,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									grow: 0,
									shrink: 0,
									basis: "31%",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
										title: "Category",
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
											value: choices[type].category,
											options: Object.keys(audios).map(name => ({value: name, label: name})),
											searchable: true,
											onChange: category => {
												choices[type].category = category.value;
												choices[type].sound = Object.keys(audios[category.value] || {})[0];
												this.saveChoice(type, true);
												BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
											}
										})
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									grow: 0,
									shrink: 0,
									basis: "31%",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
										title: "Sound",
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
											value: choices[type].sound,
											options: Object.keys(audios[choices[type].category] || {}).map(name => ({value: name, label: name})),
											searchable: true,
											onChange: sound => {
												choices[type].sound = sound.value;
												this.saveChoice(type, true);
												BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
											}
										})
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									grow: 0,
									shrink: 0,
									basis: "31%",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
										title: "Volume",
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Slider, {
											defaultValue: choices[type].volume,
											digits: 1,
											onValueRender: value => {
												return value + "%";
											},
											onValueChange: value => {
												choices[type].volume = value;
												this.saveChoice(type, true);
											}
										})
									})
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCN.marginbottom8
						})
					];
				};

				let successSavedAudio = data => {
					BDFDB.NotificationUtils.toast(`Sound ${data.sound} was added to category ${data.category}.`, {type: "success"});
					if (!audios[data.category]) audios[data.category] = {};
					audios[data.category][data.sound] = data.source;
					BDFDB.DataUtils.save(audios, this, "audios");
					BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
					
				};
				
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: Object.keys(volumes).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Slider",
								plugin: this,
								keys: ["volumes", key],
								basis: "50%",
								label: this.defaults.volumes[key].description,
								value: volumes[key]
							}))
						}));
					
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Add new Sound",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.margintop4,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
												title: "Categoryname",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-newsound input-category",
													value: "",
													placeholder: "Categoryname"
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
												title: "Soundname",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-newsound input-sound",
													value: "",
													placeholder: "Soundname"
												})
											})
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.margintop4,
									align: BDFDB.LibraryComponents.Flex.Align.END,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
												title: "Source",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-newsound input-source",
													type: "file",
													filter: ["audio", "video"],
													useFilePath: true,
													value: "",
													placeholder: "Source"
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											style: {marginBottom: 1},
											onClick: _ => {
												for (let input of settingsPanel.props._node.querySelectorAll(".input-newsound " + BDFDB.dotCN.input)) if (!input.value || input.value.length == 0 || input.value.trim().length == 0) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new sound", {type: "danger"});
												let category = settingsPanel.props._node.querySelector(".input-category " + BDFDB.dotCN.input).value.trim();
												let sound = settingsPanel.props._node.querySelector(".input-sound " + BDFDB.dotCN.input).value.trim();
												let source = settingsPanel.props._node.querySelector(".input-source " + BDFDB.dotCN.input).value.trim();
												if (source.indexOf("http") == 0) BDFDB.LibraryRequires.request(source, (error, response, result) => {
													if (response) {
														let type = response.headers["content-type"];
														if (type && (type.indexOf("octet-stream") > -1 || type.indexOf("audio") > -1 || type.indexOf("video") > -1)) return successSavedAudio({category, sound, source});
													}
													BDFDB.NotificationUtils.toast("Use a valid direct link to a video or audio source, they usually end on something like .mp3, .mp4 or .wav", {type: "danger"});
												});
												else BDFDB.LibraryRequires.fs.readFile(source, (error, response) => {
													if (error) BDFDB.NotificationUtils.toast("Could not fetch file. Please make sure the file exists", {type: "danger"});
													else return successSavedAudio({category, sound, source: `data:audio/mpeg;base64,${response.toString("base64")}`});
												});
											},
											children: BDFDB.LanguageUtils.LanguageStrings.SAVE
										})
									]
								})
							]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Implemented Sounds",
							collapseStates: collapseStates,
							children: Object.keys(BDFDB.ObjectUtils.filter(types, typedata => typedata.implemented)).map(type => createSoundCard(type)).flat(10).filter(n => n)
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Unimplemented Sounds",
							collapseStates: collapseStates,
							children: Object.keys(BDFDB.ObjectUtils.filter(types, typedata => !typedata.implemented)).map(type => createSoundCard(type)).flat(10).filter(n => n)
						}));
						
						let removeableCategories = [{value: removeAllKey, label: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL}].concat(Object.keys(audios).filter(category => !(defaultAudios[category] && !Object.keys(audios[category] || {}).filter(sound => defaultAudios[category][sound] === undefined).length)).map(name => ({value: name, label: name})));
						let removeableSounds = {};
						for (let category of removeableCategories) removeableSounds[category.value] = [{value: removeAllKey, label: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL}].concat(Object.keys(audios[category.value] || {}).filter(sound => !(defaultAudios[category.value] && defaultAudios[category.value][sound] !== undefined)).map(name => ({value: name, label: name})));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Remove Sounds",
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								className: BDFDB.disCN.margintop4,
								align: BDFDB.LibraryComponents.Flex.Align.END,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										grow: 0,
										shrink: 0,
										basis: "35%",
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
											title: "Category",
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
												key: "REMOVE_CATEGORY",
												value: removeAllKey,
												options: removeableCategories,
												searchable: true,
												onChange: (category, instance) => {
													let soundSelectIns = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name: ["BDFDB_Modal", "BDFDB_SettingsPanel"], up: true}), {key: "REMOVE_SOUND"});
													if (soundSelectIns && removeableSounds[category.value]) {
														soundSelectIns.props.options = removeableSounds[category.value];
														soundSelectIns.props.value = removeAllKey;
														BDFDB.ReactUtils.forceUpdate(soundSelectIns);
													}
												}
											})
										})
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										grow: 0,
										shrink: 0,
										basis: "35%",
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
											title: "Sound",
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
												key: "REMOVE_SOUND",
												value: removeAllKey,
												options: removeableSounds[removeAllKey],
												searchable: true
											})
										})
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										grow: 0,
										shrink: 1,
										basis: "25%",
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											style: {marginBottom: 1},
											color: BDFDB.LibraryComponents.Button.Colors.RED,
											onClick: (event, instance) => {
												let wrapperIns = BDFDB.ReactUtils.findOwner(instance, {name: ["BDFDB_Modal", "BDFDB_SettingsPanel"], up: true});
												let categorySelectIns = BDFDB.ReactUtils.findOwner(wrapperIns, {key: "REMOVE_CATEGORY"});
												let soundSelectIns = BDFDB.ReactUtils.findOwner(wrapperIns, {key: "REMOVE_SOUND"});
												if (categorySelectIns && soundSelectIns) {
													let soundAmount = 0;
													let catAll = categorySelectIns.props.value == removeAllKey;
													let soundAll = soundSelectIns.props.value == removeAllKey;
													if (catAll) soundAmount = BDFDB.ArrayUtils.sum(Object.keys(audios).map(category => Object.keys(audios[category] || {}).filter(sound => !(defaultAudios[category] && defaultAudios[category][sound] !== undefined)).length));
													else if (soundAll) soundAmount = Object.keys(audios[categorySelectIns.props.value] || {}).filter(sound => !(defaultAudios[categorySelectIns.props.value] && defaultAudios[categorySelectIns.props.value][sound] !== undefined)).length;
													else if (audios[categorySelectIns.props.value][soundSelectIns.props.value]) soundAmount = 1;
													
													if (soundAmount) BDFDB.ModalUtils.confirm(this, `Are you sure you want to delete ${soundAmount} added sound${soundAmount == 1 ? "" : "s"}?`, _ => {
														if (catAll) BDFDB.DataUtils.remove(this, "audios");
														else if (soundAll) BDFDB.DataUtils.remove(this, "audios", categorySelectIns.props.value);
														else {
															delete audios[categorySelectIns.props.value][soundSelectIns.props.value];
															if (BDFDB.ObjectUtils.isEmpty(audios[categorySelectIns.props.value])) delete audios[categorySelectIns.props.value];
															BDFDB.DataUtils.save(audios, this, "audios");
														}
														this.loadAudios();
														this.loadChoices();
														BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
													});
													else BDFDB.NotificationUtils.toast("No sounds to delete", {type: "danger"});
												}
											},
											children: BDFDB.LanguageUtils.LanguageStrings.DELETE
										})
									})
								]
							})
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					for (let type in createdAudios) if (createdAudios[type]) createdAudios[type].stop();
					createdAudios = {};
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				repatchIncoming = true;
				createdAudios["call_calling"] = BDFDB.LibraryModules.SoundUtils.createSound("call_calling");
				volumes = BDFDB.DataUtils.get(this, "volumes");
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
		
			processShakeable (e) {
				if (e.returnvalue && BDFDB.ArrayUtils.is(e.returnvalue.props.children)) {
					let child = e.returnvalue.props.children.find(n => {
						let string = n && n.type && n.type.toString();
						return string && string.indexOf("call_ringing_beat") > -1 && string.indexOf("call_ringing") > -1 && string.indexOf("hasIncomingCalls") > -1;
					});
					if (child) {
						let index = e.returnvalue.props.children.indexOf(child);
						if (repatchIncoming) {
							e.returnvalue.props.children[index] = null;
							BDFDB.TimeUtils.timeout(_ => {
								repatchIncoming = false;
								BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name: "App", up: true}))
							});
						}
						else e.returnvalue.props.children[index] = BDFDB.ReactUtils.createElement(e.returnvalue.props.children[index].type, {});
					}
				}
			}
			
			loadAudios () {
				audios = Object.assign({}, BDFDB.DataUtils.load(this, "audios"), defaultAudios);
				BDFDB.DataUtils.save(BDFDB.ObjectUtils.exclude(audios, Object.keys(defaultAudios)), this, "audios");
			}

			loadChoices () {
				let loadedChoices = BDFDB.DataUtils.load(this, "choices");
				for (let type in types) {
					let choice = loadedChoices[type] || {}, soundFound = false;
					for (let category in audios) if (choice.category == category) for (let sound in audios[category]) if (choice.sound == sound) {
						soundFound = true;
						break;
					}
					if (!soundFound) choice = {
						category: "---",
						sound: "---",
						volume: 100,
						mute: types[type].mute,
						focus: types[type].focus
					};
					choices[type] = choice;
					this.saveChoice(type, false);
				}
			}

			saveChoice (type, play) {
				if (!choices[type]) return;
				BDFDB.DataUtils.save(choices[type], this, "choices", type);
				if (play) {
					this.SettingsUpdated = true;
					this.playAudio(type);
				}
			}

			playAudio (type) {
				if (this.dontPlayAudio(type) || BDFDB.LibraryModules.StreamerModeStore.disableSounds) return;
				if (createdAudios[type]) createdAudios[type].stop();
				createdAudios[type] = new WebAudioSound(type);
				createdAudios[type].play();
			}

			isSuppressMentionEnabled (guildId, channelId) {
				let channelSettings = BDFDB.LibraryModules.MutedUtils.getChannelMessageNotifications(guildId, channelId);
				return channelSettings && (channelSettings == BDFDB.DiscordConstants.UserNotificationSettings.NO_MESSAGES || channelSettings == BDFDB.DiscordConstants.UserNotificationSettings.NULL && BDFDB.LibraryModules.MutedUtils.getMessageNotifications(guildId) == BDFDB.DiscordConstants.UserNotificationSettings.NO_MESSAGES);
			}

			dontPlayAudio (type) {
				let status = BDFDB.UserUtils.getStatus();
				return choices[type].mute && (status == "dnd" || status == "streaming");
			}

			fireEvent (type) {
				firedEvents[type] = true;
				BDFDB.TimeUtils.timeout(_ => {firedEvents[type] = false;},3000);
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
