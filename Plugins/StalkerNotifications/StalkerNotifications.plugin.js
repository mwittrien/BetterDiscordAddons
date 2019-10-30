//META{"name":"StalkerNotifications","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/StalkerNotifications","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/StalkerNotifications/StalkerNotifications.plugin.js"}*//

class StalkerNotifications {
	getName () {return "StalkerNotifications";}

	getVersion () {return "9.9.9";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "DISCONTINUED.";}

	constructor () {
		this.changelog = {
			"improved":[["Merged FriendNotifications and StalkerNotifications","Since both of these plugins now work the same, I decided to merge them. FriendNotifications will be continued and StalkerNotifications will be disconntinued. You can find the old StalkerNotifications settings in the FriendNotifications settings. <i style='color:rgb(200, 100, 100); font-weight: 800;'>All old configurations of FriendNotifications and StalkerNotifications should have been merged</i>"]]
		};
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
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);
			
			BDFDB.ModalUtils.confirm(this, "StalkerNotifications has been discontinued and was merged with FriendNotifications. To download FriendNotifications click the 'OK' button bellow. This will delete StalkerNotifications and download FriendNotifications.", "Update Notification", () => {
				require("request")("https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/FriendNotifications/FriendNotifications.plugin.js", (error, response, body) => {
					if (error) BDFDB.NotificationUtils.toast(`Unable to download FriendNotifications.plugin.js.`, {type:"error"});
					else {
						require("fs").writeFile(require("path").join(BDFDB.BDUtils.getPluginsFolder(), "FriendNotifications.plugin.js"), body, (error) => {
							if (!error) {
								BDFDB.NotificationUtils.toast(`Successfully downloaded FriendNotifications.plugin.js.`, {type:"success"});
								require("fs").unlinkSync(require("path").join(BDFDB.BDUtils.getPluginsFolder(), "StalkerNotifications.plugin.js"));
							}
						});
					}
				});
			});
		}
		else console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions
}