//META{"name":"NotificationSounds"}*//

class NotificationSounds {
	constructor () {
		this.types = ["DM","Mention"];
		
		// to add a new song choose a name and add a new line in the array "NAME":"URL"
		this.audios = {
			"None":						null,
			"Communication Channel": 	"https://notificationsounds.com/soundfiles/63538fe6ef330c13a05a3ed7e599d5f7/file-sounds-917-communication-channel.wav",
			"Isn't it": 				"https://notificationsounds.com/soundfiles/ba2fd310dcaa8781a9a652a31baf3c68/file-sounds-969-isnt-it.wav",
			"Job Done": 				"https://notificationsounds.com/soundfiles/5b69b9cb83065d403869739ae7f0995e/file-sounds-937-job-done.wav",
			"Served": 					"https://notificationsounds.com/soundfiles/b337e84de8752b27eda3a12363109e80/file-sounds-913-served.wav",
			"Solemn": 					"https://notificationsounds.com/soundfiles/53fde96fcc4b4ce72d7739202324cd49/file-sounds-882-solemn.wav",
			"System Fault": 			"https://notificationsounds.com/soundfiles/ebd9629fc3ae5e9f6611e2ee05a31cef/file-sounds-990-system-fault.wav",
			"You wouldn't believe": 	"https://notificationsounds.com/soundfiles/087408522c31eeb1f982bc0eaf81d35f/file-sounds-949-you-wouldnt-believe.wav"	
		};
		
		this.oldMentions = {};
		
		this.dmObserver = new MutationObserver(() => {});
		this.dmBadgeObserver = new MutationObserver(() => {});
		this.mentionObserver = new MutationObserver(() => {});
		this.mentionBadgeObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
	}

	getName () {return "NotificationSounds";}

	getDescription () {return "Creates a notification sound when you receive a notification (mention or DM).";}

