//META{"name":"ServerFolders","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerFolders","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerFolders/ServerFolders.plugin.js"}*//

class ServerFolders {
	getName () {return "ServerFolders";}

	getVersion () {return "6.5.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Patches Discords native Folders in a way to open Servers within a Folder in a new bar to the right. Also adds a bunch of new features to more easily organize, customize and manage your Folders.";}

	constructor () {
		this.changelog = {
			"improved":[["Native Folder Support","Yes, it's here finally. ServerFolders now uses native Folders to emulate the old ServerFolders behaviour. This means you can now finally organize your Servers in Folders the old way without loosing the support on your phone. Everything should be working as it's used to. Below is a list of stuff that is <strong style='color: yellow;'>NEW</strong>"],["Folder Creation","Instead of creating a Folder with the targeted Server, a menu now opens that let's you select which Servers you want to add to the Folder before you create it"]],
			"fixed":[["Fixed?","Added back the option to create a Folder via the contextmenu, the amount of people which won't know how to create native Folders is worrying"],["Theme Issues","Fixed some theme issues with themes like ClearVision"]],
			"added":[["Port your old Folders","If you got a config with old SevrerFolders data in your plugins folder, the Plugin will ask you to port them over to native Folders. If you missed clicking on 'Okay' reload the plugin to reprompt the question"],["Mute Folders","You can now mute Folders, this will automatically mute all Servers that are within a Folder"],["Mini Servers or close icon","Don't like using a close icon to show that a Folder is closed? No problem, you can switch back to using the miniature Server preview that the native Folders use in the Foldersettings (the default icon always uses the miniature Server preview)"],["Delete native Folder","The option to delete a Folder was added to the native Folder contextmenu, meaning you can now delete native Folders more easily, watchout there is no way to revert this!"],["Server Sorting","Sorting Servers within a Folder now properly sorts them in a native way, meaning if you sort them in ServerFolders they will also change order on your phone or when you disable ServerFolders again"]]
		};
		
		this.labels = {};
		
		this.patchModules = {
			"Guilds":["componentDidMount","componentDidUpdate","componentWillUnmount"],
			"GuildFolder":["componentDidMount","componentDidUpdate"],
			"Guild":["componentDidMount","componentDidUpdate"],
			"GuildFolderSettingsModal":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.folderStates = {};
		this.folderReads = {};
		this.guildStates = {};

		this.css = `
			.${this.name}-modal .ui-icon-picker-icon {
				position: relative;
				margin: 3px 3px;
				padding: 3px 3px;
				width: 55px;
				height: 55px;
				border-radius: 12px;
			}
			.${this.name}-modal .ui-icon-picker-icon .ui-picker-inner {
				width: 100%;
				height: 100%;
				border-radius: 12px;
				background-position: center;
				background-size: cover;
				background-repeat: no-repeat;
			}
			.${this.name}-modal .ui-icon-picker-icon.selected ${BDFDB.dotCN.hovercardbutton} {
				display: none !important;
			}
			.${this.name}-modal .ui-icon-picker-icon ${BDFDB.dotCN.hovercardbutton} {
				position: absolute;
				top: -10px;
				right: -10px;
			}
			.${this.name}-modal .ui-icon-picker-icon.preview.nopic .ui-picker-inner {
				background: url('data:image/svg+xml; utf8, <svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" width="400" height="400"><path d="M40.400 17.178 C 39.850 17.366,38.793 17.538,38.050 17.560 C 33.351 17.699,23.397 24.788,21.381 29.432 C 21.087 30.109,20.566 30.896,20.223 31.181 C 19.880 31.465,19.600 31.866,19.600 32.071 C 19.600 32.276,19.236 33.242,18.792 34.218 C 16.345 39.589,16.345 49.611,18.792 54.982 C 19.236 55.958,19.600 56.918,19.600 57.116 C 19.600 57.314,19.960 57.802,20.400 58.200 C 20.840 58.598,21.200 59.131,21.200 59.385 C 21.200 60.391,25.680 64.942,91.505 130.800 C 128.995 168.310,159.849 199.326,160.068 199.724 C 160.409 200.344,150.950 209.964,93.989 266.924 C 18.798 342.113,19.600 341.292,19.600 343.126 C 19.600 343.283,19.250 344.065,18.822 344.864 C 15.429 351.195,15.958 362.918,19.932 369.440 C 22.094 372.990,27.474 378.800,28.598 378.800 C 28.861 378.800,29.402 379.160,29.800 379.600 C 30.198 380.040,30.703 380.400,30.922 380.400 C 31.141 380.400,32.238 380.831,33.360 381.358 C 34.482 381.886,36.480 382.533,37.800 382.797 C 43.786 383.994,44.323 384.027,47.299 383.386 C 48.895 383.042,51.010 382.619,52.000 382.446 C 52.990 382.274,54.517 381.743,55.394 381.266 C 56.271 380.790,57.188 380.400,57.432 380.400 C 57.676 380.400,58.202 380.040,58.600 379.600 C 58.998 379.160,59.598 378.800,59.932 378.800 C 60.267 378.800,91.725 347.615,129.839 309.500 C 169.057 270.281,199.496 240.145,199.964 240.073 C 200.602 239.975,216.001 255.193,267.495 306.814 C 327.046 366.511,339.531 378.800,340.627 378.800 C 340.798 378.800,341.265 379.097,341.667 379.461 C 345.728 383.136,361.013 384.409,365.685 381.461 C 366.188 381.143,367.024 380.757,367.541 380.602 C 370.583 379.691,376.623 374.200,379.382 369.836 C 385.105 360.785,384.039 346.409,377.039 338.228 C 376.084 337.113,344.846 305.743,307.621 268.517 C 255.329 216.224,239.969 200.647,240.070 200.009 C 240.143 199.545,270.062 169.288,308.216 131.091 C 345.625 93.641,376.723 62.370,377.324 61.600 C 384.286 52.678,385.036 40.621,379.277 30.171 C 376.136 24.469,367.906 18.537,361.668 17.477 C 354.656 16.286,345.095 17.665,341.883 20.331 C 341.567 20.594,340.549 21.318,339.622 21.941 C 338.695 22.563,307.031 53.972,269.259 91.737 C 231.486 129.501,200.330 160.400,200.022 160.400 C 199.714 160.400,168.938 129.869,131.631 92.554 C 56.225 17.131,60.288 21.047,55.200 18.887 C 51.591 17.354,42.836 16.343,40.400 17.178z" fill="rgb(220,43,67)"></path></svg>') center/cover no-repeat;
			}
			${BDFDB.dotCN.guildfolder}[style*="background-image"] {
				background-color: transparent !important;
				background-position: center !important;
				background-size: cover !important;
				background-repeat: no-repeat !important;
				transiton: unset !important;
			}
			${BDFDB.dotCN.guildfolder}[style*="background-image"] ${BDFDB.dotCN.guildfoldericonwrapper},
			${BDFDB.dotCN.guildfolderexpandendbackground},
			${BDFDB.dotCN.guildfolderexpandedguilds} {
				display: none !important;
			}
			${BDFDB.dotCN.guildupperbadge}.count {
				left: 0px;
				right: unset;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview {
				pointer-events: none !important;
				position: absolute !important;
				opacity: 0.5 !important;
				z-index: 10000 !important;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview,
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildinner},
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCNS.guildinner + BDFDB.dotCN.guildiconwrapper},
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCNS.guildinner + BDFDB.dotCNS.guildiconwrapper + BDFDB.dotCN.guildicon} {
				border-radius: 50% !important;
				width: 48px !important;
				height: 48px !important;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildpillwrapper},
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildbadgewrapper} {
				display: none !important;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildiconacronym} {
				color: white !important;
				background-color: #444 !important;
				border-radius: 50% !important;
				overflow: hidden !important;
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent {
				transition: width .3s linear !important;
				left: 72px;
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent .folderseparatorouter {
				margin-top: 10px;
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent.foldercontentclosed {
				width: 0px !important;
			}
			${BDFDB.dotCN.appcontainer} {
				display: flex !important;
			}
			${BDFDB.dotCN.guildswrapper} {
				position: static !important;
				contain: unset !important;
			}
			${BDFDB.dotCN.chatbase} {
				position: static !important;
				contain: unset !important;
				width: 100% !important;
			}`;

		this.folderContentMarkup = 
			`<div class="${BDFDB.disCNS.guildswrapper + BDFDB.disCN.guilds} foldercontent foldercontentclosed">
				<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.firefoxfixscrollflex + BDFDB.disCNS.guildsscrollerwrap + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
					<div class="${BDFDB.disCNS.guildsscroller + BDFDB.disCN.scroller}"></div>
				</div>
			</div>`;

		this.dragPlaceholderMarkup =
			`<div class="${BDFDB.disCNS.guildouter + BDFDB.disCN._bdguild} foldercopyplaceholder">
				<div class="${BDFDB.disCNS.guildpillwrapper + BDFDB.disCN.guildpill}">
					<span class="${BDFDB.disCN.guildpillitem}"></span>
				</div>
				<div tabindex="0" class="${BDFDB.disCNS.guildcontainer + BDFDB.disCN.guildinner}" role="button">
					<svg width="48" height="48" viewBox="0 0 48 48" class="${BDFDB.disCN.guildplaceholdermask}">
						<foreignObject mask="url(#svg-mask-squircle)" x="0" y="0" width="48" height="48">
							<div class="${BDFDB.disCN.guildplaceholder}"></div>
						</foreignObject>
					</svg>
					<div class="${BDFDB.disCN.guildbadgewrapper}"></div>
				</div>
			</div>`;

		this.folderIcons = [
			{openicon:`<path d="M 200,390 H 955 L 795,770 H 200 Z" fill="REPLACE_FILL2"/><path d="M 176.6,811 C 163.9,811 155.1,802.6 155,784.7 V 212.9 C 157.9,190.5 169,179.8 195.9,176 h 246 c 20.3,3.2 34.5,18.7 41,28.6 C 494.9,228.3 492.9,240.4 494,266 l 313.6,1.3 c 17.6,0.4 23.3,3.7 23.3,3.7 8.6,4.2 14.8,10.7 19,19.5 C 856.3,319.5 854,360 854,360 h 108.9 c 4.4,2.4 13.7,1.2 11.8,23.5 L 815.8,789.4 c -2.1,5.2 -12.5,13.6 -18.7,16.1 -6.8,2.7 -18.5,5.5 -23.9,5.5 z M 767,759 897,430 H 360 L 230,759 Z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 175,320 V 790 H 820 V 320 Z" fill="REPLACE_FILL2"/><path d="m 183,811 c -12.2,-0.6 -17.9,-4.8 -21.5,-8.2 C 159.5,801 154.8,792.6 155,779.7 V 215.6 c 3.3,-14.1 9.3,-21.4 15.1,-26.4 7.4,-6.3 16,-11.6 36.7,-13.2 h 237.3 c 23.3,6 32.2,18.7 38.7,28.6 7.6,11.7 9.4,18.6 10.3,41.4 L 494,266 h 313.4 c 16.9,0.1 23.5,5.1 23.5,5.1 8.6,4.2 14.5,10.9 19,19.5 0,0 3.7,7.5 3.1,19.8 V 777.2 c -1.1,9 -4.1,13.7 -4.1,13.7 -4.2,8.6 -10.7,14.8 -19.5,19 L 823.3,811 Z m 602.8,-55 c 2.8,-1.7 6.9,-4.5 8.9,-7.4 2.4,-3.6 5,-10.8 5.4,-24.7 V 362 c -0.2,-10.9 -4.2,-16.3 -4.2,-16.3 -2,-3 -5.9,-6.8 -8.7,-8.6 0,0 -5.8,-3 -12.7,-3.2 h -548.1 c -7.8,0 -13.9,3.6 -13.9,3.6 -3,2 -7.3,6.7 -8.4,17.3 v 386.4 c 2.8,10.4 7.5,16 13.6,17.7 h 544.9 c 11,-0.2 18.4,-1.9 23.3,-3 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="m 167,200 h 200 l 50,50 H 829.8 L 830,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="m 184,799 c -10.5,0 -22.3,-5.3 -27,-10 -4.7,-4.7 -9,-15.1 -9,-34 V 212 c 0,-13.3 5,-22 11,-28 4.4,-4.4 15.4,-10 30,-10 h 170.3 l 53.3,53 H 820 c 13.1,0 18.2,4.2 25,10 6.4,5.5 7,14.4 7,31 v 52 h 122.3 c 11.6,0 17.1,3.3 17.1,3.3 2.9,2.9 3.3,4.4 3.3,14.2 0,8.4 -0.9,13.5 -3.8,22.4 L 849,799 Z M 933,360 H 335 l -130,398.1 603.2,1.3 z M 289.7,334.6 c 3,-8.2 8,-14.8 17,-14.8 0,0 506.6,0.2 506.3,0.2 0,-39.8 -12.2,-53 -53,-53 L 403.3,266.7 350,213 H 240 c -37.6,0 -53,10.1 -53,53 v 382.7 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 173,190 V 771 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 184.2,799 C 170.3,799 164.3,795.8 157.4,788.9 151.7,783.3 148,774.6 148,754.9 V 211.2 c 0.7,-18.6 6,-21.7 11.9,-27.6 6.8,-6.8 15.5,-9.4 29.3,-9.6 h 170.1 l 53.3,53 h 407.7 c 14.1,0 18.6,2.8 25.3,9.4 6.4,6.4 7.1,13.4 7.1,30.8 v 246.1 247.4 c 0.2,11.8 -1.9,22.1 -7.4,27.6 C 839.7,793.9 831,799 819.4,799 Z M 813,707 V 415 c 0,-36.9 -13.9,-53 -53,-53 H 240 c -38.1,0 -53,11.7 -53,53 v 292 c 0,38.8 11.5,53 53,53 h 520 c 37.8,0 53,-12.1 53,-53 z M 760,267 c 0,0 -228.6,-0.3 -356.7,-0.3 L 350,213 H 240 c -41.6,2.7 -52.2,14.3 -53,53 v 54 h 626 c -0.6,-37.5 -12,-53 -53,-53 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="M 307,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 335 360 L 933 360 L 808.2 759.3 L 205 758.1 L 335 360 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 173,345 V 771 H 825 V 345 Z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 362 L 760 362 C 799.1 362 813 378.1 813 415 L 813 707 C 813 747.9 797.8 760 760 760 L 240 760 C 198.5 760 187 745.8 187 707 L 187 415 C 187 373.7 201.9 362 240 362 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="m 167,200 h 200 l 50,50 H 829.8 L 830,330 H 314 L 167,779 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 240 213 L 350 213 L 403.3 266.7 L 760 267 C 800.8 267 813 280.2 813 320 C 813.3 320 306.7 319.8 306.7 319.8 C 297.7 319.8 292.7 326.4 289.7 334.6 L 187 648.7 L 187 266 C 187 223.1 202.4 213 240 213 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 173,190 V 350 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 213 L 350 213 L 403.3 266.7 C 531.4 266.7 760 267 760 267 C 801 267 812.4 282.5 813 320 L 187 320 L 187 266 C 187.8 227.3 198.4 215.7 240 213 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="m 135,188 c -5.6,0 -13.9,2.9 -19.8,8.9 C 109.4,203 107,206.8 107,216 c 0,189.7 0,379.3 0,569 0,11.1 1.7,14.8 7,20.2 C 120.5,811.6 125.4,813 135,813 h 717 c 16.7,0 16.7,-1.6 18.6,-6.6 L 981.3,423.4 c 0,-5.8 -1,-6.2 -2.8,-8.1 -1.9,-1.9 -4.3,-2 -11.9,-2 l -691.9,2.1 c -16.4,0 -21.3,11.5 -23.4,17.2 l -80.9,263 -0.2,0 C 159.1,714.4 147,704.3 147,677.2 V 334 h 733 v -26 c 0,-7.7 -1.6,-14.7 -7.6,-19.8 C 866.3,283.1 860.4,280 852,280 H 440 l -20,-82 c -1.2,-2.5 -3.1,-6.8 -5.8,-7.7 0,0 -3,-2.3 -10.2,-2.3 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="m 135,813 c -10.3,0 -14.5,-1.4 -21,-7.8 C 108.7,799.8 107,796.1 107,785 c 0,-189.7 0,-379.3 0,-569 0,-9.2 2.4,-13 8.2,-19.1 C 121.1,190.9 129.4,188 135,188 h 269 c 7.2,0 10.2,2.3 10.2,2.3 2.7,0.9 4.6,5.2 5.8,7.7 l 20,82 h 412 c 8.4,0 14.3,3.1 20.4,8.2 C 878.4,293.3 880,300.3 880,308 v 26 H 147 v 343.2 c 0,27.1 18.1,25.2 21.7,5.4 l 32.7,-277.7 c 0.7,-2.8 2.7,-7.5 5.8,-10.6 C 210.4,391.1 214.5,388 222.7,388 H 852 c 7.9,0 15.9,2.9 20.5,7.5 C 878.3,401.3 880,408.6 880,416 v 369 c 0,6.9 -1.8,14.7 -7.4,19.3 C 866.2,809.6 858.9,813 852,813 Z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="m 186.3,187 c -20,0 -35.7,7.4 -47.4,19.3 -11.7,11.9 -17.6,25 -17.6,45.7 v 80 l -0.3,416 c 0,10.9 4.6,32.6 16.7,45.1 C 149.8,805.6 168,813 186.3,813 365.7,749.3 880.3,734.5 880.3,734.5 c 0,0 0,-255.4 0,-402.5 0,-16.9 -4.7,-35 -17.2,-47.4 -12.5,-12.4 -30.1,-17.6 -47.8,-17.6 h -310 l -79,-80 z" fill="REPLACE_FILL1"/><path d="m 175.1,810.3 79.1,-393 c 8.3,-23.6 21.8,-42.9 53.1,-43 H 920.6 c 17.7,0 35.9,19.5 33.7,29.3 l -73.7,365.7 c -9,24.8 -11.1,41.3 -51.8,44 H 185.6 c -3.6,0 -6.4,-0.1 -11.1,-0.9 z" fill="REPLACE_FILL2"/>`,
			closedicon:`<path d="m 121,252 c 0,-20.7 5.9,-33.8 17.6,-45.7 C 150.3,194.4 166,187 186,187 h 240 l 79,80 -384,113 z" fill="REPLACE_FILL1"/><path d="m 186,813 c -18.4,0 -36.5,-7.4 -48.6,-19.9 C 125.3,780.6 120.7,758.9 120.7,748 L 121,332 c 0,-16.9 7.2,-31.7 18.6,-43.5 C 151,276.7 170.1,267 186,267 h 629 c 17.6,0 35.2,5.3 47.8,17.6 C 875.3,297 880,315.1 880,332 v 416 c 0,14.8 -3.4,36.6 -17,47.9 C 849.5,807.2 830.9,813 815,813 Z" fill="REPLACE_FILL2"/>`},
			{openicon:`<path d="m 160,253 h 614 c 14.8,0 29.7,8.6 36.9,15.8 C 819.4,277.3 826,289.4 826,305 v 95 H 160 Z" fill="REPLACE_FILL2"/><path d="m 199,200 c -26.2,0 -33.9,6.5 -41.5,15.6 C 149.8,224.8 147,231.8 147,252 V 386.7 387 c -20.9,0.5 -56.5,-3.5 -70.3,6.9 -2.5,1.9 -5.4,3.2 -8.3,9.8 -6.8,25.6 -0.3,54.8 1.1,70.3 9.1,59.2 69.1,294.7 74.9,310 3.7,9.8 4.6,13.6 10,15 h 689.6 c 6.3,-1.4 11.6,-15 11.6,-15 L 931.8,474 c 2.7,-20 8.3,-54 -0.2,-70.3 -2,-3.5 -6.5,-8.1 -9.3,-9.8 C 902.5,385.1 881.9,387 853,387 852.6,369.4 855,346.8 846.6,333 842.4,326.2 830.5,321.3 826,321.3 V 387 L 173.2,386.7 173,387 v -82 c 0,-14.6 2.8,-25.9 12.4,-35.5 C 195.9,259 207.7,253 225,253 h 201 l -54,-53 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 160,400 V 253 h 440 v 147 z" fill="REPLACE_FILL2"/><path d="m 186,799 c -24.2,0 -34,-8 -39.7,-13.6 C 140.8,779.9 134,769.1 134,747 V 372 c 0,-21.5 13,-32 13,-32 V 252 c 0,-20.2 2.8,-27.2 10.5,-36.4 C 165.1,206.5 172.8,200 199,200 h 173 l 54,53 H 225 c -17.3,0 -29.1,6 -39.6,16.5 C 175.8,279.1 173,290.4 173,305 l -0.4,19 c 0,0 9.6,-4 20.9,-4 H 494 L 614,200 h 186 c 17.7,0 26.6,7.1 36,14.2 C 846.5,222 852,233.6 852,252 v 495 c 0,16.1 -7.5,30.2 -14.1,36.7 C 831.4,790.2 815.9,799 800,799 Z" fill="REPLACE_FILL1"/>`}
		];

		this.defaults = {
			settings: {
				closeOtherFolders:	{value:false, 	description:"Close other Folders when opening a Folder."},
				closeTheFolder:		{value:false, 	description:"Close the Folder when selecting a Server."},
				closeAllFolders:	{value:false, 	description:"Close All Folders when selecting a Server."},
				forceOpenFolder:	{value:false, 	description:"Force a Folder to open when switching to a Server of that Folder."},
				showCountBadge:		{value:true, 	description:"Display Badge for Amount of Servers in a Folder."},
				addSeparators:		{value:true, 	description:"Adds separators between Servers of different Folders."}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all custom Icons.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} removecustom-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Remove</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);
		
		BDFDB.addEventListener(this, settingspanel, "click", ".removecustom-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to remove all custom icons?", () => {
				BDFDB.removeAllData(this, "customicons");
			});
		});
		return settingspanel;
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
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
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
			
