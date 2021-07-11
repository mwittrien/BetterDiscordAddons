/**
 * @name Translator
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.2.9
 * @description Allows you to translate Messages and your outgoing Messages within Discord
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/Translator/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/Translator/Translator.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "Translator",
			"author": "DevilBro",
			"version": "2.2.9",
			"description": "Allows you to translate Messages and your outgoing Messages within Discord"
		},
		"changeLog": {
			"improved": {
				"Plugin Name": "Changed to clarify the Usage"
			}
		}
	};
	
	return (window.Lightcord || window.LightCord) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		var _this;
		
		const translateIconGeneral = `<svg name="Translate" width="24" height="24" viewBox="0 0 24 24"><mask/><path fill="currentColor" mask="url(#translateIconMask)" d="M 4 2 C 2.9005593 2 2 2.9005593 2 4 L 2 17 C 2 18.10035 2.9005593 19 4 19 L 11 19 L 12 22 L 20 22 C 21.10035 22 22 21.099441 22 20 L 22 7 C 22 5.9005592 21.099441 5 20 5 L 10.880859 5 L 10 2 L 4 2 z M 11.173828 6 L 20 6 C 20.550175 6 21 6.4498249 21 7 L 21 20 C 21 20.550175 20.550176 21 20 21 L 13 21 L 15 19 L 14.185547 16.236328 L 15.105469 15.314453 L 17.791016 18 L 18.521484 17.269531 L 15.814453 14.583984 C 16.714739 13.54911 17.414914 12.335023 17.730469 11.080078 L 19 11.080078 L 19 10.039062 L 15.365234 10.039062 L 15.365234 9 L 14.324219 9 L 14.324219 10.039062 L 12.365234 10.039062 L 11.173828 6 z M 7.1660156 6.4160156 C 8.2063466 6.4160156 9.1501519 6.7857022 9.9003906 7.4804688 L 9.9648438 7.5449219 L 8.7441406 8.7246094 L 8.6855469 8.6699219 C 8.4009108 8.3998362 7.9053417 8.0859375 7.1660156 8.0859375 C 5.8555986 8.0859375 4.7890625 9.1708897 4.7890625 10.505859 C 4.7890625 11.84083 5.8555986 12.925781 7.1660156 12.925781 C 8.5364516 12.925781 9.1309647 12.050485 9.2910156 11.464844 L 7.0800781 11.464844 L 7.0800781 9.9160156 L 11.03125 9.9160156 L 11.044922 9.984375 C 11.084932 10.194442 11.099609 10.379777 11.099609 10.589844 C 11.094109 12.945139 9.4803883 14.583984 7.1660156 14.583984 C 4.9107525 14.583984 3.0800781 12.749807 3.0800781 10.5 C 3.0800781 8.2501934 4.9162088 6.4160156 7.1660156 6.4160156 z M 12.675781 11.074219 L 16.669922 11.074219 C 16.669922 11.074219 16.330807 12.390095 15.111328 13.810547 C 14.576613 13.195806 14.206233 12.595386 13.970703 12.115234 L 12.980469 12.115234 L 12.675781 11.074219 z M 13.201172 12.884766 C 13.535824 13.484957 13.940482 14.059272 14.390625 14.583984 L 13.855469 15.115234 L 13.201172 12.884766 z"/><extra/></svg>`;
		const translateIconMask = `<mask id="translateIconMask" fill="black"><path fill="white" d="M 0 0 H 24 V 24 H 0 Z"/><path fill="black" d="M24 12 H 12 V 24 H 24 Z"/></mask>`;
		const translateIcon = translateIconGeneral.replace(`<extra/>`, ``).replace(`<mask/>`, ``).replace(` mask="url(#translateIconMask)"`, ``);
		const translateIconUntranslate = translateIconGeneral.replace(`<extra/>`, `<path fill="none" stroke="#f04747" stroke-width="2" d="m 14.702359,14.702442 8.596228,8.596148 m 0,-8.597139 -8.59722,8.596147 z"/>`).replace(`<mask/>`, translateIconMask);
		
		const TranslateButtonComponent = class TranslateButton extends BdApi.React.Component {
			render() {
				const enabled = _this.isTranslationEnabled(this.props.channelId);
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ChannelTextAreaButton, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._translatortranslatebutton, _this.isTranslationEnabled(this.props.channelId) && BDFDB.disCN._translatortranslating, BDFDB.disCN.textareapickerbutton),
					isActive: this.props.isActive,
					iconSVG: translateIcon,
					nativeClass: true,
					tooltip: enabled && {
						text: (_ => `${BDFDB.LanguageUtils.getName(languages[_this.getLanguageChoice(languageTypes.INPUT, messageTypes.SENT, this.props.channelId)])} ➝ ${BDFDB.LanguageUtils.getName(languages[_this.getLanguageChoice(languageTypes.OUTPUT, messageTypes.SENT, this.props.channelId)])}`),
						tooltipConfig: {style: "max-width: 400px"}
					},
					onClick: _ => {
						this.props.isActive = true;
						BDFDB.ReactUtils.forceUpdate(this);
						
						BDFDB.ModalUtils.open(_this, {
							size: "LARGE",
							header: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
							subHeader: "",
							onClose: _ => {
								this.props.isActive = false;
								BDFDB.ReactUtils.forceUpdate(this);
							},
							children: BDFDB.ReactUtils.createElement(TranslateSettingsComponent, {
								channelId: this.props.channelId
							})
						});
					},
					onContextMenu: _ => {
						_this.toggleTranslation(this.props.channelId);
						BDFDB.ReactUtils.forceUpdate(this);
					}
				});
			}
		};
		
		const TranslateSettingsComponent = class TranslateSettings extends BdApi.React.Component {
			filterLanguages(direction, place) {
				let isOutput = direction == languageTypes.OUTPUT;
				return BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(isOutput ? BDFDB.ObjectUtils.filter(languages, lang => !lang.auto) : languages, (lang, id) => ({
					value: id,
					label: BDFDB.LanguageUtils.getName(lang),
					backup: this.isOnlyBackup(lang)
				}))).filter(isOutput && this.isOnlyBackup(languages[_this.getLanguageChoice(languageTypes.INPUT, place, this.props.channelId)]) ? (n => n.backup) : (n => n));
			}
			isOnlyBackup(lang) {
				return lang && (lang.auto && !translationEngines[_this.settings.engines.translator].auto || !lang.auto && !lang.special && !translationEngines[_this.settings.engines.translator].languages.includes(lang.id));
			}
			render() {
				return [
					BDFDB.ArrayUtils.is(_this.settings.exceptions.wordStart) && _this.settings.exceptions.wordStart.length && [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCN.marginbottom8,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
								label: `Words starting with ${_this.settings.exceptions.wordStart.map(n => '"' + n + '"').join(", ")} will be ignored`
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCN.marginbottom8
						})
					],
					Object.keys(_this.defaults.choices).map(place => {
						const isSpecific = channelLanguages[this.props.channelId] && channelLanguages[this.props.channelId][place];
						return Object.keys(_this.defaults.choices[place].value).map(direction => [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: `${BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(direction.toLowerCase())} Language in ${place.toLowerCase()} Messages: `,
								titleChildren: direction == languageTypes.OUTPUT && [{
									text: _ => isSpecific ? `${BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(place)} Language Selection will be changed specifically for this Channel` : `${BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(place)} Language Selection will be changed for all Channels`,
									name: isSpecific ? BDFDB.LibraryComponents.SvgIcon.Names.LOCK_CLOSED : BDFDB.LibraryComponents.SvgIcon.Names.LOCK_OPEN,
									color: isSpecific && "var(--bdfdb-red)",
									onClick: _ => {
										if (channelLanguages[this.props.channelId] && channelLanguages[this.props.channelId][place]) {
											delete channelLanguages[this.props.channelId][place];
											if (BDFDB.ObjectUtils.isEmpty(channelLanguages[this.props.channelId])) delete channelLanguages[this.props.channelId];
										}
										else {
											if (!channelLanguages[this.props.channelId]) channelLanguages[this.props.channelId] = {};
											channelLanguages[this.props.channelId][place] = {};
											for (let l in languageTypes) channelLanguages[this.props.channelId][place][languageTypes[l]] = _this.getLanguageChoice(languageTypes[l], place, null);
										}
										BDFDB.DataUtils.save(channelLanguages, _this, "channelLanguages");
										
										BDFDB.ReactUtils.forceUpdate(this);
									}
								}, {
									iconSVG: `<svg width="21" height="21" fill="currentColor"><path d="M 0, 10.515 c 0, 2.892, 1.183, 5.521, 3.155, 7.361 L 0, 21.031 h 7.887 V 13.144 l -2.892, 2.892 C 3.549, 14.722, 2.629, 12.75, 2.629, 10.515 c 0 -3.418, 2.235 -6.309, 5.258 -7.492 v -2.629 C 3.418, 1.577, 0, 5.652, 0, 10.515 z M 21.031, 0 H 13.144 v 7.887 l 2.892 -2.892 C 17.482, 6.309, 18.402, 8.281, 18.402, 10.515 c 0, 3.418 -2.235, 6.309 -5.258, 7.492 V 20.768 c 4.469 -1.183, 7.887 -5.258, 7.887 -10.121 c 0 -2.892 -1.183 -5.521 -3.155 -7.361 L 21.031, 0 z"/></svg>`,
									onClick: _ => {
										let input = _this.getLanguageChoice(languageTypes.INPUT, place, this.props.channelId);
										let output = _this.getLanguageChoice(languageTypes.OUTPUT, place, this.props.channelId);
										input = input == "auto" ? "en" : input;
										
										_this.saveLanguageChoice(output, languageTypes.INPUT, place, this.props.channelId);
										_this.saveLanguageChoice(input, languageTypes.OUTPUT, place, this.props.channelId);
										
										_this.setLanguages();
										
										BDFDB.ReactUtils.forceUpdate(this);
									}
								}].map(data => {
									const icon = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
										className: BDFDB.disCN._translatorconfigbutton,
										onClick: data.onClick,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
											width: 24,
											height: 24,
											color: data.color || "currentColor",
											name: data.name,
											iconSVG: data.iconSVG
										})
									});
									return data.text ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {text: data.text, children: icon}) : icon;
								}),
								className: BDFDB.disCN.marginbottom8,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
									value: _this.getLanguageChoice(direction, place, this.props.channelId),
									options: this.filterLanguages(direction, place),
									optionRenderer: lang => languages[lang.value] ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 1,
												children: lang.label
											}),
											lang.backup && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
												text: "Will use Backup Translator",
												tooltipConfig: {
													color: "red"
												},
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													nativeClass: true,
													width: 20,
													height: 20,
													color: "var(--bdfdb-red)",
													name: BDFDB.LibraryComponents.SvgIcon.Names.WARNING
												})
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
												isFavorite: languages[lang.value].fav == 0,
												onClick: value => {
													if (value) favorites.push(lang.value);
													else BDFDB.ArrayUtils.remove(favorites, lang.value, true);
													BDFDB.DataUtils.save(favorites.sort(), _this, "favorites");
													_this.setLanguages();
												}
											})
										]
									}) : null,
									onChange: value => {
										_this.saveLanguageChoice(value, direction, place, this.props.channelId);
										BDFDB.ReactUtils.forceUpdate(this);
									}
								})
							}),
							direction == languageTypes.OUTPUT && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCN.marginbottom8
							})
						]);
					}),
					Object.keys(_this.defaults.engines).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: _this.defaults.engines[key].description,
						className: BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
							value: _this.settings.engines[key],
							options: (key == "backup" ? ["----"] : []).concat(Object.keys(translationEngines)).filter(key == "backup" ? (n => n != _this.settings.engines.translator) : (n => n)).map(engineKey => ({value: engineKey, label: translationEngines[engineKey] ? translationEngines[engineKey].name : "----"})),
							maxVisibleItems: 3,
							onChange: value => {
								_this.settings.engines[key] = value;
								BDFDB.DataUtils.save(_this.settings.engines, _this, "engines");
								_this.setLanguages();
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					})),
					Object.keys(_this.defaults.general).filter(key => _this.defaults.general[key].popout).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: _this,
						keys: ["general", key],
						label: _this.defaults.general[key].description,
						tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
						value: _this.settings.general[key]
					})),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Switch",
						label: "Translate your Messages before sending",
						tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
						value: _this.isTranslationEnabled(this.props.channelId),
						onChange: value => {
							_this.toggleTranslation(this.props.channelId);
							BDFDB.ReactUtils.forceUpdate(this);
						}
					})
				].flat(10).filter(n => n);
			}
		};

		const brailleConverter = {
			"0":"⠴", "1":"⠂", "2":"⠆", "3":"⠒", "4":"⠲", "5":"⠢", "6":"⠖", "7":"⠶", "8":"⠦", "9":"⠔", "!":"⠮", "\"":"⠐", "#":"⠼", "$":"⠫", "%":"⠩", "&":"⠯", "'":"⠄", "(":"⠷", ")":"⠾", "*":"⠡", "+":"⠬", ",":"⠠", "-":"⠤", ".":"⠨", "/":"⠌", ":":"⠱", ";":"⠰", "<":"⠣", "=":"⠿", ">":"⠜", "?":"⠹", "@":"⠈", "a":"⠁", "b":"⠃", "c":"⠉", "d":"⠙", "e":"⠑", "f":"⠋", "g":"⠛", "h":"⠓", "i":"⠊", "j":"⠚", "k":"⠅", "l":"⠇", "m":"⠍", "n":"⠝", "o":"⠕", "p":"⠏", "q":"⠟", "r":"⠗", "s":"⠎", "t":"⠞", "u":"⠥", "v":"⠧", "w":"⠺", "x":"⠭", "y":"⠽", "z":"⠵", "[":"⠪", "\\":"⠳", "]":"⠻", "^":"⠘", "⠁":"a", "⠂":"1", "⠃":"b", "⠄":"'", "⠅":"k", "⠆":"2", "⠇":"l", "⠈":"@", "⠉":"c", "⠊":"i", "⠋":"f", "⠌":"/", "⠍":"m", "⠎":"s", "⠏":"p", "⠐":"\"", "⠑":"e", "⠒":"3", "⠓":"h", "⠔":"9", "⠕":"o", "⠖":"6", "⠗":"r", "⠘":"^", "⠙":"d", "⠚":"j", "⠛":"g", "⠜":">", "⠝":"n", "⠞":"t", "⠟":"q", "⠠":", ", "⠡":"*", "⠢":"5", "⠣":"<", "⠤":"-", "⠥":"u", "⠦":"8", "⠧":"v", "⠨":".", "⠩":"%", "⠪":"[", "⠫":"$", "⠬":"+", "⠭":"x", "⠮":"!", "⠯":"&", "⠰":";", "⠱":":", "⠲":"4", "⠳":"\\", "⠴":"0", "⠵":"z", "⠶":"7", "⠷":"(", "⠸":"_", "⠹":"?", "⠺":"w", "⠻":"]", "⠼":"#", "⠽":"y", "⠾":")", "⠿":"=", "_":"⠸"
		};

		const morseConverter = {
			"0":"−−−−−", "1":"·−−−−", "2":"··−−−", "3":"···−−", "4":"····−", "5":"·····", "6":"−····", "7":"−−···", "8":"−−−··", "9":"−−−−·", "!":"−·−·−−", "\"":"·−··−·", "$":"···−··−", "&":"·−···", "'":"·−−−−·", "(":"−·−−·", ")":"−·−−·−", "+":"·−·−·", ",":"−−··−−", "-":"−····−", ".":"·−·−·−", "/":"−··−·", ":":"−−−···", ";":"−·−·−·", "=":"−···−", "?":"··−−··", "@":"·−−·−·", "a":"·−", "b":"−···", "c":"−·−·", "d":"−··", "e":"·", "f":"··−·", "g":"−−·", "h":"····", "i":"··", "j":"·−−−", "k":"−·−", "l":"·−··", "m":"−−", "n":"−·", "o":"−−−", "p":"·−−·", "q":"−−·−", "r":"·−·", "s":"···", "t":"−", "u":"··−", "v":"···−", "w":"·−−", "x":"−··−", "y":"−·−−", "z":"−−··", "·":"e", "··":"i", "···":"s", "····":"h", "·····":"5", "····−":"4", "···−":"v", "···−··−":"$", "···−−":"3", "··−":"u", "··−·":"f", "··−−··":"?", "··−−·−":"_", "··−−−":"2", "·−":"a", "·−·":"r", "·−··":"l", "·−···":"&", "·−··−·":"\"", "·−·−·":"+", "·−·−·−":".", "·−−":"w", "·−−·":"p", "·−−·−·":"@", "·−−−":"j", "·−−−−":"1", "·−−−−·":"'", "−":"t", "−·":"n", "−··":"d", "−···":"b", "−····":"6", "−····−":"-", "−···−":"=", "−··−":"x", "−··−·":"/", "−·−":"k", "−·−·":"c", "−·−·−·":";", "−·−·−−":"!", "−·−−":"y", "−·−−·":"(", "−·−−·−":")", "−−":"m", "−−·":"g", "−−··":"z", "−−···":"7", "−−··−−":",", "−−·−":"q", "−−−":"o", "−−−··":"8", "−−−···":":", "−−−−·":"9", "−−−−−":"0", "_":"··−−·−"
		};
		
		const googleLanguages = ["af","am","ar","az","be","bg","bn","bs","ca","ceb","co","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fr","fy","ga","gd","gl","gu","ha","haw","hi","hmn","hr","ht","hu","hy","id","ig","is","it","iw","ja","jw","ka","kk","km","kn","ko","ku","ky","la","lb","lo","lt","lv","mg","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","ny","or","pa","pl","ps","pt","ro","ru","rw","sd","si","sk","sl","sm","sn","so","sq","sr","st","su","sv","sw","ta","te","tg","th","tk","tl","tr","tt","ug","uk","ur","uz","vi","xh","yi","yo","zh-CN","zu"];
		const translationEngines = {
			googleapi: {
				name: "Google",
				auto: true,
				funcName: "googleApiTranslate",
				languages: googleLanguages
			},
			deepl: {
				name: "DeepL",
				auto: true,
				funcName: "deepLTranslate",
				languages: ["bg","cs","da","de","en","el","es","et","fi","fr","hu","it","ja","lt","lv","nl","pl","pt","ro","ru","sk","sl","sv","zh"],
				key: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
			},
			itranslate: {
				name: "iTranslate",
				auto: true,
				funcName: "iTranslateTranslate",
				languages: [...new Set(["af","ar","az","be","bg","bn","bs","ca","ceb","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fil","fr","ga","gl","gu","ha","he","hi","hmn","hr","ht","hu","hy","id","ig","is","it","ja","jw","ka","kk","km","kn","ko","la","lo","lt","lv","mg","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","ny","pa","pl","pt-BR","pt-PT","ro","ru","si","sk","sl","so","sq","sr","st","su","sv","sw","ta","te","tg","th","tr","uk","ur","uz","vi","we","yi","yo","zh-CN","zh-TW","zu"].concat(googleLanguages))].sort(),
				key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
			},
			yandex: {
				name: "Yandex",
				auto: true,
				funcName: "yandexTranslate",
				languages: ["af","am","ar","az","ba","be","bg","bn","bs","ca","ceb","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fr","ga","gd","gl","gu","he","hi","hr","ht","hu","hy","id","is","it","ja","jv","ka","kk","km","kn","ko","ky","la","lb","lo","lt","lv","mg","mhr","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","pa","pap","pl","pt","ro","ru","si","sk","sl","sq","sr","su","sv","sw","ta","te","tg","th","tl","tr","tt","udm","uk","ur","uz","vi","xh","yi","zh"],
				key: "trnsl.x.x.xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
			},
			papago: {
				name: "Papago",
				auto: false,
				funcName: "papagoTranslate",
				languages: ["en","es","fr","id","ja","ko","th","vi","zh-CN","zh-TW"],
				key: "xxxxxxxxxxxxxxxxxxxx xxxxxxxxxx"
			}
		};
		
		var languages = {};
		var favorites = [];
		var authKeys = {};
		var channelLanguages = {};
		var translationEnabledStates = [], isTranslating;
		var translatedMessages = {}, oldMessages = {};
		
		const defaultLanguages = {
			INPUT: "auto",
			OUTPUT: "$discord"
		};
		const languageTypes = {
			INPUT: "input",
			OUTPUT: "output"
		};
		const messageTypes = {
			RECEIVED: "received",
			SENT: "sent",
		};
	
		return class Translator extends Plugin {
			onLoad () {
				_this = this;
				
				this.defaults = {
					general: {
						addTranslateButton:		{value: true, 	popout: false,	description: "Adds a Translate Button to the Channel Textarea"},
						usePerChatTranslation:	{value: true, 	popout: false,	description: "Enables/Disables the Translator Button State per Channel and not globally"},
						sendOriginalMessage:	{value: false, 	popout: true,	description: "Also sends the original Message when translating your own Message"},
						showOriginalMessage:	{value: false, 	popout: true,	description: "Also shows the original Message when translating someones Message"}
					},
					choices: {},
					exceptions: {
						wordStart:				{value: ["!"],			max: 1,		description: "Words starting with any of these will be ignored"}
					},
					engines: {
						translator:				{value: "googleapi", 	description: "Translation Engine"},
						backup:					{value: "----", 		description: "Backup Engine"}
					}
				};
				for (let m in messageTypes) this.defaults.choices[messageTypes[m]] = {value: Object.keys(languageTypes).reduce((newObj, l) => (newObj[languageTypes[l]] = defaultLanguages[l], newObj), {})};
			
				this.patchedModules = {
					before: {
						ChannelTextAreaForm: "render",
						ChannelEditorContainer: "render",
						Embed: "render"
					},
					after: {
						ChannelTextAreaContainer: "render",
						Messages: "type",
						MessageContent: "type",
						Embed: "render"
					}
				};

				this.css = `
					${BDFDB.dotCN._translatortranslatebutton + BDFDB.dotCNS._translatortranslating + BDFDB.dotCN.textareaicon} {
						color: var(--bdfdb-red) !important;
					}
					${BDFDB.dotCN._translatorconfigbutton} {
						margin: 2px 3px 0 6px;
					}
				`;
			}
			
			onStart () {
				// REMOVE 25.05.2021
				let loadedFavorites = BDFDB.DataUtils.load(this, "favorites");
				if (BDFDB.ObjectUtils.is(loadedFavorites) && Object.keys(loadedFavorites).length) BDFDB.DataUtils.save(Object.keys(loadedFavorites), this, "favorites")
				
				
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Own Auth Keys:",
							children: Object.keys(translationEngines).filter(key => translationEngines[key].key).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "TextInput",
								basis: "75%",
								label: translationEngines[key].name,
								placeholder: translationEngines[key].key,
								value: authKeys[key],
								onChange: value => BDFDB.DataUtils.save((value || "").trim(), this, "authKeys", key)
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
						}));
						
						for (let key in this.defaults.exceptions) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.defaults.exceptions[key].description,
							className: BDFDB.disCN.marginbottom8,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListInput, {
								placeholder: "New Exception",
								maxLength: this.defaults.exceptions[key].max,
								items: this.settings.exceptions[key],
								onChange: value => {
									this.SettingsUpdated = true;
									BDFDB.DataUtils.save(value, this, "exceptions", key);
								}
							})
						}));
						
						return settingsItems.flat(10);
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
				favorites = BDFDB.DataUtils.load(this, "favorites");
				favorites = !BDFDB.ArrayUtils.is(favorites) ? [] : favorites;
				
				authKeys = BDFDB.DataUtils.load(this, "authKeys");
				channelLanguages = BDFDB.DataUtils.load(this, "channelLanguages");
				
				this.setLanguages();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let translated = translatedMessages[e.instance.props.message.id];
					let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Translate_Message") : null;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
					if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["edit", "add-reaction", "quote"]});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
						hint: hint && (_ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							});
						}),
						disabled: !translated && isTranslating,
						action: _ => this.translateMessage(e.instance.props.message, e.instance.props.channel)
					}));
					this.injectSearchItem(e);
				}
			}
			
			onNativeContextMenu (e) {
				this.injectSearchItem(e);
			}
			
			onSlateContextMenu (e) {
				this.injectSearchItem(e);
			}
			
			injectSearchItem (e) {
				let text = document.getSelection().toString();
				if (text) {
					let translating, foundTranslation, foundInput, foundOutput;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["devmode-copy-id", "search-google"], group: true});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search-translation"),
							disabled: isTranslating,
							label: this.labels.context_translator,
							persisting: true,
							action: event => {
								let item = BDFDB.DOMUtils.getParent(BDFDB.dotCN.menuitem, event.target);
								if (item) {
									let createTooltip = _ => {
										BDFDB.TooltipUtils.create(item, [
											`${BDFDB.LanguageUtils.LibraryStrings.from} ${foundInput.name}:`,
											text,
											`${BDFDB.LanguageUtils.LibraryStrings.to} ${foundOutput.name}:`,
											foundTranslation
										].map(n => BDFDB.ReactUtils.createElement("div", {children: n})), {
											type: "right",
											color: "black",
											className: "googletranslate-tooltip"
										});
									};
									if (foundTranslation && foundInput && foundOutput) {
										if (document.querySelector(".googletranslate-tooltip")) {
											BDFDB.ContextMenuUtils.close(e.instance);
											BDFDB.DiscordUtils.openLink(this.getGoogleTranslatePageURL(foundInput.id, foundOutput.id, text));
										}
										else createTooltip();
									}
									else if (!translating) {
										translating = true;
										this.translateText(text, messageTypes.RECEIVED, (translation, input, output) => {
											if (translation) {
												foundTranslation = translation, foundInput = input, foundOutput = output;
												createTooltip();
											}
										});
									}
								}
							}
						})
					}));
				}
			}
			
			onMessageOptionContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let translated = !!translatedMessages[e.instance.props.message.id];
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
					children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
						disabled: isTranslating,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
						icon: _ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: translated ? translateIconUntranslate : translateIcon
							});
						},
						action: _ => this.translateMessage(e.instance.props.message, e.instance.props.channel)
					}));
				}
			}
		
			onMessageOptionToolbar (e) {
				if (e.instance.props.expanded && e.instance.props.message && e.instance.props.channel) {
					let translated = !!translatedMessages[e.instance.props.message.id];
					e.returnvalue.props.children.unshift();
					e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(class extends BdApi.React.Component {
						render() {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								key: translated ? "untranslate-message" : "translate-message",
								text: _ => translated ? _this.labels.context_messageuntranslateoption : _this.labels.context_messagetranslateoption,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
									className: BDFDB.disCN.messagetoolbarbutton,
									onClick: _ => {
										if (!isTranslating) _this.translateMessage(e.instance.props.message, e.instance.props.channel).then(_ => {
											translated = !!translatedMessages[e.instance.props.message.id];
											BDFDB.ReactUtils.forceUpdate(this);
										});
									},
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
										className: BDFDB.disCN.messagetoolbaricon,
										iconSVG: translated ? translateIconUntranslate : translateIcon
									})
								})
							});
						}
					}));
				}
			}
			
			processChannelTextAreaForm (e) {
				BDFDB.PatchUtils.patch(this, e.instance, "handleSendMessage", {instead: e2 => {
					if (this.isTranslationEnabled(e.instance.props.channel.id)) {
						e2.stopOriginalMethodCall();
						this.translateText(e2.methodArguments[0], messageTypes.SENT, (translation, input, output) => {
							translation = !translation ? e2.methodArguments[0] : (this.settings.general.sendOriginalMessage ? (e2.methodArguments[0] + "\n\n" + translation) : translation);
							e2.originalMethod(translation);
						});
						return Promise.resolve({
							shouldClear: true,
							shouldRefocus: true
						});
					}
					else return e2.callOriginalMethodAfterwards();
				}}, {force: true, noCache: true});
			}

			processChannelEditorContainer (e) {
				if (this.isTranslationEnabled(e.instance.props.channel.id) && isTranslating) e.instance.props.disabled = true;
			}
			
			processChannelTextAreaContainer (e) {
				if (this.settings.general.addTranslateButton) {
					let editor = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ChannelEditorContainer"});
					if (editor && editor.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && !editor.props.disabled) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.textareapickerbuttons]]});
						if (index > -1 && children[index].props && children[index].props.children) children[index].props.children.unshift(BDFDB.ReactUtils.createElement(TranslateButtonComponent, {
							channelId: e.instance.props.channel.id
						}));
					}
				}
			}

			processMessages (e) {
				e.returnvalue.props.children.props.channelStream = [].concat(e.returnvalue.props.children.props.channelStream);
				for (let i in e.returnvalue.props.children.props.channelStream) {
					let message = e.returnvalue.props.children.props.channelStream[i].content;
					if (message) {
						if (BDFDB.ArrayUtils.is(message.attachments)) this.checkMessage(e.returnvalue.props.children.props.channelStream[i], message);
						else if (BDFDB.ArrayUtils.is(message)) for (let j in message) {
							let childMessage = message[j].content;
							if (childMessage && BDFDB.ArrayUtils.is(childMessage.attachments)) this.checkMessage(message[j], childMessage);
						}
					}
				}
			}
			
			checkMessage (stream, message) {
				let translation = translatedMessages[message.id];
				if (translation) stream.content.content = translation.content;
				else if (oldMessages[message.id] && Object.keys(message).some(key => !BDFDB.equals(oldMessages[message.id][key], message[key]))) {
					stream.content.content = oldMessages[message.id].content;
					delete oldMessages[message.id];
				}
			}

			processMessageContent (e) {
				if (e.instance.props.message) {
					let translation = translatedMessages[e.instance.props.message.id];
					if (translation && translation.content) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: `${BDFDB.LanguageUtils.getName(translation.input)} ➝ ${BDFDB.LanguageUtils.LibraryStrings.to} ${BDFDB.LanguageUtils.getName(translation.output)}`,
						tooltipConfig: {style: "max-width: 400px"},
						children: BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messagetimestamp, BDFDB.disCN.messagetimestampinline, BDFDB.disCN._translatortranslated),
							children: BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.disCN.messageedited,
								children: `(${this.labels.translated_watermark})`
							})
						})
					}));
				}
			}

			processEmbed (e) {
				if (e.instance.props.embed && e.instance.props.embed.message_id) {
					let translation = translatedMessages[e.instance.props.embed.message_id];
					if (translation && Object.keys(translation.embeds).length) {
						if (!e.returnvalue) e.instance.props.embed = Object.assign({}, e.instance.props.embed, {
							rawDescription: translation.embeds[e.instance.props.embed.id],
							originalDescription: e.instance.props.embed.originalDescription || e.instance.props.embed.rawDescription
						});
						else {
							let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.embeddescription]]});
							if (index > -1) children[index].props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: `${BDFDB.LanguageUtils.getName(translation.input)} ➝ ${BDFDB.LanguageUtils.getName(translation.output)}`,
								tooltipConfig: {style: "max-width: 400px"},
								children: BDFDB.ReactUtils.createElement("span", {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messagetimestamp, BDFDB.disCN.messagetimestampinline, BDFDB.disCN._translatortranslated),
									children: BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.messageedited,
										children: `(${this.labels.translated_watermark})`
									})
								})
							}));
						}
					}
					else if (!e.returnvalue && e.instance.props.embed.originalDescription) {
						e.instance.props.embed = Object.assign({}, e.instance.props.embed, {rawDescription: e.instance.props.embed.originalDescription});
						delete e.instance.props.embed.originalDescription;
					}
				}
			}
			
			toggleTranslation (channelId) {
				if (!this.isTranslationEnabled(channelId)) translationEnabledStates.push(this.settings.general.usePerChatTranslation ? channelId : "global");
				else BDFDB.ArrayUtils.remove(translationEnabledStates, this.settings.general.usePerChatTranslation ? channelId : "global", true);
			}
			
			isTranslationEnabled (channelId) {
				return translationEnabledStates.includes(this.settings.general.usePerChatTranslation ? channelId : "global");
			}

			setLanguages () {
				if (this.settings.engines.translator == this.settings.engines.backup) {
					this.settings.engines.backup = Object.keys(translationEngines).filter(n => n != this.settings.engines.translator)[0];
					BDFDB.DataUtils.save(this.settings.engines, this, "engines");
				}
				let engine = translationEngines[this.settings.engines.translator] || {};
				let backup = translationEngines[this.settings.engines.backup] || {};
				let languageIds = [].concat(engine.languages, backup.languages).flat(10).filter(n => n);
				languages = BDFDB.ObjectUtils.deepAssign(
					!engine.auto && !backup.auto ? {} : {
						auto: {
							auto: true,
							name: "Detect Language",
							id: "auto"
						}
					},
					BDFDB.ObjectUtils.filter(BDFDB.LanguageUtils.languages, lang => languageIds.includes(lang.id)),
					{
						binary:	{
							special: true,
							name: "Binary",
							id: "binary"
						},
						braille: {
							special: true,
							name: "Braille 6-dot",
							id: "braille"
						},
						morse: {
							special: true,
							name: "Morse",
							id: "morse"
						}
					}
				);
				for (let id in languages) languages[id].fav = favorites.includes(id) ? 0 : 1;
				languages = BDFDB.ObjectUtils.sort(languages, "fav");
			}

			getLanguageChoice (direction, place, channelId) {
				this.setLanguages();
				let choice;
				if (channelLanguages[channelId] && channelLanguages[channelId][place]) choice = channelLanguages[channelId][place][direction];
				else choice = this.settings.choices[place] && this.settings.choices[place][direction];
				choice = languages[choice] ? choice : Object.keys(languages)[0];
				choice = direction == languageTypes.OUTPUT && choice == "auto" ? "en" : choice;
				return choice;
			}

			saveLanguageChoice (choice, direction, place, channelId) {
				if (channelLanguages[channelId] && channelLanguages[channelId][place]) {
					channelLanguages[channelId][place][direction] = choice;
					BDFDB.DataUtils.save(channelLanguages, this, "channelLanguages");
				}
				else {
					this.settings.choices[place][direction] = choice;
					BDFDB.DataUtils.save(this.settings.choices, this, "choices");
				}
			}

			translateMessage (message, channel) {
				return new Promise(callback => {
					if (!message) return callback(null);
					if (translatedMessages[message.id]) {
						delete translatedMessages[message.id];
						BDFDB.MessageUtils.rerenderAll(true);
						callback(false);
					}
					else {
						let orignalContent = message.content || "";
						for (let embed of message.embeds) orignalContent += ("\n__________________ __________________ __________________\n" + embed.rawDescription);
						this.translateText(orignalContent, messageTypes.RECEIVED, (translation, input, output) => {
							if (translation) {
								oldMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
								let oldStrings = orignalContent.split(/\n{0,1}__________________ __________________ __________________\n{0,1}/);
								let strings = translation.split(/\n{0,1}__________________ __________________ __________________\n{0,1}/);
								let oldContent = this.settings.general.showOriginalMessage && (oldStrings.shift() || "").trim();
								let content = (strings.shift() || "").trim() + (oldContent ? `\n\n${oldContent}` : "");
								let embeds = {};
								for (let i in message.embeds) {
									message.embeds[i].message_id = message.id;
									let oldEmbedString = this.settings.general.showOriginalMessage && (oldStrings.shift() || "").trim();
									embeds[message.embeds[i].id] = (strings.shift() || message.embeds[i].rawDescription).trim() + (oldEmbedString ? `\n\n${oldEmbedString}` : "");
								}
								translatedMessages[message.id] = {content, embeds, input, output};
								BDFDB.MessageUtils.rerenderAll(true);
							}
							callback(true);
						});
					}
				});
			}

			translateText (text, place, callback) {
				let toast = null, toastInterval, finished = false, finishTranslation = translation => {
					isTranslating = false;
					if (toast) toast.close();
					BDFDB.TimeUtils.clear(toastInterval);
					
					if (finished) return;
					finished = true;
					if (translation) translation = this.addExceptions(translation, excepts);
					callback(translation == text ? "" : translation, input, output);
				};
				let [newText, excepts, translate] = this.removeExceptions(text.trim(), place);
				let channelId = BDFDB.LibraryModules.LastChannelStore.getChannelId();
				let input = Object.assign({}, languages[this.getLanguageChoice(languageTypes.INPUT, place, channelId)]);
				let output = Object.assign({}, languages[this.getLanguageChoice(languageTypes.OUTPUT, place, channelId)]);
				if (translate && input.id != output.id) {
					let specialCase = this.checkForSpecialCase(newText, input);
					if (specialCase) {
						input.name = specialCase.name;
						switch (specialCase.id) {
							case "binary": newText = this.binary2string(newText); break;
							case "braille": newText = this.braille2string(newText); break;
							case "morse": newText = this.morse2string(newText); break;
						}
					}
					if (output.special) {
						switch (output.id) {
							case "binary": newText = this.string2binary(newText); break;
							case "braille": newText = this.string2braille(newText); break;
							case "morse": newText = this.string2morse(newText); break;
						}
						finishTranslation(newText);
					}
					else {
						const startTranslating = engine => {
							isTranslating = true;
							if (toast) toast.close();
							BDFDB.TimeUtils.clear(toastInterval);
							
							let loadingString = `${this.labels.toast_translating} (${translationEngines[engine].name}) - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`;
							let currentLoadingString = loadingString;
							toast = BDFDB.NotificationUtils.toast(loadingString, {
								timeout: 0,
								position: "center",
								onClose: _ => BDFDB.TimeUtils.clear(toastInterval)
							});
							toastInterval = BDFDB.TimeUtils.interval((_, count) => {
								if (count > 40) {
									finishTranslation("");
									BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed} (${translationEngines[engine].name}) - ${this.labels.toast_translating_tryanother}`, {
										type: "danger",
										position: "center"
									});
								}
								else {
									currentLoadingString = currentLoadingString.endsWith(".....") ? loadingString : currentLoadingString + ".";
									toast.update(currentLoadingString);
								}
							}, 500);
						};
						if (this.validTranslator(this.settings.engines.translator, input, output, specialCase)) {
							startTranslating(this.settings.engines.translator);
							this[translationEngines[this.settings.engines.translator].funcName].apply(this, [{input, output, text: newText, specialCase, engine: translationEngines[this.settings.engines.translator]}, translation => {
								if (!translation && this.validTranslator(this.settings.engines.backup, input, output, specialCase)) {
									startTranslating(this.settings.engines.backup);
									this[translationEngines[this.settings.engines.backup].funcName].apply(this, [{input, output, text: newText, specialCase, engine: translationEngines[this.settings.engines.backup]}, finishTranslation]);
								}
								else finishTranslation(translation);
							}]);
						}
						else if (this.validTranslator(this.settings.engines.backup, input, output, specialCase)) {
							startTranslating(this.settings.engines.backup);
							this[translationEngines[this.settings.engines.backup].funcName].apply(this, [{input, output, text: newText, specialCase, engine: translationEngines[this.settings.engines.backup]}, finishTranslation]);
						}
						else finishTranslation();
					}
				}
				else finishTranslation();
			}
			
			validTranslator (key, input, output, specialCase) {
				return translationEngines[key] && typeof this[translationEngines[key].funcName] == "function" && (specialCase || input.auto && translationEngines[key].auto || translationEngines[key].languages.includes(input.id) && translationEngines[key].languages.includes(output.id));
			}
			
			googleApiTranslate (data, callback) {
				BDFDB.LibraryRequires.request(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${data.input.id}&tl=${data.output.id}&dt=t&dj=1&source=input&q=${encodeURIComponent(data.text)}`, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body);
							if (!data.specialCase && body.src && body.src && languages[body.src]) {
								data.input.name = languages[body.src].name;
								data.input.ownlang = languages[body.src].ownlang;
							}
							callback(body.sentences.map(n => n && n.trans).filter(n => n).join(""));
						}
						catch (err) {callback("");}
					}
					else {
						if (response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit per Hour reached.`, {
							type: "danger",
							position: "center"
						});
						else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server might be down.`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}
			
			deepLTranslate (data, callback) {
				BDFDB.LibraryRequires.request(`https://api-free.deepl.com/v2/translate?auth_key=${authKeys.deepl || "75cc2f40-fdae-14cd-7242-6a384e2abb9c:fx"}&text=${encodeURIComponent(data.text)}${data.input.auto ? "" : `&source_lang=${data.input.id}`}&target_lang=${data.output.id}`, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body);
							if (!data.specialCase && body.translations[0] && body.translations[0].detected_source_language && languages[body.translations[0].detected_source_language.toLowerCase()]) {
								data.input.name = languages[body.translations[0].detected_source_language.toLowerCase()].name;
								data.input.ownlang = languages[body.translations[0].detected_source_language.toLowerCase()].ownlang;
							}
							callback(body.translations.map(n => n && n.text).filter(n => n).join(""));
						}
						catch (err) {callback("");}
					}
					else {
						if (response.statusCode == 429 || response.statusCode == 456) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit reached.`, {
							type: "danger",
							position: "center"
						});
						else if (response.statusCode == 403) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. API-Key outdated.`, {
							type: "danger",
							position: "center"
						});
						else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server might be down.`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}
			
			iTranslateTranslate (data, callback) {
				let translate = _ => {
					BDFDB.LibraryRequires.request.post({
						url: "https://web-api.itranslateapp.com/v3/texts/translate",
						headers: {
							"API-KEY": authKeys.itranslate || data.engine.APIkey
						},
						body: JSON.stringify({
							source: {
								dialect: data.input.id,
								text: data.text
							},
							target: {
								dialect: data.output.id
							}
						})
					}, (error, response, body) => {
						if (!error && response && response.statusCode == 200) {
							try {
								body = JSON.parse(body);
								if (!data.specialCase && body.source && body.source.dialect && languages[body.source.dialect]) {
									data.input.name = languages[body.source.dialect].name;
									data.input.ownlang = languages[body.source.dialect].ownlang;
								}
								callback(body.target.text);
							}
							catch (err) {callback("");}
						}
						else {
							if (response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit reached.`, {
								type: "danger",
								position: "center"
							});
							else if (response.statusCode == 403) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. API-Key outdated.`, {
								type: "danger",
								position: "center"
							});
							else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server might be down.`, {
								type: "danger",
								position: "center"
							});
							callback("");
						}
					});
				};
				if (authKeys.itranslate || data.engine.APIkey) translate();
				else BDFDB.LibraryRequires.request("https://www.itranslate.com/js/webapp/main.js", {gzip: true}, (error, response, body) => {
					if (!error && body) {
						let APIkey = /var API_KEY = "(.+)"/.exec(body);
						if (APIkey) {
							data.engine.APIkey = APIkey[1];
							translate();
						}
						else callback("");
					}
					else callback("");
				});
			}
			
			yandexTranslate (data, callback) {
				BDFDB.LibraryRequires.request(`https://translate.yandex.net/api/v1.5/tr/translate?key=${authKeys.yandex || "trnsl.1.1.20191206T223907Z.52bd512eca953a5b.1ec123ce4dcab3ae859f312d27cdc8609ab280de"}&text=${encodeURIComponent(data.text)}&lang=${data.specialCase || data.input.auto ? data.output.id : (data.input.id + "-" + data.output.id)}&options=1`, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						body = BDFDB.DOMUtils.create(body);
						let translation = body.querySelector("text");
						let detected = body.querySelector("detected");
						if (translation && detected) {
							let detectedLang = detected.getAttribute("lang");
							if (!data.specialCase && detectedLang && languages[detectedLang]) {
								data.input.name = languages[detectedLang].name;
								data.input.ownlang = languages[detectedLang].ownlang;
							}
							callback(translation.innerText);
						}
						else callback("");
					}
					if (body && body.indexOf('code="408"') > -1) {
						BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Monthly Request Limit reached.`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
					else {
						BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server down or API-Key outdated.`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}
			
			papagoTranslate (data, callback) {
				const credentials = (authKeys.papago || "kUNGxtAmTJQFbaFehdjk zC70k3VhpM").split(" ");
				BDFDB.LibraryRequires.request.post({
					url: "https://openapi.naver.com/v1/papago/n2mt",
					form: {
						source: data.input.id,
						target: data.output.id,
						text: data.text
					},
					headers: {
						"X-Naver-Client-Id": credentials[0],
						"X-Naver-Client-Secret": credentials[1]
					}
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							let message = (JSON.parse(body) || {}).message;
							let result = message && (message.body || message.result);
							if (result && result.translatedText) callback(result.translatedText);
							else callback("");
						}
						catch (err) {callback("");}
					}
					else {
						if (response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Request Limit per Hour is reached.`, {
							type: "danger",
							position: "center"
						});
						else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. Translation Server is down or API-key outdated.`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}

			checkForSpecialCase (text, input) {
				if (input.special) return input;
				else if (input.auto) {
					if (/^[0-1]*$/.test(text.replace(/\s/g, ""))) {
						return {id: "binary", name: "Binary"};
					}
					else if (/^[⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿]*$/.test(text.replace(/\s/g, ""))) {
						return {id: "braille", name: "Braille 6-dot"};
					}
					else if (/^[/|·−._-]*$/.test(text.replace(/\s/g, ""))) {
						return {id: "morse", name: "Morse"};
					}
				}
				return null;
			}

			string2binary (string) {
				let binary = "";
				for (let character of string) binary += parseInt(character.charCodeAt(0).toString(2)).toPrecision(8).split(".").reverse().join("").toString() + " ";
				return binary;
			}

			string2braille (string) {
				let braille = "";
				for (let character of string) braille += brailleConverter[character.toLowerCase()] ? brailleConverter[character.toLowerCase()] : character;
				return braille;
			}

			string2morse (string) {
				string = string.replace(/ /g, "%%%%%%%%%%");
				let morse = "";
				for (let character of string) morse += (morseConverter[character.toLowerCase()] ? morseConverter[character.toLowerCase()] : character) + " ";
				morse = morse.split("\n");
				for (let i in morse) morse[i] = morse[i].trim();
				return morse.join("\n").replace(/% % % % % % % % % % /g, "/ ");
			}

			binary2string (binary) {
				let string = "";
				binary = binary.replace(/\n/g, "00001010").replace(/\r/g, "00001101").replace(/\t/g, "00001001").replace(/\s/g, "");
				if (/^[0-1]*$/.test(binary)) {
					let eightDigits = "";
					let counter = 0;
					for (let digit of binary) {
						eightDigits += digit;
						counter++;
						if (counter > 7) {
							string += String.fromCharCode(parseInt(eightDigits, 2).toString(10));
							eightDigits = "";
							counter = 0;
						}
					}
				}
				else BDFDB.NotificationUtils.toast("Invalid binary format. Only use 0s and 1s.", {
					type: "danger",
					position: "center"
				});
				return string;
			}

			braille2string (braille) {
				let string = "";
				for (let character of braille) string += brailleConverter[character.toLowerCase()] ? brailleConverter[character.toLowerCase()] : character;
				return string;
			}

			morse2string (morse) {
				let string = "";
				for (let word of morse.replace(/[_-]/g, "−").replace(/\./g, "·").replace(/\r|\t/g, "").split(/\/|\||\n/g)) {
					for (let characterstr of word.trim().split(" ")) string += morseConverter[characterstr] ? morseConverter[characterstr] : characterstr;
					string += " ";
				}
				return string.trim();
			}

			addExceptions (string, excepts) {
				for (let count in excepts) {
					let exception = BDFDB.ArrayUtils.is(this.settings.exceptions.wordStart) && this.settings.exceptions.wordStart.some(n => excepts[count].indexOf(n) == 0) ? excepts[count].slice(1) : excepts[count];
					let newString = string.replace(new RegExp(BDFDB.StringUtils.regEscape(`{{${count}}}`)), exception);
					if (newString == string) string = newString + " " + exception;
					else string = newString;
				}
				return string;
			}

			removeExceptions (string, place) {
				let excepts = {}, newString = [], count = 0;
				if (place == messageTypes.RECEIVED) {
					let text = [], i = 0;
					string.split("").forEach(chara => { 
						if (chara == "<" && text[i]) i++;
						text[i] = text[i] ? text[i] + chara : chara;
						if (chara == ">") i++;
					});
					for (let j in text) {
						if (text[j].indexOf("<") == 0) {
							newString.push(`{{${count}}}`);
							excepts[count] = text[j];
							count++;
						}
						else newString.push(text[j]);
					}
				}
				else {
					let usedExceptions = BDFDB.ArrayUtils.is(this.settings.exceptions.wordStart) ? this.settings.exceptions.wordStart : [];
					string.split(" ").forEach(word => {
						if (word.indexOf("<@!") == 0 || word.indexOf("<#") == 0 || word.indexOf(":") == 0 || word.indexOf("<:") == 0 || word.indexOf("<a:") == 0 || word.indexOf("@") == 0 || word.indexOf("#") == 0 || usedExceptions.some(n => word.indexOf(n) == 0 && word.length > 1)) {
							newString.push(`{{${count}}}`);
							excepts[count] = word;
							count++;
						}
						else newString.push(word);
					});
				}
				return [newString.join(" "), excepts, newString.length-count != 0];
			}

			getGoogleTranslatePageURL (input, output, text) {
				return `https://translate.google.com/#${BDFDB.LanguageUtils.languages[input] ? input : "auto"}/${output}/${encodeURIComponent(text)}`;
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_translator:		"Търсене превод",
							context_messagetranslateoption:		"Превод на съобщението",
							context_messageuntranslateoption:	"Превод на съобщението",
							popout_translateoption:				"Превод",
							popout_untranslateoption:			"Непревод",
							toast_translating:					"Превод",
							toast_translating_failed:			"Преводът не бе успешен",
							toast_translating_tryanother:		"Опитайте друг преводач",
							translated_watermark:				"преведено"
						};
					case "da":		// Danish
						return {
							context_translator:		"Søg oversættelse",
							context_messagetranslateoption:		"Oversæt besked",
							context_messageuntranslateoption:	"Ikke-oversat besked",
							popout_translateoption:				"Oversætte",
							popout_untranslateoption:			"Untranslate",
							toast_translating:					"Oversætter",
							toast_translating_failed:			"Kunne ikke oversætte",
							toast_translating_tryanother:		"Prøv en anden oversætter",
							translated_watermark:				"oversat"
						};
					case "de":		// German
						return {
							context_translator:		"Übersetzung suchen",
							context_messagetranslateoption:		"Nachricht übersetzen",
							context_messageuntranslateoption:	"Nachricht unübersetzen",
							popout_translateoption:				"Übersetzen",
							popout_untranslateoption:			"Unübersetzen",
							toast_translating:					"Übersetzen",
							toast_translating_failed:			"Übersetzung fehlgeschlagen",
							toast_translating_tryanother:		"Versuch einen anderen Übersetzer",
							translated_watermark:				"übersetzt"
						};
					case "el":		// Greek
						return {
							context_translator:		"Αναζήτηση μετάφρασης",
							context_messagetranslateoption:		"Μετάφραση μηνύματος",
							context_messageuntranslateoption:	"Μη μετάφραση μηνύματος",
							popout_translateoption:				"Μεταφράζω",
							popout_untranslateoption:			"Μη μετάφραση",
							toast_translating:					"Μετάφραση",
							toast_translating_failed:			"Αποτυχία μετάφρασης",
							toast_translating_tryanother:		"Δοκιμάστε έναν άλλο Μεταφραστή",
							translated_watermark:				"μεταφρασμένο"
						};
					case "es":		// Spanish
						return {
							context_translator:		"Buscar traducción",
							context_messagetranslateoption:		"Traducir mensaje",
							context_messageuntranslateoption:	"Mensaje sin traducir",
							popout_translateoption:				"Traducir",
							popout_untranslateoption:			"No traducir",
							toast_translating:					"Traductorio",
							toast_translating_failed:			"No se pudo traducir",
							toast_translating_tryanother:		"Prueba con otro traductor",
							translated_watermark:				"traducido"
						};
					case "fi":		// Finnish
						return {
							context_translator:		"Hae käännöstä",
							context_messagetranslateoption:		"Käännä viesti",
							context_messageuntranslateoption:	"Käännä viesti",
							popout_translateoption:				"Kääntää",
							popout_untranslateoption:			"Käännä",
							toast_translating:					"Kääntäminen",
							toast_translating_failed:			"Käännös epäonnistui",
							toast_translating_tryanother:		"Kokeile toista kääntäjää",
							translated_watermark:				"käännetty"
						};
					case "fr":		// French
						return {
							context_translator:		"Recherche de traduction",
							context_messagetranslateoption:		"Traduire le message",
							context_messageuntranslateoption:	"Message non traduit",
							popout_translateoption:				"Traduire",
							popout_untranslateoption:			"Non traduit",
							toast_translating:					"Traduction en cours",
							toast_translating_failed:			"Échec de la traduction",
							toast_translating_tryanother:		"Essayez un autre traducteur",
							translated_watermark:				"traduit"
						};
					case "hr":		// Croatian
						return {
							context_translator:		"Pretraži prijevod",
							context_messagetranslateoption:		"Prevedi poruku",
							context_messageuntranslateoption:	"Prevedi poruku",
							popout_translateoption:				"Prevedi",
							popout_untranslateoption:			"Neprevedi",
							toast_translating:					"Prevođenje",
							toast_translating_failed:			"Prijevod nije uspio",
							toast_translating_tryanother:		"Pokušajte s drugim prevoditeljem",
							translated_watermark:				"prevedeno"
						};
					case "hu":		// Hungarian
						return {
							context_translator:		"Keresés a fordításban",
							context_messagetranslateoption:		"Üzenet lefordítása",
							context_messageuntranslateoption:	"Az üzenet lefordítása",
							popout_translateoption:				"fordít",
							popout_untranslateoption:			"Fordítás le",
							toast_translating:					"Fordítás",
							toast_translating_failed:			"Nem sikerült lefordítani",
							toast_translating_tryanother:		"Próbálkozzon másik fordítóval",
							translated_watermark:				"lefordított"
						};
					case "it":		// Italian
						return {
							context_translator:		"Cerca traduzione",
							context_messagetranslateoption:		"Traduci messaggio",
							context_messageuntranslateoption:	"Annulla traduzione messaggio",
							popout_translateoption:				"Tradurre",
							popout_untranslateoption:			"Non tradurre",
							toast_translating:					"Tradurre",
							toast_translating_failed:			"Impossibile tradurre",
							toast_translating_tryanother:		"Prova un altro traduttore",
							translated_watermark:				"tradotto"
						};
					case "ja":		// Japanese
						return {
							context_translator:		"翻訳を検索",
							context_messagetranslateoption:		"メッセージの翻訳",
							context_messageuntranslateoption:	"メッセージの翻訳解除",
							popout_translateoption:				"翻訳する",
							popout_untranslateoption:			"翻訳しない",
							toast_translating:					"翻訳",
							toast_translating_failed:			"翻訳に失敗しました",
							toast_translating_tryanother:		"別の翻訳者を試す",
							translated_watermark:				"翻訳済み"
						};
					case "ko":		// Korean
						return {
							context_translator:		"번역 검색",
							context_messagetranslateoption:		"메시지 번역",
							context_messageuntranslateoption:	"메시지 번역 취소",
							popout_translateoption:				"옮기다",
							popout_untranslateoption:			"번역 취소",
							toast_translating:					"번역 중",
							toast_translating_failed:			"번역하지 못했습니다.",
							toast_translating_tryanother:		"다른 번역기 시도",
							translated_watermark:				"번역"
						};
					case "lt":		// Lithuanian
						return {
							context_translator:		"Paieškos vertimas",
							context_messagetranslateoption:		"Versti pranešimą",
							context_messageuntranslateoption:	"Išversti pranešimą",
							popout_translateoption:				"Išversti",
							popout_untranslateoption:			"Neišversti",
							toast_translating:					"Vertimas",
							toast_translating_failed:			"Nepavyko išversti",
							toast_translating_tryanother:		"Išbandykite kitą vertėją",
							translated_watermark:				"išverstas"
						};
					case "nl":		// Dutch
						return {
							context_translator:		"Zoek vertaling",
							context_messagetranslateoption:		"Bericht vertalen",
							context_messageuntranslateoption:	"Bericht onvertalen",
							popout_translateoption:				"Vertalen",
							popout_untranslateoption:			"Onvertalen",
							toast_translating:					"Vertalen",
							toast_translating_failed:			"Kan niet vertalen",
							toast_translating_tryanother:		"Probeer een andere vertaler",
							translated_watermark:				"vertaald"
						};
					case "no":		// Norwegian
						return {
							context_translator:		"Søk i oversettelse",
							context_messagetranslateoption:		"Oversett melding",
							context_messageuntranslateoption:	"Ikke oversett melding",
							popout_translateoption:				"Oversette",
							popout_untranslateoption:			"Ikke oversett",
							toast_translating:					"Oversetter",
							toast_translating_failed:			"Kunne ikke oversette",
							toast_translating_tryanother:		"Prøv en annen oversetter",
							translated_watermark:				"oversatt"
						};
					case "pl":		// Polish
						return {
							context_translator:		"Wyszukaj tłumaczenie",
							context_messagetranslateoption:		"Przetłumacz wiadomość",
							context_messageuntranslateoption:	"Nieprzetłumacz wiadomość",
							popout_translateoption:				"Tłumaczyć",
							popout_untranslateoption:			"Nie przetłumacz",
							toast_translating:					"Tłumaczenie",
							toast_translating_failed:			"Nie udało się przetłumaczyć",
							toast_translating_tryanother:		"Wypróbuj innego tłumacza",
							translated_watermark:				"przetłumaczony"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_translator:		"Tradução de pesquisa",
							context_messagetranslateoption:		"Traduzir mensagem",
							context_messageuntranslateoption:	"Mensagem não traduzida",
							popout_translateoption:				"Traduzir",
							popout_untranslateoption:			"Não traduzido",
							toast_translating:					"Traduzindo",
							toast_translating_failed:			"Falha ao traduzir",
							toast_translating_tryanother:		"Tente outro tradutor",
							translated_watermark:				"traduzido"
						};
					case "ro":		// Romanian
						return {
							context_translator:		"Căutare traducere",
							context_messagetranslateoption:		"Traduceți mesajul",
							context_messageuntranslateoption:	"Untraduceți mesajul",
							popout_translateoption:				"Traduceți",
							popout_untranslateoption:			"Netradus",
							toast_translating:					"Traducere",
							toast_translating_failed:			"Nu s-a putut traduce",
							toast_translating_tryanother:		"Încercați un alt traducător",
							translated_watermark:				"tradus"
						};
					case "ru":		// Russian
						return {
							context_translator:		"Искать перевод",
							context_messagetranslateoption:		"Перевести сообщение",
							context_messageuntranslateoption:	"Непереведенное сообщение",
							popout_translateoption:				"Переведите",
							popout_untranslateoption:			"Неперевести",
							toast_translating:					"Идет перевод",
							toast_translating_failed:			"Не удалось перевести",
							toast_translating_tryanother:		"Попробуйте другой переводчик",
							translated_watermark:				"переведено"
						};
					case "sv":		// Swedish
						return {
							context_translator:		"Sök översättning",
							context_messagetranslateoption:		"Översätt meddelande",
							context_messageuntranslateoption:	"Untranslate meddelande",
							popout_translateoption:				"Översätt",
							popout_untranslateoption:			"Untranslate",
							toast_translating:					"Översätter",
							toast_translating_failed:			"Det gick inte att översätta",
							toast_translating_tryanother:		"Prova en annan översättare",
							translated_watermark:				"översatt"
						};
					case "th":		// Thai
						return {
							context_translator:		"ค้นหาคำแปล",
							context_messagetranslateoption:		"แปลข้อความ",
							context_messageuntranslateoption:	"ยกเลิกการแปลข้อความ",
							popout_translateoption:				"แปลภาษา",
							popout_untranslateoption:			"ไม่แปล",
							toast_translating:					"กำลังแปล",
							toast_translating_failed:			"แปลไม่สำเร็จ",
							toast_translating_tryanother:		"ลองใช้นักแปลคนอื่น",
							translated_watermark:				"แปล"
						};
					case "tr":		// Turkish
						return {
							context_translator:		"Çeviri ara",
							context_messagetranslateoption:		"Mesajı Çevir",
							context_messageuntranslateoption:	"Çeviriyi Kaldır Mesajı",
							popout_translateoption:				"Çevirmek",
							popout_untranslateoption:			"Çevirmeyi kaldır",
							toast_translating:					"Çeviri",
							toast_translating_failed:			"Tercüme edilemedi",
							toast_translating_tryanother:		"Başka bir Çevirmen deneyin",
							translated_watermark:				"tercüme"
						};
					case "uk":		// Ukrainian
						return {
							context_translator:		"Пошук перекладу",
							context_messagetranslateoption:		"Перекласти повідомлення",
							context_messageuntranslateoption:	"Неперекладене повідомлення",
							popout_translateoption:				"Перекласти",
							popout_untranslateoption:			"Неперекласти",
							toast_translating:					"Переклад",
							toast_translating_failed:			"Не вдалося перекласти",
							toast_translating_tryanother:		"Спробуйте іншого перекладача",
							translated_watermark:				"переклав"
						};
					case "vi":		// Vietnamese
						return {
							context_translator:		"Tìm kiếm bản dịch",
							context_messagetranslateoption:		"Dịch tin nhắn",
							context_messageuntranslateoption:	"Thư chưa dịch",
							popout_translateoption:				"Phiên dịch",
							popout_untranslateoption:			"Chưa dịch",
							toast_translating:					"Phiên dịch",
							toast_translating_failed:			"Không dịch được",
							toast_translating_tryanother:		"Thử một Trình dịch khác",
							translated_watermark:				"đã dịch"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_translator:		"搜索翻译",
							context_messagetranslateoption:		"翻译消息",
							context_messageuntranslateoption:	"取消翻译消息",
							popout_translateoption:				"翻译",
							popout_untranslateoption:			"取消翻译",
							toast_translating:					"正在翻译",
							toast_translating_failed:			"翻译失败",
							toast_translating_tryanother:		"尝试其他翻译器",
							translated_watermark:				"已翻译"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_translator:		"搜索翻譯",
							context_messagetranslateoption:		"翻譯訊息",
							context_messageuntranslateoption:	"取消翻譯訊息",
							popout_translateoption:				"翻譯",
							popout_untranslateoption:			"取消翻譯",
							toast_translating:					"正在翻譯",
							toast_translating_failed:			"翻譯失敗",
							toast_translating_tryanother:		"嘗試其他翻譯器",
							translated_watermark:				"已翻譯"
						};
					default:		// English
						return {
							context_translator:		"Search Translation",
							context_messagetranslateoption:		"Translate Message",
							context_messageuntranslateoption:	"Untranslate Message",
							popout_translateoption:				"Translate",
							popout_untranslateoption:			"Untranslate",
							toast_translating:					"Translating",
							toast_translating_failed:			"Failed to translate",
							toast_translating_tryanother:		"Try another Translator",
							translated_watermark:				"translated"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
