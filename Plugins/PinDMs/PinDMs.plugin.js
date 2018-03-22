//META{"name":"PinDMs"}*//

class PinDMs {
	constructor () {
		this.pinDMEntryMarkup =
			`<div class="item-1XYaYf pindm-item">
				<span>Pin DM</span>
				<div class="hint-3TJykr"></div>
			</div>`;
			
		this.pinDMsHeaderMarkup =
			`<header class="pinneddms-header">Pinned DMs</header>`;
			
		this.pinnedDMMarkup =
			`<div class="channel private pinned" style="height: 42px; opacity: 1;">
				<a>
					<div class="avatar-small stop-animation">
						<div class="status"></div>
					</div>
					<div class="channel-name">
						<label></label>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO channel-activity" style="flex: 1 1 auto;">
							<div class="channel-activity-text"></div>
						</div>
					</div>
					<button class="close"></button>
				</a>
			</div>`;
		
		this.richActivityMarkup = 
			`<svg name="RichActivity" class="channel-activity-icon" width="16" height="16" viewBox="0 0 16 16">
				<path class="channel-activity-icon-foreground" fill="currentColor" d="M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4 L8,5 Z M8,3 L2,3 L2,2 L8,2 L8,3 Z M8.88888889,0 L1.11111111,0 C0.494444444,0 0,0.494444444 0,1.11111111 L0,8.88888889 C0,9.50253861 0.497461389,10 1.11111111,10 L8.88888889,10 C9.50253861,10 10,9.50253861 10,8.88888889 L10,1.11111111 C10,0.494444444 9.5,0 8.88888889,0 Z" transform="translate(3 3)"></path>
			</svg>`;
	}

	getName () {return "PinDMs";}

	getDescription () {return "Allows you to pin DMs, making them appear at the top of your DM-list.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
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
			
			this.languageStrings = BDfunctionsDevilBro.getLanguageTable();
			this.englishStrings = BDfunctionsDevilBro.getLanguageTable("en-US");
			
			this.UserStore = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers", "getUser"]);
			this.ActivityStore = BDfunctionsDevilBro.WebModules.findByProperties(["getStatuses", "getActivities"]);
			this.IconUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUserAvatarURL"]);
			this.ChannelUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getDMFromUserId"]);
			this.ChannelSwitchUtils = BDfunctionsDevilBro.WebModules.findByProperties(["selectPrivateChannel"]);
			this.UserContextMenuUtils = BDfunctionsDevilBro.WebModules.findByProperties(["openUserContextMenu"]);
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".appMount-14L89u", {name:"dmContextObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains("btn-friends")) {
									$(".channel.private.pinned, header.pinneddms-header").remove();
									this.addAllPinnedDMs();
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".private-channels .scroller-fzNley", {name:"friendButtonObserver",instance:observer}, {childList: true});
			
			this.onSwitch();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".channel.private.pinned, header.pinneddms-header").remove();
			
			clearInterval(this.statusInterval);
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (!document.querySelector(".channel.btn-friends") || document.querySelector(".channel.private.pinned")) return;
		
		this.addAllPinnedDMs();
		
