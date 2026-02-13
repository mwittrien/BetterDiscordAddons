/**
 * @name Translator
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.7.9
 * @description Allows you to translate incoming and your outgoing Messages within Discord
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/Translator/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/Translator/Translator.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--text-strong); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		
		const translateIconGeneral = `<svg name="Translate" width="24" height="24" viewBox="0 0 24 24"><mask/><path fill="currentColor" mask="url(#translateIconMask)" d="m 9.6568988,1.9999999 c -1.141416,0 -0.951614,1.2688185 -0.951614,1.2688185 v 0.6505173 h -5.392479 c 0,0 -1.2688185,-0.1898024 -1.2688185,0.9516139 0,1.1414159 1.2688185,0.9516139 1.2688185,0.9516139 H 12.426863 C 12.695162,7.2780713 11.349082,9.1398691 9.7646988,10.765256 8.6555628,9.6878231 7.4332858,8.3134878 6.8664892,7.065981 6.6161862,6.515072 5.9881318,6.6956414 5.7283935,6.9736693 5.1836529,7.5567679 5.5785907,8.592173 6.0833902,9.3409331 c 0.246901,0.366224 1.3724726,1.5182279 2.4570966,2.5995909 -1.6322361,1.477469 -3.154699,2.550028 -3.154699,2.550028 0,0 -1.0769951,0.696378 -0.322161,1.552568 0.7548319,0.856187 1.5810669,-0.125147 1.5810669,-0.125147 0,0 1.5136611,-1.082765 3.2203701,-2.6696 0.5195872,0.508635 0.8970952,0.874172 0.8970952,0.874172 0,0 0.82821,0.985394 1.582925,0.09231 0.754714,-0.893081 -0.354377,-1.545753 -0.354377,-1.545753 0.0097,0.03486 -0.34186,-0.224086 -0.864878,-0.666625 1.804964,-1.884163 3.470802,-4.1622897 3.47686,-6.1799145 h 1.398302 c 0,0 1.268819,0.2176541 1.268819,-0.9516139 0,-1.1692683 -1.268819,-0.9516139 -1.268819,-0.9516139 H 10.608512 V 3.2688184 c 0,0 0.189804,-1.2688185 -0.9516132,-1.2688185 z M 15.056812,10.104826 10.536646,22 h 2.379035 l 0.964624,-2.537637 h 4.732049 L 19.576978,22 h 2.379035 L 17.435847,10.104826 Z m 1.189517,3.130537 1.643021,4.323772 h -3.286042 z"/><extra/></svg>`;
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
								guildId: this.props.guildId,
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
				return lang && (lang.auto && translationEngines[_this.settings.engines.translator] && !translationEngines[_this.settings.engines.translator].auto || !lang.auto && !lang.special && translationEngines[_this.settings.engines.translator] && !translationEngines[_this.settings.engines.translator].languages.includes(lang.id));
			}
			render() {
				return [
					BDFDB.ArrayUtils.is(_this.settings.exceptions.wordStart) && _this.settings.exceptions.wordStart.length && [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCN.marginbottom8,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
								label: _this.labels.exception_text.replace("{{var0}}", _this.settings.exceptions.wordStart.map(n => '"' + n + '"').join(", "))
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
							className: BDFDB.disCN.marginbottom8
						})
					],
					Object.keys(_this.defaults.choices).map(place => {
						let isChannelSpecific = channelLanguages[this.props.channelId] && channelLanguages[this.props.channelId][place];
						let isGuildSpecific = !isChannelSpecific && guildLanguages[this.props.guildId] && guildLanguages[this.props.guildId][place];
						return Object.keys(_this.defaults.choices[place].value).map(direction => [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
								title: _this.labels[`language_choice_${direction.toLowerCase()}_${place.toLowerCase()}`] + ": ",
								titleChildren: direction == languageTypes.OUTPUT && [{
									text: _ => isChannelSpecific ? _this.labels.language_selection_channel : isGuildSpecific ? _this.labels.language_selection_server : _this.labels.language_selection_global,
									name: isChannelSpecific || isGuildSpecific ? BDFDB.LibraryComponents.SvgIcon.Names.LOCK_CLOSED : BDFDB.LibraryComponents.SvgIcon.Names.LOCK_OPEN,
									color: isChannelSpecific ? "var(--status-danger)" : isGuildSpecific ? "var(--status-warning)" : null,
									onClick: _ => {
										if (channelLanguages[this.props.channelId] && channelLanguages[this.props.channelId][place]) {
											isChannelSpecific = false;
											delete channelLanguages[this.props.channelId][place];
											if (BDFDB.ObjectUtils.isEmpty(channelLanguages[this.props.channelId])) delete channelLanguages[this.props.channelId];
										}
										else if (guildLanguages[this.props.guildId] && guildLanguages[this.props.guildId][place]) {
											isGuildSpecific = false;
											isChannelSpecific = true;
											delete guildLanguages[this.props.guildId][place];
											if (BDFDB.ObjectUtils.isEmpty(guildLanguages[this.props.guildId])) delete guildLanguages[this.props.guildId];
											if (!channelLanguages[this.props.channelId]) channelLanguages[this.props.channelId] = {};
											channelLanguages[this.props.channelId][place] = {};
											for (let l in languageTypes) channelLanguages[this.props.channelId][place][languageTypes[l]] = _this.getLanguageChoice(languageTypes[l], place, null);
										}
										else {
											isGuildSpecific = true;
											if (!guildLanguages[this.props.guildId]) guildLanguages[this.props.guildId] = {};
											guildLanguages[this.props.guildId][place] = {};
											for (let l in languageTypes) guildLanguages[this.props.guildId][place][languageTypes[l]] = _this.getLanguageChoice(languageTypes[l], place, null);
										}
										BDFDB.DataUtils.save(channelLanguages, _this, "channelLanguages");
										BDFDB.DataUtils.save(guildLanguages, _this, "guildLanguages");
										
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
									return data.text ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {tooltipConfig: {type: "bottom"}, text: data.text, children: icon}) : icon;
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
												text: _this.labels.backup_engine_warning,
												tooltipConfig: {
													color: "red"
												},
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													nativeClass: true,
													width: 20,
													height: 20,
													color: "var(--status-danger)",
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
							direction == languageTypes.OUTPUT && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
								className: BDFDB.disCN.marginbottom8
							})
						]);
					}),
					Object.keys(_this.defaults.engines).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
						title: _this.labels[`${key}_engine`],
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
						label: _this.labels[`general_${key}`] || _this.defaults.general[key].description,
						tag: BDFDB.LibraryComponents.FormTitle.Tags.H5,
						value: _this.settings.general[key]
					})),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Switch",
						label: _this.labels.translate_your_message,
						tag: BDFDB.LibraryComponents.FormTitle.Tags.H5,
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
		
		const googleLanguages = ["af","am","ar","az","be","bg","bn","bs","ca","ceb","co","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi","fr","fy","ga","gd","gl","gu","ha","haw","hi","hmn","hr","ht","hu","hy","id","ig","is","it","iw","ja","jw","ka","kk","km","kn","ko","ku","ky","la","lb","lo","lt","lv","mg","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","ny","or","pa","pl","ps","pt","ro","ru","rw","sd","si","sk","sl","sm","sn","so","sq","sr","st","su","sv","sw","ta","te","tg","th","tk","tl","tr","tt","ug","uk","ur","uz","vi","xh","yi","yo","zh-CN","zh-TW","zu"];
		const translationEngines = {
			googleapi: {
				name: "Google",
				auto: true,
				funcName: "googleApiTranslate",
				languages: googleLanguages
			},
			microsoft: {
				name: "Microsoft",
				auto: true,
				funcName: "microsoftTranslate",
				languages: ["af","am","ar","az","ba","bg","bn","bs","ca","cs","cy","da","de","el","en","es","et","eu","fa","fi","fil","fr","fr-CA","ga","gl","gu","ha","he","hi","hr","ht","hu","hy","id","ig","is","it","ja","ka","kk","km","kn","ko","ku","ky","lo","lt","lv","mg","mi","mk","ml","mr","ms","mt","my","ne","nl","or","pa","pl","ps","pt","pt-PT","ro","ru","rw","sd","si","sk","sl","sm","sn","so","sq","st","sv","sw","ta","te","th","tk","tr","tt","ug","uk","ur","uz","vi","xh","yo","zh-CN","zh-TW","zu"],
				parser: {
					"zh-CN": "zh-Hans",
					"zh-TW": "zh-Hant"
				},
				key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
			},
			deepl: {
				name: "DeepL",
				auto: true,
				funcName: "deepLTranslate",
				languages: ["bg","cs","da","de","en","el","es","et","fi","fr","hu","id","it","ja","ko","lt","lv","nl","no","pl","pt","ro","ru","sk","sl","sv","tr","uk","zh"],
				premium: true,
				key: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
			},
			deepseek: {
				name: "DeepSeek",
				auto: true,
				funcName: "deepSeekTranslate",
				languages: googleLanguages,
				key: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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
				auto: true,
				funcName: "papagoTranslate",
				languages: ["en","es","fr","id","ja","ko","th","vi","zh-CN","zh-TW"],
				key: "xxxxxxxxxxxxxxxxxxxx xxxxxxxxxx"
			},
			baidu: {
				name: "Baidu",
				auto: true,
				funcName: "baiduTranslate",
				languages: ["ar","bg","cs","da","de","el","en","es","et","fi","fr","hu","it","ja","ko","nl","pl","pt","ro","ru","sl","sv","th","vi","zh","zh-CN","zh-TW"],
				parser: {
					"ar": "ara",
					"bg": "bul",
					"da": "dan",
					"es": "spa",
					"et": "est",
					"fi": "fin",
					"fr": "fra",
					"ja": "jp",
					"ko": "kor",
					"ro": "rom",
					"sl": "slo",
					"sv": "swe",
					"vi": "vie",
					"zh": "wyw",
					"zh-CN": "zh",
					"zh-TW": "cht"
				},
				key: "xxxxxxxxxx xxxxxxxxxxxxxxxxxxxx"
			}
		};
		
		var languages = {};
		var favorites = [];
		var authKeys = {};
		var channelLanguages = {}, guildLanguages = {};
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
						addTranslateButton:		{value: true, 	popout: false},
						addQuickTranslateButton:	{value: true, 	popout: false},
						usePerChatTranslation:		{value: true, 	popout: false},
						sendOriginalMessage:		{value: false, 	popout: true},
						showOriginalMessage:		{value: false, 	popout: true},
						useSpoilerInOriginal:		{value: false, 	popout: false,	description: "Use Spoilers instead of Quotes for the original Message Text"}
					},
					choices: {},
					exceptions: {
						wordStart:			{value: ["!"],	max: 3}
					},
					prefixes: {
						translationPrefixData: 		{value: [
							{prefix: "$fr", language: "fr"},
							{prefix: "$de", language: "de"},
							{prefix: "$es", language: "es"},
							{prefix: "$jp", language: "ja"}
						]}
					},
					engines: {
						translator:			{value: "googleapi"},
						backup:				{value: "----"}
					}
				};
				for (let m in messageTypes) this.defaults.choices[messageTypes[m]] = {value: Object.keys(languageTypes).reduce((newObj, l) => (newObj[languageTypes[l]] = defaultLanguages[l], newObj), {})};
			
				this.modulePatches = {
					before: [
						"ChannelTextAreaContainer",
						"ChannelTextAreaEditor",
						"Embed",
						"MessageReply",
						"Messages"
					],
					after: [
						"ChannelTextAreaButtons",
						"Embed",
						"MessageButtons",
						"MessageContent"
					]
				};

				this.css = `
					${BDFDB.dotCN._translatortranslatebutton + BDFDB.dotCNS._translatortranslating + BDFDB.dotCN.textareaicon} {
						color: var(--status-danger) !important;
					}
					${BDFDB.dotCN._translatorconfigbutton} {
						margin: 2px 3px 0 6px;
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "startEditMessage", {before: e => {
					if (e.methodArguments[1] && oldMessages[e.methodArguments[1]] && oldMessages[e.methodArguments[1]].content) e.methodArguments[2] = oldMessages[e.methodArguments[1]].content;
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "editMessage", {before: e => {
					delete translatedMessages[e.methodArguments[1]];
					delete oldMessages[e.methodArguments[1]];
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageToolbarUtils, "useMessageMenu", {after: e => {
					if (e.instance.props.message && e.instance.props.channel) {
						let translated = !!translatedMessages[e.instance.props.message.id];
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnValue, {id: ["copy-text", "pin", "unpin"]});
						if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnValue, {id: ["edit", "add-reaction", "add-reaction-1", "quote"]});
						children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
							disabled: isTranslating,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: translated ? translateIconUntranslate : translateIcon
							}),
							action: _ => this.translateMessage(e.instance.props.message, e.instance.props.channel)
						}));
					}
				}});
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
							label: this.labels[`general_${key}`] || this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
							className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Own Auth Keys:",
							children: Object.keys(translationEngines).filter(key => translationEngines[key].key).map(key => BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.marginbottom8,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										className: BDFDB.disCN.marginbottom8,
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormTitle.Title, {
												className: BDFDB.disCN.marginreset,
												tag: BDFDB.LibraryComponents.FormTitle.Tags.H5,
												children: translationEngines[key].name
											}),
											translationEngines[key].premium && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
												type: "Switch",
												margin: 0,
												grow: 0,
												label: "Paid Version",
												tag: BDFDB.LibraryComponents.FormTitle.Tags.H5,
												value: authKeys[key] && authKeys[key].paid,
												onChange: value => {
													if (!authKeys[key]) authKeys[key] = {};
													authKeys[key].paid = value;
													BDFDB.DataUtils.save(authKeys, this, "authKeys");
												}
											})
										]
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										placeholder: translationEngines[key].key,
										value: authKeys[key] && authKeys[key].key,
										onChange: value => {
											if (!authKeys[key]) authKeys[key] = {};
											authKeys[key].key = (value || "").trim();
											BDFDB.DataUtils.save(authKeys, this, "authKeys");
										}
									}),
									// region selector for Microsoft translator
									key === "microsoft" && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
										className: BDFDB.disCN.marginbottom8,
										value: authKeys[key] && authKeys[key].region || "global",
										options: [
											{value: "eastasia", label: "East Asia"},
											{value: "southeastasia", label: "Southeast Asia"},
											{value: "centralus", label: "Central US"},
											{value: "eastus", label: "East US"},
											{value: "eastus2", label: "East US 2"},
											{value: "westus", label: "West US"},
											{value: "northcentralus", label: "North Central US"},
											{value: "southcentralus", label: "South Central US"},
											{value: "northeurope", label: "North Europe"},
											{value: "westeurope", label: "West Europe"},
											{value: "japanwest", label: "Japan West"},
											{value: "japaneast", label: "Japan East"},
											{value: "brazilsouth", label: "Brazil South"},
											{value: "australiaeast", label: "Australia East"},
											{value: "australiasoutheast", label: "Australia Southeast"},
											{value: "southindia", label: "South India"},
											{value: "centralindia", label: "Central India"},
											{value: "westindia", label: "West India"},
											{value: "canadacentral", label: "Canada Central"},
											{value: "canadaeast", label: "Canada East"},
											{value: "uksouth", label: "UK South"},
											{value: "ukwest", label: "UK West"},
											{value: "westcentralus", label: "West Central US"},
											{value: "westus2", label: "West US 2"},
											{value: "koreacentral", label: "Korea Central"},
											{value: "koreasouth", label: "Korea South"},
											{value: "francecentral", label: "France Central"},
											{value: "francesouth", label: "France South"},
											{value: "australiacentral", label: "Australia Central"},
											{value: "australiacentral2", label: "Australia Central 2"},
											{value: "uaecentral", label: "UAE Central"},
											{value: "uaenorth", label: "UAE North"},
											{value: "southafricanorth", label: "South Africa North"},
											{value: "southafricawest", label: "South Africa West"},
											{value: "switzerlandnorth", label: "Switzerland North"},
											{value: "switzerlandwest", label: "Switzerland West"},
											{value: "germanynorth", label: "Germany North"},
											{value: "germanywestcentral", label: "Germany West Central"},
											{value: "norwaywest", label: "Norway West"},
											{value: "norwayeast", label: "Norway East"}
										].sort((a, b) => a.label.localeCompare(b.label)),
										onChange: value => {
											if (!authKeys[key]) authKeys[key] = {};
											authKeys[key].region = value;
											BDFDB.DataUtils.save(authKeys, this, "authKeys");
										}
									})
								]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormDivider, {
							className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom8
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
							title: this.labels.prefixes_disable_text,
							className: BDFDB.disCN.marginbottom8,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListInput, {
								placeholder: "New Exception Prefix (e.g. !)",
								maxLength: this.defaults.exceptions.wordStart.max,
								items: this.settings.exceptions.wordStart,
								onChange: value => {
									this.SettingsUpdated = true;
									BDFDB.DataUtils.save(value, this, "exceptions", "wordStart");
								}
							})
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
							title: this.labels.prefixes_enable_text,
							className: BDFDB.disCN.marginbottom8,
							children: [								
								// Create a table-like layout for prefixes and language selection
								...(this.settings.prefixes.translationPrefixData || []).map((entry, index) => {
									return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										className: BDFDB.disCN.marginbottom8,
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											// Prefix input
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 0,
												shrink: 0,
												basis: "30%",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													placeholder: "Prefix (e.g. $fr)",
													value: entry.prefix,
													onChange: value => {
														this.settings.prefixes.translationPrefixData[index].prefix = value;
														BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
														this.SettingsUpdated = true;
													}
												})
											}),
											
											// Language selection dropdown
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 1,
												shrink: 0,
												basis: "60%",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
													value: entry.language,
													options: Object.keys(languages)
														.filter(key => !languages[key].auto && !languages[key].special)
														.map(key => ({
															value: key,
															label: BDFDB.LanguageUtils.getName(languages[key])
														}))
														.sort((a, b) => a.label.localeCompare(b.label)),
													onChange: value => {
														this.settings.prefixes.translationPrefixData[index].language = value;
														BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
														this.SettingsUpdated = true;
													}
												})
											}),
											
											// Delete button
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 0,
												shrink: 0,
												basis: "10%",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
													color: BDFDB.LibraryComponents.Button.Colors.RED,
													size: BDFDB.LibraryComponents.Button.Sizes.TINY,
													onClick: _ => {
														this.settings.prefixes.translationPrefixData.splice(index, 1);
														BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
														this.SettingsUpdated = true;
														BDFDB.ReactUtils.forceUpdate(this);
													},
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
														name: BDFDB.LibraryComponents.SvgIcon.Names.TRASH,
														width: 16,
														height: 16
													})
												})
											})
										]
									});
								}),

								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Button",
									color: BDFDB.LibraryComponents.Button.Colors.GREEN,
									onClick: _ => {
										// Initialize if not exists
										if (!this.settings.prefixes.translationPrefixData) this.settings.prefixes.translationPrefixData = [];
										
										// Add new entry with default values
										this.settings.prefixes.translationPrefixData.push({
											prefix: "$en",
											language: "en"
										});
										
										BDFDB.DataUtils.save(this.settings.prefixes.translationPrefixData, this, "prefixes", "translationPrefixData");
										this.SettingsUpdated = true;
										BDFDB.ReactUtils.forceUpdate(this);
									},
									children: "+ Add new prefix"
								})
							]
						}));
						
						return settingsItems.flat(10).filter(n => n);
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
				guildLanguages = BDFDB.DataUtils.load(this, "guildLanguages");
				
				translationEnabledStates = BDFDB.DataUtils.load(this, "translationEnabledStates");
				translationEnabledStates = BDFDB.ArrayUtils.is(translationEnabledStates) ? translationEnabledStates : [];
				
				this.setLanguages();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let translated = !!translatedMessages[e.instance.props.message.id];
					let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Translate_Message") : null;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["copy-text", "pin", "unpin"]});
					if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["edit", "add-reaction", "add-reaction-1", "quote"]});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: translated ? this.labels.context_messageuntranslateoption : this.labels.context_messagetranslateoption,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, translated ? "untranslate-message" : "translate-message"),
						icon: hint && (_ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
							hint: hint
						})),
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: translated ? translateIconUntranslate : translateIcon
						}),
						disabled: !translated && isTranslating,
						action: _ => this.translateMessage(e.instance.props.message, e.instance.props.channel)
					}));
					this.injectSearchItem(e, false);
				}
			}
			
			onTextAreaContextMenu (e) {
				this.injectSearchItem(e, true);
			}
			
			injectSearchItem (e, ownMessage) {
				let text = document.getSelection().toString();
				if (text) {
					let translating, foundTranslation, foundInput, foundOutput, copied;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["devmode-copy-id", "search-google"], group: true});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search-translation"),
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
								icon: translateIcon
							}),
							disabled: isTranslating,
							label: this.labels.context_translator,
							persisting: true,
							action: event => {
								let item = BDFDB.DOMUtils.getParent(BDFDB.dotCN.menuitem, event.target);
								if (item) {
									let createTooltip = _ => {
										BDFDB.TooltipUtils.create(item, !foundTranslation ? this.labels.toast_translating_failed : [
											`${BDFDB.LanguageUtils.LibraryStrings.from} ${foundInput.name}:`,
											text,
											`${BDFDB.LanguageUtils.LibraryStrings.to} ${foundOutput.name}:`,
											foundTranslation
										].map(n => BDFDB.ReactUtils.createElement("div", {children: n})), {
											type: "right",
											color: foundTranslation ? "primary" : "red",
											className: "googletranslate-tooltip"
										});
									};
									if (foundTranslation && foundInput && foundOutput) {
										if (document.querySelector(".googletranslate-tooltip")) {
											if (!copied) {
												copied = true;
												BDFDB.LibraryModules.WindowUtils.copy(foundTranslation);
												BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("clipboard_success", BDFDB.LanguageUtils.LanguageStrings.TEXT), {type: "success"});
											}
											else {
												BDFDB.ContextMenuUtils.close(e.instance);
												BDFDB.DiscordUtils.openLink(this.getGoogleTranslatePageURL(foundInput.id, foundOutput.id, text));
											}
										}
										else createTooltip();
									}
									else if (!translating) {
										translating = true;
										this.translateText(text, ownMessage ? messageTypes.SENT : messageTypes.RECEIVED, (translation, input, output) => {
											if (translation) {
												foundTranslation = translation, foundInput = input, foundOutput = output;
												createTooltip();
											}
											else createTooltip();
										});
									}
								}
							}
						})
					}));
				}
			}
			
			processMessageButtons (e) {
				if (!this.settings.general.addQuickTranslateButton || !e.instance.props.message || !e.instance.props.channel) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.messagebuttons]]});
				if (index == -1) return;
				let translated = !!translatedMessages[e.instance.props.message.id];
				children.unshift(BDFDB.ReactUtils.createElement(class extends BdApi.React.Component {
					render() {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							key: translated ? "untranslate-message" : "translate-message",
							text: _ => translated ? _this.labels.context_messageuntranslateoption : _this.labels.context_messagetranslateoption,
							tooltipConfig: {className: BDFDB.disCN.messagetoolbartooltip},
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS.messagetoolbarhoverbutton + BDFDB.disCN.messagetoolbarbutton,
								onClick: _ => {
									if (!isTranslating) _this.translateMessage(e.instance.props.message, e.instance.props.channel).then(_ => {
										translated = !!translatedMessages[e.instance.props.message.id];
										BDFDB.ReactUtils.forceUpdate(this);
									});
								},
								children: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCNS.messagetoolbaricon + BDFDB.disCN.messagetoolbarbuttoncontent,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
										className: BDFDB.disCN.messagetoolbaricon,
										nativeClass: true,
										iconSVG: translated ? translateIconUntranslate : translateIcon
									})
								})
							})
						});
					}
				}));
			}
			
			processChannelTextAreaContainer (e) {
				if (e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL && e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.SIDEBAR) return;
				BDFDB.PatchUtils.patch(this, e.instance.props, "onSubmit", {instead: e2 => {
					if (e2.methodArguments[0].value) {
						const text = e2.methodArguments[0].value;
						
						// Check for translation prefixes
						const prefixMap = {};
						const prefixData = this.settings.prefixes && this.settings.prefixes.translationPrefixData || [];
						for (const entry of prefixData) {
							prefixMap[entry.prefix] = entry.language;
						}
						
						let foundPrefix = null;
						let targetLanguage = null;
						
						// Check for prefixes more efficiently
						for (const prefix in prefixMap) {
							if (text.trim().startsWith(prefix)) {
								foundPrefix = prefix;
								targetLanguage = prefixMap[prefix];
								break;
							}
						}
						
						if (foundPrefix) {
							e2.stopOriginalMethodCall();
							// Remove the prefix from the message
							const cleanText = text.trim().substring(foundPrefix.length).trim();
							
							// Translate with the specific target language
							this.translateText(cleanText, messageTypes.SENT, (translation, input, output) => {
								// Override the output language with the one from the prefix
								output = {id: targetLanguage, name: languages[targetLanguage] ? languages[targetLanguage].name : targetLanguage};
								
								translation = !translation ? cleanText : (this.settings.general.sendOriginalMessage ? (translation + (!this.settings.general.useSpoilerInOriginal ? ("\n\n> *" + cleanText.split("\n").join("*\n> *") + "*").replace(/> \*\*\n/g, "> \n") : `\n\n||${cleanText}||`)) : translation);
								e2.originalMethod(Object.assign({}, e2.methodArguments[0], {value: translation}));
							}, targetLanguage);
							
							return Promise.resolve({
								shouldClear: true,
								shouldRefocus: true
							});
						}
						else if (this.isTranslationEnabled(e.instance.props.channel.id)) {
							e2.stopOriginalMethodCall();
							this.translateText(e2.methodArguments[0].value, messageTypes.SENT, (translation, input, output) => {
								translation = !translation ? e2.methodArguments[0].value : (this.settings.general.sendOriginalMessage ? (translation + (!this.settings.general.useSpoilerInOriginal ? ("\n\n> *" + e2.methodArguments[0].value.split("\n").join("*\n> *") + "*").replace(/> \*\*\n/g, "> \n") : `\n\n||${e2.methodArguments[0].value}||`)) : translation);
								e2.originalMethod(Object.assign({}, e2.methodArguments[0], {value: translation}));
							});
							return Promise.resolve({
								shouldClear: true,
								shouldRefocus: true
							});
						}
					}
					return e2.callOriginalMethodAfterwards();
				}}, {noCache: true});
			}

			processChannelTextAreaEditor (e) {
				if (this.isTranslationEnabled(e.instance.props.channel.id) && isTranslating) e.instance.props.disabled = true;
			}
			
			processChannelTextAreaButtons (e) {
				if (!this.settings.general.addTranslateButton || e.instance.props.disabled || e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL && e.instance.props.type != BDFDB.DiscordConstants.ChannelTextAreaTypes.SIDEBAR) return;
				if (e.returnvalue) e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(TranslateButtonComponent, {
					guildId: e.instance.props.channel.guild_id ? e.instance.props.channel.guild_id : "@me",
					channelId: e.instance.props.channel.id
				}));
			}

			processMessages (e) {
				e.instance.props.channelStream = [].concat(e.instance.props.channelStream);
				for (let i in e.instance.props.channelStream) {
					let message = e.instance.props.channelStream[i].content;
					if (message) {
						if (BDFDB.ArrayUtils.is(message.attachments)) this.checkMessage(e.instance.props.channelStream[i], message);
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

			processMessageReply (e) {
				if (!e.instance.props.referencedMessage || !e.instance.props.referencedMessage.message || !translatedMessages[e.instance.props.referencedMessage.message.id]) return;
				e.instance.props.referencedMessage = Object.assign({}, e.instance.props.referencedMessage);
				e.instance.props.referencedMessage.message = new BDFDB.DiscordObjects.Message(e.instance.props.referencedMessage.message);
				e.instance.props.referencedMessage.message.content = translatedMessages[e.instance.props.referencedMessage.message.id].content;
			}

			processMessageContent (e) {
				if (!e.instance.props.message) return;
				let translation = translatedMessages[e.instance.props.message.id];
				if (translation && translation.content) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
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

			processEmbed (e) {
				if (!e.instance.props.embed || !e.instance.props.embed.message_id) return;
				let translation = translatedMessages[e.instance.props.embed.message_id];
				if (translation && Object.keys(translation.embeds).length) {
					if (!e.returnvalue) e.instance.props.embed = Object.assign({}, e.instance.props.embed, {
						rawDescription: translation.embeds[e.instance.props.embed.id].description,
						rawTitle: translation.embeds[e.instance.props.embed.id].title,
						footer: Object.assign({}, e.instance.props.embed.footer || {}, {
							text: translation.embeds[e.instance.props.embed.id].footerText || ""
						}),
						fields: translation.embeds[e.instance.props.embed.id].fields.map(n => ({ rawName: n.name, rawValue: n.value })),
						originalDescription: e.instance.props.embed.originalDescription || e.instance.props.embed.rawDescription,
						originalTitle: e.instance.props.embed.originalTitle || e.instance.props.embed.rawTitle,
						originalFields: e.instance.props.embed.originalFields || e.instance.props.embed.fields,
						originalFooter: e.instance.props.embed.originalFooter || Object.assign({}, e.instance.props.embed.footer)
					});
					else {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, { props: [["className", BDFDB.disCN.embeddescription]] });
						if (index > -1) {
							// Ensure children[index].props.children is an array before attempting to push
							// Fix for errors on multiple embeds in single messages
							if (!Array.isArray(children[index].props.children)) {
								children[index].props.children = [children[index].props.children];
							}

							children[index].props.children.push(
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: `${BDFDB.LanguageUtils.getName(translation.input)} ➝ ${BDFDB.LanguageUtils.getName(translation.output)}`,
									tooltipConfig: { style: "max-width: 400px" },
									children: BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.messagetimestamp, BDFDB.disCN.messagetimestampinline, BDFDB.disCN._translatortranslated),
										children: BDFDB.ReactUtils.createElement("span", {
											className: BDFDB.disCN.messageedited,
											children: `(${this.labels.translated_watermark})`
										})
									})
								})
							);
						}
					}
				}
				else if (!e.returnvalue && e.instance.props.embed.originalDescription) {
					e.instance.props.embed = Object.assign({}, e.instance.props.embed, {
						rawDescription: e.instance.props.embed.originalDescription,
						rawTitle: e.instance.props.embed.originalTitle,
						fields: e.instance.props.embed.originalFields,
						footer: e.instance.props.embed.originalFooter
					});
					delete e.instance.props.embed.originalDescription;
					delete e.instance.props.embed.originalTitle;
					delete e.instance.props.embed.originalFields;
					delete e.instance.props.embed.originalFooter;
				}
			}
			
			toggleTranslation (channelId) {
				if (!this.isTranslationEnabled(channelId)) translationEnabledStates.push(this.settings.general.usePerChatTranslation ? channelId : "global");
				else BDFDB.ArrayUtils.remove(translationEnabledStates, this.settings.general.usePerChatTranslation ? channelId : "global", true);
				BDFDB.DataUtils.save(translationEnabledStates, this, "translationEnabledStates");
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
							name: this.labels.detect_language,
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
						},
                        hex: {
                            special: true,
                            name: "Hexadecimal",
                            id: "hex"
                        },
					}
				);
				for (let id in languages) languages[id].fav = favorites.includes(id) ? 0 : 1;
				languages = BDFDB.ObjectUtils.sort(languages, "fav");
			}

			getLanguageChoice (direction, place, channelId) {
				let choice;
				let channel = channelId && BDFDB.LibraryStores.ChannelStore.getChannel(channelId);
				let guildId = channel ? (channel.guild_id ? channel.guild_id : "@me") : null;
				if (channelLanguages[channelId] && channelLanguages[channelId][place]) choice = channelLanguages[channelId][place][direction];
				else if (guildId && guildLanguages[guildId] && guildLanguages[guildId][place]) choice = guildLanguages[guildId][place][direction];
				else choice = this.settings.choices[place] && this.settings.choices[place][direction];
				choice = languages[choice] ? choice : Object.keys(languages)[0];
				choice = direction == languageTypes.OUTPUT && choice == "auto" ? "en" : choice;
				return choice;
			}

			saveLanguageChoice (choice, direction, place, channelId) {
				let channel = channelId && BDFDB.LibraryStores.ChannelStore.getChannel(channelId);
				let guildId = channel ? (channel.guild_id ? channel.guild_id : "@me") : null;
				if (channelLanguages[channelId] && channelLanguages[channelId][place]) {
					channelLanguages[channelId][place][direction] = choice;
					BDFDB.DataUtils.save(channelLanguages, this, "channelLanguages");
				}
				else if (guildLanguages[guildId] && guildLanguages[guildId][place]) {
					guildLanguages[guildId][place][direction] = choice;
					BDFDB.DataUtils.save(guildLanguages, this, "guildLanguages");
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
						let originalContentData = {
							content: message.content || "",
							embeds: message.embeds.map(embed => ({
								description: embed.rawDescription || "",
								title: embed.rawTitle || "",
								footerText: embed.footer ? embed.footer.text : "",
								fields: embed.fields ? embed.fields.map(field => ({name: field.rawName, value: field.rawValue})) : []
							}))
						};
						let allTextsToTranslate = originalContentData.content;
						originalContentData.embeds.forEach(embed => {
							allTextsToTranslate += `\n__________________ __________________ __________________\n`;
							allTextsToTranslate += embed.title + "\n" + embed.description;
							embed.fields.forEach(field => {
								allTextsToTranslate += "\n\n" + field.name + "__________________" + field.value;
							});
							if (embed.footerText) allTextsToTranslate += "\n" + embed.footerText;
						});
						message.embeds.forEach(embed => embed.message_id = message.id);
						let embedIds = message.embeds.map(embed => embed.id);
						this.translateText(allTextsToTranslate, messageTypes.RECEIVED, (translation, input, output) => {
							if (translation) {
								let oldStrings = originalContentData.content.split(/\n{0,1}__________________ __________________ __________________\n{0,1}/);
								let strings = translation.split(/\n{0,1}__________________ __________________ __________________\n{0,1}/);
								let oldContent = this.settings.general.showOriginalMessage && (oldStrings.shift() || "").trim();
								let content = (strings.shift() || "").trim() + (oldContent ? (!this.settings.general.useSpoilerInOriginal ? ("\n\n> *" + oldContent.split("\n").join("*\n> *") + "*").replace(/> \*\*\n/g, "> \n") : `\n\n||${oldContent}||`) : "");
								let embeds = strings.reduce((dict, segment, index) => {
									let embedId = embedIds[index];
									let segmentLines = segment.split("\n");
									let title = segmentLines.shift();
									let description = segmentLines.shift();
									let footerText = segmentLines.pop();
									let fieldsSegment = segmentLines.join("\n").split("\n\n");
									let fields = fieldsSegment.map(line => {
										let [name, value] = line.split("__________________");
										return {name, value};
									});

									dict[embedId] = {title, description, fields, footerText};
									return dict;
								}, {});
								oldMessages[message.id] = new BDFDB.DiscordObjects.Message(message);
								oldMessages[message.id].originalContentData = originalContentData;
								translatedMessages[message.id] = {
									content: content,
									embeds: embeds,
									input,
									output
								};
								BDFDB.MessageUtils.rerenderAll(true);
							}
							callback(true);
						});
					}
				});
			}

			translateText (text, place, callback, forcedOutputLanguage = null) {
				let toast = null, toastInterval, finished = false, finishTranslation = translation => {
					isTranslating = false;
					if (toast) toast.close();
					
					if (finished) return;
					finished = true;
					if (translation) translation = this.addExceptions(translation, excepts);
					callback(translation == text ? "" : translation, input, output);
				};
				let [newText, excepts, translate] = this.removeExceptions(text.trim(), place);
				let channelId = BDFDB.LibraryStores.SelectedChannelStore.getChannelId();
				let input = Object.assign({}, languages[this.getLanguageChoice(languageTypes.INPUT, place, channelId)]);
				let output = forcedOutputLanguage ? 
					Object.assign({}, languages[forcedOutputLanguage] || {id: forcedOutputLanguage, name: forcedOutputLanguage}) : 
					Object.assign({}, languages[this.getLanguageChoice(languageTypes.OUTPUT, place, channelId)]);
				
				if (translate && input.id != output.id) {
					let specialCase = this.checkForSpecialCase(newText, input);
					if (specialCase) {
						input.name = specialCase.name;
						switch (specialCase.id) {
							case "binary": newText = this.binary2string(newText); break;
							case "braille": newText = this.braille2string(newText); break;
							case "morse": newText = this.morse2string(newText); break;
                            case "hex": newText = this.hex2string(newText); break;
						}
					}
					if (output.special) {
						switch (output.id) {
							case "binary": newText = this.string2binary(newText); break;
							case "braille": newText = this.string2braille(newText); break;
							case "morse": newText = this.string2morse(newText); break;
                            case "hex": newText = this.string2hex(newText); break;
						}
						finishTranslation(newText);
					}
					else {
						const startTranslating = engine => {
							isTranslating = true;
							if (toast) toast.close();
							BDFDB.TimeUtils.clear(toastInterval);
							
							toast = BDFDB.NotificationUtils.toast(`${this.labels.toast_translating} (${translationEngines[engine].name}) - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`, {
								timeout: 0,
								ellipsis: true,
								position: "center",
								onClose: _ => BDFDB.TimeUtils.clear(toastInterval)
							});
							toastInterval = BDFDB.TimeUtils.interval((_, count) => {
								if (count < 40) return;
								finishTranslation("");
								BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed} (${translationEngines[engine].name}) - ${this.labels.toast_translating_tryanother}`, {
									type: "danger",
									position: "center"
								});
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
				BDFDB.LibraryRequires.request("https://translate.googleapis.com/translate_a/single", {
					form: {
						"client": "gtx",
						"dt": "t",
						"dj": "1",
						"source": "input",
						"sl": data.input.id,
						"tl": data.output.id,
						"q": encodeURIComponent(data.text)
					}
				}, (error, response, body) => {
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
						if (response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_hourlylimit}`, {
							type: "danger",
							position: "center"
						});
						else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}
			
			microsoftTranslate (data, callback) {
				BDFDB.LibraryRequires.request("https://api.cognitive.microsofttranslator.com/translate", {
					method: "post",
					headers: {
						"Content-Type": "application/json",
						"Ocp-Apim-Subscription-Key": authKeys.microsoft && authKeys.microsoft.key || "1ea861033a56423f860fd6f5ff33e308",
						"Ocp-Apim-Subscription-Region": authKeys.microsoft && authKeys.microsoft.region || "global"
					},
					body: JSON.stringify([{"Text": data.text}]),
					form: Object.assign({
						"api-version": "3.0",
						"to": data.output.id
					}, data.input.auto ? {} : {"from": data.input.id})
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body)[0];
							if (!data.specialCase && body.detectedLanguage && body.detectedLanguage.language && languages[body.detectedLanguage.language.toLowerCase()]) {
								data.input.name = languages[body.detectedLanguage.language.toLowerCase()].name;
								data.input.ownlang = languages[body.detectedLanguage.language.toLowerCase()].ownlang;
							}
							callback(body.translations.map(n => n && n.text).filter(n => n).join(""));
						}
						catch (err) {callback("");}
					}
					else {
						if (response.statusCode == 403 || response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_dailylimit}`, {
							type: "danger",
							position: "center"
						});
						else if (response.statusCode == 401) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_keyoutdated}`, {
							type: "danger",
							position: "center"
						});
						else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}
			
			deepLTranslate (data, callback) {
				BDFDB.LibraryRequires.request(authKeys.deepl && authKeys.deepl.paid ? "https://api.deepl.com/v2/translate" : "https://api-free.deepl.com/v2/translate", {
					method: "post",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `DeepL-Auth-Key ${authKeys.deepl && authKeys.deepl.key || "75cc2f40-fdae-14cd-7242-6a384e2abb9c:fx"}`
					},
					body: JSON.stringify(Object.assign({
						"text": [data.text],
						"target_lang": data.output.id
					}, data.input.auto ? {} : {"source_lang": data.input.id}))
				}, (error, response, body) => {
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
						if (response.statusCode == 429 || response.statusCode == 456) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_dailylimit}`, {
							type: "danger",
							position: "center"
						});
						else if (response.statusCode == 403) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_keyoutdated}`, {
							type: "danger",
							position: "center"
						});
						else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
								type: "danger",
								position: "center"
							});
						callback("");
					}
				});
			}

			deepSeekTranslate(data, callback) {
				const translationPrompt = `
				You are a professional localization expert. Translate the following ${data.input.auto ? "" : data.input.name + " "}content to ${data.output.name} following these rules:
				1. Return ONLY the translation without any explanations
				2. Use natural, fluent language
				3. Maintain consistent terminology for technical/game terms  
				4. Preserve the original tone and style
				5. Use concise sentence structures
				6. Handle numbers/units/proper nouns correctly
				7. Use community-approved expressions for game content
				8. Convert [NEWLINE] markers to actual line breaks (don't show them literally)
				
				Text to translate:
				${data.text.replace(/\n/g, " [NEWLINE] ").replace(/\s+/g, " ")}
				`;

				const requestData = {
					model: "deepseek-chat",
					messages: [{
						role: "system",
						content: "You are a senior bilingual localization specialist"
					}, {
						role: "user",
						content: translationPrompt
					}],
					temperature: 0.2,
					top_p: 0.8
				};

				BDFDB.LibraryRequires.request("https://api.deepseek.com/v1/chat/completions", {
					method: "post",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${authKeys.deepseek && authKeys.deepseek.key || ""}`
					},
					body: JSON.stringify(requestData)
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
							body = JSON.parse(body);
							let translatedText = body.choices[0].message.content;
							translatedText = translatedText.replace(/\[NEWLINE\]/g, '\n');
							callback(translatedText);
						} catch (err) {
							console.error("DeepSeek translation error:", err);
							callback("");
						}
					} else {
						if (response.statusCode == 401 || response.statusCode == 403) {
							BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_keyoutdated}`, {
								type: "danger",
								position: "center"
							});
						} else if (response.statusCode == 429) {
							BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_dailylimit}`, {
								type: "danger",
								position: "center"
							});
						} else {
							BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
								type: "danger",
								position: "center"
							});
						}
						callback("");
					}
				});
			}
			
			iTranslateTranslate (data, callback) {
				let translate = _ => {
					BDFDB.LibraryRequires.request("https://web-api.itranslateapp.com/v3/texts/translate", {
						method: "post",
						headers: {
							"API-KEY": authKeys.itranslate && authKeys.itranslate.key || data.engine.APIkey
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
							if (response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_dailylimit}`, {
								type: "danger",
								position: "center"
							});
							else if (response.statusCode == 403) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_keyoutdated}`, {
								type: "danger",
								position: "center"
							});
							else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
								type: "danger",
								position: "center"
							});
							callback("");
						}
					});
				};
				if (authKeys.itranslate && authKeys.itranslate.key || data.engine.APIkey) translate();
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
				BDFDB.LibraryRequires.request("https://translate.yandex.net/api/v1.5/tr/translate", {
					form: {
						"key": authKeys.yandex && authKeys.yandex.key || "trnsl.1.1.20191206T223907Z.52bd512eca953a5b.1ec123ce4dcab3ae859f312d27cdc8609ab280de",
						"text": encodeURIComponent(data.text),
						"lang": data.specialCase || data.input.auto ? data.output.id : (data.input.id + "-" + data.output.id),
						"options": "1"
					}
				}, (error, response, body) => {
					if (!error && body && response.statusCode == 200) {
						try {
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
						catch (err) {callback("");}
					}
					else if (body && body.indexOf('code="408"') > -1) {
						BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_monthlylimit}`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
					else {
						BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}/${this.labels.error_keyoutdated}`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}
			
			papagoTranslate (data, callback) {
				const credentials = (authKeys.papago && authKeys.papago.key || "kUNGxtAmTJQFbaFehdjk zC70k3VhpM").split(" ");
				const doTranslate = langCode => {
					BDFDB.LibraryRequires.request("https://openapi.naver.com/v1/papago/n2mt", {
						method: "post",
						headers: {
							"X-Naver-Client-Id": credentials[0],
							"X-Naver-Client-Secret": credentials[1],
							"Content-Type": "application/x-www-form-urlencoded"
						},
						form: {
							source: langCode,
							target: data.output.id,
							text: data.text
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
							if (response.statusCode == 429) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_hourlylimit}`, {
								type: "danger",
								position: "center"
							});
							else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}/${this.labels.error_keyoutdated}`, {
								type: "danger",
								position: "center"
							});
							callback("");
						}
					});
				};
				if (data.input.auto) {
					BDFDB.LibraryRequires.request("https://openapi.naver.com/v1/papago/detectLangs", {
						method: "post",
						headers: {
							"X-Naver-Client-Id": credentials[0],
							"X-Naver-Client-Secret": credentials[1],
							"Content-Type": "application/x-www-form-urlencoded"
						},
						form: {
							query: data.text,
						}
					}, (error, response, body) => {
						let langCode = "en";
						if (!error && body && response.statusCode == 200) {
							try {
								langCode = JSON.parse(body)["langCode"];
							} catch (err) {
								langCode = "en";
							}
						}
						data.input.name = languages[langCode].name;
						data.input.ownlang = languages[langCode].ownlang;
						doTranslate(langCode);
					});
				}
				else doTranslate(data.input.id);
			}
			
			baiduTranslate (data, callback) {
				const credentials = (authKeys.baidu && authKeys.baidu.key || "20221009001380882 TOPnUKz8jJ32AZNOuUhX").split(" ");
				const salt = BDFDB.NumberUtils.generateId();
				BDFDB.LibraryRequires.request("https://fanyi-api.baidu.com/api/trans/vip/translate", {
					bdVersion: true,
					method: "post",
					form: {
						from: translationEngines.baidu.parser[data.input.id] || data.input.id,
						to: translationEngines.baidu.parser[data.output.id] || data.output.id,
						q: encodeURIComponent(data.text),
						appid: credentials[0],
						salt: salt,
						sign: this.MD5(credentials[0] + data.text + salt + (credentials[2] || credentials[1]))
					}
				}, (error, response, result) => {
					if (!error && result && response.statusCode == 200) {
						try {
							result = JSON.parse(result) || {};
							if (!result.error_code) {
								let messages = result.trans_result;
								if (messages && messages.length > 0 && result.from != result.to) callback(messages.map(message => decodeURIComponent(message.dst)).join("\n"));
								else {callback("");}
							}
							else {
								if (result.error_code == 54004) BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_monthlylimit}.`, {
									type: "danger",
									position: "center"
								});
								else BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${result.error_code} : ${result.error_msg}.`, {
									type: "danger",
									position: "center"
								});
								callback("");
							}
						}
						catch (err) {callback("");}
					}
					else {
						BDFDB.NotificationUtils.toast(`${this.labels.toast_translating_failed}. ${this.labels.toast_translating_tryanother}. ${this.labels.error_serverdown}`, {
							type: "danger",
							position: "center"
						});
						callback("");
					}
				});
			}
			
			MD5 (e) {
				function h(a, b) {
					var e = a & 2147483648, f = b & 2147483648, c = a & 1073741824, d = b & 1073741824, g = (a & 1073741823) + (b & 1073741823);
					return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
				}
				function k(a, b, c, d, e, f, g) {
					a = h(a, h(h(b & c | ~b & d, e), g));
					return h(a << f | a >>> 32 - f, b);
				}
				function l(a, b, c, d, e, f, g) {
					a = h(a, h(h(b & d | c & ~d, e), g));
					return h(a << f | a >>> 32 - f, b);
				}
				function m(a, b, d, c, e, f, g) {
					a = h(a, h(h(b ^ d ^ c, e), g));
					return h(a << f | a >>> 32 - f, b)
				}
				function n(a, b, d, c, e, f, g) {
					a = h(a, h(h(d ^ (b | ~c), e), g));
					return h(a << f | a >>> 32 - f, b);
				}
				function p(a) {
					var b = "", d = "", c;
					for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
					return b;
				}
				
				var f = [], q, r, s, t, a, b, c, d;
				e = function(a) {
					a = a.replace(/\r\n/g, "\n");
					for (var b = "", d = 0; d < a.length; d++) {
						var c = a.charCodeAt(d);
						128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
					}
					return b;
				}(e);
				f = function(b) {
					var a, c = b.length;
					a = c + 8;
					for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
					a = (g - g % 4) / 4;
					e[a] |= 128 << g % 4 * 8;
					e[d - 2] = c << 3;
					e[d - 1] = c >>> 29;
					return e
				}(e);
				a = 1732584193, b = 4023233417, c = 2562383102, d = 271733878;
				for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
				return (p(a) + p(b) + p(c) + p(d)).toLowerCase();
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
					else if (/^(0x[0-9a-fA-F]{2}\s*)+$/.test(text.replace(/\s/g, ""))) {
						return {id: "hex", name: "Hexadecimal"};
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
			string2hex(string) {
				let hex = "";
				for (let character of string) {
					hex += "0x" + character.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0") + " ";
				}
				return hex.trim();
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

			hex2string(hex) {
				let string = "";
				for (let part of hex.trim().split(/\s+/)) {
					if (part.startsWith("0x") || part.startsWith("0X")) {
						part = part.slice(2);
					}
					if (part.length === 2 && /^[0-9a-fA-F]{2}$/.test(part)) {
						string += String.fromCharCode(parseInt(part, 16));
					}
				}
				return string;
			}			

			addExceptions (string, excepts) {
				for (let count in excepts) {
					let exception = BDFDB.ArrayUtils.is(this.settings.exceptions.wordStart) && this.settings.exceptions.wordStart.some(n => excepts[count].indexOf(n) == 0) ? excepts[count].slice(1) : excepts[count];
					let newString = string.replace(new RegExp(`[｛\{]\\s*[｛\{]\\s*${count}\\s*[｝\}]\\s*[｝\}]`), exception);
					if (newString == string) string = newString + " " + exception;
					else string = newString;
				}
				return string;
			}

			removeExceptions (string, place) {
				let emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/;
				let excepts = {}, newString = [], count = 0;
				if (place == messageTypes.RECEIVED) {
					let text = [], i = 0;
					string.split("").forEach((chara, index, array) => { 
						if (chara == "<" && text[i] || emojiRegex.test(chara) && emojiRegex.test(array[index+1])) i++;
						text[i] = text[i] ? text[i] + chara : chara;
						if (chara == ">" || emojiRegex.test(chara) && emojiRegex.test(array[index-1])) i++;
					});
					for (let j in text) {
						if (text[j].indexOf("<") == 0 || emojiRegex.test(text[j])) {
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
						if (emojiRegex.test(word) || word.indexOf("<@!") == 0 || word.indexOf("<#") == 0 || word.indexOf(":") == 0 || word.indexOf("<:") == 0 || word.indexOf("<a:") == 0 || word.indexOf("@") == 0 || word.indexOf("#") == 0 || usedExceptions.some(n => word.indexOf(n) == 0 && word.length > 1)) {
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
							backup_engine:						"Резервен-Преводач",
							backup_engine_warning:					"Ще използва Резервен-Преводач",
							context_messagetranslateoption:				"Превод на съобщението",
							context_messageuntranslateoption:			"Превод на съобщението",
							context_translator:					"Търсене превод",
							detect_language:					"Разпознаване на езика",
							error_dailylimit:					"Дневният лимит на заявките е достигнат.",
							error_hourlylimit:					"Почасовият лимит на заявките е достигнат.",
							error_keyoutdated:					"API-ключът е остарял.",
							error_monthlylimit:					"Месечният лимит на заявките е достигнат.",
							error_serverdown:					"Сървърът за превод може да е офлайн.",
							exception_text:						"Думите, започващи с {{var0}}, ще бъдат игнорирани",
							general_addQuickTranslateButton:			"Добавя бърз бутон за превод в лентата за действия за съобщения",
							general_addTranslateButton:				"Добавя бутон за превод към текстовото поле на канала",
							general_sendOriginalMessage:				"Също така изпраща оригиналното съобщение, когато превежда вашето изпратено съобщение",
							general_showOriginalMessage:				"Също така показва оригиналното съобщение при превод на получено съобщение",
							general_usePerChatTranslation:				"Активира/деактивира състоянието на бутона за преводач за всеки канал, а не глобално",
							language_choice_input_received:				"Език на въвеждане в получените съобщения",
							language_choice_input_sent:				"Език на въвеждане в изпратените от вас съобщения",
							language_choice_output_received:			"Изходен език в получените съобщения",
							language_choice_output_sent:				"Изходен език в изпратените ви съобщения",
							language_selection_channel:				"Изборът на език ще бъде променен специално за този канал",
							language_selection_global:				"Изборът на език ще бъде променен за всички сървъри",
							language_selection_server:				"Изборът на език ще бъде променен специално за този сървър",
							popout_translateoption:					"Превод",
							popout_untranslateoption:				"Непревод",
							prefixes_disable_text:					"Префикси, които деактивират превода на съобщението",
							prefixes_enable_text:					"Префикси, които активират превод със специфичен език (напр. $fr, $de, $jp)",
							toast_translating:					"Превод",
							toast_translating_failed:				"Преводът не бе успешен",
							toast_translating_tryanother:				"Опитайте друг преводач",
							translate_your_message:					"Преведете вашите съобщения преди изпращане",
							translated_watermark:					"преведено",
							translator_engine:					"Преводач"
						};
					case "cs":		// Czech
						return {
							backup_engine:						"Backup-Překladatel",
							backup_engine_warning:					"Použije Backup-Překladatel",
							context_messagetranslateoption:				"Přeložit zprávu",
							context_messageuntranslateoption:			"Přeložit zprávu",
							context_translator:					"Hledat Překlad",
							detect_language:					"Rozpoznat jazyk",
							error_dailylimit:					"Denní limit požadavků byl dosažen.",
							error_hourlylimit:					"Bylo dosaženo limitu hodinového požadavku.",
							error_keyoutdated:					"Klíč API je zastaralý.",
							error_monthlylimit:					"Byl dosažen limit měsíčních požadavků.",
							error_serverdown:					"Překladový server může být offline.",
							exception_text:						"Slova začínající na {{var0}} budou ignorována",
							general_addQuickTranslateButton:			"Přidá tlačítko rychlého překladu do panelu Actions Message",
							general_addTranslateButton:				"Přidá tlačítko Přeložit do textové oblasti kanálu",
							general_sendOriginalMessage:				"Při překladu odeslané zprávy také odešle původní zprávu",
							general_showOriginalMessage:				"Také zobrazuje původní zprávu při překladu přijaté zprávy",
							general_usePerChatTranslation:				"Povolí/zakáže stav tlačítka překladače pro kanál, nikoli globálně",
							language_choice_input_received:				"Vstupní jazyk do přijatých zpráv",
							language_choice_input_sent:				"Zadejte jazyk do odeslaných zpráv",
							language_choice_output_received:			"Výstupní jazyk v přijatých zprávách",
							language_choice_output_sent:				"Jazyk výstupu ve vašich odeslaných zprávách",
							language_selection_channel:				"Výběr jazyka bude změněn speciálně pro tento kanál",
							language_selection_global:				"Výběr jazyka se změní pro všechny servery",
							language_selection_server:				"Výběr jazyka bude změněn speciálně pro tento server",
							popout_translateoption:					"Přeložit",
							popout_untranslateoption:				"Nepřeložit",
							prefixes_disable_text:					"Předpony, které deaktivují překlad zprávy",
							prefixes_enable_text:					"Předpony, které aktivují překlad s konkrétním jazykem (např. $fr, $de, $jp)",
							toast_translating:					"Překládání",
							toast_translating_failed:				"Překlad se nezdařil",
							toast_translating_tryanother:				"Zkuste jiný překladač",
							translate_your_message:					"Před odesláním si zprávy přeložte",
							translated_watermark:					"přeloženo",
							translator_engine:					"Překladatel"
						};
					case "da":		// Danish
						return {
							backup_engine:						"Backup-Oversætter",
							backup_engine_warning:					"Vil bruge Backup-Oversætter",
							context_messagetranslateoption:				"Oversæt besked",
							context_messageuntranslateoption:			"Ikke-oversat besked",
							context_translator:					"Søg oversættelse",
							detect_language:					"Find sprog",
							error_dailylimit:					"Daglig anmodningsgrænse nået.",
							error_hourlylimit:					"Timegrænsen for anmodning er nået.",
							error_keyoutdated:					"API-nøgle forældet.",
							error_monthlylimit:					"Månedlig anmodningsgrænse nået.",
							error_serverdown:					"Oversættelsesserveren er muligvis offline.",
							exception_text:						"Ord, der begynder med {{var0}}, ignoreres",
							general_addQuickTranslateButton:			"Tilføjer en hurtig oversættelsesknap i linjen Message Actions",
							general_addTranslateButton:				"Tilføjer en Oversæt-knap til kanaltekstområdet",
							general_sendOriginalMessage:				"Sender også den originale besked, når du oversætter din sendte besked",
							general_showOriginalMessage:				"Viser også den originale besked, når du oversætter modtaget besked",
							general_usePerChatTranslation:				"Aktiverer/deaktiverer oversætterknappens tilstand pr. kanal og ikke globalt",
							language_choice_input_received:				"Inputsprog i modtagne beskeder",
							language_choice_input_sent:				"Indtast sprog i dine sendte beskeder",
							language_choice_output_received:			"Outputsprog i modtagne beskeder",
							language_choice_output_sent:				"Outputsprog i dine sendte beskeder",
							language_selection_channel:				"Valg af sprog vil blive ændret specifikt for denne kanal",
							language_selection_global:				"Valg af sprog vil blive ændret for alle servere",
							language_selection_server:				"Sprogvalg vil blive ændret specifikt for denne server",
							popout_translateoption:					"Oversætte",
							popout_untranslateoption:				"Untranslate",
							prefixes_disable_text:					"Præfikser, der deaktiverer oversættelse af meddelelse",
							prefixes_enable_text:					"Præfikser, der aktiverer oversættelse med specifikt sprog (f.eks. $fr, $de, $jp)",
							toast_translating:					"Oversætter",
							toast_translating_failed:				"Kunne ikke oversætte",
							toast_translating_tryanother:				"Prøv en anden oversætter",
							translate_your_message:					"Oversæt dine beskeder før afsendelse",
							translated_watermark:					"oversat",
							translator_engine:					"Oversætter"
						};
					case "de":		// German
						return {
							backup_engine:						"Backup-Übersetzer",
							backup_engine_warning:					"Wird Backup-Übersetzer verwenden",
							context_messagetranslateoption:				"Nachricht übersetzen",
							context_messageuntranslateoption:			"Nachricht unübersetzen",
							context_translator:					"Übersetzung suchen",
							detect_language:					"Sprache erkennen",
							error_dailylimit:					"Tägliches Anforderungslimit erreicht.",
							error_hourlylimit:					"Stündliches Anforderungslimit erreicht.",
							error_keyoutdated:					"API-Schlüssel veraltet.",
							error_monthlylimit:					"Monatliches Anforderungslimit erreicht.",
							error_serverdown:					"Der Übersetzungsserver ist möglicherweise offline.",
							exception_text:						"Wörter, die mit {{var0}} beginnen, werden ignoriert",
							general_addQuickTranslateButton:			"Fügt einen Schnellübersetz Schalter zur Nachrichtenaktionsleiste hinzu",
							general_addTranslateButton:				"Fügt dem Textbereich des Kanals eine Schalter zum Übersetzen hinzu",
							general_sendOriginalMessage:				"Sendet auch die ursprüngliche Nachricht, wenn die gesendete Nachricht übersetzt wird",
							general_showOriginalMessage:				"Zeigt auch die ursprüngliche Nachricht an, wenn eine empfangene Nachricht übersetzt wird",
							general_usePerChatTranslation:				"Aktiviert/deaktiviert die Übersetzung pro Kanal und nicht global",
							language_choice_input_received:				"Eingabesprache in empfangenen Nachrichten",
							language_choice_input_sent:				"Eingabesprache in gesendeten Nachrichten",
							language_choice_output_received:			"Ausgabesprache in empfangenen Nachrichten",
							language_choice_output_sent:				"Ausgabesprache in gesendeten Nachrichten",
							language_selection_channel:				"Die Sprachauswahl wird speziell für diesen Kanal geändert",
							language_selection_global:				"Die Sprachauswahl wird für alle Server geändert",
							language_selection_server:				"Die Sprachauswahl wird speziell für diesen Server geändert",
							popout_translateoption:					"Übersetzen",
							popout_untranslateoption:				"Unübersetzen",
							prefixes_disable_text:					"Präfixe, die die Übersetzung der Nachricht deaktivieren",
							prefixes_enable_text:					"Präfixe, die die Übersetzung mit einer bestimmten Sprache aktivieren (z.B. $fr, $de, $jp)",
							toast_translating:					"Übersetzen",
							toast_translating_failed:				"Übersetzung fehlgeschlagen",
							toast_translating_tryanother:				"Versuch einen anderen Übersetzer",
							translate_your_message:					"Übersetzt Nachrichten vor dem Senden",
							translated_watermark:					"übersetzt",
							translator_engine:					"Übersetzer"
						};
					case "el":		// Greek
						return {
							backup_engine:						"Μεταφράστης-Αντίγραφο ασφαλείας",
							backup_engine_warning:					"Θα χρησιμοποιηθεί Μεταφράστης-Αντίγραφο ασφαλείας",
							context_messagetranslateoption:				"Μετάφραση μηνύματος",
							context_messageuntranslateoption:			"Αναίρεση μετάφρασης μηνύματος",
							context_translator:					"Αναζήτηση μετάφρασης",
							detect_language:					"Εντοπισμός γλώσσας",
							error_dailylimit:					"Συμπληρώθηκε το ημερήσιο όριο αιτημάτων.",
							error_hourlylimit:					"Συμπληρώθηκε το ωριαίο όριο αιτημάτων.",
							error_keyoutdated:					"Το κλειδί API δεν είναι ενημερωμένο.",
							error_monthlylimit:					"Συμπληρώθηκε το μηνιαίο όριο αιτημάτων.",
							error_serverdown:					"Ο διακομιστής μετάφρασης ενδέχεται να είναι εκτός σύνδεσης.",
							exception_text:						"Οι λέξεις θα αγνοηθούν που ξεκινούν με {{var0}}",
							general_addQuickTranslateButton:			"Προσθέτει ένα κουμπί γρήγορης μετάφρασης στη γραμμή ενεργειών μηνυμάτων",
							general_addTranslateButton:				"Προσθήκη κουμπιού μετάφρασης στην Περιοχή κειμένου του Καναλιού",
							general_sendOriginalMessage:				"Αποστολή αρχικού Μηνύματος με τη μετάφραση απεσταλμένου μηνύματος",
							general_showOriginalMessage:				"Εμφάνιση αρχικού Μηνύματος με τη μετάφραση ενός ληφθέντος μηνύματος",
							general_usePerChatTranslation:				"(Απ)Ενεργοποίηση κατάστασης κουμπιού μεταφραστή ανά κανάλι",
							language_choice_input_received:				"Γλώσσα εισαγωγής στα ληφθέντα μηνύματα",
							language_choice_input_sent:				"Γλώσσα εισαγωγής στα απεσταλμένα μηνύματά σας",
							language_choice_output_received:			"Γλώσσα εξαγωγής στα ληφθέντα μηνύματα",
							language_choice_output_sent:				"Γλώσσα εξαγωγής στα απεσταλμένα μηνύματά σας",
							language_selection_channel:				"Η επιλογή γλώσσας θα αλλάξει ειδικά για αυτό το κανάλι",
							language_selection_global:				"Η Επιλογή Γλώσσας θα αλλάξει για όλους τους Διακομιστές",
							language_selection_server:				"Η επιλογή γλώσσας θα αλλάξει ειδικά για αυτόν τον διακομιστή",
							popout_translateoption:					"Μετάφραση",
							popout_untranslateoption:				"Αναίρεση μετάφρασης",
							prefixes_disable_text:					"Προθέσεις που απενεργοποιούν την μετάφραση του μηνύματος",
							prefixes_enable_text:					"Προθέσεις που ενεργοποιούν την μετάφραση με συγκεκριμένη γλώσσα (π.χ. $fr, $de, $jp)",
							toast_translating:					"Μετάφραση",
							toast_translating_failed:				"Αποτυχία μετάφρασης",
							toast_translating_tryanother:				"Δοκιμάστε έναν άλλο Μεταφραστή",
							translate_your_message:					"Μεταφράστε τα Μηνύματά σας πριν την αποστολή",
							translated_watermark:					"μεταφρασμένο",
							translator_engine:					"Μεταφράστης"
						};
					case "es":		// Spanish
						return {
							backup_engine:						"Backup-Traductor",
							backup_engine_warning:					"Utilizará Backup-Traductor",
							context_messagetranslateoption:				"Traducir mensaje",
							context_messageuntranslateoption:			"Mensaje sin traducir",
							context_translator:					"Buscar traducción",
							detect_language:					"Detectar idioma",
							error_dailylimit:					"Se alcanzó el límite de solicitudes diarias.",
							error_hourlylimit:					"Se alcanzó el límite de solicitudes por hora.",
							error_keyoutdated:					"API-Key obsoleta.",
							error_monthlylimit:					"Se alcanzó el límite de solicitudes mensuales.",
							error_serverdown:					"El servidor de traducción puede estar fuera de línea.",
							exception_text:						"Las palabras que comienzan con {{var0}} serán ignoradas",
							general_addQuickTranslateButton:			"Agrega un botón de traducción rápida en la barra de acciones del mensaje",
							general_addTranslateButton:				"Agrega un botón de traducción al área de texto del canal",
							general_sendOriginalMessage:				"También envía el mensaje original al traducir su mensaje enviado",
							general_showOriginalMessage:				"También muestra el mensaje original al traducir un mensaje recibido",
							general_usePerChatTranslation:				"Habilita/deshabilita el estado del botón del traductor por canal y no globalmente",
							language_choice_input_received:				"Idioma de entrada en los mensajes recibidos",
							language_choice_input_sent:				"Idioma de entrada en sus mensajes enviados",
							language_choice_output_received:			"Idioma de salida en los mensajes recibidos",
							language_choice_output_sent:				"Idioma de salida en sus mensajes enviados",
							language_selection_channel:				"La selección de idioma se cambiará específicamente para este canal",
							language_selection_global:				"La selección de idioma se cambiará para todos los servidores",
							language_selection_server:				"La selección de idioma se cambiará específicamente para este servidor",
							popout_translateoption:					"Traducir",
							popout_untranslateoption:				"No traducir",
							prefixes_disable_text:					"Prefijos que desactivan la traducción del mensaje",
							prefixes_enable_text:					"Prefijos que activan la traducción con un idioma específico (por ejemplo, $fr, $de, $jp)",
							toast_translating:					"Traductorio",
							toast_translating_failed:				"No se pudo traducir",
							toast_translating_tryanother:				"Prueba con otro traductor",
							translate_your_message:					"Traduce tus mensajes antes de enviarlos",
							translated_watermark:					"traducido",
							translator_engine:					"Traductor"
						};
					case "es-419":		// Spanish (Latin America)
						return {
							backup_engine:						"Traspaso de respaldo",
							backup_engine_warning:					"Utilizará el traductor de respaldo",
							context_messagetranslateoption:				"Mensaje de traducir",
							context_messageuntranslateoption:			"Mensaje no traducido",
							context_translator:					"Traducción de búsqueda",
							detect_language:					"Detectar lenguaje",
							error_dailylimit:					"Límite de solicitud diaria alcanzado.",
							error_hourlylimit:					"Límite de solicitud por hora alcanzado.",
							error_keyoutdated:					"Api-key anticuado.",
							error_monthlylimit:					"Límite de solicitud mensual alcanzado.",
							error_serverdown:					"El servidor de traducción puede estar fuera de línea.",
							exception_text:						"Las palabras que comienzan con {{var0}} se ignorarán",
							general_addQuickTranslateButton:			"Agrega un botón de traducción rápida en la barra de acciones del mensaje",
							general_addTranslateButton:				"Agrega un botón de traducción al canal TextAREA",
							general_sendOriginalMessage:				"También envía el mensaje original al traducir su mensaje enviado",
							general_showOriginalMessage:				"También muestra el mensaje original al traducir un mensaje recibido",
							general_usePerChatTranslation:				"Habilita/deshabilita el estado del botón de traductor por canal y no a nivel mundial",
							language_choice_input_received:				"Idioma de entrada en mensajes recibidos",
							language_choice_input_sent:				"Idioma de entrada en sus mensajes enviados",
							language_choice_output_received:			"Lenguaje de salida en mensajes recibidos",
							language_choice_output_sent:				"Lenguaje de salida en sus mensajes enviados",
							language_selection_channel:				"La selección del idioma se cambiará específicamente para este canal",
							language_selection_global:				"La selección del idioma se cambiará para todos los servidores",
							language_selection_server:				"La selección del idioma se cambiará específicamente para este servidor",
							popout_translateoption:					"Traducir",
							popout_untranslateoption:				"No traducido",
							prefixes_disable_text:					"Prefijos que deshabilitan la traducción del mensaje",
							prefixes_enable_text:					"Prefijos que habilitan la traducción con un lenguaje específico (por ejemplo, $fr, $de, $jp)",
							toast_translating:					"Traductorio",
							toast_translating_failed:				"No se pudo traducir",
							toast_translating_tryanother:				"Prueba otro traductor",
							translate_your_message:					"Traducir sus mensajes antes de enviar",
							translated_watermark:					"traducido",
							translator_engine:					"Traductor"
						};
					case "fi":		// Finnish
						return {
							backup_engine:						"Backup-Kääntäjä",
							backup_engine_warning:					"Käyttää Backup-Kääntäjä",
							context_messagetranslateoption:				"Käännä viesti",
							context_messageuntranslateoption:			"Käännä viesti",
							context_translator:					"Hae käännöstä",
							detect_language:					"Tunnista kieli",
							error_dailylimit:					"Päivittäinen pyyntöraja saavutettu.",
							error_hourlylimit:					"Tuntikohtainen pyyntöraja saavutettu.",
							error_keyoutdated:					"API-avain vanhentunut.",
							error_monthlylimit:					"Kuukauden pyyntöraja saavutettu.",
							error_serverdown:					"Käännöspalvelin saattaa olla offline-tilassa.",
							exception_text:						"{{var0}} alkavat sanat ohitetaan",
							general_addQuickTranslateButton:			"Lisää nopea käännöspainike Message Action -palkkiin",
							general_addTranslateButton:				"Lisää käännöspainikkeen kanavan tekstialueeseen",
							general_sendOriginalMessage:				"Lähettää myös alkuperäisen viestin kääntäessään lähettämääsi viestiä",
							general_showOriginalMessage:				"Näyttää myös alkuperäisen viestin käännettäessä vastaanotettua viestiä",
							general_usePerChatTranslation:				"Ottaa käyttöön/poistaa käytöstä kääntäjän painikkeen tilan kanavakohtaisesti, ei maailmanlaajuisesti",
							language_choice_input_received:				"Syöttökieli vastaanotetuissa viesteissä",
							language_choice_input_sent:				"Syötä kieli lähettämiisi viesteihin",
							language_choice_output_received:			"Tulostuskieli vastaanotetuissa viesteissä",
							language_choice_output_sent:				"Lähetyskieli lähetetyissä viesteissä",
							language_selection_channel:				"Kielen valintaa muutetaan erityisesti tätä kanavaa varten",
							language_selection_global:				"Kielen valintaa muutetaan kaikille palvelimille",
							language_selection_server:				"Kielen valintaa muutetaan erityisesti tätä palvelinta varten",
							popout_translateoption:					"Kääntää",
							popout_untranslateoption:				"Käännä",
							prefixes_disable_text:					"Etuliitteet, jotka poistavat viestin käännöksen käytöstä",
							prefixes_enable_text:					"Etuliitteet, jotka mahdollistavat käännöksen tietyllä kielellä (esim. $fr, $de, $jp)",
							toast_translating:					"Kääntäminen",
							toast_translating_failed:				"Käännös epäonnistui",
							toast_translating_tryanother:				"Kokeile toista kääntäjää",
							translate_your_message:					"Käännä viestisi ennen lähettämistä",
							translated_watermark:					"käännetty",
							translator_engine:					"Kääntäjä"
						};
					case "fr":		// French
						return {
							backup_engine:						"Backup-Traducteur",
							backup_engine_warning:					"Utilisera Backup-Traducteur",
							context_messagetranslateoption:				"Traduire le message",
							context_messageuntranslateoption:			"Message non traduit",
							context_translator:					"Recherche de traduction",
							detect_language:					"Détecter la langue",
							error_dailylimit:					"Limite quotidienne de requêtes atteinte.",
							error_hourlylimit:					"Limite horaire de demandes atteinte.",
							error_keyoutdated:					"Clé API obsolète.",
							error_monthlylimit:					"Limite mensuelle de demandes atteinte.",
							error_serverdown:					"Le serveur de traduction est peut-être hors ligne.",
							exception_text:						"Les mots commençant par {{var0}} seront ignorés",
							general_addQuickTranslateButton:			"Ajoute un bouton de traduire rapidement dans la barre des actions du message",
							general_addTranslateButton:				"Ajoute un bouton de traduction à la zone de texte du canal",
							general_sendOriginalMessage:				"Envoie également le message d'origine lors de la traduction de votre message envoyé",
							general_showOriginalMessage:				"Affiche également le message d'origine lors de la traduction d'un message reçu",
							general_usePerChatTranslation:				"Active/désactive l'état du bouton du traducteur par canal et non globalement",
							language_choice_input_received:				"Langue d'entrée dans les messages reçus",
							language_choice_input_sent:				"Langue d'entrée dans vos messages envoyés",
							language_choice_output_received:			"Langue de sortie dans les messages reçus",
							language_choice_output_sent:				"Langue de sortie dans vos messages envoyés",
							language_selection_channel:				"La sélection de la langue sera modifiée spécifiquement pour ce canal",
							language_selection_global:				"La sélection de la langue sera modifiée pour tous les serveurs",
							language_selection_server:				"La sélection de la langue sera modifiée spécifiquement pour ce serveur",
							popout_translateoption:					"Traduire",
							popout_untranslateoption:				"Non traduit",
							prefixes_disable_text:					"Préfixes qui désactivent la traduction du message",
							prefixes_enable_text:					"Préfixes qui activent la traduction avec un langage spécifique (par exemple, $fr, $de, $jp)",
							toast_translating:					"Traduction en cours",
							toast_translating_failed:				"Échec de la traduction",
							toast_translating_tryanother:				"Essayez un autre traducteur",
							translate_your_message:					"Traduisez vos messages avant de les envoyer",
							translated_watermark:					"traduit",
							translator_engine:					"Traducteur"
						};
					case "hi":		// Hindi
						return {
							backup_engine:						"बैकअप-अनुवादक",
							backup_engine_warning:					"बैकअप-अनुवादक का उपयोग करेंगे",
							context_messagetranslateoption:				"संदेश का अनुवाद करें",
							context_messageuntranslateoption:			"संदेश का अनुवाद न करें",
							context_translator:					"अनुवाद खोजें",
							detect_language:					"भाषा की जांच करो",
							error_dailylimit:					"दैनिक अनुरोध सीमा पूरी हो गई है।",
							error_hourlylimit:					"घंटे के अनुरोध की सीमा पूरी हो गई है.",
							error_keyoutdated:					"एपीआई-कुंजी पुरानी हो चुकी है।",
							error_monthlylimit:					"मासिक अनुरोध सीमा पूरी हो गई है।",
							error_serverdown:					"अनुवाद सर्वर ऑफ़लाइन हो सकता है।",
							exception_text:						"{{var0}} से शुरू होने वाले शब्दों पर ध्यान नहीं दिया जाएगा",
							general_addQuickTranslateButton:			"संदेश कार्रवाई बार में एक त्वरित अनुवाद बटन जोड़ता है",
							general_addTranslateButton:				"चैनल Textarea में एक अनुवाद बटन जोड़ता है",
							general_sendOriginalMessage:				"आपके भेजे गए संदेश का अनुवाद करते समय मूल संदेश भी भेजता है",
							general_showOriginalMessage:				"प्राप्त संदेश का अनुवाद करते समय मूल संदेश भी दिखाता है",
							general_usePerChatTranslation:				"प्रति चैनल अनुवादक बटन स्थिति को सक्षम/अक्षम करता है और विश्व स्तर पर नहीं",
							language_choice_input_received:				"प्राप्त संदेशों में इनपुट भाषा",
							language_choice_input_sent:				"आपके भेजे गए संदेशों में इनपुट भाषा",
							language_choice_output_received:			"प्राप्त संदेशों में आउटपुट भाषा",
							language_choice_output_sent:				"आपके भेजे गए संदेशों में आउटपुट भाषा",
							language_selection_channel:				"इस चैनल के लिए भाषा चयन विशेष रूप से बदला जाएगा",
							language_selection_global:				"सभी सर्वरों के लिए भाषा चयन बदल दिया जाएगा",
							language_selection_server:				"इस सर्वर के लिए भाषा चयन विशेष रूप से बदल दिया जाएगा",
							popout_translateoption:					"अनुवाद करना",
							popout_untranslateoption:				"अनुवाद न करें",
							prefixes_disable_text:					"उपसर्ग जो संदेश के अनुवाद को अक्षम करते हैं",
							prefixes_enable_text:					"उपसर्ग जो विशिष्ट भाषा के साथ अनुवाद को सक्षम करते हैं (जैसे $fr, $de, $jp)",
							toast_translating:					"अनुवाद",
							toast_translating_failed:				"अनुवाद करने में विफल",
							toast_translating_tryanother:				"दूसरे अनुवादक का प्रयास करें",
							translate_your_message:					"भेजने से पहले अपने संदेशों का अनुवाद करें",
							translated_watermark:					"अनुवाद",
							translator_engine:					"अनुवादक"
						};
					case "hr":		// Croatian
						return {
							backup_engine:						"Rezervni-Prevoditelj",
							backup_engine_warning:					"Koristit će se Rezervni-Prevoditelj",
							context_messagetranslateoption:				"Prevedi poruku",
							context_messageuntranslateoption:			"Prevedi poruku",
							context_translator:					"Pretraži prijevod",
							detect_language:					"Prepoznaj jezik",
							error_dailylimit:					"Dosegnuto je dnevno ograničenje zahtjeva.",
							error_hourlylimit:					"Dosegnuto je ograničenje zahtjeva po satu.",
							error_keyoutdated:					"API-ključ zastario.",
							error_monthlylimit:					"Dosegnuto je mjesečno ograničenje zahtjeva.",
							error_serverdown:					"Translation Server možda je offline.",
							exception_text:						"Riječi koje počinju s {{var0}} bit će zanemarene",
							general_addQuickTranslateButton:			"Dodaje gumb za brzo prevođenje u traku Akcija poruka",
							general_addTranslateButton:				"Dodaje gumb Prevedi tekstualnom području kanala",
							general_sendOriginalMessage:				"Također šalje izvornu poruku prilikom prijevoda vaše poslane poruke",
							general_showOriginalMessage:				"Također prikazuje izvornu poruku prilikom prijevoda primljene poruke",
							general_usePerChatTranslation:				"Omogućuje/onemogućuje stanje gumba prevoditelja po kanalu, a ne globalno",
							language_choice_input_received:				"Jezik unosa u primljenim porukama",
							language_choice_input_sent:				"Jezik unosa u vaše poslane poruke",
							language_choice_output_received:			"Izlazni jezik u primljenim porukama",
							language_choice_output_sent:				"Izlazni jezik u vašim poslanim porukama",
							language_selection_channel:				"Odabir jezika bit će promijenjen posebno za ovaj kanal",
							language_selection_global:				"Odabir jezika bit će promijenjen za sve poslužitelje",
							language_selection_server:				"Odabir jezika bit će promijenjen posebno za ovaj poslužitelj",
							popout_translateoption:					"Prevedi",
							popout_untranslateoption:				"Neprevedi",
							prefixes_disable_text:					"Prefiksi koji onemogućuju prijevod poruke",
							prefixes_enable_text:					"Prefiksi koji omogućuju prijevod određenim jezikom (npr. $fr, $de, $jp)",
							toast_translating:					"Prevođenje",
							toast_translating_failed:				"Prijevod nije uspio",
							toast_translating_tryanother:				"Pokušajte s drugim prevoditeljem",
							translate_your_message:					"Prevedite svoje poruke prije slanja",
							translated_watermark:					"prevedeno",
							translator_engine:					"Prevoditelj"
						};
					case "hu":		// Hungarian
						return {
							backup_engine:						"Backup-Fordító",
							backup_engine_warning:					"A Backup-Fordító programot fogja használni",
							context_messagetranslateoption:				"Üzenet lefordítása",
							context_messageuntranslateoption:			"Az üzenet lefordítása",
							context_translator:					"Keresés a fordításban",
							detect_language:					"Nyelvfelismerés",
							error_dailylimit:					"Elérte a napi igénylési korlátot.",
							error_hourlylimit:					"Elérte az óránkénti igénylési korlátot.",
							error_keyoutdated:					"API-kulcs elavult.",
							error_monthlylimit:					"Elérte a havi igénylési limitet.",
							error_serverdown:					"Lehet, hogy a Fordítószerver offline állapotban van.",
							exception_text:						"A(z) {{var0}} kezdetű szavak figyelmen kívül maradnak",
							general_addQuickTranslateButton:			"Hozzáad egy gyors lefordítást a Művelet Művelet sávban",
							general_addTranslateButton:				"Fordítási gombot ad a csatorna szövegterületéhez",
							general_sendOriginalMessage:				"Az eredeti üzenetet is elküldi az elküldött üzenet fordítása során",
							general_showOriginalMessage:				"A fogadott üzenet lefordításakor az eredeti üzenetet is megjeleníti",
							general_usePerChatTranslation:				"Engedélyezi/letiltja a Fordító gomb állapotát csatornánként, nem pedig globálisan",
							language_choice_input_received:				"Beviteli nyelv a fogadott üzenetekben",
							language_choice_input_sent:				"Írja be a nyelvet az elküldött üzenetekben",
							language_choice_output_received:			"Kimeneti nyelv a fogadott üzenetekben",
							language_choice_output_sent:				"Kimeneti nyelv az elküldött üzenetekben",
							language_selection_channel:				"A nyelvválasztás kifejezetten ehhez a csatornához fog módosulni",
							language_selection_global:				"A nyelv kiválasztása minden szerveren módosul",
							language_selection_server:				"A nyelvválasztás kifejezetten ehhez a szerverhez módosul",
							popout_translateoption:					"fordít",
							popout_untranslateoption:				"Fordítás le",
							prefixes_disable_text:					"Az üzenet fordítását letiltó előtagok",
							prefixes_enable_text:					"Előtagok, amelyek lehetővé teszik a fordítás meghatározott nyelvvel (például $fr, $de, $jp)",
							toast_translating:					"Fordítás",
							toast_translating_failed:				"Nem sikerült lefordítani",
							toast_translating_tryanother:				"Próbálkozzon másik fordítóval",
							translate_your_message:					"Küldés előtt fordítsa le az üzeneteit",
							translated_watermark:					"lefordított",
							translator_engine:					"Fordító"
						};
					case "it":		// Italian
						return {
							backup_engine:						"Backup-Traduttore",
							backup_engine_warning:					"Utilizzerà Backup-Traduttore",
							context_messagetranslateoption:				"Traduci messaggio",
							context_messageuntranslateoption:			"Annulla traduzione messaggio",
							context_translator:					"Cerca traduzione",
							detect_language:					"Rileva lingua",
							error_dailylimit:					"Limite di richieste giornaliere raggiunto.",
							error_hourlylimit:					"Limite di richiesta oraria raggiunto.",
							error_keyoutdated:					"Chiave API obsoleta.",
							error_monthlylimit:					"Limite di richieste mensili raggiunto.",
							error_serverdown:					"Il server di traduzione potrebbe essere offline.",
							exception_text:						"Le parole che iniziano con {{var0}} verranno ignorate",
							general_addQuickTranslateButton:			"Aggiunge un pulsante di traduzione rapida nella barra delle azioni del messaggio",
							general_addTranslateButton:				"Aggiunge un pulsante Traduci all'area di testo del canale",
							general_sendOriginalMessage:				"Invia anche il messaggio originale durante la traduzione del messaggio inviato",
							general_showOriginalMessage:				"Mostra anche il messaggio originale durante la traduzione di un messaggio ricevuto",
							general_usePerChatTranslation:				"Abilita/disabilita lo stato del pulsante Translator per canale e non globalmente",
							language_choice_input_received:				"Lingua di input nei messaggi ricevuti",
							language_choice_input_sent:				"Inserisci la lingua nei tuoi messaggi inviati",
							language_choice_output_received:			"Lingua di output nei messaggi ricevuti",
							language_choice_output_sent:				"Lingua di output nei messaggi inviati",
							language_selection_channel:				"La selezione della lingua verrà modificata in modo specifico per questo canale",
							language_selection_global:				"La selezione della lingua verrà modificata per tutti i server",
							language_selection_server:				"La selezione della lingua verrà modificata in modo specifico per questo server",
							popout_translateoption:					"Tradurre",
							popout_untranslateoption:				"Non tradurre",
							prefixes_disable_text:					"Parole che iniziano con {{var0}} verranno ignorate",
							prefixes_enable_text:					"Parole che attivano la traduzione con un linguaggio specifico (ad esempio, $fr, $de, $jp)",
							toast_translating:					"Tradurre",
							toast_translating_failed:				"Impossibile tradurre",
							toast_translating_tryanother:				"Prova un altro traduttore",
							translate_your_message:					"Traduci i tuoi messaggi prima di inviarli",
							translated_watermark:					"tradotto",
							translator_engine:					"Traduttore"
						};
					case "ja":		// Japanese
						return {
							backup_engine:						"バックアップ翻訳者",
							backup_engine_warning:					"バックアップ翻訳者 を使用します",
							context_messagetranslateoption:				"メッセージの翻訳",
							context_messageuntranslateoption:			"メッセージの翻訳解除",
							context_translator:					"翻訳を検索",
							detect_language:					"言語を検出",
							error_dailylimit:					"1 日のリクエスト上限に達しました。",
							error_hourlylimit:					"1 時間あたりのリクエスト制限に達しました。",
							error_keyoutdated:					"API キーが古くなっています。",
							error_monthlylimit:					"月間リクエスト制限に達しました。",
							error_serverdown:					"翻訳サーバーがオフラインになっている可能性があります。",
							exception_text:						"{{var0}} で始まる単語は無視されます",
							general_addQuickTranslateButton:			"メッセージアクションバーにクイック翻訳ボタンを追加します",
							general_addTranslateButton:				"チャンネルのテキストエリアに翻訳ボタンを追加します",
							general_sendOriginalMessage:				"送信したメッセージを翻訳するときに元のメッセージも送信します",
							general_showOriginalMessage:				"受信したメッセージを翻訳するときに元のメッセージも表示します",
							general_usePerChatTranslation:				"グローバルではなく、チャネルごとに翻訳者ボタンの状態を有効/無効にします",
							language_choice_input_received:				"受信メッセージの入力言語",
							language_choice_input_sent:				"送信メッセージの入力言語",
							language_choice_output_received:			"受信メッセージの出力言語",
							language_choice_output_sent:				"送信メッセージの出力言語",
							language_selection_channel:				"言語の選択は、このチャンネル専用に変更されます",
							language_selection_global:				"すべてのサーバーの言語選択が変更されます",
							language_selection_server:				"言語の選択は、このサーバー専用に変更されます",
							popout_translateoption:					"翻訳する",
							popout_untranslateoption:				"翻訳しない",
							prefixes_disable_text:					"メッセージの翻訳を無効にするプレフィックス",
							prefixes_enable_text:					"特定の言語で翻訳を可能にするプレフィックス（例：$fr, $de, $jp）",
							toast_translating:					"翻訳",
							toast_translating_failed:				"翻訳に失敗しました",
							toast_translating_tryanother:				"別の翻訳者を試す",
							translate_your_message:					"送信する前にメッセージを翻訳する",
							translated_watermark:					"翻訳済み",
							translator_engine:					"翻訳者"
						};
					case "ko":		// Korean
						return {
							backup_engine:						"백업 번역기",
							backup_engine_warning:					"백업 번역기를 사용합니다",
							context_messagetranslateoption:				"메시지 번역",
							context_messageuntranslateoption:			"메시지 번역 취소",
							context_translator:					"번역 검색",
							detect_language:					"언어를 감지",
							error_dailylimit:					"일일 요청 한도에 도달했습니다.",
							error_hourlylimit:					"시간당 요청 한도에 도달했습니다.",
							error_keyoutdated:					"API 키가 오래되었습니다.",
							error_monthlylimit:					"월간 요청 한도에 도달했습니다.",
							error_serverdown:					"번역 서버가 오프라인일 수 있습니다.",
							exception_text:						"{{var0}}로 시작하는 단어는 무시됩니다.",
							general_addQuickTranslateButton:			"메시지 동작 막대에서 빠른 번역 버튼 추가",
							general_addTranslateButton:				"채널 텍스트 영역에 번역 버튼 추가",
							general_sendOriginalMessage:				"또한 보낸 메시지를 번역할 때 원본 메시지를 보냅니다.",
							general_showOriginalMessage:				"또한 수신된 메시지를 번역할 때 원본 메시지를 표시합니다.",
							general_usePerChatTranslation:				"전역이 아닌 채널별로 번역기 버튼 상태를 활성화/비활성화합니다.",
							language_choice_input_received:				"수신된 메시지의 입력 언어",
							language_choice_input_sent:				"보낸 메시지의 입력 언어",
							language_choice_output_received:			"수신된 메시지의 출력 언어",
							language_choice_output_sent:				"보낸 메시지의 출력 언어",
							language_selection_channel:				"이 채널에 대해 특별히 언어 선택이 변경됩니다.",
							language_selection_global:				"모든 서버에 대해 언어 선택이 변경됩니다.",
							language_selection_server:				"이 서버에 대해 특별히 언어 선택이 변경됩니다.",
							popout_translateoption:					"옮기다",
							popout_untranslateoption:				"번역 취소",
							prefixes_disable_text:					"메시지 변환을 비활성화하는 접두사",
							prefixes_enable_text:					"특정 언어로 변환을 가능하게하는 접두사 (예: $fr, $de, $jp)",
							toast_translating:					"번역 중",
							toast_translating_failed:				"번역하지 못했습니다.",
							toast_translating_tryanother:				"다른 번역기 시도",
							translate_your_message:					"보내기 전에 메시지 번역",
							translated_watermark:					"번역",
							translator_engine:					"역자"
						};
					case "lt":		// Lithuanian
						return {
							backup_engine:						"Backup-Vertėjas",
							backup_engine_warning:					"Naudos Backup-Vertėjas",
							context_messagetranslateoption:				"Versti pranešimą",
							context_messageuntranslateoption:			"Išversti pranešimą",
							context_translator:					"Paieškos vertimas",
							detect_language:					"Aptikti kalbą",
							error_dailylimit:					"Pasiektas dienos užklausų limitas.",
							error_hourlylimit:					"Pasiektas valandinių užklausų limitas.",
							error_keyoutdated:					"API raktas pasenęs.",
							error_monthlylimit:					"Pasiektas mėnesio užklausų limitas.",
							error_serverdown:					"Vertimo serveris gali būti neprisijungęs.",
							exception_text:						"Žodžiai, prasidedantys {{var0}}, bus ignoruojami",
							general_addQuickTranslateButton:			"Prideda greito vertimo mygtuką pranešimo veiksmų juostoje",
							general_addTranslateButton:				"Prie kanalo teksto srities pridedamas vertimo mygtukas",
							general_sendOriginalMessage:				"Taip pat siunčia originalų pranešimą verčiant jūsų išsiųstą žinutę",
							general_showOriginalMessage:				"Taip pat rodomas pradinis pranešimas, kai verčiamas gautas pranešimas",
							general_usePerChatTranslation:				"Įjungia / išjungia Vertėjo mygtuko būseną kiekvienam kanalui, o ne visame pasaulyje",
							language_choice_input_received:				"Įvesties kalba gautuose pranešimuose",
							language_choice_input_sent:				"Įveskite kalbą siunčiamuose pranešimuose",
							language_choice_output_received:			"Išvesties kalba gautuose pranešimuose",
							language_choice_output_sent:				"Išvesties kalba jūsų išsiųstuose pranešimuose",
							language_selection_channel:				"Kalbos pasirinkimas bus pakeistas specialiai šiam kanalui",
							language_selection_global:				"Kalbos pasirinkimas bus pakeistas visiems serveriams",
							language_selection_server:				"Kalbos pasirinkimas bus pakeistas specialiai šiam serveriui",
							popout_translateoption:					"Išversti",
							popout_untranslateoption:				"Neišversti",
							prefixes_disable_text:					"Priešdėliai, kurie išjungia pranešimo vertimą",
							prefixes_enable_text:					"Priešdėliai, įgalinantys vertimą su konkrečia kalba (pvz., $fr, $de, $jp)",
							toast_translating:					"Vertimas",
							toast_translating_failed:				"Nepavyko išversti",
							toast_translating_tryanother:				"Išbandykite kitą vertėją",
							translate_your_message:					"Prieš siųsdami išverskite savo pranešimus",
							translated_watermark:					"išverstas",
							translator_engine:					"Vertėjas"
						};
					case "nl":		// Dutch
						return {
							backup_engine:						"Backup-Vertaler",
							backup_engine_warning:					"Zal Backup-Vertaler gebruiken",
							context_messagetranslateoption:				"Bericht vertalen",
							context_messageuntranslateoption:			"Bericht onvertalen",
							context_translator:					"Zoek vertaling",
							detect_language:					"Taal detecteren",
							error_dailylimit:					"Dagelijkse verzoeklimiet bereikt.",
							error_hourlylimit:					"Verzoeklimiet per uur bereikt.",
							error_keyoutdated:					"API-sleutel verouderd.",
							error_monthlylimit:					"Maandelijkse aanvraaglimiet bereikt.",
							error_serverdown:					"Vertaalserver is mogelijk offline.",
							exception_text:						"Woorden die beginnen met {{var0}} worden genegeerd",
							general_addQuickTranslateButton:			"Voegt een snel vertalende knop toe in de Bericht Acties Bar",
							general_addTranslateButton:				"Voegt een vertaalknop toe aan het kanaaltekstgebied",
							general_sendOriginalMessage:				"Verzendt ook het originele bericht bij het vertalen van uw verzonden bericht",
							general_showOriginalMessage:				"Toont ook het originele bericht bij het vertalen van een ontvangen bericht",
							general_usePerChatTranslation:				"Schakelt de status van de vertaalknop in/uit per kanaal en niet globaal",
							language_choice_input_received:				"Invoertaal in ontvangen berichten",
							language_choice_input_sent:				"Invoertaal in uw verzonden berichten",
							language_choice_output_received:			"Uitvoertaal in ontvangen berichten",
							language_choice_output_sent:				"Uitvoertaal in uw verzonden berichten",
							language_selection_channel:				"De taalselectie wordt specifiek voor dit kanaal gewijzigd",
							language_selection_global:				"Taalkeuze wordt voor alle servers gewijzigd",
							language_selection_server:				"Taalselectie wordt specifiek voor deze server gewijzigd",
							popout_translateoption:					"Vertalen",
							popout_untranslateoption:				"Onvertalen",
							prefixes_disable_text:					"Voorvoegsels die de vertaling van het bericht uitschakelen",
							prefixes_enable_text:					"Voorvoegsels die vertaling mogelijk maken met specifieke taal (bijv. $fr, $de, $jp)",
							toast_translating:					"Vertalen",
							toast_translating_failed:				"Kan niet vertalen",
							toast_translating_tryanother:				"Probeer een andere vertaler",
							translate_your_message:					"Vertaal uw berichten voordat u ze verzendt",
							translated_watermark:					"vertaald",
							translator_engine:					"Vertaler"
						};
					case "no":		// Norwegian
						return {
							backup_engine:						"Backup-Oversetter",
							backup_engine_warning:					"Vil bruke Backup-Oversetter",
							context_messagetranslateoption:				"Oversett melding",
							context_messageuntranslateoption:			"Ikke oversett melding",
							context_translator:					"Søk i oversettelse",
							detect_language:					"Oppdage språk",
							error_dailylimit:					"Daglig forespørselsgrense nådd.",
							error_hourlylimit:					"Forespørselsgrensen for time nådd.",
							error_keyoutdated:					"API-nøkkel utdatert.",
							error_monthlylimit:					"Månedlig forespørselsgrense nådd.",
							error_serverdown:					"Oversettelsesserveren kan være frakoblet.",
							exception_text:						"Ord som begynner med {{var0}} vil bli ignorert",
							general_addQuickTranslateButton:			"Legger til en rask oversettelsesknapp i meldingslinjen",
							general_addTranslateButton:				"Legger til en oversettknapp til kanaltekstområdet",
							general_sendOriginalMessage:				"Sender også den originale meldingen når du oversetter den sendte meldingen",
							general_showOriginalMessage:				"Viser også den originale meldingen når du oversetter en mottatt melding",
							general_usePerChatTranslation:				"Aktiverer/deaktiverer oversetterknappens tilstand per kanal og ikke globalt",
							language_choice_input_received:				"Inndataspråk i mottatte meldinger",
							language_choice_input_sent:				"Inntastingsspråk i sendte meldinger",
							language_choice_output_received:			"Utdataspråk i mottatte meldinger",
							language_choice_output_sent:				"Utdataspråk i dine sendte meldinger",
							language_selection_channel:				"Språkvalg vil bli endret spesifikt for denne kanalen",
							language_selection_global:				"Språkvalg vil bli endret for alle servere",
							language_selection_server:				"Språkvalg vil bli endret spesifikt for denne serveren",
							popout_translateoption:					"Oversette",
							popout_untranslateoption:				"Ikke oversett",
							prefixes_disable_text:					"Prefikser som deaktiverer oversettelse av meldingen",
							prefixes_enable_text:					"Prefikser som muliggjør oversettelse med spesifikt språk (f.eks. $fr, $de, $jp)",
							toast_translating:					"Oversetter",
							toast_translating_failed:				"Kunne ikke oversette",
							toast_translating_tryanother:				"Prøv en annen oversetter",
							translate_your_message:					"Oversett meldingene dine før sending",
							translated_watermark:					"oversatt",
							translator_engine:					"Oversetter"
						};
					case "pl":		// Polish
						return {
							backup_engine:						"Backup-Tłumacz",
							backup_engine_warning:					"Użyje Backup-Tłumacz",
							context_messagetranslateoption:				"Przetłumacz wiadomość",
							context_messageuntranslateoption:			"Nieprzetłumacz wiadomość",
							context_translator:					"Wyszukaj tłumaczenie",
							detect_language:					"Wykryj język",
							error_dailylimit:					"Osiągnięto dzienny limit żądań.",
							error_hourlylimit:					"Osiągnięto godzinowy limit żądań.",
							error_keyoutdated:					"Klucz API jest nieaktualny.",
							error_monthlylimit:					"Osiągnięto miesięczny limit żądań.",
							error_serverdown:					"Serwer tłumaczeń może być w trybie offline.",
							exception_text:						"Słowa zaczynające się od {{var0}} będą ignorowane",
							general_addQuickTranslateButton:			"Dodaje szybki przycisk Tłumacz na pasku akcji wiadomości",
							general_addTranslateButton:				"Dodaje przycisk Tłumacz do obszaru tekstowego kanału",
							general_sendOriginalMessage:				"Wysyła również oryginalną wiadomość podczas tłumaczenia wysłanej wiadomości",
							general_showOriginalMessage:				"Pokazuje również oryginalną wiadomość podczas tłumaczenia otrzymanej wiadomości",
							general_usePerChatTranslation:				"Włącza/wyłącza stan przycisku translatora na kanał, a nie globalnie",
							language_choice_input_received:				"Język wprowadzania w odebranych wiadomościach",
							language_choice_input_sent:				"Język wprowadzania w wysyłanych wiadomościach",
							language_choice_output_received:			"Język wyjściowy w odebranych wiadomościach",
							language_choice_output_sent:				"Język wyjściowy w wysłanych wiadomościach",
							language_selection_channel:				"Wybór języka zostanie zmieniony specjalnie dla tego kanału",
							language_selection_global:				"Wybór języka zostanie zmieniony dla wszystkich serwerów",
							language_selection_server:				"Wybór języka zostanie zmieniony specjalnie dla tego serwera",
							popout_translateoption:					"Tłumaczyć",
							popout_untranslateoption:				"Nie przetłumacz",
							prefixes_disable_text:					"Słowa zaczynające się od {{var0}} będą ignorowane",
							prefixes_enable_text:					"Słowa, które aktywują tłumaczenie na określony język (np. $fr, $de, $jp)",
							toast_translating:					"Tłumaczenie",
							toast_translating_failed:				"Nie udało się przetłumaczyć",
							toast_translating_tryanother:				"Wypróbuj innego tłumacza",
							translate_your_message:					"Przetłumacz swoje wiadomości przed wysłaniem",
							translated_watermark:					"przetłumaczony",
							translator_engine:					"Tłumacz"
						};
					case "pt-BR":		// Portuguese (Brazil)
						return {
							backup_engine:						"Backup-Tradutor",
							backup_engine_warning:					"Usará o Backup-Tradutor",
							context_messagetranslateoption:				"Traduzir mensagem",
							context_messageuntranslateoption:			"Mensagem não traduzida",
							context_translator:					"Tradução de pesquisa",
							detect_language:					"Detectar idioma",
							error_dailylimit:					"Limite de solicitações diárias atingido.",
							error_hourlylimit:					"Limite de solicitação por hora atingido.",
							error_keyoutdated:					"Chave de API desatualizada.",
							error_monthlylimit:					"Limite de solicitação mensal atingido.",
							error_serverdown:					"O servidor de tradução pode estar offline.",
							exception_text:						"Palavras que começam com {{var0}} serão ignoradas",
							general_addQuickTranslateButton:			"Adiciona um botão de tradução rápida na barra de ações da mensagem",
							general_addTranslateButton:				"Adiciona um botão de tradução à área de texto do canal",
							general_sendOriginalMessage:				"Também envia a Mensagem original ao traduzir sua Mensagem enviada",
							general_showOriginalMessage:				"Também mostra a Mensagem original ao traduzir uma Mensagem recebida",
							general_usePerChatTranslation:				"Habilita/desabilita o estado do botão do tradutor por canal e não globalmente",
							language_choice_input_received:				"Idioma de entrada nas mensagens recebidas",
							language_choice_input_sent:				"Idioma de entrada em suas mensagens enviadas",
							language_choice_output_received:			"Idioma de saída nas mensagens recebidas",
							language_choice_output_sent:				"Idioma de saída em suas mensagens enviadas",
							language_selection_channel:				"A seleção de idioma será alterada especificamente para este canal",
							language_selection_global:				"A seleção de idioma será alterada para todos os servidores",
							language_selection_server:				"A seleção de idioma será alterada especificamente para este servidor",
							popout_translateoption:					"Traduzir",
							popout_untranslateoption:				"Não traduzido",
							prefixes_disable_text:					"Prefixos que desativam a tradução da mensagem",
							prefixes_enable_text:					"Prefixos que permitem a tradução com linguagem específica (por exemplo, $fr, $de, $jp)",
							toast_translating:					"Traduzindo",
							toast_translating_failed:				"Falha ao traduzir",
							toast_translating_tryanother:				"Tente outro tradutor",
							translate_your_message:					"Traduza suas mensagens antes de enviar",
							translated_watermark:					"traduzido",
							translator_engine:					"Tradutor"
						};
					case "ro":		// Romanian
						return {
							backup_engine:						"Backup-Traducător",
							backup_engine_warning:					"Va folosi Backup-Traducător",
							context_messagetranslateoption:				"Traduceți mesajul",
							context_messageuntranslateoption:			"Untraduceți mesajul",
							context_translator:					"Căutare traducere",
							detect_language:					"Detecteaza limba",
							error_dailylimit:					"Limita zilnică de solicitare a fost atinsă.",
							error_hourlylimit:					"Limita orară de solicitare a fost atinsă.",
							error_keyoutdated:					"API-Key este învechită.",
							error_monthlylimit:					"Limita lunară de solicitare a fost atinsă.",
							error_serverdown:					"Serverul de traducere ar putea fi offline.",
							exception_text:						"Cuvintele care încep cu {{var0}} vor fi ignorate",
							general_addQuickTranslateButton:			"Adaugă un buton de traducere rapidă în bara de acțiuni de mesaje",
							general_addTranslateButton:				"Adaugă un buton de traducere în zona de text a canalului",
							general_sendOriginalMessage:				"De asemenea, trimite mesajul original atunci când traduceți mesajul trimis",
							general_showOriginalMessage:				"Afișează, de asemenea, mesajul original atunci când traduceți un mesaj primit",
							general_usePerChatTranslation:				"Activează/dezactivează starea butonului de traducător pe canal și nu la nivel global",
							language_choice_input_received:				"Limba de intrare în mesajele primite",
							language_choice_input_sent:				"Introduceți limba în mesajele trimise",
							language_choice_output_received:			"Limba de ieșire în mesajele primite",
							language_choice_output_sent:				"Limba de ieșire în mesajele trimise",
							language_selection_channel:				"Selectarea limbii va fi modificată special pentru acest canal",
							language_selection_global:				"Selectarea limbii va fi modificată pentru toate serverele",
							language_selection_server:				"Selectarea limbii va fi modificată special pentru acest Server",
							popout_translateoption:					"Traduceți",
							popout_untranslateoption:				"Netradus",
							prefixes_disable_text:					"Prefixele care dezactivează traducerea mesajului",
							prefixes_enable_text:					"Prefixele care permit traducerea cu un limbaj specific (de exemplu, $fr, $de, $jp)",
							toast_translating:					"Traducere",
							toast_translating_failed:				"Nu s-a putut traduce",
							toast_translating_tryanother:				"Încercați un alt traducător",
							translate_your_message:					"Traduceți mesajele înainte de a le trimite",
							translated_watermark:					"tradus",
							translator_engine:					"Traducător"
						};
					case "ru":		// Russian
						return {
							backup_engine:						"Резервный-Переводчик",
							backup_engine_warning:					"Буду использовать Резервный-Переводчик",
							context_messagetranslateoption:				"Перевести сообщение",
							context_messageuntranslateoption:			"Непереведенное сообщение",
							context_translator:					"Искать перевод",
							detect_language:					"Определить язык",
							error_dailylimit:					"Достигнут дневной лимит запросов.",
							error_hourlylimit:					"Достигнут лимит почасовых запросов.",
							error_keyoutdated:					"API-ключ устарел.",
							error_monthlylimit:					"Достигнут месячный лимит запросов.",
							error_serverdown:					"Сервер переводов может быть отключен.",
							exception_text:						"Слова, начинающиеся с {{var0}}, будут игнорироваться.",
							general_addQuickTranslateButton:			"Добавляет кнопку быстрого перевода в панель действий сообщений",
							general_addTranslateButton:				"Добавляет кнопку перевода в текстовую область канала",
							general_sendOriginalMessage:				"Также отправляет исходное сообщение при переводе отправленного сообщения.",
							general_showOriginalMessage:				"Также показывает исходное сообщение при переводе полученного сообщения.",
							general_usePerChatTranslation:				"Включает/отключает состояние кнопки переводчика для каждого канала, а не глобально",
							language_choice_input_received:				"Язык ввода в полученных сообщениях",
							language_choice_input_sent:				"Язык ввода в ваших отправленных сообщениях",
							language_choice_output_received:			"Язык вывода в полученных сообщениях",
							language_choice_output_sent:				"Язык вывода в ваших отправленных сообщениях",
							language_selection_channel:				"Выбор языка будет изменен специально для этого канала.",
							language_selection_global:				"Выбор языка будет изменен для всех серверов.",
							language_selection_server:				"Выбор языка будет изменен специально для этого сервера",
							popout_translateoption:					"Переведите",
							popout_untranslateoption:				"Неперевести",
							prefixes_disable_text:					"Префиксы, которые отключают перевод сообщения",
							prefixes_enable_text:					"Префиксы, которые обеспечивают перевод с конкретным языком (например, $fr, $de, $jp)",
							toast_translating:					"Идет перевод",
							toast_translating_failed:				"Не удалось перевести",
							toast_translating_tryanother:				"Попробуйте другой переводчик",
							translate_your_message:					"Переводите свои сообщения перед отправкой",
							translated_watermark:					"переведено",
							translator_engine:					"Переводчик"
						};
					case "sv":		// Swedish
						return {
							backup_engine:						"Backup-Översättare",
							backup_engine_warning:					"Kommer att använda Backup-Översättare",
							context_messagetranslateoption:				"Översätt meddelande",
							context_messageuntranslateoption:			"Untranslate meddelande",
							context_translator:					"Sök översättning",
							detect_language:					"Upptäck språk",
							error_dailylimit:					"Daglig förfrågningsgräns nådd.",
							error_hourlylimit:					"Begäran per timme nådd.",
							error_keyoutdated:					"API-nyckel föråldrad.",
							error_monthlylimit:					"Gränsen för månatlig begäran har nåtts.",
							error_serverdown:					"Översättningsservern kan vara offline.",
							exception_text:						"Ord som börjar med {{var0}} kommer att ignoreras",
							general_addQuickTranslateButton:			"Lägger till en snabb translate -knapp i meddelanden om meddelanden om meddelanden om meddelanden",
							general_addTranslateButton:				"Lägger till en Översätt-knapp i kanaltextområdet",
							general_sendOriginalMessage:				"Skickar också det ursprungliga meddelandet när du översätter ditt skickade meddelande",
							general_showOriginalMessage:				"Visar även det ursprungliga meddelandet när ett mottaget meddelande översätts",
							general_usePerChatTranslation:				"Aktiverar/inaktiverar översättarknappens status per kanal och inte globalt",
							language_choice_input_received:				"Inmatningsspråk i mottagna meddelanden",
							language_choice_input_sent:				"Inmatningsspråk i dina skickade meddelanden",
							language_choice_output_received:			"Utmatningsspråk i mottagna meddelanden",
							language_choice_output_sent:				"Utmatningsspråk i dina skickade meddelanden",
							language_selection_channel:				"Språkval kommer att ändras specifikt för denna kanal",
							language_selection_global:				"Språkval kommer att ändras för alla servrar",
							language_selection_server:				"Språkval kommer att ändras specifikt för denna server",
							popout_translateoption:					"Översätt",
							popout_untranslateoption:				"Untranslate",
							prefixes_disable_text:					"Prefix som inaktiverar översättning av meddelandet",
							prefixes_enable_text:					"Prefix som möjliggör översättning med specifikt språk (t.ex. $fr, $de, $jp)",
							toast_translating:					"Översätter",
							toast_translating_failed:				"Det gick inte att översätta",
							toast_translating_tryanother:				"Prova en annan översättare",
							translate_your_message:					"Översätt dina meddelanden innan du skickar",
							translated_watermark:					"översatt",
							translator_engine:					"Översättare"
						};
					case "th":		// Thai
						return {
							backup_engine:						"สำรอง-นักแปล",
							backup_engine_warning:					"จะใช้การสำรองข้อมูล-นักแปล",
							context_messagetranslateoption:				"แปลข้อความ",
							context_messageuntranslateoption:			"ยกเลิกการแปลข้อความ",
							context_translator:					"ค้นหาคำแปล",
							detect_language:					"ตรวจจับภาษา",
							error_dailylimit:					"ถึงขีดจำกัดคำขอรายวันแล้ว",
							error_hourlylimit:					"ถึงขีดจำกัดคำขอรายชั่วโมงแล้ว",
							error_keyoutdated:					"API-Key ล้าสมัยแล้ว",
							error_monthlylimit:					"ถึงขีดจำกัดคำขอรายเดือนแล้ว",
							error_serverdown:					"เซิร์ฟเวอร์การแปลอาจออฟไลน์อยู่",
							exception_text:						"คำที่ขึ้นต้นด้วย {{var0}} จะถูกละเว้น",
							general_addQuickTranslateButton:			"เพิ่มปุ่มแปลอย่างรวดเร็วในแถบการกระทำข้อความ",
							general_addTranslateButton:				"เพิ่มปุ่มแปลภาษาไปยัง Textarea ของช่อง",
							general_sendOriginalMessage:				"ส่งข้อความต้นฉบับเมื่อแปลข้อความที่ส่งของคุณ",
							general_showOriginalMessage:				"ยังแสดงข้อความต้นฉบับเมื่อแปลข้อความที่ได้รับ",
							general_usePerChatTranslation:				"เปิด/ปิดสถานะปุ่มนักแปลต่อช่องและไม่ใช่ทั่วโลก",
							language_choice_input_received:				"ป้อนภาษาในข้อความที่ได้รับ",
							language_choice_input_sent:				"ป้อนภาษาในข้อความที่คุณส่ง",
							language_choice_output_received:			"ภาษาเอาต์พุตในข้อความที่ได้รับ",
							language_choice_output_sent:				"ภาษาที่ส่งออกในข้อความที่ส่งของคุณ",
							language_selection_channel:				"การเลือกภาษาจะมีการเปลี่ยนแปลงเฉพาะสำหรับช่องนี้",
							language_selection_global:				"การเลือกภาษาจะมีการเปลี่ยนแปลงสำหรับเซิร์ฟเวอร์ทั้งหมด",
							language_selection_server:				"การเลือกภาษาจะมีการเปลี่ยนแปลงโดยเฉพาะสำหรับเซิร์ฟเวอร์นี้",
							popout_translateoption:					"แปลภาษา",
							popout_untranslateoption:				"ไม่แปล",
							prefixes_disable_text:					"คำนำหน้าการปิดใช้งานการแปลข้อความ",
							prefixes_enable_text:					"คำนำหน้าที่เปิดใช้งานการแปลด้วยภาษาที่เฉพาะเจาะจง (เช่น $fr, $de, $jp)",
							toast_translating:					"กำลังแปล",
							toast_translating_failed:				"แปลไม่สำเร็จ",
							toast_translating_tryanother:				"ลองใช้นักแปลคนอื่น",
							translate_your_message:					"แปลข้อความของคุณก่อนส่ง",
							translated_watermark:					"แปล",
							translator_engine:					"นักแปล"
						};
					case "tr":		// Turkish
						return {
							backup_engine:						"Yedekleme-Çevirmen",
							backup_engine_warning:					"Yedekleme-Çevirmen kullanacak",
							context_messagetranslateoption:				"Mesajı Çevir",
							context_messageuntranslateoption:			"Çeviriyi Kaldır Mesajı",
							context_translator:					"Çeviri ara",
							detect_language:					"Dili Algıla",
							error_dailylimit:					"Günlük İstek Sınırına ulaşıldı.",
							error_hourlylimit:					"Saatlik İstek Sınırına ulaşıldı.",
							error_keyoutdated:					"API Anahtarı güncel değil.",
							error_monthlylimit:					"Aylık İstek Sınırına ulaşıldı.",
							error_serverdown:					"Çeviri Sunucusu çevrimdışı olabilir.",
							exception_text:						"{{var0}} ile başlayan kelimeler yok sayılacak",
							general_addQuickTranslateButton:			"Mesaj Eylemleri çubuğuna hızlı bir çeviri düğmesi ekler",
							general_addTranslateButton:				"Kanal Metin Alanına Çevir Düğmesi Ekler",
							general_sendOriginalMessage:				"Gönderilen Mesajınızı çevirirken orijinal Mesajı da gönderir",
							general_showOriginalMessage:				"Alınan bir Mesajı tercüme ederken orijinal Mesajı da gösterir.",
							general_usePerChatTranslation:				"Genel olarak değil, Kanal başına Çevirmen Düğmesi Durumunu Etkinleştirir/Devre Dışı Bırakır",
							language_choice_input_received:				"Alınan Mesajlarda Giriş Dili",
							language_choice_input_sent:				"Gönderilen Mesajlarınızda Dil Girin",
							language_choice_output_received:			"Alınan Mesajlarda Çıktı Dili",
							language_choice_output_sent:				"Gönderilen Mesajlarınızda Çıktı Dili",
							language_selection_channel:				"Dil Seçimi bu Kanal için özel olarak değiştirilecektir.",
							language_selection_global:				"Tüm Sunucular için Dil Seçimi değiştirilecek",
							language_selection_server:				"Dil Seçimi bu Sunucuya özel olarak değiştirilecektir.",
							popout_translateoption:					"Çevirmek",
							popout_untranslateoption:				"Çevirmeyi kaldır",
							prefixes_disable_text:					"Mesajın çevirisini devre dışı bırakan önekler",
							prefixes_enable_text:					"Belirli bir dille çeviriyi etkinleştiren önekler (örn. $fr, $de, $jp)",
							toast_translating:					"Çeviri",
							toast_translating_failed:				"Tercüme edilemedi",
							toast_translating_tryanother:				"Başka bir Çevirmen deneyin",
							translate_your_message:					"Göndermeden önce Mesajlarınızı çevirin",
							translated_watermark:					"tercüme",
							translator_engine:					"Çevirmen"
						};
					case "uk":		// Ukrainian
						return {
							backup_engine:						"Резервний-перекладач",
							backup_engine_warning:					"Використовуватиме Резервний-Перекладач",
							context_messagetranslateoption:				"Перекласти повідомлення",
							context_messageuntranslateoption:			"Неперекладене повідомлення",
							context_translator:					"Пошук перекладу",
							detect_language:					"Визначити мову",
							error_dailylimit:					"Денний ліміт запитів досягнуто.",
							error_hourlylimit:					"Досягнуто погодинного ліміту запитів.",
							error_keyoutdated:					"API-ключ застарів.",
							error_monthlylimit:					"Досягнуто місячного ліміту запитів.",
							error_serverdown:					"Сервер перекладу може бути офлайн.",
							exception_text:						"Слова, що починаються з {{var0}}, ігноруватимуться",
							general_addQuickTranslateButton:			"Додає кнопку швидкого перекладу в панелі дій Message",
							general_addTranslateButton:				"Додає кнопку перекладу до текстової області каналу",
							general_sendOriginalMessage:				"Також надсилає оригінальне повідомлення під час перекладу вашого надісланого повідомлення",
							general_showOriginalMessage:				"Також показує оригінальне повідомлення під час перекладу отриманого повідомлення",
							general_usePerChatTranslation:				"Вмикає/вимикає стан кнопки перекладача для кожного каналу, а не глобально",
							language_choice_input_received:				"Мова введення в отриманих повідомленнях",
							language_choice_input_sent:				"Мова введення у ваших надісланих повідомленнях",
							language_choice_output_received:			"Мова виводу в отриманих повідомленнях",
							language_choice_output_sent:				"Мова виведення у ваших надісланих повідомленнях",
							language_selection_channel:				"Вибір мови буде змінено спеціально для цього каналу",
							language_selection_global:				"Вибір мови буде змінено для всіх серверів",
							language_selection_server:				"Вибір мови буде змінено спеціально для цього сервера",
							popout_translateoption:					"Перекласти",
							popout_untranslateoption:				"Неперекласти",
							prefixes_disable_text:					"Префікси, що відключають переклад повідомлення",
							prefixes_enable_text:					"Префікси, що дозволяють перекладати з конкретною мовою (наприклад, $fr, $de, $jp)",
							toast_translating:					"Переклад",
							toast_translating_failed:				"Не вдалося перекласти",
							toast_translating_tryanother:				"Спробуйте іншого перекладача",
							translate_your_message:					"Перекладіть свої повідомлення перед надсиланням",
							translated_watermark:					"переклав",
							translator_engine:					"Перекладач"
						};
					case "vi":		// Vietnamese
						return {
							backup_engine:						"Backup-Gười phiên dịch",
							backup_engine_warning:					"Sẽ sử dụng Backup-Gười phiên dịch",
							context_messagetranslateoption:				"Dịch tin nhắn",
							context_messageuntranslateoption:			"Thư chưa dịch",
							context_translator:					"Tìm kiếm bản dịch",
							detect_language:					"Phát hiện ngôn ngữ",
							error_dailylimit:					"Đã đạt đến Giới hạn Yêu cầu Hàng ngày.",
							error_hourlylimit:					"Đã đạt đến Giới hạn Yêu cầu Hàng giờ.",
							error_keyoutdated:					"API-Key đã lỗi thời.",
							error_monthlylimit:					"Đã đạt đến Giới hạn Yêu cầu Hàng tháng.",
							error_serverdown:					"Máy chủ dịch có thể ngoại tuyến.",
							exception_text:						"Các từ bắt đầu bằng {{var0}} sẽ bị bỏ qua",
							general_addQuickTranslateButton:			"Thêm nút dịch nhanh vào thanh hành động tin nhắn",
							general_addTranslateButton:				"Thêm nút dịch vào vùng văn bản của kênh",
							general_sendOriginalMessage:				"Đồng thời gửi Tin nhắn gốc khi dịch Tin nhắn đã gửi của bạn",
							general_showOriginalMessage:				"Đồng thời hiển thị Tin nhắn gốc khi dịch một Tin nhắn đã nhận",
							general_usePerChatTranslation:				"Bật / tắt Trạng thái nút dịch trên mỗi kênh và không bật trên toàn cầu",
							language_choice_input_received:				"Nhập Ngôn ngữ trong Tin nhắn đã nhận",
							language_choice_input_sent:				"Nhập Ngôn ngữ trong Tin nhắn đã gửi của bạn",
							language_choice_output_received:			"Ngôn ngữ đầu ra trong Tin nhắn đã nhận",
							language_choice_output_sent:				"Ngôn ngữ đầu ra trong Tin nhắn đã gửi của bạn",
							language_selection_channel:				"Lựa chọn ngôn ngữ sẽ được thay đổi cụ thể cho Kênh này",
							language_selection_global:				"Lựa chọn ngôn ngữ sẽ được thay đổi cho tất cả các Máy chủ",
							language_selection_server:				"Lựa chọn ngôn ngữ sẽ được thay đổi cụ thể cho Máy chủ này",
							popout_translateoption:					"Phiên dịch",
							popout_untranslateoption:				"Chưa dịch",
							prefixes_disable_text:					"Tiền tố vô hiệu hóa dịch tin nhắn",
							prefixes_enable_text:					"Tiền tố cho phép dịch với ngôn ngữ cụ thể (ví dụ: $fr, $de, $jp)",
							toast_translating:					"Phiên dịch",
							toast_translating_failed:				"Không dịch được",
							toast_translating_tryanother:				"Thử một Trình dịch khác",
							translate_your_message:					"Dịch Tin nhắn của bạn trước khi gửi",
							translated_watermark:					"đã dịch",
							translator_engine:					"Người phiên dịch"
						};
					case "zh-CN":		// Chinese (China)
						return {
							backup_engine:						"备份翻译器",
							backup_engine_warning:					"将使用备份翻译器",
							context_messagetranslateoption:				"翻译消息",
							context_messageuntranslateoption:			"取消翻译消息",
							context_translator:					"搜索翻译",
							detect_language:					"检测语言",
							error_dailylimit:					"已达到每日请求限制。",
							error_hourlylimit:					"已达到每小时请求限制。",
							error_keyoutdated:					"API 密钥已过时。",
							error_monthlylimit:					"已达到每月请求限制。",
							error_serverdown:					"翻译服务器可能离线。",
							exception_text:						"以 {{var0}} 开头的单词将被忽略",
							general_addQuickTranslateButton:			"在消息操作栏中添加一个快速翻译按钮",
							general_addTranslateButton:				"将翻译按钮添加到频道文本区域",
							general_sendOriginalMessage:				"翻译您发送的消息时也会发送原始消息",
							general_showOriginalMessage:				"翻译收到的消息时还显示原始消息",
							general_usePerChatTranslation:				"启用/禁用每个通道而不是全局的转换器按钮状态",
							language_choice_input_received:				"收到消息中的输入语言",
							language_choice_input_sent:				"在您发送的消息中输入语言",
							language_choice_output_received:			"接收消息中的输出语言",
							language_choice_output_sent:				"您发送的消息中的输出语言",
							language_selection_channel:				"将专门为此频道更改语言选择",
							language_selection_global:				"将更改所有服务器的语言选择",
							language_selection_server:				"语言选择将专门为此服务器更改",
							popout_translateoption:					"翻译",
							popout_untranslateoption:				"取消翻译",
							prefixes_disable_text:					"禁用消息翻译的前缀",
							prefixes_enable_text:					"用特定语言启用翻译的前缀（例如 $fr, $de, $jp）",
							toast_translating:					"正在翻译",
							toast_translating_failed:				"翻译失败",
							toast_translating_tryanother:				"尝试其它翻译器",
							translate_your_message:					"发送前翻译您的消息",
							translated_watermark:					"已翻译",
							translator_engine:					"译者"
						};
					case "zh-TW":		// Chinese (Taiwan)
						return {
							backup_engine:						"備份翻譯器",
							backup_engine_warning:					"將使用備份翻譯器",
							context_messagetranslateoption:				"翻譯訊息",
							context_messageuntranslateoption:			"取消翻譯訊息",
							context_translator:					"搜尋翻譯",
							detect_language:					"檢測語言",
							error_dailylimit:					"已達到每日請求限制。",
							error_hourlylimit:					"已達到每小時請求限制。",
							error_keyoutdated:					"API 密鑰已過時。",
							error_monthlylimit:					"已達到每月請求限制。",
							error_serverdown:					"翻譯服務器可能離線。",
							exception_text:						"以 {{var0}} 開頭的單詞將被忽略",
							general_addQuickTranslateButton:			"在消息操作欄中添加一個快速翻譯按鈕",
							general_addTranslateButton:				"將翻譯按鈕添加到頻道文本區域",
							general_sendOriginalMessage:				"翻譯您發送的消息時也會發送原始消息",
							general_showOriginalMessage:				"翻譯收到的消息時還顯示原始消息",
							general_usePerChatTranslation:				"啟用/禁用每個通道而不是全局的轉換器按鈕狀態",
							language_choice_input_received:				"收到消息中的輸入語言",
							language_choice_input_sent:				"在您發送的消息中輸入語言",
							language_choice_output_received:			"接收消息中的輸出語言",
							language_choice_output_sent:				"您發送的消息中的輸出語言",
							language_selection_channel:				"將專門為此頻道更改語言選擇",
							language_selection_global:				"將更改所有服務器的語言選擇",
							language_selection_server:				"語言選擇將專門為此服務器更改",
							popout_translateoption:					"翻譯",
							popout_untranslateoption:				"取消翻譯",
							prefixes_disable_text:					"禁用消息翻译的前缀",
							prefixes_enable_text:					"用特定语言启用翻译的前缀（例如 $fr, $de, $jp）",
							toast_translating:					"正在翻譯",
							toast_translating_failed:				"無法翻譯",
							toast_translating_tryanother:				"嘗試其它翻譯器",
							translate_your_message:					"發送前翻譯您的消息",
							translated_watermark:					"已翻譯",
							translator_engine:					"譯者"
						};
					default:		// English
						return {
							backup_engine:						"Backup-Translator",
							backup_engine_warning:					"Will use Backup-Translator",
							context_messagetranslateoption:				"Translate Message",
							context_messageuntranslateoption:			"Untranslate Message",
							context_translator:					"Search Translation",
							detect_language:					"Detect Language",
							error_dailylimit:					"Daily Request Limit reached.",
							error_hourlylimit:					"Hourly Request Limit reached.",
							error_keyoutdated:					"API-Key outdated.",
							error_monthlylimit:					"Monthly Request Limit reached.",
							error_serverdown:					"Translation Server might be offline.",
							exception_text:						"Words starting with {{var0}} will be ignored",
							general_addQuickTranslateButton:			"Adds a Quick Translate Button in the Message Actions Bar",
							general_addTranslateButton:				"Adds a Translate Button to the Channel Textarea",
							general_sendOriginalMessage:				"Also sends the original Message when translating your sent Message",
							general_showOriginalMessage:				"Also shows the original Message when translating a received Message",
							general_usePerChatTranslation:				"Enables/Disables the Translator Button State per Channel and not globally",
							language_choice_input_received:				"Input Language in received Messages",
							language_choice_input_sent:				"Input Language in your sent Messages",
							language_choice_output_received:			"Output Language in received Messages",
							language_choice_output_sent:				"Output Language in your sent Messages",
							language_selection_channel:				"Language Selection will be changed specifically for this Channel",
							language_selection_global:				"Language Selection will be changed for all Servers",
							language_selection_server:				"Language Selection will be changed specifically for this Server",
							popout_translateoption:					"Translate",
							popout_untranslateoption:				"Untranslate",
							prefixes_disable_text:					"Prefixes that disable translation of message",
							prefixes_enable_text:					"Prefixes that enable translation with specific language (e.g. $fr, $de, $jp)",
							toast_translating:					"Translating",
							toast_translating_failed:				"Failed to translate",
							toast_translating_tryanother:				"Try another Translator",
							translate_your_message:					"Translate your Messages before sending",
							translated_watermark:					"translated",
							translator_engine:					"Translator"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
