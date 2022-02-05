/**
 * @name EmojiStatistics
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.9.8
 * @description Shows you an Overview of Emojis and Emoji Servers
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EmojiStatistics/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/EmojiStatistics/EmojiStatistics.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EmojiStatistics",
			"author": "DevilBro",
			"version": "2.9.8",
			"description": "Shows you an Overview of Emojis and Emoji Servers"
		},
		"changeLog": {
			"improved": {
				"Swapped Position": "Swapped Position with the Diversity Selector"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var emojiReplicaList;
		
		return class EmojiStatistics extends Plugin {
			onLoad () {
				this.patchedModules = {
					after: {
						EmojiPicker: "type"
					}
				};
				
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
						grid-column: 2/3;
					}
					${BDFDB.dotCNS.emojipicker + BDFDB.dotCN.emojipickerdiversityselector} {
						grid-column: 3/4;
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processEmojiPicker (e) {
				this.loadEmojiList();
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "DiversitySelector"});
				if (index > -1) children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: this.labels.modal_header,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCN._emojistatisticsstatisticsbutton,
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.emojipickerdiversityemojiitemimage,
							style: {backgroundImage: `url(${BDFDB.LibraryModules.EmojiStateUtils.getURL(BDFDB.LibraryModules.EmojiUtils.convertNameToSurrogate("mag_right"))})`}
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
					header: this.labels.modal_header,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Table, {
						className: `${this.name}-table`,
						stickyHeader: true,
						sortData: false,
						columns: [
							{key: "icon", cell: "icon", sortKey: "index"},
							{key: "name", cell: "name"},
							{key: "total", cell: "amount", reverse: true},
							{key: "global", cell: "amount", reverse: true},
							{key: "local", cell: "amount", reverse: true},
							{key: "copies", cell: "amount", reverse: true}
						].map(data => ({
							key: data.sortKey || data.key,
							sort: true,
							reverse: data.reverse,
							cellClassName: BDFDB.disCN[`_emojistatistics${data.cell}cell`],
							renderHeader: _ => this.labels[`modal_titles${data.key}`],
							render: item => {
								if (data.key == "icon") return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Guild, {
									guild: item.guild,
									menu: false,
									tooltip: false
								});
								else if (data.key == "name") return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
									children: item.guild.name
								});
								else return item[data.key];
							}
						})),
						data: BDFDB.LibraryModules.FolderStore.getFlattenedGuilds().map((guild, i) => {
							let itemData = {
								index: i,
								guild: guild,
								global: 0,
								local: 0,
								copies: 0
							}
							for (let emoji of BDFDB.LibraryModules.GuildEmojiStore.getGuildEmoji(guild.id)) {
								if (emoji.managed) {
									itemData.global++;
									if (emojiReplicaList[emoji.name]) itemData.copies++;
								}
								else itemData.local++;
							}
							itemData.total = itemData.global + itemData.local;
							return itemData;
						})
					})
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							modal_header:						"Статистика на емотикони",
							modal_titlescopies:					"Копия",
							modal_titlesglobal:					"Глобален",
							modal_titlesicon:					"Икона",
							modal_titleslocal:					"Местен",
							modal_titlesname:					"Име на сървъра",
							modal_titlestotal:					"Обща сума"
						};
					case "da":		// Danish
						return {
							modal_header:						"Statistik over emojis",
							modal_titlescopies:					"Kopier",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Ikon",
							modal_titleslocal:					"Lokal",
							modal_titlesname:					"Server navn",
							modal_titlestotal:					"Total"
						};
					case "de":		// German
						return {
							modal_header:						"Emoji Statistiken",
							modal_titlescopies:					"Kopien",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Symbol",
							modal_titleslocal:					"Lokal",
							modal_titlesname:					"Servername",
							modal_titlestotal:					"Gesamt"
						};
					case "el":		// Greek
						return {
							modal_header:						"Στατιστικά στοιχεία emoji",
							modal_titlescopies:					"Αντίγραφα",
							modal_titlesglobal:					"Παγκόσμια",
							modal_titlesicon:					"Εικόνισμα",
							modal_titleslocal:					"Τοπικός",
							modal_titlesname:					"Ονομα διακομιστή",
							modal_titlestotal:					"Σύνολο"
						};
					case "es":		// Spanish
						return {
							modal_header:						"Estadísticas de emojis",
							modal_titlescopies:					"Copias",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Icono",
							modal_titleslocal:					"Local",
							modal_titlesname:					"Nombre del servidor",
							modal_titlestotal:					"Total"
						};
					case "fi":		// Finnish
						return {
							modal_header:						"Emojien tilastot",
							modal_titlescopies:					"Kopiot",
							modal_titlesglobal:					"Maailmanlaajuinen",
							modal_titlesicon:					"Kuvake",
							modal_titleslocal:					"Paikallinen",
							modal_titlesname:					"Palvelimen nimi",
							modal_titlestotal:					"Kaikki yhteensä"
						};
					case "fr":		// French
						return {
							modal_header:						"Statistiques des emojis",
							modal_titlescopies:					"Copies",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Icône",
							modal_titleslocal:					"Local",
							modal_titlesname:					"Nom du serveur",
							modal_titlestotal:					"Total"
						};
					case "hr":		// Croatian
						return {
							modal_header:						"Statistika emojija",
							modal_titlescopies:					"Kopije",
							modal_titlesglobal:					"Globalno",
							modal_titlesicon:					"Ikona",
							modal_titleslocal:					"Lokalno",
							modal_titlesname:					"Ime poslužitelja",
							modal_titlestotal:					"Ukupno"
						};
					case "hu":		// Hungarian
						return {
							modal_header:						"A hangulatjelek statisztikája",
							modal_titlescopies:					"Másolatok",
							modal_titlesglobal:					"Globális",
							modal_titlesicon:					"Ikon",
							modal_titleslocal:					"Helyi",
							modal_titlesname:					"Szerver név",
							modal_titlestotal:					"Teljes"
						};
					case "it":		// Italian
						return {
							modal_header:						"Statistiche di emoji",
							modal_titlescopies:					"Copie",
							modal_titlesglobal:					"Globale",
							modal_titlesicon:					"Icona",
							modal_titleslocal:					"Locale",
							modal_titlesname:					"Nome del server",
							modal_titlestotal:					"Totale"
						};
					case "ja":		// Japanese
						return {
							modal_header:						"絵文字の統計",
							modal_titlescopies:					"コピー",
							modal_titlesglobal:					"グローバル",
							modal_titlesicon:					"アイコン",
							modal_titleslocal:					"地元",
							modal_titlesname:					"サーバーの名前",
							modal_titlestotal:					"合計"
						};
					case "ko":		// Korean
						return {
							modal_header:						"이모티콘 통계",
							modal_titlescopies:					"사본",
							modal_titlesglobal:					"글로벌",
							modal_titlesicon:					"상",
							modal_titleslocal:					"현지",
							modal_titlesname:					"서버 이름",
							modal_titlestotal:					"합계"
						};
					case "lt":		// Lithuanian
						return {
							modal_header:						"Emoji statistika",
							modal_titlescopies:					"Kopijos",
							modal_titlesglobal:					"Visuotinis",
							modal_titlesicon:					"Piktograma",
							modal_titleslocal:					"Vietinis",
							modal_titlesname:					"Serverio pavadinimas",
							modal_titlestotal:					"Iš viso"
						};
					case "nl":		// Dutch
						return {
							modal_header:						"Statistieken van emoji's",
							modal_titlescopies:					"Kopieën",
							modal_titlesglobal:					"Globaal",
							modal_titlesicon:					"Icoon",
							modal_titleslocal:					"Lokaal",
							modal_titlesname:					"Server naam",
							modal_titlestotal:					"Totaal"
						};
					case "no":		// Norwegian
						return {
							modal_header:						"Statistikk over emoji",
							modal_titlescopies:					"Kopier",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Ikon",
							modal_titleslocal:					"Lokalt",
							modal_titlesname:					"Server navn",
							modal_titlestotal:					"Total"
						};
					case "pl":		// Polish
						return {
							modal_header:						"Statystyki emotikonów",
							modal_titlescopies:					"Kopie",
							modal_titlesglobal:					"Światowy",
							modal_titlesicon:					"Ikona",
							modal_titleslocal:					"Lokalny",
							modal_titlesname:					"Nazwa serwera",
							modal_titlestotal:					"Całkowity"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							modal_header:						"Estatísticas de emojis",
							modal_titlescopies:					"Cópias",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Ícone",
							modal_titleslocal:					"Local",
							modal_titlesname:					"Nome do servidor",
							modal_titlestotal:					"Total"
						};
					case "ro":		// Romanian
						return {
							modal_header:						"Statistici ale emoji-urilor",
							modal_titlescopies:					"Copii",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Pictogramă",
							modal_titleslocal:					"Local",
							modal_titlesname:					"Numele serverului",
							modal_titlestotal:					"Total"
						};
					case "ru":		// Russian
						return {
							modal_header:						"Статистика смайлов",
							modal_titlescopies:					"Копии",
							modal_titlesglobal:					"Глобальный",
							modal_titlesicon:					"Икона",
							modal_titleslocal:					"Местный",
							modal_titlesname:					"Название сервера",
							modal_titlestotal:					"Всего"
						};
					case "sv":		// Swedish
						return {
							modal_header:						"Statistik för emojis",
							modal_titlescopies:					"Kopior",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Ikon",
							modal_titleslocal:					"Lokal",
							modal_titlesname:					"Server namn",
							modal_titlestotal:					"Total"
						};
					case "th":		// Thai
						return {
							modal_header:						"สถิติของอิโมจิ",
							modal_titlescopies:					"สำเนา",
							modal_titlesglobal:					"ทั่วโลก",
							modal_titlesicon:					"ไอคอน",
							modal_titleslocal:					"ท้องถิ่น",
							modal_titlesname:					"ชื่อเซิร์ฟเวอร์",
							modal_titlestotal:					"รวม"
						};
					case "tr":		// Turkish
						return {
							modal_header:						"Emojilerin istatistikleri",
							modal_titlescopies:					"Kopya sayısı",
							modal_titlesglobal:					"Küresel",
							modal_titlesicon:					"Simge",
							modal_titleslocal:					"Yerel",
							modal_titlesname:					"Sunucu adı",
							modal_titlestotal:					"Toplam"
						};
					case "uk":		// Ukrainian
						return {
							modal_header:						"Статистика смайликів",
							modal_titlescopies:					"Копії",
							modal_titlesglobal:					"Глобальний",
							modal_titlesicon:					"Піктограма",
							modal_titleslocal:					"Місцеві",
							modal_titlesname:					"Ім'я сервера",
							modal_titlestotal:					"Разом"
						};
					case "vi":		// Vietnamese
						return {
							modal_header:						"Thống kê biểu tượng cảm xúc",
							modal_titlescopies:					"Bản sao",
							modal_titlesglobal:					"Toàn cầu",
							modal_titlesicon:					"Biểu tượng",
							modal_titleslocal:					"Địa phương",
							modal_titlesname:					"Tên máy chủ",
							modal_titlestotal:					"Toàn bộ"
						};
					case "zh-CN":	// Chinese (China)
						return {
							modal_header:						"表情符号统计",
							modal_titlescopies:					"数量",
							modal_titlesglobal:					"全球",
							modal_titlesicon:					"图标",
							modal_titleslocal:					"本地",
							modal_titlesname:					"服务器名称",
							modal_titlestotal:					"总计"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							modal_header:						"表情符號統計",
							modal_titlescopies:					"數量",
							modal_titlesglobal:					"全球",
							modal_titlesicon:					"圖示",
							modal_titleslocal:					"本地",
							modal_titlesname:					"伺服器名稱",
							modal_titlestotal:					"總計"
						};
					default:		// English
						return {
							modal_header:						"Emoji Statistics",
							modal_titlescopies:					"Copies",
							modal_titlesglobal:					"Global",
							modal_titlesicon:					"Icon",
							modal_titleslocal:					"Local",
							modal_titlesname:					"Server Name",
							modal_titlestotal:					"Total"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();