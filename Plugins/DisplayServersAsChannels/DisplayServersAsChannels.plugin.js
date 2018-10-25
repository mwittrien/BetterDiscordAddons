//META{"name":"DisplayServersAsChannels"}*//

class DisplayServersAsChannels {
	initConstructor () {
		this.verificationBadgeMarkup =
			`<svg class="DSAC-verification-badge" name="Verified" width="24" height="24" viewBox="0 0 20 20">
				<g fill="none" fill-rule="evenodd">
					<path fill="transparent" d="M10,19.9894372 C10.1068171,19.9973388 10.2078869,20.000809 10.3011305,19.9998419 C11.2600164,19.8604167 12.3546966,19.5885332 12.8510541,19.0579196 C13.25685,18.6241176 13.617476,18.0901301 13.7559228,17.5412583 C14.9847338,18.4452692 17.0357846,18.1120142 18.1240732,16.9486174 C19.1632035,15.8377715 18.521192,14.1691402 18.1240732,13.1586037 C18.4557396,12.9959068 18.8016154,12.6966801 19.0750308,12.4043949 C19.7126372,11.7227841 20.0201294,10.9139249 19.9989792,10.0282152 C20.0201294,9.14250542 19.7126372,8.3336462 19.0750308,7.65203538 C18.8016154,7.35975019 18.4557396,7.06052352 18.1240732,6.89782664 C18.521192,5.88729007 19.1632035,4.21865882 18.1240732,3.10781287 C17.0357846,1.94441607 14.9847338,1.61116112 13.7559228,2.51517206 C13.617476,1.96630024 13.25685,1.4323127 12.8510541,0.998510722 C12.3546966,0.467897141 11.2584098,0.139640848 10.2995239,0.036840309 C10.2065991,-0.000647660524 10.1059015,0.00279555358 9.99948865,0.0106399384 C9.87772075,0.00268415336 9.76807998,-0.00081194858 9.67455589,0.000158000197 C8.88885259,0.157529668 7.63153446,0.482616331 7.14894593,0.998510722 C6.74314998,1.4323127 6.382524,1.96630024 6.24407717,2.51517206 C5.01526618,1.61116112 2.96421535,1.94441607 1.87592682,3.10781287 C0.836796482,4.21865882 1.47880798,5.88729007 1.87592682,6.89782664 C1.54426039,7.06052352 1.19838464,7.35975019 0.924969216,7.65203538 C0.287362828,8.3336462 -0.0201294289,9.14250542 0.00102081603,10.0282151 C-0.0201294289,10.9139249 0.287362828,11.7227841 0.924969216,12.4043949 C1.19838464,12.6966801 1.54426039,12.9959068 1.87592682,13.1586037 C1.47880798,14.1691402 0.836796482,15.8377715 1.87592682,16.9486174 C2.96421535,18.1120142 5.01526618,18.4452692 6.24407717,17.5412583 C6.382524,18.0901301 6.74314998,18.6241176 7.14894593,19.0579196 C7.63153446,19.573814 8.89045919,19.8426283 9.6761625,19.9541287 C9.7694061,20.000809 9.87866986,19.9973388 10,19.9894372 Z"/>
					<path fill="#4f545c" d="M10.0004091,17.9551224 C10.0858672,17.9614327 10.1667272,17.964204 10.2413259,17.9634317 C11.0084737,17.8520863 11.8842627,17.6349594 12.281369,17.2112099 C12.6060224,16.8647745 12.8945379,16.4383305 13.005301,16 C13.9884001,16.7219456 15.6293247,16.4558073 16.5,15.5267154 C17.3313468,14.6395908 16.8177113,13.3070173 16.5,12.5 C16.7653467,12.3700698 17.0420615,12.1311066 17.260805,11.8976868 C17.7709162,11.3533505 18.0169226,10.7073933 18.0000015,10.0000632 C18.0169226,9.29273289 17.7709162,8.64677569 17.260805,8.10243942 C17.0420615,7.86901966 16.7653467,7.63005642 16.5,7.50012624 C16.8177113,6.69310896 17.3313468,5.36053545 16.5,4.47341082 C15.6293247,3.54431894 13.9884001,3.27818062 13.005301,4.00012624 C12.8945379,3.5617957 12.6060224,3.13535178 12.281369,2.78891632 C11.8842627,2.36516686 11.0071884,2.10302048 10.2400405,2.02092369 C10.1656968,1.99098569 10.0851346,1.99373545 10,2 C9.9025807,1.99364649 9.8148636,1.99085449 9.7400405,1.9916291 C9.11144571,2.11730654 8.10553978,2.37692165 7.71944921,2.78891632 C7.39479585,3.13535178 7.10628031,3.5617957 6.99551718,4.00012624 C6.01241812,3.27818062 4.37149355,3.54431894 3.5008182,4.47341082 C2.66947142,5.36053545 3.18310688,6.69310896 3.5008182,7.50012624 C3.23547149,7.63005642 2.95875674,7.86901966 2.74001321,8.10243942 C2.22990202,8.64677569 1.98389563,9.29273289 2.00081669,10.0000631 C1.98389563,10.7073933 2.22990202,11.3533505 2.74001321,11.8976868 C2.95875674,12.1311066 3.23547149,12.3700698 3.5008182,12.5 C3.18310688,13.3070173 2.66947142,14.6395908 3.5008182,15.5267154 C4.37149355,16.4558073 6.01241812,16.7219456 6.99551718,16 C7.10628031,16.4383305 7.39479585,16.8647745 7.71944921,17.2112099 C8.10553978,17.6232046 9.11273107,17.8378805 9.74132585,17.926925 C9.81592455,17.964204 9.90334002,17.9614327 10.0004091,17.9551224 Z"/>
					<path fill="#ffffff" d="M8.84273967,12.8167603 L13.8643,7.7952 C14.0513,7.6072 14.0513,7.3042 13.8643,7.1172 C13.6773,6.9312 13.3743,6.9312 13.1863,7.1172 L8.52303089,11.78139 L6.8883,10.1475 C6.6843,9.9445 6.3553,9.9445 6.1523,10.1475 C5.9493,10.3515 5.9493,10.6805 6.1523,10.8835 L8.08381122,12.8160053 C8.09561409,12.8309877 8.10844368,12.8454178 8.1223,12.8592 C8.3093,13.0472 8.6123,13.0472 8.8003,12.8592 L8.82157566,12.8379243 C8.82518839,12.8345112 8.82876362,12.8310364 8.8323,12.8275 C8.83584168,12.8239583 8.83932157,12.820378 8.84273967,12.8167603 Z"/>
				</g>
			</svg>`;
		
		this.css = `
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guildswrapper},
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.scrollerwrapold},
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guilds} {
				width: 160px;
			}
			.DSAC-styled ${BDFDB.dotCN.guildswrapper},
			.DSAC-styled ${BDFDB.dotCN.scrollerwrapold},
			.DSAC-styled ${BDFDB.dotCN.guilds} {
				width: 240px;
			}
			.DSAC-styled ${BDFDB.dotCN.guilds}::-webkit-scrollbar-track-piece {
				background-color: rgb(27, 29, 32);
				border-color: rgb(32, 34, 37);
			}
			.DSAC-styled ${BDFDB.dotCN.guilds}::-webkit-scrollbar-thumb {
				background-color: rgb(17, 19, 22);
				border-color: rgb(32, 34, 37);
			}
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guild} {
				margin-left: 55px;
			}
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.friendsonline},
			.bd-minimal .DSAC-styled #RANbutton-frame {
				margin-left: 40px;
			}
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildinner} a,
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCNS.guildinner + BDFDB.dotCN.avataricon},
			.DSAC-styled ${BDFDB.dotCN.guild}.copy,
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.guildinner} a,
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCNS.guildinner + BDFDB.dotCN.avataricon},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildserror} {
				margin-left: 0px;
				height: 32px;
			}
			.DSAC-styled ${BDFDB.dotCN.guildseparator} {
				margin-left: 0px;
			}
			.DSAC-styled ${BDFDB.dotCN.guild},
			.DSAC-styled ${BDFDB.dotCN.friendsonline} {
				margin-left: 80px;
			}
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guildseparator}, 
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild},
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guild}.copy,
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildserror} {
				width: 130px;
			}
			.DSAC-styled ${BDFDB.dotCN.guildseparator}:not([style*="display: none"]), 
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild}:not([style*="display: none"]),
			.DSAC-styled ${BDFDB.dotCN.guild}.copy:not([style*="display: none"]),
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildserror}:not([style*="display: none"]) {
				width: 215px;
				box-sizing: border-box;
				opacity: 0.4;
				padding-left: 5px;
				border-radius: 3px;
				display: flex !important;
				align-items: center;
				justify-content: flex-start;
			}
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildunread}.copy.
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCN.guildunread} {
				opacity: 0.7;
			}
			.DSAC-styled ${BDFDB.dotCN.guild}.copy:not(${BDFDB.dotCN.guildselected}):hover,
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild}:not(${BDFDB.dotCN.guildselected}):hover {
				opacity: 0.9;
				background-color: rgba(79,84,92,.3);
			}
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildselected}.copy,
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCN.guildselected} {
				opacity: 1;
				background-color: rgba(79,84,92,.6);
			}
			.DSAC-styled ${BDFDB.dotCN.guild}.copy > div[draggable],
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild} > div[draggable] {
				flex: 1 1 auto;
			}
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildaudio}.copy > div[draggable],
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildvideo}.copy > div[draggable],
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCN.guildaudio} > div[draggable],
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCN.guildvideo} > div[draggable] {
				padding-right: 20px;
				margin-right: 5px;
			}
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildaudio}.copy > div[draggable],
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCN.guildaudio} > div[draggable] {
				background: url(/assets/382ca83d9dc390c4be715248bb4864f4.svg) right no-repeat !important;
			}
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildvideo}.copy > div[draggable],
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCN.guildvideo} > div[draggable] {
				background: url(/assets/c46f51f425c824899b6138ea2b61b41d.svg) right no-repeat !important;
			}
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.badge},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.badge} {
				position: static;
				margin-right: 5px;
			}
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.guildinner},
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildinner} {
				width: unset;
			}
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildinner} {
				background: transparent !important;
				border-radius: 0px !important;
				position: relative;
			}
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildaudio}.copy ${BDFDB.dotCN.guildinner}:after,
			.DSAC-styled ${BDFDB.dotCN.guild + BDFDB.dotCN.guildvideo}.copy ${BDFDB.dotCN.guildinner}:after,
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCNS.guildaudio + BDFDB.dotCN.guildinner}:after,
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCNS.guildvideo + BDFDB.dotCN.guildinner}:after {
				display: none !important;
			}
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.avataricon},
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.avataricon} {
				font-size: 14px !important;
			}
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.avataricon},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.avataricon} {
				background: transparent !important;
				font-size: 16px !important;
				line-height: 32px;
				white-space: nowrap;
				text-align: left;
				position: absolute;
				left: 0;
				right: 0;
				width: unset;
			}
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.guildinner} .DSAC-verification-badge,
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildinner} .DSAC-verification-badge {
				position: absolute;
				left: 0;
				top: 4px;
			}
			.DSAC-styled ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.guildinner} .DSAC-verification-badge + ${BDFDB.dotCN.avataricon},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildinner} .DSAC-verification-badge + ${BDFDB.dotCN.avataricon} {
				left: 25px;
			}
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildserror} {
				border-radius: 3px;
				margin-left: -5px;
				line-height: 32px;
			}
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCNS.guild + BDFDB.dotCN.guildserror},
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCN.guildsadd} {
				display: block !important;
			}
			.bd-minimal .DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCNS.guildsadd + BDFDB.dotCN.guildsaddinner} {
				top: 0;
			}
			.DSAC-styled ${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild + BDFDB.dotCNS.guildsadd + BDFDB.dotCN.guildsaddinner} {
				top: -5px;
			}`;
	}

