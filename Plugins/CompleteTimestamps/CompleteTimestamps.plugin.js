/**
 * @name CompleteTimestamps
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CompleteTimestamps
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CompleteTimestamps/CompleteTimestamps.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CompleteTimestamps/CompleteTimestamps.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CompleteTimestamps",
			"author": "DevilBro",
			"version": "1.5.1",
			"description": "Replace all timestamps with complete timestamps"
		},
		"changeLog": {
			"added": {
				"Format for Tooltips": "Added an option to set up and select a custom format for timestamps inside tooltips"
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
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
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
		var languages, currentMode;
		var settings = {}, choices = {}, formats = {}, amounts = {};
	
		return class CompleteTimestamps extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						showInChat:				{value: true, 			description: "Replace chat timestamp with complete timestamp"},
						showInEmbed:			{value: true, 			description: "Replace embed timestamp with complete timestamp"},
						changeForChat:			{value: true, 			description: "Change the time for the chat time tooltips"},
						changeForEdit:			{value: true, 			description: "Change the time for the edited time tooltips"},
						displayTime:			{value: true, 			description: "Display the time in the timestamp"},
						displayDate:			{value: true, 			description: "Display the date in the timestamp"},
						cutSeconds:				{value: false, 			description: "Cut off seconds of the time"},
						forceZeros:				{value: false, 			description: "Force leading zeros"},
						otherOrder:				{value: false, 			description: "Show the time before the date"}
					},
					choices: {
						timestampLang:			{value: "$discord", 		description: "Chat Timestamp Format"},
						timestampToolLang:		{value: "$discord", 		description: "Tooltip Timestamp Format"}
					},
					formats: {
						ownFormat:				{value: "$hour:$minute:$second, $day.$month.$year", 	description: "Own Chat Format"},
						ownFormatTool:			{value: "$hour:$minute:$second, $day.$month.$year", 	description: "Own Tooltip Format"}
					},
					amounts: {
						maxDaysAgo:				{value: 0, 	min: 0,		description: "Maximum count of days displayed in the $daysago placeholder",	note: "0 equals no limit"}
					}
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
			
			onStart () {
				languages = BDFDB.ObjectUtils.deepAssign({
					own: {
							"name": "Own",
						id: "own"
					}
				}, BDFDB.LanguageUtils.languages);
				
				// REMOVE 21.12.2020
				let oC = BDFDB.DataUtils.load(this, "choices"), oF = BDFDB.DataUtils.load(this, "formats");
				if (!oC.timestampToolLang || !oF.ownFormatTool) {
					oC.timestampToolLang = oC.timestampLang;
					oF.ownFormatTool = oF.ownFormat;
					BDFDB.DataUtils.save(oC, this, "choices");
					BDFDB.DataUtils.save(oF, this, "formats");
				}
				
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
				
				BDFDB.DOMUtils.removeLocalStyle(this.name + "CompactCorrection");
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
						basis: "65%",
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
										children: this.getTimestamp(languages[lang.value].id, null, key == "timestampToolLang")
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
										children: this.getTimestamp(languages[lang.value].id, null, key == "timestampToolLang")
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
						basis: "65%",
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
				currentMode = null;
					
				settings = BDFDB.DataUtils.get(this, "settings");
				choices = BDFDB.DataUtils.get(this, "choices");
				formats = BDFDB.DataUtils.get(this, "formats");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			processMessage (e) {
				if (settings.changeForChat && BDFDB.ObjectUtils.get(e, "instance.props.childrenHeader.type.type.displayName") == "MessageTimestamp") {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: e.instance.props.childrenHeader.type});
					if (index > -1) this.changeTimestamp(children, index, {child: false, tooltip: true});
				}
			}
			
			processMessageHeader (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "MessageTimestamp"});
				if (index > -1) {
					this.changeTimestamp(children, index, {child: settings.showInChat, tooltip: settings.changeForChat});
					this.setMaxWidth(children[index], e.instance.props.compact);
				}
			}
			
			processMessageContent (e) {
				if (e.instance.props.message.editedTimestamp && settings.changeForEdit) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "SuffixEdited"});
					if (index > -1) this.changeTimestamp(children, index, {child: false, tooltip: true});
				}
			}

			processEmbed (e) {
				if (e.instance.props.embed.timestamp && settings.showInEmbed) {
					let process = returnvalue => {
						let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {props: [["className", BDFDB.disCN.embedfootertext]]});
						if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children.splice(children[index].props.children.length - 1, 1, this.getTimestamp(languages[choices.timestampLang].id, e.instance.props.embed.timestamp._i));
					};
					if (typeof e.returnvalue.props.children == "function") {
						let childrenRender = e.returnvalue.props.children;
						e.returnvalue.props.children = (...args) => {
							let children = childrenRender(...args);
							process(children);
							return children;
						};
					}
					else process(e.returnvalue);
				}
			}

			processSystemMessage (e) {
				if (settings.showInChat) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "time"});
					if (index > -1) children[index].props.children = this.getTimestamp(languages[choices.timestampLang].id, e.instance.props.timestamp._i);
				}
			}
			
			changeTimestamp (parent, index, change = {}) {
				let type = parent[index].type && parent[index].type.type || parent[index].type;
				if (typeof type != "function") return;
				let stamp = type(parent[index].props), tooltipWrapper;
				if (stamp.type.displayName == "Tooltip") tooltipWrapper = stamp;
				else {
					let [children, tooltipIndex] = BDFDB.ReactUtils.findParent(stamp, {name: "Tooltip"});
					if (tooltipIndex > -1) tooltipWrapper = children[tooltipIndex];
				}
				if (tooltipWrapper) {
					let timestamp = this.getTimestamp(languages[choices.timestampLang].id, parent[index].props.timestamp._i);
					if (change.tooltip) {
						tooltipWrapper.props.text = this.getTimestamp(languages[choices.timestampToolLang].id, parent[index].props.timestamp._i, true);
						tooltipWrapper.props.delay = 0;
					}
					if (change.child && typeof tooltipWrapper.props.children == "function") {
						if (choices.timestampLang == choices.timestampToolLang && formats.ownFormat == formats.ownFormatTool) tooltipWrapper.props.delay = 99999999999999999999;
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

			getTimestamp (languageId, time, isTooltip) {
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
					if (formats[isTooltip ? "ownFormatTool" : "ownFormat"].indexOf("$timemode") > -1) {
						timemode = hour >= 12 ? "PM" : "AM";
						hour = hour % 12;
						hour = hour ? hour : 12;
					}
					timeString = formats[isTooltip ? "ownFormatTool" : "ownFormat"]
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
			
			setMaxWidth (timestamp, compact) {
				if (currentMode != compact) {
					currentMode = compact;
					if (timestamp.props.className && typeof timestamp.type == "string") {
						let tempTimestamp = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.messagecompact}"><${timestamp.type} class="${timestamp.props.className}" style="width: auto !important;">${this.getTimestamp(languages[choices.timestampLang].id, new Date(253402124399995))}</${timestamp.type}></div>`);
						document.body.appendChild(tempTimestamp);
						let width = BDFDB.DOMUtils.getRects(tempTimestamp.firstElementChild).width + 10;
						tempTimestamp.remove();
						BDFDB.DOMUtils.appendLocalStyle(this.name + "CompactCorrection", `
							${BDFDB.dotCN.messagecompact + BDFDB.dotCN.messagewrapper} {
								padding-left: ${44 + width}px;
							}
							${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.messagecontents} {
								margin-left: -${44 + width}px;
								padding-left: ${44 + width}px;
								text-indent: calc(-${44 + width}px - -1rem);
							}
							${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.messagetimestamp} {
								width: ${width}px;
							}
						`);
					}
					 
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();