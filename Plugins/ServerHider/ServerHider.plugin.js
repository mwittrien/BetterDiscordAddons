//META{"name":"ServerHider"}*//

class ServerHider {
	constructor () {
		this.labels = {};
		
		this.serverContextObserver = new MutationObserver(() => {});
		this.serverListContextHandler;
		
		this.css = `
			#serverhider-scrolldiv::-webkit-scrollbar {
				width: 12px;
			}

			#serverhider-scrolldiv::-webkit-scrollbar-thumb {
				background-color: #1e2124;
				border-radius: 7px;
			}

			#serverhider-scrolldiv::-webkit-scrollbar-track-piece {
				background-color: #2f3136;
				border-radius: 7px;
			}
			
			.serverhider-modal .modal {
				align-content: space-around;
				align-items: center;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-height: initial;
				max-height: initial;
				opacity: 0;
				pointer-events: none;
				user-select: none;
				height: 100%;
				width: 100%;
				margin: 0;
				padding: 0;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				z-index: 1000;
			}
			
			.serverhider-modal .form {
				width: 100%;
			}

			.serverhider-modal .form-header, .serverhider-modal .form-actions {
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				padding: 20px;
				
			}

			.serverhider-modal .form-header {
				color: #f6f6f7;
				cursor: default;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .3px;
				line-height: 20px;
				text-transform: uppercase;
			}

			.serverhider-modal .form-actions {
				display: flex;
				flex-direction: row-reverse;
				flex-wrap: nowrap;
				flex: 0 0 auto;
				padding-right: 32px;
			}

			.serverhider-modal .form-inner{
				margin: 10px 0;
				max-height: 360px;
				overflow-x: hidden;
				overflow-y: scroll;
				padding: 0 20px;
				
			}

			.serverhider-modal .modal-inner {
				background-color: #36393E;
				border-radius: 5px;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
				display: flex;
				min-height: 200px;
				pointer-events: auto;
				width: 470px;
			}

			.serverhider-modal .btn {
				align-items: center;
				background: none;
				border-radius: 3px;
				border: none;
				box-sizing: border-box;
				display: flex;
				font-size: 14px;
				font-weight: 500;
				justify-content: center;
				line-height: 16px;
				min-height: 38px;
				min-width: 96px;
				padding: 2px 16px;
				position: relative;
			}

			.serverhider-modal .btn-ok {
				background-color: #3A71C1;
				color: #fff;
			}

			.serverhider-modal .btn-all {
				background-color: #1E2124;
				color: #fff;
			}

			.serverhider-modal .server-entry {
				border-bottom: 1px solid #2F3237;
				border-top: 1px solid #2F3237;
				height: 50px;
				padding-top: 5px;
				padding-bottom: 5px;
			}
			
			.serverhider-modal .server-entry .modal-server-guild {
				display: inline-block;
				height: 50px;
				width: 50px;
			}
			
			.serverhider-modal .server-entry .modal-server-guild .modal-server-icon {
				background-color: #484B51;
				background-size: cover;
				border-radius: 25px;
				color: #b9bbbe;
				display: inline-block;
				font-size: 16px;
				font-weight: 600;
				height: inherit;
				letter-spacing: .5px;
				line-height: 50px;
				text-align: center;
				width: inherit;
			}
			
			.serverhider-modal .server-entry .modal-server-guild .modal-server-badge {
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
			
			.serverhider-modal .server-entry label {
				color: #b9bbbe;
				cursor: default;
				display: inline-block;
				flex: 1;
				font-size: 12px;
				font-weight: 600;
				height: 50px;
				letter-spacing: .5px;
				line-height: 50px;
				margin-left: 10px;
				margin-top: -77px;
				overflow: hidden;
				text-transform: uppercase;
				vertical-align: middle;
				width: 250px;
			}

			.serverhider-modal .server-entry .btn {
				color: #fff;
				display: inline-block;
				float: right;
				margin-top: 5px;
				vertical-align: middle;
			}

			.serverhider-modal .server-entry .btn-hide {
				background-color: #202225;
			}

			.serverhider-modal .server-entry .btn-show {
				background-color: #3A71C1;
			}`;
		
		this.serverHiderModalMarkup =
			`<span class="serverhider-modal">
				<div class="backdrop-2ohBEd callout-backdrop" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<form class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-inner" id="serverhider-scrolldiv">
							</div>
							<div class="form-actions">
								<button type="button" class="btn btn-ok">REPLACE_btn_ok_text</button>
								<button type="button" class="btn btn-all">REPLACE_btn_all_text</button>
							</div>
						</form>
					</div>
				</div>
			</span>`;

		this.serverEntryMarkup =
			`<div class="server-entry">
				<div class="modal-server-guild">
					<div class="modal-server-icon"></div>
					<div class="modal-server-badge"></div>
				</div>
				<label class="modal-servername-label" for="modal-text">modal-servername-label</label>
				<button type="button" class="btn btn-show">REPLACE_btn_visible_text</button>
			</div>`;

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

	getVersion () {return "2.2.8";}

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
			
			BDfunctionsDevilBro.showHideAllEles(true, BDfunctionsDevilBro.readServerList());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}

	
	// begin of own functions

