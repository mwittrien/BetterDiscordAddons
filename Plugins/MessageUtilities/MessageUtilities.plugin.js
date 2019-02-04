//META{"name":"MessageUtilities","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/MessageUtilities","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/MessageUtilities/MessageUtilities.plugin.js"}*//

class MessageUtilities {
	getName () {return "MessageUtilities";}

	getVersion () {return "1.4.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Offers a number of useful message options. Remap the keybindings in the settings.";}

	initConstructor () {
		this.changelog = {
			"added":[["Reveal All Spoilers","Added support for the new Plugin 'RevealAllSpoilersOption'"]],
			"fixed":[["Enable/Disabled","Fixed the bug where enabling/disabling a keycombo option wouldn't be saved in the config"]]
		};
		
		this.bindings = {};

		this.firedEvents = [];

		this.clickMap = ["CLICK" /*[0]*/, "DBLCLICK" /*[1]*/];

		this.keyboardMap = [
			"NONE" /*[0]*/, "" /*[1]*/, "" /*[2]*/, "CANCEL" /*[3]*/, "" /*[4]*/, "" /*[5]*/, "HELP" /*[6]*/, "" /*[7]*/, "BACK_SPACE" /*[8]*/, "TAB" /*[9]*/, "" /*[10]*/, "" /*[11]*/, "CLEAR" /*[12]*/, "ENTER" /*[13]*/, "ENTER_SPECIAL" /*[14]*/, "" /*[15]*/, "SHIFT" /*[16]*/, "CONTROL" /*[17]*/, "ALT" /*[18]*/, "PAUSE" /*[19]*/, "CAPS_LOCK" /*[20]*/, "KANA" /*[21]*/, "EISU" /*[22]*/, "JUNJA" /*[23]*/, "FINAL" /*[24]*/, "HANJA" /*[25]*/, "" /*[26]*/, "ESCAPE" /*[27]*/, "CONVERT" /*[28]*/, "NONCONVERT" /*[29]*/, "ACCEPT" /*[30]*/, "MODECHANGE" /*[31]*/, "SPACE" /*[32]*/, "PAGE_UP" /*[33]*/, "PAGE_DOWN" /*[34]*/, "END" /*[35]*/, "HOME" /*[36]*/, "LEFT" /*[37]*/, "UP" /*[38]*/, "RIGHT" /*[39]*/, "DOWN" /*[40]*/, "SELECT" /*[41]*/, "PRINT" /*[42]*/, "EXECUTE" /*[43]*/, "PRINTSCREEN" /*[44]*/, "INSERT" /*[45]*/, "DELETE" /*[46]*/, "" /*[47]*/,"0" /*[48]*/, "1" /*[49]*/, "2" /*[50]*/, "3" /*[51]*/, "4" /*[52]*/, "5" /*[53]*/, "6" /*[54]*/, "7" /*[55]*/, "8" /*[56]*/, "9" /*[57]*/, "COLON" /*[58]*/, "SEMICOLON" /*[59]*/, "LESS_THAN" /*[60]*/, "EQUALS" /*[61]*/, "GREATER_THAN" /*[62]*/, "QUESTION_MARK" /*[63]*/, "AT" /*[64]*/, "A" /*[65]*/, "B" /*[66]*/, "C" /*[67]*/, "D" /*[68]*/, "E" /*[69]*/, "F" /*[70]*/, "G" /*[71]*/, "H" /*[72]*/, "I" /*[73]*/, "J" /*[74]*/, "K" /*[75]*/, "L" /*[76]*/, "M" /*[77]*/, "N" /*[78]*/, "O" /*[79]*/, "P" /*[80]*/, "Q" /*[81]*/, "R" /*[82]*/, "S" /*[83]*/, "T" /*[84]*/, "U" /*[85]*/, "V" /*[86]*/, "W" /*[87]*/, "X" /*[88]*/, "Y" /*[89]*/, "Z" /*[90]*/, "OS_KEY" /*[91]*/, "" /*[92]*/, "CONTEXT_MENU" /*[93]*/, "" /*[94]*/, "SLEEP" /*[95]*/, "NUMPAD0" /*[96]*/, "NUMPAD1" /*[97]*/, "NUMPAD2" /*[98]*/, "NUMPAD3" /*[99]*/, "NUMPAD4" /*[100]*/, "NUMPAD5" /*[101]*/, "NUMPAD6" /*[102]*/, "NUMPAD7" /*[103]*/, "NUMPAD8" /*[104]*/, "NUMPAD9" /*[105]*/, "MULTIPLY" /*[106]*/, "ADD" /*[107]*/, "SEPARATOR" /*[108]*/, "SUBTRACT" /*[109]*/, "DECIMAL" /*[110]*/, "DIVIDE" /*[111]*/, "F1" /*[112]*/, "F2" /*[113]*/, "F3" /*[114]*/, "F4" /*[115]*/, "F5" /*[116]*/, "F6" /*[117]*/, "F7" /*[118]*/, "F8" /*[119]*/, "F9" /*[120]*/, "F10" /*[121]*/, "F11" /*[122]*/, "F12" /*[123]*/, "F13" /*[124]*/, "F14" /*[125]*/, "F15" /*[126]*/, "F16" /*[127]*/, "F17" /*[128]*/, "F18" /*[129]*/, "F19" /*[130]*/, "F20" /*[131]*/, "F21" /*[132]*/, "F22" /*[133]*/, "F23" /*[134]*/, "F24" /*[135]*/, "" /*[136]*/, "" /*[137]*/, "" /*[138]*/, "" /*[139]*/, "" /*[140]*/, "" /*[141]*/, "" /*[142]*/, "" /*[143]*/, "NUM_LOCK" /*[144]*/, "SCROLL_LOCK" /*[145]*/, "WIN_OEM_FJ_JISHO" /*[146]*/, "WIN_OEM_FJ_MASSHOU" /*[147]*/, "WIN_OEM_FJ_TOUROKU" /*[148]*/, "WIN_OEM_FJ_LOYA" /*[149]*/, "WIN_OEM_FJ_ROYA" /*[150]*/, "" /*[151]*/, "" /*[152]*/, "" /*[153]*/, "" /*[154]*/, "" /*[155]*/, "" /*[156]*/, "" /*[157]*/, "" /*[158]*/, "" /*[159]*/, "CIRCUMFLEX" /*[160]*/, "EXCLAMATION" /*[161]*/, "DOUBLE_QUOTE" /*[162]*/, "HASH" /*[163]*/, "DOLLAR" /*[164]*/, "PERCENT" /*[165]*/, "AMPERSAND" /*[166]*/, "UNDERSCORE" /*[167]*/, "OPEN_PAREN" /*[168]*/, "CLOSE_PAREN" /*[169]*/, "ASTERISK" /*[170]*/, "PLUS" /*[171]*/, "PIPE" /*[172]*/, "HYPHEN_MINUS" /*[173]*/, "OPEN_CURLY_BRACKET" /*[174]*/, "CLOSE_CURLY_BRACKET" /*[175]*/, "TILDE" /*[176]*/, "" /*[177]*/, "" /*[178]*/, "" /*[179]*/, "" /*[180]*/, "VOLUME_MUTE" /*[181]*/, "VOLUME_DOWN" /*[182]*/, "VOLUME_UP" /*[183]*/, "" /*[184]*/, "" /*[185]*/, "SEMICOLON" /*[186]*/, "EQUALS" /*[187]*/, "COMMA" /*[188]*/, "MINUS" /*[189]*/, "PERIOD" /*[190]*/, "SLASH" /*[191]*/, "BACK_QUOTE" /*[192]*/, "" /*[193]*/, "" /*[194]*/, "" /*[195]*/, "" /*[196]*/, "" /*[197]*/, "" /*[198]*/, "" /*[199]*/, "" /*[200]*/, "" /*[201]*/, "" /*[202]*/, "" /*[203]*/, "" /*[204]*/, "" /*[205]*/, "" /*[206]*/, "" /*[207]*/, "" /*[208]*/, "" /*[209]*/, "" /*[210]*/, "" /*[211]*/, "" /*[212]*/, "" /*[213]*/, "" /*[214]*/, "" /*[215]*/, "" /*[216]*/, "" /*[217]*/, "" /*[218]*/, "OPEN_BRACKET" /*[219]*/, "BACK_SLASH" /*[220]*/, "CLOSE_BRACKET" /*[221]*/, "QUOTE" /*[222]*/, "" /*[223]*/, "META" /*[224]*/, "ALTGR" /*[225]*/, "" /*[226]*/, "WIN_ICO_HELP" /*[227]*/, "WIN_ICO_00" /*[228]*/, "" /*[229]*/, "WIN_ICO_CLEAR" /*[230]*/, "" /*[231]*/,"" /*[232]*/, "WIN_OEM_RESET" /*[233]*/, "WIN_OEM_JUMP" /*[234]*/, "WIN_OEM_PA1" /*[235]*/, "WIN_OEM_PA2" /*[236]*/, "WIN_OEM_PA3" /*[237]*/, "WIN_OEM_WSCTRL" /*[238]*/,"WIN_OEM_CUSEL" /*[239]*/, "WIN_OEM_ATTN" /*[240]*/, "WIN_OEM_FINISH" /*[241]*/, "WIN_OEM_COPY" /*[242]*/, "WIN_OEM_AUTO" /*[243]*/, "WIN_OEM_ENLW" /*[244]*/, "WIN_OEM_BACKTAB" /*[245]*/, "ATTN" /*[246]*/, "CRSEL" /*[247]*/, "EXSEL" /*[248]*/, "EREOF" /*[249]*/, "PLAY" /*[250]*/, "ZOOM" /*[251]*/, "" /*[252]*/, "PA1" /*[253]*/, "WIN_OEM_CLEAR" /*[254]*/, "" /*[255]*/
		];

		this.clicks = 	["click"];
		this.keys = 	["key1","key2"];
		this.defaults = {
			settings: {
				"clearOnEscape":			{value:true, 	description:"Clear chat input when Escape is pressed:"},
				"Edit_Message":				{value:true},
				"Delete_Message":			{value:true},
				"Pin/Unpin_Message":		{value:true},
				"React_to_Message":			{value:true},
				"__Note_Message":			{value:false},
				"__Translate_Message":		{value:false},
				"__Quote_Message":			{value:false},
				"__Citate_Message":			{value:false},
				"__Reveal_Spoilers":		{value:false}
			},
			bindings: {
				"Edit_Message":				{name:"Edit Message",									func:this.doEdit,			value:{click:1, 	key1:0, 	key2:0}},
				"Delete_Message":			{name:"Delete Message",									func:this.doDelete,			value:{click:0, 	key1:46, 	key2:0}},
				"Pin/Unpin_Message":		{name:"Pin/Unpin Message",								func:this.doPinUnPin,		value:{click:0, 	key1:17, 	key2:0}},
				"React_to_Message":			{name:"React to Message",								func:this.doOpenReact,		value:{click:0, 	key1:9, 	key2:0}},
				"__Note_Message":			{name:"Note Message (Pesonal Pins)",					func:this.doNote,			value:{click:0, 	key1:16, 	key2:0}, 	plugin:"PersonalPins"},
				"__Translate_Message":		{name:"Translate Message (Google Translate Option)",	func:this.doTranslate,		value:{click:0, 	key1:20, 	key2:0}, 	plugin:"GoogleTranslateOption"},
				"__Quote_Message":			{name:"Quote Message (Quoter)",							func:this.doQuote,			value:{click:0, 	key1:113, 	key2:0}, 	plugin:"Quoter"},
				"__Citate_Message":			{name:"Quote Message (Citador)",						func:this.doCitate,			value:{click:0, 	key1:114, 	key2:0}, 	plugin:"Citador"},
				"__Reveal_Spoilers":		{name:"Reveal All Spoilers (RevealAllSpoilersOption)",	func:this.doReveal,			value:{click:0, 	key1:115, 	key2:0}, 	plugin:"RevealAllSpoilersOption"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings"); 
		let bindings = BDFDB.getAllData(this, "bindings");
		let settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			if (this.defaults.settings[key].description) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let action in bindings) {
			if (!this.defaults.bindings[action].plugin || BDFDB.isPluginEnabled(this.defaults.bindings[action].plugin)) {
				settingshtml += `<div class="${action}-key-settings"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.bindings[action].name}:</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${action}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[action] ? " checked" : ""}></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">`;
				for (let click of this.clicks) {
					settingshtml += `<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 20%;"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin + BDFDB.disCN.marginbottom4}">${click}:</h5><div class="${BDFDB.disCN.selectwrap}"><div type="${action}" option="${click}" value="${bindings[action][click]}" class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}"><div class="${BDFDB.disCN.selectcontrol}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="padding:0;">${this.clickMap[bindings[action][click]]}</div></div><span class="${BDFDB.disCN.selectarrowzone}"><span class="${BDFDB.disCN.selectarrow}"></span></span></div></div></div></div>`;
				}
				for (let key of this.keys) {
					settingshtml += `<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 40%;"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin + BDFDB.disCN.marginbottom4}">${key}:<label class="reset-recorder" style="float: right; padding-right: 5px; cursor: pointer;">✖</label></h5><div type="${action}" option="${key}" value="${bindings[action][key]}" class="${BDFDB.disCNS.hotkeycontainer + BDFDB.disCNS.hotkeycontainer2 + BDFDB.disCN.hotkeyhasvalue}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.hotkeylayout + BDFDB.disCN.hotkeylayout2}" style="flex: 1 1 auto;"><input type="text" placeholder="${this.keyboardMap[bindings[action][key]]}" readonly="" value="${this.keyboardMap[bindings[action][key]]}" class="${BDFDB.disCNS.hotkeyinput + BDFDB.disCNS.hotkeyinput2 + BDFDB.disCN.hotkeybase}" style="flex: 1 1 auto;"></input><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCN.nowrap}" style="flex: 0 1 auto; margin: 0px;"><button type="button" class="${BDFDB.disCNS.hotkeybutton + BDFDB.disCNS.hotkeybutton2 + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookghost + BDFDB.disCNS.buttoncolorgrey + BDFDB.disCNS.buttonsizemin + BDFDB.disCN.buttongrow}"><div class="${BDFDB.disCN.buttoncontents}"><span class="${BDFDB.disCN.hotkeytext}">${BDFDB.LanguageStrings.SHORTCUT_RECORDER_BUTTON_EDIT}</span><span class="${BDFDB.disCN.hotkeyediticon}"/></div></button></div></div></div></div>`;
				}
				settingshtml += `</div></div>`;
			}
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all key bindings.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {this.openDropdownMenu(e);})
		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.hotkeycontainer, e => {this.startRecording(settingspanel, e);})
		BDFDB.addEventListener(this, settingspanel, "click", ".reset-recorder", e => {this.resetRecorder(settingspanel, e);})
		BDFDB.addEventListener(this, settingspanel, "click", ".reset-button", () => {this.resetAll(settingspanel);});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getChannel");
			this.MessageActions = BDFDB.WebModules.findByProperties("startEditMessage", "endEditMessage");
			this.PinActions = BDFDB.WebModules.findByProperties("pinMessage", "unpinMessage");
			this.CurrentUserPerms = BDFDB.WebModules.findByProperties("getChannelPermissions", "can");
			this.Permissions = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes").Permissions

			BDFDB.addEventListener(this, document, "click", BDFDB.dotCNC.message + BDFDB.dotCN.messagesystem, e => {
				this.onClick(e, 0, "onSglClick");
			})
			BDFDB.addEventListener(this, document, "dblclick", BDFDB.dotCNC.message + BDFDB.dotCN.messagesystem, e => {
				this.onClick(e, 1, "onDblClick");
			});
			BDFDB.addEventListener(this, document, "keydown", BDFDB.dotCN.textareawrapchat, e => {
				this.onKeyDown(e, e.which, "onKeyDown");
			});
		}
		else {
			console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.unloadMessage(this);
		}
	}


