//META{"name":"NotificationSounds","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/NotificationSounds","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/NotificationSounds/NotificationSounds.plugin.js"}*//

var NotificationSounds = (_ => {
	var audios, choices, firedEvents, repatchIncoming, callAudio;
			
	const settingsAudio = new Audio();
	
	/* NEVER CHANGE THE SRC LINKS IN THE PLUGIN FILE, TO ADD NEW SONGS ADD THEM IN THE SETTINGS GUI IN THE PLUGINS PAGE */
	const types = {
		"message1":				{implemented:true,	name:"New Chatmessage",			src:"/assets/dd920c06a01e5bb8b09678581e29d56f.mp3",	mute:true,	focus:null,	include:true},
		"dm":					{implemented:true,	name:"Direct Message",			src:"/assets/84c9fa3d07da865278bd77c97d952db4.mp3",	mute:true,	focus:true,	include:false},
		"mentioned":			{implemented:true,	name:"Mentioned",				src:"/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute:true,	focus:true,	include:false},
		"role":					{implemented:true,	name:"Mentioned (role)",		src:"/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute:true,	focus:true,	include:false},
		"everyone":				{implemented:true,	name:"Mentioned (@everyone)",	src:"/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute:true,	focus:true,	include:false},
		"here":					{implemented:true,	name:"Mentioned (@here)",		src:"/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute:true,	focus:true,	include:false},
		"deafen":				{implemented:true,	name:"Voicechat Deafen",		src:"/assets/e4d539271704b87764dc465b1a061abd.mp3",	mute:false,	focus:null,	include:true},
		"mute":					{implemented:true,	name:"Voicechat Mute",			src:"/assets/429d09ee3b86e81a75b5e06d3fb482be.mp3",	mute:false,	focus:null,	include:true},
		"disconnect":			{implemented:true,	name:"Voicechat Disconnect",	src:"/assets/7e125dc075ec6e5ae796e4c3ab83abb3.mp3",	mute:false,	focus:null,	include:true},
		"undeafen":				{implemented:true,	name:"Voicechat Undeafen",		src:"/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3",	mute:false,	focus:null,	include:true},
		"unmute":				{implemented:true,	name:"Voicechat Unmute",		src:"/assets/43805b9dd757ac4f6b9b58c1a8ee5f0d.mp3",	mute:false,	focus:null,	include:true},
		"user_join":			{implemented:true,	name:"Voicechat User Joined",	src:"/assets/5dd43c946894005258d85770f0d10cff.mp3",	mute:false,	focus:null,	include:true},
		"user_leave":			{implemented:true,	name:"Voicechat User Left",		src:"/assets/4fcfeb2cba26459c4750e60f626cebdc.mp3",	mute:false,	focus:null,	include:true},
		"user_moved":			{implemented:true,	name:"Voicechat User Moved",	src:"/assets/e81d11590762728c1b811eadfa5be766.mp3",	mute:false,	focus:null,	include:true},
		"reconnect":			{implemented:false,	name:"Voicechat Reconnect",		src:"/assets/471cfd0005b112ff857705e894bf41a6.mp3",	mute:true,	focus:null,	include:true},
		"ptt_start":			{implemented:true,	name:"Push2Talk Start",			src:"/assets/8b63833c8d252fedba6b9c4f2517c705.mp3",	mute:false,	focus:null,	include:true},
		"ptt_stop":				{implemented:true,	name:"Push2Talk Stop",			src:"/assets/74ab980d6890a0fa6aa0336182f9f620.mp3",	mute:false,	focus:null,	include:true},
		"call_calling":			{implemented:true,	name:"Outgoing Call",			src:"/assets/c6e92752668dde4eee5923d70441579f.mp3",	mute:false,	focus:null,	include:true},
		"call_ringing":			{implemented:true,	name:"Incoming Call",			src:"/assets/84a1b4e11d634dbfa1e5dd97a96de3ad.mp3",	mute:true,	focus:null,	include:true},
		"call_ringing_beat":	{implemented:false,	name:"Incoming Call Beat",		src:"/assets/b9411af07f154a6fef543e7e442e4da9.mp3",	mute:true,	focus:null,	include:true},
		"stream_started":		{implemented:true,	name:"Stream Started",			src:"/assets/9ca817f41727edc1b2f1bc4f1911107c.mp3",	mute:false,	focus:null,	include:true},
		"stream_ended":			{implemented:true,	name:"Stream Ended",			src:"/assets/4e30f98aa537854f79f49a76af822bbc.mp3",	mute:false,	focus:null,	include:true},
		"stream_user_joined":	{implemented:true,	name:"Stream User Joined",		src:"/assets/5827bbf9a67c61cbb0e02ffbf434b654.mp3",	mute:false,	focus:null,	include:true},
		"stream_user_left":		{implemented:true,	name:"Stream User Left",		src:"/assets/7cdcdcbc426cc43583365a671c24b740.mp3",	mute:false,	focus:null,	include:true},
		"ddr-down":				{implemented:true,	name:"HotKeys Window Down",		src:"/assets/71f048f8aa7d4b24bf4268a87cbbb192.mp3",	mute:false,	focus:null,	include:true},
		"ddr-left":				{implemented:true,	name:"HotKeys Window Left",		src:"/assets/1de04408e62b5d52ae3ebbb91e9e1978.mp3",	mute:false,	focus:null,	include:true},
		"ddr-right":			{implemented:true,	name:"HotKeys Window Right",	src:"/assets/2c0433f93db8449e4a82b76dc520cb29.mp3",	mute:false,	focus:null,	include:true},
		"ddr-up":				{implemented:true,	name:"HotKeys Window Up",		src:"/assets/68472713f7a62c7c37e0a6a5d5a1faeb.mp3",	mute:false,	focus:null,	include:true},
		"mention1":				{implemented:false,	name:"Mention Ping",			src:"/assets/fa4d62c3cbc80733bf1f01b9c6f181de.mp3",	mute:true,	focus:null,	include:true},
		"mention2":				{implemented:false,	name:"Mention Ping 2",			src:"/assets/a5f42064e8120e381528b14fd3188b72.mp3",	mute:true,	focus:null,	include:true},
		"mention3":				{implemented:false,	name:"Mention Ping 3",			src:"/assets/84c9fa3d07da865278bd77c97d952db4.mp3",	mute:true,	focus:null,	include:true},
		"message2":				{implemented:false,	name:"New Chatmessage 2",		src:"/assets/15fe810f6cfab609c7fcda61652b9b34.mp3",	mute:true,	focus:null,	include:true},
		"message3":				{implemented:false,	name:"New Chatmessage 3",		src:"/assets/53ce6a92d3c233e8b4ac529d34d374e4.mp3",	mute:true,	focus:null,	include:true},
		"human_man":			{implemented:false,	name:"Human Man Voice",			src:"/assets/a37dcd6272ae41cf49295d58c9806fe3.mp3",	mute:true,	focus:null,	include:true},
		"robot_man":			{implemented:false,	name:"Robot Man Voice",			src:"/assets/66598bea6e59eb8acdf32cf2d9d75ba9.mp3",	mute:true,	focus:null,	include:true},
		"discodo":				{implemented:false,	name:"Unknown",					src:"/assets/ae7d16bb2eea76b9b9977db0fad66658.mp3",	mute:true,	focus:null,	include:true},
		"overlayunlock":		{implemented:false,	name:"Overlay Unlocked",		src:"/assets/ad322ffe0a88436296158a80d5d11baa.mp3",	mute:true,	focus:null,	include:true}
	};
			
	return class NotificationSounds {
		getName () {return "NotificationSounds";}

		getVersion () {return "3.4.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to replace the native sounds of Discord with your own";}

		constructor () {
			this.changelog = {
				"fixed":[["Call Sound","Outgoing and Incomming call sounds work again"]]
			};

			this.patchedModules = {
				after: {
					Shakeable: "render"
				}
			};
		}

		initConstructor () {
			audios = {};
			choices = {};
			firedEvents = {};

			/* NEVER CHANGE THE SRC LINKS IN THE PLUGIN FILE, TO ADD NEW SONGS ADD THEM IN THE SETTINGS GUI IN THE PLUGINS PAGE */
			this.defaults = {
				"---": {
					"---":						null
				},
				"Default": {
					"Communication Channel": 	"https://notificationsounds.com/soundfiles/63538fe6ef330c13a05a3ed7e599d5f7/file-sounds-917-communication-channel.wav",
					"Isn't it": 				"https://notificationsounds.com/soundfiles/ba2fd310dcaa8781a9a652a31baf3c68/file-sounds-969-isnt-it.wav",
					"Job Done": 				"https://notificationsounds.com/soundfiles/5b69b9cb83065d403869739ae7f0995e/file-sounds-937-job-done.wav",
					"Served": 					"https://notificationsounds.com/soundfiles/b337e84de8752b27eda3a12363109e80/file-sounds-913-served.wav",
					"Solemn": 					"https://notificationsounds.com/soundfiles/53fde96fcc4b4ce72d7739202324cd49/file-sounds-882-solemn.wav",
					"System Fault": 			"https://notificationsounds.com/soundfiles/ebd9629fc3ae5e9f6611e2ee05a31cef/file-sounds-990-system-fault.wav",
					"You wouldn't believe": 	"https://notificationsounds.com/soundfiles/087408522c31eeb1f982bc0eaf81d35f/file-sounds-949-you-wouldnt-believe.wav"
				},
				"Discord": {}
			};
			
			for (let id in types) if (types[id].include) this.defaults.Discord[types[id].name] = types[id].src;
			this.defaults.Discord = BDFDB.ObjectUtils.sort(this.defaults.Discord);
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsPanel = {node: null}, settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Add new Song",
				collapseStates: collapseStates,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						className: BDFDB.disCN.margintop4,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: "Categoryname",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										className: "input-newsong input-category",
										value: "",
										placeholder: "Categoryname"
									})
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: "Songname",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										className: "input-newsong input-song",
										value: "",
										placeholder: "Songname"
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
										className: "input-newsong input-source",
										type: "file",
										filter: ["audio", "video"],
										useFilepath: true,
										value: "",
										placeholder: "Source"
									})
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
								style: {marginBottom: 1},
								onClick: _ => {
									for (let input of settingsPanel.node.querySelectorAll(".input-newsong " + BDFDB.dotCN.input)) if (!input.value || input.value.length == 0 || input.value.trim().length == 0) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new song.", {type:"danger"});
									let category = settingsPanel.node.querySelector(".input-category " + BDFDB.dotCN.input).value.trim();
									let song = settingsPanel.node.querySelector(".input-song " + BDFDB.dotCN.input).value.trim();
									let source = settingsPanel.node.querySelector(".input-source " + BDFDB.dotCN.input).value.trim();
									if (source.indexOf("http") == 0) BDFDB.LibraryRequires.request(source, (error, response, result) => {
										if (response) {
											let type = response.headers["content-type"];
											if (type && (type.indexOf("octet-stream") > -1 || type.indexOf("audio") > -1 || type.indexOf("video") > -1)) return this.successSavedAudio(settingsPanel.node, collapseStates, {category, song, source});
										}
										BDFDB.NotificationUtils.toast("Use a valid direct link to a video or audio source. They usually end on something like .mp3, .mp4 or .wav.", {type:"danger"});
									});
									else BDFDB.LibraryRequires.fs.readFile(source, (error, response) => {
										if (error) BDFDB.NotificationUtils.toast("Could not fetch file. Please make sure the file exists.", {type:"danger"});
										else return this.successSavedAudio(settingsPanel.node, collapseStates, {category, song, source:`data:audio/mpeg;base64,${response.toString("base64")}`});
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
				dividertop: true,
				children: Object.keys(BDFDB.ObjectUtils.filter(types, typedata => typedata.implemented)).map(type => this.createSoundCard(type, settingsPanel, collapseStates)).flat(10).filter(n => n)
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Unimplemented Sounds",
				collapseStates: collapseStates,
				dividertop: true,
				children: Object.keys(BDFDB.ObjectUtils.filter(types, typedata => !typedata.implemented)).map(type => this.createSoundCard(type, settingsPanel, collapseStates)).flat(10).filter(n => n)
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Remove Songs",
				collapseStates: collapseStates,
				dividertop: true,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					className: BDFDB.disCN.marginbottom8,
					color: BDFDB.LibraryComponents.Button.Colors.RED,
					label: "Delete all added songs",
					onClick: _ => {
						BDFDB.ModalUtils.confirm(this, "Are you sure you want to delete all added songs?", _ => {
							BDFDB.DataUtils.remove(this, "choices");
							BDFDB.DataUtils.remove(this, "audios");
							this.loadAudios();
							this.loadChoices();
							BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel.node, collapseStates);
						});
					},
					children: BDFDB.LanguageUtils.LanguageStrings.DELETE
				})
			}));
			
			return settingsPanel.node = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}
		
		createSoundCard (type, settingsPanel, collapseStates) {
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
									options: Object.keys(audios).map(name => {return {value:name, label:name}}),
									searchable: true,
									onChange: category => {
										choices[type].category = category.value;
										choices[type].song = Object.keys(audios[category.value] || {})[0];
										choices[type].src = audios[choices[type].category][choices[type].song] || types[type].src;
										this.saveChoice(type, true);
										BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel.node, collapseStates);
									}
								})
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							grow: 0,
							shrink: 0,
							basis: "31%",
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: "Song",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
									value: choices[type].song,
									options: Object.keys(audios[choices[type].category] || {}).map(name => {return {value:name, label:name}}),
									searchable: true,
									onChange: song => {
										choices[type].song = song.value;
										choices[type].src = audios[choices[type].category][choices[type].song] || types[type].src;
										this.saveChoice(type, true);
										BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel.node, collapseStates);
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
		}

		// Legacy
		load () {}

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
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dirtyDispatch", {before: e => {
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
								if (message.mentions.length && !(choices.mentioned.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) for (let mention of message.mentions) if (mention.id == BDFDB.UserUtils.me.id) {
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

				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.SoundUtils, "playSound", {instead: e => {
					let type = e.methodArguments[0];
					if (choices[type]) BDFDB.TimeUtils.timeout(_ => {
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
					else e.callOriginalMethod();
				}});
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.SoundUtils, "createSound", {after: e => {
					let type = e.methodArguments[0];
					let audio = new Audio();
					audio.src = choices[type].src;
					audio.volume = choices[type].volume/100;
					e.returnValue.play = _ => {
						if (!audio.paused || this.dontPlayAudio(type)) return;
						audio.loop = false;
						audio.play();
					};
					e.returnValue.loop = _ => {
						if (!audio.paused || this.dontPlayAudio(type)) return;
						audio.loop = true;
						audio.play();
					};
					e.returnValue.stop = _ => {audio.pause();}
				}});

				this.loadAudios();
				this.loadChoices();
				
				let callListenerModule = BDFDB.ModuleUtils.findByProperties("handleRingUpdate");
				if (callListenerModule) {
					callListenerModule.terminate();
					BDFDB.ModuleUtils.patch(this, callListenerModule, "handleRingUpdate", {instead: e => {
						BDFDB.LibraryModules.CallUtils.getCalls().filter(call => call.ringing.length > 0 && BDFDB.LibraryModules.VoiceUtils.getCurrentClientVoiceChannelId() === call.channelId).length > 0 && !BDFDB.LibraryModules.SoundStateUtils.isSoundDisabled("call_calling") && !BDFDB.LibraryModules.StreamerModeStore.disableSounds ? callAudio.loop() : callAudio.stop();
					}});
					callListenerModule.initialize();
				}
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.PluginUtils.clear(this);
				settingsAudio.pause();
			}
		}


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				settingsAudio.pause();
				
				this.forceUpdateAll();
			}
		}

		processShakeable (e) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "IncomingCalls"});
			if (index > -1) {
				if (repatchIncoming) {
					children[index] = null;
					BDFDB.TimeUtils.timeout(_ => {
						repatchIncoming = false;
						BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"App", up:true}))
					});
				}
				else children[index] = BDFDB.ReactUtils.createElement(children[index].type, {});
			}
		}

		successSavedAudio (settingsPanel, collapseStates, data) {
			BDFDB.NotificationUtils.toast(`Song ${data.song} was added to category ${data.category}.`, {type:"success"});
			if (!audios[data.category]) audios[data.category] = {};
			audios[data.category][data.song] = data.source;
			BDFDB.DataUtils.save(audios, this, "audios");
			BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
			
		}
		
		forceUpdateAll () {
				repatchIncoming = true;
				callAudio = BDFDB.LibraryModules.SoundUtils.createSound("call_calling");
				
				BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		
		loadAudios () {
			audios = Object.assign({}, this.defaults, BDFDB.DataUtils.load(this, "audios"));
			BDFDB.DataUtils.save(audios, this, "audios");
		}

		loadChoices () {
			for (let type in types) {
				let choice = BDFDB.DataUtils.load(this, "choices", type) || {}, songFound = false;
				for (let category in audios) if (choice.category == category) for (var song in audios[category]) if (choice.song == song) {
					songFound = true;
					break;
				}
				if (!songFound) choice = {
					category: "---",
					song: "---",
					volume: 100,
					src: types[type].src,
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
				this.playAudio(type, settingsAudio);
			}
		}

		playAudio (type, audio) {
			if (!audio) {
				if (this.dontPlayAudio(type)) return;
				audio = new Audio();
			}
			else audio.pause();
			audio.src = choices[type].src;
			audio.volume = choices[type].volume/100;
			audio.play();
		}

		dontPlayAudio (type) {
			let status = BDFDB.UserUtils.getStatus();
			return choices[type].mute && (status == "dnd" || status == "streaming");
		}

		fireEvent (type) {
			firedEvents[type] = true;
			BDFDB.TimeUtils.timeout(_ => {firedEvents[type] = false;},3000);
		}
	}
})();