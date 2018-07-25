//META{"name":"ShowImageDetails"}*//

class ShowImageDetails {
	initConstructor () {
		this.css = `
			 .image-details .image-details-size {
				 margin: 0 10px;
			 }
			 .image-details-tooltip {
				 max-width: 500px;
			 }
			 .image-details-tooltip .image-details-tooltip-size {
				 margin: 10px 0;
			 }
		`;
		
		this.updateDetails = false;
		
		this.defaults = {
			settings: {
				showOnHover:	{value:false, 	description:"Show the details as Tooltip instead:"}
			}
		};
	}

	getName () {return "ShowImageDetails";}

	getDescription () {return "Display the name, size and dimensions of uploaded images (does not include embed images) in the chat as an header or as a tooltip.";}

	getVersion () {return "1.0.7";}

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
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && (node.querySelector(BDFDB.dotCN.message) || node.classList.contains(BDFDB.disCN.message))) {
									this.addDetails(node);
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
								if (node && $(node).attr("layer-id") == "user-settings" && this.updateDetails) {
									document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});
									this.addDetails(document);
									this.updateDetails = false;
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			this.addDetails(document);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});
			
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDFDB === "object") {
			this.addDetails(document);
			BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver"}, {childList:true, subtree:true});
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
		this.updateDetails = true;
	}
	
	addDetails (container) {
		let scroller = document.querySelector(BDFDB.dotCNS.chat + BDFDB.dotCN.messages);
		if (!container || typeof container.querySelectorAll != "function" || !scroller) return; 
		var settings = BDFDB.getAllData(this, "settings");
		container.querySelectorAll(BDFDB.dotCN.messageaccessory + " > " + BDFDB.dotCN.imagewrapper).forEach(image => {
			var data = this.getImageData(image);
			if (data) {
				image.classList.add("image-details-added");
				if (!settings.showOnHover) {
					$(`<div class="image-details-wrapper"><div class="image-details"><a class="image-details-link" title="${data.url}" href="${data.url}" target="_blank" rel="noreferrer noopener">${data.filename}</a><label class="image-details-size ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${BDFDB.formatBytes(data.size)}</label><label class="image-details-dimensions ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${data.width}x${data.height}px</label></div></div>`).insertBefore(image).append(image);
					scroller.scrollTop += image.parentElement.getBoundingClientRect().height - image.getBoundingClientRect().height;
				}
				else {
					$(image).on("mouseenter." + this.getName(), () => {
						BDFDB.createTooltip(`<div class="image-details-tooltip-name">${data.filename}</div><div class="image-details-tooltip-size">${BDFDB.formatBytes(data.size)}</div><div class="image-details-tooltip-dimensions">${data.width}x${data.height}px</div>`, image, {type:"right", html:true, selector:"image-details-tooltip"});
					});
				}
			}
		}); 
	}
	
	resetImage (image) {
		image.classList.remove("image-details-added");
		$(image).off("." + this.getName());
		var wrapper = image.parentElement;
		if (wrapper.classList.contains("image-details-wrapper")) {
			wrapper.parentElement.insertBefore(image, wrapper);
			wrapper.remove();
		}
	}
	
	getImageData (attachment) {
		var messageInfo = BDFDB.getKeyInformation({"node":attachment,"key":"message","up":true,"time":1000});
		if (messageInfo) {
			var message = null, temp = attachment;
			while (message == null || temp.parentElement) {
				temp = temp.parentElement;
				if (temp.classList && temp.classList.contains(BDFDB.disCN.message)) message = temp;
			}
			if (message) {
				var pos = $(message).find(BDFDB.dotCN.imagewrapper).index(attachment);
				var info = messageInfo.attachments;
				if (info && pos > -1) info = info[pos];
				return info;
			}
		}
	}
}