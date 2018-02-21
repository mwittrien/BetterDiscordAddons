//META{"name":"DisplayServersAsChannels"}*//

class DisplayServersAsChannels {
	constructor () {
		
		this.css = `
			.guilds-wrapper,
			.guilds-wrapper .scroller-wrap,
			.guilds-wrapper .guilds {
				width: 240px !important;
			}
			.bd-minimal .guilds-wrapper,
			.bd-minimal .guilds-wrapper .scroller-wrap,
			.bd-minimal .guilds-wrapper .guilds {
				width: 160px !important;
			}
			.guilds-wrapper .guilds::-webkit-scrollbar-track-piece {
				background-color: rgb(27, 29, 32);
				border-color: rgb(32, 34, 37);
			}
			.guilds-wrapper .guilds::-webkit-scrollbar-thumb {
				background-color: rgb(17, 19, 22);
				border-color: rgb(32, 34, 37);
			}
			.bd-minimal .guilds-wrapper .guild-separator, 
			.bd-minimal .guilds-wrapper .guild-separator ~ .guild,
			.bd-minimal .guilds-wrapper .guild-separator ~ .guild .guild-inner,
			.bd-minimal .guilds-wrapper .guild-separator ~ .guild .guild-inner a {
				width: 130px !important;
			}
			.bd-minimal .guilds-wrapper .guild {
				margin-left: 55px !important;
			}
			.bd-minimal .guilds-wrapper .friends-online,
			.bd-minimal .guilds-wrapper #RANbutton-frame {
				margin-left: 40px !important;
			}
			.guilds-wrapper .guild,
			.guilds-wrapper .friends-online {
				margin-left: 80px !important;
			}
			.bd-minimal .guilds-wrapper .guild-separator ~ .guild,
			.bd-minimal .guilds-wrapper .guild-separator ~ .guild .guild-inner,
			.bd-minimal .guilds-wrapper .guild-separator ~ .guild .guild-inner a {
				font-size: 14px !important;
			}
			.guilds-wrapper .guild-separator, 
			.guilds-wrapper .guild-separator ~ .guild,
			.guilds-wrapper .guild-separator ~ .guild .guild-inner,
			.guilds-wrapper .guild-separator ~ .guild .guild-inner a {
				margin-left: 0px !important;
				width: 210px !important;
			}
			.guilds-wrapper .guild-separator ~ .guild,
			.guilds-wrapper .guild-separator ~ .guild .guild-inner,
			.guilds-wrapper .guild-separator ~ .guild .guild-inner a {
				height: 32px !important;
				font-size: 16px !important;
				line-height: 32px !important;
				background: transparent !important;
				border-radius: 3px !important;
				text-align: left !important;
			}
			.guilds-wrapper .guild-separator ~ .guild {
				padding-left: 5px !important;
			}
			.guilds-wrapper .guild-separator ~ .guild {
				opacity: 0.4 !important;
			}
			.guilds-wrapper .guild-separator ~ .guild.unread {
				opacity: 0.7 !important;
			}
			.guilds-wrapper .guild-separator ~ .guild.selected,
			.guilds-wrapper .guild-separator ~ .guild:hover {
				opacity: 1 !important;
				background-color: rgba(79,84,92,.6) !important;
			}
			.bd-minimal .guilds-wrapper .guild-separator ~ .guild .badge {
				bottom: 8px !important;
			}
			.guilds-wrapper .guild-separator ~ .guild .badge {
				right: 3px !important;
				bottom: 7px !important;
			}`;
	}

	getName () {return "DisplayServersAsChannels";}

	getDescription () {return "Display servers in a similar way as channels.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains("guild") && !node.querySelector(".guilds-error")) {
									var info = BDfunctionsDevilBro.getKeyInformation({"node":node, "key":"guild"});
									if (info) {
										this.changeServer(Object.assign({},info,{div:node,data:info}));
									}
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".guilds.scroller", {name:"serverListObserver",instance:observer}, {childList: true});
			
			BDfunctionsDevilBro.readServerList().forEach(serverObj => {
				this.changeServer(serverObj);
			});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.readServerList().forEach(serverObj => {
				this.resetServer(serverObj);
			});
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions

	changeServer (serverObj) {
		if (!serverObj) return;
		var avatar = serverObj.div.querySelector("a");
		avatar.DSAColdName = avatar.textContent;
		avatar.textContent = serverObj.name;
	}

	resetServer (serverObj) {
		if (!serverObj) return;
		var avatar = serverObj.div.querySelector("a");
		avatar.textContent = avatar.DSAColdName;
	}
}
