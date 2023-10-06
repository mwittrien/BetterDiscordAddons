/**
 * @name SplitLargeMessages
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.8.1
 * @description Allows you to enter larger Messages, which will automatically split into several smaller Messages
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SplitLargeMessages/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/SplitLargeMessages/SplitLargeMessages.plugin.js
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
		const messageDelay = 2000; //changing at own risk, might result in bans or mutes
		let maxMessageLength = 2000;
	
		return class SplitLargeMessages extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						byNewlines:		{value: false, 	description: "Try to split Messages on Newlines instead of Spaces",		note: "This will stop Sentences from being cut, but might result in more Messages being sent"},
					},
					amounts: {
						splitCounter:	{value: 0, 		description: "Messages will be split after roughly X Characters"},
						maxPages:		{value:	0,		description: "Maximum number of split pages",							note: "(0 for unlimited) Pages beyond this count will be discarded"}
					}
				};
				
				this.modulePatches = {
					before: [
						"ChannelTextAreaContainer",
						"ChannelTextAreaEditor"
					],
					after: [
						"ChannelTextAreaContainer"
					]
				};
				
				this.css = `
					${BDFDB.dotCN.textareacharcounterupsell} {
						display: none;
					}
				`;
			}
			
			onStart () {
				maxMessageLength = BDFDB.LibraryModules.NitroUtils.canUseIncreasedMessageLength(BDFDB.LibraryStores.UserStore.getCurrentUser()) ? BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH_PREMIUM : BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH;
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.ChatRestrictionUtils, "applyChatRestrictions", {before: e => {
					if (e.methodArguments[0] && e.methodArguments[0].content && !this.isSlowDowned(e.methodArguments[0].channel)) e.methodArguments[0].content = "_";
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
				
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							note: this.defaults.general[key].note,
							value: this.settings.general[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "TextInput",
							childProps: {
								type: "number"
							},
							plugin: this,
							keys: ["amounts", "splitCounter"],
							label: this.defaults.amounts.splitCounter.description,
							basis: "20%",
							min: 1000,
							max: maxMessageLength,
							value: this.settings.amounts.splitCounter < 1000 || this.settings.amounts.splitCounter > maxMessageLength ? maxMessageLength : this.settings.amounts.splitCounter
						}));

						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "TextInput",
							childProps: {
								type: "number"
							},
							plugin: this,
							keys: ["amounts", "maxPages"],
							label: this.defaults.amounts.maxPages.description,
							note: this.defaults.amounts.maxPages.note,
							min: 0,
							max: 20,
							value: this.settings.amounts.splitCounter
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed (e) {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					BDFDB.PatchUtils.forceAllUpdates(this);
				}
			}
			
			processChannelTextAreaContainer (e) {
				if (e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL && e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL_WITH_ACTIVITY && e.instance.props.type != BDFDB.LibraryComponents.ChannelTextAreaTypes.SIDEBAR) return;
				const splitMessageLength = this.settings.amounts.splitCounter < 1000 || this.settings.amounts.splitCounter > maxMessageLength ? maxMessageLength : this.settings.amounts.splitCounter;
				if (!e.returnvalue) {
					BDFDB.PatchUtils.patch(this, e.instance.props, "onSubmit", {instead: e2 => {
						if (e2.methodArguments[0].value.length > splitMessageLength && !this.isSlowDowned(e.instance.props.channel)) {
							e2.stopOriginalMethodCall();
							let messages = this.formatText(e2.methodArguments[0].value).filter(n => n);
							for (let i in messages) BDFDB.TimeUtils.timeout(_ => {
								let last = i >= messages.length-1;
								e2.originalMethod(last ? Object.assign({}, e2.methodArguments[0], {value: messages[i]}) : {stickers: [], uploads: [], value: messages[i]});
								if (i >= messages.length-1) BDFDB.NotificationUtils.toast(this.labels.toast_allsent, {type: "success"});
							}, messageDelay * i * (messages > 4 ? 2 : 1));
							return Promise.resolve({
								shouldClear: true,
								shouldRefocus: true
							});
						}
						else return e2.callOriginalMethodAfterwards();
					}}, {noCache: true});
				}
				else {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ChannelTextAreaCounter"});
					if (index > -1 && children[index].props.textValue && children[index].props.textValue.length > splitMessageLength && !this.isSlowDowned(e.instance.props.channel)) children[index] = BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.textareacharcounter + BDFDB.disCN.textareacharcountererror,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: Math.ceil(children[index].props.textValue.length / splitMessageLength * (39/40)) + " " + BDFDB.LanguageUtils.LanguageStrings.MESSAGES,
							children: BDFDB.ReactUtils.createElement("span", {
								children: splitMessageLength - children[index].props.textValue.length
							})
						})
					});
				}
			}

			processChannelTextAreaEditor (e) {
				if (e.instance.props.type == BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL || e.instance.props.type == BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL_WITH_ACTIVITY || e.instance.props.type == BDFDB.LibraryComponents.ChannelTextAreaTypes.SIDEBAR) e.instance.props.uploadPromptCharacterCount = 100000;
			}
			
			isSlowDowned (channel) {
				return channel.rateLimitPerUser && !BDFDB.UserUtils.can("MANAGE_CHANNELS", BDFDB.UserUtils.me.id, channel.id) && !BDFDB.UserUtils.can("MANAGE_MESSAGES", BDFDB.UserUtils.me.id, channel.id);
			}

			formatText (text) {
				const separator = !this.settings.general.byNewlines ? "\n" : " ";
				const splitMessageLength = this.settings.amounts.splitCounter < 1000 || this.settings.amounts.splitCounter > maxMessageLength ? maxMessageLength : this.settings.amounts.splitCounter;
				const maxPages = this.settings.amounts.maxPages || Infinity;
				
				text = text.replace(/\t/g, "    ");
				let longWords = text.match(new RegExp(`[^${separator.replace("\n", "\\n")}]{${splitMessageLength * (19/20)},}`, "gm"));
				if (longWords) for (let longWord of longWords) {
					let count1 = 0;
					let shortWords = [];
					longWord.split("").forEach(c => {
						if (shortWords[count1] && (shortWords[count1].length >= splitMessageLength * (19/20) || (c == "\n" && shortWords[count1].length >= splitMessageLength * (19/20) - 100))) count1++;
						shortWords[count1] = shortWords[count1] ? shortWords[count1] + c : c;
					});
					text = text.replace(longWord, shortWords.join(separator));
				}
				let messages = [];
				let count2 = 0;
				text.split(separator).forEach((word) => {
					if (messages[count2] && (messages[count2] + "" + word).length > splitMessageLength * (39/40)) count2++;
					messages[count2] = messages[count2] ? messages[count2] + separator + word : word;
				});

				let insertCodeBlock = null, insertCodeLine = null;
				for (let j = 0; j < messages.length; j++) {
					if (insertCodeBlock) {
						messages[j] = insertCodeBlock + messages[j];
						insertCodeBlock = null;
					}
					else if (insertCodeLine) {
						messages[j] = insertCodeLine + messages[j];
						insertCodeLine = null;
					}

					let codeBlocks = messages[j].match(/`{3,}[\S]*\n|`{3,}/gm);
					let codeLines = messages[j].match(/[^`]{0,1}`{1,2}[^`]|[^`]`{1,2}[^`]{0,1}/gm);

					if (codeBlocks && codeBlocks.length % 2 == 1) {
						messages[j] = messages[j] + "```";
						insertCodeBlock = codeBlocks[codeBlocks.length-1] + "\n";
					}
					else if (codeLines && codeLines.length % 2 == 1) {
						insertCodeLine = codeLines[codeLines.length-1].replace(/[^`]/g, "");
						messages[j] = messages[j] + insertCodeLine;
					}
				}
				return messages.slice(0, maxPages);
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							toast_allsent:						"Всички изпратени съобщения"
						};
					case "da":		// Danish
						return {
							toast_allsent:						"Alle beskeder sendt"
						};
					case "de":		// German
						return {
							toast_allsent:						"Alle Nachrichten gesendet"
						};
					case "el":		// Greek
						return {
							toast_allsent:						"Όλα τα μηνύματα εστάλησαν"
						};
					case "es":		// Spanish
						return {
							toast_allsent:						"Todos los mensajes enviados"
						};
					case "fi":		// Finnish
						return {
							toast_allsent:						"Kaikki viestit lähetetty"
						};
					case "fr":		// French
						return {
							toast_allsent:						"Tous les messages envoyés"
						};
					case "hr":		// Croatian
						return {
							toast_allsent:						"Sve poruke poslane"
						};
					case "hu":		// Hungarian
						return {
							toast_allsent:						"Minden üzenet elküldve"
						};
					case "it":		// Italian
						return {
							toast_allsent:						"Tutti i messaggi inviati"
						};
					case "ja":		// Japanese
						return {
							toast_allsent:						"送信されたすべてのメッセージ"
						};
					case "ko":		// Korean
						return {
							toast_allsent:						"보낸 모든 메시지"
						};
					case "lt":		// Lithuanian
						return {
							toast_allsent:						"Visi pranešimai išsiųsti"
						};
					case "nl":		// Dutch
						return {
							toast_allsent:						"Alle berichten zijn verzonden"
						};
					case "no":		// Norwegian
						return {
							toast_allsent:						"Alle meldinger sendt"
						};
					case "pl":		// Polish
						return {
							toast_allsent:						"Wszystkie wiadomości wysłane"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							toast_allsent:						"Todas as mensagens enviadas"
						};
					case "ro":		// Romanian
						return {
							toast_allsent:						"Toate mesajele trimise"
						};
					case "ru":		// Russian
						return {
							toast_allsent:						"Все сообщения отправлены"
						};
					case "sv":		// Swedish
						return {
							toast_allsent:						"Alla meddelanden skickade"
						};
					case "th":		// Thai
						return {
							toast_allsent:						"ส่งข้อความทั้งหมดแล้ว"
						};
					case "tr":		// Turkish
						return {
							toast_allsent:						"Tüm mesajlar gönderildi"
						};
					case "uk":		// Ukrainian
						return {
							toast_allsent:						"Усі повідомлення надіслано"
						};
					case "vi":		// Vietnamese
						return {
							toast_allsent:						"Tất cả tin nhắn đã gửi"
						};
					case "zh-CN":	// Chinese (China)
						return {
							toast_allsent:						"已发送所有消息"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							toast_allsent:						"已發送所有消息"
						};
					default:		// English
						return {
							toast_allsent:						"All Messages sent"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
