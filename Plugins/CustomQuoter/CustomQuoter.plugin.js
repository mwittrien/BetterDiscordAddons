//META{"name":"CustomQuoter","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CustomQuoter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CustomQuoter/CustomQuoter.plugin.js"}*//

var CustomQuoter = (_ => {
	const PreviewMessage = class PreviewMessage extends BdApi.React.Component {
		render() {
			let spoofChannel = new BDFDB.DiscordObjects.Channel({
				id: "126223823845647771",
				guild_id: "850725684241078788",
				name: "Test Channel"
			});
			let spoofQuotedMessage = new BDFDB.DiscordObjects.Message({
				id: "562432230424221059",
				author: new BDFDB.DiscordObjects.User({
					id: "230422432565221049",
					username: "Quoted User"
				}),
				channel_id: spoofChannel.id,
				content: "This is a test message\nto showcase what the quote would look like"
			});
			let spoofMessage = new BDFDB.DiscordObjects.Message({
				author: new BDFDB.DiscordObjects.User({
					id: "222242304256531049",
					username: "Test User"
				}),
				channel_id: spoofChannel.id,
				content: this.props.plugin.parseQuote(spoofQuotedMessage, spoofChannel)
			});
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessageGroup, {
				className: BDFDB.disCNS.message + BDFDB.disCN.messagecozymessage,
				message: spoofMessage,
				channel: spoofChannel
			});
		}
	};
	
	return class CustomQuoter {
		getName () {return "CustomQuoter";}

		getVersion () {return "1.0.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Let's you customize the output of the native quote feature of Discord";}

		constructor () {
			this.changelog = {
				"added":[["Link Option","Added a link placeholder that will be replaced with the direct message link that jumps to the quoted message if clicked"]]
			};
		}
		
		initConstructor () {
			this.defaults = {
				settings: {
					ignoreMentionInDM:		{value:true, 				description:"Do not add a mention in DM channels"},
					forceZeros:				{value:false, 				description:"Force leading Zeros"}
				},
				formats: {
					customQuote:			{value:"$quote $mention", 	description:"Custom Format:"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let formats = BDFDB.DataUtils.get(this, "formats");
			let settingspanel, settingsitems = [], inneritems = [];
			
			for (let key in settings) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key],
				onChange: (e, instance) => {
					BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_SettingsPanel", up:true}), {name:"BDFDB_Select", all:true, noCopies:true}));
				}
			}));
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: inneritems
			}));
			
			inneritems = [];
			
			for (let key in formats) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "TextInput",
				plugin: this,
				keys: ["formats", key],
				label: this.defaults.formats[key].description,
				basis: "70%",
				value: formats[key],
				onChange: (e, instance) => {
					BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {key:"PREVIEW_MESSAGE"}));
				}
			}));
			inneritems.push(BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.marginbottom8,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
					label: "Preview:"
				})
			}));
			inneritems.push(BDFDB.ReactUtils.createElement(PreviewMessage, {
				plugin: this,
				key: "PREVIEW_MESSAGE",
			}));
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Format",
				collapseStates: collapseStates,
				dividertop: true,
				children: inneritems
			}));
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Placeholder Guide",
				collapseStates: collapseStates,
				dividertop: true,
				children: [
					"$quote will be replaced with the quoted message content",
					"$mention will be replaced with a mention of the message author",
					"$link will be replaced with a discord direct link pointing to the message",
					"$authorId will be replaced with the ID of the message author",
					"$authorName will be replaced with the name of the message author",
					"$channel will be replaced with a mention of the channel (ignored for DMs)",
					"$channelId will be replaced with the ID of the channel",
					"$channelName will be replaced with the Name of the channel",
					"$serverId will be replaced with the ID of the server",
					"$serverName will be replaced with the name of the server",
					"$hour will be replaced with the quote hour",
					"$minute will be replaced with the quote minutes",
					"$second will be replaced with the quote seconds",
					"$msecond will be replaced with the quote milliseconds",
					"$timemode will change $hour to a 12h format and will be replaced with AM/PM",
					"$year will be replaced with the quote year",
					"$month will be replaced with the quote month",
					"$day will be replaced with the quote day",
					"$monthnameL will be replaced with the monthname in long format based on the Discord Language",
					"$monthnameS will be replaced with the monthname in short format based on the Discord Language",
					"$weekdayL will be replaced with the weekday in long format based on the Discord Language",
					"$weekdayS will be replaced with the weekday in short format based on the Discord Language"
				].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
					type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
					children: string
				}))
			}));
			
			return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
		}


		//legacy
		load () {}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
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
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.QuoteUtils, "createQuotedText", {instead: e => {
					return this.parseQuote(e.methodArguments[0], e.methodArguments[1]);
				}});
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		parseQuote (message, channel) {
			let settings = BDFDB.DataUtils.get(this, "settings");
			let customQuote = BDFDB.DataUtils.get(this, "formats", "customQuote");
			let languageId = BDFDB.LanguageUtils.getLanguage().id;
			
			let timestamp = new Date(message.editedTimestamp || message.timestamp);
			let hour = timestamp.getHours(), minute = timestamp.getMinutes(), second = timestamp.getSeconds(), msecond = timestamp.getMilliseconds(), day = timestamp.getDate(), month = timestamp.getMonth()+1, timemode = "";
			if (customQuote.indexOf("$timemode") > -1) {
				timemode = hour >= 12 ? "PM" : "AM";
				hour = hour % 12;
				hour = hour ? hour : 12;
			}
			
			let unquotedLines = message.content.split("\n").filter(line => !line.startsWith("> "));
			unquotedLines = unquotedLines.slice(unquotedLines.findIndex(line => line.trim().length > 0)).join("\n");
			
			let guild = channel.guild_id ? (BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id) || {id: channel.guild_id, name: "Test Server"}) : {id: BDFDB.DiscordConstants.ME, name: BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES};
			
			
			return BDFDB.StringUtils.insertNRST(customQuote)
				.replace("$mention", settings.ignoreMentionInDM && channel.isDM() ? "" : `<@!${message.author.id}>`)
				.replace("$link", `https://discordapp.com/channels/${guild.id}/${channel.id}/${message.id}`)
				.replace("$authorName", message.author.username || "")
				.replace("$authorId", message.author.id || "")
				.replace("$channelName", channel.name || "")
				.replace("$channelId", channel.id || "")
				.replace("$channel", channel.isDM() ? "" : `<#${channel.id}>`)
				.replace("$serverId", guild.id || "")
				.replace("$serverName", guild.name || "")
				.replace("$hour", settings.forceZeros && hour < 10 ? "0" + hour : hour)
				.replace("$minute", minute < 10 ? "0" + minute : minute)
				.replace("$second", second < 10 ? "0" + second : second)
				.replace("$msecond", settings.forceZeros ? (msecond < 10 ? "00" + msecond : (msecond < 100 ? "0" + msecond : msecond)) : msecond)
				.replace("$timemode", timemode)
				.replace("$weekdayL", timestamp.toLocaleDateString(languageId, {weekday: "long"}))
				.replace("$weekdayS", timestamp.toLocaleDateString(languageId, {weekday: "short"}))
				.replace("$monthnameL", timestamp.toLocaleDateString(languageId, {month: "long"}))
				.replace("$monthnameS", timestamp.toLocaleDateString(languageId, {month: "short"}))
				.replace("$day", settings.forceZeros && day < 10 ? "0" + day : day)
				.replace("$month", settings.forceZeros && month < 10 ? "0" + month : month)
				.replace("$year", timestamp.getFullYear())
				.replace("$quote", unquotedLines.split("\n").map(line => "> " + line + "\n").join("") || "")
				.split(" ").filter(n => n).join(" ");
		}

		addLeadingZeros (timestring) {
			let chararray = timestring.split("");
			let numreg = /[0-9]/;
			for (let i = 0; i < chararray.length; i++) if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];

			return chararray.join("");
		}
			
		forceUpdateAll() {
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}
	}
})();