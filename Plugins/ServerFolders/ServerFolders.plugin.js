//META{"name":"ServerFolders"}*//

class ServerFolders {
	constructor () {
		this.labels = {};
		
		this.serverContextObserver = new MutationObserver(() => {});
		this.serverListObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		this.badgeObserver = new MutationObserver(() => {});
		
		this.css = `
			.serverfolders-modal .ui-icon-picker-icon {
				width: 75px;
				height: 75px;
				background-size: 75px 75px;
				background-repeat: no-repeat;
				margin-bottom: 5px;
				margin-top: 5px;
				border: 4px solid transparent;
				border-radius: 12px;
			}
			
			.guild.folder .badge.folder.count {
				background: grey;
				height: 12px;
				top: -3px;
				right: 30px;
			}
			
			.guild.serverFoldersPreview {
				position: absolute;
				opacity: 0.5;
				width: 50px;
				height: 50px;
				z-index: 1000;
			}
			
			.guild.serverFoldersPreview .badge {
				display: none;
			}
			
			.guild.serverFoldersPreview a {
				color: white;
				width: 50px;
				height: 50px;
				background-size: cover;
				background-position: center;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .5px;
				line-height: 50px;
				text-align: center;
			}
			
			.guilds-wrapper.folderopen {
				overflow: visible !important;
			}
			
			.guilds-wrapper.folderopen .scroller {
				position: static !important;
			}
			
			.guilds-wrapper.folderopen .scroller::-webkit-scrollbar {
				display: none !important;
			}
			
			.foldercontainer {
				max-height: 98%;
				max-width: 98%;
				position: absolute;
				top: 0px;
				left: 0px;
				z-index: 1000;
			}
			
			.foldercontainer::-webkit-scrollbar {
				display: none;
			}

			.foldercontainer .guild-inner {
			   border-radius: 25px !important;
			   transition: border-radius 1s;
			}

			.foldercontainer .guild-inner:hover {
			   border-radius: 15px !important;
			   transition: border-radius 1s;
			}`;

		this.serverContextEntryMarkup =
			`<div class="item-group">
				<div class="item serverfolders-item item-subMenu">
					<span>REPLACE_servercontext_serverfolders_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.serverContextSubMenuMarkup = 
			`<div class="context-menu serverfolders-submenu">
				<div class="item-group">
					<div class="item createfolder-item">
						<span>REPLACE_serversubmenu_createfolder_text</span>
						<div class="hint"></div>
					</div>
					<div class="item removefromfolder-item disabled">
						<span>REPLACE_serversubmenu_removefromfolder_text</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
			
		this.folderContextMarkup = 
			`<div class="context-menu folderSettings invertY">
				<div class="item-group">
					<div class="item unreadfolder-item">
						<span>REPLACE_foldercontext_unreadfolder_text</span>
						<div class="hint"></div>
					</div>
					<div class="item foldersettings-item">
						<span>REPLACE_foldercontext_foldersettings_text</span>
						<div class="hint"></div>
					</div>
					<div class="item removefolder-item">
						<span>REPLACE_foldercontext_removefolder_text</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
			
		this.folderIconMarkup = 
			`<div class="guild folder">
				<div draggable="true">
					<div class="guild-inner" draggable="false" style="border-radius: 25px;">
						<a draggable="false" class="avatar-small"></a>
					</div>
				</div>
				<div class="badge folder notifications"></div>
				<div class="badge folder count"></div>
			</div>`;

		this.folderSettingsModalMarkup =
			`<span class="serverfolders-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">REPLACE_modal_header_text</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;">
								<button type="button" value="modalTab-folder" class="modalTabButton buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_tabheader1_text</h3>
								</button>
								<button type="button" value="modalTab-icon" class="modalTabButton buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_tabheader2_text</h3>
								</button>
								<button type="button" value="modalTab-tooltip" class="modalTabButton buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_tabheader3_text</h3>
								</button>
							</div>
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU">
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 modalTab modalTab-folder" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_foldername_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-foldername"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_iconpicker_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="icons"></div>
										</div>
									</div>
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 modalTab modalTab-icon" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches1"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches2"></div>
										</div>
									</div>
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 modalTab modalTab-tooltip" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches3"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches4"></div>
										</div>
									</div>
								</div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-save buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
									<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">REPLACE_btn_save_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;	
			
		this.folderIcons = [
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAB2ElEQVR4Xu2Z4W6DMAwG4f0fmqloq0YJw0dIhLPb7y+qfT0Hr8yTf2ECczhpcBIWkEBYwgIEQFSzhAUIgKhmCQsQAFHNEhYgAKKaJSxAAETvMGsBn1eK3lFDZQmx4zWF1kL6rLCmlli3lamrBd4N6qeNq/VUYogdv1JcK1CPByasmFRrisJqbdWj7RLWAGaBFi5FqSSPHsNLBOAhDIwe6HVnwb4vx1H/KDxN02iw0ENOWGAjEJaw0B0WFiYc/P547yzwPYwI66j9nUiadW7Km5GwzmG91wthCStGAKRWqbqatSw5ng/zXL7bu8FKDKr/nSWs4NAnB9XXLGEFrXrFksPqt5QmB7XZGJo/DZPD2vBpCis5qN0eKqzXZr5fQosLezNYo1nV9N8dYYG3O8lhFSeuyRgmB3U4ccLaL9eHTG6HNapVTS745LD+lEeztmPYD9bIVt0+hsLaanr4I3pyUCFxbruzksMKcQiFfsk1qlkhDqHQGaz/YFVoTj8W3Bwv/sBP3uTdKTVr/Umd1fLoNOofhc/G8dFYysWh/lF4sJHEveMDhS8o01hW9Vt1OOHYVZUsLIBPWMICBEBUs4QFCICoZgkLEABRzRIWIACimiUsQABENQvA+gLIy3lMlnMoMQAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABkElEQVR4Xu3a6xKCIABEYXz/h7bpOl1M94CWMqffywRfK1I2FF+xwBAnDRaxQAnEEgsIgKjNEgsIgKjNEgsIgKjNEgsIgKjNEgsIgOgazRrB+01F15hD4xSy4S0TbUV6n2HLXLLVNqZqJ7g21H0ZtfNpZMiG10xuK6jdg4mVleqSolhbt2rX7RKrg2aBJVRFaUl2fRlWCcBBGIwO+NWeBdddHUfrR+FSSm9Y6CYnFjgRNGON43HKNgyTy40N4uBtV3iRORLU4wD3CRYbxEGxwPUqlli/uxu6Z82f79zgwflXLLEyAY8O4CYnlljfL6uJrzxxYeKgh1JQQbHE8gQ/dxBwz8qOSdeHDv5Ek2uJlVvZLGAlllhEAGTds8QCAiBqs8QCAiBqs8QCAiBqs8QCAiD6t2ad53ikB61//ReNWOCJNGj/nqPxc4g4+LTa4/x7bfkjQutH4c7A8NrxgE7AqtZdNWi53X0mxAKfq1hiAQEQtVliAQEQtVliAQEQtVliAQEQtVliAQEQtVliAQEQPQHGLZBMBnSlGQAAAABJRU5ErkJggg=="},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAB5ElEQVR4Xu3b0XaDIBBFUfz/j7YraZqooM4dxljg9HkU2dwh6rJT4s8sMJkrKUxgCSEACyxBQCglWWAJAkIpyQJLEBBKSRZYgoBQSrLAEgSEUm+yZmGMZal3POdwsYd5Lt4L9XflnjFjZ+08m3rhtVBNg1VhzbPdbpqyodSxnXmIO0y94LeOAvWOUw4WNxP9TOrc5fdZVViP+RQSpk8z7ggJTCpOKVVjtQx2C1ZcMPQz1eydw2EVkm02MBe+1jCkDfU8xB6xSZfZwFwIVrru1/Cf/erVRvMZqkuS1RnU5zZRJDftWWD9qrqwPHf74iKGl5duMb7ShmDtPERvV6QXqEs2eLA+O8LpngWWE6vFFjx6HArd4HtOVfieBdb6DuZwzwLLiNU7VGgbgpU/ROy2IVhGrBGgwtoQrPJzfLENwTJijQIV0oZg7b9Ky9oQLCPWSFDVbQjW8dvsVRuC5cTq7d1VicH9Pmt7shax1I9EwFqv+qEHWN/GGqEFq24dlgsC1smzIVjnXwxk33KPkqqQNgTL8Gx4HsKmKkx3BaaixbTt/1LRjpXZwFz4mjtY7YTg3itVk3Xv1d48OljCAoAFliAglJIssAQBoZRkgSUICKUkCyxBQCglWWAJAkIpyQJLEBBKfwAHhexMOBnKeAAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABj0lEQVR4Xu3b2w6CMBBF0fb/PxpDgsQAMbOnExtw+3zoZfUoxGhvvsICPZw02MQCJRBLLCAAojZLLCAAojZLLCAAojZLLCAAojZLLCAAotlmLWCOz2h2vuR0tZdlFp+Feq88M2ftrpOj0YWPQt0abAhrWeJ2vZ+monMn+1B3GV3wrkOg9jqdwep2wkeie8ffZw1hrfu5aBjfZt0VCAyFW2vDWHcGm4JVVww+0shn599hXTQ7bBAObmdY8jbkfai94tCusEE4KFbL3w1rz3rqaOHChIPHZk3dXu3kYYNwUKzBt2HmKb62FHw0Hx2gmXdDACaWWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARH/erHVt/jDk+wnF/yUATnpyNPyzq3Bw25BY8GSfBIbKgsIQ9XFxscCRiiUWEABRmyUWEABRmyUWEABRmyUWEABRmyUWEABRmyUWEABRmwWwXiH/oUz3h3vUAAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABsElEQVR4Xu3Z4XLCIBBFYfP+D52OjbXGxmQPQgrr6b/OrAKfdwnidPEvLDCFKy28iAVCIJZYQACUmiyxgAAoNVliAQFQarLEAgKg1GSJBQRAaWmyZjDGY2npeIXD1X1ZyeRLoX5mXjJm3VUXvhud+LtQQ4P9F9YVjY5dmId6L6MTrpWseisofye6dvzpZsLC6aa62bAQmFhg7xRLLLTrhwMTLrwN754FPoeMWJHlf4fKZEWolppJrN6w5nm87p3+5uicZIkVjG8WqFM2eLGCqbqWiRXEGhFqOSOsDgn3f5oeHUbE2noKll7vojOAWMEWzLZfNX0aZkuVWE9dsrdfidUDVsYWbJYssZbIho4OYgWxskI1aUOxfp8ah20oVhArM1T1NhRrfXDbbUOxglgjQu3dXW3dF1S7zxoR6+i74DOYWGuRXQ+xzsb6hBasdnQQa/v6ePPoIFYQ61OgqrShWK9/wTn8Ig1+/OmpNHQqCBU9rCojVtggXHgDE6unfuh5LjRZPa+l+dzEAsRiiQUEQKnJEgsIgFKTJRYQAKUmSywgAEpNllhAAJSaLLGAACj9AiC1iUwkZlXyAAAAAElFTkSuQmCC", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABgElEQVR4Xu3a7a6CMBREUXj/h8aQKEGMMvvYACX7/r2jLatDrR/j4F8sMMZJg4NYoARiiQUEQNRmiQUEQNRmiQUEQNRmiQUEQNRmiQUEQLTarAmMsY5WxysO1/ZhlclXoV4zr4zZ9qqLz0Yn/i9U12BnYc1odOxiH9o9jE64VbPaXUH9mei149W9ExZuN9W9GxYCEwvsnWKJhXb9uDBx8Dm8exZYB7HEygS8DY/a4Kepv7tyHD/6ERcmDm43+B6hlnfx72CxQRwUC9yvYol1zHtD96z948by8ieWWD8FfDUE+7ZYYv3eTzan+LgwcdBzFqigWGJ5KN07Abln7Qmt/i+WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG3WlbHmufX4ddgpPwwBC3n1aPzRehzcfqx8dQEwv9ggDq4G7+9HWd/l0PWjMFitW0bFAssqllhAAERtllhAAERtllhAAERtllhAAERtllhAAERtllhAAERtFsB6ACnIiUxdpMfOAAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAByUlEQVR4Xu3a4XKCMBBFYXj/h6bTakEFYU+yjJic/r4Y+LwLNOM4+BcWGMNJg4NYoARiiQUEQNRmiQUEQNRmiQUEQNRmiQUEQNRmiQUEQLS0WRNY4zFaul7hcrmHlZx8KdT/mZesmXvVhZ9GT7wW6qvBqrCmKW43jqul6NqFfcg7jJ7wrEOg5jqtwfKuhH8SvXa8n1WF9Xs9Gw3jl5l3BAJD4WEYqrG+GewjWHnF4J9Uc+/sDmuj2WGDcPD+HaaMIe9D7hEv7QobhINiDec9DS/21Kut5l+pTmlWY1DLayIkD92zxLqpigXaJVYmVqsjeMoNXqyleodjKFbfWPPrVep7VsutSr9nifX8qNy9Z4kVxGodKnUMxVq/rb4dQ7GCWD1ApY2hWNv/MG6OoVhBrF6gUsZQrPd7NqsxFCuI1RNU9RiKtb9t+jSGYvWNtbtlVbyfBfbtvykqFvi2xBILCASjh7ekw8DLQvFf3AbP8EKxQ4vDgFiLgFg3i5BDKPTQrlbHMOQQCokF6tc4Vrgw4eAdrMUxDBuEgxd6xH/sVMQC9GKJBQRA1GaJBQRA1GaJBQRA1GaJBQRA1GaJBQRA1GaJBQRA1GYBrB8F4ZJMlK2iwQAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABkklEQVR4Xu2bywrCQBAEN///0RFFg6iHrtmRNVieK/uo9LQguA0/sYEtJgWHskAIlKUsYACgJktZwABATZaygAGAmixlAQMANVnKAgYAWk3WDvZ4Rqv7Fbfrfaxy+Kqox8kre/beurgaPfisqFMLm5K177m7bXvbiu5dzEPfY/TAhx0i6ojTu7C+m/CV6N3x71lTsq73+ZAwfs2+J5AwBI8xpmWdWdgSWX3B4CvNdOffyfqQ7NhBDN7fYcsY8jz0PvGSrthBDCpr1L8Ne9/10tXiwMTga7KWXq9389hBDCrLMbx9OaZBjUGTBawqS1mOYdpBdy6uohh0DB1Dx9AxhAYAHldRDNpZdpadBUZQWcqCBgAe93YMWvAWvJ0FRlBZyoIGAB73dgxa8Ba8nQVGUFnKggYAHvd2DFrwFrydBUZQWcqCBgAe93YMWvAWvJ0FRvCrsq6L5/9BgadegKMaQvCCy/zUlsoCr0NZygIGAGqylAUMANRkKQsYAKjJUhYwAFCTpSxgAKAmS1nAAEBNFpB1ARZcR0zScgj8AAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAB4ElEQVR4Xu2Z0XWDMAxFxWdH6A6docN3hu7QEfpJT9NAQwJIz0duQefm+8WY6yvZwGD8wgSGcJKgAUuQAFjAEggIUcwClkBAiGIWsAQCQhSzgCUQEKKYBSyBgBDFrA6wRmHMaPR0CxWZcA9QE9DI9aPwu+cikwXWdRn+G9b3NCJz6G5N5AKRifY0C1iRVbrLRBatYdjcv0Qm2dus09h1FFi5CuijRTiEmutfmKXfXv4/XGBuwMyAdaCjQ74jbSO64riBW7PGsa5kwzC4LNwAsH41BdbUjzAr3rwowzgrA9bRYQVKX7iFw0QvvT29wQPrusDeOasoqFmqVLOAdfNsiFl+D52fcfZgVbcqtcED68c6zGp5RbNVhoWtWlRfym5YGNaCD7D2N7hcWIWtetgAW8x6M7PXaUEKw3pg0wLr3cxegLVev/dHhw8ze7446r+29o+8x02kmPVpZk/Aipk1pwqbtdqeWnrWBVZhUJuPgcBarybMEvaSPFjFSzC3DIvD2mxNUs8SND5zFFjC6gELWAIBIYpZQVi7PZwGv6QIrKBV7teuiFmLLzzChc8WdVm4gbPdcc/5AkugCyxgCQSEKGYBSyAgRDELWAIBIYpZwBIICFHMApZAQIhiFrAEAkL0C09hh0yOgU58AAAAAElFTkSuQmCC", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABv0lEQVR4Xu2aYW7CMBSDX26ChHabXZfbTJN2kqKCNpCg+Jk0axp9/MVpky+220JL8EkTKGklwgCWYQJgAcsgYEhxFrAMAoYUZwHLIGBIcRawDAKGFGcByyBgSHFWA1iTccys9BARP1lxD7qMs1qA+l175vw9cLrMITPZlrA+I+LUDQ0xka1hZTesC57AMrahB1i7cVdPsOa5tOxHw0PPpb3Aql5I5QEyHDa/GlaucdXhx4j4fnXEDNGuo7EiLnmTDKwb7Y+I+FrNWdM0rslKKdI4UnB/hQKWDv2fnYAFrOtD8n/EMHEOvR0bK+bENIc1Aqi7fZL9LQWvCh5Yj5FYLHhgAWuxQYnhDY1kIQV0lkETWMB61ksyZVKAs3AWzqp8apIpkwJiSAyJITGsJGAMl5UkBXQWnUVnGZEDFrAqCRjDZX9LwVLBD/Yr6eUPHgVWCnp/DUgt0PhespACYL1562Ds0h6l0jhSgLNwVvv7rD1my5izTJkUEENiSAyNyDWDNR943Pcjr9gydZQTVe7YMMNTRIdZbeVCgGUABBawDAKGFGcByyBgSHEWsAwChhRnAcsgYEhxFrAMAoYUZxmwzq8phkz4oCrBAAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAByElEQVR4Xu3Z0XaDIBCE4fj+D21OepqkWnRnZPUA/rntxuDnsICdHnxkgUmupPABlhECsMAyBIxSkgWWIWCUkiywDAGjlGSBZQgYpSQLLEPAKCVZJ2PNxvWV0m4emDvQbKg3pjsO5SGk1ziDPAuqGzAV62yoLsBaw3qhqWNKn2bRBdWBXZWsphPWKlb0kDP+rt7757fUL1ydrAwM9RqqgdwfRsaS+6SqCpax8oyOJaWLZH07W2gRFvxei2QxDRcLZhicsKAmWfPcdiCnaXH7oUVYcASrdaStDdi00lvXpWP1CvU5Z+2AgVWI2VbCUrF6T1WULrBIlnqGLtcxDQ2/07FG6Vc/h8SNFTGtZ4H1jW64FQfrhlh7u3im4arxg5WwEkpvB5WD9B36FVjG7h0ssIwGZTR3knU11l2ae0qywPo/7TePO2CBVVwlqo87oyQr+s9Odc8aBWrvHdbfiFUlC6zynq7Y4MG6IZbSr6p61t1S5WC9ahdTEaz9M+iQWOoUdJO1SNcIyXKgjmC9szf3juVC1WAdf2nU8TfVTWnHt5g3dLAMS7DAMgSMUpIFliFglJIssAwBo5RkgWUIGKUkCyxDwCglWQbWE/kykkzUi2UWAAAAAElFTkSuQmCC", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABZklEQVR4Xu3awZKCMBQFUfL/Hx0rKizccNtKKHjVs/WKeGh0FrbNv1igxUuHm1ggArHEAgJgalliAQEwtSyxgACYWpZYQABMLUssIACmlrUYq4PjJ9PHXDB6orOhdkx6HslFmL4hJ7kK6jFgKdZqqEeA3Q1roKXnNP02OztgemJXlXXrwv7C6v1qu7Nrzh9vraXv/Th4+oS3TgWkX1aCFmNVhDru+bAyscY3ykysXjmrb14JWFSWWB9RsSxrzb8SlmVZlsUFwDP8NhQLCICpZYkFBMDUssQCAmBqWWIBATC1LLGAAJhallhAAEwtSywgAKaWJRYQAFPLEgsIgKlliQUEwNSyxAICYGpZYgEBMLUssYAAmE4ra7xm5d9oJVDDIPoVjVifRGOsqmBpVRhr/wiocEsSpP19o7LA52XJqVjgsoolFhAAU8sSCwiAqWWJBQTA1LLEAgJgalliAQEwtSyxgACYvgCckKpMkaN7zAAAAABJRU5ErkJggg=="},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABrklEQVR4Xu3ayZLCMAxFUfz/H50upnQanFjXdi8SXba8TAdJGBfl5issUMJJgzexQBGIJRYQAFErSywgAKJWllhAAEStLLGAAIhaWWIBARC1ssQCAiDaU1kLOH8t2nPNwUvOOZze+CjU+67pdec87eBZ6E3PwrrfNr324KOOH05veCbW6cCGsJZltt34p986QymFPvN6SnrgqnNGqHVgdoJ1YZ0Z6tH7YrUa8Pd9seJWj2QPWMo2fGHhb+PsWAhMLLA4Fkus9rTfrB7CBXMUPN/yvG0USeya7L2RFepwV6SGlR1qF0ys/cb8shFLrMgcb2asrCbR5vf2Z9Y2tA1B/Qxi3Q/Pvnyorj9dlNYrSyzQnGL9F1bmuYV/SItVKUO3aL5RrKzReRXZrM+23jrcNW1tqYq1KUmx/vanlTVjXkVmVqYlRKvLQv++yzK3xJrVgrYhGO5RrAxzq9mCYh3st9faNySaYOc05BAKifWssyjWledW2CAcvHB1hQ3CQbBeuWxULPDRiiUWEABRK0ssIACiVpZYQABErSyxgACIWlliAQEQtbLEAgIgamUBrB+JEUtMl61hQwAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABhUlEQVR4Xu3YwQqDMBBF0eT/P9oiVAji4l1rIh1u1w8zHifTaG/+YoEeJw02sUATiCUWEABRO0ssIACidpZYQABE7SyxgACI2lliAQEQtbPEAgIgeqezNnD9q+idNa+us7wOWvivBR43Tdc9Y71SBy36qSL3m6drH2BP1oDqoAW/VuhX6un112Ft24zarydi7/S5xpM1vnAcPD/ZIlDzO6sQVB2siVtv3KPx7oqD4zZc0VmLoOZ3Vjw6/yMYN0wcnPjX/TZpbBAHW2vrzglr+WKDOCgWe+Wws0DHiyVW/kLvzAKjSCyxwHARSywkAMLxKIqDHkrBfhVLrGmfaDzBg0Eolli+7oAeEEssIgCy8VkzDnrO8pzlOQtsQbHEggIgHs/tOOiAd8A7s8AWFEssKADi8dyOgw54B7wzC2zBaVj7hat9LSVjKP/wNTytKmAICrUgbO2ScaxbUiG8KbFCKLchgBJLLCgA4s4ssYAAiNpZYgEBELWzxAICIGpniQUEQNTOAlgf/fBATBZ555AAAAAASUVORK5CYII="}
		];
	}
		
