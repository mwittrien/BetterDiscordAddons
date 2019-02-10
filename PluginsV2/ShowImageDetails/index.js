module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {myPlugins:{}, BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.patchModules = {
				"LazyImageZoomable":"componentDidMount"
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

			this.defaults = {
				settings: {
					showOnHover:	{value:false, 	description:"Show the details as Tooltip instead:"}
				},
				amounts: {
					hoverDelay:		{value:0, 		description:"Tooltip delay in millisec:"}
				}
			};
		}

		onStart () {
			if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.name] = this;
			var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (!global.BDFDB || typeof BDFDB != "object" || performance.now() - BDFDB.creationTime > 600000e.now() - BDFDB.creationTime > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		}

		initialize () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return return;
				BDFDB.loadMessage(this);

				BDFDB.WebModules.forceAllUpdates(this);

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}

		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});

				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
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

		processLazyImageZoomable (instance, image) {
			let attachment = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.attachment");
			if (attachment && !attachment.filename.endsWith(".bdemote.png") && !attachment.filename.endsWith(".bdemote.gif")) {
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

		getSettingsPanel () {
			if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.getAllData(this, "settings");
			let amounts = BDFDB.getAllData(this, "amounts");
			let settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
			}
			for (let key in amounts) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number" min="0" option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amountInput"></div></div>`;
			}
			settingshtml += `</div></div>`;

			let settingspanel = BDFDB.htmlToElement(settingshtml);

			BDFDB.initElements(settingspanel, this);

			BDFDB.addEventListener(this, settingspanel, "input", ".amountInput", e => {
				let input = parseInt(e.currentTarget.value);
				if (!isNaN(input) && input > -1) BDFDB.saveData(e.currentTarget.getAttribute("option"), input, this, "amounts");
			});

			return settingspanel;
		}

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				document.querySelectorAll(".image-details-added").forEach(image => {this.resetImage(image);});
				BDFDB.WebModules.forceAllUpdates(this);
			}
		}
	}
};