			// REMOVE 08.10.2019
			let foldersdata = BDFDB.sortObject(BDFDB.loadAllData(this, "folders"), "position");
			let folders = Object.keys(foldersdata).filter(n => n.indexOf("folder") == 0);
			if (folders.length) BDFDB.openConfirmModal(this, `Old ServerFolders data detected!\nFound ${folders.length} old custom folders in the ServerFolders.config.json.\nPress the '${BDFDB.LanguageStrings.OKAY}' button to automatically create a native folder for each old folder and to automatically put the servers in them.`, "Convert?", () => {
				let oldGuildFolders = Object.assign({}, BDFDB.LibraryModules.FolderStore.guildFolders);
				let guildsInFolders = [];
				let guildFolders = [];
				let guildPositions = [];
				let newfoldersdata = {};
				for (let folderid in foldersdata) {
					let newid = this.generateID("folder");
					let olddata = foldersdata[folderid];
					let color1 = BDFDB.colorCONVERT(olddata.color1, "HEX");
					guildFolders.push({
						guildIds: olddata.servers,
						folderId: newid,
						folderName: olddata.folderName,
						folderColor: color1 ? parseInt(color1.slice(1), 16) : 7506394
					});
					guildsInFolders = guildsInFolders.concat(olddata.servers);
					newfoldersdata[newid] = Object.assign({}, olddata);
					delete newfoldersdata[newid].position;
					delete newfoldersdata[newid].folderName;
					delete newfoldersdata[newid].folderId;
					delete newfoldersdata[newid].servers;
					delete newfoldersdata[newid].isOpen;
					newfoldersdata[newid].autoRead = newfoldersdata[newid].autounread;
					delete newfoldersdata[newid].autounread;
					newfoldersdata[newid].useCloseIcon = true;
					newfoldersdata[newid].muteFolder = false;
				}
				for (let i in oldGuildFolders) if (oldGuildFolders[i].folderId || !guildsInFolders.includes(oldGuildFolders[i].guildIds[0])) guildFolders.push(Object.assign({}, oldGuildFolders[i]));
				for (let i in guildFolders) for (let guildid of guildFolders[i].guildIds) guildPositions.push(guildid);
				BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
				BDFDB.removeAllData(this, "folders");
				BDFDB.saveAllData(newfoldersdata, this, "folders");
			});
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(this.foldercontent, BDFDB.dotCN.guildswrapper + ".foldercontent");
			
			let modal = document.querySelector(`.${this.name}-modal`);
			if (modal) {
				BDFDB.removeClass(modal, `${this.name}-modal`); 
				let modalclose = modal.querySelector(BDFDB.dotCN.modalclose);
				if (modalclose) modalclose.click();
			}
			
			for (let folderinner of document.querySelectorAll(`${BDFDB.dotCNS.guildfolderwrapper + BDFDB.dotCN.guildfolderexpandendbackground} ~ ${BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildinner}`)) {
				folderinner.removeEventListener("mouseenter", folderinner.ServerFoldersTooltipListener);
				folderinner.removeEventListener("mousedown", folderinner.ServerFoldersClickListener);
				BDFDB.removeEles(folderinner.querySelectorAll(`${BDFDB.dotCN.guildupperbadge}.count`));
			}
			
			for (let foldericon of document.querySelectorAll(BDFDB.dotCN.guildfolder)) {
				foldericon.style.removeProperty("background-image");
				foldericon.parentElement.parentElement.style.removeProperty("-webkit-mask");
			}
			