    static resetAll (pluginName) {
		if (confirm("Are you sure you want to reset all servers?")) {
			BDfunctionsDevilBro.removeAllData(pluginName, "servers");
			BDfunctionsDevilBro.showHideAllEles(true, BDfunctionsDevilBro.readServerList());
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
		var contextType = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"});
		var guildCreate = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"handleGuildCreate"});
		var data = Object.assign({},serverData,{guildCreate});
		if (serverData && contextType) {
			$(context).append(this.serverContextEntryMarkup)
				.on("mouseenter", ".serverhider-item", data, this.createContextSubMenu.bind(this))
				.on("mouseleave", ".serverhider-item", data, this.deleteContextSubMenu.bind(this));
		}
		else if (guildCreate) {
			$(context).append(this.serverContextEntryMarkup)
				.on("mouseenter", ".serverhider-item", data, this.createContextSubMenu.bind(this))
				.on("mouseleave", ".serverhider-item", data, this.deleteContextSubMenu.bind(this));
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
		var name = e.data.name;
		var visible = false;
		
		var serverDiv = BDfunctionsDevilBro.getDivOfServer(e.data.id);
		
		BDfunctionsDevilBro.showHideEle(false, serverDiv);
		
		BDfunctionsDevilBro.saveData(id, {id,name,visible}, this.getName(), "servers");
	}
	
	showServerModal (e) {
		$(".context-menu").hide();
		
		var serverHiderModal = $(this.serverHiderModalMarkup);
		serverHiderModal.appendTo($("body > div > [class*='platform-'] > div").last())
			.on("click", ".callout-backdrop,button.btn-ok", () => {
				serverHiderModal.remove();
			})
			.on("click", "button.btn-all", () => {
				this.changeAllButtonAndServer();
			});
		
		var servers = BDfunctionsDevilBro.readServerList();
		
		for (var i = 0; i < servers.length; i++) {
			let data = BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"});
			var badge = $(servers[i]).find(".badge")[0];
			if (data) {
				var entry = $(this.serverEntryMarkup);
				if (data.icon) {
					entry.find(".modal-server-icon").css("background-image", "url('https://cdn.discordapp.com/icons/" + data.id + "/" + data.icon + ".png')");
				}
				else {
					entry.find(".modal-server-icon").text(servers[i].firstChild.innerText);
				}
				if (badge) {
					entry.find(".modal-server-badge").text(badge.innerText);
				}
				else {
					entry.find(".modal-server-badge").css("padding", "0px");
				}
				entry
					.appendTo(".form-inner")
					.on("click", ".btn-hide, .btn-show", (event) => {
						var serverDiv = BDfunctionsDevilBro.getDivOfServer(data.id);
						this.changeButtonAndServer(event.target, serverDiv);
					})
					.find(".modal-servername-label")
						.text(data.name)
						.attr("id", data.id);
					
				var visible = $(servers[i]).is(":visible");
				
				this.updateButton(visible, entry.find("button"));
			}
		}
	}
	
