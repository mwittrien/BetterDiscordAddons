/**
 * @name ServerHider
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 6.2.6
 * @description Allows you to hide certain Servers in your Server List
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerHider/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ServerHider/ServerHider.plugin.js
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
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
		let hiddenEles;
		
		return class ServerHider extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						onlyHideInStream:	{value: false, 	description: "Only hide selected Servers while in Streamer Mode"}
					}
				};
				
				this.modulePatches = {
					after: [
						"GuildsBar"
					]
				};
			}
			
			onStart () {
				hiddenEles = BDFDB.DataUtils.load(this, "hidden");
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dispatch", {after: e => {
					if (e.methodArguments[0].type == "STREAMER_MODE_UPDATE") BDFDB.DiscordUtils.rerenderAll(true);
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SortedGuildUtils, "getGuildFolderById", {after: e => {
					let hiddenGuildIds = hiddenEles.servers || [];
					if (e.returnValue && hiddenGuildIds.length) {
						let folder = Object.assign({}, e.returnValue);
						folder.guildIds = [].concat(folder.guildIds).filter(n => !hiddenGuildIds.includes(n));
						folder.hiddenGuildIds = [].concat(folder.guildIds).filter(n => hiddenGuildIds.includes(n));
						return folder;
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.GuildReadStateStore, "getMutableGuildStates", {after: e => {
					if (!e.returnValue || this.settings.general.onlyHideInStream && !BDFDB.LibraryStores.StreamerModeStore.enabled) return;
					let hiddenGuildIds = hiddenEles && hiddenEles.servers || [];
					if (hiddenGuildIds.length) for (let id in e.returnValue) if (hiddenGuildIds.includes(id)) e.returnValue[id] = Object.assign({}, e.returnValue[id], {mentionCount: 0, mentionCounts: {}});
				}});

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
				
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Unhide all Servers/Folders",
							onClick: _ => {
								BDFDB.ModalUtils.confirm(this, "Are you sure you want to unhide all Servers and Folders?", _ => {
									BDFDB.DataUtils.save([], this, "hidden");
									BDFDB.DiscordUtils.rerenderAll(true);
								});
							},
							children: BDFDB.LanguageUtils.LanguageStrings.RESET
						}));
						
						return settingsItems;
					}
				});
			}
			
			onGuildContextMenu (e) {
				if (document.querySelector(BDFDB.dotCN.modalwrapper) || !BDFDB.DOMUtils.getParent(BDFDB.dotCN.guilds, e.instance.props.target)) return;
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: [
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_serverhider,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "submenu-hide"),
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: [
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_openhidemenu,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "openmenu"),
										action: _ => this.showHideModal()
									}),
									!e.instance.props.guild && !e.instance.props.folderId ? null : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: e.instance.props.guild ? this.labels.submenu_hideserver : this.labels.submenu_hidefolder,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "hide"),
										action: _ => {
											if (e.instance.props.guild) this.toggleItem(hiddenEles && hiddenEles.servers || [], e.instance.props.guild.id, "servers");
											else this.toggleItem(hiddenEles && hiddenEles.folders || [] || [], e.instance.props.folderId, "folders");
										}
									})
								].filter(n => n)
							})
						})
					]
				}));
			}
		
			processGuildsBar (e) {
				if (this.settings.general.onlyHideInStream && !BDFDB.LibraryStores.StreamerModeStore.enabled) return;
				let hiddenGuildIds = hiddenEles.servers || [];
				let hiddenFolderIds = hiddenEles.folders || [];
				if (!hiddenGuildIds.length && !hiddenFolderIds.length) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: ["folderNode", "guildNode"], someProps: true});
				if (index > -1) for (let i in children) if (children[i] && children[i].props) {
					if (children[i].props.folderNode) {
						if (hiddenFolderIds.includes(children[i].props.folderNode.id)) children[i] = null;
						else {
							let guilds = [].concat(children[i].props.folderNode.children.filter(guild => !hiddenGuildIds.includes(guild.id)));
							if (guilds.length) {
								children[i].props.hiddenGuildIds = [].concat(children[i].props.folderNode.children.filter(guild => hiddenGuildIds.includes(guild.id)));
								children[i].props.folderNode = Object.assign({}, children[i].props.folderNode, {children: guilds});
							}
							else children[i] = null;
						}
					}
					else if (children[i].props.guildNode && hiddenGuildIds.includes(children[i].props.guildNode.id)) children[i] = null;
				}
			}

			showHideModal () {
				let switchInstances = {};
				
				let hiddenGuildIds = hiddenEles && hiddenEles.servers || [];
				let hiddenFolderIds = hiddenEles && hiddenEles.folders || [];
				let guilds = BDFDB.LibraryModules.SortedGuildUtils.guildFolders.map(n => n.guildIds).flat(10).map(guildId => BDFDB.LibraryStores.GuildStore.getGuild(guildId)).filter(n => n);
				let folders = BDFDB.LibraryModules.SortedGuildUtils.guildFolders.filter(n => n.folderId);
				let foldersAdded = [];
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.modal_header,
					subHeader: "",
					contentClassName: BDFDB.disCN.listscroller,
					children: guilds.map((guild, i) => {
						let folder = folders.find(folder => folder.guildIds.includes(guild.id));
						let firstGuildInFolder = folder && !foldersAdded.includes(folder.folderId);
						if (firstGuildInFolder) foldersAdded.push(folder.folderId);
						return [
							firstGuildInFolder ? [
								!(folders.indexOf(folder) == 0 && i == 0) && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
									prefix: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.listavatar,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
											className: BDFDB.disCN.guildfoldericonwrapper,
											children: BDFDB.ReactUtils.createElement("div", {
												className: BDFDB.disCN.guildfoldericonwrapperexpanded,
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													name: BDFDB.LibraryComponents.SvgIcon.Names.FOLDER,
													color: BDFDB.ColorUtils.convert(folder.folderColor, "RGB") || "var(--bdfdb-blurple)"
												})
											})
										})
									}),
									label: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
										children: folder.folderName || `${BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER} #${folders.indexOf(folder) + 1}`
									}),
									suffix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
										value: !hiddenFolderIds.includes(folder.folderId),
										onChange: value => this.toggleItem(hiddenFolderIds, folder.folderId, "folders", value)
									})
								})
							] : null,
							(i > 0 || folder) && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
								prefix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildIconComponents.Icon, {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.listavatar, folder && BDFDB.disCN.marginleft8),
									guild: guild,
									size: BDFDB.LibraryComponents.GuildIconComponents.Icon.Sizes.MEDIUM
								}),
								label: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
									children: guild.name
								}),
								suffix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
									ref: instance => {if (instance) switchInstances[guild.id] = instance;},
									value: !hiddenGuildIds.includes(guild.id),
									onChange: value => this.toggleItem(hiddenGuildIds, guild.id, "servers", value)
								})
							})
						];
					}).flat(10).filter(n => n),
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.OKAY,
						color: "BRAND",
						close: true
					}, {
						contents: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL,
						color: "TRANSPARENT",
						look: "LINK",
						onClick: (modal, instance) => {
							let enabled = hiddenGuildIds.includes(guilds[0].id);
							hiddenGuildIds = [].concat(enabled ? [] : guilds.map(n => n.id));
							hiddenFolderIds = [].concat(enabled ? [] : folders.map(n => n.folderId));
							hiddenEles = {servers: hiddenGuildIds, folders: hiddenFolderIds};
							BDFDB.DataUtils.save(hiddenEles, this, "hidden");
							for (let i in switchInstances) switchInstances[i].props.value = enabled;
							BDFDB.ReactUtils.forceUpdate(BDFDB.ObjectUtils.toArray(switchInstances));
							BDFDB.DiscordUtils.rerenderAll(true);
						}
					}]
				});
			}
			
			toggleItem (array, id, type, force) {
				if (!id) return;
				if (force || (force === undefined && array.includes(id))) BDFDB.ArrayUtils.remove(array, id, true);
				else array.push(id);
				hiddenEles = Object.assign({}, hiddenEles, {[type]: array});
				BDFDB.DataUtils.save(hiddenEles, this, "hidden");
				BDFDB.DiscordUtils.rerenderAll(true);
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_serverhider:				"Видимост на сървъра",
							modal_header:						"Управление на сървърния списък",
							submenu_hidefolder:					"Скриване на папката",
							submenu_hideserver:					"Скриване на сървъра",
							submenu_openhidemenu:				"Управление на сървърния списък"
						};
					case "da":		// Danish
						return {
							context_serverhider:				"Server synlighed",
							modal_header:						"Administration af serverliste",
							submenu_hidefolder:					"Skjul mappe",
							submenu_hideserver:					"Skjul server",
							submenu_openhidemenu:				"Administrer serverliste"
						};
					case "de":		// German
						return {
							context_serverhider:				"Serversichtbarkeit",
							modal_header:						"Serverlistenverwaltung",
							submenu_hidefolder:					"Ordner ausblenden",
							submenu_hideserver:					"Server ausblenden",
							submenu_openhidemenu:				"Serverliste verwalten"
						};
					case "el":		// Greek
						return {
							context_serverhider:				"Ορατότητα διακομιστή",
							modal_header:						"Διαχείριση λίστας διακομιστών",
							submenu_hidefolder:					"Απόκρυψη φακέλου",
							submenu_hideserver:					"Απόκρυψη διακομιστή",
							submenu_openhidemenu:				"Διαχείριση λίστας διακομιστών"
						};
					case "es":		// Spanish
						return {
							context_serverhider:				"Visibilidad del servidor",
							modal_header:						"Gestión de la lista de servidores",
							submenu_hidefolder:					"Ocultar carpeta",
							submenu_hideserver:					"Ocultar servidor",
							submenu_openhidemenu:				"Administrar lista de servidores"
						};
					case "fi":		// Finnish
						return {
							context_serverhider:				"Palvelimen näkyvyys",
							modal_header:						"Palvelinluettelon hallinta",
							submenu_hidefolder:					"Piilota kansio",
							submenu_hideserver:					"Piilota palvelin",
							submenu_openhidemenu:				"Hallitse palvelinluetteloa"
						};
					case "fr":		// French
						return {
							context_serverhider:				"Visibilité du serveur",
							modal_header:						"Gestion de la liste des serveurs",
							submenu_hidefolder:					"Masquer le dossier",
							submenu_hideserver:					"Masquer le serveur",
							submenu_openhidemenu:				"Gérer la liste des serveurs"
						};
					case "hr":		// Croatian
						return {
							context_serverhider:				"Vidljivost poslužitelja",
							modal_header:						"Upravljanje popisom poslužitelja",
							submenu_hidefolder:					"Sakrij mapu",
							submenu_hideserver:					"Sakrij poslužitelj",
							submenu_openhidemenu:				"Upravljanje popisom poslužitelja"
						};
					case "hu":		// Hungarian
						return {
							context_serverhider:				"Szerver láthatósága",
							modal_header:						"Szerverlista kezelése",
							submenu_hidefolder:					"Mappa elrejtése",
							submenu_hideserver:					"Szerver elrejtése",
							submenu_openhidemenu:				"Szerverlista kezelése"
						};
					case "it":		// Italian
						return {
							context_serverhider:				"Visibilità del server",
							modal_header:						"Gestione dell'elenco dei server",
							submenu_hidefolder:					"Nascondi cartella",
							submenu_hideserver:					"Nascondi server",
							submenu_openhidemenu:				"Gestisci elenco server"
						};
					case "ja":		// Japanese
						return {
							context_serverhider:				"サーバーの可視性",
							modal_header:						"サーバーリストの管理",
							submenu_hidefolder:					"フォルダを隠す",
							submenu_hideserver:					"サーバーを隠す",
							submenu_openhidemenu:				"サーバーリストの管理"
						};
					case "ko":		// Korean
						return {
							context_serverhider:				"서버 가시성",
							modal_header:						"서버 목록 관리",
							submenu_hidefolder:					"폴더 숨기기",
							submenu_hideserver:					"서버 숨기기",
							submenu_openhidemenu:				"서버 목록 관리"
						};
					case "lt":		// Lithuanian
						return {
							context_serverhider:				"Serverio matomumas",
							modal_header:						"Serverių sąrašo tvarkymas",
							submenu_hidefolder:					"Slėpti aplanką",
							submenu_hideserver:					"Slėpti serverį",
							submenu_openhidemenu:				"Tvarkyti serverių sąrašą"
						};
					case "nl":		// Dutch
						return {
							context_serverhider:				"Zichtbaarheid van de server",
							modal_header:						"Serverlijst beheren",
							submenu_hidefolder:					"Verberg map",
							submenu_hideserver:					"Verberg server",
							submenu_openhidemenu:				"Beheer serverlijst"
						};
					case "no":		// Norwegian
						return {
							context_serverhider:				"Server synlighet",
							modal_header:						"Administrere serverliste",
							submenu_hidefolder:					"Skjul mappe",
							submenu_hideserver:					"Skjul server",
							submenu_openhidemenu:				"Administrer serverliste"
						};
					case "pl":		// Polish
						return {
							context_serverhider:				"Widoczność serwera",
							modal_header:						"Zarządzanie listą serwerów",
							submenu_hidefolder:					"Ukryj folder",
							submenu_hideserver:					"Ukryj serwer",
							submenu_openhidemenu:				"Zarządzaj listą serwerów"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_serverhider:				"Visibilidade do servidor",
							modal_header:						"Gerenciando a lista de servidores",
							submenu_hidefolder:					"Ocultar pasta",
							submenu_hideserver:					"Esconder Servidor",
							submenu_openhidemenu:				"Gerenciar lista de servidores"
						};
					case "ro":		// Romanian
						return {
							context_serverhider:				"Vizibilitatea serverului",
							modal_header:						"Gestionarea listei serverelor",
							submenu_hidefolder:					"Ascundeți dosarul",
							submenu_hideserver:					"Ascundeți serverul",
							submenu_openhidemenu:				"Gestionați lista serverelor"
						};
					case "ru":		// Russian
						return {
							context_serverhider:				"Видимость сервера",
							modal_header:						"Управление списком серверов",
							submenu_hidefolder:					"Скрыть папку",
							submenu_hideserver:					"Скрыть сервер",
							submenu_openhidemenu:				"Управление списком серверов"
						};
					case "sv":		// Swedish
						return {
							context_serverhider:				"Servers synlighet",
							modal_header:						"Hantera serverlista",
							submenu_hidefolder:					"Dölj mapp",
							submenu_hideserver:					"Dölj server",
							submenu_openhidemenu:				"Hantera serverlista"
						};
					case "th":		// Thai
						return {
							context_serverhider:				"การเปิดเผยเซิร์ฟเวอร์",
							modal_header:						"การจัดการรายชื่อเซิร์ฟเวอร์",
							submenu_hidefolder:					"ซ่อนโฟลเดอร์",
							submenu_hideserver:					"ซ่อนเซิร์ฟเวอร์",
							submenu_openhidemenu:				"จัดการรายชื่อเซิร์ฟเวอร์"
						};
					case "tr":		// Turkish
						return {
							context_serverhider:				"Sunucu Görünürlüğü",
							modal_header:						"Sunucu Listesini Yönetme",
							submenu_hidefolder:					"Klasörü Gizle",
							submenu_hideserver:					"Sunucuyu Gizle",
							submenu_openhidemenu:				"Sunucu Listesini Yönetin"
						};
					case "uk":		// Ukrainian
						return {
							context_serverhider:				"Видимість сервера",
							modal_header:						"Керування списком серверів",
							submenu_hidefolder:					"Сховати папку",
							submenu_hideserver:					"Сховати сервер",
							submenu_openhidemenu:				"Керування списком серверів"
						};
					case "vi":		// Vietnamese
						return {
							context_serverhider:				"Hiển thị Máy chủ",
							modal_header:						"Quản lý danh sách máy chủ",
							submenu_hidefolder:					"Ẩn thư mục",
							submenu_hideserver:					"Ẩn máy chủ",
							submenu_openhidemenu:				"Quản lý danh sách máy chủ"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_serverhider:				"服务器可见性",
							modal_header:						"管理服务器列表",
							submenu_hidefolder:					"隐藏资料夹",
							submenu_hideserver:					"隐藏服务器",
							submenu_openhidemenu:				"管理服务器列表"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_serverhider:				"服務器可見性",
							modal_header:						"管理服務器列表",
							submenu_hidefolder:					"隱藏資料夾",
							submenu_hideserver:					"隱藏服務器",
							submenu_openhidemenu:				"管理服務器列表"
						};
					default:		// English
						return {
							context_serverhider:				"Server Visibility",
							modal_header:						"Managing Server List",
							submenu_hidefolder:					"Hide Folder",
							submenu_hideserver:					"Hide Server",
							submenu_openhidemenu:				"Manage Server List"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();