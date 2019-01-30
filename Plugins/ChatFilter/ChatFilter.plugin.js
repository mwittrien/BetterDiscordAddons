//META{"name":"ChatFilter"}*//

class ChatFilter {
	getName () {return "ChatFilter";}

	getVersion () {return "3.3.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

	initConstructor () {
		this.patchModules = {
			"Message":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};

		this.configs = ["empty","case","exact"];

		this.css = ` 
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageaccessory}.blocked:not(.revealed),
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messagemarkup}.blocked:not(.revealed) {
				font-weight: bold;
				font-style: italic;
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

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var replaces = BDFDB.getAllData(this, "replaces");
		var settings = BDFDB.getAllData(this, "settings");
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let rtype in replaces) {
			var words = BDFDB.loadData(rtype, this, "words");
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto; min-width:55px;">${this.defaults.replaces[rtype].title}</h3><input rtype="${rtype}" action="add" type="text" placeholder="Wordvalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-${rtype}-wordvalue" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">With:</h3><input rtype="${rtype}" action="add" type="text" placeholder="Replacevalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-${rtype}-replacevalue" style="flex: 1 1 auto;"><button rtype="${rtype}" action="add" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addword" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
			for (let key in settings) {
				if (this.defaults.settings[key].enabled[rtype]) settingshtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key} ${rtype}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key][rtype] ? " checked" : ""}></div></div>`;
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

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "keypress", ".wordInputs", e => {if (e.which == 13) this.updateContainer(settingspanel, e.currentTarget);});
		BDFDB.addEventListener(this, settingspanel, "keyup", ".defaultInputs", e => {this.saveReplace(e.currentTarget);});
		BDFDB.addEventListener(this, settingspanel, "click", ".btn-addword, .remove-word, .remove-all", e => {this.updateContainer(settingspanel, e.currentTarget);});
		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.checkboxinput, e => {this.updateConfig(e.currentTarget);});
		BDFDB.addEventListener(this, settingspanel, "click", ".toggle-info", e => {this.toggleInfo(e.currentTarget);});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
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

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			document.querySelectorAll(`${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored, ${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored`).forEach(message => {this.resetMessage(message);});

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	updateContainer (settingspanel, ele) {
		var wordvalue = null, replacevalue = null, action = ele.getAttribute("action"), rtype = ele.getAttribute("rtype"), words = BDFDB.loadData(rtype, this, "words") || {};

		var update = () => {
			BDFDB.saveData(rtype, words, this, "words");

			var containerhtml = ``;
			for (let word in words) {
				containerhtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis}" style="flex: 1 1 auto;">${BDFDB.encodeToHTML(word)} (${BDFDB.encodeToHTML(words[word].replace)})</div>`
				for (let config of this.configs) {
					containerhtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" rtype="${rtype}" config="${config}" type="checkbox" class="${BDFDB.disCNS.checkboxinputdefault + BDFDB.disCN.checkboxinput}"${words[word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				containerhtml += `</div><div word="${word}" rtype="${rtype}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
			}
			containerhtml += `</div>`;
			settingspanel.querySelector("." + rtype + "-list").innerHTML = containerhtml;
			BDFDB.initElements(settingspanel, this);
			this.SettingsUpdated = true;
		};

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
				update();
			}
		}
		else if (action == "remove") {
			wordvalue = ele.getAttribute("word");
			if (wordvalue) {
				delete words[wordvalue];
				update();
			}
		}
		else if (action == "removeall") {
			BDFDB.openConfirmModal(this, "Are you sure you want to remove all added Words from your list?", () => {
				words = {};
				update();
			});
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

	toggleInfo (ele) {
		BDFDB.toggleClass(ele, BDFDB.disCN.categorywrappercollapsed);
		BDFDB.toggleClass(ele, BDFDB.disCN.categorywrapperdefault);
		var svg = ele.querySelector(BDFDB.dotCN.categoryicontransition);
		BDFDB.toggleClass(svg, BDFDB.disCN.directionright);
		BDFDB.toggleClass(svg, BDFDB.disCN.categoryiconcollapsed);
		BDFDB.toggleClass(svg, BDFDB.disCN.categoryicondefault);

		BDFDB.toggleEles(ele.nextElementSibling);
		BDFDB.saveData("hideInfo", BDFDB.isEleHidden(ele.nextElementSibling), this, "hideInfo");
	}

	processMessage (instance, wrapper) {
		wrapper.querySelectorAll(`${BDFDB.dotCNC.messagemarkup + BDFDB.dotCN.messageaccessory}`).forEach(message => {this.hideMessage(message);});
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			document.querySelectorAll(`${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored, ${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored`).forEach(message => {this.resetMessage(message);});
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}

	hideMessage (message) {
		if (message.tagName && !BDFDB.containsClass(message, "blocked", "censored", false)) {
			var orightml = message.innerHTML;
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
					if (settings.hideMessage.blocked) BDFDB.toggleEles(message, false);
					newhtml = BDFDB.encodeToHTML(blockedReplace);
					message.innerHTML = newhtml;
					BDFDB.addClass(message, "blocked");
					message.ChatFilterOriginalHTML = orightml;
					message.ChatFilterNewHTML = newhtml;

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
						message.innerHTML = newhtml;
						BDFDB.addClass(message, "censored");
						message.ChatFilterOriginalHTML = orightml;
						message.ChatFilterNewHTML = newhtml;

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
		message.innerHTML = message.ChatFilterOriginalHTML;
		BDFDB.removeClass(message, "blocked", "censored", "revealed");
		BDFDB.toggleEles(message, true);
		delete message.ChatFilterOriginalHTML;
		delete message.ChatFilterNewHTML;
		message.removeEventListener("click", message.clickChatFilterListener);
	}

	addClickListener (message, addListener) {
		message.removeEventListener("click", message.clickChatFilterListener);
		if (addListener) {
			message.clickChatFilterListener = () => {
				if (BDFDB.containsClass(message, "revealed")) {
					BDFDB.removeClass(message, "revealed");
					message.innerHTML = message.ChatFilterNewHTML;
				}
				else {
					BDFDB.addClass(message, "revealed");
					message.innerHTML = message.ChatFilterOriginalHTML;
				}
			};
			message.addEventListener("click", message.clickChatFilterListener);
		}
	}
}
