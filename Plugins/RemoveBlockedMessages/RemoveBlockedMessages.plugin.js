//META{"name":"RemoveBlockedMessages","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveBlockedMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RemoveBlockedMessages/RemoveBlockedMessages.plugin.js"}*//

var RemoveBlockedMessages = (_ => {
	return class RemoveBlockedMessages {
		getName () {return "RemoveBlockedMessages";}

		getVersion () {return "1.0.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Removes blocked messages completely.";}
		
		constructor () {		
			this.changelog = {
				"fixed":[["Message Update","Fixed for yet another message update provided by our best friend discord"]]
			};
			
			this.patchedModules = {
				after: {
					Messages: "type"
				}
			};
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

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
				
				BDFDB.MessageUtils.rerenderAll();
			}
			else {
				console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
			}
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.MessageUtils.rerenderAll();

				BDFDB.PluginUtils.clear(this);
			}
		}

		
		// Begin of own functions
		
		processMessages (e) {
			let messagesIns = e.returnvalue.props.children;
			if (BDFDB.ArrayUtils.is(messagesIns.props.channelStream)) messagesIns.props.channelStream = [].concat(messagesIns.props.channelStream.filter(n => n.type != "MESSAGE_GROUP_BLOCKED"));
			if (BDFDB.ObjectUtils.is(messagesIns.props.messages) && BDFDB.ArrayUtils.is(messagesIns.props.messages._array)) {
				let messages = messagesIns.props.messages;
				messagesIns.props.messages = new BDFDB.DiscordObjects.Messages(messages);
				for (let key in messages) messagesIns.props.messages[key] = messages[key];
				messagesIns.props.messages._array = [].concat(messagesIns.props.messages._array.filter(n => n.author && !BDFDB.LibraryModules.FriendUtils.isBlocked(n.author.id)));
				if (messagesIns.props.oldestUnreadMessageId && messagesIns.props.messages._array.every(n => n.id != messagesIns.props.oldestUnreadMessageId)) messagesIns.props.oldestUnreadMessageId = null;
			}
		}
	}
})();

module.exports = RemoveBlockedMessages;