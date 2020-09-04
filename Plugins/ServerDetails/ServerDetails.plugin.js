//META{"name":"ServerDetails","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerDetails","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerDetails/ServerDetails.plugin.js"}*//

var ServerDetails = (_ => {
	var _this, languages;
	var settings = {}, colors = {}, choices = {}, formats = {}, amounts = {};
	
	const GuildDetailsComponent = class GuildDetails extends BdApi.React.Component {
		constructor(props) {
			super(props);
			this.state = {fetchedOwner: false};
		}
		render() {
			let owner = BDFDB.LibraryModules.UserStore.getUser(this.props.guild.ownerId);
			if (!owner && !this.state.fetchedOwner) {
				this.state.fetchedOwner = true;
				BDFDB.LibraryModules.UserFetchUtils.getUser(this.props.guild.ownerId).then(_ => BDFDB.ReactUtils.forceUpdate(this));
			}
			let src = this.props.guild.getIconURL(BDFDB.LibraryModules.IconUtils.hasAnimatedGuildIcon(this.props.guild) ? "gif" : "png");
			let ownerString = `${owner ? owner.username : "Unknown"}#${owner ? owner.discriminator : "0000"}`;
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
				direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
				align: BDFDB.LibraryComponents.Flex.Align.CENTER,
				children: [
					settings.addIcon && (src ? BDFDB.ReactUtils.createElement("img", {
						className: BDFDB.disCN._serverdetailsicon,
						src: src.replace(/\?size\=\d+$/, "?size=4096").replace(/[\?\&](height|width)=\d+/g, "")
					}) : BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._serverdetailsicon,
						children: this.props.guild.acronym
					})),
					settings.addOwner && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER,
						string: `${owner ? owner.username : "Unknown"}#${owner ? owner.discriminator : "0000"}`
					}),
					settings.addCreation && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: _this.labels.creationdate_text,
						string: _this.getTimestamp(languages[choices.timeLang].id, BDFDB.LibraryModules.TimestampUtils.extractTimestamp(this.props.guild.id))
					}),
					settings.addJoin && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: _this.labels.joindate_text,
						string: _this.getTimestamp(languages[choices.timeLang].id, this.props.guild.joinedAt)
					}),
					settings.addMembers && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: BDFDB.LanguageUtils.LanguageStrings.MEMBERS,
						string: BDFDB.LibraryModules.MemberCountUtils.getMemberCount(this.props.guild.id)
					}),
					settings.addChannels && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: BDFDB.LanguageUtils.LanguageStrings.CHANNELS,
						string: BDFDB.LibraryModules.GuildChannelStore.getChannels(this.props.guild.id).count
					}),
					settings.addRoles && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: BDFDB.LanguageUtils.LanguageStrings.ROLES,
						string: Object.keys(this.props.guild.roles).length
					}),
					settings.addBoosters && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: BDFDB.LanguageUtils.LanguageStrings.SUBSCRIPTIONS_TITLE,
						string: this.props.guild.premiumSubscriberCount
					}),
					settings.addRegion && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
						prefix: BDFDB.LanguageUtils.LanguageStrings.REGION,
						string: this.props.guild.region
					})
				].flat(10).filter(n => n)
			});
		}
	};
	
	const GuildDetailsRowComponent = class GuildDetailsRow extends BdApi.React.Component {
		render() {
			return (this.props.prefix.length + this.props.string.length) > 34 ? [
				BDFDB.ReactUtils.createElement("div", {
					children: `${this.props.prefix}:`
				}),
				BDFDB.ReactUtils.createElement("div", {
					children: this.props.string
				})
			] : BDFDB.ReactUtils.createElement("div", {
				children: `${this.props.prefix}: ${this.props.string}`
			});
		}
	};
	
	return class ServerDetails {
		getName () {return "ServerDetails";}

		getVersion () {return "1.0.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Shows details of a server when you hover over the icon in the server list.";}

		constructor () {
			this.patchedModules = {
				after: {
					Guild: "render"
				}
			};
			
			this.patchPriority = 10;
		}

		initConstructor () {
			_this = this;
			
			this.defaults = {
				settings: {
					cutSeconds:				{value:false, 			inner:false,	description:"Cut off seconds of the time"},
					forceZeros:				{value:false, 			inner:false,	description:"Force leading zeros"},
					otherOrder:				{value:false, 			inner:false,	description:"Show the time before the date"},
					addIcon:				{value:true, 			inner:true,		description:"GUILD_CREATE_UPLOAD_ICON_LABEL"},
					addOwner:				{value:true, 			inner:true,		description:"GUILD_OWNER"},
					addCreation:			{value:true, 			inner:true,		description:"creationdate_text"},
					addJoin:				{value:true, 			inner:true,		description:"joindate_text"},
					addMembers:				{value:true, 			inner:true,		description:"MEMBERS"},
					addChannels:			{value:true, 			inner:true,		description:"CHANNELS"},
					addRoles:				{value:true, 			inner:true,		description:"ROLES"},
					addBoosters:			{value:true, 			inner:true,		description:"SUBSCRIPTIONS_TITLE"},
					addRegion:				{value:true, 			inner:true,		description:"REGION"}
				},
				colors: {
					tooltipColor:			{value:"", 				description:"Tooltip Color"}
				},
				choices: {
					timeLang:				{value:"$discord", 		description:"Date Format"}
				},
				formats: {
					ownFormat:				{value:"$hour:$minute:$second, $day.$month.$year", 	description:"Own Format"}
				},
				amounts: {
					maxDaysAgo:				{value:0, 	min:0,		description:"Maximum count of days displayed in the $daysago placeholder",	note:"0 equals no limit"}
				}
			};
			
			this.css = `
				${BDFDB.dotCNS._serverdetailstooltip + BDFDB.dotCN.tooltipcontent} {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}
				${BDFDB.dotCNS._serverdetailstooltip + BDFDB.dotCN._serverdetailsicon} {
					display: flex;
					justify-content: center;
					align-items: center;
					margin-bottom: 5px;
					border-radius: 10px;
					width: 220px;
					height: 220px;
					overflow: hidden;
				}
				${BDFDB.dotCN._serverdetailstooltip} div${BDFDB.dotCN._serverdetailsicon} {
					background-color: var(--background-primary);
					color: var(--text-normal);
					font-size: 40px;
				}
			`;
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			settings = BDFDB.DataUtils.get(this, "settings");
			colors = BDFDB.DataUtils.get(this, "colors");
			choices = BDFDB.DataUtils.get(this, "choices");
			formats = BDFDB.DataUtils.get(this, "formats");
			amounts = BDFDB.DataUtils.get(this, "amounts");
			let settingsPanel, settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).map(key => !this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
				}))
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Tooltip Settings",
				collapseStates: collapseStates,
				children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
					className: BDFDB.disCN.marginbottom4,
					tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
					children: "Add additional details in the server tooltip for:"
				})].concat(Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.labels[this.defaults.settings[key].description] || BDFDB.LanguageUtils.LanguageStrings[this.defaults.settings[key].description],
					value: settings[key]
				}))).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
					className: BDFDB.disCN.marginbottom8
				})).concat(Object.keys(colors).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "TextInput",
					plugin: this,
					keys: ["colors", key],
					childProps: {
						type: "color",
						noAlpha: true
					},
					basis: "70%",
					label: this.defaults.colors[key].description,
					value: colors[key],
					placeholder: colors[key]
				})))
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Time Format",
				collapseStates: collapseStates,
				children: Object.keys(choices).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
				})).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
					className: BDFDB.disCN.marginbottom8
				})).concat(Object.keys(formats).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
				}))).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
					className: BDFDB.disCN.marginbottom8
				})).concat(Object.keys(amounts).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
				}))).filter(n => n)
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
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

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

				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryComponents.GuildComponents.Guild.prototype, "render", {after: e => {
					this.processGuild({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});
				}});

				languages = Object.assign({
					own: {
						name: "Own",
						id: "own"
					}
				}, BDFDB.LanguageUtils.languages);

				this.forceUpdateAll();
			}
			else {
				console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
			}
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

		processGuild (e) {
			if (BDFDB.GuildUtils.is(e.instance.props.guild)) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["GuildTooltip", "BDFDB_TooltipContainer"]});
				if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, Object.assign({}, children[index].props, {
					tooltipConfig:  Object.assign({
						backgroundColor: colors.tooltipColor
					}, children[index].props.tooltipConfig, {
						className: BDFDB.disCN._serverdetailstooltip,
						type: "right",
						guild: e.instance.props.guild,
						list: true,
						offset: 12,
						width: 300
					}),
					text: _ => BDFDB.ReactUtils.createElement(GuildDetailsComponent, {
						guild: e.instance.props.guild
					})
				}));
			}
		}

		getTimestamp (languageId, time) {
			let timeObj = time || new Date();
			if (typeof time == "string" || typeof time == "number") timeObj = new Date(time);
			if (timeObj.toString() == "Invalid Date") timeObj = new Date(parseInt(time));
			if (timeObj.toString() == "Invalid Date") return;
			let timeString = "";
			if (languageId != "own") {
				let timestamp = [];
				timestamp.push(timeObj.toLocaleDateString(languageId));
				timestamp.push(settings.cutSeconds ? this.cutOffSeconds(timeObj.toLocaleTimeString(languageId)) : timeObj.toLocaleTimeString(languageId));
				if (settings.otherOrder) timestamp.reverse();
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
			colors = BDFDB.DataUtils.get(this, "colors");
			choices = BDFDB.DataUtils.get(this, "choices");
			formats = BDFDB.DataUtils.get(this, "formats");
			amounts = BDFDB.DataUtils.get(this, "amounts");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						creationdate_text:			"Datum stvaranja",
						joindate_text:				"Datum pridruživanja"
					};
				case "da":		//danish
					return {
						creationdate_text:			"Oprettelsesdato",
						joindate_text:				"Tilmeldingsdato"
					};
				case "de":		//german
					return {
						creationdate_text:			"Erstellungsdatum",
						joindate_text:				"Beitrittsdatum"
					};
				case "es":		//spanish
					return {
						creationdate_text:			"Fecha de creación",
						joindate_text:				"Fecha de inscripción"
					};
				case "fr":		//french
					return {
						creationdate_text:			"Date de création",
						joindate_text:				"Date d'adhésion"
					};
				case "it":		//italian
					return {
						creationdate_text:			"Data di creazione",
						joindate_text:				"Data di adesione"
					};
				case "nl":		//dutch
					return {
						creationdate_text:			"Aanmaakdatum",
						joindate_text:				"Toetredingsdatum"
					};
				case "no":		//norwegian
					return {
						creationdate_text:			"Opprettelsesdato",
						joindate_text:				"Påmeldingsdato"
					};
				case "pl":		//polish
					return {
						creationdate_text:			"Data utworzenia",
						joindate_text:				"Data dołączenia"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						creationdate_text:			"Data de criação",
						joindate_text:				"Data de adesão"
					};
				case "fi":		//finnish
					return {
						creationdate_text:			"Luomispäivä",
						joindate_text:				"Liittymispäivämäärä"
					};
				case "sv":		//swedish
					return {
						creationdate_text:			"Skapelsedagen",
						joindate_text:				"Anslutningsdagen"
					};
				case "tr":		//turkish
					return {
						creationdate_text:			"Oluşturulma tarihi",
						joindate_text:				"Katılım tarihi"
					};
				case "cs":		//czech
					return {
						creationdate_text:			"Datum vzniku",
						joindate_text:				"Datum připojení"
					};
				case "bg":		//bulgarian
					return {
						creationdate_text:			"Дата на създаване",
						joindate_text:				"Дата на присъединяване"
					};
				case "ru":		//russian
					return {
						creationdate_text:			"Дата создания",
						joindate_text:				"Дата присоединения"
					};
				case "uk":		//ukrainian
					return {
						creationdate_text:			"Дата створення",
						joindate_text:				"Дата вступу"
					};
				case "ja":		//japanese
					return {
						creationdate_text:			"作成日",
						joindate_text:				"入社の日"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						creationdate_text:			"創建日期",
						joindate_text:				"入職日期"
					};
				case "ko":		//korean
					return {
						creationdate_text:			"제작 일",
						joindate_text:				"입사일"
					};
				default:		//default: english
					return {
						creationdate_text:			"Creationdate",
						joindate_text:				"Joindate"
					};
			}
		}
	}
})();

module.exports = ServerDetails;