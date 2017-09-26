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
				padding: 1px 2px 1px 2px; 
				margin-left: 5px; 
				height: 13px;
				border-radius: 3px;
				text-transform: uppercase;
				font-size: 12px;
				font-weight: 500;
				line-height: 14px;
				white-space: nowrap;
			}`;
			
		this.tagMarkup = `<span class="role-tag"></span>`;
	}

	getName () {return "TopRoleEverywhere";}

	getDescription () {return "Adds the highest role of a user as a tag.";}

	getVersion () {return "1.2.0";}

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
								this.userRoles = {};
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
								var user = $(node).find(".member-username")[0];
								if (user && this.getSettings().showInMemberList) {
									this.addRoleTag(node, "list");
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
								var user = $(node).find(".username-wrapper")[0];
								if (user && this.getSettings().showInChat) {
									this.addRoleTag(node, "chat");
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
		if (server) {
			this.roles = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"guild"}).roles;
			if (this.getSettings().showInMemberList) { 
				var membersList = $("div.member");
				for (var i = 0; i < membersList.length; i++) {
					this.addRoleTag(membersList[i], "list");
				}
			}
			else {$(".role-tag.list-tag").remove();}
			if (this.getSettings().showInChat) { 
				var membersChat = $("div.message-group");
				for (var j = 0; j < membersChat.length; j++) {
					this.addRoleTag(membersChat[j], "chat");
				}
			}
			else {$(".role-tag.chat-tag").remove();}
			
		}
	}
	
	addRoleTag(wrapper, type) {
		var member = $(wrapper).find("div.member-username")[0] || $(wrapper).find("span.username-wrapper")[0];
		if ($(member).find(".role-tag").length == 0) {
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":member,"key":"style"});
			var userInfo = BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"user"});
			var roleName;
			var roleColor;
			if (styleInfo && userInfo) {
				var userID = userInfo.id;
				if (this.userRoles[userID] && BDfunctionsDevilBro.colorCOMPARE(this.userRoles[userID].colorString, styleInfo.color)) {
					roleName = this.userRoles[userID].roleName;
					roleColor = BDfunctionsDevilBro.color2COMP(this.userRoles[userID].colorString);
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
					console.log(member);
					console.log(rolesSameColor);
					if (rolesSameColor.length == 1) {
						roleName = rolesSameColor[0].roleName;
						roleColor = BDfunctionsDevilBro.color2COMP(rolesSameColor[0].colorString);
					}
					else if (rolesSameColor.length > 1) {
						member.click();
						$(".popout").hide();
						var userRoles = $(".member-role");
						$(".member-role").remove();
						console.log(userRoles);
						for (var j = 0; j < rolesSameColor.length; j++) {
							for (var k = 0; k < userRoles.length; k++) {
								var thisRoleName = $(userRoles[k]).find(".name").text();
								var thisRoleColor = BDfunctionsDevilBro.color2HEX($(userRoles[k]).css("color"));
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
				console.log(roleColor);
				console.log(roleName);
				console.log("__________");
				if (roleColor && roleName) {
					var width = $(member).find(".member-username-inner").css("width") ? $(member).find(".member-username-inner").css("width").replace("px","")*(4/5) + "px" : "";
					$(member).find(".member-username-inner").css("min-width",width);
					this.userRoles[userID] = {"roleName":roleName,"colorString":BDfunctionsDevilBro.color2HEX(roleColor)};
					var tag = $(this.tagMarkup)
						.addClass(type + "-tag")
						.css("color", "rgb(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ")")
						.css("background-color", "rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.0980392)")
						.css("border", "1px solid rgba(" + roleColor[0] + ", " + roleColor[1] + ", " + roleColor[2] + ", 0.498039)")
						.text(roleName);
					$(member).append(tag);
					if (member.className == "username-wrapper") $(tag).css("bottom","1px");
				}
			}
		}
	}
}