	changeButtonAndServer (btn, server) {
		var data = BDfunctionsDevilBro.getKeyInformation({"node":server, "key":"guild"});
		if (data) {
			var id = data.id;
			var name = data.name;
			var visible = !$(server).is(":visible");
			
			this.updateButton(visible, btn);
			BDfunctionsDevilBro.showHideEle(visible, server);
			
			BDfunctionsDevilBro.saveData(id, {id,name,visible}, this.getName(), "servers");
		}
	}
	
	changeAllButtonAndServer () {
		var servers = BDfunctionsDevilBro.readServerList();
		if (servers.length > 1) {
			var visible = !$(servers[0]).is(":visible");
			for (var i = 0; i < servers.length; i++) {
				let data = BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"});
				if (data) {
					var id = data.id;
					var name = data.name;
					
					BDfunctionsDevilBro.saveData(id, {id,name,visible}, this.getName(), "servers");
				}
			}
			this.updateAllButtons(visible);
			BDfunctionsDevilBro.showHideAllEles(visible, servers);
		}
	}
	
	updateButton (visible, btn) {
		if (visible) {
			$(btn)
				.text(this.labels.btn_visible_text)
				.removeClass("btn-hide")
				.addClass("btn-show");
		}
		else {
			$(btn)
				.text(this.labels.btn_hidden_text)
				.removeClass("btn-show")
				.addClass("btn-hide");
		}
	}
	
	updateAllButtons (visible) {
		var btns = $(".btn-hide, .btn-show");
		for (var i = 0; i < btns.length; i++) {
			this.updateButton(visible, btns);
		}
	}
	
	updateServer (serverDiv, write) {
		var info = BDfunctionsDevilBro.getKeyInformation({"node":serverDiv, "key":"guild"});
		if (info) {
			var id, name, visible;
			var data = BDfunctionsDevilBro.loadData(info.id, this.getName(), "servers");
			if (data && write) {
				id = data.id;
				name = data.name;
				visible = data.visible;
			}
			else {
				id = info.id;
				name = info.name;
				visible = $(serverDiv).is(":visible");
			}
			
			BDfunctionsDevilBro.showHideEle(visible, serverDiv);
			
			BDfunctionsDevilBro.saveData(id, {id,name,visible}, this.getName(), "servers");
		}
	}
	
