//META{"name":"TopRoleEverywhere"}*//

class TopRoleEverywhere {
	initConstructor () {
		this.css = `
			.TRE-tag {
				border-radius: 3px;
				box-sizing: border-box;
				display: inline-block;
				flex-shrink: 0;
				font-size: 10px;
				font-weight: 500;
				height: 15px;
				line-height: 13px;
				margin-left: 6px;
				padding: 1px 2px;
				text-transform: uppercase;
				text-indent: 0px !important;
				vertical-align: top;
			}
			%{BDFDB.dotCN.messagegroupcompact} .TRE-tag {
				margin-left: 2px;
				margin-right: 6px;
			}`;
			
		this.updateTags = false;
			
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

	getVersion () {return "2.7.2";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {			
			BDFDB.loadMessage(this);
			
			this.GuildPerms = BDFDB.WebModules.findByProperties(["getHighestRole"]);
			this.GuildStore = BDFDB.WebModules.findByProperties(["getGuild"]);
			this.UserGuildState = BDFDB.WebModules.findByProperties(["getGuildId", "getLastSelectedGuildId"]);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(BDFDB.dotCN.memberusername) && BDFDB.getData("showInMemberList", this, "settings")) {
									this.addRoleTag(node, "list", false);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.memberswrap, {name:"userListObserver",instance:observer}, {childList:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (BDFDB.getData("showInChat", this, "settings")) {
									if (node && node.tagName && node.querySelector(BDFDB.dotCN.messageusername)) {
										this.addRoleTag(node, "chat", BDFDB.getDiscordMode() == "compact");
									}
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver",instance:observer}, {childList:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && $(node).attr("layer-id") == "user-settings" && this.updateTags) {
									this.updateDetails = false;
									this.addDetails(document);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
						
			this.loadRoleTags();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll(".TRE-tag").forEach(node=>{node.remove();});
			
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDFDB === "object") {
			BDFDB.addObserver(this, BDFDB.dotCN.memberswrap, {name:"userListObserver"}, {childList:true, subtree:true});
			BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver"}, {childList:true, subtree:true});
			this.loadRoleTags();
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		this.updateTags = true;
		BDFDB.saveAllData(settings, this, "settings");
	}

	loadRoleTags() {
		document.querySelectorAll(".TRE-tag").forEach(node=>{node.remove();});
		if (!BDFDB.getSelectedServer()) return;
		var settings = BDFDB.getAllData(this, "settings");
		if (settings.showInMemberList) { 
			for (let user of document.querySelectorAll(BDFDB.dotCN.member)) {
				this.addRoleTag(user, "list", false);
			}
		}
		if (settings.showInChat) {
			for (let messagegroup of document.querySelectorAll(BDFDB.dotCN.messagegroupcozy)) {
				this.addRoleTag(messagegroup, "chat", false);
			}
			for (let messagegroup of document.querySelectorAll(BDFDB.dotCN.messagegroupcompact)) {
				for (let message of messagegroup.querySelectorAll(BDFDB.dotCN.messagemarkup)) {
					this.addRoleTag(message, "chat", true);
				}
			}
		}
	}
	
	addRoleTag (wrapper, type, compact) {
		if (!wrapper || !BDFDB.getSelectedServer()) return;
		var guild = this.GuildStore.getGuild(this.UserGuildState.getGuildId());
		var member = wrapper.querySelector(BDFDB.dotCN.memberusername);
		if (!member) member = wrapper.querySelector(BDFDB.dotCN.messageusername);
		if (member) member = member.parentElement;
		if (compact) wrapper = $(BDFDB.dotCN.messagegroup).has(wrapper)[0];
		if (member && member.tagName && !member.querySelector(".TRE-tag")) {
			var settings = BDFDB.getAllData(this, "settings");
			var userInfo = 
				compact ? BDFDB.getKeyInformation({"node":wrapper,"key":"message"}).author : BDFDB.getKeyInformation({"node":wrapper,"key":"user"});
			if (!userInfo || (userInfo.bot && settings.disableForBots)) return;
			var userID = userInfo.id;
			var role = this.GuildPerms.getHighestRole(guild, userID);
			
			if ((role && (role.colorString || settings.includeColorless)) || userID == 278543574059057154) {
				var roleColor = role && role.colorString ? BDFDB.color2COMP(role.colorString) : [255,255,255];
				var roleName = role ? role.name : "";
				var totalwidth, oldwidth, newwidth, maxwidth;
				if (type == "list") {
					totalwidth = member.style.width
					oldwidth = wrapper.querySelector(BDFDB.dotCN.memberinner).style.width;
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
					newwidth = member.querySelector(BDFDB.dotCN.memberinner).style.width;
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
