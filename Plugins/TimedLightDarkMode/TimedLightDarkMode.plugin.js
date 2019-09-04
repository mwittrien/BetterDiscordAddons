//META{"name":"TimedLightDarkMode","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/TimedLightDarkMode","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/TimedLightDarkMode/TimedLightDarkMode.plugin.js"}*//

class TimedLightDarkMode {
	getName () {return "TimedLightDarkMode";}

	getVersion () {return "1.0.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to automatically change light/dark mode depending on the time of day. Slider is added to the 'Appearance' settings.";}

	constructor () {
		this.changelog = {
			"added":[["Current Time","Added a little indicator to show the current time on the slider"]],
			"improved":[["Start up","Now properly checks the current time on start up and not only after the first check interval"]]
		};

		this.patchModules = {
			"RadioGroup":"componentDidMount"
		};
	}

	initConstructor () {
		this.defaults = {
			settings: {
				running:	{value: true}
			},
			values: {
				timer1:		{value:25},
				timer2:		{value:75}
			}
		};
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
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
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

			this.SettingsUtils = BDFDB.WebModules.findByProperties("updateRemoteSettings","updateLocalSettings");

			BDFDB.WebModules.forceAllUpdates(this);

			this.startInterval();
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			clearInterval(this.checkInterval);

			BDFDB.removeEles(".TLDM-settingsbox");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processRadioGroup (instance, wrapper) {
		if (instance.props && Array.isArray(instance.props.options) && instance.props.options[0] && instance.props.options[0].value == "light" && instance.props.options[1] && instance.props.options[1].value == "dark" && wrapper.parentElement.firstElementChild.innerText && wrapper.parentElement.firstElementChild.innerText.toUpperCase() == BDFDB.LanguageStrings.THEME.toUpperCase()) {
			var settings = BDFDB.getAllData(this, "settings");
			var values = BDFDB.getAllData(this, "values");
			var settingsbox = BDFDB.htmlToElement(`<div class="${BDFDB.disCN.margintop8} TLDM-settingsbox"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><h5 class="${BDFDB.disCN.h5}">${BDFDB.LanguageStrings.THEME} Timer</h5><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings running" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings.running ? " checked" : ""}></div></div><div class="${BDFDB.disCNS.slider + BDFDB.disCN.margintop20}${!settings.running ? (" " + BDFDB.disCN.sliderdisabled): ""}"><input type="number" key="timer1" class="${BDFDB.disCN.sliderinput}" value="${values.timer1}" readonly=""><input type="number" key="timer2" class="${BDFDB.disCN.sliderinput}" value="${values.timer2}" readonly=""><div class="${BDFDB.disCN.slidertrack}"><div class="${BDFDB.disCN.slidermark}" style="left: 0%;"><div class="${BDFDB.disCN.slidermarkvalue}">00:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 12.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">03:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 25%;"><div class="${BDFDB.disCN.slidermarkvalue}">06:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 37.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">09:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 50%;"><div class="${BDFDB.disCN.slidermarkvalue}">12:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 62.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">15:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 75%;"><div class="${BDFDB.disCN.slidermarkvalue}">18:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 87.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">21:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 100%;"><div class="${BDFDB.disCN.slidermarkvalue}">24:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div></div><div class="${BDFDB.disCN.sliderbar}"><div class="${BDFDB.disCN.sliderbarfill}"></div></div><div class="${BDFDB.disCN.slidertrack}"><div class="${BDFDB.disCN.slidergrabber} timer-grabber" key="timer1" style="left: ${values.timer1}%;"></div><div class="${BDFDB.disCN.slidergrabber} timer-grabber" key="timer2" style="left: ${values.timer2}%;"></div><div class="${BDFDB.disCN.slidergrabber} date-grabber" key="current" style="left: ${this.getPercent(new Date())}%; cursor: help !important; height: 12px; margin-top: -7px;"></div></div></div></div>`);
			wrapper.parentElement.appendChild(settingsbox);
			var slider = settingsbox.querySelector(BDFDB.dotCN.slider);

			BDFDB.initElements(settingsbox, this);
			this.updateSlider(slider, values);
			BDFDB.addChildEventListener(settingsbox, "mousedown", BDFDB.dotCN.slidergrabber + ".timer-grabber", e => {this.dragSlider(e.currentTarget);});
			BDFDB.addChildEventListener(settingsbox, "mouseenter", BDFDB.dotCN.slidergrabber + ".date-grabber", e => {this.showCurrentTime(e.currentTarget);});
			BDFDB.addChildEventListener(settingsbox, "click", ".settings-switch", e => {
				this.startInterval();
				BDFDB.toggleClass(slider, BDFDB.disCN.sliderdisabled, !e.currentTarget.checked);
			});
		}
	}

	startInterval () {
		clearInterval(this.checkInterval);
		if (BDFDB.getData("running", this, "settings")) {
			var values = BDFDB.getAllData(this, "values");
			var inverted = values.timer1 > values.timer2;
			var timer1LOW = this.getTime(values.timer1), timer2LOW = this.getTime(values.timer2);
			var timer1HIGH = this.getHighTime(timer2LOW), timer2HIGH = this.getHighTime(timer1LOW);
			var check = () => {
				var currenttime = new Date();
				var currenthours = currenttime.getHours();
				var currentminutes = currenttime.getMinutes();
				if (inverted) this.changeTheme(!(this.checkTime(timer1LOW, timer1HIGH, [currenthours, currentminutes])));
				else this.changeTheme(this.checkTime(timer2LOW, timer2HIGH, [currenthours, currentminutes]));
			};
			check();
			this.checkInterval = setInterval(check, 60000);
		}
	}

	checkTime (timerLOW, timerHIGH, time) {
		return timerHIGH[0] > time[0] || timerHIGH[0] == time[0] && timerHIGH[1] >= time[1] || time[0] > timerLOW[0] || time[0] == timerLOW[0] && time[1] >= timerLOW[1];
	}

	changeTheme (dark) {
		var theme = BDFDB.getDiscordTheme();
		if (dark && theme == BDFDB.disCN.themelight) this.SettingsUtils.updateRemoteSettings({theme:"dark"});
		else if (!dark && theme == BDFDB.disCN.themedark) this.SettingsUtils.updateRemoteSettings({theme:"light"});
	}

	showCurrentTime (grabber) {
		var currenttime = new Date();
		var currenthours = currenttime.getHours();
		var currentminutes = currenttime.getMinutes();
		var bubble = BDFDB.htmlToElement(`<span class="${BDFDB.disCN.sliderbubble}">${(currenthours > 9 ? currenthours : ("0" + currenthours)) + ":" + (currentminutes > 9 ? currentminutes : ("0" + currentminutes))}</span>`);
		grabber.appendChild(bubble);
		grabber.style.setProperty("left", `${this.getPercent(currenttime)}%`);
		var mouseleave = () => {
			BDFDB.removeEles(bubble);
			grabber.removeEventListener("mouseleave", mouseleave);
		};
		grabber.addEventListener("mouseleave", mouseleave);
	}

	dragSlider (grabber) {
		var track = grabber.parentNode;
		if (BDFDB.containsClass(track.parentNode, BDFDB.disCN.sliderdisabled)) return;
		var type = grabber.getAttribute("key");
		var input = track.parentNode.querySelector(`${BDFDB.dotCN.sliderinput}[key="${type}"]`);
		var values = BDFDB.getAllData(this, "values");

		BDFDB.appendLocalStyle("disableTextSelection", `*{user-select: none !important;}`);

		var value = values[type];
		var othervalue = type == "timer1" ? values.timer2 : values.timer1;
		var sY = 0;
		var sHalfW = BDFDB.getRects(grabber).width/2;
		var sMinX = BDFDB.getRects(track).left;
		var sMaxX = sMinX + BDFDB.getRects(track).width;
		var bubble = BDFDB.htmlToElement(`<span class="${BDFDB.disCN.sliderbubble}">${this.getTime(value, true)}</span>`);
		grabber.appendChild(bubble);
		var mouseup = () => {
			document.removeEventListener("mouseup", mouseup);
			document.removeEventListener("mousemove", mousemove);
			BDFDB.removeEles(bubble);
			BDFDB.removeLocalStyle("disableTextSelection");
			BDFDB.saveData(type, value, this, "values");
			this.startInterval();
		};
		var mousemove = e => {
			sY = e.clientX > sMaxX ? sMaxX - sHalfW : (e.clientX < sMinX ? sMinX - sHalfW : e.clientX - sHalfW);
			value = BDFDB.mapRange([sMinX - sHalfW, sMaxX - sHalfW], [0, 100], sY);
			input.value = value;
			grabber.style.setProperty("left", value + "%");
			bubble.innerText = this.getTime(value, true);
			values[type] = value;
			this.updateSlider(track.parentNode, values);
		};
		document.addEventListener("mouseup", mouseup);
		document.addEventListener("mousemove", mousemove);
	}

	updateSlider (slider, values) {
		var bar = slider.querySelector(BDFDB.dotCN.sliderbar);
		var fill = slider.querySelector(BDFDB.dotCN.sliderbarfill);
		var inverted = values.timer1 > values.timer2;
		fill.style.setProperty("width", (inverted ? (values.timer1 - values.timer2) : (values.timer2 - values.timer1)) + "%");
		fill.style.setProperty("margin-left", (inverted ? values.timer2 : values.timer1) + "%");
		fill.style.setProperty("background-color", inverted ? "#66757F" : "#E0C460", "important");
		bar.style.setProperty("background-color", inverted ? "#E0C460" : "#66757F", "important");
	}

	getTime (percent, stringify) {
		var time = BDFDB.mapRange([0, 100], [0, 1440], percent)/60;
		var hours = Math.floor(time);
		var minutes = Math.floor((time - hours) * 60);
		return stringify ? (hours > 9 ? hours : ("0" + hours)) + ":" + (minutes > 9 ? minutes : ("0" + minutes)) : [hours,minutes];
	}

	getPercent (time) {
		if (!time) return 0;
		var hours = Array.isArray(time) ? time[0] : (typeof time == "object" && typeof time.getHours == "function" ? time.getHours() : 0);
		var minutes = Array.isArray(time) ? time[1] : (typeof time == "object" && typeof time.getMinutes == "function" ? time.getMinutes() : 0);
		return BDFDB.mapRange([0, 1440], [0, 100], (hours * 60) + minutes);
	}

	getHighTime (timer) {
		var hours = timer[0];
		var minutes = timer[1] - 1;
		if (minutes < 0) {
			minutes = 59;
			hours -= 1;
		}
		if (hours < 0) hours = 0;
		return [hours, minutes];
	}
}