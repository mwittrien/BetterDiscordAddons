//META{"name":"ServerHider","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerHider","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerHider/ServerHider.plugin.js"}*//

class ServerHider {
	getName () {return "ServerHider";}

	getVersion () {return "6.0.4";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Hide Servers in your Serverlist";}

	initConstructor () {
		this.changelog = {
			"added":[["Auto Read","Added an option to automatically mark all hidden servers as read. This will automatically clear all new notifications of all hidden servers"]]
		};
		
		this.labels = {};

		this.patchModules = {
			"Guild":"componentDidMount"
		};

		this.serverHiderModalMarkup =
			`<span class="${this.name}-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
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
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} entries"></div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-ok ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">REPLACE_btn_ok_text</div>
								</button>
								<button type="button" class="btn-all ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlooklink + BDFDB.disCNS.buttoncolortransparent + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">REPLACE_btn_all_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.serverEntryMarkup =
			`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} entry" style="flex: 1 1 auto;">
				<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCNS.flexchild + BDFDB.disCNS.overflowellipsis} serverhiderName" style="flex: 1 1 auto;"></h3>
				<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
					<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} serverhiderCheckbox">
				</div>
			</div>`;

		this.serverContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} serverhider-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_serverhider_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.serverContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} serverhider-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} hideserver-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_hideserver_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} openhidemenu-item">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_openhidemenu_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
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
		let settings = BDFDB.getAllData(this, "settings"); 
		let settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Servers.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".reset-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to reset all servers?", () => {
				BDFDB.removeAllData(this, "servers");
				BDFDB.readServerList().forEach(info => {if (!info.div.getAttribute("folder")) BDFDB.toggleEles(info.div, false);});
			});
		});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.readServerList().forEach(info => {
				if (info.div.ServerHiderChangeObserver && typeof info.div.ServerHiderChangeObserver.disconnect == "function") info.div.ServerHiderChangeObserver.disconnect();
				if (!info.div.getAttribute("folder")) BDFDB.toggleEles(info.div, true);
				delete info.div.ServerHiderChanged;
			});

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_context_serverhider_text", this.labels.context_serverhider_text);

		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_hideserver_text", this.labels.submenu_hideserver_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_openhidemenu_text", this.labels.submenu_openhidemenu_text);

		this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_btn_ok_text", this.labels.btn_ok_text);
		this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_btn_all_text", this.labels.btn_all_text);

		this.serverEntryMarkup = 			this.serverEntryMarkup.replace("REPLACE_btn_visible_text", this.labels.btn_visible_text);
	}

	onGuildContextMenu (instance, menu) {
		if (document.querySelector(".DevilBro-modal")) return;
		if (instance.props && instance.props.target && instance.props.type.indexOf("GUILD_ICON_") == 0 && !menu.querySelector(".serverhider-item")) {
			let serverContextEntry = BDFDB.htmlToElement(this.serverContextEntryMarkup);
			let devgroup = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,name:["DeveloperModeGroup","MessageDeveloperModeGroup"]}));
			if (devgroup) devgroup.parentElement.insertBefore(serverContextEntry, devgroup);
			else menu.appendChild(serverContextEntry, menu);
			let hideritem = serverContextEntry.querySelector(".serverhider-item");
			hideritem.addEventListener("mouseenter", () => {
				let serverContextSubMenu = BDFDB.htmlToElement(this.serverContextSubMenuMarkup);
				let openitem = serverContextSubMenu.querySelector(".openhidemenu-item");
				openitem.addEventListener("click", () => {
					BDFDB.closeContextMenu(menu);
					this.showServerModal();
				});
				if (instance.props.guild && !instance.props.target.getAttribute("folder")) {
					let hideitem = serverContextSubMenu.querySelector(".hideserver-item");
					BDFDB.removeClass(hideitem, BDFDB.disCN.contextmenuitemdisabled);
					hideitem.addEventListener("click", () => {
						BDFDB.closeContextMenu(menu);
						this.toggleServer(instance.props.guild, instance.props.target, false);
					});
				}
				BDFDB.appendSubMenu(hideritem, serverContextSubMenu);
			});
		}
	}

	processGuild (instance, wrapper) {
		if (instance.currentType = "GUILD" && instance.props && instance.props.guild) {
			let hiddenservers = BDFDB.loadData("hiddenservers", this, "hiddenservers") || [];
			this.toggleServer(instance.props.guild, wrapper, !hiddenservers.includes(instance.props.guild.id));
		}
	}

	showServerModal () {
		let serverHiderModal = BDFDB.htmlToElement(this.serverHiderModalMarkup);
		let container = serverHiderModal.querySelector(".entries");
		if (!container) return;

		BDFDB.addChildEventListener(serverHiderModal, "click", ".btn-all", () => {
			let firstcheckbox = serverHiderModal.querySelector(".serverhiderCheckbox");
			firstcheckbox.click();
			serverHiderModal.querySelectorAll(".serverhiderCheckbox").forEach(checkbox => {
				if (checkbox != firstcheckbox && checkbox.checked != firstcheckbox.checked) checkbox.click();
			});
		});

		for (let info of BDFDB.readServerList()) {
			if (!info.div.getAttribute("folder")) {
				if (container.firstElementChild) container.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.modaldivider}"></div>`));
				let entry = BDFDB.htmlToElement(this.serverEntryMarkup);
				container.appendChild(entry);
				let name = entry.querySelector(".serverhiderName");
				name.innerText = info.name || "";
				name.parentElement.insertBefore(this.createCopyOfServer(info), name);
				let hidecheckbox = entry.querySelector(".serverhiderCheckbox");
				hidecheckbox.checked = !BDFDB.isEleHidden(info.div);
				hidecheckbox.addEventListener("click", e => {
					this.toggleServer(info, info.div, e.currentTarget.checked);
				});
			}
		}
		BDFDB.appendModal(serverHiderModal);
	}

	createCopyOfServer (info) {
		let serverCopy = info.div.cloneNode(true);
		BDFDB.toggleEles(serverCopy, true);
		BDFDB.removeClass(serverCopy, BDFDB.disCN.guildunread, BDFDB.disCN.guildselected);
		serverCopy.addEventListener("click", e => {
			BDFDB.stopEvent(e);
			info.div.querySelector("a").click();
		});
		serverCopy.addEventListener("contextmenu", e => {BDFDB.openGuildContextMenu(info.div, e);});
		return serverCopy;
	}

	toggleServer (info, target, visible) {
		if (!info || !target) return;
		let guilddiv = BDFDB.getParentEle(BDFDB.dotCN.guild, target);
		if (!guilddiv || guilddiv.getAttribute("folder")) return;
		BDFDB.toggleEles(guilddiv, visible);
		let hiddenservers = BDFDB.loadData("hiddenservers", this, "hiddenservers") || [];
		BDFDB.removeFromArray(hiddenservers, info.id);
		if (guilddiv.ServerHiderChangeObserver && typeof guilddiv.ServerHiderChangeObserver.disconnect == "function") guilddiv.ServerHiderChangeObserver.disconnect();
		if (!visible) {
			guilddiv.ServerHiderChangeObserver = new MutationObserver(changes => {changes.forEach(change => {
				if (!change.type == "attributes" && change.attributeName == "draggable") return;
				let clearnotifications = false;
				if (change.type == "attributes" && change.attributeName == "class" && BDFDB.containsClass(change.target, BDFDB.disCN.guild)) clearnotifications = true;
				if (change.type == "characterData" && change.target.parentElement && BDFDB.containsClass(change.target.parentElement, BDFDB.disCN.badge)) clearnotifications = true;
				else if (change.addedNodes.length) change.addedNodes.forEach(node => {if (node.tagName && BDFDB.containsClass(node, BDFDB.disCN.badge)) clearnotifications = true;});
				if (clearnotifications) this.unreadServer(guilddiv, info.id);
			});});
			guilddiv.ServerHiderChangeObserver.observe(guilddiv, {attributes:true, childList:true, characterData: true, subtree:true});
			if (BDFDB.containsClass(guilddiv, BDFDB.disCN.guildunread) || guilddiv.querySelector(BDFDB.dotCN.badge)) this.unreadServer(guilddiv, info.id);
			hiddenservers.push(info.id);
		}
		BDFDB.saveData("hiddenservers", hiddenservers, this, "hiddenservers");
	}
	
	unreadServer (guilddiv, id) {
		if (BDFDB.getData("clearNotifications", this, "settings") && !guilddiv.ServerHiderChanged) {
			guilddiv.ServerHiderChanged = true;
			BDFDB.markGuildAsRead(id);
			setTimeout(() => {delete guilddiv.ServerHiderChanged;},1000);
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					modal_header_text:				"Upravljanje popisom poslužitelja",
					btn_ok_text:					"OK",
					btn_all_text:					"Sve",
					context_serverhider_text:		"Vidljivost poslužitelj",
					submenu_hideserver_text:		"Sakrij poslužitelj",
					submenu_openhidemenu_text:		"Upravljanje popisom poslužitelja"
				};
			case "da":		//danish
				return {
					modal_header_text:				"Styring af Serverliste",
					btn_ok_text:					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Server synlighed",
					submenu_hideserver_text:		"Skjul Server",
					submenu_openhidemenu_text:		"Styre Serverliste"
				};
			case "de":		//german
				return {
					modal_header_text:				"Verwaltung der Serverliste",
					btn_ok_text:					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Serversichtbarkeit",
					submenu_hideserver_text:		"Server verstecken",
					submenu_openhidemenu_text:		"Serverliste verwalten"
				};
			case "es":		//spanish
				return {
					modal_header_text:				"Administración de lista de servidores",
					btn_ok_text:					"OK",
					btn_all_text:					"Todo",
					context_serverhider_text:		"Visibilidad del servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Administrar lista de servidores"
				};
			case "fr":		//french
				return {
					modal_header_text:				"Gestion de la liste des serveurs",
					btn_ok_text:					"OK",
					btn_all_text:					"Tout",
					context_serverhider_text:		"Visibilité du serveur",
					submenu_hideserver_text:		"Cacher le serveur",
					submenu_openhidemenu_text:		"Gérer la liste des serveurs"
				};
			case "it":		//italian
				return {
					modal_header_text:				"Gestione dell'elenco dei server",
					btn_ok_text:					"OK",
					btn_all_text:					"Tutto",
					context_serverhider_text:		"Visibilità del server",
					submenu_hideserver_text:		"Nascondi il server",
					submenu_openhidemenu_text:		"Gestione elenco dei server"
				};
			case "nl":		//dutch
				return {
					modal_header_text:				"Beheer van de Serverlijst",
					btn_ok_text:					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Server zichtbaarheid",
					submenu_hideserver_text:		"Verberg server",
					submenu_openhidemenu_text:		"Beheer serverlijst"
				};
			case "no":		//norwegian
				return {
					modal_header_text:				"Administrasjon av serverlisten",
					btn_ok_text:					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Server synlighet",
					submenu_hideserver_text:		"Skjul server",
					submenu_openhidemenu_text:		"Administrer serverliste"
				};
			case "pl":		//polish
				return {
					modal_header_text:				"Zarządzanie listą serwerów",
					btn_ok_text:					"OK",
					btn_all_text:					"Wszystkie",
					context_serverhider_text:		"Widoczność serwera",
					submenu_hideserver_text:		"Ukryj serwer",
					submenu_openhidemenu_text:		"Zarządzaj listą serwerów"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					modal_header_text:				"Gerenciamento da lista de servidores",
					btn_ok_text:					"OK",
					btn_all_text:					"Todo",
					context_serverhider_text:		"Visibilidade do servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Gerenciar lista de servidores"
				};
			case "fi":		//finnish
				return {
					modal_header_text:				"Palvelinluettelon hallinta",
					btn_ok_text:					"OK",
					btn_all_text:					"Kaikki",
					context_serverhider_text:		"Palvelimen näkyvyys",
					submenu_hideserver_text:		"Piilota palvelin",
					submenu_openhidemenu_text:		"Hallinnoi palvelinluetteloa"
				};
			case "sv":		//swedish
				return {
					modal_header_text:				"Hantering av serverlistan",
					btn_ok_text:					"OK",
					btn_all_text:					"All",
					context_serverhider_text:		"Server sikt",
					submenu_hideserver_text:		"Dölj server",
					submenu_openhidemenu_text:		"Hantera serverlistan"
				};
			case "tr":		//turkish
				return {
					modal_header_text:				"Sunucu Listesinin Yönetimi",
					btn_ok_text:					"Okey",
					btn_all_text:					"Her",
					context_serverhider_text:		"Sunucu görünürlüğü",
					submenu_hideserver_text:		"Sunucuyu Gizle",
					submenu_openhidemenu_text:		"Sunucu Listesini Yönet"
				};
			case "cs":		//czech
				return {
					modal_header_text:				"Správa seznamu serverů",
					btn_ok_text:					"OK",
					btn_all_text:					"Vše",
					context_serverhider_text:		"Viditelnost serveru",
					submenu_hideserver_text:		"Skrýt server",
					submenu_openhidemenu_text:		"Správa seznamu serverů"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text:				"Управление на списъка със сървъри",
					btn_ok_text:					"Добре",
					btn_all_text:					"Bсичко",
					context_serverhider_text:		"Видимост на сървъра",
					submenu_hideserver_text:		"Скриване на сървър",
					submenu_openhidemenu_text:		"Управление на списъка със сървъри"
				};
			case "ru":		//russian
				return {
					modal_header_text:				"Управление списком серверов",
					btn_ok_text:					"ОК",
					btn_all_text:					"Все",
					context_serverhider_text:		"Видимость сервера",
					submenu_hideserver_text:		"Скрыть сервер",
					submenu_openhidemenu_text:		"Управление списком серверов"
				};
			case "uk":		//ukrainian
				return {
					modal_header_text:				"Управління списком серверів",
					btn_ok_text:					"Добре",
					btn_all_text:					"Все",
					context_serverhider_text:		"Видимість сервера",
					submenu_hideserver_text:		"Сховати сервер",
					submenu_openhidemenu_text:		"Управління списком серверів"
				};
			case "ja":		//japanese
				return {
					modal_header_text:				"サーバリストの管理",
					btn_ok_text:					"はい",
					btn_all_text:					"すべて",
					context_serverhider_text:		"サーバーの可視性",
					submenu_hideserver_text:		"サーバーを隠す",
					submenu_openhidemenu_text:		"サーバーリストを管理する"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					modal_header_text:				"管理服务器列表",
					btn_ok_text:					"好",
					btn_all_text:					"所有",
					context_serverhider_text:		"服務器可見性",
					submenu_hideserver_text:		"隐藏服务器",
					submenu_openhidemenu_text:		"管理服务器列表"
				};
			case "ko":		//korean
				return {
					modal_header_text:				"서버 목록 관리",
					btn_ok_text:					"승인",
					btn_all_text:					"모든",
					context_serverhider_text:		"서버 가시성",
					submenu_hideserver_text:		"서버 숨기기",
					submenu_openhidemenu_text:		"서버 목록 관리"
				};
			default:		//default: english
				return {
					modal_header_text:				"Managing Serverlist",
					btn_ok_text:					"OK",
					btn_all_text:					"All",
					context_serverhider_text:		"Server Visibility",
					submenu_hideserver_text:		"Hide Server",
					submenu_openhidemenu_text:		"Manage Serverlist"
				};
		}
	}
}
