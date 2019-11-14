//META{"name":"SendLargeMessages","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SendLargeMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SendLargeMessages/SendLargeMessages.plugin.js"}*//

class SendLargeMessages {
	getName () {return "SendLargeMessages";}

	getVersion () {return "1.5.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Opens a popout when your message is too large, which allows you to automatically send the message in several smaller messages.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				ChannelTextArea: "componentDidMount"
			}
		};
	}

	initConstructor () {
		this.messageDelay = 1000; //changing at own risk, might result in bans or mutes

		this.css = `
			.${this.name}-modal textarea {
				height: 50vh;
			}`;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.ModuleUtils.forceAllUpdates(this);

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processChannelTextArea (e) {
		if (e.instance.props && e.instance.props.type && e.instance.props.type == "normal") {
			var textarea = e.node.querySelector("textarea");
			if (!textarea) return;
			let modaltext, checkTextarea = () => {
				if (BDFDB.StringUtils.getParsedLength(textarea.value) > 1950) {
					textarea.selectionStart = 0;
					textarea.selectionEnd = textarea.value.length;
					document.execCommand("insertText", false, "");
					this.openMessageModal(modaltext, e.instance.props.channel);
				}
			};
			BDFDB.ListenerUtils.add(this, textarea, "keyup", e => {
				BDFDB.TimeUtils.clear(textarea.sendlargemessagestimeout);
				textarea.sendlargemessagestimeout = BDFDB.TimeUtils.timeout(() => {
					modaltext = textarea.value;
					checkTextarea();
				},100);
			});
			BDFDB.ListenerUtils.add(this, textarea, "paste", e => {
				modaltext = textarea.value.slice(0, textarea.selectionStart) + BDFDB.LibraryRequires.electron.clipboard.readText() + textarea.value.slice(textarea.selectionEnd);
				BDFDB.TimeUtils.timeout(() => {checkTextarea(textarea);});
			});
		}
	}

	openMessageModal (text, channel) {		
		BDFDB.ModalUtils.open(this, {
			size: "LARGE",
			header: this.labels.modal_header_text,
			subheader: BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `#${channel.name}`),
			scroller: false,
			children: [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextArea, {
					className: "textmessage-textarea",
					value: text,
					placeholder: text,
					autoFocus: true
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CharCounter, {
					className: BDFDB.disCN.marginbottom8,
					parsing: true,
					refClass: ".textmessage-textarea",
					renderPrefix: length => {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
								className: BDFDB.disCN.weightbold,
								color: BDFDB.LibraryComponents.TextElement.Colors.RED,
								children: Math.ceil(length/1900) > 7 ? this.labels.modal_messages_warning : null
							})
						});
					},
					renderSuffix: length => {
						return ` 🠚 ${BDFDB.LanguageUtils.LanguageStrings.MESSAGES}: ${Math.ceil(length/1900)}`;
					}
				})
			],
			buttons: [{
				contents: BDFDB.LanguageUtils.LanguageStrings.SEND,
				color: "BRAND",
				close: true,
				click: modal => {
					let textinput = (modal.querySelector(".textmessage-textarea").value || "").trim();
					let messages = this.formatText(textinput);
					messages.forEach((message,i) => {
						BDFDB.TimeUtils.timeout(() => {
							this.sendMessage(message);
							if (i >= messages.length-1) BDFDB.NotificationUtils.toast(this.labels.toast_allsent_text, {type:"success"});
						}, this.messageDelay * i);
					});
				}
			}]
		});
	}

	formatText (text) {
		text = text.replace(/\t/g, "	");
		let longwords = text.match(/[\S]{1800,}/gm);
		for (let i in longwords) {
			let longword = longwords[i];
			let count1 = 0;
			let shortwords = [];
			longword.split("").forEach((char) => {
				if (shortwords[count1] && BDFDB.StringUtils.getParsedLength(shortwords[count1]) >= 1800) count1++;
				shortwords[count1] = shortwords[count1] ? shortwords[count1] + char : char;
			});
			text = text.replace(longword, shortwords.join(" "));
		}
		let messages = [];
		let count2 = 0;
		text.split(" ").forEach((word) => {
			if (messages[count2] && BDFDB.StringUtils.getParsedLength(messages[count2] + "" + word) > 1900) count2++;
			messages[count2] = messages[count2] ? messages[count2] + " " + word : word;
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

		return messages;
	}

	sendMessage (text) {
		let textarea = document.querySelector(BDFDB.dotCNS.textareawrapchat + "textarea");
		if (textarea) {
			let instance = BDFDB.ReactUtils.findOwner(BDFDB.DOMUtils.getParent(BDFDB.dotCNS.chat + "form", textarea), {name:"ChannelTextAreaForm", up:true});
			if (instance) {
				instance.setState({textValue:text});
				BDFDB.TimeUtils.timeout(_ => {
					var e = new KeyboardEvent("keypress", {key:"Enter", code:"Enter", which:13, keyCode:13, bubbles:true });
					Object.defineProperty(e, "keyCode", {value:13});
					Object.defineProperty(e, "which", {value:13});
					textarea.dispatchEvent(e);
				});
			}
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.LanguageUtils.getLanguage().id) {
			case "hr":		//croatian
				return {
					toast_allsent_text:					"Sve veliku poslane.",
					modal_messages_warning:				"Nemojte slati previše veliku!",
					modal_header_text:					"Pošalji veliku poruku:"
				};
			case "da":		//danish
				return {
					toast_allsent_text:					"Alle beskeder sendes.",
					modal_messages_warning:				"Send ikke for mange beskeder!",
					modal_header_text:					"Send stor besked:"
				};
			case "de":		//german
				return {
					toast_allsent_text:					"Alle Nachrichten versendet.",
					modal_messages_warning:				"Schicke nicht zu viele Nachrichten!",
					modal_header_text:					"Große Nachricht senden:"
				};
			case "es":		//spanish
				return {
					toast_allsent_text:					"Todos los mensajes enviados.",
					modal_messages_warning:				"¡No envíe demasiados mensajes!",
					modal_header_text:					"Enviar mensaje grande:"
				};
			case "fr":		//french
				return {
					toast_allsent_text:					"Tous les messages envoyés",
					modal_messages_warning:				"N'envoyez pas trop de messages!",
					modal_header_text:					"Envoyer un gros message:"
				};
			case "it":		//italian
				return {
					toast_allsent_text:					"Tutti i messaggi inviati.",
					modal_messages_warning:				"Non inviare troppi messaggi!",
					modal_header_text:					"Invia grande messaggio:"
				};
			case "nl":		//dutch
				return {
					toast_allsent_text:					"Alle berichten verzonden.",
					modal_messages_warning:				"Stuur niet te veel berichten!",
					modal_header_text:					"Stuur een groot bericht:"
				};
			case "no":		//norwegian
				return {
					toast_allsent_text:					"Alle meldinger sendt.",
					modal_messages_warning:				"Ikke send for mange meldinger!",
					modal_header_text:					"Send stor melding:"
				};
			case "pl":		//polish
				return {
					toast_allsent_text:					"Wszystkie wiadomości zostały wysłane.",
					modal_messages_warning:				"Nie wysyłaj zbyt wielu wiadomości!",
					modal_header_text:					"Wyślij dużą wiadomość:"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					toast_allsent_text:					"Todas as mensagens enviadas.",
					modal_messages_warning:				"Não envie muitas mensagens!",
					modal_header_text:					"Enviar mensagem grande:"
				};
			case "fi":		//finnish
				return {
					toast_allsent_text:					"Kaikki lähetetyt viestit.",
					modal_messages_warning:				"Älä lähetä liian monta viestiä!",
					modal_header_text:					"Lähetä suuri viesti:"
				};
			case "sv":		//swedish
				return {
					toast_allsent_text:					"Alla meddelanden skickade.",
					modal_messages_warning:				"Skicka inte för många meddelanden!",
					modal_header_text:					"Skicka stort meddelande:"
				};
			case "tr":		//turkish
				return {
					toast_allsent_text:					"Tüm mesajlar gönderildi.",
					modal_messages_warning:				"Çok fazla mesaj göndermeyin!",
					modal_header_text:					"Büyük mesaj gönder:"
				};
			case "cs":		//czech
				return {
					toast_allsent_text:					"Všechny zprávy byly odeslány.",
					modal_messages_warning:				"Neposílejte příliš mnoho zpráv!",
					modal_header_text:					"Odeslat velkou zprávu:"
				};
			case "bg":		//bulgarian
				return {
					toast_allsent_text:					"Всички изпратени съобщения.",
					modal_messages_warning:				"Не изпращайте твърде много съобщения!",
					modal_header_text:					"Изпратете голямо съобщение:"
				};
			case "ru":		//russian
				return {
					toast_allsent_text:					"Все отправленные сообщения.",
					modal_messages_warning:				"Не отправляйте слишком много сообщений!",
					modal_header_text:					"Отправить сообщение:"
				};
			case "uk":		//ukrainian
				return {
					toast_allsent_text:					"Всі повідомлення надіслано.",
					modal_messages_warning:				"Не надсилайте надто багато повідомлень!",
					modal_header_text:					"Надіслати велике повідомлення:"
				};
			case "ja":		//japanese
				return {
					toast_allsent_text:					"すべてのメッセージが送信されました。",
					modal_messages_warning:				"あまりにも多くのメッセージを送信しないでください！",
					modal_header_text:					"大きなメッセージを送信する："
				};
			case "zh-TW":	//chinese (traditional)
				return {
					toast_allsent_text:					"發送的所有消息。",
					modal_messages_warning:				"不要發送太多信息！",
					modal_header_text:					"發送大信息："
				};
			case "ko":		//korean
				return {
					toast_allsent_text:					"모든 메시지가 전송되었습니다.",
					modal_messages_warning:				"너무 많은 메시지를 보내지 마십시오!",
					modal_header_text:					"큰 메시지 보내기:"
				};
			default:		//default: english
				return {
					toast_allsent_text:					"All messages sent.",
					modal_messages_warning:				"Do not send too many messages!",
					modal_header_text:					"Send large message:"
				};
		}
	}
}
