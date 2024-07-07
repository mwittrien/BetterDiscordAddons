/**
 * @name ChatAliases
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.4.7
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
		"fixed": {
			"Alias Length": "No longer cuts of Aliases after 1200 Characters"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
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
		var aliases = {};
	
		return class ChatAliases extends Plugin {
			onLoad () {
				this.defaults = {
					configs: {
						case: 				{value: false,		description: "Handles the Word Value case sensitive"},
						exact: 				{value: true,		description: "Handles the Word Value as an exact Word and not as part of a Word"},
						regex: 				{value: false,		description: "Handles the Word Value as a RegExp String"}
					},
					general: {
						addContextMenu:			{value: true, 		inner: false,		description: "Adds a Context Menu Entry to more freely add new Aliases"}
					},
					places: {
						normal:				{value: true, 		inner: true,		description: "Normal Message Textarea"},
						edit:				{value: true, 		inner: true,		description: "Edit Message Textarea"}
					}
				};
				
				this.modulePatches = {
					before: [
						"ChannelTextAreaContainer"
					]
				};
			}
			
			onStart () {
				aliases = BDFDB.DataUtils.load(this, "words");

				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
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
							})).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
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
								[
									"Regex: Will treat the entered Word Value as a Regular Expression - ",
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {href: "https://regexr.com/", children: BDFDB.LanguageUtils.LanguageStrings.HELP + "?"})
								]
							].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
								type: BDFDB.LibraryComponents.FormComponents.FormText.Types.DESCRIPTION,
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

			onTextAreaContextMenu (e) {
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
			
			processChannelTextAreaContainer (e) {
				if (!this.shouldInject(e.instance.props.type)) return;
				BDFDB.PatchUtils.patch(this, e.instance.props, "onSubmit", {before: e2 => {
					if (BDFDB.LibraryStores.SlowmodeStore.getSlowmodeCooldownGuess(e.instance.props.channel.id) > 0) return;
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
				}}, {noCache: true});
			}
			
			shouldInject (type) {
				return this.settings.places.normal && (type == BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL || type == BDFDB.DiscordConstants.ChannelTextAreaTypes.SIDEBAR) || this.settings.places.edit && type == BDFDB.DiscordConstants.ChannelTextAreaTypes.EDIT;
			}

			formatText (text) {
				text = text.replace(/([\n\t\r])/g, " $1 ");
				let newText = [], wordAliases = {}, multiAliases = {};
				for (let word in aliases) {
					if (!aliases[word].regex && word.indexOf(" ") == -1) wordAliases[word] = aliases[word];
					else multiAliases[word] = aliases[word];
				}
				for (let word of text.trim().split(" ")) newText.push(this.useAliases(word, wordAliases, true));
				newText = newText.length == 1 ? newText[0] : newText.join(" ");
				newText = newText.replace(/ ([\n\t\r]) /g, "$1");
				newText = this.useAliases(newText, multiAliases, false);
				return {text: newText};
			}

			useAliases (string, aliases, singleWord) {
				for (let word of Object.keys(aliases).filter(n => n).sort((x, y) => x.length > y.length ? -1 : x.length < y.length ? 1 : 0)) {
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
							maxLength: 1950,
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
							maxLength: 1950,
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
					regex: aliasConfigs.regex
				};
				BDFDB.DataUtils.save(aliases, this, "words");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
