//META{"name":"DisplayLargeMessages","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayLargeMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayLargeMessages/DisplayLargeMessages.plugin.js"}*//

module.exports = (_ => {
	const config = {
		"info": {
			"name": "DisplayLargeMessages",
			"author": "DevilBro",
			"version": "1.0.6",
			"description": "Injects the contents of large messages that were sent by discord via 'message.txt'."
		}
	};
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`//META{"name":"`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
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
		var encodedMessages, requestedMessages, pendingRequests, oldMessages, updateTimeout;
		var settings = {}, amounts = {};
	
		return class DisplayLargeMessages extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						onDemand:				{value:false, 	description:"Inject the content of 'message.txt' on demand instead of automatically"}
					},
					amounts: {
						maxFileSize:			{value:10, 	min:0,		description:"Max Filesize a fill will be read automatically",	note: "in KB / 0 = inject all / ignored in On-Demand"}
					}
				};
			
				this.patchedModules = {
					after: {
						Messages: "type",
						Attachment: "default"
					}
				};
				
				this.css = `
					${BDFDB.dotCN._displaylargemessagesinjectbutton} {
						color: var(--interactive-normal);
						cursor: pointer;
						margin-left: 4px;
					}
					${BDFDB.dotCN._displaylargemessagesinjectbutton}:hover {
						color: var(--interactive-hover);
					}
				`;
			}
			
			onStart() {
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
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
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
					className: BDFDB.disCN.marginbottom8,
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
								label: this.labels.context_uninjectattchment_text,
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
					e.returnvalue.props.children.splice(2, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: this.labels.button_injectattchment_text,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
							rel: "noreferrer noopener",
							target: "_blank",
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN._displaylargemessagesinjectbutton,
								name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT,
								width: 20,
								height: 20
							}),
							onClick: event => {
								BDFDB.ListenerUtils.stopEvent(event);
								let target = event.target;
								let message = BDFDB.ReactUtils.findValue(target, "message", {up: true});
								if (message) {
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
					}));
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							context_uninjectattchment_text:		"Uklonite učitani sadržaj poruke",
							button_injectattchment_text:		"Učitajte sadržaj poruke"
						};
					case "da":		//danish
						return {
							context_uninjectattchment_text:		"Fjern indlæst meddelelsesindhold",
							button_injectattchment_text:		"Indlæs meddelelsesindhold"
						};
					case "de":		//german
						return {
							context_uninjectattchment_text:		"Geladenen Nachrichteninhalt entfernen",
							button_injectattchment_text:		"Nachrichteninhalt laden"
						};
					case "es":		//spanish
						return {
							context_uninjectattchment_text:		"Eliminar contenido del mensaje cargado",
							button_injectattchment_text:		"Cargar contenido del mensaje"
						};
					case "fr":		//french
						return {
							context_uninjectattchment_text:		"Supprimer le contenu du message chargé",
							button_injectattchment_text:		"Charger le contenu du message"
						};
					case "it":		//italian
						return {
							context_uninjectattchment_text:		"Rimuovi il contenuto del messaggio caricato",
							button_injectattchment_text:		"Carica il contenuto del messaggio"
						};
					case "nl":		//dutch
						return {
							context_uninjectattchment_text:		"Verwijder geladen berichtinhoud",
							button_injectattchment_text:		"Laad berichtinhoud"
						};
					case "no":		//norwegian
						return {
							context_uninjectattchment_text:		"Fjern lastet meldingens innhold",
							button_injectattchment_text:		"Last inn meldingens innhold"
						};
					case "pl":		//polish
						return {
							context_uninjectattchment_text:		"Usuń załadowaną treść wiadomości",
							button_injectattchment_text:		"Załaduj treść wiadomości"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							context_uninjectattchment_text:		"Remover o conteúdo da mensagem carregada",
							button_injectattchment_text:		"Carregar conteúdo da mensagem"
						};
					case "fi":		//finnish
						return {
							context_uninjectattchment_text:		"Poista ladattu viestin sisältö",
							button_injectattchment_text:		"Lataa viestin sisältö"
						};
					case "sv":		//swedish
						return {
							context_uninjectattchment_text:		"Ta bort laddat meddelandeinnehåll",
							button_injectattchment_text:		"Ladda meddelandets innehåll"
						};
					case "tr":		//turkish
						return {
							context_uninjectattchment_text:		"Yüklenen mesaj içeriğini kaldır",
							button_injectattchment_text:		"Mesaj içeriğini yükle"
						};
					case "cs":		//czech
						return {
							context_uninjectattchment_text:		"Odebrat načtený obsah zprávy",
							button_injectattchment_text:		"Načíst obsah zprávy"
						};
					case "bg":		//bulgarian
						return {
							context_uninjectattchment_text:		"Премахнете зареденото съдържание на съобщението",
							button_injectattchment_text:		"Заредете съдържание на съобщението"
						};
					case "ru":		//russian
						return {
							context_uninjectattchment_text:		"Удалить загруженное содержимое сообщения",
							button_injectattchment_text:		"Загрузить содержимое сообщения"
						};
					case "uk":		//ukrainian
						return {
							context_uninjectattchment_text:		"Видаліть завантажений вміст повідомлення",
							button_injectattchment_text:		"Завантажте вміст повідомлення"
						};
					case "ja":		//japanese
						return {
							context_uninjectattchment_text:		"ロードされたメッセージコンテンツを削除する",
							button_injectattchment_text:		"メッセージの内容を読み込む"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							context_uninjectattchment_text:		"刪除已加載的郵件內容",
							button_injectattchment_text:		"加載消息內容"
						};
					case "ko":		//korean
						return {
							context_uninjectattchment_text:		"로드 된 메시지 내용 제거",
							button_injectattchment_text:		"메시지 내용로드"
						};
					default:		//default: english
						return {
							context_uninjectattchment_text:		"Remove loaded message content",
							button_injectattchment_text:		"Load message content"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();