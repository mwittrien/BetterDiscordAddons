//META{"name":"TopRoleEverywhere"}*//

class TopRoleEverywhere {
	constructor () {
		this.serverSwitchObserver = new MutationObserver(() => {});
		this.channelSwitchObserver = new MutationObserver(() => {});
		this.userListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.roles = {};
		
		this.css = ` 
			.role-tag {
				position: relative;
				overflow: hidden; 
				padding: 1px 2px 1px 2px; 
				margin-left: 5px; 
				height: 13px;
				max-width: 50px; 
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

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		return `
		<input type="checkbox" onchange='` + this.getName() + `.updateSettings(this.parentNode, "` + this.getName() + `")' value="showInChat"${(this.getSettings().showInChat ? " checked" : void 0)}><label style="color:grey;"> Show tag in chat window.</label><br>\n
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
								var user = $(node).find(".member-username")[0];
								if (user && this.getSettings().showInMemberList) {
									this.addRoleTag(user, "list");
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
									this.addRoleTag(user, "chat");
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
				var membersList = $("div.member-username");
				for (var j = 0; j < membersList.length; j++) {
					this.addRoleTag(membersList[j], "list");
				}
			}
			else {$(".role-tag.list-tag").remove();}
			if (this.getSettings().showInChat) { 
				var membersChat = $("span.username-wrapper");
				for (var i = 0; i < membersChat.length; i++) {
					this.addRoleTag(membersChat[i], "chat");
				}
			}
			else {$(".role-tag.chat-tag").remove();}
		}
	}
	
	addRoleTag(member, type) {
		if ($(member).find(".role-tag").length == 0) {
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":member,"key":"style"});
			
			if (styleInfo != null) {
				for (var roleID in this.roles) {
					if (this.roles[roleID].colorString == styleInfo.color) {
						var color = BDfunctionsDevilBro.color2COMP(styleInfo.color);
						
						var tag = $(this.tagMarkup)
							.addClass(type + "-tag")
							.css("color", "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")")
							.css("background-color", "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.0980392)")
							.css("border", "1px solid rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.498039)")
							.text(this.roles[roleID].name);
						$(member).append(tag);
						if (member.className == "username-wrapper") $(tag).css("bottom","1px");
						break;
					}
				}
			}
		}
	}
}
