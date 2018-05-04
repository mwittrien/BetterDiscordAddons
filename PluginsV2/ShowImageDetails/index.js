module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
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

		onStart () {
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
			return true;
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
									if (node && node.tagName && node.querySelector(BDFDB.dotCN.message)) {
										this.addDetails(node);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver",instance:observer}, {childList:true});
				
				this.addDetails(document);

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop () {
			if (typeof BDFDB === "object") {
				document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});
				
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
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
			if (!container || typeof container.querySelectorAll != "function") return; 
			var settings = BDFDB.getAllData(this, "settings");
			container.querySelectorAll(BDFDB.dotCN.messageaccessory + " > " + BDFDB.dotCN.imagewrapper).forEach(image => {
				this.resetImage(image);
				var data = this.getImageData(image);
				if (data) {
					image.classList.add("image-details-added");
					if (!settings.showOnHover) {
						$(`<div class="image-details-wrapper"><div class="image-details"><a class="image-details-link" title="${data.url}" href="${data.url}" target="_blank" rel="noreferrer noopener">${data.filename}</a><label class="image-details-size ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${BDFDB.formatBytes(data.size)}</label><label class="image-details-dimensions ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${data.width}x${data.height}px</label></div></div>`).insertBefore(image).append(image);
					}
					else {
						$(image).on("mouseenter." + this.name, () => {
							BDFDB.createTooltip(`<div class="image-details-tooltip-name">${data.filename}</div><div class="image-details-tooltip-size">${BDFDB.formatBytes(data.size)}</div><div class="image-details-tooltip-dimensions">${data.width}x${data.height}px</div>`, image, {type:"right", html:true, selector:"image-details-tooltip"});
						});
					}
				}
			}); 
		}
		
		resetImage (image) {
			image.classList.remove("image-details-added");
			$(image).off("." + this.name);
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
		
		getSettingsPanel () {
			var settings = BDFDB.getAllData(this, "settings"); 
			var settingshtml = `<div class="DevilBro-settings ${this.name}-settings">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];

			$(settingspanel)
				.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
			return settingspanel;
		}
		
		onSettingsClosed () {
			if (this.updateDetails) {
				this.addDetails(document);
				this.updateDetails = false;
			}
		}
	}
};
