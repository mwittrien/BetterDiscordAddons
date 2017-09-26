//META{"name":"TopRoleEverywhere"}*//

class TopRoleEverywhere {
	constructor () {
		this.serverListObserver = new MutationObserver(() => {});
		this.userListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		
		this.roles = {};
		
		this.css = ` 
			.role-tag {
				position: relative;
				overflow: hidden; 
				padding: 1px 1px 1px 1px; 
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

	getVersion () {return "1.0.0";}

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
			this.serverListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class" && change.oldValue && change.oldValue.indexOf("guild") != -1) {
							var serverData = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"guild"});
							if (serverData) {
								this.loadRoleTags();
								if ($(".channel-members").length != 0) this.userListObserver.observe($(".channel-members")[0], {childList:true});
								if ($(".messages.scroller").length != 0) this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
							}
						}
					}
				);
			});
			this.serverListObserver.observe($(".guilds.scroller")[0], {subtree:true, attributes:true, attributeOldValue:true});
			
			this.userListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								var userData = BDfunctionsDevilBro.getKeyInformation({"node":node, "key":"user"});
								if (userData) {
									this.addRoleTag(node);
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
								if (user) {
									this.addRoleTag(user);
								}
							});
						}
					}
				);
			});
			if ($(".messages.scroller").length != 0) this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadRoleTags();
			
			//BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".role-tag").remove();
			this.serverListObserver.disconnect();
			this.userListObserver.disconnect();
			this.chatWindowObserver.disconnect();
		}
	}
	
	
	// begin of own functions

	loadRoleTags() {
		var server = BDfunctionsDevilBro.getSelectedServer();
		if (server) {
			if ($(".role-tag").length == 0) {
				this.roles = BDfunctionsDevilBro.getKeyInformation({"node":server,"key":"guild"}).roles;
				var members = $("div.member-username, span.username-wrapper");
				for (var i = 0; i < members.length; i++) {
					this.addRoleTag(members[i]);
				}
			}
		}
	}
	
	addRoleTag(member) {
		if ($(member).find(".role-tag").length == 0) {
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":member,"key":"style"});
			
			if (styleInfo != null) {
				for (var roleID in this.roles) {
					if (this.roles[roleID].colorString == styleInfo.color) {
						var color = BDfunctionsDevilBro.color2COMP(styleInfo.color);
						
						var tag = $(this.tagMarkup)
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