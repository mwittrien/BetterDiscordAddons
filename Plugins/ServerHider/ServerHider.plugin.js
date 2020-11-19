/**
 * @name ServerHider
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerHider
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerHider/ServerHider.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerHider/ServerHider.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ServerHider",
			"author": "DevilBro",
			"version": "6.1.9",
			"description": "Hide Servers in your Serverlist"
		},
		"changeLog": {
			"fixed": {
				"Works again": "Can discord stop messing with the server list, jeez"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
	} : (([Plugin, BDFDB]) => {
		return class ServerHider extends Plugin {
			onLoad() {
				this.patchedModules = {
					after: {
						Guilds: "render"
					}
				};
			}
			
			onStart() {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.FolderStore, "getGuildFolderById", {after: e => {
					let hiddenGuildIds = BDFDB.DataUtils.load(this, "hidden", "servers") || [];
					if (e.returnValue && hiddenGuildIds.length) {
						let folder = Object.assign({}, e.returnValue);
						folder.guildIds = [].concat(folder.guildIds).filter(n => !hiddenGuildIds.includes(n));
						folder.hiddenGuildIds = [].concat(folder.guildIds).filter(n => hiddenGuildIds.includes(n));
						return folder;
					}
				}});

				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					color: BDFDB.LibraryComponents.Button.Colors.RED,
					label: "Unhide all Servers/Folders",
					onClick: _ => {
						BDFDB.ModalUtils.confirm(this, "Are you sure you want to unhide all servers and folders?", _ => {
							BDFDB.DataUtils.save([], this, "hidden");
							BDFDB.PatchUtils.forceAllUpdates(this);
						});
					},
					children: BDFDB.LanguageUtils.LanguageStrings.RESET
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}
			
			onGuildContextMenu (e) {
				if (document.querySelector(BDFDB.dotCN.modalwrapper)) return;
				if (e.type == "GuildIconNewContextMenu") {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "create", group: true});
					this.injectItem(e.instance, children, -1);
				}
				else {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					this.injectItem(e.instance, children, index);
				}
			}

			onGuildFolderContextMenu (e) {
				if (document.querySelector(BDFDB.dotCN.modalwrapper)) return;
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				this.injectItem(e.instance, children, index);
			}
			
			injectItem (instance, children, index) {
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: [
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_serverhider_text,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "submenu-hide"),
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: [
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_openhidemenu_text,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "openmenu"),
										action: _ => {
											this.showHideModal();
										}
									}),
									!instance.props.guild && !instance.props.folderId ? null : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: instance.props.guild ? this.labels.submenu_hideserver_text : this.labels.submenu_hidefolder_text,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "hide"),
										action: _ => {
											if (instance.props.guild) this.toggleItem(BDFDB.DataUtils.load(this, "hidden", "servers") || [], instance.props.guild.id, "servers");
											else this.toggleItem(BDFDB.DataUtils.load(this, "hidden", "folders") || [], instance.props.folderId, "folders");
										}
									})
								].filter(n => n)
							})
						})
					]
				}));
			}
		
			processGuilds (e) {
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let children = childrenRender(...args);
						this.checkTree(children);
						return children;
					};
				}
				else this.checkTree(e.returnvalue);
			}
			
			checkTree (returnvalue) {
				let tree = BDFDB.ReactUtils.findChild(returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
				if (tree) {
					let childrenRender = tree.props.children;
					tree.props.children = (...args) => {
						let children = childrenRender(...args);
						this.handleGuilds(children);
						return children;
					};
				}
				else this.handleGuilds(returnvalue);
			}

			handleGuilds (returnvalue) {
				let hiddenEles = BDFDB.DataUtils.load(this, "hidden");
				let hiddenGuildIds = hiddenEles.servers || [];
				let hiddenFolderIds = hiddenEles.folders || [];
				if (hiddenGuildIds.length || hiddenFolderIds.length) {
					let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {props:["folderId", "guildId"], someProps:true});
					if (index > -1) for (let i in children) if (children[i] && children[i].props) {
						if (children[i].props.folderId) {
							if (hiddenFolderIds.includes(children[i].props.folderId)) children[i] = null;
							else {
								let guildIds = [].concat(children[i].props.guildIds.filter(guildId => !hiddenGuildIds.includes(guildId)));
								if (guildIds.length) {
									children[i].props.hiddenGuildIds = [].concat(children[i].props.guildIds.filter(guildId => hiddenGuildIds.includes(guildId)));
									children[i].props.guildIds = guildIds;
								}
								else children[i] = null;
							}
						}
						else if (children[i].props.guildId && hiddenGuildIds.includes(children[i].props.guildId)) children[i] = null;
					}
				}
			}

			showHideModal () {
				let hiddenGuildIds = BDFDB.DataUtils.load(this, "hidden", "servers") || [];
				let hiddenFolderIds = BDFDB.DataUtils.load(this, "hidden", "folders") || [];
				let guilds = BDFDB.LibraryModules.FolderStore.guildFolders.map(n => n.guildIds).flat(10).map(guildId => BDFDB.LibraryModules.GuildStore.getGuild(guildId)).filter(n => n);
				let folders = BDFDB.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId);
				let foldersAdded = [];
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.modal_header_text,
					subheader: "",
					contentClassName: BDFDB.disCN.listscroller,
					children: guilds.map((guild, i) => {
						let folder = folders.find(folder => folder.guildIds.includes(guild.id) && !foldersAdded.includes(folder.folderId));
						if (folder) foldersAdded.push(folder.folderId);
						return [
							folder ? [
								folders.indexOf(folder) == 0 ? null : [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
										className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
										className: BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom4
									})
								],
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
									prefix: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.listavatar,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.BlobMask, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
												className: BDFDB.disCN.guildfolder,
												children: BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.guildfoldericonwrapper,
													children: BDFDB.ReactUtils.createElement("div", {
														className: BDFDB.disCN.guildfoldericonwrapperexpanded,
														children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
															name: BDFDB.LibraryComponents.SvgIcon.Names.FOLDER,
															color: BDFDB.ColorUtils.convert(folder.folderColor, "RGB") || BDFDB.DiscordConstants.Colors.BRAND
														})
													})
												})
											})
										})
									}),
									label: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
										children: folder.folderName || `${BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER} #${folders.indexOf(folder) + 1}`
									}),
									suffix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
										value: !hiddenFolderIds.includes(folder.folderId),
										onChange: value => {this.toggleItem(hiddenFolderIds, folder.folderId, "folders", value);}
									})
								})
							] : null,
							i == 0 && !folder ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
								prefix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Guild, {
									className: BDFDB.disCN.listavatar,
									guild: guild,
									menu: false,
									tooltip: false
								}),
								label: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
									children: guild.name
								}),
								suffix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
									value: !hiddenGuildIds.includes(guild.id),
									onChange: value => {this.toggleItem(hiddenGuildIds, guild.id, "servers", value);}
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
						click: (modal, instance) => {
							let enabled = hiddenGuildIds.includes(guilds[0].id);
							hiddenGuildIds = [].concat(enabled ? [] : guilds.map(n => n.id));
							BDFDB.DataUtils.save(hiddenGuildIds, this, "hidden", "servers");
							hiddenFolderIds = [].concat(enabled ? [] : folders.map(n => n.folderId));
							BDFDB.DataUtils.save(hiddenFolderIds, this, "hidden", "folders");
							let switchInstances = BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_Switch", all:true, unlimited:true});
							for (let switchIns of switchInstances) switchIns.props.value = enabled;
							BDFDB.ReactUtils.forceUpdate(switchInstances);
							BDFDB.PatchUtils.forceAllUpdates(this);
						}
					}]
				});
			}
			
			toggleItem (array, id, type, force) {
				if (!id) return;
				if (force || (force === undefined && array.includes(id))) BDFDB.ArrayUtils.remove(array, id, true);
				else array.push(id);
				BDFDB.DataUtils.save(array, this, "hidden", type);
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							modal_header_text:				"Upravljanje popisom poslužitelja",
							context_serverhider_text:		"Vidljivost poslužitelj",
							submenu_hideserver_text:		"Sakrij poslužitelj",
							submenu_hidefolder_text:		"Sakrij mapu",
							submenu_openhidemenu_text:		"Upravljanje popisom poslužitelja"
						};
					case "da":		//danish
						return {
							modal_header_text:				"Styring af serverliste",
							context_serverhider_text:		"Server synlighed",
							submenu_hideserver_text:		"Skjul server",
							submenu_hidefolder_text:		"Skjul mappe",
							submenu_openhidemenu_text:		"Styre serverliste"
						};
					case "de":		//german
						return {
							modal_header_text:				"Verwaltung der Serverliste",
							context_serverhider_text:		"Serversichtbarkeit",
							submenu_hideserver_text:		"Server verstecken",
							submenu_hidefolder_text:		"Ordner verstecken",
							submenu_openhidemenu_text:		"Serverliste verwalten"
						};
					case "es":		//spanish
						return {
							modal_header_text:				"Administración de lista de servidores",
							context_serverhider_text:		"Visibilidad del servidor",
							submenu_hideserver_text:		"Ocultar servidor",
							submenu_hidefolder_text:		"Ocultar carpeta",
							submenu_openhidemenu_text:		"Administrar lista de servidores"
						};
					case "fr":		//french
						return {
							modal_header_text:				"Gestion de la liste des serveurs",
							context_serverhider_text:		"Visibilité du serveur",
							submenu_hideserver_text:		"Cacher le serveur",
							submenu_hidefolder_text:		"Cacher le dossier",
							submenu_openhidemenu_text:		"Gérer la liste des serveurs"
						};
					case "it":		//italian
						return {
							modal_header_text:				"Gestione dell'elenco dei server",
							context_serverhider_text:		"Visibilità del server",
							submenu_hideserver_text:		"Nascondi il server",
							submenu_hidefolder_text:		"Nascondi la cartella",
							submenu_openhidemenu_text:		"Gestione elenco dei server"
						};
					case "nl":		//dutch
						return {
							modal_header_text:				"Beheer van de Serverlijst",
							context_serverhider_text:		"Server zichtbaarheid",
							submenu_hideserver_text:		"Verberg server",
							submenu_hidefolder_text:		"Verberg map",
							submenu_openhidemenu_text:		"Beheer serverlijst"
						};
					case "no":		//norwegian
						return {
							modal_header_text:				"Administrasjon av serverlisten",
							context_serverhider_text:		"Server synlighet",
							submenu_hideserver_text:		"Skjul server",
							submenu_hidefolder_text:		"Skjul mappe",
							submenu_openhidemenu_text:		"Administrer serverliste"
						};
					case "pl":		//polish
						return {
							modal_header_text:				"Zarządzanie listą serwerów",
							context_serverhider_text:		"Widoczność serwera",
							submenu_hideserver_text:		"Ukryj serwer",
							submenu_hidefolder_text:		"Ukryj folder",
							submenu_openhidemenu_text:		"Zarządzaj listą serwerów"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							modal_header_text:				"Gerenciamento da lista de servidores",
							context_serverhider_text:		"Visibilidade do servidor",
							submenu_hideserver_text:		"Ocultar servidor",
							submenu_hidefolder_text:		"Ocultar pasta",
							submenu_openhidemenu_text:		"Gerenciar lista de servidores"
						};
					case "fi":		//finnish
						return {
							modal_header_text:				"Palvelinluettelon hallinta",
							context_serverhider_text:		"Palvelimen näkyvyys",
							submenu_hideserver_text:		"Piilota palvelin",
							submenu_hidefolder_text:		"Piilota kansio",
							submenu_openhidemenu_text:		"Hallinnoi palvelinluetteloa"
						};
					case "sv":		//swedish
						return {
							modal_header_text:				"Hantering av serverlistan",
							context_serverhider_text:		"Server sikt",
							submenu_hideserver_text:		"Dölj server",
							submenu_hidefolder_text:		"Dölj mapp",
							submenu_openhidemenu_text:		"Hantera serverlistan"
						};
					case "tr":		//turkish
						return {
							modal_header_text:				"Sunucu Listesinin Yönetimi",
							context_serverhider_text:		"Sunucu görünürlüğü",
							submenu_hideserver_text:		"Sunucuyu Gizle",
							submenu_hidefolder_text:		"Klasörü Gizle",
							submenu_openhidemenu_text:		"Sunucu Listesini Yönet"
						};
					case "cs":		//czech
						return {
							modal_header_text:				"Správa seznamu serverů",
							context_serverhider_text:		"Viditelnost serveru",
							submenu_hideserver_text:		"Skrýt server",
							submenu_hidefolder_text:		"Skrýt složky",
							submenu_openhidemenu_text:		"Správa seznamu serverů"
						};
					case "bg":		//bulgarian
						return {
							modal_header_text:				"Управление на списъка със сървъри",
							context_serverhider_text:		"Видимост на сървъра",
							submenu_hideserver_text:		"Скриване на сървър",
							submenu_hidefolder_text:		"Скриване на папка",
							submenu_openhidemenu_text:		"Управление на списъка със сървъри"
						};
					case "ru":		//russian
						return {
							modal_header_text:				"Управление списком серверов",
							context_serverhider_text:		"Видимость сервера",
							submenu_hideserver_text:		"Скрыть сервер",
							submenu_hidefolder_text:		"Скрыть папки",
							submenu_openhidemenu_text:		"Управление списком серверов"
						};
					case "uk":		//ukrainian
						return {
							modal_header_text:				"Управління списком серверів",
							context_serverhider_text:		"Видимість сервера",
							submenu_hideserver_text:		"Сховати сервер",
							submenu_hidefolder_text:		"Сховати папки",
							submenu_openhidemenu_text:		"Управління списком серверів"
						};
					case "ja":		//japanese
						return {
							modal_header_text:				"サーバリストの管理",
							context_serverhider_text:		"サーバーの可視性",
							submenu_hideserver_text:		"サーバーを隠す",
							submenu_hidefolder_text:		"フォルダーを非表示",
							submenu_openhidemenu_text:		"サーバーリストを管理する"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							modal_header_text:				"管理服务器列表",
							context_serverhider_text:		"服務器可見性",
							submenu_hideserver_text:		"隐藏服务器",
							submenu_hidefolder_text:		"隱藏資料夾",
							submenu_openhidemenu_text:		"管理服务器列表"
						};
					case "ko":		//korean
						return {
							modal_header_text:				"서버 목록 관리",
							context_serverhider_text:		"서버 가시성",
							submenu_hideserver_text:		"서버 숨기기",
							submenu_hidefolder_text:		"폴더 숨기기",
							submenu_openhidemenu_text:		"서버 목록 관리"
						};
					default:		//default: english
						return {
							modal_header_text:				"Managing Serverlist",
							context_serverhider_text:		"Server Visibility",
							submenu_hideserver_text:		"Hide Server",
							submenu_hidefolder_text:		"Hide Folder",
							submenu_openhidemenu_text:		"Manage Serverlist"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();