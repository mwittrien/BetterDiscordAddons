//META{"name":"TopRoleEverywhere"}*//

class TopRoleEverywhere {
	constructor () {
		this.css = ` 
			.TRE-tag {
				position: relative;
				border-radius: 3px;
				display: inline-block;
				flex-shrink: 0;
				font-size: 10px;
				font-weight: 500;
				line-height: 13px;
				margin-left: 6px;
				padding: 1px 2px;
				text-transform: uppercase;
				vertical-align: top;
			}`;
			
		this.tagMarkup = `<span class="TRE-tag"><span class="role-inner"></span></span>`;
			
		this.defaults = {
			settings: {
				showInChat:			{value:true, 	description:"Show Tag in Chat Window."},
				showInMemberList:	{value:true, 	description:"Show Tag in Member List."},
				useOtherStyle:		{value:false, 	description:"Use other Tagstyle."},
				includeColorless:	{value:false, 	description:"Include colorless roles."},
				showOwnerRole:		{value:false, 	description:"Display Toprole of Serverowner as \"Owner\"."},
				disableForBots:		{value:false, 	description:"Disable Toprole for Bots."},
				addUserID:			{value:false, 	description:"Add the UserID as a Tag to the Chat Window."},
				darkIdTag:			{value:false, 	description:"Use a dark version for the UserID-Tag."}
			}
		};
	}

	getName () {return "TopRoleEverywhere";}

	getDescription () {return "Adds the highest role of a user as a tag.";}

	getVersion () {return "2.5.7";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
			
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
			
			this.GuildPerms = BDfunctionsDevilBro.WebModules.findByProperties(["getHighestRole"]);
			this.GuildStore = BDfunctionsDevilBro.WebModules.findByProperties(["getGuild"]);
			this.UserGuildState = BDfunctionsDevilBro.WebModules.findByProperties(["getGuildId", "getLastSelectedGuildId"]);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.querySelector(".username-MwOsla, .member-username") && BDfunctionsDevilBro.getData("showInMemberList", this, "settings")) {
									this.addRoleTag(node, "list", false);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".channel-members, .members-1bid1J", {name:"userListObserver",instance:observer}, {childList:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (BDfunctionsDevilBro.getData("showInChat", this, "settings")) {
									if ($(".message-group").has(".avatar-large").length > 0) {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											this.addRoleTag(node, "chat", false);
										}
										else if (node && node.classList && node.classList.contains("message-text")) {
											this.addRoleTag($(".message-group").has(node)[0], "chat", false);
										}
									}
									else {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											if (node.classList.contains("markup")) {
												this.addRoleTag(node, "chat", true);
											}
											else {
												var markups = node.querySelectorAll("div.markup");
												for (var i = 0; i < markups.length; i++) {
													this.addRoleTag(markups[i], "chat", true);
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
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver",instance:observer}, {childList:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
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
			BDfunctionsDevilBro.addObserver(this, ".layers-20RVFW", {name:"settingsWindowObserver",instance:observer}, {childList:true});
						
			this.loadRoleTags();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			document.querySelectorAll(".TRE-tag").forEach(node=>{node.remove();});
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.addObserver(this, ".channel-members, .members-1bid1J", {name:"userListObserver"}, {childList:true});
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver"}, {childList:true, subtree:true});
			this.loadRoleTags();
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}

	loadRoleTags() {
		document.querySelectorAll(".TRE-tag").forEach(node=>{node.remove();});
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		if (settings.showInMemberList) { 
			var membersList = document.querySelectorAll(".member-2FrNV0, .member");
			for (var i = 0; i < membersList.length; i++) {
				this.addRoleTag(membersList[i], "list", false);
			}
		}
		if (settings.showInChat) { 
			var membersChat = document.querySelectorAll(".message-group");
			for (var j = 0; j < membersChat.length; j++) {
				if ($(membersChat[j]).has(".avatar-large").length > 0) {
					this.addRoleTag(membersChat[j], "chat", false);
				}
				else {
					var markups = membersChat[j].querySelectorAll(".markup");
					for (var j2 = 0; j2 < markups.length; j2++) {
						this.addRoleTag(markups[j2], "chat", true);
					}
				}
			}
		}
	}
	
	addRoleTag (wrapper, type, compact) {
		if (!wrapper || !BDfunctionsDevilBro.getSelectedServer()) return;
		var guild = this.GuildStore.getGuild(this.UserGuildState.getGuildId());
		var member = wrapper.querySelector(".username-MwOsla, .member-username") || wrapper.querySelector(".username-wrapper");
		if (compact) wrapper = $(".message-group").has(wrapper)[0];
		if (member && member.tagName && !member.querySelector(".TRE-tag")) {
			var settings = BDfunctionsDevilBro.getAllData(this, "settings");
			var userInfo = 
				compact ? BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"message"}).author : BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"user"});
			if (!userInfo || (userInfo.bot && settings.disableForBots)) return;
			var userID = userInfo.id;
			var role = this.GuildPerms.getHighestRole(guild, userID);
			
			if ((role && (role.colorString || settings.includeColorless)) || userID == 278543574059057154) {
				var roleColor = role && role.colorString ? BDfunctionsDevilBro.color2COMP(role.colorString) : [255,255,255];
				var roleName = role ? role.name : "";
				var totalwidth, oldwidth, newwidth, maxwidth;
				if (type == "list") {
					totalwidth = member.style.width
					oldwidth = wrapper.querySelector(".memberInner-3XUq9K, .member-username-inner").style.width;
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
				else if (settings.showOwnerRole && userID == guild.ownerId) {
					roleText = "Owner";
					tag.classList.add("owner-tag");
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
					newwidth = member.querySelector(".memberInner-3XUq9K, .member-username-inner").style.width;
					if (newwidth) {
						newwidth = parseInt(newwidth.replace("px",""));
						if (newwidth < 100 && oldwidth < 100) {
							maxwidth = totalwidth - oldwidth - 15;
							tag.style.maxWidth = maxwidth+"px";
						}
					}
				}
			}
			if (type == "chat" && settings.addUserID) {
				var idtag = $(this.tagMarkup)[0];
				member.appendChild(idtag);
				var idColor = settings.darkIdTag ? [33,33,33] : [222,222,222];
				var borderColorID = "rgba(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ", 0.5)";
				var textColorID = "rgb(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ")";
				var bgColorID = "rgba(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ", 0.1)";
				var bgInnerID = "none";
				if (settings.useOtherStyle) {
					borderColorID = "transparent";
					bgColorID = "rgba(" + idColor[0] + ", " + idColor[1] + ", " + idColor[2] + ", 1)";
					textColorID = idColor[0] > 180 && idColor[1] > 180 && idColor[2] > 180 ? "black" : "white";
				}
				idtag.classList.add("id-tag");
				idtag.style.border = "1px solid " + borderColorID;
				idtag.style.background = bgColorID;
				var idinner = idtag.querySelector(".role-inner");
				idinner.style.color = textColorID;
				idinner.style.backgroundImage = bgInnerID;
				idinner.style.webkitBackgroundClip = "text";
				idinner.textContent = userID;
			}
		}
	}
}
