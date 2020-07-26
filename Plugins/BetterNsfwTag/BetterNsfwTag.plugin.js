//META{"name":"BetterNsfwTag","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterNsfwTag","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterNsfwTag/BetterNsfwTag.plugin.js"}*//

var BetterNsfwTag = (_ => {
	return class BetterNsfwTag {
		getName () {return "BetterNsfwTag";}

		getVersion () {return "1.2.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a more noticeable tag to NSFW channels.";}

		constructor () {
			this.changelog = {
				"improved":[["Position","Tag was repositioned similar to the mentions badge"],["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};
			
			this.patchedModules = {
				after: {
					ChannelItem: "render"
				}
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

		processChannelItem (e) {
			if (e.instance.props.channel && e.instance.props.channel.nsfw) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props:[["className", BDFDB.disCN.channelchildren]]});
				if (index > -1 && children[index].props && children[index].props.children) {
					let [oldTagParent, oldTagIndex] = BDFDB.ReactUtils.findParent(children[index], {key: "NSFW-badge"});
					if (oldTagIndex > -1) oldTagParent.splice(oldTagIndex, 1);
					children[index].props.children.push(BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS._betternsfwtagtag + BDFDB.disCN.channelchildiconbase,
						key: "NSFW-badge",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
							style: {borderRadius: "3px"},
							text: "NSFW"
						})
					}));
				}
			}
		}
	}
})();

module.exports = BetterNsfwTag;