//META{"name":"CompleteTimestamps"}*//

class CompleteTimestamps {
	initConstructor () {
		this.languages;
		
		this.updateTimestamps = false;
		
		this.compactWidth = null;
			
		this.defaults = {
			settings: {
				showInChat:		{value:true, 	description:"Replace Chat Timestamp with Complete Timestamp:"},
				showOnHover:	{value:false, 	description:"Also show Timestamp when you hover over a message:"},
				changeForEdit:	{value:false, 	description:"Change the Time for the Edited Time Tooltips:"},
				displayTime:	{value:true, 	description:"Display the Time in the Timestamp:"},
				displayDate:	{value:true, 	description:"Display the Date in the Timestamp:"},
				cutSeconds:		{value:false, 	description:"Cut off Seconds of the Time:"},
				forceZeros:		{value:false, 	description:"Force leading Zeros:"},
				otherOrder:		{value:false, 	description:"Show the Time before the Date:"}
			},
			choices: {
				creationDateLang:		{value:"$discord", 	description:"Timestamp Format:"}
			},
			formats: {
				ownFormat:				{value:"$hour:$minute:$second, $day.$month.$year", 	description:"Own Format:"}
			}
		};
	}

	getName () {return "CompleteTimestamps";}

	getDescription () {return "Replace all timestamps with complete timestamps.";}

