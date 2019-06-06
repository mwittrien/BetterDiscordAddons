//META{"name":"DisplayServersAsChannels","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayServersAsChannels","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayServersAsChannels/DisplayServersAsChannels.plugin.js"}*//

class DisplayServersAsChannels {
	getName () {return "DisplayServersAsChannels";}

	getVersion () {return "1.2.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Display servers in a similar way as channels.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["New Guild Classes","Fixed for the new guild classes that are already present in canary"]]
		};
		
		this.patchModules = {
			"Guilds":"componentDidMount"
		};
		
		this.verificationBadgeMarkup =
			`<svg class="DSAC-verification-badge" name="Verified" width="24" height="24" viewBox="0 0 20 20">
				<g fill="none" fill-rule="evenodd">
					<path fill="transparent" d="M10,19.9894372 C10.1068171,19.9973388 10.2078869,20.000809 10.3011305,19.9998419 C11.2600164,19.8604167 12.3546966,19.5885332 12.8510541,19.0579196 C13.25685,18.6241176 13.617476,18.0901301 13.7559228,17.5412583 C14.9847338,18.4452692 17.0357846,18.1120142 18.1240732,16.9486174 C19.1632035,15.8377715 18.521192,14.1691402 18.1240732,13.1586037 C18.4557396,12.9959068 18.8016154,12.6966801 19.0750308,12.4043949 C19.7126372,11.7227841 20.0201294,10.9139249 19.9989792,10.0282152 C20.0201294,9.14250542 19.7126372,8.3336462 19.0750308,7.65203538 C18.8016154,7.35975019 18.4557396,7.06052352 18.1240732,6.89782664 C18.521192,5.88729007 19.1632035,4.21865882 18.1240732,3.10781287 C17.0357846,1.94441607 14.9847338,1.61116112 13.7559228,2.51517206 C13.617476,1.96630024 13.25685,1.4323127 12.8510541,0.998510722 C12.3546966,0.467897141 11.2584098,0.139640848 10.2995239,0.036840309 C10.2065991,-0.000647660524 10.1059015,0.00279555358 9.99948865,0.0106399384 C9.87772075,0.00268415336 9.76807998,-0.00081194858 9.67455589,0.000158000197 C8.88885259,0.157529668 7.63153446,0.482616331 7.14894593,0.998510722 C6.74314998,1.4323127 6.382524,1.96630024 6.24407717,2.51517206 C5.01526618,1.61116112 2.96421535,1.94441607 1.87592682,3.10781287 C0.836796482,4.21865882 1.47880798,5.88729007 1.87592682,6.89782664 C1.54426039,7.06052352 1.19838464,7.35975019 0.924969216,7.65203538 C0.287362828,8.3336462 -0.0201294289,9.14250542 0.00102081603,10.0282151 C-0.0201294289,10.9139249 0.287362828,11.7227841 0.924969216,12.4043949 C1.19838464,12.6966801 1.54426039,12.9959068 1.87592682,13.1586037 C1.47880798,14.1691402 0.836796482,15.8377715 1.87592682,16.9486174 C2.96421535,18.1120142 5.01526618,18.4452692 6.24407717,17.5412583 C6.382524,18.0901301 6.74314998,18.6241176 7.14894593,19.0579196 C7.63153446,19.573814 8.89045919,19.8426283 9.6761625,19.9541287 C9.7694061,20.000809 9.87866986,19.9973388 10,19.9894372 Z"/>
					<path fill="#7289da" d="M10.0004091,17.9551224 C10.0858672,17.9614327 10.1667272,17.964204 10.2413259,17.9634317 C11.0084737,17.8520863 11.8842627,17.6349594 12.281369,17.2112099 C12.6060224,16.8647745 12.8945379,16.4383305 13.005301,16 C13.9884001,16.7219456 15.6293247,16.4558073 16.5,15.5267154 C17.3313468,14.6395908 16.8177113,13.3070173 16.5,12.5 C16.7653467,12.3700698 17.0420615,12.1311066 17.260805,11.8976868 C17.7709162,11.3533505 18.0169226,10.7073933 18.0000015,10.0000632 C18.0169226,9.29273289 17.7709162,8.64677569 17.260805,8.10243942 C17.0420615,7.86901966 16.7653467,7.63005642 16.5,7.50012624 C16.8177113,6.69310896 17.3313468,5.36053545 16.5,4.47341082 C15.6293247,3.54431894 13.9884001,3.27818062 13.005301,4.00012624 C12.8945379,3.5617957 12.6060224,3.13535178 12.281369,2.78891632 C11.8842627,2.36516686 11.0071884,2.10302048 10.2400405,2.02092369 C10.1656968,1.99098569 10.0851346,1.99373545 10,2 C9.9025807,1.99364649 9.8148636,1.99085449 9.7400405,1.9916291 C9.11144571,2.11730654 8.10553978,2.37692165 7.71944921,2.78891632 C7.39479585,3.13535178 7.10628031,3.5617957 6.99551718,4.00012624 C6.01241812,3.27818062 4.37149355,3.54431894 3.5008182,4.47341082 C2.66947142,5.36053545 3.18310688,6.69310896 3.5008182,7.50012624 C3.23547149,7.63005642 2.95875674,7.86901966 2.74001321,8.10243942 C2.22990202,8.64677569 1.98389563,9.29273289 2.00081669,10.0000631 C1.98389563,10.7073933 2.22990202,11.3533505 2.74001321,11.8976868 C2.95875674,12.1311066 3.23547149,12.3700698 3.5008182,12.5 C3.18310688,13.3070173 2.66947142,14.6395908 3.5008182,15.5267154 C4.37149355,16.4558073 6.01241812,16.7219456 6.99551718,16 C7.10628031,16.4383305 7.39479585,16.8647745 7.71944921,17.2112099 C8.10553978,17.6232046 9.11273107,17.8378805 9.74132585,17.926925 C9.81592455,17.964204 9.90334002,17.9614327 10.0004091,17.9551224 Z"/>
					<path fill="#ffffff" d="M8.84273967,12.8167603 L13.8643,7.7952 C14.0513,7.6072 14.0513,7.3042 13.8643,7.1172 C13.6773,6.9312 13.3743,6.9312 13.1863,7.1172 L8.52303089,11.78139 L6.8883,10.1475 C6.6843,9.9445 6.3553,9.9445 6.1523,10.1475 C5.9493,10.3515 5.9493,10.6805 6.1523,10.8835 L8.08381122,12.8160053 C8.09561409,12.8309877 8.10844368,12.8454178 8.1223,12.8592 C8.3093,13.0472 8.6123,13.0472 8.8003,12.8592 L8.82157566,12.8379243 C8.82518839,12.8345112 8.82876362,12.8310364 8.8323,12.8275 C8.83584168,12.8239583 8.83932157,12.820378 8.84273967,12.8167603 Z"/>
				</g>
			</svg>`;

