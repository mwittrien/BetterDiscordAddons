//META{"name":"NotificationSounds"}*//

class NotificationSounds {
	constructor () {
		this.types = {
			"call_calling":			{implemented:true,	src:"c6e92752668dde4eee5923d70441579f.mp3"},
			"call_ringing":			{implemented:true,	src:"84a1b4e11d634dbfa1e5dd97a96de3ad.mp3"},
			"call_ringing_beat":	{implemented:false,	src:"b9411af07f154a6fef543e7e442e4da9.mp3"},
			"ddr-down":				{implemented:false,	src:"71f048f8aa7d4b24bf4268a87cbbb192.mp3"},
			"ddr-left":				{implemented:false,	src:"1de04408e62b5d52ae3ebbb91e9e1978.mp3"},
			"ddr-right":			{implemented:false,	src:"2c0433f93db8449e4a82b76dc520cb29.mp3"},
			"ddr-up":				{implemented:false,	src:"68472713f7a62c7c37e0a6a5d5a1faeb.mp3"},
			"deafen":				{implemented:true,	src:"e4d539271704b87764dc465b1a061abd.mp3"},
			"disconnect":			{implemented:true,	src:"7e125dc075ec6e5ae796e4c3ab83abb3.mp3"},
			"human_man":			{implemented:false,	src:"a37dcd6272ae41cf49295d58c9806fe3.mp3"},
			"mention1":				{implemented:false,	src:"fa4d62c3cbc80733bf1f01b9c6f181de.mp3"},
			"mention2":				{implemented:false,	src:"a5f42064e8120e381528b14fd3188b72.mp3"},
			"mention3":				{implemented:false,	src:"84c9fa3d07da865278bd77c97d952db4.mp3"},
			"message1":				{implemented:true,	src:"dd920c06a01e5bb8b09678581e29d56f.mp3"},
			"message2":				{implemented:false,	src:"15fe810f6cfab609c7fcda61652b9b34.mp3"},
			"message3":				{implemented:false,	src:"53ce6a92d3c233e8b4ac529d34d374e4.mp3"},
			"mute":					{implemented:true,	src:"429d09ee3b86e81a75b5e06d3fb482be.mp3"},
			"overlayunlock":		{implemented:false,	src:"ad322ffe0a88436296158a80d5d11baa.mp3"},
			"ptt_start":			{implemented:true,	src:"8b63833c8d252fedba6b9c4f2517c705.mp3"},
			"ptt_stop":				{implemented:true,	src:"74ab980d6890a0fa6aa0336182f9f620.mp3"},
			"reconnect":			{implemented:false,	src:"471cfd0005b112ff857705e894bf41a6.mp3"},
			"robot_man":			{implemented:false,	src:"66598bea6e59eb8acdf32cf2d9d75ba9.mp3"},
			"undeafen":				{implemented:true,	src:"5a000a0d4dff083d12a1d4fc2c7cbf66.mp3"},
			"unmute":				{implemented:true,	src:"43805b9dd757ac4f6b9b58c1a8ee5f0d.mp3"},
			"user_join":			{implemented:true,	src:"5dd43c946894005258d85770f0d10cff.mp3"},
			"user_leave":			{implemented:true,	src:"4fcfeb2cba26459c4750e60f626cebdc.mp3"},
			"user_moved":			{implemented:true,	src:"e81d11590762728c1b811eadfa5be766.mp3"}
		};
		
		this.defaults = {
			"---": {
				"---":						null
			},
			"Default": {
				"Communication Channel": 	"https://notificationsounds.com/soundfiles/63538fe6ef330c13a05a3ed7e599d5f7/file-sounds-917-communication-channel.wav",
				"Isn't it": 				"https://notificationsounds.com/soundfiles/ba2fd310dcaa8781a9a652a31baf3c68/file-sounds-969-isnt-it.wav",
				"Job Done": 				"https://notificationsounds.com/soundfiles/5b69b9cb83065d403869739ae7f0995e/file-sounds-937-job-done.wav",
				"Served": 					"https://notificationsounds.com/soundfiles/b337e84de8752b27eda3a12363109e80/file-sounds-913-served.wav",
				"Solemn": 					"https://notificationsounds.com/soundfiles/53fde96fcc4b4ce72d7739202324cd49/file-sounds-882-solemn.wav",
				"System Fault": 			"https://notificationsounds.com/soundfiles/ebd9629fc3ae5e9f6611e2ee05a31cef/file-sounds-990-system-fault.wav",
				"You wouldn't believe": 	"https://notificationsounds.com/soundfiles/087408522c31eeb1f982bc0eaf81d35f/file-sounds-949-you-wouldnt-believe.wav"
			}
		};
		
		this.audios = {};
		
		this.choices = [];
		
		this.oldmentions = {};
		
		this.dmObserver = new MutationObserver(() => {});
		this.dmBadgeObserver = new MutationObserver(() => {});
		this.mentionObserver = new MutationObserver(() => {});
		this.mentionBadgeObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		 
		this.css = `.NotificationSounds-settings div {margin-top:0 !important;}`;
	}

