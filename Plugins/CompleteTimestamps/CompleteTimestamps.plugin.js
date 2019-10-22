//META{"name":"CompleteTimestamps","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CompleteTimestamps","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CompleteTimestamps/CompleteTimestamps.plugin.js"}*//

class CompleteTimestamps {
	getName () {return "CompleteTimestamps";}

	getVersion () {return "1.3.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Replace all timestamps with complete timestamps.";}

	constructor () {
		this.changelog = {
			"fixed":[["Milliseconds","Milliseconds are now properlly formatted when leading zeros is enabled (9 => 009, 12 => 012)"]]
		};

		this.patchModules = {
			"MessageGroup":["componentDidMount","componentDidUpdate"],
			"Embed":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.languages = {};
		
		this.defaults = {
			settings: {
				showInChat:		{value:true, 	description:"Replace Chat Timestamp with Complete Timestamp:"},
				showInEmbed:	{value:true, 	description:"Replace Embed Timestamp with Complete Timestamp:"},
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

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let choices = BDFDB.DataUtils.get(this, "choices");
		let formats = BDFDB.DataUtils.get(this, "formats");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${this.defaults.choices[key].description}</h3>${BDFDB.createSelectMenu(this.createSelectChoice(choices[key]), choices[key], key)}</div>`;
		}
		for (let key in formats) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${this.defaults.formats[key].description}</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${formats[key]}" placeholder="${this.defaults.formats[key].value}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16}"></div></div>`;
		}
		let infoHidden = BDFDB.DataUtils.load(this, "hideInfo", "hideInfo");
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.cursorpointer} toggle-info" style="flex: 1 1 auto;"><svg class="toggle-infoarrow${infoHidden ? (" " + BDFDB.disCN.directionright) : ""}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="toggle-infotext" style="flex: 1 1 auto;">Information</div></div>`;
		settingshtml += `<div class="BDFDB-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}>`;
		settingshtml += `<div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$hour will be replaced with the current hour</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$minute will be replaced with the current minutes</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$second will be replaced with the current seconds</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$msecond will be replaced with the current milliseconds</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$timemode will change $hour to a 12h format and will be replaced with AM/PM</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$year will be replaced with the current year</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$month will be replaced with the current month</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$day will be replaced with the current day</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameL will be replaced with the monthname in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameS will be replaced with the monthname in short format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayL will be replaced with the weekday in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayS will be replaced with the weekday in short format based on the Discord Language</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".settings-switch", () => {setImmediate(() => {this.updateSettingsPanel(settingspanel);})});
		BDFDB.ListenerUtils.add(this, settingspanel, "keyup", BDFDB.dotCN.input, () => {this.saveInputs(settingspanel);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".toggle-info", e => {this.toggleInfo(e.currentTarget);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {
			BDFDB.openDropdownMenu(e, this.saveSelectChoice.bind(this), this.createSelectChoice.bind(this), this.languages);
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
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			this.languages = Object.assign({"own":{name:"Own",id:"own",integrated:false,dic:false}}, BDFDB.LanguageUtils.languages);

			BDFDB.ListenerUtils.add(this, document, "mouseenter", BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messagecontent, e => {
				if (BDFDB.DataUtils.get(this, "settings", "showOnHover")) {
					let message = e.currentTarget;
					let messagegroup = BDFDB.getParentEle(BDFDB.dotCN.messagegroup, message);
					if (!messagegroup || !messagegroup.tagName) return;
					let info = this.getMessageData(message, messagegroup);
					if (!info || !info.timestamp || !info.timestamp._i) return;
					let choice = BDFDB.DataUtils.get(this, "choices", "creationDateLang");
					BDFDB.TooltipUtils.create(message, this.getTimestamp(this.languages[choice].id, info.timestamp._i), {type:"left", selector:"completetimestamp-tooltip"});
				}
			});
			BDFDB.ListenerUtils.add(this, document, "mouseenter", BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageedited, e => {
				if (BDFDB.DataUtils.get(this, "settings", "changeForEdit")) {
					let marker = e.currentTarget;
					let time = marker.getAttribute("datetime");
					if (!time) return;
					let choice = BDFDB.DataUtils.get(this, "choices", "creationDateLang");
					BDFDB.TooltipUtils.create(marker, this.getTimestamp(this.languages[choice].id, time), {type:"top", selector:"completetimestampedit-tooltip"});
				}
			});

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.removeEles(".complete-timestamp-divider");
			BDFDB.removeClasses("complete-timestamp");

			BDFDB.removeLocalStyle(this.name + "CompactCorrection");

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	saveInputs (settingspanel) {
		let formats = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
			formats[input.getAttribute("option")] = input.value;
		}
		BDFDB.DataUtils.save(formats, this, "formats");
		this.updateSettingsPanel(settingspanel);
	}

	updateSettingsPanel (settingspanel) {
		let choices = BDFDB.DataUtils.get(this, "choices");
		for (let key in choices) {
			settingspanel.querySelector(`${BDFDB.dotCN.select}[type='${key}'] .languageTimestamp`).innerText = this.getTimestamp(this.languages[choices[key]].id);
		}
		this.SettingsUpdated = true;
	}

	toggleInfo (ele) {
		BDFDB.toggleClass(ele.querySelector("svg"), BDFDB.disCN.directionright);
		BDFDB.toggleEles(ele.nextElementSibling);
		BDFDB.DataUtils.save(BDFDB.isEleHidden(ele.nextElementSibling), this, "hideInfo", "hideInfo");
	}

	saveSelectChoice (selectWrap, type, choice) {
		if (type && choice) {
			selectWrap.querySelector(".languageName").innerText = this.languages[choice].name;
			selectWrap.querySelector(".languageTimestamp").innerText = this.getTimestamp(this.languages[choice].id);
			BDFDB.DataUtils.save(choice, this, "choices", type);
		}
	}

	createSelectChoice (choice) {
		return `<div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.primary + BDFDB.disCNS.weightnormal + BDFDB.disCN.cursorpointer} languageName" style="flex: 1 1 42%; padding: 0;">${this.languages[choice].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.primary + BDFDB.disCNS.weightlight + BDFDB.disCN.cursorpointer} languageTimestamp" style="flex: 1 1 58%; padding: 0;">${this.getTimestamp(this.languages[choice].id)}</div>`;
	}

	processMessageGroup (instance, wrapper, returnvalue) {
		if (BDFDB.DataUtils.get(this, "settings")) for (let stamp of wrapper.querySelectorAll("time[datetime]")) this.changeTimestamp(stamp, "showInChat");
	}

	processEmbed (instance, wrapper, returnvalue) {
		let embed = BDFDB.ReactUtils.getValue(instance, "props.embed");
		let footer = wrapper.querySelector(BDFDB.dotCN.embedfootertext);
		if (footer && embed && embed.timestamp && BDFDB.DataUtils.get(this, "settings", "showInEmbed")) {
			footer.lastChild.textContent = this.getTimestamp(this.languages[BDFDB.DataUtils.get(this, "choices")].id, embed.timestamp._i, "creationDateLang");
		}
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}

	changeTimestamp (stamp) {
		if (!stamp.className || stamp.className.toLowerCase().indexOf("timestamp") == -1 || BDFDB.containsClass(stamp, "complete-timestamp")) return;
		let time = stamp.getAttribute("datetime");
		if (time) {
			this.setMaxWidth();
			BDFDB.addClass(stamp, "complete-timestamp");
			stamp.parentElement.insertBefore(BDFDB.htmlToElement(`<span class="complete-timestamp-divider arabic-fix" style="display: inline !important; height: 0 !important; width: 0 !important; font-size: 0 !important; user-select: none !important;">ARABIC FIX</span>`), stamp);
			BDFDB.setInnerText(stamp, this.getTimestamp(this.languages[BDFDB.DataUtils.get(this, "choices")].id, time), "creationDateLang");
		}
	}

	getMessageData (div, messagegroup) {
		let pos = Array.from(messagegroup.querySelectorAll("." + div.className.replace(/ /g, "."))).indexOf(div);
		let instance = BDFDB.ReactUtils.getInstance(messagegroup);
		if (!instance) return;
		let info = instance.return.stateNode.props.messages;
		return info && pos > -1 ? info[pos] : null;
	}

	getTimestamp (languageid, time) {
		let timeobj = time ? time : new Date();
		if (typeof time == "string") timeobj = new Date(time);
		if (timeobj.toString() == "Invalid Date") timeobj = new Date(parseInt(time));
		if (timeobj.toString() == "Invalid Date") return;
		let settings = BDFDB.DataUtils.get(this, "settings"), timestring = "";
		if (languageid != "own") {
			let timestamp = [];
			if (settings.displayDate) 	timestamp.push(timeobj.toLocaleDateString(languageid));
			if (settings.displayTime) 	timestamp.push(settings.cutSeconds ? this.cutOffSeconds(timeobj.toLocaleTimeString(languageid)) : timeobj.toLocaleTimeString(languageid));
			if (settings.otherOrder)	timestamp.reverse();
			timestring = timestamp.length > 1 ? timestamp.join(", ") : (timestamp.length > 0 ? timestamp[0] : "");
			if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		}
		else {
			let ownformat = BDFDB.DataUtils.get(this, "formats", "ownFormat");
			languageid = BDFDB.getDiscordLanguage().id;
			let hour = timeobj.getHours(), minute = timeobj.getMinutes(), second = timeobj.getSeconds(), msecond = timeobj.getMilliseconds(), day = timeobj.getDate(), month = timeobj.getMonth()+1, timemode = "";
			if (ownformat.indexOf("$timemode") > -1) {
				timemode = hour >= 12 ? "PM" : "AM";
				hour = hour % 12;
				hour = hour ? hour : 12;
			}
			timestring = ownformat
				.replace("$hour", settings.forceZeros && hour < 10 ? "0" + hour : hour)
				.replace("$minute", minute < 10 ? "0" + minute : minute)
				.replace("$second", second < 10 ? "0" + second : second)
				.replace("$msecond", settings.forceZeros ? (msecond < 10 ? "00" + msecond : (msecond < 100 ? "0" + msecond : msecond)) : msecond)
				.replace("$timemode", timemode)
				.replace("$weekdayL", timeobj.toLocaleDateString(languageid,{weekday: "long"}))
				.replace("$weekdayS", timeobj.toLocaleDateString(languageid,{weekday: "short"}))
				.replace("$monthnameL", timeobj.toLocaleDateString(languageid,{month: "long"}))
				.replace("$monthnameS", timeobj.toLocaleDateString(languageid,{month: "short"}))
				.replace("$day", settings.forceZeros && day < 10 ? "0" + day : day)
				.replace("$month", settings.forceZeros && month < 10 ? "0" + month : month)
				.replace("$year", timeobj.getFullYear());
		}
		return timestring;
	}

	cutOffSeconds (timestring) {
		return timestring.replace(/(.*):(.*):(.{2})(.*)/, "$1:$2$4");
	}

	addLeadingZeros (timestring) {
		let chararray = timestring.split("");
		let numreg = /[0-9]/;
		for (let i = 0; i < chararray.length; i++) {
			if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];
		}

		return chararray.join("");
	}

	setMaxWidth () {
		if (this.currentMode != BDFDB.DiscordUtils.getMode()) {
			this.currentMode = BDFDB.DiscordUtils.getMode();
			let timestamp = document.querySelector(BDFDB.dotCN.messagetimestampcompact);
			if (timestamp) {
				let choice = BDFDB.DataUtils.get(this, "choices", "creationDateLang");
				let testtimestamp = BDFDB.htmlToElement(`<time class="${timestamp.className}" style="width: auto !important;">${this.getTimestamp(this.languages[choice].id, new Date(253402124399995))}</time>`);
				document.body.appendChild(testtimestamp);
				let width = BDFDB.getRects(testtimestamp).width + 5;
				testtimestamp.remove();
				BDFDB.appendLocalStyle(this.name + "CompactCorrection", `
					${BDFDB.dotCN.messagetimestampcompact} {
						width: ${width}px !important;
					}
					${BDFDB.dotCN.messagetimestampcompactismentioned} {
						width: ${width + 2}px !important;
					}
					${BDFDB.dotCN.messagemarkupiscompact} {
						margin-left: ${width}px !important;
						text-indent: -${width}px !important;
					}
					${BDFDB.dotCN.messageaccessorycompact} {
						padding-left: ${width}px !important;
					}
				`);
			}
			else BDFDB.removeLocalStyle(this.name + "CompactCorrection");
		}
	}
}