	updateAllServers (write) {
		var servers = BDfunctionsDevilBro.readServerList();
		for (var i = 0; i < servers.length; i++) {
			this.updateServer(servers[i], write);
		}
	}
	
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					modal_header_text: 				"Styring af Serverliste",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					btn_visible_text:				"Synlig",
					btn_hidden_text:				"Skjult",
					context_serverhider_text:		"Server synlighed",
					submenu_hideserver_text:		"Skjul Server",
					submenu_openhidemenu_text:		"Styre Serverliste"
				};
			case "de": 		//german
				return {
					modal_header_text: 				"Verwaltung der Serverliste",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					btn_visible_text:				"Sichtbar",
					btn_hidden_text:				"Versteckt",
					context_serverhider_text:		"Server Sichtbarkeit",
					submenu_hideserver_text:		"Verstecke Server",
					submenu_openhidemenu_text:		"Verwalte Serverliste"
				};
			case "es": 		//spanish
				return {
					modal_header_text: 				"Administración de lista de servidores",
					btn_ok_text: 					"OK",
					btn_all_text:					"Todo",
					btn_visible_text:				"Visible",
					btn_hidden_text:				"Oculto",
					context_serverhider_text:		"Visibilidad del servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Administrar lista de servidores"
				};
			case "fr": 		//french
				return {
					modal_header_text: 				"Gestion de la liste des serveurs",
					btn_ok_text: 					"OK",
					btn_all_text:					"Tout",
					btn_visible_text:				"Visible",
					btn_hidden_text:				"Caché",
					context_serverhider_text:		"Visibilité du serveur",
					submenu_hideserver_text:		"Cacher le serveur",
					submenu_openhidemenu_text:		"Gérer la liste des serveurs"
				};
			case "it": 		//italian
				return {
					modal_header_text: 				"Gestione dell'elenco dei server",
					btn_ok_text: 					"OK",
					btn_all_text:					"Tutto",
					btn_visible_text:				"Visible",
					btn_hidden_text:				"Nascosta",
					context_serverhider_text:		"Visibilità del server",
					submenu_hideserver_text:		"Nascondi il server",
					submenu_openhidemenu_text:		"Gestione elenco dei server"
				};
			case "nl":		//dutch
				return {
					modal_header_text: 				"Beheer van de Serverlijst",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					btn_visible_text:				"Zichtbaar",
					btn_hidden_text:				"Verborgen",
					context_serverhider_text:		"",
					submenu_hideserver_text:		"Verberg server",
					submenu_openhidemenu_text:		"Beheer serverlijst"
				};
			case "no":		//norwegian
				return {
					modal_header_text: 				"Administrasjon av serverlisten",
					btn_ok_text: 					"OK",
					btn_all_text:					"Alle",
					btn_visible_text:				"Synlig",
					btn_hidden_text:				"Skjult",
					context_serverhider_text:		"Server zichtbaarheid",
					submenu_hideserver_text:		"Skjul server",
					submenu_openhidemenu_text:		"Administrer serverliste"
				};
			case "pl":		//polish
				return {
					modal_header_text: 				"Zarządzanie listą serwerów",
					btn_ok_text: 					"OK",
					btn_all_text:					"Każdy",
					btn_visible_text:				"Widoczny",
					btn_hidden_text:				"Ukryty",
					context_serverhider_text:		"Widoczność serwera",
					submenu_hideserver_text:		"Ukryj serwer",
					submenu_openhidemenu_text:		"Zarządzaj listą serwerów"
				};
			case "pt":		//portuguese (brazil)
				return {
					modal_header_text: 				"Gerenciamento da lista de servidores",
					btn_ok_text: 					"OK",
					btn_all_text:					"Todo",
					btn_visible_text:				"Visível",
					btn_hidden_text:				"Oculto",
					context_serverhider_text:		"Visibilidade do servidor",
					submenu_hideserver_text:		"Ocultar servidor",
					submenu_openhidemenu_text:		"Gerenciar lista de servidores"
				};
			case "fi":		//finnish
				return {
					modal_header_text: 				"Palvelinluettelon hallinta",
					btn_ok_text: 					"OK",
					btn_all_text:					"Kaikki",
					btn_visible_text:				"Näkyvä",
					btn_hidden_text:				"Kätketty",
					context_serverhider_text:		"Palvelimen näkyvyys",
					submenu_hideserver_text:		"Piilota palvelin",
					submenu_openhidemenu_text:		"Hallinnoi palvelinluetteloa"
				};
			case "sv":		//swedish
				return {
					modal_header_text: 				"Hantering av serverlistan",
					btn_ok_text: 					"OK",
					btn_all_text:					"All",
					btn_visible_text:				"Synlig",
					btn_hidden_text:				"Dold",
					context_serverhider_text:		"Server sikt",
					submenu_hideserver_text:		"Dölj server",
					submenu_openhidemenu_text:		"Hantera serverlistan"
				};
			case "tr":		//turkish
				return {
					modal_header_text: 				"Sunucu Listesinin Yönetimi",
					btn_ok_text: 					"Okey",
					btn_all_text:					"Her",
					btn_visible_text:				"Görünür",
					btn_hidden_text:				"Gizli",
					context_serverhider_text:		"Sunucu görünürlüğü",
					submenu_hideserver_text:		"Sunucuyu Gizle",
					submenu_openhidemenu_text:		"Sunucu Listesini Yönet"
				};
			case "cs":		//czech
				return {
					modal_header_text: 				"Správa seznamu serverů",
					btn_ok_text: 					"OK",
					btn_all_text:					"Vše",
					btn_visible_text:				"Viditelné",
					btn_hidden_text:				"Skrytý",
					context_serverhider_text:		"Viditelnost serveru",
					submenu_hideserver_text:		"Skrýt server",
					submenu_openhidemenu_text:		"Správa seznamu serverů"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text: 				"Управление на списъка със сървъри",
					btn_ok_text: 					"Добре",
					btn_all_text:					"Bсичко",
					btn_visible_text:				"Bидим",
					btn_hidden_text:				"Cкрит",
					context_serverhider_text:		"Видимост на сървъра",
					submenu_hideserver_text:		"Скриване на сървър",
					submenu_openhidemenu_text:		"Управление на списъка със сървъри"
				};
			case "ru":		//russian
				return {
					modal_header_text: 				"Управление списком серверов",
					btn_ok_text: 					"ОК",
					btn_all_text:					"Все",
					btn_visible_text:				"Bидимый",
					btn_hidden_text:				"Cкрытый",
					context_serverhider_text:		"Видимость сервера",
					submenu_hideserver_text:		"Скрыть сервер",
					submenu_openhidemenu_text:		"Управление списком серверов"
				};
			case "uk":		//ukranian
				return {
					modal_header_text: 				"Управління списком серверів",
					btn_ok_text: 					"Добре",
					btn_all_text:					"Все",
					btn_visible_text:				"Видимий",
					btn_hidden_text:				"Cхований",
					context_serverhider_text:		"Видимість сервера",
					submenu_hideserver_text:		"Сховати сервер",
					submenu_openhidemenu_text:		"Управління списком серверів"
				};
			case "ja":		//japanese
				return {
					modal_header_text: 				"サーバリストの管理",
					btn_ok_text: 					"はい",
					btn_all_text:					"すべて",
					btn_visible_text:				"見える",
					btn_hidden_text:				"隠された",
					context_serverhider_text:		"サーバーの可視性",
					submenu_hideserver_text:		"サーバーを隠す",
					submenu_openhidemenu_text:		"サーバーリストを管理する"
				};
			case "zh":		//chinese (traditional)
				return {
					modal_header_text: 				"管理服务器列表",
					btn_ok_text: 					"好",
					btn_all_text:					"所有",
					btn_visible_text:				"可见",
					btn_hidden_text:				"隐",
					context_serverhider_text:		"服務器可見性",
					submenu_hideserver_text:		"隐藏服务器",
					submenu_openhidemenu_text:		"管理服务器列表"
				};
			case "ko":		//korean
				return {
					modal_header_text: 				"서버 목록 관리",
					btn_ok_text: 					"승인",
					btn_all_text:					"모든",
					btn_visible_text:				"명백한",
					btn_hidden_text:				"숨겨진",
					context_serverhider_text:		"서버 가시성",
					submenu_hideserver_text:		"서버 숨기기",
					submenu_openhidemenu_text:		"서버 목록 관리"
				};
			default:		//default: english
				return {
					modal_header_text: 				"Managing Serverlist",
					btn_ok_text: 					"OK",
					btn_all_text:					"All",
					btn_visible_text:				"Visible",
					btn_hidden_text:				"Hidden",
					context_serverhider_text:		"Server Visibiity",
					submenu_hideserver_text:		"Hide Server",
					submenu_openhidemenu_text:		"Manage Serverlist"
				};
		}
	}
}
