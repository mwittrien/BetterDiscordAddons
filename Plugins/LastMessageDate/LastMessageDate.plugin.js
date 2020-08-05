//META{"name":"LastMessageDate","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/LastMessageDate","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/LastMessageDate/LastMessageDate.plugin.js"}*//

var LastMessageDate = (_ => {
	var loadedUsers, requestedUsers, languages;
	var settings = {}, choices = {}, formats = {}, amounts = {};
	
	return class LastMessageDate {
		getName () {return "LastMessageDate";}

		getVersion () {return "1.1.9";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Displays the Date of the last sent Message of a Member for the current Server/DM in the UserPopout and UserModal.";}

		constructor () {
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

			this.defaults = {
				settings: {
					addInUserPopout:		{value:true, 			description:"Add in User Popouts"},
					addInUserProfil:		{value:true, 			description:"Add in User Profile Modal"},
					displayText:			{value:true, 			description:"Display 'Last message on' text in the timestamp"},
					displayTime:			{value:true, 			description:"Display the time in the timestamp"},
					displayDate:			{value:true, 			description:"Display the date in the timestamp"},
					cutSeconds:				{value:false, 			description:"Cut off seconds of the time"},
					forceZeros:				{value:false, 			description:"Force leading zeros"},
					otherOrder:				{value:false, 			description:"Show the time before the date"}
				},
				choices: {
					lastMessageDateLang:	{value:"$discord", 		description:"Last Message Date Format"}
				},
				formats: {
					ownFormat:				{value:"$hour:$minute:$second, $day.$month.$year", 	description:"Own Format"}
				},
				amounts: {
					maxDaysAgo:				{value:0, 	min:0,		description:"Maximum count of days displayed in the $daysago placeholder",	note:"0 equals no limit"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsPanel, settingsItems = [], innerItems = [];
			
			for (let key in settings) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key],
				onChange: (value, instance) => {
					settings[key] = value;
					BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_SettingsPanel", up:true}), {name:"BDFDB_Select", all:true, noCopies:true}));
				}
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: innerItems
			}));
			
			innerItems = [];
			
			for (let key in choices) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
			
			innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom8
			}));
			
			for (let key in formats) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "TextInput",
				plugin: this,
				keys: ["formats", key],
				label: this.defaults.formats[key].description,
				basis: "70%",
				value: formats[key],
				onChange: (value, instance) => {
					formats[key] = value;
					BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_SettingsPanel", up:true}), {name:"BDFDB_Select", all:true, noCopies:true}));
				}
			}));
			
			innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom8
			}));
			
			for (let key in amounts) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "TextInput",
				childProps: {
					type: "number"
				},
				plugin: this,
				keys: ["amounts", key],
				label: this.defaults.amounts[key].description,
				note: this.defaults.amounts[key].note,
				basis: "20%",
				min: this.defaults.amounts[key].min,
				max: this.defaults.amounts[key].max,
				value: amounts[key]
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Format",
				collapseStates: collapseStates,
				children: innerItems
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Placeholder Guide",
				dividertop: true,
				collapseStates: collapseStates,
				children: [
					"$hour will be replaced with the hour of the date",
					"$minute will be replaced with the minutes of the date",
					"$second will be replaced with the seconds of the date",
					"$msecond will be replaced with the milliseconds of the date",
					"$timemode will change $hour to a 12h format and will be replaced with AM/PM",
					"$year will be replaced with the year of the date",
					"$yearS will be replaced with the year in short form",
					"$month will be replaced with the month of the date",
					"$day will be replaced with the day of the date",
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

				languages = Object.assign({
					own: {
						name: "Own",
						id: "own"
					}
				}, BDFDB.LanguageUtils.languages);

				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dirtyDispatch", {after: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == BDFDB.DiscordConstants.ActionTypes.MESSAGE_CREATE && e.methodArguments[0].message) {
						let message = e.methodArguments[0].message;
						let guildId = message.guild_id || message.channel_id;
						if (guildId && loadedUsers[guildId] && loadedUsers[guildId][message.author.id]) {
							loadedUsers[guildId][message.author.id] = new Date(message.timestamp);
						}
					}
				}});

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


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		processUserPopout (e) {
			if (e.instance.props.user && settings.addInUserPopout) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "CustomStatus"});
				if (index > -1) this.injectDate(e.instance, children, 2, e.instance.props.user, e.instance.props.guild && e.instance.props.guild.id);
			}
		}

		processAnalyticsContext (e) {
			if (typeof e.returnvalue.props.children == "function" && e.instance.props.section == BDFDB.DiscordConstants.AnalyticsSections.PROFILE_MODAL && settings.addInUserProfil) {
				let renderChildren = e.returnvalue.props.children;
				e.returnvalue.props.children = (...args) => {
					let renderedChildren = renderChildren(...args);
					let [children, index] = BDFDB.ReactUtils.findParent(renderedChildren, {name: ["DiscordTag", "ColoredFluxTag"]});
					if (index > -1) this.injectDate(e.instance, children, 1, children[index].props.user, BDFDB.ReactUtils.findValue(e.instance, "guildId", {up: true}));
					return renderedChildren;
				};
			}
		}

		injectDate (instance, children, index, user, guildId) {
			if (!guildId) guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
			if (!BDFDB.ArrayUtils.is(children) || !user || user.discriminator == "0000") return;
			let isGuild = guildId && guildId != BDFDB.DiscordConstants.ME;
			guildId = isGuild ? guildId : BDFDB.LibraryModules.LastChannelStore.getChannelId();
			if (!guildId) return;
			if (!loadedUsers[guildId]) loadedUsers[guildId] = {};
			if (!requestedUsers[guildId]) requestedUsers[guildId] = {};
			if (!BDFDB.ArrayUtils.is(requestedUsers[guildId][user.id])) {
				requestedUsers[guildId][user.id] = [instance];
				BDFDB.LibraryModules.APIUtils.get((isGuild ? BDFDB.DiscordConstants.Endpoints.SEARCH_GUILD(guildId) : BDFDB.DiscordConstants.Endpoints.SEARCH_CHANNEL(guildId)) + "?author_id=" + user.id).then(result => {
					if (typeof result.body.retry_after != "number") {
						if (result.body.messages && Array.isArray(result.body.messages[0])) {
							for (let message of result.body.messages[0]) if (message.hit && message.author.id == user.id) {
								loadedUsers[guildId][user.id] = new Date(message.timestamp);
							}
						}
						else loadedUsers[guildId][user.id] = null;
						for (let queredinstance of requestedUsers[guildId][user.id]) BDFDB.ReactUtils.forceUpdate(queredinstance);
					}
					else {
						delete requestedUsers[guildId][user.id];
						BDFDB.TimeUtils.timeout(_ => {this.injectDate(instance, children, index, user);}, result.body.retry_after + 500);
					}
				});
			}
			else if (loadedUsers[guildId][user.id] === undefined) requestedUsers[guildId][user.id].push(instance);
			else {
				let timestamp = loadedUsers[guildId][user.id] ? this.getTimestamp(languages[choices.lastMessageDateLang].id, loadedUsers[guildId][user.id]) : "---";
				children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
					className: BDFDB.disCNS._lastmessagedatedate + BDFDB.disCNS.userinfodate + BDFDB.disCN.textrow,
					children: settings.displayText ? this.labels.lastmessage_text.replace("{{time}}", timestamp) : timestamp
				}));
			}
		}
		
		getTimestamp (languageId, time) {
			let timeObj = time || new Date();
			if (typeof time == "string") timeObj = new Date(time);
			if (timeObj.toString() == "Invalid Date") timeObj = new Date(parseInt(time));
			if (timeObj.toString() == "Invalid Date") return;
			let settings = BDFDB.DataUtils.get(this, "settings"), timeString = "";
			if (languageId != "own") {
				let timestamp = [];
				if (settings.displayDate) 	timestamp.push(timeObj.toLocaleDateString(languageId));
				if (settings.displayTime) 	timestamp.push(settings.cutSeconds ? this.cutOffSeconds(timeObj.toLocaleTimeString(languageId)) : timeObj.toLocaleTimeString(languageId));
				if (settings.otherOrder)	timestamp.reverse();
				timeString = timestamp.length > 1 ? timestamp.join(", ") : (timestamp.length > 0 ? timestamp[0] : "");
				if (timeString && settings.forceZeros) timeString = this.addLeadingZeros(timeString);
			}
			else {
				languageId = BDFDB.LanguageUtils.getLanguage().id;
				let now = new Date();
				let hour = timeObj.getHours(), minute = timeObj.getMinutes(), second = timeObj.getSeconds(), msecond = timeObj.getMilliseconds(), day = timeObj.getDate(), month = timeObj.getMonth()+1, timemode = "", daysago = Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(timeObj.getFullYear(), timeObj.getMonth(), timeObj.getDate()))/(1000*60*60*24));
				if (formats.ownFormat.indexOf("$timemode") > -1) {
					timemode = hour >= 12 ? "PM" : "AM";
					hour = hour % 12;
					hour = hour ? hour : 12;
				}
				timeString = formats.ownFormat
					.replace(/\$hour/g, settings.forceZeros && hour < 10 ? "0" + hour : hour)
					.replace(/\$minute/g, minute < 10 ? "0" + minute : minute)
					.replace(/\$second/g, second < 10 ? "0" + second : second)
					.replace(/\$msecond/g, settings.forceZeros ? (msecond < 10 ? "00" + msecond : (msecond < 100 ? "0" + msecond : msecond)) : msecond)
					.replace(/\$timemode/g, timemode)
					.replace(/\$weekdayL/g, timeObj.toLocaleDateString(languageId, {weekday: "long"}))
					.replace(/\$weekdayS/g, timeObj.toLocaleDateString(languageId, {weekday: "short"}))
					.replace(/\$monthnameL/g, timeObj.toLocaleDateString(languageId, {month: "long"}))
					.replace(/\$monthnameS/g, timeObj.toLocaleDateString(languageId, {month: "short"}))
					.replace(/\$daysago/g, amounts.maxDaysAgo == 0 || amounts.maxDaysAgo >= daysago ? (daysago > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("ACTIVITY_FEED_USER_PLAYED_DAYS_AGO", daysago) : BDFDB.LanguageUtils.LanguageStrings.SEARCH_SHORTCUT_TODAY) : "")
					.replace(/\$day/g, settings.forceZeros && day < 10 ? "0" + day : day)
					.replace(/\$month/g, settings.forceZeros && month < 10 ? "0" + month : month)
					.replace(/\$yearS/g, parseInt(timeObj.getFullYear().toString().slice(-2)))
					.replace(/\$year/g, timeObj.getFullYear())
					.trim().split(" ").filter(n => n).join(" ");
			}
			return timeString;
		}

		cutOffSeconds (timeString) {
			return timeString.replace(/(.{1,2}:.{1,2}):.{1,2}(.*)/, "$1$2").replace(/(.{1,2}\..{1,2})\..{1,2}(.*)/, "$1$2").replace(/(.{1,2} h .{1,2} min) .{1,2} s(.*)/, "$1$2");
		}

		addLeadingZeros (timeString) {
			let charArray = timeString.split("");
			let numreg = /[0-9]/;
			for (let i = 0; i < charArray.length; i++) {
				if (!numreg.test(charArray[i-1]) && numreg.test(charArray[i]) && !numreg.test(charArray[i+1])) charArray[i] = "0" + charArray[i];
			}

			return charArray.join("");
		}
		
		forceUpdateAll() {
			settings = BDFDB.DataUtils.get(this, "settings");
			choices = BDFDB.DataUtils.get(this, "choices");
			formats = BDFDB.DataUtils.get(this, "formats");
			amounts = BDFDB.DataUtils.get(this, "amounts");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						lastmessage_text:				"Posljednja poruka dana {{time}}"
					};
				case "da":		//danish
					return {
						lastmessage_text:				"Sidste besked den {{time}}"
					};
				case "de":		//german
					return {
						lastmessage_text:				"Letzte Nachricht am {{time}}"
					};
				case "es":		//spanish
					return {
						lastmessage_text:				"Último mensaje el {{time}}"
					};
				case "fr":		//french
					return {
						lastmessage_text:				"Dernier message le {{time}}"
					};
				case "it":		//italian
					return {
						lastmessage_text:				"Ultimo messaggio il {{time}}"
					};
				case "nl":		//dutch
					return {
						lastmessage_text:				"Laatste bericht op {{time}}"
					};
				case "no":		//norwegian
					return {
						lastmessage_text:				"Siste melding på {{time}}"
					};
				case "pl":		//polish
					return {
						lastmessage_text:				"Ostatnia wiadomość z {{time}}"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						lastmessage_text:				"Última mensagem em {{time}}"
					};
				case "fi":		//finnish
					return {
						lastmessage_text:				"Viimeisin viesti {{time}}"
					};
				case "sv":		//swedish
					return {
						lastmessage_text:				"Senaste meddelandet den {{time}}"
					};
				case "tr":		//turkish
					return {
						lastmessage_text:				"Son mesajı {{time}}"
					};
				case "cs":		//czech
					return {
						lastmessage_text:				"Poslední zpráva dne {{time}}"
					};
				case "bg":		//bulgarian
					return {
						lastmessage_text:				"Последно съобщение на {{time}}"
					};
				case "ru":		//russian
					return {
						lastmessage_text:				"Последнее сообщение {{time}}"
					};
				case "uk":		//ukrainian
					return {
						lastmessage_text:				"Останнє повідомлення {{time}}"
					};
				case "ja":		//japanese
					return {
						lastmessage_text:				"{{time}} 最後のメッセージ"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						lastmessage_text:				"最後消息於 {{time}}"
					};
				case "ko":		//korean
					return {
						lastmessage_text:				"{{time}} 마지막 메시지"
					};
				default:		//default: english
					return {
						lastmessage_text:				"Last message on {{time}}"
					};
			}
		}
	}
})();

module.exports = LastMessageDate;