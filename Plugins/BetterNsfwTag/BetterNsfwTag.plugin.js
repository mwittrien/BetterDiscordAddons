//META{"name":"BetterNsfwTag","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterNsfwTag","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterNsfwTag/BetterNsfwTag.plugin.js"}*//

class BetterNsfwTag {
	getName () {return "BetterNsfwTag";}

	getVersion () {return "1.1.7";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a more noticeable tag to NSFW channels.";}

	initConstructor () {
		this.patchModules = {
			"ChannelItem":"componentDidMount"
		};
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
			BDFDB.removeEles(".NSFW-tag");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processChannelItem (instance, wrapper) {
		if (instance.props && instance.props.channel && instance.props.channel.nsfw) {
			let channelname = wrapper.querySelector(BDFDB.dotCN.channelname);
			if (channelname) channelname.appendChild(BDFDB.htmlToElement(`<span class="NSFW-tag ${BDFDB.disCNS.bottag + BDFDB.disCNS.bottagregular + BDFDB.disCN.bottagnametag}" style="background-color: rgb(241, 71, 71) !important; color: white !important; top: -3px; position: relative;">NSFW</span>`));
		}
	}
}
