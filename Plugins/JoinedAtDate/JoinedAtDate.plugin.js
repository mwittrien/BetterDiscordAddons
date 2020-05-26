//META{"name":"JoinedAtDate","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/JoinedAtDate","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/JoinedAtDate/JoinedAtDate.plugin.js"}*//

var JoinedAtDate = (_ => {
	var loadedUsers, requestedUsers, languages;
	
	return class JoinedAtDate {
		getName () {return "JoinedAtDate";}

		getVersion () {return "1.1.9";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Displays the Joined At Date of the current Server for a Member in the UserPopout and UserModal.";}

		constructor () {
			this.changelog = {
				"fixed":[["Days Ago","Now properly shows the amount of days relative to the date instead of calculated from the amount of passed hours"]]
			};

			this.patchedModules = {
				after: {
					UserPopout: "render",
					AnalyticsContext: "render"
				}
			};
		}

		initConstructor () {
			loadedUsers = {};
			requestedUsers = {};

			this.css = `
				${BDFDB.dotCNS.userpopout + BDFDB.dotCN.userpopoutheadertext} {
					margin-bottom: 8px;
				}
				.joinedAtDate + ${BDFDB.dotCN.userpopoutcustomstatus} {
					margin-top: 4px;
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

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let choices = BDFDB.DataUtils.get(this, "choices");
			let formats = BDFDB.DataUtils.get(this, "formats");
			let settingsPanel, settingsItems = [], innerItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key],
				onChange: (e, instance) => {
					BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_SettingsPanel", up:true}), {name:"BDFDB_Select", all:true, noCopies:true}));
				}
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom8
			}));
			
			for (let key in choices) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Select",
				plugin: this,
				keys: ["choices", key],
				label: this.defaults.choices[key].description,
				basis: "70%",
				value: choices[key],
				options: BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(languages, (lang, id) => {return {value:id, label:lang.name}})),
				searchable: true,
				optionRenderer: lang => {
					return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						align: BDFDB.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								grow: 0,
								shrink: 0,
								basis: "40%",
								children: lang.label
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								grow: 0,
								shrink: 0,
								basis: "60%",
								children: this.getTimestamp(languages[lang.value].id)
							})
						]
					});
				},
				valueRenderer: lang => {
					return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						align: BDFDB.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								grow: 0,
								shrink: 0,
								children: lang.label
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								grow: 1,
								shrink: 0,
								basis: "70%",
								children: this.getTimestamp(languages[lang.value].id)
							})
						]
					});
				}
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom8
			}));
			
			for (let key in formats) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "TextInput",
				plugin: this,
				keys: ["formats", key],
				label: this.defaults.formats[key].description,
				basis: "70%",
				value: formats[key],
				onChange: (e, instance) => {
					BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_SettingsPanel", up:true}), {name:"BDFDB_Select", all:true, noCopies:true}));
				}
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Placeholder Guide",
				dividertop: true,
				collapseStates: collapseStates,
				children: [
					"$hour will be replaced with the current hour",
					"$minute will be replaced with the current minutes",
					"$second will be replaced with the current seconds",
					"$msecond will be replaced with the current milliseconds",
					"$timemode will change $hour to a 12h format and will be replaced with AM/PM",
					"$year will be replaced with the current year",
					"$month will be replaced with the current month",
					"$day will be replaced with the current day",
					"$monthnameL will be replaced with the monthname in long format based on the Discord Language",
					"$monthnameS will be replaced with the monthname in short format based on the Discord Language",
					"$weekdayL will be replaced with the weekday in long format based on the Discord Language",
					"$weekdayS will be replaced with the weekday in short format based on the Discord Language",
					"$daysago will be replaced with a string to tell you how many days ago the event occured. For Example: " + BDFDB.LanguageUtils.LanguageStringsFormat("ACTIVITY_FEED_USER_PLAYED_DAYS_AGO", 3)
				].map(string => {
					return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
						type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
						children: string
					});
				})
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
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

				languages = Object.assign({"own":{name:"Own",id:"own",integrated:false,dic:false}},BDFDB.LanguageUtils.languages);

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


		// Begin of own functions

		processUserPopout (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "addInUserPopout")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "CustomStatus"});
				if (index > -1) this.injectDate(e.instance, children, 2, e.instance.props.user);
			}
		}

		processAnalyticsContext (e) {
			if (typeof e.returnvalue.props.children == "function" && e.instance.props.section == "Profile Modal" && BDFDB.DataUtils.get(this, "settings", "addInUserProfil")) {
				let renderChildren = e.returnvalue.props.children;
				e.returnvalue.props.children = (...args) => {
					let renderedChildren = renderChildren(...args);
					let [children, index] = BDFDB.ReactUtils.findChildren(renderedChildren, {name: ["DiscordTag", "ColoredFluxTag"]});
					if (index > -1) this.injectDate(e.instance, children, 1, children[index].props.user);
					return renderedChildren;
				};
			}
		}

		injectDate (instance, children, index, user) {
			if (!BDFDB.ArrayUtils.is(children) || !user || user.discriminator == "0000") return;
			let guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
			if (!guildId) return;
			if (!loadedUsers[guildId]) loadedUsers[guildId] = {};
			if (!requestedUsers[guildId]) requestedUsers[guildId] = {};
			if (!BDFDB.ArrayUtils.is(requestedUsers[guildId][user.id])) {
				requestedUsers[guildId][user.id] = [instance];
				BDFDB.LibraryModules.APIUtils.get(BDFDB.DiscordConstants.Endpoints.GUILD_MEMBER(guildId, user.id)).then(result => {
					loadedUsers[guildId][user.id] = new Date(result.body.joined_at);
					for (let queredinstance of requestedUsers[guildId][user.id]) BDFDB.ReactUtils.forceUpdate(queredinstance);
				});
			}
			else if (!loadedUsers[guildId][user.id]) requestedUsers[guildId][user.id].push(instance);
			else children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
				className: "joinedAtDate " + BDFDB.disCN.textrow,
				children: this.labels.joinedat_text.replace("{{time}}", this.getTimestamp(languages[BDFDB.DataUtils.get(this, "choices", "joinedAtDateLang")].id, loadedUsers[guildId][user.id]))
			}));
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
				languageid = BDFDB.LanguageUtils.getLanguage().id;
				let now = new Date();
				let hour = timeobj.getHours(), minute = timeobj.getMinutes(), second = timeobj.getSeconds(), msecond = timeobj.getMilliseconds(), day = timeobj.getDate(), month = timeobj.getMonth()+1, timemode = "", daysago = Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(timeobj.getFullYear(), timeobj.getMonth(), timeobj.getDate()))/(1000*60*60*24));
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
					.replace("$daysago", daysago > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("ACTIVITY_FEED_USER_PLAYED_DAYS_AGO", daysago) : BDFDB.LanguageUtils.LanguageStrings.SEARCH_SHORTCUT_TODAY)
					.replace("$day", settings.forceZeros && day < 10 ? "0" + day : day)
					.replace("$month", settings.forceZeros && month < 10 ? "0" + month : month)
					.replace("$year", timeobj.getFullYear())
					.trim().split(" ").filter(n => n).join(" ");
			}
			return timestring;
		}

		cutOffSeconds (timestring) {
			return timestring.replace(/(.{1,2}:.{1,2}):.{1,2}(.*)/, "$1$2").replace(/(.{1,2}\..{1,2})\..{1,2}(.*)/, "$1$2").replace(/(.{1,2} h .{1,2} min) .{1,2} s(.*)/, "$1$2");
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
			switch (BDFDB.LanguageUtils.getLanguage().id) {
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
})();