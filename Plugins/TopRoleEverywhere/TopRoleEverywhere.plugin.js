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
			}`;
			
		this.tagMarkup = `<span class="role-tag"><span class="role-inner"></span></span>`;
	}

	getName () {return "TopRoleEverywhere";}

	getDescription () {return "Adds the highest role of a user as a tag. Does not work in compact mode.";}

	getVersion () {return "2.3.2";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="showInChat"${(this.getSettings().showInChat ? " checked" : void 0)}> Show tag in chatwindow.</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="showInMemberList"${(this.getSettings().showInMemberList ? " checked" : void 0)}> Show tag in memberlist.</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="useOtherStyle"${(this.getSettings().useOtherStyle ? " checked" : void 0)}> Use other tag style.</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="showOwnerRole"${(this.getSettings().showOwnerRole ? " checked" : void 0)}> Display toprole of serverowner as \"Owner\".</label>`;
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
			this.userListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.querySelector(".member-username") && this.getSettings().showInMemberList) {
									var server = BDfunctionsDevilBro.getSelectedServer();
									var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"guild"});
									if (server && serverData) {
										var serverID = serverData.id;
										this.addRoleTag(node, "list", serverID);
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
								if (node && node.tagName && node.querySelector(".username-wrapper") && this.getSettings().showInChat) {
									var server = BDfunctionsDevilBro.getSelectedServer();
									var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"guild"});
									if (server && serverData) {
										var serverID = serverData.id;
										this.addRoleTag(node, "chat", serverID);
									}
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node.tagName && node.getAttribute("layer-id") == "user-settings") this.loadRoleTags();
							});
						}
					}
				);
			});
			this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadRoleTags();
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
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
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.loadRoleTags();
			if (document.querySelector(".channel-members")) this.userListObserver.observe(document.querySelector(".channel-members"), {childList:true});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
		}
	}
	
	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			showInChat: true,
			showInMemberList: true,
			useOtherStyle: false,
			showOwnerRole: false
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

    static updateSettings (ele, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, pluginName, "settings");
    }

	loadRoleTags() {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":BDfunctionsDevilBro.getSelectedServer(),"key":"guild"});
		if (serverData) {
			document.querySelectorAll(".role-tag").forEach(node=>{node.parentElement.removeChild(node)});
			if (!this.userRoles[serverData.id]) this.userRoles[serverData.id] = {};
			if (this.getSettings().showOwnerRole) this.ownerID = serverData.ownerId;
			this.roles = serverData.roles;
			if (this.getSettings().showInMemberList) { 
				var membersList = document.querySelectorAll("div.member");
				for (var i = 0; i < membersList.length; i++) {
					this.addRoleTag(membersList[i], "list", serverData.id);
				}
			}
			if (this.getSettings().showInChat) { 
				var membersChat = document.querySelectorAll("div.message-group");
				for (var j = 0; j < membersChat.length; j++) {
					this.addRoleTag(membersChat[j], "chat", serverData.id);
				}
			}
		}
	}
	
	addRoleTag(wrapper, type, serverID) {
		if (!wrapper) return;
		var member = wrapper.querySelector("div.member-username") || wrapper.querySelector("span.username-wrapper");
		if (member && member.tagName && !member.querySelector(".role-tag")) {
			var settings = this.getSettings();
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":member,"key":"style"});
			var userInfo = BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"user"});
			var roleName = null;
			var roleColor = null;
			var userID = userInfo ? userInfo.id : null;
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
				if (this.getSettings().useOtherStyle) {
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
					if (this.getSettings().useOtherStyle) {
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