	//begin of own functions

	resetAll (settingspanel) {
		BDFDB.openConfirmModal(this, "Are you sure you want to delete all key bindings?", () => {
			BDFDB.removeAllData(this, "bindings");
			let bindings = BDFDB.getAllData(this, "bindings");
			settingspanel.querySelectorAll(BDFDB.dotCN.select).forEach((wrap) => {
				let action = wrap.getAttribute("type");
				let option = wrap.getAttribute("option");
				wrap.setAttribute("value", bindings[action][option]);
				wrap.querySelector(BDFDB.dotCN.title).innerText = this.clickMap[bindings[action][option]];
			});
			settingspanel.querySelectorAll(BDFDB.dotCN.hotkeycontainer).forEach((wrap) => {
				let action = wrap.getAttribute("type");
				let option = wrap.getAttribute("option");
				wrap.setAttribute("value", bindings[action][option]);
				wrap.querySelector("input").setAttribute("value", this.keyboardMap[bindings[action][option]]);
			});
		});
	}

	openDropdownMenu (e) {
		let selectControl = e.currentTarget;
		let selectWrap = selectControl.parentElement;
		let plugincard = BDFDB.getParentEle("li", selectWrap);

		if (!plugincard || BDFDB.containsClass(selectWrap, BDFDB.disCN.selectisopen)) return;

		BDFDB.addClass(selectWrap, BDFDB.disCN.selectisopen);
		plugincard.style.setProperty("overflow", "visible", "important");

		let action = selectWrap.getAttribute("type");
		let option = selectWrap.getAttribute("option");
		let value = selectWrap.getAttribute("value");

		let selectMenu = this.createDropdownMenu(action, value);
		selectWrap.appendChild(selectMenu);

		BDFDB.addChildEventListener(selectMenu, "mousedown", BDFDB.dotCN.selectoption, e2 => {
			let binding = BDFDB.getData(action, this, "bindings");
			let selection = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", selection);
			selectControl.querySelector(BDFDB.dotCN.title).innerText = e2.currentTarget.textContent;
			binding[option] = parseInt(selection);
			BDFDB.saveData(action, binding, this, "bindings");
		});

		var removeMenu = e2 => {
			if (e2.target.parentElement != selectMenu) {
				document.removeEventListener("mousedown", removeMenu);
				selectMenu.remove();
				plugincard.style.removeProperty("overflow");
				setTimeout(() => {BDFDB.removeClass(selectWrap, BDFDB.disCN.selectisopen);},100);
			}
		};
		document.addEventListener("mousedown", removeMenu);
	}

