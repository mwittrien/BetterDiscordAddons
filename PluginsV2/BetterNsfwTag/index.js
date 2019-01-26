module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.css = ` 
				.nsfw-tag {
					position: relative;
					overflow: hidden; 
					padding: 1px 2px 1px 2px; 
					margin-left: 5px; 
					height: 13px;
					border-radius: 3px;
					text-transform: uppercase;
					font-size: 12px;
					font-weight: 500;
					line-height: 14px;
					white-space: nowrap;
					color: rgb(240, 71, 71);
					background-color: rgba(240, 71, 71, 0.0980392);
					border: 1px solid rgba(240, 71, 71, 0.498039);
				}`;

			this.tagMarkup = `<span class="nsfw-tag">NSFW</span>`;
		}

		onStart () {
			var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", () => {
					BDFDB.loaded = true;
					this.initialize();
				});
				document.head.appendChild(libraryScript);
			}
			else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		}

		initialize () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				BDFDB.loadMessage(this);

				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.classList && node.classList.contains(BDFDB.disCN.channelcontainerdefault)) {
										this.checkChannel(node);
									} 
									if (node && node.className && node.className.length > 0 && node.className.indexOf("container-") > -1) {
										this.checkContainerForNsfwChannel(node);
									} 
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.channels, {name:"channelListObserver",instance:observer}, {childList: true, subtree: true});

				this.checkAllContainers();

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}

		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				$(".nsfw-tag").remove();

				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}

		onSwitch () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.checkAllContainers();
			}
		}


		// begin of own functions

		checkAllContainers () {
			document.querySelectorAll(BDFDB.dotCNS.channels + "[class*=container-]").forEach(container => {
				this.checkContainerForNsfwChannel(container);
			});
		}

		checkContainerForNsfwChannel (container) {
			container.querySelectorAll(BDFDB.dotCN.channelcontainerdefault).forEach(channel => {
				this.checkChannel(channel);
			});
		}

		checkChannel (channel) {
			let channelData = BDFDB.getKeyInformation({"node":channel,"key":"channel"});
			if (channelData && channelData.nsfw == true) {
				if (!channel.querySelector(".nsfw-tag")) {
					$(this.tagMarkup).appendTo(channel.querySelector(BDFDB.dotCN.channelname));
				}
			}
		}
	}
};