	getName () {return "ServerFolders";}

	getDescription () {return "Adds the feature to create folders to organize your servers. Right click a server > 'Serverfolders' > 'Create Server' to create a server. To add servers to a folder hold 'Ctrl' and drag the server onto the folder, this will add the server to the folderlist and hide it in the serverlist. To open a folder click the folder. A folder can only be opened when it has at least one server in it. To remove a server from a folder, open the folder and either right click the server > 'Serverfolders' > 'Remove Server from Folder' or hold 'Del' and click the server in the folderlist.";}

	getVersion () {return "5.2.4";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="closeOtherFolders"${(this.getSettings().closeOtherFolders ? " checked" : void 0)}> Close other folders when opening a folder.</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="showCountBadge"${(this.getSettings().showCountBadge ? " checked" : void 0)}> Display badge for amount of servers in a folder.</label><br><br>
			<button class="` + this.getName() + `ResetBtn" style="height:23px" onclick='` + this.getName() + `.resetAll("` + this.getName() + `")'>Delete all Folders`;
		}
    }

	//legacy
	load () {}

	start () {	
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			if (!BDfunctionsDevilBro.loadData("warning", this.getName(), "warning")) {
				if (confirm("Welcome to ServerFolders 2.0. I decided to rewrite the whole plugin to make the folders act more like actual folders. Sadly due to the internal changes all old folders will no longer work, hence why I recommend you to delete them all. If you press 'yes' / 'ok' whatever it is labeled in your language in this window, all folders will be removed, all servers will be displayed again and the old config will be cleared. Thanks and have fun. Also make sure to read the plugin description to learn how to work with ServerFolders 2.0")) {
					BDfunctionsDevilBro.removeAllData(this.getName(), "folders");
					$("div.guild.folder").remove();
					$(BDfunctionsDevilBro.readServerList()).show();
				}
				BDfunctionsDevilBro.saveData("warning", true, this.getName(), "warning");
			}
			
			if (!BDfunctionsDevilBro.loadData("warning2", this.getName(), "warning2")) {
				alert("Since so many people asked for it: here another 'big' update. You can now change the order of folders by dragging them around. Just drag a folder ontop of another folder and it will place it below the hovered folder. Same thing for servers within a folder, you can drag a server on top of a server (only on servers that are in the same folder to prevent them from mixing) and release the mouse button to place the dragged server below of the hovered server. As an extra you can now move a server from one folder to another by dragging it from the foldercontentlist to another folder. Have fun.");
				BDfunctionsDevilBro.saveData("warning2", true, this.getName(), "warning2");
			}
			
			if (!BDfunctionsDevilBro.loadData("warning3", this.getName(), "warning3")) {
				alert("Still not satisfied eh. You can now move folders freely in the whole server list. Also folders are again created below the server that was right clicked. And again please read the description of the plugin before asking me how it works or why it isn't working like the old version. Have fun.");
				BDfunctionsDevilBro.saveData("warning3", true, this.getName(), "warning3");
			}
			
			this.serverContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.serverContextObserver.observe(document.querySelector(".app"), {childList: true});
			
			this.serverListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class") {
							var serverDiv = this.getGuildParentDiv(change.target, "guild");
							var folderDiv = this.getFolderOfServer(serverDiv);
							if (folderDiv) {
								this.updateCopyInFolderContent(serverDiv, folderDiv);
								this.updateFolderNotifications(folderDiv);
							}
						}
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								var serverDiv = this.getGuildParentDiv(node, "guild");
								var folderDiv = this.getFolderOfServer(serverDiv);
								if (folderDiv) {
									this.updateCopyInFolderContent(serverDiv, folderDiv);
									this.updateFolderNotifications(folderDiv);
									if (node.classList.contains("badge")) this.badgeObserver.observe(node, {characterData: true, subtree: true});
									$(serverDiv).hide();
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								var serverDiv = this.getGuildParentDiv(node, "guild");
								var folderDiv = this.getFolderOfServer(serverDiv);
								if (folderDiv && !node.classList.contains("badge")) {
									var info = BDfunctionsDevilBro.getKeyInformation({"node":serverDiv, "key":"guild"});
									if (info) $("#copy_of_" + info.id).remove();
									this.updateFolderNotifications(folderDiv);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".guilds.scroller")) this.serverListObserver.observe(document.querySelector(".guilds.scroller"), {childList: true, attributes: true, subtree: true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								Array.from(document.querySelectorAll(".folder")).forEach(folderDiv => {this.updateFolderNotifications(folderDiv);});
							});
						}
					}
				);
			});
			this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.badgeObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						var serverDiv = this.getGuildParentDiv(change.target, "guild");
						var folderDiv = this.getFolderOfServer(serverDiv);
						if (folderDiv) {
							this.updateCopyInFolderContent(serverDiv, folderDiv);
							this.updateFolderNotifications(folderDiv);
						}
					}
				);
			});
			
			document.querySelectorAll(".badge:not(.folder):not(.copy)").forEach( 
				(badge) => {
					this.badgeObserver.observe(badge, {characterData: true, subtree: true});
				}
			);
			
			this.addDragListener();
			
			this.loadAllFolders();
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.serverContextObserver.disconnect();
			this.serverListObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			this.badgeObserver.disconnect();
			
			$(".foldercontainer").remove();
			$("div.guild.folder").remove();
			$(BDfunctionsDevilBro.readServerList()).show();
			
			$(".guilds-wrapper").removeClass("folderopen");
			$(".guilds.scroller").off("mousedown." + this.getName());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			BDfunctionsDevilBro.removeLocalStyle("ChannelSizeCorrection");
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			closeOtherFolders: false,
			showCountBadge: true
		};
		var settings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings");
		var saveSettings = false;
		for (var key in defaultSettings) {
			if (settings[key] == null) {
				settings[key] = settings[key] ? settings[key] : defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
		}
		return settings;
	}

    static updateSettings (ele, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, pluginName, "settings");
    }
	
    static resetAll (pluginName) {
		if (confirm("Are you sure you want to delete all folders?")) {
			BDfunctionsDevilBro.removeAllData(pluginName, "folders");
			BDfunctionsDevilBro.removeAllData(pluginName, "folderIDs");
			
			$(".foldercontainer").remove();
			$("div.guild.folder").remove();
			$(BDfunctionsDevilBro.readServerList()).show();
			BDfunctionsDevilBro.removeLocalStyle("ChannelSizeCorrection");
		}
    }

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_servercontext_serverfolders_text", this.labels.servercontext_serverfolders_text);
		
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_serversubmenu_createfolder_text", this.labels.serversubmenu_createfolder_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_serversubmenu_removefromfolder_text", this.labels.serversubmenu_removefromfolder_text);
		
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_unreadfolder_text", this.labels.foldercontext_unreadfolder_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_foldersettings_text", this.labels.foldercontext_foldersettings_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_removefolder_text", this.labels.foldercontext_removefolder_text);
		
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_foldername_text", this.labels.modal_foldername_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_iconpicker_text", this.labels.modal_iconpicker_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	onContextMenu (context) {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"guild"});
		
		if (serverData && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"})) {
			$(context).append(this.serverContextEntryMarkup)
				.on("mouseenter", ".serverfolders-item", serverData, this.createContextSubMenu.bind(this))
				.on("mouseleave", ".serverfolders-item", serverData, this.deleteContextSubMenu.bind(this));
		}
	}
	
	createContextSubMenu (e) {
		var targetDiv = e.currentTarget;
		var serverDiv = BDfunctionsDevilBro.getDivOfServer(e.data.id);
		var serverContextSubMenu = $(this.serverContextSubMenuMarkup);
		$(targetDiv).append(serverContextSubMenu)
			.off("click", ".createfolder-item")
			.on("click", ".createfolder-item", () => {this.createNewFolder(serverDiv);});
		$(serverContextSubMenu)
			.addClass(BDfunctionsDevilBro.getDiscordTheme())
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
			
		var folderDiv = this.getFolderOfServer(serverDiv);
		if (folderDiv) {
			$(targetDiv).find(".removefromfolder-item")
				.removeClass("disabled")
				.on("click", e.data, () => {this.removeServerFromFolder(serverDiv, folderDiv);});
		}
	}
	
	deleteContextSubMenu (e) {
		$(".serverfolders-submenu").remove();
	}
	
	addDragListener () {
		$(".guilds.scroller")
			.off("mousedown." + this.getName())
			.on("mousedown." + this.getName(), "div.guild:not(.folder):not(.copy)", (e) => {
				if (BDfunctionsDevilBro.pressedKeys.includes(17)) {
					e.stopPropagation();
					e.preventDefault();
					var draggedServer = this.getGuildParentDiv(e.target, "guild");
					
					if (draggedServer && BDfunctionsDevilBro.getKeyInformation({"node":draggedServer,"key":"guild"})) {
						var serverPreview = draggedServer.cloneNode(true);
						$(serverPreview)
							.appendTo("#app-mount")
							.addClass("serverFoldersPreview")
							.offset({"left":e.clientX + 5,"top":e.clientY + 5});
						
						$(document)
							.off("mouseup." + this.getName()).off("mousemove." + this.getName())
							.on("mouseup." + this.getName(), (e2) => {
								var folderDiv = this.getGuildParentDiv(e2.target, "folder");
								if (folderDiv) {
									this.addServerToFolder(draggedServer, folderDiv);
								}
								$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
								serverPreview.remove();
							})
							.on("mousemove." + this.getName(), (e2) => {
								$(serverPreview).offset({"left":e2.clientX + 5,"top":e2.clientY + 5});
							});
					}
				}
			});
	}
	
	addServerToFolder (serverDiv, folderDiv) {
		var data = BDfunctionsDevilBro.loadData(folderDiv.id, this.getName(), "folders");
		var info = BDfunctionsDevilBro.getKeyInformation({"node":serverDiv, "key":"guild"});
		if (data && info && !data.servers.includes(info.id)) {
			data.servers.push(info.id);
			BDfunctionsDevilBro.saveData(folderDiv.id, data, this.getName(), "folders");
			$(serverDiv).hide();
			var message = this.labels.toast_addserver_text ? this.labels.toast_addserver_text.replace("${servername}", info.name).replace("${foldername}", data.folderName ? " " + data.folderName : "") : "";
			BDfunctionsDevilBro.showToast(message, {type:"success"});
			this.updateCopyInFolderContent(serverDiv, folderDiv);
			this.updateFolderNotifications(folderDiv);
		}
	}
	
	removeServerFromFolder (serverDiv, folderDiv) {
		$(".context-menu").hide();
		var data = BDfunctionsDevilBro.loadData(folderDiv.id, this.getName(), "folders");
		var info = BDfunctionsDevilBro.getKeyInformation({"node":serverDiv, "key":"guild"});
		if (data && info) {
			BDfunctionsDevilBro.removeFromArray(data.servers, info.id);
			BDfunctionsDevilBro.saveData(folderDiv.id, data, this.getName(), "folders");
			$(serverDiv).show();
			var message = this.labels.toast_removeserver_text ? this.labels.toast_removeserver_text.replace("${servername}", info.name).replace("${foldername}", data.folderName ? " " + data.folderName : "") : "";
			BDfunctionsDevilBro.showToast(message, {type:"danger"});
			$("#copy_of_" + info.id).remove();
			this.updateFolderNotifications(folderDiv);
		}
	}
	
	createNewFolder (serverDiv) {
		$(".context-menu").hide();
		var folderID = 		this.generateFolderID();
		var folderName = 	"";
		var position = 		Array.from(document.querySelectorAll("div.guild-separator ~ div.guild")).indexOf(serverDiv);
		var iconID = 		0;
		var icons = 		this.folderIcons[0];
		var color1 = 		["0","0","0"];
		var color2 = 		["255","255","255"];
		var color3 = 		null;
		var color4 = 		null;
		var servers = 		[];
		
		var data = {folderID,folderName,position,iconID,icons,color1,color2,color3,color4,servers};
		
		var folderDiv = this.createFolderDiv(data);
		
		BDfunctionsDevilBro.saveData(folderID, data, this.getName(), "folders");
		
		this.showFolderSettings(folderDiv);
		
		this.updateFolderPositions();
	}
	
	loadAllFolders () {
		var folders = BDfunctionsDevilBro.loadAllData(this.getName(), "folders");
		var sortedFolders = [];
		
		for (var id in folders) {
			sortedFolders[folders[id].position] = folders[id];
		}
		
		for (var i = 0; i < sortedFolders.length; i++) {
			var data = sortedFolders[i];
			if (data) {
				var folderDiv = this.createFolderDiv(data);
				$(this.readIncludedServerList(folderDiv)).hide();
			}
		}
	}
	
	createFolderDiv (data) {
		var folderDiv = $(this.folderIconMarkup)[0];
		$(folderDiv).insertBefore(document.querySelectorAll("div.guild-separator ~ div.guild")[data.position]);
			
		var folderInner = folderDiv.querySelector(".guild-inner");
		var folder = folderDiv.querySelector(".avatar-small");
		
		$(folderDiv)
			.addClass("closed")
			.attr("id", data.folderID)
			.on("click", () => {
				if (this.getSettings().closeOtherFolders) {
					Array.from(document.querySelectorAll(".folder.open")).forEach(openFolder => {
						if (openFolder != folderDiv) this.openCloseFolder(openFolder);
					});
				}
				this.openCloseFolder(folderDiv);
			})
			.on("contextmenu", (e) => {this.createFolderContextMenu(folderDiv, e);})
			.on("mousedown." + this.getName(), (e) => {
				var mouseTimeout = null;
				var folderPreview = folderDiv.cloneNode(true);
				var hoveredElement = null;
				var placeholder = $(`<div class="guild guild-placeholder folder folder-placeholder"></div>`)[0];
				$(folderPreview)
					.hide()
					.appendTo("#app-mount")
					.addClass("serverFoldersPreview")
					.offset({"left":e.clientX + 5,"top":e.clientY + 5});
				
				$(document)
					.off("mouseup." + this.getName())
					.on("mouseup." + this.getName(), (e2) => {
						clearTimeout(mouseTimeout);
						placeholder.remove();
						folderPreview.remove();
						$(folderDiv).css("display","");
						$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
						if (hoveredElement) {
							document.querySelector(".guilds.scroller").insertBefore(folderDiv, hoveredElement.nextSibling);
							this.updateFolderPositions(folderDiv);
						}
					});
				mouseTimeout = setTimeout(() => {
					$(document)
						.off("mousemove." + this.getName())
						.on("mousemove." + this.getName(), (e2) => {
							placeholder.remove();
							$(folderDiv).hide();
							$(folderPreview)
								.show()
								.offset({"left":e2.clientX + 5,"top":e2.clientY + 5});
							hoveredElement = this.getGuildParentDiv(e2.target, "folder") || this.getGuildParentDiv(e2.target, "guild");
							if (hoveredElement) {
								document.querySelector(".guilds.scroller").insertBefore(placeholder, hoveredElement.nextSibling);
							}
						});
				},100);
			});
		$(folderInner)
			.on("mouseenter", () => {this.createFolderToolTip(folderDiv);});
		$(folder)
			.css("background-image", "url(\"" + data.icons.closedicon + "\")");
			
		this.updateFolderNotifications(folderDiv);
			
		return folderDiv;
	}
	
	generateFolderID () {
		var folderIDs = BDfunctionsDevilBro.loadAllData(this.getName(), "folderIDs");
		var folderID = "folder_" + Math.round(Math.random()*10000000000000000);
		if (folderIDs[folderID]) {
			return generateFolderID();
		}
		else {
			folderIDs[folderID] = folderID;
			BDfunctionsDevilBro.saveAllData(folderIDs, this.getName(), "folderIDs");
			return folderID;
		}
	}
	
	createFolderContextMenu (folderDiv, e) {
		var folderContext = $(this.folderContextMarkup);
		$(".app").append(folderContext)
			.off("click", ".foldersettings-item")
			.on("click", ".foldersettings-item", () => {
				this.showFolderSettings(folderDiv);
			})
			.off("click", ".removefolder-item")
			.on("click", ".removefolder-item", () => {
				this.removeFolder(folderDiv);
			});
		
		if (BDfunctionsDevilBro.readUnreadServerList(this.readIncludedServerList(folderDiv)).length > 0) {
			folderContext
				.off("click", ".unreadfolder-item")
				.on("click", ".unreadfolder-item", () => {
					this.clearAllReadNotifications(folderDiv);
				});
		}
		else {
			folderContext.find(".unreadfolder-item").addClass("disabled");
		}
		
		folderContext
			.addClass(BDfunctionsDevilBro.getDiscordTheme())
			.css("left", e.pageX + "px")
			.css("top", e.pageY + "px");
			
		$(document).on("mousedown." + this.getName(), (e2) => {
			$(document).off("mousedown." + this.getName());
			if (folderContext.has(e2.target).length == 0) {
				$(folderContext).remove();
			}
		});
	}
	
	createFolderToolTip (folderDiv) {
		var data = BDfunctionsDevilBro.loadData(folderDiv.id, this.getName(), "folders");
		if (data) {
			if (data.folderName) {
				var bgColor = data.color3 ? BDfunctionsDevilBro.color2RGB(data.color3) : "";
				var fontColor = data.color4 ? BDfunctionsDevilBro.color2RGB(data.color4) : "";
				var customTooltipCSS = `
					.guild-folder-tooltip {
						color: ${fontColor} !important;
						background-color: ${bgColor} !important;
					}
					.guild-folder-tooltip:after {
						border-right-color: ${bgColor} !important;
					}`;
				BDfunctionsDevilBro.createTooltip(data.folderName, folderDiv, {type:"right",selector:"guild-folder-tooltip",css:customTooltipCSS});
			}
		}
	}
	
	createServerToolTip (e) {
		var serverDiv = e.data.div;
		var info = e.data.info;
		var data = BDfunctionsDevilBro.loadData(info.id, "EditServers", "servers");
		var text = data ? (data.name ? data.name : info.name) : info.name;
		var bgColor = data ? (data.color3 ? BDfunctionsDevilBro.color2RGB(data.color3) : "") : "";
		var fontColor = data ? (data.color4 ? BDfunctionsDevilBro.color2RGB(data.color4) : "") : "";
		var customTooltipCSS = `
			.guild-custom-tooltip {
				color: ${fontColor} !important;
				background-color: ${bgColor} !important;
			}
			.guild-custom-tooltip:after {
				border-right-color: ${bgColor} !important;
			}`;
			
		BDfunctionsDevilBro.createTooltip(text, serverDiv, {type:"right",selector:"guild-custom-tooltip",css:customTooltipCSS});
	}
	
	showFolderSettings (folderDiv) {
		$(".context-menu.folderSettings").remove();
		
		var folderID = folderDiv.id;
		var data = BDfunctionsDevilBro.loadData(folderID, this.getName(), "folders");
		if (data) {
			var folderName = 	data.folderName;
			var position = 		data.position;
			var iconID = 		data.iconID;
			var icons = 		data.icons;
			var color1 = 		data.color1;
			var color2 = 		data.color2;
			var color3 = 		data.color3;
			var color4 = 		data.color4;
			var servers = 		data.servers;
			
			var folderSettingsModal = $(this.folderSettingsModalMarkup);
			folderSettingsModal.find(".guildName-1u0hy7").text(folderName ? folderName : "");
			folderSettingsModal.find("#input-foldername").val(folderName);
			folderSettingsModal.find("#input-foldername").attr("placeholder", folderName);
			this.setIcons(iconID, folderSettingsModal.find(".icons"));
			BDfunctionsDevilBro.setColorSwatches(color1, folderSettingsModal.find(".swatches1"), "swatch1");
			BDfunctionsDevilBro.setColorSwatches(color2, folderSettingsModal.find(".swatches2"), "swatch2");
			BDfunctionsDevilBro.setColorSwatches(color3, folderSettingsModal.find(".swatches3"), "swatch3");
			BDfunctionsDevilBro.setColorSwatches(color4, folderSettingsModal.find(".swatches4"), "swatch4");
			BDfunctionsDevilBro.appendModal(folderSettingsModal);
			folderSettingsModal
				.on("click", "button.btn-save", (e) => {
					folderName = null;
					if (folderSettingsModal.find("#input-foldername").val()) {
						if (folderSettingsModal.find("#input-foldername").val().trim().length > 0) {
							folderName = folderSettingsModal.find("#input-foldername").val().trim();
						}
					}
					
					iconID = $(".ui-icon-picker-icon.selected").attr("value");
			
					color1 = BDfunctionsDevilBro.getSwatchColor("swatch1");
					color2 = BDfunctionsDevilBro.getSwatchColor("swatch2");
					color3 = BDfunctionsDevilBro.getSwatchColor("swatch3");
					color4 = BDfunctionsDevilBro.getSwatchColor("swatch4");
					
					if (iconID != data.iconID || !BDfunctionsDevilBro.equals(color1, data.color1) || !BDfunctionsDevilBro.equals(color2, data.color2)) {
						this.changeImgColor(color1, color2, this.folderIcons[iconID].openicon, (openicon) => {
							icons.openicon = openicon;
							this.changeImgColor(color1, color2, this.folderIcons[iconID].closedicon, (closedicon) => {
								icons.closedicon = closedicon;
								var isOpen = folderDiv.classList.contains("open");
								$(folderDiv).find(".avatar-small").css("background-image", isOpen ? "url(\"" + icons.openicon + "\")" : "url(\"" + icons.closedicon + "\")");
								BDfunctionsDevilBro.saveData(folderID, {folderID,folderName,position,iconID,icons,color1,color2,color3,color4,servers}, this.getName(), "folders");
							});
						});
					}
					else {
						BDfunctionsDevilBro.saveData(folderID, {folderID,folderName,position,iconID,icons,color1,color2,color3,color4,servers}, this.getName(), "folders");
					}
					
				});
			folderSettingsModal.find("#input-foldername").focus();
		}
	}
	
	setIcons (selection, wrapper) {
		var wrapperDiv = $(wrapper);
		
		var folderIcons = this.folderIcons;
		
		var icons = 
			`<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 1 1 auto; margin-top: 5px;">
				<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa wrap-1da0e3  ui-icon-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">
					${ folderIcons.map((val, i) => `<div class="ui-icon-picker-icon" value="${i}" style="background-image: url(${val.closedicon});"></div>`).join("")}
				</div>
			</div>`;
		$(icons).appendTo(wrapperDiv);
		
		if (!(selection < folderIcons.length && selection > -1)) {
			selection = 0;
		}
		wrapperDiv.find(".ui-icon-picker-icon").eq(selection)
			.addClass("selected")
			.css("background-color", "grey");
		
		wrapperDiv.on("click", ".ui-icon-picker-icon", (e) => {
			wrapperDiv.find(".ui-icon-picker-icon.selected")
				.removeClass("selected")
				.css("background-color", "transparent");
			
			$(e.target)
				.addClass("selected")
				.css("background-color", "grey");
		});
		
		wrapperDiv.on("mouseenter", ".ui-icon-picker-icon", (e) => {
			$(e.target)
				.css("background-image", "url(" + folderIcons[$(e.target).attr("value")].openicon + ")");
		});
		wrapperDiv.on("mouseleave", ".ui-icon-picker-icon", (e) => {
			$(e.target)
				.css("background-image", "url(" + folderIcons[$(e.target).attr("value")].closedicon + ")");
		});
	}
	
	removeFolder (folderDiv) {
		$(".context-menu.folderSettings").remove();
		
		$(this.readIncludedServerList(folderDiv)).show();
		
		BDfunctionsDevilBro.removeData(folderDiv.id, this.getName(), "folders");
		BDfunctionsDevilBro.removeData(folderDiv.id, this.getName(), "folderIDs");
		
		this.closeFolderContent(folderDiv);
		
		folderDiv.remove();
		
		this.updateFolderPositions();
	}
	
	openCloseFolder (folderDiv) {
		var data = BDfunctionsDevilBro.loadData(folderDiv.id, this.getName(), "folders");
		if (data) {
			var isOpen = folderDiv.classList.contains("open");
			if (!isOpen) {
				var includedServers = this.readIncludedServerList(folderDiv);
				
				if (includedServers.length > 0) {
					$(folderDiv)
						.addClass("open")
						.removeClass("closed");
						
					var alreadyOpen = document.querySelector(".foldercontainer");
						
					if (!alreadyOpen) {
						$(".guilds-wrapper").addClass("folderopen");
						$(`<div class="foldercontainer"></div>`).insertAfter(".guild.guilds-add");
					}
					
					for (var i = 0; i < includedServers.length; i++) {
						this.updateCopyInFolderContent(includedServers[i], folderDiv);
					}
					
					if (!alreadyOpen) {
						var guildswrapper = $(".guilds-wrapper");
						var guildsscroller = guildswrapper.find(".guilds.scroller");
						
						var ChannelSizeCorrectionCSS = `
							.foldercontainer {
								padding: ${guildsscroller.css("padding")} !important;
								margin: ${guildsscroller.css("margin")} !important;
							}`;
							
						if (guildswrapper.outerHeight() > guildswrapper.outerWidth()) {
							ChannelSizeCorrectionCSS +=	`
								.foldercontainer {
									width: ${guildswrapper.outerWidth()}px !important;
									left: ${guildswrapper.outerWidth()}px !important;
									overflow-x: hidden !important;
									overflow-y: scroll !important;
								}
								
								.guilds-wrapper.folderopen {
									width: calc(${guildswrapper.outerWidth()}px + ${$(".guild").outerWidth()}px + ${guildsscroller.css("padding-left")} + ${guildsscroller.css("padding-right")} + 5px) !important;
								}`;
						}
						else {
							ChannelSizeCorrectionCSS +=	`
								.foldercontainer .guild {
								   display: inline-block !important;
								}
								
								.foldercontainer {
									height: ${guildswrapper.outerHeight()}px !important;
									bottom: ${guildswrapper.outerHeight()}px !important;
									overflow-x: scroll !important;
									overflow-y: hidden !important;
								}
								
								.guilds-wrapper.folderopen {
									height: calc(${guildswrapper.outerHeight()}px + ${$(".guild").outerHeight()}px + ${guildsscroller.css("padding-top")} + ${guildsscroller.css("padding-bottom")} + 5px) !important;
								}`;
						}
						
						BDfunctionsDevilBro.appendLocalStyle("ChannelSizeCorrection", ChannelSizeCorrectionCSS);
					}
				}
				else return; // nothing to do when closed and empty
			}
			else {
				this.closeFolderContent(folderDiv);
			}
			
			$(folderDiv).find(".avatar-small").css("background-image", !isOpen ? "url(\"" + data.icons.openicon + "\")" : "url(\"" + data.icons.closedicon + "\")");
		}
	}
	
	updateCopyInFolderContent (serverOrig, folderDiv) {
		var foldercontainer = document.querySelector(".foldercontainer");
		if (foldercontainer && folderDiv.classList.contains("open")) {
			var info = BDfunctionsDevilBro.getKeyInformation({"node":serverOrig, "key":"guild"});
			var oldCopy = foldercontainer.querySelector("#copy_of_" + info.id);
			if (oldCopy) {
				foldercontainer.insertBefore(this.createCopyOfServer(serverOrig, folderDiv), oldCopy);
				oldCopy.remove();
			}
			else {
				var sameFolderCopies = foldercontainer.querySelectorAll(".content_of_" + folderDiv.id);
				var insertNode = sameFolderCopies.length > 0 ? sameFolderCopies[sameFolderCopies.length-1].nextSibling : null;
				foldercontainer.insertBefore(this.createCopyOfServer(serverOrig, folderDiv), insertNode);
			}
		}
	}
	
	createCopyOfServer (serverOrig, folderDiv) {
		var foldercontainer = document.querySelector(".foldercontainer");
		var info = BDfunctionsDevilBro.getKeyInformation({"node":serverOrig, "key":"guild"});
		var serverCopy = serverOrig.cloneNode(true);
		$(serverCopy)
			.attr("id", "copy_of_" + info.id)
			.addClass("copy")
			.addClass("content_of_" + folderDiv.id)
			.css("display", "")
			.on("mouseenter." + this.getName(), {"div":serverCopy,"info":info}, this.createServerToolTip.bind(this))
			.on("click." + this.getName(), (e) => {
				e.preventDefault();
				if (BDfunctionsDevilBro.pressedKeys.includes(46)) this.removeServerFromFolder(serverOrig, folderDiv);
				else serverOrig.querySelector("a").click();
			})
			.on("contextmenu." + this.getName(), (e) => {
				var handleContextMenu = BDfunctionsDevilBro.getKeyInformation({"node":serverOrig.firstElementChild, "key":"handleContextMenu"});
				if (handleContextMenu) {
					var data = {
						preventDefault: a=>a,
						stopPropagation: a=>a,
						pageX: e.pageX,
						pageY: e.pageY,
					};
					
					handleContextMenu(data);
				}
			})
			.on("mousedown." + this.getName(), (e) => {
				var mouseTimeout = null;
				var serverPreview = serverOrig.cloneNode(true);
				var hoveredCopy = null;
				var placeholder = $(`<div class="guild guild-placeholder copy copy-placeholder"></div>`)[0];
				$(serverPreview)
					.appendTo("#app-mount")
					.addClass("serverFoldersPreview")
					.offset({"left":e.clientX + 5,"top":e.clientY + 5});
				
				$(document)
					.off("mouseup." + this.getName())
					.on("mouseup." + this.getName(), (e2) => {
						clearTimeout(mouseTimeout);
						placeholder.remove();
						serverPreview.remove();
						$(serverCopy).css("display","");
						var newFolderDiv = this.getGuildParentDiv(e2.target, "folder");
						if (newFolderDiv && newFolderDiv != folderDiv) {
							this.removeServerFromFolder(serverOrig, folderDiv);
							this.addServerToFolder(serverOrig, newFolderDiv);
						}
						else {
							if (hoveredCopy) {
								foldercontainer.insertBefore(serverCopy, hoveredCopy.nextSibling);
								this.updateServerPositions(folderDiv);
							}
						}
						$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
					});
				mouseTimeout = setTimeout(() => {
					$(document)
						.off("mousemove." + this.getName())
						.on("mousemove." + this.getName(), (e2) => {
							placeholder.remove();
							$(serverCopy).hide();
							$(serverPreview)
								.show()
								.offset({"left":e2.clientX + 5,"top":e2.clientY + 5});
							if (foldercontainer.contains(e2.target)) {
								hoveredCopy = this.getGuildParentDiv(e2.target, "copy");
								if (hoveredCopy && hoveredCopy.classList.contains("content_of_" + folderDiv.id)) {
									foldercontainer.insertBefore(placeholder, hoveredCopy.nextSibling);
								}
								else hoveredCopy = null;
							}
						});
				},100);
			});
		return serverCopy;
	}
	
	closeFolderContent (folderDiv) {
		$(folderDiv)
			.removeClass("open")
			.addClass("closed");
			
		$(".content_of_" + folderDiv.id).remove();
		var foldercontainer = document.querySelector(".foldercontainer");
		if (foldercontainer && !foldercontainer.firstChild) {
			foldercontainer.remove();
			$(".guilds-wrapper").removeClass("folderopen");
			BDfunctionsDevilBro.removeLocalStyle("ChannelSizeCorrection");
		}
	}
	
	updateFolderPositions () {
		var serverAndFolders = document.querySelectorAll("div.guild-separator ~ div.guild");
		for (let i = 0; i < serverAndFolders.length; i++) {
			var folderDiv = this.getGuildParentDiv(serverAndFolders[i], "folder");
			if (folderDiv) {
				var folderID = folderDiv.id;
				var data = BDfunctionsDevilBro.loadData(folderID, this.getName(), "folders");
				if (data) {
					data.position = i;
					BDfunctionsDevilBro.saveData(folderID, data, this.getName(), "folders");
				}
			}
		}
	}	
	
	updateServerPositions (folderDiv) {
		var data = BDfunctionsDevilBro.loadData(folderDiv.id, this.getName(), "folders");
		if (data) {
			var serversInData = data.servers;
			var serversInFolder = Array.from(document.querySelectorAll(".content_of_" + folderDiv.id)).map(server => {return server.id.replace("copy_of_", "");});
			for (var i = 0; i < serversInFolder.length; i++) {
				BDfunctionsDevilBro.removeFromArray(serversInData, serversInFolder[i]);
			}
			data.servers = serversInFolder.concat(serversInData);
			BDfunctionsDevilBro.saveData(folderDiv.id, data, this.getName(), "folders");
		}
	}	
	
	updateFolderNotifications (folderDiv) {
		var includedServers = this.readIncludedServerList(folderDiv);
		
		var unreadServers = BDfunctionsDevilBro.readUnreadServerList(includedServers);
		
		var badgeAmount = 0;
		var voiceEnabled = false;
		
		$(includedServers).each(  
			(i, server) => {
				var thisBadge = parseInt($(server).find(".badge").text());
				if (thisBadge > 0) {
					badgeAmount += thisBadge;
				}
				if ($(server).hasClass("audio")) {
					voiceEnabled = true;
				}
			}
		);
		
		$(folderDiv)
			.toggleClass("unread", unreadServers.length > 0)
			.toggleClass("audio", voiceEnabled);
		$(folderDiv)
			.find(".folder.badge.notifications")
				.toggle(badgeAmount > 0)
				.text(badgeAmount);	
		$(folderDiv)
			.find(".folder.badge.count")
				.toggle(includedServers.length > 0 && this.getSettings().showCountBadge)
				.text(includedServers.length);	
	
	
		if ($(folderDiv).hasClass("open") && $(".content_of_" + folderDiv.id).length == 0) this.openCloseFolder(folderDiv);
	}
	
	clearAllReadNotifications (folderDiv) {
		$(".context-menu.folderSettings").remove();
		
		var unreadServers = BDfunctionsDevilBro.readUnreadServerList(this.readIncludedServerList(folderDiv));
		
		BDfunctionsDevilBro.clearReadNotifications(unreadServers, () => {this.updateFolderNotifications(folderDiv);});
	}
	
	getGuildParentDiv (div, type) {
		if (!div) return null;
		if (document.querySelector(".dms").contains(div)) return null;
		if (div.tagName && div.querySelector(".guilds-error")) return null;
		if (div.classList && div.classList.length > 0 && div.classList.contains(".guilds")) return null;
		if (div.classList && div.classList.length > 0 && div.classList.contains("guild") && div.classList.contains(type) && div.querySelector(".avatar-small")) return div;
		return this.getGuildParentDiv(div.parentElement, type);
	}
	
	getFolderOfServer (serverDiv) {
		var info = BDfunctionsDevilBro.getKeyInformation({"node":serverDiv, "key":"guild"});
		if (info) {
			var folders = BDfunctionsDevilBro.loadAllData(this.getName(), "folders");
			for (var id in folders) {
				var serverIDs = folders[id].servers;
				for (var i = 0; serverIDs.length > i; i++) {
					if (serverIDs[i] == info.id) return document.querySelector("#" + folders[id].folderID);
				}
			}
		}
		return null;
	}
	
	readIncludedServerList (folderDiv) {
		var data = BDfunctionsDevilBro.loadData(folderDiv.id, this.getName(), "folders");
		var includedServers = [];
		if (data) {
			var serverIDs = data.servers;
			for (var i = 0; serverIDs.length > i; i++) {
				var includedServer = BDfunctionsDevilBro.getDivOfServer(serverIDs[i]);
				if (includedServer) {
					includedServers.push(includedServer);
				}
			}
		}
		return includedServers;
	}
	
	changeImgColor (color1, color2, icon, callback) {
		color1 = BDfunctionsDevilBro.color2COMP(color1);
		color2 = BDfunctionsDevilBro.color2COMP(color2);
		if (!color1 || !color2 || !icon) return;
		var img = new Image();
		img.src = icon;
		img.onload = () => {
			if (icon.indexOf("data:image") == 0 && img.width < 200 && img.height < 200) {
				var can = document.createElement("canvas");
				can.width = img.width;
				can.height = img.height;
				var ctx = can.getContext("2d");
				ctx.drawImage(img, 0, 0);
				var imageData = ctx.getImageData(0, 0, img.width, img.height);
				var data = imageData.data;
				for (var i = 0; i < data.length; i += 4) {
					if (data[i] == 0 && data[i + 1] == 0 && data[i + 2] == 0) {
						data[i] = color1[0];
						data[i + 1] = color1[1];
						data[i + 2] = color1[2];
					}
					else if (data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255) {
						data[i] = color2[0];
						data[i + 1] = color2[1];
						data[i + 2] = color2[2];
					}
					ctx.putImageData(imageData, 0, 0);
				}
				callback(can.toDataURL("image/png"));
			}
			else {
				callback(img.src);
			}
		};
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					toast_addserver_text:					"${servername} er blevet tilføjet til mappe${foldername}.",
					toast_removeserver_text:				"${servername} er blevet fjernet fra mappen${foldername}.",
					servercontext_serverfolders_text: 		"Servermapper",
					serversubmenu_createfolder_text: 		"Opret mappe",
					serversubmenu_removefromfolder_text: 	"Fjern server fra mappe",
					foldercontext_unreadfolder_text:		"Markér alle som læst",
					foldercontext_foldersettings_text: 		"Mappeindstillinger",
					foldercontext_removefolder_text:		"Slet mappe",
					modal_header_text:						"Mappindstillinger",
					modal_foldername_text:					"Mappenavn",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarve",
					modal_tabheader3_text:					"Tooltipfarve",
					modal_iconpicker_text:					"Mappevalg",
					modal_colorpicker1_text:				"Primær mappefarve",
					modal_colorpicker2_text:				"Sekundær mappefarve",
					modal_colorpicker3_text:				"Tooltipfarve",
					modal_colorpicker4_text:				"Skriftfarve",
					btn_cancel_text:						"Afbryde",
					btn_save_text:							"Spare"
				};
			case "de": 		//german
				return {
					toast_addserver_text:					"${servername} wurde dem Ordner${foldername} hinzugefügt.",
					toast_removeserver_text:				"${servername} wurde aus dem Orderner${foldername} entfernt.",
					servercontext_serverfolders_text: 		"Serverordner",
					serversubmenu_createfolder_text: 		"Erzeuge Ordner",
					serversubmenu_removefromfolder_text: 	"Entferne Server aus Ordner",
					foldercontext_unreadfolder_text:		"Alle als gelesen markieren",
					foldercontext_foldersettings_text: 		"Ordnereinstellungen",
					foldercontext_removefolder_text:		"Lösche Ordner",
					modal_header_text:						"Ordnereinstellungen",
					modal_foldername_text:					"Ordnername",
					modal_tabheader1_text:					"Ordner",
					modal_tabheader2_text:					"Ordnerfarbe",
					modal_tabheader3_text:					"Tooltipfarbe",
					modal_iconpicker_text:					"Ordnerauswahl",
					modal_colorpicker1_text:				"Primäre Ordnerfarbe",
					modal_colorpicker2_text:				"Sekundäre Ordnerfarbe",
					modal_colorpicker3_text:				"Tooltipfarbe",
					modal_colorpicker4_text:				"Schriftfarbe",
					btn_cancel_text:						"Abbrechen",
					btn_save_text:							"Speichern"
				};
			case "es": 		//spanish
				return {
					toast_addserver_text:					"${servername} ha sido agregado a la carpeta${foldername}.",
					toast_removeserver_text:				"${servername} ha sido eliminado de la carpeta${foldername}.",
					servercontext_serverfolders_text: 		"Carpetas de servidor",
					serversubmenu_createfolder_text: 		"Crear carpeta",
					serversubmenu_removefromfolder_text: 	"Eliminar servidor de la carpeta",
					foldercontext_unreadfolder_text:		"Marcar todo como leido",
					foldercontext_foldersettings_text: 		"Ajustes de carpeta",
					foldercontext_removefolder_text:		"Eliminar carpeta",
					modal_header_text:						"Ajustes de carpeta",
					modal_foldername_text:					"Nombre de la carpeta",
					modal_tabheader1_text:					"Carpeta",
					modal_tabheader2_text:					"Color de carpeta",
					modal_tabheader3_text:					"Color de tooltip",
					modal_iconpicker_text:					"Selección de carpeta",
					modal_colorpicker1_text:				"Color primaria de carpeta",
					modal_colorpicker2_text:				"Color secundario de la carpeta",
					modal_colorpicker3_text:				"Color de tooltip",
					modal_colorpicker4_text:				"Color de fuente",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Guardar"
				};
			case "fr": 		//french
				return {
					toast_addserver_text:					"${servername} a été ajouté au dossier${foldername}.",
					toast_removeserver_text:				"${servername} a été supprimé du dossier${foldername}.",
					servercontext_serverfolders_text: 		"Dossiers du serveur",
					serversubmenu_createfolder_text: 		"Créer le dossier",
					serversubmenu_removefromfolder_text: 	"Supprimer le serveur du dossier",
					foldercontext_unreadfolder_text:		"Tout marquer comme lu",
					foldercontext_foldersettings_text: 		"Paramètres du dossier",
					foldercontext_removefolder_text:		"Supprimer le dossier",
					modal_header_text:						"Paramètres du dossier",
					modal_foldername_text:					"Nom de dossier",
					modal_tabheader1_text:					"Dossier",
					modal_tabheader2_text:					"Couleur du dossier",
					modal_tabheader3_text:					"Couleur de tooltip",
					modal_iconpicker_text:					"Choix du dossier",
					modal_colorpicker1_text:				"Couleur primaire du dossier",
					modal_colorpicker2_text:				"Couleur secondaire du dossier",
					modal_colorpicker3_text:				"Couleur de tooltip",
					modal_colorpicker4_text:				"Couleur de la police",
					btn_cancel_text:						"Abandonner",
					btn_save_text:							"Enregistrer"
				};
			case "it": 		//italian
				return {
					toast_addserver_text:					"${servername} è stato aggiunto alla cartella${foldername}.",
					toast_removeserver_text:				"${servername} è stato rimosso dalla cartella${foldername}.",
					servercontext_serverfolders_text: 		"Cartelle del server",
					serversubmenu_createfolder_text: 		"Creare una cartella",
					serversubmenu_removefromfolder_text: 	"Rimuovere il server dalla cartella",
					foldercontext_unreadfolder_text:		"Segna tutti come letti",
					foldercontext_foldersettings_text: 		"Impostazioni cartella",
					foldercontext_removefolder_text:		"Elimina cartella",
					modal_header_text:						"Impostazioni cartella",
					modal_foldername_text:					"Nome della cartella",
					modal_tabheader1_text:					"Cartella",
					modal_tabheader2_text:					"Colore della cartella",
					modal_tabheader3_text:					"Colore della tooltip",
					modal_iconpicker_text:					"Selezione della cartella",
					modal_colorpicker1_text:				"Colore primaria della cartella",
					modal_colorpicker2_text:				"Colore secondaria della cartella",
					modal_colorpicker3_text:				"Colore della tooltip",
					modal_colorpicker4_text:				"Colore del carattere",
					btn_cancel_text:						"Cancellare",
					btn_save_text:							"Salvare"
				};
			case "nl":		//dutch
				return {
					toast_addserver_text:					"${servername} is toegevoegd aan de map${foldername}.",
					toast_removeserver_text:				"${servername} is verwijderd uit de map${foldername}.",
					servercontext_serverfolders_text: 		"Servermappen",
					serversubmenu_createfolder_text: 		"Map aanmaken",
					serversubmenu_removefromfolder_text: 	"Server uit map verwijderen",
					foldercontext_unreadfolder_text:		"Alles als gelezen markeren",
					foldercontext_foldersettings_text: 		"Mapinstellingen",
					foldercontext_removefolder_text:		"Verwijder map",
					modal_header_text:						"Mapinstellingen",
					modal_foldername_text:					"Mapnaam",
					modal_tabheader1_text:					"Map",
					modal_tabheader2_text:					"Map kleur",
					modal_tabheader3_text:					"Tooltip kleur",
					modal_iconpicker_text:					"Map keuze",
					modal_colorpicker1_text:				"Primaire map kleur",
					modal_colorpicker2_text:				"Tweede map kleur",
					modal_colorpicker3_text:				"Tooltip kleur",
					modal_colorpicker4_text:				"Doopvont kleur",
					btn_cancel_text:						"Afbreken",
					btn_save_text:							"Opslaan"
				};
			case "no":		//norwegian
				return {
					toast_addserver_text:					"${servername} er lagt til i mappe${foldername}.",
					toast_removeserver_text:				"${servername} er fjernet fra mappen${foldername}.",
					servercontext_serverfolders_text: 		"Servermapper",
					serversubmenu_createfolder_text: 		"Lag mappe",
					serversubmenu_removefromfolder_text: 	"Fjern server fra mappe",
					foldercontext_unreadfolder_text:		"Marker alle som lest",
					foldercontext_foldersettings_text: 		"Mappinnstillinger",
					foldercontext_removefolder_text:		"Slett mappe",
					modal_header_text:						"Mappinnstillinger",
					modal_foldername_text:					"Mappenavn",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarge",
					modal_tabheader3_text:					"Tooltipfarge",
					modal_iconpicker_text:					"Mappevalg",
					modal_colorpicker1_text:				"Primær mappefarge",
					modal_colorpicker2_text:				"Sekundær mappefarge",
					modal_colorpicker3_text:				"Tooltipfarge",
					modal_colorpicker4_text:				"Skriftfarge",
					btn_cancel_text:						"Avbryte",
					btn_save_text:							"Lagre"
				};
			case "pl":		//polish
				return {
					toast_addserver_text:					"${servername} zostało dodane do folderu${foldername}.",
					toast_removeserver_text:				"${servername} został usunięty z folderu${foldername}.",
					servercontext_serverfolders_text: 		"Foldery serwera",
					serversubmenu_createfolder_text: 		"Utwórz folder",
					serversubmenu_removefromfolder_text: 	"Usuń serwer z folderu",
					foldercontext_unreadfolder_text:		"Oznacz wszystkie jako przeczytane",
					foldercontext_foldersettings_text: 		"Ustawienia folderu",
					foldercontext_removefolder_text:		"Usuń folder",
					modal_header_text:						"Ustawienia folderu",
					modal_foldername_text:					"Nazwa folderu",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Kolor folderu",
					modal_tabheader3_text:					"Kolor tooltip",
					modal_iconpicker_text:					"Wybór folderu",
					modal_colorpicker1_text:				"Podstawowy kolor folderu",
					modal_colorpicker2_text:				"Drugorzędny kolor folderu",
					modal_colorpicker3_text:				"Kolor tooltip",
					modal_colorpicker4_text:				"Kolor czcionki",
					btn_cancel_text:						"Anuluj",
					btn_save_text:							"Zapisz"
				};
			case "pt":		//portuguese (brazil)
				return {
					toast_addserver_text:					"${servername} foi adicionado à pasta${foldername}.",
					toast_removeserver_text:				"${servername} foi removido da pasta${foldername}.",
					servercontext_serverfolders_text: 		"Pastas de servidores",
					serversubmenu_createfolder_text: 		"Criar pasta",
					serversubmenu_removefromfolder_text: 	"Remover servidor da pasta",
					foldercontext_unreadfolder_text:		"Marcar tudo como lido",
					foldercontext_foldersettings_text: 		"Configurações da pasta",
					foldercontext_removefolder_text:		"Excluir pasta",
					modal_header_text:						"Configurações da pasta",
					modal_foldername_text:					"Nome da pasta",
					modal_tabheader1_text:					"Pasta",
					modal_tabheader2_text:					"Cor da pasta",
					modal_tabheader3_text:					"Cor da tooltip",
					modal_iconpicker_text:					"Escolha da pasta",
					modal_colorpicker1_text:				"Cor primária da pasta",
					modal_colorpicker2_text:				"Cor secundária da pasta",
					modal_colorpicker3_text:				"Cor da tooltip",
					modal_colorpicker4_text:				"Cor da fonte",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Salvar"
				};
			case "fi":		//finnish
				return {
					toast_addserver_text:					"${servername} on lisätty kansioon${foldername}.",
					toast_removeserver_text:				"${servername} on poistettu kansioon${foldername}.",
					servercontext_serverfolders_text: 		"Palvelinkansiot",
					serversubmenu_createfolder_text: 		"Luo kansio",
					serversubmenu_removefromfolder_text: 	"Poista palvelin kansioista",
					foldercontext_unreadfolder_text:		"Merkitse kaikki luetuksi",
					foldercontext_foldersettings_text: 		"Kansion kansio",
					foldercontext_removefolder_text:		"Poista kansio",
					modal_header_text:						"Kansion kansio",
					modal_foldername_text:					"Kansion nimi",
					modal_tabheader1_text:					"Kansio",
					modal_tabheader2_text:					"Kansion väri",
					modal_tabheader3_text:					"Tooltip väri",
					modal_iconpicker_text:					"Kansion valinta",
					modal_colorpicker1_text:				"Ensisijainen kansion väri",
					modal_colorpicker2_text:				"Toissijainen kansion väri",
					modal_colorpicker3_text:				"Tooltip väri",
					modal_colorpicker4_text:				"Fontin väri",
					btn_cancel_text:						"Peruuttaa",
					btn_save_text:							"Tallentaa"
				};
			case "sv":		//swedish
				return {
					toast_addserver_text:					"${servername} har lagts till i mapp${foldername}.",
					toast_removeserver_text:				"${servername} har tagits bort från mappen${foldername}.",
					servercontext_serverfolders_text: 		"Servermappar",
					serversubmenu_createfolder_text: 		"Skapa mapp",
					serversubmenu_removefromfolder_text: 	"Ta bort servern från mappen",
					foldercontext_unreadfolder_text:		"Markera allt som läst",
					foldercontext_foldersettings_text: 		"Mappinställningar",
					foldercontext_removefolder_text:		"Ta bort mapp",
					modal_header_text:						"Mappinställningar",
					modal_foldername_text:					"Mappnamn",
					modal_tabheader1_text:					"Mapp",
					modal_tabheader2_text:					"Mappfärg",
					modal_tabheader3_text:					"Tooltipfärg",
					modal_iconpicker_text:					"Mappval",
					modal_colorpicker1_text:				"Primär mappfärg",
					modal_colorpicker2_text:				"Sekundär mappfärg",
					modal_colorpicker3_text:				"Tooltipfärg",
					modal_colorpicker4_text:				"Fontfärg",
					btn_cancel_text:						"Avbryta",
					btn_save_text:							"Spara"
				};
			case "tr":		//turkish
				return {
					toast_addserver_text:					"${servername} klasörü${foldername} eklendi.",
					toast_removeserver_text:				"${servername} klasörü${foldername} kaldırıldı",
					servercontext_serverfolders_text: 		"Sunucu klasörleri",
					serversubmenu_createfolder_text: 		"Klasör oluşturun",
					serversubmenu_removefromfolder_text: 	"Sunucuyu klasörden kaldır",
					foldercontext_unreadfolder_text:		"Tümünü Oku olarak işaretle",
					foldercontext_foldersettings_text: 		"Klasör Ayarları",
					foldercontext_removefolder_text:		"Klasörü sil",
					modal_header_text:						"Klasör Ayarları",
					modal_foldername_text:					"Klasör adı",
					modal_tabheader1_text:					"Klasör",
					modal_tabheader2_text:					"Klasör rengi",
					modal_tabheader3_text:					"Tooltip rengi",
					modal_iconpicker_text:					"Klasör seçimi",
					modal_colorpicker1_text:				"Birincil klasör rengi",
					modal_colorpicker2_text:				"İkincil klasör rengi",
					modal_colorpicker3_text:				"Tooltip rengi",
					modal_colorpicker4_text:				"Yazı rengi",
					btn_cancel_text:						"Iptal",
					btn_save_text:							"Kayıt"
				};
			case "cs":		//czech
				return {
					toast_addserver_text:					"${servername} byl přidán do složky${foldername}.",
					toast_removeserver_text:				"${servername} byl odstraněn ze složky${foldername}.",
					servercontext_serverfolders_text: 		"Složky serveru",
					serversubmenu_createfolder_text: 		"Vytvořit složky",
					serversubmenu_removefromfolder_text: 	"Odstranit server ze složky",
					foldercontext_unreadfolder_text:		"Označit vše jako přečtené",
					foldercontext_foldersettings_text: 		"Nastavení složky",
					foldercontext_removefolder_text:		"Smazat složky",
					modal_header_text:						"Nastavení složky",
					modal_foldername_text:					"Název složky",
					modal_tabheader1_text:					"Složky",
					modal_tabheader2_text:					"Barva složky",
					modal_tabheader3_text:					"Barva tooltip",
					modal_iconpicker_text:					"Volba složky",
					modal_colorpicker1_text:				"Primární barva složky",
					modal_colorpicker2_text:				"Sekundární barva složky",
					modal_colorpicker3_text:				"Barva tooltip",
					modal_colorpicker4_text:				"Barva fontu",
					btn_cancel_text:						"Zrušení",
					btn_save_text:							"Uložit"
				};
			case "bg":		//bulgarian
				return {
					toast_addserver_text:					"${servername} е добавен към папката${foldername}.",
					toast_removeserver_text:				"${servername} е премахнат от папката${foldername}.",
					servercontext_serverfolders_text: 		"Сървърни папки",
					serversubmenu_createfolder_text: 		"Създай папка",
					serversubmenu_removefromfolder_text: 	"Премахване на сървър от папка",
					foldercontext_unreadfolder_text:		"Маркирай всички като прочетени",
					foldercontext_foldersettings_text: 		"Настройки папка",
					foldercontext_removefolder_text:		"Изтриване на папка",
					modal_header_text:						"Настройки папка",
					modal_foldername_text:					"Име на папка",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвят на папка",
					modal_tabheader3_text:					"Цвят на подсказка",
					modal_iconpicker_text:					"Избор на папки",
					modal_colorpicker1_text:				"Цвят основнен на папка",
					modal_colorpicker2_text:				"цвят вторичен на папка",
					modal_colorpicker3_text:				"Цвят на подсказка",
					modal_colorpicker4_text:				"Цвят на шрифта",
					btn_cancel_text:						"Зъбести",
					btn_save_text:							"Cпасяване"
				};
			case "ru":		//russian
				return {
					toast_addserver_text:					"${servername} добавлен в папку${foldername}.",
					toast_removeserver_text:				"${servername} был удален из папки${foldername}.",
					servercontext_serverfolders_text: 		"Папки сервера",
					serversubmenu_createfolder_text: 		"Создать папки",
					serversubmenu_removefromfolder_text: 	"Удаление сервера из папки",
					foldercontext_unreadfolder_text:		"Отметить все как прочитанное",
					foldercontext_foldersettings_text: 		"Настройки папки",
					foldercontext_removefolder_text:		"Удалить папки",
					modal_header_text:						"Настройки папки",
					modal_foldername_text:					"Имя папки",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвет папки",
					modal_tabheader3_text:					"Цвет подсказка",
					modal_iconpicker_text:					"Выбор папки",
					modal_colorpicker1_text:				"Цвет основной папки",
					modal_colorpicker2_text:				"Цвет вторичной папки",
					modal_colorpicker3_text:				"Цвет подсказка",
					modal_colorpicker4_text:				"Цвет шрифта",
					btn_cancel_text:						"Отмена",
					btn_save_text:							"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					toast_addserver_text:					"${servername} було додано до папки${foldername}.",
					toast_removeserver_text:				"${servername} був вилучений з папки${foldername}.",
					servercontext_serverfolders_text: 		"Папки сервера",
					serversubmenu_createfolder_text: 		"Створити папки",
					serversubmenu_removefromfolder_text: 	"Видалити сервер із папки",
					foldercontext_unreadfolder_text:		"Позначити як прочитане",
					foldercontext_foldersettings_text: 		"Параметри папки",
					foldercontext_removefolder_text:		"Видалити папки",
					modal_header_text:						"Параметри папки",
					modal_foldername_text:					"Ім'я папки",
					modal_tabheader1_text:					"Папки",
					modal_tabheader2_text:					"Колір папки",
					modal_tabheader3_text:					"Колір підказка",
					modal_iconpicker_text:					"Вибір папки",
					modal_colorpicker1_text:				"Колір основної папки",
					modal_colorpicker2_text:				"Колір вторинного папки",
					modal_colorpicker3_text:				"Колір підказка",
					modal_colorpicker4_text:				"Колір шрифту",
					btn_cancel_text:						"Скасувати",
					btn_save_text:							"Зберегти"
				};
			case "ja":		//japanese
				return {
					toast_addserver_text:					"${servername} がフォルダ${foldername} に追加されました。",
					toast_removeserver_text:				"${servername} がフォルダ${foldername} から削除されました。",
					servercontext_serverfolders_text: 		"サーバーフォルダ",
					serversubmenu_createfolder_text: 		"フォルダーを作る",
					serversubmenu_removefromfolder_text: 	"フォルダからサーバーを削除する",
					foldercontext_unreadfolder_text:		"すべてを読むようにマークする",
					foldercontext_foldersettings_text: 		"フォルダ設定",
					foldercontext_removefolder_text:		"フォルダを削除する",
					modal_header_text:						"フォルダ設定",
					modal_foldername_text:					"フォルダ名",
					modal_tabheader1_text:					"フォルダ",
					modal_tabheader2_text:					"フォルダの色",
					modal_tabheader3_text:					"ツールチップの色",
					modal_iconpicker_text:					"フォルダの選択",
					modal_colorpicker1_text:				"プライマリフォルダの色",
					modal_colorpicker2_text:				"セカンダリフォルダの色",
					modal_colorpicker3_text:				"ツールチップの色",
					modal_colorpicker4_text:				"フォントの色",
					btn_cancel_text:						"キャンセル",
					btn_save_text:							"セーブ"
				};
			case "zh":		//chinese (traditional)
				return {
					toast_addserver_text:					"${servername} 已被添加到文件夾${foldername}.",
					toast_removeserver_text:				"${servername} 已從文件夾${foldername} 中刪除.",
					servercontext_serverfolders_text: 		"服務器文件夾",
					serversubmenu_createfolder_text: 		"創建文件夾",
					serversubmenu_removefromfolder_text: 	"從服務器中刪除服務器",
					foldercontext_unreadfolder_text:		"標記為已讀",
					foldercontext_foldersettings_text: 		"文件夾設置",
					foldercontext_removefolder_text:		"刪除文件夾",
					modal_header_text:						"文件夾設置",
					modal_foldername_text:					"文件夾名稱",
					modal_tabheader1_text:					"夾",
					modal_tabheader2_text:					"文件夾顏色",
					modal_tabheader3_text:					"工具提示顏色",
					modal_iconpicker_text:					"文件夾選擇",
					modal_colorpicker1_text:				"主文件夾顏色",
					modal_colorpicker2_text:				"輔助文件夾顏色",
					modal_colorpicker3_text:				"工具提示顏色",
					modal_colorpicker4_text:				"字體顏色",
					btn_cancel_text:						"取消",
					btn_save_text:							"保存"
				};
			case "ko":		//korean
				return {
					toast_addserver_text:					"${servername} 가 폴더${foldername} 에 추가되었습니다.",
					toast_removeserver_text:				"${servername} 가 폴더${foldername} 에서 제거되었습니다.",
					servercontext_serverfolders_text: 		"서버 폴더",
					serversubmenu_createfolder_text: 		"폴더 만들기",
					serversubmenu_removefromfolder_text: 	"폴더에서 서버 제거",
					foldercontext_unreadfolder_text:		"모두 읽은 상태로 표시",
					foldercontext_foldersettings_text: 		"폴더 설정",
					foldercontext_removefolder_text:		"폴더 삭제",
					modal_header_text:						"폴더 설정",
					modal_foldername_text:					"폴더 이름",
					modal_tabheader1_text:					"폴더",
					modal_tabheader2_text:					"폴더 색",
					modal_tabheader3_text:					"툴팁 색깔",
					modal_iconpicker_text:					"폴더 선택",
					modal_colorpicker1_text:				"기본 폴더 색",
					modal_colorpicker2_text:				"보조 폴더 색",
					modal_colorpicker3_text:				"툴팁 색깔",
					modal_colorpicker4_text:				"글꼴 색깔",
					btn_cancel_text:						"취소",
					btn_save_text:							"저장"
				};
			default:		//default: english
				return {
					toast_addserver_text:					"${servername} has been added to the folder${foldername}.",
					toast_removeserver_text:				"${servername} has been removed from the folder${foldername}.",
					servercontext_serverfolders_text: 		"Serverfolders",
					serversubmenu_createfolder_text: 		"Create Folder",
					serversubmenu_removefromfolder_text: 	"Remove Server From Folder",
					foldercontext_unreadfolder_text:		"Mark All As Read",
					foldercontext_foldersettings_text: 		"Foldersettings",
					foldercontext_removefolder_text:		"Delete Folder",
					modal_header_text:						"Foldersettings",
					modal_foldername_text:					"Foldername",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Foldercolor",
					modal_tabheader3_text:					"Tooltipcolor",
					modal_iconpicker_text:					"Folderchoice",
					modal_colorpicker1_text:				"Primary Foldercolor",
					modal_colorpicker2_text:				"Secondary Foldercolor",
					modal_colorpicker3_text:				"Tooltipcolor",
					modal_colorpicker4_text:				"Fontcolor",
					btn_cancel_text:						"Cancel",
					btn_save_text:							"Save"
				};
		}
	}
}
