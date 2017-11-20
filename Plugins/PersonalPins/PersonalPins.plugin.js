//META{"name":"PersonalPins"}*//

class PersonalPins {
	constructor () {
		this.switchFixObserver = new MutationObserver(() => {});
		this.messageContextObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.optionPopoutObserver = new MutationObserver(() => {});

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item personalpin-item">
					<span>Add Message to Notes</span>
					<div class="hint"></div>
				</div>
			</div>`;
		
		this.notesButton =
			`<svg class="iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9 notesButton" name="Note" width="16" height="16" viewBox="0 0 26 26">
				<g fill="none" fill-rule="evenodd" transform="translate(3,2)">
					<path class="iconForeground-2c7s3m" fill="currentColor" d="M 4.618, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 5.191, 0.256, 4.935, 0, 4.618, 0 z"/>
					<path class="iconForeground-2c7s3m" fill="currentColor" d="M 8.053, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 8.626, 0.256, 8.37, 0, 8.053, 0 z"/>
					<path class="iconForeground-2c7s3m" fill="currentColor" d="M 11.489, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 12.061, 0.256, 11.805, 0, 11.489, 0 z "/>
					<path class="iconForeground-2c7s3m" fill="currentColor" d="M 14.924, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 15.496, 0.256, 15.24, 0, 14.924, 0 z"/>
					<path class="iconForeground-2c7s3m" fill="currentColor" d="M 16.641, 1.25 V 1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 V 1.25 C 2.236, 1.488, 1.756, 2.117, 1.756, 2.863 v 14.962 c 0, 0.947, 0.77, 1.718, 1.718, 1.718 h 12.595 c 0.947, 0, 1.718 -0.77, 1.718 -1.718 V 2.863 C 17.786, 2.117, 17.306, 1.488, 16.641, 1.25 z M 14.924, 16.679 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 16.423, 15.24, 16.679, 14.924, 16.679 z M 14.924, 13.244 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 12.988, 15.24, 13.244, 14.924, 13.244 z M 14.924, 9.733 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 9.733, 14.924, 9.733 z M 14.924, 6.298 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 6.298, 14.924, 6.298 z"/>
				</g>
			</svg>`;
			
		this.notesPopoutMarkup = 
			`<div class="popout popout-bottom-right no-arrow no-shadow popout-personalpins-notes DevilBro-modal" style="z-index: 1000; visibility: visible; left: 544.844px; top: 35.9896px; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div class="messages-popout-wrap themed-popout" style="max-height: 740px;">
					<div class="header">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;">
							<button type="button" value="channel" class="modalTabButton tabButtonType modalTabButtonActive buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
								<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Channel</h3>
							</button>
							<button type="button" value="server" class="modalTabButton tabButtonType buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
								<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Server</h3>
							</button>
							<button type="button" value="allservers" class="modalTabButton tabButtonType buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
								<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">All Servers</h3>
							</button>
						</div>
					</div>
					<div class="scroller-wrap dark">
						<div class="messages-popout scroller">
							<div class="empty-placeholder">
								<div class="image" style="background-image: url(&quot;/assets/6793e022dc1b065b21f12d6df02f91bd.svg&quot;);"></div>
								<div class="body"></div>
							</div>
						</div>
					</div>
					<div class="footer">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;">
							<button type="button" value="timestamp" class="modalTabButton tabButtonDate modalTabButtonActive buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
								<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Message-Date</h3>
							</button>
							<button type="button" value="addedat" class="modalTabButton tabButtonDate buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
								<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Note-Date</h3>
							</button>
						</div>
					</div>
				</div>
			</div>`;
		
		this.optionButtonMarkup = 
			`<div class="btn-option btn-personalpins"></div>`;
		
		this.optionsPopoutMarkup = 
			`<div class="popout popout-bottom no-arrow popout-personalpins-options" style="z-index: 1000; visibility: visible;">
				<div class="option-popout small-popout-box"></div
			</div>`;
			
		this.popoutEntryMarkup = 
			`<div class="btn-item btn-item-personalpins">Note</div>`;
			
		this.messageMarkup = 
			`<div class="message-group hide-overflow">
				<div class="avatar-large animate"></div>
				<div class="comment">
					<div class="message first">
						<div class="body">
							<h2 class="old-h2">
								<span class="username-wrapper"><strong class="user-name"></strong></span>
								<span class="highlight-separator"> - </span><span class="timestamp"></span>
							</h2><div class="message-text">
							<div class="markup"></div>
						</div>
					</div>
					<div class="accessory"></div></div>
				</div>
				<div class="sink-interactions clickable"></div>
				<div class="action-buttons">
					<div class="close-button"></div>
				</div>
			</div>`;
	}

	getName () {return "PersonalPins";}

	getDescription () {return "Similar to normal pins. Lets you save messages as notes for yourself.";}

	getVersion () {return "1.0.5";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
		}
	}

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
			
			this.messageContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.messageContextObserver.observe(document.querySelector(".app"), {childList: true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.classList && node.classList.contains("message-group")) {
									node.querySelectorAll(".message").forEach(message => {this.addOptionButton(message);});
								}
								else if (node && node.tagName && node.classList && node.classList.contains("message")) {
									this.addOptionButton(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true, subtree:true});
			
			this.optionPopoutObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".option-popout") && !node.querySelector(".btn-item-personalpins")) {
									$(node).find(".option-popout").append(this.popoutEntryMarkup);
									this.addClickListener(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".popouts")) this.optionPopoutObserver.observe(document.querySelector(".popouts"), {childList: true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			$(document).off("click." + this.getName(), ".btn-option").off("contextmenu." + this.getName(), ".message")
				.on("click." + this.getName(), ".btn-option", (e) => {
					var div = $(".message").has(e.currentTarget)[0];
					if (div && !div.querySelector(".system-message")) {
						this.message = {
							"div": div,
							"pos": $(".message-group").has(e.currentTarget).find(".message").index(div)
						}
					}
					else {
						this.message = null;
					}
				})
				.on("contextmenu." + this.getName(), ".message", (e) => {
					var div = e.currentTarget;
					if (div && !div.querySelector(".system-message")) {
						this.message = {
							"div": div,
							"pos": $(".message-group").has(e.currentTarget).find(".message").index(div)
						}
					}
					else {
						this.message = null;
					}
				});
			
			document.querySelectorAll(".messages-group .message").forEach(message => {this.addOptionButton(message);});
			
			this.addNotesButton();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			this.messageContextObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.optionPopoutObserver.disconnect();
			
			$(document).off("click." + this.getName(), ".btn-option").off("contextmenu." + this.getName(), ".message");
			
			$(".btn-personalpins, .notesButton").remove();
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true, subtree:true});
			document.querySelectorAll(".messages .message").forEach(message => {this.addOptionButton(message);});
			setTimeout(() => {
				this.addNotesButton();
			},1);
		}
	}

	
	// begin of own functions
	
	onContextMenu (context) {
		var groups = $(context).find(".item-group");
		for (let i = 0; i < groups.length; i++) {
			var group = groups[i];
			if (BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"handleCopyItem"})) {
				$(this.messageContextEntryMarkup).insertAfter(group)
					.on("click", ".personalpin-item", () => {
						$(".context-menu").hide();
						this.addMessageToNotes();
					});
				break;
			}
		}
	}
	
	addNotesButton () {
		$(".notesButton").remove();
		$(this.notesButton)
			.insertBefore($(".iconInactive-WWHQEI").parent().find(".search-2--6aU"))
			.on("click." + this.getName(), (e) => {
				this.openNotesPopout(e);
			})
			.on("mouseenter." + this.getName(), (e) => {
				BDfunctionsDevilBro.createTooltip("Notes", e.currentTarget, {type:"bottom",selector:"note-button-tooltip"});
			});
	}
	
	addOptionButton (message) {
		if (!message.querySelector(".btn-option")) {
			$(message).find(".markup").before(this.optionButtonMarkup);
			$(message).off("click." + this.getName()).on("click." + this.getName(), ".btn-personalpins", (e) => {
				this.openOptionPopout(e);
			});
		}
	}
	
	openNotesPopout (e) {
		var icon = e.currentTarget;
		if (icon.classList.contains("popout-open")) return;
		icon.classList.add("popout-open");
		var popout = $(this.notesPopoutMarkup);
		popout
			.appendTo(".popouts")
			.css("left", $(icon).outerWidth()/2 + $(icon).offset().left + "px")
			.css("top", $(icon).outerHeight() + $(icon).offset().top + "px")
			.on("click", ".modalTabButton", (e) => {
				$(".modalTabButton.modalTabButtonActive", e.currentTarget.parentElement)
					.removeClass("modalTabButtonActive");
					
				$(e.currentTarget)
					.addClass("modalTabButtonActive");
					
				this.addNotes(popout[0]);
			});
			
		$(document).on("mousedown." + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown." + this.getName());
				popout.remove();
				setTimeout(() => {icon.classList.remove("popout-open");},300);
			}
		});
		
		this.addNotes(popout[0]);
	}
	
	openOptionPopout (e) {
		var popout = $(this.optionsPopoutMarkup);
		$(".popouts").append(popout);
		$(popout).find(".option-popout").append(this.popoutEntryMarkup);
		this.addClickListener(popout);
		
		popout
			.css("left", e.pageX - ($(popout).outerWidth() / 2) + "px")
			.css("top", e.pageY + "px");
			
		$(document).on("mousedown." + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown." + this.getName());
				popout.remove();
			}
		});
	}
	
	addClickListener (popout) {
		$(popout)
			.off("click." + this.getName(), ".btn-item-personalpins")
			.on("click." + this.getName(), ".btn-item-personalpins", (e) => {
				$(".popout").has(".option-popout").hide();
				this.addMessageToNotes();
			});
	}
	
	addMessageToNotes () {
		if (!this.message) return;
		var info = BDfunctionsDevilBro.getKeyInformation({"node":this.message.div.parentElement,"key":"message"});
		if (info) {
			var serverID = BDfunctionsDevilBro.getIdOfServer(BDfunctionsDevilBro.getSelectedServer());
			serverID = serverID ? serverID : "dms";
			var channelID = info.channel_id;
			var data = BDfunctionsDevilBro.loadAllData(this.getName(), "servers");
			data[serverID] = data[serverID] ? data[serverID] : {}
			data[serverID][channelID] = data[serverID][channelID] ? data[serverID][channelID] : {}
			var messageID = info.id;
			var position = this.message.pos;
			var message = {
				"server": serverID,
				"channel": channelID,
				"id": messageID,
				"pos": position,
				"timestamp": info.timestamp._i.getTime(),
				"addedat": new Date().getTime(),
				"color": info.colorString,
				"author": info.author.username,
				"avatar": "url('https://cdn.discordapp.com/avatars/" + info.author.id + "/" + info.author.avatar + ".webp')",
				"markup": this.message.div.querySelector(".markup").innerHTML,
				"accessory": this.message.div.querySelector(".accessory").innerHTML
			};
			data[serverID][channelID][messageID + "_" + position] = message;
			BDfunctionsDevilBro.saveAllData(data, this.getName(), "servers");
		}
		this.message = null;
	}
	
	addNotes (popout) {
		$(popout).find(".message-group").remove();
		var info = BDfunctionsDevilBro.getKeyInformation({"node":document.querySelector(".chat"),"key":"channel"});
		if (info) {
			var serverID = info.guild_id;
			var channelID = info.id;
			let data = BDfunctionsDevilBro.loadAllData(this.getName(), "servers");
			if (!BDfunctionsDevilBro.isObjectEmpty(data)) {
				var language = BDfunctionsDevilBro.getDiscordLanguage().id;
				var container = popout.querySelector(".messages-popout");
				var placeholder = popout.querySelector(".empty-placeholder");
				var messages = {};
				switch (popout.querySelector(".tabButtonType.modalTabButtonActive").value) {
					case "channel":
						messages = data[serverID] && data[serverID][channelID] ? data[serverID][channelID] : {};
						break;
					case "server":
						if (data[serverID]) for (let channel in data[serverID]) messages = Object.assign(messages, data[serverID][channel]); 
						break;
					case "allservers":
						for (let server in data) if (data[server]) for (let channel in data[server]) messages = Object.assign(messages, data[server][channel]); 
						break;
				}
				var messageArray = [];
				for (var id in messages) {
					messageArray.push(messages[id]);
				}
				messageArray = BDfunctionsDevilBro.sortArrayByKey(messageArray, popout.querySelector(".tabButtonDate.modalTabButtonActive").value);
				$(placeholder).toggle(messageArray.length == 0);
				for (let i in messageArray) {
					let messageData = messageArray[i];
					let message = $(this.messageMarkup)[0];
					container.insertBefore(message, container.firstChild);
					message.querySelector(".avatar-large").style.backgroundImage = messageData.avatar;
					message.querySelector(".user-name").innerText = messageData.author;
					message.querySelector(".user-name").style.color = messageData.color;
					message.querySelector(".timestamp").innerText = new Date(messageData.timestamp).toLocaleDateString(language);
					message.querySelector(".markup").innerHTML = messageData.markup;
					message.querySelector(".accessory").innerHTML = messageData.accessory;
					$(message).on("click." + this.getName(), ".close-button", (e) => {
						message.remove();
						delete data[messageData.server][messageData.channel][messageData.id + "_" + messageData.pos];
						BDfunctionsDevilBro.saveAllData(data, this.getName(), "servers");
						if (!container.querySelector(".message-group")) $(placeholder).show();
					});
				}
			}
		}
	}
}
