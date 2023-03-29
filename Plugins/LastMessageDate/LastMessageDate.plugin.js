/**
 * @name LastMessageDate
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.6
 * @description Displays the Last Message Date of a Member for the current Server/DM in the UserPopout and UserModal
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/LastMessageDate/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/LastMessageDate/LastMessageDate.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
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
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		var loadedUsers, requestedUsers, queuedInstances;
		var currentPopout, currentProfile;
		
		const LastMessageDateComponents = class LastMessageDate extends BdApi.React.Component {
			render() {
				if (!loadedUsers[this.props.guildId]) loadedUsers[this.props.guildId] = {};
				if (!requestedUsers[this.props.guildId]) requestedUsers[this.props.guildId] = {};
				if (!queuedInstances[this.props.guildId]) queuedInstances[this.props.guildId] = {};
				if (loadedUsers[this.props.guildId][this.props.user.id] === undefined && !requestedUsers[this.props.guildId][this.props.user.id]) {
					requestedUsers[this.props.guildId][this.props.user.id] = true;
					queuedInstances[this.props.guildId][this.props.user.id] = [].concat(queuedInstances[this.props.guildId][this.props.user.id]).filter(n => n);
					BDFDB.LibraryModules.APIUtils.get({
						url: this.props.isGuild ? BDFDB.DiscordConstants.Endpoints.SEARCH_GUILD(this.props.guildId) : BDFDB.DiscordConstants.Endpoints.SEARCH_CHANNEL(this.props.channelId),
						query: BDFDB.LibraryModules.APIEncodeUtils.stringify({
							author_id: this.props.user.id,
							include_nsfw: true
						})
					}).then(result => {
						delete requestedUsers[this.props.guildId][this.props.user.id];
						if (typeof result.body.retry_after != "number") {
							if (result.body.messages && Array.isArray(result.body.messages[0])) {
								for (let message of result.body.messages[0]) if (message.hit && message.author.id == this.props.user.id) loadedUsers[this.props.guildId][this.props.user.id] = message;
							}
							else loadedUsers[this.props.guildId][this.props.user.id] = null;
							BDFDB.ReactUtils.forceUpdate(queuedInstances[this.props.guildId][this.props.user.id]);
							delete queuedInstances[this.props.guildId][this.props.user.id];
						}
						else BDFDB.TimeUtils.timeout(_ => BDFDB.ReactUtils.forceUpdate(this), result.body.retry_after + 500);
					});
				}
				if (loadedUsers[this.props.guildId][this.props.user.id] === undefined) {
					if (queuedInstances[this.props.guildId][this.props.user.id].indexOf(this) == -1) queuedInstances[this.props.guildId][this.props.user.id].push(this);
					return null;
				}
				let channel = loadedUsers[this.props.guildId][this.props.user.id] && BDFDB.LibraryStores.ChannelStore.getChannel(loadedUsers[this.props.guildId][this.props.user.id].channel_id);
				let icon = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
					className: BDFDB.disCN._lastmessagedateicon,
					nativeClass: false,
					name: BDFDB.LibraryComponents.SvgIcon.Names.NUMPAD
				});
				return BDFDB.ReactUtils.createElement(this.props.isInPopout ? BDFDB.LibraryComponents.UserPopoutSection : BDFDB.ReactUtils.Fragment, {
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Heading, {
							className: !this.props.isInPopout ? BDFDB.disCN.userprofileinfosectionheader : BDFDB.disCN.userpopoutsectiontitle,
							variant: "eyebrow",
							children: _this.labels.last_message
						}),
						BDFDB.ReactUtils.createElement(loadedUsers[this.props.guildId][this.props.user.id] ? BDFDB.LibraryComponents.Clickable : "div", {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.membersince, !this.props.isInPopout && BDFDB.disCN.userprofileinfotext),
							onClick: _ => loadedUsers[this.props.guildId][this.props.user.id] && BDFDB.LibraryModules.HistoryUtils.transitionTo(BDFDB.DiscordConstants.Routes.CHANNEL(channel.guild_id, channel.id, loadedUsers[this.props.guildId][this.props.user.id].id)),
							children: [
								!channel ? icon : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: channel.guild_id ? "#" + channel.name : BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES,
									children: icon
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Text, {
									className: this.props.isInPopout && BDFDB.disCN.userpopoutsectionbody,
									variant: "text-sm/normal",
									children: loadedUsers[this.props.guildId][this.props.user.id] ? BDFDB.LibraryComponents.DateInput.format(_this.settings.dates.lastMessageDate, new Date(loadedUsers[this.props.guildId][this.props.user.id].timestamp)) : "---"
								})
							]
						})
					]
				});
			}
		};
		
		return class LastMessageDate extends Plugin {
			onLoad () {
				_this = this;
				loadedUsers = {};
				requestedUsers = {};
				queuedInstances = {};

				this.defaults = {
					places: {
						userPopout:				{value: true, 			description: "User Popouts"},
						userProfile:			{value: true, 			description: "User Profile Modal"}
					},
					dates: {
						lastMessageDate:		{value: {}, 			description: "Last Message Date"},
					}
				};
			
				this.modulePatches = {
					before: [
						"UserPopout",
						"UserProfile"
					],
					after: [
						"UserMemberSinceSection",
						"UserProfileBody"
					]
				};
				
				this.css = `
					${BDFDB.dotCN._lastmessagedateicon} {
						width: 16px;
						height: 16px;
						color: var(--interactive-normal);
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dispatch", {after: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == "MESSAGE_CREATE" && e.methodArguments[0].message) {
						let message = e.methodArguments[0].message;
						let guildId = message.guild_id || message.channel_id;
						if (guildId && loadedUsers[guildId] && loadedUsers[guildId][message.author.id]) loadedUsers[guildId][message.author.id] = message;
					}
					else if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == "MESSAGE_DELETE" && e.methodArguments[0].id) {
						let guildId = e.methodArguments[0].guildId || e.methodArguments[0].channelId;
						if (guildId && loadedUsers[guildId]) {
							let message = (Object.entries(loadedUsers[guildId]).find(n => n[1] && n[1].id == e.methodArguments[0].id) || [])[1];
							if (message && loadedUsers[guildId][message.author.id]) delete loadedUsers[guildId][message.author.id];
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

			processUserPopout (e) {
				currentPopout = e.instance;
			}

			processUserMemberSinceSection (e) {
				if (!currentPopout) return;
				let user = e.instance.props.user || BDFDB.LibraryStores.UserStore.getUser(e.instance.props.userId);
				if (!user || user.isNonUserBot()) return;
				e.returnvalue = [
					BDFDB.ReactUtils.createElement(LastMessageDateComponents, {
						isInPopout: true,
						guildId: currentPopout.props.guildId || BDFDB.DiscordConstants.ME,
						channelId: currentPopout.props.channelId,
						isGuild: !!currentPopout.props.guildId,
						user: user
					}, true),
					e.returnvalue
				];
			}

			processUserProfile (e) {
				currentProfile = e.instance;
			}

			processUserProfileBody (e) {
				if (!currentProfile) return;
				let user = e.instance.props.user || BDFDB.LibraryStores.UserStore.getUser(e.instance.props.userId);
				if (!user || user.isNonUserBot()) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "UserMemberSince"});
				if (index > -1) children.splice(index, 0, BDFDB.ReactUtils.createElement(LastMessageDateComponents, {
					isInPopout: false,
					guildId: currentPopout.props.guildId || BDFDB.DiscordConstants.ME,
					channelId: currentPopout.props.channelId,
					isGuild: !!currentPopout.props.guildId,
					user: user
				}, true));
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							last_message:						"Последно изпратено съобщение"
						};
					case "cs":		// Czech
						return {
							last_message:						"Poslední odeslaná zpráva"
						};
					case "da":		// Danish
						return {
							last_message:						"Senest sendt besked"
						};
					case "de":		// German
						return {
							last_message:						"Letzte gesendete Nachricht"
						};
					case "el":		// Greek
						return {
							last_message:						"Τελευταίο μήνυμα που εστάλη"
						};
					case "es":		// Spanish
						return {
							last_message:						"Último mensaje enviado"
						};
					case "fi":		// Finnish
						return {
							last_message:						"Viimeksi lähetetty viesti"
						};
					case "fr":		// French
						return {
							last_message:						"Dernier message envoyé"
						};
					case "hi":		// Hindi
						return {
							last_message:						"अंतिम भेजा गया संदेश"
						};
					case "hr":		// Croatian
						return {
							last_message:						"Zadnja poslana poruka"
						};
					case "hu":		// Hungarian
						return {
							last_message:						"Utoljára elküldött üzenet"
						};
					case "it":		// Italian
						return {
							last_message:						"Ultimo messaggio inviato"
						};
					case "ja":		// Japanese
						return {
							last_message:						"最後に送信されたメッセージ"
						};
					case "ko":		// Korean
						return {
							last_message:						"마지막으로 보낸 메시지"
						};
					case "lt":		// Lithuanian
						return {
							last_message:						"Paskutinė išsiųsta žinutė"
						};
					case "nl":		// Dutch
						return {
							last_message:						"Laatst verzonden bericht"
						};
					case "no":		// Norwegian
						return {
							last_message:						"Sist sendt melding"
						};
					case "pl":		// Polish
						return {
							last_message:						"Ostatnio wysłana wiadomość"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							last_message:						"Última mensagem enviada"
						};
					case "ro":		// Romanian
						return {
							last_message:						"Ultimul mesaj trimis"
						};
					case "ru":		// Russian
						return {
							last_message:						"Последнее отправленное сообщение"
						};
					case "sv":		// Swedish
						return {
							last_message:						"Senast skickat meddelande"
						};
					case "th":		// Thai
						return {
							last_message:						"ข้อความที่ส่งล่าสุด"
						};
					case "tr":		// Turkish
						return {
							last_message:						"Son Gönderilen Mesaj"
						};
					case "uk":		// Ukrainian
						return {
							last_message:						"Останнє надіслане повідомлення"
						};
					case "vi":		// Vietnamese
						return {
							last_message:						"Tin nhắn được gửi lần cuối"
						};
					case "zh-CN":	// Chinese (China)
						return {
							last_message:						"最后发送的消息"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							last_message:						"最後發送的消息"
						};
					default:		// English
						return {
							last_message:						"Last sent Message"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