	getName () {return "DisplayServersAsChannels";}

	getDescription () {return "Display servers in a similar way as channels.";}

	getVersion () {return "1.1.2";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						var addedNodes = change.addedNodes;
						if (change.attributeName == "class" && change.oldValue && change.oldValue.indexOf(BDFDB.disCN.guildplaceholder) > -1)  addedNodes = [change.target];
						if (change.attributeName == "draggable" && change.oldValue && change.oldValue == "false")  addedNodes = [change.target.parentElement];
						if (addedNodes) {
							addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains(BDFDB.disCN.guild) && !node.querySelector(BDFDB.dotCN.guildserror)) {
									if (node.classList.contains("folder")) {
										this.changeServer(this.getFolderObject(node));
									}
									else {
										var id = BDFDB.getIdOfServer(node);
										if (id) this.changeServer(BDFDB.getDivOfServer(id));
									}
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.guilds, {name:"serverListObserver",instance:observer}, {childList: true, subtree:true, attributes:true, attributeFilter: ["class", "draggable"], attributeOldValue: true});
			
			BDFDB.readServerList().forEach(serverObj => {
				this.changeServer(serverObj);
			});
			document.querySelectorAll(BDFDB.dotCN.guild + ".folder").forEach(folderdiv => {
				this.changeServer(this.getFolderObject(folderdiv));
			});
			
			$(BDFDB.dotCN.guildswrapper).parent()
				.off("." + this.getName())
				.on("mouseenter." + this.getName(), `${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild}, ${BDFDB.dotCN.guild}.copy`, () => {
					BDFDB.appendLocalStyle("HideAllToolTips" + this.getName(), `${BDFDB.dotCN.tooltip} {display: none !important;}`);
				})
				.on("mouseleave." + this.getName(), `${BDFDB.dotCN.guildseparator} ~ ${BDFDB.dotCN.guild}, ${BDFDB.dotCN.guild}.copy`, () => {
					BDFDB.removeLocalStyle("HideAllToolTips" + this.getName());
				})
				.addClass("DSAC-styled");
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.readServerList().forEach(serverObj => {
				this.resetServer(serverObj);
			});
			document.querySelectorAll(BDFDB.dotCN.guild + ".folder").forEach(folderdiv => {
				this.resetServer(this.getFolderObject(folderdiv));
			});
			$(".DSAC-styled").removeClass("DSAC-styled");
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions

	changeServer (serverObj) {
		if (!serverObj) return;
		var avatar = serverObj.div.querySelector(BDFDB.dotCN.avataricon);
		if (avatar) {
			avatar.DSAColdName = avatar.textContent;
			avatar.textContent = serverObj.name || serverObj.folderName;
			if (serverObj.features && serverObj.features.has("VERIFIED")) $(this.verificationBadgeMarkup).insertBefore(avatar);
		}
	}

	resetServer (serverObj) {
		if (!serverObj) return;
		var avatar = serverObj.div.querySelector(BDFDB.dotCN.avataricon);
		if (avatar) {
			avatar.textContent = avatar.DSAColdName;
			$(serverObj.div).find(".DSAC-verification-badge").remove();
		}
	}
	
	getFolderObject (folderdiv) {
		var data = BDFDB.loadData(folderdiv.id, "ServerFolders", "folders");
		return data ? Object.assign({div:folderdiv}, data) : null;
	}
}
