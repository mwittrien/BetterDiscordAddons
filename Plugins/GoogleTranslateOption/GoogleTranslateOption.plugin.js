/**
 * @name GoogleTranslateOption
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleTranslateOption
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleTranslateOption/GoogleTranslateOption.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleTranslateOption/GoogleTranslateOption.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "GoogleTranslateOption",
			"author": "DevilBro",
			"version": "2.1.3",
			"description": "Add a Google Translate option to your context menu, which shows a preview of the translated text and on click will open the selected text in Google Translate. Also adds a translation button to your textareas, which will automatically translate the text for you before it is being send"
		}
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it.\n\n${config.info.description}`;}
		
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
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
						});
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
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const translateIconGeneral = `<svg x="0" y="0" aria-hidden="false" width="22" height="22" viewBox="0 -1 24 24" fill="currentColor"><mask/><g mask="url(#translateIconMask)"><path d="M 19.794, 3.299 H 9.765 L 8.797, 0 h -6.598 C 0.99, 0, 0, 0.99, 0, 2.199 V 16.495 c 0, 1.21, 0.99, 2.199, 2.199, 2.199 H 9.897 l 1.1, 3.299 H 19.794 c 1.21, 0, 2.199 -0.99, 2.199 -2.199 V 5.498 C 21.993, 4.289, 21.003, 3.299, 19.794, 3.299 z M 5.68, 13.839 c -2.48, 0 -4.492 -2.018 -4.492 -4.492 s 2.018 -4.492, 4.492 -4.492 c 1.144, 0, 2.183, 0.407, 3.008, 1.171 l 0.071, 0.071 l -1.342, 1.298 l -0.066 -0.06 c -0.313 -0.297 -0.858 -0.643 -1.671 -0.643 c -1.441, 0 -2.612, 1.193 -2.612, 2.661 c 0, 1.468, 1.171, 2.661, 2.612, 2.661 c 1.507, 0, 2.161 -0.962, 2.337 -1.606 h -2.43 v -1.704 h 4.344 l 0.016, 0.077 c 0.044, 0.231, 0.06, 0.434, 0.06, 0.665 C 10.001, 12.036, 8.225, 13.839, 5.68, 13.839 z M 11.739, 9.979 h 4.393 c 0, 0 -0.374, 1.446 -1.715, 3.008 c -0.588 -0.676 -0.995 -1.336 -1.254 -1.864 h -1.089 L 11.739, 9.979 z M 13.625, 13.839 l -0.588, 0.583 l -0.72 -2.452 C 12.685, 12.63, 13.13, 13.262, 13.625, 13.839 z M 20.893, 19.794 c 0, 0.605 -0.495, 1.1 -1.1, 1.1 H 12.096 l 2.199 -2.199 l -0.896 -3.041 l 1.012 -1.012 l 2.953, 2.953 l 0.803 -0.803 l -2.975 -2.953 c 0.99 -1.138, 1.759 -2.474, 2.106 -3.854 h 1.397 V 8.841 H 14.697 v -1.144 h -1.144 v 1.144 H 11.398 l -1.309 -4.443 H 19.794 c 0.605, 0, 1.1, 0.495, 1.1, 1.1 V 19.794 z"/></g><extra/></svg>`;
		const translateIconMask = `<mask id="translateIconMask" fill="black"><path d="M 0 0 H 24 V 24 H 0 Z" fill="white"></path><path d="M24 12 H 12 V 24 H 24 Z" fill="black"></path></mask>`;
		const translateIcon = translateIconGeneral.replace(`<extra/>`, ``).replace(`<mask/>`, ``).replace(` mask="url(#translateIconMask)"`, ``);
		const translateIconUntranslate = translateIconGeneral.replace(`<extra/>`, `<path transform="translate(10, 8)" stroke="#f04747" stroke-width="2" fill="none" d="M 4 4 l 8.666 8.666 m 0 -8.667 l -8.667 8.666 Z"/>`).replace(`<mask/>`, translateIconMask);

		const brailleConverter = {
			"0":"⠴", "1":"⠂", "2":"⠆", "3":"⠒", "4":"⠲", "5":"⠢", "6":"⠖", "7":"⠶", "8":"⠦", "9":"⠔", "!":"⠮", "\"":"⠐", "#":"⠼", "$":"⠫", "%":"⠩", "&":"⠯", "'":"⠄", "(":"⠷", ")":"⠾", "*":"⠡", "+":"⠬", ",":"⠠", "-":"⠤", ".":"⠨", "/":"⠌", ":":"⠱", ";":"⠰", "<":"⠣", "=":"⠿", ">":"⠜", "?":"⠹", "@":"⠈", "a":"⠁", "b":"⠃", "c":"⠉", "d":"⠙", "e":"⠑", "f":"⠋", "g":"⠛", "h":"⠓", "i":"⠊", "j":"⠚", "k":"⠅", "l":"⠇", "m":"⠍", "n":"⠝", "o":"⠕", "p":"⠏", "q":"⠟", "r":"⠗", "s":"⠎", "t":"⠞", "u":"⠥", "v":"⠧", "w":"⠺", "x":"⠭", "y":"⠽", "z":"⠵", "[":"⠪", "\\":"⠳", "]":"⠻", "^":"⠘", "⠁":"a", "⠂":"1", "⠃":"b", "⠄":"'", "⠅":"k", "⠆":"2", "⠇":"l", "⠈":"@", "⠉":"c", "⠊":"i", "⠋":"f", "⠌":"/", "⠍":"m", "⠎":"s", "⠏":"p", "⠐":"\"", "⠑":"e", "⠒":"3", "⠓":"h", "⠔":"9", "⠕":"o", "⠖":"6", "⠗":"r", "⠘":"^", "⠙":"d", "⠚":"j", "⠛":"g", "⠜":">", "⠝":"n", "⠞":"t", "⠟":"q", "⠠":", ", "⠡":"*", "⠢":"5", "⠣":"<", "⠤":"-", "⠥":"u", "⠦":"8", "⠧":"v", "⠨":".", "⠩":"%", "⠪":"[", "⠫":"$", "⠬":"+", "⠭":"x", "⠮":"!", "⠯":"&", "⠰":";", "⠱":":", "⠲":"4", "⠳":"\\", "⠴":"0", "⠵":"z", "⠶":"7", "⠷":"(", "⠸":"_", "⠹":"?", "⠺":"w", "⠻":"]", "⠼":"#", "⠽":"y", "⠾":")", "⠿":"=", "_":"⠸"
		};

		const morseConverter = {
			"0":"−−−−−", "1":"·−−−−", "2":"··−−−", "3":"···−−", "4":"····−", "5":"·····", "6":"−····", "7":"−−···", "8":"−−−··", "9":"−−−−·", "!":"−·−·−−", "\"":"·−··−·", "$":"···−··−", "&":"·−···", "'":"·−−−−·", "(":"−·−−·", ")":"−·−−·−", "+":"·−·−·", ",":"−−··−−", "-":"−····−", ".":"·−·−·−", "/":"−··−·", ":":"−−−···", ";":"−·−·−·", "=":"−···−", "?":"··−−··", "@":"·−−·−·", "a":"·−", "b":"−···", "c":"−·−·", "d":"−··", "e":"·", "f":"··−·", "g":"−−·", "h":"····", "i":"··", "j":"·−−−", "k":"−·−", "l":"·−··", "m":"−−", "n":"−·", "o":"−−−", "p":"·−−·", "q":"−−·−", "r":"·−·", "s":"···", "t":"−", "u":"··−", "v":"···−", "w":"·−−", "x":"−··−", "y":"−·−−", "z":"−−··", "·":"e", "··":"i", "···":"s", "····":"h", "·····":"5", "····−":"4", "···−":"v", "···−··−":"$", "···−−":"3", "··−":"u", "··−·":"f", "··−−··":"?", "··−−·−":"_", "··−−−":"2", "·−":"a", "·−·":"r", "·−··":"l", "·−···":"&", "·−··−·":"\"", "·−·−·":"+", "·−·−·−":".", "·−−":"w", "·−−·":"p", "·−−·−·":"@", "·−−−":"j", "·−−−−":"1", "·−−−−·":"'", "−":"t", "−·":"n", "−··":"d", "−···":"b", "−····":"6", "−····−":"-", "−···−":"=", "−··−":"x", "−··−·":"/", "−·−":"k", "−·−·":"c", "−·−·−·":";", "−·−·−−":"!", "−·−−":"y", "−·−−·":"(", "−·−−·−":")", "−−":"m", "−−·":"g", "−−··":"z", "−−···":"7", "−−··−−":",", "−−·−":"q", "−−−":"o", "−−−··":"8", "−−−···":":", "−−−−·":"9", "−−−−−":"0", "_":"··−−·−"
		};
		
		const googleLanguages = ["af","am","ar","az","be","bg","bn","bs","ca","ceb","co","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fr","fy","ga","gd","gl","gu","ha","haw","hi","hmn","hr","ht","hu","hy","id","ig","is","it","iw","ja","jw","ka","kk","km","kn","ko","ku","ky","la","lb","lo","lt","lv","mg","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","ny","or","pa","pl","ps","pt","ro","ru","rw","sd","si","sk","sl","sm","sn","so","sq","sr","st","su","sv","sw","ta","te","tg","th","tk","tl","tr","tt","ug","uk","ur","uz","vi","xh","yi","yo","zh-CN","zu"];
		const translationEngines = {
			googleapi: 					{name: "GoogleApi",		auto: true,	funcName: "googleApiTranslate",		languages: googleLanguages},
			google: 					{name: "Google",			auto: true,	funcName: "googleTranslate",			languages: googleLanguages},
			itranslate: 				{name: "iTranslate",		auto: true,	funcName: "iTranslateTranslate",		languages: [...new Set(["af","ar","az","be","bg","bn","bs","ca","ceb","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fil","fr","ga","gl","gu","ha","he","hi","hmn","hr","ht","hu","hy","id","ig","is","it","ja","jw","ka","kk","km","kn","ko","la","lo","lt","lv","mg","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","ny","pa","pl","pt-BR","pt-PT","ro","ru","si","sk","sl","so","sq","sr","st","su","sv","sw","ta","te","tg","th","tr","uk","ur","uz","vi","we","yi","yo","zh-CN","zh-TW","zu"].concat(googleLanguages))].sort()},
			yandex: 					{name: "Yandex",			auto: true,	funcName: "yandexTranslate",			languages: ["af","am","ar","az","ba","be","bg","bn","bs","ca","ceb","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fr","ga","gd","gl","gu","he","hi","hr","ht","hu","hy","id","is","it","ja","jv","ka","kk","km","kn","ko","ky","la","lb","lo","lt","lv","mg","mhr","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","pa","pap","pl","pt","ro","ru","si","sk","sl","sq","sr","su","sv","sw","ta","te","tg","th","tl","tr","tt","udm","uk","ur","uz","vi","xh","yi","zh"]},
			papago: 					{name: "Papago",			auto: false,	funcName: "papagoTranslate",			languages: ["en","es","fr","id","ja","ko","th","vi","zh-CN","zh-TW"]}
		};
		
		var languages, translating, isTranslating, translatedMessages, oldMessages;
		var settings = {}, choices = {}, exceptions = {}, engines = {}, favorites = {};
	
		return class GoogleTranslateOption extends Plugin {
			onLoad () {
				languages = {};
				translating = false;
				isTranslating = false;	
				translatedMessages = {};
				oldMessages = {};
				
				this.defaults = {
					settings: {
						addTranslateButton:		{value: true, 			description: "Add an translate button to the chatbar"},
						sendOriginalMessage:	{value: false, 			description: "Send the original message together with the translation"}
					},
					choices: {
						inputContext:			{value: "auto", 			direction: "input",		place: "Context", 		description: "Input Language in received Messages: "},
						outputContext:			{value: "$discord", 		direction: "output",		place: "Context", 		description: "Output Language in received Messages: "},
						inputMessage:			{value: "auto", 			direction: "input",		place: "Message", 		description: "Input Language in sent Messages: "},
						outputMessage:			{value: "$discord", 		direction: "output",		place: "Message", 		description: "Output Language in sent Messages: "}
					},
					exceptions: {
						wordStart:				{value: ["!"],			max: 1,		description: "Words starting with any of these will be ignored"}
					},
					engines: {
						translator:				{value: "googleapi", 	description: "Translation Engine: "}
					}
				};
			
				this.patchedModules = {
					before: {
						ChannelTextAreaForm: "render",
						ChannelEditorContainer: "render",
						Embed: "render"
					},
					after: {
						ChannelTextAreaContainer: "render",
						Messages: "type",
						MessageContent: "type",
						Embed: "render"
					}
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
					}
				`;
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				translating = false;
				
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems = settingsItems.concat(this.createSelects(false));
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
					className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
				}));
				
				for (let key in exceptions) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
					title: this.defaults.exceptions[key].description,
					className: BDFDB.disCN.marginbottom8,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListInput, {
						placeholder: "New Exception",
						maxLength: this.defaults.exceptions[key].max,
						items: exceptions[key],
						onChange: newExceptions => {
							this.SettingsUpdated = true;
							BDFDB.DataUtils.save(newExceptions, this, "exceptions", key);
						}
					})
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}
		
			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				choices = BDFDB.DataUtils.get(this, "choices");
				exceptions = BDFDB.DataUtils.get(this, "exceptions");
				engines = BDFDB.DataUtils.get(this, "engines");
				favorites = BDFDB.DataUtils.load(this, "favorites");
				
				this.setLanguages();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let translated = translatedMessages[e.instance.props.message.id];
					let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Translate_Message") : null;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
					if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["edit", "add-reaction", "quote"]});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
						hint: hint && (_ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							});
						}),
						disabled: !translated && isTranslating,
						action: _ => {
							this.translateMessage(e.instance.props.message, e.instance.props.channel);
						}
					}));
					this.injectSearchItem(e);
				}
			}
			
			onNativeContextMenu (e) {
				this.injectSearchItem(e);
			}
			
			onSlateContextMenu (e) {
				this.injectSearchItem(e);
			}
			
			injectSearchItem (e) {
				let text = document.getSelection().toString();
				if (text) {
					let translating, foundTranslation, foundInput, foundOutput;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["devmode-copy-id", "search-google"], group: true});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search-translation"),
							disabled: isTranslating,
							label: this.labels.context_googletranslateoption,
							persisting: true,
							action: event => {
								let item = BDFDB.DOMUtils.getParent(BDFDB.dotCN.menuitem, event.target);
								if (item) {
									let createTooltip = _ => {
										BDFDB.TooltipUtils.create(item, `From ${foundInput.name}:\n${text}\n\nTo ${foundOutput.name}:\n${foundTranslation}`, {
											type: "right",
											className: "googletranslate-tooltip"
										});
									};
									if (foundTranslation && foundInput && foundOutput) {
										if (document.querySelector(".googletranslate-tooltip")) {
											BDFDB.ContextMenuUtils.close(e.instance);
											BDFDB.DiscordUtils.openLink(this.getGoogleTranslatePageURL(foundInput.id, foundOutput.id, text));
										}
										else createTooltip();
									}
									else if (!translating) {
										translating = true;
										this.translateText(text, "context", (translation, input, output) => {
											if (translation) {
												foundTranslation = translation, foundInput = input, foundOutput = output;
												createTooltip();
											}
										});
									}
								}
							}
						})
					}));
				}
			}
			
			onMessageOptionContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let translated = !!translatedMessages[e.instance.props.message.id];
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
					children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
						disabled: isTranslating,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
						icon: _ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: translated ? translateIconUntranslate : translateIcon
							});
						},
						action: _ => {
							this.translateMessage(e.instance.props.message, e.instance.props.channel);
						}
					}));
				}
			}
		
			onMessageOptionToolbar (e) {
				if (e.instance.props.expanded && e.instance.props.message && e.instance.props.channel) {
					let translated = !!translatedMessages[e.instance.props.message.id];
					e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						key: translated ? "untranslate-message" : "translate-message",
						text: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCN.messagetoolbarbutton,
							onClick: _ => {
								if (!isTranslating) this.translateMessage(e.instance.props.message, e.instance.props.channel);
							},
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.messagetoolbaricon,
								iconSVG: translated ? translateIconUntranslate : translateIcon
							})
						})
					}));
				}
			}
			
			processChannelTextAreaForm (e) {
				BDFDB.PatchUtils.patch(this, e.instance, "handleSendMessage", {instead: e2 => {
					if (translating) {
						e2.stopOriginalMethodCall();
						this.translateText(e2.methodArguments[0], "message", (translation, input, output) => {
							translation = !translation ? e2.methodArguments[0] : (settings.sendOriginalMessage ? (e2.methodArguments[0] + "\n\n" + translation) : translation);
							e2.originalMethod(translation);
						});
						return Promise.resolve({
							shouldClear: true,
							shouldRefocus: true
						});
					}
					else return e2.callOriginalMethodAfterwards();
				}}, {force: true, noCache: true});
			}

			processChannelEditorContainer (e) {
				if (translating && isTranslating) e.instance.props.disabled = true;
			}
			
			processChannelTextAreaContainer (e) {
				if (settings.addTranslateButton) {
					let editor = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ChannelEditorContainer"});
					if (editor && editor.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && !editor.props.disabled) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.textareapickerbuttons]]});
						if (index > -1 && children[index].props && children[index].props.children) children[index].props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PopoutContainer, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ChannelTextAreaButton, {
								key: "translate-button",
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._googletranslateoptiontranslatebutton, translating && BDFDB.disCN._googletranslateoptiontranslating, BDFDB.disCN.textareapickerbutton),
								nativeClass: true,
								iconSVG: translateIconGeneral
							}),
							width: 450,
							padding: 10,
							animation: BDFDB.LibraryComponents.PopoutContainer.Animation.SCALE,
							position: BDFDB.LibraryComponents.PopoutContainer.Positions.TOP,
							align: BDFDB.LibraryComponents.PopoutContainer.Align.RIGHT,
							onClose: instance => {
								let channelTextareaButtonIns = BDFDB.ReactUtils.findOwner(instance, {key: "translate-button"});
								if (channelTextareaButtonIns) {
									channelTextareaButtonIns.props.isActive = false;
									BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
								}
							},
							onContextMenu: (e, instance) => {
								translating = !translating;
								let channelTextareaButtonIns = BDFDB.ReactUtils.findOwner(instance, {key: "translate-button"});
								if (channelTextareaButtonIns) {
									channelTextareaButtonIns.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._googletranslateoptiontranslatebutton, translating && BDFDB.disCN._googletranslateoptiontranslating, BDFDB.disCN.textareapickerbutton);
									BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
									instance.close();
								}
							},
							renderPopout: instance => {
								let channelTextareaButtonIns = BDFDB.ReactUtils.findOwner(instance, {key: "translate-button"});
								if (channelTextareaButtonIns) {
									channelTextareaButtonIns.props.isActive = true;
									BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
								}
								let popoutelements = [];
								if (BDFDB.ArrayUtils.is(exceptions.wordStart) && exceptions.wordStart.length) {
									popoutelements.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										className: BDFDB.disCN.marginbottom8,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
											label: `Words starting with ${exceptions.wordStart.map(n => '"' + n + '"').join(", ")} will be ignored`
										})
									}));
									popoutelements.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
										className: BDFDB.disCN.marginbottom8
									}));
								}
								popoutelements = popoutelements.concat(this.createSelects(true));
								popoutelements.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									type: "Switch",
									plugin: this,
									keys: ["settings", "sendOriginalMessage"],
									label: this.defaults.settings.sendOriginalMessage.description,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: settings.sendOriginalMessage,
									onChange: value => {
										settings.sendOriginalMessage = value;
									}
								}));
								popoutelements.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									label: "Translate your Messages before sending",
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: translating,
									onChange: value => {
										translating = value;
										if (channelTextareaButtonIns) {
											channelTextareaButtonIns.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._googletranslateoptiontranslatebutton, translating && BDFDB.disCN._googletranslateoptiontranslating, BDFDB.disCN.textareapickerbutton);
											BDFDB.ReactUtils.forceUpdate(channelTextareaButtonIns);
										}
									}
								}));
								return popoutelements;
							}
						}));
					}
				}
			}

			processMessages (e) {
				e.returnvalue.props.children.props.channelStream = [].concat(e.returnvalue.props.children.props.channelStream);
				for (let i in e.returnvalue.props.children.props.channelStream) {
					let message = e.returnvalue.props.children.props.channelStream[i].content;
					if (message) {
						if (BDFDB.ArrayUtils.is(message.attachments)) this.checkMessage(e.returnvalue.props.children.props.channelStream[i], message);
						else if (BDFDB.ArrayUtils.is(message)) for (let j in message) {
							let childMessage = message[j].content;
							if (childMessage && BDFDB.ArrayUtils.is(childMessage.attachments)) this.checkMessage(message[j], childMessage);
						}
					}
				}
			}
			
			checkMessage (stream, message) {
				let translation = translatedMessages[message.id];
				if (translation) stream.content.content = translation.content;
				else if (oldMessages[message.id] && Object.keys(message).some(key => !BDFDB.equals(oldMessages[message.id][key], message[key]))) {
					stream.content.content = oldMessages[message.id].content;
					delete oldMessages[message.id];
				}
			}

			processMessageContent (e) {
				if (e.instance.props.message) {
					let translation = translatedMessages[e.instance.props.message.id];
					if (translation) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: `From: ${this.getLanguageName(translation.input)}\nTo: ${this.getLanguageName(translation.output)}`,
						tooltipConfig: {style: "max-width: 400px"},
						children: BDFDB.ReactUtils.createElement("time", {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messageedited, BDFDB.disCN._googletranslateoptiontranslated),
							children: `(${this.labels.translated_watermark})`
						})
					}));
				}
			}

			processEmbed (e) {
				if (e.instance.props.embed && e.instance.props.embed.message_id) {
					let translation = translatedMessages[e.instance.props.embed.message_id];
					if (translation) {
						if (!e.returnvalue) e.instance.props.embed = Object.assign({}, e.instance.props.embed, {
							rawDescription: translation.embeds[e.instance.props.embed.id],
							originalDescription: e.instance.props.embed.originalDescription || e.instance.props.embed.rawDescription
						});
						else {
							let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.embeddescription]]});
							if (index > -1) children[index].props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: `From: ${this.getLanguageName(translation.input)}\nTo: ${this.getLanguageName(translation.output)}`,
								tooltipConfig: {style: "max-width: 400px"},
								children: BDFDB.ReactUtils.createElement("time", {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messageedited, BDFDB.disCN._googletranslateoptiontranslated),
									children: `(${this.labels.translated_watermark})`
								})
							}));
						}
					}
					else if (!e.returnvalue && e.instance.props.embed.originalDescription) {
						e.instance.props.embed = Object.assign({}, e.instance.props.embed, {rawDescription: e.instance.props.embed.originalDescription});
						delete e.instance.props.embed.originalDescription;
					}
				}
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
								
								choices["input" + place] = output;
								choices["output" + place] = input;
								BDFDB.DataUtils.save(choices, this, "choices");
								
								for (let selectIns of BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(e._targetInst, {name: ["BDFDB_Popout", "BDFDB_SettingsPanel"], up: true}), {name: "BDFDB_Select", all: true, noCopies: true})) if (selectIns && selectIns.props && selectIns.props.id && this.defaults.choices[selectIns.props.id] && this.defaults.choices[selectIns.props.id].place == place) {
									selectIns.props.value = this.defaults.choices[selectIns.props.id].direction == "input" ? output : input;
									BDFDB.ReactUtils.forceUpdate(selectIns);
								}
								this.setLanguages();
							},
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN._googletranslateoptionreversebutton,
								iconSVG: `<svg width="21" height="21" fill="currentColor"><path d="M 0, 10.515 c 0, 2.892, 1.183, 5.521, 3.155, 7.361 L 0, 21.031 h 7.887 V 13.144 l -2.892, 2.892 C 3.549, 14.722, 2.629, 12.75, 2.629, 10.515 c 0 -3.418, 2.235 -6.309, 5.258 -7.492 v -2.629 C 3.418, 1.577, 0, 5.652, 0, 10.515 z M 21.031, 0 H 13.144 v 7.887 l 2.892 -2.892 C 17.482, 6.309, 18.402, 8.281, 18.402, 10.515 c 0, 3.418 -2.235, 6.309 -5.258, 7.492 V 20.768 c 4.469 -1.183, 7.887 -5.258, 7.887 -10.121 c 0 -2.892 -1.183 -5.521 -3.155 -7.361 L 21.031, 0 z"/></svg>`
							})
						}) : null,
						className: BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
							menuPlacement: inPopout ? BDFDB.LibraryComponents.Select.MenuPlacements.TOP : BDFDB.LibraryComponents.Select.MenuPlacements.BOTTOM,
							value: this.getLanguageChoice(key),
							id: key,
							options: BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(isOutput ? BDFDB.ObjectUtils.filter(languages, lang => lang.id != "auto") : languages, (lang, id) => {return {value: id, label: this.getLanguageName(lang)}})),
							searchable: true,
							optionRenderer: lang => {
								return languages[lang.value] ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									align: BDFDB.LibraryComponents.Flex.Align.CENTER,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											grow: 1,
											children: lang.label
										}),
										inPopout ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
											isFavorite: languages[lang.value].fav == 0,
											onClick: value => {
												if (value) favorites[lang.value] = true;
												else delete favorites[lang.value];
												BDFDB.DataUtils.save(favorites, this, "favorites");
												this.setLanguages();
											}
										}) : null
									]
								}) : null;
							},
							onChange: lang => {
								choices[key] = lang.value;
								BDFDB.DataUtils.save(choices, this, "choices");
							}
						})
					}));
					if (isOutput) selects.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCN.marginbottom8
					}));
				}
				for (let key in engines) selects.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
					title: this.defaults.engines[key].description,
					className: BDFDB.disCN.marginbottom8,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
						menuPlacement: inPopout ? BDFDB.LibraryComponents.Select.MenuPlacements.TOP : BDFDB.LibraryComponents.Select.MenuPlacements.BOTTOM,
						value: engines[key],
						id: key,
						options: Object.keys(translationEngines).map(engineKey => {return {value: engineKey, label: translationEngines[engineKey].name}}),
						searchable: true,
						onChange: (engine, instance) => {
							engines[key] = engine.value;
							BDFDB.DataUtils.save(engines, this, "engines");
							this.setLanguages();
							let popoutInstance = BDFDB.ReactUtils.findOwner(instance, {name: "BDFDB_PopoutContainer", up: true});
							if (popoutInstance) {
								popoutInstance.close();
								popoutInstance.handleClick();
							}
						}
					})
				}));
				return selects;
			}

			setLanguages () {
				let engine = translationEngines[engines.translator] || {};
				let languageIds = engine.languages || [];
				languages = BDFDB.ObjectUtils.deepAssign(
					!engine.auto ? {} : {
						auto: {
							name: "Auto",
							id: "auto"
						}
					},
					BDFDB.ObjectUtils.filter(BDFDB.LanguageUtils.languages, lang => languageIds.includes(lang.id)),
					{
						binary:	{
							name: "Binary",
							id: "binary"
						},
						braille: {
							name: "Braille 6-dot",
							id: "braille"
						},
						morse: {
							name: "Morse",
							id: "morse"
						}
					}
				);
				for (let id in languages) languages[id].fav = favorites[id] != undefined ? 0 : 1;
				languages = BDFDB.ObjectUtils.sort(languages, "fav");
			}

			getLanguageChoice (direction, place) {
				this.setLanguages();
				let type = place === undefined ? direction : direction.toLowerCase() + place.charAt(0).toUpperCase() + place.slice(1).toLowerCase();
				let choice = choices[type];
				choice = languages[choice] ? choice : Object.keys(languages)[0];
				choice = type.indexOf("output") > -1 && choice == "auto" ? "en" : choice;
				return choice;
			}

			translateMessage (message, channel) {
				if (!message) return;
				if (translatedMessages[message.id]) {
					delete translatedMessages[message.id];
					BDFDB.MessageUtils.rerenderAll(true);
				}
				else {
					let content = message.content || "";
					for (let embed of message.embeds) content += ("\n__________________ __________________ __________________\n" + embed.rawDescription);
					this.translateText(content, "context", (translation, input, output) => {
						if (translation) {
							oldMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
							let strings = translation.split("\n__________________ __________________ __________________\n");
							let content = strings.shift().trim(), embeds = {};
							for (let i in message.embeds) {
								message.embeds[i].message_id = message.id;
								embeds[message.embeds[i].id] = (strings.shift() || message.embeds[i].rawDescription).trim();
							}
							translatedMessages[message.id] = {content, embeds, input, output};
							BDFDB.MessageUtils.rerenderAll(true);
						}
					});
				}
			}

			translateText (text, type, callback) {
				let toast = null, finishTranslation = translation => {
					isTranslating = false;
					if (translation) translation = this.addExceptions(translation, excepts);
					if (toast) {
						BDFDB.TimeUtils.clear(toast.interval);
						toast.close();
					}
					callback(translation == text ? "" : translation, input, output);
				};
				let [newText, excepts, translate] = this.removeExceptions(text.trim(), type);
				let input = Object.assign({}, languages[this.getLanguageChoice("input", type)]);
				let output = Object.assign({}, languages[this.getLanguageChoice("output", type)]);
				if (translate && input.id != output.id) {
					let timer = 0;
					toast = BDFDB.NotificationUtils.toast("Translating. Please wait", {timeout: 0});
					toast.interval = BDFDB.TimeUtils.interval(_ => {
						if (timer++ > 40) {
							finishTranslation("");
							BDFDB.NotificationUtils.toast("Failed to translate text. Try another Translate Engine.", {type: "error"});
						}
						else toast.textContent = toast.textContent.indexOf(".....") > -1 ? "Translating. Please wait" : toast.textContent + ".";
					}, 500);
					let specialCase = this.checkForSpecialCase(newText, input);
					if (specialCase) {
						input.name = specialCase.name;
						switch (specialCase.id) {
							case "binary": newText = this.binary2string(newText); break;
							case "braille": newText = this.braille2string(newText); break;
							case "morse": newText = this.morse2string(newText); break;
						}
					}
					if (output.id == "binary" || output.id == "braille" || output.id == "morse") {
						switch (output.id) {
							case "binary": newText = this.string2binary(newText); break;
							case "braille": newText = this.string2braille(newText); break;
							case "morse": newText = this.string2morse(newText); break;
						}
						finishTranslation(newText);
					}
					else {
						if (translationEngines[engines.translator] && typeof this[translationEngines[engines.translator].funcName] == "function") {
							isTranslating = true;
							this[translationEngines[engines.translator].funcName].apply(this, [{input, output, text: newText, specialCase, engine: translationEngines[engines.translator]}, finishTranslation]);
						}
						else finishTranslation();
					}
				}
				else finishTranslation();
			}
			
			googleTranslate (data, callback) {
				let googleTranslateWindow = BDFDB.WindowUtils.open(this, this.getGoogleTranslatePageURL(data.input.id, data.output.id, data.text), {
					onLoad: _ => {
						googleTranslateWindow.executeJavaScriptSafe(`
							require("electron").ipcRenderer.sendTo(${BDFDB.LibraryRequires.electron.remote.getCurrentWindow().webContents.id}, "GTO-translation", [
								Array.from(document.querySelectorAll("[data-language-to-translate-into] span:not([class])")).map(n => n.innerText).join(""),
								(document.querySelector("h2 ~ [lang]") || {}).lang
							]);
						`);
					}
				});
				BDFDB.WindowUtils.addListener(this, "GTO-translation", (event, messageData) => {
					BDFDB.WindowUtils.close(googleTranslateWindow);
					BDFDB.WindowUtils.removeListener(this, "GTO-translation");
					if (!data.specialCase && messageData[1] && languages[messageData[1]]) {
						data.input.name = languages[messageData[1]].name;
						data.input.ownlang = languages[messageData[1]].ownlang;
					}
					callback(messageData[0]);
				});
			}
			
			googleApiTranslate (data, callback) {
				BDFDB.LibraryRequires.request(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${data.input.id}&tl=${data.output.id}&dt=t&dj=1&source=input&q=${encodeURIComponent(data.text)}`, (error, response, result) => {
					if (!error && result && response.statusCode == 200) {
						try {
							result = JSON.parse(result);
							if (!data.specialCase && result.src && result.src && languages[result.src]) {
								data.input.name = languages[result.src].name;
								data.input.ownlang = languages[result.src].ownlang;
							}
							callback(result.sentences.map(n => n && n.trans).filter(n => n).join(""));
						}
						catch (err) {callback("");}
					}
					else {
						if (response.statusCode == 429) BDFDB_Global.NotificationUtils.toast("Failed to translate text. Request Limit per Hour is reached. Choose another Translate Engine.", {type: "error"});
						else BDFDB.NotificationUtils.toast("Failed to translate text. Translation Server might be down. Try another Translate Engine.", {type: "error"});
						callback("");
					}
				});
			}
			
			iTranslateTranslate (data, callback) {
				let translate = _ => {
					BDFDB.LibraryRequires.request({
						method: "POST",
						url: "https://web-api.itranslateapp.com/v3/texts/translate",
						headers: {
							"API-KEY": data.engine.APIkey
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
								result = JSON.parse(result);
								if (!data.specialCase && result.source && result.source.dialect && languages[result.source.dialect]) {
									data.input.name = languages[result.source.dialect].name;
									data.input.ownlang = languages[result.source.dialect].ownlang;
								}
								callback(result.target.text);
							}
							catch (err) {callback("");}
						}
						else {
							BDFDB.NotificationUtils.toast("Failed to translate text. Translation Server is down or API-key outdated. Try another Translate Engine.", {type: "error"});
							callback("");
						}
					});
				};
				if (data.engine.APIkey) translate();
				else BDFDB.LibraryRequires.request("https://www.itranslate.com/js/webapp/main.js", {gzip: true}, (error, response, result) => {
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
				BDFDB.LibraryRequires.request(`https://translate.yandex.net/api/v1.5/tr/translate?key=trnsl.1.1.20191206T223907Z.52bd512eca953a5b.1ec123ce4dcab3ae859f312d27cdc8609ab280de&text=${encodeURIComponent(data.text)}&lang=${data.specialCase || data.input.id == "auto" ? data.output.id : (data.input.id + "-" + data.output.id)}&options=1`, (error, response, result) => {
					if (!error && result && response.statusCode == 200) {
						result = BDFDB.DOMUtils.create(result);
						let translation = result.querySelector("text");
						let detected = result.querySelector("detected");
						if (translation && detected) {
							let detectedLang = detected.getAttribute("lang");
							if (!data.specialCase && detectedLang && languages[detectedLang]) {
								data.input.name = languages[detectedLang].name;
								data.input.ownlang = languages[detectedLang].ownlang;
							}
							callback(translation.innerText);
						}
						else callback("");
					}
					if (result && result.indexOf('code="408"') > -1) {
						BDFDB.NotificationUtils.toast("Failed to translate text. Monthly rate limit reached. Choose another Translate Engine", {type: "error"});
						callback("");
					}
					else {
						BDFDB.NotificationUtils.toast("Failed to translate text. Translation Server is down or API-key outdated. Try another Translate Engine.", {type: "error"});
						callback("");
					}
				});
			}
			
			papagoTranslate (data, callback) {
				BDFDB.LibraryRequires.request.post({
					url: "https://openapi.naver.com/v1/papago/n2mt",
					form: {
						source: data.input.id,
						target: data.output.id,
						text: data.text
					},
					headers: {
						"X-Naver-Client-Id": "kUNGxtAmTJQFbaFehdjk",
						"X-Naver-Client-Secret": "zC70k3VhpM"
					}
				}, (error, response, result) => {
					if (!error && result && response.statusCode == 200) {
						try {
							let message = (JSON.parse(result) || {}).message;
							if (message && message.result && message.result.translatedText) callback(message.result.translatedText);
							else callback("");
						}
						catch (err) {callback("");}
					}
					else {
						BDFDB.NotificationUtils.toast("Failed to translate text. Translation Server is down, daily limited reached or API-key outdated. Try another Translate Engine.", {type: "error"});
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
				let binary = "";
				for (let character of string) binary += parseInt(character.charCodeAt(0).toString(2)).toPrecision(8).split(".").reverse().join("").toString() + " ";
				return binary;
			}

			string2braille (string) {
				let braille = "";
				for (let character of string) braille += brailleConverter[character.toLowerCase()] ? brailleConverter[character.toLowerCase()] : character;
				return braille;
			}

			string2morse (string) {
				string = string.replace(/ /g, "%%%%%%%%%%");
				let morse = "";
				for (let character of string) morse += (morseConverter[character.toLowerCase()] ? morseConverter[character.toLowerCase()] : character) + " ";
				morse = morse.split("\n");
				for (let i in morse) morse[i] = morse[i].trim();
				return morse.join("\n").replace(/% % % % % % % % % % /g, "/ ");
			}

			binary2string (binary) {
				let string = "";
				binary = binary.replace(/\n/g, "00001010").replace(/\r/g, "00001101").replace(/\t/g, "00001001").replace(/\s/g, "");
				if (/^[0-1]*$/.test(binary)) {
					let eightdigits = "";
					let counter = 0;
					for (let digit of binary) {
						eightdigits += digit;
						counter++;
						if (counter > 7) {
							string += String.fromCharCode(parseInt(eightdigits,2).toString(10));
							eightdigits = "";
							counter = 0;
						}
					}
				}
				else BDFDB.NotificationUtils.toast("Invalid binary format. Only use 0s and 1s.", {type: "error"});
				return string;
			}

			braille2string (braille) {
				let string = "";
				for (let character of braille) string += brailleConverter[character.toLowerCase()] ? brailleConverter[character.toLowerCase()] : character;
				return string;
			}

			morse2string (morse) {
				let string = "";
				for (let word of morse.replace(/[_-]/g, "−").replace(/\./g, "·").replace(/\r|\t/g, "").split(/\/|\||\n/g)) {
					for (let characterstr of word.trim().split(" ")) string += morseConverter[characterstr] ? morseConverter[characterstr] : characterstr;
					string += " ";
				}
				return string.trim();
			}

			addExceptions (string, excepts) {
				for (let count in excepts) {
					let exception = BDFDB.ArrayUtils.is(exceptions.wordStart) && exceptions.wordStart.some(n => excepts[count].indexOf(n) == 0) ? excepts[count].slice(1) : excepts[count];
					let newstring = string.replace(new RegExp(`\[/////[ ]*${count}\]`), exception);
					if (newstring == string) string = newstring + " " + exception;
					else string = newstring;
				}
				return string;
			}

			removeExceptions (string, type) {
				let excepts = {}, newString = [], count = 0;
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
							excepts[count] = text[j];
							count++;
						}
						else newString.push(text[j]);
					}
				}
				else {
					let usedExceptions = BDFDB.ArrayUtils.is(exceptions.wordStart) ? exceptions.wordStart : [];
					string.split(" ").forEach(word => {
						if (word.indexOf("<@!") == 0 || word.indexOf("<#") == 0 || word.indexOf(":") == 0 || word.indexOf("<:") == 0 || word.indexOf("<a: ") == 0 || word.indexOf("@") == 0 || word.indexOf("#") == 0 || usedExceptions.some(n => word.indexOf(n) == 0 && word.length > 1)) {
							newString.push(`[/////${count}]`);
							excepts[count] = word;
							count++;
						}
						else newString.push(word);
					});
				}
				return [newString.join(" "), excepts, newString.length-count != 0];
			}

			getGoogleTranslatePageURL (input, output, text) {
				return `https://translate.google.com/#${BDFDB.LanguageUtils.languages[input] ? input : "auto"}/${output}/${encodeURIComponent(text)}`;
			}
			
			getLanguageName (language) {
				if (language.name.startsWith("Discord")) return language.name.slice(0, -1) + (language.ownlang && languages[language.id].name != language.ownlang ? ` / ${language.ownlang}` : "") + ")";
				else return language.name + (language.ownlang && language.name != language.ownlang ? ` / ${language.ownlang}` : "");
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_googletranslateoption:		"Търсене превод",
							context_messagetranslateoption:		"Превод на съобщението",
							context_messageuntranslateoption:	"Превод на съобщението",
							popout_translateoption:				"Превод",
							popout_untranslateoption:			"Непревод",
							translated_watermark:				"преведено"
						};
					case "da":		// Danish
						return {
							context_googletranslateoption:		"Søg oversættelse",
							context_messagetranslateoption:		"Oversæt besked",
							context_messageuntranslateoption:	"Ikke-oversat besked",
							popout_translateoption:				"Oversætte",
							popout_untranslateoption:			"Untranslate",
							translated_watermark:				"oversat"
						};
					case "de":		// German
						return {
							context_googletranslateoption:		"Übersetzung suchen",
							context_messagetranslateoption:		"Nachricht übersetzen",
							context_messageuntranslateoption:	"Nachricht unübersetzen",
							popout_translateoption:				"Übersetzen",
							popout_untranslateoption:			"Unübersetzen",
							translated_watermark:				"übersetzt"
						};
					case "el":		// Greek
						return {
							context_googletranslateoption:		"Αναζήτηση μετάφρασης",
							context_messagetranslateoption:		"Μετάφραση μηνύματος",
							context_messageuntranslateoption:	"Μη μετάφραση μηνύματος",
							popout_translateoption:				"Μεταφράζω",
							popout_untranslateoption:			"Μη μετάφραση",
							translated_watermark:				"μεταφρασμένο"
						};
					case "es":		// Spanish
						return {
							context_googletranslateoption:		"Buscar traducción",
							context_messagetranslateoption:		"Traducir mensaje",
							context_messageuntranslateoption:	"Mensaje sin traducir",
							popout_translateoption:				"Traducir",
							popout_untranslateoption:			"No traducir",
							translated_watermark:				"traducido"
						};
					case "fi":		// Finnish
						return {
							context_googletranslateoption:		"Hae käännöstä",
							context_messagetranslateoption:		"Käännä viesti",
							context_messageuntranslateoption:	"Käännä viesti",
							popout_translateoption:				"Kääntää",
							popout_untranslateoption:			"Käännä",
							translated_watermark:				"käännetty"
						};
					case "fr":		// French
						return {
							context_googletranslateoption:		"Recherche de traduction",
							context_messagetranslateoption:		"Traduire le message",
							context_messageuntranslateoption:	"Message non traduit",
							popout_translateoption:				"Traduire",
							popout_untranslateoption:			"Non traduit",
							translated_watermark:				"traduit"
						};
					case "hr":		// Croatian
						return {
							context_googletranslateoption:		"Pretraži prijevod",
							context_messagetranslateoption:		"Prevedi poruku",
							context_messageuntranslateoption:	"Prevedi poruku",
							popout_translateoption:				"Prevedi",
							popout_untranslateoption:			"Neprevedi",
							translated_watermark:				"prevedeno"
						};
					case "hu":		// Hungarian
						return {
							context_googletranslateoption:		"Keresés a fordításban",
							context_messagetranslateoption:		"Üzenet lefordítása",
							context_messageuntranslateoption:	"Az üzenet lefordítása",
							popout_translateoption:				"fordít",
							popout_untranslateoption:			"Fordítás le",
							translated_watermark:				"lefordított"
						};
					case "it":		// Italian
						return {
							context_googletranslateoption:		"Cerca traduzione",
							context_messagetranslateoption:		"Traduci messaggio",
							context_messageuntranslateoption:	"Annulla traduzione messaggio",
							popout_translateoption:				"Tradurre",
							popout_untranslateoption:			"Non tradurre",
							translated_watermark:				"tradotto"
						};
					case "ja":		// Japanese
						return {
							context_googletranslateoption:		"翻訳を検索",
							context_messagetranslateoption:		"メッセージの翻訳",
							context_messageuntranslateoption:	"メッセージの翻訳解除",
							popout_translateoption:				"翻訳する",
							popout_untranslateoption:			"翻訳しない",
							translated_watermark:				"翻訳済み"
						};
					case "ko":		// Korean
						return {
							context_googletranslateoption:		"번역 검색",
							context_messagetranslateoption:		"메시지 번역",
							context_messageuntranslateoption:	"메시지 번역 취소",
							popout_translateoption:				"옮기다",
							popout_untranslateoption:			"번역 취소",
							translated_watermark:				"번역"
						};
					case "lt":		// Lithuanian
						return {
							context_googletranslateoption:		"Paieškos vertimas",
							context_messagetranslateoption:		"Versti pranešimą",
							context_messageuntranslateoption:	"Išversti pranešimą",
							popout_translateoption:				"Išversti",
							popout_untranslateoption:			"Neišversti",
							translated_watermark:				"išverstas"
						};
					case "nl":		// Dutch
						return {
							context_googletranslateoption:		"Zoek vertaling",
							context_messagetranslateoption:		"Bericht vertalen",
							context_messageuntranslateoption:	"Bericht onvertalen",
							popout_translateoption:				"Vertalen",
							popout_untranslateoption:			"Onvertalen",
							translated_watermark:				"vertaald"
						};
					case "no":		// Norwegian
						return {
							context_googletranslateoption:		"Søk i oversettelse",
							context_messagetranslateoption:		"Oversett melding",
							context_messageuntranslateoption:	"Ikke oversett melding",
							popout_translateoption:				"Oversette",
							popout_untranslateoption:			"Ikke oversett",
							translated_watermark:				"oversatt"
						};
					case "pl":		// Polish
						return {
							context_googletranslateoption:		"Wyszukaj tłumaczenie",
							context_messagetranslateoption:		"Przetłumacz wiadomość",
							context_messageuntranslateoption:	"Nieprzetłumacz wiadomość",
							popout_translateoption:				"Tłumaczyć",
							popout_untranslateoption:			"Nie przetłumacz",
							translated_watermark:				"przetłumaczony"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_googletranslateoption:		"Tradução de pesquisa",
							context_messagetranslateoption:		"Traduzir mensagem",
							context_messageuntranslateoption:	"Mensagem não traduzida",
							popout_translateoption:				"Traduzir",
							popout_untranslateoption:			"Não traduzido",
							translated_watermark:				"traduzido"
						};
					case "ro":		// Romanian
						return {
							context_googletranslateoption:		"Căutare traducere",
							context_messagetranslateoption:		"Traduceți mesajul",
							context_messageuntranslateoption:	"Untraduceți mesajul",
							popout_translateoption:				"Traduceți",
							popout_untranslateoption:			"Netradus",
							translated_watermark:				"tradus"
						};
					case "ru":		// Russian
						return {
							context_googletranslateoption:		"Искать перевод",
							context_messagetranslateoption:		"Перевести сообщение",
							context_messageuntranslateoption:	"Непереведенное сообщение",
							popout_translateoption:				"Переведите",
							popout_untranslateoption:			"Неперевести",
							translated_watermark:				"переведено"
						};
					case "sv":		// Swedish
						return {
							context_googletranslateoption:		"Sök översättning",
							context_messagetranslateoption:		"Översätt meddelande",
							context_messageuntranslateoption:	"Untranslate meddelande",
							popout_translateoption:				"Översätt",
							popout_untranslateoption:			"Untranslate",
							translated_watermark:				"översatt"
						};
					case "th":		// Thai
						return {
							context_googletranslateoption:		"ค้นหาคำแปล",
							context_messagetranslateoption:		"แปลข้อความ",
							context_messageuntranslateoption:	"ยกเลิกการแปลข้อความ",
							popout_translateoption:				"แปลภาษา",
							popout_untranslateoption:			"ไม่แปล",
							translated_watermark:				"แปล"
						};
					case "tr":		// Turkish
						return {
							context_googletranslateoption:		"Çeviri ara",
							context_messagetranslateoption:		"Mesajı Çevir",
							context_messageuntranslateoption:	"Çeviriyi Kaldır Mesajı",
							popout_translateoption:				"Çevirmek",
							popout_untranslateoption:			"Çevirmeyi kaldır",
							translated_watermark:				"tercüme"
						};
					case "uk":		// Ukrainian
						return {
							context_googletranslateoption:		"Пошук перекладу",
							context_messagetranslateoption:		"Перекласти повідомлення",
							context_messageuntranslateoption:	"Неперекладене повідомлення",
							popout_translateoption:				"Перекласти",
							popout_untranslateoption:			"Неперекласти",
							translated_watermark:				"переклав"
						};
					case "vi":		// Vietnamese
						return {
							context_googletranslateoption:		"Tìm kiếm bản dịch",
							context_messagetranslateoption:		"Dịch tin nhắn",
							context_messageuntranslateoption:	"Thư chưa dịch",
							popout_translateoption:				"Phiên dịch",
							popout_untranslateoption:			"Chưa dịch",
							translated_watermark:				"đã dịch"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_googletranslateoption:		"搜索翻译",
							context_messagetranslateoption:		"翻译消息",
							context_messageuntranslateoption:	"取消翻译消息",
							popout_translateoption:				"翻译",
							popout_untranslateoption:			"取消翻译",
							translated_watermark:				"已翻译"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_googletranslateoption:		"搜索翻譯",
							context_messagetranslateoption:		"翻譯訊息",
							context_messageuntranslateoption:	"取消翻譯訊息",
							popout_translateoption:				"翻譯",
							popout_untranslateoption:			"取消翻譯",
							translated_watermark:				"已翻譯"
						};
					default:		// English
						return {
							context_googletranslateoption:		"Search translation",
							context_messagetranslateoption:		"Translate Message",
							context_messageuntranslateoption:	"Untranslate Message",
							popout_translateoption:				"Translate",
							popout_untranslateoption:			"Untranslate",
							translated_watermark:				"translated"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();