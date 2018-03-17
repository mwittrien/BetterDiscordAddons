//META{"name":"PersonalPins"}*//

class PersonalPins {
	constructor () {
		this.labels = {};
		
		this.messageContextEntryMarkup =
			`<div class="itemGroup-oViAgA">
				<div class="item-1XYaYf personalpin-item">
					<span>REPLACE_context_noteoption_text</span>
					<div class="hint-3TJykr"></div>
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
					<div class="header" style="padding-bottom: 0;">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginTop8-2gOa2N" style="flex: 0 0 auto;">
							<div class="title">REPLACE_popout_note_text</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO searchBar-YMJBu9 size14-1wjlWP" style="flex: 1 1 auto;">
								<input class="input-yt44Uw flexChild-1KGW5q" value="" placeholder="Search for ..." style="flex: 1 1 auto;">
								<div class="searchBarIcon-vCfmUl flexChild-1KGW5q">
									<i class="icon-11Zny- eyeGlass-6rahZf visible-4lw4vs"/>
									<i class="icon-11Zny- clear-4pSDsx"/>
								</div>
							</div>
						</div>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginTop8-2gOa2N" style="flex: 0 0 auto;">
							<div tab="channel" class="tab">REPLACE_popout_channel_text</div>
							<div tab="server" class="tab">REPLACE_popout_server_text</div>
							<div tab="allservers" class="tab">REPLACE_popout_allservers_text</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO quickSelect-2sgeoi" style="padding-bottom: 15px; float:right;">
								<div class="quickSelectLabel-2MM1ZS">REPLACE_popout_sort_text:</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO quickSelectClick-36aPV0" style="flex: 0 0 auto;">
									<div option="timestamp" class="quickSelectValue-23jNHW">REPLACE_popout_messagesort_text</div>
									<div class="quickSelectArrow-1lyLly"></div>
								</div>
							</div>
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
				</div>
			</div>`;
			
		this.sortPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow personalpins-sort-popout" style="z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="contextMenu-uoJTbz quickSelectPopout">
						<div class="itemGroup-oViAgA">
							<div option="timestamp" class="item-1XYaYf">REPLACE_popout_messagesort_text</div>
							<div option="addedat" class="item-1XYaYf">REPLACE_popout_datesort_text</div>
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
								<span class="highlight-separator"> - </span>
								<span class="timestamp"></span>
							</h2>
							<div class="message-text">
								<div class="markup" style="width: 380px;"></div>
							</div>
						</div>
						<div class="accessory"></div>
						<div class="description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn server-channel"></div>
					</div>
				</div>
				<div class="sink-interactions clickable"></div>
				<div class="action-buttons">
					<div class="jump-button jump"><div class="text">REPLACE_popout_jump_text</div></div>
					<div class="jump-button copy"><div class="text">REPLACE_popout_copy_text</div></div>
					<div class="close-button"></div>
				</div>
			</div>`;
	}

	getName () {return "PersonalPins";}

	getDescription () {return "Similar to normal pins. Lets you save messages as notes for yourself.";}

	getVersion () {return "1.4.5";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Delete all Notes.</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorRed-3HTNPV sizeMedium-2VGNaF grow-25YQ8u reset-button" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".reset-button", () => {this.resetAll();});
		return settingspanel;
	}

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
			
			if (!BDfunctionsDevilBro.loadData("reset1", this, "resets")) {
				BDfunctionsDevilBro.removeAllData(this, "servers");
				BDfunctionsDevilBro.saveData("reset1", true, this, "resets");
			}
			
			this.GuildStore = BDfunctionsDevilBro.WebModules.findByProperties(["getGuild"]);
			this.ChannelStore = BDfunctionsDevilBro.WebModules.findByProperties(["getChannel"]);
			this.UserStore = BDfunctionsDevilBro.WebModules.findByProperties(["getUser"]);
			this.MemberStore = BDfunctionsDevilBro.WebModules.findByProperties(["getMember"]);
			this.IconUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUserAvatarURL"]);
			this.HistoryUtils = BDfunctionsDevilBro.WebModules.findByProperties(["transitionTo", "replaceWith", "getHistory"]);
			this.MainDiscord = BDfunctionsDevilBro.WebModules.findByProperties(["ActionTypes"]);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#app-mount", {name:"messageContextObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
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
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver",instance:observer}, {childList:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
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
			BDfunctionsDevilBro.addObserver(this, ".popouts", {name:"optionPopoutObserver",instance:observer}, {childList: true});
			
			$(document).off("click." + this.getName(), ".btn-option").off("contextmenu." + this.getName(), ".message")
				.on("click." + this.getName(), ".btn-option", (e) => {
					this.getMessageData($(".message").has(e.currentTarget)[0]);
				})
				.on("contextmenu." + this.getName(), ".message", (e) => {
					this.getMessageData(e.currentTarget);
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
			$(document).off("click." + this.getName(), ".btn-option").off("contextmenu." + this.getName(), ".message");
			
			$(".btn-personalpins, .notesButton").remove();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver"}, {childList:true, subtree:true});
			document.querySelectorAll(".messages .message").forEach(message => {this.addOptionButton(message);});
			setTimeout(() => {
				this.addNotesButton();
			},1);
		}
	}

	
	// begin of own functions

	resetAll () {
		if (confirm("Are you sure you want to delete all pinned notes?")) {
			BDfunctionsDevilBro.removeAllData(this, "pins");
		}
	}
	
	changeLanguageStrings () {
		this.messageContextEntryMarkup = 	this.messageContextEntryMarkup.replace("REPLACE_context_noteoption_text", this.labels.context_noteoption_text);
		
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_note_text", this.labels.popout_note_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_channel_text", this.labels.popout_channel_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_server_text", this.labels.popout_server_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_allservers_text", this.labels.popout_allservers_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_sort_text", this.labels.popout_sort_text);
		this.notesPopoutMarkup = 			this.notesPopoutMarkup.replace("REPLACE_popout_messagesort_text", this.labels.popout_messagesort_text);
		
		this.messageMarkup = 				this.messageMarkup.replace("REPLACE_popout_jump_text", this.labels.popout_jump_text);
		this.messageMarkup = 				this.messageMarkup.replace("REPLACE_popout_copy_text", this.labels.popout_copy_text);
		
		this.sortPopoutMarkup = 			this.sortPopoutMarkup.replace("REPLACE_popout_messagesort_text", this.labels.popout_messagesort_text);
		this.sortPopoutMarkup = 			this.sortPopoutMarkup.replace("REPLACE_popout_datesort_text", this.labels.popout_datesort_text);
		
		this.popoutEntryMarkup = 			this.popoutEntryMarkup.replace("REPLACE_popout_noteoption_text", this.labels.popout_noteoption_text);
	}
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".personalpin-item")) return;
		for (let group of context.querySelectorAll(".itemGroup-oViAgA")) {
			if (BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"displayName", "value":"MessagePinItem"})) {
				$(this.messageContextEntryMarkup).insertAfter(group)
					.on("click", ".personalpin-item", () => {
						$(context).hide();
						this.addMessageToNotes();
					});
				
				BDfunctionsDevilBro.updateContextPosition(context);
				break;
			}
		}
	}
	
	getMessageData (div) {
		if (div && !div.querySelector(".system-message")) {
			var messagegroup = $(".message-group").has(div);
			var pos = messagegroup.find(".message").index(div);
			if (messagegroup[0] && pos > -1) {
				var info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"messages","up":true,"time":1000});
				if (info) this.message = Object.assign({},info[pos],{"div":div, "group":messagegroup[0], "pos":pos});
			}
		}
		else {
			this.message = null;
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
		if (!message.querySelector(".btn-option") && !message.querySelector(".system-message")) {
			$(this.optionButtonMarkup).insertBefore(message.querySelector(".message-text").firstChild);
			$(message).off("click." + this.getName()).on("click." + this.getName(), ".btn-personalpins", (e) => {
				this.openOptionPopout(e);
			});
		}
	}
	
	openNotesPopout (e) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var popout = $(this.notesPopoutMarkup);
		BDfunctionsDevilBro.initElements(popout);
		popout
			.appendTo(".popouts")
			.css("left", $(wrapper).outerWidth()/2 + $(wrapper).offset().left + "px")
			.css("top", $(wrapper).outerHeight() + $(wrapper).offset().top + "px")
			.on("click", ".tab", () => {
				this.addNotes(popout[0]);
			})
			.on("keyup." + this.getName(), ".input-yt44Uw", () => {
				clearTimeout(popout.searchTimeout);
				popout.searchTimeout = setTimeout(() => {this.addNotes(popout[0]);},1000);
			})
			.on("click." + this.getName(), ".clear-4pSDsx.visible-4lw4vs", () => {
				clearTimeout(popout.searchTimeout);
				popout.searchTimeout = setTimeout(() => {this.addNotes(popout[0]);},1000);
			})
			.on("click", ".quickSelectClick-36aPV0", (e2) => {
				this.openSortPopout(e2, popout[0]);
			});
			
		$(document).on("mousedown.notepopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0 && $(".personalpins-sort-popout").has(e2.target).length == 0) {
				$(document).off("mousedown.notepopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
		
		this.addNotes(popout[0]);
	}
	
	openSortPopout (e, notespopout) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(".quickSelectValue-23jNHW");
		var popout = $(this.sortPopoutMarkup);
		$(".popouts").append(popout)
			.off("click", ".item-1XYaYf")
			.on("click", ".item-1XYaYf", (e2) => {
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
				this.addNotes(notespopout);
			});
			
		popout
			.css("left", $(e.currentTarget).offset().left + $(e.currentTarget).outerWidth() + "px")
			.css("top", $(e.currentTarget).offset().top + value.outerHeight() + "px")
			.find(".context-menu").addClass(BDfunctionsDevilBro.getDiscordTheme());
			
		$(document).on("mousedown.sortpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
	
	openOptionPopout (e) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var popout = $(this.optionsPopoutMarkup);
		$(".popouts").append(popout);
		$(popout).find(".option-popout").append(this.popoutEntryMarkup);
		this.addClickListener(popout);
		
		popout
			.css("left", e.pageX - ($(popout).outerWidth() / 2) + "px")
			.css("top", e.pageY + "px");
			
		$(document).on("mousedown.optionpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.optionpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
	
	addClickListener (popout) {
		$(popout)
			.off("click." + this.getName(), ".btn-item-personalpins")
			.on("click." + this.getName(), ".btn-item-personalpins", (e) => {
				$(".popout").has(".option-popout").hide();
				this.addMessageToNotes();
				var popoutbutton = document.querySelector(".btn-option.popout-open");
				if (popoutbutton) popoutbutton.classList.remove("popout-open");
			});
	}
	
	addMessageToNotes () {
		if (!this.message) return;
		var channelObj = BDfunctionsDevilBro.getSelectedChannel();
		var serverObj = BDfunctionsDevilBro.getSelectedServer() || {};
		if (this.message && channelObj) {
			var author = this.message.author;
			var channelID = channelObj.id;
			var serverID = serverObj.id ? serverObj.id : "@me";
			var pins = BDfunctionsDevilBro.loadAllData(this, "pins");
			pins[serverID] = pins[serverID] ? pins[serverID] : {}
			pins[serverID][channelID] = pins[serverID][channelID] ? pins[serverID][channelID] : {}
			var messageID = this.message.id;
			var position = this.message.pos;
			var message = {
				"serverID": serverID,
				"serverName": serverObj.name ? serverObj.name : "Direct Messages",
				"channelID": channelID,
				"channelName": channelObj.name ? channelObj.name : BDfunctionsDevilBro.getInnerText(channelObj.div.querySelector(".channel-name")),
				"id": messageID,
				"pos": position,
				"timestamp": this.message.timestamp._i.getTime(),
				"addedat": new Date().getTime(),
				"color": this.message.colorString,
				"authorID": author.id,
				"authorName": author.username,
				"avatar": this.IconUtils.getUserAvatarURL(author),
				"content": this.message.content,
				"markup": this.message.div.querySelector(".markup").innerHTML,
				"accessory": this.message.div.querySelector(".accessory").innerHTML
			};
			pins[serverID][channelID][messageID + "_" + position] = message;
			BDfunctionsDevilBro.saveAllData(pins, this, "pins");
			BDfunctionsDevilBro.showToast(this.labels.toast_noteadd_text, {type:"success"});
		}
		this.message = null;
	}
	
	addNotes (notespopout) {
		notespopout.querySelectorAll(".message-group").forEach(message => {message.remove();});
		var channelObj = BDfunctionsDevilBro.getSelectedChannel();
		if (channelObj) {
			var serverID = channelObj.guild_id ? channelObj.guild_id : "@me";
			var channelID = channelObj.id;
			var pins = BDfunctionsDevilBro.loadAllData(this, "pins");
			if (!BDfunctionsDevilBro.isObjectEmpty(pins)) {
				var language = BDfunctionsDevilBro.getDiscordLanguage().id;
				var container = notespopout.querySelector(".messages-popout");
				var placeholder = notespopout.querySelector(".empty-placeholder");
				var messages = {};
				switch (notespopout.querySelector(".tab.selected").getAttribute("tab")) {
					case "channel":
						messages = pins[serverID] && pins[serverID][channelID] ? pins[serverID][channelID] : {};
						break;
					case "server":
						if (pins[serverID]) for (let channel in pins[serverID]) messages = Object.assign(messages, pins[serverID][channel]); 
						break;
					case "allservers":
						for (let server in pins) if (pins[server]) for (let channel in pins[server]) messages = Object.assign(messages, pins[server][channel]); 
						break;
				}
				var messageArray = [];
				for (var id in messages) {
					messageArray.push(messages[id]);
				}
				messageArray = BDfunctionsDevilBro.sortArrayByKey(messageArray, notespopout.querySelector(".quickSelectValue-23jNHW").getAttribute("option"));
				for (let messageData of messageArray) {
					let message = $(this.messageMarkup)[0];
					let server = this.GuildStore.getGuild(messageData.serverID);
					let channel = this.ChannelStore.getChannel(messageData.channelID);
					let user = this.UserStore.getUser(messageData.authorID);
					let member = this.MemberStore.getMember(messageData.serverID, messageData.authorID);
					let date = new Date(messageData.timestamp);
					container.insertBefore(message, container.firstChild);
					message.querySelector(".avatar-large").style.backgroundImage = 
						user ? "url(" + this.IconUtils.getUserAvatarURL(user) + ")" : "url(" + messageData.avatar + ")";
					message.querySelector(".user-name").innerText = user ? user.username : messageData.authorName;
					message.querySelector(".user-name").style.color = member ? member.colorString : messageData.color;
					message.querySelector(".timestamp").innerText = date.toLocaleString(language);
					message.querySelector(".server-channel").innerText = 
						(server && server.name ? server.name : messageData.serverName) + 
						(messageData.serverID == "@me" ? " @" : " #") + 
						(channel && channel.name ? channel.name : messageData.channelName);
					message.querySelector(".markup").innerHTML = messageData.markup;
					message.querySelector(".accessory").innerHTML = messageData.accessory;
					$(message).on("click." + this.getName(), ".close-button", (e) => {
						message.remove();
						delete pins[messageData.serverID][messageData.channelID][messageData.id + "_" + messageData.pos];
						BDfunctionsDevilBro.saveAllData(pins, this, "pins");
						if (!container.querySelector(".message-group")) $(placeholder).show();
						BDfunctionsDevilBro.showToast(this.labels.toast_noteremove_text, {type:"danger"});
					})
					.on("click." + this.getName(), ".jump-button.jump", (e) => {
						this.HistoryUtils.transitionTo(this.MainDiscord.Routes.MESSAGE(messageData.serverID, messageData.channelID, messageData.id));
					})
					.on("click." + this.getName(), ".jump-button.copy", (e) => {
						let clipboard = require("electron").clipboard;
						if (messageData.content) clipboard.write({text: messageData.content});
						else {
							var image = message.querySelector(".imageWrapper-38T7d9 img");
							if (image) {
								// stolen from Image2Clipboard
								require("request")({url: image.src, encoding: null}, (error, response, buffer) => {
									if (buffer) {
										var platform = require("process").platform;
										if (platform === "win32" || platform === "darwin") {
											clipboard.write({image: require("electron").nativeImage.createFromBuffer(buffer)});
										}
										else {
											var file = require("path").join(require("process").env["HOME"], "personalpinstemp.png");
											require("fs").writeFileSync(file, buffer, {encoding: null});
											clipboard.write({image: file});
											require("fs").unlinkSync(file);
										}
									}
								});
							}
						}
					});
				}
				var searchstring = notespopout.querySelector(".input-yt44Uw").value.replace(/[<|>]/g, "");
				if (searchstring) for (let note of notespopout.querySelectorAll(".message-group")) {
					note.innerHTML = BDfunctionsDevilBro.highlightText(note.innerHTML, searchstring);
					if (!note.querySelector(".highlight")) note.remove();
				}
				$(placeholder).toggle(notespopout.querySelectorAll(".message-group").length == 0);
			}
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					popout_note_text:				"Bilješke",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Poslužavnik",
					popout_allservers_text:			"Svi poslužitelji",
					popout_sort_text:				"Poredaj po",
					popout_messagesort_text:		"Vijesti-Datum",
					popout_datesort_text:			"Bilješka-Datum",
					popout_jump_text:				"Skok",
					popout_copy_text:				"Kopija",
					context_noteoption_text:		"Napominjemo poruku",
					popout_noteoption_text:			"Bilješka",
					toast_noteadd_text:				"Poruka dodana u bilježnicu.",
					toast_noteremove_text:			"Poruka uklonjena iz bilježnice."
				};
			case "da":		//danish
				return {
					popout_note_text:				"Noter",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle servere",
					popout_sort_text:				"Sorter efter",
					popout_messagesort_text:		"Meddelelse-Dato",
					popout_datesort_text:			"Note-Dato",
					popout_jump_text:				"Hop",
					popout_copy_text:				"Kopi",
					context_noteoption_text:		"Noter Meddelelse",
					popout_noteoption_text:			"Noter",
					toast_noteadd_text:				"Meddelelse tilføjet til notesbog.",
					toast_noteremove_text:			"Meddelelse fjernet fra notesbog."
				};
			case "de":		//german
				return {
					popout_note_text:				"Notizen",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle Server",
					popout_sort_text:				"Sortieren nach",
					popout_messagesort_text:		"Nachrichten-Datum",
					popout_datesort_text:			"Notiz-Datum",
					popout_jump_text:				"Springen",
					popout_copy_text:				"Kopieren",
					context_noteoption_text:		"Nachricht notieren",
					popout_noteoption_text:			"Notieren",
					toast_noteadd_text:				"Nachricht zum Notizbuch hinzugefügt.",
					toast_noteremove_text:			"Nachricht aus dem Notizbuch entfernt."
				};
			case "es":		//spanish
				return {
					popout_note_text:				"Notas",
					popout_channel_text:			"Canal",
					popout_server_text:				"Servidor",
					popout_allservers_text:			"Todos los servidores",
					popout_sort_text:				"Ordenar por",
					popout_messagesort_text:		"Mensaje-Fecha",
					popout_datesort_text:			"Nota-Fecha",
					popout_jump_text:				"Ir a",
					popout_copy_text:				"Copiar",
					context_noteoption_text:		"Anotar mensaje",
					popout_noteoption_text:			"Anotar",
					toast_noteadd_text:				"Mensaje agregado al cuaderno.",
					toast_noteremove_text:			"Mensaje eliminado del cuaderno."
				};
			case "fr":		//french
				return {
					popout_note_text:				"Notes",
					popout_channel_text:			"Canal",
					popout_server_text:				"Serveur",
					popout_allservers_text:			"Tous les serveurs",
					popout_sort_text:				"Trier par",
					popout_messagesort_text:		"Message-Date",
					popout_datesort_text:			"Note-Date",
					popout_jump_text:				"Accéder",
					popout_copy_text:				"Copier",
					context_noteoption_text:		"Noter le message",
					popout_noteoption_text:			"Noter",
					toast_noteadd_text:				"Message ajouté au bloc-notes.",
					toast_noteremove_text:			"Message supprimé du bloc-notes."
				};
			case "it":		//italian
				return {
					popout_note_text:				"Note",
					popout_channel_text:			"Canale",
					popout_server_text:				"Server",
					popout_allservers_text:			"Tutti i server",
					popout_sort_text:				"Ordina per",
					popout_messagesort_text:		"Messaggio-Data",
					popout_datesort_text:			"Nota-Data",
					popout_jump_text:				"Vai",
					popout_copy_text:				"Copiare",
					context_noteoption_text:		"Annotare il messaggio",
					popout_noteoption_text:			"Annotare",
					toast_noteadd_text:				"Messaggio aggiunto al blocco note.",
					toast_noteremove_text:			"Messaggio rimosso dal blocco note."
				};
			case "nl":		//dutch
				return {
					popout_note_text:				"Notities",
					popout_channel_text:			"Kanaal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle servers",
					popout_sort_text:				"Sorteer op",
					popout_messagesort_text:		"Bericht-Datum",
					popout_datesort_text:			"Notitie-Datum",
					popout_jump_text:				"Openen",
					popout_copy_text:				"Kopiëren",
					context_noteoption_text:		"Noteer bericht",
					popout_noteoption_text:			"Noteer",
					toast_noteadd_text:				"Bericht toegevoegd aan notitieblok.",
					toast_noteremove_text:			"Bericht verwijderd van notitieblok."
				};
			case "no":		//norwegian
				return {
					popout_note_text:				"Notatene",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle servere",
					popout_sort_text:				"Sorter etter",
					popout_messagesort_text:		"Melding-Dato",
					popout_datesort_text:			"Merknad-Dato",
					popout_jump_text:				"Hoppe",
					popout_copy_text:				"Kopiere",
					context_noteoption_text:		"Notat ned meldingen",
					popout_noteoption_text:			"Notere",
					toast_noteadd_text:				"Melding lagt til i notisboken.",
					toast_noteremove_text:			"Melding fjernet fra notatboken."
				};
			case "pl":		//polish
				return {
					popout_note_text:				"Notatki",
					popout_channel_text:			"Kanał",
					popout_server_text:				"Serwer",
					popout_allservers_text:			"Wszystkie serwery",
					popout_sort_text:				"Sortuj według",
					popout_messagesort_text:		"Wiadomość-Data",
					popout_datesort_text:			"Notatka-Data",
					popout_jump_text:				"Skocz",
					popout_copy_text:				"Kopiować",
					context_noteoption_text:		"Notuj wiadomość",
					popout_noteoption_text:			"Notuj",
					toast_noteadd_text:				"Wiadomość została dodana do notatnika.",
					toast_noteremove_text:			"Wiadomość została usunięta z notatnika."
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					popout_note_text:				"Notas",
					popout_channel_text:			"Canal",
					popout_server_text:				"Servidor",
					popout_allservers_text:			"Todos os servidores",
					popout_sort_text:				"Ordenar por",
					popout_messagesort_text:		"Mensagem-Data",
					popout_datesort_text:			"Nota-Data",
					popout_jump_text:				"Pular",
					popout_copy_text:				"Copiar",
					context_noteoption_text:		"Anote a mensagem",
					popout_noteoption_text:			"Anotar",
					toast_noteadd_text:				"Mensagem adicionada ao caderno.",
					toast_noteremove_text:			"Mensagem removida do caderno."
				};
			case "fi":		//finnish
				return {
					popout_note_text:				"Muistiinpanot",
					popout_channel_text:			"Kanava",
					popout_server_text:				"Palvelin",
					popout_allservers_text:			"Kaikki palvelimet",
					popout_sort_text:				"Järjestä",
					popout_messagesort_text:		"Viesti-Päivämäärä",
					popout_datesort_text:			"Huomaa-Päivämäärä",
					popout_jump_text:				"Siirry",
					popout_copy_text:				"Kopioida",
					context_noteoption_text:		"Huomaa viesti",
					popout_noteoption_text:			"Huomaa",
					toast_noteadd_text:				"Viesti lisätty muistikirjaan.",
					toast_noteremove_text:			"Viesti poistettiin muistikirjaan."
				};
			case "sv":		//swedish
				return {
					popout_note_text:				"Anteckningarna",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alla servrar",
					popout_sort_text:				"Sortera efter",
					popout_messagesort_text:		"Meddelande-Datum",
					popout_datesort_text:			"Anteckningen-Datum",
					popout_jump_text:				"Hoppa",
					popout_copy_text:				"Kopiera",
					context_noteoption_text:		"Anteckna meddelande",
					popout_noteoption_text:			"Anteckna",
					toast_noteadd_text:				"Meddelandet läggs till i anteckningsboken.",
					toast_noteremove_text:			"Meddelande borttaget från anteckningsboken."
				};
			case "tr":		//turkish
				return {
					popout_note_text:				"Notlar",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Sunucu",
					popout_allservers_text:			"Tüm Sunucular",
					popout_sort_text:				"Göre sırala",
					popout_messagesort_text:		"Mesaj-Tarih",
					popout_datesort_text:			"Not-Tarih",
					popout_jump_text:				"Git",
					popout_copy_text:				"Kopyalamak",
					context_noteoption_text:		"Mesajı not alın",
					popout_noteoption_text:			"Not almak",
					toast_noteadd_text:				"Mesaj not defteri'ya eklendi.",
					toast_noteremove_text:			"Mesaj not defteri'dan kaldırıldı."
				};
			case "cs":		//czech
				return {
					popout_note_text:				"Poznámky",
					popout_channel_text:			"Kanál",
					popout_server_text:				"Server",
					popout_allservers_text:			"Všechny servery",
					popout_sort_text:				"Seřazeno podle",
					popout_messagesort_text:		"Zpráva-datum",
					popout_datesort_text:			"Poznámka-datum",
					popout_jump_text:				"Skok",
					popout_copy_text:				"Kopírovat",
					context_noteoption_text:		"Poznámka dolů zprávu",
					popout_noteoption_text:			"Poznámka dolů",
					toast_noteadd_text:				"Zpráva byla přidána do notebooku.",
					toast_noteremove_text:			"Zpráva byla odebrána z notebooku."
				};
			case "bg":		//bulgarian
				return {
					popout_note_text:				"бележките",
					popout_channel_text:			"Канал",
					popout_server_text:				"Сървър",
					popout_allservers_text:			"Всички сървъри",
					popout_sort_text:				"Сортиране по",
					popout_messagesort_text:		"Съобщение-Дата",
					popout_datesort_text:			"Забележка-Дата",
					popout_jump_text:				"Направо",
					popout_copy_text:				"Копирам",
					context_noteoption_text:		"Oтбележете съобщението",
					popout_noteoption_text:			"Oтбележете",
					toast_noteadd_text:				"Съобщението бе добавено към бележника.",
					toast_noteremove_text:			"Съобщението е премахнато от преносимия компютър."
				};
			case "ru":		//russian
				return {
					popout_note_text:				"Заметки",
					popout_channel_text:			"Канал",
					popout_server_text:				"Cервер",
					popout_allservers_text:			"Все серверы",
					popout_sort_text:				"Сортировать по",
					popout_messagesort_text:		"Сообщение-дата",
					popout_datesort_text:			"Заметки-Дата",
					popout_jump_text:				"Перейти",
					popout_copy_text:				"Копировать",
					context_noteoption_text:		"Записывать вниз",
					popout_noteoption_text:			"Записывать",
					toast_noteadd_text:				"Сообщение добавлено в блокнот.",
					toast_noteremove_text:			"Сообщение удалено из записной книжки."
				};
			case "uk":		//ukrainian
				return {
					popout_note_text:				"Замітки",
					popout_channel_text:			"Канал",
					popout_server_text:				"Сервер",
					popout_allservers_text:			"Всі сервери",
					popout_sort_text:				"Сортувати за",
					popout_messagesort_text:		"Повідомлення-дата",
					popout_datesort_text:			"Примітка-дата",
					popout_jump_text:				"Плиг",
					popout_copy_text:				"Копіювати",
					context_noteoption_text:		"Зверніть увагу на повідомлення",
					popout_noteoption_text:			"Занотуйте",
					toast_noteadd_text:				"Повідомлення додається до ноутбука.",
					toast_noteremove_text:			"Повідомлення видалено з ноутбука."
				};
			case "ja":		//japanese
				return {
					popout_note_text:				"ノート",
					popout_channel_text:			"チャネル",
					popout_server_text:				"サーバ",
					popout_allservers_text:			"すべてのサーバー",
					popout_sort_text:				"並び替え",
					popout_messagesort_text:		"メッセージ-日付",
					popout_datesort_text:			"注-日付",
					popout_jump_text:				"ジャンプ",
					popout_copy_text:				"写す",
					context_noteoption_text:		"ノートダウンメッセージ",
					popout_noteoption_text:			"書き留める",
					toast_noteadd_text:				"ノートブックにメッセージが追加されました.",
					toast_noteremove_text:			"ノートブックからメッセージが削除されました."
				};
			case "zh-TW":	//chinese (traditional)
				return {
					popout_note_text:				"筆記",
					popout_channel_text:			"渠道",
					popout_server_text:				"服務器",
					popout_allservers_text:			"所有服務器",
					popout_sort_text:				"排序方式",
					popout_messagesort_text:		"消息-日期",
					popout_datesort_text:			"注-日期",
					popout_jump_text:				"跳到",
					popout_copy_text:				"複製",
					context_noteoption_text:		"記下下來的消息",
					popout_noteoption_text:			"記下",
					toast_noteadd_text:				"消息添加到筆記本.",
					toast_noteremove_text:			"消息從筆記本中刪除."
				};
			case "ko":		//korean
				return {
					popout_note_text:				"노트",
					popout_channel_text:			"채널",
					popout_server_text:				"섬기는 사람",
					popout_allservers_text:			"모든 서버",
					popout_sort_text:				"정렬 기준",
					popout_messagesort_text:		"메시지-날짜",
					popout_datesort_text:			"주-날짜",
					popout_jump_text:				"이동",
					popout_copy_text:				"베끼다",
					context_noteoption_text:		"메모 다운 메시지",
					popout_noteoption_text:			"메모하다",
					toast_noteadd_text:				"노트북에 메시지 추가됨.",
					toast_noteremove_text:			"노트에서 메시지 삭제됨."
				};
			default:		//default: english
				return {
					popout_note_text:				"Notes",
					popout_channel_text:			"Channel",
					popout_server_text:				"Server",
					popout_allservers_text:			"All Servers",
					popout_sort_text:				"Sort by",
					popout_messagesort_text:		"Message-Date",
					popout_datesort_text:			"Note-Date",
					popout_jump_text:				"Jump",
					popout_copy_text:				"Copy",
					context_noteoption_text:		"Note Message",
					popout_noteoption_text:			"Note",
					toast_noteadd_text:				"Message added to notebook.",
					toast_noteremove_text:			"Message removed from notebook."
				};
		}
	}
}
