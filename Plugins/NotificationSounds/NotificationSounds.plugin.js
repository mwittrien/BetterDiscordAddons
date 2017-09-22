//META{"name":"NotificationSounds"}*//

class NotificationSounds {
	constructor () {
		this.types = ["Mention","DM"];
		
		// to add a new song choose a name and add a new line in the array "NAME":"URL"
		this.audios = [
			{"None":					null},
			{"Communication Channel": 	"https://notificationsounds.com/soundfiles/63538fe6ef330c13a05a3ed7e599d5f7/file-sounds-917-communication-channel.wav"},
			{"Isn't it": 				"https://notificationsounds.com/soundfiles/ba2fd310dcaa8781a9a652a31baf3c68/file-sounds-969-isnt-it.wav"},
			{"Job Done": 				"https://notificationsounds.com/soundfiles/5b69b9cb83065d403869739ae7f0995e/file-sounds-937-job-done.wav"},
			{"Served": 					"https://notificationsounds.com/soundfiles/b337e84de8752b27eda3a12363109e80/file-sounds-913-served.wav"},
			{"Solemn": 					"https://notificationsounds.com/soundfiles/53fde96fcc4b4ce72d7739202324cd49/file-sounds-882-solemn.wav"},
			{"System Fault": 			"https://notificationsounds.com/soundfiles/ebd9629fc3ae5e9f6611e2ee05a31cef/file-sounds-990-system-fault.wav"},
			{"You wouldn't believe": 	"https://notificationsounds.com/soundfiles/087408522c31eeb1f982bc0eaf81d35f/file-sounds-949-you-wouldnt-believe.wav"},
		];
		
		this.oldMentions = {};
		
		this.dmObserver = new MutationObserver(() => {});
		this.dmBadgeObserver = new MutationObserver(() => {});
		this.mentionObserver = new MutationObserver(() => {});
		this.mentionBadgeObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
	}

	getName () {return "NotificationSounds";}

	getDescription () {return "Creates a notification sound when you receive a notification (mention or DM).";}

	getVersion () {return "2.2.2";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		var settings = this.getSettings();
		
		var settingspanel = ``;
		
		for (var i in this.types) {
			var key = this.types[i];
			settingspanel += `<label>` + key + `-Sound:</label><br>`;
			settingspanel += `<select name="` + key + `" onchange="NotificationSounds.updateSettings(this)">`;
			for (var j in this.audios) {
				var song = Object.keys(this.audios[j])[0];
				var url = this.audios[j][song];
				if (song && song != "") {
					var selected = settings[key] == song? " selected" : "";
					settingspanel += `<option src="` + url + `"` + selected + `>` + song + `</option>`;
				}
			}
			settingspanel += `</select><br><br>`;
		}
		settingspanel += `<label>Make sure to disable your default notification sounds in the notifications settings of Discord or else you will hear both the default notifications and the new custom notifications.</label>`;
		
		
		return settingspanel;
    }

	//legacy
	load () {}

	start () {	
		if ($('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').length == 0) {
			$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
			if (typeof BDfunctionsDevilBro !== "object") {
				if ($('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').length == 0) {
					$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
				}
			}
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
		var selectedSong = this.getSettings()[type];
		
		this.audios.forEach((ele) => {
			var song = Object.keys(ele)[0];
			var url = ele[song];
			if (song && song != "") {
				if (selectedSong == song) {
					if (url != null) {
						var audio = new Audio();
						audio.src = url;
						audio.play();
					}
				}
			}
		});
	}
	
	getSettings () {
		var oldSettings = bdPluginStorage.get(this.getName(), "settings") ? bdPluginStorage.get(this.getName(), "settings") : {};
		var newSettings = {};
		
		for (var i in this.types) {
			var key = this.types[i];
			var songFound = false;
			this.audios.forEach((ele) => {
				var song = Object.keys(ele)[0];
				if (song && song != "" && oldSettings[key] == song) {
					newSettings[key] = song;
					songFound = true;
				}
			});
			if (!songFound) newSettings[key] = "None";
		}
		
		bdPluginStorage.set(this.getName(), "settings", newSettings);
		
		return newSettings;
	}

    static updateSettings (input) {
		var url = $(input).find(":selected").attr("src");
		if (url != null) {
			var audio = new Audio();
			audio.src = url;
			audio.play();
		}
		
		var settingspanel = input.parentNode;
		var settings = {};
		var inputs = settingspanel.querySelectorAll("select");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].name] = $(inputs[i]).find(":selected").text();
		}
		bdPluginStorage.set("NotificationSounds", "settings", settings);
    }
}
