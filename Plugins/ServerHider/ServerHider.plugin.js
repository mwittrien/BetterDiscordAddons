//META{"name":"ServerHider"}*//

class ServerHider {
	constructor () {
		this.labels = {};
		
		this.serverContextObserver = new MutationObserver(() => {});
		this.serverListContextHandler;
		
		this.css = `
			.serverhider-modal .btn-all {
				background-color: transparent;
			}

			.serverhider-modal .serverhiderEntry {
				height: 50px;
				padding-top: 5px;
				padding-bottom: 5px;
			}
			
			.serverhider-modal .serverhiderEntry .serverhiderGuild {
				display: inline-block;
				height: 50px;
				width: 50px;
			}
			
			.serverhider-modal .serverhiderEntry .serverhiderGuild .serverhiderIcon {
				background-color: #484B51;
				background-size: cover;
				border-radius: 25px;
				color: #b9bbbe;
				display: inline-block;
				font-size: 16px;
				font-weight: 600;
				height: 35px;
				letter-spacing: .5px;
				padding-top: 15px;
				text-align: center;
				width: 50px;
			}
			
			.serverhider-modal .serverhiderEntry .serverhiderGuild .serverhiderBadge {
				background-color: #f04747;
				border-radius: 3px;
				box-shadow: 0 1px 0 rgba(0,0,0,.25), inset 0 1px 0 hsla(0,0%,100%,.15);
				color: #fff;
				display: inline-block;
				font-size: 12px;
				font-weight 500;
				line-height: 12px;
				margin-left: 33px;
				margin-top: -33px;
				padding: 2px 6px;
				text-align: center;
				text-shadow: 0 1px 0 rgba(0,0,0,.25);
				vertical-align: middle;
			}
			
			.serverhider-modal .serverhiderEntry .serverhiderName {
				color: #b9bbbe;
				cursor: default;
				display: inline-block;
				flex: 1;
				font-size: 12px;
				font-weight: 600;
				height: 50px;
				letter-spacing: .5px;
				margin-left: 10px;
				margin-top: -38px;
				overflow: hidden;
				text-transform: uppercase;
				vertical-align: middle;
				width: 250px;
			}

			.serverhider-modal .serverhiderEntry .btn-showserver {
				margin: 12px 12px 0 0;
				display: inline-block;
				float: right;
			}`;
		
			
		this.serverHiderModalMarkup =
			`<span class="serverhider-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">REPLACE_modal_header_text</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU"></div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-save buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
									<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">REPLACE_btn_ok_text</div>
								</button>
								<button type="button" class="btn-all buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
									<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">REPLACE_btn_all_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.serverEntryMarkup =
			`<div class="serverhiderEntry">
				<div class="serverhiderGuild">
					<div class="serverhiderIcon"></div>
					<div class="serverhiderBadge"></div>
				</div>
				<label class="serverhiderName"></label>
				<div class="switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU btn-showserver">
					<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm input-showserver">
				</div>
			</div>`;
			
		this.dividerMarkup = `<div class="divider-1G01Z9 dividerDefault-77PXsz"></div>`;

		this.serverContextEntryMarkup =
			`<div class="item-group">
				<div class="item serverhider-item item-subMenu">
					<span>REPLACE_context_serverhider_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.serverContextSubMenuMarkup = 
			`<div class="context-menu serverhider-submenu">
				<div class="item-group">
					<div class="item hideserver-item">
						<span>REPLACE_submenu_hideserver_text</span>
						<div class="hint"></div>
					</div>
					<div class="item openhidemenu-item">
						<span>REPLACE_submenu_openhidemenu_text</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
	}

	getName () {return "ServerHider";}

	getDescription () {return "Hide Servers in your Serverlist";}

	getVersion () {return "2.4.0";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `<button class="` + this.getName() + `ResetBtn" style="height:23px" onclick='` + this.getName() + `.resetAll("` + this.getName() + `")'>Reset all Servers`;
		}
    }

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.serverContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.serverContextObserver.observe(document.querySelector(".app"), {childList: true});
			
			this.serverListContextHandler = (e) => {	
				this.updateAllServers(false);
			};
			
			$(".guilds.scroller").bind('mouseleave', this.serverListContextHandler);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.updateAllServers(true);
			
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.serverContextObserver.disconnect();
			$(".guilds.scroller").unbind('mouseleave', this.serverListContextHandler);
			
			$(BDfunctionsDevilBro.readServerList()).show();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}

	
	// begin of own functions

    static resetAll (pluginName) {
		if (confirm("Are you sure you want to reset all servers?")) {
			BDfunctionsDevilBro.removeAllData(pluginName, "servers");
			$(BDfunctionsDevilBro.readServerList()).show();
		}
    }

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_context_serverhider_text", this.labels.context_serverhider_text);
		
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_hideserver_text", this.labels.submenu_hideserver_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_openhidemenu_text", this.labels.submenu_openhidemenu_text);
		
		this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_btn_ok_text", this.labels.btn_ok_text);
		this.serverHiderModalMarkup = 		this.serverHiderModalMarkup.replace("REPLACE_btn_all_text", this.labels.btn_all_text);
		
		this.serverEntryMarkup = 			this.serverEntryMarkup.replace("REPLACE_btn_visible_text", this.labels.btn_visible_text);
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	onContextMenu (context) {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"guild"});
		if (serverData && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"})) {
			$(context).append(this.serverContextEntryMarkup)
				.on("mouseenter", ".serverhider-item", serverData, this.createContextSubMenu.bind(this))
				.on("mouseleave", ".serverhider-item", serverData, this.deleteContextSubMenu.bind(this));
		}
		else if (BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"handleGuildCreate"})) {
			$(context).append(this.serverContextEntryMarkup)
				.on("mouseenter", ".serverhider-item", {guildCreate:true}, this.createContextSubMenu.bind(this))
				.on("mouseleave", ".serverhider-item", {guildCreate:true}, this.deleteContextSubMenu.bind(this));
		}
	}
	
	createContextSubMenu (e) {
		var theme = BDfunctionsDevilBro.themeIsLightTheme() ? "" : "theme-dark";
		
		var targetDiv = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
		
		var serverContextSubMenu = $(this.serverContextSubMenuMarkup);
		$(targetDiv).append(serverContextSubMenu)
			.off("click", ".hideserver-item")
			.off("click", ".openhidemenu-item")
			.on("click", ".hideserver-item", e.data, this.hideServer.bind(this))
			.on("click", ".openhidemenu-item", this.showServerModal.bind(this));
		$(serverContextSubMenu)
			.addClass(theme)
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
			
		if (e.data.guildCreate) {
			$(serverContextSubMenu)
				.find(".hideserver-item").hide();
		} 
	}
	
	deleteContextSubMenu (e) {
		$(".serverhider-submenu").remove();
	}

	hideServer (e) {	
		$(".context-menu").hide();
		
		var id = e.data.id;
		var serverDiv = BDfunctionsDevilBro.getDivOfServer(id);
		
		$(serverDiv).hide();
		
		BDfunctionsDevilBro.saveData(id, {id, visible:false}, this.getName(), "servers");
	}
	
	showServerModal (e) {
		$(".context-menu").hide();
		
		var servers = BDfunctionsDevilBro.readServerList();
		
		var serverHiderModal = $(this.serverHiderModalMarkup);
		serverHiderModal
			.on("click", "button.btn-all", () => {
				var hideAll = $(servers[0]).is(":visible");
				for (let i = 0; i < servers.length; i++) {
					let data = BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"});
					if (data) BDfunctionsDevilBro.saveData(data.id, {id:data.id, visible:!hideAll}, this.getName(), "servers");
				}
				$(servers).toggle(!hideAll);
				$(".input-showserver").each((_, checkBox) => {if ($(checkBox).prop("checked") == hideAll) checkBox.click();});
			});
		
		for (let i = 0; i < servers.length; i++) {
			let serverDiv = servers[i];
			let data = BDfunctionsDevilBro.getKeyInformation({"node":serverDiv, "key":"guild"});
			let badge = serverDiv.querySelector(".badge");
			if (data) {
				var entry = $(this.serverEntryMarkup);
				if (i > 0) serverHiderModal.find(".inner-tqJwAU").append(this.dividerMarkup);
				serverHiderModal.find(".inner-tqJwAU").append(entry);
				if (data.icon) {
					entry.find(".serverhiderIcon")
						.css("background-image", "url('https://cdn.discordapp.com/icons/" + data.id + "/" + data.icon + ".png')");
				}
				else {
					entry.find(".serverhiderIcon")
						.text(serverDiv.firstChild.innerText);
				}
				if (badge) {
					entry.find(".serverhiderBadge")
						.text(badge.innerText);
				}
				else {
					entry.find(".serverhiderBadge")
						.css("padding", "0px");
				}
				entry.find(".serverhiderName")
					.text(data.name)
					.attr("id", data.id);
				entry.find(".input-showserver")
					.prop("checked", $(serverDiv).is(":visible"))
					.on("click", (event) => {
						var visible = $(event.target).prop("checked");
						$(serverDiv).toggle(visible);
						BDfunctionsDevilBro.saveData(data.id, {id:data.id, visible:visible}, this.getName(), "servers");
					});
			}
		}
		BDfunctionsDevilBro.appendModal(serverHiderModal);
	}
	
	updateAllServers (write) {
		var servers = BDfunctionsDevilBro.readServerList();
		for (var i = 0; i < servers.length; i++) {
			var serverDiv = servers[i];
			var info = BDfunctionsDevilBro.getKeyInformation({"node":serverDiv, "key":"guild"});
			if (info) {
				var id, visible;
				var data = BDfunctionsDevilBro.loadData(info.id, this.getName(), "servers");
				if (data && write) {
					id = data.id;
					visible = data.visible;
				}
				else {
					id = info.id;
					visible = $(serverDiv).is(":visible");
				}
				
				$(serverDiv).toggle(visible);
				
				BDfunctionsDevilBro.saveData(id, {id, visible}, this.getName(), "servers");
			}
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					modal_header_text: 				"Styring af Serverliste",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Server synlighed",
					submenu_hideserver_text:		"Skjul Server",
					submenu_openhidemenu_text:		"Styre Serverliste"
				};
			case "de": 		//german
				return {
					modal_header_text: 				"Verwaltung der Serverliste",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Serversichtbarkeit",
					submenu_hideserver_text:		"Verstecke Server",
					submenu_openhidemenu_text:		"Verwalte Serverliste"
				};
			case "es": 		//spanish
				return {
					modal_header_text: 				"Administración de lista de servidores",
					btn_ok_text: 					"OK",
					btn_all_text:					"Todo",
					context_serverhider_text:		"Visibilidad del servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Administrar lista de servidores"
				};
			case "fr": 		//french
				return {
					modal_header_text: 				"Gestion de la liste des serveurs",
					btn_ok_text: 					"OK",
					btn_all_text:					"Tout",
					context_serverhider_text:		"Visibilité du serveur",
					submenu_hideserver_text:		"Cacher le serveur",
					submenu_openhidemenu_text:		"Gérer la liste des serveurs"
				};
			case "it": 		//italian
				return {
					modal_header_text: 				"Gestione dell'elenco dei server",
					btn_ok_text: 					"OK",
					btn_all_text:					"Tutto",
					context_serverhider_text:		"Visibilità del server",
					submenu_hideserver_text:		"Nascondi il server",
					submenu_openhidemenu_text:		"Gestione elenco dei server"
				};
			case "nl":		//dutch
				return {
					modal_header_text: 				"Beheer van de Serverlijst",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Server zichtbaarheid",
					submenu_hideserver_text:		"Verberg server",
					submenu_openhidemenu_text:		"Beheer serverlijst"
				};
			case "no":		//norwegian
				return {
					modal_header_text: 				"Administrasjon av serverlisten",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					context_serverhider_text:		"Server synlighet",
					submenu_hideserver_text:		"Skjul server",
					submenu_openhidemenu_text:		"Administrer serverliste"
				};
			case "pl":		//polish
				return {
					modal_header_text: 				"Zarządzanie listą serwerów",
					btn_ok_text: 					"OK",
					btn_all_text:					"Każdy",
					context_serverhider_text:		"Widoczność serwera",
					submenu_hideserver_text:		"Ukryj serwer",
					submenu_openhidemenu_text:		"Zarządzaj listą serwerów"
				};
			case "pt":		//portuguese (brazil)
				return {
					modal_header_text: 				"Gerenciamento da lista de servidores",
					btn_ok_text: 					"OK",
					btn_all_text:					"Todo",
					context_serverhider_text:		"Visibilidade do servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Gerenciar lista de servidores"
				};
			case "fi":		//finnish
				return {
					modal_header_text: 				"Palvelinluettelon hallinta",
					btn_ok_text: 					"OK",
					btn_all_text:					"Kaikki",
					context_serverhider_text:		"Palvelimen näkyvyys",
					submenu_hideserver_text:		"Piilota palvelin",
					submenu_openhidemenu_text:		"Hallinnoi palvelinluetteloa"
				};
			case "sv":		//swedish
				return {
					modal_header_text: 				"Hantering av serverlistan",
					btn_ok_text: 					"OK",
					btn_all_text:					"All",
					context_serverhider_text:		"Server sikt",
					submenu_hideserver_text:		"Dölj server",
					submenu_openhidemenu_text:		"Hantera serverlistan"
				};
			case "tr":		//turkish
				return {
					modal_header_text: 				"Sunucu Listesinin Yönetimi",
					btn_ok_text: 					"Okey",
					btn_all_text:					"Her",
					context_serverhider_text:		"Sunucu görünürlüğü",
					submenu_hideserver_text:		"Sunucuyu Gizle",
					submenu_openhidemenu_text:		"Sunucu Listesini Yönet"
				};
			case "cs":		//czech
				return {
					modal_header_text: 				"Správa seznamu serverů",
					btn_ok_text: 					"OK",
					btn_all_text:					"Vše",
					context_serverhider_text:		"Viditelnost serveru",
					submenu_hideserver_text:		"Skrýt server",
					submenu_openhidemenu_text:		"Správa seznamu serverů"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text: 				"Управление на списъка със сървъри",
					btn_ok_text: 					"Добре",
					btn_all_text:					"Bсичко",
					context_serverhider_text:		"Видимост на сървъра",
					submenu_hideserver_text:		"Скриване на сървър",
					submenu_openhidemenu_text:		"Управление на списъка със сървъри"
				};
			case "ru":		//russian
				return {
					modal_header_text: 				"Управление списком серверов",
					btn_ok_text: 					"ОК",
					btn_all_text:					"Все",
					context_serverhider_text:		"Видимость сервера",
					submenu_hideserver_text:		"Скрыть сервер",
					submenu_openhidemenu_text:		"Управление списком серверов"
				};
			case "uk":		//ukranian
				return {
					modal_header_text: 				"Управління списком серверів",
					btn_ok_text: 					"Добре",
					btn_all_text:					"Все",
					context_serverhider_text:		"Видимість сервера",
					submenu_hideserver_text:		"Сховати сервер",
					submenu_openhidemenu_text:		"Управління списком серверів"
				};
			case "ja":		//japanese
				return {
					modal_header_text: 				"サーバリストの管理",
					btn_ok_text: 					"はい",
					btn_all_text:					"すべて",
					context_serverhider_text:		"サーバーの可視性",
					submenu_hideserver_text:		"サーバーを隠す",
					submenu_openhidemenu_text:		"サーバーリストを管理する"
				};
			case "zh":		//chinese (traditional)
				return {
					modal_header_text: 				"管理服务器列表",
					btn_ok_text: 					"好",
					btn_all_text:					"所有",
					context_serverhider_text:		"服務器可見性",
					submenu_hideserver_text:		"隐藏服务器",
					submenu_openhidemenu_text:		"管理服务器列表"
				};
			case "ko":		//korean
				return {
					modal_header_text: 				"서버 목록 관리",
					btn_ok_text: 					"승인",
					btn_all_text:					"모든",
					context_serverhider_text:		"서버 가시성",
					submenu_hideserver_text:		"서버 숨기기",
					submenu_openhidemenu_text:		"서버 목록 관리"
				};
			default:		//default: english
				return {
					modal_header_text: 				"Managing Serverlist",
					btn_ok_text: 					"OK",
					btn_all_text:					"All",
					context_serverhider_text:		"Server Visibility",
					submenu_hideserver_text:		"Hide Server",
					submenu_openhidemenu_text:		"Manage Serverlist"
				};
		}
	}
}
