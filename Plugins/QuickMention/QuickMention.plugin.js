//META{"name":"QuickMention","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/QuickMention","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/QuickMention/QuickMention.plugin.js"}*//

var QuickMention = (_ => {
	return class QuickMention {
		getName () {return "QuickMention";}

		getVersion () {return "1.0.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a mention entry to the message option toolbar.";}

		constructor () {
			this.changelog = {
				"fixed":[["DMs","Works again in DMs"]]
			};
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
			}
			else {
				console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
			}
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.PluginUtils.clear(this);
			}
		}

		
		// Begin of own functions
		
		onMessageOptionToolbar (e) {
			if (e.instance.props.message.author.id != BDFDB.UserUtils.me.id && e.instance.props.message.type == BDFDB.DiscordConstants.MessageTypes.DEFAULT && (BDFDB.UserUtils.can("SEND_MESSAGES") || e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM || e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.GROUP_DM)) e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
				key: "mention",
				text: BDFDB.LanguageUtils.LanguageStrings.MENTION,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCN.messagetoolbarbutton,
					onClick: _ => {
						BDFDB.LibraryModules.DispatchUtils.ComponentDispatch.dispatchToLastSubscribed(BDFDB.DiscordConstants.ComponentActions.INSERT_TEXT, {
							content: `<@!${e.instance.props.message.author.id}>`
						});
					},
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCNS.messagetoolbaricon,
						nativeClass: true,
						name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_AT
					})
				})
			}));
		}
	}
})();

module.exports = QuickMention;