	getVersion () {return "2.3.0";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		var settings = this.getSettings();
		
		var settingspanel = `<audio class="preview"></audio>`;
		
		for (var i in this.types) {
			var key = this.types[i];
			settingspanel += `<label>` + key + `-Sound:</label><div class="` + key + `-song-settings" style="margin:0px 0px 20px 0px; overflow:hidden;">`;
			settingspanel += `<div class="` + key + `-song-selection" style="margin:0px 20px 0px 0px; float:left;"><select name="` + key + `" id="` + key + `-select" onchange='` + this.getName() + `.updateSettings(this, "` + key + `" )' style="height: 25px;">`;
			for (var song in this.audios) {
				var src = this.audios[song] ? "src=" + this.audios[song] : "";
				if (song && song != "") {
					var selected = settings[key].song == song ? " selected" : "";
					settingspanel += `<option `+ src + ` ` + selected + `>` + song + `</option>`;
				}
			}
			settingspanel += `</select></div>`;
			settingspanel += `<div class="` + key + `-volume-slider" style="margin:0px 20px 0px 0px; float:left;"><input type="range" min="0" max="100" value="` + settings[key].volume + `" id="` + key + `-volume" onchange='` + this.getName() + `.updateSettings(this, "` + key + `")' oninput='` + this.getName() + `.updateSlider(this, "` + key + `")'></div>`;
			settingspanel += `<div class="` + key + `-volume-value" style="margin:0px 0px 0px 0px; float:left;"><input type="number" min="0" max="100" value="` + settings[key].volume + `" id="` + key + `-volume-value" onchange='` + this.getName() + `.updateSettings(this, "` + key + `")' style="height: 25px; width:50px; text-align:center;"></div>`;
			settingspanel += `</div>`;
							
		}
		settingspanel += `<label>Make sure to disable your default notification sounds in the notifications settings of Discord or else you will hear both the default notifications and the new custom notifications.</label>`;
		settingspanel += `<label>If you want to add your own sounds just open the plugin file and add a new song in the list on the top and make sure the link you are using is a direct link pointing to a source file on a website. .</label>`;
		
		
		return settingspanel;
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
			this.dmObserver.observe(document.getElementsByClassName("dms")[0], {childList: true});
			
			this.mentionObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.className === "badge") {
									var data = BDfunctionsDevilBro.getKeyInformation({"node":node.parentElement,"key":"guild"});
									this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
									if (this.oldMentions[data.id] == 0) this.playAudio("Mention");
								}
								if (node.classList && node.classList.contains("guild") && !node.classList.contains("guilds-add") && node.parentNode.classList && !node.parentNode.classList.contains("dms") ) {
									this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node.className === "badge") {
									this.oldMentions = BDfunctionsDevilBro.getKeyInformation({"node":$(".flex-vertical.channels-wrap").parent()[0],"key":"mentionCounts"});
								}
							});
						}
					}
				);
			});
			this.mentionObserver.observe($(".guilds.scroller")[0], {childList: true, subtree:true});
			
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
			this.channelListObserver.observe($(".flex-vertical.channels-wrap")[0], {childList: true, subtree: true});
			
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
			
			this.checkAudios();
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
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
		}
	}

	
	// begin of own functions
	
	playAudio (type) {
		var settings = this.getSettings()[type];
		var selectedSong = settings.song;
		var volume = settings.volume;
		
		for (var song in this.audios) {
			if (song && song != "" && selectedSong == song) {
				var url = this.audios[song];
				if (url != null) {
					var audio = new Audio();
					audio.src = url;
					audio.volume = volume/100;
					audio.play();
				}
			}
		}
	}
	
	checkAudios () {
		var savedAudios = this.audios;
		this.audios = {};
		
		for (var song in savedAudios) {
			this.checkUrl(song, savedAudios[song]);
		}
	}
	
	checkUrl (song, url) {
		if (!url) {
			this.audios[song] = url;
		}
		else {
			$.ajax({
				type: "HEAD",
				url : "https://cors-anywhere.herokuapp.com/" + url,
				success: (message, text, response) => {
					if (response.getResponseHeader('Content-Type').indexOf("audio") != -1 || 
					response.getResponseHeader('Content-Type').indexOf("video") != -1 || 
					response.getResponseHeader('Content-Type').indexOf("application") != -1) {
						this.audios[song] = url;
					}
				}
			});
		}
	}
	
	getSettings () {
		var oldSettings = bdPluginStorage.get(this.getName(), "settings") ? bdPluginStorage.get(this.getName(), "settings") : {};
		var newSettings = {};
		
		for (var i in this.types) {
			var key = this.types[i];
			var songFound = false;
			for (var song in this.audios) {
				if (song && song != "" && oldSettings[key] && oldSettings[key].song == song) {
					var volume = oldSettings[key].volume ? oldSettings[key].volume : 100;
					newSettings[key] = {"song":song,"volume":volume};
					songFound = true;
				}
			}
			if (!songFound) newSettings[key] = {"song":"None","volume":100};
		}
		
		bdPluginStorage.set(this.getName(), "settings", newSettings);
		
		return newSettings;
	}

    static updateSettings (ele, type) {
		var settingspanel = ele.parentElement.parentElement.parentElement;
		var selectinput = $(settingspanel).find("#" + type + "-select")[0];
		var sliderinput = $(settingspanel).find("#" + type + "-volume")[0];
		var valueinput = $(settingspanel).find("#" + type + "-volume-value")[0];
		
		var url = $(selectinput).find(":selected").attr("src");
		if (url != null) {
			var volume = ele.id == "#" + type + "-volume" ? sliderinput.value : valueinput.value;
			volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
			
			var audio = $(settingspanel).find(".preview")[0];
			audio.src = url;
			audio.volume = volume/100;
			audio.play();
		}
		
		var songs = settingspanel.querySelectorAll("select");
		var settings = {};
		for (var i = 0; i < songs.length; i++) {
			settings[songs[i].name] = {"song":$(songs[i]).find(":selected").text(),"volume":$("#" + $(songs[i]).attr("name") + "-volume")[0].value};
		}
		bdPluginStorage.set("NotificationSounds", "settings", settings);
    }

    static updateSlider (ele, type) {
		var settingspanel = ele.parentElement.parentElement.parentElement;
		var sliderinput = $(settingspanel).find("#" + type + "-volume")[0];
		var valueinput = $(settingspanel).find("#" + type + "-volume-value")[0];
		
		var volume = sliderinput.value;
		volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
		
		valueinput.value = volume;
    }
}
