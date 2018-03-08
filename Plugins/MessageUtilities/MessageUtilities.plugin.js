//META{"name":"MessageUtilities"}*//

class MessageUtilities {
	constructor () {		
		this.bindings = {};
		
		this.firedEvents = [];
		
		this.clickMap = ["SINGLE" /*[0]*/, "DOUBLE" /*[1]*/];
		
		this.keyboardMap = [
			"NONE" /*[0]*/, "" /*[1]*/, "" /*[2]*/, "CANCEL" /*[3]*/, "" /*[4]*/, "" /*[5]*/, "HELP" /*[6]*/, "" /*[7]*/, "BACK_SPACE" /*[8]*/, "TAB" /*[9]*/, "" /*[10]*/, "" /*[11]*/, "CLEAR" /*[12]*/, "ENTER" /*[13]*/, "ENTER_SPECIAL" /*[14]*/, "" /*[15]*/, "SHIFT" /*[16]*/, "CONTROL" /*[17]*/, "ALT" /*[18]*/, "PAUSE" /*[19]*/, "CAPS_LOCK" /*[20]*/, "KANA" /*[21]*/, "EISU" /*[22]*/, "JUNJA" /*[23]*/, "FINAL" /*[24]*/, "HANJA" /*[25]*/, "" /*[26]*/, "ESCAPE" /*[27]*/, "CONVERT" /*[28]*/, "NONCONVERT" /*[29]*/, "ACCEPT" /*[30]*/, "MODECHANGE" /*[31]*/, "SPACE" /*[32]*/, "PAGE_UP" /*[33]*/, "PAGE_DOWN" /*[34]*/, "END" /*[35]*/, "HOME" /*[36]*/, "LEFT" /*[37]*/, "UP" /*[38]*/, "RIGHT" /*[39]*/, "DOWN" /*[40]*/, "SELECT" /*[41]*/, "PRINT" /*[42]*/, "EXECUTE" /*[43]*/, "PRINTSCREEN" /*[44]*/, "INSERT" /*[45]*/, "DELETE" /*[46]*/, "" /*[47]*/,"0" /*[48]*/, "1" /*[49]*/, "2" /*[50]*/, "3" /*[51]*/, "4" /*[52]*/, "5" /*[53]*/, "6" /*[54]*/, "7" /*[55]*/, "8" /*[56]*/, "9" /*[57]*/, "COLON" /*[58]*/, "SEMICOLON" /*[59]*/, "LESS_THAN" /*[60]*/, "EQUALS" /*[61]*/, "GREATER_THAN" /*[62]*/, "QUESTION_MARK" /*[63]*/, "AT" /*[64]*/, "A" /*[65]*/, "B" /*[66]*/, "C" /*[67]*/, "D" /*[68]*/, "E" /*[69]*/, "F" /*[70]*/, "G" /*[71]*/, "H" /*[72]*/, "I" /*[73]*/, "J" /*[74]*/, "K" /*[75]*/, "L" /*[76]*/, "M" /*[77]*/, "N" /*[78]*/, "O" /*[79]*/, "P" /*[80]*/, "Q" /*[81]*/, "R" /*[82]*/, "S" /*[83]*/, "T" /*[84]*/, "U" /*[85]*/, "V" /*[86]*/, "W" /*[87]*/, "X" /*[88]*/, "Y" /*[89]*/, "Z" /*[90]*/, "OS_KEY" /*[91]*/, "" /*[92]*/, "CONTEXT_MENU" /*[93]*/, "" /*[94]*/, "SLEEP" /*[95]*/, "NUMPAD0" /*[96]*/, "NUMPAD1" /*[97]*/, "NUMPAD2" /*[98]*/, "NUMPAD3" /*[99]*/, "NUMPAD4" /*[100]*/, "NUMPAD5" /*[101]*/, "NUMPAD6" /*[102]*/, "NUMPAD7" /*[103]*/, "NUMPAD8" /*[104]*/, "NUMPAD9" /*[105]*/, "MULTIPLY" /*[106]*/, "ADD" /*[107]*/, "SEPARATOR" /*[108]*/, "SUBTRACT" /*[109]*/, "DECIMAL" /*[110]*/, "DIVIDE" /*[111]*/, "F1" /*[112]*/, "F2" /*[113]*/, "F3" /*[114]*/, "F4" /*[115]*/, "F5" /*[116]*/, "F6" /*[117]*/, "F7" /*[118]*/, "F8" /*[119]*/, "F9" /*[120]*/, "F10" /*[121]*/, "F11" /*[122]*/, "F12" /*[123]*/, "F13" /*[124]*/, "F14" /*[125]*/, "F15" /*[126]*/, "F16" /*[127]*/, "F17" /*[128]*/, "F18" /*[129]*/, "F19" /*[130]*/, "F20" /*[131]*/, "F21" /*[132]*/, "F22" /*[133]*/, "F23" /*[134]*/, "F24" /*[135]*/, "" /*[136]*/, "" /*[137]*/, "" /*[138]*/, "" /*[139]*/, "" /*[140]*/, "" /*[141]*/, "" /*[142]*/, "" /*[143]*/, "NUM_LOCK" /*[144]*/, "SCROLL_LOCK" /*[145]*/, "WIN_OEM_FJ_JISHO" /*[146]*/, "WIN_OEM_FJ_MASSHOU" /*[147]*/, "WIN_OEM_FJ_TOUROKU" /*[148]*/, "WIN_OEM_FJ_LOYA" /*[149]*/, "WIN_OEM_FJ_ROYA" /*[150]*/, "" /*[151]*/, "" /*[152]*/, "" /*[153]*/, "" /*[154]*/, "" /*[155]*/, "" /*[156]*/, "" /*[157]*/, "" /*[158]*/, "" /*[159]*/, "CIRCUMFLEX" /*[160]*/, "EXCLAMATION" /*[161]*/, "DOUBLE_QUOTE" /*[162]*/, "HASH" /*[163]*/, "DOLLAR" /*[164]*/, "PERCENT" /*[165]*/, "AMPERSAND" /*[166]*/, "UNDERSCORE" /*[167]*/, "OPEN_PAREN" /*[168]*/, "CLOSE_PAREN" /*[169]*/, "ASTERISK" /*[170]*/, "PLUS" /*[171]*/, "PIPE" /*[172]*/, "HYPHEN_MINUS" /*[173]*/, "OPEN_CURLY_BRACKET" /*[174]*/, "CLOSE_CURLY_BRACKET" /*[175]*/, "TILDE" /*[176]*/, "" /*[177]*/, "" /*[178]*/, "" /*[179]*/, "" /*[180]*/, "VOLUME_MUTE" /*[181]*/, "VOLUME_DOWN" /*[182]*/, "VOLUME_UP" /*[183]*/, "" /*[184]*/, "" /*[185]*/, "SEMICOLON" /*[186]*/, "EQUALS" /*[187]*/, "COMMA" /*[188]*/, "MINUS" /*[189]*/, "PERIOD" /*[190]*/, "SLASH" /*[191]*/, "BACK_QUOTE" /*[192]*/, "" /*[193]*/, "" /*[194]*/, "" /*[195]*/, "" /*[196]*/, "" /*[197]*/, "" /*[198]*/, "" /*[199]*/, "" /*[200]*/, "" /*[201]*/, "" /*[202]*/, "" /*[203]*/, "" /*[204]*/, "" /*[205]*/, "" /*[206]*/, "" /*[207]*/, "" /*[208]*/, "" /*[209]*/, "" /*[210]*/, "" /*[211]*/, "" /*[212]*/, "" /*[213]*/, "" /*[214]*/, "" /*[215]*/, "" /*[216]*/, "" /*[217]*/, "" /*[218]*/, "OPEN_BRACKET" /*[219]*/, "BACK_SLASH" /*[220]*/, "CLOSE_BRACKET" /*[221]*/, "QUOTE" /*[222]*/, "" /*[223]*/, "META" /*[224]*/, "ALTGR" /*[225]*/, "" /*[226]*/, "WIN_ICO_HELP" /*[227]*/, "WIN_ICO_00" /*[228]*/, "" /*[229]*/, "WIN_ICO_CLEAR" /*[230]*/, "" /*[231]*/,"" /*[232]*/, "WIN_OEM_RESET" /*[233]*/, "WIN_OEM_JUMP" /*[234]*/, "WIN_OEM_PA1" /*[235]*/, "WIN_OEM_PA2" /*[236]*/, "WIN_OEM_PA3" /*[237]*/, "WIN_OEM_WSCTRL" /*[238]*/,"WIN_OEM_CUSEL" /*[239]*/, "WIN_OEM_ATTN" /*[240]*/, "WIN_OEM_FINISH" /*[241]*/, "WIN_OEM_COPY" /*[242]*/, "WIN_OEM_AUTO" /*[243]*/, "WIN_OEM_ENLW" /*[244]*/, "WIN_OEM_BACKTAB" /*[245]*/, "ATTN" /*[246]*/, "CRSEL" /*[247]*/, "EXSEL" /*[248]*/, "EREOF" /*[249]*/, "PLAY" /*[250]*/, "ZOOM" /*[251]*/, "" /*[252]*/, "PA1" /*[253]*/, "WIN_OEM_CLEAR" /*[254]*/, "" /*[255]*/
		];
		
		this.clicks = 	["click"];
		this.keys = 	["key1","key2"];
		this.defaults = {
			settings: {
				"Edit_Message":				{value:true},
				"Delete_Message":			{value:true},
				"Pin/Unpin_Message":		{value:true},
				"React_to_Message":			{value:true},
				"__Note_Message":			{value:false},
				"__Translate_Message":		{value:false},
				"__Quote_Message":			{value:false},
				"__Citate_Message":			{value:false}
			},
			bindings: {
				"Edit_Message":				{name:"Edit Message",									func:this.doEdit,			value:{click:1, 	key1:0, 	key2:0}},
				"Delete_Message":			{name:"Delete Message",									func:this.doDelete,			value:{click:0, 	key1:46, 	key2:0}},
				"Pin/Unpin_Message":		{name:"Pin/Unpin Message",								func:this.doPinUnPin,		value:{click:0, 	key1:17, 	key2:0}},
				"React_to_Message":			{name:"React to Message",								func:this.doOpenReact,		value:{click:0, 	key1:9, 	key2:0}},
				"__Note_Message":			{name:"Note Message (Pesonal Pins)",					func:this.doNote,			value:{click:0, 	key1:16, 	key2:0}},
				"__Translate_Message":		{name:"Translate Message (Google Translate Option)",	func:this.doTranslate,		value:{click:0, 	key1:20, 	key2:0}},
				"__Quote_Message":			{name:"Quote Message (Quoter)",							func:this.doQuote,			value:{click:0, 	key1:113, 	key2:0}},
				"__Citate_Message":			{name:"Quote Message (Citador)",						func:this.doCitate,			value:{click:0, 	key1:114, 	key2:0}}
			}
		};
	}

