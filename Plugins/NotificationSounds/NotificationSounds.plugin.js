//META{"name":"NotificationSounds"}*//

class NotificationSounds {
	constructor () {
		this.audios = [
			{"name":"None", 					"url":null},
			{"name":"Solemn", 					"url":"https://notificationsounds.com/soundfiles/53fde96fcc4b4ce72d7739202324cd49/file-sounds-882-solemn.wav"},
			{"name":"Isn't it", 				"url":"https://notificationsounds.com/soundfiles/ba2fd310dcaa8781a9a652a31baf3c68/file-sounds-969-isnt-it.wav"},
			{"name":"Communication Channel", 	"url":"https://notificationsounds.com/soundfiles/63538fe6ef330c13a05a3ed7e599d5f7/file-sounds-917-communication-channel.wav"},
			{"name":"System Fault", 			"url":"https://notificationsounds.com/soundfiles/ebd9629fc3ae5e9f6611e2ee05a31cef/file-sounds-990-system-fault.wav"},
			{"name":"You wouldn't believe", 	"url":"https://notificationsounds.com/soundfiles/087408522c31eeb1f982bc0eaf81d35f/file-sounds-949-you-wouldnt-believe.wav"},
			{"name":"Served", 					"url":"https://notificationsounds.com/soundfiles/b337e84de8752b27eda3a12363109e80/file-sounds-913-served.wav"},
			{"name":"Job Done", 				"url":"https://notificationsounds.com/soundfiles/5b69b9cb83065d403869739ae7f0995e/file-sounds-937-job-done.wav"},
			{"name":"", 						"url":""},
			{"name":"", 						"url":""},
			{"name":"", 						"url":""},
			{"name":"", 						"url":""},
			{"name":"", 						"url":""},
			{"name":"", 						"url":""},
			{"name":"", 						"url":""},
			{"name":"", 						"url":""},
		].sort(function(a, b) {
			var x = a.name; var y = b.name;
			if (x != "None") {
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			}
		});
		
		this.dmObserver;
		this.dmbadgeObserver;
		this.mentionObserver;
		this.mentionBadgeObserver;
	}

	getName () {return "NotificationSounds";}

	getDescription () {return "Creates a notification sound when you receive a notification (mention or DM).";}

	getVersion () {return "2.0.0";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		var settings = this.getSettings();
		var settingspanel = ``;
		
		settingspanel += `<table><tr><th style="padding-right:30px">`;
		settingspanel += `<label>Mention-Sound</label><br>\n`;
		for (var i in this.audios) {
			var song = this.audios[i].name;
			var url = this.audios[i].url;
			if (song && song != "") {
				var checked = settings["mention" + song] ? " checked" : "";
				settingspanel += `<input class="NotificationSoundsRadio" type="radio" name="mention" src="` + url + `" onclick="NotificationSounds.updateSettings(this)" value="mention` + song + `"` + checked + `> ` + song + `<br>\n`;
			}
		}
		settingspanel += `</th><th>`;
		settingspanel += `<label>DM-Sound</label><br>\n`;
		for (var i in this.audios) {
			var song = this.audios[i].name;
			var url = this.audios[i].url;
			if (song && song != "") {
				var checked = settings["dm" + song] ? " checked" : "";
				settingspanel += `<input class="NotificationSoundsRadio" type="radio" name="dm" src="` + url + `" onclick="NotificationSounds.updateSettings(this)" value="dm` + song + `"` + checked + `> ` + song + `<br>\n`;
			}
		}
		settingspanel += `</th></tr></table>`;
		
		return settingspanel;
    }

	//legacy
	load () {}

	start () {	
		this.dmBadgeObserver = new MutationObserver((changes, _) => {
			this.playAudio("dm");
		});
		
		this.dmObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							this.dmBadgeObserver.observe(node, {characterData: true, subtree: true });
							this.playAudio("dm");
						});
					}
				}
			);
		});
		this.dmObserver.observe(document.getElementsByClassName("dms")[0], {childList: true});
		
		
		this.mentionBadgeObserver = new MutationObserver((changes, _) => {
			this.playAudio("mention");
		});
		
		this.mentionObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							this.mentionBadgeObserver.observe(node, {characterData: true, subtree: true });
							this.playAudio("mention");
						});
					}
				}
			);
		});
		var servers = this.readServerList().forEach( 
			(server) => {
				this.mentionObserver.observe(server, {childList: true});
			}
		);
	}

	stop () {
		this.dmObserver.disconnect();
		this.dmBadgeObserver.disconnect();
		this.mentionObserver.disconnect();
		this.mentionBadgeObserver.disconnect();
	}

	
	// begin of own functions

	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
	}
	
	playAudio (type) {
		var settings = this.getSettings();
		var selectedSong = (Object.keys(settings).filter(function(key) {return (key.indexOf(type) == 0 && settings[key] == true);}))[0].slice(type.length);
		
		for (var i in this.audios) {
			var song = this.audios[i].name;
			var url = this.audios[i].url;
			if (song && song != "") {
				if (selectedSong == song) {
					if (url != null) {
						var audio = new Audio();
						audio.src = url;
						audio.play();
					}
					break;
				}
			}
		}
	}
	
	getSettings () {
		var oldSettings = bdPluginStorage.get("NotificationSounds", "settings") ? bdPluginStorage.get("NotificationSounds", "settings") : {};
		var newSettings = {};
		
		var isOneMentionChecked = false;
		for (var i in this.audios) {
			var song = this.audios[i].name;
			if (song && song != "") {
				var key = "mention" + song;
				newSettings[key] = oldSettings[key] != null ? oldSettings[key] : false;
				isOneMentionChecked = isOneMentionChecked ? true : (newSettings[key] ? true : false);
			}
		}
		if (!isOneMentionChecked) newSettings["mentionNone"] = true;
			
		var isOneDmChecked = false;
		for (var i in this.audios) {
			var song = this.audios[i].name;
			if (song && song != "") {
				var key = "dm" + song;
				newSettings[key] = oldSettings[key] != null ? oldSettings[key] : false;
				isOneDmChecked = isOneDmChecked ? true : (newSettings[key] ? true : false);
			}
		}
		if (!isOneDmChecked) newSettings["dmNone"] = true;
		
		bdPluginStorage.set("NotificationSounds", "settings", newSettings);
		
		return newSettings;
	}

    static updateSettings (radioButton) {
		if (radioButton.src != null) {
			var audio = new Audio();
			audio.src = radioButton.src;
			audio.play();
		}
		
		var settingspanel = radioButton.parentNode.parentNode.parentNode;
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		bdPluginStorage.set("NotificationSounds", "settings", settings);
    }
	
	readServerList () {
		var foundServers = [];
		var servers = document.getElementsByClassName("guild");
		for (var i = 0; i < servers.length; i++) {
			var serverInst = this.getReactInstance(servers[i]);
			if (serverInst && serverInst._currentElement && serverInst._currentElement._owner && serverInst._currentElement._owner._instance) {
				var serverObj = serverInst._currentElement._owner._instance;
				if (serverObj && serverObj.props && serverObj.props.guild) {
					foundServers.push(servers[i]);
				}
			}
		}
		return foundServers;
	}
}
