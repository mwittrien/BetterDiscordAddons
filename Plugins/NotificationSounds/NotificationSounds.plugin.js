/**
 * @name NotificationSounds
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 3.6.2
 * @description Allows you to replace the native Sounds with custom Sounds
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/NotificationSounds/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/NotificationSounds/NotificationSounds.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "NotificationSounds",
			"author": "DevilBro",
			"version": "3.6.2",
			"description": "Allows you to replace the native Sounds with custom Sounds"
		},
		"changeLog": {
			"improved": {
				"Sounds": "Sounds are no longer hard coded and rather fetched from Discords code, meaning if they add a new sound the plugin should automatically include it in its settings",
				"Default Sound Choices": "Added the Sounds from Discords Sound Packs (Chaos, Uncle, Yachty) as possible Choices"
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
		var audios, choices, firedEvents;
		var volumes = {};
		
		const removeAllKey = "REMOVE_ALL_BDFDB_DEVILBRO_DO_NOT_COPY";
		const defaultDevice = "default";
		
		var currentDevice = defaultDevice, createdAudios = {}, repatchIncoming;
		
		let types = {};
		
		const message1Types = {
			dm:			{src: "./message3.mp3", name: "Message (Direct Message)"},
			mentioned:	{src: "./message2.mp3", name: "Message Mentioned"},
			reply:		{src: "./message2.mp3", name: "Message Mentioned (reply)"},
			role:		{src: "./mention1.mp3", name: "Message Mentioned (role)"},
			everyone:	{src: "./mention2.mp3", name: "Message Mentioned (@everyone)"},
			here:		{src: "./mention3.mp3", name: "Message Mentioned (@here)"}
		};
		
		const defaultAudios = {
			"---": {
				"---": null
			},
			"Discord": {}
		};
		
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
			onLoad () {
				audios = {};
				choices = {};
				firedEvents = {};
				
				this.defaults = {
					volumes: {
						globalVolume:				{value: 100,				description: "Global Notification Sounds Volume"}
					}
				};
				
				this.patchPriority = 9;
				
				const soundKeys = BDFDB.LibraryModules.SoundParser.keys();
				for (let key of soundKeys) {	
					const id = key.replace("./", "").replace(".mp3", "");
					const name = id == "reconnect" ? "Invited To Speak" : id.replace("ddr-", "HotKeys_").replace("ptt_", "Push2Talk_").split("_").map(BDFDB.LibraryModules.StringUtils.upperCaseFirstChar).join(" ").replace(/1$/g, "");
					const src = BDFDB.LibraryModules.SoundParser(key);	
					
					let soundPackName = id.split("_")[0];
					if (soundPackName != id && soundKeys.filter(n => n.indexOf(`./${soundPackName}`) > -1).length > 10) {
						soundPackName = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(soundPackName);
						if (!defaultAudios[soundPackName]) defaultAudios[soundPackName] = {};
						defaultAudios[soundPackName][name.replace(new RegExp(`${soundPackName} `, "i"), "").replace(/bootup/i, "Discodo")] = src;
					}
					else {
						defaultAudios.Discord[name] = src;
						if (this.isSoundUsedAnywhere(id)) types[id] = {
							name: name,
							src: src,
							mute: id.startsWith("call_") ? null : false,
							focus: null
						};
						if (id == "message1") {
							types[id].mute = true;
							for (let subType in message1Types) types[subType] = {
								name: message1Types[subType].name,
								src: BDFDB.LibraryModules.SoundParser(message1Types[subType].src),
								mute: true,
								focus: true
							}
						}
					}
					types = BDFDB.ObjectUtils.sort(types, "name");
				}
				for (let pack in defaultAudios) defaultAudios[pack] = BDFDB.ObjectUtils.sort(defaultAudios[pack]);
			}
			
			onStart () {
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
						if (!BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildId, message.channel_id) && message.author.id != BDFDB.UserUtils.me.id && !BDFDB.LibraryModules.RelationshipStore.isBlocked(message.author.id)) {
							if (!guildId && !(choices.dm.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) {
								this.fireEvent("dm");
								this.playAudio("dm");
								return;
							}
							else if (BDFDB.LibraryModules.MentionUtils.isRawMessageMentioned(message, BDFDB.UserUtils.me.id)) {
								if (message.mentions.length && !this.isSuppressMentionEnabled(guildId, message.channel_id) && !(choices.mentioned.focus && document.hasFocus() && BDFDB.LibraryModules.LastChannelStore.getChannelId() == message.channel_id)) for (let mention of message.mentions) if (mention.id == BDFDB.UserUtils.me.id) {
									this.fireEvent(message.message_reference ? "reply" : "mentioned");
									this.playAudio(message.message_reference ? "reply" : "mentioned");
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
								let called = false;
								for (let subType in message1Types) if (firedEvents[subType]) {
									delete firedEvents[subType];
									called = true;
									break;
								}
								if (!called) this.playAudio(type);
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
					else BDFDB.LogUtils.warn(`Could not create Sound for "${e.methodArguments[0]}".`, this);
				}});

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
			
			onStop () {
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
									label: "Mute when Channel focused",
									value: choices[type].focus,
									onChange: value => {
										choices[type].focus = value;
										this.saveChoice(type, false);
									}
								}) : null,
								types[type].mute !== null && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									mini: true,
									grow: 0,
									label: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											"Mute in",
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Status, {
												style: {marginLeft: 6},
												size: 12,
												status: BDFDB.DiscordConstants.StatusTypes.DND
											})
										]
									}),
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
											onChange: value => {
												const categorySounds = audios[value] || {};
												choices[type].category = value;
												choices[type].sound = categorySounds[types[type].name] ? types[type].name : Object.keys(categorySounds)[0];
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
											onChange: value => {
												choices[type].sound = value;
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
							title: "Sound Configuration",
							collapseStates: collapseStates,
							children: Object.keys(types).map(createSoundCard).flat(10).filter(n => n)
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
													
													if (soundAmount) BDFDB.ModalUtils.confirm(this, `Are you sure you want to delete ${soundAmount} added Sound${soundAmount == 1 ? "" : "s"}?`, _ => {
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
													else BDFDB.NotificationUtils.toast("No Sounds to delete", {type: "danger"});
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
				BDFDB.DiscordUtils.rerenderAll();
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
				BDFDB.TimeUtils.timeout(_ => delete firedEvents[type], 3000);
			}
			
			isSoundUsedAnywhere (type) {
				return type != "human_man" && type != "robot_man" && type != "discodo" && type != "overlayunlock" && type != "call_ringing_beat" && !(type != "message1" && /\d$/.test(type));
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
