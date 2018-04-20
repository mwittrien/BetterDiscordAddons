//META{"name":"BetterNsfwTag"}*//

class BetterNsfwTag {
	constructor () {		
		this.css = ` 
			.nsfw-tag {
				position: relative;
				overflow: hidden; 
				padding: 1px 2px 1px 2px; 
				margin-left: 5px; 
				height: 13px;
				border-radius: 3px;
				text-transform: uppercase;
				font-size: 12px;
				font-weight: 500;
				line-height: 14px;
				white-space: nowrap;
				color: rgb(240, 71, 71);
				background-color: rgba(240, 71, 71, 0.0980392);
				border: 1px solid rgba(240, 71, 71, 0.498039);
			}`;
			
		this.tagMarkup = `<span class="nsfw-tag">NSFW</span>`;
	}

	getName () {return "BetterNsfwTag";}

	getDescription () {return "Adds a more noticeable tag to NSFW channels.";}

	getVersion () {return "1.1.4";}

	getAuthor () {return "DevilBro";}

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
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
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
								if (node && node.classList && node.classList.contains("containerDefault-7RImuF")) {
									this.checkChannel(node);
								} 
								if (node && node.className && node.className.length > 0 && node.className.indexOf("container-") > -1) {
									this.checkContainerForNsfwChannel(node);
								} 
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".channels-3g2vYe", {name:"channelListObserver",instance:observer}, {childList: true, subtree: true});
						
			this.checkAllContainers();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".nsfw-tag").remove();
						
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.checkAllContainers();
		}
	}
	
	
	// begin of own functions
	
	checkAllContainers () {
		$(".channels-wrap").find("[class*=container-]").each((_,container) => {
			this.checkContainerForNsfwChannel(container);
		});
	}
	
	checkContainerForNsfwChannel (container) {
		$(container).find(".containerDefault-7RImuF").each((_,channel) => {
			this.checkChannel(channel);
		});
	}
	
	checkChannel (channel) {
		let channelData = BDfunctionsDevilBro.getKeyInformation({"node":channel,"key":"channel"});
		if (channelData && channelData.nsfw == true) {
			if ($(channel).find(".nsfw-tag").length == 0) {
				var tag = $(this.tagMarkup);
				$(channel).find(".name-2SL4ev").append(tag);
			}
		}
	}
}