	getVersion () {return "1.2.1";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings");
		var choices = BDFDB.getAllData(this, "choices");
		var formats = BDFDB.getAllData(this, "formats");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%; line-height: 38px;">${this.defaults.choices[key].description}</h3><div class="${BDFDB.disCN.selectwrap}" style="flex: 1 1 70%;"><div class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}" option="${key}" value="${choices[key]}"><div class="${BDFDB.disCN.selectcontrol}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageName" style="flex: 1 1 42%; padding:0;">${this.languages[choices[key]].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageTimestamp" style="flex: 1 1 58%; padding:0;">${this.getTimestamp(this.languages[choices[key]].id)}</div></div><span class="${BDFDB.disCN.selectarrowzone}"><span class="${BDFDB.disCN.selectarrow}"></span></span></div></div></div></div>`;
		}
		for (let key in formats) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%; line-height: 38px;">${this.defaults.formats[key].description}</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${formats[key]}" placeholder="${this.defaults.formats[key].value}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}"></div></div>`;
		}
		var infoHidden = BDFDB.loadData("hideInfo", this, "hideInfo");
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.cursorpointer} ${infoHidden ? BDFDB.disCN.categorywrappercollapsed : BDFDB.disCN.categorywrapperdefault} toggle-info" style="flex: 1 1 auto;"><svg class="${BDFDB.disCNS.categoryicontransition + (infoHidden ? BDFDB.disCNS.closed + BDFDB.disCN.categoryiconcollapsed : BDFDB.disCN.categoryicondefault)}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="${BDFDB.disCNS.categorycolortransition + BDFDB.disCNS.overflowellipsis + BDFDB.disCN.categorynamecollapsed}" style="flex: 1 1 auto;">Information</div></div>`;
		settingshtml += `<div class="DevilBro-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}>`;
		settingshtml += `<div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$hour will be replaced with the current hour</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$minute will be replaced with the current minutes</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$second will be replaced with the current seconds</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$timemode will change $hour to a 12h format and will be replaced with AM/PM</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$year will be replaced with the current year</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$month will be replaced with the current month</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$day will be replaced with the current day</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameL will be replaced with the monthname in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameS will be replaced with the monthname in short format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayL will be replaced with the weekday in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayS will be replaced with the weekday in short format based on the Discord Language</div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
			.on("keyup", BDFDB.dotCN.input, () => {this.saveInputs(settingspanel);})
			.on("click", BDFDB.dotCN.selectcontrol, (e) => {this.openDropdownMenu(e);})
			.on("click", ".toggle-info", (e) => {this.toggleInfo(settingspanel, e.currentTarget);});
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
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(BDFDB.dotCN.messagetext)) {
									node.querySelectorAll(BDFDB.dotCN.messagetext).forEach(message => {this.changeTimestamp(message);});
								}
								else if (node.classList && node.classList.contains(BDFDB.disCN.messagetext)) {
									this.changeTimestamp(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"messageObserver",instance:observer}, {childList: true, subtree: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (this.updateTimestamps && node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									this.setMaxWidth();
									document.querySelectorAll(".complete-timestamp").forEach(timestamp => {timestamp.classList.remove("complete-timestamp");});
									document.querySelectorAll(BDFDB.dotCN.messagetext).forEach(message => {this.changeTimestamp(message);});
									this.updateTimestamps = false;
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			this.languages = Object.assign({},
				{"own":	{name:"Own",		id:"own",		integrated:false,	dic:false}},
				BDFDB.languages
			);
			
			this.setMaxWidth();
			
			$(document)
				.on("mouseenter." + this.getName(), BDFDB.dotCNS.message + BDFDB.dotCNC.messagetext + BDFDB.dotCNS.message + BDFDB.dotCN.messageaccessory, (e) => {
					if (BDFDB.getData("showOnHover", this, "settings")) {
						var message = e.currentTarget;
						var messagegroup = this.getMessageGroup(message);
						if (!messagegroup || !messagegroup.tagName) return;
						var info = this.getMessageData(message, messagegroup);
						if (!info || !info.timestamp || !info.timestamp._i) return;
						var choice = BDFDB.getData("creationDateLang", this, "choices");
						BDFDB.createTooltip(this.getTimestamp(this.languages[choice].id, info.timestamp._i), message, {type:"left",selector:"completetimestamp-tooltip"});
					}
				})
				.on("mouseenter." + this.getName(), BDFDB.dotCNS.message + BDFDB.dotCN.messageedited, (e) => {
					if (BDFDB.getData("changeForEdit", this, "settings")) {
						var marker = e.currentTarget;
						var messagegroup = this.getMessageGroup(marker);
						if (!messagegroup || !messagegroup.tagName) return;
						var info = this.getMessageData(marker, messagegroup);
						if (!info || !info.editedTimestamp || !info.editedTimestamp._i) return;
						var choice = BDFDB.getData("creationDateLang", this, "choices");
						var customTooltipCSS = `
							body ${BDFDB.dotCN.tooltip}:not(.completetimestampedit-tooltip) {
								display: none !important;
							}`;
						BDFDB.createTooltip(this.getTimestamp(this.languages[choice].id, info.editedTimestamp._i), marker, {type:"top",selector:"completetimestampedit-tooltip",css:customTooltipCSS});
					}
				});
			
			document.querySelectorAll(BDFDB.dotCN.messagetext).forEach(message => {this.changeTimestamp(message);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll(".complete-timestamp").forEach(timestamp => {timestamp.classList.remove("complete-timestamp");});
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
		this.updateSettingsPanel(settingspanel);
	}

	saveInputs (settingspanel) {
		var formats = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
			formats[input.getAttribute("option")] = input.value;
		}
		BDFDB.saveAllData(formats, this, "formats");
		this.updateSettingsPanel(settingspanel);
	}

	updateSettingsPanel (settingspanel) {
		var choices = BDFDB.getAllData(this, "choices");
		for (let key in choices) {
			settingspanel.querySelector(`${BDFDB.dotCN.select}[option='${key}'] .languageTimestamp`).innerText = this.getTimestamp(this.languages[choices[key]].id);
		}
		this.updateTimestamps = true;
	}
	
	toggleInfo (settingspanel, ele) {
		ele.classList.toggle(BDFDB.disCN.categorywrappercollapsed);
		ele.classList.toggle(BDFDB.disCN.categorywrapperdefault);
		var svg = ele.querySelector(BDFDB.dotCN.categoryicontransition);
		svg.classList.toggle(BDFDB.disCN.closed);
		svg.classList.toggle(BDFDB.disCN.categoryiconcollapsed);
		svg.classList.toggle(BDFDB.disCN.categoryicondefault);
		
		var visible = $(settingspanel).find(".info-container").is(":visible");
		$(settingspanel).find(".info-container").toggle(!visible);
		BDFDB.saveData("hideInfo", visible, this, "hideInfo");
	}
	
	openDropdownMenu (e) {
		var selectControl = e.currentTarget;
		var selectWrap = selectControl.parentElement;
		
		if (selectWrap.classList.contains(BDFDB.disCN.selectisopen)) return;
		
		selectWrap.classList.add(BDFDB.disCN.selectisopen);
		$("li").has(selectWrap).css("overflow", "visible");
		
		var selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"));
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), BDFDB.dotCN.selectoption, (e2) => {
			var language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = this.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = this.getTimestamp(this.languages[language].id);
			BDFDB.saveData(selectWrap.getAttribute("option"), language, this, "choices");
		});
		$(document).on("mousedown.select" + this.getName(), (e2) => {
			if (e2.target.parentElement == selectMenu) return;
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove();
			$("li").has(selectWrap).css("overflow", "auto");
			setTimeout(() => {selectWrap.classList.remove(BDFDB.disCN.selectisopen);},100);
		});
	}
	
	createDropdownMenu (choice) {
		var menuhtml = `<div class="${BDFDB.disCN.selectmenuouter}"><div class="${BDFDB.disCN.selectmenu}">`;
		for (var key in this.languages) {
			var isSelected = key == choice ? ` ${BDFDB.disCN.selectselected}` : ``;
			menuhtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectoption + isSelected}" style="flex: 1 1 auto; display:flex;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 42%;">${this.languages[key].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 58%;">${this.getTimestamp(this.languages[key].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	changeTimestamp (message) {
		if (!message || !message.tagName || !BDFDB.getData("showInChat", this, "settings")) return;
		var messagegroup = this.getMessageGroup(message);
		if (!messagegroup || !messagegroup.tagName) return;
		var compact = messagegroup.classList.contains(BDFDB.disCN.messagecompact);
		var timestamp = compact ? message.querySelector(BDFDB.dotCN.messagetimestamp) : messagegroup.querySelector(BDFDB.dotCN.messagetimestamp);
		if (!timestamp || !timestamp.tagName || timestamp.classList.contains("complete-timestamp")) return;
		var info = this.getMessageData(message, messagegroup);
		if (!info || !info.timestamp || !info.timestamp._i) return;
		var choice = BDFDB.getData("creationDateLang", this, "choices");
		timestamp.classList.add("complete-timestamp");
		BDFDB.setInnerText(timestamp, this.getTimestamp(this.languages[choice].id, info.timestamp._i));
		if (compact && this.compactWidth) {
			var markup = message.querySelector(BDFDB.dotCN.messagemarkup);
			if (markup) {
				var newpadding = 100 + (this.compactWidth - 65);
				markup.style.paddingLeft =	newpadding + "px"; 
				markup.style.textIndent =	"-" + newpadding + "px"; 
				timestamp.style.width = 	this.compactWidth + "px";
			}
		}
	}
	
	getMessageGroup (message) {
		var messagegroup = null;
		while (messagegroup == null || message.parentElement) {
			message = message.parentElement;
			if (message.classList && message.classList.contains(BDFDB.disCN.messagegroup)) messagegroup = message;
		}
		return messagegroup;
	}
	
	getMessageData (message, messagegroup) {
		var pos = $(messagegroup).find(BDFDB.dotCN.message).index($(messagegroup).find(BDFDB.dotCN.message).has(message)[0]);
		var info = BDFDB.getKeyInformation({"node":message,"key":"messages","up":true,"time":1000});
		if (info && pos > -1) info = info[pos];
		return info;
	}
	
	getTimestamp (languageid, time = new Date()) {
		var settings = BDFDB.getAllData(this, "settings"), timestring = "";
		if (languageid != "own") {
			var timestamp = [];
			if (settings.displayDate) 	timestamp.push(time.toLocaleDateString(languageid));
			if (settings.displayTime) 	timestamp.push(settings.cutSeconds ? this.cutOffSeconds(time.toLocaleTimeString(languageid)) : time.toLocaleTimeString(languageid));
			if (settings.otherOrder)	timestamp.reverse();
			timestring = timestamp.length > 1 ? timestamp.join(", ") : (timestamp.length > 0 ? timestamp[0] : "");
			if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		}
		else {
			var ownformat = BDFDB.getData("ownFormat", this, "formats");
			languageid = BDFDB.getDiscordLanguage().id;
			var hour = time.getHours(), minute = time.getMinutes(), second = time.getSeconds(), day = time.getDate(), month = time.getMonth()+1, timemode = "";
			if (ownformat.indexOf("$timemode") > -1) {
				timemode = hour >= 12 ? "PM" : "AM";
				hour = hour % 12;
				hour = hour ? hour : 12;
			}
			timestring = ownformat
				.replace("$hour", settings.forceZeros && hour < 10 ? "0" + hour : hour)
				.replace("$minute", minute < 10 ? "0" + minute : minute)
				.replace("$second", second < 10 ? "0" + second : second)
				.replace("$timemode", timemode)
				.replace("$weekdayL", time.toLocaleDateString(languageid,{weekday: "long"}))
				.replace("$weekdayS", time.toLocaleDateString(languageid,{weekday: "short"}))
				.replace("$monthnameL", time.toLocaleDateString(languageid,{month: "long"}))
				.replace("$monthnameS", time.toLocaleDateString(languageid,{month: "short"}))
				.replace("$day", settings.forceZeros && day < 10 ? "0" + day : day)
				.replace("$month", settings.forceZeros && month < 10 ? "0" + month : month)
				.replace("$year", time.getFullYear());
		}
		return timestring;
	}
	
	cutOffSeconds (timestring) {
		return timestring.replace(/(.*):(.*):(.{2})(.*)/, "$1:$2$4");
	}
	
	addLeadingZeros (timestring) {
		var chararray = timestring.split("");
		var numreg = /[0-9]/;
		for (var i = 0; i < chararray.length; i++) {
			if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];
		}
		
		return chararray.join("");
	}
	
	setMaxWidth () {
		var wrapper = $(`<div class="${BDFDB.disCNS.messagegroup + BDFDB.disCN.messagecompact}"><div class="${BDFDB.disCN.messagetimestamp}"></div></div>`);
		var timestamp = wrapper.find(BDFDB.dotCN.messagetimestamp);
		var choice = BDFDB.getData("creationDateLang", this, "choices");
		$(wrapper).appendTo(document.body);
		this.compactWidth = timestamp.css("width", "auto").text(this.getTimestamp(this.languages[choice].id, new Date(253402124399995))).outerWidth();
		wrapper.remove();
	}
}
