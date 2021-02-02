/**
 * @name JoinedAtDate
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/JoinedAtDate
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/JoinedAtDate/JoinedAtDate.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/JoinedAtDate/JoinedAtDate.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "JoinedAtDate",
			"author": "DevilBro",
			"version": "1.2.5",
			"description": "Display the Joined At Date of the current Server for a Member in the UserPopout and UserModal"
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
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var loadedUsers, requestedUsers, languages;
		var settings = {}, choices = {}, formats = {}, amounts = {};
		
		return class JoinedAtDate extends Plugin {
			onLoad () {
				loadedUsers = {};
				requestedUsers = {};

				this.defaults = {
					settings: {
						addInUserPopout:		{value: true, 			description: "Add in User Popouts"},
						addInUserProfil:		{value: true, 			description: "Add in User Profile Modal"},
						displayText:			{value: true, 			description: "Display 'Joined on' text in the timestamp"},
						displayTime:			{value: true, 			description: "Display the time in the timestamp"},
						displayDate:			{value: true, 			description: "Display the date in the timestamp"},
						cutSeconds:				{value: false, 			description: "Cut off seconds of the time"},
						forceZeros:				{value: false, 			description: "Force leading zeros"},
						otherOrder:				{value: false, 			description: "Show the time before the date"}
					},
					choices: {
						joinedAtDateLang:		{value: "$discord", 		description: "Joined At Date Format"}
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
			
			onStart () {
				languages = BDFDB.ObjectUtils.deepAssign({
					own: {
						name: "Own",
						id: "own"
					}
				}, BDFDB.LanguageUtils.languages);

				this.forceUpdateAll();
			}
			
			onStop () {
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
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				choices = BDFDB.DataUtils.get(this, "choices");
				formats = BDFDB.DataUtils.get(this, "formats");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processUserPopout (e) {
				if (e.instance.props.user && e.instance.props.guild && settings.addInUserPopout) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "CustomStatus"});
					if (index > -1) this.injectDate(e.instance, children, 2, e.instance.props.user, e.instance.props.guild.id);
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
				if (!BDFDB.ArrayUtils.is(children) || !user || !guildId || user.discriminator == "0000" || !BDFDB.LibraryModules.MemberStore.getMember(guildId, user.id)) return;
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
				else {
					let timestamp = this.getTimestamp(languages[choices.joinedAtDateLang].id, loadedUsers[guildId][user.id]);
					children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
						className: BDFDB.disCNS._joinedatdatedate + BDFDB.disCNS.userinfodate + BDFDB.disCN.textrow,
						children: settings.displayText ? this.labels.joined_at.replace("{{time}}", timestamp) : timestamp
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
					case "bg":		// Bulgarian
						return {
							joined_at:							"Присъединил се на {{time}}"
						};
					case "da":		// Danish
						return {
							joined_at:							"Deltog den {{time}}"
						};
					case "de":		// German
						return {
							joined_at:							"Beitritt zu {{time}}"
						};
					case "el":		// Greek
						return {
							joined_at:							"Έγινε μέλος στις {{time}}"
						};
					case "es":		// Spanish
						return {
							joined_at:							"Se unió el {{time}}"
						};
					case "fi":		// Finnish
						return {
							joined_at:							"Liittyi {{time}}"
						};
					case "fr":		// French
						return {
							joined_at:							"Inscription le {{time}}"
						};
					case "hr":		// Croatian
						return {
							joined_at:							"Pridružio se {{time}}"
						};
					case "hu":		// Hungarian
						return {
							joined_at:							"Csatlakozott: {{time}}"
						};
					case "it":		// Italian
						return {
							joined_at:							"Iscritto il {{time}}"
						};
					case "ja":		// Japanese
						return {
							joined_at:							"{{time}}に参加しました"
						};
					case "ko":		// Korean
						return {
							joined_at:							"{{time}}에 가입했습니다."
						};
					case "lt":		// Lithuanian
						return {
							joined_at:							"Prisijungė {{time}}"
						};
					case "nl":		// Dutch
						return {
							joined_at:							"Aangesloten op {{time}}"
						};
					case "no":		// Norwegian
						return {
							joined_at:							"Ble med {{time}}"
						};
					case "pl":		// Polish
						return {
							joined_at:							"Dołączono {{time}}"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							joined_at:							"Entrou em {{time}}"
						};
					case "ro":		// Romanian
						return {
							joined_at:							"S-a înscris pe {{time}}"
						};
					case "ru":		// Russian
						return {
							joined_at:							"Присоединился {{time}}"
						};
					case "sv":		// Swedish
						return {
							joined_at:							"Gick med den {{time}}"
						};
					case "th":		// Thai
						return {
							joined_at:							"เข้าร่วมเมื่อ {{time}}"
						};
					case "tr":		// Turkish
						return {
							joined_at:							"{{time}} tarihinde katıldı"
						};
					case "uk":		// Ukrainian
						return {
							joined_at:							"Приєднався {{time}}"
						};
					case "vi":		// Vietnamese
						return {
							joined_at:							"Đã tham gia vào {{time}}"
						};
					case "zh-CN":	// Chinese (China)
						return {
							joined_at:							"已于{{time}}加入"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							joined_at:							"已於{{time}}加入"
						};
					default:		// English
						return {
							joined_at:							"Joined on {{time}}"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();