//META{"name":"ShowHiddenChannels"}*//

class ShowHiddenChannels {
	constructor () {
		this.switchFixObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		
		this.categoryMarkup = 
			`<div class="container-hidden">
				<div class="containerDefault-1bbItS">
					<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO wrapperDefault-1Dl4SS cursorPointer-3oKATS" style="flex: 1 1 auto;">
						<svg class="iconDefault-xzclSQ iconTransition-VhWJ85" width="12" height="12" viewBox="0 0 24 24">
							<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path>
						</svg>
						<div class="nameDefault-Lnjrwm colorTransition-2iZaYd overflowEllipsis-2ynGQq" style="flex: 1 1 auto;">hidden</div>
					</div>
				</div>
			</div>`;
			
		this.channelMarkup = 
			`<div class="containerDefault-7RImuF">
				<div class="wrapperDefaultText-3M3F1R wrapper-fDmxzK">
					<div class="contentDefaultText-2elG3R content-2mSKOj">
						<div class="marginReset-1YolDJ" style="flex: 0 0 auto;">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="colorDefaultText-2v6rRX icon-3tVJnl">
								<path class="background-2nyTH_" fill="currentColor" d="M7.92,4.66666667 L6.50666667,4.66666667 L6.98,2 L5.64666667,2 L5.17333333,4.66666667 L2.50666667,4.66666667 L2.27333333,6 L4.94,6 L4.23333333,10 L1.56666667,10 L1.33333333,11.3333333 L4,11.3333333 L3.52666667,14 L4.86,14 L5.33333333,11.3333333 L9.33333333,11.3333333 L8.86,14 L10.1933333,14 L10.6666667,11.3333333 L13.3333333,11.3333333 L13.5666667,10 L12.2333333,10 L8.74333333,10 L5.56666667,10 L6.27333333,6 L7.92,6 L7.92,4.66666667 Z"></path>
								<path class="foreground-2zy1hc" fill="currentColor" fill-rule="nonzero" d="M15.1,3.2 L15.1,2 C15.1,0.88 14.05,0 13,0 C11.95,0 10.9,0.88 10.9,2 L10.9,3.2 C10.45,3.2 10,3.68 10,4.16 L10,6.96 C10,7.52 10.45,8 10.9,8 L15.025,8 C15.55,8 16,7.52 16,7.04 L16,4.24 C16,3.68 15.55,3.2 15.1,3.2 Z M14,3 L12,3 L12,1.92857143 C12,1.35714286 12.4666667,1 13,1 C13.5333333,1 14,1.35714286 14,1.92857143 L14,3 Z"></path>
							</svg>
						</div>
						<div class="nameDefaultText-QoumjC name-2SL4ev overflowEllipsis-3Rxxjf" style="flex: 1 1 auto;">REPLACE_channel_name</div>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginReset-1YolDJ" style="flex: 0 1 auto;"></div>
					</div>
				</div>
			</div>`;
	}

	getName () {return "ShowHiddenChannels";}

	getDescription () {return "Displays channels that are hidden from you by role restrictions.";}

