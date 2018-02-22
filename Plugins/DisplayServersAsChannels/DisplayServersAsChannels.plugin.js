//META{"name":"DisplayServersAsChannels"}*//

class DisplayServersAsChannels {
	constructor () {
		
		this.css = `
			.guilds-wrapper.DSAC-styled,
			.guilds-wrapper.DSAC-styled .scroller-wrap,
			.guilds-wrapper.DSAC-styled .guilds {
				width: 240px;
			}
			.bd-minimal .guilds-wrapper.DSAC-styled,
			.bd-minimal .guilds-wrapper.DSAC-styled .scroller-wrap,
			.bd-minimal .guilds-wrapper.DSAC-styled .guilds {
				width: 160px;
			}
			.guilds-wrapper.DSAC-styled .guilds::-webkit-scrollbar-track-piece {
				background-color: rgb(27, 29, 32);
				border-color: rgb(32, 34, 37);
			}
			.guilds-wrapper.DSAC-styled .guilds::-webkit-scrollbar-thumb {
				background-color: rgb(17, 19, 22);
				border-color: rgb(32, 34, 37);
			}
			.bd-minimal .guilds-wrapper.DSAC-styled .guild-separator, 
			.bd-minimal .guilds-wrapper.DSAC-styled .guild-separator ~ .guild,
			.bd-minimal .guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guild-inner,
			.bd-minimal .guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guild-inner a,
			.bd-minimal .guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guilds-error {
				width: 130px;
			}
			.guilds-wrapper.DSAC-styled .guild-separator, 
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild,
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guild-inner,
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guild-inner a,
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guilds-error	{
				margin-left: 0px;
				width: 215px;
				height: 32px;
			}
			.bd-minimal .guilds-wrapper.DSAC-styled .guild {
				margin-left: 55px;
			}
			.bd-minimal .guilds-wrapper.DSAC-styled .friends-online,
			.bd-minimal .guilds-wrapper.DSAC-styled #RANbutton-frame {
				margin-left: 40px;
			}
			.guilds-wrapper.DSAC-styled .guild,
			.guilds-wrapper.DSAC-styled .friends-online {
				margin-left: 80px;
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild {
				box-sizing: border-box;
				opacity: 0.4;
				padding-left: 5px;
				border-radius: 3px;
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild.unread {
				opacity: 0.7;
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild:not(.selected):hover {
				opacity: 0.9;
				background-color: rgba(79,84,92,.3);
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild.selected {
				opacity: 1;
				background-color: rgba(79,84,92,.6);
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guild-inner {
				background: transparent !important;
				border-radius: 0px !important;
			}
			.bd-minimal .guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guild-inner a {
				font-size: 14px !important;
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guild-inner a {
				background: transparent !important;
				font-size: 16px !important;
				line-height: 32px;
				text-align: left;
			}
			.bd-minimal .guilds-wrapper.DSAC-styled .guild-separator ~ .guild .badge {
				bottom: 8px;
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild .badge {
				right: 3px;
				bottom: 7px;
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild .guilds-error	{
				border-radius: 3px;
				margin-left: -5px;
			}
			.guilds-wrapper.DSAC-styled .guild-separator ~ .guild.guilds-add .guilds-add-inner {
				top: -5px;
			}`;
	}

	getName () {return "DisplayServersAsChannels";}

	getDescription () {return "Display servers in a similar way as channels.";}

	getVersion () {return "1.0.2";}

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
			
			$(".guilds-wrapper").addClass("DSAC-styled");
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
			
			$(".DSAC-styled").removeClass("DSAC-styled");
			
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
