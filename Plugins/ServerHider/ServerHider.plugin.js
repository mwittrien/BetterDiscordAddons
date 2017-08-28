//META{"name":"ServerHider"}*//

class ServerHider {
	constructor () {	
		this.labels = {};
		
		this.serverContextObserver;
		
		this.css = `
			<style class='serverhider'>
			
			#scrolldiv::-webkit-scrollbar {
				width: 12px;
			}

			#scrolldiv::-webkit-scrollbar-thumb {
				background-color: #1e2124;
				border-radius: 7px;
			}

			#scrolldiv::-webkit-scrollbar-track-piece {
				background-color: #2f3136;
				border-radius: 7px;
			}
			
			.serverhider-modal .modal {
				display: flex;
				position: absolute;
				user-select: none;
				height: 100%;
				width: 100%;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				align-content: space-around;
				padding-top: 60px;
				padding-bottom: 60px;
				z-index: 1000;
				opacity: 0;
				pointer-events: none;
				box-sizing: border-box;
				min-height: 340px;
				max-height: 660px;
			}
			
			.serverhider-modal .form {
				width: 100%;
			}

			.serverhider-modal .form-header, .serverhider-modal .form-actions {
				padding: 20px;
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				
			}

			.serverhider-modal .form-header {
				color: #f6f6f7;
				text-transform: uppercase;
				letter-spacing: .3px;
				cursor: default;
				font-weight: 600;
				line-height: 20px;
				font-size: 16px;
			}

			.serverhider-modal .form-actions {
				display: flex;
				padding-right: 32px;
				flex-direction: row-reverse;
				flex: 0 0 auto;
				flex-wrap: nowrap;
			}

			.serverhider-modal .form-inner{
				padding: 0 20px;
				margin: 10px 0;
				max-height: 360px;
				overflow-x: hidden;
				overflow-y: scroll;
				
			}

			.serverhider-modal .modal-inner {
				border-radius: 5px;
				display: flex;
				pointer-events: auto;
				width: 470px;
				min-height: 200px;
				background-color: #36393E;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
			}

			.serverhider-modal .btn {
				min-width: 96px;
				min-height: 38px;
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
				background: none;
				border: none;
				border-radius: 3px;
				font-size: 14px;
				font-weight: 500;
				line-height: 16px;
				padding: 2px 16px;
			}

			.serverhider-modal .btn-ok {
				color: #fff;
				background-color: #3A71C1;
			}

			.serverhider-modal .btn-all {
				color: #fff;
				background-color: #1E2124;
			}

			.serverhider-modal .server-entry {
				padding-top: 5px;
				padding-bottom: 5px;
				height: 50px;
				border-top: 1px solid #2F3237;
				border-bottom: 1px solid #2F3237;
			}
			
			.serverhider-modal .server-entry .modal-server-guild {
				height: 50px;
				width: 50px;
				display: inline-block;
			}
			
			.serverhider-modal .server-entry .modal-server-guild .modal-server-guildinner {
				height: inherit;
				width: inherit;
				background-color: #484B51;
				border-radius: 25px;
			}
			
			.serverhider-modal .server-entry .modal-server-guild .modal-server-guildinner .modal-server-icon {
				height: inherit;
				width: inherit;
				border-radius: inherit;
			}
			
			.serverhider-modal .server-entry .modal-server-guild .modal-server-guildinner .modal-server-init {
				color: #b9bbbe;
				letter-spacing: .5px;
				font-size: 16px;
				font-weight: 600;
				height: inherit;
				width: inherit;
				line-height: 50px;
				display: inline-block;
				text-align: center;
			}
			
			.serverhider-modal .server-entry .modal-server-guild .modal-server-badge {
				border-radius: 3px;
				background-color: #f04747;
				box-shadow: 0 1px 0 rgba(0,0,0,.25), inset 0 1px 0 hsla(0,0%,100%,.15);
				color: #fff;
				font-size: 12px;
				font-weight 500;
				line-height: 12px;
				display: inline-block;
				text-shadow: 0 1px 0 rgba(0,0,0,.25);
				padding: 2px 6px;
				margin-top: -30px;
				margin-left: 35px;
				text-align: center;
				vertical-align: middle;
			}
			
			.serverhider-modal .server-entry label {
				color: #b9bbbe;
				letter-spacing: .5px;
				text-transform: uppercase;
				flex: 1;
				cursor: default;
				margin-top: -70px;
				margin-left: 10px;
				font-weight: 600;
				line-height: 16px;
				font-size: 12px;
				width: 250px;
				vertical-align: middle;
				display: inline-block;
				overflow: hidden;
			}

			.serverhider-modal .btn-hide {
				color: #fff;
				background-color: #3A71C1;
				vertical-align: middle;
				display: inline-block;
				float: right;
				margin-top: 5px;
			}

			'</style>
		`;
		
		this.modalMarkup =
			`<span class="serverhider-modal">
				<div class="callout-backdrop serverhider" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<form class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-inner" id="scrolldiv">
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
					<div class="modal-server-guildinner"><img class="modal-server-icon" src=""></div>
					<div class="modal-server-badge"></div>
				</div>
				<label class="modal-servername-label" for="modal-text">modal-servername-label</label>
				<button type="button" class="btn btn-hide">REPLACE_btn_visible_text</button>
			</div>`;

		this.serverEntryMarkupWoIcon =
			`<div class="server-entry">
				<div class="modal-server-guild">
					<div class="modal-server-guildinner"><div class="modal-server-init">modal-server-init</div></div>
					<div class="modal-server-badge"></div>
				</div>
				<label class="modal-servername-label" for="modal-text">modal-servername-label</label>
				<button type="button" class="btn btn-hide">REPLACE_btn_visible_text</button>
			</div>`;

		this.contextMarkup =
			`<div class="item-group serverhider">
				<div class="item hide-item">
					<span>REPLACE_context_hide_text</span>
					<div class="hint"></div>
				</div>
				<div class="item hidemenu-item">
					<span>REPLACE_context_hidemenu_text</span>
					<div class="hint"></div>
				</div>
			</div>`;

		this.contextMarkupWoHide =
			`<div class="item-group serverhider">
				<div class="item hidemenu-item">
					<span>REPLACE_context_hidemenu_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
	}

	getName () {return "ServerHider";}

	getDescription () {return "Hide Servers in your Serverlist";}

	getVersion () {return "1.2.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
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
		this.serverContextObserver.observe($("#app-mount>:first-child")[0], {childList: true});
		
		$('head').append(this.css);
		
		this.labels = this.setLabelsByLanguage();
		this.changeLanguageStrings();
		this.updateAllDivStates();
	}

	stop () {
		this.serverContextObserver.disconnect();
		$('.serverhider').remove();
	}

	
	// begin of own functions

	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
	}

	changeLanguageStrings () {
		this.modalMarkup = 				this.modalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.modalMarkup = 				this.modalMarkup.replace("REPLACE_btn_ok_text", this.labels.btn_ok_text);
		this.modalMarkup = 				this.modalMarkup.replace("REPLACE_btn_all_text", this.labels.btn_all_text);
		
		this.serverEntryMarkup = 		this.serverEntryMarkup.replace("REPLACE_btn_visible_text", this.labels.btn_visible_text);
		
		this.serverEntryMarkupWoIcon = 	this.serverEntryMarkupWoIcon.replace("REPLACE_btn_visible_text", this.labels.btn_visible_text);
		
		this.contextMarkup = 			this.contextMarkup.replace("REPLACE_context_hide_text", this.labels.context_hide_text);
		this.contextMarkup = 			this.contextMarkup.replace("REPLACE_context_hidemenu_text", this.labels.context_hidemenu_text);
		
		this.contextMarkupWoHide = 		this.contextMarkupWoHide.replace("REPLACE_context_hidemenu_text", this.labels.context_hidemenu_text);
	}
	
	onContextMenu (context) {
		var inst = this.getReactInstance(context);
		if (!inst) return;
		var ele = inst._currentElement;
		if (ele.props && ele.props.children) {
			var children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
			for (var i = 0; i < children.length; i++) {
				if (children[i] && children[i].props && children[i].props.guild && children[i].type && children[i].type.displayName == "GuildLeaveGroup") {
					var { id, name } = children[i].props.guild;
					var data = { id, name };
					$(context).append(this.contextMarkup)
					.on("click.serverhider", ".hide-item", data, this.onContextHide.bind(this))
					.on("click.serverhider", ".hidemenu-item", this.onContextHidemenu.bind(this));
					break;
				}
				else if (children[i] && children[i].type && children[i].type.displayName == "GuildCreateJoinGroup") {
					$(context).append(this.contextMarkupWoHide)
					.on("click.serverhider", ".hidemenu-item", this.onContextHidemenu.bind(this));
					break;
				}
			}
		}
	}

	onContextHide (e) {	
		var id = e.data.id;
		var name = e.data.name;
		var isHidden = true;
		this.getDivOfServer(e.data.id).hidden = isHidden;
		
		this.saveSettings(id, {id,name,isHidden});
		$(e.delegateTarget).hide();
	}

	onContextHidemenu (e) {
		$(e.delegateTarget).hide();
		this.showServerModal();
	}
	
	showServerModal () {
		var modal = $(this.modalMarkup);
		modal.appendTo("#app-mount>:first-child")
		.on("click", ".callout-backdrop,button.btn-ok", (e) => {
			modal.remove();
		})
		.on("click", "button.btn-all", (e) => {
			var servers = this.readServerList();
			if (servers.length > 1) {
				var isHidden = servers[0].hidden;
				this.setAllButtonStates(!isHidden);
				this.updateAllDivStates();
			}
		});
		
		var servers = this.readServerList();
		
		for (var i = 0; i < servers.length; i++) {
			var data = this.getServerInformation(servers[i]);
			var badge = this.getNotificationBadge(servers[i]);
			if (data) {
				var entry;
				if (data.icon) {
					entry = $(this.serverEntryMarkup);
					entry.find("img").attr("src", "https://cdn.discordapp.com/icons/" + data.id + "/" + data.icon + ".png");
				}
				else {
					entry = $(this.serverEntryMarkupWoIcon);
					entry.find(".modal-server-init").text(this.getDivOfServer(data.id).firstChild.innerText);
				}
				if (badge) {
					entry.find(".modal-server-badge").text(badge.innerText);
				}
				else {
					entry.find(".modal-server-badge").css("padding", "0px");
				}
				entry.find(".modal-servername-label").text(data.name);
				entry.find(".modal-servername-label").attr("id", data.id);
				entry.appendTo(".form-inner")
				.on("click", "button.btn-hide", (e) => {
					var btn = e.target;
					var id = btn.parentElement.children[1].id;
					this.setButtonState(btn, !this.getDivOfServer(id).hidden);
					this.updateDivState(this.getDivOfServer(id));
				});
			}
		}
		this.updateAllButtonStates();
	}
	
	setButtonState (btn, isHidden) {
		if (!isHidden) {
			btn.innerText = this.labels.btn_visible_text;
			btn.style.backgroundColor = "#3A71C1";
		}
		else {
			btn.innerText = this.labels.btn_hidden_text;
			btn.style.backgroundColor = "#202225";
		}
		
		var id = btn.parentElement.children[1].id;
		var name = btn.parentElement.children[1].innerHTML;
		
		this.saveSettings(id, {id,name,isHidden});
	}
	
	setAllButtonStates (isHidden) {
		var buttons = document.getElementsByClassName("btn-hide");
		for (var i = 0; i < buttons.length; i++) {
			this.setButtonState(buttons[i], isHidden);
		}
	}
	
	updateAllButtonStates () {
		var buttons = document.getElementsByClassName("btn-hide");
		for (var i = 0; i < buttons.length; i++) {
			var id = buttons[i].parentElement.children[1].id;
			this.setButtonState(buttons[i], this.getDivOfServer(id).hidden);
		}
	}
	
	updateDivState (server) {
		var data = this.getServerInformation(server);
		if (data) {
			var id, name, isHidden;
			var settings = this.loadSettings(data.id);
			if (settings) {
				id = settings.id;
				name = settings.name;
				isHidden = settings.isHidden;
			}
			else {
				id = data.id;
				name = data.name;
				isHidden = false;
			}
			server.hidden = isHidden;
			
			this.saveSettings(id, {id,name,isHidden});
		}
	}
	
	updateAllDivStates () {
		var servers = this.readServerList();
		for (var i = 0; i < servers.length; i++) {
			this.updateDivState(servers[i]);
		}
	}
	
	getDivOfServer (id) {
		var servers = this.readServerList();
		var found = false;
		for (var i = 0; i < servers.length; i++) {
			var childNodes = servers[i].getElementsByTagName("*");
			for (var j = 0; j < childNodes.length; j++) {
				if (childNodes[j].href) {
					if (childNodes[j].href.split("/")[4] == id) {
						return servers[i];
						found = true;
					}
				}
				if (found) {
					break;
				}
			}
			if (found) {
				break;
			}
		}
	}
	
	readServerList () {
		var foundServers = [];
		var servers = document.getElementsByClassName("guild");
		for (var i = 0; i < servers.length; i++) {
			var serverInst = this.getReactInstance(servers[i]);
			if (serverInst && serverInst._currentElement && serverInst._currentElement._owner && serverInst._currentElement._owner._instance) {
				var serverObj = serverInst._currentElement._owner._instance;
				if (serverObj && serverObj.props && serverObj.props.guild) {
					foundServers.push(servers[i]);
				}
			}
		}
		return foundServers;
	}
	
	getServerInformation (server) {
		var curEle = this.getReactInstance(server)._currentElement;
		if (curEle) {
			var serverInfo = this.checkForServerInformation(curEle); 
			if (serverInfo.id) {
				var {id, name, icon} = serverInfo;
				return {id, name, icon};
			}
			else {
				return null;
			}
		}
		else {
			return null;
		}
	}
	
	getNotificationBadge (server) {
		if (server.childElementCount > 1) {
			return server.children[1];
		}
		else {
			return null;
		}
	}
	
	checkForServerInformation (ele){
		if (ele && ele.props && ele.props.guild){
			return ele.props.guild;
		}
		else if (ele && ele.props && ele.props.children){
			var children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
			var i;
			var result = null;
			for (i = 0; result == null && i < children.length; i++){
				result = this.checkForServerInformation(children[i]);
			}
			return result;
		}
		else {
			return null;
		}
	}
	
	saveSettings (id, settings) {
		bdPluginStorage.set(this.getName(), id, JSON.stringify(settings));
	}

	loadSettings (id) {
		return JSON.parse(bdPluginStorage.get(this.getName(), id));
	}
	
	setLabelsByLanguage () {
		switch (document.getElementsByTagName("html")[0].lang.split("-")[0]) {
			case "da": 		//danish
				return {
					modal_header_text: 		"Styring af Serverliste",
					btn_ok_text: 			"OK",
					btn_all_text:			"Alle",
					btn_visible_text:		"Synlig",
					btn_hidden_text:		"Skjult",
					context_hide_text:		"Skjul Server",
					context_hidemenu_text:	"Styre Serverliste"
				};
			case "de": 		//german
				return {
					modal_header_text: 		"Verwaltung der Serverliste",
					btn_ok_text: 			"OK",
					btn_all_text:			"Alle",
					btn_visible_text:		"Sichtbar",
					btn_hidden_text:		"Versteckt",
					context_hide_text:		"Verstecke Server",
					context_hidemenu_text:	"Verwalte Serverliste"
				};
			case "es": 		//spanish
				return {
					modal_header_text: 		"Administración de lista de servidores",
					btn_ok_text: 			"OK",
					btn_all_text:			"Todo",
					btn_visible_text:		"Visible",
					btn_hidden_text:		"Oculto",
					context_hide_text:		"Ocultar servidor",
					context_hidemenu_text:	"Administrar lista de servidores"
				};
			case "fr": 		//french
				return {
					modal_header_text: 		"Gestion de la liste des serveurs",
					btn_ok_text: 			"OK",
					btn_all_text:			"Tout",
					btn_visible_text:		"Visible",
					btn_hidden_text:		"Caché",
					context_hide_text:		"Cacher le serveur",
					context_hidemenu_text:	"Gérer la liste des serveurs"
				};
			case "it": 		//italian
				return {
					modal_header_text: 		"Gestione dell'elenco dei server",
					btn_ok_text: 			"OK",
					btn_all_text:			"Tutto",
					btn_visible_text:		"Visible",
					btn_hidden_text:		"Nascosta",
					context_hide_text:		"Nascondi il server",
					context_hidemenu_text:	"Gestione elenco dei server"
				};
			case "nl":		//dutch
				return {
					modal_header_text: 		"Beheer van de Serverlijst",
					btn_ok_text: 			"OK",
					btn_all_text:			"Alle",
					btn_visible_text:		"Zichtbaar",
					btn_hidden_text:		"Verborgen",
					context_hide_text:		"Verberg server",
					context_hidemenu_text:	"Beheer serverlijst"
				};
			case "no":		//norwegian
				return {
					modal_header_text: 		"Administrasjon av serverlisten",
					btn_ok_text: 			"OK",
					btn_all_text:			"Alle",
					btn_visible_text:		"Synlig",
					btn_hidden_text:		"Skjult",
					context_hide_text:		"Skjul server",
					context_hidemenu_text:	"Administrer serverliste"
				};
			case "pl":		//polish
				return {
					modal_header_text: 		"Zarządzanie listą serwerów",
					btn_ok_text: 			"OK",
					btn_all_text:			"Każdy",
					btn_visible_text:		"Widoczny",
					btn_hidden_text:		"Ukryty",
					context_hide_text:		"Ukryj serwer",
					context_hidemenu_text:	"Zarządzaj listą serwerów"
				};
			case "pt":		//portuguese (brazil)
				return {
					modal_header_text: 		"Gerenciamento da lista de servidores",
					btn_ok_text: 			"OK",
					btn_all_text:			"Todo",
					btn_visible_text:		"Visível",
					btn_hidden_text:		"Oculto",
					context_hide_text:		"Ocultar servidor",
					context_hidemenu_text:	"Gerenciar lista de servidores"
				};
			case "fi":		//finnish
				return {
					modal_header_text: 		"Palvelinluettelon hallinta",
					btn_ok_text: 			"OK",
					btn_all_text:			"Kaikki",
					btn_visible_text:		"Näkyvä",
					btn_hidden_text:		"Kätketty",
					context_hide_text:		"Piilota palvelin",
					context_hidemenu_text:	"Hallinnoi palvelinluetteloa"
				};
			case "sv":		//swedish
				return {
					modal_header_text: 		"Hantering av serverlistan",
					btn_ok_text: 			"OK",
					btn_all_text:			"All",
					btn_visible_text:		"Synlig",
					btn_hidden_text:		"Dold",
					context_hide_text:		"Dölj server",
					context_hidemenu_text:	"Hantera serverlistan"
				};
			case "tr":		//turkish
				return {
					modal_header_text: 		"Sunucu Listesinin Yönetimi",
					btn_ok_text: 			"Okey",
					btn_all_text:			"Her",
					btn_visible_text:		"Görünür",
					btn_hidden_text:		"Gizli",
					context_hide_text:		"Sunucuyu Gizle",
					context_hidemenu_text:	"Sunucu Listesini Yönet"
				};
			case "cs":		//czech
				return {
					modal_header_text: 		"Správa seznamu serverů",
					btn_ok_text: 			"OK",
					btn_all_text:			"Vše",
					btn_visible_text:		"Viditelné",
					btn_hidden_text:		"Skrytý",
					context_hide_text:		"Skrýt server",
					context_hidemenu_text:	"Správa seznamu serverů"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text: 		"Управление на списъка със сървъри",
					btn_ok_text: 			"Добре",
					btn_all_text:			"Bсичко",
					btn_visible_text:		"Bидим",
					btn_hidden_text:		"Cкрит",
					context_hide_text:		"Скриване на сървър",
					context_hidemenu_text:	"Управление на списъка със сървъри"
				};
			case "ru":		//russian
				return {
					modal_header_text: 		"Управление списком серверов",
					btn_ok_text: 			"ОК",
					btn_all_text:			"Все",
					btn_visible_text:		"Bидимый",
					btn_hidden_text:		"Cкрытый",
					context_hide_text:		"Скрыть сервер",
					context_hidemenu_text:	"Управление списком серверов"
				};
			case "uk":		//ukranian
				return {
					modal_header_text: 		"Управління списком серверів",
					btn_ok_text: 			"Добре",
					btn_all_text:			"Все",
					btn_visible_text:		"Видимий",
					btn_hidden_text:		"Cхований",
					context_hide_text:		"Сховати сервер",
					context_hidemenu_text:	"Управління списком серверів"
				};
			case "ja":		//japanese
				return {
					modal_header_text: 		"サーバリストの管理",
					btn_ok_text: 			"はい",
					btn_all_text:			"すべて",
					btn_visible_text:		"見える",
					btn_hidden_text:		"隠された",
					context_hide_text:		"サーバーを隠す",
					context_hidemenu_text:	"サーバーリストを管理する"
				};
			case "zh":		//chinese (traditional)
				return {
					modal_header_text: 		"管理服务器列表",
					btn_ok_text: 			"好",
					btn_all_text:			"所有",
					btn_visible_text:		"可见",
					btn_hidden_text:		"隐",
					context_hide_text:		"隐藏服务器",
					context_hidemenu_text:	"管理服务器列表"
				};
			case "ko":		//korean
				return {
					modal_header_text: 		"서버 목록 관리",
					btn_ok_text: 			"승인",
					btn_all_text:			"모든",
					btn_visible_text:		"명백한",
					btn_hidden_text:		"숨겨진",
					context_hide_text:		"서버 숨기기",
					context_hidemenu_text:	"서버 목록 관리"
				};
			default:		//default: english
				return {
					modal_header_text: 		"Managing Serverlist",
					btn_ok_text: 			"OK",
					btn_all_text:			"All",
					btn_visible_text:		"Visible",
					btn_hidden_text:		"Hidden",
					context_hide_text:		"Hide Server",
					context_hidemenu_text:	"Manage Serverlist"
				};
		}
	}
}
