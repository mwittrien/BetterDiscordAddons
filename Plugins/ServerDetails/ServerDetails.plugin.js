/**
 * @name ServerDetails
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.4
 * @description Shows Server Details in the Server List Tooltip
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerDetails/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ServerDetails/ServerDetails.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ServerDetails",
			"author": "DevilBro",
			"version": "1.0.4",
			"description": "Shows Server Details in the Server List Tooltip"
		},
		"changeLog": {
			"fixed": {
				"New React Structure": "Fixed for new internal react structure"
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
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
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
		var _this, languages;
		var settings = {}, colors = {}, choices = {}, formats = {}, amounts = {};
	
		const GuildDetailsComponent = class GuildDetails extends BdApi.React.Component {
			constructor(props) {
				super(props);
				this.state = {fetchedOwner: false, delayed: false, repositioned: false};
			}
			componentDidUpdate() {
				if (amounts.tooltipDelay && this.state.delayed && !this.state.repositioned) {
					this.state.repositioned = true;
					let tooltip = BDFDB.DOMUtils.getParent(BDFDB.dotCN.tooltip, BDFDB.ObjectUtils.get(this, `${BDFDB.ReactUtils.instanceKey}.return.return.stateNode.containerInfo`));
					if (tooltip) tooltip.update();
				}
			}
			render() {
				if (amounts.tooltipDelay && !this.state.delayed) {
					BDFDB.TimeUtils.timeout(_ => {
						this.state.delayed = true;
						let tooltip = BDFDB.DOMUtils.getParent(BDFDB.dotCN.tooltip, BDFDB.ObjectUtils.get(this, `${BDFDB.ReactUtils.instanceKey}.return.return.stateNode.containerInfo`));
						if (tooltip) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN._serverdetailstooltip);
						BDFDB.ReactUtils.forceUpdate(this);
					}, amounts.tooltipDelay * 1000);
					return null;
				}
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
							prefix: _this.labels.creation_date,
							string: _this.getTimestamp(languages[choices.timeLang].id, BDFDB.LibraryModules.TimestampUtils.extractTimestamp(this.props.guild.id))
						}),
						settings.addJoin && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
							prefix: _this.labels.join_date,
							string: _this.getTimestamp(languages[choices.timeLang].id, this.props.guild.joinedAt)
						}),
						settings.addMembers && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
							prefix: BDFDB.LanguageUtils.LanguageStrings.MEMBERS,
							string: BDFDB.LibraryModules.MemberCountUtils.getMemberCount(this.props.guild.id)
						}),
						settings.addBoosters && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
							prefix: _this.labels.boosters,
							string: this.props.guild.premiumSubscriberCount
						}),
						settings.addChannels && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
							prefix: BDFDB.LanguageUtils.LanguageStrings.CHANNELS,
							string: BDFDB.LibraryModules.GuildChannelStore.getChannels(this.props.guild.id).count
						}),
						settings.addRoles && BDFDB.ReactUtils.createElement(GuildDetailsRowComponent, {
							prefix: BDFDB.LanguageUtils.LanguageStrings.ROLES,
							string: Object.keys(this.props.guild.roles).length
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
				return (this.props.prefix.length + this.props.string.length) > Math.round(34 * (amounts.tooltipWidth/300)) ? [
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
		
		return class ServerDetails extends Plugin {
			onLoad () {
				_this = this;
				
				this.defaults = {
					settings: {
						displayTime:		{value: false, 		cat: "settings",	description: "Display the Time in the Timestamp"},
						displayDate:		{value: true, 		cat: "settings",	description: "Display the Date in the Timestamp"},
						cutSeconds:			{value: false, 		cat: "settings",	description: "Cut off Seconds of the Time"},
						forceZeros:			{value: false, 		cat: "settings",	description: "Force leading Zeros"},
						otherOrder:			{value: false, 		cat: "settings",	description: "Show the Time before the Date"},
						useDateInDaysAgo:	{value: false, 		cat: "settings",	description: "Use the Date instead of 'x days ago' in $daysago Placeholder"},
						addIcon:			{value: true, 		cat: "tooltip",		description: "GUILD_CREATE_UPLOAD_ICON_LABEL"},
						addOwner:			{value: true, 		cat: "tooltip",		description: "GUILD_OWNER"},
						addCreation:		{value: true, 		cat: "tooltip",		description: "creation_date"},
						addJoin:			{value: true, 		cat: "tooltip",		description: "join_date"},
						addMembers:			{value: true, 		cat: "tooltip",		description: "MEMBERS"},
						addChannels:		{value: true, 		cat: "tooltip",		description: "CHANNELS"},
						addRoles:			{value: true, 		cat: "tooltip",		description: "ROLES"},
						addBoosters:		{value: true, 		cat: "tooltip",		description: "SUBSCRIPTIONS_TITLE"},
						addRegion:			{value: true, 		cat: "tooltip",		description: "REGION"}
					},
					colors: {
						tooltipColor:		{value: "", 					description: "Tooltip Color"}
					},
					choices: {
						timeLang:			{value: "$discord", 			description: "Date Format"}
					},
					formats: {
						ownFormat:			{value: "$hour: $minute: $second, $day.$month.$year", 	description: "Own Format"}
					},
					amounts: {
						tooltipDelay:		{value: 0,		cat: "tooltip",	 min: 0,	max: 10,	digits: 1,	unit: "s",	description: "Details Tooltip Delay"},
						tooltipWidth:		{value: 300,	cat: "tooltip",	 min: 200,	max: 600,	digits: 0,	unit: "px",	description: "Details Tooltip Width"},
						maxDaysAgo:			{value: 0,		cat: "format",	 min: 0,	description: "Maximum Count of Days displayed in the $daysago Placeholder",	note: "0 equals no Limit"}
					}
				};
			
				this.patchedModules = {
					after: {
						Guild: "render"
					}
				};
				
				this.patchPriority = 10;
				
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
						overflow: hidden;
					}
					${BDFDB.dotCN._serverdetailstooltip} div${BDFDB.dotCN._serverdetailsicon} {
						background-color: var(--background-primary);
						color: var(--text-normal);
						font-size: 40px;
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryComponents.GuildComponents.Guild.prototype, "render", {after: e => {
					this.processGuild({instance: e.thisObject, returnvalue: e.returnValue, methodname: "render"});
				}});

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
				
				BDFDB.DOMUtils.removeLocalStyle(this.name + "TooltipWidth");
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: Object.keys(settings).map(key => this.defaults.settings[key].cat == "settings" && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
							title: "Tooltip Settings",
							collapseStates: collapseStates,
							children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
								className: BDFDB.disCN.marginbottom4,
								tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
								children: "Add additional details in the server tooltip for: "
							})].concat(Object.keys(settings).map(key => this.defaults.settings[key].cat == "tooltip" && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["settings", key],
								label: this.labels[this.defaults.settings[key].description] || BDFDB.LanguageUtils.LanguageStrings[this.defaults.settings[key].description],
								value: settings[key]
							}))).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCN.marginbottom8
							})).concat(Object.keys(amounts).map(key => this.defaults.amounts[key].cat == "tooltip" && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Slider",
								plugin: this,
								keys: ["amounts", key],
								label: this.defaults.amounts[key].description,
								basis: "70%",
								min: this.defaults.amounts[key].min,
								max: this.defaults.amounts[key].max,
								digits: this.defaults.amounts[key].digits,
								markerAmount: 11,
								onValueRender: value => value + this.defaults.amounts[key].unit,
								childProps: {type: "number"},
								value: amounts[key]
							}))).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCN.marginbottom8
							})).concat(Object.keys(colors).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["colors", key],
								basis: "70%",
								label: this.defaults.colors[key].description,
								value: colors[key],
								childProps: {type: "color"},
								placeholder: colors[key]
							})))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Time Format",
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
							})).concat(Object.keys(amounts).map(key => this.defaults.amounts[key].cat == "format" && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["amounts", key],
								label: this.defaults.amounts[key].description,
								note: this.defaults.amounts[key].note,
								basis: "20%",
								min: this.defaults.amounts[key].min,
								max: this.defaults.amounts[key].max,
								childProps: {type: "number"},
								value: amounts[key]
							}))).filter(n => n)
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Placeholder Guide",
							dividerTop: true,
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
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				colors = BDFDB.DataUtils.get(this, "colors");
				choices = BDFDB.DataUtils.get(this, "choices");
				formats = BDFDB.DataUtils.get(this, "formats");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				
				let iconSize = amounts.tooltipWidth - 80;
				BDFDB.DOMUtils.appendLocalStyle(this.name + "TooltipWidth", `
					${BDFDB.dotCN._serverdetailstooltip} {
						width: ${amounts.tooltipWidth}px !important;
						max-width: unset !important;
					}
					${BDFDB.dotCNS._serverdetailstooltip + BDFDB.dotCN._serverdetailsicon} {
						width: ${iconSize > 0 ? iconSize : 30}px;
						height: ${iconSize > 0 ? iconSize : 30}px;
					}
				`);
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processGuild (e) {
				if (BDFDB.GuildUtils.is(e.instance.props.guild)) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["GuildTooltip", "BDFDB_TooltipContainer"]});
					if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, Object.assign({}, children[index].props, {
						tooltipConfig:  Object.assign({
							backgroundColor: colors.tooltipColor
						}, children[index].props.tooltipConfig, {
							className: !amounts.tooltipDelay && BDFDB.disCN._serverdetailstooltip,
							type: "right",
							guild: e.instance.props.guild,
							list: true,
							offset: 12
						}),
						text: _ => BDFDB.ReactUtils.createElement(GuildDetailsComponent, {
							guild: e.instance.props.guild
						})
					}));
				}
			}

			getTimestamp (languageId, time) {
				return BDFDB.StringUtils.formatTime(time, Object.assign({
					language: languageId,
					formatString: languageId == "own" && formats.ownFormat
				}, settings, amounts));
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
							boosters:							"Бустери",
							creation_date:						"Дата на създаване",
							join_date:							"Дата на присъединяване"
						};
					case "da":		// Danish
						return {
							boosters:							"Boosters",
							creation_date:						"Oprettelsesdato",
							join_date:							"Deltag i dato"
						};
					case "de":		// German
						return {
							boosters:							"Booster",
							creation_date:						"Erstellungsdatum",
							join_date:							"Beitrittsdatum"
						};
					case "el":		// Greek
						return {
							boosters:							"Ενισχυτές",
							creation_date:						"Ημερομηνία δημιουργίας",
							join_date:							"Ημερομηνία προσχώρησης"
						};
					case "es":		// Spanish
						return {
							boosters:							"Impulsores",
							creation_date:						"Fecha de creación",
							join_date:							"Fecha de Ingreso"
						};
					case "fi":		// Finnish
						return {
							boosters:							"Tehostimet",
							creation_date:						"Luomispäivä",
							join_date:							"Liittymispäivä"
						};
					case "fr":		// French
						return {
							boosters:							"Boosters",
							creation_date:						"Date de création",
							join_date:							"Date d'inscription"
						};
					case "hr":		// Croatian
						return {
							boosters:							"Pojačala",
							creation_date:						"Datum stvaranja",
							join_date:							"Datum pridruživanja"
						};
					case "hu":		// Hungarian
						return {
							boosters:							"Emlékeztetők",
							creation_date:						"Létrehozás dátuma",
							join_date:							"Csatlakozás dátuma"
						};
					case "it":		// Italian
						return {
							boosters:							"Booster",
							creation_date:						"Data di creazione",
							join_date:							"Data di iscrizione"
						};
					case "ja":		// Japanese
						return {
							boosters:							"ブースター",
							creation_date:						"作成日",
							join_date:							"参加日"
						};
					case "ko":		// Korean
						return {
							boosters:							"부스터",
							creation_date:						"제작 일",
							join_date:							"가입 날짜"
						};
					case "lt":		// Lithuanian
						return {
							boosters:							"Stiprintuvai",
							creation_date:						"Sukūrimo data",
							join_date:							"Įstojimo data"
						};
					case "nl":		// Dutch
						return {
							boosters:							"Boosters",
							creation_date:						"Aanmaakdatum",
							join_date:							"Toetredingsdatum"
						};
					case "no":		// Norwegian
						return {
							boosters:							"Boosters",
							creation_date:						"Opprettelsesdato",
							join_date:							"Bli med på dato"
						};
					case "pl":		// Polish
						return {
							boosters:							"Dopalacze",
							creation_date:						"Data utworzenia",
							join_date:							"Data dołączenia"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							boosters:							"Boosters",
							creation_date:						"Data de criação",
							join_date:							"Data de afiliação"
						};
					case "ro":		// Romanian
						return {
							boosters:							"Amplificatoare",
							creation_date:						"Data crearii",
							join_date:							"Data înscrierii"
						};
					case "ru":		// Russian
						return {
							boosters:							"Бустеры",
							creation_date:						"Дата создания",
							join_date:							"Дате вступления"
						};
					case "sv":		// Swedish
						return {
							boosters:							"Boosters",
							creation_date:						"Skapelsedagen",
							join_date:							"Gå med datum"
						};
					case "th":		// Thai
						return {
							boosters:							"บูสเตอร์",
							creation_date:						"วันที่สร้าง",
							join_date:							"วันที่เข้าร่วม"
						};
					case "tr":		// Turkish
						return {
							boosters:							"Güçlendiriciler",
							creation_date:						"Oluşturulma tarihi",
							join_date:							"Üyelik Tarihi"
						};
					case "uk":		// Ukrainian
						return {
							boosters:							"Підсилювачі",
							creation_date:						"Дата створення",
							join_date:							"Дата приєднання"
						};
					case "vi":		// Vietnamese
						return {
							boosters:							"Bộ tăng tốc",
							creation_date:						"Ngày thành lập",
							join_date:							"Ngày tham gia"
						};
					case "zh-CN":	// Chinese (China)
						return {
							boosters:							"助推器",
							creation_date:						"创建日期",
							join_date:							"参加日期"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							boosters:							"助推器",
							creation_date:						"創建日期",
							join_date:							"參加日期"
						};
					default:		// English
						return {
							boosters:							"Boosters",
							creation_date:						"Creation Date",
							join_date:							"Join Date"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();