//META{"name":"ShowImageDetails"}*//

class ShowImageDetails {
	constructor () {
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

	getVersion () {return "1.0.4";}

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
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
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
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".message")) {
									this.addDetails(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver",instance:observer}, {childList:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && $(node).attr("layer-id") == "user-settings" && this.updateDetails) {
									this.updateDetails = false;
									this.addDetails(document);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".layers-20RVFW", {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			this.addDetails(document);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.addDetails(document);
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver"}, {childList:true, subtree:true});
		}
	}
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
		this.updateDetails = true;
	}
	
	addDetails (container) {
		if (!container || typeof container.querySelectorAll != "function") return; 
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		container.querySelectorAll(".accessory > .imageWrapper-38T7d9").forEach(image => {
			this.resetImage(image);
			var data = this.getImageData(image);
			if (data) {
				image.classList.add("image-details-added");
				if (!settings.showOnHover) {
					$(`<div class="image-details-wrapper"><div class="image-details"><a class="image-details-link" title="${data.url}" href="${data.url}" target="_blank" rel="noreferrer noopener">${data.filename}</a><label class="image-details-size description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">${BDfunctionsDevilBro.formatBytes(data.size)}</label><label class="image-details-dimensions description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">${data.width}x${data.height}px</label></div></div>`).insertBefore(image).append(image);
				}
				else {
					$(image).on("mouseenter." + this.getName(), () => {
						BDfunctionsDevilBro.createTooltip(`<div class="image-details-tooltip-name">${data.filename}</div><div class="image-details-tooltip-size">${BDfunctionsDevilBro.formatBytes(data.size)}</div><div class="image-details-tooltip-dimensions">${data.width}x${data.height}px</div>`, image, {type:"right", html:true, selector:"image-details-tooltip"});
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
		var messageInfo = BDfunctionsDevilBro.getKeyInformation({"node":attachment,"key":"message","up":true,"time":1000});
		if (messageInfo) {
			var message = null, temp = attachment;
			while (message == null || temp.parentElement) {
				temp = temp.parentElement;
				if (temp.classList && temp.classList.contains("message")) message = temp;
			}
			if (message) {
				var pos = $(message).find(".imageWrapper-38T7d9").index(attachment);
				var info = messageInfo.attachments;
				if (info && pos > -1) info = info[pos];
				return info;
			}
		}
	}
}
