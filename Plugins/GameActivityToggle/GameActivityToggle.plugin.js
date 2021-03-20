/**
 * @name GameActivityToggle
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.0
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
			"version": "1.0.0",
			"description": "Adds a Quick-Toggle Game Activity Button"
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
		var _this;
		var toggleButton;
		
		const ActivityToggleComponent = class ActivityToggle extends BdApi.React.Component {
			componentDidMount() {
				toggleButton = this;
			}
			render() {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PanelButton, Object.assign({}, this.props, {
					tooltipText: BDFDB.LibraryModules.SettingsStore.showCurrentGame ? _this.labels.disable_activity : _this.labels.enable_activity,
					icon: iconProps => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, Object.assign({}, iconProps, {
						nativeClass: true,
						iconSVG: BDFDB.LibraryModules.SettingsStore.showCurrentGame ? `<svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M 5.7066445,4.9022473 H 18.293275 c 1.595895,0 2.92046,1.2333283 3.034163,2.8251676 l 0.667683,9.3475611 c 0.0743,1.040197 -0.708715,1.943677 -1.748914,2.017977 -0.04477,0.0032 -0.08964,0.0048 -0.134531,0.0048 -1.191828,0 -2.230714,-0.811138 -2.519775,-1.96738 l -0.522119,-2.08848 H 6.930137 l -0.5221194,2.088478 c -0.2890608,1.156242 -1.3279463,1.96738 -2.5197742,1.96738 -1.0428481,0 -1.8882436,-0.845396 -1.8882436,-1.888243 0,-0.04488 0.0016,-0.08976 0.0048,-0.134532 L 2.6724812,7.7274149 C 2.7861841,6.1355756 4.1107494,4.9022473 5.7066445,4.9022473 Z m 8.8282265,5.0698223 c 0.839995,0 1.520947,-0.680951 1.520947,-1.5209465 0,-0.8399957 -0.680952,-1.5209468 -1.520947,-1.5209468 -0.839996,0 -1.520947,0.6809511 -1.520947,1.5209468 0,0.8399955 0.680951,1.5209465 1.520947,1.5209465 z m 4.055858,3.0418944 c 0.839996,0 1.520947,-0.680952 1.520947,-1.520947 0,-0.839995 -0.680951,-1.5209474 -1.520947,-1.5209474 -0.839996,0 -1.520947,0.6809524 -1.520947,1.5209474 0,0.839995 0.680951,1.520947 1.520947,1.520947 z M 5.9161725,8.9581056 H 3.8882434 v 2.0279294 h 2.0279291 v 2.027929 H 7.9441016 V 10.986035 H 9.9720304 V 8.9581056 H 7.9441016 V 6.9301763 H 5.9161725 Z"/></svg>` : `<svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="m 5.707493,4.903746 c -1.5957556,0 -2.921198,1.232272 -3.0348909,2.823972 l -0.6679103,9.346058 c -0.0032,0.04477 -0.00469,0.09105 -0.00469,0.135925 0,0.286145 0.068875,0.553783 0.1827966,0.796805 L 7.1745522,13.014755 H 5.9160685 v -2.02951 H 3.8889021 V 8.958078 H 5.9160685 V 6.930913 H 7.943235 v 2.027165 h 2.0295102 v 1.258484 L 15.285561,4.903746 Z m 15.366625,1.832652 -4.813642,4.813642 -3.491882,3.491882 h 4.300405 l 0.522611,2.088099 c 0.289036,1.156141 1.327587,1.966233 2.519311,1.966233 0.04489,0 0.08882,-0.0014 0.133582,-0.0047 1.040108,-0.0743 1.824922,-0.977685 1.750628,-2.01779 l -0.66791,-9.346079 c -0.02519,-0.352659 -0.11926,-0.683371 -0.253103,-0.99132 z m -2.484157,3.236436 c 0.839921,0 1.52096,0.681039 1.52096,1.52096 0,0.839923 -0.681039,1.520961 -1.52096,1.520961 -0.839923,0 -1.520962,-0.681038 -1.520962,-1.520961 0,-0.839921 0.681039,-1.52096 1.520962,-1.52096 z M 7.943235,10.985245 v 1.260827 l 1.2608277,-1.260827 z"/><path d="M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z" class="${BDFDB.disCN.accountinfobuttonstrikethrough}" fill="currentColor"/></svg>`
					})),
					onClick: _ => {
						_this.settings.general[!BDFDB.LibraryModules.SettingsStore.showCurrentGame ? "playEnable" : "playDisable"] && BDFDB.LibraryModules.SoundUtils.playSound(_this.settings.selections[!BDFDB.LibraryModules.SettingsStore.showCurrentGame ? "enableSound" : "disableSound"]);
						BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({showCurrentGame: !BDFDB.LibraryModules.SettingsStore.showCurrentGame})
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
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SettingsUtils, "updateLocalSettings", {after: e => BDFDB.ReactUtils.forceUpdate(toggleButton)});
				
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
							onChange: BDFDB.LibraryModules.SoundUtils.playSound
						}));
						
						return settingsItems;
					}
				});
			}
			
			processAccount (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "PanelButton"});
				if (index > -1) children.unshift(BDFDB.ReactUtils.createElement(ActivityToggleComponent, {}));
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