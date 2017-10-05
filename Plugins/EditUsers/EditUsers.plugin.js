//META{"name":"EditUsers"}*//

class EditUsers {
	constructor () {
		
		this.labels = {};
		
		this.nickNames = {};
    
		this.userContextObserver = new MutationObserver(() => {});
		this.serverSwitchObserver = new MutationObserver(() => {});
		this.channelSwitchObserver = new MutationObserver(() => {});
		this.userListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		
		this.urlCheckTimeout;
		this.urlCheckRequest;
		
		this.css = `
			.editusers-modal .pick-wrap {
				position: relative;
				padding: 0;
				margin: 0;
			}

			.editusers-modal .pick-wrap .color-picker-popout {
				position: absolute;
			}

			.editusers-modal [class^="swatches"],
			.editusers-modal .inputs {
				width: 430px;
				margin: auto;
			}

			.editusers-modal [class^="ui-color-picker-swatch"] {
				width: 22px;
				height: 22px;
				margin-bottom: 5px;
				margin-top: 5px;
				border: 4px solid transparent;
				border-radius: 12px;
			}

			.editusers-modal [class^="ui-color-picker-swatch"].large {
				min-width: 62px;
				height: 62px;
				border-radius: 25px;
			}

			.editusers-modal [class^="ui-color-picker-swatch"].nocolor {
				cursor: default;
				line-height: 22px;
				color: red;
				font-size: 28px;
				font-weight: bold;
				border: 4px solid red;
			}
			
			.editusers-modal .color-picker-dropper {
				position: relative;
				left: 40px;
				top: 10px;
			}
			
			.editusers-modal .modal {
				align-content: space-around;
				align-items: center;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-height: initial;
				max-height: initial;
				opacity: 0;
				pointer-events: none;
				user-select: none;
				height: 100%;
				width: 100%;
				margin: 0;
				padding: 0;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				z-index: 1000;
			}
			
			.editusers-modal .form {
				width: 100%;
			}

			.editusers-modal .form-header, .editusers-modal .form-actions {
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				padding: 20px;
				
			}

			.editusers-modal .form-header {
				color: #f6f6f7;
				cursor: default;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .3px;
				line-height: 20px;
				text-transform: uppercase;
			}

			.editusers-modal .form-actions {
				display: flex;
				flex-direction: row-reverse;
				flex-wrap: nowrap;
				flex: 0 0 auto;
				padding-right: 32px;
			}

			.editusers-modal .form-inner{
				margin: 10px 0;
				overflow-x: hidden;
				overflow-y: hidden;
				padding: 0 20px;
				height: 350px;
				
			}

			.editusers-modal .modal-inner {
				background-color: #36393E;
				border-radius: 5px;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
				display: flex;
				min-height: 200px;
				pointer-events: auto;
				width: 500px;
			}

			.editusers-modal input {
				color: #f6f6f7;
				background-color: rgba(0,0,0,.1);
				border-color: rgba(0,0,0,.3);
				padding: 10px;
				height: 40px;
				box-sizing: border-box;
				width: 90%;
				margin: 0 5% 10px 5%;
				border-width: 1px;
				border-style: solid;
				border-radius: 3px;
				outline: none;
				transition: background-color .15s ease,border .15s ease;
			}

			.editusers-modal input.valid {
				background-color: rgba(10,167,0,.5);
			}

			.editusers-modal input.invalid {
				background-color: rgba(208,0,0,.5);
			}

			.editusers-modal input:disabled {
				color: #a6a6a7;
				cursor: no-drop;
				background-color: rgba(0,0,0,.5);
			}

			.editusers-modal input[type="checkbox"] {
				margin: 0px 0px 0px 11px;
				width: 10%;
				height: 20px;
			}

			.editusers-modal .checkbox {
				display: inline;
			}

			.editusers-modal .checkboxlabel {
				position: relative;
				top: -6px;
				display: inline;
			}

			.editusers-modal .btn {
				align-items: center;
				background: none;
				border-radius: 3px;
				border: none;
				box-sizing: border-box;
				display: flex;
				font-size: 14px;
				font-weight: 500;
				justify-content: center;
				line-height: 16px;
				min-height: 38px;
				min-width: 96px;
				padding: 2px 16px;
				position: relative;
			}

			.editusers-modal .btn-cancel {
				background-color: #2f3136;
				color: #fff;
			}

			.editusers-modal .btn-save {
				background-color: #3A71C1;
				color: #fff;
			}

			.editusers-modal .control-group label,
			.editusers-modal .form-tab button {
				color: #b9bbbe;
				letter-spacing: .5px;
				text-transform: uppercase;
				flex: 1;
				cursor: default;
				font-weight: 600;
				line-height: 16px;
				font-size: 12px;
			}

			.editusers-modal .control-group {
				margin-top: 10px;
			}
			
			.editusers-modal .form-tab {
				overflow: hidden;
				background-color: #36393E;
				position: absolute;
				z-index: 20px;
			}

			.editusers-modal .form-tablinks {
				background-color: inherit;
				float: left;
				border: none;
				outline: none;
				cursor: pointer;
				padding: 14px 16px;
				transition: 0.3s;
				border-radius: 5px 5px 0px 0px;
			}

			.editusers-modal .form-tablinks:hover {
				background-color: #403F47;
			}

			.editusers-modal .form-tablinks.active {
				background-color: #484B51;
			}

			.editusers-modal .form-tabcontent {
				margin-top: 40px;
				padding: 5px 0px 20px 0px;
				background-color: #484B51;
				display: none;
				border-radius: 5px 5px 5px 5px;
				position: relative;
				z-index: 10px;
			}

			.editusers-modal .form-tabcontent.open {
				display: block;
			}
			
			.user-tag {
				position: relative;
				overflow: hidden; 
				padding: 2px 3px 1px 3px; 
				margin-left: 5px; 
				border-radius: 3px;
				text-transform: uppercase;
				font-size: 10px;
				font-weight: 600;
				height: 13px;
				line-height: 13px;
				white-space: nowrap;
			}
			
			.user-tag.chat-tag {
				bottom: 1px;
			}`;
			
		this.tagMarkup = `<span class="user-tag"></span>`;

		this.userContextEntryMarkup =
			`<div class="item-group">
				<div class="item localusersettings-item item-subMenu">
					<span>REPLACE_context_localusersettings_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.userContextSubMenuMarkup = 
			`<div class="context-menu editusers-submenu">
				<div class="item-group">
					<div class="item usersettings-item">
						<span>REPLACE_submenu_usersettings_text</span>
						<div class="hint"></div>
					</div>
					<div class="item resetsettings-item">
						<span>REPLACE_submenu_resetsettings_text</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
			
		this.noticeTooltipMarkup = 
			`<div class="tooltip tooltip-right tooltip-black notice-tooltip"></div>`;

		this.userSettingsModalMarkup =
			`<span class="editusers-modal">
				<div class="callout-backdrop" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<div class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-inner">
								<div class="form-tab">
									<button class="form-tablinks active" value="tab-text">REPLACE_modal_tabheader1_text</button>
									<button class="form-tablinks" value="tab-name">REPLACE_modal_tabheader2_text</button>
									<button class="form-tablinks" value="tab-tag">REPLACE_modal_tabheader3_text</button>
								</div>
								<div class="form-tabcontent tab-text open">
									<div class="control-group">
										<div class="input-settings">
											<div class="inputs">
												<label class="modal-text-label" for="modal-nametext">REPLACE_modal_username_text</label>
												<input type="text" id="modal-nametext" name="nametext">
												<label class="modal-text-label" for="modal-tagtext">REPLACE_modal_usertag_text</label>
												<input type="text" id="modal-tagtext" name="tagtext">
												<label class="modal-text-label" for="modal-urltext">REPLACE_modal_userurl_text</label>
												<input type="text" id="modal-urltext" name="urltext">
												<div class="checkbox"><input type="checkbox" id="modal-urlcheck"></div><div class="checkboxlabel"><label class="modal-text-label" for="modal-urlcheck">REPLACE_modal_removeicon_text</label></div>
											</div>
										</div>
									</div>
								</div>
								<div class="form-tabcontent tab-name">
									<div class="control-group">
										<div class="color-picker1">
											<div class="swatches1">
												<label class="color-picker1-label">REPLACE_modal_colorpicker1_text</label>
											</div>
										</div>
									</div>
									<div class="control-group">
										<div class="color-picker2">
											<div class="swatches2">
												<label class="color-picker2-label">REPLACE_modal_colorpicker2_text</label>
											</div>
										</div>
									</div>
								</div>
								<div class="form-tabcontent tab-tag">
									<div class="control-group">
										<div class="color-picker3">
											<div class="swatches3">
												<label class="color-picker3-label">REPLACE_modal_colorpicker3_text</label>
											</div>
										</div>
									</div>
									<div class="control-group">
										<div class="color-picker4">
											<div class="swatches4">
												<label class="color-picker4-label">REPLACE_modal_colorpicker4_text</label>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="form-actions">
								<button type="button" class="btn btn-cancel">REPLACE_btn_cancel_text</button>
								<button type="button" class="btn btn-save">REPLACE_btn_save_text</button>
							</div>
						</form>
					</div>
				</div>
			</span>`;

		this.colourList = 
			['rgb(26, 188, 156)','rgb(46, 204, 113)','rgb(52, 152, 219)','rgb(155, 89, 182)','rgb(233, 30, 99)','rgb(241, 196, 15)','rgb(230, 126, 34)','rgb(231, 76, 60)','rgb(149, 165, 166)','rgb(96, 125, 139)','rgb(99, 99, 99)',
			'rgb(254, 254, 254)','rgb(17, 128, 106)','rgb(31, 139, 76)','rgb(32, 102, 148)','rgb(113, 54, 138)','rgb(173, 20, 87)','rgb(194, 124, 14)','rgb(168, 67, 0)','rgb(153, 45, 34)','rgb(151, 156, 159)','rgb(84, 110, 122)','rgb(44, 44, 44)'];
	}

