//META{"name":"TimedLightDarkMode","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/TimedLightDarkMode","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/TimedLightDarkMode/TimedLightDarkMode.plugin.js"}*//

class TimedLightDarkMode {
	getName () {return "TimedLightDarkMode";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to automatically change light/dark mode depending on the time of date. Slider is added to the 'Appearance' settings.";}

	initConstructor () {
		this.patchModules = {
			"RadioGroup":"componentDidMount"
		};
		
		this.defaults = {
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
			
			BDFDB.removeEles(".TLDM-slider", ".TLDM-header");
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	processRadioGroup (instance, wrapper) {
		if (instance.props && Array.isArray(instance.props.options) && instance.props.options[0] && instance.props.options[0].value == "light" && instance.props.options[1] && instance.props.options[1].value == "dark" && wrapper.parentElement.firstElementChild.innerText && wrapper.parentElement.firstElementChild.innerText.toUpperCase() == BDFDB.LanguageStrings.THEME.toUpperCase()) {
			var values = BDFDB.getAllData(this, "values");
			var header = BDFDB.htmlToElement(`<h5 class="${BDFDB.disCNS.h5 + BDFDB.disCNS.h5defaultmargin + BDFDB.disCN.margintop8} TLDM-header">${BDFDB.LanguageStrings.THEME} Timer</h5>`);
			var slider = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.slider + BDFDB.disCN.margintop20} TLDM-slider"><input type="number" key="timer1" class="${BDFDB.disCN.sliderinput}" value="${values.timer1}" readonly=""><input type="number" key="timer2" class="${BDFDB.disCN.sliderinput}" value="${values.timer2}" readonly=""><div class="${BDFDB.disCN.slidertrack}"><div class="${BDFDB.disCN.slidermark}" style="left: 0%;"><div class="${BDFDB.disCN.slidermarkvalue}">00:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 12.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">03:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 25%;"><div class="${BDFDB.disCN.slidermarkvalue}">06:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 37.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">09:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 50%;"><div class="${BDFDB.disCN.slidermarkvalue}">12:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 62.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">15:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 75%;"><div class="${BDFDB.disCN.slidermarkvalue}">18:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 87.5%;"><div class="${BDFDB.disCN.slidermarkvalue}">21:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div><div class="${BDFDB.disCN.slidermark}" style="left: 100%;"><div class="${BDFDB.disCN.slidermarkvalue}">24:00</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div></div><div class="${BDFDB.disCN.sliderbar}"><div class="${BDFDB.disCN.sliderbarfill}"></div></div><div class="${BDFDB.disCN.slidertrack}"><div class="${BDFDB.disCN.slidergrabber}" key="timer1" style="left: ${values.timer1}%;"></div><div class="${BDFDB.disCN.slidergrabber}" key="timer2" style="left: ${values.timer2}%;"></div></div></div>`);
			wrapper.parentElement.appendChild(header);
			wrapper.parentElement.appendChild(slider);
			this.updateSlider(slider, values);
			BDFDB.addChildEventListener(slider, "mousedown", BDFDB.dotCN.slidergrabber, e => {this.dragSlider(e.currentTarget);});
		}
	}
	
	startInterval () {
		clearInterval(this.checkInterval);
		var values = BDFDB.getAllData(this, "values");
		var inverted = values.timer1 > values.timer2;
		var timer1LOW = this.getTime(values.timer1), timer2LOW = this.getTime(values.timer2);
		var timer1HIGH = this.getHighTime(timer2LOW), timer2HIGH = this.getHighTime(timer1LOW);
		this.checkInterval = setInterval(() => {
			var currenttime = new Date();
			var currenthours = currenttime.getHours();
			var currentminutes = currenttime.getMinutes();
			if (inverted) this.changeTheme(!(this.checkTime(timer1LOW, timer1HIGH, [currenthours, currentminutes])));
			else this.changeTheme(this.checkTime(timer2LOW, timer2HIGH, [currenthours, currentminutes]));
		},60000);
	}
	
	checkTime (timerLOW, timerHIGH, time) {
		return timerHIGH[0] > time[0] || timerHIGH[0] == time[0] && timerHIGH[1] >= time[1] || time[0] > timerLOW[0] || time[0] == timerLOW[0] && time[1] >= timerLOW[1];
	}
	
	changeTheme (dark) {
		var theme = BDFDB.getDiscordTheme();
		if (dark && theme == BDFDB.disCN.themelight) this.SettingsUtils.updateRemoteSettings({theme:"dark"});
		else if (!dark && theme == BDFDB.disCN.themedark) this.SettingsUtils.updateRemoteSettings({theme:"light"});
	}
	

	dragSlider (grabber) {
		var track = grabber.parentNode;
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