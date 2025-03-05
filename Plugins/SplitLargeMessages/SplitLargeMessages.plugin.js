/**
 * @name SplitLargeMessages
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.8.7
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
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
		let enabled = true;
	
		return class SplitLargeMessages extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						byNewlines:		{value: false, 	description: "Try to split Messages on Newlines instead of Spaces",	note: "This will stop Sentences from being cut, but might Result in more Messages being sent"},
						leaveGaps:		{value: false,	description: "Leave Gaps if splitting on empty Newline",		note: "If splitting on NewLines and the Line is left empty, this will maintain the Gap"}
					},
					amounts: {
						splitCounter:		{value: 0, 	description: "Messages will be split after roughly X Characters"},
						maxMessages:		{value:	0,	min: 0, 	max: 20, 	description: "Maximum Amount of split Messages",			note: "(0 for unlimited) Messages beyond this Count will be discarded"},
						attachmentLimit:	{value:	0,	min: 0, 	max: undefined, description: "Maximum Amount of Chars, before generating .txt",		note: "(0 for never) Never generates a .txt FIle"}
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

						for (let key of Object.keys(this.defaults.amounts)) if (key != "splitCounter") settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "TextInput",
							childProps: {
								type: "number"
							},
							plugin: this,
							keys: ["amounts", key],
							label: this.defaults.amounts[key].description,
							note: this.defaults.amounts[key].note,
							basis: "20%",
							min: this.defaults.amounts[key].min,
							max: this.defaults.amounts[key].max,
							value: this.settings.amounts[key]
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

			onTextAreaContextMenu (e) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.unshift(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuCheckboxItem, {
						label: this.labels.context_enable,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "enabled"),
						checked: enabled,
						action: state => {enabled = state;}
					})
				}));
			}
			
			processChannelTextAreaContainer (e) {
				if (e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL && e.instance.props.type != BDFDB.LibraryComponents.ChannelTextAreaTypes.SIDEBAR) return;
				const splitMessageLength = this.settings.amounts.splitCounter < 1000 || this.settings.amounts.splitCounter > maxMessageLength ? maxMessageLength : this.settings.amounts.splitCounter;
				if (!e.returnvalue) {
					BDFDB.PatchUtils.patch(this, e.instance.props, "onSubmit", {instead: e2 => {
						if (enabled && e2.methodArguments[0].value.length > splitMessageLength && !this.isSlowDowned(e.instance.props.channel)) {
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
					if (enabled && index > -1 && children[index].props.textValue && children[index].props.textValue.length > splitMessageLength && !this.isSlowDowned(e.instance.props.channel)) children[index] = BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.textareacharcounter,
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.textareacharcounterinner,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: Math.ceil(children[index].props.textValue.length / splitMessageLength * (39/40)) + " " + BDFDB.LanguageUtils.LanguageStrings.MESSAGES,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Heading, {
									tag: "div",
									className: BDFDB.disCN.tabularnumbers,
									variant: "text-sm/semibold",
									style: {color: "var(--text-danger)"},
									children: splitMessageLength - children[index].props.textValue.length
								})
							})
						})
					});
				}
			}

			processChannelTextAreaEditor (e) {
				if (e.instance.props.type == BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL || e.instance.props.type == BDFDB.LibraryComponents.ChannelTextAreaTypes.SIDEBAR) e.instance.props.uploadPromptCharacterCount = this.settings.amounts.attachmentLimit ? this.settings.amounts.attachmentLimit : 100000;
			}
			
			isSlowDowned (channel) {
				return channel.rateLimitPerUser && !BDFDB.UserUtils.can("MANAGE_CHANNELS", BDFDB.UserUtils.me.id, channel.id) && !BDFDB.UserUtils.can("MANAGE_MESSAGES", BDFDB.UserUtils.me.id, channel.id);
			}

			formatText (text) {
				const separator = this.settings.general.byNewlines ? "\n" : " ";
				const splitMessageLength = this.settings.amounts.splitCounter < 1000 || this.settings.amounts.splitCounter > maxMessageLength ? maxMessageLength : this.settings.amounts.splitCounter;
				
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
					else if (messages[j].charCodeAt(0) == 10 && this.settings.general.byNewlines && this.settings.general.leaveGaps){
						messages[j] = "** **" + messages[j];
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
					else if (messages[j].charCodeAt(messages[j].length-1) == 10 && this.settings.general.byNewlines && this.settings.general.leaveGaps){
						messages[j] = messages[j] + "** **";
					}
				}
				return this.settings.amounts.maxMessages ? messages.slice(0, this.settings.amounts.maxMessages) : messages;
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_enable:						"Разделете големите съобщения на по-малки",
							toast_allsent:						"Всички изпратени съобщения"
						};
					case "cs":		// Czech
						return {
							context_enable:						"Rozdělte velké zprávy",
							toast_allsent:						"Všechny zprávy odeslány"
						};
					case "da":		// Danish
						return {
							context_enable:						"Opdel store beskeder",
							toast_allsent:						"Alle beskeder sendt"
						};
					case "de":		// German
						return {
							context_enable:						"Spalte große Nachrichten auf",
							toast_allsent:						"Alle Nachrichten gesendet"
						};
					case "el":		// Greek
						return {
							context_enable:						"Διαχωρίστε τα μεγάλα μηνύματα",
							toast_allsent:						"Όλα τα μηνύματα εστάλησαν"
						};
					case "es":		// Spanish
						return {
							context_enable:						"Dividir mensajes grandes",
							toast_allsent:						"Todos los mensajes enviados"
						};
					case "es-419":		// Spanish (Latin America)
						return {
							context_enable:						"Dividir mensajes grandes",
							toast_allsent:						"Todos los mensajes enviados"
						};
					case "fi":		// Finnish
						return {
							context_enable:						"Jaa suuret viestit",
							toast_allsent:						"Kaikki viestit lähetetty"
						};
					case "fr":		// French
						return {
							context_enable:						"Divisez les gros messages",
							toast_allsent:						"Tous les messages envoyés"
						};
					case "hi":		// Hindi
						return {
							context_enable:						"बड़े संदेशों को छोटे संदेशों में विभाजित करें",
							toast_allsent:						"सभी संदेश भेजे गए"
						};
					case "hr":		// Croatian
						return {
							context_enable:						"Podijelite velike poruke",
							toast_allsent:						"Sve poruke poslane"
						};
					case "hu":		// Hungarian
						return {
							context_enable:						"A nagy üzenetek felosztása kisebb üzenetekre",
							toast_allsent:						"Minden üzenet elküldve"
						};
					case "it":		// Italian
						return {
							context_enable:						"Suddividi messaggi di grandi",
							toast_allsent:						"Tutti i messaggi inviati"
						};
					case "ja":		// Japanese
						return {
							context_enable:						"大きなメッセージを小さなメッセージに分割する",
							toast_allsent:						"送信されたすべてのメッセージ"
						};
					case "ko":		// Korean
						return {
							context_enable:						"큰 메시지를 작은",
							toast_allsent:						"보낸 모든 메시지"
						};
					case "lt":		// Lithuanian
						return {
							context_enable:						"Padalinkite didelius pranešimus",
							toast_allsent:						"Visi pranešimai išsiųsti"
						};
					case "nl":		// Dutch
						return {
							context_enable:						"Splits grote berichten op",
							toast_allsent:						"Alle berichten zijn verzonden"
						};
					case "no":		// Norwegian
						return {
							context_enable:						"Del store meldinger",
							toast_allsent:						"Alle meldinger sendt"
						};
					case "pl":		// Polish
						return {
							context_enable:						"Podziel duże wiadomości na mniejsze",
							toast_allsent:						"Wszystkie wiadomości wysłane"
						};
					case "pt-BR":		// Portuguese (Brazil)
						return {
							context_enable:						"Divida mensagens grandes",
							toast_allsent:						"Todas as mensagens enviadas"
						};
					case "ro":		// Romanian
						return {
							context_enable:						"Împărțiți mesajele mari",
							toast_allsent:						"Toate mesajele trimise"
						};
					case "ru":		// Russian
						return {
							context_enable:						"Разделите большие сообщения",
							toast_allsent:						"Все сообщения отправлены"
						};
					case "sv":		// Swedish
						return {
							context_enable:						"Dela upp stora meddelanden",
							toast_allsent:						"Alla meddelanden skickade"
						};
					case "th":		// Thai
						return {
							context_enable:						"แบ่งข้อความขนาดใหญ่เป็นข้อความขนาดเล็ก",
							toast_allsent:						"ส่งข้อความทั้งหมดแล้ว"
						};
					case "tr":		// Turkish
						return {
							context_enable:						"Büyük Mesajları daha küçük Mesajlara bölün",
							toast_allsent:						"Tüm mesajlar gönderildi"
						};
					case "uk":		// Ukrainian
						return {
							context_enable:						"Розділіть великі повідомлення на менші",
							toast_allsent:						"Усі повідомлення надіслано"
						};
					case "vi":		// Vietnamese
						return {
							context_enable:						"Chia tin nhắn lớn thành tin nhắn nhỏ hơn",
							toast_allsent:						"Tất cả tin nhắn đã gửi"
						};
					case "zh-CN":		// Chinese (China)
						return {
							context_enable:						"将大消息拆分为较小的消息",
							toast_allsent:						"已发送所有消息"
						};
					case "zh-TW":		// Chinese (Taiwan)
						return {
							context_enable:						"將大消息拆分為較小的消息",
							toast_allsent:						"已發送所有消息"
						};
					default:		// English
						return {
							context_enable:						"Split large Messages",
							toast_allsent:						"All Messages sent"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();