	createDropdownMenu (action, value) {
		let menuhtml = `<div class="${BDFDB.disCN.selectmenuouter}"><div class="${BDFDB.disCN.selectmenu}">`;
		for (let i in this.clickMap) {
			let isSelected = i == value ? ` ${BDFDB.disCN.selectselected}` : ``;
			menuhtml += `<div value="${i}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectoption + isSelected}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}">${this.clickMap[i]}</div></div>`
		}
		menuhtml += `</div></div>`;
		return BDFDB.htmlToElement(menuhtml);
	}

	startRecording (settingspanel, e) {
		let recorderWrap = e.currentTarget;
		if (BDFDB.containsClass(recorderWrap, BDFDB.disCN.hotkeyrecording)) return;

		let recorderInput = recorderWrap.querySelector("input");
		let recorderText = recorderWrap.querySelector(BDFDB.dotCN.hotkeytext);
		let action = recorderWrap.getAttribute("type");
		let option = recorderWrap.getAttribute("option");

		BDFDB.addClass(recorderWrap, BDFDB.disCN.hotkeyrecording);
		BDFDB.removeClass(recorderWrap, BDFDB.disCN.hotkeyhasvalue);
		recorderText.innerText = BDFDB.LanguageStrings.SHORTCUT_RECORDER_BUTTON_RECORDING;


		var saveRecording = e => {
			recorderWrap.setAttribute("value", e.which);
			recorderInput.setAttribute("value", this.keyboardMap[e.which]);
		};

		var stopRecording = e => {
			document.removeEventListener("mousedown", stopRecording);
			document.removeEventListener("keydown", saveRecording);
			let binding = BDFDB.getData(action, this, "bindings");
			binding[option] = parseInt(recorderWrap.getAttribute("value"));
			BDFDB.saveData(action, binding, this, "bindings");
			setTimeout(() => {
				BDFDB.removeClass(recorderWrap, BDFDB.disCN.hotkeyrecording);
				BDFDB.addClass(recorderWrap, BDFDB.disCN.hotkeyhasvalue);
				recorderText.innerText = BDFDB.LanguageStrings.SHORTCUT_RECORDER_BUTTON_EDIT;
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
		let binding = BDFDB.getData(action, this, "bindings");
		binding[option] = parseInt(recorderWrap.getAttribute("value"));
		BDFDB.saveData(action, binding, this, "bindings");
	}

	onClick (e, click, name) {
		if (!this.isEventFired(name)) {
			this.fireEvent(name);
			let settings = BDFDB.getAllData(this, "settings");
			let bindings = BDFDB.getAllData(this, "bindings");
			for (let action in bindings) {
				if (settings[action] && this.checkIfBindingIsValid(bindings[action], click)) {
					let {messagediv, pos, message} = this.getMessageData(e.currentTarget);
					if (messagediv && pos > -1 && message) {
						BDFDB.stopEvent(e);
						this.defaults.bindings[action].func.bind(this)({messagediv, pos, message});
					}
					break;
				}
			}
			this.cancelEvent(name);
		}
	}

	checkIfBindingIsValid (binding, doneclick) {
		let valid = true;
		for (let click of this.clicks) {
			if (binding[click] != doneclick) valid = false;
		}
		for (let key of this.keys) {
			if (!BDFDB.pressedKeys.includes(binding[key]) && binding[key] != 0) valid = false;
		}
		return valid;
	}

	doDelete ({messagediv, pos, message}) {
		let channel = this.ChannelUtils.getChannel(message.channel_id);
		if ((channel && this.CurrentUserPerms.can(this.Permissions.MANAGE_MESSAGES, channel)) || message.author.id == BDFDB.myData.id) {
			this.MessageActions.deleteMessage(message.channel_id, message.id);
		}
	}

	doEdit ({messagediv, pos, message}) {
		if (message.author.id == BDFDB.myData.id && !messagediv.querySelector("textarea")) {
			this.MessageActions.startEditMessage(message.channel_id, message.id, message.content);
		}
	}

	doOpenReact ({messagediv, pos, message}) {
		let reactButton = messagediv.querySelector(BDFDB.dotCN.emojipickerbutton);
		if (reactButton) reactButton.click();
	}

	doPinUnPin ({messagediv, pos, message}) {
		let channel = this.ChannelUtils.getChannel(message.channel_id);
		if (channel && this.CurrentUserPerms.can(this.Permissions.MANAGE_MESSAGES, channel)) {
			if (message.pinned) this.PinActions.unpinMessage(channel, message.id);
			else this.PinActions.pinMessage(channel, message.id);
		}
	}

	doNote ({messagediv, pos, message}) {
		if (BDFDB.isPluginEnabled(this.defaults.bindings.__Note_Message.plugin)) {
			let channel = this.ChannelUtils.getChannel(message.channel_id);
			if (channel) bdplugins[this.defaults.bindings.__Note_Message.plugin].plugin.addMessageToNotes(message, messagediv, channel);
		}
	}

	doTranslate ({messagediv, pos, message}) {
		if (BDFDB.isPluginEnabled(this.defaults.bindings.__Translate_Message.plugin)) {
			let channel = this.ChannelUtils.getChannel(message.channel_id);
			if (channel) bdplugins[this.defaults.bindings.__Translate_Message.plugin].plugin.translateMessage(message, messagediv, channel);
		}
	}

	doQuote ({messagediv, pos, message}) {
		if (BDFDB.isPluginEnabled(this.defaults.bindings.__Quote_Message.plugin)) {
			let quoteButton = messagediv.querySelector(".btn-quote");
			if (quoteButton) quoteButton.click();
		}
	}

	doCitate ({messagediv, pos, message}) {
		if (BDFDB.isPluginEnabled(this.defaults.bindings.__Citate_Message.plugin)) {
			let citarButton = messagediv.parentElement.querySelector(".citar-btn");
			if (citarButton) citarButton.click();
		}
	}

	doReveal ({messagediv, pos, message}) {
		if (BDFDB.isPluginEnabled(this.defaults.bindings.__Reveal_Spoilers.plugin)) {
			bdplugins[this.defaults.bindings.__Reveal_Spoilers.plugin].plugin.revealAllSpoilers(messagediv);
		}
	}

	onKeyDown (e, key, name) {
		if (!this.isEventFired(name)) {
			this.fireEvent(name);
			if (key == 27 && BDFDB.getData("clearOnEscape", this, "settings")) {
				let instance = BDFDB.getOwnerInstance({"node":e.currentTarget, "name":"ChannelTextAreaForm", "up":true});
				if (instance) {
					BDFDB.stopEvent(e);
					instance.setState({textValue:""});
				}
			}
			this.cancelEvent(name);
		}
	}

	getActiveShortcutString (action) {
		let str = "";
		if (BDFDB.getData(action, this, "settings")) {
			let binding = BDFDB.getData(action, this, "bindings");
			if (binding) for (let type in binding) {
				let typename = type.indexOf("click") == 0 ? this.clickMap[binding[type]] : this.keyboardMap[binding[type]];
				if (typename && typename != "NONE") str += typename + "+";
			}
		}
		return str ? str.slice(0,-1) : null;
	}

	getMessageData (target) {
		let messagediv = BDFDB.getParentEle(BDFDB.dotCN.message, target);
		let pos = messagediv ? Array.from(messagediv.parentElement.querySelectorAll(BDFDB.dotCN.message)).indexOf(messagediv) : -1;
		let instance = BDFDB.getReactInstance(messagediv);
		let message = instance && instance.return && instance.return.memoizedProps && instance.return.memoizedProps.message ? instance.return.memoizedProps.message : null;
		return {messagediv, pos, message};
	}

	fireEvent (name) {
		this.firedEvents.push(name);
	}

	isEventFired (name) {
		return this.firedEvents.includes(name);
	}

	cancelEvent (name) {
		BDFDB.removeFromArray(this.firedEvents, name);
	}
}