	getName () {return "NotificationSounds";}

	getDescription () {return "Template to create my plugins.";}

	getVersion () {return "3.0.0";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			if (!this.functionData) return;
			
			var settingshtml = `<div class="${this.getName()}-settings marginTop20-3UscxH">`;
			
			settingshtml += `<div class="${type}-song-settings flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">`;
			settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 auto;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">Categoryname:</h5><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ songInput" id="input-category"></div></div>`
			settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 auto;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">Songname:</h5><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ songInput" id="input-song"></div></div>`
			settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 auto;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">Songurl:</h5><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ songInput" id="input-url"></div></div>`
			settingshtml += `</div>`;
			
			for (var type in this.types) {
				var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
				var unimplemented = this.types[type].implemented ? "" : " unimplemented";
				settingshtml += `<div class="${type}-song-settings flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom8-1mABJ4${unimplemented}" style="flex: 1 1 auto;">`;
				for (var key in choice) {
					settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 auto;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">${type}-${key}:</h5><div class="ui-select ${key}-select-wrapper"><div type="${type}" option="${key}" value="${choice[key]}" class="Select Select--single has-value"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm">${choice[key]}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div></div></div>`;
				}
				settingshtml += `</div>`;
			}
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Show unimplemented Sounds</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-unimplemented"></div></div>`;
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto; padding-top:8px;">Remove all added songs.</h3><button type="button" class="flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu reset-button" style="flex: 0 0 auto;"><div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">Reset</div></button></div>`;
			settingshtml += `<audio class="sound-preview"></audio>`;
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];
			$(settingspanel)
				.on("click", ".Select-control", (e) => {this.openDropdownMenu(settingspanel, e);})
				.on("keyup", ".songInput", (e) => {if (e.which == 13) this.saveAudio(settingspanel);})
				.on("click", ".reset-button", () => {this.resetAll(settingspanel);})
				.on("click", "#input-unimplemented", (e) => {this.toggleUnimplemented(settingspanel,e);})
				.find(".unimplemented").hide();
				
			return settingspanel;
		}
	}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			if (!BDfunctionsDevilBro.loadData("warning1", this.getName(), "warning1")) {
				BDfunctionsDevilBro.removeAllData(this.getName(), "songs");
				BDfunctionsDevilBro.removeAllData(this.getName(), "choices");
				BDfunctionsDevilBro.removeAllData(this.getName(), "audios");
				alert("Welcome to the new NotificationSounds Plugin using the internal functions of Discord, this allows you to change all internal sounds that Discord offers. And also let's you explore sounds that aren't yet implemented.");
				BDfunctionsDevilBro.saveData("warning1", true, this.getName(), "warning1");
			}
			
			this.functionData = BDfunctionsDevilBro.WebModules.findFunction((module) => module.toString().indexOf("./call_ringing.mp3") > -1);
			if (this.functionData) {
				this.patchCancel = BDfunctionsDevilBro.WebModules.patchFunction((e) => {
					return this.choices && this.choices[e] ? this.choices[e].sound : null;
				},this.functionData.id);
				
				this.loadAudios();
				this.loadChoices();
				
				BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			}
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this);
			
			if (this.patchCancel) {
				this.patchCancel();
			}
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}

	
	// begin of own functions
	
	resetAll (settingspanel) {
		if (confirm("Are you sure you want to delete all added songs?")) {
			BDfunctionsDevilBro.removeAllData(this.getName(), "choices");
			BDfunctionsDevilBro.removeAllData(this.getName(), "audios");
			this.loadAudios();
			this.loadChoices();
			settingspanel.querySelectorAll(".Select").forEach((wrap) => {
				wrap.setAttribute("value", "---");
				wrap.querySelector(".title-3I2bY1").innerText = "---";
			});
		}
	}
	
	openDropdownMenu (settingspanel, e) {
		var selectControl = e.currentTarget;
		var selectWrap = selectControl.parentElement;
		
		if (selectWrap.classList.contains("is-open")) return;
		
		selectWrap.classList.add("is-open");
		
		var type = selectWrap.getAttribute("type");
		var option = selectWrap.getAttribute("option");
		var categorySelect = settingspanel.querySelector(`.Select[type="${type}"][option="category"]`);
		var songSelect = settingspanel.querySelector(`.Select[type="${type}"][option="song"]`);
		var audioPreview = settingspanel.querySelector(".sound-preview");
		
		if (!categorySelect || !songSelect || !audioPreview) return;
		
		var category = categorySelect.getAttribute("value");
		var song = songSelect.getAttribute("value");
		
		var selectMenu = this.createDropdownMenu({type, option, category, song});
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), ".Select-option", (e2) => {
			var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
			var selection = e2.currentTarget.textContent;
			selectWrap.setAttribute("value", selection);
			selectControl.querySelector(".title-3I2bY1").innerText = selection;
			choice[option] = selection;
			if (option == "category") {
				choice.song = Object.keys(this.audios[selection])[0];
				songSelect.outerHTML = `<div type="${type}" option="song" value="${choice.song}" class="Select Select--single has-value"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm">${choice.song}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div>`;
			}
			this.saveChoice(type, choice);
			var url = this.audios[choice.category][choice.song];
			url = url ? url : "/assets/" + this.types[type].src;
			if (url) {
				audioPreview.pause();
				audioPreview.src = url;
				audioPreview.play();
			}
		});
		$(document).on("mousedown.select" + this.getName(), () => {
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove()
			setTimeout(() => {selectWrap.classList.remove("is-open");},100);
		});
	}
	
	createDropdownMenu ({type, option, category, song} = data) {
		var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
		var eles = option == "song" ? this.audios[category] : this.audios;
		var menuhtml = `<div class="Select-menu-outer"><div class="Select-menu">`;
		for (var ele in eles) {
			var isSelected = choice[option] == ele ? " is-selected" : "";
			menuhtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-option ${isSelected}" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm">${ele}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	toggleUnimplemented (settingspanel, e) {
		var checked = $(e.target).prop("checked");
		$(e.target.parentElement)
			.toggleClass("valueChecked-3Bzkbm", checked)
			.toggleClass("valueUnchecked-XR6AOk", checked);
			
		$(settingspanel).find(".unimplemented").toggle(checked);
	}
	
	loadAudios () {
		this.audios = BDfunctionsDevilBro.loadAllData(this.getName(), "audios");
		if (BDfunctionsDevilBro.isObjectEmpty(this.audios)) this.audios = this.defaults;
		BDfunctionsDevilBro.saveAllData(this.audios, this.getName(), "audios");
	}
	
	saveAudio (settingspanel) {
		var valid = true;
		settingspanel.querySelectorAll(".songInput").forEach((input) => {
			if (!input.value || input.value.length == 0 || input.value.trim().length == 0) valid = false;
		});
		if (valid) {
			let request = require("request");
			var category = settingspanel.querySelector("#input-category").value;
			var song = settingspanel.querySelector("#input-song").value;
			var url = settingspanel.querySelector("#input-url").value;
			request(url, (error, response, result) => {
				if (response) {
					var type = response.headers["content-type"];
					if (type && (type.indexOf("octet-stream") > -1 || type.indexOf("audio") > -1 || type.indexOf("viodeo") > -1)) {
						BDfunctionsDevilBro.showToast(`Song ${song} was added to category ${category}.`, {type:"success"});
						if (!this.audios[category]) this.audios[category] = {};
						this.audios[category][song] = url;
						BDfunctionsDevilBro.saveAllData(this.audios, this.getName(), "audios");
						return;
					}
				}
				BDfunctionsDevilBro.showToast("Use a valid direct link to a video or audio source. They usually end on something like .mp3, .mp4 or .wav.", {type:"danger"});
			});
		}
		else {
			BDfunctionsDevilBro.showToast("Fill out all fields to add a new song.", {type:"danger"});
		}
	}
	
	loadChoices () {
		for (var type in this.types) {
			var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
			choice = choice ? choice : {};
			
			var songFound = false;
			for (var category in this.audios) {
				if (choice.category == category) {
					for (var song in this.audios[category]) {
						if (choice.song == song) {
							choice = {"category":category,"song":song};
							songFound = true;
							break;
						}
					}
				}
			}
			if (!songFound) choice = {"category":"---","song":"---"};
			this.saveChoice(type, choice);
		}
	}
	
	saveChoice (type, choice) {
		BDfunctionsDevilBro.saveData(type, choice, this.getName(), "choices");
		this.choices["./" + type + ".mp3"] = {sound: this.audios[choice.category][choice.song]};
	}
}
