//META{"name":"DisplayLargeMessages","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayLargeMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayLargeMessages/DisplayLargeMessages.plugin.js"}*//

var DisplayLargeMessages = (_ => {
	var encodedMessages, updateTimeout;
	
	return class DisplayLargeMessages {
		getName () {return "DisplayLargeMessages";}

		getVersion () {return "1.0.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Injects the contents of large messages that were sent by discord via 'message.txt'.";}

		constructor () {
			this.patchedModules = {
				after: {
					Messages: "render"
				}
			};
		}

		initConstructor () {
			encodedMessages = {};
		}

		// Legacy
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

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		processMessages (e) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: ["message", "channel"]});
			if (index > -1) for (let ele of children) if (ele && ele.props && ele.props.message) {
				let encodedContent = encodedMessages[ele.props.message.id];
				if (encodedContent != null) {
					ele.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, ele.props.message, {
						content: (ele.props.message.content && (ele.props.message.content + "\n\n") || "") + encodedContent
					}));
					ele.props.message.attachments = ele.props.message.attachments.filter(n => n.filename != "message.txt");
				}
				else for (let attachment of ele.props.message.attachments) {
					if (attachment.filename == "message.txt") BDFDB.LibraryRequires.request(attachment.url, (error, response, body) => {
						encodedMessages[ele.props.message.id] = body || "";
						BDFDB.TimeUtils.clear(updateTimeout);
						updateTimeout = BDFDB.TimeUtils.timeout(_ => {
							BDFDB.ReactUtils.forceUpdate(e.instance);
						}, 1000);
					});
				}
			}
		}
	}
})();