//META{"name":"SendLargeMessages"}*//

class SendLargeMessages {
	constructor () {
		
		this.labels = {};
		
		this.switchFixObserver = new MutationObserver(() => {});
		
		this.css = `			
			.sendlargemessages-modal .modal {
				align-content: space-around;
				align-items: center;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-height: initial;
				max-height: initial;
				opacity: 0;
				pointer-events: none;
				user-select: none;
				height: 100%;
				width: 100%;
				margin: 0;
				padding: 0;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				z-index: 1000;
			}
			
			.sendlargemessages-modal .form {
				width: 100%;
			}

			.sendlargemessages-modal .form-header, .sendlargemessages-modal .form-actions {
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				padding: 20px;
				
			}

			.sendlargemessages-modal .form-header {
				color: #f6f6f7;
				cursor: default;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .3px;
				line-height: 20px;
				text-transform: uppercase;
			}

			.sendlargemessages-modal .form-actions {
				display: flex;
				flex-direction: row-reverse;
				flex-wrap: nowrap;
				flex: 0 0 auto;
				padding-right: 32px;
			}

			.sendlargemessages-modal .form-inner{
				margin: 10px 0;
				overflow-x: hidden;
				overflow-y: hidden;
				padding: 0 20px;
				height: 450px;
				
			}

			.sendlargemessages-modal .modal-inner {
				background-color: #36393E;
				border-radius: 5px;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
				display: flex;
				min-height: 200px;
				pointer-events: auto;
				width: 700px;
			}

			.sendlargemessages-modal textarea {
				color: #f6f6f7;
				background-color: rgba(0,0,0,.1);
				border-color: rgba(0,0,0,.3);
				padding: 10px;
				box-sizing: border-box;
				font-size: 0.9375rem;
				font-weight: 400;
				letter-spacing: -0.025rem;
				line-height: 1.25rem;
				rows: 0;
				cols: 0;
				height: 410px;
				width: 100%;
				border-width: 1px;
				border-style: solid;
				border-radius: 5px;
				overflow: scroll;
				resize: none;
				-webkit-rtl-ordering: logical;
				user-select: text;
				flex-direction: column;
				white-space: pre-wrap;
				word-wrap: break-word;
			}
			
			.sendlargemessages-modal textarea::-webkit-scrollbar {
				height: 12px;
				width: 12px;
			}

			.sendlargemessages-modal textarea::-webkit-scrollbar-thumb {
				background-color: #1e2124;
				border-radius: 7px;
			}

			.sendlargemessages-modal textarea::-webkit-scrollbar-track-piece {
				background-color: #2f3136;
				border-radius: 7px;
			}

			.sendlargemessages-modal textarea::-webkit-scrollbar-corner {
				background-color: #2f3136;
			}

			.sendlargemessages-modal .btn {
				align-items: center;
				background: none;
				border-radius: 3px;
				border: none;
				box-sizing: border-box;
				display: flex;
				font-size: 14px;
				font-weight: 500;
				justify-content: center;
				line-height: 16px;
				min-height: 38px;
				min-width: 96px;
				padding: 2px 16px;
				position: relative;
			}

			.sendlargemessages-modal .btn-cancel {
				background-color: #2f3136;
				color: #fff;
			}

			.sendlargemessages-modal .btn-send {
				background-color: #3A71C1;
				color: #fff;
			}

			.sendlargemessages-modal .control-group {
				margin-top: 10px;
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
			`<span class="sendlargemessages-modal">
				<div class="backdrop-2ohBEd callout-backdrop" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<div class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-inner">
								<div class="control-group">
									<textarea id="modal-inputtext" name="inputtext"></textarea>
									<div class="info">
										<div id="character-counter"></div>
										<div id="warning-message"></div>
									</div>
								</div>
							</div>
							<div class="form-actions">
								<button type="button" class="btn btn-cancel">REPLACE_btn_cancel_text</button>
								<button type="button" class="btn btn-send">REPLACE_btn_send_text</button>
							</div>
						</form>
					</div>
				</div>
			</span>`;
	}

	getName () {return "SendLargeMessages";}

	getDescription () {return "Opens a popout when your message is too large, which allows you to automatically send the message in several smaller messages.";}

	getVersion () {return "1.1.4";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);	
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.bindEventToTextArea();
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			$(".channelTextArea-1HTP3C").find("textarea").off("input." + this.getName()).off("paste." + this.getName());
			$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
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
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	bindEventToTextArea () {
		$(".channelTextArea-1HTP3C").find("textarea")
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
		var textinput = sendMessageModal.find("#modal-inputtext")[0];
		sendMessageModal.appendTo($(".platform-win > div").last())
			.on("click", ".callout-backdrop,button.btn-cancel", (e) => {
				$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
				sendMessageModal.remove();
			})
			.on("click", "button.btn-send", (e) => {
				if (!textinput.value.match(/[\S]{1900,}/gm) && (!textinput.value.match(/`{3,}/gm) || textinput.value.match(/`{3,}/gm).length % 2 == 0)) {
					e.preventDefault();
					sendMessageModal.remove();
					$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
					this.formatText(textinput.value).forEach((message,i) => {
						setTimeout(() => {
							this.sendMessage(message);
						},i*1000);
					});
				}
			});
			
		textinput.value = text;
		$(textinput)
			.off("keydown." + this.getName() + " click." + this.getName())
			.on("keydown." + this.getName() + " click." + this.getName(), e => {
				setTimeout(() => {
					this.updateCounter(sendMessageModal);
				},10);
			})
			.off("mousedown." + this.getName())
			.on("mousedown." + this.getName(), e => {
				this.selecting = true;
			});
		$(document)
			.off("mouseup." + this.getName())
			.on("mouseup." + this.getName(), e => {
				if (this.selecting) {
					this.selecting = false;
				}
			})
			.off("mousemove." + this.getName())
			.on("mousemove." + this.getName(), e => {
				if (this.selecting) {
					setTimeout(() => {
						this.updateCounter(sendMessageModal);
					},10);
				}
			});
		this.updateCounter(sendMessageModal);
		
		textinput.focus();
	}
	
	updateCounter (modal) {
		var warning = modal.find("#warning-message");
		var counter = modal.find("#character-counter");
		var textinput = modal.find("#modal-inputtext")[0];
		var messageAmmount = Math.ceil(textinput.value.length/1900);
		warning.text(messageAmmount > 15 ? this.labels.modal_messages_warning : "");
		counter.text(textinput.value.length + " (" + (textinput.selectionEnd - textinput.selectionStart) + ") => " + this.labels.modal_messages_translation + ": " +  messageAmmount);
	}
	
	formatText (text) {
		var messages = [];
		var count = 0;
		text.split(" ").forEach((word) => {
			if (messages[count] && (messages[count].length + word.length) > 1900) count++;
			messages[count] = messages[count] ? messages[count] + " " + word : word;
		});
		
		var insertCodeBlock = null;
		for (var i = 0; i < messages.length; i++) {
			if (insertCodeBlock) {
				messages[i] = insertCodeBlock + messages[i];
				insertCodeBlock = null;
			}
			var codeBlocks = messages[i].match(/`{3,}[\S]*\n|`{3,}/gm);
			if (codeBlocks && codeBlocks.length % 2 == 1) {
				messages[i] = messages[i] + "```";
				insertCodeBlock = codeBlocks[codeBlocks.length-1] + "\n";
			}
		}
		
		return messages;
	}
	
	sendMessage (text) {
		var textarea = document.querySelector(".channelTextArea-1HTP3C");
		if (textarea) {
			var textinput = textarea.querySelector("textarea");
			if (textinput) {
				textinput.focus();
				textinput.selectionStart = 0;
				textinput.selectionEnd = textinput.value.length;
				document.execCommand("insertText", false, text);
				var options = { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true };
				var down = new KeyboardEvent("keydown", options);
				Object.defineProperty(down, "keyCode", {value: 13});
				Object.defineProperty(down, "which", {value: 13});
				var press = new KeyboardEvent("keypress", options);
				Object.defineProperty(press, "keyCode", {value: 13});
				Object.defineProperty(press, "which", {value: 13});
				textinput.dispatchEvent(down);
				textinput.dispatchEvent(press);
			}
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					modal_messages_translation:			"Beskeder",
					modal_messages_warning:				"Send ikke for mange beskeder!",
					modal_header_text:				 	"Send stor besked:",
					btn_cancel_text: 					"Afbryde",
					btn_send_text: 						"Sende"
				};
			case "de": 	//german
				return {
					modal_messages_translation:			"Nachrichten",
					modal_messages_warning:				"Schicke nicht zu viele Nachrichten!",
					modal_header_text:				 	"Große Nachricht senden:",
					btn_cancel_text: 					"Abbrechen",
					btn_send_text: 						"Senden"
				};
			case "es": 	//spanish
				return {
					modal_messages_translation:			"Mensajes",
					modal_messages_warning:				"¡No envíe demasiados mensajes!",
					modal_header_text:				 	"Enviar mensaje grande:",
					btn_cancel_text: 					"Cancelar",
					btn_send_text: 						"Enviar"
				};
			case "fr": 	//french
				return {
					modal_messages_translation:			"Messages",
					modal_messages_warning:				"N'envoyez pas trop de messages!",
					modal_header_text:				 	"Envoyer un gros message:",
					btn_cancel_text: 					"Abandonner",
					btn_send_text: 						"Envoyer"
				};
			case "it": 	//italian
				return {
					modal_messages_translation:			"Messaggi",
					modal_messages_warning:				"Non inviare troppi messaggi!",
					modal_header_text:				 	"Invia grande messaggio:",
					btn_cancel_text: 					"Cancellare",
					btn_send_text: 						"Inviare"
				};
			case "nl": 	//dutch
				return {
					modal_messages_translation:			"Berichten",
					modal_messages_warning:				"Stuur niet te veel berichten!",
					modal_header_text:				 	"Stuur een groot bericht:",
					btn_cancel_text: 					"Afbreken",
					btn_send_text: 						"Sturen"
				};
			case "no": 	//norwegian
				return {
					modal_messages_translation:			"Meldinger",
					modal_messages_warning:				"Ikke send for mange meldinger!",
					modal_header_text:				 	"Send stor melding:",
					btn_cancel_text: 					"Avbryte",
					btn_send_text: 						"Sende"
				};
			case "pl": 	//polish
				return {
					modal_messages_translation:			"Wiadomości",
					modal_messages_warning:				"Nie wysyłaj zbyt wielu wiadomości!",
					modal_header_text:				 	"Wyślij dużą wiadomość:",
					btn_cancel_text: 					"Anuluj",
					btn_send_text: 						"Wysłać"
				};
			case "pt": 	//portuguese (brazil)
				return {
					modal_messages_translation:			"Mensagens",
					modal_messages_warning:				"Não envie muitas mensagens!",
					modal_header_text:				 	"Enviar mensagem grande:",
					btn_cancel_text: 					"Cancelar",
					btn_send_text: 						"Enviar"
				};
			case "fi": 	//finnish
				return {
					modal_messages_translation:			"Viestien",
					modal_messages_warning:				"Älä lähetä liian monta viestiä!",
					modal_header_text:				 	"Lähetä suuri viesti:",
					btn_cancel_text: 					"Peruuttaa",
					btn_send_text: 						"Lähettää"
				};
			case "sv": 	//swedish
				return {
					modal_messages_translation:			"Meddelanden",
					modal_messages_warning:				"Skicka inte för många meddelanden!",
					modal_header_text:				 	"Skicka stort meddelande:",
					btn_cancel_text: 					"Avbryta",
					btn_send_text: 						"Skicka"
				};
			case "tr": 	//turkish
				return {
					modal_messages_translation:			"Mesajları",
					modal_messages_warning:				"Çok fazla mesaj göndermeyin!",
					modal_header_text:				 	"Büyük mesaj gönder:",
					btn_cancel_text: 					"Iptal",
					btn_send_text: 						"Göndermek"
				};
			case "cs": 	//czech
				return {
					modal_messages_translation:			"Zpráv",
					modal_messages_warning:				"Neposílejte příliš mnoho zpráv!",
					modal_header_text:				 	"Odeslat velkou zprávu:",
					btn_cancel_text: 					"Zrušení",
					btn_send_text: 						"Poslat"
				};
			case "bg": 	//bulgarian
				return {
					modal_messages_translation:			"Съобщения",
					modal_messages_warning:				"Не изпращайте твърде много съобщения!",
					modal_header_text:				 	"Изпратете голямо съобщение:",
					btn_cancel_text: 					"Зъбести",
					btn_send_text: 						"изпращам"
				};
			case "ru": 	//russian
				return {
					modal_messages_translation:			"Сообщения",
					modal_messages_warning:				"Не отправляйте слишком много сообщений!",
					modal_header_text:				 	"Отправить сообщение:",
					btn_cancel_text: 					"Отмена",
					btn_send_text: 						"Послать"
				};
			case "uk": 	//ukranian
				return {
					modal_messages_translation:			"Повідомлення",
					modal_messages_warning:				"Не надсилайте надто багато повідомлень!",
					modal_header_text:				 	"Надіслати велике повідомлення:",
					btn_cancel_text: 					"Скасувати",
					btn_send_text: 						"Відправити"
				};
			case "ja": 	//japanese
				return {
					modal_messages_translation:			"メッセージ",
					modal_messages_warning:				"あまりにも多くのメッセージを送信しないでください！",
					modal_header_text:				 	"大きなメッセージを送信する：",
					btn_cancel_text: 					"キャンセル",
					btn_send_text: 						"送信"
				};
			case "zh": 	//chinese (traditional)
				return {
					modal_messages_translation:			"消息",
					modal_messages_warning:				"不要發送太多信息！",
					modal_header_text:				 	"發送大信息：",
					btn_cancel_text: 					"取消",
					btn_send_text: 						"發送"
				};
			case "ko": 	//korean
				return {
					modal_messages_translation:			"메시지",
					modal_messages_warning:				"너무 많은 메시지를 보내지 마십시오!",
					modal_header_text:				 	"큰 메시지 보내기:",
					btn_cancel_text: 					"취소",
					btn_send_text: 						"보내다"
				};
			default: 	//default: english
				return {
					modal_messages_translation:			"Messages",
					modal_messages_warning:				"Do not send too many messages!",
					modal_header_text:		 			"Send large message:",
					btn_cancel_text: 					"Cancel",
					btn_send_text: 						"Send"
				};
		}
	}
}
