//META{"name":"SendLargeMessages","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SendLargeMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SendLargeMessages/SendLargeMessages.plugin.js"}*//

var SendLargeMessages = (_ => {
	var messageDelay = 1000; //changing at own risk, might result in bans or mutes
	
	return class SendLargeMessages {
		getName () {return "SendLargeMessages";}

		getVersion () {return "1.6.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Opens a popout when your message is too large, which allows you to automatically send the message in several smaller messages.";}

		constructor () {
			this.patchedModules = {
				before: {
					ChannelTextAreaForm: "render",
					ChannelEditorContainer: "render"
				},
				after: {
					ChannelTextAreaContainer: "render",
				}
			};
		}

		initConstructor () {
			this.css = `
				.${this.name}-modal textarea {
					height: 50vh;
				}`;
		}

		// Legacy
		load () {}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);
				
				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		processChannelTextAreaForm (e) {
			if (!BDFDB.ModuleUtils.isPatched(this, e.instance, "handleSendMessage")) BDFDB.ModuleUtils.patch(this, e.instance, "handleSendMessage", {instead: e2 => {
				if (e2.methodArguments[0].length > BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH) {
					e2.stopOriginalMethodCall();
					let messages = this.formatText(e2.methodArguments[0]);
					messages.filter(n => n).forEach((message, i) => {
						BDFDB.TimeUtils.timeout(_ => {
							e2.originalMethod(message);
							if (i >= messages.length-1) BDFDB.NotificationUtils.toast(this.labels.toast_allsent_text, {type:"success"});
						}, messageDelay * i);
					});
					return Promise.resolve({
						shouldClear: true,
						shouldRefocus: true
					});
				}
				else return e2.callOriginalMethodAfterwards();
			}}, {force: true, noCache: true});
		}
		
		processChannelTextAreaContainer (e) {
			if (e.returnvalue.ref && e.returnvalue.ref.current && BDFDB.DOMUtils.getParent(BDFDB.dotCN.chatform, e.returnvalue.ref.current)) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "SlateCharacterCount"});
				if (index > -1) {
					let text = BDFDB.LibraryModules.SlateSelectionUtils.serialize(children[index].props.document, "raw");
					if (text.length > BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH) children[index] = BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.textareacharcounter + BDFDB.disCN.textareacharcountererror,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: Math.ceil(text.length / BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH * (39/40)) + " " + BDFDB.LanguageUtils.LanguageStrings.MESSAGES,
							children: BDFDB.ReactUtils.createElement("span", {
								children: BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH - text.length
							})
						})
					});
				}
			}
		}

		processChannelEditorContainer (e) {
			if (e.instance.props.type && e.instance.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL) e.instance.props.shouldUploadLongMessages = false;
		}

		formatText (text) {
			text = text.replace(/\t/g, "	");
			let longWords = text.match(new RegExp(`[^ ]{${BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH * (19/20)},}`, "gm"));
			if (longWords) for (let longWord of longWords) {
				let count1 = 0;
				let shortWords = [];
				longWord.split("").forEach(c => {
					if (shortWords[count1] && (shortWords[count1].length >= BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH * (19/20) || (c == "\n" && shortWords[count1].length >= BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH * (19/20) - 100))) count1++;
					shortWords[count1] = shortWords[count1] ? shortWords[count1] + c : c;
				});
				text = text.replace(longWord, shortWords.join(" "));
			}
			let messages = [];
			let count2 = 0;
			text.split(" ").forEach((word) => {
				if (messages[count2] && (messages[count2] + "" + word).length > BDFDB.DiscordConstants.MAX_MESSAGE_LENGTH * (39/40)) count2++;
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
						toast_allsent_text:					"Sve veliku poslane."
					};
				case "da":		//danish
					return {
						toast_allsent_text:					"Alle beskeder sendes."
					};
				case "de":		//german
					return {
						toast_allsent_text:					"Alle Nachrichten versendet."
					};
				case "es":		//spanish
					return {
						toast_allsent_text:					"Todos los mensajes enviados."
					};
				case "fr":		//french
					return {
						toast_allsent_text:					"Tous les messages envoyés"
					};
				case "it":		//italian
					return {
						toast_allsent_text:					"Tutti i messaggi inviati."
					};
				case "nl":		//dutch
					return {
						toast_allsent_text:					"Alle berichten verzonden."
					};
				case "no":		//norwegian
					return {
						toast_allsent_text:					"Alle meldinger sendt."
					};
				case "pl":		//polish
					return {
						toast_allsent_text:					"Wszystkie wiadomości zostały wysłane."
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						toast_allsent_text:					"Todas as mensagens enviadas."
					};
				case "fi":		//finnish
					return {
						toast_allsent_text:					"Kaikki lähetetyt viestit."
					};
				case "sv":		//swedish
					return {
						toast_allsent_text:					"Alla meddelanden skickade."
					};
				case "tr":		//turkish
					return {
						toast_allsent_text:					"Tüm mesajlar gönderildi."
					};
				case "cs":		//czech
					return {
						toast_allsent_text:					"Všechny zprávy byly odeslány."
					};
				case "bg":		//bulgarian
					return {
						toast_allsent_text:					"Всички изпратени съобщения."
					};
				case "ru":		//russian
					return {
						toast_allsent_text:					"Все отправленные сообщения."
					};
				case "uk":		//ukrainian
					return {
						toast_allsent_text:					"Всі повідомлення надіслано."
					};
				case "ja":		//japanese
					return {
						toast_allsent_text:					"すべてのメッセージが送信されました。"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						toast_allsent_text:					"發送的所有消息。"
					};
				case "ko":		//korean
					return {
						toast_allsent_text:					"모든 메시지가 전송되었습니다."
					};
				default:		//default: english
					return {
						toast_allsent_text:					"All messages sent."
					};
			}
		}
	}
})();

module.exports = SendLargeMessages;