/**
 * @name ChatFilter
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ChatFilter
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ChatFilter/ChatFilter.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ChatFilter/ChatFilter.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ChatFilter",
			"author": "DevilBro",
			"version": "3.4.4",
			"description": "Allow the user to censor words or block complete messages based on words in the chatwindow"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName() {return config.info.name;}
		getAuthor() {return config.info.author;}
		getVersion() {return config.info.version;}
		getDescription() {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var oldBlockedMessages, oldCensoredMessages, words;
		var settings = {}, replaces = {}, configs = {};
	
		return class ChatFilter extends Plugin {
			onLoad() {
				this.defaults = {
					configs: {
						empty: 		{value: false,		description: "Allow the replacevalue to be empty (ignoring the default)"},
						case: 		{value: false,		description: "Handle the wordvalue case sensitive"},
						exact: 		{value: true,		description: "Handle the wordvalue as an exact word and not as part of a word"},
						regex: 		{value: false,		description: "Handle the wordvalue as a RegExp string"}
					},
					replaces: {
						blocked: 	{value: "~~BLOCKED~~",		description: "Default replaceword for blocked messages: "},
						censored:	{value: "$!%&%!&",			description: "Default replaceword for censored messages: "}
					},
					settings: {
						addContextMenu:			{value: true,	description: "Add a contextmenu entry to faster add new blocked/censored words: "}
					}
				};
			
				this.patchedModules = {
					after: {
						Messages: "type",
						Message: "default",
						MessageContent: "type"
					}
				};
				
				this.css = ` 
					${BDFDB.dotCN.message + BDFDB.dotCNS._chatfilterblocked + BDFDB.dotCN.messagemarkup} {
						color: ${BDFDB.DiscordConstants.Colors.STATUS_RED};
					}
				`;
				
			}
			
			onStart() {
				words = BDFDB.DataUtils.load(this, "words");
				for (let rType in this.defaults.replaces) if (!BDFDB.ObjectUtils.is(words[rType])) words[rType] = {};
				
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Settings",
					collapseStates: collapseStates,
					children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					})).concat(Object.keys(replaces).map(rType => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "TextInput",
						plugin: this,
						keys: ["replaces", rType],
						label: this.defaults.replaces[rType].description,
						value: replaces[rType],
						placeholder: this.defaults.replaces[rType].value
					})))
				}));
				let values = {wordvalue: "", replacevalue: "", choice: "blocked"};
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: `Add new blocked/censored word`,
					collapseStates: collapseStates,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							label: "Pick a wordvalue and replacevalue:",
							key: "ADDBUTTON",
							disabled: !Object.keys(values).every(valuename => values[valuename]),
							children: BDFDB.LanguageUtils.LanguageStrings.ADD,
							onClick: _ => {
								this.saveWord(values);
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							}
						}),
						this.createInputs(values)
					].flat(10).filter(n => n)
				}));
				for (let rType in replaces) if (!BDFDB.ObjectUtils.isEmpty(words[rType])) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: `Added ${rType} words`,
					collapseStates: collapseStates,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
						settings: Object.keys(this.defaults.configs),
						data: Object.keys(words[rType]).map(wordvalue => Object.assign({}, words[rType][wordvalue], {
							key: wordvalue,
							label: wordvalue
						})),
						renderLabel: data => BDFDB.ReactUtils.createElement("div", {
							style: {width: "100%"},
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.label,
									placeholder: data.label,
									size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
									maxLength: 100000000000000000000,
									onChange: value => {
										words[rType][value] = words[rType][data.label];
										delete words[rType][data.label];
										data.label = value;
										BDFDB.DataUtils.save(words, this, "words");
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.replace,
									placeholder: data.replace,
									size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
									maxLength: 100000000000000000000,
									onChange: value => {
										words[rType][data.label].replace = value;
										BDFDB.DataUtils.save(words, this, "words");
									}
								})
							]
						}),
						onCheckboxChange: (value, instance) => {
							words[rType][instance.props.cardId][instance.props.settingId] = value;
							BDFDB.DataUtils.save(words, this, "words");
						},
						onRemove: (e, instance) => {
							delete words[rType][instance.props.cardId];
							BDFDB.DataUtils.save(words, this, "words");
							BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
						}
					})
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Remove All",
					collapseStates: collapseStates,
					children: Object.keys(replaces).map(rType => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						color: BDFDB.LibraryComponents.Button.Colors.RED,
						label: `Remove all ${rType} words`,
						onClick: _ => {
							BDFDB.ModalUtils.confirm(this, `Are you sure you want to remove all ${rType} words?`, _ => {
								words[rType] = {};
								BDFDB.DataUtils.remove(this, "words", rType);
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							});
						},
						children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
					}))
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Config Guide",
					collapseStates: collapseStates,
					children: [
						"Case: Will block/censor words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe",
						"Not Case: Will block/censor words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe",
						"Exact: Will block/censor words that are exactly the selected word. apple => apple, not applepie or pineapple",
						"Not Exact: Will block/censor all words containing the selected word. apple => apple, applepie and pineapple",
						"Empty: Ignores the default and set replace word and removes the word/message instead.",
						[
							"Regex: Will treat the entered wordvalue as a regular expression. ",
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {href: "https://regexr.com/", children: BDFDB.LanguageUtils.LanguageStrings.HELP + "?"})
						],
					].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
						type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
						children: string
					}))
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed() {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll() {
				settings = BDFDB.DataUtils.get(this, "settings");
				replaces = BDFDB.DataUtils.get(this, "replaces");
				configs = BDFDB.DataUtils.get(this, "configs");
					
				oldBlockedMessages = {};
				oldCensoredMessages = {};
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onNativeContextMenu (e) {
				if (e.instance.props.value && e.instance.props.value.trim()) {
					if ((e.instance.props.type == "NATIVE_TEXT" || e.instance.props.type == "CHANNEL_TEXT_AREA") && settings.addContextMenu) this.injectItem(e, e.instance.props.value.trim());
				}
			}

			onSlateContextMenu (e) {
				let text = document.getSelection().toString().trim();
				if (text && settings.addContextMenu) this.injectItem(e, text);
			}

			onMessageContextMenu (e) {
				let text = document.getSelection().toString().trim();
				if (text && settings.addContextMenu) this.injectItem(e, text);
			}
		 
			injectItem (e, text) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LibraryStringsFormat("add_to", "ChatFilter"),
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "add-filter"),
						action: _ => {
							this.openAddModal(text.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"));
						}
					})
				}));
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
				let {blocked, censored, content} = this.parseMessage(message);
				if (blocked) {
					if (!oldBlockedMessages[message.id]) oldBlockedMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
					stream.content.content = content;
					stream.content.embeds = [];
				}
				else if (oldBlockedMessages[message.id] && Object.keys(message).some(key => !BDFDB.equals(oldBlockedMessages[message.id][key], message[key]))) {
					stream.content.content = oldBlockedMessages[message.id].content;
					stream.content.embeds = oldBlockedMessages[message.id].embeds;
					delete oldBlockedMessages[message.id];
				}
				if (censored) {
					if (!oldCensoredMessages[message.id]) oldCensoredMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
					stream.content.content = content;
				}
				else if (oldCensoredMessages[message.id] && Object.keys(message).some(key => !BDFDB.equals(oldCensoredMessages[message.id][key], message[key]))) {
					stream.content.content = oldCensoredMessages[message.id].content;
					delete oldCensoredMessages[message.id];
				}
			}

			processMessage (e) {
				let message = BDFDB.ObjectUtils.get(e, "instance.props.childrenMessageContent.props.message");
				if (message) {
					if (oldBlockedMessages[message.id]) e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.disCN._chatfilterblocked);
					else if (oldCensoredMessages[message.id]) e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.disCN._chatfiltercensored);
				}
			}

			processMessageContent (e) {
				if (e.instance.props.message) {
					if (oldBlockedMessages[e.instance.props.message.id]) e.returnvalue.props.children.push(this.createStamp(oldBlockedMessages[e.instance.props.message.id].content, "blocked"));
					else if (oldCensoredMessages[e.instance.props.message.id]) e.returnvalue.props.children.push(this.createStamp(oldCensoredMessages[e.instance.props.message.id].content, "censored"));
				}
			}
			
			createStamp (tooltipText, label) {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: tooltipText,
					tooltipConfig: {style: "max-width: 400px"},
					children: BDFDB.ReactUtils.createElement("time", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messageedited, BDFDB.disCN[`_chatfilter${label}stamp`]),
						children: `(${label})`
					})
				});
			}

			parseMessage (message) {			
				let blocked = false, censored = false, content = (oldBlockedMessages[message.id] || oldCensoredMessages[message.id] || {}).content || message.content;
				if (content && typeof content == "string") {
					let blockedReplace;
					for (let bWord in words.blocked) {
						blockedReplace = words.blocked[bWord].empty ? "" : (words.blocked[bWord].replace || replaces.blocked);
						let reg = this.createReg(bWord, words.blocked[bWord]);
						if (words.blocked[bWord].regex || bWord.indexOf(" ") > -1) {
							if (this.testWord(content, reg)) blocked = true;
						}
						else for (let word of content.replace(/([\n\t\r])/g, " $1 ").split(" ")) {
							if (this.testWord(word, reg)) {
								blocked = true;
								break;
							}
						}
						if (blocked) break;
					}
					if (blocked) return {blocked, censored, content: blockedReplace};
					else {
						content = content.replace(/([\n\t\r])/g, " $1 ");
						for (let cWord in words.censored) {
							let censoredReplace = words.censored[cWord].empty ? "" : (words.censored[cWord].replace || replaces.censored);
							let reg = this.createReg(cWord, words.censored[cWord]);
							let newString = [];
							if (words.censored[cWord].regex || cWord.indexOf(" ") > -1) {
								if (this.testWord(content, reg)) {
									censored = true;
									newString = [content.replace(reg, censoredReplace)];
								}
								else newString = [content];
							}
							else for (let word of content.split(" ")) {
								if (this.testWord(word, reg)) {
									censored = true;
									newString.push(censoredReplace);
								}
								else newString.push(word);
							}
							content = newString.join(" ");
						}
						content = content.replace(/ ([\n\t\r]) /g, "$1");
					}
				}
				return {blocked, censored, content};
			}
			
			testWord (word, reg) {
				let nativeEmoji = BDFDB.LibraryModules.EmojiUtils.translateSurrogatesToInlineEmoji(word);
				if (nativeEmoji != word) return this.regTest(nativeEmoji, reg);
				else {
					let customEmoji = (/<a{0,1}(:.*:)[0-9]{7,}>/i.exec(word) || [])[1];
					if (customEmoji) return this.regTest(customEmoji, reg);
					else return this.regTest(word, reg);
				}
			}
			
			regTest (word, reg) {
				let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"]/g, "");
				return word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial);
			}

			createReg (word, config) {
				let escapedWord = config.regex ? word : BDFDB.StringUtils.regEscape(word);
				return new RegExp(BDFDB.StringUtils.htmlEscape(config.exact ? "^" + escapedWord + "$" : escapedWord), `${config.case ? "" : "i"}${config.exact ? "" : "g"}`);
			}

			openAddModal (wordvalue) {
				let values = {wordvalue, replacevalue: "", choice: "blocked"};
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: BDFDB.LanguageUtils.LibraryStringsFormat("add_to", "ChatFilter"),
					subheader: "",
					children: [
						this.createInputs(values),
						BDFDB.ArrayUtils.remove(Object.keys(this.defaults.configs), "file").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							className: "input-config" + key,
							label: this.defaults.configs[key].description,
							value: this.defaults.configs[key].value
						}))
					].flat(10).filter(n => n),
					buttons: [{
						key: "ADDBUTTON",
						disabled: !values.wordvalue,
						contents: BDFDB.LanguageUtils.LanguageStrings.ADD,
						color: "BRAND",
						close: true,
						click: modal => {
							let newConfigs = {};
							for (let key in this.defaults.configs) {
								let configinput = modal.querySelector(`.input-config${key} ${BDFDB.dotCN.switchinner}`);
								if (configinput) newConfigs[key] = configinput.checked;
							}
							this.saveWord(values, newConfigs);
						}
					}]
				});
			}
			
			createInputs (values) {
				return [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Block/Censor:",
						className: "input-wordvalue",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							key: "WORDVALUE",
							value: values.wordvalue,
							placeholder: values.wordvalue,
							errorMessage: !values.wordvalue && "Choose a wordvalue" || words[values.choice][values.wordvalue] && `Wordvalue already used, saving will overwrite old ${values.choice} word`,
							onChange: (value, instance) => {
								values.wordvalue = value.trim();
								if (!values.wordvalue) instance.props.errorMessage = "Choose a wordvalue";
								else if (words[values.choice][values.wordvalue]) instance.props.errorMessage = `Wordvalue already used, saving will overwrite old ${values.choice} word`;
								else delete instance.props.errorMessage;
								let addButtonIns = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name: ["BDFDB_Modal", "BDFDB_SettingsPanel"], up: true}), {key: "ADDBUTTON"});
								if (addButtonIns) {
									addButtonIns.props.disabled = !values.wordvalue;
									BDFDB.ReactUtils.forceUpdate(addButtonIns);
								}
							}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "With:",
						className: "input-replacevalue",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							value: values.replacevalue,
							placeholder: values.replacevalue,
							autoFocus: true,
							onChange: (value, instance) => {
								values.replacevalue = value.trim();
							}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.RadioGroup, {
						className: BDFDB.disCN.marginbottom8,
						value: values.choice,
						options: [{value: "blocked", name: "Block"}, {value: "censored", name: "Censor"}],
						onChange: (value, instance) => {
							values.choice = value.value;
							let wordvalueInputIns = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name: ["BDFDB_Modal", "BDFDB_SettingsPanel"], up: true}), {key: "WORDVALUE"});
							if (wordvalueInputIns) {
								if (!values.wordvalue) wordvalueInputIns.props.errorMessage = "Choose a wordvalue";
								else if (words[values.choice][values.wordvalue]) wordvalueInputIns.props.errorMessage = `Wordvalue already used, saving will overwrite old ${values.choice} word`;
								else delete wordvalueInputIns.props.errorMessage;
								BDFDB.ReactUtils.forceUpdate(wordvalueInputIns);
							}
						}
					})
				];
			}

			saveWord (values, wordConfigs = configs) {
				if (!values.wordvalue || !values.choice) return;
				values.wordvalue = values.wordvalue.trim();
				values.replacevalue = values.replacevalue.trim();
				if (!BDFDB.ObjectUtils.is(words[values.choice])) words[values.choice] = {};
				words[values.choice][values.wordvalue] = {
					replace: values.replacevalue,
					empty: wordConfigs.empty,
					case: wordConfigs.case,
					exact: values.wordvalue.indexOf(" ") > -1 ? false : wordConfigs.exact,
					regex: false
				};
				BDFDB.DataUtils.save(words, this, "words");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();