	getName () {return "EditUsers";}

	getDescription () {return "Allows you to change the icon, name, tag and color of users.";}

	getVersion () {return "1.0.2";}

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
			this.userContextObserver = new MutationObserver((changes, _) => {
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
			this.userContextObserver.observe(document.querySelector(".tooltips").parentElement, {childList: true});
			
			this.serverSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class" && change.oldValue && change.oldValue.indexOf("guild") != -1) {
							var serverData = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"guild"});
							if (serverData) {
								this.loadAllUsers();
								if (document.querySelector(".channel-members")) this.userListObserver.observe(document.querySelector(".channel-members"), {childList:true});
								if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
								if (document.querySelector(".chat")) this.channelSwitchObserver.observe(document.querySelector(".chat"), {childList:true, subtree:true});
							}
						}
					}
				);
			});
			this.serverSwitchObserver.observe(document.querySelector(".guilds.scroller"), {subtree:true, attributes:true, attributeOldValue:true});
			
			this.channelSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(".messages.scroller")) {
									this.loadAllUsers();
									this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".chat")) this.channelSwitchObserver.observe(document.querySelector(".chat"), {childList:true, subtree:true});
			
			this.userListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.querySelector(".member-username")) {
									var server = BDfunctionsDevilBro.getSelectedServer();
									var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"guild"});
									if (server && serverData) {
										var serverID = serverData.id;
										this.loadUser(node, "list", serverID);
									}
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".channel-members")) this.userListObserver.observe(document.querySelector(".channel-members"), {childList:true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".username-wrapper")) {
									var server = BDfunctionsDevilBro.getSelectedServer();
									var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"guild"});
									if (server && serverData) {
										var serverID = serverData.id;
										this.loadUser(node, "chat", serverID);
									}
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
			
			BDfunctionsDevilBro.appendWebScript("https://bgrins.github.io/spectrum/spectrum.js");
			BDfunctionsDevilBro.appendWebStyle("https://bgrins.github.io/spectrum/spectrum.css");
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadAllUsers();
			
			
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.userContextObserver.disconnect();
			this.serverSwitchObserver.disconnect();
			this.channelSwitchObserver.disconnect();
			this.userListObserver.disconnect();
			this.chatWindowObserver.disconnect();
			
			document.querySelectorAll("div.member, div.message-group").forEach(node=>{node.classList.remove("custom")});
			document.querySelectorAll(".user-tag").forEach(node=>{node.parentElement.removeChild(node)});
		}
	}

	
	// begin of own functions
	

	changeLanguageStrings () {
		this.userContextEntryMarkup = 		this.userContextEntryMarkup.replace("REPLACE_context_localusersettings_text", this.labels.context_localusersettings_text);
		
		this.userContextSubMenuMarkup = 	this.userContextSubMenuMarkup.replace("REPLACE_submenu_usersettings_text", this.labels.submenu_usersettings_text);
		this.userContextSubMenuMarkup = 	this.userContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);
		
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_username_text", this.labels.modal_username_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_usertag_text", this.labels.modal_usertag_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_userurl_text", this.labels.modal_userurl_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_removeicon_text", this.labels.modal_removeicon_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	onContextMenu (context) {
		if ($(context).find(".localusersettings-item").length == 0) {
			var userData = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"user"});
			var contextType = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"UserMentionItem"});
			
			if (userData && contextType) {
				$(context).append(this.userContextEntryMarkup)
					.on("mouseenter", ".localusersettings-item", userData, this.createContextSubMenu.bind(this))
					.on("mouseleave", ".localusersettings-item", userData, this.deleteContextSubMenu.bind(this));
			}
		}
	}
	
	createContextSubMenu (e) {
		var theme = BDfunctionsDevilBro.themeIsLightTheme() ? "" : "theme-dark";
		
		var targetDiv = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
		
		var userContextSubMenu = $(this.userContextSubMenuMarkup);
		$(targetDiv).append(userContextSubMenu)
			.off("click", ".usersettings-item")
			.on("click", ".usersettings-item", e.data, this.showUserSettings.bind(this));
		$(userContextSubMenu)
			.addClass(theme)
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
			
		var info = BDfunctionsDevilBro.loadData(e.data.id, this.getName(), "users");
		if (!info) {
			$(targetDiv).find(".resetsettings-item").addClass("disabled");
		}
		else {
			$(targetDiv)
				.off("click", ".resetsettings-item")
				.on("click", ".resetsettings-item", e.data, this.resetUser.bind(this));
		}
	}
	
	deleteContextSubMenu (e) {
		$(".editusers-submenu").remove();
	}
	
	showUserSettings (e) {
		$(".context-menu").hide();
		var id = e.data.id;
		if (id) {
			var info = BDfunctionsDevilBro.loadData(id, this.getName(), "users");
			
			var name = 			info ? info.name : null;
			var tag = 			info ? info.tag : null;
			var url = 			info ? info.url : null;
			var removeIcon = 	info ? info.removeIcon : false;
			var color1 = 		info ? info.color1 : null;
			var color2 = 		info ? info.color2 : null;
			var color3 = 		info ? info.color3 : null;
			var color4 = 		info ? info.color4 : null;
			
			var userSettingsModal = $(this.userSettingsModalMarkup);
			userSettingsModal.find("#modal-nametext")[0].value = name;
			userSettingsModal.find("#modal-nametext").attr("placeholder", e.data.username);
			userSettingsModal.find("#modal-tagtext")[0].value = tag;
			userSettingsModal.find("#modal-urltext")[0].value = url;
			userSettingsModal.find("#modal-urltext").attr("placeholder", e.data.avatar ? "https://cdn.discordapp.com/avatars/" + e.data.id + "/" + e.data.avatar + ".webp" : null);
			userSettingsModal.find("#modal-urltext").addClass(url ? "valid" : "");
			userSettingsModal.find("#modal-urltext").prop("disabled", removeIcon);
			userSettingsModal.find("#modal-urlcheck")[0].checked = removeIcon;
			this.setSwatches(color1, this.colourList, userSettingsModal.find(".swatches1"), "swatch1");
			this.setSwatches(color2, this.colourList, userSettingsModal.find(".swatches2"), "swatch2");
			this.setSwatches(color3, this.colourList, userSettingsModal.find(".swatches3"), "swatch3");
			this.setSwatches(color4, this.colourList, userSettingsModal.find(".swatches4"), "swatch4");
			userSettingsModal.appendTo("#app-mount")
				.on("click", ".callout-backdrop,button.btn-cancel", (event) => {
					$(".sp-container").remove();
					userSettingsModal.remove();
				})
				.on("click", "#modal-urlcheck", (event) => {
					userSettingsModal.find("#modal-urltext").prop("disabled", event.target.checked);
				})
				.on("change keyup paste", "#modal-urltext", (event) => {
					this.checkUrl(event, userSettingsModal);
				})
				.on("mouseenter", "#modal-urltext", (event) => {
					$(event.target).addClass("hovering");
					this.createNoticeTooltip(event);
				})
				.on("mouseleave", "#modal-urltext", (event) => {
					$(event.target).removeClass("hovering");
					this.deleteNoticeToolTip(event);
				})
				.on("click", "button.form-tablinks", (event) => {
					this.changeTab(event, userSettingsModal);
				})
				.on("click", "button.btn-save", (event) => {
					event.preventDefault();
					
					name = null;
					if (userSettingsModal.find("#modal-nametext")[0].value) {
						if (userSettingsModal.find("#modal-nametext")[0].value.trim().length > 0) {
							name = userSettingsModal.find("#modal-nametext")[0].value.trim();
						}
					}
					
					tag = null;
					if (userSettingsModal.find("#modal-tagtext")[0].value) {
						if (userSettingsModal.find("#modal-tagtext")[0].value.trim().length > 0) {
							tag = userSettingsModal.find("#modal-tagtext")[0].value.trim();
						}
					}
					
					if (userSettingsModal.find("#modal-urltext:not('.invalid')")[0]) {
						url = null;
						if (!userSettingsModal.find("#modal-urlcheck")[0].checked && userSettingsModal.find("#modal-urltext")[0].value) {
							if (userSettingsModal.find("#modal-urltext")[0].value.trim().length > 0) {
								url = userSettingsModal.find("#modal-urltext")[0].value.trim();
							}
						}
					}
					
					removeIcon = userSettingsModal.find("#modal-urlcheck")[0].checked;
					
					color1 = !$(".ui-color-picker-swatch1.nocolor.selected")[0] ? BDfunctionsDevilBro.color2COMP($(".ui-color-picker-swatch1.selected").css("background-color")) : null;
					color2 = !$(".ui-color-picker-swatch2.nocolor.selected")[0] ? BDfunctionsDevilBro.color2COMP($(".ui-color-picker-swatch2.selected").css("background-color")) : null;
					color3 = !$(".ui-color-picker-swatch3.nocolor.selected")[0] ? BDfunctionsDevilBro.color2COMP($(".ui-color-picker-swatch3.selected").css("background-color")) : null;
					color4 = !$(".ui-color-picker-swatch4.nocolor.selected")[0] ? BDfunctionsDevilBro.color2COMP($(".ui-color-picker-swatch4.selected").css("background-color")) : null;
					
					if (name == null && tag == null && url == null && !removeIcon && color1 == null && color2 == null && color3 == null && color4 == null) {
						this.resetUser(e);
					}
					else {
						BDfunctionsDevilBro.saveData(id, {id,name,tag,url,removeIcon,color1,color2,color3,color4}, this.getName(), "users");
						this.loadAllUsers();
					}
					
					$(".sp-container").remove();
					userSettingsModal.remove();
				});
			userSettingsModal.find("#modal-nametext")[0].focus();
		}
	}
	
	changeTab (e, modal) {
		var tab = e.target.value;

		$(".form-tabcontent.open",modal)
			.removeClass("open");
			
		$(".form-tablinks.active",modal)
			.removeClass("active");
			
		$(".form-tabcontent." + tab ,modal)
			.addClass("open");
			
		$(e.target)
			.addClass("active");
	}
	
	checkUrl (e, modal) {
		clearTimeout(this.urlCheckTimeout);
		this.urlCheckRequest.abort();
		if (!e.target.value) {
			$(e.target)
				.removeClass("valid")
				.removeClass("invalid");
			if ($(e.target).hasClass("hovering")) this.deleteNoticeToolTip(e);
		}
		else {
			this.urlCheckTimeout = setTimeout(() => {
				this.urlCheckRequest = $.ajax({
					type: "HEAD",
					url : "https://cors-anywhere.herokuapp.com/" + e.target.value,
					success: (message, text, response) => {
						if (response.getResponseHeader('Content-Type').indexOf("image") != -1) {
							$(e.target)
								.removeClass("invalid")
								.addClass("valid");
						}
						else {
							$(e.target)
								.removeClass("valid")
								.addClass("invalid");
						}
					},
					error: () => {
						$(e.target)
							.removeClass("valid")
							.addClass("invalid");
					},
					complete: () => {
						if ($(e.target).hasClass("hovering")) this.createNoticeTooltip(e);
					}
				});
			},500);
		}
	}
	
	createNoticeTooltip (e) {
		BDfunctionsDevilBro.removeLocalStyle("customeNoticeTooltipCSS");
		$(".tooltips").find(".notice-tooltip").remove();
		
		var input = e.target;
		var disabled = $(input).prop("disabled");
		var valid = $(input).hasClass("valid");
		var invalid = $(input).hasClass("invalid");
		if (disabled || valid || invalid) {
			var bgColor = disabled ? "#282524" : valid ? "#297828" : "#8C2528";
			var noticeTooltip = $(this.noticeTooltipMarkup);
			$(".tooltips").append(noticeTooltip);
			$(noticeTooltip)
				.text(disabled ? "Ignore imageurl" : valid ? "Valid imageurl" : "Invalid imageurl")
				.css("background-color", bgColor)
				.css("left", ($(input).offset().left + $(input).width() + parseInt($(input).css("marginLeft"), 10)) + "px")
				.css("top", ($(input).offset().top + ($(input).outerHeight() - $(noticeTooltip).outerHeight())/2) + "px");
				
			var customeTooltipCSS = `
				.notice-tooltip:after {
					border-right-color: ` + bgColor + ` !important;
				}`;
				
			BDfunctionsDevilBro.appendLocalStyle("customeNoticeTooltipCSS", customeTooltipCSS);
		}
	}
	
	deleteNoticeToolTip (e) {
		BDfunctionsDevilBro.removeLocalStyle("customeNoticeTooltipCSS");
		$(".tooltips").find(".notice-tooltip").remove();
	}
	
	setSwatches (currentCOMP, colorOptions, wrapper, swatch) {
		var wrapperDiv = $(wrapper);
			
		var defaultCustomColors = {"swatch1":"rgb(0, 0, 0)","swatch2":"rgb(255, 255, 255)","swatch3":"rgb(0, 0, 0)","swatch4":"rgb(255, 255, 255)"};
		var defaultPickerColors = {"swatch1":"#ffffff","swatch2":"#000000","swatch3":"#ffffff","swatch4":"#000000"};
			
		var largeDefaultBgColor = defaultCustomColors[swatch];
		var pickerDefaultBgColor = defaultPickerColors[swatch];
			
		var swatches = 
			`<div class="ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" style="flex: 1 1 auto; margin-top: 5px;">
				<div class="ui-color-picker-${swatch} large custom" style="background-color: ${largeDefaultBgColor};"><svg class="color-picker-dropper" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path class="color-picker-dropper-fg" fill=${pickerDefaultBgColor} d="M14.994 1.006C13.858-.257 11.904-.3 10.72.89L8.637 2.975l-.696-.697-1.387 1.388 5.557 5.557 1.387-1.388-.697-.697 1.964-1.964c1.13-1.13 1.3-2.985.23-4.168zm-13.25 10.25c-.225.224-.408.48-.55.764L.02 14.37l1.39 1.39 2.35-1.174c.283-.14.54-.33.765-.55l4.808-4.808-2.776-2.776-4.813 4.803z"></path></svg></div>
				<div class="regulars ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-wrap ui-color-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;"><div class="ui-color-picker-${swatch} nocolor" style="background-color: null;">✖</div>
					${ colorOptions.map((val, i) => `<div class="ui-color-picker-${swatch}" style="background-color: ${val};"></div>`).join("")}
				</div>
			</div>`;
		$(swatches).appendTo(wrapperDiv);
		
		if (currentCOMP) {
			var currentRGB = BDfunctionsDevilBro.color2RGB(currentCOMP);
			var invRGB = BDfunctionsDevilBro.colorINV(currentRGB);
			
			var selection = colorOptions.indexOf(currentRGB);
			
			if (selection > -1) {
				wrapperDiv.find(".regulars .ui-color-picker-" + swatch).eq(selection+1)
					.addClass("selected")
					.css("background-color", currentRGB)
					.css("border", "4px solid " + invRGB);
			} 
			else {
				$(".custom", wrapperDiv)
					.addClass("selected")
					.css("background-color", currentRGB)
					.css("border", "4px solid " + invRGB);
				
				$(".color-picker-dropper-fg", wrapperDiv)
					.attr("fill", currentCOMP[0] > 150 && currentCOMP[1] > 150 && currentCOMP[2] > 150 ? "#000000" : "#ffffff");
			}
		}
		else {
			$(".nocolor", wrapperDiv)
				.addClass("selected")
				.css("border", "4px solid black");
		}
		
		wrapperDiv.on("click", ".ui-color-picker-" + swatch + ":not(.custom)", (e) => {
			var bgColor = $(e.target).css("background-color");
			var newInvRGB = BDfunctionsDevilBro.checkColorType(bgColor) ? BDfunctionsDevilBro.colorINV(bgColor,"rgb") : "black";
			
			wrapperDiv.find(".ui-color-picker-" + swatch + ".selected.nocolor")
				.removeClass("selected")
				.css("border", "4px solid red");
				
			wrapperDiv.find(".ui-color-picker-" + swatch + ".selected")
				.removeClass("selected")
				.css("border", "4px solid transparent");
			
			$(e.target)
				.addClass("selected")
				.css("border", "4px solid " + newInvRGB);
		});
		var custom = $(".ui-color-picker-" + swatch + ".custom", wrapperDiv).spectrum({
			color: $(".custom", wrapperDiv).css("background-color"),
			preferredFormat: "rgb",
			clickoutFiresChange: true,
			showInput: true,
			showButtons: false,
			move: (color) => {
				var newRGB = color.toRgbString();
				var newCOMP = BDfunctionsDevilBro.color2COMP(newRGB);
				var newInvRGB = BDfunctionsDevilBro.colorINV(newRGB);
				
				$(".ui-color-picker-" + swatch + ".selected.nocolor")
					.removeClass("selected")
					.css("border", "4px solid red");
					
				$(".ui-color-picker-" + swatch + ".selected")
					.removeClass("selected")
					.css("border", "4px solid transparent");
				
				custom
					.addClass("selected")
					.css("background-color", newRGB)
					.css("border", "4px solid " + newInvRGB);
					
				$(".color-picker-dropper-fg", wrapperDiv)
					.attr("fill", newCOMP[0] > 150 && newCOMP[1] > 150 && newCOMP[2] > 150 ? "#000000" : "#ffffff");
			}
		});
	}
	
	resetUser (e) {
		$(".context-menu").hide();
		if (e.data.id) {
			BDfunctionsDevilBro.removeData(e.data.id, this.getName(), "users");
			
			this.loadAllUsers();
		}
	}
	
	loadUser (div, type, serverID) {
		if (!div || div.classList.contains("custom")) return;
		var avatar = div.querySelector("div.avatar-small") || div.querySelector("div.avatar-large");
		var username = div.querySelector("strong.user-name") || div.querySelector("span.member-username-inner");
		var wrapper = div.querySelector("div.member-username") || div.querySelector("span.username-wrapper");
		if (avatar && username && wrapper) {
			var info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"user"});
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"style"});
			var data = BDfunctionsDevilBro.loadData(info.id, this.getName(), "users");
			
			if (!this.nickNames[serverID][info.id]) this.nickNames[serverID][info.id] = username.innerText;
			
			var name = 			this.nickNames[serverID][info.id];
			var tag = 			null;
			var bgImage = 		info.avatar ? "url('https://cdn.discordapp.com/avatars/" + info.id + "/" + info.avatar + ".webp')" : "";
			var removeIcon = 	false;
			var color1 = 		styleInfo ? BDfunctionsDevilBro.color2RGB(styleInfo.color) : "";
			var color2 = 		"";
			var color3 = 		"";
			var color4 = 		"white";
			
			if (data) {
				name = 			data.name ? data.name : name;
				tag = 			data.tag ? data.tag : tag;
				bgImage = 		data.url ? "url(" + data.url + ")" : bgImage;
				removeIcon = 	data.removeIcon ? data.removeIcon : removeIcon;
				color1 = 		data.color1 ? BDfunctionsDevilBro.color2RGB(data.color1) : color1;
				color2 = 		data.color2 ? BDfunctionsDevilBro.color2RGB(data.color2) : color2;
				color3 = 		data.color3 ? BDfunctionsDevilBro.color2RGB(data.color3) : color3;
				color4 = 		data.color4 ? BDfunctionsDevilBro.color2RGB(data.color4) : color4;
				div.classList.add("custom");
			}
			
			username.innerText = name;
			username.style.color = color1;
			username.style.background = color2;
			
			avatar.style.background = removeIcon ? "" : bgImage;
			avatar.style.backgroundSize = "cover";
				
			if (tag) {
				var thisTag = $(this.tagMarkup)[0];
				thisTag.classList.add(type+"-tag");
				thisTag.innerText = tag;
				thisTag.style.background = color3;
				thisTag.style.color = color4;
				wrapper.appendChild(thisTag);
			}
		}
	}

	loadAllUsers() {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":BDfunctionsDevilBro.getSelectedServer(),"key":"guild"});
		if (serverData) {
			document.querySelectorAll("div.member, div.message-group").forEach(node=>{node.classList.remove("custom")});
			document.querySelectorAll(".user-tag").forEach(node=>{node.parentElement.removeChild(node)});
			
			if (!this.nickNames[serverData.id]) this.nickNames[serverData.id] = {};
			
			var membersList = document.querySelectorAll("div.member");
			for (var i = 0; i < membersList.length; i++) {
				this.loadUser(membersList[i], "list", serverData.id);
			} 
			var membersChat = document.querySelectorAll("div.message-group");
			for (var j = 0; j < membersChat.length; j++) {
				this.loadUser(membersChat[j], "chat", serverData.id);
			}
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					context_localusersettings_text: 	"Lokal brugerindstillinger",
					submenu_usersettings_text: 			"Skift indstillinger",
					submenu_resetsettings_text: 		"Nulstil bruger",
					modal_header_text: 	 				"Lokal brugerindstillinger",
					modal_username_text: 				"Lokalt brugernavn",
					modal_usertag_text:			 		"Initialer",
					modal_userurl_text: 				"Ikon",
					modal_removeicon_text: 				"Fjern ikon",
					modal_tabheader1_text: 				"Bruger",
					modal_tabheader2_text: 				"Navnefarve",
					modal_tabheader3_text: 				"Etiketfarve",
					modal_colorpicker1_text: 			"Navnefarve",
					modal_colorpicker2_text: 			"Baggrundsfarve",
					modal_colorpicker3_text: 			"Etiketfarve",
					modal_colorpicker4_text: 			"Skriftfarve",
					btn_cancel_text: 					"Afbryde",
					btn_save_text: 						"Spare"
				};
			case "de": 	//german
				return {
					context_localusersettings_text: 	"Lokale Benutzereinstellungen",
					submenu_usersettings_text: 			"Ändere Einstellungen",
					submenu_resetsettings_text: 		"Benutzer zurücksetzen",
					modal_header_text: 					"Lokale Benutzereinstellungen",
					modal_username_text: 				"Lokaler Benutzername",
					modal_usertag_text:			 		"Etikett",
					modal_userurl_text: 				"Icon",
					modal_removeicon_text: 				"Entferne Icon",
					modal_tabheader1_text: 				"Benutzer",
					modal_tabheader2_text: 				"Namensfarbe",
					modal_tabheader3_text: 				"Etikettfarbe",
					modal_colorpicker1_text: 			"Namensfarbe",
					modal_colorpicker2_text: 			"Hintergrundfarbe",
					modal_colorpicker3_text: 			"Etikettfarbe",
					modal_colorpicker4_text: 			"Schriftfarbe",
					btn_cancel_text: 					"Abbrechen",
					btn_save_text: 						"Speichern"
				};
			case "es": 	//spanish
				return {
					context_localusersettings_text: 	"Ajustes local de usuario",
					submenu_usersettings_text: 			"Cambiar ajustes",
					submenu_resetsettings_text: 		"Restablecer usuario",
					modal_header_text: 					"Ajustes local de usuario",
					modal_username_text: 				"Nombre local de usuario",
					modal_usertag_text:			 		"Etiqueta",
					modal_userurl_text: 				"Icono",
					modal_removeicon_text: 				"Eliminar icono",
					modal_tabheader1_text: 				"Usuario",
					modal_tabheader2_text: 				"Color del nombre",
					modal_tabheader3_text:				"Color de la etiqueta",
					modal_colorpicker1_text: 			"Color del nombre",
					modal_colorpicker2_text: 			"Color de fondo",
					modal_colorpicker3_text: 			"Color de la etiqueta",
					modal_colorpicker4_text: 			"Color de fuente",
					btn_cancel_text: 					"Cancelar",
					btn_save_text: 						"Guardar"
				};
			case "fr": 	//french
				return {
					context_localusersettings_text: 	"Paramètres locale d'utilisateur",
					submenu_usersettings_text: 			"Modifier les paramètres",
					submenu_resetsettings_text: 		"Réinitialiser l'utilisateur",
					modal_header_text: 					"Paramètres locale d'utilisateur",
					modal_username_text: 				"Nom local d'utilisateur",
					modal_usertag_text:			 		"Étiquette",
					modal_userurl_text: 				"Icône",
					modal_removeicon_text: 				"Supprimer l'icône",
					modal_tabheader1_text: 				"Serveur",
					modal_tabheader2_text: 				"Couleur du nom",
					modal_tabheader3_text:				"Couleur de l'étiquette",
					modal_colorpicker1_text: 			"Couleur du nom",
					modal_colorpicker2_text: 			"Couleur de fond",
					modal_colorpicker3_text:			"Couleur de l'étiquette",
					modal_colorpicker4_text:			"Couleur de la police",
					btn_cancel_text: 					"Abandonner",
					btn_save_text: 						"Enregistrer"
				};
			case "it": 	//italian
				return {
					context_localusersettings_text: 	"Impostazioni locale utente",
					submenu_usersettings_text: 			"Cambia impostazioni",
					submenu_resetsettings_text: 		"Ripristina utente",
					modal_header_text: 					"Impostazioni locale utente",
					modal_username_text: 				"Nome locale utente",
					modal_usertag_text:			 		"Etichetta",
					modal_userurl_text: 				"Icona",
					modal_removeicon_text: 				"Rimuova l'icona",
					modal_tabheader1_text: 				"Utente",
					modal_tabheader2_text: 				"Colore del nome",
					modal_tabheader3_text:				"Colore della etichetta",
					modal_colorpicker1_text: 			"Colore del nome",
					modal_colorpicker2_text: 			"Colore di sfondo",
					modal_colorpicker3_text:			"Colore della etichetta",
					modal_colorpicker4_text:			"Colore del carattere",
					btn_cancel_text: 					"Cancellare",
					btn_save_text: 						"Salvare"
				};
			case "nl": 	//dutch
				return {
					context_localusersettings_text: 	"Lokale gebruikerinstellingen",
					submenu_usersettings_text: 			"Verandere instellingen",
					submenu_resetsettings_text: 		"Reset gebruiker",
					modal_header_text: 					"Lokale gebruikerinstellingen",
					modal_username_text: 				"Lokale gebruikernaam",
					modal_usertag_text:			 		"Etiket",
					modal_userurl_text: 				"Icoon",
					modal_removeicon_text: 				"Verwijder icoon",
					modal_tabheader1_text: 				"Gebruiker",
					modal_tabheader2_text: 				"Naam kleur",
					modal_tabheader3_text:				"Etiket kleur",
					modal_colorpicker1_text: 			"Naam kleur",
					modal_colorpicker2_text: 			"Achtergrond kleur",
					modal_colorpicker3_text:			"Etiket kleur",
					modal_colorpicker4_text:			"Doopvont kleur",
					btn_cancel_text: 					"Afbreken",
					btn_save_text: 						"Opslaan"
				};
			case "no": 	//norwegian
				return {
					context_localusersettings_text: 	"Lokal brukerinnstillinger",
					submenu_usersettings_text: 			"Endre innstillinger",
					submenu_resetsettings_text: 		"Tilbakestill bruker",
					modal_header_text: 					"Lokal brukerinnstillinger",
					modal_username_text: 				"Lokalt gebruikernavn",
					modal_usertag_text:			 		"Stikkord",
					modal_userurl_text: 				"Ikon",
					modal_removeicon_text: 				"Fjern ikon",
					modal_tabheader1_text: 				"Bruker",
					modal_tabheader2_text: 				"Navnfarge",
					modal_tabheader3_text:				"Stikkordfarge",
					modal_colorpicker1_text: 			"Navnfarge",
					modal_colorpicker2_text: 			"Bakgrunnfarge",
					modal_colorpicker3_text:			"Stikkordfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					btn_cancel_text: 					"Avbryte",
					btn_save_text: 						"Lagre"
				};
			case "pl": 	//polish
				return {
					context_localusersettings_text: 	"Lokalny ustawienia użytkownik",
					submenu_usersettings_text: 			"Zmień ustawienia",
					submenu_resetsettings_text: 		"Resetuj użytkownik",
					modal_header_text: 					"Lokalny ustawienia użytkownik",
					modal_username_text: 				"Lokalna nazwa użytkownik",
					modal_usertag_text:			 		"Etykietka",
					modal_userurl_text: 				"Ikony",
					modal_removeicon_text: 				"Usuń ikonę",
					modal_tabheader1_text: 				"Użytkownik",
					modal_tabheader2_text: 				"Kolor nazwa",
					modal_tabheader3_text:				"Kolor etykietka",
					modal_colorpicker1_text: 			"Kolor nazwa",
					modal_colorpicker2_text: 			"Kolor tło",
					modal_colorpicker3_text:			"Kolor etykietka",
					modal_colorpicker4_text:			"Kolor czcionki",
					btn_cancel_text: 					"Anuluj",
					btn_save_text: 						"Zapisz"
				};
			case "pt": 	//portuguese (brazil)
				return {
					context_localusersettings_text: 	"Configurações local do utilizador",
					submenu_usersettings_text: 			"Mudar configurações",
					submenu_resetsettings_text: 		"Redefinir utilizador",
					modal_header_text: 					"Configurações local do utilizador",
					modal_username_text: 				"Nome local do utilizador",
					modal_usertag_text:			 		"Etiqueta",
					modal_userurl_text: 				"Icone",
					modal_removeicon_text: 				"Remover ícone",
					modal_tabheader1_text: 				"Utilizador",
					modal_tabheader2_text: 				"Cor do nome",
					modal_tabheader3_text:				"Cor da etiqueta",
					modal_colorpicker1_text: 			"Cor do nome",
					modal_colorpicker2_text: 			"Cor do fundo",
					modal_colorpicker3_text:			"Cor da etiqueta",
					modal_colorpicker4_text:			"Cor da fonte",
					btn_cancel_text: 					"Cancelar",
					btn_save_text: 						"Salvar"
				};
			case "fi": 	//finnish
				return {
					context_localusersettings_text: 	"Paikallinen käyttäjä asetukset",
					submenu_usersettings_text: 			"Vaihda asetuksia",
					submenu_resetsettings_text: 		"Nollaa käyttäjä",
					modal_header_text: 					"Paikallinen käyttäjä asetukset",
					modal_username_text: 				"Paikallinen käyttäjätunnus",
					modal_usertag_text:			 		"Merkki",
					modal_userurl_text: 				"Ikonin",
					modal_removeicon_text: 				"Poista kuvake",
					modal_tabheader1_text: 				"Käyttäjä",
					modal_tabheader2_text: 				"Nimi väri",
					modal_tabheader3_text:				"Merkki väri",
					modal_colorpicker1_text: 			"Nimi väri",
					modal_colorpicker2_text: 			"Tausta väri",
					modal_colorpicker3_text:			"Merkki väri",
					modal_colorpicker4_text:			"Fontin väri",
					btn_cancel_text: 					"Peruuttaa",
					btn_save_text: 						"Tallentaa"
				};
			case "sv": 	//swedish
				return {
					context_localusersettings_text: 	"Lokal användareinställningar",
					submenu_usersettings_text: 			"Ändra inställningar",
					submenu_resetsettings_text: 		"Återställ användare",
					modal_header_text: 					"Lokal användareinställningar",
					modal_username_text: 				"Lokalt användarenamn",
					modal_usertag_text:			 		"Märka",
					modal_userurl_text: 				"Ikon",
					modal_removeicon_text: 				"Ta bort ikonen",
					modal_tabheader1_text: 				"Användare",
					modal_tabheader2_text: 				"Namnfärg",
					modal_tabheader3_text:				"Märkafärg",
					modal_colorpicker1_text: 			"Namnfärg",
					modal_colorpicker2_text: 			"Bakgrundfärg",
					modal_colorpicker3_text:			"Märkafärg",
					modal_colorpicker4_text:			"Fontfärg",
					btn_cancel_text: 					"Avbryta",
					btn_save_text: 						"Spara"
				};
			case "tr": 	//turkish
				return {
					context_localusersettings_text: 	"Yerel Kullanıcı Ayarları",
					submenu_usersettings_text: 			"Ayarları Değiştir",
					submenu_resetsettings_text: 		"Kullanıcı Sıfırla",
					modal_header_text: 					"Yerel Kullanıcı Ayarları",
					modal_username_text: 				"Yerel Kullanıcı Isim",
					modal_usertag_text:			 		"Etiket",
					modal_userurl_text: 				"Simge",
					modal_removeicon_text: 				"Simge kaldır",
					modal_tabheader1_text: 				"Kullanıcı",
					modal_tabheader2_text: 				"Simge rengi",
					modal_tabheader3_text:				"Isim rengi",
					modal_colorpicker1_text: 			"Simge rengi",
					modal_colorpicker2_text: 			"Arka fon rengi",
					modal_colorpicker3_text:			"Etiket rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					btn_cancel_text: 					"Iptal",
					btn_save_text: 						"Kayıt"
				};
			case "cs": 	//czech
				return {
					context_localusersettings_text: 	"Místní nastavení uživatel",
					submenu_usersettings_text: 			"Změnit nastavení",
					submenu_resetsettings_text: 		"Obnovit uživatel",
					modal_header_text: 					"Místní nastavení uživatel",
					modal_username_text: 				"Místní název uživatel",
					modal_usertag_text:			 		"Štítek",
					modal_userurl_text: 				"Ikony",
					modal_removeicon_text: 				"Odstranit ikonu",
					modal_tabheader1_text: 				"Uživatel",
					modal_tabheader2_text: 				"Barva název",
					modal_tabheader3_text:				"Barva štítek",
					modal_colorpicker1_text: 			"Barva název",
					modal_colorpicker2_text: 			"Barva pozadí",
					modal_colorpicker3_text:			"Barva štítek",
					modal_colorpicker4_text:			"Barva fontu",
					btn_cancel_text: 					"Zrušení",
					btn_save_text: 						"Uložit"
				};
			case "bg": 	//bulgarian
				return {
					context_localusersettings_text: 	"Настройки за локални потребител",
					submenu_usersettings_text: 			"Промяна на настройките",
					submenu_resetsettings_text: 		"Възстановяване на потребител",
					modal_header_text: 					"Настройки за локални потребител",
					modal_username_text: 				"Локално име на потребител",
					modal_usertag_text:			 		"Cвободен край",
					modal_userurl_text: 				"Икона",
					modal_removeicon_text: 				"Премахване на иконата",
					modal_tabheader1_text: 				"Потребител",
					modal_tabheader2_text: 				"Цвят на име",
					modal_tabheader3_text:				"Цвят на свободен край",
					modal_colorpicker1_text: 			"Цвят на име",
					modal_colorpicker2_text: 			"Цвят на заден план",
					modal_colorpicker3_text:			"Цвят на свободен край",
					modal_colorpicker4_text:			"Цвят на шрифта",
					btn_cancel_text: 					"Зъбести",
					btn_save_text: 						"Cпасяване"
				};
			case "ru": 	//russian
				return {
					context_localusersettings_text: 	"Настройки локального пользователь",
					submenu_usersettings_text: 			"Изменить настройки",
					submenu_resetsettings_text: 		"Сбросить пользователь",
					modal_header_text: 					"Настройки локального пользователь",
					modal_username_text: 				"Имя локального пользователь",
					modal_usertag_text:			 		"Tег",
					modal_userurl_text: 				"Значок",
					modal_removeicon_text: 				"Удалить значок",
					modal_tabheader1_text: 				"Пользователь",
					modal_tabheader2_text: 				"Цвет имя",
					modal_tabheader3_text:				"Цвет тег",
					modal_colorpicker1_text: 			"Цвет имя",
					modal_colorpicker2_text: 			"Цвет задний план",
					modal_colorpicker3_text:			"Цвет тег",
					modal_colorpicker4_text:			"Цвет шрифта",
					btn_cancel_text: 					"Отмена",
					btn_save_text: 						"Cпасти"
				};
			case "uk": 	//ukranian
				return {
					context_localusersettings_text: 	"Налаштування локального користувач",
					submenu_usersettings_text: 			"Змінити налаштування",
					submenu_resetsettings_text: 		"Скидання користувач",
					modal_header_text: 					"Налаштування локального користувач",
					modal_username_text: 				"Локальне ім'я користувач",
					modal_usertag_text:			 		"Tег",
					modal_userurl_text: 				"Іконка",
					modal_removeicon_text: 				"Видалити піктограму",
					modal_tabheader1_text: 				"Користувач",
					modal_tabheader2_text: 				"Колір ім'я",
					modal_tabheader3_text:				"Колір тег",
					modal_colorpicker1_text: 			"Колір ім'я",
					modal_colorpicker2_text: 			"Колір фон",
					modal_colorpicker3_text:			"Колір тег",
					modal_colorpicker4_text:			"Колір шрифту",
					btn_cancel_text: 					"Скасувати",
					btn_save_text: 						"Зберегти"
				};
			case "ja": 	//japanese
				return {
					context_localusersettings_text: 	"ローカルユーザーー設定",
					submenu_usersettings_text: 			"設定を変更する",
					submenu_resetsettings_text: 		"ユーザーーをリセットする",
					modal_header_text: 					"ローカルユーザーー設定",
					modal_username_text: 				"ローカルユーザーー名",
					modal_usertag_text:			 		"タグ",
					modal_userurl_text: 				"アイコン",
					modal_removeicon_text: 				"アイコンを削除",
					modal_tabheader1_text: 				"ユーザー",
					modal_tabheader2_text: 				"名の色",
					modal_tabheader3_text:				"タグの色",
					modal_colorpicker1_text: 			"名の色",
					modal_colorpicker2_text: 			"バックグラウンドの色",
					modal_colorpicker3_text:			"タグの色",
					modal_colorpicker4_text:			"フォントの色",
					btn_cancel_text: 					"キャンセル",
					btn_save_text: 						"セーブ"
				};
			case "zh": 	//chinese (traditional)
				return {
					context_localusersettings_text: 	"本地用戶設置",
					submenu_usersettings_text: 			"更改設置",
					submenu_resetsettings_text: 		"重置用戶",
					modal_header_text: 					"本地用戶設置",
					modal_username_text: 				"用戶名稱",
					modal_usertag_text:			 		"標籤",
					modal_userurl_text: 				"圖標",
					modal_removeicon_text: 				"刪除圖標",
					modal_tabheader1_text: 				"用戶",
					modal_tabheader2_text: 				"名稱顏色",
					modal_tabheader3_text: 				"標籤顏色",
					modal_colorpicker1_text: 			"名稱顏色",
					modal_colorpicker2_text: 			"背景顏色",
					modal_colorpicker3_text:			"標籤顏色",
					modal_colorpicker4_text:			"字體顏色",
					btn_cancel_text: 					"取消",
					btn_save_text: 						"保存"
				};
			case "ko": 	//korean
				return {
					context_localusersettings_text: 	"로컬 사용자 설정",
					submenu_usersettings_text: 			"설정 변경",
					submenu_resetsettings_text: 		"사용자 재설정",
					modal_header_text: 					"로컬 사용자 설정",
					modal_username_text: 				"로컬 사용자 이름",
					modal_usertag_text:			 		"꼬리표",
					modal_userurl_text: 				"상",
					modal_removeicon_text: 				"상 삭제",
					modal_tabheader1_text: 				"사용자",
					modal_tabheader2_text: 				"이름 색깔",
					modal_tabheader3_text:				"꼬리표 색깔",
					modal_colorpicker1_text: 			"이름 색깔",
					modal_colorpicker2_text: 			"배경 색깔",
					modal_colorpicker3_text:			"꼬리표 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					btn_cancel_text: 					"취소",
					btn_save_text: 						"저장"
				};
			default: 	//default: english
				return {
					context_localusersettings_text: 	"Local Usersettings",
					submenu_usersettings_text: 			"Change Settings",
					submenu_resetsettings_text: 		"Reset User",
					modal_header_text: 					"Local Usersettings",
					modal_username_text: 				"Local Username",
					modal_usertag_text:			 		"Tag",
					modal_userurl_text: 				"Icon",
					modal_removeicon_text: 				"Remove Icon",
					modal_tabheader1_text: 				"User",
					modal_tabheader2_text: 				"Namecolor",
					modal_tabheader3_text:				"Tagcolor",
					modal_colorpicker1_text: 			"Namecolor",
					modal_colorpicker2_text: 			"Backgroundcolor",
					modal_colorpicker3_text:			"Tagcolor",
					modal_colorpicker4_text:			"Fontcolor",
					btn_cancel_text: 					"Cancel",
					btn_save_text: 						"Save"
				};
		}
	}
}
