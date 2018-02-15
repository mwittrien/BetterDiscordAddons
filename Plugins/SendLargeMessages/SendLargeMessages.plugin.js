//META{"name":"SendLargeMessages"}*//

class SendLargeMessages {
	constructor () {
		this.labels = {};
		
		this.messageDelay = 1000; //changing at own risk, might result in bans or mutes
		
		this.css = `
			.sendlargemessages-modal textarea {
				rows: 0;
				cols: 0;
				height: 100vw;
				resize: none;
			}
			.sendlargemessages-modal #warning-message {
				font-weight: bold;
				color: red;
				opacity: 1;
			}
			
			.sendlargemessages-modal #character-counter {
				float: right;
				color: white;
				opacity: .5;
			}`;

		this.sendMessageModalMarkup =
			`<span class="sendlargemessages-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeLarge-1AHXtx">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">REPLACE_modal_header_text</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q inner-tqJwAU" style="flex: 1 1 auto;">
								<textarea class="scroller-fzNley inputDefault-Y_U37D input-2YozMi" id="modal-inputtext"></textarea>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 noWrap-v6g9vO inner-tqJwAU marginBottom8-1mABJ4" style="flex: 0 0 auto;">
								<h5 id="warning-message" class="flexChild-1KGW5q h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY" style="flex: 1 1 auto;"></h5>
								<h5 id="character-counter" class="flexChild-1KGW5q h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY" style="flex: 0 0 auto;"></h5>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-send buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
									<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx">REPLACE_btn_send_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;
	}

	getName () {return "SendLargeMessages";}

	getDescription () {return "Opens a popout when your message is too large, which allows you to automatically send the message in several smaller messages.";}

	getVersion () {return "1.4.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.bindEventToTextArea();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			$(".channelTextArea-1HTP3C textarea").off("input." + this.getName()).off("paste." + this.getName());
			$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.bindEventToTextArea();
		}
	}

	
	// begin of own functions

	changeLanguageStrings () {
		this.sendMessageModalMarkup = 		this.sendMessageModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.sendMessageModalMarkup = 		this.sendMessageModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.sendMessageModalMarkup = 		this.sendMessageModalMarkup.replace("REPLACE_btn_send_text", this.labels.btn_send_text);
	}
	
	bindEventToTextArea () {
		$(".channelTextArea-1HTP3C textarea")
			.off("input." + this.getName())
			.on("input." + this.getName(), e => {
				var text = e.target.value;
				if (text.length > 1950) {
					e.target.selectionStart = 0;
					e.target.selectionEnd = e.target.value.length;
					document.execCommand("insertText", false, "");
					this.showSendModal(text);
				}
			})
			.off("paste." + this.getName())
			.on("paste." + this.getName(), e => {
				e = e.originalEvent ? e.originalEvent : e;
				var clipboardData = e.clipboardData;
				if (!clipboardData) return;
				var pastedData = clipboardData.getData('Text');
				var text = e.target.value;
				if (text.length > 1950) {
					e.target.selectionStart = 0;
					e.target.selectionEnd = e.target.value.length;
					document.execCommand("insertText", false, "");
					this.showSendModal(text);
				}
			});
	}
	
	showSendModal (text) {
		var sendMessageModal = $(this.sendMessageModalMarkup);
		var textinput = sendMessageModal.find("#modal-inputtext");
		BDfunctionsDevilBro.appendModal(sendMessageModal);
		sendMessageModal
			.on("click", "button.btn-send", (e) => {
				e.preventDefault();
				var messages = this.formatText(textinput.val());
				messages.forEach((message,i) => {
					setTimeout(() => {
						this.sendMessage(message);
						if (i == messages.length-1) BDfunctionsDevilBro.showToast(this.labels.toast_allsent_text, {type:"success"});
					},this.messageDelay * i);
				});
			});
			
		textinput
			.val(text)
			.focus()
			.off("keydown." + this.getName() + " click." + this.getName())
			.on("keydown." + this.getName() + " click." + this.getName(), () => {
				setTimeout(() => {
					this.updateCounter(sendMessageModal);
				},10);
			})
			.off("mousedown." + this.getName())
			.on("mousedown." + this.getName(), () => {
				$(document)
					.off("mouseup." + this.getName())
					.on("mouseup." + this.getName(), () => {
						$(document)
							.off("mouseup." + this.getName())
							.off("mousemove." + this.getName());
					})
					.off("mousemove." + this.getName())
					.on("mousemove." + this.getName(), () => {
						setTimeout(() => {
							this.updateCounter(sendMessageModal);
						},10);
					});
			});
		this.updateCounter(sendMessageModal);
	}
	
	updateCounter (modal) {
		var warning = modal.find("#warning-message");
		var counter = modal.find("#character-counter");
		var textinput = modal.find("#modal-inputtext")[0];
		var messageAmmount = Math.ceil(textinput.value.length/1900);
		warning.text(messageAmmount > 15 ? this.labels.modal_messages_warning : "");
		counter.text(textinput.value.length + " (" + (textinput.selectionEnd - textinput.selectionStart) + ") => " + this.labels.modal_messages_translation + ": " + messageAmmount);
	}
	
	formatText (text) {
		text = text.replace(new RegExp("\t", 'g'), "	");
		var longwords = text.match(/[\S]{1800,}/gm);
		for (var i in longwords) {
			let longword = longwords[i];
			let count1 = 0;
			let shortwords = [];
			longword.split("").forEach((char) => {
				if (shortwords[count1] && shortwords[count1].length >= 1800) count1++;
				shortwords[count1] = shortwords[count1] ? shortwords[count1] + char : char;
			});
			text = text.replace(longword, shortwords.join(" "));
		}
		var messages = [];
		var count2 = 0;
		text.split(" ").forEach((word) => {
			if (messages[count2] && (messages[count2].length + word.length) > 1900) count2++;
			messages[count2] = messages[count2] ? messages[count2] + " " + word : word;
		});
		
		var insertCodeBlock = null, insertCodeLine = null;
		for (var j = 0; j < messages.length; j++) {
			if (insertCodeBlock) {
				messages[j] = insertCodeBlock + messages[j];
				insertCodeBlock = null;
			}
			else if (insertCodeLine) {
				messages[j] = insertCodeLine + messages[j];
				insertCodeLine = null;
			}
			
			var codeBlocks = messages[j].match(/`{3,}[\S]*\n|`{3,}/gm);
			var codeLines = messages[j].match(/[^`]{0,1}`{1,2}[^`]|[^`]`{1,2}[^`]{0,1}/gm);
			
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
		var textarea = document.querySelector(".channelTextArea-1HTP3C textarea");
		if (textarea) {
			BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "name":"ChannelTextAreaForm", "up":true}).setState({textValue:text});
			BDfunctionsDevilBro.triggerSend(textarea);
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					toast_allsent_text:					"Sve veliku poslane.",
					modal_messages_translation:			"Vijesti",
					modal_messages_warning:				"Nemojte slati previše veliku!",
					modal_header_text:				 	"Pošalji veliku poruku:",
					btn_cancel_text:					"Prekid",
					btn_send_text:						"Poslati"
				};
			case "da":		//danish
				return {
					toast_allsent_text:					"Alle beskeder sendes.",
					modal_messages_translation:			"Beskeder",
					modal_messages_warning:				"Send ikke for mange beskeder!",
					modal_header_text:				 	"Send stor besked:",
					btn_cancel_text:					"Afbryde",
					btn_send_text:						"Sende"
				};
			case "de":		//german
				return {
					toast_allsent_text:					"Alle Nachrichten versendet.",
					modal_messages_translation:			"Nachrichten",
					modal_messages_warning:				"Schicke nicht zu viele Nachrichten!",
					modal_header_text:				 	"Große Nachricht senden:",
					btn_cancel_text:					"Abbrechen",
					btn_send_text:						"Senden"
				};
			case "es":		//spanish
				return {
					toast_allsent_text:					"Todos los mensajes enviados.",
					modal_messages_translation:			"Mensajes",
					modal_messages_warning:				"¡No envíe demasiados mensajes!",
					modal_header_text:				 	"Enviar mensaje grande:",
					btn_cancel_text:					"Cancelar",
					btn_send_text:						"Enviar"
				};
			case "fr":		//french
				return {
					toast_allsent_text:					"Tous les messages envoyés",
					modal_messages_translation:			"Messages",
					modal_messages_warning:				"N'envoyez pas trop de messages!",
					modal_header_text:				 	"Envoyer un gros message:",
					btn_cancel_text:					"Abandonner",
					btn_send_text:						"Envoyer"
				};
			case "it":		//italian
				return {
					toast_allsent_text:					"Tutti i messaggi inviati.",
					modal_messages_translation:			"Messaggi",
					modal_messages_warning:				"Non inviare troppi messaggi!",
					modal_header_text:				 	"Invia grande messaggio:",
					btn_cancel_text:					"Cancellare",
					btn_send_text:						"Inviare"
				};
			case "nl":		//dutch
				return {
					toast_allsent_text:					"Alle berichten verzonden.",
					modal_messages_translation:			"Berichten",
					modal_messages_warning:				"Stuur niet te veel berichten!",
					modal_header_text:				 	"Stuur een groot bericht:",
					btn_cancel_text:					"Afbreken",
					btn_send_text:						"Sturen"
				};
			case "no":		//norwegian
				return {
					toast_allsent_text:					"Alle meldinger sendt.",
					modal_messages_translation:			"Meldinger",
					modal_messages_warning:				"Ikke send for mange meldinger!",
					modal_header_text:				 	"Send stor melding:",
					btn_cancel_text:					"Avbryte",
					btn_send_text:						"Sende"
				};
			case "pl":		//polish
				return {
					toast_allsent_text:					"Wszystkie wiadomości zostały wysłane.",
					modal_messages_translation:			"Wiadomości",
					modal_messages_warning:				"Nie wysyłaj zbyt wielu wiadomości!",
					modal_header_text:					"Wyślij dużą wiadomość:",
					btn_cancel_text:					"Anuluj",
					btn_send_text:						"Wyślij"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					toast_allsent_text:					"Todas as mensagens enviadas.",
					modal_messages_translation:			"Mensagens",
					modal_messages_warning:				"Não envie muitas mensagens!",
					modal_header_text:				 	"Enviar mensagem grande:",
					btn_cancel_text:					"Cancelar",
					btn_send_text:						"Enviar"
				};
			case "fi":		//finnish
				return {
					toast_allsent_text:					"Kaikki lähetetyt viestit.",
					modal_messages_translation:			"Viestien",
					modal_messages_warning:				"Älä lähetä liian monta viestiä!",
					modal_header_text:				 	"Lähetä suuri viesti:",
					btn_cancel_text:					"Peruuttaa",
					btn_send_text:						"Lähettää"
				};
			case "sv":		//swedish
				return {
					toast_allsent_text:					"Alla meddelanden skickade.",
					modal_messages_translation:			"Meddelanden",
					modal_messages_warning:				"Skicka inte för många meddelanden!",
					modal_header_text:				 	"Skicka stort meddelande:",
					btn_cancel_text:					"Avbryta",
					btn_send_text:						"Skicka"
				};
			case "tr":		//turkish
				return {
					toast_allsent_text:					"Tüm mesajlar gönderildi.",
					modal_messages_translation:			"Mesajları",
					modal_messages_warning:				"Çok fazla mesaj göndermeyin!",
					modal_header_text:				 	"Büyük mesaj gönder:",
					btn_cancel_text:					"Iptal",
					btn_send_text:						"Göndermek"
				};
			case "cs":		//czech
				return {
					toast_allsent_text:					"Všechny zprávy byly odeslány.",
					modal_messages_translation:			"Zpráv",
					modal_messages_warning:				"Neposílejte příliš mnoho zpráv!",
					modal_header_text:				 	"Odeslat velkou zprávu:",
					btn_cancel_text:					"Zrušení",
					btn_send_text:						"Poslat"
				};
			case "bg":		//bulgarian
				return {
					toast_allsent_text:					"Всички изпратени съобщения.",
					modal_messages_translation:			"Съобщения",
					modal_messages_warning:				"Не изпращайте твърде много съобщения!",
					modal_header_text:				 	"Изпратете голямо съобщение:",
					btn_cancel_text:					"Зъбести",
					btn_send_text:						"изпращам"
				};
			case "ru":		//russian
				return {
					toast_allsent_text:					"Все отправленные сообщения.",
					modal_messages_translation:			"Сообщения",
					modal_messages_warning:				"Не отправляйте слишком много сообщений!",
					modal_header_text:				 	"Отправить сообщение:",
					btn_cancel_text:					"Отмена",
					btn_send_text:						"Послать"
				};
			case "uk":		//ukrainian
				return {
					toast_allsent_text:					"Всі повідомлення надіслано.",
					modal_messages_translation:			"Повідомлення",
					modal_messages_warning:				"Не надсилайте надто багато повідомлень!",
					modal_header_text:				 	"Надіслати велике повідомлення:",
					btn_cancel_text:					"Скасувати",
					btn_send_text:						"Відправити"
				};
			case "ja":		//japanese
				return {
					toast_allsent_text:					"すべてのメッセージが送信されました。",
					modal_messages_translation:			"メッセージ",
					modal_messages_warning:				"あまりにも多くのメッセージを送信しないでください！",
					modal_header_text:				 	"大きなメッセージを送信する：",
					btn_cancel_text:					"キャンセル",
					btn_send_text:						"送信"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					toast_allsent_text:					"發送的所有消息。",
					modal_messages_translation:			"消息",
					modal_messages_warning:				"不要發送太多信息！",
					modal_header_text:				 	"發送大信息：",
					btn_cancel_text:					"取消",
					btn_send_text:						"發送"
				};
			case "ko":		//korean
				return {
					toast_allsent_text:					"모든 메시지가 전송되었습니다.",
					modal_messages_translation:			"메시지",
					modal_messages_warning:				"너무 많은 메시지를 보내지 마십시오!",
					modal_header_text:				 	"큰 메시지 보내기:",
					btn_cancel_text:					"취소",
					btn_send_text:						"보내다"
				};
			default:		//default: english
				return {
					toast_allsent_text:					"All messages sent.",
					modal_messages_translation:			"Messages",
					modal_messages_warning:				"Do not send too many messages!",
					modal_header_text:		 			"Send large message:",
					btn_cancel_text:					"Cancel",
					btn_send_text:						"Send"
				};
		}
	}
}
