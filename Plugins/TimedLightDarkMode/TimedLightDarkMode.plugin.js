//META{"name":"TimedLightDarkMode","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/TimedLightDarkMode","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/TimedLightDarkMode/TimedLightDarkMode.plugin.js"}*//

class TimedLightDarkMode {
	getName () {return "TimedLightDarkMode";}

	getVersion () {return "1.0.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to automatically change light/dark mode depending on the time of day. Slider is added to the 'Appearance' settings.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				RadioGroup: "componentDidMount"
			}
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
		if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
		if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
		let libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", _ => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(_ => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);

			this.startInterval();
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.TimeUtils.clear(this.checkInterval);

			BDFDB.DOMUtils.remove(BDFDB.dotCN._timedlightdarkmodetimersettings);

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processRadioGroup (e) {
		if (e.instance.props && Array.isArray(e.instance.props.options) && e.instance.props.options[0] && (e.instance.props.options[0].value == "light" || e.instance.props.options[0].value == "dark") && e.instance.props.options[1] && (e.instance.props.options[1].value == "light" || e.instance.props.options[1].value == "dark") && e.node.parentElement.firstElementChild.innerText && e.node.parentElement.firstElementChild.innerText.toUpperCase() == BDFDB.LanguageUtils.LanguageStrings.THEME.toUpperCase()) {
			let settings = BDFDB.DataUtils.get(this, "settings");
			let values = BDFDB.DataUtils.get(this, "values");
			let settingsbox = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS._timedlightdarkmodetimersettings + BDFDB.disCN.margintop8}"></div>`);
			BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", "running"],
						value: settings.running,
						label: `${BDFDB.LanguageUtils.LanguageStrings.THEME} Timer`,
						labelClassName: BDFDB.disCN.marginreset,
						tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
						onChange: (value, instance) => {
							this.startInterval();
							BDFDB.DOMUtils.toggleClass(slider, BDFDB.disCN.sliderdisabled, !value);
						}
					}),
					BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.slider + BDFDB.disCN.margintop20}${!settings.running ? (" " + BDFDB.disCN.sliderdisabled): ""}"><input type="number" timer="timer1" class="${BDFDB.disCN.sliderinput}" value="${values.timer1}" readonly=""><input type="number" timer="timer2" class="${BDFDB.disCN.sliderinput}" value="${values.timer2}" readonly=""><div class="${BDFDB.disCN.slidertrack}"><div class="${BDFDB.disCN.slidermark}" style="left: 0%;"><div class="${BDFDB.disCN.slidermarkvalue}">00:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 12.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">03:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 25%;"><div class="${BDFDB.disCN.slidermarkvalue}">06:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 37.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">09:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 50%;"><div class="${BDFDB.disCN.slidermarkvalue}">12:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 62.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">15:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 75%;"><div class="${BDFDB.disCN.slidermarkvalue}">18:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 87.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">21:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 100%;"><div class="${BDFDB.disCN.slidermarkvalue}">24:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div></div><div class="${BDFDB.disCN.sliderbar}"><div class="${BDFDB.disCN.sliderbarfill}"></div></div><div class="${BDFDB.disCN.slidertrack}"><div class="${BDFDB.disCNS.slidergrabber + BDFDB.disCN._timedlightdarkmodetimergrabber}" timer="timer1" style="left: ${values.timer1}%;"></div><div class="${BDFDB.disCNS.slidergrabber + BDFDB.disCN._timedlightdarkmodetimergrabber}" timer="timer2" style="left: ${values.timer2}%;"></div><div class="${BDFDB.disCNS.slidergrabber + BDFDB.disCN._timedlightdarkmodedategrabber}" timer="current" style="left: ${this.getPercent(new Date())}%; cursor: help !important; height: 12px; margin-top: -7px;"></div></div></div>`), node => {
						if (Node.prototype.isPrototypeOf(node)) {
							this.updateSlider(node, values);
							BDFDB.ListenerUtils.addToChildren(node, "mousedown", BDFDB.dotCN._timedlightdarkmodetimergrabber, event => {this.dragSlider(event.currentTarget);});
							BDFDB.ListenerUtils.addToChildren(node, "mouseenter", BDFDB.dotCN._timedlightdarkmodedategrabber, event => {this.showCurrentTime(event.currentTarget);});
						}
					})
				]
			}), settingsbox);
			console.log(settingsbox);
			e.node.parentElement.appendChild(settingsbox);
		}
	}

	startInterval () {
		BDFDB.TimeUtils.clear(this.checkInterval);
		if (BDFDB.DataUtils.get(this, "settings", "running")) {
			let values = BDFDB.DataUtils.get(this, "values");
			let inverted = values.timer1 > values.timer2;
			let timer1LOW = this.getTime(values.timer1), timer2LOW = this.getTime(values.timer2);
			let timer1HIGH = this.getHighTime(timer2LOW), timer2HIGH = this.getHighTime(timer1LOW);
			let check = _ => {
				let currenttime = new Date();
				let currenthours = currenttime.getHours();
				let currentminutes = currenttime.getMinutes();
				if (inverted) this.changeTheme(!(this.checkTime(timer1LOW, timer1HIGH, [currenthours, currentminutes])));
				else this.changeTheme(this.checkTime(timer2LOW, timer2HIGH, [currenthours, currentminutes]));
			};
			check();
			this.checkInterval = BDFDB.TimeUtils.interval(check, 60000);
		}
	}

	checkTime (timerLOW, timerHIGH, time) {
		return timerHIGH[0] > time[0] || timerHIGH[0] == time[0] && timerHIGH[1] >= time[1] || time[0] > timerLOW[0] || time[0] == timerLOW[0] && time[1] >= timerLOW[1];
	}

	changeTheme (dark) {
		let theme = BDFDB.DiscordUtils.getTheme();
		if (dark && theme == BDFDB.disCN.themelight) BDFDB.LibraryModules.SettingsUtils.updateLocalSettings({theme:"dark"});
		else if (!dark && theme == BDFDB.disCN.themedark) BDFDB.LibraryModules.SettingsUtils.updateLocalSettings({theme:"light"});
	}

	showCurrentTime (grabber) {
		let currenttime = new Date();
		let currenthours = currenttime.getHours();
		let currentminutes = currenttime.getMinutes();
		let bubble = BDFDB.DOMUtils.create(`<span class="${BDFDB.disCN.sliderbubble}">${(currenthours > 9 ? currenthours : ("0" + currenthours)) + ":" + (currentminutes > 9 ? currentminutes : ("0" + currentminutes))}</span>`);
		grabber.appendChild(bubble);
		grabber.style.setProperty("left", `${this.getPercent(currenttime)}%`);
		let mouseleave = _ => {
			BDFDB.DOMUtils.remove(bubble);
			grabber.removeEventListener("mouseleave", mouseleave);
		};
		grabber.addEventListener("mouseleave", mouseleave);
	}

	dragSlider (grabber) {
		let track = grabber.parentNode;
		if (BDFDB.DOMUtils.containsClass(track.parentNode, BDFDB.disCN.sliderdisabled)) return;
		let timer = grabber.getAttribute("timer");
		let input = track.parentNode.querySelector(`${BDFDB.dotCN.sliderinput}[timer="${timer}"]`);
		let values = BDFDB.DataUtils.get(this, "values");

		BDFDB.DOMUtils.appendLocalStyle("disableTextSelection", `*{user-select: none !important;}`);

		let value = values[timer];
		let othervalue = timer == "timer1" ? values.timer2 : values.timer1;
		let sY = 0;
		let sHalfW = BDFDB.DOMUtils.getRects(grabber).width/2;
		let sMinX = BDFDB.DOMUtils.getRects(track).left;
		let sMaxX = sMinX + BDFDB.DOMUtils.getRects(track).width;
		let bubble = BDFDB.DOMUtils.create(`<span class="${BDFDB.disCN.sliderbubble}">${this.getTime(value, true)}</span>`);
		grabber.appendChild(bubble);
		let mouseup = _ => {
			document.removeEventListener("mouseup", mouseup);
			document.removeEventListener("mousemove", mousemove);
			BDFDB.DOMUtils.remove(bubble);
			BDFDB.DOMUtils.removeLocalStyle("disableTextSelection");
			BDFDB.DataUtils.save(value, this, "values", timer);
			this.startInterval();
		};
		let mousemove = e => {
			sY = e.clientX > sMaxX ? sMaxX - sHalfW : (e.clientX < sMinX ? sMinX - sHalfW : e.clientX - sHalfW);
			value = BDFDB.NumberUtils.mapRange([sMinX - sHalfW, sMaxX - sHalfW], [0, 100], sY);
			input.value = value;
			grabber.style.setProperty("left", value + "%");
			bubble.innerText = this.getTime(value, true);
			values[timer] = value;
			this.updateSlider(track.parentNode, values);
		};
		document.addEventListener("mouseup", mouseup);
		document.addEventListener("mousemove", mousemove);
	}

	updateSlider (slider, values) {
		let bar = slider.querySelector(BDFDB.dotCN.sliderbar);
		let fill = slider.querySelector(BDFDB.dotCN.sliderbarfill);
		let inverted = values.timer1 > values.timer2;
		fill.style.setProperty("width", (inverted ? (values.timer1 - values.timer2) : (values.timer2 - values.timer1)) + "%");
		fill.style.setProperty("margin-left", (inverted ? values.timer2 : values.timer1) + "%");
		fill.style.setProperty("background-color", inverted ? "#66757F" : "#E0C460", "important");
		bar.style.setProperty("background-color", inverted ? "#E0C460" : "#66757F", "important");
	}

	getTime (percent, stringify) {
		let time = BDFDB.NumberUtils.mapRange([0, 100], [0, 1440], percent)/60;
		let hours = Math.floor(time);
		let minutes = Math.floor((time - hours) * 60);
		return stringify ? (hours > 9 ? hours : ("0" + hours)) + ":" + (minutes > 9 ? minutes : ("0" + minutes)) : [hours,minutes];
	}

	getPercent (time) {
		if (!time) return 0;
		let hours = Array.isArray(time) ? time[0] : (typeof time == "object" && typeof time.getHours == "function" ? time.getHours() : 0);
		let minutes = Array.isArray(time) ? time[1] : (typeof time == "object" && typeof time.getMinutes == "function" ? time.getMinutes() : 0);
		return BDFDB.NumberUtils.mapRange([0, 1440], [0, 100], (hours * 60) + minutes);
	}

	getHighTime (timer) {
		let hours = timer[0];
		let minutes = timer[1] - 1;
		if (minutes < 0) {
			minutes = 59;
			hours -= 1;
		}
		if (hours < 0) hours = 0;
		return [hours, minutes];
	}
}