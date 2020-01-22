//META{"name":"ChatFilter","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ChatFilter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ChatFilter/ChatFilter.plugin.js"}*//

class ChatFilter {
	getName () {return "ChatFilter";}

	getVersion () {return "3.3.7";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				Message: ["componentDidMount","componentDidUpdate"],
			}
		};
	}

	initConstructor () {
		this.css = ` 
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageaccessory}.blocked:not(.revealed),
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messagemarkup}.blocked:not(.revealed) {
				font-weight: bold;
				font-style: italic;
			}`;

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
		let settingspanel, settingsitems = [];
		
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
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
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
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
						BDFDB.PluginUtils.refreshSettingsPanel(this, settingspanel, collapseStates);
					}
				}),
				this.createInputs(values)
			].flat(10).filter(n => n)
		}));
		for (let rtype in replaces) if (!BDFDB.ObjectUtils.isEmpty(this.words[rtype])) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
			title: `Added ${rtype} Words`,
			collapseStates: collapseStates,
			dividertop: true,
			children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
				settings: Object.keys(this.defaults.configs),
				data: Object.keys(this.words[rtype]).map((wordvalue, i) => Object.assign({}, this.words[rtype][wordvalue], {
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
								this.words[rtype][value] = this.words[rtype][data.label];
								delete this.words[rtype][data.label];
								data.label = value;
								BDFDB.DataUtils.save(this.words, this, "words");
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							value: data.replace,
							placeholder: data.replace,
							size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
							maxLength: 100000000000000000000,
							onChange: value => {
								this.words[rtype][data.label].replace = value;
								BDFDB.DataUtils.save(this.words, this, "words");
							}
						})
					]
				}),
				onCheckboxChange: (value, instance) => {
					this.words[rtype][instance.props.cardId][instance.props.settingId] = value;
					BDFDB.DataUtils.save(this.words, this, "words");
				},
				onRemove: (e, instance) => {
					delete this.words[rtype][instance.props.cardId];
					BDFDB.DataUtils.save(this.words, this, "words");
					BDFDB.PluginUtils.refreshSettingsPanel(this, settingspanel, collapseStates);
				}
			})
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
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
						this.words[rtype] = {};
						BDFDB.DataUtils.remove(this, "words", rtype);
						BDFDB.PluginUtils.refreshSettingsPanel(this, settingspanel, collapseStates);
					});
				},
				children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
			}))
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
			title: "Config Guide",
			collapseStates: collapseStates,
			dividertop: true,
			children: ["Case: Will block/censor words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe", "Not Case: Will block/censor words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe", "Exact: Will block/censor words that are exactly the selected word. apple => apple, not applepie or pineapple", "Not Exact: Will block/censor all words containing the selected word. apple => apple, applepie and pineapple", "Empty: Ignores the default and set replace word and removes the word/message instead."].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
				type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
				children: string
			}))
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

			this.words = BDFDB.DataUtils.load(this, "words");
			for (let rtype in this.defaults.replaces) if (!BDFDB.ObjectUtils.is(this.words[rtype])) this.words[rtype] = {};

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


	// begin of own functions

	onSettingsClosed () {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
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
		let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
		children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
			children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
				label: "Add to ChatFilter",
				action: _ => {
					BDFDB.ContextMenuUtils.close(e.instance);
					this.openAddModal(text.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"));
				}
			})
		}));
	}

	processMessage (e) {
		e.node.querySelectorAll(`${BDFDB.dotCNC.messagemarkup + BDFDB.dotCN.messageaccessory}`).forEach(message => {this.hideMessage(message);});
	}

	hideMessage (message) {
		if (message.tagName && !BDFDB.DOMUtils.containsClass(message, "blocked", "censored", false)) {
			let orightml = message.innerHTML, newhtml = "";

			if (orightml) {
				let strings = [], count = 0;
				orightml.split("").forEach(chara => { 
					if (chara == "<" && strings[count]) count++;
					strings[count] = strings[count] ? strings[count] + chara : chara;
					if (chara == ">") count++;
				});

				let settings = BDFDB.DataUtils.get(this, "settings");
				let replaces = BDFDB.DataUtils.get(this, "replaces");
				let blocked = false, blockedReplace;
				for (let bWord in this.words.blocked) {
					blockedReplace = this.words.blocked[bWord].empty ? "" : (this.words.blocked[bWord].replace || replaces.blocked);
					let reg = this.createReg(bWord, this.words.blocked[bWord]);
					strings.forEach(string => {
						if (this.testForEmoji(string, reg)) blocked = true;
						else if (string.indexOf('<img src="http') == 0) {
							if (reg.test(string.split('src="').length > 0 && (string.split('src="')[1] || "").split('"')[0])) blocked = true;
						}
						else if (string.indexOf("<") != 0) {
							string.replace(/\n/g, " \n ").split(" ").forEach(word => {
								let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"]/g, "");
								if (word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial)) blocked = true;
							});
						}
					});
					if (blocked) break;
				}
				if (blocked) {
					newhtml = BDFDB.StringUtils.htmlEscape(blockedReplace);
					message.innerHTML = newhtml;
					BDFDB.DOMUtils.addClass(message, "blocked");
					message.ChatFilterOriginalHTML = orightml;
					message.ChatFilterNewHTML = newhtml;

					this.addClickListener(message, settings.showMessageOnClick);
				}
				else {
					let censored = false;
					for (let cWord in this.words.censored) {
						let censoredReplace = this.words.censored[cWord].empty ? "" : (this.words.censored[cWord].replace || replaces.censored);
						let reg = this.createReg(cWord, this.words.censored[cWord]);
						strings.forEach((string,i) => {
							if (this.testForEmoji(string, reg)) {
								censored = true;
								strings[i] = BDFDB.StringUtils.htmlEscape(censoredReplace);
								if (strings[i+1] && strings[i+1].indexOf("<input") == 0) {
									strings[i+1] = "";
									if (strings[i-1] && strings[i-1].indexOf("<span") == 0) strings[i-1] = "";
									if (strings[i+2] && strings[i+2].indexOf("</span") == 0) strings[i+2] = "";
								}
							}
							else if (string.indexOf('<img src="http') == 0) {
								if (reg.test(string.split('src="').length > 0 && (string.split('src="')[1] || "").split('"')[0])) {
									censored = true;
									strings = [BDFDB.StringUtils.htmlEscape(censoredReplace)];
								}
							}
							else if (string.indexOf("<") != 0) {
								let newstring = [];
								string.replace(/\n/g, " \n ").split(" ").forEach((word) => {
									let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"]/g, "");
									if (word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial)) {
										censored = true;
										newstring.push(BDFDB.StringUtils.htmlEscape(censoredReplace));
									}
									else newstring.push(word);
								});
								strings[i] = newstring.join(" ").replace(/ \n /g, "\n");
							}
						});
					}
					if (censored) {
						newhtml = strings.join("");
						message.innerHTML = newhtml;
						BDFDB.DOMUtils.addClass(message, "censored");
						message.ChatFilterOriginalHTML = orightml;
						message.ChatFilterNewHTML = newhtml;

						this.addClickListener(message, settings.showMessageOnClick);
					}
				}
			}
		}
	}

	createReg (word, config) {
		return new RegExp(BDFDB.StringUtils.htmlEscape(config.exact ? "^" + BDFDB.StringUtils.regEscape(word) + "$" : BDFDB.StringUtils.regEscape(word)), config.case ? "" : "i");
	}

	testForEmoji (string, reg) {
		if (string.indexOf("<img ") == 0 && (string.indexOf('class="emote') > -1 || string.indexOf('class="emoji') > -1)) {
			var emojiname = string.split('alt="').length > 0 ? string.split('alt="')[1].split('"')[0] : null;
			return emojiname = !emojiname ? false : (reg.test(emojiname) || reg.test(emojiname.replace(/:/g, "")));
		}
		return false;
	}

	resetMessage (message) {
		message.innerHTML = message.ChatFilterOriginalHTML;
		BDFDB.DOMUtils.removeClass(message, "blocked", "censored", "revealed");
		BDFDB.DOMUtils.show(message);
		delete message.ChatFilterOriginalHTML;
		delete message.ChatFilterNewHTML;
		message.removeEventListener("click", message.clickChatFilterListener);
	}

	addClickListener (message, addListener) {
		message.removeEventListener("click", message.clickChatFilterListener);
		if (addListener) {
			message.clickChatFilterListener = _ => {
				if (BDFDB.DOMUtils.containsClass(message, "revealed")) {
					BDFDB.DOMUtils.removeClass(message, "revealed");
					message.innerHTML = message.ChatFilterNewHTML;
				}
				else {
					BDFDB.DOMUtils.addClass(message, "revealed");
					message.innerHTML = message.ChatFilterOriginalHTML;
				}
			};
			message.addEventListener("click", message.clickChatFilterListener);
		}
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
		if (!BDFDB.ObjectUtils.is(this.words[values.choice])) this.words[values.choice] = {};
		this.words[values.choice][values.wordvalue] = {
			replace: values.replacevalue,
			empty: configs.empty,
			case: configs.case,
			exact: values.wordvalue.indexOf(" ") > -1 ? false : configs.exact,
			regex: false
		};
		BDFDB.DataUtils.save(this.words, this, "words");
	}
}
