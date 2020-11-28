/**
 * @name CreationDate
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CreationDate
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CreationDate/CreationDate.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CreationDate/CreationDate.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CreationDate",
			"author": "DevilBro",
			"version": "1.4.0",
			"description": "Display the Creation Date of an Account in the UserPopout and UserModal"
		},
		"changeLog": {
			"fixed": {
				"Settings": "Work again"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var languages;
		var settings = {}, choices = {}, formats = {}, amounts = {};
		
		return class CreationDate extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						addInUserPopout:		{value: true, 			description: "Add in User Popouts"},
						addInUserProfil:		{value: true, 			description: "Add in User Profile Modal"},
						displayText:			{value: true, 			description: "Display 'Created on' text in the timestamp"},
						displayTime:			{value: true, 			description: "Display the time in the timestamp"},
						displayDate:			{value: true, 			description: "Display the date in the timestamp"},
						cutSeconds:				{value: false, 			description: "Cut off seconds of the time"},
						forceZeros:				{value: false, 			description: "Force leading zeros"},
						otherOrder:				{value: false, 			description: "Show the time before the date"}
					},
					choices: {
						creationDateLang:		{value: "$discord", 		description: "Creation Date Format"}
					},
					formats: {
						ownFormat:				{value: "$hour: $minute: $second, $day.$month.$year", 	description: "Own Format"}
					},
					amounts: {
						maxDaysAgo:				{value: 0, 	min: 0,		description: "Maximum count of days displayed in the $daysago placeholder",	note: "0 equals no limit"}
					}
				};
				
				this.patchedModules = {
					after: {
						UserPopout: "render",
						AnalyticsContext: "render"
					}
				};
				
			}
			
			onStart() {
				languages = BDFDB.ObjectUtils.deepAssign({
					own: {
							"name": "Own",
						id: "own"
					}
				}, BDFDB.LanguageUtils.languages);

				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Settings",
					collapseStates: collapseStates,
					children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key],
						onChange: (value, instance) => {
							settings[key] = value;
							BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name: "BDFDB_SettingsPanel", up: true}), {name: "BDFDB_Select", all: true, noCopies: true}));
						}
					}))
				}));
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Format",
					collapseStates: collapseStates,
					children: Object.keys(choices).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Select",
						plugin: this,
						keys: ["choices", key],
						label: this.defaults.choices[key].description,
						basis: "70%",
						value: choices[key],
						options: BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(languages, (lang, id) => {return {value: id, label: lang.name}})),
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
						type: "TextInput",
						plugin: this,
						keys: ["formats", key],
						label: this.defaults.formats[key].description,
						basis: "70%",
						value: formats[key],
						onChange: (value, instance) => {
							formats[key] = value;
							BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name: "BDFDB_SettingsPanel", up: true}), {name: "BDFDB_Select", all: true, noCopies: true}));
						}
					}))).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCN.marginbottom8
					})).concat(Object.keys(amounts).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
					})))
				}));
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Placeholder Guide",
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
					].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
						type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
						children: string
					}))
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll() {
				settings = BDFDB.DataUtils.get(this, "settings");
				choices = BDFDB.DataUtils.get(this, "choices");
				formats = BDFDB.DataUtils.get(this, "formats");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processUserPopout (e) {
				if (e.instance.props.user && settings.addInUserPopout) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "CustomStatus"});
					if (index > -1) this.injectDate(children, 2, e.instance.props.user);
				}
			}

			processAnalyticsContext (e) {
				if (typeof e.returnvalue.props.children == "function" && e.instance.props.section == BDFDB.DiscordConstants.AnalyticsSections.PROFILE_MODAL && settings.addInUserProfil) {
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let renderedChildren = renderChildren(...args);
						let [children, index] = BDFDB.ReactUtils.findParent(renderedChildren, {name: ["DiscordTag", "ColoredFluxTag"]});
						if (index > -1) this.injectDate(children, 1, children[index].props.user);
						return renderedChildren;
					};
				}
			}
			
			injectDate (children, index, user) {
				let timestamp = this.getTimestamp(languages[choices.creationDateLang].id, user.createdAt);
				children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
					className: BDFDB.disCNS._creationdatedate + BDFDB.disCNS.userinfodate + BDFDB.disCN.textrow,
					children: settings.displayText ? this.labels.createdat_text.replace("{{time}}", timestamp) : timestamp
				}));
			}

			getTimestamp (languageId, time) {
				let timeObj = time || new Date();
				if (typeof time == "string" || typeof time == "number") timeObj = new Date(time);
				if (timeObj.toString() == "Invalid Date") timeObj = new Date(parseInt(time));
				if (timeObj.toString() == "Invalid Date") return;
				let timeString = "";
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

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							createdat_text:				"Izrađen {{time}}"
						};
					case "da":		//danish
						return {
							createdat_text:				"Oprettet den {{time}}"
						};
					case "de":		//german
						return {
							createdat_text:				"Erstellt am {{time}}"
						};
					case "es":		//spanish
						return {
							createdat_text:				"Creado el {{time}}"
						};
					case "fr":		//french
						return {
							createdat_text:				"Créé le {{time}}"
						};
					case "it":		//italian
						return {
							createdat_text:				"Creato il {{time}}"
						};
					case "nl":		//dutch
						return {
							createdat_text:				"Gemaakt op {{time}}"
						};
					case "no":		//norwegian
						return {
							createdat_text:				"Opprettet på {{time}}"
						};
					case "pl":		//polish
						return {
							createdat_text:				"Utworzono {{time}}"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							createdat_text:				"Criado em {{time}}"
						};
					case "fi":		//finnish
						return {
							createdat_text:				"Luotu {{time}}"
						};
					case "sv":		//swedish
						return {
							createdat_text:				"Skapat den {{time}}"
						};
					case "tr":		//turkish
						return {
							createdat_text:				"Oluşturma tarihi {{time}}"
						};
					case "cs":		//czech
						return {
							createdat_text:				"Vytvořeno dne {{time}}"
						};
					case "bg":		//bulgarian
						return {
							createdat_text:				"Създадена на {{time}}"
						};
					case "ru":		//russian
						return {
							createdat_text:				"Создан {{time}}"
						};
					case "uk":		//ukrainian
						return {
							createdat_text:				"Створено {{time}}"
						};
					case "ja":		//japanese
						return {
							createdat_text:				"{{time}} に登録"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							createdat_text:				"創建於 {{time}}"
						};
					case "ko":		//korean
						return {
							createdat_text:				"{{time}} 생성 일"
						};
					default:		//default: english
						return {
							createdat_text:				"Created on {{time}}"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();