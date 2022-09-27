/**
 * @name ChatAliases
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.4.3
 * @description Allows you to configure your own Aliases/Commands
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ChatAliases/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ChatAliases/ChatAliases.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
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
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var aliases = {}, commandSentinel;
		
		const AUTOCOMPLETE_ALIAS_OPTION = "ALIASES";
	
		return class ChatAliases extends Plugin {
			onLoad () {
				this.defaults = {
					configs: {
						case: 				{value: false,		description: "Handle the Word Value case sensitive"},
						exact: 				{value: true,		description: "Handle the Word Value as an exact Word and not as part of a Word"},
						autoc: 				{value: true,		description: "Add this Alias in the Autocomplete Menu (not for RegExp)"},
						regex: 				{value: false,		description: "Handle the Word Value as a RegExp String"}
					},
					general: {
						replaceBeforeSend:	{value: true, 		inner: false,		description: "Replace Words with your Aliases before a Message is sent"},
						addContextMenu:		{value: true, 		inner: false,		description: "Add a Context Menu Entry to faster add new Aliases"},
						addAutoComplete:	{value: true, 		inner: false,		description: "Add an Autocomplete Menu for non-RegExp Aliases"}
					},
					places: {
						normal:				{value: true, 		inner: true,		description: "Normal Message Textarea"},
						edit:				{value: true, 		inner: true,		description: "Edit Message Textarea"},
						upload:				{value: true, 		inner: true,		description: "Upload Message Prompt"}
					},
					amounts: {
						minAliasLength:		{value: 2, 			min: 1,				description: "Minimal Character Length to open Autocomplete Menu: "}
					}
				};
				
				this.patchedModules = {
					before: {
						ChannelTextAreaForm: "render",
						MessageEditor: "render"
					},
					after: {
						Autocomplete: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCNS.aliasautocomplete + BDFDB.dotCN.autocompleteinner} {
						max-height: 480px;
					}
					${BDFDB.dotCN.autocompleteicon} {
						flex: 0 0 auto;
					}
				`;
			}
			
			onStart () {
				aliases = BDFDB.DataUtils.load(this, "words");
				commandSentinel = BDFDB.LibraryModules.AutocompleteSentinels && BDFDB.LibraryModules.AutocompleteSentinels.COMMAND_SENTINEL || "/";
				
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_PRIORITY) BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_PRIORITY.unshift(AUTOCOMPLETE_ALIAS_OPTION);
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) {
					let query = "";
					BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS[AUTOCOMPLETE_ALIAS_OPTION] = {
						autoSelect: true,
						matches: (channel, guild, newQuery, _, options) => {
							query = newQuery;
							if (query.length >= this.settings.amounts.minAliasLength) for (let word in aliases) {
								let aliasData = aliases[word];
								if (!aliasData.regex && aliasData.autoc) {
									if (aliasData.exact) {
										if (aliasData.case && word.indexOf(query) == 0) return true;
										else if (!aliasData.case && word.toLowerCase().indexOf(query.toLowerCase()) == 0) return true;
									}
									else {
										if (aliasData.case && word.indexOf(query) > -1) return true;
										else if (!aliasData.case && word.toLowerCase().indexOf(query.toLowerCase()) > -1) return true;
									}
								}
							}
							return false;
						},
						queryResults: (channel, guild, newQuery, options) => {
							if (query == commandSentinel) return;
							let matches = [];
							for (let word in aliases) {
								let aliasData = Object.assign({word}, aliases[word]);
								if (!aliasData.regex && aliasData.autoc) {
									if (aliasData.exact) {
										if (aliasData.case && word.indexOf(query) == 0) matches.push(aliasData);
										else if (!aliasData.case && word.toLowerCase().indexOf(query.toLowerCase()) == 0) matches.push(aliasData);
									}
									else {
										if (aliasData.case && word.indexOf(query) > -1) matches.push(aliasData);
										else if (!aliasData.case && word.toLowerCase().indexOf(query.toLowerCase()) > -1) matches.push(aliasData);
									}
								}
							}
							if (matches.length) return {results: {aliases: matches}};
							else return {results: {}};
						},
						renderResults: data => {
							return data && data.results && data.results.aliases && [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AutocompleteItems.Title, {
									title: [
										"Aliases: ",
										BDFDB.ReactUtils.createElement("strong", {
											children: query
										})
									]
								}),
								data.results.aliases.map((aliasData, i) => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AutocompleteItems.Generic, {
									onClick: data.onClick,
									onHover: data.onHover,
									index: i,
									selected: data.selectedIndex === i,
									alias: aliasData,
									text: aliasData.word,
									description: BDFDB.StringUtils.insertNRST(aliasData.replace)
								}))
							].flat(10).filter(n => n);
						},
						onSelect: data => {
							if (data.results.aliases[data.index].word.indexOf(" ") > -1) {
								let textValue = BDFDB.ReactUtils.findValue(BDFDB.DOMUtils.getParent(BDFDB.dotCN.textareawrapall, document.activeElement) || document.querySelector(BDFDB.dotCN.textareawrapall), "textValue");
								if (textValue) {
									let replace = BDFDB.StringUtils.insertNRST(data.results.aliases[data.index].replace);
									let escapedQuery = BDFDB.StringUtils.regEscape(query);
									let config = data.results.aliases[data.index].case ? "gi" : "g";
									data.options.replaceText(textValue.replace(new RegExp(`(\\s)${escapedQuery}(\\s)`, config), `$1${replace}$2`).replace(new RegExp(`^${escapedQuery}(\\s)`, config), `${replace}$1`).replace(new RegExp(`(\\s)${escapedQuery}$`, config), `$1${replace}`));
								}
							}
							else data.options.insertText(BDFDB.StringUtils.insertNRST(data.results.aliases[data.index].replace));
							return {};
						}
					};
				}

				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_PRIORITY) BDFDB.ArrayUtils.remove(BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_PRIORITY, AUTOCOMPLETE_ALIAS_OPTION, true);
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) delete BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS[AUTOCOMPLETE_ALIAS_OPTION];
				BDFDB.PatchUtils.forceAllUpdates(this);
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
							})).concat(Object.keys(this.defaults.amounts).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
								value: this.settings.amounts[key]
							}))).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
								title: "Automatically replace Aliases in:",
								children: Object.keys(this.settings.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									type: "Switch",
									plugin: this,
									keys: ["places", key],
									label: this.defaults.places[key].description,
									value: this.settings.places[key]
								}))
							}))
						}));
						
						let values = {wordValue: "", replaceValue: ""};
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Add new Alias",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Button",
									label: "Pick a Word Value and Replacement Value:",
									disabled: !Object.keys(values).every(valueName => values[valueName]),
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
						
						if (!BDFDB.ObjectUtils.isEmpty(aliases)) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Added Aliases",
							collapseStates: collapseStates,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
								settings: Object.keys(this.defaults.configs),
								data: Object.keys(aliases).map((wordValue, i) => Object.assign({}, aliases[wordValue], {
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
								label: "Remove all added Aliases",
								onClick: _ => {
									BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all added Aliases?", _ => {
										aliases = {};
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
								"Case: Will replace Words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe",
								"Not Case: Will replace Words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe",
								"Exact: Will replace Words that are exactly the Replacement Value. apple to pear => applepie stays applepie",
								"Not Exact: Will replace Words anywhere they appear. apple to pear => applepieapple to pearpiepear",
								"Autoc: Will appear in the Autocomplete Menu (if enabled)",
								[
									"Regex: Will treat the entered Word Value as a Regular Expression - ",
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {href: "https://regexr.com/", children: BDFDB.LanguageUtils.LanguageStrings.HELP + "?"})
								]
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
					BDFDB.PatchUtils.forceAllUpdates(this);
				}
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
						label: BDFDB.LanguageUtils.LibraryStringsFormat("add_to", "ChatAliases"),
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "add-alias"),
						action: _ => this.openAddModal(text.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"))
					})
				}));
			}
			
			processChannelTextAreaForm (e) {
				BDFDB.PatchUtils.patch(this, e.instance, "handleSendMessage", {before: e2 => {
					if (!this.settings.places.normal || !this.settings.general.replaceBeforeSend || BDFDB.LibraryStores.SlowmodeStore.getSlowmodeCooldownGuess(e.instance.props.channel.id) > 0) return;
					let messageData = this.formatText(e2.methodArguments[0].value);
					if (messageData) {
						if (messageData.text != null && e2.methodArguments[0].value != messageData.text) {
							e2.methodArguments[0].value = messageData.text;
							e.instance.props.textValue = "";
							if (e.instance.props.richValue) e.instance.props.richValue = BDFDB.SlateUtils.toRichValue("");
							if (e.instance.state) {
								e.instance.state.textValue = "";
								if (e.instance.state.richValue) e.instance.state.richValue = BDFDB.SlateUtils.toRichValue("");
							}
							BDFDB.ReactUtils.forceUpdate(e.instance);
						}
					}
				}}, {force: true, noCache: true});
			}
			
			processMessageEditor (e) {
				BDFDB.PatchUtils.patch(this, e.instance, "onSubmit", {before: e2 => {
					if (!this.settings.places.edit || !this.settings.general.replaceBeforeSend || BDFDB.LibraryStores.SlowmodeStore.getSlowmodeCooldownGuess(e.instance.props.channel.id) > 0) return;
					let messageData = this.formatText(e2.methodArguments[0]);
					if (messageData && messageData.text != null && e2.methodArguments[0] != messageData.text) {
						e2.methodArguments[0] = messageData.text;
						e.instance.props.textValue = "";
						if (e.instance.props.richValue) e.instance.props.richValue = BDFDB.SlateUtils.toRichValue("");
						if (e.instance.state) {
							e.instance.state.textValue = "";
							if (e.instance.state.richValue) e.instance.state.richValue = BDFDB.SlateUtils.toRichValue("");
						}
						BDFDB.ReactUtils.forceUpdate(e.instance);
					}
				}}, {force: true, noCache: true});
			}

			formatText (text) {
				text = text.replace(/([\n\t\r])/g, " $1 ");
				let newText = [], wordAliases = {}, multiAliases = {};
				for (let word in aliases) {
					if (!aliases[word].regex && word.indexOf(" ") == -1) wordAliases[word] = aliases[word];
					else multiAliases[word] = aliases[word];
				}
				for (let word of text.trim().split(" ")) {
					newText.push(this.useAliases(word, wordAliases, true));
				}
				newText = newText.length == 1 ? newText[0] : newText.join(" ");
				newText = newText.replace(/ ([\n\t\r]) /g, "$1");
				newText = this.useAliases(newText, multiAliases, false);
				return {text: newText};
			}

			useAliases (string, aliases, singleWord) {
				for (let word in aliases) {
					let result = true, replaced = false, tempString1 = string, tempString2 = "";
					let config = aliases[word];
					let escpAlias = config.regex ? word : BDFDB.StringUtils.regEscape(word);
					let regString = config.exact ? "^" + escpAlias + "$" : escpAlias;
					while (result != null) {
						result = new RegExp(regString, `${config.case ? "" : "i"}${config.exact ? "" : "g"}`).exec(tempString1);
						if (result) {
							replaced = true;
							let replacement = BDFDB.StringUtils.insertNRST(config.replace);
							if (result.length > 1) for (let i = 1; i < result.length; i++) replacement = replacement.replace(new RegExp("\\\\" + i + "|\\$" + i, "g"), result[i]);
							tempString2 += tempString1.slice(0, result.index + result[0].length).replace(result[0], !config.regex && !config.case ? BDFDB.StringUtils.equalCase(result[0], replacement) : replacement);
							tempString1 = tempString1.slice(result.index + result[0].length);
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

			openAddModal (wordValue) {
				let values = {wordValue, replaceValue: ""};
				let configs = BDFDB.ObjectUtils.map(this.defaults.configs, n => n.value);
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: BDFDB.LanguageUtils.LibraryStringsFormat("add_to", "ChatAliases"),
					subHeader: "",
					children: [
						this.createInputs(values),
						Object.keys(configs).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							label: this.defaults.configs[key].description,
							value: configs[key],
							onChange: value => {configs[key] = value;}
						}))
					].flat(10).filter(n => n),
					buttons: [{
						disabled: !Object.keys(values).every(valueName => values[valueName]),
						contents: BDFDB.LanguageUtils.LanguageStrings.ADD,
						color: "BRAND",
						close: true,
						ref: instance => {if (instance) values.addButton = instance;},
						onClick: _ => {
							this.saveWord(values, configs);
							BDFDB.PatchUtils.forceAllUpdates(this);
						}
					}]
				});
			}
			
			createInputs (values) {
				return [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Replace:",
						className: BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							value: values.wordValue,
							placeholder: values.wordValue,
							errorMessage: !values.wordValue && "Choose a Word Value" || aliases[values.wordValue] && "Word Value already used, saving will overwrite old Alias",
							onChange: (value, instance) => {
								values.wordValue = value.trim();
								if (!values.wordValue) instance.props.errorMessage = "Choose a Word Value";
								else if (aliases[values.wordValue]) instance.props.errorMessage = "Word Value already used, saving will overwrite old Alias";
								else delete instance.props.errorMessage;
								values.addButton.props.disabled = !Object.keys(values).every(valueName => values[valueName]);
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
							errorMessage: !values.replaceValue && "Choose a Replacement Value",
							onChange: (value, instance) => {
								values.replaceValue = value.trim();
								if (!values.replaceValue) instance.props.errorMessage = "Choose a Replacement Value";
								else delete instance.props.errorMessage;
								values.addButton.props.disabled = !Object.keys(values).every(valueName => values[valueName]);
								BDFDB.ReactUtils.forceUpdate(values.addButton);
							}
						})
					})
				];
			}

			saveWord (values, aliasConfigs = this.settings.configs) {
				if (!values.wordValue || !values.replaceValue) return;
				aliases[values.wordValue] = {
					replace: values.replaceValue,
					case: aliasConfigs.case,
					exact: values.wordValue.indexOf(" ") > -1 ? false : aliasConfigs.exact,
					autoc: aliasConfigs.regex ? false : aliasConfigs.autoc,
					regex: aliasConfigs.regex
				};
				BDFDB.DataUtils.save(aliases, this, "words");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
