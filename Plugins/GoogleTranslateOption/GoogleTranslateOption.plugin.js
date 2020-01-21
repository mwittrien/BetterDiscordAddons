//META{"name":"GoogleTranslateOption","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleTranslateOption","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleTranslateOption/GoogleTranslateOption.plugin.js"}*//

class GoogleTranslateOption {
	getName () {return "GoogleTranslateOption";}

	getVersion () {return "1.9.1";} 

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a Google Translate option to your context menu, which shows a preview of the translated text and on click will open the selected text in Google Translate. Also adds a translation button to your textareas, which will automatically translate the text for you before it is being send.";}

	constructor () {
		this.changelog = {
			"improved":[["Messages stay translated", "Messages will stay translated even if you switch channels"],["iTranslate & Yandex","Added iTranslate and Yandex engine, these engines got a montly rate limit, so if they don't work switch back to Google"]],
			"fixed":[["Translated Stamp","Now properly aligned with the message again"]]
		};

		this.patchedModules = {
			before: {
				ChannelTextAreaForm: "render",
				ChannelEditorContainer: "render"
			},
			after: {
				ChannelTextAreaContainer: "render",
				MessageContent: "render"
			}
		};
	}

	initConstructor () {
		this.languages = {};

		this.translating = false;
		this.isTranslating = false;
		
		this.translatedMessages = {};

		this.brailleConverter = {
			"0":"⠴", "1":"⠂", "2":"⠆", "3":"⠒", "4":"⠲", "5":"⠢", "6":"⠖", "7":"⠶", "8":"⠦", "9":"⠔", "!":"⠮", "\"":"⠐", "#":"⠼", "$":"⠫", "%":"⠩", "&":"⠯", "'":"⠄", "(":"⠷", ")":"⠾", "*":"⠡", "+":"⠬", ",":"⠠", "-":"⠤", ".":"⠨", "/":"⠌", ":":"⠱", ";":"⠰", "<":"⠣", "=":"⠿", ">":"⠜", "?":"⠹", "@":"⠈", "a":"⠁", "b":"⠃", "c":"⠉", "d":"⠙", "e":"⠑", "f":"⠋", "g":"⠛", "h":"⠓", "i":"⠊", "j":"⠚", "k":"⠅", "l":"⠇", "m":"⠍", "n":"⠝", "o":"⠕", "p":"⠏", "q":"⠟", "r":"⠗", "s":"⠎", "t":"⠞", "u":"⠥", "v":"⠧", "w":"⠺", "x":"⠭", "y":"⠽", "z":"⠵", "[":"⠪", "\\":"⠳", "]":"⠻", "^":"⠘", "⠁":"a", "⠂":"1", "⠃":"b", "⠄":"'", "⠅":"k", "⠆":"2", "⠇":"l", "⠈":"@", "⠉":"c", "⠊":"i", "⠋":"f", "⠌":"/", "⠍":"m", "⠎":"s", "⠏":"p", "⠐":"\"", "⠑":"e", "⠒":"3", "⠓":"h", "⠔":"9", "⠕":"o", "⠖":"6", "⠗":"r", "⠘":"^", "⠙":"d", "⠚":"j", "⠛":"g", "⠜":">", "⠝":"n", "⠞":"t", "⠟":"q", "⠠":", ", "⠡":"*", "⠢":"5", "⠣":"<", "⠤":"-", "⠥":"u", "⠦":"8", "⠧":"v", "⠨":".", "⠩":"%", "⠪":"[", "⠫":"$", "⠬":"+", "⠭":"x", "⠮":"!", "⠯":"&", "⠰":";", "⠱":":", "⠲":"4", "⠳":"\\", "⠴":"0", "⠵":"z", "⠶":"7", "⠷":"(", "⠸":"_", "⠹":"?", "⠺":"w", "⠻":"]", "⠼":"#", "⠽":"y", "⠾":")", "⠿":"=", "_":"⠸"
		};

		this.morseConverter = {
			"0":"−−−−−", "1":"·−−−−", "2":"··−−−", "3":"···−−", "4":"····−", "5":"·····", "6":"−····", "7":"−−···", "8":"−−−··", "9":"−−−−·", "!":"−·−·−−", "\"":"·−··−·", "$":"···−··−", "&":"·−···", "'":"·−−−−·", "(":"−·−−·", ")":"−·−−·−", "+":"·−·−·", ",":"−−··−−", "-":"−····−", ".":"·−·−·−", "/":"−··−·", ":":"−−−···", ";":"−·−·−·", "=":"−···−", "?":"··−−··", "@":"·−−·−·", "a":"·−", "b":"−···", "c":"−·−·", "d":"−··", "e":"·", "f":"··−·", "g":"−−·", "h":"····", "i":"··", "j":"·−−−", "k":"−·−", "l":"·−··", "m":"−−", "n":"−·", "o":"−−−", "p":"·−−·", "q":"−−·−", "r":"·−·", "s":"···", "t":"−", "u":"··−", "v":"···−", "w":"·−−", "x":"−··−", "y":"−·−−", "z":"−−··", "·":"e", "··":"i", "···":"s", "····":"h", "·····":"5", "····−":"4", "···−":"v", "···−··−":"$", "···−−":"3", "··−":"u", "··−·":"f", "··−−··":"?", "··−−·−":"_", "··−−−":"2", "·−":"a", "·−·":"r", "·−··":"l", "·−···":"&", "·−··−·":"\"", "·−·−·":"+", "·−·−·−":".", "·−−":"w", "·−−·":"p", "·−−·−·":"@", "·−−−":"j", "·−−−−":"1", "·−−−−·":"'", "−":"t", "−·":"n", "−··":"d", "−···":"b", "−····":"6", "−····−":"-", "−···−":"=", "−··−":"x", "−··−·":"/", "−·−":"k", "−·−·":"c", "−·−·−·":";", "−·−·−−":"!", "−·−−":"y", "−·−−·":"(", "−·−−·−":")", "−−":"m", "−−·":"g", "−−··":"z", "−−···":"7", "−−··−−":",", "−−·−":"q", "−−−":"o", "−−−··":"8", "−−−···":":", "−−−−·":"9", "−−−−−":"0", "_":"··−−·−"
		};

		this.defaults = {
			settings: {
				useChromium: 			{value:false,			description:"Use an inbuilt browser window instead of opening your default browser"},
				addTranslateButton:		{value:true, 			description:"Adds an translate button to the chatbar"},
				sendOriginalMessage:	{value:false, 			description:"Send the original message together with the translation"}
			},
			choices: {
				inputContext:			{value:"auto", 			direction:"input",		place:"Context", 		description:"Input Language in received Messages:"},
				outputContext:			{value:"$discord", 		direction:"output",		place:"Context", 		description:"Output Language in received Messages:"},
				inputMessage:			{value:"auto", 			direction:"input",		place:"Message", 		description:"Input Language in sent Messages:"},
				outputMessage:			{value:"$discord", 		direction:"output",		place:"Message", 		description:"Output Language in sent Messages:"}
			},
			engines: {
				translator:				{value:"google", 		description:"Translation Engine:"}
			}
		};
		
		this.translationEngines = {
			google: 					{name:"Google",			func:this.googleTranslate,			languages: ["af","sq","am","ar","hy","az","eu","be","bn","bs","bg","my","ca","ceb","ny","zh-CN","co","hr","cs","da","nl","en","eo","et","fi","fr","fy","gl","ka","de","el","gu","ht","ha","haw","iw","hi","hmn","hu","is","ig","id","ga","it","ja","jw","kn","kk","km","ko","ku","ky","lo","la","lv","lt","lb","mk","mg","ms","ml","mt","mi","mr","mn","ne","no","ps","fa","pl","pt","pa","ro","ru","sm","gd","sr","st","sn","sd","si","sk","sl","so","es","sw","sv","tg","ta","te","th","tr","uk","ur","uz","vi","cy","xh","yi","yo","zu"]},
			itranslate: 				{name:"iTranslate",		func:this.iTranslateTranslate,		languages: ["af","sq","ar","hy","az","eu","be","bn","bs","bg","ca","ceb","ny","zh-CN","zh-TW","hr","cs","da","nl","en","eo","et","fil","fi","fr","gl","ka","de","el","gu","ht","he","ha","hi","hmn","hu","is","ig","id","ga","it","ja","jw","kn","kk","km","ko","lo","la","lv","lt","mk","mg","ms","ml","mt","mi","mr","mn","my","ne","no","fa","pl","pt-BR","pt-PT","pa","ro","ru","sr","st","si","sk","sl","so","es","su","sw","sv","tg","ta","te","th","tr","uk","ur","uz","vi","we","yi","yo","zu"]},
			yandex: 					{name:"Yandex",			func:this.yandexTranslate,			languages: ["af","sq","am","ar","hy","az","ba","eu","be","bn","bs","bg","my","ca","ceb","zh","hr","cs","da","nl","en","eo","et","fi","fr","gl","ka","de","el","gu","ht","he","hi","hu","is","id","ga","it","ja","jv","kn","kk","km","ko","ky","lo","la","lv","lt","lb","mk","mg","ms","ml","mt","mi","mr","mhr","mn","ne","no","pap","fa","pl","pt","pa","ro","ru","gd","sr","si","sk","sl","es","su","sw","sv","tl","tg","ta","tt","te","th","tr","udm","uk","ur","uz","vi","cy","xh","yi"]}
		};

		this.css = `
			${BDFDB.dotCN._googletranslateoptiontranslatebutton + BDFDB.dotCNS._googletranslateoptiontranslating + BDFDB.dotCN.textareaicon} {
				color: #F04747 !important;
			}
			${BDFDB.dotCN._googletranslateoptionreversebutton} {
				opacity: 0.5;
				margin-right: 5px;
				transition: all 200ms ease;
			}
			${BDFDB.dotCN._googletranslateoptionreversebutton}:hover {
				opacity: 1;
			}`;
	}

