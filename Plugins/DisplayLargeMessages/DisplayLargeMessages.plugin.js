/**
 * @name DisplayLargeMessages
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.9
 * @description Injects 'message.txt' into Discord or open any '.txt' File in a Window
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayLargeMessages/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/DisplayLargeMessages/DisplayLargeMessages.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "DisplayLargeMessages",
			"author": "DevilBro",
			"version": "1.0.9",
			"description": "Injects 'message.txt' into Discord or open any '.txt' File in a Window"
		},
		"changeLog": {
			"improved": {
				"Open in Popout": "The Open in extra Window now gets added for any plain text file and tries to wrap it in a code block with syntax highlighting"
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
		const plainFileTypes = ["ada", "adb", "ads", "applescript", "as", "asc", "ascii", "ascx", "asm", "asmx", "asp", "aspx", "atom", "au3", "awk", "bas", "bash", "bashrc", "bat", "bbcolors", "bcp", "bdsgroup", "bdsproj", "bib", "bowerrc", "c", "cbl", "cc", "cfc", "cfg", "cfm", "cfml", "cgi", "cjs", "clj", "cljs", "cls", "cmake", "cmd", "cnf", "cob", "code-snippets", "coffee", "coffeekup", "conf", "cp", "cpp", "cpt", "cpy", "crt", "cs", "csh", "cson", "csproj", "csr", "css", "csslintrc", "csv", "ctl", "curlrc", "cxx", "d", "dart", "dfm", "diff", "dof", "dpk", "dpr", "dproj", "dtd", "eco", "editorconfig", "ejs", "el", "elm", "emacs", "eml", "ent", "erb", "erl", "eslintignore", "eslintrc", "ex", "exs", "f", "f03", "f77", "f90", "f95", "fish", "for", "fpp", "frm", "fs", "fsproj", "fsx", "ftn", "gemrc", "gemspec", "gitattributes", "gitconfig", "gitignore", "gitkeep", "gitmodules", "go", "gpp", "gradle", "graphql", "groovy", "groupproj", "grunit", "gtmpl", "gvimrc", "h", "haml", "hbs", "hgignore", "hh", "hpp", "hrl", "hs", "hta", "htaccess", "htc", "htm", "html", "htpasswd", "hxx", "iced", "iml", "inc", "inf", "info", "ini", "ino", "int", "irbrc", "itcl", "itermcolors", "itk", "jade", "java", "jhtm", "jhtml", "js", "jscsrc", "jshintignore", "jshintrc", "json", "json5", "jsonld", "jsp", "jspx", "jsx", "ksh", "less", "lhs", "lisp", "log", "ls", "lsp", "lua", "m", "m4", "mak", "map", "markdown", "master", "md", "mdown", "mdwn", "mdx", "metadata", "mht", "mhtml", "mjs", "mk", "mkd", "mkdn", "mkdown", "ml", "mli", "mm", "mxml", "nfm", "nfo", "noon", "npmignore", "npmrc", "nuspec", "nvmrc", "ops", "pas", "pasm", "patch", "pbxproj", "pch", "pem", "pg", "php", "php3", "php4", "php5", "phpt", "phtml", "pir", "pl", "pm", "pmc", "pod", "pot", "prettierrc", "properties", "props", "pt", "pug", "purs", "py", "pyx", "r", "rake", "rb", "rbw", "rc", "rdoc", "rdoc_options", "resx", "rexx", "rhtml", "rjs", "rlib", "ron", "rs", "rss", "rst", "rtf", "rvmrc", "rxml", "s", "sass", "scala", "scm", "scss", "seestyle", "sh", "shtml", "sln", "sls", "spec", "sql", "sqlite", "sqlproj", "srt", "ss", "sss", "st", "strings", "sty", "styl", "stylus", "sub", "sublime-build", "sublime-commands", "sublime-completions", "sublime-keymap", "sublime-macro", "sublime-menu", "sublime-project", "sublime-settings", "sublime-workspace", "sv", "svc", "svg", "swift", "t", "tcl", "tcsh", "terminal", "tex", "text", "textile", "tg", "tk", "tmLanguage", "tmpl", "tmTheme", "tpl", "ts", "tsv", "tsx", "tt", "tt2", "ttml", "twig", "txt", "v", "vb", "vbproj", "vbs", "vcproj", "vcxproj", "vh", "vhd", "vhdl", "vim", "viminfo", "vimrc", "vm", "vue", "webapp", "webmanifest", "wsc", "x-php", "xaml", "xht", "xhtml", "xml", "xs", "xsd", "xsl", "xslt", "y", "yaml", "yml", "zsh", "zshrc"];
		
		var encodedMessages, requestedMessages, pendingRequests, oldMessages, updateTimeout;
	
		return class DisplayLargeMessages extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						onDemand:				{value: false, 	description: "Inject the Content of 'Message.txt' On-Demand and not automatically"},
						addOpenButton:			{value: true, 	description: "Add a Button to Preview the Contents of Plain Files in an extra Window"}
					},
					amounts: {
						maxFileSize:			{value: 10, 	min: 0,		description: "Max File Size a File will be read automatically",	note: "in KB / 0 = inject all / ignored in On-Demand"}
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
							value: this.settings.general[key],
							onChange: key == "onDemand" && (_ => BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates))
						}));
						for (let key in this.defaults.amounts) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "TextInput",
							childProps: {
								type: "number"
							},
							plugin: this,
							keys: ["amounts", key],
							disabled: key == "maxFileSize" && this.settings.general.onDemand,
							label: this.defaults.amounts[key].description,
							note: this.defaults.amounts[key].note,
							basis: "20%",
							min: this.defaults.amounts[key].min,
							max: this.defaults.amounts[key].max,
							value: this.settings.amounts[key]
						}));
						
						return settingsItems.flat(10);
					}
				});
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
				else if (!this.settings.general.onDemand && !requestedMessages.includes(message.id)) for (let attachment of message.attachments) {
					if (attachment.filename == "message.txt" && (!this.settings.amounts.maxFileSize || (this.settings.amounts.maxFileSize >= attachment.size/1024))) {
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
				if (typeof e.instance.props.filename == "string") {
					let fileType = (e.instance.props.filename.split(".").pop() || "").toLowerCase();
					e.returnvalue.props.children.splice(2, 0, [
						e.instance.props.filename == "message.txt" && (this.settings.general.onDemand || this.settings.amounts.maxFileSize && (this.settings.amounts.maxFileSize < e.instance.props.size/1024)) && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
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
						fileType && plainFileTypes.includes(fileType) && this.settings.general.addOpenButton && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
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
															content: e.instance.props.filename == "message.txt" ? body : `\`\`\`${fileType}\n${body}\`\`\``
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