//META{"name":"EmojiStatistics","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EmojiStatistics","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EmojiStatistics/EmojiStatistics.plugin.js"}*//

var EmojiStatistics = (_ => {
	let emojiReplicaList;
	
	return class EmojiStatistics {
		getName () {return "EmojiStatistics";}

		getVersion () {return "2.9.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds some helpful options to show you more information about emojis and emojiservers.";}

		constructor () {
			this.changelog = {
				"fixed":[["New Style","Fixed for the new expression picker (emoji + gif combo)"]]
			};

			this.patchedModules = {
				after: {
					EmojiPicker: "type"
				}
			};
		}

		initConstructor () {
			this.css = `
				.${this.name}-table ${BDFDB.dotCN._emojistatisticsiconcell} {
					justify-content: center;
					width: 48px;
					padding: 0;
				}
				.${this.name}-table ${BDFDB.dotCN._emojistatisticsnamecell} {
					width: 300px;
				}
				.${this.name}-table ${BDFDB.dotCN._emojistatisticsamountcell} {
					width: 120px;
				}

				${BDFDB.dotCNS.emojipicker + BDFDB.dotCN.emojipickerheader} {
					grid-template-columns: auto 24px 24px;
				}
				${BDFDB.dotCNS.emojipicker + BDFDB.dotCN._emojistatisticsstatisticsbutton} {
					width: 24px;
					height: 24px;
					grid-column: 3/4;
				}`;
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

		processEmojiPicker (e) {
			this.loadEmojiList();
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name:"DiversitySelector"});
			if (index > -1) children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
				text: "Emoji Statistics",
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCN._emojistatisticsstatisticsbutton,
					children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.emojipickerdiversityemojiitemimage,
						style: {
							backgroundImage: "url(/assets/0477c6a43026315dd623bc6367e18acb.svg)"
						}
					})
				}),
				onClick: _ => {
					this.showEmojiInformationModal();
					e.instance.props.closePopout();
				}
			}));
		}

		loadEmojiList () {
			emojiReplicaList = {};
			let guilds = BDFDB.LibraryModules.GuildStore.getGuilds();
			for (let id in guilds) for (let emoji of BDFDB.LibraryModules.GuildEmojiStore.getGuildEmoji(id)) {
				if (emoji.managed) emojiReplicaList[emoji.name] = emojiReplicaList[emoji.name] != undefined;
			}
		}
		
		showEmojiInformationModal () {
			BDFDB.ModalUtils.open(this, {
				size: "LARGE",
				header: this.labels.modal_header_text,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Table, {
					className: `${this.name}-table`,
					stickyHeader: true,
					sortData: false,
					columns: [{key:"icon", sortkey:"index", cell:"icon"}, {key:"name", cell:"name"}, {key:"total", cell:"amount", reverse:true}, {key:"global", cell:"amount", reverse:true}, {key:"local", cell:"amount", reverse:true}, {key:"copies", cell:"amount", reverse:true}].map(data => {return {
						key: data.sortkey || data.key,
						sort: true,
						reverse: data.reverse,
						cellClassName: BDFDB.disCN[`_emojistatistics${data.cell}cell`],
						renderHeader: _ => {
							return this.labels[`modal_titles${data.key}_text`]
						},
						render: guilddata => {
							if (data.key == "icon") return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Guild, {
								guild: guilddata[data.key],
								menu: false,
								tooltip: false
							});
							else if (data.key == "name") return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
								children: guilddata[data.key]
							});
							else return guilddata[data.key]
						}
					}}),
					data: BDFDB.GuildUtils.getAll().map((info, i) => {
						let data = {
							index: i,
							icon: info,
							name: info.name,
							global: 0,
							local: 0,
							copies: 0
						}
						for (let emoji of BDFDB.LibraryModules.GuildEmojiStore.getGuildEmoji(info.id)) {
							if (emoji.managed) {
								data.global++;
								if (emojiReplicaList[emoji.name]) data.copies++;
							}
							else data.local++;
						}
						data.total = data.global + data.local;
						return data;
					})
				})
			});
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						modal_header_text:						"Statistike o emojima",
						modal_titlesicon_text:					"Ikona",
						modal_titlesname_text:					"Naziv poslužitelja",
						modal_titlestotal_text:					"Cjelokupni",
						modal_titlesglobal_text:				"Globalno",
						modal_titleslocal_text:					"Kokalne",
						modal_titlescopies_text:				"Kopije"
					};
				case "da":		//danish
					return {
						modal_header_text:						"Statistikker af emojis",
						modal_titlesicon_text:					"Icon",
						modal_titlesname_text:					"Servernavn",
						modal_titlestotal_text:					"Total",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Lokal",
						modal_titlescopies_text:				"Copies"
					};
				case "de":		//german
					return {
						modal_header_text:						"Statistiken über Emojis",
						modal_titlesicon_text:					"Icon",
						modal_titlesname_text:					"Servername",
						modal_titlestotal_text:					"Gesamt",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Lokal",
						modal_titlescopies_text:				"Kopien"
					};
				case "es":		//spanish
					return {
						modal_header_text:						"Estadísticas de emojis",
						modal_titlesicon_text:					"Icono",
						modal_titlesname_text:					"Nombre del servidor",
						modal_titlestotal_text:					"Total",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Local",
						modal_titlescopies_text:				"Copias"
					};
				case "fr":		//french
					return {
						modal_header_text:						"Statistiques des emojis",
						modal_titlesicon_text:					"Icône",
						modal_titlesname_text:					"Nom du serveur",
						modal_titlestotal_text:					"Total",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Local",
						modal_titlescopies_text:				"Copies"
					};
				case "it":		//italian
					return {
						modal_header_text:						"Statistiche di emojis",
						modal_titlesicon_text:					"Icona",
						modal_titlesname_text:					"Nome del server",
						modal_titlestotal_text:					"Totale",
						modal_titlesglobal_text:				"Globale",
						modal_titleslocal_text:					"Locale",
						modal_titlescopies_text:				"Copie"
					};
				case "nl":		//dutch
					return {
						modal_header_text:						"Statistieken van emojis",
						modal_titlesicon_text:					"Icoon",
						modal_titlesname_text:					"Servernaam",
						modal_titlestotal_text:					"Totaal",
						modal_titlesglobal_text:				"Globaal",
						modal_titleslocal_text:					"Lokaal",
						modal_titlescopies_text:				"Kopieën"
					};
				case "no":		//norwegian
					return {
						modal_header_text:						"Statistikk av emojis",
						modal_titlesicon_text:					"Ikon",
						modal_titlesname_text:					"Servernavn",
						modal_titlestotal_text:					"Total",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Lokal",
						modal_titlescopies_text:				"Kopier"
					};
				case "pl":		//polish
					return {
						modal_header_text:						"Statystyki emoji",
						modal_titlesicon_text:					"Ikona",
						modal_titlesname_text:					"Nazwa",
						modal_titlestotal_text:					"Całkowity",
						modal_titlesglobal_text:				"Światowy",
						modal_titleslocal_text:					"Lokalny",
						modal_titlescopies_text:				"Kopie"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						modal_header_text:						"Estatísticas de emojis",
						modal_titlesicon_text:					"Ícone",
						modal_titlesname_text:					"Nome do servidor",
						modal_titlestotal_text:					"Total",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Local",
						modal_titlescopies_text:				"Cópias"
					};
				case "fi":		//finnish
					return {
						modal_header_text:						"Tilastot emojista",
						modal_titlesicon_text:					"Ikoni",
						modal_titlesname_text:					"Palvelimen nimi",
						modal_titlestotal_text:					"Koko",
						modal_titlesglobal_text:				"Globaali",
						modal_titleslocal_text:					"Paikallinen",
						modal_titlescopies_text:				"Kopiot"
					};
				case "sv":		//swedish
					return {
						modal_header_text:						"Statistik för emojis",
						modal_titlesicon_text:					"Ikon",
						modal_titlesname_text:					"Servernamn",
						modal_titlestotal_text:					"Total",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Lokal",
						modal_titlescopies_text:				"Kopior"
					};
				case "tr":		//turkish
					return {
						modal_header_text:						"Emojis istatistikleri",
						modal_titlesicon_text:					"Icon",
						modal_titlesname_text:					"Sunucuadı",
						modal_titlestotal_text:					"Toplam",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Yerel",
						modal_titlescopies_text:				"Kopya"
					};
				case "cs":		//czech
					return {
						modal_header_text:						"Statistiky emojis",
						modal_titlesicon_text:					"Ikona",
						modal_titlesname_text:					"Název serveru",
						modal_titlestotal_text:					"Celkový",
						modal_titlesglobal_text:				"Globální",
						modal_titleslocal_text:					"Místní",
						modal_titlescopies_text:				"Kopie"
					};
				case "bg":		//bulgarian
					return {
						modal_header_text:						"Статистика на емотис",
						modal_titlesicon_text:					"Икона",
						modal_titlesname_text:					"Име на сървъра",
						modal_titlestotal_text:					"Oбщо",
						modal_titlesglobal_text:				"Cветовен",
						modal_titleslocal_text:					"Mестен",
						modal_titlescopies_text:				"Копия"
					};
				case "ru":		//russian
					return {
						modal_header_text:						"Статистика emojis",
						modal_titlesicon_text:					"Значок",
						modal_titlesname_text:					"Имя сервера",
						modal_titlestotal_text:					"Всего",
						modal_titlesglobal_text:				"Mировой",
						modal_titleslocal_text:					"Местный",
						modal_titlescopies_text:				"Копии"
					};
				case "uk":		//ukrainian
					return {
						modal_header_text:						"Статистика емідій",
						modal_titlesicon_text:					"Ікона",
						modal_titlesname_text:					"Ім'я сервера",
						modal_titlestotal_text:					"Всього",
						modal_titlesglobal_text:				"Cвітовий",
						modal_titleslocal_text:					"Місцевий",
						modal_titlescopies_text:				"Копії"
					};
				case "ja":		//japanese
					return {
						modal_header_text:						"エモジスの統計",
						modal_titlesicon_text:					"アイコン",
						modal_titlesname_text:					"サーバーの名前",
						modal_titlestotal_text:					"合計",
						modal_titlesglobal_text:				"グローバル",
						modal_titleslocal_text:					"地元",
						modal_titlescopies_text:				"コピー"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						modal_header_text:						"表情統計",
						modal_titlesicon_text:					"圖標",
						modal_titlesname_text:					"服務器名稱",
						modal_titlestotal_text:					"總",
						modal_titlesglobal_text:				"全球",
						modal_titleslocal_text:					"本地",
						modal_titlescopies_text:				"副本"
					};
				case "ko":		//korean
					return {
						modal_header_text:						"그림 이모티콘의 통계",
						modal_titlesicon_text:					"상",
						modal_titlesname_text:					"서버 이름",
						modal_titlestotal_text:					"합계",
						modal_titlesglobal_text:				"글로벌",
						modal_titleslocal_text:					"지방의",
						modal_titlescopies_text:				"사본"
					};
				default:		//default: english
					return {
						modal_header_text:						"Statistics of emojis",
						modal_titlesicon_text:					"Icon",
						modal_titlesname_text:					"Servername",
						modal_titlestotal_text:					"Total",
						modal_titlesglobal_text:				"Global",
						modal_titleslocal_text:					"Local",
						modal_titlescopies_text:				"Copies"
					};
			}
		}
	}
})();

module.exports = EmojiStatistics;