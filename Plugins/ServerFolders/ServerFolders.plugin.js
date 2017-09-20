//META{"name":"ServerFolders"}*//

class ServerFolders {
	constructor () {
		this.labels = {};
		
		this.serverContextObserver = new MutationObserver(() => {});
		this.serverListObserver = new MutationObserver(() => {});
		this.badgeObserver = new MutationObserver(() => {});
		this.folderContextEventHandler;
		
		this.css = `
			.serverfolders-modal .pick-wrap {
				position: relative;
				padding: 0;
				margin: 0;
			}

			.serverfolders-modal .pick-wrap .color-picker-popout {
				position: absolute;
			}

			.serverfolders-modal [class^="icons"],
			.serverfolders-modal [class^="swatches"] {
				width: 430px;
				margin: auto;
			}

			.serverfolders-modal [class^="ui-icon-picker-icon"] {
				width: 75px;
				height: 75px;
				background-size: 75px 75px;
				background-repeat: no-repeat;
				margin-bottom: 5px;
				margin-top: 5px;
				border: 4px solid transparent;
				border-radius: 12px;
			}

			.serverfolders-modal [class^="ui-color-picker-swatch"] {
				width: 22px;
				height: 22px;
				margin-bottom: 5px;
				margin-top: 5px;
				border: 4px solid transparent;
				border-radius: 12px;
			}

			.serverfolders-modal [class^="ui-color-picker-swatch"].large {
				min-width: 62px;
				height: 62px;
				border-radius: 25px;
			}

			.serverfolders-modal [class^="ui-color-picker-swatch"].nocolor {
				cursor: default;
				line-height: 22px;
				color: red;
				font-size: 28px;
				font-weight: bold;
				border: 4px solid red;
			}
			
			.serverfolders-modal .modal {
				align-content: space-around;
				align-items: center;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				height: 100%;
				justify-content: center;
				min-height: 340px;
				opacity: 0;
				padding-bottom: 60px;
				padding-top: 60px;
				pointer-events: none;
				position: absolute;
				user-select: none;
				width: 100%;
				z-index: 1000;
			}
			
			.serverfolders-modal .form {
				width: 100%;
			}

			.serverfolders-modal .form-header, .serverfolders-modal .form-actions {
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				padding: 20px;
				
			}

			.serverfolders-modal .form-header {
				color: #f6f6f7;
				cursor: default;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .3px;
				line-height: 20px;
				text-transform: uppercase;
			}

			.serverfolders-modal .form-actions {
				display: flex;
				flex-direction: row-reverse;
				flex-wrap: nowrap;
				flex: 0 0 auto;
				padding-right: 32px;
			}

			.serverfolders-modal .form-inner{
				margin: 10px 0;
				overflow-x: hidden;
				overflow-y: hidden;
				padding: 0 20px;
				height: 400px;
				
			}

			.serverfolders-modal .modal-inner {
				background-color: #36393E;
				border-radius: 5px;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
				display: flex;
				min-height: 200px;
				pointer-events: auto;
				width: 500px;
			}

			.serverfolders-modal input {
				color: #f6f6f7;
				background-color: rgba(0,0,0,.1);
				border-color: rgba(0,0,0,.3);
				padding: 10px;
				height: 40px;
				box-sizing: border-box;
				margin-bottom: 10px;
				width: 100%;
				border-width: 1px;
				border-style: solid;
				border-radius: 3px;
				outline: none;
				transition: background-color .15s ease,border .15s ease;
			}

			.serverfolders-modal .btn {
				align-items: center;
				background: none;
				border-radius: 3px;
				border: none;
				box-sizing: border-box;
				display: flex;
				font-size: 14px;
				font-weight: 500;
				justify-content: center;
				line-height: 16px;
				min-height: 38px;
				min-width: 96px;
				padding: 2px 16px;
				position: relative;
			}

			.serverfolders-modal .btn-cancel {
				background-color: #2f3136;
				color: #fff;
			}

			.serverfolders-modal .btn-save {
				background-color: #3A71C1;
				color: #fff;
			}

			.serverfolders-modal .control-group label,
			.serverfolders-modal .form-tab button {
				color: #b9bbbe;
				letter-spacing: .5px;
				text-transform: uppercase;
				flex: 1;
				cursor: default;
				font-weight: 600;
				line-height: 16px;
				font-size: 12px;
			}

			.serverfolders-modal .control-group {
				margin-top: 10px;
			}
			
			.serverfolders-modal .form-tab {
				overflow: hidden;
				background-color: #36393E;
				position: absolute;
				z-index: 20px;
			}

			.serverfolders-modal .form-tablinks {
				background-color: inherit;
				float: left;
				border: none;
				outline: none;
				cursor: pointer;
				padding: 14px 16px;
				transition: 0.3s;
				border-radius: 5px 5px 0px 0px;
			}

			.serverfolders-modal .form-tablinks:hover {
				background-color: #403F47;
			}

			.serverfolders-modal .form-tablinks.active {
				background-color: #484B51;
			}

			.serverfolders-modal .form-tabcontent {
				margin-top: 40px;
				padding: 5px 0px 20px 0px;
				background-color: #484B51;
				display: none;
				border-radius: 5px 5px 5px 5px;
				position: relative;
				z-index: 10px;
			}

			.serverfolders-modal .form-tabcontent.open {
				display: block;
			}`;

		this.serverContextEntryMarkup =
			`<div class="item-group">
				<div class="item createfolder-item">
					<span>REPLACE_servercontext_createfolder_text</span>
					<div class="hint"></div>
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
				<div class="badge folder"></div>
			</div>`;
			
		this.folderTooltipMarkup = 
			`<div class="tooltip tooltip-right tooltip-black guild-folder-tooltip"></div>`;

		this.folderSettingsModalMarkup =
			`<span class="serverfolders-modal">
				<div class="callout-backdrop" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<div class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-inner">
								<div class="control-group">
									<label class="modal-text-label" for="modal-text">REPLACE_modal_foldername_text</label>
									<input type="text" id="modal-text" name="text">
								</div>
								<div class="form-tab">
									<button class="form-tablinks active" value="tab-icon">REPLACE_modal_tabheader1_text</button>
									<button class="form-tablinks" value="tab-iconcolor">REPLACE_modal_tabheader2_text</button>
									<button class="form-tablinks" value="tab-tooltipcolor">REPLACE_modal_tabheader3_text</button>
								</div>
								<div class="form-tabcontent tab-icon open">
									<div class="control-group">
										<div class="icon-picker">
											<div class="icons">
												<label class="icon-picker-label">REPLACE_modal_iconpicker_text</label>
											</div>
										</div>
									</div>
								</div>
								<div class="form-tabcontent tab-iconcolor">
									<div class="control-group">
										<div class="color-picker1">
											<div class="swatches1">
												<label class="color-picker1-label">REPLACE_modal_colorpicker1_text</label>
											</div>
										</div>
									</div>
									<div class="control-group">
										<div class="color-picker2">
											<div class="swatches2">
												<label class="color-picker2-label">REPLACE_modal_colorpicker2_text</label>
											</div>
										</div>
									</div>
								</div>
								<div class="form-tabcontent tab-tooltipcolor">
									<div class="control-group">
										<div class="color-picker3">
											<div class="swatches3">
												<label class="color-picker3-label">REPLACE_modal_colorpicker3_text</label>
											</div>
										</div>
									</div>
									<div class="control-group">
										<div class="color-picker4">
											<div class="swatches4">
												<label class="color-picker4-label">REPLACE_modal_colorpicker4_text</label>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="form-actions">
								<button type="button" class="btn btn-cancel">REPLACE_btn_cancel_text</button>
								<button type="button" class="btn btn-save">REPLACE_btn_save_text</button>
							</div>
						</form>
					</div>
				</div>
			</span>`;

			
			
		this.colourList = 
			['rgb(26, 188, 156)','rgb(46, 204, 113)','rgb(52, 152, 219)','rgb(155, 89, 182)','rgb(233, 30, 99)','rgb(241, 196, 15)','rgb(230, 126, 34)','rgb(231, 76, 60)','rgb(149, 165, 166)','rgb(96, 125, 139)','rgb(99, 99, 99)',
			'rgb(254, 254, 254)','rgb(17, 128, 106)','rgb(31, 139, 76)','rgb(32, 102, 148)','rgb(113, 54, 138)','rgb(173, 20, 87)','rgb(194, 124, 14)','rgb(168, 67, 0)','rgb(153, 45, 34)','rgb(151, 156, 159)','rgb(84, 110, 122)','rgb(44, 44, 44)'];		
			
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

	getDescription () {return "Add pseudofolders to your serverlist to organize your servers.";}

	getVersion () {return "4.0.2";}

	getAuthor () {return "DevilBro";}
	
	
    getSettingsPanel () {
		return `<button class="ServerFoldersResetBtn" style="height:23px" onclick="ServerFolders.resetAll()">Delete all Folders`;
    }

	//legacy
	load () {}

	start () {	
		if ($('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').length == 0) {
			$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			this.serverContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			this.serverContextObserver.observe($(".tooltips").parent()[0], {childList: true});
			
			this.serverListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.className === "badge") {
									this.badgeObserver.observe(node, {characterData: true, subtree: true });
									this.updateAllFolderNotifications();
								}
								if (node.classList && node.classList.contains("guild") && !node.classList.contains("guilds-add")) {
									this.updateAllFolderNotifications();
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node.className === "badge") {
									this.updateAllFolderNotifications();
								}
								else if (node.classList && node.classList.contains("guild") && !node.classList.contains("guilds-add")) {
									$(".guild.folder").each( 
										(i, folderDiv) => {
											this.checkIfServerDivChangedTellIfDeleted(folderDiv);
										}
									);
									this.updateAllFolderNotifications();
								}
							});
						}
						if (change.type == "attributes" && change.attributeName == "class") {
							var serverData = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"guild"});
							if (serverData) {
								this.updateAllFolderNotifications();
							}
						}
					}
				);
			});
			this.serverListObserver.observe($(".guilds.scroller")[0], {childList: true, attributes: true, subtree: true});
			
			this.badgeObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						this.updateAllFolderNotifications();
					}
				);
			});
			
			$(".badge:not(.folder)").each( 
				(i, badge) => {
					this.badgeObserver.observe(badge, {characterData: true, subtree: true});
				}
			);
			
			BDfunctionsDevilBro.appendWebScript("https://bgrins.github.io/spectrum/spectrum.js");
			BDfunctionsDevilBro.appendWebStyle("https://bgrins.github.io/spectrum/spectrum.css");
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadAllFolders();
			
			this.updateAllFolderNotifications();
			
			
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			BDfunctionsDevilBro.fatalMessage(this.getName());
		}
	}

	stop () {
		this.serverContextObserver.disconnect();
		this.serverListObserver.disconnect();
		this.badgeObserver.disconnect();
		$(document).unbind('mousedown', this.folderContextEventHandler);
		
		$(".guild.folder").remove();
		
		BDfunctionsDevilBro.showHideAllEles(true, BDfunctionsDevilBro.readServerList());
		
		BDfunctionsDevilBro.removeLocalStyle(this.getName());
	}
	
	// begin of own functions
	
    static resetAll () {
		bdPluginStorage.set("ServerFolders", "folders", {});
		
		$(".guild.folder").remove();
		
		BDfunctionsDevilBro.showHideAllEles(true, BDfunctionsDevilBro.readServerList());
    }

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_servercontext_createfolder_text", this.labels.servercontext_createfolder_text);
		
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
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	onContextMenu (context) {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"guild"});
		var contextType = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"});
		
		if (serverData && contextType) {
			var { id, name } = serverData;
			var info = { id, name, };
			$(context).append(this.serverContextEntryMarkup)
				.on("click", ".createfolder-item", info, this.createNewFolder.bind(this));
		}
	}
	
	createNewFolder (e) {
		$(e.delegateTarget).hide();
		var folderID = e.data.id;
		var data = BDfunctionsDevilBro.loadData(folderID, this.getName(), "folders");
		if (!data) {
			var serverDiv = BDfunctionsDevilBro.getDivOfServer(folderID);
			if (serverDiv && $(serverDiv).prev().attr("class") != "guild folder") {
				
				var folderDiv = $(this.folderIconMarkup);
				$(folderDiv).insertBefore(serverDiv)
					.find(".avatar-small")
					.css("background-image", "url(\"" + this.folderIcons[0].openicon + "\")")
					.attr("id", "FL_ID_" + folderID)
					.attr("class", "avatar-small open")
					.on("click", this.changeIconAndServers.bind(this))
					.on("contextmenu", this.createFolderContextMenu.bind(this))
					.on("mouseenter", this.createFolderToolTip.bind(this))
					.on("mouseleave", this.deleteFolderToolTip.bind(this));
				
				var folderName = 	"";
				var isOpen = 		true;
				var iconID = 		0;
				var icons = 		this.folderIcons[0];
				var color1 = 		["0","0","0"];
				var color2 = 		["255","255","255"];
				var color3 = 		null;
				var color4 = 		null;
				
				BDfunctionsDevilBro.saveData(folderID, {folderID,folderName,isOpen,iconID,icons,color1,color2,color3,color4}, this.getName(), "folders");
				
				this.showFolderSettings($(folderDiv).find(".avatar-small")[0]);
			}
		}
	}
	
	createFolderToolTip (e) {
		var folder = e.target;
		var folderID = $(folder).attr("id").split("FL_ID_")[1];
		var data = BDfunctionsDevilBro.loadData(folderID, this.getName(), "folders");
		if (data) {
			if (data.folderName != "") {
				var folderTooltip = $(this.folderTooltipMarkup);
				$(".tooltips").append(folderTooltip);
				$(folderTooltip)
					.text(data.folderName)
					.css("left", ($(folder).offset().left + $(folder).width()) + "px")
					.css("top", ($(folder).offset().top + ($(folder).outerHeight() - $(folderTooltip).outerHeight())/2) + "px");
				
				if (data.color3) {
					var bgColor = "rgb(" + (data.color3[0]) + ", " + (data.color3[1]) + ", " + (data.color3[2]) + ")";
					$(folderTooltip)
						.css("background-color", bgColor)
						
					var customeTooltipCSS = `
							.guild-folder-tooltip:after {
								border-right-color: ` + bgColor + ` !important;
							}`;
						
					BDfunctionsDevilBro.appendLocalStyle("customeServerfolderTooltipCSS", customeTooltipCSS);
				}
				if (data.color4) {
					var fontColor = "rgb(" + (data.color4[0]) + ", " + (data.color4[1]) + ", " + (data.color4[2]) + ")";
					$(folderTooltip)
						.css("color", fontColor);
				}
			}
		}
	}
	
	deleteFolderToolTip (e) {
		$("#customeServerfolderTooltipCSS").remove();
		$(".tooltips").find(".guild-folder-tooltip").remove();
	}
	
	changeIconAndServers (e) {
		var folder = e.target;
		var folderDiv = this.getParentDivOfFolder(folder);
		
		var wasDeleted = this.checkIfServerDivChangedTellIfDeleted(folderDiv);
		
		if (!wasDeleted) {
			var id = BDfunctionsDevilBro.getIdOfServer($(folderDiv).next()[0]);
			
			if (id) {
				var data = BDfunctionsDevilBro.loadData(id, this.getName(), "folders");
				if (data) {
					var folderID = 		data.folderID;
					var folderName = 	data.folderName;
					var isOpen = 		!data.isOpen;
					var iconID = 		data.iconID;
					var icons = 		data.icons;
					var color1 = 		data.color1;
					var color2 = 		data.color2;
					var color3 = 		data.color3;
					var color4 = 		data.color4;
					
					$(folder)
						.css("background-image", isOpen ? "url(\"" + icons.openicon + "\")" : "url(\"" + icons.closedicon + "\")")
						.attr("class", isOpen ? "avatar-small open" : "avatar-small closed");
					
					var includedServers = this.readIncludedServerList(folderDiv);
					
					BDfunctionsDevilBro.showHideAllEles(isOpen, includedServers);
					
					BDfunctionsDevilBro.saveData(folderID, {folderID,folderName,isOpen,iconID,icons,color1,color2,color3,color4}, this.getName(), "folders");
				}
			}
		}
	}
	
	createFolderContextMenu (e) {
		var folder = e.target;
		var folderDiv = this.getParentDivOfFolder(folder);
		
		var includedServers = this.readIncludedServerList(folderDiv);
		
		var wasDeleted = this.checkIfServerDivChangedTellIfDeleted(folderDiv);
		
		if (!wasDeleted) {
			var folderContext = $(this.folderContextMarkup);
			$("#app-mount>:first-child").append(folderContext)
				.off("click", ".foldersettings-item")
				.off("click", ".removefolder-item")
				.on("click", ".foldersettings-item", this.showFolderSettings.bind(this,folder))
				.on("click", ".removefolder-item", this.removeFolder.bind(this,folder));
			
			if (BDfunctionsDevilBro.readUnreadServerList(includedServers).length > 0) {
				$(folderContext)
					.off("click", ".unreadfolder-item")
					.on("click", ".unreadfolder-item", this.clearAllReadNotifications.bind(this,folder));
			}
			else {
				$(folderContext).find(".unreadfolder-item").addClass("disabled");
			}
			
			var theme = BDfunctionsDevilBro.themeIsLightTheme() ? "" : "theme-dark";
			
			$(folderContext)
				.addClass(theme)
				.css("left", e.pageX + "px")
				.css("top", e.pageY + "px");
				
			this.folderContextEventHandler = (event) => {	
				if (!folderContext[0].contains(event.target)) {
					$(document).unbind('mousedown', this.folderContextEventHandler);
					$(folderContext).remove();
				}
			};
			$(document).bind('mousedown', this.folderContextEventHandler);
		}
	}
	
	showFolderSettings (folder) {
		var folderDiv = this.getParentDivOfFolder(folder);
		$(".context-menu.folderSettings").remove();
		$(document).unbind('mousedown', this.folderContextEventHandler);
		
		var id = BDfunctionsDevilBro.getIdOfServer($(folderDiv).next()[0]);
		if (id) {
			var data = BDfunctionsDevilBro.loadData(id, this.getName(), "folders");
			if (data) {
				var folderID = 		data.folderID;
				var folderName = 	data.folderName;
				var isOpen = 		data.isOpen;
				var iconID = 		data.iconID;
				var icons = 		data.icons;
				var color1 = 		data.color1;
				var color2 = 		data.color2;
				var color3 = 		data.color3;
				var color4 = 		data.color4;
				
				var folderSettingsModal = $(this.folderSettingsModalMarkup);
				folderSettingsModal.find("#modal-text")[0].value = folderName;
				this.setIcons(iconID, this.folderIcons, folderSettingsModal.find(".icons"));
				this.setSwatches(color1, this.colourList, folderSettingsModal.find(".swatches1"), "swatch1");
				this.setSwatches(color2, this.colourList, folderSettingsModal.find(".swatches2"), "swatch2");
				this.setSwatches(color3, this.colourList, folderSettingsModal.find(".swatches3"), "swatch3");
				this.setSwatches(color4, this.colourList, folderSettingsModal.find(".swatches4"), "swatch4");
				folderSettingsModal.appendTo("#app-mount")
					.on("click", ".callout-backdrop,button.btn-cancel", (e) => {
						$(".sp-container").remove();
						folderSettingsModal.remove();
					})
					.on("click", "button.form-tablinks", (e) => {
						this.changeTab(e,folderSettingsModal);
					})
					.on("click", "button.btn-save", (e) => {
						folderName = folderSettingsModal.find("#modal-text")[0].value;
						
						if (!$(".ui-color-picker-swatch1.nocolor.selected")[0]) {
							var colorRGB = $(".ui-color-picker-swatch1.selected").css("backgroundColor");
							var color = colorRGB.slice(4, -1).split(", ").map(Number);
							color = (color[0] < 30 && color[1] < 30 && color[2] < 30) ? 
									[color[0]+30, color[1]+30, color[2]+30] : 
									[color[0], color[1], color[2]];
							color = (color[0] > 225 && color[1] > 225 && color[2] > 225) ? 
									[color[0]-30, color[1]-30, color[2]-30] : 
									[color[0], color[1], color[2]];
						} 
						else {
							color = null;
						}
						
						iconID = $(".ui-icon-picker-icon.selected").attr("value");
				
						color1 = !$(".ui-color-picker-swatch1.nocolor.selected")[0] ? $(".ui-color-picker-swatch1.selected").css("backgroundColor").slice(4, -1).split(", ") : ["0","0","0"];
						color2 = !$(".ui-color-picker-swatch2.nocolor.selected")[0] ? $(".ui-color-picker-swatch2.selected").css("backgroundColor").slice(4, -1).split(", ") : ["255","255","255"];
						color3 = !$(".ui-color-picker-swatch3.nocolor.selected")[0] ? $(".ui-color-picker-swatch3.selected").css("backgroundColor").slice(4, -1).split(", ") : null;
						color4 = !$(".ui-color-picker-swatch4.nocolor.selected")[0] ? $(".ui-color-picker-swatch4.selected").css("backgroundColor").slice(4, -1).split(", ") : null;
						
						if (iconID != data.iconID || JSON.stringify(color1) != JSON.stringify(data.color1) || JSON.stringify(color2) != JSON.stringify(data.color2)) {
							var openicon = this.changeImgColor(color1, color2, this.folderIcons[iconID].openicon);
							var closedicon = this.changeImgColor(color1, color2, this.folderIcons[iconID].closedicon);
							icons = {openicon,closedicon};
						}
						
						$(folder).css("background-image", isOpen ? "url(\"" + icons.openicon + "\")" : "url(\"" + icons.closedicon + "\")");
						
						BDfunctionsDevilBro.saveData(folderID, {folderID,folderName,isOpen,iconID,icons,color1,color2,color3,color4}, this.getName(), "folders");
						
						$(".sp-container").remove();
						folderSettingsModal.remove();
					});
					
				folderSettingsModal.find("#modal-text")[0].focus();
			}
		}
	}
	
	changeTab(e,modal) {
		var tab = e.target.value;

		$(".form-tabcontent.open",modal)
			.removeClass("open");
			
		$(".form-tablinks.active",modal)
			.removeClass("active");
			
		$(".form-tabcontent." + tab ,modal)
			.addClass("open");
			
		$(e.target)
			.addClass("active");

	}

	setIcons (selection, folderIcons, wrapper) {
		var wrapperDiv = $(wrapper);
		
		var icons = 
			`<div class="ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" style="flex: 1 1 auto; margin-top: 5px;">
				<div class="regulars ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-wrap ui-icon-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">
					${ folderIcons.map((val, i) => `<div class="ui-icon-picker-icon" value="${i}" style="background-image: url(${val.closedicon});"></div>`).join("")}
				</div>
			</div>`;
		$(icons).appendTo(wrapperDiv);
		selection
		
		if (!(selection < folderIcons.length && selection > -1)) {
			selection = 0;
		}
		wrapperDiv.find(".regulars .ui-icon-picker-icon").eq(selection)
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

	setSwatches (currentCOMP, colorOptions, wrapper, swatch) {
		var wrapperDiv = $(wrapper);
			
		var defaultColors = {"swatch1":"rgb(0, 0, 0)","swatch2":"rgb(255, 255, 255)","swatch3":"rgb(0, 0, 0)","swatch4":"rgb(255, 255, 255)"};
			
		var largeDefaultBgColor = defaultColors[swatch];
		
		var swatches = 
			`<div class="ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" style="flex: 1 1 auto; margin-top: 5px;">
				<div class="ui-color-picker-${swatch} large custom" style="background-color: ${largeDefaultBgColor};"></div>
				<div class="regulars ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-wrap ui-color-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;"><div class="ui-color-picker-${swatch} nocolor">✖</div>
					${ colorOptions.map((val, i) => `<div class="ui-color-picker-${swatch}" style="background-color: ${val};"></div>`).join("")}
				</div>
			</div>`;
		$(swatches).appendTo(wrapperDiv);
		
		if (currentCOMP) {
			var currentRGB = "rgb(" + (currentCOMP[0]) + ", " + (currentCOMP[1]) + ", " + (currentCOMP[2]) + ")";
			var currentHex = '#' + (0x1000000 + (currentCOMP[2] | (currentCOMP[1] << 8) | (currentCOMP[0] << 16))).toString(16).slice(1);
			
			var invColor = "rgb(" + (255-currentCOMP[0]) + ", " + (255-currentCOMP[1]) + ", " + (255-currentCOMP[2]) + ")";
			
			var selection = colorOptions.indexOf(currentRGB);
			
			if (selection > -1) {
				wrapperDiv.find(".regulars .ui-color-picker-" + swatch).eq(selection+1)
					.addClass("selected")
					.css("border", "4px solid " + invColor);
			} 
			else {
				$(".custom", wrapperDiv)
					.addClass("selected")
					.css("background-color", currentRGB)
					.css("border", "4px solid " + invColor);
			}
		}
		else {
			$(".nocolor", wrapperDiv)
				.addClass("selected")
				.css("border", "4px solid black");
		}
		
		wrapperDiv.on("click", ".ui-color-picker-" + swatch + ":not(.custom)", (e) => {
			var tempColor = $(e.target).css("background-color").slice(4, -1).split(", ");
			var newInvColor = e.target.classList.contains("nocolor") ? "black" : "rgb(" + (255-tempColor[0]) + ", " + (255-tempColor[1]) + ", " + (255-tempColor[2]) + ")";
			
			wrapperDiv.find(".ui-color-picker-" + swatch + ".selected.nocolor")
				.removeClass("selected")
				.css("border", "4px solid red");
				
			wrapperDiv.find(".ui-color-picker-" + swatch + ".selected")
				.removeClass("selected")
				.css("border", "4px solid transparent");
			
			$(e.target)
				.addClass("selected")
				.css("border", "4px solid " + newInvColor);
		})
		var custom = $(".ui-color-picker-" + swatch + ".custom", wrapperDiv).spectrum({
			color: $(".custom", wrapperDiv).css("background-color"),
			preferredFormat: "rgb",
			clickoutFiresChange: true,
			showInput: true,
			showButtons: false,
			move: (color) => {
				var tempColor = color.toRgbString().slice(4, -1).split(", ");
				var newInvColor = "rgb(" + (255-tempColor[0]) + ", " + (255-tempColor[1]) + ", " + (255-tempColor[2]) + ")";
				
				$(".ui-color-picker-" + swatch + ".selected.nocolor")
					.removeClass("selected")
					.css("border", "4px solid red");
					
				$(".ui-color-picker-" + swatch + ".selected")
					.removeClass("selected")
					.css("border", "4px solid transparent");
				
				custom
					.addClass("selected")
					.css("background-color", color.toRgbString())
					.css("border", "4px solid " + newInvColor);
			}
		});
	}
	
	removeFolder (folder) {
		$(".context-menu.folderSettings").remove();
		$(document).unbind('mousedown', this.folderContextEventHandler);
		
		var folderDiv = this.getParentDivOfFolder(folder);
		var includedServers = this.readIncludedServerList(folderDiv);
		BDfunctionsDevilBro.showHideAllEles(true, includedServers);
		
		var folderID = $(folder).attr("id").split("FL_ID_")[1];
		
		BDfunctionsDevilBro.removeData(folderID, this.getName(), "folders");
		
		folderDiv.remove();
	}
	
	loadFolder (data) {
		var folderID = 		data.folderID;
		var folderName = 	data.folderName;
		var isOpen = 		data.isOpen;
		var iconID = 		data.iconID;
		var icons = 		data.icons;
		var color1 = 		data.color1;
		var color2 = 		data.color2;
		var color3 = 		data.color3;
		var color4 = 		data.color4;
		
		var serverDiv = BDfunctionsDevilBro.getDivOfServer(folderID);
		
		var folderDiv = $(this.folderIconMarkup);				
		$(folderDiv).insertBefore(serverDiv)
			.find(".avatar-small")
			.css("background-image", isOpen ? "url(\"" + icons.openicon + "\")" : "url(\"" + icons.closedicon + "\")")
			.attr("name", folderName)
			.attr("id", "FL_ID_" + folderID)
			.attr("class", isOpen ? "avatar-small open" : "avatar-small closed")
			.on("click", this.changeIconAndServers.bind(this))
			.on("contextmenu", this.createFolderContextMenu.bind(this))
			.on("mouseenter", this.createFolderToolTip.bind(this))
			.on("mouseleave", this.deleteFolderToolTip.bind(this));
		
		var includedServers = this.readIncludedServerList(folderDiv);
		
		// seems like the icons are loaded too slowly, didn't get hidden without a little delay
		setTimeout(() => {
			BDfunctionsDevilBro.showHideAllEles(isOpen, includedServers);
		},1000);
	}
	
	loadAllFolders () {
		var servers = BDfunctionsDevilBro.readServerList();
		
		for (var i = 0; i < servers.length; i++) {
			var id = BDfunctionsDevilBro.getIdOfServer(servers[i]);
			if (id) {
				var data = BDfunctionsDevilBro.loadData(id, this.getName(), "folders");
				if (data) {
					this.loadFolder(data);
				}
			}
		}
	}
	
	updateFolderNotifications (folderDiv) {
		var includedServers = this.readIncludedServerList(folderDiv);
		
		var unreadServers = BDfunctionsDevilBro.readUnreadServerList(includedServers);
		
		if (unreadServers.length > 0) {
			$(folderDiv).addClass("unread");
		}
		else {
			$(folderDiv).removeClass("unread");
		}
		
		var badgeAmount = 0;
		$(includedServers).each(  
			(i, server) => {
				var thisBadge = parseInt($(server).find(".badge").text());
				if (thisBadge > 0) {
					badgeAmount += thisBadge;
				}
			}
		);
		if (badgeAmount > 0) {
			$(folderDiv).find(".folder.badge").show();
			$(folderDiv).find(".folder.badge").text(badgeAmount);
		}
		else {
			$(folderDiv).find(".folder.badge").hide();
		}
	}
	
	updateAllFolderNotifications () {
		var folders = $(".guild.folder");
		for (var i = 0; folders.length > i; i++) {
			this.updateFolderNotifications(folders[i]);
		}
	}
	
	clearAllReadNotifications (folder) {
		var folderDiv = this.getParentDivOfFolder(folder);
		
		$(".context-menu.folderSettings").remove();
		$(document).unbind('mousedown', this.folderContextEventHandler);
		
		var unreadServers = BDfunctionsDevilBro.readUnreadServerList(this.readIncludedServerList(folderDiv));
		
		BDfunctionsDevilBro.clearReadNotifications(unreadServers);
	}
	
	checkIfServerDivChangedTellIfDeleted (folderDiv) {
		var folder = $(folderDiv).find(".avatar-small")[0];
		var oldFolderID = $(folder).attr("id").split("FL_ID_")[1];
		var newFolderID = BDfunctionsDevilBro.getIdOfServer($(folderDiv).next()[0]);
		
		if (newFolderID) {
			if (newFolderID != oldFolderID) {
				var data = BDfunctionsDevilBro.loadData(oldFolderID, this.getName(), "folders");
				if (data) {
					$(folder).attr("id","FL_ID_" + newFolderID);
					
					var folderID = 		newFolderID;
					var folderName = 	data.folderName;
					var isOpen = 		data.isOpen;
					var iconID = 		data.iconID;
					var icons = 		data.icons;
					var color1 = 		data.color1;
					var color2 = 		data.color2;
					var color3 = 		data.color3;
					var color4 = 		data.color4;
					
					BDfunctionsDevilBro.saveData(folderID, {folderID,folderName,isOpen,iconID,icons,color1,color2,color3,color4}, this.getName(), "folders");
					BDfunctionsDevilBro.removeData(oldFolderID, this.getName(), "folders");
				}
			}
			return false;
		}
		else {
			this.removeFolder(folder);
			
			return true;
		}
	}
	
	getParentDivOfFolder (div) {
		var folders = $(".guild.folder");
		var foundFolder;
		for (var i = 0; folders.length > i; i++) {
			if (folders[i].contains(div)) {
				foundFolder = folders[i];
				break;
			}
		}
		return foundFolder;
	}
	
	readIncludedServerList (folderDiv) {
		var servers = $(folderDiv).nextAll();
		var includedServers = [];
		for (var i = 0; servers.length > i; i++) {
			var serverData = BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"});
			if (serverData) {
				includedServers.push(servers[i]);
			}
			else {
				break;
			}
		}
		return includedServers;
	}
	
	changeImgColor (color1, color2, icon) {
		var img = new Image();
		img.src = icon;
		var can = document.createElement('canvas');
		can.width = img.width;
		can.height = img.height;
		var ctx = can.getContext('2d');
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
			// overwrite original image
			ctx.putImageData(imageData, 0, 0);
		}
		return can.toDataURL("image/png");
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					servercontext_createfolder_text: 	"Opret mappe",
					foldercontext_unreadfolder_text:	"Markér alle som læst",
					foldercontext_foldersettings_text: 	"Mappeindstillinger",
					foldercontext_removefolder_text:	"Slet mappe",
					modal_header_text:					"Mappindstillinger",
					modal_foldername_text:				"Mappenavn",
					modal_tabheader1_text:				"Mappe",
					modal_tabheader2_text:				"Mappefarve",
					modal_tabheader3_text:				"Tooltipfarve",
					modal_iconpicker_text:				"Mappevalg",
					modal_colorpicker1_text:			"Primær mappefarve",
					modal_colorpicker2_text:			"Sekundær mappefarve",
					modal_colorpicker3_text:			"Tooltipfarve",
					modal_colorpicker4_text:			"Skriftfarve",
					btn_cancel_text:					"Afbryde",
					btn_save_text:						"Spare"
				};
			case "de": 		//german
				return {
					servercontext_createfolder_text: 	"Erzeuge Ordner",
					foldercontext_unreadfolder_text:	"Alle als gelesen markieren",
					foldercontext_foldersettings_text: 	"Ordnereinstellungen",
					foldercontext_removefolder_text:	"Lösche Ordner",
					modal_header_text:					"Ordnereinstellungen",
					modal_foldername_text:				"Ordnername",
					modal_tabheader1_text:				"Ordner",
					modal_tabheader2_text:				"Ordnerfarbe",
					modal_tabheader3_text:				"Tooltipfarbe",
					modal_iconpicker_text:				"Ordnerauswahl",
					modal_colorpicker1_text:			"Primäre Ordnerfarbe",
					modal_colorpicker2_text:			"Sekundäre Ordnerfarbe",
					modal_colorpicker3_text:			"Tooltipfarbe",
					modal_colorpicker4_text:			"Schriftfarbe",
					btn_cancel_text:					"Abbrechen",
					btn_save_text:						"Speichern"
				};
			case "es": 		//spanish
				return {
					servercontext_createfolder_text: 	"Crear carpeta",
					foldercontext_unreadfolder_text:	"Marcar todo como leido",
					foldercontext_foldersettings_text: 	"Ajustes de carpeta",
					foldercontext_removefolder_text:	"Eliminar carpeta",
					modal_header_text:					"Ajustes de carpeta",
					modal_foldername_text:				"Nombre de la carpeta",
					modal_tabheader1_text:				"Carpeta",
					modal_tabheader2_text:				"Color de carpeta",
					modal_tabheader3_text:				"Color de tooltip",
					modal_iconpicker_text:				"Selección de carpeta",
					modal_colorpicker1_text:			"Color primaria de carpeta",
					modal_colorpicker2_text:			"Color secundario de la carpeta",
					modal_colorpicker3_text:			"Color de tooltip",
					modal_colorpicker4_text:			"Color de fuente",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Guardar"
				};
			case "fr": 		//french
				return {
					servercontext_createfolder_text: 	"Créer le dossier",
					foldercontext_unreadfolder_text:	"Tout marquer comme lu",
					foldercontext_foldersettings_text: 	"Paramètres du dossier",
					foldercontext_removefolder_text:	"Supprimer le dossier",
					modal_header_text:					"Paramètres du dossier",
					modal_foldername_text:				"Nom de dossier",
					modal_tabheader1_text:				"Dossier",
					modal_tabheader2_text:				"Couleur du dossier",
					modal_tabheader3_text:				"Couleur de tooltip",
					modal_iconpicker_text:				"Choix du dossier",
					modal_colorpicker1_text:			"Couleur primaire du dossier",
					modal_colorpicker2_text:			"Couleur secondaire du dossier",
					modal_colorpicker3_text:			"Couleur de tooltip",
					modal_colorpicker4_text:			"Couleur de la police",
					btn_cancel_text:					"Abandonner",
					btn_save_text:						"Enregistrer"
				};
			case "it": 		//italian
				return {
					servercontext_createfolder_text: 	"Creare una cartella",
					foldercontext_unreadfolder_text:	"Segna tutti come letti",
					foldercontext_foldersettings_text: 	"Impostazioni cartella",
					foldercontext_removefolder_text:	"Elimina cartella",
					modal_header_text:					"Impostazioni cartella",
					modal_foldername_text:				"Nome della cartella",
					modal_tabheader1_text:				"Cartella",
					modal_tabheader2_text:				"Colore della cartella",
					modal_tabheader3_text:				"Colore della tooltip",
					modal_iconpicker_text:				"Selezione della cartella",
					modal_colorpicker1_text:			"Colore primaria della cartella",
					modal_colorpicker2_text:			"Colore secondaria della cartella",
					modal_colorpicker3_text:			"Colore della tooltip",
					modal_colorpicker4_text:			"Colore del carattere",
					btn_cancel_text:					"Cancellare",
					btn_save_text:						"Salvare"
				};
			case "nl":		//dutch
				return {
					servercontext_createfolder_text: 	"Map aanmaken",
					foldercontext_unreadfolder_text:	"Alles als gelezen markeren",
					foldercontext_foldersettings_text: 	"Mapinstellingen",
					foldercontext_removefolder_text:	"Verwijder map",
					modal_header_text:					"Mapinstellingen",
					modal_foldername_text:				"Mapnaam",
					modal_tabheader1_text:				"Map",
					modal_tabheader2_text:				"Map kleur",
					modal_tabheader3_text:				"Tooltip kleur",
					modal_iconpicker_text:				"Map keuze",
					modal_colorpicker1_text:			"Primaire map kleur",
					modal_colorpicker2_text:			"Tweede map kleur",
					modal_colorpicker3_text:			"Tooltip kleur",
					modal_colorpicker4_text:			"Doopvont kleur",
					btn_cancel_text:					"Afbreken",
					btn_save_text:						"Opslaan"
				};
			case "no":		//norwegian
				return {
					servercontext_createfolder_text: 	"Lag mappe",
					foldercontext_unreadfolder_text:	"Marker alle som lest",
					foldercontext_foldersettings_text: 	"Mappinnstillinger",
					foldercontext_removefolder_text:	"Slett mappe",
					modal_header_text:					"Mappinnstillinger",
					modal_foldername_text:				"Mappenavn",
					modal_tabheader1_text:				"Mappe",
					modal_tabheader2_text:				"Mappefarge",
					modal_tabheader3_text:				"Tooltipfarge",
					modal_iconpicker_text:				"Mappevalg",
					modal_colorpicker1_text:			"Primær mappefarge",
					modal_colorpicker2_text:			"Sekundær mappefarge",
					modal_colorpicker3_text:			"Tooltipfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					btn_cancel_text:					"Avbryte",
					btn_save_text:						"Lagre"
				};
			case "pl":		//polish
				return {
					servercontext_createfolder_text: 	"Utwórz folder",
					foldercontext_unreadfolder_text:	"Oznacz wszystkie jako przeczytane",
					foldercontext_foldersettings_text: 	"Ustawienia folderu",
					foldercontext_removefolder_text:	"Usuń folder",
					modal_header_text:					"Ustawienia folderu",
					modal_foldername_text:				"Nazwa folderu",
					modal_tabheader1_text:				"Folder",
					modal_tabheader2_text:				"Kolor folderu",
					modal_tabheader3_text:				"Kolor tooltip",
					modal_iconpicker_text:				"Wybór folderu",
					modal_colorpicker1_text:			"Podstawowy kolor folderu",
					modal_colorpicker2_text:			"Drugorzędny kolor folderu",
					modal_colorpicker3_text:			"Kolor tooltip",
					modal_colorpicker4_text:			"Kolor czcionki",
					btn_cancel_text:					"Anuluj",
					btn_save_text:						"Zapisz"
				};
			case "pt":		//portuguese (brazil)
				return {
					servercontext_createfolder_text: 	"Criar pasta",
					foldercontext_unreadfolder_text:	"Marcar tudo como lido",
					foldercontext_foldersettings_text: 	"Configurações da pasta",
					foldercontext_removefolder_text:	"Excluir pasta",
					modal_header_text:					"Configurações da pasta",
					modal_foldername_text:				"Nome da pasta",
					modal_tabheader1_text:				"Pasta",
					modal_tabheader2_text:				"Cor da pasta",
					modal_tabheader3_text:				"Cor da tooltip",
					modal_iconpicker_text:				"Escolha da pasta",
					modal_colorpicker1_text:			"Cor primária da pasta",
					modal_colorpicker2_text:			"Cor secundária da pasta",
					modal_colorpicker3_text:			"Cor da tooltip",
					modal_colorpicker4_text:			"Cor da fonte",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Salvar"
				};
			case "fi":		//finnish
				return {
					servercontext_createfolder_text: 	"Luo kansio",
					foldercontext_unreadfolder_text:	"Merkitse kaikki luetuksi",
					foldercontext_foldersettings_text: 	"Kansion kansio",
					foldercontext_removefolder_text:	"Poista kansio",
					modal_header_text:					"Kansion kansio",
					modal_foldername_text:				"Kansion nimi",
					modal_tabheader1_text:				"Kansio",
					modal_tabheader2_text:				"Kansion väri",
					modal_tabheader3_text:				"Tooltip väri",
					modal_iconpicker_text:				"Kansion valinta",
					modal_colorpicker1_text:			"Ensisijainen kansion väri",
					modal_colorpicker2_text:			"Toissijainen kansion väri",
					modal_colorpicker3_text:			"Tooltip väri",
					modal_colorpicker4_text:			"Fontin väri",
					btn_cancel_text:					"Peruuttaa",
					btn_save_text:						"Tallentaa"
				};
			case "sv":		//swedish
				return {
					servercontext_createfolder_text: 	"Skapa mapp",
					foldercontext_unreadfolder_text:	"Markera allt som läst",
					foldercontext_foldersettings_text: 	"Mappinställningar",
					foldercontext_removefolder_text:	"Ta bort mapp",
					modal_header_text:					"Mappinställningar",
					modal_foldername_text:				"Mappnamn",
					modal_tabheader1_text:				"Mapp",
					modal_tabheader2_text:				"Mappfärg",
					modal_tabheader3_text:				"Tooltipfärg",
					modal_iconpicker_text:				"Mappval",
					modal_colorpicker1_text:			"Primär mappfärg",
					modal_colorpicker2_text:			"Sekundär mappfärg",
					modal_colorpicker3_text:			"Tooltipfärg",
					modal_colorpicker4_text:			"Fontfärg",
					btn_cancel_text:					"Avbryta",
					btn_save_text:						"Spara"
				};
			case "tr":		//turkish
				return {
					servercontext_createfolder_text: 	"Klasör oluşturun",
					foldercontext_unreadfolder_text:	"Tümünü Oku olarak işaretle",
					foldercontext_foldersettings_text: 	"Klasör Ayarları",
					foldercontext_removefolder_text:	"Klasörü sil",
					modal_header_text:					"Klasör Ayarları",
					modal_foldername_text:				"Klasör adı",
					modal_tabheader1_text:				"Klasör",
					modal_tabheader2_text:				"Klasör rengi",
					modal_tabheader3_text:				"Tooltip rengi",
					modal_iconpicker_text:				"Klasör seçimi",
					modal_colorpicker1_text:			"Birincil klasör rengi",
					modal_colorpicker2_text:			"İkincil klasör rengi",
					modal_colorpicker3_text:			"Tooltip rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					btn_cancel_text:					"Iptal",
					btn_save_text:						"Kayıt"
				};
			case "cs":		//czech
				return {
					servercontext_createfolder_text: 	"Vytvořit složky",
					foldercontext_unreadfolder_text:	"Označit vše jako přečtené",
					foldercontext_foldersettings_text: 	"Nastavení složky",
					foldercontext_removefolder_text:	"Smazat složky",
					modal_header_text:					"Nastavení složky",
					modal_foldername_text:				"Název složky",
					modal_tabheader1_text:				"Složky",
					modal_tabheader2_text:				"Barva složky",
					modal_tabheader3_text:				"Barva tooltip",
					modal_iconpicker_text:				"Volba složky",
					modal_colorpicker1_text:			"Primární barva složky",
					modal_colorpicker2_text:			"Sekundární barva složky",
					modal_colorpicker3_text:			"Barva tooltip",
					modal_colorpicker4_text:			"Barva fontu",
					btn_cancel_text:					"Zrušení",
					btn_save_text:						"Uložit"
				};
			case "bg":		//bulgarian
				return {
					servercontext_createfolder_text: 	"Създай папка",
					foldercontext_unreadfolder_text:	"Маркирай всички като прочетени",
					foldercontext_foldersettings_text: 	"Настройки папка",
					foldercontext_removefolder_text:	"Изтриване на папка",
					modal_header_text:					"Настройки папка",
					modal_foldername_text:				"Име на папка",
					modal_tabheader1_text:				"Папка",
					modal_tabheader2_text:				"Цвят на папка",
					modal_tabheader3_text:				"Цвят на подсказка",
					modal_iconpicker_text:				"Избор на папки",
					modal_colorpicker1_text:			"Цвят основнен на папка",
					modal_colorpicker2_text:			"цвят вторичен на папка",
					modal_colorpicker3_text:			"Цвят на подсказка",
					modal_colorpicker4_text:			"Цвят на шрифта",
					btn_cancel_text:					"Зъбести",
					btn_save_text:						"Cпасяване"
				};
			case "ru":		//russian
				return {
					servercontext_createfolder_text: 	"Создать папки",
					foldercontext_unreadfolder_text:	"Отметить все как прочитанное",
					foldercontext_foldersettings_text: 	"Настройки папки",
					foldercontext_removefolder_text:	"Удалить папки",
					modal_header_text:					"Настройки папки",
					modal_foldername_text:				"Имя папки",
					modal_tabheader1_text:				"Папка",
					modal_tabheader2_text:				"Цвет папки",
					modal_tabheader3_text:				"Цвет подсказка",
					modal_iconpicker_text:				"Выбор папки",
					modal_colorpicker1_text:			"Цвет основной папки",
					modal_colorpicker2_text:			"Цвет вторичной папки",
					modal_colorpicker3_text:			"Цвет подсказка",
					modal_colorpicker4_text:			"Цвет шрифта",
					btn_cancel_text:					"Отмена",
					btn_save_text:						"Cпасти"
				};
			case "uk":		//ukranian
				return {
					servercontext_createfolder_text: 	"Створити папки",
					foldercontext_unreadfolder_text:	"Позначити як прочитане",
					foldercontext_foldersettings_text: 	"Параметри папки",
					foldercontext_removefolder_text:	"Видалити папки",
					modal_header_text:					"Параметри папки",
					modal_foldername_text:				"Ім'я папки",
					modal_tabheader1_text:				"Папки",
					modal_tabheader2_text:				"Колір папки",
					modal_tabheader3_text:				"Колір підказка",
					modal_iconpicker_text:				"Вибір папки",
					modal_colorpicker1_text:			"Колір основної папки",
					modal_colorpicker2_text:			"Колір вторинного папки",
					modal_colorpicker3_text:			"Колір підказка",
					modal_colorpicker4_text:			"Колір шрифту",
					btn_cancel_text:					"Скасувати",
					btn_save_text:						"Зберегти"
				};
			case "ja":		//japanese
				return {
					servercontext_createfolder_text: 	"フォルダーを作る",
					foldercontext_unreadfolder_text:	"すべてを読むようにマークする",
					foldercontext_foldersettings_text: 	"フォルダ設定",
					foldercontext_removefolder_text:	"フォルダを削除する",
					modal_header_text:					"フォルダ設定",
					modal_foldername_text:				"フォルダ名",
					modal_tabheader1_text:				"フォルダ",
					modal_tabheader2_text:				"フォルダの色",
					modal_tabheader3_text:				"ツールチップの色",
					modal_iconpicker_text:				"フォルダの選択",
					modal_colorpicker1_text:			"プライマリフォルダの色",
					modal_colorpicker2_text:			"セカンダリフォルダの色",
					modal_colorpicker3_text:			"ツールチップの色",
					modal_colorpicker4_text:			"フォントの色",
					btn_cancel_text:					"キャンセル",
					btn_save_text:						"セーブ"
				};
			case "zh":		//chinese (traditional)
				return {
					servercontext_createfolder_text: 	"創建文件夾",
					foldercontext_unreadfolder_text:	"標記為已讀",
					foldercontext_foldersettings_text: 	"文件夾設置",
					foldercontext_removefolder_text:	"刪除文件夾",
					modal_header_text:					"文件夾設置",
					modal_foldername_text:				"文件夾名稱",
					modal_tabheader1_text:				"夾",
					modal_tabheader2_text:				"文件夾顏色",
					modal_tabheader3_text:				"工具提示顏色",
					modal_iconpicker_text:				"文件夾選擇",
					modal_colorpicker1_text:			"主文件夾顏色",
					modal_colorpicker2_text:			"輔助文件夾顏色",
					modal_colorpicker3_text:			"工具提示顏色",
					modal_colorpicker4_text:			"字體顏色",
					btn_cancel_text:					"取消",
					btn_save_text:						"保存"
				};
			case "ko":		//korean
				return {
					servercontext_createfolder_text: 	"폴더 만들기",
					foldercontext_unreadfolder_text:	"모두 읽은 상태로 표시",
					foldercontext_foldersettings_text: 	"폴더 설정",
					foldercontext_removefolder_text:	"폴더 삭제",
					modal_header_text:					"폴더 설정",
					modal_foldername_text:				"폴더 이름",
					modal_tabheader1_text:				"폴더",
					modal_tabheader2_text:				"폴더 색",
					modal_tabheader3_text:				"툴팁 색상",
					modal_iconpicker_text:				"폴더 선택",
					modal_colorpicker1_text:			"기본 폴더 색",
					modal_colorpicker2_text:			"보조 폴더 색",
					modal_colorpicker3_text:			"툴팁 색상",
					modal_colorpicker4_text:			"글꼴 색상",
					btn_cancel_text:					"취소",
					btn_save_text:						"저장"
				};
			default:		//default: english
				return {
					servercontext_createfolder_text: 	"Create Folder",
					foldercontext_unreadfolder_text:	"Mark All As Read",
					foldercontext_foldersettings_text: 	"Foldersettings",
					foldercontext_removefolder_text:	"Delete Folder",
					modal_header_text:					"Foldersettings",
					modal_foldername_text:				"Foldername",
					modal_tabheader1_text:				"Folder",
					modal_tabheader2_text:				"Foldercolor",
					modal_tabheader3_text:				"Tooltipcolor",
					modal_iconpicker_text:				"Folderchoice",
					modal_colorpicker1_text:			"Primary Foldercolor",
					modal_colorpicker2_text:			"Secondary Foldercolor",
					modal_colorpicker3_text:			"Tooltipcolor",
					modal_colorpicker4_text:			"Fontcolor",
					btn_cancel_text:					"Cancel",
					btn_save_text:						"Save"
				};
		}
	}
}
