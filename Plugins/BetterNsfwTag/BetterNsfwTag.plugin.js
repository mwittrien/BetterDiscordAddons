//META{"name":"BetterNsfwTag"}*//

class BetterNsfwTag {
	constructor () {
		this.switchFixObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		
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
				color: rgb(255, 0, 0);
				background-color: rgba(255, 0, 0, 0.0980392);
				border: 1px solid rgba(255, 0, 0, 0.498039);
			}`;
			
		this.tagMarkup = `<span class="nsfw-tag">NSFW</span>`;
	}

	getName () {return "BetterNsfwTag";}

	getDescription () {return "Adds a more noticeable tag to NSFW channels.";}

	getVersion () {return "1.1.2";}

	getAuthor () {return "DevilBro";}

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
			
			this.channelListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.className && node.className.length > 0 && node.className.indexOf("containerDefault-7RImuF") > -1) {
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
			if (document.querySelector("[class*='channels-'][class*='flex-']")) this.channelListObserver.observe(document.querySelector("[class*='channels-'][class*='flex-']"), {childList: true, subtree: true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.checkAllContainers();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".nsfw-tag").remove();
			
			this.switchFixObserver.disconnect();
			this.channelListObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
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
