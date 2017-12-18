//META{"name":"ShowHiddenChannels"}*//

class ShowHiddenChannels {
	constructor () {
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
			
		this.channelTextMarkup = 
			`<div class="containerDefault-7RImuF">
				<div class="wrapperDefaultText-3M3F1R wrapper-fDmxzK">
					<div class="contentDefaultText-2elG3R content-2mSKOj">
						<div class="marginReset-1YolDJ" style="flex: 0 0 auto;">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="colorDefaultText-2v6rRX icon-3tVJnl">
								<path class="foreground-2zy1hc" fill="currentColor" d="M10.8,7 L10.8,5.5 C10.8,4.1 9.4,3 8,3 C6.6,3 5.2,4.1 5.2,5.5 L5.2,7 C4.6,7 4,7.6 4,8.2 L4,11.7 C4,12.4 4.6,13 5.2,13 L10.7,13 C11.4,13 12,12.4 12,11.8 L12,8.3 C12,7.6 11.4,7 10.8,7 Z M9.5,7 L6.5,7 L6.5,5.5 C6.5,4.7 7.2,4.2 8,4.2 C8.8,4.2 9.5,4.7 9.5,5.5 L9.5,7 Z"></path>
							</svg>
						</div>
						<div class="nameDefaultText-QoumjC name-2SL4ev overflowEllipsis-3Rxxjf" style="flex: 1 1 auto;">REPLACE_channel_name</div>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginReset-1YolDJ" style="flex: 0 1 auto;"></div>
					</div>
				</div>
			</div>`;
			
		this.channelVoiceMarkup = 
			`<div class="containerDefault-7RImuF">
				<div class="wrapperDefaultVoice-2ud9mj wrapper-fDmxzK">
					<div class="contentDefaultVoice-311dxZ content-2mSKOj">
						<div class="marginReset-1YolDJ" style="flex: 0 0 auto;">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="colorDefaultVoice-1x4dEl icon-3tVJnl">
								<path class="foreground-2zy1hc" fill="currentColor" d="M10.8,7 L10.8,5.5 C10.8,4.1 9.4,3 8,3 C6.6,3 5.2,4.1 5.2,5.5 L5.2,7 C4.6,7 4,7.6 4,8.2 L4,11.7 C4,12.4 4.6,13 5.2,13 L10.7,13 C11.4,13 12,12.4 12,11.8 L12,8.3 C12,7.6 11.4,7 10.8,7 Z M9.5,7 L6.5,7 L6.5,5.5 C6.5,4.7 7.2,4.2 8,4.2 C8.8,4.2 9.5,4.7 9.5,5.5 L9.5,7 Z"></path>
							</svg>
						</div>
						<div class="nameDefaultVoice-1swZoh name-2SL4ev overflowEllipsis-3Rxxjf" style="flex: 1 1 auto;">REPLACE_channel_name</div>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginReset-1YolDJ" style="flex: 0 1 auto;"></div>
					</div>
				</div>
			</div>`;
	}

	getName () {return "ShowHiddenChannels";}

	getDescription () {return "Displays channels that are hidden from you by role restrictions.";}

