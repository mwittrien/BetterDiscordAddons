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
					<div class="channel-name"></div>
					<button class="close"></button>
				</a>
			</div>`;
	}

	getName () {return "PinDMs";}

	getDescription () {return "Allows you to pin DMs, making them appear at the top of your DM-list.";}

	getVersion () {return "1.0.0";}

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
			
			this.UserStore = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers", "getUser"]);
			this.ActivityStore = BDfunctionsDevilBro.WebModules.findByProperties(["getStatuses", "getActivities"]);
			this.IconUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUserAvatarURL"]);
			this.ChannelUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getDMFromUserId"]);
			this.ChannelSwitchUtils = BDfunctionsDevilBro.WebModules.findByProperties(["selectPrivateChannel"]);
			
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
		}
		let user = this.UserStore.getUser(id);
		if (user) {
			let pinnedDM = $(this.pinnedDMMarkup);
			pinnedDM.find(".avatar-small").css("background-image", `url(${this.getUserAvatar(user)})`);
			pinnedDM.find(".status").addClass(`status-${this.ActivityStore.getStatus(user.id)}`);
			pinnedDM.find(".channel-name").text(user.username);
			pinnedDM.attr("id", user.id).insertAfter(".channel.btn-friends + header.pinneddms-header")
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
		}
	}
	
	getUserAvatar (user) {
		return (user.avatar ? "" : "https://discordapp.com") + this.IconUtils.getUserAvatarURL(user);
	}
	
	updatePinnedDMPositions () {
		var pinnedDMs = BDfunctionsDevilBro.loadAllData(this, "pinnedDMs");
		var pinnedDMEles = document.querySelectorAll(".channel.private.pinned");
		for (let i = 0; i < pinnedDMEles.length; i++) {
			pinnedDMs[pinnedDMEles[i].id] = i;
		}
		if (pinnedDMEles.length == 0) $(".channel.btn-friends + header.pinneddms-header").remove();
		BDfunctionsDevilBro.saveAllData(pinnedDMs, this, "pinnedDMs")
	}
}