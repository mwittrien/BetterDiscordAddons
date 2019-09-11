//META{"name":"ShowImageDetails","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowImageDetails","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ShowImageDetails/ShowImageDetails.plugin.js"}*//

class ShowImageDetails {
	getName () {return "ShowImageDetails";}

	getVersion () {return "1.1.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Display the name, size and dimensions of uploaded images (does not include embed images) in the chat as an header or as a tooltip.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"LazyImageZoomable":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
	}

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

		this.defaults = {
			settings: {
				showOnHover:	{value:false, 	description:"Show the details as Tooltip instead:"}
			},
			amounts: {
				hoverDelay:		{value:0, 		min:0,	description:"Tooltip delay in millisec:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let amounts = BDFDB.getAllData(this, "amounts");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in amounts) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number"${(!isNaN(this.defaults.amounts[key].min) && this.defaults.amounts[key].min !== null ? ' min="' + this.defaults.amounts[key].min + '"' : '') + (!isNaN(this.defaults.amounts[key].max) && this.defaults.amounts[key].max !== null ? ' max="' + this.defaults.amounts[key].max + '"' : '')} option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amount-input"></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	resetImage (image) {
		BDFDB.removeClass(image, "image-details-added");
		image.removeEventListener("mouseenter", image.mouseenterShowImageDetails);
		let wrapper = image.parentElement;
		if (BDFDB.containsClass(wrapper, "image-details-wrapper")) {
			wrapper.parentElement.insertBefore(image, wrapper);
			wrapper.remove();
		}
	}

	processLazyImageZoomable (instance, image, returnvalue) {
		let attachment = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.attachment");
		if (attachment && !attachment.filename.endsWith(".bdemote.png") && !attachment.filename.endsWith(".bdemote.gif")) {
			if (BDFDB.containsClass(image.parentElement.parentElement, BDFDB.disCN.spoilercontainer, BDFDB.disCN.spoilertext, false)) image = image.parentElement.parentElement;
			BDFDB.addClass(image, "image-details-added");
			image.removeEventListener("mouseenter", image.mouseenterShowImageDetails);
			if (BDFDB.getData("showOnHover", this, "settings")) {
				image.mouseenterShowImageDetails = () => {
					BDFDB.createTooltip(`<div class="image-details-tooltip-name">${attachment.filename}</div><div class="image-details-tooltip-size">${BDFDB.formatBytes(attachment.size)}</div><div class="image-details-tooltip-dimensions">${attachment.width}x${attachment.height}px</div>`, image, {type:"right", html:true, selector:"image-details-tooltip", delay:BDFDB.getData("hoverDelay", this, "amounts")});
				};
				image.addEventListener("mouseenter", image.mouseenterShowImageDetails);
			}
			else {
				let imagedetailswrapper = BDFDB.htmlToElement(`<div class="image-details-wrapper"><div class="image-details"><a class="${BDFDB.disCNS.anchor + BDFDB.disCN.anchorunderlineonhover} image-details-link" title="${attachment.url}" href="${attachment.url}" target="_blank" rel="noreferrer noopener">${attachment.filename}</a><label class="image-details-size ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${BDFDB.formatBytes(attachment.size)}</label><label class="image-details-dimensions ${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">${attachment.width}x${attachment.height}px</label></div></div>`);
				image.parentElement.insertBefore(imagedetailswrapper, image);
				imagedetailswrapper.appendChild(image);
				let scroller = BDFDB.getParentEle(BDFDB.dotCN.messages, image);
				if (scroller) scroller.scrollTop += BDFDB.getRects(imagedetailswrapper).height - BDFDB.getRects(image).height;
			}
		}
	}

	processStandardSidebarView (instance) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}
}