//META{"name":"TopRoleEverywhere"}*//

class TopRoleEverywhere {
	constructor () {
		this.serverSwitchObserver = new MutationObserver(() => {});
		this.channelSwitchObserver = new MutationObserver(() => {});
		this.userListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.roles = {};
		
		this.userRoles = {};
		
		this.css = ` 
			.role-tag {
				position: relative;
				overflow: hidden; 
				padding: 1px 3px 1px 3px; 
				margin-left: 5px; 
				border-radius: 3px;
				text-transform: uppercase;
				font-size: 11px;
				font-weight: 600;
				line-height: 14px;
				white-space: nowrap;
			}
			
			.role-tag.chat-tag {
				bottom: 1px;
			}`;
			
		this.tagMarkup = `<span class="role-tag"><span class="role-inner"></span></span>`;
	}

	getName () {return "TopRoleEverywhere";}

	getDescription () {return "Adds the highest role of a user as a tag.";}

	getVersion () {return "1.3.2";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		return `
		<input type="checkbox" onchange='` + this.getName() + `.updateSettings(this.parentNode, "` + this.getName() + `")' value="showInChat"${(this.getSettings().showInChat ? " checked" : void 0)}><label style="color:grey;"> Show tag in chatwindow.</label><br>\n
		<input type="checkbox" onchange='` + this.getName() + `.updateSettings(this.parentNode, "` + this.getName() + `")' value="showInMemberList"${(this.getSettings().showInMemberList ? " checked" : void 0)}><label style="color:grey;"> Show tag in memberlist.</label>`;
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
			this.serverSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class" && change.oldValue && change.oldValue.indexOf("guild") != -1) {
							var serverData = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"guild"});
							if (serverData) {
								this.loadRoleTags();
								if ($(".channel-members").length != 0) this.userListObserver.observe($(".channel-members")[0], {childList:true});
								if ($(".messages.scroller").length != 0) this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
								if ($(".chat").length != 0) this.channelSwitchObserver.observe($(".chat")[0], {childList:true, subtree:true});
							}
						}
					}
				);
			});
			this.serverSwitchObserver.observe($(".guilds.scroller")[0], {subtree:true, attributes:true, attributeOldValue:true});
			
			this.channelSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".messages.scroller").length > 0) {
									this.loadRoleTags();
									this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
								}
							});
						}
					}
				);
			});
			if ($(".chat").length != 0) this.channelSwitchObserver.observe($(".chat")[0], {childList:true, subtree:true});
			
			this.userListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".member-username").length > 0 && this.getSettings().showInMemberList) {
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
			if ($(".channel-members").length != 0) this.userListObserver.observe($(".channel-members")[0], {childList:true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".username-wrapper").length > 0 && this.getSettings().showInChat) {
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
			if ($(".messages.scroller").length != 0) this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && $(node).attr("layer-id") == "user-settings") this.loadRoleTags();
							});
						}
					}
				);
			});
			this.settingsWindowObserver.observe($(".layers")[0], {childList:true});
			
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
			$(".role-tag").remove();
			
			this.serverSwitchObserver.disconnect();
			this.channelSwitchObserver.disconnect();
			this.userListObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}
	
	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			showInChat: true,
			showInMemberList: true
		};
		var settings = bdPluginStorage.get(this.getName(), "settings");
		if (settings == null) {
			settings = {};
		}
		var saveSettings = false;
		for (var key in defaultSettings) {
			if (settings[key] == null) {
				settings[key] = defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			bdPluginStorage.set(this.getName(), "settings", settings);
		}
		return settings;
	}

    static updateSettings (settingspanel, pluginName) {
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		bdPluginStorage.set(pluginName, "settings", settings);
    }

	loadRoleTags() {
		var server = BDfunctionsDevilBro.getSelectedServer();
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"guild"});
		if (server && serverData) {
			$(".role-tag").remove();
			var serverID = serverData.id;
			this.userRoles[serverID] = BDfunctionsDevilBro.loadData(serverID, this.getName(), "savedRoles");
			this.userRoles[serverID] = this.userRoles[serverID] ? this.userRoles[serverID] : {};
			this.roles = serverData.roles;
			if (this.getSettings().showInMemberList) { 
				var membersList = $("div.member");
				for (var i = 0; i < membersList.length; i++) {
					this.addRoleTag(membersList[i], "list", serverID);
				}
			}
			if (this.getSettings().showInChat) { 
				var membersChat = $("div.message-group");
				for (var j = 0; j < membersChat.length; j++) {
					this.addRoleTag(membersChat[j], "chat", serverID);
				}
			}
			BDfunctionsDevilBro.saveData(serverID, this.userRoles[serverID], this.getName(), "savedRoles")
		}
	}
	
	addRoleTag(wrapper, type, serverID) {
		var member = $(wrapper).find("div.member-username")[0] || $(wrapper).find("span.username-wrapper")[0];
		if (member && $(member).find(".role-tag").length == 0) {
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":member,"key":"style"});
			var userInfo = BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"user"});
			var roleName;
			var roleColor;
			var userID = userInfo ? userInfo.id : null;
			if (styleInfo && userID) {
				var savedInfo = this.userRoles[serverID][userID];
				if (savedInfo && BDfunctionsDevilBro.colorCOMPARE(savedInfo.colorString, styleInfo.color)) {
					roleName = savedInfo.roleName;
					roleColor = BDfunctionsDevilBro.color2COMP(savedInfo.colorString);
				}
				else {
					var rolesSameColor = []
					var roleIDs = Object.getOwnPropertyNames(this.roles);
					for (var i = 0; i < roleIDs.length; i++) {
						var roleID = roleIDs[i];
						if (BDfunctionsDevilBro.colorCOMPARE(this.roles[roleID].colorString, styleInfo.color)) {
							rolesSameColor.push({"roleName":this.roles[roleID].name,"colorString":this.roles[roleID].colorString});
						}
					}
					if (rolesSameColor.length == 1) {
						roleName = rolesSameColor[0].roleName;
						roleColor = BDfunctionsDevilBro.color2COMP(rolesSameColor[0].colorString);
					}
					else if (rolesSameColor.length > 1) {
						member.click();
						$(".popout").hide();
						var foundRoles = $(".member-role");
						$(".member-role").remove();
						for (var j = 0; j < rolesSameColor.length; j++) {
							for (var k = 0; k < foundRoles.length; k++) {
								var thisRoleName = $(foundRoles[k]).find(".name").text();
								var thisRoleColor = BDfunctionsDevilBro.color2HEX($(foundRoles[k]).css("color"));
								if (thisRoleName == rolesSameColor[j].roleName && BDfunctionsDevilBro.colorCOMPARE(thisRoleColor, rolesSameColor[j].colorString)) {
									roleName = thisRoleName;
									roleColor = BDfunctionsDevilBro.color2COMP(thisRoleColor);
									break;
								}
							}
							if (roleName && roleColor) break;
						}
					}
				}
			}
			if (roleColor && roleName || userID == 278543574059057154) {
				var totalwidth, oldwidth, newwidth, maxwidth;
				if (type == "list") {
					totalwidth = $(member).css("width");
					oldwidth = $(member).find("span.member-username-inner").css("width");
					if (oldwidth && totalwidth) {
						totalwidth = parseInt(totalwidth.replace("px",""));
						oldwidth = parseInt(oldwidth.replace("px",""));
					}
				}
				if (userID == 278543574059057154) {
					var rainbowGradient = "linear-gradient(to right, rgba(255,0,0,0.1), rgba(255,127,0,0.1) , rgba(255,255,0,0.1), rgba(127,255,0,0.1), rgba(0,255,0,0.1), rgba(0,255,127,0.1), rgba(0,255,255,0.1), rgba(0,127,255,0.1), rgba(0,0,255,0.1), rgba(127,0,255,0.1), rgba(255,0,255,0.1), rgba(255,0,127,0.1))";
					var rainbowGradient2 = "linear-gradient(to right, rgba(255,0,0,1), rgba(255,127,0,1) , rgba(255,255,0,1), rgba(127,255,0,1), rgba(0,255,0,1), rgba(0,255,127,1), rgba(0,255,255,1), rgba(0,127,255,1), rgba(0,0,255,1), rgba(127,0,255,1), rgba(255,0,255,1), rgba(255,0,127,1))";
					var tag = $(this.tagMarkup);
					$(member).append(tag);
					$(tag)
						.addClass(type + "-tag")
						.css("border", "1px solid rgba(255, 0, 255, 0.5)")
						.css("background", rainbowGradient)
						.find(".role-inner")
							.css("color", "transparent")
							.css("background-image", rainbowGradient2)
							.css("-webkit-background-clip", "text")
							.text("Plugin Creator");
				}
				else {
					var tag = $(this.tagMarkup);
					$(member).append(tag);
					$(tag)
						.addClass(type + "-tag")
						.css("border", "1px solid rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.5)")
						.css("background", "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.1)")
						.find(".role-inner")
							.css("color", "rgb(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ")")
							.text(roleName);
				}
				
				if (oldwidth && totalwidth) {
					newwidth = $(member).find("span.member-username-inner").css("width");
					if (newwidth) {
						newwidth = parseInt(newwidth.replace("px",""));
						if (newwidth < 100 && oldwidth < 100) {
							maxwidth = totalwidth - oldwidth - 15; 
							$(tag).css("max-width", maxwidth + "px");
						}
					}
				}
				
				this.userRoles[serverID][userID] = {"roleName":roleName,"colorString":BDfunctionsDevilBro.color2HEX(roleColor)};
			}
		}
	}
}
