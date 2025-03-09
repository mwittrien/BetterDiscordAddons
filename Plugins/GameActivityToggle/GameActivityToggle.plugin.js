/**
 * @name GameActivityToggle
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.4
 * @description Adds a Quick-Toggle Game Activity Button
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GameActivityToggle/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/GameActivityToggle/GameActivityToggle.plugin.js
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
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		var toggleButton, toggleItem;
		
		const ActivityToggleComponent = class ActivityToggle extends BdApi.React.Component {
			componentDidMount() {
				toggleButton = this;
			}
			render() {
				const enabled = this.props.forceState != undefined ? this.props.forceState : BDFDB.DiscordUtils.getSetting("status", "showCurrentGame");
				delete this.props.forceState;
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PanelButton, Object.assign({}, this.props, {
					tooltipText: enabled ? _this.labels.disable_activity : _this.labels.enable_activity,
					icon: iconProps => BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.lottieicon,
						style: {
							"--__lottieIconColor": enabled ? "currentColor" : BDFDB.DiscordConstants.ColorsCSS.STATUS_DANGER,
							"display": "flex",
							"width": "20px",
							"height": "20px"
						},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, Object.assign({}, iconProps, {
							nativeClass: true,
							width: 20,
							height: 20,
							color: "var(--__lottieIconColor)",
							name: enabled ? BDFDB.LibraryComponents.SvgIcon.Names.GAMEPAD : BDFDB.LibraryComponents.SvgIcon.Names.GAMEPAD_DISABLED
						}))
					}),
					onClick: _ => {
						_this.toggle();
						if (toggleItem) BDFDB.ReactUtils.forceUpdate(toggleItem);
					}
				}));
			}
		};
		
		const ActivityToggleItemComponent = class ActivityToggleItem extends BdApi.React.Component {
			componentDidMount() {
				toggleItem = this;
			}
			componentWillUnmount() {
				toggleItem = null;
			}
			render() {
				const enabled = this.props.forceState != undefined ? this.props.forceState : BDFDB.DiscordUtils.getSetting("status", "showCurrentGame");
				delete this.props.forceState;
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.UserPopoutItem, {
					label: BDFDB.LanguageUtils.LanguageStrings.ACTIVITY_STATUS,
					id: BDFDB.ContextMenuUtils.createItemId(_this.name, "activity-toggle"),
					icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						name: BDFDB.LibraryComponents.SvgIcon.Names.GAMEPAD,
						width: 16,
						height: 16
					}),
					onClick: _ => {
						_this.toggle();
						if (toggleButton) BDFDB.ReactUtils.forceUpdate(toggleButton);
					},
					hint: enabled ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.menucolordefault,
						background: BDFDB.disCN.menucheckbox,
						foreground: BDFDB.disCN.menucheck,
						name: BDFDB.LibraryComponents.SvgIcon.Names.CHECKBOX,
						style: {background: "unset"}
					}) : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.menucolordefault,
						name: BDFDB.LibraryComponents.SvgIcon.Names.CHECKBOX_EMPTY,
						style: {background: "unset"}
					})
				});
			}
		};
		
		var sounds = [], keybind;
		
		return class GameActivityToggle extends Plugin {
			onLoad () {
				_this = this;
				
				this.defaults = {
					general: {
						showButton:			{value: true,				description: "Show Quick Toggle Button"},
						showItem:			{value: false,				description: "Show Quick Toggle Item"},
						playEnable:			{value: true,				description: "Play Enable Sound"},
						playDisable:			{value: true,				description: "Play Disable Sound"}
					},
					selections: {
						enableSound:			{value: "stream_started",		description: "Enable Sound"},
						disableSound:			{value: "stream_ended",			description: "Disable Sound"}
					}
				};
				
				this.modulePatches = {
					after: [
						"Account",
						"AccountPopout"
					]
				};
				
				this.css = `
					${BDFDB.dotCNS._gameactivitytoggleadded + BDFDB.dotCN.accountinfoavatarwrapper} {
						flex: 1 !important;
						min-width: 0 !important;
					}
				`;
			}
			
			onStart () {
				sounds = [BDFDB.LibraryModules.SoundParser && BDFDB.LibraryModules.SoundParser.keys()].flat(10).filter(n => n).map(s => s.replace("./", "").split(".")[0]).sort();
				
				let cachedState = BDFDB.DataUtils.load(this, "cachedState");
				let state = BDFDB.DiscordUtils.getSetting("status", "showCurrentGame");
				if (!cachedState.date || (new Date() - cachedState.date) > 1000*60*60*24*3) {
					cachedState.value = state;
					cachedState.date = new Date();
					BDFDB.DataUtils.save(cachedState, this, "cachedState");
				}
				else if (cachedState.value != null && cachedState.value != state) BDFDB.DiscordUtils.setSetting("status", "showCurrentGame", cachedState.value);
				
				let SettingsStore = BDFDB.DiscordUtils.getSettingsStore();
				if (SettingsStore) BDFDB.PatchUtils.patch(this, SettingsStore, "updateAsync", {after: e => {
					if (e.methodArguments[0] != "status") return;
					let newSettings = {value: undefined};
					e.methodArguments[1](newSettings);
					if (newSettings.showCurrentGame != undefined) {
						if (toggleButton) toggleButton.props.forceState = newSettings.showCurrentGame.value;
						BDFDB.ReactUtils.forceUpdate(toggleButton);
						if (toggleItem) toggleItem.props.forceState = newSettings.showCurrentGame.value;
						BDFDB.ReactUtils.forceUpdate(toggleItem);
						BDFDB.DataUtils.save({date: new Date(), value: newSettings.showCurrentGame.value}, this, "cachedState");
					}
				}});
				
				keybind = BDFDB.DataUtils.load(this, "keybind");
				keybind = BDFDB.ArrayUtils.is(keybind) ? keybind : [];
				this.activateKeybind();
				
				BDFDB.DiscordUtils.rerenderAll();
			}
			
			onStop () {
				BDFDB.DiscordUtils.rerenderAll();
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
						
						for (let key in this.defaults.selections) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Select",
							plugin: this,
							keys: ["selections", key],
							label: this.defaults.selections[key].description,
							basis: "50%",
							options: sounds.map(o => ({value: o, label: o.split(/[-_]/g).map(BDFDB.StringUtils.upperCaseFirstChar).join(" ")})),
							value: this.settings.selections[key],
							onChange: value => BDFDB.LibraryModules.SoundUtils.playSound(value, .4)
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.settingsrowcontainer,
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.settingsrowlabel,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
										label: "Global Hotkey"
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										className: BDFDB.disCNS.settingsrowcontrol + BDFDB.disCN.flexchild,
										grow: 0,
										wrap: true,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.KeybindRecorder, {
											value: !keybind ? [] : keybind,
											reset: true,
											onChange: value => {
												keybind = value;
												BDFDB.DataUtils.save(keybind, this, "keybind")
												this.activateKeybind();
											}
										})
									})
								].flat(10).filter(n => n)
							})
						}));
						
						return settingsItems;
					}
				});
			}
			
			processAccountPopout (e) {
				if (!this.settings.general.showItem) return;
				let userpopoutMenus = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutmenus]]});
				if (!userpopoutMenus) return;
				let [children, index] = BDFDB.ReactUtils.findParent(userpopoutMenus, {props: [["id", "set-status"]]});
				if (index == -1) return;
				children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryModules.React.Fragment, {
					children: [
						BDFDB.ReactUtils.createElement(ActivityToggleItemComponent, {}),
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.userpopoutmenudivider
						})
					]
				}));
			}
			
			processAccount (e) {
				if (!this.settings.general.showButton) return;
				let accountinfo = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.accountinfo]]});
				if (!accountinfo) return;
				let buttons = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.accountinfobuttons]]});
				if (buttons) {
					accountinfo.props.className = BDFDB.DOMUtils.formatClassName(accountinfo.props.className, BDFDB.disCN._gameactivitytoggleadded);
					buttons.props.children.unshift(BDFDB.ReactUtils.createElement(ActivityToggleComponent, {}));
				}
				else {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "AccountButtons"});
					if (index > -1) {
						accountinfo.props.className = BDFDB.DOMUtils.formatClassName(accountinfo.props.className, BDFDB.disCN._gameactivitytoggleadded);
						children.splice(index, 0, BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.accountinfobuttons,
							children: BDFDB.ReactUtils.createElement(ActivityToggleComponent, {})
						}));
					}
				}
			}
			
			activateKeybind () {
				if (keybind && keybind.length) BDFDB.ListenerUtils.addGlobal(this, "GAMEACTIVITY_TOGGLE", keybind, _ => this.toggle());
				else BDFDB.ListenerUtils.removeGlobal(this, "GAMEACTIVITY_TOGGLE");
			}
			
			toggle () {
				const shouldEnable = !BDFDB.DiscordUtils.getSetting("status", "showCurrentGame");
				this.settings.general[shouldEnable ? "playEnable" : "playDisable"] && BDFDB.LibraryModules.SoundUtils.playSound(this.settings.selections[shouldEnable ? "enableSound" : "disableSound"], .4);
				BDFDB.DiscordUtils.setSetting("status", "showCurrentGame", shouldEnable);
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							disable_activity:					"Деактивирайте активността в играта",
							enable_activity:					"Активирайте Game Activity"
						};
					case "da":		// Danish
						return {
							disable_activity:					"Deaktiver spilaktivitet",
							enable_activity:					"Aktivér spilaktivitet"
						};
					case "de":		// German
						return {
							disable_activity:					"Spieleaktivität deaktivieren",
							enable_activity:					"Spieleaktivität aktivieren"
						};
					case "el":		// Greek
						return {
							disable_activity:					"Απενεργοποίηση δραστηριότητας παιχνιδιού",
							enable_activity:					"Ενεργοποίηση δραστηριότητας παιχνιδιού"
						};
					case "es":		// Spanish
						return {
							disable_activity:					"Deshabilitar la actividad del juego",
							enable_activity:					"Habilitar la actividad del juego"
						};
					case "fi":		// Finnish
						return {
							disable_activity:					"Poista pelitoiminto käytöstä",
							enable_activity:					"Ota pelitoiminta käyttöön"
						};
					case "fr":		// French
						return {
							disable_activity:					"Désactiver l'activité de jeu",
							enable_activity:					"Activer l'activité de jeu"
						};
					case "hr":		// Croatian
						return {
							disable_activity:					"Onemogući aktivnost igre",
							enable_activity:					"Omogući aktivnost u igrama"
						};
					case "hu":		// Hungarian
						return {
							disable_activity:					"Tiltsa le a játéktevékenységet",
							enable_activity:					"Engedélyezze a játéktevékenységet"
						};
					case "it":		// Italian
						return {
							disable_activity:					"Disabilita l'attività di gioco",
							enable_activity:					"Abilita attività di gioco"
						};
					case "ja":		// Japanese
						return {
							disable_activity:					"ゲームアクティビティを無効にする",
							enable_activity:					"ゲームアクティビティを有効にする"
						};
					case "ko":		// Korean
						return {
							disable_activity:					"게임 활동 비활성화",
							enable_activity:					"게임 활동 활성화"
						};
					case "lt":		// Lithuanian
						return {
							disable_activity:					"Išjungti žaidimų veiklą",
							enable_activity:					"Įgalinti žaidimų veiklą"
						};
					case "nl":		// Dutch
						return {
							disable_activity:					"Schakel spelactiviteit uit",
							enable_activity:					"Schakel spelactiviteit in"
						};
					case "no":		// Norwegian
						return {
							disable_activity:					"Deaktiver spillaktivitet",
							enable_activity:					"Aktiver spillaktivitet"
						};
					case "pl":		// Polish
						return {
							disable_activity:					"Wyłącz aktywność w grach",
							enable_activity:					"Włącz aktywność w grach"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							disable_activity:					"Desativar atividade de jogo",
							enable_activity:					"Habilitar atividade de jogo"
						};
					case "ro":		// Romanian
						return {
							disable_activity:					"Dezactivați Activitatea jocului",
							enable_activity:					"Activați Activitatea jocului"
						};
					case "ru":		// Russian
						return {
							disable_activity:					"Отключить игровую активность",
							enable_activity:					"Включить игровую активность"
						};
					case "sv":		// Swedish
						return {
							disable_activity:					"Inaktivera spelaktivitet",
							enable_activity:					"Aktivera spelaktivitet"
						};
					case "th":		// Thai
						return {
							disable_activity:					"ปิดการใช้งานกิจกรรมของเกม",
							enable_activity:					"เปิดใช้งานกิจกรรมเกม"
						};
					case "tr":		// Turkish
						return {
							disable_activity:					"Oyun Etkinliğini Devre Dışı Bırak",
							enable_activity:					"Oyun Etkinliğini Etkinleştir"
						};
					case "uk":		// Ukrainian
						return {
							disable_activity:					"Вимкнути ігрову активність",
							enable_activity:					"Увімкнути ігрову активність"
						};
					case "vi":		// Vietnamese
						return {
							disable_activity:					"Tắt hoạt động trò chơi",
							enable_activity:					"Bật hoạt động trò chơi"
						};
					case "zh-CN":	// Chinese (China)
						return {
							disable_activity:					"禁用游戏活动",
							enable_activity:					"启用游戏活动"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							disable_activity:					"禁用遊戲活動",
							enable_activity:					"啟用遊戲活動"
						};
					default:		// English
						return {
							disable_activity:					"Disable Game Activity",
							enable_activity:					"Enable Game Activity"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
