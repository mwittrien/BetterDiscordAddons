//META{"name":"JoinedAtDate","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/JoinedAtDate","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/JoinedAtDate/JoinedAtDate.plugin.js"}*//

class JoinedAtDate {
	getName () {return "JoinedAtDate";}

	getVersion () {return "1.1.4";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Displays the Joined At Date of the current Server for a Member in the UserPopout and UserModal.";}

	constructor () {
		this.changelog = {
			"fixed":[["Milliseconds","Milliseconds are now properlly formatted when leading zeros is enabled (9 => 009, 12 => 012)"]]
		};

		this.labels = {};

		this.patchModules = {
			"UserPopout":"componentDidMount",
			"UserProfile":"componentDidMount"
		};
	}

	initConstructor () {
		this.loadedusers = {};

		this.css = `
			${BDFDB.dotCNS.userpopout + BDFDB.dotCN.nametag} {
				margin-bottom: 4px;
			}
			${BDFDB.dotCN.userprofile} .joinedAtDate {
				margin-right: 20px;
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheadernormal} .joinedAtDate {
				color: #b9bbbe;
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheader + BDFDB.notCN.userpopoutheadernormal} .joinedAtDate,
			${BDFDB.dotCNS.themedark + BDFDB.dotCN.userpopoutheader} .joinedAtDate {
				color: hsla(0,0%,100%,.6);
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userprofiletopsectionnormal} .joinedAtDate {
				color: hsla(216,4%,74%,.6);
			}
			${BDFDB.dotCN.themelight} [class*='topSection']${BDFDB.notCN.userprofiletopsectionnormal} .joinedAtDate,
			${BDFDB.dotCN.themedark} [class*='topSection'] .joinedAtDate {
				color: hsla(0,0%,100%,.6);
			}`;

		this.defaults = {
			settings: {
				addInUserPopout:		{value:true, 		description:"Add in User Popouts:"},
				addInUserProfil:		{value:true, 		description:"Add in User Profile Modal:"},
				displayTime:			{value:true, 		description:"Display the Time in the Timestamp:"},
				displayDate:			{value:true, 		description:"Display the Date in the Timestamp:"},
				cutSeconds:				{value:false, 		description:"Cut off Seconds of the Time:"},
				forceZeros:				{value:false, 		description:"Force leading Zeros:"},
				otherOrder:				{value:false, 		description:"Show the Time before the Date:"}
			},
			choices: {
				joinedAtDateLang:		{value:"$discord", 	description:"Joined At Date Format:"}
			},
			formats: {
				ownFormat:				{value:"$hour:$minute:$second, $day.$month.$year", 	description:"Own Format:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let choices = BDFDB.getAllData(this, "choices");
		let formats = BDFDB.getAllData(this, "formats");
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
		let infoHidden = BDFDB.loadData("hideInfo", this, "hideInfo");
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.cursorpointer} toggle-info" style="flex: 1 1 auto;"><svg class="toggle-infoarrow${infoHidden ? (" " + BDFDB.disCN.directionright) : ""}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="toggle-infotext" style="flex: 1 1 auto;">Information</div></div>`;
		settingshtml += `<div class="BDFDB-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}>`;
		settingshtml += `<div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$hour will be replaced with the current hour</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$minute will be replaced with the current minutes</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$second will be replaced with the current seconds</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$msecond will be replaced with the current milliseconds</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$timemode will change $hour to a 12h format and will be replaced with AM/PM</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$year will be replaced with the current year</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$month will be replaced with the current month</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$day will be replaced with the current day</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameL will be replaced with the monthname in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$monthnameS will be replaced with the monthname in short format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayL will be replaced with the weekday in long format based on the Discord Language</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">$weekdayS will be replaced with the weekday in short format based on the Discord Language</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".settings-switch", () => {setImmediate(() => {this.updateSettingsPanel(settingspanel);})});
		BDFDB.addEventListener(this, settingspanel, "keyup", BDFDB.dotCN.input, () => {this.saveInputs(settingspanel);});
		BDFDB.addEventListener(this, settingspanel, "click", ".toggle-info", e => {this.toggleInfo(e.currentTarget);});
		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {
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
			BDFDB.loadMessage(this);

			this.languages = Object.assign({"own":{name:"Own",id:"own",integrated:false,dic:false}},BDFDB.languages);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".joinedAtDate");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	saveInputs (settingspanel) {
		let formats = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
			formats[input.getAttribute("option")] = input.value;
		}
		BDFDB.saveAllData(formats, this, "formats");
		this.updateSettingsPanel(settingspanel);
	}

	updateSettingsPanel (settingspanel) {
		let choices = BDFDB.getAllData(this, "choices");
		for (let key in choices) {
			settingspanel.querySelector(`${BDFDB.dotCN.select}[type='${key}'] .languageTimestamp`).innerText = this.getTimestamp(this.languages[choices[key]].id);
		}
	}

	toggleInfo (ele) {
		BDFDB.toggleClass(ele.querySelector("svg"), BDFDB.disCN.directionright);
		BDFDB.toggleEles(ele.nextElementSibling);
		BDFDB.saveData("hideInfo", BDFDB.isEleHidden(ele.nextElementSibling), this, "hideInfo");
	}

	saveSelectChoice (selectWrap, type, choice) {
		if (type && choice) {
			selectWrap.querySelector(".languageName").innerText = this.languages[choice].name;
			selectWrap.querySelector(".languageTimestamp").innerText = this.getTimestamp(this.languages[choice].id);
			BDFDB.saveData(type, choice, this, "choices");
		}
	}

	createSelectChoice (choice) {
		return `<div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.primary + BDFDB.disCNS.weightnormal + BDFDB.disCN.cursorpointer} languageName" style="flex: 1 1 42%; padding: 0;">${this.languages[choice].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.primary + BDFDB.disCNS.weightlight + BDFDB.disCN.cursorpointer} languageTimestamp" style="flex: 1 1 58%; padding: 0;">${this.getTimestamp(this.languages[choice].id)}</div>`;
	}

	processUserPopout (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.user && BDFDB.getData("addInUserPopout", this, "settings")) {
			this.addJoinedAtDate(instance.props.user, wrapper.querySelector(BDFDB.dotCN.userpopoutheadertext), wrapper.parentElement);
		}
	}

	processUserProfile (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.user && BDFDB.getData("addInUserProfil", this, "settings")) {
			this.addJoinedAtDate(instance.props.user, wrapper.querySelector(BDFDB.dotCN.userprofileheaderinfo), null);
		}
	}

	addJoinedAtDate (info, container, popout) {
		if (!info || info.discriminator == "0000" || !container || container.querySelector(".joinedAtDate")) return;
		let guildid = BDFDB.LibraryModules.LastGuildStore.getGuildId();
		if (guildid) {
			if (!this.loadedusers[guildid]) this.loadedusers[guildid] = {};
			let addTimestamp = (timestamp) => {
				if (document.contains(container)) {
					BDFDB.removeEles(container.querySelectorAll(".joinedAtDate"));
					if (BDFDB.isObject(container.JoinedAtDateObserver)) container.JoinedAtDateObserver.disconnect();
					let choice = BDFDB.getData("joinedAtDateLang", this, "choices");
					let nametag = container.querySelector(BDFDB.dotCN.nametag);
					container.insertBefore(BDFDB.htmlToElement(`<div class="joinedAtDate BDFDB-textscrollwrapper ${BDFDB.disCN.textrow}" style="max-width: ${BDFDB.getRects(BDFDB.getParentEle(popout ? BDFDB.dotCN.userpopoutheader : BDFDB.dotCN.userprofileheaderinfo, container)).width - 20}px !important; order: 7 !important;"><div class="BDFDB-textscroll">${this.labels.joinedat_text.replace("{{time}}", this.getTimestamp(this.languages[choice].id, timestamp))}</div></div>`), nametag ? nametag.nextSibling : null);
					BDFDB.initElements(container, this);
					if (popout && popout.style.transform.indexOf("translateY(-1") == -1) {
						let arect = BDFDB.getRects(document.querySelector(BDFDB.dotCN.appmount)), prect = BDFDB.getRects(popout);
						popout.style.setProperty("top", (prect.y + prect.height > arect.height ? (arect.height - prect.height) : prect.y) + "px");
					}
					container.JoinedAtDateObserver = new MutationObserver((changes, _) => {changes.forEach((change, i) => {change.addedNodes.forEach((node) => {
						if (node && BDFDB.containsClass(node, BDFDB.disCN.nametag)) addTimestamp(timestamp);
					});});});
					container.JoinedAtDateObserver.observe(container, {childList: true, subtree:true});
				}
			};
			if (this.loadedusers[guildid][info.id]) addTimestamp(this.loadedusers[guildid][info.id]);
			else BDFDB.LibraryModules.APIUtils.get(BDFDB.DiscordConstants.Endpoints.GUILD_MEMBER(guildid,info.id)).then(result => {
				if (result && result.body) {
					let joineddate = new Date(result.body.joined_at);
					this.loadedusers[guildid][info.id] = joineddate;
					addTimestamp(joineddate);
				}
			});
		}
	}

	getTimestamp (languageid, time) {
		let timeobj = time ? time : new Date();
		if (typeof time == "string") timeobj = new Date(time);
		if (timeobj.toString() == "Invalid Date") timeobj = new Date(parseInt(time));
		if (timeobj.toString() == "Invalid Date") return;
		let settings = BDFDB.getAllData(this, "settings"), timestring = "";
		if (languageid != "own") {
			let timestamp = [];
			if (settings.displayDate) 	timestamp.push(timeobj.toLocaleDateString(languageid));
			if (settings.displayTime) 	timestamp.push(settings.cutSeconds ? this.cutOffSeconds(timeobj.toLocaleTimeString(languageid)) : timeobj.toLocaleTimeString(languageid));
			if (settings.otherOrder)	timestamp.reverse();
			timestring = timestamp.length > 1 ? timestamp.join(", ") : (timestamp.length > 0 ? timestamp[0] : "");
			if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		}
		else {
			let ownformat = BDFDB.getData("ownFormat", this, "formats");
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

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					joinedat_text:				"Pridružio {{time}}"
				};
			case "da":		//danish
				return {
					joinedat_text:				"Tilmeldt den {{time}}"
				};
			case "de":		//german
				return {
					joinedat_text:				"Beigetreten am {{time}}"
				};
			case "es":		//spanish
				return {
					joinedat_text:				"Unido el {{time}}"
				};
			case "fr":		//french
				return {
					joinedat_text:				"Rejoint le {{time}}"
				};
			case "it":		//italian
				return {
					joinedat_text:				"Iscritto il {{time}}"
				};
			case "nl":		//dutch
				return {
					joinedat_text:				"Aangesloten op {{time}}"
				};
			case "no":		//norwegian
				return {
					joinedat_text:				"Ble med på {{time}}"
				};
			case "pl":		//polish
				return {
					joinedat_text:				"Dołączył {{time}}"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					joinedat_text:				"Inscreveu-se em {{time}}"
				};
			case "fi":		//finnish
				return {
					joinedat_text:				"Liittynyt {{time}}"
				};
			case "sv":		//swedish
				return {
					joinedat_text:				"Anlände den {{time}}"
				};
			case "tr":		//turkish
				return {
					joinedat_text:				"Katıldı {{time}}"
				};
			case "cs":		//czech
				return {
					joinedat_text:				"Přihlásil dne {{time}}"
				};
			case "bg":		//bulgarian
				return {
					joinedat_text:				"Се присъедини на {{time}}"
				};
			case "ru":		//russian
				return {
					joinedat_text:				"Присоединился {{time}}"
				};
			case "uk":		//ukrainian
				return {
					joinedat_text:				"Приєднався {{time}}"
				};
			case "ja":		//japanese
				return {
					joinedat_text:				"{{time}} に参加しました"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					joinedat_text:				"加入於 {{time}}"
				};
			case "ko":		//korean
				return {
					joinedat_text:				"{{time}} 에 가입"
				};
			default:		//default: english
				return {
					joinedat_text:				"Joined on {{time}}"
				};
		}
	}
}
