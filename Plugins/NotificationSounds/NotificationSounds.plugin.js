//META{"name":"NotificationSounds"}*//

class NotificationSounds {
	constructor () {
		this.types = ["DM", "Mention", "Message"];
		
		// to add a new song choose a name and add a new line in the array "NAME":"URL"
		this.audios = {
			"---": {
				"---":						null
			},
			"Default":{
				"Communication Channel": 	"https://notificationsounds.com/soundfiles/63538fe6ef330c13a05a3ed7e599d5f7/file-sounds-917-communication-channel.wav",
				"Isn't it": 				"https://notificationsounds.com/soundfiles/ba2fd310dcaa8781a9a652a31baf3c68/file-sounds-969-isnt-it.wav",
				"Job Done": 				"https://notificationsounds.com/soundfiles/5b69b9cb83065d403869739ae7f0995e/file-sounds-937-job-done.wav",
				"Served": 					"https://notificationsounds.com/soundfiles/b337e84de8752b27eda3a12363109e80/file-sounds-913-served.wav",
				"Solemn": 					"https://notificationsounds.com/soundfiles/53fde96fcc4b4ce72d7739202324cd49/file-sounds-882-solemn.wav",
				"System Fault": 			"https://notificationsounds.com/soundfiles/ebd9629fc3ae5e9f6611e2ee05a31cef/file-sounds-990-system-fault.wav",
				"You wouldn't believe": 	"https://notificationsounds.com/soundfiles/087408522c31eeb1f982bc0eaf81d35f/file-sounds-949-you-wouldnt-believe.wav"
			}
		};
		
		this.oldMentions = {};
		
		this.switching = false;
		
		this.myID;
		
		this.dmObserver = new MutationObserver(() => {});
		this.dmBadgeObserver = new MutationObserver(() => {});
		this.mentionObserver = new MutationObserver(() => {});
		this.mentionBadgeObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.messageChangeObserver = new MutationObserver(() => {});
	}

	getName () {return "NotificationSounds";}

	getDescription () {return "Creates a notification sound when you receive a notification (mention or DM).";}

	getVersion () {return "2.5.9";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settingshtml = `<div class="${this.getName()}-settings">`;
			
			var songs = BDfunctionsDevilBro.loadAllData(this.getName(), "songs");
			
			for (var i in this.types) {
				var type = this.types[i];
				var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
				choice = choice ? choice : {};
				settingshtml += `<label style="color:grey;">${type}-Sound:</label><div class="${type}-song-settings" style="margin:0px 0px 0px 0px; overflow:hidden;">`;
				settingshtml += `<div class="category-select-wrapper" style="margin:0px 20px 0px 0px; float:left;"><select soundtype="${type}" class="category-select" id="${type}-category-select" style="width:150px; height: 25px;">`;
				for (var category in songs) {
					var cSelected = choice.category == category ? " selected" : "";
					if (cSelected) {
						var songselectionhtml = `<div class="song-select-wrapper" style="margin:0px 20px 0px 0px; float:left;"><select soundtype="${type}" class="song-select" id="${type}-song-select" style="width:150px; height: 25px;">`;
						for (var song in songs[category]) {
							var src = songs[category][song] ? " src=" + songs[category][song] : "";
							if (song && song != "") {
								var sSelected = choice.song == song ? " selected" : "";
								songselectionhtml += `<option${src}${sSelected}>${song}</option>`;
							}
						}
						songselectionhtml += `</select></div>`;
					}
					settingshtml += `<option${cSelected}>${category}</option>`;
				}
				settingshtml += `</select></div>`;
				settingshtml += songselectionhtml;
				var volume = choice.volume ? choice.volume : "100";
				settingshtml += `<div class="volume-slider-wrapper" style="margin:0px 20px 0px 0px; float:left;"><input soundtype="${type}" type="range" min="0" max="100" value="${volume}" class="volume-slider" id="${type}-volume-slider"></div>`;
				settingshtml += `<div class="volume-input-wrapper" style="margin:0px 0px 0px 0px; float:left;"><input soundtype="${type}" type="number" min="0" max="100" value="${volume}" class="volume-input" id="${type}-volume-input" style="height: 25px; width:50px; text-align:center;"></div>`;
				settingshtml += `</div>`;
				settingshtml += `<div class="checkbox-wrapper" style="margin:0px 0px 20px 0px;"><label style="color:grey;"><input class="dnddisable-checkbox" type="checkbox" value="${type}"${BDfunctionsDevilBro.loadData(type, this.getName(), "dnddisable") ? " checked" : ""}>Disable notifications when status is set to do not disturb.</label></div>`;
								
			}
			settingshtml += `<label style="color:grey;">Make sure to disable your default notification sounds in the notifications settings of Discord or else you will hear both the default notifications and the new custom notifications. If you want to add your own sounds just open the plugin file and add a new song (audio or video) in the list on the top and make sure the link you are using is a direct link pointing to a source file on a website or else it won't be added to the list and no a youtube link is not a direct link to a source file ...</label>`;
			settingshtml += `<audio class="sound-preview"></audio>`;
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];
			$(settingspanel)
				.on("change", ".dnddisable-checkbox", () => {this.updateDNDdisable(settingspanel);})
				.on("change", ".category-select, .song-select, .volume-slider, .volume-input", (e) => {this.updateSettings(settingspanel, e);})
				.on("input", ".volume-slider, .volume-input", (e) => {this.updateVolumeinput(settingspanel, e);});
				
