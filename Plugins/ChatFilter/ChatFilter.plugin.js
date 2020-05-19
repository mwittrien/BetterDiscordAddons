//META{"name":"ChatFilter","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ChatFilter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ChatFilter/ChatFilter.plugin.js"}*//

var ChatFilter = (_ => {
	var blockedMessages, censoredMessages, words;
	
	return class ChatFilter {
		getName () {return "ChatFilter";}

		getVersion () {return "3.4.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

		constructor () {
			this.changelog = {
				"fixed":[["Context Menu Update","Fixes for the context menu update, yaaaaaay"]]
			};

			this.patchedModules = {
				after: {
					Messages: "render",
					Message: "default",
					MessageContent: "type"
				}
			};
		}

		initConstructor () {
			this.css = ` 
				${BDFDB.dotCN.message + BDFDB.dotCNS._chatfilterblocked + BDFDB.dotCN.messagemarkup} {
					color: ${BDFDB.DiscordConstants.Colors.STATUS_RED};
				}
			`;

			this.defaults = {
				configs: {
					empty: 		{value:false,		description:"Allows the replacevalue to be empty (ignoring the default)"},
					case: 		{value:false,		description:"Handle the wordvalue case sensitive"},
					exact: 		{value:true,		description:"Handle the wordvalue as an exact word and not as part of a word"}
				},
				replaces: {
					blocked: 	{value:"~~BLOCKED~~",		description:"Default Replaceword for blocked Messages:"},
					censored:	{value:"$!%&%!&",			description:"Default Replaceword for censored Messages:"}
				},
				settings: {
					addContextMenu:			{value:true,	description:"Add a ContextMenu entry to faster add new blocked/censored Words:"},
					showMessageOnClick: 	{value:true,	description:"Show original Message on Click:"},
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let replaces = BDFDB.DataUtils.get(this, "replaces");
			let settingsPanel, settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				})).concat(Object.keys(replaces).map(rtype => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "TextInput",
					plugin: this,
					keys: ["replaces", rtype],
					label: this.defaults.replaces[rtype].description,
					value: replaces[rtype],
					placeholder: this.defaults.replaces[rtype].value
				})))
			}));
			let values = {wordvalue:"", replacevalue:"", choice:"blocked"};
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: `Add new blocked/censored Word`,
				collapseStates: collapseStates,
				dividertop: true,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						label: "Pick a Wordvalue and Replacevalue:",
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
			for (let rtype in replaces) if (!BDFDB.ObjectUtils.isEmpty(words[rtype])) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: `Added ${rtype} Words`,
				collapseStates: collapseStates,
				dividertop: true,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
					settings: Object.keys(this.defaults.configs),
					data: Object.keys(words[rtype]).map((wordvalue, i) => Object.assign({}, words[rtype][wordvalue], {
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
									words[rtype][value] = words[rtype][data.label];
									delete words[rtype][data.label];
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
									words[rtype][data.label].replace = value;
									BDFDB.DataUtils.save(words, this, "words");
								}
							})
						]
					}),
					onCheckboxChange: (value, instance) => {
						words[rtype][instance.props.cardId][instance.props.settingId] = value;
						BDFDB.DataUtils.save(words, this, "words");
					},
					onRemove: (e, instance) => {
						delete words[rtype][instance.props.cardId];
						BDFDB.DataUtils.save(words, this, "words");
						BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
					}
				})
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Remove All",
				collapseStates: collapseStates,
				dividertop: true,
				children: Object.keys(replaces).map(rtype => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					className: BDFDB.disCN.marginbottom8,
					color: BDFDB.LibraryComponents.Button.Colors.RED,
					label: `Remove all ${rtype} Words`,
					onClick: _ => {
						BDFDB.ModalUtils.confirm(this, `Are you sure you want to remove all ${rtype} Words?`, _ => {
							words[rtype] = {};
							BDFDB.DataUtils.remove(this, "words", rtype);
							BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
						});
					},
					children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
				}))
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Config Guide",
				collapseStates: collapseStates,
				dividertop: true,
				children: ["Case: Will block/censor words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe", "Not Case: Will block/censor words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe", "Exact: Will block/censor words that are exactly the selected word. apple => apple, not applepie or pineapple", "Not Exact: Will block/censor all words containing the selected word. apple => apple, applepie and pineapple", "Empty: Ignores the default and set replace word and removes the word/message instead."].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
					type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
					children: string
				}))
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
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

				words = BDFDB.DataUtils.load(this, "words");
				for (let rtype in this.defaults.replaces) if (!BDFDB.ObjectUtils.is(words[rtype])) words[rtype] = {};
				
				blockedMessages = {};
				censoredMessages = {};
				
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

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				
				blockedMessages = {};
				censoredMessages = {};
				
				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
		}

		onNativeContextMenu (e) {
			if (e.instance.props.value && e.instance.props.value.trim()) {
				if ((e.instance.props.type == "NATIVE_TEXT" || e.instance.props.type == "CHANNEL_TEXT_AREA") && BDFDB.DataUtils.get(this, "settings", "addContextMenu")) this.injectItem(e, e.instance.props.value.trim());
			}
		}

		onSlateContextMenu (e) {
			let text = document.getSelection().toString().trim();
			if (text && BDFDB.DataUtils.get(this, "settings", "addContextMenu")) this.injectItem(e, text);
		}

		onMessageContextMenu (e) {
			let text = document.getSelection().toString().trim();
			if (text && BDFDB.DataUtils.get(this, "settings", "addContextMenu")) this.injectItem(e, text);
		}
	 
		injectItem (e, text) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["id", "devmode-copy-id"]]});
			children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: "Add to ChatFilter",
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "add-filter"),
					action: _ => {
						BDFDB.ContextMenuUtils.close(e.instance);
						this.openAddModal(text.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"));
					}
				})
			}));
		}

		processMessages (e) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: ["message", "channel"]});
			if (index > -1) for (let ele of children) if (ele && ele.props && ele.props.message) {
				let {blocked, censored, content} = this.parseContent(ele.props.message.content);
				let oldContent = ele.props.message.content;
				ele.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, ele.props.message, {content}));
				if (blocked) {
					ele.props.message.embeds = [];
					blockedMessages[ele.props.message.id] = oldContent;
				}
				else delete blockedMessages[ele.props.message.id];
				if (censored) censoredMessages[ele.props.message.id] = oldContent;
				else delete censoredMessages[ele.props.message.id];
			}
		}

		processMessage (e) {
			let message = BDFDB.ReactUtils.getValue(e, "instance.props.childrenMessageContent.props.message");
			if (message) {
				if (blockedMessages[message.id]) e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.disCN._chatfilterblocked);
				else if (censoredMessages[message.id]) e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.disCN._chatfiltercensored);
			}
		}

		processMessageContent (e) {
			if (e.instance.props.message) {
				if (blockedMessages[e.instance.props.message.id]) e.returnvalue.props.children.push(this.createStamp(blockedMessages[e.instance.props.message.id], "blocked"));
				else if (censoredMessages[e.instance.props.message.id]) e.returnvalue.props.children.push(this.createStamp(censoredMessages[e.instance.props.message.id], "censored"));
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

		parseContent (content) {
			let blocked = false, censored = false;
			if (typeof content == "string") {
				let settings = BDFDB.DataUtils.get(this, "settings");
				let replaces = BDFDB.DataUtils.get(this, "replaces");
				let blockedReplace;
				for (let bWord in words.blocked) {
					blockedReplace = words.blocked[bWord].empty ? "" : (words.blocked[bWord].replace || replaces.blocked);
					let reg = this.createReg(bWord, words.blocked[bWord]);
					content.replace(/\n/g, " \n ").split(" ").forEach(word => {
						if (this.testWord(word, reg)) blocked = true;
					});
					if (blocked) break;
				}
				if (blocked) return {blocked, censored, content:blockedReplace};
				else {
					let newContent = [];
					for (let cWord in words.censored) {
						let censoredReplace = words.censored[cWord].empty ? "" : (words.censored[cWord].replace || replaces.censored);
						let reg = this.createReg(cWord, words.censored[cWord]);
						let newstring = [];
						content.replace(/\n/g, " \n ").split(" ").forEach(word => {
							if (this.testWord(word, reg)) {
								censored = true;
								newstring.push(censoredReplace);
							}
							else newstring.push(word);
						});
						content = newstring.join(" ").replace(/ \n /g, "\n");
					}
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
			return new RegExp(BDFDB.StringUtils.htmlEscape(config.exact ? "^" + BDFDB.StringUtils.regEscape(word) + "$" : BDFDB.StringUtils.regEscape(word)), config.case ? "" : "i");
		}

		openAddModal (wordvalue) {
			let values = {wordvalue, replacevalue:"", choice:"blocked"};
			BDFDB.ModalUtils.open(this, {
				size: "MEDIUM",
				header: "Add to ChatAliases",
				subheader: "",
				children: [
					this.createInputs(values),
					BDFDB.ArrayUtils.remove(Object.keys(this.defaults.configs), "file").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Switch",
						className: BDFDB.disCN.marginbottom8 + " input-config" + key,
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
						let configs = {};
						for (let key in this.defaults.configs) {
							let configinput = modal.querySelector(`.input-config${key} ${BDFDB.dotCN.switchinner}`);
							if (configinput) configs[key] = configinput.checked;
						}
						this.saveWord(values, configs);
					}
				}]
			});
		}
		
		createInputs (values) {
			return [{title:"Block/Censor:", error:"Choose a Wordvalue", valuename:"wordvalue"}, {title:"With:", valuename:"replacevalue"}].map(inputdata => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
				title: inputdata.title,
				className: BDFDB.disCN.marginbottom8 + " input-" + inputdata.valuename,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
					value: values[inputdata.valuename],
					placeholder: values[inputdata.valuename],
					autoFocus: inputdata.valuename == "replacevalue",
					errorMessage: !values[inputdata.valuename] && inputdata.error,
					onChange: (value, instance) => {
						values[inputdata.valuename] = value.trim();
						if (values[inputdata.valuename]) delete instance.props.errorMessage;
						else instance.props.errorMessage = inputdata.error;
						let addbuttonins = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name:["BDFDB_Modal", "BDFDB_SettingsPanel"], up:true}), {key:"ADDBUTTON"});
						if (addbuttonins) {
							addbuttonins.props.disabled = !values.wordvalue;
							BDFDB.ReactUtils.forceUpdate(addbuttonins);
						}
					}
				})
			})).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.RadioGroup, {
				className: BDFDB.disCN.marginbottom8,
				value: values.choice,
				options: [{value:"blocked", name:"Block"}, {value:"censored", name:"Censor"}],
				onChange: value => {values.choice = value.value;}
			}));
		}

		saveWord (values, configs = BDFDB.DataUtils.get(this, "configs")) {
			if (!values.wordvalue || !values.choice) return;
			values.wordvalue = values.wordvalue.trim();
			values.replacevalue = values.replacevalue.trim();
			if (!BDFDB.ObjectUtils.is(words[values.choice])) words[values.choice] = {};
			words[values.choice][values.wordvalue] = {
				replace: values.replacevalue,
				empty: configs.empty,
				case: configs.case,
				exact: values.wordvalue.indexOf(" ") > -1 ? false : configs.exact,
				regex: false
			};
			BDFDB.DataUtils.save(words, this, "words");
		}
	}
})();