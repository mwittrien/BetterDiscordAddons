//META{"name":"MessageUtilities","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/MessageUtilities","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/MessageUtilities/MessageUtilities.plugin.js"}*//

class MessageUtilities {
	getName () {return "MessageUtilities";}

	getVersion () {return "1.6.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Offers a number of useful message options. Remap the keybindings in the settings.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};
		
		this.patchedModules = {
			after: {
				MessageContextMenu: ["componentDidMount","componentDidUpdate"]
			}
		};
	}

	initConstructor () {
		this.bindings = {};

		this.firedEvents = [];

		this.clickMap = ["CLICK", "DBLCLICK"];

		this.defaults = {
			settings: {
				"addHints":					{value:true, 	description:"Add keycombo hints to contextmenus:"},
				"clearOnEscape":			{value:true, 	description:"Clear chat input when Escape is pressed:"}
			},
			toasts: {},
			bindings: {
				"Edit_Message":				{name:"Edit Message",									func:this.doEdit,			value:{click:1, 	keycombo:[]}		},
				"Delete_Message":			{name:"Delete Message",									func:this.doDelete,			value:{click:0, 	keycombo:[46]}		},
				"Pin/Unpin_Message":		{name:"Pin/Unpin Message",								func:this.doPinUnPin,		value:{click:0, 	keycombo:[17]}		},
				"React_to_Message":			{name:"React to Message",								func:this.doOpenReact,		value:{click:0, 	keycombo:[17,83]}	},
				"Copy_Raw":					{name:"Copy raw Message",								func:this.doCopyRaw,		value:{click:0, 	keycombo:[17,68]}	},
				"Copy_Link":				{name:"Copy Message Link",								func:this.doCopyLink,		value:{click:0, 	keycombo:[17,81]}	},
				"__Note_Message":			{name:"Note Message (Pesonal Pins)",					func:this.doNote,			value:{click:0, 	keycombo:[16]}, 	plugin:"PersonalPins"},
				"__Translate_Message":		{name:"Translate Message (Google Translate Option)",	func:this.doTranslate,		value:{click:0, 	keycombo:[20]}, 	plugin:"GoogleTranslateOption"},
				"__Quote_Message":			{name:"Quote Message (Quoter)",							func:this.doQuote,			value:{click:0, 	keycombo:[17,87]}, 	plugin:"Quoter"},
				"__Citate_Message":			{name:"Quote Message (Citador)",						func:this.doCitate,			value:{click:0, 	keycombo:[17,78]}, 	plugin:"Citador"},
				"__Reveal_Spoilers":		{name:"Reveal All Spoilers (RevealAllSpoilersOption)",	func:this.doReveal,			value:{click:0, 	keycombo:[17,74]}, 	plugin:"RevealAllSpoilersOption"}
			}
		};
		for (let type in this.defaults.bindings) {
			let nativeaction = type.indexOf("__") != 0;
			this.defaults.settings[type] = {value:nativeaction};
			if (nativeaction) this.defaults.toasts[type] = {value:type != "Edit_Message" && type != "React_to_Message"};
		}
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let bindings = BDFDB.DataUtils.get(this, "bindings");
		let toasts = BDFDB.DataUtils.get(this, "toasts");
		let settingsitems = [];
		
		for (let key in settings) if (this.defaults.settings[key].description) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
			className: BDFDB.disCN.marginbottom8
		}));
		for (let action in bindings) if (!this.defaults.bindings[action].plugin || BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings[action].plugin)) {
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
				className: BDFDB.disCN.marginbottom8,
				align: BDFDB.LibraryComponents.Flex.Align.CENTER,
				direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
						label: this.defaults.bindings[action].name
					}),
					toasts[action] != undefined ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						mini: true,
						plugin: this,
						keys: ["toasts", action],
						grow: 0,
						label: "Toast:",
						value: toasts[action]
					}) : null
				].filter(n => n)
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				dividerbottom: true,
				mini: true,
				plugin: this,
				keys: ["settings", action],
				value: settings[action],
				labelchildren: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
							value: bindings[action].click,
							options: this.clickMap.map((label, i) => {return {value:i, label:label}}),
							onChange: choice => {
								bindings[action].click = choice.value;
								BDFDB.DataUtils.save(bindings, this, "bindings");
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.KeybindRecorder, {
							defaultValue: bindings[action].keycombo.filter(n => n),
							reset: true,
							onChange: keycombo => {
								bindings[action].keycombo = keycombo;
								BDFDB.DataUtils.save(bindings, this, "bindings");
							}
						})
					]
				})
			}));
		}
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "Button",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.RED,
			label: "Reset all Key Bindings",
			onClick: (e, instance) => {
				BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all Key Bindings?", _ => {
					BDFDB.DataUtils.remove(this, "bindings");
					BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(instance, {key: `${this.name}-settingspanel`, up: true}));
				});
			},
			children: BDFDB.LanguageUtils.LanguageStrings.RESET
		}));
		
		return BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	getSettingsPanel2 () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings"); 
		let toasts = BDFDB.DataUtils.get(this, "toasts"); 
		let bindings = BDFDB.DataUtils.get(this, "bindings");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			if (this.defaults.settings[key].description) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let action in bindings) {
			if (!this.defaults.bindings[action].plugin || BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings[action].plugin)) {
				settingshtml += `<div class="${BDFDB.disCNS.divider + BDFDB.disCN.marginbottom4}"></div>`;
				settingshtml += `<div class="${action}-key-settings"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.bindings[action].name}:</h3>${toasts[action] != undefined ? `<h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 0 0 auto;">Toast:</h5><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="toasts ${action}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${toasts[action] ? " checked" : ""}></div>` : ''}<h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 0 0 auto;">Enabled:</h5><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${action}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[action] ? " checked" : ""}></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">`;
				settingshtml += `<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 20%;"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin + BDFDB.disCN.marginbottom4}">Click:</h5>${BDFDB.createSelectMenu(this.createSelectChoice(bindings[action].click), bindings[action].click, action + " click")}</div>`;
				for (let key of this.keys) {
					settingshtml += `<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 40%;"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin + BDFDB.disCN.marginbottom4}">${key}:<label class="reset-recorder" style="float: right; padding-right: 5px; cursor: pointer;">✖</label></h5><div type="${action}" option="${key}" value="${bindings[action][key]}" class="${BDFDB.disCNS.hotkeycontainer + BDFDB.disCNS.hotkeycontainer2 + BDFDB.disCN.hotkeyhasvalue}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.hotkeylayout + BDFDB.disCN.hotkeylayout2}" style="flex: 1 1 auto;"><input type="text" placeholder="${this.keyboardMap[bindings[action][key]]}" readonly="" value="${this.keyboardMap[bindings[action][key]]}" class="${BDFDB.disCNS.hotkeyinput + BDFDB.disCNS.hotkeyinput2 + BDFDB.disCN.hotkeybase}" style="flex: 1 1 auto;"></input><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCN.nowrap}" style="flex: 0 1 auto; margin: 0px;"><button type="button" class="${BDFDB.disCNS.hotkeybutton + BDFDB.disCNS.hotkeybutton2 + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookghost + BDFDB.disCNS.buttoncolorgrey + BDFDB.disCNS.buttonsizemin + BDFDB.disCN.buttongrow}"><div class="${BDFDB.disCN.buttoncontents}"><span class="${BDFDB.disCN.hotkeytext}">${BDFDB.LanguageUtils.LanguageStrings.SHORTCUT_RECORDER_BUTTON_EDIT}</span><span class="${BDFDB.disCN.hotkeyediticon}"/></div></button></div></div></div></div>`;
				}
				settingshtml += `</div></div>`;
			}
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all key bindings.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.DOMUtils.create(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.ListenerUtils.add(this, settingspanel, "click", BDFDB.dotCN.hotkeycontainer, e => {this.startRecording(settingspanel, e);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".reset-recorder", e => {this.resetRecorder(settingspanel, e);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".reset-button", () => {this.resetAll(settingspanel);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {
			BDFDB.openDropdownMenu(e, this.saveSelectChoice.bind(this), this.createSelectChoice.bind(this), this.clickMap);
		});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);
			
			// REMOVE 15.11.2019
			let bindings = BDFDB.DataUtils.load(this, "bindings");
			if (bindings[Object.keys(bindings)[0]].keycombo == undefined) {
				for (let key in bindings) bindings[key] = {click: bindings[key].click, keycombo: [bindings[key].key1, bindings[key].key2].filter(n => n)};
				BDFDB.DataUtils.save(bindings, this, "bindings");
			}

			BDFDB.ListenerUtils.add(this, document, "click", BDFDB.dotCN.messagegroup + "> [aria-disabled]," + BDFDB.dotCN.messagegroup + "> * > [aria-disabled]," + BDFDB.dotCN.messagesystem, e => {
				this.onClick(e, 0, "onSglClick");
			})
			BDFDB.ListenerUtils.add(this, document, "dblclick", BDFDB.dotCN.messagegroup + "> [aria-disabled]," + BDFDB.dotCN.messagegroup + "> * > [aria-disabled]," + BDFDB.dotCN.messagesystem, e => {
				this.onClick(e, 1, "onDblClick");
			});
			BDFDB.ListenerUtils.add(this, document, "keydown", BDFDB.dotCN.textareawrapchat, e => {
				this.onKeyDown(e, e.which, "onKeyDown");
			});
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.PluginUtils.clear(this);
		}
	}


	//begin of own functions
	
	processMessageContextMenu (e) {
		if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
			for (let itemlabel of e.node.querySelectorAll(BDFDB.dotCN.contextmenulabel)) {
				let hint = itemlabel.parentElement.querySelector(BDFDB.dotCN.contextmenuhint);
				if (hint) {
					let action = null;
					switch (itemlabel.innerText) {
						case BDFDB.LanguageUtils.LanguageStrings.COPY_MESSAGE_LINK:
							action = "Copy_Link";
							break;
						case BDFDB.LanguageUtils.LanguageStrings.EDIT_MESSAGE:
							action = "Edit_Message";
							break;
						case BDFDB.LanguageUtils.LanguageStrings.PIN_MESSAGE:
						case BDFDB.LanguageUtils.LanguageStrings.UNPIN_MESSAGE:
							action = "Pin/Unpin_Message";
							break;
						case BDFDB.LanguageUtils.LanguageStrings.DELETE_MESSAGE:
							action = "Delete_Message";
							break;
					}
					if (action) {
						let hintlabel = this.getActiveShortcutString(action);
						if (hintlabel) {
							hint.style.setProperty("width", "42px");
							hint.style.setProperty("max-width", "42px");
							hint.style.setProperty("margin-left", "8px");
							BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {speed: 2, children: hintlabel}), hint);
						}
					}
				}
			}
		}
	}

	startRecording (settingspanel, e) {
		let recorderWrap = e.currentTarget;
		if (BDFDB.DOMUtils.containsClass(recorderWrap, BDFDB.disCN.hotkeyrecording)) return;

		let recorderInput = recorderWrap.querySelector("input");
		let recorderText = recorderWrap.querySelector(BDFDB.dotCN.hotkeytext);
		let action = recorderWrap.getAttribute("type");
		let option = recorderWrap.getAttribute("option");

		BDFDB.DOMUtils.addClass(recorderWrap, BDFDB.disCN.hotkeyrecording);
		BDFDB.DOMUtils.removeClass(recorderWrap, BDFDB.disCN.hotkeyhasvalue);
		recorderText.innerText = BDFDB.LanguageUtils.LanguageStrings.SHORTCUT_RECORDER_BUTTON_RECORDING;


		var saveRecording = e => {
			recorderWrap.setAttribute("value", e.which);
			recorderInput.setAttribute("value", this.keyboardMap[e.which]);
		};

		var stopRecording = e => {
			document.removeEventListener("mousedown", stopRecording);
			document.removeEventListener("keydown", saveRecording);
			let binding = BDFDB.DataUtils.get(this, "bindings", action);
			binding[option] = parseInt(recorderWrap.getAttribute("value"));
			BDFDB.DataUtils.save(binding, this, "bindings", action);
			BDFDB.TimeUtils.timeout(() => {
				BDFDB.DOMUtils.removeClass(recorderWrap, BDFDB.disCN.hotkeyrecording);
				BDFDB.DOMUtils.addClass(recorderWrap, BDFDB.disCN.hotkeyhasvalue);
				recorderText.innerText = BDFDB.LanguageUtils.LanguageStrings.SHORTCUT_RECORDER_BUTTON_EDIT;
			},100);
		};

		document.addEventListener("mousedown", stopRecording);
		document.addEventListener("keydown", saveRecording);
	}

	resetRecorder (settingspanel, e) {
		let resetButton = e.currentTarget;
		let recorderWrap = e.currentTarget.parentElement.parentElement.querySelector(BDFDB.dotCN.hotkeycontainer);
		let recorderInput = recorderWrap.querySelector("input");
		let action = recorderWrap.getAttribute("type");
		let option = recorderWrap.getAttribute("option");
		recorderWrap.setAttribute("value", 0);
		recorderInput.setAttribute("value", this.keyboardMap[0]);
		let binding = BDFDB.DataUtils.get(this, "bindings", action);
		binding[option] = parseInt(recorderWrap.getAttribute("value"));
		BDFDB.DataUtils.save(binding, this, "bindings", action);
	}

	onClick (e, click, name) {
		if (!this.isEventFired(name)) {
			this.fireEvent(name);
			let settings = BDFDB.DataUtils.get(this, "settings");
			let bindings = BDFDB.ObjectUtils.filter(BDFDB.DataUtils.get(this, "bindings"), action => {return settings[action]}, true);
			let priorityaction = null;
			for (let action in bindings) {
				let binding = bindings[action];
				let prioritybinding = bindings[priorityaction];
				if (this.checkIfBindingIsValid(binding, click) && (!bindings[priorityaction] || binding.click > prioritybinding.click || binding.keycombo.length > prioritybinding.keycombo.length)) priorityaction = action;
			}
			if (priorityaction) {
				let {messagediv, pos, message} = this.getMessageData(e.currentTarget);
				if (messagediv && pos > -1 && message) {
					BDFDB.ListenerUtils.stopEvent(e);
					BDFDB.TimeUtils.clear(this.clickTimeout);
					if (!this.hasDoubleClickOverwrite(bindings, bindings[priorityaction])) {
						this.defaults.bindings[priorityaction].func.apply(this, [{messagediv, pos, message}, priorityaction]);
					}
					else this.clickTimeout = BDFDB.TimeUtils.timeout(() => {
						this.defaults.bindings[priorityaction].func.apply(this, [{messagediv, pos, message}, priorityaction]);
					}, 500);
				}
			}
			this.cancelEvent(name);
		}
	}

	checkIfBindingIsValid (binding, doneclick) {
		let valid = true;
		if (binding.click != doneclick) valid = false;
		for (let key of binding.keycombo) if (!BDFDB.InternalData.pressedKeys.includes(key)) valid = false;
		return valid;
	}

	hasDoubleClickOverwrite (bindings, binding) {
		if (binding.click == 1) return false;
		let dblbindings = BDFDB.ObjectUtils.filter(bindings, bndg => {return bndg.click == 1});
		for (let dblaction in dblbindings) {
			let dblbndg = dblbindings[dblaction];
			let overwrite = true;
			if (BDFDB.equals(binding.keycombo, dblbndg.keycombo)) return true;
		}
		return false;
	}

	doDelete ({messagediv, pos, message}, action) {
		let deletelink = messagediv.parentElement.querySelector(BDFDB.dotCNS.messagelocalbotmessage + BDFDB.dotCN.anchor);
		if (deletelink) deletelink.click();
		else {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
			if ((channel && BDFDB.UserUtils.can("MANAGE_MESSAGES")) || message.author.id == BDFDB.UserUtils.me.id && message.type != 1 && message.type != 2 && message.type != 3) {
				BDFDB.LibraryModules.MessageUtils.deleteMessage(message.channel_id, message.id, message.state != "SENT");
				if (BDFDB.DataUtils.get(this, "toasts", action)) BDFDB.NotificationUtils.toast("Message has been deleted.", {type:"success"});
			}
		}
	}

	doEdit ({messagediv, pos, message}, action) {
		if (message.author.id == BDFDB.UserUtils.me.id && !messagediv.querySelector("textarea")) {
			BDFDB.LibraryModules.MessageUtils.startEditMessage(message.channel_id, message.id, message.content);
			if (BDFDB.DataUtils.get(this, "toasts", action)) BDFDB.NotificationUtils.toast("Started editing.", {type:"success"});
		}
	}

	doOpenReact ({messagediv, pos, message}, action) {
		let reactButton = messagediv.querySelector(BDFDB.dotCN.emojipickerbutton);
		if (reactButton) {
			reactButton.click();
			if (BDFDB.DataUtils.get(this, "toasts", action)) BDFDB.NotificationUtils.toast("Reaction popout has been opened.", {type:"success"});
		}
	}

	doPinUnPin ({messagediv, pos, message}, action) {
		if (message.state == "SENT") {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
			if (channel && (channel.type == 1 || channel.type == 3 || BDFDB.UserUtils.can("MANAGE_MESSAGES")) && message.type == 0) {
				if (message.pinned) {
					BDFDB.LibraryModules.MessagePinUtils.unpinMessage(channel, message.id);
					if (BDFDB.DataUtils.get(this, "toasts", action)) BDFDB.NotificationUtils.toast("Message has been unpinned.", {type:"error"});
				}
				else {
					BDFDB.LibraryModules.MessagePinUtils.pinMessage(channel, message.id);
					if (BDFDB.DataUtils.get(this, "toasts", action)) BDFDB.NotificationUtils.toast("Message has been pinned.", {type:"success"});
				}
			}
		}
	}

	doCopyRaw ({messagediv, pos, message}, action) {
		if (message.content) {
			BDFDB.LibraryRequires.electron.clipboard.write({text:message.content});
			if (BDFDB.DataUtils.get(this, "toasts", action)) BDFDB.NotificationUtils.toast("Raw message content has been copied.", {type:"success"});
		}
	}

	doCopyLink ({messagediv, pos, message}, action) {
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
		if (channel) {
			BDFDB.LibraryRequires.electron.clipboard.write({text:`https://discordapp.com/channels/${channel.guild_id}/${channel.id}/${message.id}`});
			if (BDFDB.DataUtils.get(this, "toasts", action)) BDFDB.NotificationUtils.toast("Messagelink has been copied.", {type:"success"});
		}
	}

	doNote ({messagediv, pos, message}, action) {
		if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Note_Message.plugin)) {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
			if (channel) BDFDB.BDUtils.getPlugin(this.defaults.bindings.__Note_Message.plugin).addMessageToNotes(message, messagediv, channel);
		}
	}

	doTranslate ({messagediv, pos, message}, action) {
		if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Translate_Message.plugin)) {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
			if (channel) BDFDB.BDUtils.getPlugin(this.defaults.bindings.__Translate_Message.plugin).translateMessage(message, messagediv, channel);
		}
	}

	doQuote ({messagediv, pos, message}, action) {
		if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Quote_Message.plugin)) {
			let quoteButton = messagediv.querySelector(".btn-quote");
			if (quoteButton) quoteButton.click();
		}
	}

	doCitate ({messagediv, pos, message}, action) {
		if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Citate_Message.plugin)) {
			let citarButton = messagediv.parentElement.querySelector(".citar-btn");
			if (citarButton) citarButton.click();
		}
	}

	doReveal ({messagediv, pos, message}, action) {
		if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Reveal_Spoilers.plugin)) {
			BDFDB.BDUtils.getPlugin(this.defaults.bindings.__Reveal_Spoilers.plugin).revealAllSpoilers(messagediv);
		}
	}

	onKeyDown (e, key, name) {
		if (!this.isEventFired(name)) {
			this.fireEvent(name);
			if (key == 27 && BDFDB.DataUtils.get(this, "settings", "clearOnEscape")) {
				let instance = BDFDB.ReactUtils.findOwner(BDFDB.DOMUtils.getParent(BDFDB.dotCNS.chat + "form", e.currentTarget), {name:"ChannelTextAreaForm", up:true});
				if (instance) instance.setState({textValue:""});
			}
			this.cancelEvent(name);
		}
	}

	getActiveShortcutString (action) {
		if (!action) return null;
		let str = "", settings = BDFDB.DataUtils.get(this, "settings");
		if (settings.addHints && settings[action]) {
			let binding = BDFDB.DataUtils.get(this, "bindings", action);
			if (binding) {
				str += this.clickMap(binding.click);
				if (binding.keycombo.length) str += " + " + BDFDB.LibraryModules.KeyCodeUtils.getString(binding.keycombo);
			}
		}
		return str.replace(/ /g, "");
	}

	getMessageData (target) {
		let messagediv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagegroup + "> [aria-disabled]", target) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagegroup + "> * > [aria-disabled]", target) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagesystem, target);
		let pos = messagediv ? Array.from(messagediv.parentElement.childNodes).filter(n => n.nodeType != Node.TEXT_NODE).indexOf(messagediv) : -1;
		let instance = BDFDB.ReactUtils.getInstance(messagediv);
		let message = instance ? BDFDB.ReactUtils.findValue(instance, "message", {up:true}) : null;
		return {messagediv, pos, message};
	}

	fireEvent (name) {
		this.firedEvents.push(name);
	}

	isEventFired (name) {
		return this.firedEvents.includes(name);
	}

	cancelEvent (name) {
		BDFDB.TimeUtils.timeout(_ => {BDFDB.ArrayUtils.remove(this.firedEvents, name)});
	}
}
