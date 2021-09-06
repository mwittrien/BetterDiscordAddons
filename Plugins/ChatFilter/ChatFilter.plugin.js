/**
 * @name ChatFilter
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 3.5.4
 * @description Allows you to censor Words or block complete Messages/Statuses
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ChatFilter/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ChatFilter/ChatFilter.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ChatFilter",
			"author": "DevilBro",
			"version": "3.5.4",
			"description": "Allows you to censor Words or block complete Messages/Statuses"
		},
		"changeLog": {
			"fixed": {
				"Custom Statuses": ""
			}
		}
	};

	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		var oldBlockedMessages, oldCensoredMessages, words;
		
		const configs = {
			empty: 					{value: false,				noBlocked: false,		description: "Allow the Replacement Value to be empty (ignoring the default)"},
			case: 					{value: false,				noBlocked: false,		description: "Handle the Word Value case sensitive"},
			exact: 					{value: true,				noBlocked: false,		description: "Handle the Word Value as an exact Word and not as part of a Word"},
			segment: 				{value: false,				noBlocked: true,		description: "Only replace the caught Segment of the Word with the Replacement"},
			regex: 					{value: false,				noBlocked: false,		description: "Handle the Word Value as a RegExp String"}
		};
		
		return class ChatFilter extends Plugin {
			onLoad () {
				this.defaults = {
					replaces: {
						blocked: 				{value: "~~BLOCKED~~",		description: "Default Replacement Value for blocked Messages: "},
						censored:				{value: "$!%&%!&",			description: "Default Replacement Value for censored Messages: "}
					},
					general: {
						addContextMenu:			{value: true,				description: "Add a Context Menu Entry to faster add new blocked/censored Words"},
						targetMessages:			{value: true,				description: "Check Messages for blocked/censored Words"},
						targetStatuses:			{value: true,				description: "Check Custom Statuses for blocked/censored Words"},
						targetOwn:				{value: true, 				description: "Filter/Block your own Messages/Custom Status"}
					}
				};
			
				this.patchedModules = {
					before: {
						Message: "default",
						MessageContent: "type",
						UserInfo: "default",
						MemberListItem: "render",
						PrivateChannel: "render"
					},
					after: {
						Messages: "type",
						MessageContent: "type",
						Embed: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCN._chatfilterblocked} {
						color: ${BDFDB.DiscordConstants.Colors.STATUS_RED} !important;
					}
					${BDFDB.dotCN.messagerepliedmessagecontentclickable}:hover ${BDFDB.dotCN._chatfilterblocked} {
						filter: saturate(2);
					}
				`;
				
			}
			
			onStart () {
				words = BDFDB.DataUtils.load(this, "words");
				for (let rType in this.defaults.replaces) if (!BDFDB.ObjectUtils.is(words[rType])) words[rType] = {};
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.StatusMetaUtils, "findActivity", {after: e => {
					if (this.settings.general.targetStatuses && e.returnValue && e.returnValue.state && e.returnValue.type === BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS) {
						let {content} = this.parseMessage({
							content: e.returnValue.state,
							embeds: [],
							id: "status",
							author: BDFDB.LibraryModules.UserStore.getUser(e.methodArguments[0])
						});
						if (content) return Object.assign({}, e.returnValue, {state: content});
						else if (!e.returnValue.emoji) return null;
					}
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
				
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["general", key],
								label: this.defaults.general[key].description,
								value: this.settings.general[key]
							})).concat(Object.keys(this.defaults.replaces).map(rType => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["replaces", rType],
								label: this.defaults.replaces[rType].description,
								value: this.settings.replaces[rType],
								placeholder: this.defaults.replaces[rType].value
							})))
						}));
						let values = {wordValue: "", replaceValue: "", choice: "blocked"};
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: `Add new blocked/censored word`,
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Button",
									label: "Pick a Word Value and Replacement Value",
									disabled: !Object.keys(values).every(valuename => values[valuename]),
									children: BDFDB.LanguageUtils.LanguageStrings.ADD,
									ref: instance => {if (instance) values.addButton = instance;},
									onClick: _ => {
										this.saveWord(values);
										BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
									}
								}),
								this.createInputs(values)
							].flat(10).filter(n => n)
						}));
						for (let rType in this.defaults.replaces) if (!BDFDB.ObjectUtils.isEmpty(words[rType])) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: `Added ${rType} Words`,
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
								settings: Object.keys(configs).filter(n => !configs[n]["no" + BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(rType)]),
								data: Object.keys(words[rType]).map(wordValue => Object.assign({}, words[rType][wordValue], {
									key: wordValue,
									label: wordValue
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
							children: Object.keys(this.defaults.replaces).map(rType => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Button",
								color: BDFDB.LibraryComponents.Button.Colors.RED,
								label: `Remove all ${rType} Words`,
								onClick: _ => {
									BDFDB.ModalUtils.confirm(this, `Are you sure you want to remove all ${rType} Words?`, _ => {
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
								"Case: Will block/censor Words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe",
								"Not Case: Will block/censor Words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe",
								"Exact: Will block/censor Words that are exactly the selected Word. apple => apple, not applepie or pineapple",
								"Not Exact: Will block/censor all Words containing the selected Word. apple => apple, applepie and pineapple",
								"Segment: Will only replace the caught segment in the censored Word. apple with peach => applepie => peachpie",
								"Not Segment: Will replae the whole censored Word. apple with peach => applepie => peach",
								"Empty: Ignores the default/choosen Replacement Value and removes the Word/Message instead.",
								[
									"Regex: Will treat the entered Word Value as a Regular Expression. ",
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {href: "https://regexr.com/", children: BDFDB.LanguageUtils.LanguageStrings.HELP + "?"})
								],
							].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
								type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
								children: string
							}))
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {					
				oldBlockedMessages = {};
				oldCensoredMessages = {};
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onNativeContextMenu (e) {
				if (e.instance.props.value && e.instance.props.value.trim()) {
					if ((e.instance.props.type == "NATIVE_TEXT" || e.instance.props.type == "CHANNEL_TEXT_AREA") && this.settings.general.addContextMenu) this.injectItem(e, e.instance.props.value.trim());
				}
			}

			onSlateContextMenu (e) {
				let text = document.getSelection().toString().trim();
				if (text && this.settings.general.addContextMenu) this.injectItem(e, text);
			}

			onMessageContextMenu (e) {
				let text = document.getSelection().toString().trim();
				if (text && this.settings.general.addContextMenu) this.injectItem(e, text);
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
				if (this.settings.general.targetMessages) {
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
			}
			
			checkMessage (stream, message) {
				let {blocked, censored, content, embeds} = this.parseMessage(message);
				let changeMessage = (change, cache) => {
					if (change) {
						if (!cache[message.id]) cache[message.id] = new BDFDB.DiscordObjects.Message(message);
						stream.content.content = content;
						stream.content.embeds = embeds;
					}
					else if (cache[message.id] && Object.keys(message).some(key => !BDFDB.equals(cache[message.id][key], message[key]))) {
						stream.content.content = cache[message.id].content;
						stream.content.embeds = cache[message.id].embeds;
						delete cache[message.id];
					}
				};
				changeMessage(blocked, oldBlockedMessages);
				changeMessage(censored, oldCensoredMessages);
			}

			processMessage (e) {
				if (this.settings.general.targetMessages) {
					let repliedMessage = e.instance.props.childrenRepliedMessage;
					if (repliedMessage && repliedMessage.props && repliedMessage.props.children && repliedMessage.props.children.props && repliedMessage.props.children.props.referencedMessage && repliedMessage.props.children.props.referencedMessage.message && (oldBlockedMessages[repliedMessage.props.children.props.referencedMessage.message.id] || oldCensoredMessages[repliedMessage.props.children.props.referencedMessage.message.id])) {
						let {blocked, censored, content, embeds} = this.parseMessage(repliedMessage.props.children.props.referencedMessage.message);
						repliedMessage.props.children.props.referencedMessage.message = new BDFDB.DiscordObjects.Message(Object.assign({}, repliedMessage.props.children.props.referencedMessage.message, {content, embeds}));
					}
				}
			}

			processMessageContent (e) {
				if (e.instance.props.message && this.settings.general.targetMessages) {
					if (!e.returnvalue) {
						if (oldBlockedMessages[e.instance.props.message.id]) e.instance.props.className = BDFDB.DOMUtils.formatClassName(e.instance.props.className, BDFDB.disCN._chatfilterblocked);
						if (oldCensoredMessages[e.instance.props.message.id] && e.instance.props.message.content != oldCensoredMessages[e.instance.props.message.id].content) e.instance.props.className = BDFDB.DOMUtils.formatClassName(e.instance.props.className, BDFDB.disCN._chatfiltercensored);
					}
					else {
						if (oldBlockedMessages[e.instance.props.message.id]) e.returnvalue.props.children.push(this.createStamp(oldBlockedMessages[e.instance.props.message.id].content, "blocked"));
						if (oldCensoredMessages[e.instance.props.message.id]) e.returnvalue.props.children.push(this.createStamp(oldCensoredMessages[e.instance.props.message.id].content, "censored"));
					}
				}
			}

			processEmbed (e) {
				if (e.instance.props.embed && e.instance.props.embed.censored && oldCensoredMessages[e.instance.props.embed.message_id]) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.embeddescription]]});
					if (index > -1) children[index].props.children = [
						children[index].props.children,
						this.createStamp(oldCensoredMessages[e.instance.props.embed.message_id].embeds[e.instance.props.embed.index].rawDescription, "censored")
					].flat(10).filter(n => n);
				}
			}

			processUserInfo (e) {
				this.checkActivities(e);
			}
			
			processMemberListItem (e) {
				this.checkActivities(e);
			}

			processPrivateChannel (e) {
				this.checkActivities(e);
			}
			
			checkActivities (e) {
				if (this.settings.general.targetStatuses && e.instance.props.activities && e.instance.props.activities.length && e.instance.props.user) {
					let index = e.instance.props.activities.findIndex(n => n && n.type == BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS);
					if (index > -1 && e.instance.props.activities[index].state) {
						let {content} = this.parseMessage({content: e.instance.props.activities[index].state, embeds: [], id: "status", author: e.instance.props.user});
						if (content) e.instance.props.activities[index] = Object.assign({}, e.instance.props.activities[index], {state: content});
						else if (!e.instance.props.activities[index].emoji) {
							e.instance.props.activities = [].concat(e.instance.props.activities);
							e.instance.props.activities.splice(index, 1);
						}
					}
				}
			}
			
			createStamp (tooltipText, label) {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: tooltipText,
					tooltipConfig: {style: "max-width: 400px"},
					children: BDFDB.ReactUtils.createElement("span", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messagetimestamp, BDFDB.disCN.messagetimestampinline, BDFDB.disCN[`_chatfilter${label}stamp`]),
						children: BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN.messageedited,
							children: `(${label})`
						})
					})
				});
			}

			parseMessage (message) {			
				let blocked = false, censored = false;
				let content = (oldBlockedMessages[message.id] || oldCensoredMessages[message.id] || {}).content || message.content;
				let embeds = [].concat((oldBlockedMessages[message.id] || oldCensoredMessages[message.id] || {}).embeds || message.embeds);
				let isContent = content && typeof content == "string";
				if ((isContent || embeds.length) && (message.author.id != BDFDB.UserUtils.me.id || this.settings.general.targetOwn)) {
					let blockedReplace;
					for (let bWord in words.blocked) {
						let compareContent = [isContent && content, embeds.map(e => e.rawDescription)].flat(10).filter(n => n).join(" ");
						blockedReplace = words.blocked[bWord].empty ? "" : (words.blocked[bWord].replace || this.settings.replaces.blocked);
						let reg = this.createReg(bWord, words.blocked[bWord]);
						if (words.blocked[bWord].regex || bWord.indexOf(" ") > -1) {
							if (isContent && this.testWord(compareContent, reg)) blocked = true;
						}
						else for (let word of compareContent.replace(/([\n\t\r])/g, " $1 ").split(" ")) {
							if (this.testWord(word, reg)) {
								blocked = true;
								break;
							}
						}
						if (blocked) break;
					}
					if (blocked) return {blocked, censored, content: blockedReplace, embeds: []};
					else {
						const checkCensor = string => {
							let singleCensored = false;
							string = string.replace(/([\n\t\r])/g, " $1 ");
							for (let cWord in words.censored) {
								let censoredReplace = words.censored[cWord].empty ? "" : (words.censored[cWord].replace || this.settings.replaces.censored);
								let reg = this.createReg(cWord, words.censored[cWord]);
								let newString = [];
								if (words.censored[cWord].segment || words.censored[cWord].regex || cWord.indexOf(" ") > -1) {
									if (this.testWord(string, reg)) {
										singleCensored = true;
										censored = true;
										newString = [string.replace(reg, censoredReplace)];
									}
									else newString = [string];
								}
								else for (let word of string.split(" ")) {
									if (this.testWord(word, reg)) {
										singleCensored = true;
										censored = true;
										newString.push(censoredReplace);
									}
									else newString.push(word);
								}
								string = newString.join(" ");
							}
							return {parsedContent: string.replace(/ ([\n\t\r]) /g, "$1"), singleCensored: singleCensored};
						};
						if (isContent) {
							let {parsedContent, singleCensored} = checkCensor(content);
							if (singleCensored) content = parsedContent;
						}
						for (let i in embeds) if (embeds[i].rawDescription) {
							let {parsedContent, singleCensored} = checkCensor(embeds[i].rawDescription);
							if (singleCensored) embeds[i] = Object.assign({}, embeds[i], {rawDescription: parsedContent, index: i, message_id: message.id, censored: true});
						}
					}
				}
				return {blocked, censored, content, embeds};
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
				let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"\*\-\_\~\u180E\u200B-\u200D\u2060\uFEFF]/g, "");
				return word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial);
			}

			createReg (word, config) {
				let escapedWord = config.regex ? word : BDFDB.StringUtils.htmlEscape(BDFDB.StringUtils.regEscape(word));
				return new RegExp(config.exact ? "^" + escapedWord + "$" : escapedWord, `${config.case ? "" : "i"}${config.exact ? "" : "g"}`);
			}

			openAddModal (wordValue) {
				let values = {wordValue, replaceValue: "", choice: "blocked"};
				let newConfigs = BDFDB.ObjectUtils.map(configs, n => n.value);
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: BDFDB.LanguageUtils.LibraryStringsFormat("add_to", "ChatFilter"),
					subHeader: "",
					children: [
						this.createInputs(values),
						Object.keys(configs).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							label: configs[key].description,
							value: newConfigs[key],
							onChange: value => {newConfigs[key] = value;}
						}))
					].flat(10).filter(n => n),
					buttons: [{
						disabled: !values.wordValue,
						contents: BDFDB.LanguageUtils.LanguageStrings.ADD,
						color: "BRAND",
						close: true,
						ref: instance => {if (instance) values.addButton = instance;},
						onClick: _ => {
							this.saveWord(values, newConfigs);
							this.forceUpdateAll();
						}
					}]
				});
			}
			
			createInputs (values) {
				let wordValueInput;
				return [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Block/Censor:",
						className: BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							value: values.wordValue,
							placeholder: values.wordValue,
							errorMessage: !values.wordValue && "Choose a Word Value" || words[values.choice][values.wordValue] && `Word Value already used, saving will overwrite old ${values.choice} Word`,
							ref: instance => {if (instance) wordValueInput = instance;},
							onChange: (value, instance) => {
								values.wordValue = value.trim();
								if (!values.wordValue) instance.props.errorMessage = "Choose a Word Value";
								else if (words[values.choice][values.wordValue]) instance.props.errorMessage = `Word Value already used, saving will overwrite old ${values.choice} word`;
								else delete instance.props.errorMessage;
								values.addButton.props.disabled = !values.wordValue;
								BDFDB.ReactUtils.forceUpdate(values.addButton);
							}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "With:",
						className: BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							value: values.replaceValue,
							placeholder: values.replaceValue,
							autoFocus: true,
							onChange: value => {values.replaceValue = value;}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.RadioGroup, {
						className: BDFDB.disCN.marginbottom8,
						value: values.choice,
						options: [{value: "blocked", name: "Block"}, {value: "censored", name: "Censor"}],
						onChange: valueObj => {
							values.choice = valueObj.value;
							if (!values.wordValue) wordValueInput.props.errorMessage = "Choose a Word Value";
							else if (words[values.choice][values.wordValue]) wordValueInput.props.errorMessage = `Word Value already used, saving will overwrite old ${values.choice} Word`;
							else delete wordValueInput.props.errorMessage;
							BDFDB.ReactUtils.forceUpdate(wordValueInput);
						}
					})
				];
			}

			saveWord (values, wordConfigs = BDFDB.ObjectUtils.map(configs, n => n.value)) {
				if (!values.wordValue || !values.choice) return;
				if (!BDFDB.ObjectUtils.is(words[values.choice])) words[values.choice] = {};
				words[values.choice][values.wordValue] = {
					replace: values.replaceValue,
					empty: wordConfigs.empty,
					case: wordConfigs.case,
					exact: values.wordValue.indexOf(" ") > -1 ? false : wordConfigs.exact,
					regex: false
				};
				BDFDB.DataUtils.save(words, this, "words");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();