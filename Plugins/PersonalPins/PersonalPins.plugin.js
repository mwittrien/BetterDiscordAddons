//META{"name":"PersonalPins"}*//

class PersonalPins {
	constructor () {
		this.labels = {};
		
		this.switchFixObserver = new MutationObserver(() => {});
		this.messageContextObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.optionPopoutObserver = new MutationObserver(() => {});

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item personalpin-item">
					<span>REPLACE_context_noteoption_text</span>
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
				<div class="messages-popout-wrap themed-popout" style="max-height: 740px; width: 500px;">
					<div class="header" style="padding-bottom:0;">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;">
							<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto; margin: -5px 0 5px 0;">REPLACE_popout_note_text</h3>
						</div>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 0 0 auto;">
							<div tab="channel" class="tab selected">REPLACE_popout_channel_text</div>
							<div tab="server" class="tab">REPLACE_popout_server_text</div>
							<div tab="allservers" class="tab">REPLACE_popout_allservers_text</div>
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
					<div class="header" style="padding-bottom:0; border-radius: 0 0 5px 5px;">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 0 0 auto;">
							<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto; margin-top:-19px;">REPLACE_popout_sort_text</h3>
							<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 auto; position: relative; bottom: 7px;">
								<div class="ui-select">
									<div class="Select Select--single has-value">
										<div class="Select-control">
											<span class="Select-multi-value-wrapper">
												<div class="Select-value">
													<span class="Select-value-label">
														<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a" style="flex: 1 1 auto;">
															<div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm selectedOption" option="timestamp">REPLACE_popout_messagesort_text</div>
														</div>
													</span>
												</div>
											</span>
											<span class="Select-arrow-zone">
												<span class="Select-arrow"></span>
											</span>
										</div>
										<div class="Select-menu-outer" style="display: none;">
											<div class="Select-menu">
												<div class="Select-option is-selected">
													<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a" style="flex: 1 1 auto;">
														<div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm selectValue" option="timestamp">REPLACE_popout_messagesort_text</div>
													</div>
												</div>
												<div class="Select-option">
													<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a" style="flex: 1 1 auto;">
														<div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm selectValue" option="addedat">REPLACE_popout_datesort_text</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
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
			`<div class="btn-item btn-item-personalpins">REPLACE_popout_noteoption_text</div>`;
			
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

	getVersion () {return "1.2.0";}

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
			
			BDfunctionsDevilBro.translatePlugin(this);
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

	changeLanguageStrings () {
		this.messageContextEntryMarkup = 	this.messageContextEntryMarkup.replace("REPLACE_context_noteoption_text", this.labels.context_noteoption_text);
		
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_note_text", this.labels.popout_note_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_channel_text", this.labels.popout_channel_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_server_text", this.labels.popout_server_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_allservers_text", this.labels.popout_allservers_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_sort_text", this.labels.popout_sort_text + ":");
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_messagesort_text", this.labels.popout_messagesort_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_messagesort_text", this.labels.popout_messagesort_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_datesort_text", this.labels.popout_datesort_text);
		
		this.popoutEntryMarkup = 			this.popoutEntryMarkup.replace("REPLACE_popout_noteoption_text", this.labels.popout_noteoption_text);
	}
	
	onContextMenu (context) {
		var groups = $(context).find(".item-group");
		for (let i = 0; i < groups.length; i++) {
			var group = groups[i];
			if (BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"displayName", "value":"MessagePinItem"})) {
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
				BDfunctionsDevilBro.createTooltip(this.labels.popout_note_text, e.currentTarget, {type:"bottom",selector:"note-button-tooltip"});
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
			.on("click", ".tab", (e2) => {
				$(".tab.selected", popout).removeClass("selected");
				$(e2.currentTarget).addClass("selected");
				this.addNotes(popout[0]);
			})
			.on("click", ".Select-control", (e2) => {
				var selectWrap = $(".Select").has(e2.currentTarget);
				var selectControl = selectWrap.find(".Select-control");
				var selectMenu = selectWrap.find(".Select-menu-outer");
				var selectInner = selectWrap.find(".selectedOption");
				
				selectWrap.toggleClass("is-open");
				selectMenu.toggle();
				
				if (selectWrap.hasClass("is-open")) {
					$(document).on("mousedown.select" + this.getName(), (e3) => {
						$(document).off("mousedown.select" + this.getName());
						if (selectControl.index(e3.target) > -1 || selectControl.has(e3.target)[0]) return;
						selectWrap.removeClass("is-open");
						selectMenu.hide();
						var selectedOption = selectWrap.find(".Select-option").index(e3.target) > -1 ? e3.target : selectWrap.find(".Select-option").has(e3.target)[0];
						if (selectedOption) {
							$(".Select-option.is-selected", popout).removeClass("is-selected");
							$(selectedOption).addClass("is-selected");
							selectInner.text($(selectedOption).find(".selectValue").text());
							selectInner.attr("option", $(selectedOption).find(".selectValue").attr("option"));
							this.addNotes(popout[0]);
						}
					});
				}
				else {
					$(document).off("mousedown.select" + this.getName());
				}
			});
			
		$(document).on("mousedown.popout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.popout" + this.getName());
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
			BDfunctionsDevilBro.showToast(this.labels.toast_noteadd_text, {type:"success"});
		}
		this.message = null;
	}
	
