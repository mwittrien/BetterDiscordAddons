module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		initConstructor () {
			this.labels = {};
			
			this.css = `
				.serverhider-modal .entry ${BDFDB.dotCN.guild} {
					height: 50px;
					position: relative;
					width: 50px;
					z-index: 1;
				}
				.serverhider-modal .entry ${BDFDB.dotCN.guildinner} {
					background: #2f3136;
					border-radius: 25px !important;
					cursor: pointer;
					font-size: 18px;
					line-height: 50px;
					overflow: hidden;
					text-align: center;
				}
				.serverhider-modal .entry ${BDFDB.dotCNS.guild + BDFDB.dotCN.avatarsmallold} {
					background-repeat: no-repeat;
					background-size: 50px 50px;
					border-radius: 0;
					color: #fff;
					display: block;
					float: left;
					margin: 0;
					height: 50px;
					width: 50px;
				}
				.serverhider-modal .entry ${BDFDB.dotCNS.guild + BDFDB.dotCN.badge} {
					background-clip: padding-box;
					background-color: #f04747;
					border-radius: 3px;
					bottom: -2px;
					box-shadow: 0 1px 0 rgba(0,0,0,.25), inset 0 1px 0 hsla(0,0%,100%,.15);
					color: #fff;
					display: inline-block;
					font-size: 12px;
					font-weight: 500;
					line-height: 12px;
					padding: 3px 6px;
					pointer-events: none;
					position: absolute;
					right: -2px;
					text-shadow: 0 1px 0 rgba(0,0,0,.25);
				}
				.serverhider-modal .folderhideCheckboxWrapper {
					right: 8px;
				}`;
			
				
			this.serverHiderModalMarkup =
				`<span class="serverhider-modal DevilBro-modal">
					<div class="${BDFDB.disCN.backdrop}"></div>
					<div class="${BDFDB.disCN.modal}">
						<div class="${BDFDB.disCN.modalinner}">
							<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
									<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
										<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
										<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
									</div>
									<svg class="${BDFDB.disCNS.modalclose + BDFDB.disCN.flexchild}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
										<g fill="none" fill-rule="evenodd">
											<path d="M0 0h12v12H0"></path>
											<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
										</g>
									</svg>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.modalsubinner + BDFDB.disCN.marginbottom8} folderhideSettings" style="flex: 0 0 auto;">
									<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
										<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_folderhide_text</h3>
									</div>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault} folderhideCheckboxWrapper" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} folderhideCheckbox">
									</div>
								</div>
								<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
									<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} entries"></div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
									<button type="button" class="btn-save ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
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
				
			this.dividerMarkup = `<div class="${BDFDB.disCNS.modaldivider + BDFDB.disCN.modaldividerdefault}"></div>`;

			this.serverContextEntryMarkup =
				`<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} serverhider-item ${BDFDB.disCN.contextmenuitemsubmenu}">
						<span>REPLACE_context_serverhider_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>`;
				
			this.serverContextSubMenuMarkup = 
				`<div class="${BDFDB.disCN.contextmenu} serverhider-submenu">
					<div class="${BDFDB.disCN.contextmenuitemgroup}">
						<div class="${BDFDB.disCN.contextmenuitem} hideserver-item ${BDFDB.disCN.contextmenuitemdisabled}">
							<span>REPLACE_submenu_hideserver_text</span>
							<div class="${BDFDB.disCN.contextmenuhint}"></div>
						</div>
						<div class="${BDFDB.disCN.contextmenuitem} openhidemenu-item">
							<span>REPLACE_submenu_openhidemenu_text</span>
							<div class="${BDFDB.disCN.contextmenuhint}"></div>
						</div>
					</div>
				</div>`;
		}

		onStart () {
			var libraryScript = null;
			if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
				libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				document.head.appendChild(libraryScript);
			}
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
			if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
			else libraryScript.addEventListener("load", () => {this.initialize();});
			return true;
		}

		initialize () {
			if (typeof BDFDB === "object") {
				BDFDB.loadMessage(this);
				
				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
										this.onContextMenu(node);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"serverContextObserver",instance:observer}, {childList: true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.classList && node.classList.contains(BDFDB.disCN.guild) && !node.querySelector(BDFDB.dotCN.guildserror)) {
										var info = BDFDB.getKeyInformation({"node":node, "key":"guild"});
										if (info) {
											var data = BDFDB.loadData(info.id, this, "servers");
											if (data) {
												$(node).toggle(data.visible);
											}
										}
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.guilds, {name:"serverListObserver",instance:observer}, {childList: true});
				
				$(BDFDB.dotCN.guilds).on("mouseleave." + this.name, () => {this.updateAllServers(false);});
				
				this.updateAllServers(true);

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop () {
			if (typeof BDFDB === "object") {
				BDFDB.readServerList().forEach(serverObj => {
					if (!serverObj.div.getAttribute("folder")) $(serverObj.div).show();
				});
				
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}

		
		// begin of own functions

		resetAll () {
			if (confirm("Are you sure you want to reset all servers?")) {
				BDFDB.removeAllData(this, "servers");
				BDFDB.readServerList().forEach(serverObj => {
					if (!serverObj.div.getAttribute("folder")) $(serverObj.div).show();
				});
			}
		}

		changeLanguageStrings () {
			this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_context_serverhider_text", this.labels.context_serverhider_text);
			
			this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_hideserver_text", this.labels.submenu_hideserver_text);
			this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_openhidemenu_text", this.labels.submenu_openhidemenu_text);
			
			this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
			this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_modal_folderhide_text", this.labels.modal_folderhide_text);
			this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_btn_ok_text", this.labels.btn_ok_text);
			this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_btn_all_text", this.labels.btn_all_text);
			
			this.serverEntryMarkup = 			this.serverEntryMarkup.replace("REPLACE_btn_visible_text", this.labels.btn_visible_text);
		}
		
		onContextMenu (context) {
			if (document.querySelector(".serverhider-modal") || !context || !context.tagName || !context.parentElement || context.querySelector(".serverhider-item")) return;
			var info = BDFDB.getKeyInformation({"node":context, "key":"guild"});
			var valid = false;
			if (info && BDFDB.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"})) {
				valid = true;
			}
			else if (BDFDB.getKeyInformation({"node":context, "key":"handleGuildCreate"})) {
				info = {guildCreate:true};
				valid = true;
			}
			if (valid) {
				$(context).append(this.serverContextEntryMarkup)
					.on("mouseenter", ".serverhider-item", (e) => {
						this.createContextSubMenu(info, e, context);
					});
					
				BDFDB.updateContextPosition(context);
			}
		}
		
		createContextSubMenu (info, e, context) {
			var serverContextSubMenu = $(this.serverContextSubMenuMarkup);
				
			serverContextSubMenu
				.on("click", ".openhidemenu-item", () => {
					$(context).hide();
					this.showServerModal();
				});
				
			if (!info.guildCreate) {
				serverContextSubMenu
					.find(".hideserver-item")
					.removeClass(BDFDB.disCN.contextmenuitemdisabled)
					.on("click", () => {
						$(context).hide();
						this.hideServer(info);
					});
			}
			
			BDFDB.appendSubMenu(e.currentTarget, serverContextSubMenu);
		}

		hideServer (info) {
			var serverObj = BDFDB.getDivOfServer(info.id);
			
			if (!serverObj) return;
			
			$(serverObj.div).hide();
			
			BDFDB.saveData(info.id, {visible:false}, this, "servers");
		}
		
		showServerModal () {
			var serverObjs = BDFDB.readServerList();
			
			var serverHiderModal = $(this.serverHiderModalMarkup);
			serverHiderModal
				.on("click", ".folderhideCheckbox", (e) => {
					serverHiderModal.find(".hidefolder").toggle(!$(e.target).prop("checked"));
				})
				.on("click", ".btn-all", () => {
					var hideAll = $(serverObjs[0].div).is(":visible");
					for (let serverObj of serverObjs) {
						$(serverObj.div).toggle(!hideAll);
						BDFDB.saveData(serverObj.id, {visible:!hideAll}, this, "servers");
					}
					$(".serverhiderCheckbox").each((_, checkBox) => {if ($(checkBox).prop("checked") == hideAll) checkBox.click();});
				});
				
			if (!BDFDB.isPluginEnabled("ServerFolders")) serverHiderModal.find(".folderhideSettings").hide();
			
			for (let serverObj of serverObjs) {
				
				let badge = serverObj.div.querySelector(BDFDB.dotCN.badge);
				
				let entry = $(this.serverEntryMarkup);
				let divider = $(this.dividerMarkup);
				let isHiddenByFolder = $(serverObj.div).attr("folder") ? true : false;
				entry.toggleClass("hidefolder", isHiddenByFolder);
				divider.toggleClass("hidefolder", isHiddenByFolder);
				serverHiderModal.find(".entries").append(entry).append(divider);
				entry.find(".serverhiderName")
					.before(this.createCopyOfServer(serverObj))
					.text(serverObj.name);
				entry.find(".serverhiderCheckbox")
					.prop("checked", $(serverObj.div).is(":visible"))
					.on("click", (event) => {
						var visible = $(event.target).prop("checked");
						$(serverObj.div).toggle(visible);
						BDFDB.saveData(serverObj.id, {visible:visible}, this, "servers");
					});
			}
			BDFDB.appendModal(serverHiderModal);
		}
		
		createCopyOfServer (serverObj) {
			var serverDiv = serverObj.div;
			var serverCopy = serverDiv.cloneNode(true);
			$(serverCopy)
				.css("display", "")
				.on("click." + this.name, (e) => {
					e.preventDefault();
					serverDiv.querySelector("a").click();
				})
				.on("contextmenu." + this.name, (e) => {
					var handleContextMenu = BDFDB.getKeyInformation({"node":serverDiv.firstElementChild, "key":"handleContextMenu"});
					if (handleContextMenu) {
						var data = {
							preventDefault: a=>a,
							stopPropagation: a=>a,
							pageX: e.pageX,
							pageY: e.pageY,
						};
						
						handleContextMenu(data);
					}
				});
			return serverCopy;
		}
		
		updateAllServers (write) {
			for (let serverObj of BDFDB.readServerList()) {
				var data = BDFDB.loadData(serverObj.id, this, "servers");
				
				var visible = data && write ? data.visible : $(serverObj.div).is(":visible");
				$(serverObj.div).toggle(visible);
				
				BDFDB.saveData(serverObj.id, {visible}, this, "servers");
			}
		}

		getSettingsPanel () {
			var settingshtml = `<div class="DevilBro-settings ${this.name}-settings">`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Servers.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];

			$(settingspanel)
				.on("click", ".reset-button", () => {this.resetAll();});
			return settingspanel;
		}
		
		setLabelsByLanguage () {
			switch (BDFDB.getDiscordLanguage().id) {
				case "hr":		//croatian
					return {
						modal_header_text:				"Upravljanje popisom poslužitelja",
						modal_folderhide_text:			"Nemoj prikazivati poslužitelje skrivene po narudžbi",
						btn_ok_text:					"OK",
						btn_all_text:					"Sve",
						context_serverhider_text:		"Vidljivost poslužitelj",
						submenu_hideserver_text:		"Sakrij poslužitelj",
						submenu_openhidemenu_text:		"Upravljanje popisom poslužitelja"
					};
				case "da":		//danish
					return {
						modal_header_text:				"Styring af Serverliste",
						modal_folderhide_text:			"Vis ingen servere, som er gemt af mapper",
						btn_ok_text:					"OK",
						btn_all_text:					"Alle",
						context_serverhider_text:		"Server synlighed",
						submenu_hideserver_text:		"Skjul Server",
						submenu_openhidemenu_text:		"Styre Serverliste"
					};
				case "de":		//german
					return {
						modal_header_text:				"Verwaltung der Serverliste",
						modal_folderhide_text:			"Zeige keine Server, die durch Order versteckt wurden",
						btn_ok_text:					"OK",
						btn_all_text:					"Alle",
						context_serverhider_text:		"Serversichtbarkeit",
						submenu_hideserver_text:		"Server verstecken",
						submenu_openhidemenu_text:		"Serverliste verwalten"
					};
				case "es":		//spanish
					return {
						modal_header_text:				"Administración de lista de servidores",
						modal_folderhide_text:			"No mostrar servidores, que están ocultos por las carpetas",
						btn_ok_text:					"OK",
						btn_all_text:					"Todo",
						context_serverhider_text:		"Visibilidad del servidor",
						submenu_hideserver_text:		"Ocultar servidor",
						submenu_openhidemenu_text:		"Administrar lista de servidores"
					};
				case "fr":		//french
					return {
						modal_header_text:				"Gestion de la liste des serveurs",
						modal_folderhide_text:			"Afficher aucun serveur, qui sont cachés par des dossiers",
						btn_ok_text:					"OK",
						btn_all_text:					"Tout",
						context_serverhider_text:		"Visibilité du serveur",
						submenu_hideserver_text:		"Cacher le serveur",
						submenu_openhidemenu_text:		"Gérer la liste des serveurs"
					};
				case "it":		//italian
					return {
						modal_header_text:				"Gestione dell'elenco dei server",
						modal_folderhide_text:			"Mostra nessun server nascosto nelle cartelle",
						btn_ok_text:					"OK",
						btn_all_text:					"Tutto",
						context_serverhider_text:		"Visibilità del server",
						submenu_hideserver_text:		"Nascondi il server",
						submenu_openhidemenu_text:		"Gestione elenco dei server"
					};
				case "nl":		//dutch
					return {
						modal_header_text:				"Beheer van de Serverlijst",
						modal_folderhide_text:			"Toon geen servers, die zijn verborgen door mappen",
						btn_ok_text:					"OK",
						btn_all_text:					"Alle",
						context_serverhider_text:		"Server zichtbaarheid",
						submenu_hideserver_text:		"Verberg server",
						submenu_openhidemenu_text:		"Beheer serverlijst"
					};
				case "no":		//norwegian
					return {
						modal_header_text:				"Administrasjon av serverlisten",
						modal_folderhide_text:			"Vis ingen servere, som er skjult av mapper",
						btn_ok_text:					"OK",
						btn_all_text:					"Alle",
						context_serverhider_text:		"Server synlighet",
						submenu_hideserver_text:		"Skjul server",
						submenu_openhidemenu_text:		"Administrer serverliste"
					};
				case "pl":		//polish
					return {
						modal_header_text:				"Zarządzanie listą serwerów",
						modal_folderhide_text:			"Nie pokazuj żadnych serwerów, które są ukryte w folderach",
						btn_ok_text:					"OK",
						btn_all_text:					"Wszystkie",
						context_serverhider_text:		"Widoczność serwera",
						submenu_hideserver_text:		"Ukryj serwer",
						submenu_openhidemenu_text:		"Zarządzaj listą serwerów"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						modal_header_text:				"Gerenciamento da lista de servidores",
						modal_folderhide_text:			"Não exiba servidores, que estão ocultos por pastas",
						btn_ok_text:					"OK",
						btn_all_text:					"Todo",
						context_serverhider_text:		"Visibilidade do servidor",
						submenu_hideserver_text:		"Ocultar servidor",
						submenu_openhidemenu_text:		"Gerenciar lista de servidores"
					};
				case "fi":		//finnish
					return {
						modal_header_text:				"Palvelinluettelon hallinta",
						modal_folderhide_text:			"Näytä mitään palvelimia, jotka ovat kansioiden piilossa",
						btn_ok_text:					"OK",
						btn_all_text:					"Kaikki",
						context_serverhider_text:		"Palvelimen näkyvyys",
						submenu_hideserver_text:		"Piilota palvelin",
						submenu_openhidemenu_text:		"Hallinnoi palvelinluetteloa"
					};
				case "sv":		//swedish
					return {
						modal_header_text:				"Hantering av serverlistan",
						modal_folderhide_text:			"Visa inga servrar, vilka är dolda av mappar",
						btn_ok_text:					"OK",
						btn_all_text:					"All",
						context_serverhider_text:		"Server sikt",
						submenu_hideserver_text:		"Dölj server",
						submenu_openhidemenu_text:		"Hantera serverlistan"
					};
				case "tr":		//turkish
					return {
						modal_header_text:				"Sunucu Listesinin Yönetimi",
						modal_folderhide_text:			"Klasörler tarafından gizlenen hiçbir sunucu gösterme",
						btn_ok_text:					"Okey",
						btn_all_text:					"Her",
						context_serverhider_text:		"Sunucu görünürlüğü",
						submenu_hideserver_text:		"Sunucuyu Gizle",
						submenu_openhidemenu_text:		"Sunucu Listesini Yönet"
					};
				case "cs":		//czech
					return {
						modal_header_text:				"Správa seznamu serverů",
						modal_folderhide_text:			"Zobrazit žádné servery, které jsou skryty podle složek",
						btn_ok_text:					"OK",
						btn_all_text:					"Vše",
						context_serverhider_text:		"Viditelnost serveru",
						submenu_hideserver_text:		"Skrýt server",
						submenu_openhidemenu_text:		"Správa seznamu serverů"
					};
				case "bg":		//bulgarian
					return {
						modal_header_text:				"Управление на списъка със сървъри",
						modal_folderhide_text:			"Показване на сървъри, които са скрити от папки",
						btn_ok_text:					"Добре",
						btn_all_text:					"Bсичко",
						context_serverhider_text:		"Видимост на сървъра",
						submenu_hideserver_text:		"Скриване на сървър",
						submenu_openhidemenu_text:		"Управление на списъка със сървъри"
					};
				case "ru":		//russian
					return {
						modal_header_text:				"Управление списком серверов",
						modal_folderhide_text:			"Показывать никакие серверы, скрытые папками",
						btn_ok_text:					"ОК",
						btn_all_text:					"Все",
						context_serverhider_text:		"Видимость сервера",
						submenu_hideserver_text:		"Скрыть сервер",
						submenu_openhidemenu_text:		"Управление списком серверов"
					};
				case "uk":		//ukrainian
					return {
						modal_header_text:				"Управління списком серверів",
						modal_folderhide_text:			"Не показувати жодних серверів, які приховуються папками",
						btn_ok_text:					"Добре",
						btn_all_text:					"Все",
						context_serverhider_text:		"Видимість сервера",
						submenu_hideserver_text:		"Сховати сервер",
						submenu_openhidemenu_text:		"Управління списком серверів"
					};
				case "ja":		//japanese
					return {
						modal_header_text:				"サーバリストの管理",
						modal_folderhide_text:			"フォルダに隠されているサーバーは表示しない",
						btn_ok_text:					"はい",
						btn_all_text:					"すべて",
						context_serverhider_text:		"サーバーの可視性",
						submenu_hideserver_text:		"サーバーを隠す",
						submenu_openhidemenu_text:		"サーバーリストを管理する"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						modal_header_text:				"管理服务器列表",
						modal_folderhide_text:			"不顯示被文件夾隱藏的服務器",
						btn_ok_text:					"好",
						btn_all_text:					"所有",
						context_serverhider_text:		"服務器可見性",
						submenu_hideserver_text:		"隐藏服务器",
						submenu_openhidemenu_text:		"管理服务器列表"
					};
				case "ko":		//korean
					return {
						modal_header_text:				"서버 목록 관리",
						modal_folderhide_text:			"폴더별로 숨겨진 서버 표시 안 함",
						btn_ok_text:					"승인",
						btn_all_text:					"모든",
						context_serverhider_text:		"서버 가시성",
						submenu_hideserver_text:		"서버 숨기기",
						submenu_openhidemenu_text:		"서버 목록 관리"
					};
				default:		//default: english
					return {
						modal_header_text:				"Managing Serverlist",
						modal_folderhide_text:			"Show no servers, which are hidden by folders",
						btn_ok_text:					"OK",
						btn_all_text:					"All",
						context_serverhider_text:		"Server Visibility",
						submenu_hideserver_text:		"Hide Server",
						submenu_openhidemenu_text:		"Manage Serverlist"
					};
			}
		}
	}
};
