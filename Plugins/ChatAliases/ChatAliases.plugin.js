/**
 * @name ChatAliases
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ChatAliases
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ChatAliases/ChatAliases.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ChatAliases/ChatAliases.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ChatAliases",
			"author": "DevilBro",
			"version": "2.2.1",
			"description": "Allow the user to configure their own chat-aliases which will automatically be replaced before the message is being sent"
		},
		"changeLog": {
			"fixed": {
				"Crashes": "No longer crashes"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
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
		var settings = {}, amounts = {}, configs = {}, aliases = {}, commandAliases = {}, commandSentinel;
	
		return class ChatAliases extends Plugin {
			onLoad() {
				this.defaults = {
					configs: {
						case: 				{value: false,		description: "Handle the wordvalue case sensitive"},
						exact: 				{value: true,		description: "Handle the wordvalue as an exact word and not as part of a word"},
						autoc: 				{value: true,		description: "Add this alias in the autocomplete menu (not for RegExp)"},
						regex: 				{value: false,		description: "Handle the wordvalue as a RegExp string"},
						file: 				{value: false,		description: "Handle the replacevalue as a filepath"}
					},
					settings: {
						replaceBeforeSend:	{value: true, 		inner: false,	description: "Replace words with your aliases before a message is sent"},
						addContextMenu:		{value: true, 		inner: false,	description: "Add a contextmenu entry to faster add new aliases"},
						addAutoComplete:	{value: true, 		inner: false,	description: "Add an autocomplete-menu for non-RegExp aliases"},
						triggerNormal:		{value: true, 		inner: true,		description: "Normal Message Textarea"},
						triggerEdit:		{value: true, 		inner: true,		description: "Edit Message Textarea"},
						triggerUpload:		{value: true, 		inner: true,		description: "Upload Message Prompt"}
					},
					amounts: {
						minAliasLength:		{value: 2, 			min: 1,	description: "Minimal Character Length to open Autocomplete-Menu: "}
					}
				};
				
				this.patchedModules = {
					before: {
						ChannelTextAreaForm: "render",
						MessageEditor: "render",
						Upload: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCN.autocompleteicon} {
						flex: 0 0 auto;
					}
				`;
			}
			
			onStart() {
				aliases = BDFDB.DataUtils.load(this, "words");
				commandSentinel = BDFDB.LibraryModules.AutocompleteSentinels && BDFDB.LibraryModules.AutocompleteSentinels.COMMAND_SENTINEL || "/";
				commandAliases = BDFDB.ObjectUtils.filter(aliases, key => key.startsWith(commandSentinel), true);
				
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) {
					BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.ALIASES = {
						autoSelect: true,
						getPlainText: (eventOrIndex, config, autocompletes) => {
							let aliasData = eventOrIndex._targetInst ? eventOrIndex._targetInst.memoizedProps.alias : typeof eventOrIndex == "number" && autocompletes.aliases[eventOrIndex];
							return aliasData.word;
						},
						getRawText: (eventOrIndex, config, autocompletes) => {
							let aliasData = eventOrIndex._targetInst ? eventOrIndex._targetInst.memoizedProps.alias : typeof eventOrIndex == "number" && autocompletes.aliases[eventOrIndex];
							return aliasData.file ? aliasData.word : BDFDB.StringUtils.insertNRST(aliasData.replace);
						},
						getSentinel: _ => {
							return "";
						},
						matches: (channel, what, wordLowercase, what2, config, rawValue) => {
							let currentLastWord = BDFDB.StringUtils.findMatchCaseless(wordLowercase, rawValue, true);
							if (currentLastWord.length >= amounts.minAliasLength) for (let word in aliases) {
								let aliasData = aliases[word];
								if (!aliasData.regex && aliasData.autoc) {
									if (aliasData.exact) {
										if (aliasData.case && word.indexOf(currentLastWord) == 0) return true;
										else if (!aliasData.case && word.toLowerCase().indexOf(currentLastWord.toLowerCase()) == 0) return true;
									}
									else {
										if (aliasData.case && word.indexOf(currentLastWord) > -1) return true;
										else if (!aliasData.case && word.toLowerCase().indexOf(currentLastWord.toLowerCase()) > -1) return true;
									}
								}
							}
							return false;
						},
						queryResults: (channel, wordLowercase, config, rawValue) => {
							let currentLastWord = BDFDB.StringUtils.findMatchCaseless(wordLowercase, rawValue, true);
							let matches = [];
							for (let word in aliases) {
								if (matches.length >= BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS) break;
								let aliasData = Object.assign({word}, aliases[word]);
								if (!aliasData.regex && aliasData.autoc) {
									if (aliasData.exact) {
										if (aliasData.case && word.indexOf(currentLastWord) == 0) matches.push(aliasData);
										else if (!aliasData.case && word.toLowerCase().indexOf(currentLastWord.toLowerCase()) == 0) matches.push(aliasData);
									}
									else {
										if (aliasData.case && word.indexOf(currentLastWord) > -1) matches.push(aliasData);
										else if (!aliasData.case && word.toLowerCase().indexOf(currentLastWord.toLowerCase()) > -1) matches.push(aliasData);
									}
								}
							}
							if (matches.length) return {aliases: matches};
						},
						renderResults: (channel, wordLowercase, currentSelected, setSelected, chooseSelected, state, config, autocompletes) => {
							return autocompletes && autocompletes.aliases && [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AutocompleteItems.Title, {
									title: [
										"Aliases: ",
										BDFDB.ReactUtils.createElement("strong", {
											children: wordLowercase
										})
									]
								}),
								autocompletes.aliases.map((aliasData, i) => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AutocompleteItems.Generic, {
									onClick: chooseSelected,
									onHover: setSelected,
									index: i,
									selected: currentSelected === i,
									alias: aliasData,
									text: aliasData.word,
									description: BDFDB.StringUtils.insertNRST(aliasData.replace)
								}))
							].flat(10).filter(n => n);
						}
					};
					BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.COMMANDS, "renderResults", {before: e => {
						let m = Array.from(e.methodArguments).find(n => n && n.commands);
						if (m) {
							let currentLastWord = commandSentinel + e.methodArguments[1];
							if (currentLastWord.length >= amounts.minAliasLength) for (let word in commandAliases) {
								if (m.commands.length >= BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS) break;
								let aliasData = commandAliases[word];
								let name = word.slice(1);
								let command = {
									id: "chatalias-" + name,
									name: name,
									description: BDFDB.StringUtils.insertNRST(aliasData.replace)
								};
								if (!aliasData.regex && aliasData.autoc) {
									if (aliasData.exact) {
										if (aliasData.case && word.indexOf(currentLastWord) == 0) m.commands.push(command);
										else if (!aliasData.case && word.toLowerCase().indexOf(currentLastWord.toLowerCase()) == 0) m.commands.push(command);
									}
									else {
										if (aliasData.case && word.indexOf(currentLastWord) > -1) m.commands.push(command);
										else if (!aliasData.case && word.toLowerCase().indexOf(currentLastWord.toLowerCase()) > -1) m.commands.push(command);
									}
								}
							}
						}
					}});
				}

				this.forceUpdateAll();
			}
			
			onStop() {
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) {
					delete BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.ALIASES;
				}
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
							children: Object.keys(settings).map(key => !this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["settings", key],
								label: this.defaults.settings[key].description,
								value: settings[key]
							})).concat(Object.keys(amounts).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								childProps: {
									type: "number"
								},
								plugin: this,
								keys: ["amounts", key],
								label: this.defaults.amounts[key].description,
								basis: "20%",
								min: this.defaults.amounts[key].min,
								max: this.defaults.amounts[key].max,
								value: amounts[key]
							}))).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
								title: "Automatically replace aliases in:",
								children: Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									type: "Switch",
									plugin: this,
									keys: ["settings", key],
									label: this.defaults.settings[key].description,
									value: settings[key]
								}))
							}))
						}));
						
						let values = {wordvalue: "", replacevalue: ""};
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Add new alias",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Button",
									label: "Pick a wordvalue and replacevalue:",
									key: "ADDBUTTON",
									disabled: !Object.keys(values).every(valuename => values[valuename]),
									children: BDFDB.LanguageUtils.LanguageStrings.ADD,
									onClick: _ => {
										this.saveWord(values.wordvalue, values.replacevalue, settingsPanel.props._node.querySelector(".input-replacevalue input[type='file']"));
										BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
									}
								}),
								this.createInputs(values)
							].flat(10).filter(n => n)
						}));
						
						if (!BDFDB.ObjectUtils.isEmpty(aliases)) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Added aliases",
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
								settings: Object.keys(this.defaults.configs),
								data: Object.keys(aliases).map((wordvalue, i) => Object.assign({}, aliases[wordvalue], {
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
												aliases[value] = aliases[data.label];
												delete aliases[data.label];
												data.label = value;
												BDFDB.DataUtils.save(aliases, this, "words");
											}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											value: data.replace,
											placeholder: data.replace,
											size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
											maxLength: 100000000000000000000,
											onChange: value => {
												aliases[data.label].replace = value;
												BDFDB.DataUtils.save(aliases, this, "words");
											}
										})
									]
								}),
								onCheckboxChange: (value, instance) => {
									aliases[instance.props.cardId][instance.props.settingId] = value;
									BDFDB.DataUtils.save(aliases, this, "words");
								},
								onRemove: (e, instance) => {
									delete aliases[instance.props.cardId];
									BDFDB.DataUtils.save(aliases, this, "words");
									BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
								}
							})
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Remove All",
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Button",
								color: BDFDB.LibraryComponents.Button.Colors.RED,
								label: "Remove all added aliases",
								onClick: _ => {
									BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all added aliases?", _ => {
										aliases = {};
										commandAliases = {};
										BDFDB.DataUtils.remove(this, "words");
										BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
									});
								},
								children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
							})
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Config Guide",
							collapseStates: collapseStates,
							children: [
								"Case: Will replace words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe",
								"Not Case: Will replace words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe",
								"Exact: Will replace words that are exactly the replaceword. apple to pear => applepie stays applepie",
								"Not Exact: Will replace words anywhere they appear. apple to pear => applepieapple to pearpiepear",
								"Autoc: Will appear in the Autocomplete Menu (if enabled)",
								[
									"Regex: Will treat the entered wordvalue as a regular expression - ",
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {href: "https://regexr.com/", children: BDFDB.LanguageUtils.LanguageStrings.HELP + "?"})
								],
								"File: If the replacevalue is a filepath it will try to upload the file located at the filepath"
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
				settings = BDFDB.DataUtils.get(this, "settings");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				configs = BDFDB.DataUtils.get(this, "configs");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
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
						label: "Add to ChatAliases",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "add-alias"),
						action: _ => {
							this.openAddModal(text.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"));
						}
					})
				}));
			}
			
			processChannelTextAreaForm (e) {
				if (!BDFDB.PatchUtils.isPatched(this, e.instance, "handleSendMessage")) BDFDB.PatchUtils.patch(this, e.instance, "handleSendMessage", {before: e2 => {
					if (settings.triggerNormal) this.handleSubmit(e, e2, 0);
				}}, {force: true, noCache: true});
			}
			
			processMessageEditor (e) {
				if (!BDFDB.PatchUtils.isPatched(this, e.instance, "onSubmit")) BDFDB.PatchUtils.patch(this, e.instance, "onSubmit", {before: e2 => {
					if (settings.triggerEdit) this.handleSubmit(e, e2, 0);
				}}, {force: true, noCache: true});
			}
			
			processUpload (e) {
				if (!BDFDB.PatchUtils.isPatched(this, e.instance, "submitUpload")) BDFDB.PatchUtils.patch(this, e.instance, "submitUpload", {before: e2 => {
					if (settings.triggerUpload) this.handleSubmit(e, e2, 1);
				}}, {force: true, noCache: true});
			}
			
			handleSubmit (e, e2, textIndex) {
				if (!settings.replaceBeforeSend || BDFDB.LibraryModules.SlowmodeUtils.getSlowmodeCooldownGuess(e.instance.props.channel.id) > 0) return;
				let messageData = this.formatText(e2.methodArguments[textIndex]);
				if (messageData) {
					if (messageData.text != null) {
						e2.methodArguments[textIndex] = messageData.text;
						e.instance.props.textValue = "";
						if (e.instance.props.richValue) e.instance.props.richValue = BDFDB.SlateUtils.copyRichValue("", e.instance.props.richValue);
						if (e.instance.state) {
							e.instance.state.textValue = "";
							if (e.instance.state.richValue) e.instance.state.richValue = BDFDB.SlateUtils.copyRichValue("", e.instance.state.richValue);
						}
						BDFDB.ReactUtils.forceUpdate(e.instance);
					}
					if (messageData.files.length > 0 && (BDFDB.DMUtils.isDMChannel(e.instance.props.channel.id) || BDFDB.UserUtils.can("ATTACH_FILES"))) {
						BDFDB.LibraryModules.UploadUtils.instantBatchUpload(e.instance.props.channel.id, messageData.files);
					}
				}
			}

			formatText (text) {
				text = text.replace(/([\n\t\r])/g, " $1 ");
				let newText = [], files = [], wordAliases = {}, multiAliases = {};
				for (let word in aliases) {
					if (!aliases[word].regex && word.indexOf(" ") == -1) wordAliases[word] = aliases[word];
					else multiAliases[word] = aliases[word];
				}
				for (let word of text.trim().split(" ")) {
					newText.push(this.useAliases(word, wordAliases, files, true));
				}
				newText = newText.length == 1 ? newText[0] : newText.join(" ");
				newText = newText.replace(/ ([\n\t\r]) /g, "$1");
				newText = this.useAliases(newText, multiAliases, files, false);
				return {text: newText, files};
			}

			useAliases (string, aliases, files, singleWord) {
				for (let word in aliases) {
					let result = true, replaced = false, tempString1 = string, tempString2 = "";
					let config = aliases[word];
					let escpAlias = config.regex ? word : BDFDB.StringUtils.regEscape(word);
					let regString = config.exact ? "^" + escpAlias + "$" : escpAlias;
					while (result != null) {
						result = new RegExp(regString, `${config.case ? "" : "i"}${config.exact ? "" : "g"}`).exec(tempString1);
						if (result) {
							replaced = true;
							let replace = config.file ? "" : BDFDB.StringUtils.insertNRST(config.replace);
							if (result.length > 1) for (let i = 1; i < result.length; i++) replace = replace.replace(new RegExp("\\\\" + i + "|\\$" + i, "g"), result[i]);
							tempString2 += tempString1.slice(0, result.index + result[0].length).replace(result[0], replace);
							tempString1 = tempString1.slice(result.index + result[0].length);
							if (config.file && typeof config.filedata == "string") {
								let filedata = JSON.parse(config.filedata);
								files.push(new File([Uint8Array.from(atob(filedata.data), c => c.charCodeAt(0))], filedata.name, {type: filedata.type}));
							}
							if (config.regex && regString.indexOf("^") == 0) result = null;
						}
						if (!result) tempString2 += tempString1;
					}
					if (replaced) {
						string = tempString2;
						if (singleWord) break;
					}
				}
				return string;
			}

			openAddModal (wordvalue) {
				let values = {
					wordvalue,
					replacevalue: ""
				};
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: "Add to ChatAliases",
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
						disabled: !Object.keys(values).every(valuename => values[valuename]),
						contents: BDFDB.LanguageUtils.LanguageStrings.ADD,
						color: "BRAND",
						close: true,
						click: modal => {
							let configs = {};
							for (let key in this.defaults.configs) {
								let configinput = modal.querySelector(`.input-config${key} ${BDFDB.dotCN.switchinner}`);
								if (configinput) configs[key] = configinput.checked;
							}
							this.saveWord(values.wordvalue, values.replacevalue, modal.querySelector(".input-replacevalue input[type='file']"), configs);
						}
					}]
				});
			}
			
			createInputs (values) {
				return [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Replace:",
						className: "input-wordvalue",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							value: values.wordvalue,
							placeholder: values.wordvalue,
							errorMessage: !values.wordvalue && "Choose a wordvalue" || aliases[values.wordvalue] && "Wordvalue already used, saving will overwrite old alias",
							onChange: (value, instance) => {
								values.wordvalue = value.trim();
								if (!values.wordvalue) instance.props.errorMessage = "Choose a wordvalue";
								else if (aliases[values.wordvalue]) instance.props.errorMessage = "Wordvalue already used, saving will overwrite old alias";
								else delete instance.props.errorMessage;
								let addButtonIns = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name: ["BDFDB_Modal", "BDFDB_SettingsPanel"], up: true}), {key: "ADDBUTTON"});
								if (addButtonIns) {
									addButtonIns.props.disabled = !Object.keys(values).every(valuename => values[valuename]);
									BDFDB.ReactUtils.forceUpdate(addButtonIns);
								}
							}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "With:",
						className: "input-replacevalue",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							type: "file",
							useFilePath: true,
							value: values.replacevalue,
							placeholder: values.replacevalue,
							autoFocus: true,
							errorMessage: !values.replacevalue && "Choose a replacevalue",
							onChange: (value, instance) => {
								values.replacevalue = value.trim();
								if (!values.replacevalue) instance.props.errorMessage = "Choose a replacevalue";
								else delete instance.props.errorMessage;
								let addButtonIns = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name: ["BDFDB_Modal", "BDFDB_SettingsPanel"], up: true}), {key: "ADDBUTTON"});
								if (addButtonIns) {
									addButtonIns.props.disabled = !Object.keys(values).every(valuename => values[valuename]);
									BDFDB.ReactUtils.forceUpdate(addButtonIns);
								}
							}
						})
					})
				];
			}

			saveWord (wordvalue, replacevalue, fileselection, aliasConfigs = configs) {
				if (!wordvalue || !replacevalue || !fileselection) return;
				let filedata = null;
				if (fileselection.files && fileselection.files[0] && BDFDB.LibraryRequires.fs.existsSync(replacevalue)) {
					filedata = JSON.stringify({
						data: BDFDB.LibraryRequires.fs.readFileSync(replacevalue).toString("base64"),
						name: fileselection.files[0].name,
						type: fileselection.files[0].type
					});
				}
				aliases[wordvalue] = {
					replace: replacevalue,
					filedata: filedata,
					case: aliasConfigs.case,
					exact: wordvalue.indexOf(" ") > -1 ? false : aliasConfigs.exact,
					autoc: aliasConfigs.regex ? false : aliasConfigs.autoc,
					regex: aliasConfigs.regex,
					file: filedata != null
				};
				BDFDB.DataUtils.save(aliases, this, "words");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();