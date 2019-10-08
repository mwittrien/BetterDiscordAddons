//META{"name":"SendLargeMessages","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SendLargeMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SendLargeMessages/SendLargeMessages.plugin.js"}*//

class SendLargeMessages {
	getName () {return "SendLargeMessages";}

	getVersion () {return "1.5.4";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Opens a popout when your message is too large, which allows you to automatically send the message in several smaller messages.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.labels = {};

		this.patchModules = {
			"ChannelTextArea":"componentDidMount"
		};
	}

	initConstructor () {
		this.messageDelay = 1000; //changing at own risk, might result in bans or mutes

		this.css = `
			.${this.name}-modal textarea {
				rows: 0;
				cols: 0;
				height: 100vw;
				resize: none;
			}
			.${this.name}-modal #warning-message {
				color: red;
			}

			.${this.name}-modal #character-counter {
				float: right;
				color: white;
				opacity: .5;
			}`;

		this.sendMessageModalMarkup =
			`<span class="${this.name}-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizelarge}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<button type="button" class="${BDFDB.disCNS.modalclose + BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">
										<svg name="Close" width="18" height="18" viewBox="0 0 12 12" style="flex: 0 1 auto;">
											<g fill="none" fill-rule="evenodd">
												<path d="M0 0h12v12H0"></path>
												<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
											</g>
										</svg>
									</div>
								</button>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCNS.themeghosthairline + BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCNS.flexchild + BDFDB.disCN.modalsubinner}" style="flex: 1 1 auto;">
								<textarea class="${BDFDB.disCNS.scroller + BDFDB.disCNS.inputdefault + BDFDB.disCN.input}" id="modal-inputtext"></textarea>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCNS.nowrap + BDFDB.disCNS.modalsubinner + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;">
								<h5 id="warning-message" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightbold + BDFDB.disCNS.h5defaultmargin}" style="flex: 1 1 auto;"></h5>
								<h5 id="character-counter" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightmedium + BDFDB.disCNS.h5defaultmargin}" style="flex: 0 0 auto;"></h5>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-send ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;
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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.sendMessageModalMarkup = 		this.sendMessageModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
	}

	processChannelTextArea (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.type && instance.props.type == "normal") {
			var textarea = wrapper.querySelector("textarea");
			if (!textarea) return;
			let modaltext, checkTextarea = () => {
				if (BDFDB.getParsedLength(textarea.value) > 1950) {
					textarea.selectionStart = 0;
					textarea.selectionEnd = textarea.value.length;
					document.execCommand("insertText", false, "");
					this.showSendModal(modaltext);
				}
			};
			BDFDB.addEventListener(this, textarea, "keyup", e => {
				clearTimeout(textarea.sendlargemessagestimeout);
				textarea.sendlargemessagestimeout = setTimeout(() => {
					modaltext = textarea.value;
					checkTextarea();
				},100);
			});
			BDFDB.addEventListener(this, textarea, "paste", e => {
				modaltext = textarea.value.slice(0, textarea.selectionStart) + BDFDB.LibraryRequires.electron.clipboard.readText() + textarea.value.slice(textarea.selectionEnd);
				setImmediate(() => {checkTextarea(textarea);});
			});
		}
	}

	showSendModal (text) {
		let sendMessageModal = BDFDB.htmlToElement(this.sendMessageModalMarkup);
		let textinput = sendMessageModal.querySelector("#modal-inputtext");
		let warning = sendMessageModal.querySelector("#warning-message");
		let counter = sendMessageModal.querySelector("#character-counter");

		let updateCounter = () => {
			let parsedlength = BDFDB.getParsedLength(textinput.value);
			let messageAmount = Math.ceil(parsedlength/1900);
			warning.innerText = messageAmount > 15 ? this.labels.modal_messages_warning : "";
			counter.innerText = parsedlength + " (" + (textinput.selectionEnd - textinput.selectionStart) + ") => " + this.labels.modal_messages_translation + ": " + messageAmount;
		};

		BDFDB.appendModal(sendMessageModal);

		BDFDB.addChildEventListener(sendMessageModal, "click", ".btn-send", e => {
			let messages = this.formatText(textinput.value || "");
			messages.forEach((message,i) => {
				setTimeout(() => {
					this.sendMessage(message);
					if (i >= messages.length-1) BDFDB.showToast(this.labels.toast_allsent_text, {type:"success"});
				},this.messageDelay * i);
			});
		});

		textinput.value = text || "";
		textinput.addEventListener("keyup", () => {setTimeout(() => {updateCounter();},10);});
		textinput.addEventListener("click", () => {updateCounter();});
		textinput.addEventListener("mousedown", () => {
			var mouseup = () => {
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			var mousemove = () => {
				setTimeout(() => {updateCounter();},10);
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		updateCounter();
		textinput.focus();
	}

	formatText (text) {
		text = text.replace(/\t/g, "	");
		let longwords = text.match(/[\S]{1800,}/gm);
		for (let i in longwords) {
			let longword = longwords[i];
			let count1 = 0;
			let shortwords = [];
			longword.split("").forEach((char) => {
				if (shortwords[count1] && BDFDB.getParsedLength(shortwords[count1]) >= 1800) count1++;
				shortwords[count1] = shortwords[count1] ? shortwords[count1] + char : char;
			});
			text = text.replace(longword, shortwords.join(" "));
		}
		let messages = [];
		let count2 = 0;
		text.split(" ").forEach((word) => {
			if (messages[count2] && BDFDB.getParsedLength(messages[count2] + "" + word) > 1900) count2++;
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
			let instance = BDFDB.getOwnerInstance({"node":BDFDB.getParentEle(BDFDB.dotCNS.chat + "form", textarea), "name":"ChannelTextAreaForm", "up":true});
			if (instance) {
				instance.setState({textValue:text});
				BDFDB.triggerSend(textarea);
			}
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					toast_allsent_text:					"Sve veliku poslane.",
					modal_messages_translation:			"Vijesti",
					modal_messages_warning:				"Nemojte slati previše veliku!",
					modal_header_text:				 	"Pošalji veliku poruku:"
				};
			case "da":		//danish
				return {
					toast_allsent_text:					"Alle beskeder sendes.",
					modal_messages_translation:			"Beskeder",
					modal_messages_warning:				"Send ikke for mange beskeder!",
					modal_header_text:				 	"Send stor besked:"
				};
			case "de":		//german
				return {
					toast_allsent_text:					"Alle Nachrichten versendet.",
					modal_messages_translation:			"Nachrichten",
					modal_messages_warning:				"Schicke nicht zu viele Nachrichten!",
					modal_header_text:				 	"Große Nachricht senden:"
				};
			case "es":		//spanish
				return {
					toast_allsent_text:					"Todos los mensajes enviados.",
					modal_messages_translation:			"Mensajes",
					modal_messages_warning:				"¡No envíe demasiados mensajes!",
					modal_header_text:				 	"Enviar mensaje grande:"
				};
			case "fr":		//french
				return {
					toast_allsent_text:					"Tous les messages envoyés",
					modal_messages_translation:			"Messages",
					modal_messages_warning:				"N'envoyez pas trop de messages!",
					modal_header_text:				 	"Envoyer un gros message:"
				};
			case "it":		//italian
				return {
					toast_allsent_text:					"Tutti i messaggi inviati.",
					modal_messages_translation:			"Messaggi",
					modal_messages_warning:				"Non inviare troppi messaggi!",
					modal_header_text:				 	"Invia grande messaggio:"
				};
			case "nl":		//dutch
				return {
					toast_allsent_text:					"Alle berichten verzonden.",
					modal_messages_translation:			"Berichten",
					modal_messages_warning:				"Stuur niet te veel berichten!",
					modal_header_text:				 	"Stuur een groot bericht:"
				};
			case "no":		//norwegian
				return {
					toast_allsent_text:					"Alle meldinger sendt.",
					modal_messages_translation:			"Meldinger",
					modal_messages_warning:				"Ikke send for mange meldinger!",
					modal_header_text:				 	"Send stor melding:"
				};
			case "pl":		//polish
				return {
					toast_allsent_text:					"Wszystkie wiadomości zostały wysłane.",
					modal_messages_translation:			"Wiadomości",
					modal_messages_warning:				"Nie wysyłaj zbyt wielu wiadomości!",
					modal_header_text:					"Wyślij dużą wiadomość:"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					toast_allsent_text:					"Todas as mensagens enviadas.",
					modal_messages_translation:			"Mensagens",
					modal_messages_warning:				"Não envie muitas mensagens!",
					modal_header_text:				 	"Enviar mensagem grande:"
				};
			case "fi":		//finnish
				return {
					toast_allsent_text:					"Kaikki lähetetyt viestit.",
					modal_messages_translation:			"Viestien",
					modal_messages_warning:				"Älä lähetä liian monta viestiä!",
					modal_header_text:				 	"Lähetä suuri viesti:"
				};
			case "sv":		//swedish
				return {
					toast_allsent_text:					"Alla meddelanden skickade.",
					modal_messages_translation:			"Meddelanden",
					modal_messages_warning:				"Skicka inte för många meddelanden!",
					modal_header_text:				 	"Skicka stort meddelande:"
				};
			case "tr":		//turkish
				return {
					toast_allsent_text:					"Tüm mesajlar gönderildi.",
					modal_messages_translation:			"Mesajları",
					modal_messages_warning:				"Çok fazla mesaj göndermeyin!",
					modal_header_text:				 	"Büyük mesaj gönder:"
				};
			case "cs":		//czech
				return {
					toast_allsent_text:					"Všechny zprávy byly odeslány.",
					modal_messages_translation:			"Zpráv",
					modal_messages_warning:				"Neposílejte příliš mnoho zpráv!",
					modal_header_text:				 	"Odeslat velkou zprávu:"
				};
			case "bg":		//bulgarian
				return {
					toast_allsent_text:					"Всички изпратени съобщения.",
					modal_messages_translation:			"Съобщения",
					modal_messages_warning:				"Не изпращайте твърде много съобщения!",
					modal_header_text:				 	"Изпратете голямо съобщение:"
				};
			case "ru":		//russian
				return {
					toast_allsent_text:					"Все отправленные сообщения.",
					modal_messages_translation:			"Сообщения",
					modal_messages_warning:				"Не отправляйте слишком много сообщений!",
					modal_header_text:				 	"Отправить сообщение:"
				};
			case "uk":		//ukrainian
				return {
					toast_allsent_text:					"Всі повідомлення надіслано.",
					modal_messages_translation:			"Повідомлення",
					modal_messages_warning:				"Не надсилайте надто багато повідомлень!",
					modal_header_text:				 	"Надіслати велике повідомлення:"
				};
			case "ja":		//japanese
				return {
					toast_allsent_text:					"すべてのメッセージが送信されました。",
					modal_messages_translation:			"メッセージ",
					modal_messages_warning:				"あまりにも多くのメッセージを送信しないでください！",
					modal_header_text:				 	"大きなメッセージを送信する："
				};
			case "zh-TW":	//chinese (traditional)
				return {
					toast_allsent_text:					"發送的所有消息。",
					modal_messages_translation:			"消息",
					modal_messages_warning:				"不要發送太多信息！",
					modal_header_text:				 	"發送大信息："
				};
			case "ko":		//korean
				return {
					toast_allsent_text:					"모든 메시지가 전송되었습니다.",
					modal_messages_translation:			"메시지",
					modal_messages_warning:				"너무 많은 메시지를 보내지 마십시오!",
					modal_header_text:				 	"큰 메시지 보내기:"
				};
			default:		//default: english
				return {
					toast_allsent_text:					"All messages sent.",
					modal_messages_translation:			"Messages",
					modal_messages_warning:				"Do not send too many messages!",
					modal_header_text:		 			"Send large message:"
				};
		}
	}
}
