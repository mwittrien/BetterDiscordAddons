//META{"name":"CompleteTimestamps"}*//

class CompleteTimestamps {
	constructor () {
		this.languages;
		
		this.updateTimestamps = false;
		
		this.compactWidth = null;
		
		this.messageObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
			
		this.defaults = {
			settings: {
				showOnHover:	{value:false, 	description:"Also show Timestamp when you hover over a message:"},
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

	getVersion () {return "1.1.6";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var choices = BDfunctionsDevilBro.getAllData(this, "choices");
		var formats = BDfunctionsDevilBro.getAllData(this, "formats");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 30%; line-height: 38px;">${this.defaults.choices[key].description}</h3><div class="select-3JqNgs" style="flex: 1 1 70%;"><div class="Select Select--single has-value" option="${key}" value="${choices[key]}"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm languageName" style="flex: 1 1 42%; padding:0;">${this.languages[choices[key]].name}</div><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm languageTimestamp" style="flex: 1 1 58%; padding:0;">${this.getTimestamp(this.languages[choices[key]].id)}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div></div></div>`;
		}
		for (let key in formats) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 30%; line-height: 38px;">${this.defaults.formats[key].description}</h3><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${formats[key]}" placeholder="${this.defaults.formats[key].value}" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_"></div></div>`;
		}
		var infoHidden = BDfunctionsDevilBro.loadData("hideInfo", this, "hideInfo");
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO cursorPointer-3oKATS ${infoHidden ? "wrapperCollapsed-18mf-c" : "wrapperDefault-1Dl4SS"} toggle-info" style="flex: 1 1 auto;"><svg class="iconTransition-VhWJ85 ${infoHidden ? "closed-2Hef-I iconCollapsed-1INdMX" : "iconDefault-xzclSQ"}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="colorTransition-2iZaYd overflowEllipsis-2ynGQq nameCollapsed-3_ChMu" style="flex: 1 1 auto;">Information</div></div>`;
		settingshtml += `<div class="DevilBro-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}>`;
		settingshtml += `<div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$hour will be replaced with the current hour</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$minute will be replaced with the current minutes</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$second will be replaced with the current seconds</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$timemode will change $hour to a 12h format and will be replaced with AM/PM</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$year will be replaced with the current year</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$month will be replaced with the current month</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$day will be replaced with the current day</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$monthnameL will be replaced with the monthname in long format based on the Discord Language</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$monthnameS will be replaced with the monthname in short format based on the Discord Language</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$weekdayL will be replaced with the weekday in long format based on the Discord Language</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">$weekdayS will be replaced with the weekday in short format based on the Discord Language</div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
			.on("keyup", ".input-2YozMi", () => {this.saveInputs(settingspanel);})
			.on("click", ".Select-control", (e) => {this.openDropdownMenu(e);})
			.on("click", ".toggle-info", (e) => {this.toggleInfo(settingspanel, e.currentTarget);});
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
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(".message-text")) {
									node.querySelectorAll(".message-text").forEach(message => {this.changeTimestamp(message);});
								}
								else if (node.classList && node.classList.contains("message-text")) {
									this.changeTimestamp(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#app-mount", {name:"messageObserver",instance:observer}, {childList: true, subtree: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (this.updateTimestamps && node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									this.setMaxWidth();
									document.querySelectorAll(".complete-timestamp").forEach(timestamp => {timestamp.classList.remove("complete-timestamp");});
									document.querySelectorAll(".message-text").forEach(message => {this.changeTimestamp(message);});
									this.updateTimestamps = false;
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".layers-20RVFW", {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			this.languages = Object.assign({},
				{"own":	{name:"Own",		id:"own",		integrated:false,	dic:false}},
				BDfunctionsDevilBro.languages
			);
			
			this.setMaxWidth();
			
			$(document).on("mouseenter." + this.getName(), ".message .message-text, .message .accessory", (e) => {
				if (BDfunctionsDevilBro.getData("showOnHover", this, "settings")) {
					var message = e.currentTarget;
					var messagegroup = this.getMessageGroup(message);
					if (!messagegroup || !messagegroup.tagName) return;
					var info = this.getMessageData(message, messagegroup);
					if (!info || !info.timestamp || !info.timestamp._i) return
					var choice = BDfunctionsDevilBro.getData("creationDateLang", this, "choices");
					BDfunctionsDevilBro.createTooltip(this.getTimestamp(this.languages[choice].id, info.timestamp._i), message, {type:"left",selector:"completetimestamp-tooltip"});
				}
			});
			
			document.querySelectorAll(".message-text").forEach(message => {this.changeTimestamp(message);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(document).off("mouseenter." + this.getName());
				
			document.querySelectorAll(".complete-timestamp").forEach(timestamp => {timestamp.classList.remove("complete-timestamp");});
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
		this.updateSettingsPanel(settingspanel);
	}

	saveInputs (settingspanel) {
		var formats = {};
		for (var input of settingspanel.querySelectorAll(".input-2YozMi")) {
			formats[input.getAttribute("option")] = input.value;
		}
		BDfunctionsDevilBro.saveAllData(formats, this, "formats");
		this.updateSettingsPanel(settingspanel);
	}

	updateSettingsPanel (settingspanel) {
		var choices = BDfunctionsDevilBro.getAllData(this, "choices");
		for (let key in choices) {
			settingspanel.querySelector(".Select[option='" + key + "'] .languageTimestamp").innerText = this.getTimestamp(this.languages[choices[key]].id);
		}
		this.updateTimestamps = true;
	}
	
	toggleInfo (settingspanel, ele) {
		ele.classList.toggle("wrapperCollapsed-18mf-c");
		ele.classList.toggle("wrapperDefault-1Dl4SS");
		var svg = ele.querySelector(".iconTransition-VhWJ85");
		svg.classList.toggle("closed-2Hef-I");
		svg.classList.toggle("iconCollapsed-1INdMX");
		svg.classList.toggle("iconDefault-xzclSQ");
		
		var visible = $(settingspanel).find(".info-container").is(":visible");
		$(settingspanel).find(".info-container").toggle(!visible);
		BDfunctionsDevilBro.saveData("hideInfo", visible, this, "hideInfo");
	}
	
	openDropdownMenu (e) {
		var selectControl = e.currentTarget;
		var selectWrap = selectControl.parentElement;
		
		if (selectWrap.classList.contains("is-open")) return;
		
		selectWrap.classList.add("is-open");
		$("li").has(selectWrap).css("overflow", "visible");
		
		var selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"));
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), ".Select-option", (e2) => {
			var language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = this.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = this.getTimestamp(this.languages[language].id);
			BDfunctionsDevilBro.saveData(selectWrap.getAttribute("option"), language, this, "choices");
		});
		$(document).on("mousedown.select" + this.getName(), (e2) => {
			if (e2.target.parentElement == selectMenu) return;
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove();
			$("li").has(selectWrap).css("overflow", "auto");
			setTimeout(() => {selectWrap.classList.remove("is-open");},100);
		});
	}
	
	createDropdownMenu (choice) {
		var menuhtml = `<div class="Select-menu-outer"><div class="Select-menu">`;
		for (var key in this.languages) {
			var isSelected = key == choice ? " is-selected" : "";
			menuhtml += `<div value="${key}" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-option ${isSelected}" style="flex: 1 1 auto; display:flex;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 42%;">${this.languages[key].name}</div><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 58%;">${this.getTimestamp(this.languages[key].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	changeTimestamp (message) {
		if (!message || !message.tagName) return;
		var messagegroup = this.getMessageGroup(message);
		if (!messagegroup || !messagegroup.tagName) return;
		var compact = messagegroup.classList.contains("compact");
		var timestamp = compact ? message.querySelector(".timestamp") : messagegroup.querySelector(".timestamp");
		if (!timestamp || !timestamp.tagName || timestamp.classList.contains("complete-timestamp")) return;
		var info = this.getMessageData(message, messagegroup);
		if (!info || !info.timestamp || !info.timestamp._i) return;
		var choice = BDfunctionsDevilBro.getData("creationDateLang", this, "choices");
		timestamp.classList.add("complete-timestamp");
		BDfunctionsDevilBro.setInnerText(timestamp, this.getTimestamp(this.languages[choice].id, info.timestamp._i));
		if (compact && this.compactWidth) {
			var markup = message.querySelector(".markup");
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
			if (message.classList && message.classList.contains("message-group")) messagegroup = message;
		}
		return messagegroup;
	}
	
	getMessageData (message, messagegroup) {
		var pos = $(messagegroup).find(".message").index($(messagegroup).find(".message").has(message)[0]);
		var info = BDfunctionsDevilBro.getKeyInformation({"node":message,"key":"messages","up":true,"time":1000});
		if (info && pos > -1) info = info[pos];
		return info;
	}
	
	getTimestamp (languageid, time = new Date()) {
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"), timestring = "";
		if (languageid != "own") {
			var timestamp = [];
			if (settings.displayDate) 	timestamp.push(time.toLocaleDateString(languageid));
			if (settings.displayTime) 	timestamp.push(settings.cutSeconds ? this.cutOffSeconds(time.toLocaleTimeString(languageid)) : time.toLocaleTimeString(languageid));
			if (settings.otherOrder)	timestamp.reverse();
			timestring = timestamp.length > 1 ? timestamp.join(", ") : (timestamp.length > 0 ? timestamp[0] : "");
			if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		}
		else {
			var ownformat = BDfunctionsDevilBro.getData("ownFormat", this, "formats");
			languageid = BDfunctionsDevilBro.getDiscordLanguage().id;
			var hour = time.getHours(), minute = time.getMinutes(), second = time.getSeconds(), day = time.getDate(), month = time.getMonth()+1, timemode = "";
			if (ownformat.indexOf("$timemode") > -1) {
				timemode = hour > 12 ? "PM" : "AM";
				hour = hour > 12 ? hour - 12 : hour;
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
		var wrapper = $(`<div class="message-group compact"><div class="timestamp"></div></div>`);
		var timestamp = wrapper.find(".timestamp");
		var choice = BDfunctionsDevilBro.getData("creationDateLang", this, "choices");
		$(wrapper).appendTo(document.body);
		this.compactWidth = timestamp.css("width", "auto").text(this.getTimestamp(this.languages[choice].id, new Date(253402124399995))).outerWidth();
		wrapper.remove();
	}
}