	getName () {return "MessageUtilities";}

	getDescription () {return "Offers a number of useful message options. Remap the keybindings in the settings.";}

	getVersion () {return "1.3.6";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var bindings = BDfunctionsDevilBro.getAllData(this, "bindings");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let action in bindings) {
			settingshtml += `<div class="${action}-key-settings"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.bindings[action].name}:</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${action}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[action] ? " checked" : ""}></div></div><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">`;
			for (let click of this.clicks) {
				settingshtml += `<div class="flexChild-1KGW5q" style="flex: 1 1 20%;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">${click}:</h5><div class="select-3JqNgs"><div type="${action}" option="${click}" value="${bindings[action][click]}" class="Select Select--single has-value"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="padding:0;">${this.clickMap[bindings[action][click]]}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div></div></div>`;
			}
			for (let key of this.keys) {
				settingshtml += `<div class="flexChild-1KGW5q" style="flex: 1 1 40%;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">${key}:<label class="reset-recorder" style="float:right;padding-right:5px;cursor:pointer;">✖</label></h5><div type="${action}" option="${key}" value="${bindings[action][key]}" class="container-3mpa-y container-2YgzWd hasValue-3eeIe5"><div class="layout flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO layout-2M2IoV layout-1qlGFe" style="flex: 1 1 auto;"><input type="text" placeholder="${this.keyboardMap[bindings[action][key]]}" readonly="" value="${this.keyboardMap[bindings[action][key]]}" class="input input-2ZbpUR input-1aITJk base-2IToIx" style="flex: 1 1 auto;"></input><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 0 1 auto; margin: 0px;"><button type="button" class="buttonGreyGhostDefault-2h5dqi buttonGhostDefault-2NFSwJ buttonDefault-2OLW-v button-2t3of8 buttonGhost-2Y7zWJ buttonGreyGhost-SfY7zU minGrow-1W9N45 min-K7DTfI button-2jURHM button-2FUBCE"><div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsGhost-2Yp1r8"><span class="text-2RnTnf">Change Hotkey</span><span class="editIcon-1MI9mZ"/></div></button></div></div></div></div>`;
			}
			settingshtml += `</div></div>`;
		}
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Reset all key bindings.</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorRed-3HTNPV sizeMedium-2VGNaF grow-25YQ8u reset-button" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		
		BDfunctionsDevilBro.initElements(settingspanel);
		
		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
			.on("click", ".Select-control", (e) => {this.openDropdownMenu(settingspanel, e);})
			.on("click", ".container-3mpa-y", (e) => {this.startRecording(settingspanel, e);})
			.on("click", ".reset-recorder", (e) => {this.resetRecorder(settingspanel, e);})
			.on("click", ".reset-button", () => {this.resetAll(settingspanel);});
			
