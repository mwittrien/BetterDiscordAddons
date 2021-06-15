/**
 * @name RevealAllSpoilersOption
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.5
 * @description Allows you to reveal all Spoilers within a Message
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RevealAllSpoilersOption/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/RevealAllSpoilersOption/RevealAllSpoilersOption.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "RevealAllSpoilersOption",
			"author": "DevilBro",
			"version": "1.0.5",
			"description": "Allows you to reveal all Spoilers within a Message"
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
		return class RevealAllSpoilersOption extends Plugin {
			onLoad () {}
			
			onStart () {}
			
			onStop () {}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.target) {
					let messageDiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, e.instance.props.target);
					if (!messageDiv || !messageDiv.querySelector(BDFDB.dotCN.spoilerhidden)) return;
					let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Reveal_Spoilers") : null;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.reveal_all,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "reveal-all"),
							hint: hint && (_ => {
								return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
									hint: hint
								});
							}),
							action: _ => {
								this.revealAllSpoilers(messageDiv);
							}
						})
					}));
				}
			}

			revealAllSpoilers (target) {
				let messageDiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, target);
				if (!messageDiv) return;
				for (let spoiler of messageDiv.querySelectorAll(BDFDB.dotCN.spoilerhidden)) spoiler.click();
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							reveal_all:							"Разкрийте всички спойлери"
						};
					case "da":		// Danish
						return {
							reveal_all:							"Afslør alle spoilere"
						};
					case "de":		// German
						return {
							reveal_all:							"Zeige alle Spoiler"
						};
					case "el":		// Greek
						return {
							reveal_all:							"Αποκαλύψτε όλα τα Spoilers"
						};
					case "es":		// Spanish
						return {
							reveal_all:							"Revelar todos los spoilers"
						};
					case "fi":		// Finnish
						return {
							reveal_all:							"Paljasta kaikki spoilerit"
						};
					case "fr":		// French
						return {
							reveal_all:							"Révéler tous les spoilers"
						};
					case "hr":		// Croatian
						return {
							reveal_all:							"Otkrijte sve spojlere"
						};
					case "hu":		// Hungarian
						return {
							reveal_all:							"Feltárja az összes spoilert"
						};
					case "it":		// Italian
						return {
							reveal_all:							"Rivela tutti gli spoiler"
						};
					case "ja":		// Japanese
						return {
							reveal_all:							"すべてのネタバレを明らかにする"
						};
					case "ko":		// Korean
						return {
							reveal_all:							"모든 스포일러 공개"
						};
					case "lt":		// Lithuanian
						return {
							reveal_all:							"Atskleiskite visus spoilerius"
						};
					case "nl":		// Dutch
						return {
							reveal_all:							"Onthul alle spoilers"
						};
					case "no":		// Norwegian
						return {
							reveal_all:							"Avslør alle spoilere"
						};
					case "pl":		// Polish
						return {
							reveal_all:							"Odkryj wszystkie spoilery"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							reveal_all:							"Revelar todos os spoilers"
						};
					case "ro":		// Romanian
						return {
							reveal_all:							"Dezvăluie toate spoilerele"
						};
					case "ru":		// Russian
						return {
							reveal_all:							"Показать все спойлеры"
						};
					case "sv":		// Swedish
						return {
							reveal_all:							"Avslöja alla spoilers"
						};
					case "th":		// Thai
						return {
							reveal_all:							"เปิดเผยสปอยเลอร์ทั้งหมด"
						};
					case "tr":		// Turkish
						return {
							reveal_all:							"Tüm Spoilerleri Göster"
						};
					case "uk":		// Ukrainian
						return {
							reveal_all:							"Розкрийте всі спойлери"
						};
					case "vi":		// Vietnamese
						return {
							reveal_all:							"Tiết lộ tất cả Spoilers"
						};
					case "zh-CN":	// Chinese (China)
						return {
							reveal_all:							"显示所有剧透"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							reveal_all:							"顯示所有劇透"
						};
					default:		// English
						return {
							reveal_all:							"Reveal all Spoilers"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();