		this.css = `
			.DSAC-styled ${BDFDB.dotCN.guildswrapper},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscrollerwrap},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guilds},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildswrapperunreadmentionsindicatortop},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildswrapperunreadmentionsindicatorbottom} {
				width: 240px !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guilds + BDFDB.dotCN.scroller}::-webkit-scrollbar-thumb {
				background-color: rgb(22, 24, 27);
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpill} + * ${BDFDB.dotCN.guildicon},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpill} + * ${BDFDB.dotCN.guildiconacronym} {
				display: none !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guilds} > div[style*="height"]:not([class]) {
				margin-top: 8px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guilds} > div[style*="height"]:not([class]) + div[style*="height"]:not([class]) {
				margin-top: 0px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.dmpill} + * {
				margin-left: 5px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} {
				box-sizing: border-box;
				padding-left: 5px;
				align-items: center;
				justify-content: flex-start;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} {
				width: auto !important;
				height: auto !important;
				min-height: 16px !important;
				margin: 2px 0 !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildcontainer},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + ${BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * ${BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * ${BDFDB.dotCN.guildiconwrapper},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildbuttoninner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildserror},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildplaceholder} {
				height: 32px !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildseparator} {
				width: 230px !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCNS.guildcontainer},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * ${BDFDB.dotCN.guildsvg},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * ${BDFDB.dotCN.guildiconwrapper},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildbuttoninner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildplaceholder} {
				width: 225px !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + ${BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * ${BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildserror} {
				width: 222px !important;
				display: flex !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * foreignObject {
				width: 225px !important;
				mask: none;
				x: -88px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} {
				top: -8px;
				transform: scaleY(calc(32/50));
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCNS.dmpill + BDFDB.dotCN.guildpillitem} {
				min-height: calc(8px * (50/32));
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} .RANbutton,
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * {
				margin-left: 3px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.homebutton},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildbuttoninner} {
				display: flex;
				justify-content: flex-start;
				align-items: center;
				padding-right: 5px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildbuttoninner} svg {
				margin-right: 3px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.homebutton} svg {
				margin-right: 8px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildserror} {
				border-radius: 3px;
				margin-left: 3px;
				font-size: 0;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpill} + * ${BDFDB.dotCN.guildbadgewrapper} {
				display: flex;
				flex: 0 0;
				position: static;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpill} + * ${BDFDB.dotCN.guildlowerbadge},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpill} + * ${BDFDB.dotCN.guildupperbadge} {
				position: static;
				margin-top: 7px;
				margin-right: 3px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter} .DSAC-verification-badge {
				margin-top: 3px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} .DSAC-name {
				flex: 1 1;
				width: 215px;
				margin: 0 5px;
				font-size: 16px;
				font-weight: 400;
				line-height: 32px;
				color: white;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				pointer-events: none;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} .DSAC-icon {
				font-size: 20px;
				margin-right: 13px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildserror} .DSAC-name {
				margin-left: 4px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.homebutton} .DSAC-name,
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildbuttoninner} .DSAC-name {
				color: currentColor;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.homebutton} .DSAC-name {
				margin-top: 2px;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter}.RANbutton-frame,
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} .RANbutton {
				width: 230px !important;
				height: 32px !important;
			}
			#bd-pub-button,
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} .RANbutton {
				border-radius: 3px !important;
				display: block !important;
				color: white !important;
				font-weight: 400 !important;
				font-size: 16px !important;
				line-height: 32px !important;
				padding-left: 5px !important;
				text-transform: capitalize !important;
				text-align: left !important;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter}.folder.open .DSAC-name {
				text-decoration: underline;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + ${BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * ${BDFDB.dotCN.guildinner} {
				background-color: transparent;
				border-radius: 3px;
				overflow: hidden;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill} + * ${BDFDB.dotCN.guildinner}:hover {
				background-color: rgba(79,84,92,.3);
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + BDFDB.dotCNS._bdguildselected + BDFDB.dotCN.guildinner},
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + BDFDB.dotCNS._bdguildselected + BDFDB.dotCN.guildinner}:hover {
				background-color: rgba(79,84,92,.6);
			}
			#bd-pub-button {
				transition: background-color .15s ease-out,color .15s ease-out;
			}
			#bd-pub-button:hover {
				background-color: rgb(114,137,218);
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpill} + * ${BDFDB.dotCN.guildinner} .DSAC-name {
				opacity: 0.4;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildpill} + * ${BDFDB.dotCN.guildinner}:hover .DSAC-name {
				opacity: 0.9;
			}
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + BDFDB.dotCNS._bdguildselected + BDFDB.dotCN.guildinner} .DSAC-name,
			.DSAC-styled ${BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + BDFDB.dotCNS._bdguildselected + BDFDB.dotCN.guildinner}:hover .DSAC-name {
				opacity: 1;
			}
			.DSAC-styled .serverfolders-dragpreview .DSAC-name {
				color: white;
				font-size: 16px;
				font-weight: 400;
				width: 200px;
				height: 32px;
				line-height: 32px;
				margin-top: 9px;
				padding-left: 5px;
				text-overflow: ellipsis;
				overflow: hidden;
				background-color: rgba(79,84,92,.6);
				border-radius: 3px;
			}
			.DSAC-styled .serverfolders-dragpreview ${BDFDB.dotCN.guildiconacronym},
			.DSAC-styled .serverfolders-dragpreview ${BDFDB.dotCN.guildicon} {
				display: none;
			}`;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);
			
			BDFDB.addClass(document.body, "DSAC-styled");

			BDFDB.WebModules.forceAllUpdates(this);
			
			BDFDB.addEventListener(this, document, "mouseenter", BDFDB.dotCN.guildouter, e => {
				if (e.currentTarget.querySelector(BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill + "+ *")) BDFDB.appendLocalStyle("HideAllToolTips" + this.name, `${BDFDB.dotCN.tooltip} {display: none !important;}`);
			});
			BDFDB.addEventListener(this, document, "mouseleave", BDFDB.dotCN.guildouter, e => {
				if (e.currentTarget.querySelector(BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill + "+ *") && !document.querySelector(BDFDB.dotCN.guildpillwrapper + BDFDB.notCN.dmpill + "+ *:hover")) BDFDB.removeLocalStyle("HideAllToolTips" + this.name);
			});
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeClasses("DSAC-styled");
			BDFDB.removeEles(".DSAC-verification-badge, .DSAC-name, .DSAC-icon");
			
			BDFDB.removeLocalStyle("HideAllToolTips" + this.name);

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions
	
	processGuilds (instance, wrapper) {
		var observer = new MutationObserver((changes, _) => {changes.forEach((change, i) => {if (change.addedNodes) {change.addedNodes.forEach((node) => {
			if (node && BDFDB.containsClass(node, BDFDB.disCN.guildouter) && !node.querySelector(BDFDB.dotCN.guildserror)) {
				if (BDFDB.containsClass(node, "folder")) this.changeServer(this.getFolderObject(node));
				else this.changeServer(BDFDB.getServerData(node));
			}
			if (node && node.tagName && (node = node.querySelector(BDFDB.dotCN.guildbuttoncontainer)) != null) {
				this.changeButton(node);
			}
			if (node && node.tagName && (node = node.querySelector(BDFDB.dotCN.guildserror)) != null) {
				this.changeError(node);
			}
		});}});});
		BDFDB.addObserver(this, BDFDB.dotCN.guilds, {name:"serverListObserver",instance:observer}, {childList: true, subtree:true, attributes:true, attributeFilter: ["class", "draggable"], attributeOldValue: true});

		BDFDB.readServerList().forEach(info => {this.changeServer(info);});
		document.querySelectorAll(BDFDB.dotCN.guildouter + ".folder").forEach(folderdiv => {this.changeServer(this.getFolderObject(folderdiv));});
		document.querySelectorAll(BDFDB.dotCN.homebuttonpill + " + *").forEach(homebuttoncontainer => {this.changeHome(homebuttoncontainer);});
		document.querySelectorAll(BDFDB.dotCN.guildbuttonpill + " + *").forEach(guildbuttoncontainer => {this.changeButton(guildbuttoncontainer);});
		document.querySelectorAll(BDFDB.dotCN.guildserror).forEach(guildserror => {this.changeError(guildserror);});
	}

	changeServer (info) {
		if (!info || !info.div) return;
		var guildbadgewrapper = info.div.querySelector(BDFDB.dotCN.guildbadgewrapper);
		if (guildbadgewrapper) {
			BDFDB.removeEles(guildbadgewrapper.parentElement.querySelectorAll(".DSAC-verification-badge, .DSAC-name"));
			if (info.features && info.features.has("VERIFIED")) {
				guildbadgewrapper.parentElement.insertBefore(BDFDB.htmlToElement(this.verificationBadgeMarkup), guildbadgewrapper);
			}
			guildbadgewrapper.parentElement.insertBefore(BDFDB.htmlToElement(`<div class="DSAC-name">${BDFDB.encodeToHTML(info.name || info.folderName || "")}</div>`), guildbadgewrapper);
		}
	}

	changeHome (div) {
		if (!div) return;
		var homebutton = div.querySelector(BDFDB.dotCN.homebutton);
		if (homebutton) {
			BDFDB.removeEles(homebutton.querySelectorAll(".DSAC-name"));
			homebutton.insertBefore(BDFDB.htmlToElement(`<div class="DSAC-name">${BDFDB.encodeToHTML(BDFDB.LanguageStrings.HOME)}</div>`), homebutton.firstElementChild);
		}
	}
	
	changeButton (div) {
		if (!div) return;
		var guildbuttoninner = div.querySelector(BDFDB.dotCN.guildbuttoninner);
		if (guildbuttoninner) {
			BDFDB.removeEles(guildbuttoninner.querySelectorAll(".DSAC-name"));
			guildbuttoninner.insertBefore(BDFDB.htmlToElement(`<div class="DSAC-name">${BDFDB.encodeToHTML(BDFDB.getKeyInformation({node:div, key:"text", up:true}) || "")}</div>`), guildbuttoninner.firstElementChild);
		}
	}
	
	changeError (div) {
		if (!div) return;
		BDFDB.removeEles(div.querySelectorAll(".DSAC-name, .DSAC-icon"));
		div.insertBefore(BDFDB.htmlToElement(`<div class="DSAC-name">Server Outage</div>`), div.firstChild);
		div.appendChild(BDFDB.htmlToElement(`<div class="DSAC-icon">!</div>`));
	}

	getFolderObject (folderdiv) {
		var data = BDFDB.loadData(folderdiv.id, "ServerFolders", "folders");
		return data ? Object.assign({div:folderdiv}, data) : null;
	}
}