		$(settingspanel).find(".__Note_Message-key-settings").toggle(BDfunctionsDevilBro.isPluginEnabled("PersonalPins") == true);
		$(settingspanel).find(".__Translate_Message-key-settings").toggle(BDfunctionsDevilBro.isPluginEnabled("GoogleTranslateOption") == true);
		$(settingspanel).find(".__Quote_Message-key-settings").toggle(BDfunctionsDevilBro.isPluginEnabled("Quoter") == true);
		$(settingspanel).find(".__Citate_Message-key-settings").toggle(BDfunctionsDevilBro.isPluginEnabled("Citador") == true);
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.ChannelStore = BDfunctionsDevilBro.WebModules.findByProperties(["getChannel", "getChannels"]);
			this.MessageActions = BDfunctionsDevilBro.WebModules.findByProperties(["startEditMessage", "endEditMessage"]);
			this.PinActions = BDfunctionsDevilBro.WebModules.findByProperties(["pinMessage", "unpinMessage"]);
			this.CurrentUserPerms = BDfunctionsDevilBro.WebModules.findByProperties(["getChannelPermissions", "can"]);
			this.Permissions = BDfunctionsDevilBro.WebModules.findByProperties(["Permissions", "ActivityTypes"]).Permissions;
			
			$(document)
				.on("click." + this.getName(), ".message", (e) => {
					this.onClick(e.currentTarget, 0, "onSglClick");
				})
				.on("dblclick." + this.getName(), ".message", (e) => {
					this.onClick(e.currentTarget, 1, "onDblClick");
				})
				.on("keydown." + this.getName(), ".channelTextArea-os01xC", (e) => {
					this.onKeyDown(e.currentTarget, e.which, "onKeyDown");
				});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(document).off("click." + this.getName(), ".message");
			$(document).off("dblclick." + this.getName(), ".message");
			$(document).off("keydown." + this.getName(), ".channelTextArea-os01xC");
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	//begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}
	