	addNotes (popout) {
		$(popout).find(".message-group").remove();
		var info = BDfunctionsDevilBro.getKeyInformation({"node":document.querySelector(".chat"),"key":"channel"});
		if (info) {
			var serverID = info.guild_id;
			serverID = serverID ? serverID : "dms";
			var channelID = info.id;
			let data = BDfunctionsDevilBro.loadAllData(this.getName(), "servers");
			if (!BDfunctionsDevilBro.isObjectEmpty(data)) {
				var language = BDfunctionsDevilBro.getDiscordLanguage().id;
				var container = popout.querySelector(".messages-popout");
				var placeholder = popout.querySelector(".empty-placeholder");
				var messages = {};
				switch ($(".tab.selected", popout).attr("tab")) {
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
				messageArray = BDfunctionsDevilBro.sortArrayByKey(messageArray, $(".Select .selectedOption", popout).attr("option"));
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
						BDfunctionsDevilBro.showToast(this.labels.toast_noteremove_text, {type:"danger"});
					});
				}
			}
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					popout_note_text: 				"Noter",
					popout_channel_text: 			"Kanal",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"Alle servere",
					popout_sort_text: 				"Sorter efter",
					popout_messagesort_text: 		"Meddelelse-Dato",
					popout_datesort_text: 			"Note-Dato",
					context_noteoption_text: 		"Noter Meddelelse",
					popout_noteoption_text: 		"Noter",
					toast_noteadd_text: 			"Meddelelse tilføjet til notesbog.",
					toast_noteremove_text: 			"Meddelelse fjernet fra notesbog."
				};
			case "de": 		//german
				return {
					popout_note_text: 				"Notizen",
					popout_channel_text: 			"Kanal",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"Alle Server",
					popout_sort_text: 				"Sortieren nach",
					popout_messagesort_text: 		"Nachrichten-Datum",
					popout_datesort_text: 			"Notiz-Datum",
					context_noteoption_text: 		"Nachricht notieren",
					popout_noteoption_text: 		"Notieren",
					toast_noteadd_text: 			"Nachricht zum Notizbuch hinzugefügt.",
					toast_noteremove_text: 			"Nachricht aus dem Notizbuch entfernt."
				};
			case "es": 		//spanish
				return {
					popout_note_text: 				"Notas",
					popout_channel_text: 			"Canal",
					popout_server_text: 			"Servidor",
					popout_allservers_text: 		"Todos los servidores",
					popout_sort_text: 				"Ordenar por",
					popout_messagesort_text: 		"Mensaje-Fecha",
					popout_datesort_text: 			"Nota-Fecha",
					context_noteoption_text: 		"Anotar mensaje",
					popout_noteoption_text: 		"Anotar",
					toast_noteadd_text: 			"Mensaje agregado al cuaderno.",
					toast_noteremove_text: 			"Mensaje eliminado del cuaderno."
				};
			case "fr": 		//french
				return {
					popout_note_text: 				"Notes",
					popout_channel_text: 			"Canal",
					popout_server_text: 			"Serveur",
					popout_allservers_text: 		"Tous les serveurs",
					popout_sort_text: 				"Trier par",
					popout_messagesort_text: 		"Message-Date",
					popout_datesort_text: 			"Note-Date",
					context_noteoption_text: 		"Noter le message",
					popout_noteoption_text: 		"Noter",
					toast_noteadd_text: 			"Message ajouté au bloc-notes.",
					toast_noteremove_text: 			"Message supprimé du bloc-notes."
				};
			case "it": 		//italian
				return {
					popout_note_text: 				"Note",
					popout_channel_text: 			"Canale",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"Tutti i server",
					popout_sort_text: 				"Ordina per",
					popout_messagesort_text: 		"Messaggio-Data",
					popout_datesort_text: 			"Nota-Data",
					context_noteoption_text: 		"Annotare il messaggio",
					popout_noteoption_text: 		"Annotare",
					toast_noteadd_text: 			"Messaggio aggiunto al blocco note.",
					toast_noteremove_text: 			"Messaggio rimosso dal blocco note."
				};
			case "nl":		//dutch
				return {
					popout_note_text: 				"Notities",
					popout_channel_text: 			"Kanaal",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"Alle servers",
					popout_sort_text: 				"Sorteer op",
					popout_messagesort_text: 		"Bericht-Datum",
					popout_datesort_text: 			"Notitie-Datum",
					context_noteoption_text: 		"Noteer bericht",
					popout_noteoption_text: 		"Noteer",
					toast_noteadd_text: 			"Bericht toegevoegd aan notitieblok.",
					toast_noteremove_text: 			"Bericht verwijderd van notitieblok."
				};
			case "no":		//norwegian
				return {
					popout_note_text: 				"Notatene",
					popout_channel_text: 			"Kanal",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"Alle servere",
					popout_sort_text: 				"Sorter etter",
					popout_messagesort_text: 		"Melding-Dato",
					popout_datesort_text: 			"Merknad-Dato",
					context_noteoption_text: 		"Notat ned meldingen",
					popout_noteoption_text: 		"Notere",
					toast_noteadd_text: 			"Melding lagt til i notisboken.",
					toast_noteremove_text: 			"Melding fjernet fra notatboken."
				};
			case "pl":		//polish
				return {
					popout_note_text: 				"Notatki",
					popout_channel_text: 			"Kanał",
					popout_server_text: 			"Serwer",
					popout_allservers_text: 		"Wszystkie serwery",
					popout_sort_text: 				"Sortuj według",
					popout_messagesort_text: 		"Wiadomość-data",
					popout_datesort_text: 			"Notatka-Data",
					context_noteoption_text: 		"Notuj wiadomość",
					popout_noteoption_text: 		"Notuj",
					toast_noteadd_text: 			"Wiadomość została dodana do notatnika.",
					toast_noteremove_text: 			"Wiadomość została usunięta z notatnika."
				};
			case "pt":		//portuguese (brazil)
				return {
					popout_note_text: 				"Notas",
					popout_channel_text: 			"Canal",
					popout_server_text: 			"Servidor",
					popout_allservers_text: 		"Todos os servidores",
					popout_sort_text: 				"Ordenar por",
					popout_messagesort_text: 		"Mensagem-Data",
					popout_datesort_text: 			"Nota-Data",
					context_noteoption_text: 		"Anote a mensagem",
					popout_noteoption_text: 		"Anotar",
					toast_noteadd_text: 			"Mensagem adicionada ao caderno.",
					toast_noteremove_text: 			"Mensagem removida do caderno."
				};
			case "fi":		//finnish
				return {
					popout_note_text: 				"Muistiinpanot",
					popout_channel_text: 			"Kanava",
					popout_server_text: 			"Palvelin",
					popout_allservers_text: 		"Kaikki palvelimet",
					popout_sort_text: 				"Järjestä",
					popout_messagesort_text: 		"Viesti-Päivämäärä",
					popout_datesort_text: 			"Huomaa-Päivämäärä",
					context_noteoption_text: 		"Huomaa viesti",
					popout_noteoption_text: 		"Huomaa",
					toast_noteadd_text: 			"Viesti lisätty muistikirjaan.",
					toast_noteremove_text: 			"Viesti poistettiin muistikirjaan."
				};
			case "sv":		//swedish
				return {
					popout_note_text: 				"Anteckningarna",
					popout_channel_text: 			"Kanal",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"Alla servrar",
					popout_sort_text: 				"Sortera efter",
					popout_messagesort_text: 		"Meddelande-Datum",
					popout_datesort_text: 			"Anteckningen-Datum",
					context_noteoption_text: 		"Anteckna meddelande",
					popout_noteoption_text: 		"Anteckna",
					toast_noteadd_text: 			"Meddelandet läggs till i anteckningsboken.",
					toast_noteremove_text: 			"Meddelande borttaget från anteckningsboken."
				};
			case "tr":		//turkish
				return {
					popout_note_text: 				"Notlar",
					popout_channel_text: 			"Kanal",
					popout_server_text: 			"Sunucu",
					popout_allservers_text: 		"Tüm Sunucular",
					popout_sort_text: 				"Göre sırala",
					popout_messagesort_text: 		"Mesaj-Tarih",
					popout_datesort_text: 			"Not-Tarih",
					context_noteoption_text: 		"Mesajı not alın",
					popout_noteoption_text: 		"Not almak",
					toast_noteadd_text: 			"Mesaj not defteri'ya eklendi.",
					toast_noteremove_text: 			"Mesaj not defteri'dan kaldırıldı."
				};
			case "cs":		//czech
				return {
					popout_note_text: 				"Poznámky",
					popout_channel_text: 			"Kanál",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"Všechny servery",
					popout_sort_text: 				"Seřazeno podle",
					popout_messagesort_text: 		"Zpráva-datum",
					popout_datesort_text: 			"Poznámka-datum",
					context_noteoption_text: 		"Poznámka dolů zprávu",
					popout_noteoption_text: 		"Poznámka dolů",
					toast_noteadd_text: 			"Zpráva byla přidána do notebooku.",
					toast_noteremove_text: 			"Zpráva byla odebrána z notebooku."
				};
			case "bg":		//bulgarian
				return {
					popout_note_text: 				"бележките",
					popout_channel_text: 			"Канал",
					popout_server_text: 			"Сървър",
					popout_allservers_text: 		"Всички сървъри",
					popout_sort_text: 				"Сортиране по",
					popout_messagesort_text: 		"Съобщение-Дата",
					popout_datesort_text: 			"Забележка-Дата",
					context_noteoption_text: 		"Oтбележете съобщението",
					popout_noteoption_text: 		"Oтбележете",
					toast_noteadd_text: 			"Съобщението бе добавено към бележника.",
					toast_noteremove_text: 			"Съобщението е премахнато от преносимия компютър."
				};
			case "ru":		//russian
				return {
					popout_note_text: 				"Заметки",
					popout_channel_text: 			"Канал",
					popout_server_text: 			"Cервер",
					popout_allservers_text: 		"Все серверы",
					popout_sort_text: 				"Сортировать по",
					popout_messagesort_text: 		"Сообщение-дата",
					popout_datesort_text: 			"Заметки-Дата",
					context_noteoption_text: 		"Записывать вниз",
					popout_noteoption_text: 		"Записывать",
					toast_noteadd_text: 			"Сообщение добавлено в блокнот.",
					toast_noteremove_text: 			"Сообщение удалено из записной книжки."
				};
			case "uk":		//ukrainian
				return {
					popout_note_text: 				"Замітки",
					popout_channel_text: 			"Канал",
					popout_server_text: 			"Сервер",
					popout_allservers_text: 		"Всі сервери",
					popout_sort_text: 				"Сортувати за",
					popout_messagesort_text: 		"Повідомлення-дата",
					popout_datesort_text: 			"Примітка-дата",
					context_noteoption_text: 		"Зверніть увагу на повідомлення",
					popout_noteoption_text: 		"Занотуйте",
					toast_noteadd_text: 			"Повідомлення додається до ноутбука.",
					toast_noteremove_text: 			"Повідомлення видалено з ноутбука."
				};
			case "ja":		//japanese
				return {
					popout_note_text: 				"ノート",
					popout_channel_text: 			"チャネル",
					popout_server_text: 			"サーバ",
					popout_allservers_text: 		"すべてのサーバー",
					popout_sort_text: 				"並び替え",
					popout_messagesort_text: 		"メッセージ-日付",
					popout_datesort_text: 			"注-日付",
					context_noteoption_text: 		"ノートダウンメッセージ",
					popout_noteoption_text: 		"書き留める",
					toast_noteadd_text: 			"ノートブックにメッセージが追加されました.",
					toast_noteremove_text: 			"ノートブックからメッセージが削除されました."
				};
			case "zh":		//chinese (traditional)
				return {
					popout_note_text: 				"筆記",
					popout_channel_text: 			"渠道",
					popout_server_text: 			"服務器",
					popout_allservers_text: 		"所有服務器",
					popout_sort_text: 				"排序方式",
					popout_messagesort_text: 		"消息-日期",
					popout_datesort_text: 			"注-日期",
					context_noteoption_text: 		"記下下來的消息",
					popout_noteoption_text: 		"記下",
					toast_noteadd_text: 			"消息添加到筆記本.",
					toast_noteremove_text: 			"消息從筆記本中刪除."
				};
			case "ko":		//korean
				return {
					popout_note_text: 				"노트",
					popout_channel_text: 			"채널",
					popout_server_text: 			"섬기는 사람",
					popout_allservers_text: 		"모든 서버",
					popout_sort_text: 				"정렬 기준",
					popout_messagesort_text: 		"메시지-날짜",
					popout_datesort_text: 			"주-날짜",
					context_noteoption_text: 		"메모 다운 메시지",
					popout_noteoption_text: 		"메모하다",
					toast_noteadd_text: 			"노트북에 메시지 추가됨.",
					toast_noteremove_text: 			"노트에서 메시지 삭제됨."
				};
			default:		//default: english
				return {
					popout_note_text: 				"Notes",
					popout_channel_text: 			"Channel",
					popout_server_text: 			"Server",
					popout_allservers_text: 		"All Servers",
					popout_sort_text: 				"Sort by",
					popout_messagesort_text: 		"Message-Date",
					popout_datesort_text: 			"Note-Date",
					context_noteoption_text: 		"Note Message",
					popout_noteoption_text: 		"Note",
					toast_noteadd_text: 			"Message added to notebook.",
					toast_noteremove_text: 			"Message removed from notebook."
				};
		}
	}
}