			return settingspanel;
		}
    }

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.dmBadgeObserver = new MutationObserver((changes, _) => {
				this.playAudio("DM");
			});
			
			this.dmObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								this.dmBadgeObserver.observe(node, {characterData: true, subtree: true });
								this.playAudio("DM");
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
										if (this.oldMentions && this.oldMentions[data.id] == 0) this.playAudio("Mention");
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
									this.oldMentions = BDfunctionsDevilBro.getKeyInformation({"node":document.querySelector(".layers"),"key":"mentionCounts"});
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".guilds.scroller")) this.mentionObserver.observe(document.querySelector(".guilds.scroller"), {childList: true, subtree:true});
			
			this.mentionBadgeObserver = new MutationObserver((changes, _) => {
				this.playAudio("Mention");
			});
			
			this.channelListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.classList && node.classList.contains("iconSpacing-5GIHkT") && $(node).find(".wrapper-2xO9RX").length > 0) {
									this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
									this.playAudio("Mention");
									this.oldMentions = BDfunctionsDevilBro.getKeyInformation({"node":$(".flex-vertical.channels-wrap").parent()[0],"key":"mentionCounts"});
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node.classList && node.classList.contains("iconSpacing-5GIHkT") && $(node).find(".wrapper-2xO9RX").length > 0) {
									this.oldMentions = BDfunctionsDevilBro.getKeyInformation({"node":$(".flex-vertical.channels-wrap").parent()[0],"key":"mentionCounts"});
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".channels-3g2vYe")) this.channelListObserver.observe(document.querySelector(".channels-3g2vYe"), {childList: true, subtree: true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (!this.switching && $(node).find(".message").length > 0 && node == $(".message-group").last()[0]) {
									var messageData = BDfunctionsDevilBro.getKeyInformation({"node":node,"key":"message"});
									if (messageData && this.myID != messageData.author.id) {
										this.playAudio("Message");
										this.messageChangeObserver.observe(node, {childList:true, characterData:true, subtree:true});
									}
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
			
			this.messageChangeObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).attr("class") == "message" && $(".message-group").has(node)[0] == $(".message-group").last()[0]) {
									if (this.myID != BDfunctionsDevilBro.getKeyInformation({"node":$(".message-group").last()[0],"key":"message"}).author.id) {
										this.playAudio("Message");
									}
								}
							});
						}
					}
				);
			});
			
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
			
			this.myID = BDfunctionsDevilBro.getMyUserID();
			
			this.loadAudios();
			
			this.loadChoices();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
		
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.dmObserver.disconnect();
			this.dmBadgeObserver.disconnect();
			this.mentionObserver.disconnect();
			this.mentionBadgeObserver.disconnect();
			this.channelListObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.messageChangeObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switching = true;
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
			setTimeout(() => {this.switching = false;},5000);
		}
	}
	
	
	// begin of own functions
	
	playAudio (type) {
		if (BDfunctionsDevilBro.loadData(type, this.getName(), "dnddisable") && BDfunctionsDevilBro.getMyUserStatus() == "dnd") return;
		var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
		choice = choice ? choice : {};
		var songs = BDfunctionsDevilBro.loadAllData(this.getName(), "songs");
		
		for (var category in songs) {
			if (choice.category == category) {
				for (var song in songs[category]) {
					if (choice.song == song) {
						var url = songs[category][song];
						if (url != null) {
							var audio = new Audio();
							audio.src = url;
							audio.volume = choice.volume/100;
							audio.play();
						}
					}
				}
			}
		}
	}
	
	loadAudios () {
		for (var category in this.audios) {
			var data = {};
			for (var song in this.audios[category]) {
				data[song] = this.audios[category][song];
			}
			BDfunctionsDevilBro.saveData(category, data, this.getName(), "songs");
		}
	}
	
	loadChoices () {
		for (var i in this.types) {
			var type = this.types[i];
			var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
			choice = choice ? choice : {};
			var songs = BDfunctionsDevilBro.loadAllData(this.getName(), "songs");
			
			var songFound = false;
			for (var category in songs) {
				if (choice.category == category) {
					for (var song in songs[category]) {
						if (choice.song == song) {
							var volume = choice.volume ? choice.volume : "100";
							choice = {"category":category,"song":song,"volume":volume};
							songFound = true;
							break;
						}
					}
				}
			}
			if (!songFound) choice = {"category":"---","song":"---","volume":"100"};
			BDfunctionsDevilBro.saveData(type, choice, this.getName(), "choices");
		}
	}

    updateSettings (settingspanel, e) {
		var ele = e.target;
		var type = $(ele).attr("soundtype");
		
		var categoryselect = 	settingspanel.querySelector("#" + type + "-category-select");
		var songselect = 		settingspanel.querySelector("#" + type + "-song-select");
		var volumeslider = 		settingspanel.querySelector("#" + type + "-volume-slider");
		var volumeinput = 		settingspanel.querySelector("#" + type + "-volume-input");
		
		if (ele == categoryselect) {
			var newCategory = $(categoryselect).find(":selected").text();
			var newSongs = BDfunctionsDevilBro.loadData(newCategory, this.getName(), "songs");
			
			var firstSelected = false;
			var songselectionhtml = `<div class="song-select-wrapper" style="margin:0px 20px 0px 0px; float:left;"><select soundtype="${type}" class="song-select" id="${type}-song-select" style="width:150px; height: 25px;">`;
			for (var newSong in newSongs) {
				var src = newSongs[newSong] ? " src=" + newSongs[newSong] : "";
				if (newSong && newSong != "") {
					var sSelected = !firstSelected ? " selected" : "";
					firstSelected = true;
					songselectionhtml += `<option${src}${sSelected}>${newSong}</option>`;
				}
			}
			songselectionhtml += `</select></div>`;
			
			$(songselect).html(songselectionhtml);
		}
		
		var volume = ele == volumeslider ? volumeslider.value : volumeinput.value;
		volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
		volumeslider.value = volume;
		volumeinput.value = volume;
		
		var url = $(songselect).find(":selected").attr("src");
		if (url) {
			var audio = settingspanel.querySelector(".sound-preview");
			audio.src = url;
			audio.volume = volume/100;
			audio.play();
		}
		
		var choices = {};
		for (var i in this.types) {
			var type = 			this.types[i];
			var category = 		$(settingspanel).find("#" + type + "-category-select").find(":selected").text();
			var song = 			$(settingspanel).find("#" + type + "-song-select").find(":selected").text();
			var volume = 		$(settingspanel).find("#" + type + "-volume-slider").val();
			choices[type] = 	{category, song, volume};
		}
		BDfunctionsDevilBro.saveAllData(choices, this.getName(), "choices");
    }

    updateVolumeinput (settingspanel, e) {
		var ele = e.target;
		var type = $(ele).attr("soundtype");
		
		var volumeslider = 		settingspanel.querySelector("#" + type + "-volume-slider");
		var volumeinput = 		settingspanel.querySelector("#" + type + "-volume-input");
		
		if (ele == volumeslider) {
			volumeinput.value = volumeslider.value;
		}
		else if (ele == volumeinput) {
			volumeslider.value = volumeinput.value;
		}
    }

    updateDNDdisable (settingspanel) {
		var settings = {};
		var inputs = settingspanel.querySelectorAll(".dnddisable-checkbox");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this.getName(), "dnddisable");
    }
}