	getVersion () {return "1.3.2";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {}

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
			this.channelListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.className && node.className.length > 0 && node.className.indexOf("container-") > -1 && node.className.indexOf("hidden") == -1) {
									this.appendToChannelList(document.querySelector(".container-hidden"));
								} 
							});
						}
					}
				);
			});
			this.channelListObserver.observe($(".flex-vertical.channels-wrap")[0], {childList: true, subtree: true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			this.displayHiddenChannels();
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".container-hidden").remove();
			this.switchFixObserver.disconnect();
			this.channelListObserver.disconnect();
		}
	}
	
	onSwitch () {
		this.displayHiddenChannels();
	}

	
	// begin of own functions
	
	displayHiddenChannels () {
		var server = BDfunctionsDevilBro.getSelectedServer();
		if (server) {
			var serverID = BDfunctionsDevilBro.getIdOfServer(server);
			
			if ($(".container-hidden." + serverID).length == 0) {
				$(".container-hidden").remove();
				
				var allChannels = BDfunctionsDevilBro.getKeyInformation({"node":$(".flex-vertical.channels-wrap").parent()[0],"key":"channels"});
				var shownChannels = BDfunctionsDevilBro.getKeyInformation({"node":$(".flex-vertical.channels-wrap")[0],"key":"channels"})[0];
				var thisChannels = [];
				var hiddenChannels = [];
				
				for (var channelID in allChannels) {
					var oneChannel = allChannels[channelID];
					if (oneChannel.guild_id == serverID && oneChannel.type == 0) thisChannels.push(oneChannel);
				}
				
				for (var i = 0; i < thisChannels.length; i++) {
					var thisChannel = thisChannels[i];
					var channelIsHidden = true;
					for (var j = 0; j < shownChannels.length; j++) {
						var shownChannel = shownChannels[j].channel;
						if (shownChannel.id == thisChannel.id) {
							channelIsHidden = false;
							break;
						}
					}
					if (channelIsHidden) hiddenChannels.push(thisChannel);
				}
				
				if (hiddenChannels.length > 0) {
					
					hiddenChannels = BDfunctionsDevilBro.sortArrayByKey(hiddenChannels, "name");
					
					var isOpen = BDfunctionsDevilBro.loadData(serverID, this.getName(), "categorystatus");
					isOpen = isOpen === null ? true : isOpen;
					
					var category = $(this.categoryMarkup)
						.addClass(serverID)
						.on("click", ".cursorPointer-3oKATS", () => {
							var categoryContainer = category.find(".containerDefault-1bbItS");
							if (categoryContainer.find(".nameHovered-1YFSWq").length > 0) {
								categoryContainer.find(".nameHovered-1YFSWq")
									.removeClass("nameHovered-1YFSWq")
									.addClass("nameHoveredCollapsed-2c-EHI");
								categoryContainer.find(".iconHovered-3PRzOR")
									.attr("class","iconHoveredCollapsed-jNYgOD iconTransition-VhWJ85 closed-2Hef-I");
								categoryContainer.find(".wrapperHovered-1KDCyZ")
									.removeClass("wrapperHovered-1KDCyZ")
									.addClass("wrapperHoveredCollapsed-25KVVp");
								category.find(".containerDefault-7RImuF").hide();
								BDfunctionsDevilBro.saveData(serverID, false, this.getName(), "categorystatus");
							}
							else if (categoryContainer.find(".nameHoveredCollapsed-2c-EHI").length > 0) {
								categoryContainer.find(".nameHoveredCollapsed-2c-EHI")
									.removeClass("nameHoveredCollapsed-2c-EHI")
									.addClass("nameHovered-1YFSWq");
								categoryContainer.find(".iconHoveredCollapsed-jNYgOD")
									.attr("class","iconHovered-3PRzOR iconTransition-VhWJ85");
								categoryContainer.find(".wrapperHoveredCollapsed-25KVVp")
									.removeClass("wrapperHoveredCollapsed-25KVVp")
									.addClass("wrapperHovered-1KDCyZ");
								category.find(".containerDefault-7RImuF").show();
								BDfunctionsDevilBro.saveData(serverID, true, this.getName(), "categorystatus");
							}
						})
						.on("mouseenter", ".cursorPointer-3oKATS", () => {
							var categoryContainer = category.find(".containerDefault-1bbItS");
							if (categoryContainer.find(".nameDefault-Lnjrwm").length > 0) {
								categoryContainer.find(".nameDefault-Lnjrwm")
									.removeClass("nameDefault-Lnjrwm")
									.addClass("nameHovered-1YFSWq");
								categoryContainer.find(".iconDefault-xzclSQ")
									.attr("class","iconHovered-3PRzOR iconTransition-VhWJ85");
								categoryContainer.find(".wrapperDefault-1Dl4SS")
									.removeClass("wrapperDefault-1Dl4SS")
									.addClass("wrapperHovered-1KDCyZ");
							}
							else if (categoryContainer.find(".nameCollapsed-3_ChMu").length > 0) {
								categoryContainer.find(".nameCollapsed-3_ChMu")
									.removeClass("nameCollapsed-3_ChMu")
									.addClass("nameHoveredCollapsed-2c-EHI");
								categoryContainer.find(".iconCollapsed-1INdMX")
									.attr("class","iconHoveredCollapsed-jNYgOD iconTransition-VhWJ85 closed-2Hef-I");
								categoryContainer.find(".wrapperCollapsed-18mf-c")
									.removeClass("wrapperCollapsed-18mf-c")
									.addClass("wrapperHoveredCollapsed-25KVVp");
							}
						})
						.on("mouseleave", ".cursorPointer-3oKATS", () => {
							var categoryContainer = category.find(".containerDefault-1bbItS");
							if (categoryContainer.find(".nameHovered-1YFSWq").length > 0) {
								categoryContainer.find(".nameHovered-1YFSWq")
									.removeClass("nameHovered-1YFSWq")
									.addClass("nameDefault-Lnjrwm");
								categoryContainer.find(".iconHovered-3PRzOR")
									.attr("class","iconDefault-xzclSQ iconTransition-VhWJ85");
								categoryContainer.find(".wrapperHovered-1KDCyZ")
									.removeClass("wrapperHovered-1KDCyZ")
									.addClass("wrapperDefault-1Dl4SS");
							}
							else if (categoryContainer.find(".nameHoveredCollapsed-2c-EHI").length > 0) {
								categoryContainer.find(".nameHoveredCollapsed-2c-EHI")
									.removeClass("nameHoveredCollapsed-2c-EHI")
									.addClass("nameCollapsed-3_ChMu");
								categoryContainer.find(".iconHoverCollapsed-jNYgOD")
									.attr("class","iconCollapsed-1INdMX iconTransition-VhWJ85 closed-2Hef-I");
								categoryContainer.find(".wrapperHoveredCollapsed-25KVVp")
									.removeClass("wrapperHoveredCollapsed-25KVVp")
									.addClass("wrapperCollapsed-18mf-c");
							}
						});
					
					for (var k = 0; k < hiddenChannels.length; k++) {
						var hiddenChannel = hiddenChannels[k];
						let channel = $(this.channelMarkup);
						channel.html(channel.html().replace("REPLACE_channel_name",hiddenChannel.name));
						$(channel[0]).on("mouseenter", ".wrapper-fDmxzK", () => {
							channel.find(".nameDefaultText-QoumjC")
								.removeClass("nameDefaultText-QoumjC")
								.addClass("nameHoveredText-2FFqiz");
							channel.find(".contentDefaultText-2elG3R")
								.removeClass("contentDefaultText-2elG3R")
								.addClass("contentHoveredText-2HYGIY");
							channel.find(".wrapperDefaultText-3M3F1R")
								.removeClass("wrapperDefaultText-3M3F1R")
								.addClass("wrapperHoveredText-1PA_Uk");
						})
						.on("mouseleave", ".wrapper-fDmxzK", () => {
							channel.find(".nameHoveredText-2FFqiz")
								.removeClass("nameHoveredText-2FFqiz")
								.addClass("nameDefaultText-QoumjC");
							channel.find(".contentHoveredText-2HYGIY")
								.removeClass("contentHoveredText-2HYGIY")
								.addClass("contentDefaultText-2elG3R");
							channel.find(".wrapperHoveredText-1PA_Uk")
								.removeClass("wrapperHoveredText-1PA_Uk")
								.addClass("wrapperDefaultText-3M3F1R");
						});
						channel.appendTo(category);
					}
					if (!isOpen) {
						var categoryContainer = category.find(".containerDefault-1bbItS");
						if (categoryContainer.find(".nameDefault-Lnjrwm").length > 0) {
							categoryContainer.find(".nameDefault-Lnjrwm")
								.removeClass("nameDefault-Lnjrwm")
								.addClass("nameCollapsed-3_ChMu");
							categoryContainer.find(".iconDefault-xzclSQ")
								.attr("class","iconCollapsed-1INdMX iconTransition-VhWJ85 closed-2Hef-I");
							categoryContainer.find(".wrapperDefault-1Dl4SS")
								.removeClass("wrapperDefault-1Dl4SS")
								.addClass("wrapperCollapsed-18mf-c");
							category.find(".containerDefault-7RImuF").hide();
						}
					}
					
					this.appendToChannelList(category[0]);
					
					BDfunctionsDevilBro.saveData(serverID, isOpen, this.getName(), "categorystatus");
				}
			}
		}
	}
	
	appendToChannelList(category) {
		var channelList = document.querySelector(".scroller-fzNley.scroller-NXV0-d");
		if (channelList && category) channelList.insertBefore(category,channelList.lastChild);
	}
}
