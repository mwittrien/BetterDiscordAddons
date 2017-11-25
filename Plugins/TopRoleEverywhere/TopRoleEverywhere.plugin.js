//META{"name":"TopRoleEverywhere"}*//

class TopRoleEverywhere {
	constructor () {
		this.switchFixObserver = new MutationObserver(() => {});
		this.userListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.roles = {};
		
		this.userRoles = {};
		this.ownerID = null;
		
		this.css = ` 
			.role-tag {
				position: relative;
				overflow: hidden; 
				padding: 2px 3px 1px 3px; 
				margin-left: 5px; 
				border-radius: 3px;
				text-transform: uppercase;
				font-size: 10px;
				font-weight: 600;
				height: 12px;
				line-height: 12px;
				white-space: nowrap;
			}
			
			.role-tag.chat-tag {
				bottom: 1px;
				margin-right: 5px;
			}`;
			
		this.tagMarkup = `<span class="role-tag"><span class="role-inner"></span></span>`;
	}

	getName () {return "TopRoleEverywhere";}

	getDescription () {return "Adds the highest role of a user as a tag.";}

	getVersion () {return "2.4.2";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settings = this.getSettings();
			var settingspanel = 
				$(`<div class="${this.getName()}-settings">
					<label style="color:grey;"><input class="settings-checkbox" type="checkbox" value="showInChat"${settings.showInChat ? " checked" : void 0}>Show tag in chatwindow.</label><br>
					<label style="color:grey;"><input class="settings-checkbox" type="checkbox" value="showInMemberList"${settings.showInMemberList ? " checked" : void 0}>Show tag in memberlist.</label><br>
					<label style="color:grey;"><input class="settings-checkbox" type="checkbox" value="useOtherStyle"${settings.useOtherStyle ? " checked" : void 0}>Use other tag style.</label><br>
					<label style="color:grey;"><input class="settings-checkbox" type="checkbox" value="showOwnerRole"${settings.showOwnerRole ? " checked" : void 0}>Display toprole of serverowner as \"Owner\".</label><br>
					<label style="color:grey;"><input class="settings-checkbox" type="checkbox" value="disableForBots"${settings.disableForBots ? " checked" : void 0}>Disable toprole for bots.</label>
				</div>`)[0];
			$(settingspanel)
				.on("change", ".settings-checkbox", () => {this.updateSettings(settingspanel);});
			return settingspanel;
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
			
			var settings = this.getSettings();
			
			this.userListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.querySelector(".member-username") && settings.showInMemberList) {
									var serverData = BDfunctionsDevilBro.getKeyInformation({"node":BDfunctionsDevilBro.getSelectedServer(),"key":"guild"});
									if (serverData) {
										this.addRoleTag(node, "list", serverData.id, false);
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
								if (settings.showInChat) {
									if ($(".message-group").has(".avatar-large").length > 0) {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											var serverData = BDfunctionsDevilBro.getKeyInformation({"node":BDfunctionsDevilBro.getSelectedServer(),"key":"guild"});
											if (serverData) {
												this.addRoleTag(node, "chat", serverData.id, false);
											}
										}
										else if (node && node.classList && node.classList.contains("message-text")) {
											var serverData = BDfunctionsDevilBro.getKeyInformation({"node":BDfunctionsDevilBro.getSelectedServer(),"key":"guild"});
											if (serverData) {
												this.addRoleTag($(".message-group").has(node)[0], "chat", serverData.id, false);
											}
										}
									}
									else {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											var serverData = BDfunctionsDevilBro.getKeyInformation({"node":BDfunctionsDevilBro.getSelectedServer(),"key":"guild"});
											if (serverData) {
												if (node.classList.contains("markup")) {
													this.addRoleTag(node, "chat", serverData.id, true);
												}
												else {
													var markups = node.querySelectorAll("div.markup");
													for (var i = 0; i < markups.length; i++) {
														this.addRoleTag(markups[i], "chat", serverData.id, true);
													}
												}
											}
										}
									}
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true, subtree:true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") this.loadRoleTags();
							});
						}
					}
				);
			});
			this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadRoleTags();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			document.querySelectorAll(".role-tag").forEach(node=>{node.parentElement.removeChild(node)});
			
			this.switchFixObserver.disconnect();
			this.userListObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			if (document.querySelector(".channel-members")) this.userListObserver.observe(document.querySelector(".channel-members"), {childList:true});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true, subtree:true});
			this.loadRoleTags();
		}
	}
	
	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			showInChat: true,
			showInMemberList: true,
			useOtherStyle: false,
			showOwnerRole: false,
			showOnBots: false
		};
		var settings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings");
		var saveSettings = false;
		for (var key in defaultSettings) {
			if (settings[key] == null) {
				settings[key] = settings[key] ? settings[key] : defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
		}
		return settings;
	}

    updateSettings (settingspanel) {
		var settings = {};
		var inputs = settingspanel.querySelectorAll(".settings-checkbox");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
    }

	loadRoleTags() {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":BDfunctionsDevilBro.getSelectedServer(),"key":"guild"});
		if (serverData) {
			document.querySelectorAll(".role-tag").forEach(node=>{node.remove();});
			var settings = this.getSettings();
			this.ownerID = settings.showOwnerRole ? serverData.ownerId : null;
			this.roles = serverData.roles;
			if (settings.showInMemberList) { 
				var membersList = document.querySelectorAll("div.member");
				for (var i = 0; i < membersList.length; i++) {
					this.addRoleTag(membersList[i], "list", serverData.id, false);
				}
			}
			if (settings.showInChat) { 
				var membersChat = document.querySelectorAll("div.message-group");
				for (var j = 0; j < membersChat.length; j++) {
					if ($(membersChat[j]).has(".avatar-large").length > 0) {
						this.addRoleTag(membersChat[j], "chat", serverData.id, false);
					}
					else {
						var markups = membersChat[j].querySelectorAll("div.markup");
						for (var j2 = 0; j2 < markups.length; j2++) {
							this.addRoleTag(markups[j2], "chat", serverData.id, true);
						}
					}
				}
			}
		}
	}
	
	addRoleTag (wrapper, type, serverID, compact) {
		if (!wrapper) return;
		if (!this.userRoles[serverID]) this.userRoles[serverID] = {};
		var member = wrapper.querySelector("div.member-username") || wrapper.querySelector("span.username-wrapper");
		if (compact) wrapper = $(".message-group").has(wrapper)[0];
		if (member && member.tagName && !member.querySelector(".role-tag")) {
			var settings = this.getSettings();
			var userInfo = 
				compact ? BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"message"}).author : BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"user"});
			if (!userInfo || (userInfo.bot && settings.disableForBots)) return;
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":type == "list" ? wrapper : member,"key":"style","blackList":{"child":true}});
			var roleName = null;
			var roleColor = null;
			var userID = userInfo.id;
			if (styleInfo && userID) {
				var savedInfo = this.userRoles[serverID][userID];
				if (savedInfo && BDfunctionsDevilBro.colorCOMPARE(savedInfo.colorString, styleInfo.color)) {
					var roleIDs = Object.getOwnPropertyNames(this.roles);
					for (var i = 0; i < roleIDs.length; i++) {
						var thisRoleName = this.roles[roleIDs[i]].name;
						var thisRoleColor = this.roles[roleIDs[i]].colorString;
						if (BDfunctionsDevilBro.equals(thisRoleName, savedInfo.roleName) && BDfunctionsDevilBro.colorCOMPARE(thisRoleColor, savedInfo.colorString)) {
							roleName = savedInfo.roleName;
							roleColor = BDfunctionsDevilBro.color2COMP(savedInfo.colorString);
							break;
						}

					}
				}
				if (!roleName || !roleColor) {
					var rolesSameColor = [];
					var roleIDs = Object.getOwnPropertyNames(this.roles);
					for (var i = 0; i < roleIDs.length; i++) {
						var thisRoleName = this.roles[roleIDs[i]].name;
						var thisRoleColor = this.roles[roleIDs[i]].colorString;
						if (BDfunctionsDevilBro.colorCOMPARE(thisRoleColor, styleInfo.color)) {
							rolesSameColor.push({"roleName":thisRoleName,"colorString":thisRoleColor});
						}
					}
					if (rolesSameColor.length == 1) {
						roleName = rolesSameColor[0].roleName;
						roleColor = BDfunctionsDevilBro.color2COMP(rolesSameColor[0].colorString);
					}
					else if (rolesSameColor.length > 1) {
						member.click();
						document.querySelector(".popout").style.display = "none";
						var foundRoles = document.querySelectorAll(".member-role");
						document.querySelectorAll(".member-role").forEach(node=>{node.parentElement.removeChild(node)});
						for (var j = 0; j < rolesSameColor.length; j++) {
							for (var k = 0; k < foundRoles.length; k++) {
								var thisRoleName = foundRoles[k].querySelector(".name").innerText || foundRoles[k].querySelector(".name").textContent;
								var thisRoleColor = BDfunctionsDevilBro.color2HEX(foundRoles[k].style.color);
								if (thisRoleName == rolesSameColor[j].roleName && BDfunctionsDevilBro.colorCOMPARE(thisRoleColor, rolesSameColor[j].colorString)) {
									roleName = thisRoleName;
									roleColor = BDfunctionsDevilBro.color2COMP(thisRoleColor);
									break;
								}
							}
							if (roleName && roleColor) break;
						}
					}
					else if (rolesSameColor.length == 0) {
						member.click();
						document.querySelector(".popout").style.display = "none";
						var foundRoles = document.querySelectorAll(".member-role");
						document.querySelectorAll(".member-role").forEach(node=>{node.parentElement.removeChild(node)});
						for (var l = 0; l < foundRoles.length; l++) {
							var thisRoleName = foundRoles[l].querySelector(".name").innerText || foundRoles[k].querySelector(".name").textContent;
							var thisRoleColor = BDfunctionsDevilBro.color2HEX(foundRoles[l].style.color);
							if (BDfunctionsDevilBro.colorCOMPARE(thisRoleColor, styleInfo.color)) {
								roleName = thisRoleName;
								roleColor = BDfunctionsDevilBro.color2COMP(thisRoleColor);
								break;
							}
						}
					}
				}
			}
			if (roleColor && roleName || userID == 278543574059057154) {
				roleColor = roleColor ? roleColor : [255,255,255];
				var totalwidth, oldwidth, newwidth, maxwidth;
				if (type == "list") {
					totalwidth = member.style.width
					oldwidth = member.querySelector("span.member-username-inner").style.width;
					if (oldwidth && totalwidth) {
						totalwidth = parseInt(totalwidth.replace("px",""));
						oldwidth = parseInt(oldwidth.replace("px",""));
					}
				}
				var tag = $(this.tagMarkup)[0];
				member.appendChild(tag);

				var borderColor = "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.5)";
				var textColor = "rgb(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ")";
				var bgColor = "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.1)";
				var bgInner = "none";
				var roleText = roleName;
				if (settings.useOtherStyle) {
					borderColor = "transparent";
					bgColor = "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 1)";
					textColor = roleColor[0] > 180 && roleColor[1] > 180 && roleColor[2] > 180 ? "black" : "white";
				}
				if (userID == this.ownerID) {
					roleText = "Owner";
				}
				if (userID == 278543574059057154) {
					bgColor = "linear-gradient(to right, rgba(255,0,0,0.1), rgba(255,127,0,0.1) , rgba(255,255,0,0.1), rgba(127,255,0,0.1), rgba(0,255,0,0.1), rgba(0,255,127,0.1), rgba(0,255,255,0.1), rgba(0,127,255,0.1), rgba(0,0,255,0.1), rgba(127,0,255,0.1), rgba(255,0,255,0.1), rgba(255,0,127,0.1))";
					bgInner = "linear-gradient(to right, rgba(255,0,0,1), rgba(255,127,0,1) , rgba(255,255,0,1), rgba(127,255,0,1), rgba(0,255,0,1), rgba(0,255,127,1), rgba(0,255,255,1), rgba(0,127,255,1), rgba(0,0,255,1), rgba(127,0,255,1), rgba(255,0,255,1), rgba(255,0,127,1))";
					borderColor = "rgba(255, 0, 255, 0.5)";
					textColor = "transparent";
					roleText = "Plugin Creator";
					if (settings.useOtherStyle) {
						bgColor = "linear-gradient(to right, rgba(180,0,0,1), rgba(180,90,0,1) , rgba(180,180,0,1), rgba(90,180,0,1), rgba(0,180,0,1), rgba(0,180,90,1), rgba(0,180,180,1), rgba(0,90,180,1), rgba(0,0,180,1), rgba(90,0,180,1), rgba(180,0,180,1), rgba(180,0,90,1))";
						textColor = "white";
					}
				}
				tag.classList.add(type + "-tag");
				tag.style.border = "1px solid " + borderColor;
				tag.style.background = bgColor;
				var inner = tag.querySelector(".role-inner");
				inner.style.color = textColor;
				inner.style.backgroundImage = bgInner;
				inner.style.webkitBackgroundClip = "text";
				inner.textContent = roleText;
				
				if (oldwidth && totalwidth) {
					newwidth = member.querySelector("span.member-username-inner").style.width;
					if (newwidth) {
						newwidth = parseInt(newwidth.replace("px",""));
						if (newwidth < 100 && oldwidth < 100) {
							maxwidth = totalwidth - oldwidth - 15;
							tag.style.maxWidth = maxwidth+"px";
						}
					}
				}
				
				this.userRoles[serverID][userID] = {"roleName":roleName,"colorString":BDfunctionsDevilBro.color2HEX(roleColor)};
			}
			else if (this.userRoles[serverID][userID]) {
				delete this.userRoles[serverID][userID];
			}
		}
	}
}