	getVersion () {return "2.0.5";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
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
			if (document.querySelector(".channels-3g2vYe")) this.channelListObserver.observe(document.querySelector(".channels-3g2vYe"), {childList: true, subtree: true});
			
			this.displayHiddenChannels();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".container-hidden").remove();
			this.channelListObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			setTimeout(() => {this.displayHiddenChannels()},100);
		}
	}

	
	// begin of own functions
	
	displayHiddenChannels () {
		var serverObj = BDfunctionsDevilBro.getSelectedServer();
		if (serverObj) {
			var serverID = serverObj.id;
			var chatWrap = document.querySelector(".layer");
			var channelListWrap = document.querySelector(".channels-3g2vYe");
			if ($(".container-hidden." + serverID).length == 0 && chatWrap && channelListWrap) {
				$(".container-hidden").remove();
				var allChannels = BDfunctionsDevilBro.getKeyInformation({"node":chatWrap,"key":"channels"});
				var shownChannels = BDfunctionsDevilBro.getKeyInformation({"node":channelListWrap,"key":"channels"});
				var shownChannelsText = shownChannels[0];
				var shownChannelsVoice = shownChannels[2];
				var thisChannelsText = [];
				var thisChannelsVoice = [];
				var hiddenChannelsText = [];
				var hiddenChannelsVoice = [];
				
				for (var channelID in allChannels) {
					var oneChannel = allChannels[channelID];
					if (oneChannel.guild_id == serverID) {
						if (oneChannel.type == 0) thisChannelsText.push(oneChannel);
						else if (oneChannel.type == 2) thisChannelsVoice.push(oneChannel);
					}
				}
				
				for (var i1 = 0; i1 < thisChannelsText.length; i1++) {
					var thisChannel = thisChannelsText[i1];
					var channelIsHidden = true;
					for (var j1 = 0; j1 < shownChannelsText.length; j1++) {
						var shownChannel = shownChannelsText[j1].channel;
						if (shownChannel.id == thisChannel.id) {
							channelIsHidden = false;
							break;
						}
					}
					if (channelIsHidden) hiddenChannelsText.push(thisChannel);
				}
				
				for (var i2 = 0; i2 < thisChannelsVoice.length; i2++) {
					var thisChannel = thisChannelsVoice[i2];
					var channelIsHidden = true;
					for (var j2 = 0; j2 < shownChannelsVoice.length; j2++) {
						var shownChannel = shownChannelsVoice[j2].channel;
						if (shownChannel.id == thisChannel.id) {
							channelIsHidden = false;
							break;
						}
					}
					if (channelIsHidden) hiddenChannelsVoice.push(thisChannel);
				}
				
				if (hiddenChannelsText.length > 0 || hiddenChannelsVoice.length > 0) {
					
					hiddenChannelsText = BDfunctionsDevilBro.sortArrayByKey(hiddenChannelsText, "name");
					hiddenChannelsVoice = BDfunctionsDevilBro.sortArrayByKey(hiddenChannelsVoice, "name");
					
					var category = $(this.categoryMarkup)[0]
					var wrapper = category.querySelector(".cursorPointer-3oKATS");
					var icon = category.querySelector(".iconTransition-VhWJ85");
					var name = category.querySelector(".colorTransition-2iZaYd");
					$(category)
						.addClass(serverID)
						.on("click", ".cursorPointer-3oKATS", () => {
							wrapper.classList.toggle("wrapperHovered-1KDCyZ");
							wrapper.classList.toggle("wrapperHoveredCollapsed-25KVVp");
							icon.classList.toggle("iconHovered-3PRzOR");
							icon.classList.toggle("iconHoveredCollapsed-jNYgOD");
							icon.classList.toggle("closed-2Hef-I");
							name.classList.toggle("nameHoveredCollapsed-2c-EHI");
							name.classList.toggle("nameHovered-1YFSWq");
							
							$(category).find(".containerDefault-7RImuF").toggle(!category.querySelector(".closed-2Hef-I"));
							BDfunctionsDevilBro.saveData(serverID, !category.querySelector(".closed-2Hef-I"), this.getName(), "categorystatus");
						})
						.on("mouseenter mouseleave", ".cursorPointer-3oKATS", () => {
							if (!category.querySelector(".closed-2Hef-I")) {
								wrapper.classList.toggle("wrapperDefault-1Dl4SS");
								wrapper.classList.toggle("wrapperHovered-1KDCyZ");
								icon.classList.toggle("iconDefault-xzclSQ");
								icon.classList.toggle("iconHovered-3PRzOR");
								name.classList.toggle("nameDefault-Lnjrwm");
								name.classList.toggle("nameHovered-1YFSWq");
							}
							else {
								wrapper.classList.toggle("wrapperCollapsed-18mf-c");
								wrapper.classList.toggle("wrapperHoveredCollapsed-25KVVp")
								icon.classList.toggle("iconCollapsed-1INdMX")
								icon.classList.toggle("iconHoveredCollapsed-jNYgOD");
								name.classList.toggle("nameCollapsed-3_ChMu");
								name.classList.toggle("nameHoveredCollapsed-2c-EHI")
							}
						});
					
					for (var k1 = 0; k1 < hiddenChannelsText.length; k1++) {
						let hiddenChannel = hiddenChannelsText[k1];
						let channel = $(this.channelTextMarkup)[0];
						$(channel)
							.html($(channel).html().replace("REPLACE_channel_name", hiddenChannel.name))
							.on("mouseenter mouseleave", ".wrapper-fDmxzK", () => {
								var channelwrapper = channel.querySelector(".wrapper-fDmxzK");
								var channelicon = channel.querySelector(".content-2mSKOj");
								var channelname = channel.querySelector(".name-2SL4ev");
								channelwrapper.classList.toggle("wrapperDefaultText-3M3F1R")
								channelwrapper.classList.toggle("wrapperHoveredText-1PA_Uk");
								channelicon.classList.toggle("contentDefaultText-2elG3R")
								channelicon.classList.toggle("contentHoveredText-2HYGIY");
								channelname.classList.toggle("nameDefaultText-QoumjC")
								channelname.classList.toggle("nameHoveredText-2FFqiz");
							})
							.on("click", () => {
								BDfunctionsDevilBro.showToast(`You can not enter the hidden channel ${hiddenChannel.name}.`, {type:"error"});
							})
							.appendTo(category);
					}
					
					for (var k2 = 0; k2 < hiddenChannelsVoice.length; k2++) {
						let hiddenChannel = hiddenChannelsVoice[k2];
						let channel = $(this.channelVoiceMarkup)[0];
						$(channel)
							.html($(channel).html().replace("REPLACE_channel_name", hiddenChannel.name))
							.on("mouseenter mouseleave", ".wrapper-fDmxzK", () => {
								var channelwrapper = channel.querySelector(".wrapper-fDmxzK");
								var channelicon = channel.querySelector(".content-2mSKOj");
								var channelname = channel.querySelector(".name-2SL4ev");
								channelwrapper.classList.toggle("wrapperDefaultVoice-2ud9mj")
								channelwrapper.classList.toggle("wrapperHoveredVoice-3tbfNN");
								channelicon.classList.toggle("contentDefaultVoice-311dxZ")
								channelicon.classList.toggle("contentHoveredVoice-3qGNKh");
								channelname.classList.toggle("nameDefaultVoice-1swZoh")
								channelname.classList.toggle("nameHoveredVoice-TIoHRJ");
							})
							.on("click", () => {
								BDfunctionsDevilBro.showToast(`You can not enter the hidden channel ${hiddenChannel.name}.`, {type:"error"});
							})
							.appendTo(category);
					}
					
					var isOpen = BDfunctionsDevilBro.loadData(serverID, this.getName(), "categorystatus");
					isOpen = isOpen === null ? true : isOpen;
					
					if (!isOpen) {
						wrapper.classList.toggle("wrapperDefault-1Dl4SS");
						wrapper.classList.toggle("wrapperCollapsed-18mf-c");
						icon.classList.toggle("iconDefault-xzclSQ");
						icon.classList.toggle("iconCollapsed-1INdMX")
						icon.classList.toggle("closed-2Hef-I");
						name.classList.toggle("nameDefault-Lnjrwm");
						name.classList.toggle("nameCollapsed-3_ChMu");
						
						$(category).find(".containerDefault-7RImuF").hide();
					}
					
					this.appendToChannelList(category);
				}
			}
		}
	}
	
	appendToChannelList(category) {
		var channelList = document.querySelector(".scroller-fzNley.scroller-NXV0-d");
		if (channelList && category) channelList.insertBefore(category,channelList.lastChild);
	}
}