	getSettingsPanel () {
		if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingspanel, settingsitems = [];
		
		settingsitems = settingsitems.concat(this.createSelects(false));
		
		for (let key in settings) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		
		return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	//legacy
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

			this.setLanguages();

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			for (let id in this.translatedMessages) this.formatMessage(this.translatedMessages[id].message, this.translatedMessages[id].oldString);
			this.translatedMessages = {};
			let instances = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:["Message", "Embeds"], all:true, group:true, unlimited:true});
			if (instances.Message) for (let ins of instances.Message) ins.props.message = new BDFDB.DiscordObjects.Message(ins.props.message);
			BDFDB.ReactUtils.forceUpdate(instances.Message, instances.Embeds);
			
			BDFDB.ModuleUtils.forceAllUpdates(this, ["ChannelTextAreaForm", "ChannelTextAreaContainer"]);

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions
	
	onSettingsClosed (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			this.setLanguages();
			BDFDB.ModuleUtils.forceAllUpdates(this, ["ChannelTextAreaForm", "ChannelTextAreaContainer"]);
		}
	}

	onMessageContextMenu (e) {
		if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
			let translated = this.translatedMessages[e.instance.props.message.id];
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"MessagePinItem"});
			if (index > -1) children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
				label: translated ? this.labels.context_messageuntranslateoption_text : this.labels.context_messagetranslateoption_text,
				hint: BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Translate_Message") : null,
				disabled: !translated && this.isTranslating,
				action: _ => {
					BDFDB.ContextMenuUtils.close(e.instance);
					this.translateMessage(e.instance.props.message, e.instance.props.target, e.instance.props.channel);
				}
			}));
			let text = document.getSelection().toString();
			if (text) {
				let GSRstring = BDFDB.ReactUtils.getValue(BDFDB.BDUtils.getPlugin("GoogleSearchReplace", true), "labels.context_googlesearchreplace_text");
				let translating, foundtranslation, foundinput, foundoutput;
				let [children2, index2] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"SearchWithGoogle", props: GSRstring ? [["label", GSRstring]] : null});
				if (index2 > -1) children2.splice(index2 > -1 ? index2 : children2.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
					label: this.labels.context_googletranslateoption_text,
					disabled: this.isTranslating,
					action: event => {
						let item = BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenuitem, event.target);
						if (item) {
							var createTooltip = _ => {
								BDFDB.TooltipUtils.create(item, `From ${foundinput.name}:\n${text}\n\nTo ${foundoutput.name}:\n${foundtranslation}`, {type:"right", selector:"googletranslate-tooltip"});
							};
							if (foundtranslation && foundinput && foundoutput) {
								if (document.querySelector(".googletranslate-tooltip")) {
									BDFDB.ContextMenuUtils.close(e.instance);
									BDFDB.DiscordUtils.openLink(this.getGoogleTranslatePageURL(foundinput.id, foundoutput.id, text), BDFDB.DataUtils.get(this, "settings", "useChromium"));
								}
								else createTooltip();
							}
							else if (!translating) {
								translating = true;
								this.translateText(text, "context", (translation, input, output) => {
									if (translation) {
										foundtranslation = translation, foundinput = input, foundoutput = output;
										createTooltip();
									}
								});
							}
						}
					}
				}));
			}
		}
	}

	onMessageOptionPopout (e) {
		if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
			let {messagediv, pos} = this.getMessageAndPos(e.instance.props.target);
			if (!messagediv || pos == -1) return;
			let translated = BDFDB.DOMUtils.containsClass(messagediv, "GTO-translated-message");
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["label", [BDFDB.LanguageUtils.LanguageStrings.PIN, BDFDB.LanguageUtils.LanguageStrings.UNPIN]]]});
			children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
				label: this.labels[translated ? "popout_untranslateoption_text" : "popout_translateoption_text"],
				className: BDFDB.disCN.optionpopoutitem,
				disabled: this.isTranslating,
				action: _ => {
					this.translateMessage(e.instance.props.message, e.instance.props.target, e.instance.props.channel);
					e.instance.props.onClose();
				}
			}));
		}
	}
	
	processChannelTextAreaForm (e) {
		if (!BDFDB.ModuleUtils.isPatched(this, e.instance, "handleSendMessage")) BDFDB.ModuleUtils.patch(this, e.instance, "handleSendMessage", {instead: e2 => {
			if (this.translating) {
				e2.stopOriginalMethodCall();
				this.translateText(e2.methodArguments[0], "message", (translation, input, output) => {
					translation = !translation ? e2.methodArguments[0] : (BDFDB.DataUtils.get(this, "settings", "sendOriginalMessage") ? e2.methodArguments[0] + "\n\n" + translation : translation);
					e2.originalMethod(translation);
				});
				return Promise.resolve({
					shouldClear: true,
					shouldRefocus: true
				});
			}
			else return e2.callOriginalMethodAfterwards();
		}}, true);
	}

	processChannelEditorContainer (e) {
		if (this.translating && this.isTranslating) e.instance.props.disabled = true;
	}
	
	processChannelTextAreaContainer (e) {
		let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "ChannelEditorContainer"});
		if (index > -1 && children[index].props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && !children[index].props.disabled) {
			let [children2, index2] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["className", BDFDB.disCN.textareapickerbuttons]]});
			if (index2 > -1 && children2[index2].props && children2[index2].props.children) children2[index2].props.children.unshift(this.createTranslateButton());
		}
	}

	processMessageContent (e) {
		if (typeof e.returnvalue.props.children == "function") {
			let renderChildren = e.returnvalue.props.children;
			e.returnvalue.props.children = (...args) => {
				let renderedChildren = renderChildren(...args);
				let translatedMessage = this.translatedMessages[e.instance.props.message.id];
				if (translatedMessage) {
					let [children, index] = BDFDB.ReactUtils.findChildren(renderedChildren, {props: [["className", BDFDB.disCN.messagemarkuprtl]]});
					if (index > -1 && children[index].props && children[index].props.children && children[index].props.children.props && BDFDB.ArrayUtils.is(children[index].props.children.props.children)) children[index].props.children.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: `From: ${this.getLanguageName(translatedMessage.input)}\nTo: ${this.getLanguageName(translatedMessage.output)}`,
						tooltipConfig: {style: "max-width: 400px"},
						children: BDFDB.ReactUtils.createElement("time", {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messageedited, BDFDB.disCN._googletranslateoptiontranslated),
							children: `(${this.labels.translated_watermark_text})`
						})
					}));
				}
				return renderedChildren;
			};
		}
	}
	
	createTranslateButton () {
		return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PopoutContainer, {
			children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ChannelTextAreaButton, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._googletranslateoptiontranslatebutton, this.translating && BDFDB.disCN._googletranslateoptiontranslating, BDFDB.disCN.textareapickerbutton),
				iconClassName: BDFDB.disCN.textareaicon,
				iconSVG: `<svg x="0" y="0" aria-hidden="false" width="22" height="22" viewBox="0 0 22 22" fill="currentColor"><path d="M 19.794, 3.299 H 9.765 L 8.797, 0 h -6.598 C 0.99, 0, 0, 0.99, 0, 2.199 V 16.495 c 0, 1.21, 0.99, 2.199, 2.199, 2.199 H 9.897 l 1.1, 3.299 H 19.794 c 1.21, 0, 2.199 -0.99, 2.199 -2.199 V 5.498 C 21.993, 4.289, 21.003, 3.299, 19.794, 3.299 z M 5.68, 13.839 c -2.48, 0 -4.492 -2.018 -4.492 -4.492 s 2.018 -4.492, 4.492 -4.492 c 1.144, 0, 2.183, 0.407, 3.008, 1.171 l 0.071, 0.071 l -1.342, 1.298 l -0.066 -0.06 c -0.313 -0.297 -0.858 -0.643 -1.671 -0.643 c -1.441, 0 -2.612, 1.193 -2.612, 2.661 c 0, 1.468, 1.171, 2.661, 2.612, 2.661 c 1.507, 0, 2.161 -0.962, 2.337 -1.606 h -2.43 v -1.704 h 4.344 l 0.016, 0.077 c 0.044, 0.231, 0.06, 0.434, 0.06, 0.665 C 10.001, 12.036, 8.225, 13.839, 5.68, 13.839 z M 11.739, 9.979 h 4.393 c 0, 0 -0.374, 1.446 -1.715, 3.008 c -0.588 -0.676 -0.995 -1.336 -1.254 -1.864 h -1.089 L 11.739, 9.979 z M 13.625, 13.839 l -0.588, 0.583 l -0.72 -2.452 C 12.685, 12.63, 13.13, 13.262, 13.625, 13.839 z M 20.893, 19.794 c 0, 0.605 -0.495, 1.1 -1.1, 1.1 H 12.096 l 2.199 -2.199 l -0.896 -3.041 l 1.012 -1.012 l 2.953, 2.953 l 0.803 -0.803 l -2.975 -2.953 c 0.99 -1.138, 1.759 -2.474, 2.106 -3.854 h 1.397 V 8.841 H 14.697 v -1.144 h -1.144 v 1.144 H 11.398 l -1.309 -4.443 H 19.794 c 0.605, 0, 1.1, 0.495, 1.1, 1.1 V 19.794 z"/></svg>`
			}),
			width: 400,
			padding: 10,
			animation: BDFDB.LibraryComponents.PopoutContainer.Animation.SCALE,
			position: BDFDB.LibraryComponents.PopoutContainer.Positions.TOP,
			align: BDFDB.LibraryComponents.PopoutContainer.Align.RIGHT,
			onClose: instance => {
				let channelTextareaButtonIns = BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_ChannelTextAreaButton"});
				if (channelTextareaButtonIns) {
					channelTextareaButtonIns.props.isActive = false;
					BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
				}
			},
			onContextMenu: (e, instance) => {
				this.translating = !this.translating;
				let channelTextareaButtonIns = BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_ChannelTextAreaButton"});
				if (channelTextareaButtonIns) {
					channelTextareaButtonIns.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._googletranslateoptiontranslatebutton, this.translating && BDFDB.disCN._googletranslateoptiontranslating, BDFDB.disCN.textareapickerbutton);
					BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
					instance.close();
				}
			},
			renderPopout: instance => {
				let channelTextareaButtonIns = BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_ChannelTextAreaButton"});
				if (channelTextareaButtonIns) {
					channelTextareaButtonIns.props.isActive = true;
					BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
				}
				let popoutelements = [];
				popoutelements.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					className: BDFDB.disCN.marginbottom8,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
						label: `Words starting with "!" will be ignored`
					})
				}));
				popoutelements.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
					className: BDFDB.disCN.marginbottom8
				})),
				popoutelements = popoutelements.concat(this.createSelects(true));
				popoutelements.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Switch",
					className: BDFDB.disCN.marginbottom8,
					label: "Translate your Messages before sending",
					value: this.translating,
					onChange: value => {
						this.translating = value;
						if (channelTextareaButtonIns) {
							channelTextareaButtonIns.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._googletranslateoptiontranslatebutton, this.translating && BDFDB.disCN._googletranslateoptiontranslating, BDFDB.disCN.textareapickerbutton);
							BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
						}
					}
				}));
				return popoutelements;
			}
		});
	}
	
	createSelects (inPopout) {
		let selects = [];
		for (let key in this.defaults.choices) {
			let isOutput = this.defaults.choices[key].direction == "output";
			selects.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
				title: this.defaults.choices[key].description,
				titlechildren: isOutput ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
					look: BDFDB.LibraryComponents.Button.Looks.BLANK,
					size: BDFDB.LibraryComponents.Button.Sizes.NONE,
					onClick: e => {
						let place = this.defaults.choices[key].place;
						let input = this.getLanguageChoice("input", place);
						let output = this.getLanguageChoice("output", place);
						input = input == "auto" ? "en" : input;
						BDFDB.DataUtils.save(output, this, "choices", "input" + place);
						BDFDB.DataUtils.save(input, this, "choices", "output" + place);
						for (let selectIns of BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(e._targetInst, {name:["BDFDB_Popout", "BDFDB_SettingsPanel"], up:true}), {name:"BDFDB_Select", all:true, noCopies:true})) if (selectIns && selectIns.props && selectIns.props.id && this.defaults.choices[selectIns.props.id].place == place) {
							selectIns.props.value = this.defaults.choices[selectIns.props.id].direction == "input" ? output : input;
							BDFDB.ReactUtils.forceUpdate(selectIns);
						}
						this.setLanguages();
					},
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						iconSVG: `<svg class="${BDFDB.disCN._googletranslateoptionreversebutton}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor"><path d="M 0, 10.515 c 0, 2.892, 1.183, 5.521, 3.155, 7.361 L 0, 21.031 h 7.887 V 13.144 l -2.892, 2.892 C 3.549, 14.722, 2.629, 12.75, 2.629, 10.515 c 0 -3.418, 2.235 -6.309, 5.258 -7.492 v -2.629 C 3.418, 1.577, 0, 5.652, 0, 10.515 z M 21.031, 0 H 13.144 v 7.887 l 2.892 -2.892 C 17.482, 6.309, 18.402, 8.281, 18.402, 10.515 c 0, 3.418 -2.235, 6.309 -5.258, 7.492 V 20.768 c 4.469 -1.183, 7.887 -5.258, 7.887 -10.121 c 0 -2.892 -1.183 -5.521 -3.155 -7.361 L 21.031, 0 z"/></svg>`
					})
				}) : null,
				className: BDFDB.disCN.marginbottom8,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
					menuPlacement: inPopout ? BDFDB.LibraryComponents.Select.MenuPlacements.TOP : BDFDB.LibraryComponents.Select.MenuPlacements.BOTTOM,
					value: this.getLanguageChoice(key),
					id: key,
					options: BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(isOutput ? BDFDB.ObjectUtils.filter(this.languages, lang => lang.id != "auto") : this.languages, (lang, id) => {return {value:id, label:this.getLanguageName(lang)}})),
					searchable: true,
					optionRenderer: lang => {
						return this.languages[lang.value] ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									grow: 1,
									children: lang.label
								}),
								inPopout ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
									isFavorite: this.languages[lang.value].fav == 0,
									onClick: value => {
										if (value) BDFDB.DataUtils.save(true, this, "favorites", lang.value);
										else BDFDB.DataUtils.remove(this, "favorites", lang.value);
										this.setLanguages();
									}
								}) : null
							]
						}) : null;
					},
					onChange: lang => {
						BDFDB.DataUtils.save(lang.value, this, "choices", key);
					}
				})
			}));
			if (isOutput) selects.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom8
			}));
		}
		let engines = BDFDB.DataUtils.get(this, "engines");
		for (let key in engines) {
			selects.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
				title: this.defaults.engines[key].description,
				className: BDFDB.disCN.marginbottom8,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
					menuPlacement: inPopout ? BDFDB.LibraryComponents.Select.MenuPlacements.TOP : BDFDB.LibraryComponents.Select.MenuPlacements.BOTTOM,
					value: engines[key],
					id: key,
					options: Object.keys(this.translationEngines).map(engineKey => {return {value:engineKey, label:this.translationEngines[engineKey].name}}),
					searchable: true,
					onChange: (engine, instance) => {
						BDFDB.DataUtils.save(engine.value, this, "engines", key);
						this.setLanguages();
						let popoutInstance = BDFDB.ReactUtils.findOwner(instance, {name: "BDFDB_PopoutContainer", up:true});
						if (popoutInstance) {
							popoutInstance.close();
							popoutInstance.handleClick();
						}
					}
				})
			}));
		}
		return selects;
	}

	setLanguages () {
		let languageIds = (this.translationEngines[BDFDB.DataUtils.get(this, "engines", "translator")] || {}).languages || [];
		this.languages = Object.assign(
			{"auto":	{name:"Auto",			id:"auto",		integrated:false,	dic:false}},
			BDFDB.ObjectUtils.filter(BDFDB.LanguageUtils.languages, lang => languageIds.includes(lang.id)),
			{"binary":	{name:"Binary",			id:"binary",	integrated:false,	dic:false}},
			{"braille":	{name:"Braille 6-dot",	id:"braille",	integrated:false,	dic:false}},
			{"morse":	{name:"Morse",			id:"morse",		integrated:false,	dic:false}}
		);
		let favorites = BDFDB.DataUtils.load(this, "favorites");
		for (let id in this.languages) this.languages[id].fav = favorites[id] != undefined ? 0 : 1;
		this.languages = BDFDB.ObjectUtils.sort(this.languages, "fav");
	}

	getLanguageChoice (direction, place) {
		this.setLanguages();
		var type = place === undefined ? direction : direction.toLowerCase() + place.charAt(0).toUpperCase() + place.slice(1).toLowerCase();
		var choice = BDFDB.DataUtils.get(this, "choices", type);
		choice = this.languages[choice] ? choice : Object.keys(this.languages)[0];
		choice = type.indexOf("output") > -1 && choice == "auto" ? "en" : choice;
		return choice;
	}

	getMessageAndPos (target) {
		let messagediv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagegroup + "> [aria-disabled]," + BDFDB.dotCN.messagegroup + "> * > [aria-disabled]", target);
		let pos = messagediv ? Array.from(messagediv.parentElement.childNodes).filter(n => n.nodeType != Node.TEXT_NODE).indexOf(messagediv) : -1;
		return {messagediv, pos};
	}

	translateMessage (message, target, channel) {
		if (!message || !target) return;
		let messageIns = BDFDB.ReactUtils.findOwner(target, {name:"Message", up:true});
		let embedsIns = BDFDB.ReactUtils.findOwner(messageIns, {name:"Embed", all:true});
		if (messageIns) {
			let {oldString} = this.translatedMessages[message.id] || {};
			if (oldString) {
				delete this.translatedMessages[message.id];
				this.formatMessage(message, oldString);
				for (let i in message.embeds) if (embedsIns[i]) embedsIns[i].props.embed.rawDescription = message.embeds[i].rawDescription;
				messageIns.props.message = new BDFDB.DiscordObjects.Message(message);
				BDFDB.ReactUtils.forceUpdate(messageIns, embedsIns);
			}
			else {
				oldString = message.content || "";
				for (let embed of message.embeds) oldString += ("\n__________________ __________________ __________________\n" + embed.rawDescription);
				this.translateText(oldString, "context", (translation, input, output) => {
					if (translation) {
						this.translatedMessages[message.id] = {oldString, message, input, output};
						this.formatMessage(message, translation);
						for (let i in message.embeds) if (embedsIns[i]) embedsIns[i].props.embed.rawDescription = message.embeds[i].rawDescription;
						messageIns.props.message = new BDFDB.DiscordObjects.Message(message);
						BDFDB.ReactUtils.forceUpdate(messageIns, embedsIns);
					}
				});
			}
		}
	}
	
	formatMessage (message, string) {
		let strings = string.split("\n__________________ __________________ __________________\n");
		message.content = strings.shift().trim();
		for (let i in message.embeds) message.embeds[i].rawDescription = strings.shift().trim() || message.embeds[i].rawDescription;
	}

	translateText (text, type, callback) {
		var toast = null, finishTranslation = translation => {
			this.isTranslating = false;
			if (translation) translation = this.addExceptions(translation, exceptions);
			if (toast) {
				BDFDB.TimeUtils.clear(toast.interval);
				toast.close();
			}
			callback(translation == text ? "" : translation, input, output);
		};
		var [newtext, exceptions, translate] = this.removeExceptions(text.trim(), type);
		var input = Object.assign({}, this.languages[this.getLanguageChoice("input", type)]);
		var output = Object.assign({}, this.languages[this.getLanguageChoice("output", type)]);
		if (translate) {
			let timer = 0;
			toast = BDFDB.NotificationUtils.toast("Translating. Please wait", {timeout:0});
			toast.interval = BDFDB.TimeUtils.interval(_ => {
				if (timer++ > 40) {
					finishTranslation("");
					BDFDB.NotificationUtils.toast("Failed to translate text. Try another Translate Engine.", {type:"error"});
				}
				else toast.textContent = toast.textContent.indexOf(".....") > -1 ? "Translating. Please wait" : toast.textContent + ".";
			}, 500);
			let specialcase = this.checkForSpecialCase(newtext, input);
			if (specialcase) {
				input.name = specialcase.name;
				switch (specialcase.id) {
					case "binary": newtext = this.binary2string(newtext); break;
					case "braille": newtext = this.braille2string(newtext); break;
					case "morse": newtext = this.morse2string(newtext); break;
				}
			}
			if (output.id == "binary" || output.id == "braille" || output.id == "morse") {
				switch (output.id) {
					case "binary": newtext = this.string2binary(newtext); break;
					case "braille": newtext = this.string2braille(newtext); break;
					case "morse": newtext = this.string2morse(newtext); break;
				}
				finishTranslation(newtext);
			}
			else {
				let translator = BDFDB.DataUtils.get(this, "engines", "translator");
				if (this.translationEngines[translator] && typeof this.translationEngines[translator].func == "function") {
					this.isTranslating = true;
					this.translationEngines[translator].func.apply(this, [{input, output, text:newtext, specialcase, engine:this.translationEngines[translator]}, finishTranslation]);
				}
				else finishTranslation("");
			}
		}
		else finishTranslation(text);
	}
	
	googleTranslate (data, callback) {
		let googleTranslateWindow = BDFDB.WindowUtils.open(this, this.getGoogleTranslatePageURL(data.input.id, data.output.id, data.text));
		googleTranslateWindow.webContents.on("did-finish-load", _ => {
			googleTranslateWindow.webContents.executeJavaScript(`require("electron").ipcRenderer.sendTo(${BDFDB.LibraryRequires.electron.remote.getCurrentWindow().webContents.id}, "GTO-translation", [(document.querySelector(".translation") || {}).innerText, [(new RegExp("{code:'([^']*)',name:'" + [(new RegExp((window.source_language_detected || "").replace("%1$s", "([A-z]{2,})"), "g")).exec(document.body.innerHTML)].flat()[1] +"'}", "g")).exec(document.body.innerHTML)].flat()[1]]);`);
		});
		BDFDB.WindowUtils.addListener(this, "GTO-translation", (event, messagedata) => {
			BDFDB.WindowUtils.close(googleTranslateWindow);
			BDFDB.WindowUtils.removeListener(this, "GTO-translation");
			if (!data.specialcase && messagedata[1] && this.languages[messagedata[1]]) {
				data.input.name = this.languages[messagedata[1]].name;
				data.input.ownlang = this.languages[messagedata[1]].ownlang;
			}
			callback(messagedata[0]);
		});
	}
	
	iTranslateTranslate (data, callback) {
		let translate = _ => {
			BDFDB.LibraryRequires.request({
				method: "POST",
				url: "https://web-api.itranslateapp.com/v3/texts/translate",
				headers: {
					"API-KEY": "d2aefeac9dc661bc98eebd6cc12f0b82"
				},
				body: JSON.stringify({
					source: {
						dialect: data.input.id,
						text: data.text
					},
					target: {
						dialect: data.output.id
					}
				})
			}, (error, response, result) => {
				if (!error && response && response.statusCode == 200) {
					try {
						let response = JSON.parse(result);
						if (!data.specialcase && response.source && response.source.detected && this.languages[response.source.detected]) {
							data.input.name = this.languages[response.source.detected].name;
							data.input.ownlang = this.languages[response.source.detected].ownlang;
						}
						callback(response.target.text);
					}
					catch (err) {callback("");}
				}
				else {
					BDFDB.NotificationUtils.toast("Failed to translate text. Translation Server is down or API-key outdated. Try another Translate Engine.", {type:"error"});
					callback("");
				}
			});
		};
		if (data.engine.APIkey) translate();
		else BDFDB.LibraryRequires.request("https://www.itranslate.com/themes/itranslate2016/assets/webapp/js/main.js", {gzip: true}, (error, response, result) => {
			if (!error && result) {
				let APIkey = /var API_KEY = "(.+)"/.exec(result);
				if (APIkey) {
					data.engine.APIkey = APIkey[1];
					translate();
				}
				else callback("");
			}
			else callback("");
		});
	}
	
	yandexTranslate (data, callback) {
		BDFDB.LibraryRequires.request(`https://translate.yandex.net/api/v1.5/tr/translate?key=trnsl.1.1.20191206T223907Z.52bd512eca953a5b.1ec123ce4dcab3ae859f312d27cdc8609ab280de&text=${encodeURIComponent(data.text)}&lang=${data.specialcase || data.input.id == "auto" ? data.output.id : (data.input.id + "-" + data.output.id)}&options=1`, (error, response, result) => {
			if (!error && result && response.statusCode == 200) {
				result = BDFDB.DOMUtils.create(result);
				let translation = result.querySelector("text");
				let detected = result.querySelector("detected");
				if (translation && detected) {
					let detectedlang = detected.getAttribute("lang");
					if (!data.specialcase && detectedlang && this.languages[detectedlang]) {
						data.input.name = this.languages[detectedlang].name;
						data.input.ownlang = this.languages[detectedlang].ownlang;
					}
					callback(translation.innerText);
				}
				else callback("");
			}
			else {
				BDFDB.NotificationUtils.toast("Failed to translate text. Translation Server is down or API-key outdated. Try another Translate Engine.", {type:"error"});
				callback("");
			}
		});
	}

	checkForSpecialCase (text, input) {
		if (input.id == "binary" || input.id == "braille" || input.id == "morse") return input;
		else if (input.id == "auto") {
			if (/^[0-1]*$/.test(text.replace(/\s/g, ""))) {
				return {id: "binary", name: "Binary"};
			}
			else if (/^[⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿]*$/.test(text.replace(/\s/g, ""))) {
				return {id: "braille", name: "Braille 6-dot"};
			}
			else if (/^[/|·−._-]*$/.test(text.replace(/\s/g, ""))) {
				return {id: "morse", name: "Morse"};
			}
		}
		return null;
	}

	string2binary (string) {
		var binary = "";
		for (let character of string) binary += parseInt(character.charCodeAt(0).toString(2)).toPrecision(8).split(".").reverse().join("").toString() + " ";
		return binary;
	}

	string2braille (string) {
		var braille = "";
		for (let character of string) braille += this.brailleConverter[character.toLowerCase()] ? this.brailleConverter[character.toLowerCase()] : character;
		return braille;
	}

	string2morse (string) {
		string = string.replace(/ /g, "%%%%%%%%%%");
		var morse = "";
		for (let character of string) morse += (this.morseConverter[character.toLowerCase()] ? this.morseConverter[character.toLowerCase()] : character) + " ";
		morse = morse.split("\n");
		for (let i in morse) morse[i] = morse[i].trim();
		return morse.join("\n").replace(/% % % % % % % % % % /g, "/ ");
	}

	binary2string (binary) {
		var string = "";
		binary = binary.replace(/\n/g, "00001010").replace(/\r/g, "00001101").replace(/\t/g, "00001001").replace(/\s/g, "");
		if (/^[0-1]*$/.test(binary)) {
			var eightdigits = "";
			var counter = 0;
			for (var digit of binary) {
				eightdigits += digit;
				counter++;
				if (counter > 7) {
					string += String.fromCharCode(parseInt(eightdigits,2).toString(10));
					eightdigits = "";
					counter = 0;
				}
			}
		}
		else BDFDB.NotificationUtils.toast("Invalid binary format. Only use 0s and 1s.", {type:"error"});
		return string;
	}

	braille2string (braille) {
		var string = "";
		for (let character of braille) string += this.brailleConverter[character.toLowerCase()] ? this.brailleConverter[character.toLowerCase()] : character;
		return string;
	}

	morse2string (morse) {
		var string = "";
		for (let word of morse.replace(/[_-]/g, "−").replace(/\./g, "·").replace(/\r|\t/g, "").split(/\/|\||\n/g)) {
			for (let characterstr of word.trim().split(" ")) string += this.morseConverter[characterstr] ? this.morseConverter[characterstr] : characterstr;
			string += " ";
		}
		return string.trim();
	}

	addExceptions (string, exceptions) {
		for (let count in exceptions) {
			let exception = exceptions[count].indexOf("!") == 0 ? exceptions[count].slice(1) : exceptions[count];
			let newstring = string.replace(new RegExp(`\[/////[ ]*${count}\]`), exception);
			if (newstring == string) string = newstring + " " + exception;
			else string = newstring;
		}
		return string;
	}

	removeExceptions (string, type) {
		var exceptions = {}, newString = [], count = 0;
		if (type == "context") {
			let text = [], i = 0;
			string.split("").forEach(chara => { 
				if (chara == "<" && text[i]) i++;
				text[i] = text[i] ? text[i] + chara : chara;
				if (chara == ">") i++;
			});
			for (let j in text) {
				if (text[j].indexOf("<") == 0) {
					newString.push(`[/////${count}]`);
					exceptions[count] = text[j];
					count++;
				}
				else newString.push(text[j]);
			}
		}
		else {
			string.split(" ").forEach(word => {
				if (word.indexOf("<@!") == 0 || word.indexOf(":") == 0 || word.indexOf("@") == 0 || word.indexOf("#") == 0 || (word.indexOf("!") == 0 && word.length > 1)) {
					newString.push(`[/////${count}]`);
					exceptions[count] = word;
					count++;
				}
				else newString.push(word);
			});
		}
		return [newString.join(" "), exceptions, newString.length-count != 0];
	}

	getGoogleTranslatePageURL (input, output, text) {
		input = BDFDB.LanguageUtils.languages[input] ? input : "auto";
		return "https://translate.google.com/#" + input + "/" + output + "/" + encodeURIComponent(text);
	}
	
	getLanguageName (language) {
		if (language.name.startsWith("Discord")) return language.name.slice(0, -1) + (language.ownlang && this.languages[language.id].name != language.ownlang ? ` / ${language.ownlang}` : "") + ")";
		else return language.name + (language.ownlang && language.name != language.ownlang ? ` / ${language.ownlang}` : "");
	}

	setLabelsByLanguage () {
		switch (BDFDB.LanguageUtils.getLanguage().id) {
			case "hr":		//croatian
				return {
					context_messagetranslateoption_text:	"Prijevod poruke",
					context_messageuntranslateoption_text:	"Prijenos poruke",
					context_googletranslateoption_text:		"Traži prijevod",
					popout_translateoption_text:			"Prevesti",
					popout_untranslateoption_text:			"Prevesti natrag",
					translated_watermark_text:				"preveo"
				};
			case "da":		//danish
				return {
					context_messagetranslateoption_text:	"Oversæt Besked",
					context_messageuntranslateoption_text:	"Oversæt Besked tilbage",
					context_googletranslateoption_text:		"Søg oversættelse",
					popout_translateoption_text:			"Oversætte",
					popout_untranslateoption_text:			"Oversæt tilbage",
					translated_watermark_text:				"oversat"
				};
			case "de":		//german
				return {
					context_messagetranslateoption_text:	"Nachricht übersetzen",
					context_messageuntranslateoption_text:	"Nachricht unübersetzen",
					context_googletranslateoption_text:		"Suche Übersetzung",
					popout_translateoption_text:			"Übersetzen",
					popout_untranslateoption_text:			"Unübersetzen",
					translated_watermark_text:				"übersetzt"
				};
			case "es":		//spanish
				return {
					context_messagetranslateoption_text:	"Traducir mensaje",
					context_messageuntranslateoption_text:	"Traducir mensaje de vuelta",
					context_googletranslateoption_text:		"Buscar traducción",
					popout_translateoption_text:			"Traducir",
					popout_untranslateoption_text:			"Traducir de vuelta",
					translated_watermark_text:				"traducido"
				};
			case "fr":		//french
				return {
					context_messagetranslateoption_text:	"Traduire le message",
					context_messageuntranslateoption_text:	"Traduire le message en retour",
					context_googletranslateoption_text:		"Rechercher une traduction",
					popout_translateoption_text:			"Traduire",
					popout_untranslateoption_text:			"Traduire en arrière",
					translated_watermark_text:				"traduit"
				};
			case "it":		//italian
				return {
					context_messagetranslateoption_text:	"Tradurre il messaggio",
					context_messageuntranslateoption_text:	"Tradurre il messaggio indietro",
					context_googletranslateoption_text:		"Cerca la traduzione",
					popout_translateoption_text:			"Traduci",
					popout_untranslateoption_text:			"Traduci indietro",
					translated_watermark_text:				"tradotto"
				};
			case "nl":		//dutch
				return {
					context_messagetranslateoption_text:	"Vertaal bericht",
					context_messageuntranslateoption_text:	"Vertaal bericht terug",
					context_googletranslateoption_text:		"Zoek vertaling",
					popout_translateoption_text:			"Vertaal",
					popout_untranslateoption_text:			"Vertaal terug",
					translated_watermark_text:				"vertaalde"
				};
			case "no":		//norwegian
				return {
					context_messagetranslateoption_text:	"Oversett melding",
					context_messageuntranslateoption_text:	"Oversett melding tilbake",
					context_googletranslateoption_text:		"Søk oversettelse",
					popout_translateoption_text:			"Oversett",
					popout_untranslateoption_text:			"Oversett tilbake",
					translated_watermark_text:				"oversatt"
				};
			case "pl":		//polish
				return {
					context_messagetranslateoption_text:	"Przetłumacz wiadomość",
					context_messageuntranslateoption_text:	"Przetłumacz wiadomość z powrotem",
					context_googletranslateoption_text:		"Wyszukaj tłumaczenie",
					popout_translateoption_text:			"Przetłumacz",
					popout_untranslateoption_text:			"Przetłumacz ponownie",
					translated_watermark_text:				"przetłumaczony"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_messagetranslateoption_text:	"Traduzir mensagem",
					context_messageuntranslateoption_text:	"Traduzir mensagem de volta",
					context_googletranslateoption_text:		"Pesquisar tradução",
					popout_translateoption_text:			"Traduzir",
					popout_untranslateoption_text:			"Traduzir de volta",
					translated_watermark_text:				"traduzido"
				};
			case "fi":		//finnish
				return {
					context_messagetranslateoption_text:	"Käännä viesti",
					context_messageuntranslateoption_text:	"Käännä viesti takaisin",
					context_googletranslateoption_text:		"Etsi käännös",
					popout_translateoption_text:			"Kääntää",
					popout_untranslateoption_text:			"Käännä takaisin",
					translated_watermark_text:				"käännetty"
				};
			case "sv":		//swedish
				return {
					context_messagetranslateoption_text:	"Översätt meddelande",
					context_messageuntranslateoption_text:	"Översätt meddelandet tillbaka",
					context_googletranslateoption_text:		"Sök översättning",
					popout_translateoption_text:			"Översätt",
					popout_untranslateoption_text:			"Översätt tillbaka",
					translated_watermark_text:				"översatt"
				};
			case "tr":		//turkish
				return {
					context_messagetranslateoption_text:	"Mesajı çevir",
					context_messageuntranslateoption_text:	"İletiyi geri çevir",
					context_googletranslateoption_text:		"Arama tercümesi",
					popout_translateoption_text:			"Çevirmek",
					popout_untranslateoption_text:			"Geri çevir",
					translated_watermark_text:				"tercüme"
				};
			case "cs":		//czech
				return {
					context_messagetranslateoption_text:	"Přeposlat zprávu",
					context_messageuntranslateoption_text:	"Přeposlat zprávu zpátky",
					context_googletranslateoption_text:		"Hledat překlad",
					popout_translateoption_text:			"Přeposlat",
					popout_untranslateoption_text:			"Přeposlat zpět",
					translated_watermark_text:				"přeloženo"
				};
			case "bg":		//bulgarian
				return {
					context_messagetranslateoption_text:	"Преведете на съобщението",
					context_messageuntranslateoption_text:	"Преведете съобщението обратно",
					context_googletranslateoption_text:		"Търсене на превод",
					popout_translateoption_text:			"Превод",
					popout_untranslateoption_text:			"Превод обратно",
					translated_watermark_text:				"преведена"
				};
			case "ru":		//russian
				return {
					context_messagetranslateoption_text:	"Перевести сообщение",
					context_messageuntranslateoption_text:	"Перевести сообщение обратно",
					context_googletranslateoption_text:		"Поиск перевода",
					popout_translateoption_text:			"Перевести",
					popout_untranslateoption_text:			"Перевести обратно",
					translated_watermark_text:				"переведенный"
				};
			case "uk":		//ukrainian
				return {
					context_messagetranslateoption_text:	"Перекласти повідомлення",
					context_messageuntranslateoption_text:	"Перекласти повідомлення назад",
					context_googletranslateoption_text:		"Пошук перекладу",
					popout_translateoption_text:			"Перекласти",
					popout_untranslateoption_text:			"Перекласти назад",
					translated_watermark_text:				"перекладений"
				};
			case "ja":		//japanese
				return {
					context_messagetranslateoption_text:	"メッセージを翻訳する",
					context_messageuntranslateoption_text:	"メッセージを翻訳する",
					context_googletranslateoption_text:		"翻訳の検索",
					popout_translateoption_text:			"翻訳",
					popout_untranslateoption_text:			"翻訳する",
					translated_watermark_text:				"翻訳された"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_messagetranslateoption_text:	"翻譯消息",
					context_messageuntranslateoption_text:	"翻譯消息",
					context_googletranslateoption_text:		"搜索翻譯",
					popout_translateoption_text:			"翻譯",
					popout_untranslateoption_text:			"翻譯回來",
					translated_watermark_text:				"翻譯"
				};
			case "ko":		//korean
				return {
					context_messagetranslateoption_text:	"메시지 번역",
					context_messageuntranslateoption_text:	"메시지 번역 뒤로",
					context_googletranslateoption_text:		"검색 번역",
					popout_translateoption_text:			"다시",
					popout_untranslateoption_text:			"다시 번역",
					translated_watermark_text:				"번역 된"
				};
			default:		//default: english
				return {
					context_messagetranslateoption_text:	"Translate Message",
					context_messageuntranslateoption_text:	"Untranslate Message",
					context_googletranslateoption_text:		"Search translation",
					popout_translateoption_text:			"Translate",
					popout_untranslateoption_text:			"Untranslate",
					translated_watermark_text:				"translated"
				};
		}
	}
}
