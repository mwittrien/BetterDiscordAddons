//META{"name":"ChatFilter"}*//

class ChatFilter {
	initConstructor () {
		this.configs = ["empty","case","exact"];
		
		this.css = ` 
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageaccessory}.blocked:not(.revealed),
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messagemarkup}.blocked:not(.revealed) {
				font-weight: bold;
				font-style: italic;
			}
			
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageaccessory}.censored:not(.revealed),
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messagemarkup}:not(.revealed) {
				
			}`;
		
		this.defaults = {
			replaces: {
				blocked: 	{value:"~~BLOCKED~~",	title:"Block:",		description:"Default Replace Word for blocked Messages:"},
				censored:	{value:"$!%&%!&",		title:"Censor:",	description:"Default Replace Word for censored Messages:"}
			},
			settings: {
				showMessageOnClick: 	{value:{blocked:true, censored:true},	enabled:{blocked:true, censored:true},		description:"Show original Message on Click:"},
				hideMessage:			{value:{blocked:false, censored:false},	enabled:{blocked:true, censored:false},		description:"Completely hide targeted Messages:"}
			}
		};
	}

	getName () {return "ChatFilter";}

	getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

	getVersion () {return "3.3.1";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var replaces = BDFDB.getAllData(this, "replaces");
		var settings = BDFDB.getAllData(this, "settings");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let rtype in replaces) {
			var words = BDFDB.loadData(rtype, this, "words");
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto; min-width:55px;">${this.defaults.replaces[rtype].title}</h3><input rtype="${rtype}" action="add" type="text" placeholder="Wordvalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-${rtype}-wordvalue" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">With:</h3><input rtype="${rtype}" action="add" type="text" placeholder="Replacevalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-${rtype}-replacevalue" style="flex: 1 1 auto;"><button rtype="${rtype}" action="add" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addword" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
			for (let key in settings) {
				settingshtml += `<div rtype="${rtype}" value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" rtype="${rtype}" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key][rtype] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto; min-width: 320px;">${this.defaults.replaces[rtype].description}</h3><input rtype="${rtype}" type="text" placeholder="${this.defaults.replaces[rtype].value}" value="${replaces[rtype]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} defaultInputs" id="input-${rtype}-defaultvalue" style="flex: 1 1 auto;"></div>`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto; max-width: ${560 - (this.configs.length * 33)}px;">List of ${rtype} Words:</h3><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifycenter + BDFDB.disCNS.alignend + BDFDB.disCN.nowrap}" style="flex: 1 1 auto; max-width: ${this.configs.length * 34}px;">`;
			for (let config of this.configs) {
				settingshtml += `<div class="${BDFDB.disCNS.margintop8 +  BDFDB.disCNS.tableheadersize + BDFDB.disCNS.size10 + BDFDB.disCNS.primary + BDFDB.disCN.weightbold}" style="flex: 1 1 auto; width: 34px !important; text-align: center;">${config.toUpperCase()}</div>`;
			}
			settingshtml += `</div></div><div class="DevilBro-settings-inner-list ${rtype}-list">`;			
			for (let word in words) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis}" style="flex: 1 1 auto;">${BDFDB.encodeToHTML(word)} (${BDFDB.encodeToHTML(words[word].replace)})</div>`
				for (let config of this.configs) {
					settingshtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" rtype="${rtype}" config="${config}" type="checkbox" class="${BDFDB.disCNS.checkboxinputdefault + BDFDB.disCN.checkboxinput}"${words[word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				settingshtml += `</div><div word="${word}" rtype="${rtype}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
			}
			settingshtml += `</div>`
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added words.</h3><button rtype="${rtype}" action="removeall" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
			settingshtml += `<div class="${BDFDB.disCNS.modaldivider + BDFDB.disCNS.modaldividerdefault + BDFDB.disCN.marginbottom40}"></div>`;
		}
		var infoHidden = BDFDB.loadData("hideInfo", this, "hideInfo");
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.cursorpointer + (infoHidden ? BDFDB.disCN.categorywrappercollapsed : BDFDB.disCN.categorywrapperdefault)} toggle-info" style="flex: 1 1 auto;"><svg class="${BDFDB.disCNS.categoryicontransition + BDFDB.disCNS.directionright + (infoHidden ? BDFDB.disCN.categoryiconcollapsed : BDFDB.disCN.categoryicondefault)}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="${BDFDB.disCNS.categorycolortransition + BDFDB.disCNS.overflowellipsis + BDFDB.disCN.categorynamecollapsed}" style="flex: 1 1 auto;">Information</div></div>`;
		settingshtml += `<div class="DevilBro-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Case: Will block/censor words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Case: Will block/censor words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Exact: Will block/censor words that are exactly the selected word. apple => apple, not applepie or pineapple</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Exact: Will block/censor all words containing the selected word. apple => apple, applepie and pineapple</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Empty: Ignores the default and set replace word and removes the word/message instead.</div></div>`;
		settingshtml += `</div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
			.on("keypress", ".wordInputs", (e) => {if (e.which == 13) this.updateContainer(settingspanel, e.currentTarget);})
			.on("keyup", ".defaultInputs", (e) => {this.saveReplace(e.currentTarget);})
			.on("click", ".btn-addword, .remove-word, .remove-all", (e) => {this.updateContainer(settingspanel, e.currentTarget);})
			.on("click", BDFDB.dotCN.checkboxinput, (e) => {this.updateConfig(e.currentTarget);})
			.on("click", ".toggle-info", (e) => {this.toggleInfo(settingspanel, e.currentTarget);});
			
		for (let key in settings) {
			for (let rtype in this.defaults.settings[key].enabled) {
				if (!this.defaults.settings[key].enabled[rtype]) $(settingspanel).find(`${BDFDB.dotCN.flex}[value='${key}'][rtype='${rtype}']`).hide();
			}
		}
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "characterData") {
							this.hideMessage(change.target.parentElement);
						}
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.classList.contains(BDFDB.disCN.message)) this.hideMessage(node.querySelector(BDFDB.dotCN.messagemarkup));
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, null, {name:"messageChangeObserver",instance:observer,multi:true}, {childList:true, characterData:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(BDFDB.dotCN.message)) {
									BDFDB.addObserver(this, node, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
									node.querySelectorAll(BDFDB.dotCNC.messagemarkup + BDFDB.dotCN.messageaccessory).forEach(message => {
										this.hideMessage(message);
									});
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver",instance:observer}, {childList:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && $(node).attr("layer-id") == "user-settings") this.hideAllMessages();
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			this.hideAllMessages();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll(`${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.blocked, ${BDFDB.dotCN.messagemarkup}.censored, ${BDFDB.dotCN.messageaccessory}.censored`).forEach(message => {
				this.resetMessage(message);
			});
						
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDFDB === "object") {
			this.hideAllMessages();
			BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver"}, {childList:true, subtree:true});
		}
	}
	
	
	// begin of own functions
	
	updateContainer (settingspanel, ele) {
		var update = false, wordvalue = null, replacevalue = null;
		var action = ele.getAttribute("action"), rtype = ele.getAttribute("rtype");
		var words = BDFDB.loadData(rtype, this, "words") || {};
		
		if (action == "add") {
			var wordinput = settingspanel.querySelector("#input-" + rtype + "-wordvalue");
			var replaceinput = settingspanel.querySelector("#input-" + rtype + "-replacevalue");
			wordvalue = wordinput.value;
			replacevalue = replaceinput.value;
			if (wordvalue && wordvalue.trim().length > 0) {
				wordvalue = wordvalue.trim();
				replacevalue = replacevalue.trim();
				words[wordvalue] = {
					replace: replacevalue,
					empty: false,
					case: false,
					exact: true,
					regex: false
				};
				wordinput.value = null;
				replaceinput.value = null;
				update = true;
			}
		}
		else if (action == "remove") {
			wordvalue = ele.getAttribute("word");
			if (wordvalue) {
				delete words[wordvalue];
				update = true;
			}
		}
		else if (action == "removeall") {
			if (confirm("Are you sure you want to remove all added Words from your list?")) {
				words = {};
				update = true;
			}
		}
		if (update) {
			BDFDB.saveData(rtype, words, this, "words");
			words = BDFDB.loadData(rtype, this, "words");
			
			var containerhtml = ``;
			for (let word in words) {
				containerhtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis}" style="flex: 1 1 auto;">${BDFDB.encodeToHTML(word)} (${BDFDB.encodeToHTML(words[word].replace)})</div>`
				for (let config of this.configs) {
					containerhtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" rtype="${rtype}" config="${config}" type="checkbox" class="${BDFDB.disCNS.checkboxinputdefault + BDFDB.disCN.checkboxinput}"${words[word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				containerhtml += `</div><div word="${word}" rtype="${rtype}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
			}
			containerhtml += `</div>`;
			$(settingspanel).find("." + rtype + "-list").html(containerhtml);
			BDFDB.initElements(settingspanel);
		}
	}
	
	saveReplace (input) {
		var rtype = input.getAttribute("rtype");
		var wordvalue = input.value;
		if (rtype) {
			var replaces = BDFDB.getData(rtype, this, "replaces");
			BDFDB.saveData(rtype, wordvalue.trim(), this, "replaces");
		}
	}

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			let key = input.getAttribute("value");
			let rtype = input.getAttribute("rtype");
			if (!settings[key]) settings[key] = {};
			settings[key][rtype] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
	}
	
	updateConfig (ele) {
		var wordvalue = ele.getAttribute("word");
		var config = ele.getAttribute("config");
		var rtype = ele.getAttribute("rtype");
		var words = BDFDB.loadData(rtype, this, "words") || {};
		if (wordvalue && words[wordvalue] && config) {
			words[wordvalue][config] = ele.checked;
			BDFDB.saveData(rtype, words, this, "words");
		}
	}
	
	toggleInfo (settingspanel, ele) {
		ele.classList.toggle(BDFDB.disCN.categorywrappercollapsed);
		ele.classList.toggle(BDFDB.disCN.categorywrapperdefault);
		var svg = ele.querySelector(BDFDB.dotCN.categoryicontransition);
		svg.classList.toggle(BDFDB.disCN.directionright);
		svg.classList.toggle(BDFDB.disCN.categoryiconcollapsed);
		svg.classList.toggle(BDFDB.disCN.categoryicondefault);
		
		var visible = $(settingspanel).find(".info-container").is(":visible");
		$(settingspanel).find(".info-container").toggle(!visible);
		BDFDB.saveData("hideInfo", visible, this, "hideInfo");
	}
	
	hideAllMessages () {
		document.querySelectorAll(`${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored, ${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored`).forEach(message => {
			this.resetMessage(message);
		});
		document.querySelectorAll(BDFDB.dotCN.messagegroup).forEach(messageContainer => {
			BDFDB.addObserver(this, messageContainer, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
			messageContainer.querySelectorAll(BDFDB.dotCNC.messagemarkup + BDFDB.dotCN.messageaccessory).forEach(message => {
				this.hideMessage(message);
			});
		});
	}
	
	hideMessage (message) {
		if (message.tagName && !message.classList.contains("blocked") && !message.classList.contains("censored")) {
			var orightml = $(message).html();
			var newhtml = "";
			
			if (orightml) {
				var blocked = null;
				
				var strings = [];
				var count = 0;
				orightml.split("").forEach((chara) => { 
					if (chara == "<") {
						if (strings[count]) count++;
					}
					strings[count] = strings[count] ? strings[count] + chara : chara; 
					if (chara == ">") {
						count++;
					}
				});
			
				var settings = BDFDB.getAllData(this, "settings");
				var replaces = BDFDB.getAllData(this, "replaces");
				var blockedWords = BDFDB.loadData("blocked", this, "words");
				var blocked = false;
				for (let bWord in blockedWords) {
					var blockedReplace = blockedWords[bWord].empty ? "" : (blockedWords[bWord].replace || replaces.blocked);
					var reg = this.createReg(bWord, blockedWords[bWord]);
					strings.forEach(string => {
						if (this.testForEmoji(string, reg)) blocked = true;
						else if (string.indexOf('<img src="http') == 0) {
							var url = string.split('src="').length > 0 ? string.split('src="')[1] : null;
							url = url ? url.split('"')[0] : null;
							if (reg.test(url)) blocked = true;
						}
						else if (string.indexOf("<") != 0) {
							string.replace(/\n/g, " \n ").split(" ").forEach((word) => {
								let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"]/g, "");
								if (word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial)) blocked = true;
							});
						}
					});
					if (blocked) break;
				}
				if (blocked) {
					if (settings.hideMessage.blocked) $(message).hide();
					newhtml = BDFDB.encodeToHTML(blockedReplace);
					$(message)
						.html(newhtml)
						.addClass("blocked")
						.data("newhtmlChatFilter",newhtml)
						.data("orightmlChatFilter",orightml);
						
					this.addClickListener(message, settings.showMessageOnClick.blocked);
				}
				else {
					var censoredWords = BDFDB.loadData("censored", this, "words");
					var censored = false;
					for (let cWord in censoredWords) {
						var censoredReplace = censoredWords[cWord].empty ? "" : (censoredWords[cWord].replace || replaces.censored);
						var reg = this.createReg(cWord, censoredWords[cWord]);
						strings.forEach((string,i) => {
							if (this.testForEmoji(string, reg)) {
								censored = true;
								strings[i] = BDFDB.encodeToHTML(censoredReplace);
								if (strings[i+1] && strings[i+1].indexOf("<input") == 0) {
									strings[i+1] = "";
									if (strings[i-1] && strings[i-1].indexOf("<span") == 0) strings[i-1] = "";
									if (strings[i+2] && strings[i+2].indexOf("</span") == 0) strings[i+2] = "";
								}
							}
							else if (string.indexOf('<img src="http') == 0) {
								var url = string.split('src="').length > 0 ? string.split('src="')[1] : null;
								url = url ? url.split('"')[0] : null;
								if (reg.test(url)) {
									censored = true;
									strings = [BDFDB.encodeToHTML(censoredReplace)];
								}
							}
							else if (string.indexOf("<") != 0) {
								var newstring = [];
								string.replace(/\n/g, " \n ").split(" ").forEach((word) => {
									let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"]/g, "");
									if (word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial)) {
										censored = true;
										newstring.push(BDFDB.encodeToHTML(censoredReplace));
									}
									else {
										newstring.push(word);
									}
								});
								strings[i] = newstring.join(" ").replace(/ \n /g, "\n");
							}
						});
					}
					
					if (censored) {
						newhtml = strings.join("");
						$(message)
							.html(newhtml)
							.addClass("censored")
							.data("newhtmlChatFilter",newhtml)
							.data("orightmlChatFilter",orightml);
							
						this.addClickListener(message, settings.showMessageOnClick.censored);
					}
				}
			}
		}
	}
	
	createReg (word, config) {
		return new RegExp(BDFDB.encodeToHTML(config.exact ? "^" + BDFDB.regEscape(word) + "$" : BDFDB.regEscape(word)), config.case ? "" : "i");
	}
	
	testForEmoji (string, reg) {
		if (string.indexOf("<img ") == 0 && (string.indexOf('class="emote') > -1 || string.indexOf('class="emoji') > -1)) {
			var emojiname = string.split('alt="').length > 0 ? string.split('alt="')[1].split('"')[0] : null;
			return emojiname = !emojiname ? false : (reg.test(emojiname) || reg.test(emojiname.replace(/:/g, "")));
		}
		return false;
	}
	
	resetMessage (message) {
		$(message)
			.html($(message).data("orightmlChatFilter"))
			.off("click." + this.getName())
			.removeClass("blocked")
			.removeClass("censored")
			.removeClass("revealed");
	}
	
	addClickListener (message, add) {
		$(message)
			.off("click." + this.getName());
		if (add) {
			var orightml = $(message).data("orightmlChatFilter");
			var newhtml = $(message).data("newhtmlChatFilter");
			$(message)
				.on("click." + this.getName(), () => {	
					if ($(message).hasClass("revealed")) {
						$(message)
							.html(newhtml)
							.removeClass("revealed");
					}
					else {
						$(message)
							.html(orightml)
							.addClass("revealed");
					}
				});
				
		}
	}
}
