/**
 * @name DisplayLargeMessages
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayLargeMessages
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayLargeMessages/DisplayLargeMessages.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayLargeMessages/DisplayLargeMessages.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "DisplayLargeMessages",
			"author": "DevilBro",
			"version": "1.0.7",
			"description": "Inject the contents of large messages that were sent by discord via 'message.txt'"
		},
		"changelog": {
			"added": {
				"Open in popout": "Added an option to add a button that allows you to preview the contents of a 'message.txt' in a popup"
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
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
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
		var encodedMessages, requestedMessages, pendingRequests, oldMessages, updateTimeout;
		var settings = {}, amounts = {};
	
		return class DisplayLargeMessages extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						onDemand:				{value: false, 	description: "Inject the content of 'message.txt' on demand and not automatically"},
						addOpenButton:			{value: true, 	description: "Add a button to preview the contents of 'message.txt' in a popup"}
					},
					amounts: {
						maxFileSize:			{value: 10, 	min: 0,		description: "Max Filesize a file will be read automatically",	note: "in KB / 0 = inject all / ignored in On-Demand"}
					}
				};
			
				this.patchedModules = {
					after: {
						Messages: "type",
						Attachment: "default"
					}
				};
				
				this.css = `
					${BDFDB.dotCN._displaylargemessagesinjectbuttonwrapper},
					${BDFDB.dotCN._displaylargemessagespopoutbuttonwrapper} {
						display: block;
						width: 24px;
						height: 24px;
						margin-left: 4px;
						margin-right: 4px;
					}
					${BDFDB.dotCN._displaylargemessagesinjectbutton},
					${BDFDB.dotCN._displaylargemessagespopoutbutton} {
						color: var(--interactive-normal);
						cursor: pointer;
					}
					${BDFDB.dotCN._displaylargemessagesinjectbutton}:hover,
					${BDFDB.dotCN._displaylargemessagespopoutbutton}:hover {
						color: var(--interactive-hover);
					}
					${BDFDB.dotCN._displaylargemessagespreviewmessage} {
						margin-top: 8px;
						margin-bottom: 8px;
						pointer-events: all;
					}
				`;
			}
			
			onStart () {
				encodedMessages = {};
				requestedMessages = [];
				pendingRequests = [];
				oldMessages = {};
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "startEditMessage", {before: e => {
					let encodedContent = encodedMessages[e.methodArguments[1]];
					if (encodedContent != null) e.methodArguments[2] = encodedContent.content;
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "editMessage", {before: e => {
					let encodedContent = encodedMessages[e.methodArguments[1]];
					let oldMessage = oldMessages[e.methodArguments[1]];
					if (encodedContent != null) encodedContent.content = e.methodArguments[2].content;
					if (oldMessage != null) oldMessage.content = e.methodArguments[2].content;
				}});

				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key],
					onChange: _ => {
						if (key == "onDemand") BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
					}
				}));
				for (let key in amounts) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "TextInput",
					childProps: {
						type: "number"
					},
					plugin: this,
					keys: ["amounts", key],
					disabled: key == "maxFileSize" && settings.onDemand,
					label: this.defaults.amounts[key].description,
					note: this.defaults.amounts[key].note,
					basis: "20%",
					min: this.defaults.amounts[key].min,
					max: this.defaults.amounts[key].max,
					value: amounts[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					encodedMessages = {};
					requestedMessages = [];
					pendingRequests = [];
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && !requestedMessages.includes(e.instance.props.message.id)) {
					let encodedContent = encodedMessages[e.instance.props.message.id];
					if (encodedContent) {
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
						children.splice(index > -1 ? index : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.context_uninjectattachment,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "uninject-attachment"),
								action: _ => {
									delete encodedMessages[e.instance.props.message.id];
									BDFDB.MessageUtils.rerenderAll(true);
								}
							})
						}));
					}
				}
			}

			processMessages (e) {
				e.returnvalue.props.children.props.channelStream = [].concat(e.returnvalue.props.children.props.channelStream);
				for (let i in e.returnvalue.props.children.props.channelStream) {
					let message = e.returnvalue.props.children.props.channelStream[i].content;
					if (message) {
						if (BDFDB.ArrayUtils.is(message.attachments)) this.checkMessage(e.instance, e.returnvalue.props.children.props.channelStream[i], message);
						else if (BDFDB.ArrayUtils.is(message)) for (let j in message) {
							let childMessage = message[j].content;
							if (childMessage && BDFDB.ArrayUtils.is(childMessage.attachments)) this.checkMessage(e.instance, message[j], childMessage);
						}
					}
				}
			}
			
			checkMessage (instance, stream, message) {
				let encodedContent = encodedMessages[message.id];
				if (encodedContent != null) {
					if (message.content.indexOf(encodedContent.attachment) == -1) {
						stream.content.content = (message.content && (message.content + "\n\n") || "") + encodedContent.attachment;
						stream.content.attachments = message.attachments.filter(n => n.filename != "message.txt");
					}
				}
				else if (oldMessages[message.id] && Object.keys(message).some(key => !BDFDB.equals(oldMessages[message.id][key], message[key]))) {
					stream.content.content = oldMessages[message.id].content;
					stream.content.attachments = oldMessages[message.id].attachments;
					delete oldMessages[message.id];
				}
				else if (!settings.onDemand && !requestedMessages.includes(message.id)) for (let attachment of message.attachments) {
					if (attachment.filename == "message.txt" && (!amounts.maxFileSize || (amounts.maxFileSize >= attachment.size/1024))) {
						requestedMessages.push(message.id);
						BDFDB.LibraryRequires.request(attachment.url, (error, response, body) => {
							encodedMessages[message.id] = {
								content: message.content || "",
								attachment: body || ""
							};
							BDFDB.TimeUtils.clear(updateTimeout);
							updateTimeout = BDFDB.TimeUtils.timeout(_ => {BDFDB.ReactUtils.forceUpdate(instance);}, 1000);
						});
					}
				}
			}
			
			processAttachment (e) {
				if (e.instance.props.filename == "message.txt" && (settings.onDemand || amounts.maxFileSize && (amounts.maxFileSize < e.instance.props.size/1024))) {
					e.returnvalue.props.children.splice(2, 0, [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: this.labels.button_injectattachment,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
								className: BDFDB.disCN._displaylargemessagesinjectbuttonwrapper,
								rel: "noreferrer noopener",
								target: "_blank",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN._displaylargemessagesinjectbutton,
									name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT,
									width: 22,
									height: 22
								}),
								onClick: event => {
									BDFDB.ListenerUtils.stopEvent(event);
									let target = event.target;
									let message = BDFDB.ReactUtils.findValue(target, "message", {up: true});
									if (message && !pendingRequests.includes(message.id)) {
										pendingRequests.push(message.id);
										BDFDB.LibraryRequires.request(e.instance.props.url, (error, response, body) => {
											BDFDB.ArrayUtils.remove(pendingRequests, message.id, true);
											oldMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
											encodedMessages[message.id] = {
												content: message.content || "",
												attachment: body || ""
											};
											BDFDB.MessageUtils.rerenderAll(true);
										});
									}
								}
							})
						}),
						settings.addOpenButton && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.OPEN,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
								className: BDFDB.disCN._displaylargemessagespopoutbuttonwrapper,
								rel: "noreferrer noopener",
								target: "_blank",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN._displaylargemessagespopoutbutton,
									name: BDFDB.LibraryComponents.SvgIcon.Names.OPEN_EXTERNAL
								}),
								onClick: event => {
									BDFDB.ListenerUtils.stopEvent(event);
									let target = event.target;
									let message = BDFDB.ReactUtils.findValue(target, "message", {up: true});
									let channel = message && BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
									if (message && channel && !pendingRequests.includes(message.id)) {
										pendingRequests.push(message.id);
										BDFDB.LibraryRequires.request(e.instance.props.url, (error, response, body) => {
											BDFDB.ArrayUtils.remove(pendingRequests, message.id, true);
											BDFDB.ModalUtils.open(this, {
												size: "LARGE",
												header: BDFDB.LanguageUtils.LanguageStrings.MESSAGE_PREVIEW,
												subHeader: "",
												children: BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCNS.messagepopout + BDFDB.disCN._displaylargemessagespreviewmessage,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessageGroup, {
														message: new BDFDB.DiscordObjects.Message({
															author: message.author,
															channel_id: channel.id,
															content: body
														}),
														channel: channel
													})
												})
											});
										});
									}
								}
							})
						})
					]);
					e.returnvalue.props.children = e.returnvalue.props.children.flat(10).filter(n => n);
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							button_injectattachmenty:			"Заредете съдържанието на съобщението",
							context_uninjectattachment:			"Премахнете зареденото съдържание на съобщението"
						};
					case "da":		// Danish
						return {
							button_injectattachmenty:			"Indlæs beskedindhold",
							context_uninjectattachment:			"Fjern indlæst beskedindhold"
						};
					case "de":		// German
						return {
							button_injectattachment:			"Nachrichteninhalt laden",
							context_uninjectattachment:			"Geladenen Nachrichteninhalt entfernen",
						};
					case "el":		// Greek
						return {
							button_injectattachmenty:			"Φόρτωση περιεχομένου μηνύματος",
							context_uninjectattachment:			"Καταργήστε το φορτωμένο περιεχόμενο μηνυμάτων"
						};
					case "es":		// Spanish
						return {
							button_injectattachmenty:			"Cargar el contenido del mensaje",
							context_uninjectattachment:			"Eliminar el contenido del mensaje cargado"
						};
					case "fi":		// Finnish
						return {
							button_injectattachmenty:			"Lataa viestin sisältö",
							context_uninjectattachment:			"Poista ladattu viestin sisältö"
						};
					case "fr":		// French
						return {
							button_injectattachmenty:			"Charger le contenu du message",
							context_uninjectattachment:			"Supprimer le contenu du message chargé"
						};
					case "hr":		// Croatian
						return {
							button_injectattachmenty:			"Učitaj sadržaj poruke",
							context_uninjectattachment:			"Uklonite učitani sadržaj poruke"
						};
					case "hu":		// Hungarian
						return {
							button_injectattachmenty:			"Üzenet tartalmának betöltése",
							context_uninjectattachment:			"Távolítsa el a betöltött üzenet tartalmát"
						};
					case "it":		// Italian
						return {
							button_injectattachmenty:			"Carica il contenuto del messaggio",
							context_uninjectattachment:			"Rimuovi il contenuto del messaggio caricato"
						};
					case "ja":		// Japanese
						return {
							button_injectattachmenty:			"メッセージコンテンツをロードする",
							context_uninjectattachment:			"ロードされたメッセージコンテンツを削除する"
						};
					case "ko":		// Korean
						return {
							button_injectattachmenty:			"메시지 내용로드",
							context_uninjectattachment:			"로드 된 메시지 내용 제거"
						};
					case "lt":		// Lithuanian
						return {
							button_injectattachmenty:			"Įkelti pranešimo turinį",
							context_uninjectattachment:			"Pašalinkite įkeltą pranešimo turinį"
						};
					case "nl":		// Dutch
						return {
							button_injectattachmenty:			"Laad berichtinhoud",
							context_uninjectattachment:			"Verwijder de geladen berichtinhoud"
						};
					case "no":		// Norwegian
						return {
							button_injectattachmenty:			"Last inn meldingsinnhold",
							context_uninjectattachment:			"Fjern innlastet meldingsinnhold"
						};
					case "pl":		// Polish
						return {
							button_injectattachmenty:			"Załaduj treść wiadomości",
							context_uninjectattachment:			"Usuń wczytaną treść wiadomości"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							button_injectattachmenty:			"Carregar o conteúdo da mensagem",
							context_uninjectattachment:			"Remover o conteúdo da mensagem carregada"
						};
					case "ro":		// Romanian
						return {
							button_injectattachmenty:			"Încărcați conținutul mesajului",
							context_uninjectattachment:			"Eliminați conținutul mesajului încărcat"
						};
					case "ru":		// Russian
						return {
							button_injectattachmenty:			"Загрузить содержимое сообщения",
							context_uninjectattachment:			"Удалить загруженное содержимое сообщения"
						};
					case "sv":		// Swedish
						return {
							button_injectattachmenty:			"Ladda meddelandens innehåll",
							context_uninjectattachment:			"Ta bort laddat meddelandeinnehåll"
						};
					case "th":		// Thai
						return {
							button_injectattachmenty:			"โหลดเนื้อหาข้อความ",
							context_uninjectattachment:			"ลบเนื้อหาข้อความที่โหลด"
						};
					case "tr":		// Turkish
						return {
							button_injectattachmenty:			"Mesaj içeriğini yükle",
							context_uninjectattachment:			"Yüklenen mesaj içeriğini kaldırın"
						};
					case "uk":		// Ukrainian
						return {
							button_injectattachmenty:			"Завантажити вміст повідомлення",
							context_uninjectattachment:			"Видалити завантажений вміст повідомлення"
						};
					case "vi":		// Vietnamese
						return {
							button_injectattachmenty:			"Tải nội dung tin nhắn",
							context_uninjectattachment:			"Xóa nội dung tin nhắn đã tải"
						};
					case "zh-CN":	// Chinese (China)
						return {
							button_injectattachmenty:			"加载消息内容",
							context_uninjectattachment:			"删除已加载的邮件内容"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							button_injectattachmenty:			"加載消息內容",
							context_uninjectattachment:			"刪除已加載的郵件內容"
						};
					default:		// English
						return {
							button_injectattachmenty:			"Load message content",
							context_uninjectattachment:			"Remove loaded message content"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();