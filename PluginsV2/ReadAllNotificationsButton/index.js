module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {myPlugins:{}, BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.patchModules = {
				"Guilds":"componentDidMount",
				"RecentMentions":"componentDidMount"
			};

			this.RANbuttonMarkup = 
				`<div class="${BDFDB.disCN.guild} RANbutton-frame" id="bd-pub-li" style="height: 20px; margin-bottom: 10px;">
					<div class="${BDFDB.disCN.guildinner}" style="height: 20px; border-radius: 4px;">
						<a>
							<div class="RANbutton" id="bd-pub-button" style="line-height: 20px; font-size: 12px;">read all</div>
						</a>
					</div>
				</div>`;

			this.RAMbuttonMarkup = 
				`<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemin + BDFDB.disCN.buttongrow} RAMbutton" style="flex: 0 0 auto; margin-left: 25px; height: 25px;">
					<div class="${BDFDB.disCN.buttoncontents}">Clear Mentions</div>
				</button>`;

			this.defaults = {
				settings: {
					includeMuted:	{value:false, 	description:"Include muted Servers (means more API-Requests):"}
				}
			};
		}

		onStart () {
			if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.name] = this;
			var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
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
				if (this.started) return true;
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
				BDFDB.removeEles(".RANbutton-frame", ".RAMbutton");
				BDFDB.removeClasses("RAN-added", "RAM-added");

				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}


		// begin of own functions

		processGuilds (instance, wrapper) {
			BDFDB.removeEles(".RANbutton-frame");
			let guildseparator = wrapper.querySelector(BDFDB.dotCN.guildseparator);
			if (guildseparator) {
				let ranbutton = BDFDB.htmlToElement(this.RANbuttonMarkup);
				guildseparator.parentElement.insertBefore(ranbutton, guildseparator);
				ranbutton.addEventListener("click", () => {
					BDFDB.clearReadNotifications(BDFDB.getData("includeMuted", this, "settings") ? BDFDB.readServerList() : BDFDB.readUnreadServerList());
				});
				BDFDB.addClass(wrapper, "RAN-added");
			}
		}

		processRecentMentions (instance, wrapper) {
			BDFDB.removeEles(".RAMbutton");
			if (instance.props && instance.props.popoutName == "RECENT_MENTIONS_POPOUT") {
				let recentmentionstitle = wrapper.querySelector(BDFDB.dotCN.recentmentionstitle);
				if (recentmentionstitle) {
					let ranbutton = BDFDB.htmlToElement(this.RAMbuttonMarkup);
					recentmentionstitle.appendChild(ranbutton);
					ranbutton.addEventListener("click", () => {this.clearMentions(instance, wrapper);});
					BDFDB.addClass(wrapper, "RAM-added");
				}
			}
		}

		clearMentions (instance, wrapper) {
			let closebuttons = wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton);
			for (let btn of wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton)) btn.click();
			if (closebuttons.length) {
				instance.loadMore();
				setTimeout(() => {this.clearMentions(instance, wrapper);},3000);
			}
		}

		getSettingsPanel () {
			if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			var settings = BDFDB.getAllData(this, "settings"); 
			var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div></div>`;

			let settingspanel = BDFDB.htmlToElement(settingshtml);

			BDFDB.initElements(settingspanel, this);

			return settingspanel;
		}
	}
};
