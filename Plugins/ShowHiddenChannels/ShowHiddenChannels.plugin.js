//META{"name":"ShowHiddenChannels"}*//

class ShowHiddenChannels {
	constructor () {
		this.serverListObserver = new MutationObserver(() => {});
		
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
								<path class="foreground-2zy1hc" fill="currentColor" d="M2.27333333,12 L2.74666667,9.33333333 L0.08,9.33333333 L0.313333333,8 L2.98,8 L3.68666667,4 L1.02,4 L1.25333333,2.66666667 L3.92,2.66666667 L4.39333333,0 L5.72666667,0 L5.25333333,2.66666667 L9.25333333,2.66666667 L9.72666667,0 L11.06,0 L10.5866667,2.66666667 L13.2533333,2.66666667 L13.02,4 L10.3533333,4 L9.64666667,8 L12.3133333,8 L12.08,9.33333333 L9.41333333,9.33333333 L8.94,12 L7.60666667,12 L8.08,9.33333333 L4.08,9.33333333 L3.60666667,12 L2.27333333,12 L2.27333333,12 Z M5.02,4 L4.31333333,8 L8.31333333,8 L9.02,4 L5.02,4 L5.02,4 Z" transform="translate(1.333 2)"></path>
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

	getVersion () {return "1.0.1";}

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
			this.serverListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class" && change.oldValue && change.oldValue.indexOf("guild") != -1) {
							var serverData = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"guild"});
							if (serverData) {
								this.displayHiddenChannels();
							}
						}
					}
				);
			});
			this.serverListObserver.observe($(".guilds.scroller")[0], {subtree:true, attributes:true, attributeOldValue:true});
			
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
			this.serverListObserver.disconnect();
		}
	}

	
	// begin of own functions
	
	displayHiddenChannels () {
		var server = BDfunctionsDevilBro.getSelectedServer();
		if (server) {
			var channelList = $(".scroller-fzNley.scroller-NXV0-d")[0];
			var serverID = BDfunctionsDevilBro.getIdOfServer(server);
			
			if ($(".container-hidden." + serverID).length == 0) {
				$(".container-hidden").remove();
				var allChannels = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"channels"});
				var shownChannels = [];
				BDfunctionsDevilBro.getKeyInformation({"node":channelList,"key":"channels","all":true,"noCopies":true}).forEach((obj) => {if (obj.count) shownChannels = obj[0];});
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
					channelList.insertBefore(category[0],channelList.lastChild);
					
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
					
					BDfunctionsDevilBro.saveData(serverID, isOpen, this.getName(), "categorystatus");
				}
			}
		}
	}
}
