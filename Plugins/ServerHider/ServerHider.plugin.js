//META{"name":"ServerHider","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerHider","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerHider/ServerHider.plugin.js"}*//

class ServerHider {
	getName () {return "ServerHider";}

	getVersion () {return "6.0.9";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Hide Servers in your Serverlist";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"Guild":["componentDidMount","componentDidUpdate"]
		};
	}

	initConstructor () {
		this.serverHiderModalMarkup =
			`<span class="${this.name}-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<button type="button" class="${BDFDB.disCNS.modalclose + BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">
										<svg name="Close" width="18" height="18" viewBox="0 0 12 12" style="flex: 0 1 auto;">
											<g fill="none" fill-rule="evenodd">
												<path d="M0 0h12v12H0"></path>
												<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
											</g>
										</svg>
									</div>
								</button>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.scrollerthemeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} entries"></div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-ok ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
								<button type="button" class="btn-all ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlooklink + BDFDB.disCNS.buttoncolortransparent + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.serverEntryMarkup =
			`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} entry" style="flex: 1 1 auto;">
				<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCNS.flexchild + BDFDB.disCNS.overflowellipsis} serverhiderName" style="flex: 1 1 auto; white-space: nowrap;"></h3>
				<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
					<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} serverhiderCheckbox">
				</div>
			</div>`;

		this.defaults = {
			settings: {
				clearNotifications:	{value:false, 	description:"Automatically clear any kind of notification of all hidden servers."},
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Servers.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.DOMUtils.create(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".reset-button", () => {
			BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all servers?", () => {
				BDFDB.DataUtils.remove(this, "servers");
				BDFDB.GuildUtils.getAll().forEach(info => {if (!info.div.getAttribute("folder")) BDFDB.DOMUtils.hide(info.div);});
			});
		});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.GuildUtils.getAll().forEach(info => {
				if (info.div.ServerHiderChangeObserver && typeof info.div.ServerHiderChangeObserver.disconnect == "function") info.div.ServerHiderChangeObserver.disconnect();
				if (!info.div.getAttribute("folder")) BDFDB.DOMUtils.show(info.div);
				delete info.div.ServerHiderChanged;
			});

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);

		this.serverEntryMarkup = 			this.serverEntryMarkup.replace("REPLACE_btn_visible_text", this.labels.btn_visible_text);
	}

	onGuildContextMenu (instance, menu, returnvalue) {
		if (document.querySelector(".BDFDB-modal")) return;
		if (instance.props && instance.props.target && instance.props.type.indexOf("GUILD_ICON_") == 0 && !menu.querySelector(`${this.name}-contextMenuSubItem`)) {
			let [children, index] = BDFDB.ReactUtils.findChildren(returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
			const itemgroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: this.labels.context_serverhider_text,
						className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem`,
						render: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
							className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_openhidemenu_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-hidemenu-ContextMenuItem`,
									action: e => {
										BDFDB.ContextMenuUtils.close(menu);
										this.showServerModal();
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_hideserver_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-hideserver-ContextMenuItem`,
									disabled: !(instance.props.guild && !instance.props.target.getAttribute("folder")),
									action: e => {
										BDFDB.ContextMenuUtils.close(menu);
										this.toggleServer(instance.props.guild, instance.props.target, false);
									}
								})
							]
						})]
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	processGuild (instance, wrapper, returnvalue, methodnames) {
		if (instance.props && instance.props.guild) {
			let hiddenservers = BDFDB.DataUtils.load(this, "hiddenservers", "hiddenservers") || [];
			if (methodnames.includes("componentDidMount")) this.toggleServer(instance.props.guild, wrapper, !hiddenservers.includes(instance.props.guild.id));
			if (methodnames.includes("componentDidUpdate") && hiddenservers.includes(instance.props.guild.id) && instance.props.unread) this.unreadServer(instance.props.guild.id);
		}
	}

	showServerModal () {
		let serverHiderModal = BDFDB.DOMUtils.create(this.serverHiderModalMarkup);
		let container = serverHiderModal.querySelector(".entries");
		if (!container) return;

		BDFDB.ListenerUtils.addToChildren(serverHiderModal, "click", ".btn-all", () => {
			let firstcheckbox = serverHiderModal.querySelector(".serverhiderCheckbox");
			firstcheckbox.click();
			serverHiderModal.querySelectorAll(".serverhiderCheckbox").forEach(checkbox => {
				if (checkbox != firstcheckbox && checkbox.checked != firstcheckbox.checked) checkbox.click();
			});
		});

		for (let info of BDFDB.GuildUtils.getAll()) {
			if (!info.div.getAttribute("folder")) {
				if (container.firstElementChild) container.appendChild(BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.divider}"></div>`));
				let entry = BDFDB.DOMUtils.create(this.serverEntryMarkup);
				container.appendChild(entry);
				let name = entry.querySelector(".serverhiderName");
				name.innerText = info.name || "";
				name.parentElement.insertBefore(BDFDB.GuildUtils.createCopy(info, {click: () => {BDFDB.DOMUtils.remove(serverHiderModal);}, menu: true, size: 48}), name);
				let hidecheckbox = entry.querySelector(".serverhiderCheckbox");
				hidecheckbox.checked = !BDFDB.DOMUtils.isHidden(info.div);
				hidecheckbox.addEventListener("click", e => {
					this.toggleServer(info, info.div, e.currentTarget.checked);
				});
			}
		}
		BDFDB.appendModal(serverHiderModal);
	}

	toggleServer (info, target, visible) {
		if (!info || !target) return;
		let guilddiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, target);
		if (!guilddiv || guilddiv.getAttribute("folder")) return;
		BDFDB.DOMUtils.toggle(guilddiv, visible);
		let hiddenservers = BDFDB.DataUtils.load(this, "hiddenservers", "hiddenservers") || [];
		BDFDB.ArrayUtils.remove(hiddenservers, info.id);
		if (!visible) {
			if (BDFDB.ReactUtils.getValue(guilddiv, "return.stateNode.props").unread) this.unreadServer(info.id);
			hiddenservers.push(info.id);
		}
		BDFDB.DataUtils.save(hiddenservers, this, "hiddenservers", "hiddenservers");
	}

	unreadServer (id) {
		if (BDFDB.DataUtils.get(this, "settings", "clearNotifications") && !this.isInFolder(id)) BDFDB.GuildUtils.markAsRead(id);
	}

	isInFolder (id) {
		if (!BDFDB.BDUtils.isPluginEnabled("ServerFolders")) return false;
		let folders = BDFDB.DataUtils.load("ServerFolders", "folders");
		for (let folderid in folders) if ((folders[folderid].servers || []).includes(id)) return true;
		return false;
	}

	setLabelsByLanguage () {
		switch (BDFDB.LanguageUtils.getLanguage().id) {
			case "hr":		//croatian
				return {
					modal_header_text:				"Upravljanje popisom poslužitelja",
					context_serverhider_text:		"Vidljivost poslužitelj",
					submenu_hideserver_text:		"Sakrij poslužitelj",
					submenu_openhidemenu_text:		"Upravljanje popisom poslužitelja"
				};
			case "da":		//danish
				return {
					modal_header_text:				"Styring af Serverliste",
					context_serverhider_text:		"Server synlighed",
					submenu_hideserver_text:		"Skjul Server",
					submenu_openhidemenu_text:		"Styre Serverliste"
				};
			case "de":		//german
				return {
					modal_header_text:				"Verwaltung der Serverliste",
					context_serverhider_text:		"Serversichtbarkeit",
					submenu_hideserver_text:		"Server verstecken",
					submenu_openhidemenu_text:		"Serverliste verwalten"
				};
			case "es":		//spanish
				return {
					modal_header_text:				"Administración de lista de servidores",
					context_serverhider_text:		"Visibilidad del servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Administrar lista de servidores"
				};
			case "fr":		//french
				return {
					modal_header_text:				"Gestion de la liste des serveurs",
					context_serverhider_text:		"Visibilité du serveur",
					submenu_hideserver_text:		"Cacher le serveur",
					submenu_openhidemenu_text:		"Gérer la liste des serveurs"
				};
			case "it":		//italian
				return {
					modal_header_text:				"Gestione dell'elenco dei server",
					context_serverhider_text:		"Visibilità del server",
					submenu_hideserver_text:		"Nascondi il server",
					submenu_openhidemenu_text:		"Gestione elenco dei server"
				};
			case "nl":		//dutch
				return {
					modal_header_text:				"Beheer van de Serverlijst",
					context_serverhider_text:		"Server zichtbaarheid",
					submenu_hideserver_text:		"Verberg server",
					submenu_openhidemenu_text:		"Beheer serverlijst"
				};
			case "no":		//norwegian
				return {
					modal_header_text:				"Administrasjon av serverlisten",
					context_serverhider_text:		"Server synlighet",
					submenu_hideserver_text:		"Skjul server",
					submenu_openhidemenu_text:		"Administrer serverliste"
				};
			case "pl":		//polish
				return {
					modal_header_text:				"Zarządzanie listą serwerów",
					context_serverhider_text:		"Widoczność serwera",
					submenu_hideserver_text:		"Ukryj serwer",
					submenu_openhidemenu_text:		"Zarządzaj listą serwerów"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					modal_header_text:				"Gerenciamento da lista de servidores",
					context_serverhider_text:		"Visibilidade do servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Gerenciar lista de servidores"
				};
			case "fi":		//finnish
				return {
					modal_header_text:				"Palvelinluettelon hallinta",
					context_serverhider_text:		"Palvelimen näkyvyys",
					submenu_hideserver_text:		"Piilota palvelin",
					submenu_openhidemenu_text:		"Hallinnoi palvelinluetteloa"
				};
			case "sv":		//swedish
				return {
					modal_header_text:				"Hantering av serverlistan",
					context_serverhider_text:		"Server sikt",
					submenu_hideserver_text:		"Dölj server",
					submenu_openhidemenu_text:		"Hantera serverlistan"
				};
			case "tr":		//turkish
				return {
					modal_header_text:				"Sunucu Listesinin Yönetimi",
					context_serverhider_text:		"Sunucu görünürlüğü",
					submenu_hideserver_text:		"Sunucuyu Gizle",
					submenu_openhidemenu_text:		"Sunucu Listesini Yönet"
				};
			case "cs":		//czech
				return {
					modal_header_text:				"Správa seznamu serverů",
					context_serverhider_text:		"Viditelnost serveru",
					submenu_hideserver_text:		"Skrýt server",
					submenu_openhidemenu_text:		"Správa seznamu serverů"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text:				"Управление на списъка със сървъри",
					context_serverhider_text:		"Видимост на сървъра",
					submenu_hideserver_text:		"Скриване на сървър",
					submenu_openhidemenu_text:		"Управление на списъка със сървъри"
				};
			case "ru":		//russian
				return {
					modal_header_text:				"Управление списком серверов",
					context_serverhider_text:		"Видимость сервера",
					submenu_hideserver_text:		"Скрыть сервер",
					submenu_openhidemenu_text:		"Управление списком серверов"
				};
			case "uk":		//ukrainian
				return {
					modal_header_text:				"Управління списком серверів",
					context_serverhider_text:		"Видимість сервера",
					submenu_hideserver_text:		"Сховати сервер",
					submenu_openhidemenu_text:		"Управління списком серверів"
				};
			case "ja":		//japanese
				return {
					modal_header_text:				"サーバリストの管理",
					context_serverhider_text:		"サーバーの可視性",
					submenu_hideserver_text:		"サーバーを隠す",
					submenu_openhidemenu_text:		"サーバーリストを管理する"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					modal_header_text:				"管理服务器列表",
					context_serverhider_text:		"服務器可見性",
					submenu_hideserver_text:		"隐藏服务器",
					submenu_openhidemenu_text:		"管理服务器列表"
				};
			case "ko":		//korean
				return {
					modal_header_text:				"서버 목록 관리",
					context_serverhider_text:		"서버 가시성",
					submenu_hideserver_text:		"서버 숨기기",
					submenu_openhidemenu_text:		"서버 목록 관리"
				};
			default:		//default: english
				return {
					modal_header_text:				"Managing Serverlist",
					context_serverhider_text:		"Server Visibility",
					submenu_hideserver_text:		"Hide Server",
					submenu_openhidemenu_text:		"Manage Serverlist"
				};
		}
	}
}
