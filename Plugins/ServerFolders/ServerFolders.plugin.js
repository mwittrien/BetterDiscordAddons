//META{"name":"ServerFolders"}*//

class ServerFolders {
	constructor () {
		this.labels = {};
		
		this.serverContextObserver = new MutationObserver(() => {});
		this.serverListObserver = new MutationObserver(() => {});
		this.badgeObserver = new MutationObserver(() => {});
		this.folderContextEventHandler;
		
		this.css = `
			@keyframes animation-serverfolders-backdrop {
				to { opacity: 0.85; }
			}

			@keyframes animation-serverfolders-backdrop-closing {
				to { opacity: 0; }
			}

			@keyframes animation-serverfolders-modal {
				to { transform: scale(1); opacity: 1; }
			}

			@keyframes animation-serverfolders-modal-closing {
				to { transform: scale(0.7); opacity: 0; }
			}

			.serverfolders-modal .callout-backdrop {
				animation: animation-serverfolders-backdrop 250ms ease;
				animation-fill-mode: forwards;
				opacity: 0;
				background-color: rgb(0, 0, 0);
				transform: translateZ(0px);
			}

			.serverfolders-modal.closing .callout-backdrop {
				animation: animation-serverfolders-backdrop-closing 200ms linear;
				animation-fill-mode: forwards;
				animation-delay: 50ms;
				opacity: 0.85;
			}
			
			.serverfolders-modal .modal {
				animation: animation-serverfolders-modal 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
				animation-fill-mode: forwards;
				transform: scale(0.7);
				transform-origin: 50% 50%;
				align-content: space-around;
				align-items: center;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-height: initial;
				max-height: initial;
				opacity: 0;
				pointer-events: none;
				user-select: none;
				height: 100%;
				width: 100%;
				margin: 0;
				padding: 0;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				z-index: 1000;
			}

			.serverfolders-modal.closing .modal {
				animation: animation-serverfolders-modal-closing 250ms cubic-bezier(0.19, 1, 0.22, 1);
				animation-fill-mode: forwards;
				opacity: 1;
				transform: scale(1);
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

			.serverfolders-modal .icons {
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
				<div class="backdrop-2ohBEd callout-backdrop"></div>
				<div class="modal">
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
										<div class="modal-icon-picker">
											<div class="icons">
												<label class="icon-picker-label">REPLACE_modal_iconpicker_text</label>
											</div>
										</div>
									</div>
								</div>
								<div class="form-tabcontent tab-iconcolor">
									<div class="control-group">
										<div class="modal-color-picker">
											<div class="swatches1">
												<label class="color-picker1-label">REPLACE_modal_colorpicker1_text</label>
											</div>
										</div>
									</div>
									<div class="control-group">
										<div class="modal-color-picker">
											<div class="swatches2">
												<label class="color-picker2-label">REPLACE_modal_colorpicker2_text</label>
											</div>
										</div>
									</div>
								</div>
								<div class="form-tabcontent tab-tooltipcolor">
									<div class="control-group">
										<div class="modal-color-picker">
											<div class="swatches3">
												<label class="color-picker3-label">REPLACE_modal_colorpicker3_text</label>
											</div>
										</div>
									</div>
									<div class="control-group">
										<div class="modal-color-picker">
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

	getVersion () {return "4.4.2";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `<button class="` + this.getName() + `ResetBtn" style="height:23px" onclick='` + this.getName() + `.resetAll("` + this.getName() + `")'>Delete all Folders`;
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
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.className === "badge") {
									this.badgeObserver.observe(node, {characterData: true, subtree: true });
									this.updateAllFolderNotifications();
								}
								else if (node && node.classList && node.classList.contains("guild") && !node.classList.contains("guilds-add") && !node.querySelector(".guilds-error")) {
									this.updateAllFolderNotifications();
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.className === "badge") {
									this.updateAllFolderNotifications();
								}
								else if (node && node.classList && node.classList.contains("guild") && !node.classList.contains("guilds-add") && !node.querySelector(".guilds-error")) {
									$(".guild.folder").each( 
										(i, folderDiv) => {
											this.checkIfServerDivChanged(folderDiv);
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
			if (document.querySelector(".guilds.scroller")) this.serverListObserver.observe(document.querySelector(".guilds.scroller"), {childList: true, attributes: true, subtree: true});
			
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
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadAllFolders();
			
			this.updateAllFolderNotifications();
			
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
			this.badgeObserver.disconnect();
			$(document).unbind('mousedown', this.folderContextEventHandler);
			
			$(".guild.folder").remove();
			
			BDfunctionsDevilBro.showHideAllEles(true, BDfunctionsDevilBro.readServerList());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	// begin of own functions
	
    static resetAll (pluginName) {
		if (confirm("Are you sure you want to delete all folders?")) {
			BDfunctionsDevilBro.removeAllData(pluginName, "folders");
			
			$(".guild.folder").remove();
			
			BDfunctionsDevilBro.showHideAllEles(true, BDfunctionsDevilBro.readServerList());
		}
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
		
		if (serverData && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"})) {
			$(context).append(this.serverContextEntryMarkup)
				.on("click", ".createfolder-item", serverData, this.createNewFolder.bind(this));
		}
	}
	
	createNewFolder (e) {
		$(e.delegateTarget).hide();
		var folderID = e.data.id;
		var data = BDfunctionsDevilBro.loadData(folderID, this.getName(), "folders");
		if (!data) {
			var serverDiv = BDfunctionsDevilBro.getDivOfServer(folderID);
			if (serverDiv && !$(serverDiv).prev().hasClass("folder")) {
				
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
			if (data.folderName) {
				var folderTooltip = $(this.folderTooltipMarkup);
				$(".tooltips").append(folderTooltip);
				$(folderTooltip)
					.text(data.folderName)
					.css("left", ($(folder).offset().left + $(folder).width()) + "px")
					.css("top", ($(folder).offset().top + ($(folder).outerHeight() - $(folderTooltip).outerHeight())/2) + "px");
				
				if (data.color3) {
					var bgColor = BDfunctionsDevilBro.color2RGB(data.color3);
					$(folderTooltip)
						.css("background-color", bgColor)
						
					var customeTooltipCSS = `
						.guild-folder-tooltip:after {
							border-right-color: ` + bgColor + ` !important;
						}`;
						
					BDfunctionsDevilBro.appendLocalStyle("customeServerfolderTooltipCSS", customeTooltipCSS);
				}
				if (data.color4) {
					var fontColor = BDfunctionsDevilBro.color2RGB(data.color4);
					$(folderTooltip)
						.css("color", fontColor);
				}
			}
		}
	}
	
	deleteFolderToolTip (e) {
		BDfunctionsDevilBro.removeLocalStyle("customeServerfolderTooltipCSS");
		$(".tooltips").find(".guild-folder-tooltip").remove();
	}
	
	changeIconAndServers (e) {
		var folder = e.target;
		var folderDiv = this.getParentDivOfFolder(folder);
		
		this.checkIfServerDivChanged(folderDiv);
	
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
	
	createFolderContextMenu (e) {
		var folder = e.target;
		var folderDiv = this.getParentDivOfFolder(folder);
		
		var includedServers = this.readIncludedServerList(folderDiv);
		
		this.checkIfServerDivChanged(folderDiv);
		
		var folderContext = $(this.folderContextMarkup);
		$(".tooltips").parent().append(folderContext)
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
				this.setIcons(iconID, folderSettingsModal.find(".icons"));
				BDfunctionsDevilBro.setColorSwatches(color1, folderSettingsModal.find(".swatches1"), "swatch1");
				BDfunctionsDevilBro.setColorSwatches(color2, folderSettingsModal.find(".swatches2"), "swatch2");
				BDfunctionsDevilBro.setColorSwatches(color3, folderSettingsModal.find(".swatches3"), "swatch3");
				BDfunctionsDevilBro.setColorSwatches(color4, folderSettingsModal.find(".swatches4"), "swatch4");
				folderSettingsModal.appendTo($("#app-mount > [class^='theme-']").last())
					.on("click", ".callout-backdrop,button.btn-cancel", (e) => {
						folderSettingsModal.addClass('closing');
						setTimeout(() => {folderSettingsModal.remove();}, 300);
					})
					.on("click", "button.form-tablinks", (e) => {
						this.changeTab(e,folderSettingsModal);
					})
					.on("click", "button.btn-save", (e) => {
						folderName = null;
						if (folderSettingsModal.find("#modal-text")[0].value) {
							if (folderSettingsModal.find("#modal-text")[0].value.trim().length > 0) {
								folderName = folderSettingsModal.find("#modal-text")[0].value.trim();
							}
						}
						
						iconID = $(".ui-icon-picker-icon.selected").attr("value");
				
						color1 = BDfunctionsDevilBro.getSwatchColor("swatch1");
						color2 = BDfunctionsDevilBro.getSwatchColor("swatch2");
						color3 = BDfunctionsDevilBro.getSwatchColor("swatch3");
						color4 = BDfunctionsDevilBro.getSwatchColor("swatch4");
						
						if (iconID != data.iconID || !BDfunctionsDevilBro.equals(color1, data.color1) || !BDfunctionsDevilBro.equals(color2, data.color2)) {
							var openicon = this.changeImgColor(color1, color2, this.folderIcons[iconID].openicon);
							var closedicon = this.changeImgColor(color1, color2, this.folderIcons[iconID].closedicon);
							icons = {openicon,closedicon};
						}
						
						
						$(folder).css("background-image", isOpen ? "url(\"" + icons.openicon + "\")" : "url(\"" + icons.closedicon + "\")");
						
						BDfunctionsDevilBro.saveData(folderID, {folderID,folderName,isOpen,iconID,icons,color1,color2,color3,color4}, this.getName(), "folders");
						
						folderSettingsModal.addClass('closing');
						setTimeout(() => {folderSettingsModal.remove();}, 300);
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

	setIcons (selection, wrapper) {
		var wrapperDiv = $(wrapper);
		
		var folderIcons = this.folderIcons;
		
		var icons = 
			`<div class="ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" style="flex: 1 1 auto; margin-top: 5px;"><div class="regulars ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-wrap ui-icon-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">${ folderIcons.map((val, i) => `<div class="ui-icon-picker-icon" value="${i}" style="background-image: url(${val.closedicon});"></div>`).join("")}</div></div>`;
		$(icons).appendTo(wrapperDiv);
		
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
		
		if (serverDiv) {
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
	}
	
	loadAllFolders () {
		var folders = BDfunctionsDevilBro.loadAllData(this.getName(), "folders");
		
		for (var id in folders) {
			this.loadFolder(folders[id]);
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
		if (badgeAmount > 0) {
			$(folderDiv).find(".folder.badge").show();
			$(folderDiv).find(".folder.badge").text(badgeAmount);
		}
		else {
			$(folderDiv).find(".folder.badge").hide();
		}
		
		if (voiceEnabled) {
			$(folderDiv).addClass("audio");
		}
		else {
			$(folderDiv).removeClass("audio");
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
	
	checkIfServerDivChanged (folderDiv) {
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
					modal_tabheader3_text:				"툴팁 색깔",
					modal_iconpicker_text:				"폴더 선택",
					modal_colorpicker1_text:			"기본 폴더 색",
					modal_colorpicker2_text:			"보조 폴더 색",
					modal_colorpicker3_text:			"툴팁 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
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