			BDFDB.unloadMessage(this);
		}
	}

	onSwitch () {
		if (typeof BDFDB === "object" && BDFDB.getData("forceOpenFolder", this, "settings")) {
			let folder = this.getFolderOfGuildId(BDFDB.LibraryModules.LastGuildStore.getGuildId());
			if (folder && !BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
		}
	}


	// begin of own functions

	onGuildContextMenu (instance, menu, returnvalue) {
		if (document.querySelector(".BDFDB-modal")) return;
		if (instance.props && instance.props.target && instance.props.folderId && instance.props.type == "GUILD_ICON_FOLDER" && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			let folderid = instance.props.folderId;
			let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(folderid);
			let data = this.getFolderConfig(folderid);
			let muted = data.muteFolder && folder.guildIds.every(guildid => BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildid));
			if (data.muteFolder != muted) {
				data.muteFolder = muted;
				BDFDB.saveData(folderid, data, this, "folders");
			}
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, "GuildFolderMarkReadItem");
			const autoreaditem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuToggleItem, {
				label: this.labels.foldercontext_autoreadfolder_text,
				className: `BDFDB-contextMenuToggleItem ${this.name}-contextMenuToggleItem ${this.name}-autoread-contextMenuToggleItem`,
				active: data.autoRead,
				action: state => {
					data.autoRead = state;
					BDFDB.saveData(folderid, data, this, "folders");
				}
			});
			if (index > -1) children.splice(index + 1, 0, autoreaditem);
			else children.push(autoreaditem);
			const muteGroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuToggleItem, {
					label: this.labels.foldercontext_mutefolder_text,
					className: `BDFDB-contextMenuToggleItem ${this.name}-contextMenuToggleItem ${this.name}-mutefolder-contextMenuToggleItem`,
					active: muted,
					action: state => {
						data.muteFolder = state;
						BDFDB.saveData(folderid, data, this, "folders");
						for (let guildid of folder.guildIds) if (BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildid) != state) BDFDB.LibraryModules.GuildSettingsUtils.updateNotificationSettings(guildid, {muted:state, suppress_everyone:state});
					}
				})
			});
			returnvalue.props.children.splice(returnvalue.props.children.length - 1, 0, muteGroup);
			const deleteGroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
					label: this.labels.foldercontext_removefolder_text,
					className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-removefolder-contextMenuItem`,
					danger: true,
					action: e => {
						BDFDB.closeContextMenu(BDFDB.getParentEle(BDFDB.dotCN.contextmenu, e.target));
						BDFDB.openConfirmModal(this, `Are you sure you want to remove the folder${folder.folderName ? (" '" + folder.folderName + '"') : ""}?`, () => {this.removeFolder(folderid);});
					}
				})
			});
			returnvalue.props.children.push(deleteGroup);
		}
		else if (instance.props && instance.props.target && instance.props.guild && instance.props.type == "GUILD_ICON_BAR" && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			let guildid = instance.props.guild.id;
			let folders = this.getFolders();
			let folder = this.getFolderOfGuildId(guildid);
			let addtofolderitems = [], openguilds = BDFDB.LibraryModules.FolderStore.getSortedGuilds().filter(n => !n.folderId).map(n => n.guilds[0]);
			for (let i = 0; i < folders.length; i++) addtofolderitems.push(BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: folders[i].folderName || (this.labels.modal_tabheader1_text + " #" + parseInt(i+1)),
				className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-addtofolder-contextMenuItem`,
				action: e => {
					BDFDB.closeContextMenu(menu);
					this.addGuildToFolder(folders[i].folderId, guildid);
				}
			}));
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const addType = !addtofolderitems.length ? "contextMenuItem" : "contextMenuSubItem";
			const itemgroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: this.labels.servercontext_serverfolders_text,
						className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-guild-contextMenuSubItem`,
						render: folder ? [
							BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.serversubmenu_removefromfolder_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-removefromfolder-contextMenuItem`,
								danger: true,
								action: e => {
									BDFDB.closeContextMenu(menu);
									this.removeGuildFromFolder(folder.folderId, guildid);
								}
							})
						] : [
							BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.serversubmenu_createfolder_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-createfolder-contextMenuItem`,
								disabled: !openguilds.length,
								action: e => {
									BDFDB.closeContextMenu(menu);
									this.openFolderCreationMenu(openguilds, guildid);
								}
							}),
							BDFDB.React.createElement(BDFDB.LibraryComponents[addType.charAt(0).toUpperCase() + addType.slice(1)], {
								label: this.labels.serversubmenu_addtofolder_text,
								className: `BDFDB-${addType} ${this.name}-${addType} ${this.name}-addtofolder-${addType}`,
								disabled: !addtofolderitems.length,
								render: addtofolderitems
							})
						]
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	processGuilds (instance, wrapper, returnvalue, methodnames) {
		if (methodnames.includes("componentWillUnmount")) {
			BDFDB.removeEles(this.foldercontent, BDFDB.dotCN.guildswrapper + ".foldercontent");
			delete this.foldercontent;
			delete this.foldercontentguilds;
		}
		if (methodnames.includes("componentDidMount")) {
			let process = () => {
				if (!wrapper.parentElement.querySelector(BDFDB.dotCN.guildswrapper + ".foldercontent")) {
					this.foldercontent = BDFDB.htmlToElement(this.folderContentMarkup);
					wrapper.parentElement.insertBefore(this.foldercontent, wrapper.nextElementSibling);
					this.foldercontentguilds = this.foldercontent.querySelector(BDFDB.dotCN.guildsscroller);
					this.toggleFolderContent();
				}
			};
			if (document.querySelector(BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + ":not(.copy) " + BDFDB.dotCN.guildiconwrapper)) process();
			else setTimeout(process, 5000);
		}
	}

	processGuildFolder (instance, wrapper, returnvalue, methodnames) {
		if (!this.foldercontentguilds) return;
		let state = this.getState(instance);
		let data = this.getFolderConfig(state.folderId);
		if (methodnames.includes("componentDidMount")) {
			if (data.muteFolder) for (let guildid of instance.props.guildIds) if (!BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildid)) BDFDB.LibraryModules.GuildSettingsUtils.updateNotificationSettings(guildid, {muted:true, suppress_everyone:true});
		}
		if (!BDFDB.equals(state, this.folderStates[instance.props.folderId])) {
			if (data.autoRead && (state.unread || state.badge > 0)) {
				clearTimeout(this.folderReads[state.folderId]);
				this.folderReads[state.folderId] = setTimeout(() => {
					BDFDB.markGuildAsRead(instance.props.guildIds);
				}, 10000);
			}
			this.toggleFolderContent();
			if (state.expanded) setImmediate(() => {
				for (let guildid of instance.props.guildIds) this.updateGuildInFolderContent(state.folderId, guildid);
				if (this.clickedFolder == state.folderId && BDFDB.getData("closeOtherFolders", this, "settings")) for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) if (openFolderId != state.folderId) {
					BDFDB.removeEles(this.foldercontent.querySelectorAll(`${BDFDB.dotCN.guildouter}[folderid="${openFolderId}"]`));
					BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
				}
				this.addSeparator(state.folderId);
			});
			else setTimeout(() => {
				BDFDB.removeEles(this.foldercontent.querySelectorAll(`${BDFDB.dotCN.guildouter}[folderid="${state.folderId}"]`));
				if (BDFDB.containsClass(this.foldercontentguilds.firstElementChild, "folderseparatorouter")) BDFDB.removeEles(this.foldercontentguilds.firstElementChild);
			}, BDFDB.LibraryModules.FolderUtils.getExpandedFolders().size > 0 ? 0 : 300);
			this.changeFolder(state.folderId, wrapper);
		}
		this.folderStates[state.folderId] = state;
	}

	processGuild (instance, wrapper, returnvalue, methodnames) {
		if (!this.foldercontentguilds) return;
		if (instance.props && instance.props.guild) {
			if (methodnames.includes("componentDidMount")) {
				BDFDB.addEventListener(this, wrapper, "click", () => {setImmediate(() => {
					let settings = BDFDB.getAllData(this, "settings");
					if (settings.closeAllFolders) for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
					else if (settings.closeTheFolder) {
						let folder = this.getFolderOfGuildId(instance.props.guild.id);
						if (folder && BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
					}
				})});
			}
			if (methodnames.includes("componentDidUpdate")) {
				let folder = this.getFolderOfGuildId(instance.props.guild.id);
				if (folder) {
					let state = this.getState(instance);
					if (!BDFDB.equals(state, this.guildStates[instance.props.guild.id])) this.updateGuildInFolderContent(folder.folderId, instance.props.guild.id);
				}
			}
		}
	}
	
	processGuildFolderSettingsModal (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.folderId) {
			let folderid = instance.props.folderId;
			let data = this.getFolderConfig(folderid);
			wrapper = wrapper.parentElement;
			let root = wrapper.querySelector(BDFDB.dotCN.layermodal);
			let header = wrapper.querySelector(BDFDB.dotCN.modalheader);
			let form = wrapper.querySelector(BDFDB.dotCN.modalsubinner + " form");
			BDFDB.addClass(root, "BDFDB-modal", `${this.name}-modal`, BDFDB.disCN.layermodalmedium);
			BDFDB.removeClass(root, BDFDB.disCN.layermodalsmall);
			if (header) {
				clearInterval(this.settingsModalWait);
				header.parentElement.insertBefore(BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.marginbottom8 + BDFDB.disCN.tabbarcontainer}" style="flex: 0 0 auto; padding-right: 12px;"><div class="${BDFDB.disCNS.tabbar + BDFDB.disCN.tabbartop}"><div tab="folder" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">${this.labels.modal_tabheader1_text}</div><div tab="icon" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">${this.labels.modal_tabheader2_text}</div><div tab="tooltip" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">${this.labels.modal_tabheader3_text}</div><div tab="custom" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">${this.labels.modal_tabheader4_text}</div></div></div>`), header.nextElementSibling);
			}
			if (root && form) {
				form.setAttribute("tab", "folder");
				BDFDB.addClass(form, "tab-content", BDFDB.disCN.marginbottom8);
				for (let child of form.childNodes) if (form.firstElementChild != child) BDFDB.toggleEles(child, false);
				form.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.marginbottom20}"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_iconpicker_text}</h5><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap} icons" style="flex: 1 1 auto;"></div></div>`));
				form.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="width: calc(100% - 10px);"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.labels.modal_usecloseicon_text}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-usecloseicon"></div></div>`));
				form.parentElement.appendChild(BDFDB.htmlToElement(`<div tab="icon" class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} tab-content" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.marginbottom20}"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_colorpicker1_text}</h5><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap} swatches" style="flex: 1 1 auto;"></div></div><div class="${BDFDB.disCN.marginbottom20}"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_colorpicker2_text}</h5><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap} swatches" style="flex: 1 1 auto;"></div></div></div>`));
				form.parentElement.appendChild(BDFDB.htmlToElement(`<div tab="tooltip" class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} tab-content" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.marginbottom20}"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_colorpicker3_text}</h5><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap} swatches" style="flex: 1 1 auto;"></div></div><div class="${BDFDB.disCN.marginbottom20}"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_colorpicker4_text}</h5><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap} swatches" style="flex: 1 1 auto;"></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="width: calc(100% - 10px);"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.labels.modal_copytooltipcolor_text}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-copytooltipcolor"></div></div></div>`));
				form.parentElement.appendChild(BDFDB.htmlToElement(`<div tab="custom" class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} tab-content" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.marginbottom20}"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_customopen_text}</h5><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" option="open" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" placeholder="Url or Filepath"></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input type="file" option="open" accept="image/*" style="display:none!important;"></button></div></div><div class="${BDFDB.disCN.marginbottom20}"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_customclosed_text}</h5><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" option="closed" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" placeholder="Url or Filepath"></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input type="file" option="closed" accept="image/*" style="display:none!important;"></button></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><h5 class="${BDFDB.disCNS.h5 + BDFDB.disCN.h5defaultmargin}">${this.labels.modal_custompreview_text}</h5></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifycenter + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><div class="ui-icon-picker-icon preview nopic open"><div class="ui-picker-inner"></div></div><div class="ui-icon-picker-icon preview nopic closed" style="margin-left: 25px; margin-right: 25px;"><div class="ui-picker-inner"></div></div><div class="ui-icon-picker-icon preview nopic switching"><div class="ui-picker-inner"></div></div></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addcustom" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div></div>`));
				
				let usecloseiconinput = root.querySelector("#input-usecloseicon");
				let copytooltipcolorinput = root.querySelector("#input-copytooltipcolor");
				
				usecloseiconinput.checked = data.useCloseIcon;
				copytooltipcolorinput.checked = data.copyTooltipColor;
				this.setIcons(form, data.iconID);
				BDFDB.setColorSwatches(root, data.color1);
				BDFDB.setColorSwatches(root, data.color2);
				BDFDB.setColorSwatches(root, data.color3);
				BDFDB.setColorSwatches(root, data.color4);

				BDFDB.addChildEventListener(root, "change", "input[type='file'][option]", e => {
					let input = e.currentTarget, file = input.files[0];
					if (file) setImmediate(() => {this.fetchCustomIcon(root, input.getAttribute("option"))});
				});
				BDFDB.addChildEventListener(root, "keyup", "input[type='text'][option]", e => {
					if (e.which == 13) this.fetchCustomIcon(root, e.currentTarget.getAttribute("option"));
				});
				BDFDB.addChildEventListener(root, "click", ".btn-addcustom", () => {
					this.saveCustomIcon(root);
				});
				BDFDB.addChildEventListener(root, "click", BDFDB.dotCNS.modalfooter + BDFDB.dotCN.button, e => {
					var olddata = Object.assign({}, data);
					var selectedIcon = root.querySelector(".ui-icon-picker-icon.selected");
					data.iconID = selectedIcon.getAttribute("value");

					data.useCloseIcon = usecloseiconinput.checked;
					data.copyTooltipColor = copytooltipcolorinput.checked;
					
					data.color1 = BDFDB.getSwatchColor(root, 1);
					data.color2 = BDFDB.getSwatchColor(root, 2);
					data.color3 = BDFDB.getSwatchColor(root, 3);
					data.color4 = BDFDB.getSwatchColor(root, 4);

					if (!BDFDB.equals(olddata, data)) {
						let folderIcons = this.loadAllIcons();
						let isCustom = BDFDB.containsClass(selectedIcon, "custom");
						data.icons.openicon = folderIcons[data.iconID] ? (!isCustom ? this.createBase64SVG(folderIcons[data.iconID].openicon, data.color1, data.color2) : folderIcons[data.iconID].openicon) : null;
						data.icons.closedicon = folderIcons[data.iconID] ? (!isCustom ? this.createBase64SVG(folderIcons[data.iconID].closedicon, data.color1, data.color2) : folderIcons[data.iconID].closedicon) : null;
						BDFDB.saveData(folderid, data, this, "folders");
						instance.handleColorChange(data.color1 ? parseInt(BDFDB.colorCONVERT(data.color1 && BDFDB.isObject(data.color1) ? data.color1[Object.keys(data.color1)[0]] : data.color1, "HEX").slice(1), 16) : null);
						this.changeFolder(folderid);
					}
				});
			}
			BDFDB.initElements(wrapper);
		}
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated && this.foldercontent) {
			delete this.SettingsUpdated;
			this.folderStates = {};
			BDFDB.WebModules.forceAllUpdates(this, "GuildFolder");
		}
	}

	loadAllIcons () {
		let icons = {};
		this.folderIcons.forEach((array,i) => {icons[i] = {"openicon":array.openicon,"closedicon":array.closedicon,"customID":null};});
		Object.assign(icons, BDFDB.loadAllData(this, "customicons"));
		return icons;
	}

	fetchCustomIcon (modal, type) {
		let successFetchIcon;
		let url = modal.querySelector("input[type='text'][option='" + type + "']").value;
		if (url.indexOf("http") == 0) {
			BDFDB.LibraryRequires.request(url, (error, response, result) => {
				if (response) {
					let type = response.headers["content-type"];
					if (type && type.indexOf("image") > -1) {
						successFetchIcon();
						return;
					}
				}
				BDFDB.showToast("Use a valid direct link to an image source. They usually end on something like .png, .jpg or .gif.", {type:"danger"});
			});
		}
		else {
			if (BDFDB.LibraryRequires.fs.existsSync(url)) {
				BDFDB.LibraryRequires.fs.readFile(url, (error, response) => {
					if (!error) {
						url = `data:image/png;base64,${response.toString("base64")}`;
						successFetchIcon();
					}
				});
			}
			else {
				BDFDB.showToast("Could not fetch file. Please make sure the file exists.", {type:"danger"});
			}
		}

		successFetchIcon = () => {
			let iconpreview = modal.querySelector(".ui-icon-picker-icon.preview." + type);
			let iconpreviewinner = iconpreview.querySelector(".ui-picker-inner");
			BDFDB.removeClass(iconpreview, "nopic");
			iconpreview.url = url;
			iconpreviewinner.style.setProperty("background-image", `url(${url})`);

			let iconpreviewopen = modal.querySelector(".ui-icon-picker-icon.preview.open");
			let iconpreviewclosed = modal.querySelector(".ui-icon-picker-icon.preview.closed");
			if (!BDFDB.containsClass(iconpreviewopen, "nopic") && !BDFDB.containsClass(iconpreviewclosed, "nopic")) {
				let iconpreviewswitching = modal.querySelector(".ui-icon-picker-icon.preview.switching");

				let iconpreviewopenimage = iconpreviewopen.querySelector(".ui-picker-inner").style.getPropertyValue("background-image");
				let iconpreviewclosedimage = iconpreviewclosed.querySelector(".ui-picker-inner").style.getPropertyValue("background-image");
				let iconpreviewswitchinginner = iconpreviewswitching.querySelector(".ui-picker-inner");

				BDFDB.removeClass(iconpreviewswitching, "nopic");
				iconpreviewswitchinginner.style.setProperty("background-image", iconpreviewopenimage);
				let switching = true;
				iconpreviewswitching.switchInterval = setInterval(() => {
					switching = !switching;
					iconpreviewswitchinginner.style.setProperty("background-image", switching ? iconpreviewopenimage : iconpreviewclosedimage);
				},1000);
			}
		};
	}

	saveCustomIcon (modal) {
		let iconpreviewopen = modal.querySelector(".ui-icon-picker-icon.preview.open");
		let iconpreviewclosed = modal.querySelector(".ui-icon-picker-icon.preview.closed");
		let iconpreviewswitching = modal.querySelector(".ui-icon-picker-icon.preview.switching");
		if (!BDFDB.containsClass(iconpreviewopen, "nopic") && !BDFDB.containsClass(iconpreviewclosed, "nopic") && !BDFDB.containsClass(iconpreviewswitching, "nopic")) {
			let customID = this.generateID("customicon");
			BDFDB.saveData(customID, {"openicon":iconpreviewopen.url,"closedicon":iconpreviewclosed.url,customID}, this, "customicons");
			modal.querySelectorAll("input[type='text'][option]").forEach((input) => {input.value = "";});

			let iconpreviewopeninner = iconpreviewopen.querySelector(".ui-picker-inner");
			let iconpreviewclosedinner = iconpreviewclosed.querySelector(".ui-picker-inner");
			let iconpreviewswitchinginner = iconpreviewswitching.querySelector(".ui-picker-inner");

			BDFDB.addClass(iconpreviewopen, "nopic");
			iconpreviewopeninner.style.removeProperty("background-image");
			BDFDB.addClass(iconpreviewclosed, "nopic");
			iconpreviewclosedinner.style.removeProperty("background-image");
			BDFDB.addClass(iconpreviewswitching, "nopic");
			iconpreviewswitchinginner.style.removeProperty("background-image");
			clearInterval(iconpreviewswitching.switchInterval);
			BDFDB.showToast(`Custom Icon was added to selection.`, {type:"success"});
			this.setIcons(modal, modal.querySelector(".ui-icon-picker-icon.selected").getAttribute("value"));
		}
		else {
			BDFDB.showToast(`Add an image for the open and the closed icon.`, {type:"danger"});
		}
	}

	generateID (prefix) {
		if (prefix == "folder") {
			let id = Math.floor(Math.random() * 4294967296);
			return BDFDB.LibraryModules.FolderStore.guildFolders.every(n => !n.folderId || n.folderId != id) ? id : this.generateID(prefix);
		}
		else {
			let data = BDFDB.loadAllData(this, prefix + "s");
			let id = prefix + "_" + Math.round(Math.random()*10000000000000000);
			return data[id] ? this.generateID(prefix) : id;
		}
	}

	setIcons (modal, selection) {
		let wrapper = modal.querySelector(".icons");
		if (!wrapper) return;
		BDFDB.removeEles(wrapper.childNodes);

		let folderIcons = this.loadAllIcons();
		for (let id in folderIcons) if (!folderIcons[id].customID) {
			folderIcons[id].openicon = this.createBase64SVG(folderIcons[id].openicon);
			folderIcons[id].closedicon = this.createBase64SVG(folderIcons[id].closedicon);
		}

		wrapper.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.margintop4}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifycenter + BDFDB.disCNS.alignstretch + BDFDB.disCN.wrap} ui-icon-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;"><div class="ui-icon-picker-icon" value="-1"><div class="ui-picker-inner"><svg aria-hidden="false" width="50" height="50" viewBox="-2 -1 25 25" style="color: black;"><path fill="currentColor" d="M20 7H12L10.553 5.106C10.214 4.428 9.521 4 8.764 4H3C2.447 4 2 4.447 2 5V19C2 20.104 2.895 21 4 21H20C21.104 21 22 20.104 22 19V9C22 7.896 21.104 7 20 7Z"></path></svg></div></div>${Object.getOwnPropertyNames(folderIcons).map(id => `<div class="ui-icon-picker-icon${folderIcons[id].customID ? ' custom' : ''}" value="${id}"><div class="ui-picker-inner" style="background: url(${folderIcons[id].closedicon}) center/cover no-repeat;"></div>${folderIcons[id].customID ? '<div value="' + id + '" class="' + BDFDB.disCN.hovercardbutton + '"></div>' : ''}</div>`).join("")}</div></div>`));

		setIcon(wrapper.querySelector(`.ui-icon-picker-icon[value="${folderIcons[selection] ? selection : -1}"]`), false, true);

		BDFDB.addChildEventListener(wrapper, "click", ".ui-icon-picker-icon", e => {
			if (BDFDB.containsClass(e.target, BDFDB.disCN.hovercardbutton)) return;
			setIcon(wrapper.querySelector(".ui-icon-picker-icon.selected"), false, false);
			setIcon(e.currentTarget, true, true);
		});
		BDFDB.addChildEventListener(wrapper, "click", BDFDB.dotCN.hovercardbutton, e => {
			if (BDFDB.containsClass(e.currentTarget.parentElement, "selected")) return;
			BDFDB.removeData(e.currentTarget.getAttribute("value"), this, "customicons");
			e.currentTarget.parentElement.remove();
			BDFDB.showToast(`Custom Icon was deleted.`, {type:"success"});
		});
		BDFDB.addChildEventListener(wrapper, "mouseenter", ".ui-icon-picker-icon", e => {
			setIcon(e.currentTarget, true);
			if (e.currentTarget.getAttribute("value") == -1) BDFDB.createTooltip(BDFDB.LanguageStrings.DEFAULT, e.currentTarget, {type:"top"});
		});
		BDFDB.addChildEventListener(wrapper, "mouseleave", ".ui-icon-picker-icon", e => {
			setIcon(e.currentTarget, false);
		});

		function setIcon (icon, hover, enable) {
			if (!icon) return;
			let id = icon.getAttribute("value");
			if (enable != undefined) BDFDB.toggleClass(icon, "selected", enable);
			if (hover) {
				if (folderIcons[id]) icon.querySelector(".ui-picker-inner").style.setProperty("background-image", `url(${folderIcons[id].openicon})`);
				if (BDFDB.containsClass(icon, "selected")) icon.style.setProperty("background-color", "rgb(255,255,255,0.2)");
				else icon.style.setProperty("background-color", "rgb(255,255,255,0.1)");
			}
			else {
				if (folderIcons[id]) icon.querySelector(".ui-picker-inner").style.setProperty("background-image", `url(${folderIcons[id].closedicon})`);
				if (BDFDB.containsClass(icon, "selected")) icon.style.setProperty("background-color", "rgb(255,255,255,0.2)");
				else icon.style.removeProperty("background-color");
			}
		}
	}

	getState (instance) {
		let state = {};
		for (let key in instance.props) {
			if (typeof instance.props[key] != "object" && typeof instance.props[key] != "function") state[key] = instance.props[key];
			else if (Array.isArray(instance.props[key])) state[key] = instance.props[key].length;
		}
		return state;
	}
	
	getFolders () {
		let found = [], folders = Object.assign({}, BDFDB.LibraryModules.FolderStore.guildFolders);
		for (let pos in folders) if (folders[pos].folderId) found.push(Object.assign({}, folders[pos]));
		return found;
	}
	
	getFolderOfGuildId (guildid) {
		if (!guildid) return null;
		for (let folder of BDFDB.LibraryModules.FolderStore.guildFolders) if (folder.folderId && folder.guildIds.includes(guildid)) return folder;
	}
	
	getFolderConfig (folderid) {
		let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(folderid) || {};
		let config = BDFDB.loadData(folderid, this, "folders") || {
			iconID: 			"-1",
			icons: 				{openicon: null, closedicon: null},
			muteFolder: 		false,
			autoRead: 			false,
			copyTooltipColor: 	false,
			useCloseIcon: 		true,
			color1: 			null,
			color2: 			["255","255","255"],
			color3: 			null,
			color4: 			null
		};
		if (!config.color1) config.color1 = folder.folderColor ? BDFDB.colorCONVERT("#" + folder.folderColor.toString(16), "RGBCOMP") : ["0","0","0"];
		return config;
	}

	toggleFolderContent (forceOpenClose) {
		if (!this.foldercontentguilds) return;
		forceOpenClose = forceOpenClose === undefined ? BDFDB.LibraryModules.FolderUtils.getExpandedFolders().size > 0 : forceOpenClose;
		BDFDB.toggleClass(this.foldercontent, "foldercontentopen", forceOpenClose);
		BDFDB.toggleClass(this.foldercontent, "foldercontentclosed", !forceOpenClose);
		BDFDB.toggleClass(document.body, "foldercontentopened", forceOpenClose);
	}
	
	changeFolder (folderid, wrapper) {
		wrapper = wrapper || BDFDB.getFolderDiv(folderid);
		if (wrapper) {
			let folderinner = wrapper.querySelector(`${BDFDB.dotCN.guildfolderexpandendbackground} ~ ${BDFDB.dotCNS.guildouter + BDFDB.dotCN.guildinner}`);
			let foldericon = wrapper.querySelector(BDFDB.dotCN.guildfolder);
			if (folderinner && foldericon) {
				let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(folderid);
				let data = this.getFolderConfig(folderid);
				
				BDFDB.removeEles(folderinner.querySelectorAll(`${BDFDB.dotCN.guildupperbadge}.count`));
				foldericon.parentElement.parentElement.style.removeProperty("-webkit-mask");
				
				if (BDFDB.getData("showCountBadge", this, "settings")) {
					folderinner.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.guildupperbadge} count" style="opacity: 1; transform: translate(0px, 0px);"><div class="${BDFDB.disCN.guildbadgenumberbadge}" style="background-color: rgb(114, 137, 218); width: ${folder.guildIds.length > 99 ? 28 : (folder.guildIds.length > 9 ? 22 : 16)}px; padding-right: ${folder.guildIds.length > 99 ? 0 : (folder.guildIds.length > 9 ? 0 : 1)}px;">${folder.guildIds.length}</div></div>`));
					let width = folder.guildIds.length > 99 ? 36 : (folder.guildIds.length > 9 ? 30 : 24);
					foldericon.parentElement.parentElement.style.setProperty("-webkit-mask", `url(data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" fill="black" x="0" y="0" width="48" height="48"><path d="M ${width-7} 0 C ${width-5} 2 ${width-4} 5 ${width-4} 8 C ${width-4} ${width/1.8+3} 15 20 8 20 C 5 20 2 19 0 17 L 0 50 L 50 50 L 50 0 L 17 0 z"></path></svg>`)})`);
				}
				let icontype = BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folderid) ? "openicon" : "closedicon";
				let icon = icontype != "closedicon" || data.useCloseIcon ? data.icons[icontype] : null;
				if (icon) foldericon.style.setProperty("background-image", `url(${icon})`, "important");
				else foldericon.style.removeProperty("background-image");
				
				folderinner.removeEventListener("mouseenter", folderinner.ServerFoldersTooltipListener);
				folderinner.removeEventListener("mousedown", folderinner.ServerFoldersClickListener);
				if (data.color3 || data.color4) {
					var isgradient3 = data.color3 && BDFDB.isObject(data.color3);
					var isgradient4 = data.color4 && BDFDB.isObject(data.color4);
					var bgColor = data.color3 ? (!isgradient3 ? BDFDB.colorCONVERT(data.color3, "RGBA") : BDFDB.colorGRADIENT(data.color3)) : "";
					var fontColor = data.color4 ? (!isgradient4 ? BDFDB.colorCONVERT(data.color4, "RGBA") : BDFDB.colorGRADIENT(data.color4)) : "";
					var folderName = folder.folderName || BDFDB.getReactValue(wrapper, "return.stateNode.props.defaultFolderName");
					folderinner.ServerFoldersTooltipListener = () => {
						BDFDB.createTooltip(isgradient4 ? `<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${fontColor} !important;">${BDFDB.encodeToHTML(folderName)}</span>` : folderName, folderinner, {type:"right", selector:"ServerFolders-tooltip", style:`${isgradient4 ? '' : 'color: ' + fontColor + ' !important; '}background: ${bgColor} !important; border-color: ${isgradient3 ? BDFDB.colorCONVERT(data.color3[0], "RGBA") : bgColor} !important;`,css:`body ${BDFDB.dotCN.tooltip}:not(.ServerFolders-tooltip) {display: none !important;}`, html:isgradient3});
					};
					folderinner.addEventListener("mouseenter", folderinner.ServerFoldersTooltipListener);
				}
				folderinner.ServerFoldersClickListener = () => {
					clearTimeout(this.clickedFolderTimeout);
					this.clickedFolder = folderid;
					this.clickedFolderTimeout = setTimeout(() => {
						delete this.clickedFolderTimeout;
					}, 3000);
				};
				folderinner.addEventListener("mousedown", folderinner.ServerFoldersClickListener);
			}
		}
	}

	updateGuildInFolderContent (folderid, guildid) {
		if (!this.foldercontentguilds || !folderid || !guildid) return;
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(guildid);
		if (guild) {
			let oldCopy = this.foldercontentguilds.querySelector(`.copy[guildid="${guildid}"]`);
			let newCopy = this.createCopyOfServer(folderid, guildid);
			if (!newCopy) return;
			else if (oldCopy) {
				this.foldercontentguilds.insertBefore(newCopy, oldCopy);
				BDFDB.removeEles(oldCopy);
			}
			else {
				let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(folderid);
				let position = folder.guildIds.indexOf(guildid);
				let siblingId = position > -1 ? folder.guildIds[folder.guildIds.indexOf(guildid) + 1] : null; 
				let insertNode = siblingId ? this.foldercontentguilds.querySelector(`[guildid="${siblingId}"][folderid="${folderid}"]`) : null;
				if (!insertNode) {
					let sameFolderEles = this.foldercontentguilds.querySelectorAll(`[folderid="${folderid}"]`);
					insertNode = sameFolderEles.length > 0 ? sameFolderEles[sameFolderEles.length - 1].nextSibling : null;
				}
				this.foldercontentguilds.insertBefore(newCopy, insertNode);
			}
			if (BDFDB.containsClass(this.foldercontentguilds.firstElementChild, "folderseparatorouter")) BDFDB.removeEles(this.foldercontentguilds.firstElementChild);
		}
	}

	addSeparator (folderid) {
		if (!this.foldercontentguilds) return;
		if (!this.foldercontent.querySelector(`.folderseparatorouter[folderid="${folderid}"]`) && BDFDB.getData("addSeparators", this, "settings")) this.foldercontentguilds.insertBefore(BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.guildouter + BDFDB.disCN._bdguildseparator} folderseparatorouter" folderid="${folderid}"><div class="${BDFDB.disCN.guildseparator} folderseparator"></div></div>`), this.foldercontentguilds.querySelectorAll(`[folderid="${folderid}"]`)[0]);
		if (BDFDB.containsClass(this.foldercontentguilds.firstElementChild, "folderseparatorouter")) BDFDB.removeEles(this.foldercontentguilds.firstElementChild);
	}

	createBase64SVG (paths, color1 = "#000000", color2 = "#FFFFFF") {
		if (paths.indexOf("<path ") != 0) return paths;
		let isgradient1 = color1 && BDFDB.isObject(color1);
		let isgradient2 = color1 && BDFDB.isObject(color2);
		let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="-60 -50 1100 1100">`;
		if (isgradient1) {
			svg += `<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">`;
			for (let pos of Object.keys(color1).sort()) svg += `<stop offset="${pos * 100}%" style="stop-color: ${color1[pos]};"></stop>`;
			svg += `</linearGradient>`;
		}
		if (isgradient2) {
			svg += `<linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">`;
			for (let pos of Object.keys(color2).sort()) svg += `<stop offset="${pos * 100}%" style="stop-color: ${color2[pos]};"></stop>`;
			svg += `</linearGradient>`;
		}
		svg += `${paths.replace("REPLACE_FILL1", isgradient1 ? "url(#grad1)" : BDFDB.colorCONVERT(color1, "RGBA")).replace("REPLACE_FILL2", isgradient2 ? "url(#grad2)" : BDFDB.colorCONVERT(color2, "RGBA"))}</svg>`;
		return `data:image/svg+xml;base64,${btoa(svg)}`;
	}


	createCopyOfServer (folderid, guildid) {
		if (!folderid || !guildid) return;
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(guildid);
		let guilddiv = BDFDB.getServerDiv(guildid);
		let props = BDFDB.getReactValue(guilddiv, "return.stateNode.props");
		if (!guild || !guilddiv || !props) return;
		
		let guildcopy = guilddiv.cloneNode(true);
		let guildcopyinner = guildcopy.querySelector(BDFDB.dotCN.guildcontainer);
		let guildiconwrapper = guildcopy.querySelector(BDFDB.dotCN.guildiconwrapper);
		let guildicon = guildcopy.querySelector(BDFDB.dotCN.guildicon);
		let guildpillitem = guildcopy.querySelector(BDFDB.dotCN.guildpillitem);
		if (!guildpillitem) {
			guildpillitem = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.guildpillwrapper + BDFDB.disCN.guildpill}"><span class="${BDFDB.disCN.guildpillitem}" style="opacity: 0; height: 8px; transform: translate3d(0px, 0px, 0px);"></span></div>`);
			guildcopy.insertBefore(guildpillitem, guildcopy.firstElementChild);
			guildpillitem = guildpillitem.firstElementChild;
		}
		
		guildcopy.setAttribute("guildid", guildid);
		guildcopy.setAttribute("folderid", folderid);
		
		guildiconwrapper.style.setProperty("border-radius", props.selected ? "30%" : "50%");
		guildiconwrapper.style.setProperty("overflow", "hidden");
		
		guildpillitem.style.setProperty("opacity", props.selected ? 1 : (props.unread ? 0.7 : 0));
		guildpillitem.style.setProperty("height", props.selected ? "40px" : "8px");
		guildpillitem.style.setProperty("transform", "translate3d(0px, 0px, 0px)");
		
		guildcopy.querySelector("mask").setAttribute("id", "SERVERFOLDERSCOPY" + guildid);
		guildcopy.querySelector("mask path").setAttribute("d", "M0 0 l50 0l0 50l-50 0l0 -50Z");
		guildcopy.querySelector("foreignObject").setAttribute("mask", "url(#SERVERFOLDERSCOPY" + guildid + ")");
		
		BDFDB.addClass(guildcopy, "copy");
		BDFDB.toggleEles(guildcopy, true);
		
		let pillvisible = guildpillitem && guildpillitem.style.getPropertyValue("opacity") != 0;

		let borderRadius = new BDFDB.LibraryModules.AnimationUtils.Value(0);
		borderRadius
			.interpolate({
				inputRange: [0, 1],
				outputRange: [50, 30]
			})
			.addListener((value) => {
				guildiconwrapper.style.setProperty("border-radius", `${value.value}%`);
			});

		let pillHeight = new BDFDB.LibraryModules.AnimationUtils.Value(0);
		pillHeight
			.interpolate({
				inputRange: [0, 1],
				outputRange: [8, 20]
			})
			.addListener((value) => {
				if (guildpillitem) guildpillitem.style.setProperty("height", `${value.value}px`);
			});

		let pillOpacity = new BDFDB.LibraryModules.AnimationUtils.Value(0);
		pillOpacity
			.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 0.7]
			})
			.addListener((value) => {
				if (guildpillitem) guildpillitem.style.setProperty("opacity", `${value.value}`);
			});

		let animate = (v) => {
			BDFDB.LibraryModules.AnimationUtils.parallel([
				BDFDB.LibraryModules.AnimationUtils.timing(borderRadius, {toValue: v, duration: 200}),
				BDFDB.LibraryModules.AnimationUtils.spring(pillHeight, {toValue: v, friction: 5})
			]).start();
		};

		let animate2 = (v) => {
			BDFDB.LibraryModules.AnimationUtils.parallel([
				BDFDB.LibraryModules.AnimationUtils.timing(pillOpacity, {toValue: v, duration: 200}),
			]).start();
		};
		
		guildcopyinner.addEventListener("mouseenter", () => {
			let EditServers = BDFDB.getPlugin("EditServers");
			let ESdata = EditServers ? EditServers.getGuildData(guildid, guildcopyinner) : null;
			if (ESdata && (ESdata.name || ESdata.color3 || ESdata.color4)) EditServers.changeTooltip(guild, guildcopyinner, "right");
			else {
				let folderData = BDFDB.loadData(folderid, this, "folders") || {};
				let color3 = folderData.copyTooltipColor ? folderData.color3 : null;
				let color4 = folderData.copyTooltipColor ? folderData.color4 : null;
				let isgradient3 = color3 && BDFDB.isObject(color3);
				let isgradient4 = color4 && BDFDB.isObject(color4);
				let bgColor = color3 ? (!isgradient3 ? BDFDB.colorCONVERT(color3, "RGBA") : BDFDB.colorGRADIENT(color3)) : "";
				let fontColor = color4 ? (!isgradient4 ? BDFDB.colorCONVERT(color4, "RGBA") : BDFDB.colorGRADIENT(color4)) : "";
				BDFDB.createTooltip(isgradient4 ? `<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${fontColor} !important;">${BDFDB.encodeToHTML(guild.name)}</span>` : guild.name, guildcopyinner, {type:"right", selector:"guild-folder-tooltip", style:`${isgradient4 ? '' : 'color: ' + fontColor + ' !important; '}background: ${bgColor} !important; border-color: ${isgradient3 ? BDFDB.colorCONVERT(color3[0], "RGBA") : bgColor} !important;`, html:isgradient3});
			}
			if (guildicon && guildicon.src && guild.icon && guild.icon.startsWith("a_") && guild.features.has("ANIMATED_ICON") && guildicon.src.includes("discordapp.com/icons/")) {
				guildicon.src = guildicon.src.replace(".webp", ".gif");
			}
			pillvisible = guildpillitem && guildpillitem.style.getPropertyValue("opacity") != 0;
			if (BDFDB.LibraryModules.LastGuildStore.getGuildId() != guildid) {
				animate(1);
				if (!pillvisible) animate2(1);
			}
		});
		guildcopyinner.addEventListener("mouseleave", () => {
			if (guildicon && guildicon.src && guild.icon && guild.icon.startsWith("a_") && guild.features.has("ANIMATED_ICON") && guildicon.src.includes("discordapp.com/icons/") && !BDFDB.getReactValue(BDFDB.getPlugin("AutoPlayGifs", true), "settings.guildList")) {
				guildicon.src = guildicon.src.replace(".gif", ".webp");
			}
			if (BDFDB.LibraryModules.LastGuildStore.getGuildId() != guildid) {
				animate(0);
				if (!pillvisible) animate2(0);
			}
		});
		guildcopy.addEventListener("click", e => {
			BDFDB.stopEvent(e);
			if (BDFDB.pressedKeys.includes(46)) this.removeGuildFromFolder(folderid, guildid);
			else {
				BDFDB.LibraryModules.GuildUtils.transitionToGuildSync(guild.id);
				let settings = BDFDB.getAllData(this, "settings");
				if (settings.closeAllFolders) for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
				else if (settings.closeTheFolder) if (BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folderId);
			}
		});
		guildcopy.addEventListener("contextmenu", e => {
			BDFDB.openGuildContextMenu(guilddiv, e);
		});
		guildcopy.addEventListener("mousedown", e => {
			let x = e.pageX, y = e.pageY;
			let mousemove = e2 => {
				if (Math.sqrt((x - e2.pageX)**2) > 20 || Math.sqrt((y - e2.pageY)**2) > 20) {
					document.removeEventListener("mousemove", mousemove);
					document.removeEventListener("mouseup", mouseup);
					let hovcopy = null;
					let placeholder = BDFDB.htmlToElement(this.dragPlaceholderMarkup);
					let dragpreview = this.createDragPreview(guilddiv, e);

					let dragging = e3 => {
						BDFDB.removeEles(placeholder);
						BDFDB.toggleEles(guildcopy, false);
						this.updateDragPreview(dragpreview, e3);
						if (this.foldercontent.contains(e3.target)) {
							hovcopy = BDFDB.getParentEle(BDFDB.dotCN.guildouter, e3.target);
							if (hovcopy && hovcopy.getAttribute("folderid") == folderid) this.foldercontentguilds.insertBefore(placeholder, hovcopy.nextSibling);
							else hovcopy = null;
						}
					};
					let releasing = e3 => {
						document.removeEventListener("mousemove", dragging);
						document.removeEventListener("mouseup", releasing);
						BDFDB.removeEles(placeholder, dragpreview);
						BDFDB.toggleEles(guildcopy, true);
						let dropfolderdiv = BDFDB.getParentEle(BDFDB.dotCN.guildfolderwrapper, e3.target);
						let newfolderid = dropfolderdiv ? BDFDB.getFolderID(dropfolderdiv) : null;
						if (newfolderid) {
							if (newfolderid != folderid) {
								BDFDB.removeEles(guildcopy);
								this.addGuildToFolder(newfolderid, guildid);
							}
						}
						else if (hovcopy) {
							this.foldercontentguilds.insertBefore(guildcopy, hovcopy.nextSibling);
							this.updateGuildPositions(folderid);
						}
					};
					document.addEventListener("mousemove", dragging);
					document.addEventListener("mouseup", releasing);
				}
			};
			let mouseup = () => {
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);
			};
			document.addEventListener("mousemove", mousemove);
			document.addEventListener("mouseup", mouseup);
		});

		guildcopy.querySelector("a").setAttribute("draggable", false);

		return guildcopy;
	}
	
	updateGuildPositions (folderid) {
		let oldGuildFolders = Object.assign({}, BDFDB.LibraryModules.FolderStore.guildFolders);
		let guildFolders = [], guildPositions = [];
		for (let i in oldGuildFolders) {
			if (oldGuildFolders[i].folderId) {
				let newFolder = Object.assign({}, oldGuildFolders[i]);
				if (oldGuildFolders[i].folderId == folderid) {
					let sameFolderGuilds = this.foldercontentguilds.querySelectorAll(`[guildid][folderid="${folderid}"]`);
					if (sameFolderGuilds.length > 0) {
						newFolder.guildIds = [];
						for (let guilddiv of sameFolderGuilds) newFolder.guildIds.push(guilddiv.getAttribute("guildid"));
					}
				}
				guildFolders.push(newFolder);
			}
			else guildFolders.push(oldGuildFolders[i]);
		}
		for (let i in guildFolders) for (let guildid of guildFolders[i].guildIds) guildPositions.push(guildid);
		BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
	}
	
	openFolderCreationMenu (guilds, initguildid) {
		let modal = BDFDB.htmlToElement(`<span class="${this.name}-modal BDFDB-modal"><div class="${BDFDB.disCN.backdrop}"></div><div class="${BDFDB.disCN.modal}"><div class="${BDFDB.disCN.modalinner}"><div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin}">${this.labels.serversubmenu_createfolder_text}</h4><div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div></div><button type="button" class="${BDFDB.disCNS.modalclose + BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow}"><div class="${BDFDB.disCN.buttoncontents}"><svg name="Close" width="18" height="18" viewBox="0 0 12 12" style="flex: 0 1 auto;"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div></button></div><div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}"><div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} entries"></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}"><button type="button" class="btn-done ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}"><div class="${BDFDB.disCN.buttoncontents}"></div></button><button type="button" class="btn-cancel ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlooklink + BDFDB.disCNS.buttoncolortransparent + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div></div></div></div></span>`);
		
		let targetedguildsids = {};
			
		let container = modal.querySelector(".entries");
		BDFDB.addChildEventListener(modal, "click", ".btn-done", () => {
			let ids = [];
			for (let id in targetedguildsids) if (targetedguildsids[id]) ids.push(id);
			this.createFolder(ids);
		});

		for (let guild of guilds) {
			if (container.firstElementChild) container.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.modaldivider}"></div>`));
			let entry = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} entry" style="flex: 1 1 auto;">${BDFDB.createServerDivCopy(guild.id, {size: 48}).outerHTML}<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCNS.flexchild + BDFDB.disCN.overflowellipsis}" style="flex: 1 1 auto; white-space: nowrap;">${BDFDB.encodeToHTML(guild.name)}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"></div></div>`);
			container.appendChild(entry);
			let switchinput = entry.querySelector(BDFDB.dotCN.switchinner);
			switchinput.checked = guild.id == initguildid;
			targetedguildsids[guild.id] = guild.id == initguildid;
			switchinput.addEventListener("click", e => {
				targetedguildsids[guild.id] = !targetedguildsids[guild.id];
			});
		}
		BDFDB.appendModal(modal);
	}
	
	createFolder (guildids) {
		if (!guildids) return;
		guildids = Array.isArray(guildids) ? guildids : Array.from(guildids);
		if (!guildids.length) return;
		let oldGuildFolders = Object.assign({}, BDFDB.LibraryModules.FolderStore.guildFolders);
		let guildFolders = [], guildPositions = [], added = false;
		for (let i in oldGuildFolders) {
			if (!oldGuildFolders[i].folderId && guildids.includes(oldGuildFolders[i].guildIds[0])) {
				if (!added) {
					added = true;
					guildFolders.push({
						guildIds: guildids,
						folderId: this.generateID("folder")
					});
				}
			}
			else guildFolders.push(oldGuildFolders[i]);
		}
		for (let i in guildFolders) for (let guildid of guildFolders[i].guildIds) guildPositions.push(guildid);
		BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
	}
	
	removeFolder (folderid) {
		BDFDB.removeData(folderid, this, "folders");
		BDFDB.removeEles(this.foldercontentguilds.querySelector(`${BDFDB.dotCN.guildouter}[folderid="${folderid}"]`));
		let oldGuildFolders = Object.assign({}, BDFDB.LibraryModules.FolderStore.guildFolders);
		let guildFolders = [], guildPositions = [];
		for (let i in oldGuildFolders) {
			if (oldGuildFolders[i].folderId == folderid) {
				for (let guildid of oldGuildFolders[i].guildIds) guildFolders.push({guildIds:[guildid]});
			}
			else guildFolders.push(oldGuildFolders[i]);
		}
		for (let i in guildFolders) for (let guildid of guildFolders[i].guildIds) guildPositions.push(guildid);
		BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
		this.toggleFolderContent();
	}
	
	addGuildToFolder (folderid, guildid) {
		let oldGuildFolders = Object.assign({}, BDFDB.LibraryModules.FolderStore.guildFolders);
		let guildFolders = [], guildPositions = [];
		for (let i in oldGuildFolders) {
			if (oldGuildFolders[i].folderId) {
				let newFolder = Object.assign({}, oldGuildFolders[i]);
				if (oldGuildFolders[i].folderId == folderid) newFolder.guildIds.push(guildid);
				else BDFDB.removeFromArray(newFolder.guildIds, guildid);
				guildFolders.push(newFolder);
			}
			else if (oldGuildFolders[i].guildIds[0] != guildid) guildFolders.push(oldGuildFolders[i]);
		}
		for (let i in guildFolders) for (let guildid of guildFolders[i].guildIds) guildPositions.push(guildid);
		BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
	}
	
	removeGuildFromFolder (folderid, guildid) {
		BDFDB.removeEles(this.foldercontentguilds.querySelector(`${BDFDB.dotCN.guildouter}[folderid="${folderid}"][guildid="${guildid}"]`));
		let sameFolderEles = this.foldercontentguilds.querySelectorAll(`[folderid="${folderid}"]`);
		if (sameFolderEles.length == 1 && BDFDB.containsClass(sameFolderEles[0], "folderseparatorouter")) BDFDB.removeEles(sameFolderEles[0]);
		let oldGuildFolders = Object.assign({}, BDFDB.LibraryModules.FolderStore.guildFolders);
		let guildFolders = [], guildPositions = [];
		for (let i in oldGuildFolders) {
			if (oldGuildFolders[i].folderId == folderid) {
				let newFolder = Object.assign({}, oldGuildFolders[i]);
				BDFDB.removeFromArray(newFolder.guildIds, guildid);
				guildFolders.push(newFolder);
				guildFolders.push({guildIds:[guildid]});
			}
			else guildFolders.push(oldGuildFolders[i]);
		}
		for (let i in guildFolders) for (let guildid of guildFolders[i].guildIds) guildPositions.push(guildid);
		BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
		this.toggleFolderContent();
	}

	createDragPreview (div, e) {
		if (!Node.prototype.isPrototypeOf(div)) return;
		let dragpreview = div.cloneNode(true);
		BDFDB.addClass(dragpreview, "serverfolders-dragpreview");
		BDFDB.toggleEles(dragpreview, false);
		dragpreview.style.setProperty("pointer-events", "none", "important");
		dragpreview.style.setProperty("left", e.clientX - 25 + "px", "important");
		dragpreview.style.setProperty("top", e.clientY - 25 + "px", "important");
		document.querySelector(BDFDB.dotCN.appmount).appendChild(dragpreview);
		return dragpreview;
	}

	updateDragPreview (dragpreview, e) {
		if (!Node.prototype.isPrototypeOf(dragpreview)) return;
		BDFDB.toggleEles(dragpreview, true);
		dragpreview.style.setProperty("left", e.clientX - 25 + "px", "important");
		dragpreview.style.setProperty("top", e.clientY - 25 + "px", "important");
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					servercontext_serverfolders_text:		"Poslužitelj mapu",
					serversubmenu_createfolder_text:		"Izradi mapu",
					serversubmenu_addtofolder_text:			"Dodaj poslužitelj u mapu",
					serversubmenu_removefromfolder_text:	"Ukloni poslužitelj iz mapu",
					foldercontext_autoreadfolder_text:		"Auto: Označite kao pročitano",
					foldercontext_mutefolder_text:			"Isključite mapu",
					foldercontext_removefolder_text:		"Izbriši mapu",
					modal_tabheader1_text:					"Mape",
					modal_tabheader2_text:					"Boja mape",
					modal_tabheader3_text:					"Boja tooltip",
					modal_tabheader4_text:					"Prilagođeni ikona",
					modal_iconpicker_text:					"Odabir mape",
					modal_usecloseicon_text:				"Koristite zatvorenu ikonu umjesto minisevera",
					modal_copytooltipcolor_text:			"Koristite iste boje za poslužitelj u mapi",
					modal_colorpicker1_text:				"Boja primarne mape",
					modal_colorpicker2_text:				"Boja sekundarne mape",
					modal_colorpicker3_text:				"Boja tooltip",
					modal_colorpicker4_text:				"Boja fonta",
					modal_customopen_text:					"Otvori ikona",
					modal_customclosed_text:				"Zatvorena ikona",
					modal_custompreview_text:				"Pregled ikona"
				};
			case "da":		//danish
				return {
					servercontext_serverfolders_text:		"Servermapper",
					serversubmenu_createfolder_text:		"Opret mappe",
					serversubmenu_addtofolder_text:			"Tilføj server til mappe",
					serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
					foldercontext_autoreadfolder_text:		"Auto: Markér som læst",
					foldercontext_mutefolder_text:			"Dæmp mappe",
					foldercontext_removefolder_text:		"Slet mappe",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarve",
					modal_tabheader3_text:					"Tooltipfarve",
					modal_tabheader4_text:					"Brugerdefinerede ikoner",
					modal_iconpicker_text:					"Mappevalg",
					modal_usecloseicon_text:				"Brug et lukket ikon i stedet for miniserverne",
					modal_copytooltipcolor_text:			"Brug de samme farver til server på mappen",
					modal_colorpicker1_text:				"Primær mappefarve",
					modal_colorpicker2_text:				"Sekundær mappefarve",
					modal_colorpicker3_text:				"Tooltipfarve",
					modal_colorpicker4_text:				"Skriftfarve",
					modal_customopen_text:					"Åbn ikon",
					modal_customclosed_text:				"Lukket ikon",
					modal_custompreview_text:				"Ikon forhåndsvisning"
				};
			case "de":		//german
				return {
					servercontext_serverfolders_text:		"Serverordner",
					serversubmenu_createfolder_text:		"Ordner erzeugen",
					serversubmenu_addtofolder_text:			"Server zum Ordner hinzufügen",
					serversubmenu_removefromfolder_text:	"Server aus Ordner entfernen",
					foldercontext_autoreadfolder_text:		"Auto: Als gelesen markieren",
					foldercontext_mutefolder_text:			"Ordner stummschalten",
					foldercontext_removefolder_text:		"Ordner löschen",
					modal_tabheader1_text:					"Ordner",
					modal_tabheader2_text:					"Ordnerfarbe",
					modal_tabheader3_text:					"Tooltipfarbe",
					modal_tabheader4_text:					"Eigene Icons",
					modal_iconpicker_text:					"Ordnerauswahl",
					modal_usecloseicon_text:				"Verwende anstelle der Miniserver ein geschlossenes Symbol",
					modal_copytooltipcolor_text:			"Verwende dieselbe Farbe für alle Server eines Ordners",
					modal_colorpicker1_text:				"Primäre Ordnerfarbe",
					modal_colorpicker2_text:				"Sekundäre Ordnerfarbe",
					modal_colorpicker3_text:				"Tooltipfarbe",
					modal_colorpicker4_text:				"Schriftfarbe",
					modal_customopen_text:					"Geöffnetes Icon",
					modal_customclosed_text:				"Geschlossenes Icon",
					modal_custompreview_text:				"Iconvorschau"
				};
			case "es":		//spanish
				return {
					servercontext_serverfolders_text:		"Carpetas de servidor",
					serversubmenu_createfolder_text:		"Crear carpeta",
					serversubmenu_addtofolder_text:			"Añadir servidor a la carpeta",
					serversubmenu_removefromfolder_text:	"Eliminar servidor de la carpeta",
					foldercontext_autoreadfolder_text:		"Auto: Marcar como leído",
					foldercontext_mutefolder_text:			"Silenciar carpeta",
					foldercontext_removefolder_text:		"Eliminar carpeta",
					modal_tabheader1_text:					"Carpeta",
					modal_tabheader2_text:					"Color de carpeta",
					modal_tabheader3_text:					"Color de tooltip",
					modal_tabheader4_text:					"Iconos personalizados",
					modal_iconpicker_text:					"Selección de carpeta",
					modal_usecloseicon_text:				"Use un icono cerrado en lugar de los miniservidores",
					modal_copytooltipcolor_text:			"Usa los mismos colores para el servidor de la carpeta",
					modal_colorpicker1_text:				"Color primaria de carpeta",
					modal_colorpicker2_text:				"Color secundario de la carpeta",
					modal_colorpicker3_text:				"Color de tooltip",
					modal_colorpicker4_text:				"Color de fuente",
					modal_customopen_text:					"Ícono abierto",
					modal_customclosed_text:				"Icono cerrado",
					modal_custompreview_text:				"Vista previa del icono"
				};
			case "fr":		//french
				return {
					servercontext_serverfolders_text:		"Dossiers du serveur",
					serversubmenu_createfolder_text:		"Créer le dossier",
					serversubmenu_addtofolder_text:			"Ajouter le serveur à un dossier",
					serversubmenu_removefromfolder_text:	"Supprimer le serveur du dossier",
					foldercontext_autoreadfolder_text:		"Auto: Marquer comme lu",
					foldercontext_mutefolder_text:			"Rendre muet le dossier",
					foldercontext_removefolder_text:		"Supprimer le dossier",
					modal_tabheader1_text:					"Dossier",
					modal_tabheader2_text:					"Couleur du dossier",
					modal_tabheader3_text:					"Couleur de tooltip",
					modal_tabheader4_text:					"Icônes personnalisées",
					modal_iconpicker_text:					"Choix du dossier",
					modal_usecloseicon_text:				"Utilisez une icône fermée à la place des mini-serveurs",
					modal_copytooltipcolor_text:			"Utilisez les mêmes couleurs pour le serveur du dossier",
					modal_colorpicker1_text:				"Couleur primaire du dossier",
					modal_colorpicker2_text:				"Couleur secondaire du dossier",
					modal_colorpicker3_text:				"Couleur de tooltip",
					modal_colorpicker4_text:				"Couleur de la police",
					modal_customopen_text:					"Icône ouverte",
					modal_customclosed_text:				"Icône fermée",
					modal_custompreview_text:				"Aperçu de l'icône"
				};
			case "it":		//italian
				return {
					servercontext_serverfolders_text:		"Cartelle del server",
					serversubmenu_addtofolder_text:			"Aggiungi il server alla cartella",
					serversubmenu_createfolder_text:		"Creare una cartella",
					serversubmenu_removefromfolder_text:	"Rimuovi il server dalla cartella",
					foldercontext_autoreadfolder_text:		"Auto: Contrassegna come letto",
					foldercontext_mutefolder_text:			"Disattiva cartella",
					foldercontext_removefolder_text:		"Elimina cartella",
					modal_tabheader1_text:					"Cartella",
					modal_tabheader2_text:					"Colore della cartella",
					modal_tabheader3_text:					"Colore della tooltip",
					modal_tabheader4_text:					"Icone personalizzate",
					modal_iconpicker_text:					"Selezione della cartella",
					modal_usecloseicon_text:				"Utilizzare un'icona chiusa anziché i mini server",
					modal_copytooltipcolor_text:			"Usa gli stessi colori per il server della cartella",
					modal_colorpicker1_text:				"Colore primaria della cartella",
					modal_colorpicker2_text:				"Colore secondaria della cartella",
					modal_colorpicker3_text:				"Colore della tooltip",
					modal_colorpicker4_text:				"Colore del carattere",
					modal_customopen_text:					"Icona aperta",
					modal_customclosed_text:				"Icona chiusa",
					modal_custompreview_text:				"Icona anteprima"
				};
			case "nl":		//dutch
				return {
					servercontext_serverfolders_text:		"Servermappen",
					serversubmenu_addtofolder_text:			"Voeg server toe aan de map",
					serversubmenu_createfolder_text:		"Map aanmaken",
					serversubmenu_removefromfolder_text:	"Verwijder de server uit de map",
					foldercontext_autoreadfolder_text:		"Auto: Markeren als gelezen",
					foldercontext_mutefolder_text:			"Demp map",
					foldercontext_removefolder_text:		"Verwijder map",
					modal_tabheader1_text:					"Map",
					modal_tabheader2_text:					"Mapkleur",
					modal_tabheader3_text:					"Tooltipkleur",
					modal_tabheader4_text:					"Aangepaste keuze",
					modal_iconpicker_text:					"Map keuze",
					modal_usecloseicon_text:				"Gebruik een gesloten keuze in plaats van de miniservers",
					modal_copytooltipcolor_text:			"Gebruik dezelfde kleuren voor de server van de map",
					modal_colorpicker1_text:				"Primaire mapkleur",
					modal_colorpicker2_text:				"Tweede mapkleur",
					modal_colorpicker3_text:				"Tooltipkleur",
					modal_colorpicker4_text:				"Doopvontkleur",
					modal_customopen_text:					"Geopende keuze",
					modal_customclosed_text:				"Gesloten keuze",
					modal_custompreview_text:				"Voorbeeld van keuze"
				};
			case "no":		//norwegian
				return {
					servercontext_serverfolders_text:		"Servermapper",
					serversubmenu_addtofolder_text:			"Legg til server i mappe",
					serversubmenu_createfolder_text:		"Lag mappe",
					serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
					foldercontext_autoreadfolder_text:		"Auto: Merk som les",
					foldercontext_mutefolder_text:			"Demp mappe",
					foldercontext_removefolder_text:		"Slett mappe",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarge",
					modal_tabheader3_text:					"Tooltipfarge",
					modal_tabheader4_text:					"Tilpassede ikoner",
					modal_iconpicker_text:					"Mappevalg",
					modal_usecloseicon_text:				"Bruk et lukket ikon i stedet for minitjenerne",
					modal_copytooltipcolor_text:			"Bruk de samme fargene til serveren til mappen",
					modal_colorpicker1_text:				"Primær mappefarge",
					modal_colorpicker2_text:				"Sekundær mappefarge",
					modal_colorpicker3_text:				"Tooltipfarge",
					modal_colorpicker4_text:				"Skriftfarge",
					modal_customopen_text:					"Åpnet ikon",
					modal_customclosed_text:				"Lukket ikon",
					modal_custompreview_text:				"Ikon forhåndsvisning"
				};
			case "pl":		//polish
				return {
					servercontext_serverfolders_text:		"Foldery serwera",
					serversubmenu_addtofolder_text:			"Dodaj serwer do folderu",
					serversubmenu_createfolder_text:		"Utwórz folder",
					serversubmenu_removefromfolder_text:	"Usuń serwer z folderu",
					foldercontext_autoreadfolder_text:		"Auto: Oznacz jako przeczytane",
					foldercontext_mutefolder_text:			"Wycisz folder",
					foldercontext_removefolder_text:		"Usuń folder",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Kolor folderu",
					modal_tabheader3_text:					"Kolor podpowiedzi",
					modal_tabheader4_text:					"Niestandardowe ikony",
					modal_iconpicker_text:					"Wybór folderu",
					modal_usecloseicon_text:				"Użyj zamkniętej ikony zamiast mini serwerów",
					modal_copytooltipcolor_text:			"Użyj tych samych kolorów dla serwera folderu",
					modal_colorpicker1_text:				"Podstawowy kolor folderu",
					modal_colorpicker2_text:				"Drugorzędny kolor folderu",
					modal_colorpicker3_text:				"Kolor podpowiedzi",
					modal_colorpicker4_text:				"Kolor czcionki",
					modal_customopen_text:					"Otwarta ikona",
					modal_customclosed_text:				"Zamknięta ikona",
					modal_custompreview_text:				"Podgląd ikony"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					servercontext_serverfolders_text:		"Pastas de servidores",
					serversubmenu_addtofolder_text:			"Adicionar servidor à pasta",
					serversubmenu_createfolder_text:		"Criar pasta",
					serversubmenu_removefromfolder_text:	"Remover servidor da pasta",
					foldercontext_autoreadfolder_text:		"Auto: Marcar como lido",
					foldercontext_mutefolder_text:			"Silenciar pasta",
					foldercontext_removefolder_text:		"Excluir pasta",
					modal_tabheader1_text:					"Pasta",
					modal_tabheader2_text:					"Cor da pasta",
					modal_tabheader3_text:					"Cor da tooltip",
					modal_tabheader4_text:					"Ícones personalizados",
					modal_iconpicker_text:					"Escolha da pasta",
					modal_usecloseicon_text:				"Use um ícone fechado em vez dos mini servidores",
					modal_copytooltipcolor_text:			"Use as mesmas cores para o servidor da pasta",
					modal_colorpicker1_text:				"Cor primária da pasta",
					modal_colorpicker2_text:				"Cor secundária da pasta",
					modal_colorpicker3_text:				"Cor da tooltip",
					modal_colorpicker4_text:				"Cor da fonte",
					modal_customopen_text:					"Ícone aberto",
					modal_customclosed_text:				"Ícone fechado",
					modal_custompreview_text:				"Pré-visualização de ícones"
				};
			case "fi":		//finnish
				return {
					servercontext_serverfolders_text:		"Palvelinkansiot",
					serversubmenu_addtofolder_text:			"Lisää palvelin kansioon",
					serversubmenu_createfolder_text:		"Luo kansio",
					serversubmenu_removefromfolder_text:	"Poista palvelin kansioon",
					foldercontext_autoreadfolder_text:		"Auto: merkitse luettavaksi",
					foldercontext_mutefolder_text:			"Mykistä kansio",
					foldercontext_removefolder_text:		"Poista kansio",
					modal_tabheader1_text:					"Kansio",
					modal_tabheader2_text:					"Kansionväri",
					modal_tabheader3_text:					"Tooltipväri",
					modal_tabheader4_text:					"Mukautetut kuvakkeet",
					modal_iconpicker_text:					"Kansion valinta",
					modal_usecloseicon_text:				"Käytä suljettua kuvaketta minipalvelimien sijasta",
					modal_copytooltipcolor_text:			"Käytä samoja värejä kansion palvelimelle",
					modal_colorpicker1_text:				"Ensisijainen kansionväri",
					modal_colorpicker2_text:				"Toissijainen kansionväri",
					modal_colorpicker3_text:				"Tooltipväri",
					modal_colorpicker4_text:				"Fontinväri",
					modal_customopen_text:					"Avattu kuvake",
					modal_customclosed_text:				"Suljettu kuvake",
					modal_custompreview_text:				"Kuvakkeen esikatselu"
				};
			case "sv":		//swedish
				return {
					servercontext_serverfolders_text:		"Servermappar",
					serversubmenu_addtofolder_text:			"Lägg till server i mapp",
					serversubmenu_createfolder_text:		"Skapa mapp",
					serversubmenu_removefromfolder_text:	"Ta bort servern från mappen",
					foldercontext_autoreadfolder_text:		"Auto: Markera som Läs",
					foldercontext_mutefolder_text:			"Stäng mapp",
					foldercontext_removefolder_text:		"Ta bort mapp",
					modal_tabheader1_text:					"Mapp",
					modal_tabheader2_text:					"Mappfärg",
					modal_tabheader3_text:					"Tooltipfärg",
					modal_tabheader4_text:					"Anpassade ikoner",
					modal_iconpicker_text:					"Mappval",
					modal_usecloseicon_text:				"Använd en stängd ikon istället för miniservrarna",
					modal_copytooltipcolor_text:			"Använd samma färger för mappen på mappen",
					modal_colorpicker1_text:				"Primär mappfärg",
					modal_colorpicker2_text:				"Sekundär mappfärg",
					modal_colorpicker3_text:				"Tooltipfärg",
					modal_colorpicker4_text:				"Fontfärg",
					modal_customopen_text:					"Öppnad ikon",
					modal_customclosed_text:				"Closed Icon",
					modal_custompreview_text:				"Ikon förhandsvisning"
				};
			case "tr":		//turkish
				return {
					servercontext_serverfolders_text:		"Sunucu klasörleri",
					serversubmenu_addtofolder_text:			"Klasöre sunucu ekle",
					serversubmenu_createfolder_text:		"Klasör oluşturun",
					serversubmenu_removefromfolder_text:	"Sunucuyu klasörden kaldır",
					foldercontext_autoreadfolder_text:		"Oto: Okundu Olarak İşaretle",
					foldercontext_mutefolder_text:			"Klasörü kapat",
					foldercontext_removefolder_text:		"Klasörü sil",
					modal_tabheader1_text:					"Klasör",
					modal_tabheader2_text:					"Klasör rengi",
					modal_tabheader3_text:					"Tooltip rengi",
					modal_tabheader4_text:					"Özel simgeler",
					modal_iconpicker_text:					"Klasör seçimi",
					modal_usecloseicon_text:				"Mini sunucular yerine kapalı bir simge kullanın",
					modal_copytooltipcolor_text:			"Klasörün sunucusu için aynı renkleri kullanın",
					modal_colorpicker1_text:				"Birincil klasör rengi",
					modal_colorpicker2_text:				"İkincil klasör rengi",
					modal_colorpicker3_text:				"Tooltip rengi",
					modal_colorpicker4_text:				"Yazı rengi",
					modal_customopen_text:					"Açılmış simge",
					modal_customclosed_text:				"Kapalı simge",
					modal_custompreview_text:				"Simge önizleme"
				};
			case "cs":		//czech
				return {
					servercontext_serverfolders_text:		"Složky serveru",
					serversubmenu_addtofolder_text:			"Přidat server do složky",
					serversubmenu_createfolder_text:		"Vytvořit složky",
					serversubmenu_removefromfolder_text:	"Odebrat server ze složky",
					foldercontext_autoreadfolder_text:		"Auto: Označit jako přečtené",
					foldercontext_mutefolder_text:			"Ztlumte složky",
					foldercontext_removefolder_text:		"Smazat složky",
					modal_tabheader1_text:					"Složky",
					modal_tabheader2_text:					"Barva složky",
					modal_tabheader3_text:					"Barva tooltip",
					modal_tabheader4_text:					"Vlastní ikony",
					modal_iconpicker_text:					"Volba složky",
					modal_usecloseicon_text:				"Místo mini serverů použijte uzavřenou ikonu",
					modal_copytooltipcolor_text:			"Použijte stejné barvy pro server složky",
					modal_colorpicker1_text:				"Primární barva složky",
					modal_colorpicker2_text:				"Sekundární barva složky",
					modal_colorpicker3_text:				"Barva tooltip",
					modal_colorpicker4_text:				"Barva fontu",
					modal_customopen_text:					"Otevřená ikona",
					modal_customclosed_text:				"Uzavřená ikona",
					modal_custompreview_text:				"Náhled ikony"
				};
			case "bg":		//bulgarian
				return {
					servercontext_serverfolders_text:		"Сървърни папки",
					serversubmenu_addtofolder_text:			"Добавяне на сървър в папка",
					serversubmenu_createfolder_text:		"Създай папка",
					serversubmenu_removefromfolder_text:	"Премахване на сървър от папка",
					foldercontext_autoreadfolder_text:		"Авто: Маркиране като четене",
					foldercontext_mutefolder_text:			"Заглушаване на папката",
					foldercontext_removefolder_text:		"Изтриване на папка",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвят на папка",
					modal_tabheader3_text:					"Цвят на подсказка",
					modal_tabheader4_text:					"Персонализирани икони",
					modal_iconpicker_text:					"Избор на папки",
					modal_usecloseicon_text:				"Използвайте затворена икона вместо мини сървърите",
					modal_copytooltipcolor_text:			"Използвайте същите цветове за сървъра на папката",
					modal_colorpicker1_text:				"Цвят основнен на папка",
					modal_colorpicker2_text:				"цвят вторичен на папка",
					modal_colorpicker3_text:				"Цвят на подсказка",
					modal_colorpicker4_text:				"Цвят на шрифта",
					modal_customopen_text:					"Отворена икона",
					modal_customclosed_text:				"Затворена икона",
					modal_custompreview_text:				"Икона Преглед"
				};
			case "ru":		//russian
				return {
					servercontext_serverfolders_text:		"Папки сервера",
					serversubmenu_addtofolder_text:			"Добавить сервер в папку",
					serversubmenu_createfolder_text:		"Создать папки",
					serversubmenu_removefromfolder_text:	"Удалить сервер из папки",
					foldercontext_autoreadfolder_text:		"Авто: Отметить как прочитанное",
					foldercontext_mutefolder_text:			"Отключить папки",
					foldercontext_removefolder_text:		"Удалить папки",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвет папки",
					modal_tabheader3_text:					"Цвет подсказка",
					modal_tabheader4_text:					"Пользовательские значки",
					modal_iconpicker_text:					"Выбор папки",
					modal_usecloseicon_text:				"Используйте закрытую иконку вместо мини-серверов",
					modal_copytooltipcolor_text:			"Используйте те же цвета для сервера папки",
					modal_colorpicker1_text:				"Цвет основной папки",
					modal_colorpicker2_text:				"Цвет вторичной папки",
					modal_colorpicker3_text:				"Цвет подсказка",
					modal_colorpicker4_text:				"Цвет шрифта",
					modal_customopen_text:					"Открытая иконка",
					modal_customclosed_text:				"Закрытая иконка",
					modal_custompreview_text:				"Иконка Просмотр"
				};
			case "uk":		//ukrainian
				return {
					servercontext_serverfolders_text:		"Папки сервера",
					serversubmenu_addtofolder_text:			"Додати сервер до папки",
					serversubmenu_createfolder_text:		"Створити папки",
					serversubmenu_removefromfolder_text:	"Видалити папку з папки",
					foldercontext_autoreadfolder_text:		"Авто: Позначити як прочитане",
					foldercontext_mutefolder_text:			"Відключення папки",
					foldercontext_removefolder_text:		"Видалити папки",
					modal_tabheader1_text:					"Папки",
					modal_tabheader2_text:					"Колір папки",
					modal_tabheader3_text:					"Колір підказка",
					modal_tabheader4_text:					"Користувальницькі іконки",
					modal_iconpicker_text:					"Вибір папки",
					modal_usecloseicon_text:				"Використовуйте закритий значок замість міні-серверів",
					modal_copytooltipcolor_text:			"Використовуйте ті ж кольори для сервера папки",
					modal_colorpicker1_text:				"Колір основної папки",
					modal_colorpicker2_text:				"Колір вторинного папки",
					modal_colorpicker3_text:				"Колір підказка",
					modal_colorpicker4_text:				"Колір шрифту",
					modal_customopen_text:					"Відкрита ікона",
					modal_customclosed_text:				"Закрита ікона",
					modal_custompreview_text:				"Піктограма попереднього перегляду"
				};
			case "ja":		//japanese
				return {
					servercontext_serverfolders_text:		"サーバーフォルダ",
					serversubmenu_addtofolder_text:			"サーバーをフォルダに追加する",
					serversubmenu_createfolder_text:		"フォルダーを作る",
					serversubmenu_removefromfolder_text:	"サーバーをフォルダから削除する",
					foldercontext_autoreadfolder_text:		"自動： 読み取りとしてマークする",
					foldercontext_mutefolder_text:			"ミュートフォルダー",
					foldercontext_removefolder_text:		"フォルダを削除する",
					modal_tabheader1_text:					"フォルダ",
					modal_tabheader2_text:					"フォルダの色",
					modal_tabheader3_text:					"ツールチップの色",
					modal_tabheader4_text:					"カスタムアイコン",
					modal_iconpicker_text:					"フォルダの選択",
					modal_usecloseicon_text:				"ミニサーバーの代わりに閉じたアイコンを使用する",
					modal_copytooltipcolor_text:			"フォルダのサーバーに同じ色を使う",
					modal_colorpicker1_text:				"プライマリフォルダの色",
					modal_colorpicker2_text:				"セカンダリフォルダの色",
					modal_colorpicker3_text:				"ツールチップの色",
					modal_colorpicker4_text:				"フォントの色",
					modal_customopen_text:					"開いたアイコン",
					modal_customclosed_text:				"クローズドアイコン",
					modal_custompreview_text:				"アイコンのプレビュー"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					servercontext_serverfolders_text:		"服務器文件夾",
					serversubmenu_addtofolder_text:			"添加服務器到文件夾",
					serversubmenu_createfolder_text:		"創建文件夾",
					serversubmenu_removefromfolder_text:	"從文件夾中刪除服務器",
					foldercontext_autoreadfolder_text:		"自動： 標記為已讀",
					foldercontext_mutefolder_text:			"靜音文件夾",
					foldercontext_removefolder_text:		"刪除文件夾",
					modal_tabheader1_text:					"夾",
					modal_tabheader2_text:					"文件夾顏色",
					modal_tabheader3_text:					"工具提示顏色",
					modal_tabheader4_text:					"自定義圖標",
					modal_iconpicker_text:					"文件夾選擇",
					modal_usecloseicon_text:				"使用關閉的圖標代替迷你服務器",
					modal_copytooltipcolor_text:			"對文件夾的服務器使用相同的顏色",
					modal_colorpicker1_text:				"主文件夾顏色",
					modal_colorpicker2_text:				"輔助文件夾顏色",
					modal_colorpicker3_text:				"工具提示顏色",
					modal_colorpicker4_text:				"字體顏色",
					modal_customopen_text:					"打開的圖標",
					modal_customclosed_text:				"封閉的圖標",
					modal_custompreview_text:				"圖標預覽"
				};
			case "ko":		//korean
				return {
					servercontext_serverfolders_text:		"서버 폴더",
					serversubmenu_addtofolder_text:			"폴더에 서버 추가",
					serversubmenu_createfolder_text:		"폴더 만들기",
					serversubmenu_removefromfolder_text:	"폴더에서 서버 제거",
					foldercontext_autoreadfolder_text:		"자동: 읽은 상태로 표시",
					foldercontext_mutefolder_text:			"폴더 음소거",
					foldercontext_removefolder_text:		"폴더 삭제",
					modal_tabheader1_text:					"폴더",
					modal_tabheader2_text:					"폴더 색",
					modal_tabheader3_text:					"툴팁 색깔",
					modal_tabheader4_text:					"사용자 정의 아이콘",
					modal_iconpicker_text:					"폴더 선택",
					modal_usecloseicon_text:				"미니 서버 대신 닫힌 아이콘을 사용하십시오",
					modal_copytooltipcolor_text:			"폴더의 서버에 대해 동일한 색상을 사용하십시오.",
					modal_colorpicker1_text:				"기본 폴더 색",
					modal_colorpicker2_text:				"보조 폴더 색",
					modal_colorpicker3_text:				"툴팁 색깔",
					modal_colorpicker4_text:				"글꼴 색깔",
					modal_customopen_text:					"열린 아이콘",
					modal_customclosed_text:				"닫힌 아이콘",
					modal_custompreview_text:				"아이콘 미리보기"
				};
			default:		//default: english
				return {
					servercontext_serverfolders_text:		"Serverfolders",
					serversubmenu_addtofolder_text:			"Add Server to Folder",
					serversubmenu_createfolder_text:		"Create Folder",
					serversubmenu_removefromfolder_text:	"Remove Server from Folder",
					foldercontext_autoreadfolder_text:		"Auto: Mark As Read",
					foldercontext_mutefolder_text:			"Mute Folder",
					foldercontext_removefolder_text:		"Delete Folder",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Foldercolor",
					modal_tabheader3_text:					"Tooltipcolor",
					modal_tabheader4_text:					"Custom Icons",
					modal_iconpicker_text:					"Folderchoice",
					modal_usecloseicon_text:				"Use a closed Icon instead of the Mini-Servers",
					modal_copytooltipcolor_text:			"Use same Colors for Servers of the Folder",
					modal_colorpicker1_text:				"Primary Foldercolor",
					modal_colorpicker2_text:				"Secondary Foldercolor",
					modal_colorpicker3_text:				"Tooltipcolor",
					modal_colorpicker4_text:				"Fontcolor",
					modal_customopen_text:					"Open Icon",
					modal_customclosed_text:				"Closed Icon",
					modal_custompreview_text:				"Iconpreview"
				};
		}
	}
}
