//META{"name":"NotificationSounds"}*//

class NotificationSounds {
	constructor () {
		this.types = {
			"message1":				{implemented:true,	name:"New Chatmessage",					src:"/assets/dd920c06a01e5bb8b09678581e29d56f.mp3"},
			"dm":					{implemented:true,	name:"Direct Message",					src:"/assets/84c9fa3d07da865278bd77c97d952db4.mp3"},
			"mentioned":			{implemented:true,	name:"Mention Ping",					src:"/assets/a5f42064e8120e381528b14fd3188b72.mp3"},
			"deafen":				{implemented:true,	name:"Voicechat Deafen",				src:"/assets/e4d539271704b87764dc465b1a061abd.mp3"},
			"mute":					{implemented:true,	name:"Voicechat Mute",					src:"/assets/429d09ee3b86e81a75b5e06d3fb482be.mp3"},
			"disconnect":			{implemented:true,	name:"Voicechat Disconnect",			src:"/assets/7e125dc075ec6e5ae796e4c3ab83abb3.mp3"},
			"undeafen":				{implemented:true,	name:"Voicechat Undeafen",				src:"/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3"},
			"unmute":				{implemented:true,	name:"Voicechat Unmute",				src:"/assets/43805b9dd757ac4f6b9b58c1a8ee5f0d.mp3"},
			"user_join":			{implemented:true,	name:"Voicechat User Joined",			src:"/assets/5dd43c946894005258d85770f0d10cff.mp3"},
			"user_leave":			{implemented:true,	name:"Voicechat User Left",				src:"/assets/4fcfeb2cba26459c4750e60f626cebdc.mp3"},
			"user_moved":			{implemented:true,	name:"Voicechat User Moved",			src:"/assets/e81d11590762728c1b811eadfa5be766.mp3"},
			"ptt_start":			{implemented:true,	name:"Push2Talk Start",					src:"/assets/8b63833c8d252fedba6b9c4f2517c705.mp3"},
			"ptt_stop":				{implemented:true,	name:"Push2Talk Stop",					src:"/assets/74ab980d6890a0fa6aa0336182f9f620.mp3"},
			"call_calling":			{implemented:true,	name:"Outgoing Call",					src:"/assets/c6e92752668dde4eee5923d70441579f.mp3"},
			"call_ringing":			{implemented:true,	name:"Incoming Call",					src:"/assets/84a1b4e11d634dbfa1e5dd97a96de3ad.mp3"},
			"call_ringing_beat":	{implemented:false,	name:"Incoming Call Beat",				src:"/assets/b9411af07f154a6fef543e7e442e4da9.mp3"},
			"ddr-down":				{implemented:false,	name:"Dance Dance Revolution Down",		src:"/assets/71f048f8aa7d4b24bf4268a87cbbb192.mp3"},
			"ddr-left":				{implemented:false,	name:"Dance Dance Revolution Left",		src:"/assets/1de04408e62b5d52ae3ebbb91e9e1978.mp3"},
			"ddr-right":			{implemented:false,	name:"Dance Dance Revolution Right",	src:"/assets/2c0433f93db8449e4a82b76dc520cb29.mp3"},
			"ddr-up":				{implemented:false,	name:"Dance Dance Revolution Up",		src:"/assets/68472713f7a62c7c37e0a6a5d5a1faeb.mp3"},
			"human_man":			{implemented:false,	name:"Human Man Voice",					src:"/assets/fa4d62c3cbc80733bf1f01b9c6f181de.mp3"},
			"mention1":				{implemented:false,	name:"Mention Ping1",					src:"/assets/fa4d62c3cbc80733bf1f01b9c6f181de.mp3"},
			"mention2":				{implemented:false,	name:"Mention Ping2",					src:"/assets/a5f42064e8120e381528b14fd3188b72.mp3"},
			"mention3":				{implemented:false,	name:"Mention Ping3",					src:"/assets/84c9fa3d07da865278bd77c97d952db4.mp3"},
			"message2":				{implemented:false,	name:"New Chatmessage 2",				src:"/assets/15fe810f6cfab609c7fcda61652b9b34.mp3"},
			"message3":				{implemented:false,	name:"New Chatmessage 3",				src:"/assets/53ce6a92d3c233e8b4ac529d34d374e4.mp3"},
			"overlayunlock":		{implemented:false,	name:"Overlay Unlocked",				src:"/assets/ad322ffe0a88436296158a80d5d11baa.mp3"},
			"reconnect":			{implemented:false,	name:"Voicechat Reconnect",				src:"/assets/471cfd0005b112ff857705e894bf41a6.mp3"},
			"robot_man":			{implemented:false,	name:"Robot Man Voice",					src:"/assets/66598bea6e59eb8acdf32cf2d9d75ba9.mp3"}
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
		
		this.firedEvents = {};
		
		this.dmObserver = new MutationObserver(() => {});
		this.dmBadgeObserver = new MutationObserver(() => {});
		this.mentionObserver = new MutationObserver(() => {});
		this.mentionBadgeObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		 
		this.css = `.NotificationSounds-settings div {margin-top:0 !important;} .NotificationSounds-settings .grabber-1TZCZi{margin-top:-13px !important;}`;
	}

	getName () {return "NotificationSounds";}
	
	getDescription () {return "Let's you change the internal sounds to your own custom ones for all native sounds of Discord.";}

	getVersion () {return "3.0.2";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			if (!this.SoundUtils) return;
			
			var fields = ["category","song"];
			
			var settingshtml = `<div class="${this.getName()}-settings marginTop20-3UscxH">`;
			
			settingshtml += `<div class="add-new-song-settings"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Add New Song:</h3></div><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">`;
			settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 33%;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">Categoryname:</h5><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ songInput" id="input-category"></div></div>`
			settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 33%;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">Songname:</h5><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ songInput" id="input-song"></div></div>`
			settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 33%;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">Songurl:</h5><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ songInput" id="input-url"></div></div>`
			settingshtml += `</div></div>`;
			
			for (var type in this.types) {
				var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
				var unimplemented = this.types[type].implemented ? "" : " unimplemented";
				settingshtml += `<div class="${type}-song-settings ${unimplemented}"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">${this.types[type].name}:</h3></div><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">`;
				for (var key of fields) {
					settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 33%;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">${key}:</h5><div class="ui-select ${key}-select-wrapper"><div type="${type}" option="${key}" value="${choice[key]}" class="Select Select--single has-value"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm">${choice[key]}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div></div></div>`;
				}
				settingshtml += `<div class="ui-form-item flexChild-1KGW5q" style="flex: 1 1 33%;"><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom4-_yArcI">volume:</h5><div type="${type}" class="slider-2e2iXJ"><input type="number" class="${type}-volume input-27JrJm volumeInput" value="${choice.volume}" readonly=""><div class="bar-2cFRGz"><div class="barFill-18ABna" style="width: ${choice.volume}%;"></div></div><div class="track-1h2wOF"><div class="grabber-1TZCZi" style="left: ${choice.volume}%;"></div></div></div></div>`;
				settingshtml += `</div></div>`;
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
				.on("mousedown", ".grabber-1TZCZi", (e) => {this.dragSlider(settingspanel,e);})
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
			
			this.SoundUtils = BDfunctionsDevilBro.WebModules.findByProperties(["playSound"]);
			
			if (this.SoundUtils) {
				this.patchCancel = BDfunctionsDevilBro.WebModules.monkeyPatch(this.SoundUtils, "playSound", {instead: (e) => {
					setImmediate(() => {
						var type = e.methodArguments[0];
						if (type == "message1") type = this.firedEvents["dm"] ? "dm" : this.firedEvents["mentioned"] ? "mentioned" : type;
						var audio = new Audio();
						audio.src = this.choices[type].src;
						audio.volume = this.choices[type].volume/100;
						audio.play();
					});
				}});
				
				this.loadAudios();
				this.loadChoices();
				
				
				this.dmBadgeObserver = new MutationObserver((changes, _) => {
					this.fireEvent("dm");
				});
				
				this.dmObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									this.dmBadgeObserver.observe(node, {characterData: true, subtree: true });
									this.fireEvent("dm");
								});
							}
						}
					);
				});
				if (document.querySelector(".dms")) this.dmObserver.observe(document.querySelector(".dms"), {childList: true});
				
				this.mentionObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.className === "badge") {
										var data = BDfunctionsDevilBro.getKeyInformation({"node":node.parentElement,"key":"guild"});
										if (data) {
											this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
											if (this.oldmentions && this.oldmentions[data.id] == 0) this.fireEvent("mentioned");
										}
									}
									if (node && node.classList && node.classList.contains("guild") && !node.classList.contains("guilds-add") && !document.querySelector(".dms").contains(node)) {
										this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
									}
								});
							}
							if (change.removedNodes) {
								change.removedNodes.forEach((node) => {
									if (node && node.className === "badge") {
										this.oldmentions = BDfunctionsDevilBro.getKeyInformation({"node":document.querySelector(".layers"),"key":"mentionCounts"});
									}
								});
							}
						}
					);
				});
				if (document.querySelector(".guilds.scroller")) this.mentionObserver.observe(document.querySelector(".guilds.scroller"), {childList: true, subtree:true});
				
				this.mentionBadgeObserver = new MutationObserver((changes, _) => {
					this.fireEvent("mentioned");
				});
				
				this.channelListObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.classList && node.classList.contains("iconSpacing-5GIHkT") && $(node).find(".wrapper-2xO9RX").length > 0) {
										this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
										this.fireEvent("mentioned");
										this.oldmentions = BDfunctionsDevilBro.getKeyInformation({"node":$(".flex-vertical.channels-wrap").parent()[0],"key":"mentionCounts"});
									}
								});
							}
							if (change.removedNodes) {
								change.removedNodes.forEach((node) => {
									if (node.classList && node.classList.contains("iconSpacing-5GIHkT") && $(node).find(".wrapper-2xO9RX").length > 0) {
										this.oldmentions = BDfunctionsDevilBro.getKeyInformation({"node":$(".flex-vertical.channels-wrap").parent()[0],"key":"mentionCounts"});
									}
								});
							}
						}
					);
				});
				if (document.querySelector(".channels-3g2vYe")) this.channelListObserver.observe(document.querySelector(".channels-3g2vYe"), {childList: true, subtree: true});
				
				BDfunctionsDevilBro.readServerList().forEach((serverObj) => {
					var badge = serverObj.div.querySelector(".badge");
					if (badge) {
						this.mentionBadgeObserver.observe(badge, {characterData: true, subtree: true});
					}
				});
				
				BDfunctionsDevilBro.readDmList().forEach((dmObj) => {
					var badge = dmObj.div.querySelector(".badge");
					if (badge) {
						this.dmBadgeObserver.observe(badge, {characterData: true, subtree: true});
					}
				});
				
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
			
			this.dmObserver.disconnect();
			this.dmBadgeObserver.disconnect();
			this.mentionObserver.disconnect();
			this.mentionBadgeObserver.disconnect();
			this.channelListObserver.disconnect();
			
			if (typeof this.patchCancel === "function") this.patchCancel();
			
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
			settingspanel.querySelectorAll(".grabber-1TZCZi").forEach((grabber) => {
				grabber.style.left = "100%";
			});
			settingspanel.querySelectorAll(".barFill-18ABna").forEach((bar) => {
				bar.style.width = "100%";
			});
			settingspanel.querySelectorAll(".volumeInput").forEach((input) => {
				input.value = 100;
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
			choice.src = this.audios[choice.category][choice.song];
			choice.src = choice.src ? choice.src : this.types[type].src;
			choice.volume = settingspanel.querySelector(`.${type}-volume`).value;
			this.saveChoice(type, choice, settingspanel.querySelector(".sound-preview"));
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
	
	dragSlider (settingspanel, e) {
		var grabber = e.target;
		var track = grabber.parentNode;
		var slider = track.parentNode;
		var input = slider.querySelector(".volumeInput");
		var bar = slider.querySelector(".barFill-18ABna");
		
		var volume = 0;
		var sY = 0;
		var sHalfW = grabber.offsetWidth/2;
		var sMinX = $(track).offset().left;
		var sMaxX = sMinX + track.offsetWidth;
		$(document)
			.off("mouseup.slider" + this.getName()).off("mousemove.slider" + this.getName())
			.on("mouseup.slider" + this.getName(), () => {
				$(document).off("mouseup.slider" + this.getName()).off("mousemove.slider" + this.getName());
				var type = slider.getAttribute("type");
				var choice = this.choices[type];
				choice.volume = volume;
				this.saveChoice(type, choice, settingspanel.querySelector(".sound-preview"));
			})
			.on("mousemove.slider" + this.getName(), (e2) => {
				sY = e2.clientX > sMaxX ? sMaxX - sHalfW : (e2.clientX < sMinX ? sMinX - sHalfW : e2.clientX - sHalfW);
				volume = BDfunctionsDevilBro.mapRange([sMinX - sHalfW, sMaxX - sHalfW], [0, 100], sY);
				grabber.style.left = volume + "%";
				bar.style.width = volume + "%";
				input.value = volume;
			});
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
		var inputs = settingspanel.querySelectorAll(".songInput");
		inputs.forEach((input) => {
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
						inputs.forEach((input) => {
							input.value = "";
						});
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
							songFound = true;
							break;
						}
					}
				}
			}
			if (!songFound) choice = {"category":"---","song":"---","volume":100,"src":this.types[type].src};
			this.saveChoice(type, choice, null);
		}
	}
	
	saveChoice (type, choice, audio) {
		BDfunctionsDevilBro.saveData(type, choice, this.getName(), "choices");
		this.choices[type] = choice;
		if (audio) {
			audio.pause();
			audio.volume = choice.volume/100;
			audio.src = choice.src;
			audio.play();
		}
	}
	
	fireEvent (type) {
		this.firedEvents[type] = true;
		setTimeout(() => {this.firedEvents[type] = false;},500);
	}
}