	resetAll (settingspanel) {
		if (confirm("Are you sure you want to delete all key bindings?")) {
			BDfunctionsDevilBro.removeAllData(this, "bindings");
			var bindings = BDfunctionsDevilBro.getAllData(this, "bindings");
			settingspanel.querySelectorAll(".Select").forEach((wrap) => {
				var action = wrap.getAttribute("type");
				var option = wrap.getAttribute("option");
				wrap.setAttribute("value", bindings[action][option]);
				wrap.querySelector(".title-3I2bY1").innerText = this.clickMap[bindings[action][option]];
			});
			settingspanel.querySelectorAll(".container-3mpa-y").forEach((wrap) => {
				var action = wrap.getAttribute("type");
				var option = wrap.getAttribute("option");
				wrap.setAttribute("value", bindings[action][option]);
				wrap.querySelector("input").setAttribute("value", this.keyboardMap[bindings[action][option]]);
			});;
		}
	}
	
	openDropdownMenu (settingspanel, e) {
		var selectControl = e.currentTarget;
		var selectWrap = e.currentTarget.parentElement;
		
		if (selectWrap.classList.contains("is-open")) return;
		
		selectWrap.classList.add("is-open");
		
		var action = selectWrap.getAttribute("type");
		var option = selectWrap.getAttribute("option");
		var value = selectWrap.getAttribute("value");
		
		var selectMenu = this.createDropdownMenu(action, value);
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), ".Select-option", (e2) => {
			var binding = BDfunctionsDevilBro.getData(action, this, "bindings");
			var selection = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", selection);
			selectControl.querySelector(".title-3I2bY1").innerText = e2.currentTarget.textContent;
			binding[option] = parseInt(selection);
			BDfunctionsDevilBro.saveData(action, binding, this, "bindings");
		});
		$(document).on("mousedown.select" + this.getName(), (e2) => {
			if (e2.target.parentElement == selectMenu) return;
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove()
			setTimeout(() => {selectWrap.classList.remove("is-open");},100);
		});
	}
	
	createDropdownMenu (action, value) {
		var menuhtml = `<div class="Select-menu-outer"><div class="Select-menu">`;
		for (var i in this.clickMap) {
			var isSelected = i == value ? " is-selected" : "";
			menuhtml += `<div value="${i}" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-option ${isSelected}" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm">${this.clickMap[i]}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	startRecording (settingspanel, e) {
		var recorderWrap = e.currentTarget;
		
		if (recorderWrap.classList.contains("recording-1Ne76k")) return;
		
		var recorderInput = recorderWrap.querySelector("input");
		var recorderText = recorderWrap.querySelector(".text-2RnTnf");
		var action = recorderWrap.getAttribute("type");
		var option = recorderWrap.getAttribute("option");
		
		recorderWrap.classList.add("recording-1Ne76k");
		recorderWrap.classList.remove("hasValue-3eeIe5");
		recorderText.innerText = "Stop Recording";
		
		$(document).on("keydown.recorder" + this.getName(), (e) => {
			recorderWrap.setAttribute("value", e.which);
			recorderInput.setAttribute("value", this.keyboardMap[e.which]);
		});
		
		$(document).on("mousedown.recorder" + this.getName(), () => {
			$(document).off("mousedown.recorder" + this.getName());
			$(document).off("keydown.recorder" + this.getName());
			var binding = BDfunctionsDevilBro.getData(action, this, "bindings");
			binding[option] = parseInt(recorderWrap.getAttribute("value"));
			BDfunctionsDevilBro.saveData(action, binding, this, "bindings");
			setTimeout(() => {
				recorderWrap.classList.remove("recording-1Ne76k");
				recorderWrap.classList.add("hasValue-3eeIe5");
				recorderText.innerText = "Change Hotkey";
			},100);
		});
	}
	
	resetRecorder (settingspanel, e) {
		var resetButton = e.currentTarget;
		var recorderWrap = e.currentTarget.parentElement.parentElement.querySelector(".container-3mpa-y");
		var recorderInput = recorderWrap.querySelector("input");
		var action = recorderWrap.getAttribute("type");
		var option = recorderWrap.getAttribute("option");
		recorderWrap.setAttribute("value", 0);
		recorderInput.setAttribute("value", this.keyboardMap[0]);
		var binding = BDfunctionsDevilBro.getData(action, this, "bindings");
		binding[option] = parseInt(recorderWrap.getAttribute("value"));
		BDfunctionsDevilBro.saveData(action, binding, this, "bindings");
	}
	
	onClick (div, click, name) {
		if (!this.isEventFired(name)) {
			this.fireEvent(name);
			var settings = BDfunctionsDevilBro.getAllData(this, "settings");
			var bindings = BDfunctionsDevilBro.getAllData(this, "bindings")
			for (let action in bindings) {
				if (settings[action] && this.checkIfBindingIsValid(bindings[action], click)) {
					var message = this.getMessageData(div);
					if (message) this.defaults.bindings[action].func.bind(this)(message);
					break;
				}
			}
			this.cancelEvent(name);
		}
	}
	
	checkIfBindingIsValid (binding, doneclick) {
		var valid = true;
		for (let click of this.clicks) {
			if (binding[click] != doneclick) valid = false;
		}
		for (let key of this.keys) {
			if (!BDfunctionsDevilBro.pressedKeys.includes(binding[key]) && binding[key] != 0) valid = false;
		}
		return valid;
	}
	
	doDelete (message) {
		var channel = this.ChannelStore.getChannel(message.channel_id);
		if ((channel && this.CurrentUserPerms.can(this.Permissions.MANAGE_MESSAGES, channel)) || message.author.id == BDfunctionsDevilBro.myData.id) {
			this.MessageActions.deleteMessage(message.channel_id, message.id);
		}
	}
	
	doEdit (message) {
		if (message.author.id == BDfunctionsDevilBro.myData.id) {
			this.MessageActions.startEditMessage(message.channel_id, message.id, message.content);
		}
	}
	
	doOpenReact (message) {
		var reactButton = message.div.querySelector(".btn-reaction");
		if (reactButton) reactButton.click();
	}
	
	doPinUnPin (message) {
		var channel = this.ChannelStore.getChannel(message.channel_id);
		if (channel && this.CurrentUserPerms.can(this.Permissions.MANAGE_MESSAGES, channel)) {
			if (message.pinned) 	this.PinActions.unpinMessage(channel, message.id);
			else 					this.PinActions.pinMessage(channel, message.id);
		}
	}
	
	doNote (message) {
		if (BDfunctionsDevilBro.isPluginEnabled("PersonalPins") == true) {
			var PersonalPins = window.bdplugins["PersonalPins"].plugin;
			PersonalPins.getMessageData(message.div);
			PersonalPins.addMessageToNotes();
		}
	}
	
	doTranslate (message) {
		if (BDfunctionsDevilBro.isPluginEnabled("GoogleTranslateOption") == true) {
			var GoogleTranslateOption = window.bdplugins["GoogleTranslateOption"].plugin;
			GoogleTranslateOption.getMessageData(message.div);
			GoogleTranslateOption.translateMessage();
		}
	}
	
	doQuote (message) {
		if (BDfunctionsDevilBro.isPluginEnabled("Quoter") == true) {
			var quoteButton = message.div.querySelector(".btn-quote");
			if (quoteButton) quoteButton.click();
		}
	}
	
	doCitate (message) {
		if (BDfunctionsDevilBro.isPluginEnabled("Citador") == true) {
			var citarButton = message.div.parentElement.querySelector(".citar-btn");
			if (citarButton) citarButton.click();
		}
	}
	
	onKeyDown (div, key, name) {
		if (!this.isEventFired(name)) {
			this.fireEvent(name);
			if (key == 27) {
				var instance = BDfunctionsDevilBro.getOwnerInstance({"node":div, "name":"ChannelTextAreaForm", "up":true});
				if (instance) instance.setState({textValue:""});
			}
			this.cancelEvent(name);
		}
	}
	
	getMessageData (div) {
		if (div) {
			var messagegroup = $(".message-group").has(div);
			var pos = messagegroup.find(".message").index(div);
			if (messagegroup[0] && pos > -1) {
				var info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"messages","up":true,"time":1000});
				if (info) return Object.assign({},info[pos],{"div":div, "group":messagegroup[0], "pos":pos});
			}
		}
		return null;
	}
	
	fireEvent (name) {
		this.firedEvents.push(name);
	}
	
	isEventFired (name) {
		return this.firedEvents.includes(name);
	}
	
	cancelEvent (name) {
		BDfunctionsDevilBro.removeFromArray(this.firedEvents, name);
	}
}
