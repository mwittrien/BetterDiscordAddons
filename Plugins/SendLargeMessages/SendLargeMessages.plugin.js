//META{"name":"SendLargeMessages","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SendLargeMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SendLargeMessages/SendLargeMessages.plugin.js"}*//

class SendLargeMessages {
	getName () {return "SendLargeMessages";}

	getVersion () {return "1.5.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Opens a popout when your message is too large, which allows you to automatically send the message in several smaller messages.";}

	constructor () {
		this.changelog = {
			"fixed":[["Switching","Plugin acting weird after switching channels"],["New WYSIWYG Textarea","Fixed for the new WYSIWYG Textarea that is hidden by experiments"]],
			"improved":[["Sending Messages","The plugin no longer needs the modal to send multiple messages, you can just write larger messages in the channel textarea and it will automatically split it up before sending it"]]
		};

		this.patchedModules = {
			before: {
				ChannelTextArea: "render"
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
		if (e.instance.props && e.instance.props.type && e.instance.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL) {
			e.instance.props.shouldUploadLongMessages = false;
			if (!BDFDB.ModuleUtils.isPatched(this, e.instance.props, "onSubmit")) BDFDB.ModuleUtils.patch(this, e.instance.props, "onSubmit", {instead: e2 => {
				let parsedLength = BDFDB.StringUtils.getParsedLength(e2.methodArguments[0]);
				if (parsedLength > 2000) {
					e2.stopOriginalMethodCall();
					let messages = this.formatText(e2.methodArguments[0], Math.sqrt(Math.pow(parsedLength - e2.methodArguments[0].length, 2)) > Math.max(parsedLength, e2.methodArguments[0].length) / 20);
					messages.filter(n => n).forEach((message, i) => {
						BDFDB.TimeUtils.timeout(_ => {
							e2.originalMethod(message);
							if (i >= messages.length-1) BDFDB.NotificationUtils.toast(this.labels.toast_allsent_text, {type:"success"});
						}, this.messageDelay * i);
					});
				}
				else e2.callOriginalMethodAfterwards();
			}}, true);
		}
	}

	formatText (text, parse) {
		text = text.replace(/\t/g, "	");
		let longwords = text.match(/[\S]{1800,}/gm);
		if (longwords) for (let longword of longwords) {
			let count1 = 0;
			let shortwords = [];
			longword.split("").forEach(c => {
				if (shortwords[count1] && shortwords[count1].length >= 1800) count1++;
				shortwords[count1] = shortwords[count1] ? shortwords[count1] + c : c;
			});
			text = text.replace(longword, shortwords.join(" "));
		}
		let messages = [];
		let count2 = 0;
		text.split(" ").forEach((word) => {
			if (messages[count2] && (parse ? BDFDB.StringUtils.getParsedLength(messages[count2] + "" + word) : (messages[count2] + "" + word).length) > 1900) count2++;
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
