/**
 * @name GameActivityToggle
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.8
 * @description Adds a Quick-Toggle Game Activity Button
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GameActivityToggle/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/GameActivityToggle/GameActivityToggle.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "GameActivityToggle",
			"author": "DevilBro",
			"version": "1.0.8",
			"description": "Adds a Quick-Toggle Game Activity Button"
		}
	};
	
	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
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
		var toggleButton;
		
		const ActivityToggleComponent = class ActivityToggle extends BdApi.React.Component {
			componentDidMount() {
				toggleButton = this;
			}
			render() {
				const enabled = this.props.forceState != undefined ? this.props.forceState : BDFDB.DiscordUtils.getSettings("ShowCurrentGame");
				delete this.props.forceState;
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PanelButton, Object.assign({}, this.props, {
					tooltipText: enabled ? _this.labels.disable_activity : _this.labels.enable_activity,
					icon: iconProps => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, Object.assign({}, iconProps, {
						nativeClass: true,
						width: 20,
						height: 20,
						foreground: BDFDB.disCN.accountinfobuttonstrikethrough,
						name: enabled ? BDFDB.LibraryComponents.SvgIcon.Names.GAMEPAD : BDFDB.LibraryComponents.SvgIcon.Names.GAMEPAD_DISABLED
					})),
					onClick: _ => {
						const shouldEnable = !BDFDB.DiscordUtils.getSettings("ShowCurrentGame");
						_this.settings.general[shouldEnable ? "playEnable" : "playDisable"] && BDFDB.LibraryModules.SoundUtils.playSound(_this.settings.selections[shouldEnable ? "enableSound" : "disableSound"], .4);
						BDFDB.DiscordUtils.setSettings("ShowCurrentGame", shouldEnable);
					}
				}));
			}
		};
		
		var sounds = [];
		
		return class GameActivityToggle extends Plugin {
			onLoad () {
				_this = this;
				
				sounds = [(BDFDB.ModuleUtils.findByString("undeafen", "deafen", "robot_man", "mute", false) || {exports: {keys: (_ => [])}}).exports.keys()].flat(10).filter(n => n).map(s => s.replace("./", "").split(".")[0]).sort();
				
				this.defaults = {
					general: {
						playEnable:			{value: true,					description: "Play Enable Sound"},
						playDisable:		{value: true,					description: "Play Disable Sound"}
					},
					selections: {
						enableSound:		{value: "stream_started",		description: "Enable Sound"},
						disableSound:		{value: "stream_ended",			description: "Disable Sound"}
					}
				};
				
				this.patchedModules = {
					after: {
						Account: "render"
					}
				};
			}
			
			onStart () {
				let cachedState = BDFDB.DataUtils.load(this, "cachedState");
				let state = BDFDB.DiscordUtils.getSettings("ShowCurrentGame");
				if (!cachedState.date || (new Date() - cachedState.date) > 1000*60*60*24*3) {
					cachedState.value = state;
					cachedState.date = new Date();
					BDFDB.DataUtils.save(cachedState, this, "cachedState");
				}
				else if (cachedState.value != null && cachedState.value != state) BDFDB.DiscordUtils.setSettings("ShowCurrentGame", cachedState.value);
				
				if (BDFDB.LibraryModules.SettingsUtils) BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SettingsUtils.ShowCurrentGame, "updateSetting", {after: e => {
					if (toggleButton) toggleButton.props.forceState = e.methodArguments[0];
					BDFDB.ReactUtils.forceUpdate(toggleButton);
					BDFDB.DataUtils.save({date: new Date(), value: e.methodArguments[0]}, this, "cachedState");
				}});
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
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
							options: sounds.map(o => ({value: o, label: o.split(/[-_]/g).map(BDFDB.LibraryModules.StringUtils.upperCaseFirstChar).join(" ")})),
							value: this.settings.selections[key],
							onChange: value => BDFDB.LibraryModules.SoundUtils.playSound(value, 0.4)
						}));
						
						return settingsItems;
					}
				});
			}
			
			processAccount (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "PanelButton"});
				if (index > -1) {
					e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.disCN._gameactivitytoggleadded);
					children.unshift(BDFDB.ReactUtils.createElement(ActivityToggleComponent, {}));
				}
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
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
