//META{"name":"BetterNsfwTag"}*//

class BetterNsfwTag {
	initConstructor () {
		this.patchModules = {
			"ChannelItem":"componentDidMount"
		};
		
		this.tagMarkup = `<span class="NSFW-tag ${BDFDB.disCNS.bottag + BDFDB.disCNS.bottagregular + BDFDB.disCN.bottagnametag}" style="background-color: rgb(241, 71, 71);">NSFW</span>`;
		
		this.css = `
			.NSFW-tag${BDFDB.dotCN.bottag} {
				top: -3px;
			}`
	}

	getName () {return "BetterNsfwTag";}

	getDescription () {return "Adds a more noticeable tag to NSFW channels.";}

	getVersion () {return "1.1.6";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
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
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
						
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.removeEles(".NSFW-tag");		
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions
	
	processChannelItem (instance, wrapper) {
		if (instance.props && instance.props.channel && instance.props.channel.nsfw) {
			$(this.tagMarkup).appendTo(wrapper.querySelector(BDFDB.dotCN.channelname));
		}
	}
}
