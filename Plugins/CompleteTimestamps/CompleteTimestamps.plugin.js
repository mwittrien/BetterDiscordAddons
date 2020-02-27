//META{"name":"CompleteTimestamps","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CompleteTimestamps","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CompleteTimestamps/CompleteTimestamps.plugin.js"}*//

var CompleteTimestamps = (_ => {
	var languages;
	
	return class CompleteTimestamps {
		getName () {return "CompleteTimestamps";}

		getVersion () {return "1.4.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Replace all timestamps with complete timestamps.";}

		constructor () {
			this.changelog = {
				"fixed":[["Message Update","Fixed the plugin for the new Message Update"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				after: {
					Message: "default",
					MessageHeader: "default",
					MessageContent: "type",
					Embed: "render",
					SystemMessage: "default"
				}
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					showInChat:				{value:true, 	description:"Replace Chat Timestamp with Complete Timestamp:"},
					showInEmbed:			{value:true, 	description:"Replace Embed Timestamp with Complete Timestamp:"},
					changeForChat:			{value:true, 	description:"Change the Time for the Chat Time Tooltips:"},
					changeForEdit:			{value:true, 	description:"Change the Time for the Edited Time Tooltips:"},
					displayTime:			{value:true, 	description:"Display the Time in the Timestamp:"},
					displayDate:			{value:true, 	description:"Display the Date in the Timestamp:"},
					cutSeconds:				{value:false, 	description:"Cut off Seconds of the Time:"},
					forceZeros:				{value:false, 	description:"Force leading Zeros:"},
					otherOrder:				{value:false, 	description:"Show the Time before the Date:"}
				},
				choices: {
					creationDateLang:		{value:"$discord", 	description:"Timestamp Format:"}
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
			let settingspanel, settingsitems = [], inneritems = [];
			
			for (let key in settings) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: inneritems
			}));
			
			inneritems = [];
			
			for (let key in choices) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
			
			inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom8
			}));
			
			for (let key in formats) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Format",
				collapseStates: collapseStates,
				dividertop: true,
				children: inneritems
			}));
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Placeholder Guide",
				collapseStates: collapseStates,
				dividertop: true,
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
				].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
					type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
					children: string
				}))
			}));
			
			return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
		}


		//legacy
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

				languages = Object.assign({"own":{name:"Own",id:"own",integrated:false,dic:false}}, BDFDB.LanguageUtils.languages);
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				this.forceUpdateAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		processMessage (e) {
			if (BDFDB.ReactUtils.getValue(e, "instance.props.childrenHeader.type.type.displayName") == "MessageTimestamp" && BDFDB.DataUtils.get(this, "settings", "changeForChat")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: e.instance.props.childrenHeader.type});
				if (index > -1) this.changeTimestamp(children, index, {child:false, tooltip:true});
			}
		}
		
		processMessageHeader (e) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "MessageTimestamp"});
			if (index > -1) {
				let settings = BDFDB.DataUtils.get(this, "settings");
				this.changeTimestamp(children, index, {child:!e.instance.props.compact && settings.showInChat, tooltip:settings.changeForChat});
			}
		}
		
		processMessageContent (e) {
			if (e.instance.props.message.editedTimestamp && BDFDB.DataUtils.get(this, "settings", "changeForEdit")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "SuffixEdited"});
				if (index > -1) this.changeTimestamp(children, index, {child:false, tooltip:true});
			}
		}

		processEmbed (e) {
			if (e.instance.props.embed.timestamp && BDFDB.DataUtils.get(this, "settings", "showInEmbed")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["className", BDFDB.disCN.embedfootertext]]});
				if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children.splice(children[index].props.children.length-1, 1, this.getTimestamp(languages[BDFDB.DataUtils.get(this, "choices", "creationDateLang")].id, e.instance.props.embed.timestamp._i));
			}
		}

		processSystemMessage (e) {
			if (BDFDB.DataUtils.get(this, "settings", "showInChat")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "time"});
				if (index > -1) children[index].props.children = this.getTimestamp(languages[BDFDB.DataUtils.get(this, "choices", "creationDateLang")].id, e.instance.props.timestamp._i);
			}
		}
		
		changeTimestamp (parent, index, change = {}) {
			let type = parent[index].type && parent[index].type.type || parent[index].type;
			if (typeof type != "function") return;
			let stamp = type(parent[index].props), tooltipWrapper;
			if (stamp.type.displayName == "Tooltip") tooltipWrapper = stamp;
			else {
				let [children, tooltipIndex] = BDFDB.ReactUtils.findChildren(stamp, {name: "Tooltip"});
				if (tooltipIndex > -1) tooltipWrapper = children[tooltipIndex];
			}
			if (tooltipWrapper) {
				let timestamp = this.getTimestamp(languages[BDFDB.DataUtils.get(this, "choices", "creationDateLang")].id, parent[index].props.timestamp._i);
				if (change.tooltip) {
					tooltipWrapper.props.text = timestamp;
					tooltipWrapper.props.delay = 0;
				}
				if (change.child && typeof tooltipWrapper.props.children == "function") {
					tooltipWrapper.props.delay = 99999999999999999999;
					let renderChildren = tooltipWrapper.props.children;
					tooltipWrapper.props.children = (...args) => {
						let renderedChildren = renderChildren(...args);
						if (BDFDB.ArrayUtils.is(renderedChildren.props.children)) renderedChildren.props.children[1] = timestamp;
						else renderChildren.props.children = timestamp;
						return renderedChildren;
					};
				}
			}
			parent[index] = stamp;
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
				let hour = timeobj.getHours(), minute = timeobj.getMinutes(), second = timeobj.getSeconds(), msecond = timeobj.getMilliseconds(), day = timeobj.getDate(), month = timeobj.getMonth()+1, timemode = "", daysago = Math.round((new Date() - timeobj)/(1000*60*60*24));
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
			
		forceUpdateAll() {
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}
	}
})();