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
		
		this.switchFixObserver = new MutationObserver(() => {});
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

	getVersion () {return "2.5.4";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settingspanel = `<audio class="preview"></audio>`;
			
			var songs = BDfunctionsDevilBro.loadAllData(this.getName(), "songs");
			
			for (var i in this.types) {
				var key = this.types[i];
				var choice = BDfunctionsDevilBro.loadData(key, this.getName(), "choices");
				settingspanel += `<label style="color:grey;">` + key + `-Sound:</label><div class="` + key + `-song-settings" style="margin:0px 0px 20px 0px; overflow:hidden;">`;
				settingspanel += `<div class="category-selection" style="margin:0px 20px 0px 0px; float:left;"><select id="` + key + `-category-select" onchange='` + this.getName() + `.updateSettings(this, "` + key + `", "` + this.types + `", "` + this.getName() + `")' style="width:150px; height: 25px;">`;
				for (var category in songs) {
					var cSelected = choice.category == category ? " selected" : "";
					if (cSelected) {
						var songSelection = `<div class="song-selection" style="margin:0px 20px 0px 0px; float:left;"><select id="` + key + `-song-select" onchange='` + this.getName() + `.updateSettings(this, "` + key + `", "` + this.types + `", "` + this.getName() + `")' style="width:150px; height: 25px;">`;
						for (var song in songs[category]) {
							var src = songs[category][song] ? "src=" + songs[category][song] : "";
							if (song && song != "") {
								var sSelected = choice.song == song ? " selected" : "";
								songSelection += `<option `+ src + `` + sSelected + `>` + song + `</option>`;
							}
						}
						songSelection += `</select></div>`;
					}
					settingspanel += `<option` + cSelected + `>` + category + `</option>`;
				}
				settingspanel += `</select></div>`;
				settingspanel += songSelection;
				var volume = choice.volume ? choice.volume : "100";
				settingspanel += `<div class="` + key + `-volume-slider" style="margin:0px 20px 0px 0px; float:left;"><input type="range" min="0" max="100" value="` + volume + `" id="` + key + `-volume" onchange='` + this.getName() + `.updateSettings(this, "` + key + `", "` + this.types + `", "` + this.getName() + `")' oninput='` + this.getName() + `.updateVolumeinput(this, "` + key + `")'></div>`;
				settingspanel += `<div class="` + key + `-volume-value" style="margin:0px 0px 0px 0px; float:left;"><input type="number" min="0" max="100" value="` + volume + `" id="` + key + `-volume-value" onchange='` + this.getName() + `.updateSettings(this, "` + key + `", "` + this.types + `", "` + this.getName() + `")' oninput='` + this.getName() + `.updateVolumeinput(this, "` + key + `")' style="height: 25px; width:50px; text-align:center;"></div>`;
				settingspanel += `</div>`;
								
			}
			settingspanel += `<label style="color:grey;">Make sure to disable your default notification sounds in the notifications settings of Discord or else you will hear both the default notifications and the new custom notifications. If you want to add your own sounds just open the plugin file and add a new song (audio or video) in the list on the top and make sure the link you are using is a direct link pointing to a source file on a website or else it won't be added to the list and no a youtube link is not a direct link to a source file ...</label>`;
			
			
			return settingspanel;
		}
    }

	//legacy
	load () {}

	start () {	
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
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
								if (node.className === "badge") {
									var data = BDfunctionsDevilBro.getKeyInformation({"node":node.parentElement,"key":"guild"});
									if (data) {
										this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
										if (this.oldMentions && this.oldMentions[data.id] == 0) this.playAudio("Mention");
									}
								}
								if (node.classList && node.classList.contains("guild") && !node.classList.contains("guilds-add") && node.parentNode.classList && !node.parentNode.classList.contains("dms") ) {
									this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node.className === "badge") {
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
			if (document.querySelector("[class*='channels-'][class*='flex-']")) this.channelListObserver.observe(document.querySelector("[class*='channels-'][class*='flex-']"), {childList: true, subtree: true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (!this.switching && $(node).find(".message").length > 0 && node == $(".message-group").last()[0]) {
									if (this.myID != BDfunctionsDevilBro.getKeyInformation({"node":node,"key":"message"}).author.id) {
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
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			BDfunctionsDevilBro.readServerList().forEach( 
				(server) => {
					var badge = $(server).find(".badge")[0];
					if (badge) {
						this.mentionBadgeObserver.observe(badge, {characterData: true, subtree: true });
					}
				}
			);
			
			BDfunctionsDevilBro.readDmList().forEach( 
				(dm) => {
					var badge = $(dm).find(".badge")[0];
					if (badge) {
						this.dmBadgeObserver.observe(badge, {characterData: true, subtree: true });
					}
				}
			);
			
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
			this.switchFixObserver.disconnect();
			this.dmObserver.disconnect();
			this.dmBadgeObserver.disconnect();
			this.mentionObserver.disconnect();
			this.mentionBadgeObserver.disconnect();
			this.channelListObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.messageChangeObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
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
		var choice = BDfunctionsDevilBro.loadData(type, this.getName(), "choices");
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
			var key = this.types[i];
			var choice = BDfunctionsDevilBro.loadData(key, this.getName(), "choices");
			var songs = BDfunctionsDevilBro.loadAllData(this.getName(), "songs");
			
			var songFound = false;
			if (choice) {
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
			}
			if (!songFound) choice = {"category":"---","song":"---","volume":"100"};
			BDfunctionsDevilBro.saveData(key, choice, this.getName(), "choices");
		}
	}
	
	static checkUrl (url) {
		$.ajax({
			type: "HEAD",
			url : "https://cors-anywhere.herokuapp.com/" + url,
			success: (message, text, response) => {
				if (response.getResponseHeader('Content-Type').indexOf("audio") != -1 || 
				response.getResponseHeader('Content-Type').indexOf("video") != -1 || 
				response.getResponseHeader('Content-Type').indexOf("application") != -1) {
					return true;
				}
				else {
					return false;
				}
			},
			error: () => {
				return false;
			}
		});
	}

    static updateSettings (ele, type, types, pluginName) {
		var settingspanel = 	BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var categoryselect = 	$(settingspanel).find("#" + type + "-category-select")[0];
		var songselect = 		$(settingspanel).find("#" + type + "-song-select")[0];
		var volumeslider = 		$(settingspanel).find("#" + type + "-volume")[0];
		var volumeinput = 		$(settingspanel).find("#" + type + "-volume-value")[0];
		
		if (ele.id == type + "-category-select") {
			var newCategory = 		$(categoryselect).find(":selected").text();
			var newSongs = 			BDfunctionsDevilBro.loadData(newCategory, pluginName, "songs");
			
			var firstSelected = false;
			var songSelection = `<div class="song-selection" style="margin:0px 20px 0px 0px; float:left;"><select id="` + type + `-song-select" onchange='` + pluginName + `.updateSettings(this, "` + type + `", "` + types + `", "` + pluginName + `")' style="width:150px; height: 25px;">`;
			for (var newSong in newSongs) {
				var src = newSongs[newSong] ? "src=" + newSongs[newSong] : "";
				if (newSong && newSong != "") {
					var sSelected = !firstSelected ? " selected" : "";
					firstSelected = true;
					songSelection += `<option `+ src + `` + sSelected + `>` + newSong + `</option>`;
				}
			}
			songSelection += `</select></div>`;
			
			$(songselect).html(songSelection);
		}
		
		var volume = ele.id == type + "-volume" ? volumeslider.value : volumeinput.value;
		volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
		volumeslider.value = volume;
		volumeinput.value = volume;
		
		var url = $(songselect).find(":selected").attr("src");
		if (url != null) {
			var audio = $(settingspanel).find(".preview")[0];
			audio.src = url;
			audio.volume = volume/100;
			audio.play();
		}
		
		var settings = {};
		types = types.split(",");
		var choices = {};
		for (var i = 0; i < types.length; i++) {
			var key = 			types[i];
			var category = 		$(settingspanel).find("#" + key + "-category-select").find(":selected").text();
			var song = 			$(settingspanel).find("#" + key + "-song-select").find(":selected").text();
			var volume = 		$(settingspanel).find("#" + key + "-volume")[0].value;
			choices[key] = 		{category, song, volume};
		}
		BDfunctionsDevilBro.saveAllData(choices, pluginName, "choices");
    }

    static updateVolumeinput (ele, type) {
		var settingspanel = 	BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var volumeslider = 		$(settingspanel).find("#" + type + "-volume")[0];
		var volumeinput = 		$(settingspanel).find("#" + type + "-volume-value")[0];
		
		if (ele.id == type + "-volume") {
			volumeinput.value = volumeslider.value;
		}
		else if (ele.id == type + "-volume-value") {
			volumeslider.value = volumeinput.value;
		}
    }
}