		BDfunctionsDevilBro.addObserver(this, ".private-channels .scroller-fzNley", {name:"friendButtonObserver"}, {childList: true});
	}
	
	// begin of own functions
	
	onContextMenu (context) {
		if (!document.querySelector(".channel.btn-friends") || !context || !context.tagName || !context.parentElement || context.querySelector(".pindm-item")) return;
		var info = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"user"});
		if (info && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"handleClose"})) {
			$(this.pinDMEntryMarkup).insertBefore(context.querySelectorAll(".item-1XYaYf")[3])
				.on("click", (e) => {
					$(context).hide();
					var pinnedDMs = BDfunctionsDevilBro.loadAllData(this, "pinnedDMs");
					if (typeof pinnedDMs[info.id] == "undefined") {
						var pos = Object.keys(pinnedDMs).length;
						pinnedDMs[info.id] = pos;
						BDfunctionsDevilBro.saveAllData(pinnedDMs, this, "pinnedDMs")
						this.addPinnedDM(info.id, pos); 
					}
				});
				
			BDfunctionsDevilBro.updateContextPosition(context);
		}
	}
	
	addAllPinnedDMs () {
		var pinnedDMs = BDfunctionsDevilBro.loadAllData(this, "pinnedDMs");
		var sortedDMs = [];
		for (let id in pinnedDMs) sortedDMs[pinnedDMs[id]] = id;
		for (let pos in sortedDMs.reverse()) {
			this.addPinnedDM(sortedDMs[pos], pos);
		}
	}
	
	addPinnedDM (id, pos) {
		if (!document.querySelector(".channel.btn-friends + header.pinneddms-header")) {
			$(this.pinDMsHeaderMarkup).insertBefore(".channel.btn-friends + header");
			this.startUpdateInterval();
		}
		let user = this.UserStore.getUser(id);
		if (user) {
			let pinnedDM = $(this.pinnedDMMarkup);
			pinnedDM.attr("user-id", user.id).insertAfter(".channel.btn-friends + header.pinneddms-header")
				.on("contextmenu." + this.getName(), (e) => {
					let DMid = this.ChannelUtils.getDMFromUserId(user.id);
					if (DMid) this.UserContextMenuUtils.openUserContextMenu(e, user, this.ChannelUtils.getChannel(DMid));
					else BDfunctionsDevilBro.showToast("Could not open ContextMenu, make sure the DM exists.", {type:"error"});
				})
				.on("click." + this.getName(), (e) => {
					if (e.target.classList && e.target.classList.contains("close")) return;
					let DMid = this.ChannelUtils.getDMFromUserId(user.id);
					if (DMid) this.ChannelSwitchUtils.selectPrivateChannel(DMid);
					else BDfunctionsDevilBro.showToast("Could not open DM, make sure it exists.", {type:"error"});
				})
				.on("click." + this.getName(), ".close", () => {
					pinnedDM.remove();
					BDfunctionsDevilBro.removeData(user.id, this, "pinnedDMs");
					this.updatePinnedDMPositions();
				});
				
			this.setPinnedDM(pinnedDM[0]);
		}
	}
	
	setPinnedDM (pinnedDM) {
		if (pinnedDM && pinnedDM.parentElement) {
			let user = this.UserStore.getUser(pinnedDM.getAttribute("user-id"));
			if (user) {
				let activity = this.ActivityStore.getActivity(user.id);
				pinnedDM.querySelector(".avatar-small").style.backgroundImage = `url(${this.getUserAvatar(user)})`;
				pinnedDM.querySelector(".status").className = `status status-${this.ActivityStore.getStatus(user.id)}`;
				pinnedDM.querySelector(".channel-name > label").textContent = user.username;
				pinnedDM.querySelector(".channel-activity-text").innerHTML = activity ? this.getActivityString(activity.type, activity.name) : "";
				if (activity && activity.application_id && activity.session_id) {
					if (!pinnedDM.querySelector(".channel-activity-icon")) $(".channel-activity", pinnedDM).append(this.richActivityMarkup);
				}
				else $(".channel-activity-icon", pinnedDM).remove();
			}
		}
	}
	
	startUpdateInterval () {
		this.statusInterval = setInterval(() => {
			for (let pinnedDM of document.querySelectorAll(".channel.private.pinned")) this.setPinnedDM(pinnedDM);
			if (!document.querySelector(".channel.btn-friends + header.pinneddms-header")) clearInterval(this.statusInterval); 
		},10000);
	}
	
	getUserAvatar (user) {
		return (user.avatar ? "" : "https://discordapp.com") + this.IconUtils.getUserAvatarURL(user);
	}
	
	getActivityString (type, name) {
		let stringname = "";
		switch (type) {
			case 0:
				stringname = "PLAYING_GAME";
				break;
			case 1:
				stringname = "STREAMING";
				break;
			case 2:
				stringname = "LISTENING_TO";
				break;
			case 3:
				stringname = "WATCHING";
				break;
		}
		
		let string = stringname ? (this.languageStrings[stringname] ? this.languageStrings[stringname] : this.englishStrings[stringname]) : "";
		
		return string.replace("**!!{name}!!**", `<strong>${name}</strong>`).replace("**!!{game}!!**", `<strong>${name}</strong>`);
	}
	
	updatePinnedDMPositions () {
		let pinnedDMs = BDfunctionsDevilBro.loadAllData(this, "pinnedDMs");
		let pinnedDMEles = document.querySelectorAll(".channel.private.pinned");
		for (let i = 0; i < pinnedDMEles.length; i++) {
			pinnedDMs[pinnedDMEles[i].id] = i;
		}
		if (pinnedDMEles.length == 0) $(".channel.btn-friends + header.pinneddms-header").remove();
		BDfunctionsDevilBro.saveAllData(pinnedDMs, this, "pinnedDMs")
	}
}
