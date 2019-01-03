//META{"name":"ShowImageDetails"}*//

class ShowImageDetails {
	initConstructor () {
		this.patchModules = {
			"LazyImageZoomable":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
		
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
			},
			amounts: {
				hoverDelay:		{value:0, 		description:"Tooltip delay in millisec:"}
			}
		};
	}

	getName () {return "ShowImageDetails";}

	getDescription () {return "Display the name, size and dimensions of uploaded images (does not include embed images) in the chat as an header or as a tooltip.";}

	getVersion () {return "1.1.1";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		let settings = BDFDB.getAllData(this, "settings");
		let amounts = BDFDB.getAllData(this, "amounts");
		let settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in amounts) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%; line-height: 38px;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number" min="0" option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amountInput"></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		let settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
			.on("input", ".amountInput", (e) => {
				let input = parseInt(e.currentTarget.value);
				if (!isNaN(input) && input > -1) BDFDB.saveData(e.currentTarget.getAttribute("option"), input, this, "amounts");
			});
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		let libraryScript = null;
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
			
			BDFDB.WebModules.forceAllUpdates(this);
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
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		let settings = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
		this.updateDetails = true;
	}
	
	resetImage (image) {
		image.classList.remove("image-details-added");
		$(image).off("." + this.getName());
		let wrapper = image.parentElement;
		if (wrapper.classList.contains("image-details-wrapper")) {
			wrapper.parentElement.insertBefore(image, wrapper);
			wrapper.remove();
		}
	}
	
	processLazyImageZoomable (instance, image) {
		let fiber = instance._reactInternalFiber;
		if (fiber.return && fiber.return.return && fiber.return.return.memoizedProps && fiber.return.return.memoizedProps.attachment) {
			let info = fiber.return.return.memoizedProps.attachment;
			if (info && !info.filename.endsWith(".bdemote.png") && !info.filename.endsWith(".bdemote.gif")) {
				let scroller = BDFDB.getParentEle(BDFDB.dotCN.messages, image);
				image.classList.add("image-details-added");
				if (BDFDB.getData("showOnHover", this, "settings")) {
					$(image).on("mouseenter." + this.getName(), () => {
						BDFDB.createTooltip(`<div class="image-details-tooltip-name">${info.filename}</div><div class="image-details-tooltip-size">${BDFDB.formatBytes(info.size)}</div><div class="image-details-tooltip-dimensions">${info.width}x${info.height}px</div>`, image, {type:"right", html:true, selector:"image-details-tooltip", delay:BDFDB.getData("hoverDelay", this, "amounts")});
					});
				}
				else {
					$(`<div class="image-details-wrapper"><div class="image-details"><a class="${BDFDB.disCNS.anchor + BDFDB.disCN.anchorunderlineonhover} image-details-link" title="${info.url}" href="${info.url}" target="_blank" rel="noreferrer noopener">${info.filename}</a><label class="image-details-size ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${BDFDB.formatBytes(info.size)}</label><label class="image-details-dimensions ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${info.width}x${info.height}px</label></div></div>`).insertBefore(image).append(image);
					scroller.scrollTop += image.parentElement.getBoundingClientRect().height - image.getBoundingClientRect().height;
				}
			}
		}
	}
	
	processStandardSidebarView (instance) {
		if (this.updateDetails) {
			this.updateDetails = false;
			document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}
}