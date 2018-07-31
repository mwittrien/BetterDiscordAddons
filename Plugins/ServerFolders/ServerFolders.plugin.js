//META{"name":"ServerFolders"}*//

class ServerFolders {
	initConstructor () {
		this.labels = {};
		
		this.css = `
			${BDFDB.dotCN.guild}.folder ${BDFDB.dotCN.avataricon} {
				background-clip: padding-box;
				background-position: 50%;
				background-size: cover !important;
			}
			
			.foldercontainer ${BDFDB.dotCN.guild}.copy ${BDFDB.dotCN.avataricon} {
				position: static !important; /* fixed weird black square behind guild icons in folders */
			}
			
			.serverfolders-modal .ui-icon-picker-icon {
				position: relative;
				width: 70px;
				height: 70px;
				border: 4px solid transparent;
				border-radius: 12px;
				margin: 0;
			}
			
			.serverfolders-modal .ui-icon-picker-icon .ui-picker-inner {
				margin: 5px 5px;
				width: 60px;
				height: 60px;
				background-repeat: no-repeat;
				background-clip: padding-box;
				background-position: 50%;
				background-size: cover;
				border-radius: 12px;
			}
			
			.serverfolders-modal .ui-icon-picker-icon.selected ${BDFDB.dotCN.hovercardbutton} {
				display: none !important;
			}
			
			.serverfolders-modal .ui-icon-picker-icon ${BDFDB.dotCN.hovercardbutton} {
				position: absolute;
				top: -10px;
				right: -10px;
			}
			
			.serverfolders-modal .ui-icon-picker-icon.preview.nopic .ui-picker-inner {
				background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAz40lEQVR4Xu3d+5ed5X2m+ev77r1LEojz+SRUVRI6HjgZHwgHVUkC7La7nUzSjuOkVzrpnsYxMU5Pklkz8cTunqyZTK+JcRvb6SS9ZrqTtJ3E2I7tGINUEuAOjmGMpNIJnYU4GYzBMkIIae/3mcVCtazFWsGI2rvqeeu9Pv8Bix++t56991VMUZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkBVPQvvm3AJCmHyWISCRIpKOnH+Ky+x/keJIkPf/+Qc74N7vZ+z8PUaRGAKRI6WjRhBRc9sjdDoCc7FmyAqBBcAZwQYJZwEXAecBZwEygCSTgCHAAeA74PvB4wOMJngmKFyExMLqaqUuStGvpSiIRQTolwXkEs4CLgfOBs4HTgFZAJGgDLwI/BJ4BngD2A09D/AhSOTi6xgEwEXZfsYrO+afQePLATGA+8E7gGmAJcCFwGtDHT5eAl4HngX3AI8B3gYdI6TEijo79T60uSdLuwRVwciJS9CWYTfAO4BrgSuBS4Axg+pu8h0eAHwFPAqPH7sY/ADtaR3jplWklczeudQB00+6lwwBNiHnAu4H3AEuAM7o4YtrAU8A/AH8LrAOeBqjWGJAk7V4yDBAQFxEMA+8DrgEuABp0RwJ+CGwEvgF8KxI7U9AZ591wAOxZuoIE04F3Ab8CrAQuAILeOgpsB+4CvkhKO4BycNMIkqS87wZQJFgI/CLwfmAu0KS3EvAEcDfw5wEPJTiS8xCIPJfbCoAmwTuBjwA3A6cyOR4D/iLgz6anGfsO8zIDm9aQE0ny8A9DAamMucC/Onb8L2ZyvAB8A7gT+P9IlIMZ3o3Ia7kNUdIkKPuB24BfAc5i8iVgK3AHib8ieHHyV50k6YkrVvFKuySC0xP8EvCbwGXk4fvA/wN8nhSPR1EysHGEXERmzzatBP8M+DiwhPwcAb4O/LuBQ6tH9560yl8OSNIkvhanBFFwNfD7wE1Ai7wk4HvAJwPuBjoDo2scAGPPNhAAZyX4HeBW4BTythP4PeDLJNoT+7QjSdq9dAWQ+iA+CHwCuJS8/Qj4VMCngQNlKpiz6V4mU8Ek2r147PgzJ8GfAf8TcAr5mwv8CfC7wMmvrtB7z72B3pIk7V2y8tgvw9KpEL8P3AlcSv5OBz6e4HMJZhVRjv1SYdLEpK63BARXAp8F3kH1HAH+NODjCV4ookH/xnvoPknSnstvJHWaBJybgj8EPgQ0qZ61kG6D2EpKDG4aqc8A2Lt4OWXRBNLbgT8BllJdJfBfSfw2wXOtwzOYtePrdI8kaceiYRqNALgA+DTwPwBBdX2XxL8mGCXBZHyUXEzG5zYpGkC6quLHf0wB/AuCP4rE2UenvcwTl1xDd0iSdl6xkkYBJC4E7gR+Hgiq7e0EfwosCmDnsuGpPQAOv+MDkBIJLgM+CyxlagjgQyn4o4Czj5x+KuMnSdq2YJiinYC4kOAzwM8ydVwDfIZgVpGCiRaTUGg6O8F/Bt7H1JOAv4jEbyV47q0/6UiSNs8dYsaMAhIXENwJ/CxT0xeAW4EDE9mYKSb495qtBL8LvJdxyf8lADj7WNHwBEmSvtZ3bV2OP8AvAB+NlBoT+cuAYALsWTJMigJIHwD+FJhJV+T/EgA8ZzpYkt5SEr57z/75ex74F8A3KEsGN6+l14oJiTVEEKQ5wP+awfH3JUCSPP65ORP434CLKYqpEQIKAGgm+CiwmDF1GwFLV/BmSJKFPy6o2fEf8zbgwwliIm5G0dvf+68kAcB1wAepnwA+NPYTwT1v/BIgST77Jy4c+8yfevrVgLcB7Fo8VN0BUBYJYEaC3wDOJAM5fBywd+HNvEaStHPxcAbP/tk4H7iVRCuiqOYA2Ll0BQEANwCryEAunYCy2Wbf/HdTd5K0c9EwRREc/+yP3kfwdgL2LVtVvQHQSImUUgv4ZeAUfsIRkOLsTusIjw/+U+pKknaMHf/XP/vrTOBDkSjKsqzeAEgRELEEWMHrOALSa8XAkw/S4Q+oG0navnCYRuMN/uWvd6dgXuVCQLuWDRMpAN4DnMs/ypeAx5aso04kacdVN9Fs8MaRH10C3JxirKJbkQEQKUiRTgduQT+lE1CfXwdI0oaB5TSOdoD46c/+ejdwcqpgB2AxsIhjZCdAkk6Z2YD0Jp/9dTlwWWU6AHuWrgQSwLuAU3mT/Djg+GKgJPk7f3E28I7XAklD+Q+ARAKiBbyDE+MImNrZYEkW/k78d/56RyIViaIyHYCzgPnIESAJLPy99Wd/LQ7i9KhQB+AS4ALeIkdAHCsG3kT1SbLwN45nf10MXFilDsDs8cd/7ASUzQ77FtxCbUmy8KfTgUuyHwDbrryBY2YBDcbNLwZ2mkcrNQIkacfiLhb+1FeJAdDXbhEJgPPpDkcAr42AJ2f/HLmTpB2vFv6K6O4X/nQ+wO4lQ/kOgACIBHAmXeUIeOWUA+RMknZesYpGg+5/4U9nEgkoMg8BpSiAmdSGxUBJ2jpviKJT9qbwp5llJ/LuACQgBQG06A2LgZmNAEl66OIbmTatsPDXO61GEBHV6AAkesNOQGYvAZJ01hlNC389lgpI+XcAUgKO0A3yJUCShT+9UrTLFCnzAVCUUQI/pnccAfCpTF4CJFn46/3x149To0EiZTwAUlAWCeB5ekVB8EuT/sVASR5/Juj46/lEgrLMdwAMbloNBMBTTAhfAsZGwN5Fy+k1Sdq1bOXEHn+lsZs6uGVdJVLAjwFHmTC+BKSiwb75N9NLksz7Rpkm9vjrMLCfMXl3AIDEY8ABJpSdgE5fm/1z30O3SdKORcMUjUlo++t54PFKDIAAAp4AHmdi+cXAxNlHp7/Cj0/7XbpFkrYvGqYxWW1/7SPxfVLKfwAQQPACsIUJ58cBAWc/N+t7dIMkPbpgmGZjEtv+Gu202y8GARXoAJCgBB5kUvnFwPGQpM1zh2i1YvIKfyqBBxutJu1mJ/8BMDA6wjH/APyAiedLAOP7iaAkfa3vWmbMKCz8Ta6nSDxMgsvWrwOqkAJOCVLaDqxnoimI8RUDJWnR/Bm2/SffQwR7CXqioEci4hDwdarGYqAkIz+2/Sdf59gNPRJUaAAMbhoBIOAeYC8nQhYDJVn40w5gBGBgdE11BsCYFOzK4RXAYuCb/ThAkn/YJ5Nnf325aBePJxK9EvTIritWEB0A3nZsBJzHZFEi8ZcBHwOei7JF/5a7kSSAnYuHKSKjn/ppP/AeYPPg6Bp6paBH5qxfwzGPAHeRDbPBZXGUx+bdgiTAvC9Fkdnx1xdSyWYSPVXQQ80iADrAfwIeIwt+HBBwdrvvKE8MvBdJ5n2z+ra/tgf8WVHA4KY11R0Al25YDcDATkaBPwZKJpOC+MmvA46c/DL1JOnRhRnmfXUU+ExK7GICBBNgz9IVAOck+CIwxGRTAv4iEr8FPDewaQ31IWnb/CH6+gpI5n0z83USvwwc6PW//gEKJkAqj5DgBwGfAJ5mUshssKQNA8vHjr+Rn7zsBT5JjOP45zgABjc/QACQvg38AXCYCSezwZJOObkBiQuM/GTlIPDJTll+L5g4MfG/MU3TIf4QuA0I6suPAyQZ+VEb+L9S4hMBR8ee/idCwQQaHF0DKQ6T+HfAl5CxIElGfvwH2B9O9PEHiMmpTQ0DXATxx8A/ISvGgqbiS4Bk3jfDZ3/9dcBtCZ4dC/5MpIJJEimeJPER4G6y5HcC9i68iWqTLPyNtf2zO/66C7j9uONfjwEwODpClAUBj0XiVlJuI8BOAHB2anTYt+Bmqkiy8Jdx3ldfAm4Dnk7NkslSMEn6t9xLpALgsSC3EWA2eGwEdJpt9i+s0giQtCP3vK/H/zeBp1ORmPPIWiZLMMn2Ll5FihLg0gSfJ7iFHCgBfxmJjxE8N+PwDC7Y8XXyJmnHq4W/Ru7H3+NPJAY3jjCZggzsWbwSIuU3ApTguC8Gjq4hX5IeXTBMq+nx9/i/OQUZGNi8GlLk93GAAn7yccCxpHOGJG2dN5Tv8ddduR1/gCAzx4p0b/IlQL4ESHro4hs568xmnm1/3TX2hb/jvu3vAHAEOAIkWfjz+E+OggxNO3gyKTL+OMCPA87p+scBkjz+Hn8HwEV7/5bmkVa+I8AR8Eekqo4AyeMvjz9AkLF9C2+i0+wQKd+PA/yJYNU+DpA8/vL4AxRkbPbWeyg6DWNBub4EBJ8ivfbrgH2LVzExJPO++R9/C3/ltA65K8hc/5Z7iDL3YqAjoCxKHlt0E7Unmfe18NdIzH14XX0GgNlgR0Cn0eHxhbdQV5J5X48/RWLO+hGqIOgyi4Fmg089eBpn77mL7pC0feEwzSma97Xw5wBwBNgJkGTe1+PvRwBmg80GS9o8d4hWy+Nv3tcXgH+8GBh8HriFKcJioKSv9V3LovkzzPsa+emZggrr3/QQCR6LxK3A3UwRvgRIWjTvHz3+8vg7AIIf0zzSJkVtRoDZYMnIjzz+DgCAS7ffR9Eu6zQCzAZLHn95/B0AAP1b11J0Ur4jwE7AH40VA6tM8vh7/A8uepGpIphC9iwehojMvxhoJ6AoC2ZvvpcxknnfShT+LPy1SuZ8by2ALwC5Gdg8AikB+b8EmA2+mQqRzPua9+3O8XcAOALMBrd5Yv57qCHJvK95XzsAfhxgNnj2kwMUP/wTJDDviyz8OQC6FQoaBvIaATIWJG2bP0Rfq8j4+Bv5GcfxtwOQg4FNI0A+HwfIWJC0YWA5fX0ef4+/KWCzwWA2GH6LxA8GNq1BMvIjIz92ALpq+oGXM+0E2AkAPkUYC5LHXx5/OwA9sm/BcjqtBpHsBGQmBfw34GPAD/xOgDz+8vg7ALpu76IhykZR2xHgCJA8/vL4AxTUTP+W17LBmA3OTST4IMf9AaF9l6+i4mThL9/jry+NHf/2zDaAA6AeI2AESmNBuY+Asix57Iqb6BnJwp+Fv2bJvAfvcwDkxmKgI6DT6fD4lTfTdZKFP49/kZjzyFoy5QBwBDgCjrbbPH3Ne6gCacfCYRqVOP4W/uZsGCFzDgBHgCPg5cOvkH7h18mZ9OiCYRrVyvua93UAOALyLwY6AvY+uo9cSVvnDdFqZnr8dVfXj78dAIuBshMgPXTxjZx1ZhNSdY6/kR8FcgQ4AiQjPx5/OwCC5uGjFcgG2wnoOsnj7/G3BKh9C4comwUkZqXgc8B7mPosBkoef4+/A0CPLVpJu5EImJXIaAQocdwIcN13lTz+Hn87ALp0y2oaZZBgf8CHgb8jBwqO6wTsXrqCnctWMkYy72vet5zWYVwcAJq9eTVF9iPAEVCkxI7LVyKZ98XCXyMx9+F1jJsDQP2vjoBE5iPAEdAoE9uvWEl9ybyvx58iMWf9CF3jAFD/pjUVGAGOgGYnsfnqVXSTtL06eV8Lf73M+9oBsBGQgty/GOgXAzfeBPHbdIPM+1r4M+9rB0AMbFpD5P8S4BcDl93DeEmb5w7Rar3u+Mu8rx0A7V66Yoq+BPgTQelrfdeyaP4M877HGPlxAMgR4AiQkR95/O0AaObLTRLsj2QnIOdOQNfJ4y+PvyVA7V+4iqPNksgtG6wEfAG43WJg13n85fG3A6BZW++l0QlS2AnITAC/CNwxNV4C5PH3+B9c9CLZ8QVAe5esoowy8+8E+J2AMmDuxjUcR+Z9q1D4s/DXKpnzvbVkyBCQsaB7KVJhLCjTWNDYS0CRYMeyFVSKzPua983/+DsAHAGRIvMR4McBjQSPXr6CLpJ5X5n3dQAYC1pdgRHgCGiVsPHqFdSMzPua95UDwBHgCJh5hBrStvlDNBu1Of4W/uQAcATIXwdow8By+vqKjI+/kZ9qH387ALIYaCdARn5k5McOgF49LjV8CbATII+/PP4OAPV1ptdxBDgC5PGXx98QkPYtvplO0TYWZDa4Tjz+8vjbAdDszd+iSA07ARXIBu+aCrEgC3/5Hn99aez4t2e2qQkHgLGgeypQDHQERIKdvR0BsvBn4a9ZMu/B+6gXB4DFwLxHgCNgLBvcm2KgLPx5/IvEnEfWUkt+B0B7lqwkRcr8OwF+J+BIAxasX0P+tOPVwl+ukR99qVKRH0NAMhZkLKivA9951zB506MLunz85fF3AMgR4Ag492CQL22dN0SrWZvjb95XlgAtBspioB66+EbOOrMJqUrH38iPHAByBDgCZOTH4y87ADr7pYvsBNStGCiPv8dfDgCdtvu/0Or01XMEOALk8ff4yxSw2eCb6BQds8Fmg+vF4+/xlyEgs8EVKQaaDX5dMVDmfc37ltM6jI8cABYDqzECLAaOjQCZ97Xw10jMfXgdteEAkNlgR8D2mmeDzft6/CkSc9aP0EWyA6A9i1eQAoBZhJ2AXDsBh5uw6JE1dI+2LxymWdfCn4U/WQLUwOY1BADsJ1kMzLUYOL0NV/3hDXSPeV+Pv8dfDgDMBldhBDgC/vovW4yfNs8dotV6/fGXeV9ZAjSAkunHARYDE9weFgPH5Wt917Jo/gzzvkZ+5ACQI8ARYORHHn/ZARAAM16eDpHjxwF2AgLuSL0oBnr85fGXA0AX7voGzXajbiPAEeDxl8dfDgBduvUeik7R8y8GyhHg8ff4H1z0IpmRHQDtXbySMpKdgMy/E9AmMW90hOOZ961E4c/CX6tkzvfWkhnZAVD/5tVECjsBmb8ENAm2LRumYsz7mvfN+fjLAaCBSowAR0BfCjYvG6LLzPvKvK8cAI6A3GNBjoAZqeC7Vy6vdd63UY3jb+FvwwhdJAeAzAY7As5uN6ijbfOH6pT3tfAnB4DMBstOwIaB5fT1FRkffyM/lTv+sgQoi4EWA438yMiPHAByBDgCPP7y+MsQkPqOtOpYDDQW5PGXx1+GgLRv4So6jdJYUJ1eAjz+8vjLDoBmb72XoqxCJ8Bs8I6lw1Oh8Jfv8deXxo5/e2abGpADQP1bVlNkHwtyBDQItvd6BFj4s/DXLJn34H3IASCzwXVhNtjCn8e/SMx5ZC2ZkgNAZoPNBo9ePkRV7KhM4c/C35xaF/5UIEdA9rEgR8DJZcE919xA7h5dMEyjEoU/j7+RHxVUgiwGOgLmHG6Rs63zhmg1K3r8zfvKEJCMBQ0DzCLCWNCbZizooYtv5Kwzm5CqcvyN/EiB5AhwBBj58fjLDoB06kubIWI/KdkJqFMx0OPv8ZclQGnvop+hLKYDqU4vARYDPf4efzkApD2LbyBFq14jwBHg8ff4yw6A7ATcT9ABcv84wGzw64uB5n3N+5bTOoyDHADyJ4LrKjICLAY+OlYMNO9r4a+RmPvwOrpADgA5AsrMR4AjoJWCrcuGa5739fhTJOasH6FL5ACQI2BtBUaAI2BaCtZfMUS3ba9O3tfCX+/yvnIAyBFAxiPAEXBqu2D2Ly7oat63ad7XvK8cAMIRQMp5BDgCgnNGtlxEN2yeO0SrVZvjb95XdgAki4F2Ar7Wdy2L5s+YKnlfIz+SA0COAEeAkR+Pv1QwDlKr/aMKZoPNBnv8Pf5SME7S3sXXU0ZfhYqBFgM9/h5/qWCcpP7NDxCpbSegAsXA6h9/j//BRS+SFfkCIO1ZspxEI/OXAF8C2iTmjY68Lu9bicKfhb9WyZzvreUtkewAyGKg2eBty4arl/c175v78ZcvAPIlYIhEke1LgC8B6fYgfnC41aF1uKhE4c+8bxcLf5IDQI4ARwCJXhx/WfiTA0COgMi0E+AIgPRRUrQI7szv+Bv5mUrHXw4A+RLweeDd5EAJ+DLQAt5HV8jjLweAZDFQMvIjOwDS4KaROv4BIcnjLweA1CgP1TMbLHn8ZQhIxoJuIEULkrGgGpHHX4aAZCzofiJ1fAmQ4Etjx789s009yAEgi4GpdAQIwMJfs2Teg/dRL7IDIDsBUdT34wB5/IvEnEkq/EmB5AiQLPxNPDkAZCNgCBwB8vjXjewAyEbAWkhpKn8nQLort+MvBRmRdi9dUbeXABn5kQwBSYOja4wF1ZHHX3IASDMPbRkbAbfWZATI4y85AKTzdj1NUb4CEY/bCagdj79kB0B2Am4kRdNOQL14/CVLgLIYeF9ls8Ey71tO61AncgBIZoNl4a+RmPvwOmpChoAki4Hy+FMkBsed95UcAJIjQBb+JAeAzAYPQ0S9RoA8/pIdAJkNHpn62WCZ95VMAUtmg2XkRzIEJJkNlsdfcgBIzfaBOmaD5fGXLAFKexdfT1n0WQysE4+/ZAhI6t/8AJHaxoImhMf/4KIXyYpkB0B2ApaTomEnoHcs/LVK5nxvLZmRHADS7qXDQADMAj4L/BO6ROZ956wfIUOSHQBpcHQESAD7gd8AvsG4ybxv5Y6/5ACQI8BY0PhY+Ktq219yAMgRYCfgjcnCnxwAkiNARn7qcPyloC5kNhguAT5vJ0BGfiQoqAuZDYbHgVoVA+XxlxwAUtGu2wiQx19yAEiDG+6DKI8fAd9g6pPHX3IASIMb1wJpbAR8uNYjQF8aO/7tmW3qQ3IAyE7A48aCsPDXLJn34H1IDgDJYmBdePyLxJxH1lIjkgNAcgRY+JtTo8Kf5ACQzAZ7/I38SA4AyWKgeV/JEqBkMRBgFvC5ehUDjfxIdgAki4H7axYL8vhLDgBJndOeqmMx0OMv+RGApN3LlkNq1OsPCHn8JTsAksXAdUANs8Eef8kBINkJqHI22LxvOa1DnUgOAMlssIW/RmLuw+voFskBINkJuBW4l9zoa5BuYyzvu36EcZMcAJKKRhOAgBLokBu1g+gAFEdajJvkAJC094qbKDsdAi5K8FngFnKj9yf4j5E4NzXb7LnsvbxlkiVASfuuuoXO0aNjx/9O4J+RM30x4KMJnjX885bIEJCkJ9753uOP/2crcfz1zxN8OuC8Y1nnEyYZApL8uwDHH/9/SlUoAX8F3A48YwugHmQHQPL4K4B/DtxRw5cAyQEgefwdAckR8BOSA0Dy+DsCJAWS2LNsJSmlKXz8/U5AJG5PwTORCgY22XKSCmpO2nP5qjocf18CgjsicV6Kkj2LV1FjkgNA2vvq8S9Lxn7nX5Pj7wgoXh0BN1FLkgNAFv5WUZZlbSM/joAOexbeQo1IdgCkfVfeRKfdqffx9zsBH03Bs/HjMxjY9zdMcZIDQHrs6ltoHzlq5EdfDLg9Tf1YkGQHQHp6+Xs9/mNkJ6BOZApYRn6Aizju2V9mg2vxEiAZApLH3z/sI2NBUkHtyONv5EeOACmY0mThbwUpccLP/vLjgEjBwKbVVI7kAJCFv5WkMr3l4y//lDAJBjetIU+SA0Dy+MsRIDkAZOFvJWWnK8dfjoCPAs9SwuDmNdSA7ABIHn+ZDQY+DZxLAbsXriRDkgNA2nfVqt4dfzkCmok/4AAZkQwBSfvffjNHX273/PjLjwMyiQVJDgDp4Ic+yDOjz07Y8ZdfDKzBCJADQDLvKzkCZAlQMu8rvxNwBxNSDJQcAJJ5XzkCJDsAMvKzglTWKe8rY0GSHQBZ+Mvu+MuXAAJ2L1lBDckSoGTeV2aD61oMlANAsvAns8EdGNyyhnGSLAFKe6+sUOFPFgMbsGv+KnInBRmT9l29is6RsirHX/riOIuBkh0A6fF3vbtSx186/iXATsBbJAeAdOTgkcoef/lxwBt0AiQHgGThT8aCJAeAZOFPjgDJASD/sE+Vj7/kCJAdAMm8r+wEJG4neIZOMLhlNXUgOwCSeV/ZCQjuIHEuRWL3wpXUhhwAknlfOQLGYkGJ3QtWUlNyAMi8b42PvxwBzcSuy1YhOQBk3rdm5AiIaSWPnv4+akEOAGnvwuso2yWQan/85QhoXXKIKU8OAOnxgcspm9MgpYsgPP4CHAG7l6xgipM/A5SRn2GA1x9/yZ8IwjODm9ZQJzIEJI+/5E8E4byp+RIgB4A8/umNjr/kCJgyHwfIASDtWTL0Wt43cRGR0fFXAv4OuJcsOQJ2L1pBZckBII9/ioCU8jv++jLwa6T0a8DfkQMF8AGCO4h0Lg3YuXQ5FSUHgDz+5Hf8dRdwG/AMEU+Q0oczGwGOAOIOSOcWNNix9EYqQQ4Aac/i5aQo8j7+Hv+niSBSCRH78x0BjoAGTbYvvZ7MyQEgj/+NpKKR/bO/xx8GN65mYNNayH4EOAKa9LFx2dvIkuwASHsW3UBqtCpx/D3+azje7iXDEAEpzSLic8B7yIES8EVItwPPDo6OkBU5AKS9C66lbM3I/Ph7/AdH1/yUVsOKNzcC5AiQHQDp+Rl9FT/+Hv8xrw6EnD8O8OMAzn21qZEFOQCkF+ZeB1T9+Hv8x8w8tGVsBNxagxHgCJADQDLv6/EHOG/X0xTlKxDxeM4vAY6AFYyHVCCZ9/X4v07/5m8TqZ33xwF2AiZjBMgBIPO+w0Z+Mj/+RbQZj4FN9xGpU4ER4AjYZTFQ/gpAFv4APP5BycDo2i5WHYusfx3grwPi2ZIOc0fX0QMyBCSPfzUKfx7/1LXjD7waC6p3MdBssBwAMu9bjcKfx3+EMfUbAWaDty29DskBIPO+Hv+ujgBSynwEOAL6mMYDV8xhXGQJUNq76HrKRl+9j7/Hv07ZYIuBcgBI++a9g860mRU4/kZ+esdssCNADgAZ+ak3j78jwBEgOwDy+MvjD9BsH6hTNthssBwAsvAnjz/ApVsfpiiPVD0bbDZYDgAp/8Kfx3968wA56d/8QM+ywTIbLEuAsvDn8U88XUSH/tF1GYeiGhYDu8BioBwA8vjrLhK3EcflfTNQ9WywI6DN3NH7qDcVyMJf/nlfj3/K6fhXvxhoNrjJ9qU3UF9yAHj8K1H48/inVw8rY6owAsh+BDgCmrTYsuxd1JLsAJj3bQIp+2/7e/xHyF7+xUDZCZAdAO1deL3H3+Pfc4ObRnL52wGyEyBLgNo/eCVHTz4z6+Pv8e995MdioCwGKqgZIz8rPP4e/8kcAZcQ8fkajABHgAwByeMvjz9Ao3OoTsVAs8FyAMjjL48/wOwtDxLpqMXAiWA2WA4A7V4yVIHj7/Fv8TJ1MLDpfiJ1KjACzAbvXDpEhckSoMefKDI//h7/gmzyvhYDlYAvQPrYa8XAkrmja6kQGQLSnqocf/O+OR1/i4EK4BchPvVaMbBgx7LlVIkMAdn2r8LxN+9bicKfLwG+BByNo8zfeD95kyEg875dPf4y72s22JeAVmqx/oq3kynZAdCeRTeSGt0u/MnCn9lgXwL4GPBsho0KOQC0d8HPULam9/L4y8iPxUA/DshpBMgBoOdO6uPAnOtrdPw9/o4AOQJkB0BT6vh7/DXz0JaxTsCtdgKy/E5APrEg2QGw8MeFwGenyvH3+Gvv4usoi2l2An4KXwLkAPD43wm8nynF42/L4kZSNB0BYxwBMgSkXcuGK3D8Pf4NjqDxxILuyzwbbCxoArPBcgBo1+XDRIoKHH/zvrNHH2C8HAHrqlEMtBjYyxEgB4B2vnr8y/yPv5GfeuZ9zQY7ArZ3PxssB4B2XjFE4fE375sxR4AjoJkabF12PV0iB4B2XLmcolN4/M37YjY4ZT4CHAHTUh+rr5nHOMkBoEffdiONdsPjb95XwOCmkQqMAEfAwOFLyJ+CbOmhVW/jrO+f5vE38iOLgXYC5ADwd/415vGXI8ARIDsAHn95/NVsH6hnNthssCwBevzl8TcbfD1l0WcxsLcsBtoBkMff438SPyQf6t/8AJHadgKy7gSQ4UuAgixoV0UiPxb+2vSP3kd+tGfJclI0sn0J8CWAjwHPlpGYu3GE6rADII+/kR/Kt3z8ZTbYTgCfAs4tUrBj2RByAGDed6gqx9/C3+haxk8WAx0BjVTw6OXLqTkHgHnfbhf+ZOHPEUDuI8ARcE6rbDB65fXUjgNA26/qVd5XFv40mHs22BFwB3DOye0+asUBoK1vv57m0drnfT3+MhvsCLATYAegPj64Cf79Lxn5OY6RH1kM9NcBPe0EyAFg5Ecef0fAJUR83hHgCBAU1IDHXx5/NTqHIOJxY0E5xoLoZSxIhoA8/vL4Gwu6gRQtY0G950uAHQDtWjZcgePv8W/xMnVgJ+B+InXsBFTgJWDH5SuoNgeAhb+UaeRHdwXpWN63w6zRvycjshhoLKiE7b0YAXIAmPf1+Cfi6aLo0D+6jvzIYqCxoGYJj16xkkpxAFj4y//4e/wjSvo3rCNfcgQYC2p1EpuvWkn2HADaceVQRQp/Hv+BjWvJn8wGOwJmHE3cf8MqsuUA0Parl9Nod/v4y+Mvs8GOgItfKMmSISBtuvZnOOnF6Xkff4+/kZ/qshhoLOh24Ae2OnIYADLy4/GXI0B2AuwAePxT9Y+/x19i5qEtY52AW+0EvAGLgZYAPf7DABdCTJHj7/GX9i6+jrKYZjHQYmD9BoA8/h5/mQ2+kRRNR8DxHAF2AIz8DFXg+Hv8m61XeOtkJ+A+s8HHMxvsCwAef6KM7I+/hb82/RvuY/zkS8AQKYrMXwL8dUC7gHkb1tAjdgAs/C0//vh/JtPj7/GPTs2OvywG2glolrDtypX0hB0Aj3/RKY4//j+LjPxkRb4E2Al4aVqw9OHVdIUlQO246gaKTqPGx9/jLw1UohhoMfDkVxK/d+t7GTdDQNp2zXX0HZ4GpKyPv8c/MbBxhF6Tdi8ZhghjQVO5GOgA0HfevYhzn7gASH7hz8iPZDHQEeAAMPJTSx5/yRFgJ8AOgMdfHn+p2T5Qz2yw2WA7AB5/efxlNvh6yqLPTkCvWQy0A+Dx9/jPPO0ZciH1b36ASG07ARkXAxPpnIq/BNgBsPDn8W80jjJ7/f3kR3YClpOiYScg005AIt0exA/aRcm8DWsRFIidFTn+5n07GR9/2QlYl3Ex0E5AEHck0jnNsuDRK4YQFICFv0rkfY389G9Yx3hJZoMdAa1OwZarllNjDoAdV97Y9byvLPzJEUD2I8ARMP1og4ffdb0DoI62X3UDjXaz68dfHn9pMPtssCMA0jlnHuwzBFQ3W95xLdMPzah13te8r2Q22FhQuh2iLsVAB8CpCdYvM/KTCSM/shgoR4ADwMiPx5/bgKcHpu7xlyPgEiI+X5MR4AgwBOTxl8dfanQOQcTjxoJyjAXFHZC6nw12AHj85fGXZm95kEhH7QTkOwI+VbcRUNSg8Jf58ff4J3h6epzC1Cc7AfcTqZPxCHAEjGWDd1w+7ADoNfO+Hv8mLS7c+BVyIVkMtBPQKIPtVww5AKqZ911OZF/48/g3aHDp6N1kR7IYaDa4U7DtyiEHQPXyvrkX/jz+BQWzR+8hV5IjwBHQ1y7YdPVyB0B18r6NChx/j3//6L3kTjIb7Ag46UiDkeF32QHI2aNXX0/rSF/mhT+/7R8E/aOrGTfJYqDsBDgANl53DTMPnAokIz9GfjImWQx0BDgAjPx4/CU5AhwBdgA8/h5/STMPbRnrBNxqJ6AmxUAHgMff4y/pvF1PU5SvZJ0NNhbEOT9lBDgAPP4e//5TV3NiJPVv/jaR2nYCsu0EcMdUGAFh4a9XjPz0MYNLRr/OWyNpz5LlpGhk+p0AvxOQ4PaAH7RJzBsdsQPwGo+/ed9mLY6/ZDbYl4AmwaPLhh0AvS785Z/39dm/QcGlo9+iLiSLgY6AVgq2VmwEFJXK+3byz/sa+SmYXcPCn+QIcARMS8H6K4YcAN2046obqpL3tfDXw+MvmQ1OmY8AR8Cp7YJZH5xvCKgbtl1zHX2Hp1Ul72veV5LZYL8YON5YkAPgO+9exLlPXJBn3ldfDviIkZ9qksVAOQLCyE/9ePwlR4AcAUU1j788/pKa7QNvORssY0FFNY+/PP6SLt36MEV5xGywI6DnA8Djb+TnIwmePiOdTS4ks8EPmA12BPQ+BWzhz8JfK7WYteluxk2S2WCzwQ6AnYuGKYpjxz8w8pPp8W/QYPboPeRKcgQMkaLIfAQ4Ao5EYsHGEUNAO6py/M37duH4S7IYaCyoLwWblw3VewBsXzhMowrH38hPhfK+kiOA7EeAI2BGKvjulcvrOQC2zR+i2ej28ZeFP0mDlcgGOwLObjfqFwJaP3Ajp57cBLiA4M78jr+Rn94ef0lmg40FkbidmLxYUExa5CdxPhF3Aj9HLvSVgI8keGrQyM8UIofACoBZBJ8H3k0OlIA/Bz4GPD8ZIyAmJV0JZwL/Efgl6snjL8kRoBL4T8BvAy9N9AgoJuH4nwR8AvhFcuLx/w2m7PGXFO02BGPZ4G+SAxXArwO/FdDYs3TF1BwAr/6HRUQAtwL/Y0YVQvO+Y4W/53YzNUka2HYf0elAxP5I5PO3A9QC/m2Cny9L2LtsxdQaALsXD5EAUroJ+F2gj1x4/G9L8NRJ6WTOeGovU5ekgS3riNQhwX4SdgLycRrwyShYmtIU6gA8M28RFAXAJQk+CZxDLnz2vw3SUwUtLtj0t9SBZCdgHQUlgJ2AvFwGfDwlTjn2fY3qD4CXpp1PkBrA7cA15MRn/6egSf/o3dSHpP5NaynIsBOg9xF8IAJ2LR2m16Ln3zoNAIaBvwbOZLLpy4z9y58G/bUu/En+7QAoAGalII9OgDYD7wP29roPUPR+XqSZwEfzOf4++wc8VVB4/CWzwSRKEowVA7/JZNNi4FdTBL3+E8JFLwtUAUDcBKwgFxb+nkqpHCv8STIbTPzk44A8fh2gD0VK8+mx6OUAAGYS8VcnFJ2QkR9JxoL0iSA+mSgZHB2pTgdg19KbIQIi3glcz6Tz+P/0yI8kXwPW5BML0s9BujCIanUAgjYQBfALwEwmi77CsbzvwJs4/pJUHDoMEfuZ7FiQFiRYDrBr6YqqdQBSPzDMZNFXOcF/+UtS/67/TlG+ApP9xUA1gfelRCtSqsYA2Lt0iGN+BriUyaCvcKzt3zjyEidCkvo3f5uiLCf/i4F6e8ClQVRjAJSpIBIFMDx5vX+f/YGnOs1pzH70O5woSerfspZIHSAmLxusi1NwdQoYvWwo/wFAQArOA65i0nj8y6LBZY842itMMhusBvAuAmZOLyrTAZgLzGKSePwL5m64h8qTZDZYl1MyM6XMQ0C7Ft54fMloJhPO45/i1eN/L90jyREwQqQSCIuBE6+f4Hwi8wEQzSakBLCACefxj5SYs7E3x1+S2WAmoxioM4FL8u8AJIDoAwaYCPrK2B/2SVEwsGmE3pFkKGgEUiIm8ouBmlGNAUAC0snAeUwUn/2fHBwdmbB/+UtyBAxsWjNxnQAFcCEJ9l19c8YDIAIiTgbOoJf0lUmM/EjSsREwQcVAnRVA50g7+xLgScBJTFkW/iQpgGbngMXAiXHq0YqkgKcBTXrKwt8ZO7/NZJKkS7c+TNGZgGKgpjWLFFUYAA0g6Anb/pHSU0emzeTMl19hsklS/9a1RGqPFQN78xKgIggi+18BJEog0RO2/dvNJgse/ir5kGQx8D4KSgh68xKgI2WZUsq6AxAQwStAmy7zp348VZQdLlt/DzmSZDGQMkH04CeCeqkg8u4AJCDBIeAw3eQX/p5MUdC/eR25kqTBzWPFQCwGdtcLKSCyLgECAYeAH9E1PvtHKi38VYZkMTBSl4uBehpgYHRN9i8AB4FnGQ99dezZn4hjCc5qkKSBzSOQUne+GKgjAU9UIgXcfunoK8Bexst/+T+ZIhjcuJoqkmQxMEjj/2KgDiTYTw806aJGI8HJLYBHGQf/5V/9yI8kjf19kt1LVrz2EhB8DngPJ0JPAE9l/wIwe8MIx2wCDnEi9NWxf/lPpeMvSYPj+dsB2kKZXiClSpQAAXYAT3LCLPxNxeMvSdFuQ8T+ONG/HaB/oIiSVIUUcEqQ0tPABk6Ibf+nLr2aqUiSBrbdR6SjpBN5CdDzwHfHfmKZ/QAIGhC0gREg8aZY+GtNa3Ld1/9Ppi5JFgPvh/IE/naANpJ4lB4pup+EvJcgAB54cx8DWPhrNBvMevhbTHWSNLhlLZTlmysG6m4iHYyqDACABBDsBB7gp7Dw12D2I/dQH5IsBq796cVAPRlwN8RYAKgiAyAlItEG/uYNssAW/opgzsZ7eB1Jshiob5HYFomeCXpk95IVAKcTfBW4gdez7V/7vK8k7V4yBBQAs+wEjOFHwPuB+1KRmLNhhF4o6JEIIPgR8J+BI+irxxf+PP6SBIOb1hIkCDsBx/km8B2gZ8cfIAB6/ApwBsHfAMN+4c/IjyS94c3wJeAHAe9P8PcRiYGNI/RKQa8FLwCfAQ5ST189keMvSRYDqXMn4L+S4juR6OnxByh6n39MQLob+Cvzvm9EklS8fJixPyBUwxGwAbgzRSqbjT56raDHGlEAcSTgPwBbzPv+YyRJ/bv+O9Hu1DEbfAD498A+Esza8M3qD4DZG1dTBKTEduDfAT+uS9434KnDJ53BmydJGti6jkhtUn0+DiiBz0H6GqRjr+e9F0yQPUtXADQS/D7wvwCNqfzsH/BUu9HksvXf4sRJkvYuGaKkANIsIqbyFwO/HPDrwAsDE/hiXDBBXi0ZpUSHxP8NfGGqR346RTGO4y9J6t+0loKxbHCaqtngB4HfmejjDxBMsN1LVwBcDPwpcPNUa/t3N/IjSdpzXCwoTa1Y0AbgX0ZifSpgcOMaJlLBBCuKDsATAR8B1k2l4x89Of6SZDYYSlKwH/gw8HWqb0Mk/jWwHrpy/PMfAP0b1hEEibQb+FfAPVRXAr4IfBjSk6ReHX9JcgSM/QEh4N8AfwWUFX72/1WCh1NKDGxaw2QomAQDo6spIkFidyR+HfhvQIdqOQJ8DvgIpO9Dk4FNvTz+kuQI6JAIeCrgw8CngZepjhL4CvDLibSh6BTM2TTCZAkm0Y75N9Loa0LidIJ/C/wmcCr5ew74P0j8MXBocELXmyRp99JhUmJ6RPwq8HvAheTtReCzkP4DxPOJxJzRESZTZNR/bhG8H/h9YCH5ehj4OMRqSKWRH0marNsxTCJFRPHOY7djGGiQn40k/nfgb4GjufyjMcjEnqVDpDQN4ug84HeAXwBmko/ngf8CfCrg8ZQSg5P4dCNJgl1LV1AAwJkJ/iXwG8Bs8vBD4M+BT1OmfRRBTmXYIC9jwaBpCW4BPgpcC7SYPC8DI8AdkO6HaJv2zZIkPxKIIBYQ3Ar8PHDeJD73f4vEZ4DvEGR5N4IM7VqyiiI6pBRnELwX+DXgGmA6E+cl4NvAnwH3AAcbnWD2ltVkSJI01ppJqUHE5cCvAO8FLgUKeu9ZYA3w/0L6NnB4cHSEXEXu8YeSgoDTgRsIPgDcAJzfo/FSAk8AI8AXgQdJcbDVPsSsbX9PBUiSxr5bFhRAP3AT8D7gSuDsLt+PHwNbgG8C34jEVoIj46z6OQDGbF82TDMFCVoBlwXcmGA5sAy4eJwvA4eA/cAjwFrggUhpDxGdaHfo37qOapIk7VkwTDmjQRwtTyK4DHgH8E5gMXApcBrQ5M3pAAeBJ4FtwHcDHiSxmQ4HKGBg8xqqIqiYvVfcSPtIi6IoW0ScD8wHFgPzgX7gXOB0YDrQ5DUJ6AAvAy8AzwB7gG3AZmBHSumZIDrtOMq80fuZWiRJz85ZxYGTOhQpCoLTgVnAbOBS4ELgLOAUoBUQCdrAS8DzwPeBx4C9wH7guXZK7WlRMHt0NVUUU+WnIJEiiDSNiJkJTgo4OSX6gCKgTMErwEsBL6XES8ArAPX+Db8k6cnG2/jR289gxsE2KUUREQEAiZSiPOnwjNRuHeWSrd8if5IkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIk6f8HUSShlN1PTAcAAAAASUVORK5CYII=);
			}
			
			${BDFDB.dotCN.guild}.folder ${BDFDB.dotCN.badge}.folder.count {
				background: grey;
				height: 12px;
				top: -3px;
				right: 30px;
			}
			
			${BDFDB.dotCN.guild}.serverFoldersPreview {
				position: absolute;
				opacity: 0.5;
				width: 50px;
				height: 50px;
				z-index: 1000;
			}
			
			${BDFDB.dotCN.guild}.serverFoldersPreview ${BDFDB.dotCN.badge} {
				display: none;
			}
			
			${BDFDB.dotCN.guild}.serverFoldersPreview ${BDFDB.dotCN.avataricon} {
				background-color: transparent !important;
				overflow: hidden;
			}
			
			${BDFDB.dotCN.guildswrapper}.folderopen ${BDFDB.dotCN.guilds} {
				position: static !important;
			}
			
			${BDFDB.dotCN.guildswrapper}.folderopen ${BDFDB.dotCN.guilds}::-webkit-scrollbar {
				display: none !important;
			}
			
			.foldercontainer {
				max-height: 98%;
				max-width: 98%;
				position: absolute;
				top: 0px;
				left: 0px;
			}
			
			.foldercontainer::-webkit-scrollbar {
				display: none;
			}

			.foldercontainer ${BDFDB.dotCN.guild}:not(${BDFDB.dotCN.guildselected}) ${BDFDB.dotCN.guildinner} {
				border-radius: 25px !important;
				transition: border-radius 1s;
			}

			.foldercontainer ${BDFDB.dotCN.guild + BDFDB.dotCN.guildselected} ${BDFDB.dotCN.guildinner},
			.foldercontainer ${BDFDB.dotCN.guild}:not(${BDFDB.dotCN.guildselected}) ${BDFDB.dotCN.guildinner}:hover {
				border-radius: 15px !important;
				transition: border-radius 1s;
			}

			.foldercontainer ${BDFDB.dotCN.guild}:not(.selected) .guild-inner[style*="background-color:"] {
				background-color: rgb(47, 49, 54);
			}
			.foldercontainer ${BDFDB.dotCN.guild + BDFDB.dotCN.guildselected} ${BDFDB.dotCN.guildinner}[style*="background-color:"] {
				background-color: rgb(114, 137, 218);
			}`;

		this.serverContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} serverfolders-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span>REPLACE_servercontext_serverfolders_text</span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;
			
		this.serverContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} serverfolders-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} createfolder-item">
						<span>REPLACE_serversubmenu_createfolder_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} removefromfolder-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span>REPLACE_serversubmenu_removefromfolder_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;
			
		this.folderContextMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} folderSettings">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} unreadfolder-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span>REPLACE_foldercontext_unreadfolder_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} autounreadfolder-item ${BDFDB.disCN.contextmenuitemtoggle}">
						<div class="${BDFDB.disCN.contextmenulabel}">REPLACE_foldercontext_autounreadfolder_text</div>
						<div class="checkbox">
							<div class="checkbox-inner">
								<input type="checkbox" value="on">
								<span></span>
							</div>
							<span></span>
						</div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} foldersettings-item">
						<span>REPLACE_foldercontext_foldersettings_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} createfolder-item">
						<span>REPLACE_foldercontext_createfolder_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} removefolder-item ${BDFDB.disCN.contextmenuitemdanger}">
						<span>REPLACE_foldercontext_removefolder_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;
			
		this.folderIconMarkup = 
			`<div class="${BDFDB.disCN.guild} folder">
				<div draggable="true">
					<div class="${BDFDB.disCN.guildinner}" draggable="false" style="border-radius: 25px;">
						<a>
							<div class="${BDFDB.disCNS.avataricon + BDFDB.disCNS.guildicon + BDFDB.disCNS.avatariconsizelarge + BDFDB.disCN.avatariconinactive}"></div>
						</a>
					</div>
				</div>
				<div class="${BDFDB.disCNS.badgewrapper + BDFDB.disCN.badge} folder notifications"></div>
				<div class="${BDFDB.disCNS.badgewrapper + BDFDB.disCN.badge} folder count"></div>
			</div>`;

		this.folderSettingsModalMarkup =
			`<span class="serverfolders-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<svg class="${BDFDB.disCNS.modalclose + BDFDB.disCN.flexchild}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.marginbottom8 + BDFDB.disCN.modalsubinner}" style="flex: 0 0 auto;">
								<div tab="folder" class="tab">REPLACE_modal_tabheader1_text</div>
								<div tab="icon" class="tab">REPLACE_modal_tabheader2_text</div>
								<div tab="tooltip" class="tab">REPLACE_modal_tabheader3_text</div>
								<div tab="custom" class="tab">REPLACE_modal_tabheader4_text</div>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div tab="folder" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_foldername_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-foldername"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_iconpicker_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="icons"></div>
										</div>
									</div>
									<div tab="icon" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="swatches1"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="swatches2"></div>
										</div>
									</div>
									<div tab="tooltip" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="swatches3"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="swatches4"></div>
										</div>
									</div>
									<div tab="custom" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_customopen_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
												<input type="text" option="open" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" placeholder="Url or Filepath">
											</div>
											<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;">
												<div class="${BDFDB.disCN.buttoncontents}"></div>
												<input type="file" option="open" accept="image/*" style="display:none!important;">
											</button>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_customclosed_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
												<input type="text" option="closed" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" placeholder="Url or Filepath">
											</div>
											<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;">
												<div class="${BDFDB.disCN.buttoncontents}"></div>
												<input type="file" option="closed" accept="image/*" style="display:none!important;">
											</button>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_custompreview_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter + BDFDB.disCNS.nowrap}" style="flex: 1 1 auto;">
												<div class="ui-icon-picker-icon preview nopic open">
													<div class="ui-picker-inner"></div>
												</div>
												<div class="ui-icon-picker-icon preview nopic closed" style="margin-left: 25px; margin-right: 25px;">
													<div class="ui-picker-inner"></div>
												</div>
												<div class="ui-icon-picker-icon preview nopic switching">
													<div class="ui-picker-inner"></div>
												</div>
											</div>
											<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addcustom" style="flex: 0 0 auto;">
												<div class="${BDFDB.disCN.buttoncontents}"></div>
											</button>
										</div>
									</div>
								</div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-save ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">REPLACE_btn_save_text</div>
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
		
		this.defaults = {
			settings: {
				closeOtherFolders:	{value:false, 	description:"Close other Folders when opening a Folder."},
				closeTheFolder:		{value:false, 	description:"Close the Folder when selecting a Server."},
				closeAllFolders:	{value:false, 	description:"Close All Folders when selecting a Server."},
				forceOpenFolder:	{value:false, 	description:"Force a Folder to open when switching to a Server of that Folder."},
				showCountBadge:		{value:true, 	description:"Display Badge for Amount of Servers in a Folder."}
			}
		};
	}
		
	getName () {return "ServerFolders";}

	getDescription () {return "Adds the feature to create folders to organize your servers. Right click a server > 'Serverfolders' > 'Create Server' to create a server. To add servers to a folder hold 'Ctrl' and drag the server onto the folder, this will add the server to the folderlist and hide it in the serverlist. To open a folder click the folder. A folder can only be opened when it has at least one server in it. To remove a server from a folder, open the folder and either right click the server > 'Serverfolders' > 'Remove Server from Folder' or hold 'Del' and click the server in the folderlist.";}

	getVersion () {return "5.7.5";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Folders.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all custom Icons.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} removecustom-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Remove</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
			.on("click", ".reset-button", () => {this.resetAll();})
			.on("click", ".removecustom-button", () => {this.removeAllIcons()});
		return settingspanel;
	}

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
						var serverObj = this.getParentObject(change.target, BDFDB.disCN.guild);
						var folderDiv = this.getFolderOfServer(serverObj);
						if (folderDiv) {
							this.updateCopyInFolderContent(serverObj, folderDiv);
							this.updateFolderNotifications(folderDiv);
						}
					}
				);
			});
			BDFDB.addObserver(this, null, {name:"badgeObserver",instance:observer,multi:true}, {characterData:true,subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"serverContextObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class") {
							var serverObj = this.getParentObject(change.target, BDFDB.disCN.guild);
							var folderDiv = this.getFolderOfServer(serverObj);
							if (folderDiv) {
								this.updateCopyInFolderContent(serverObj, folderDiv);
								this.updateFolderNotifications(folderDiv);
							}
						}
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								var serverObj = this.getParentObject(node, BDFDB.disCN.guild);
								var folderDiv = this.getFolderOfServer(serverObj);
								if (folderDiv) {
									this.updateCopyInFolderContent(serverObj, folderDiv);
									this.updateFolderNotifications(folderDiv);
									if (node.tagName && node.classList.contains(BDFDB.disCN.badge)) {
										BDFDB.addObserver(this, node, {name:"badgeObserver",multi:true}, {characterData:true,subtree:true});
									}
									$(serverObj.div).attr("folder",folderDiv.id).hide();
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								var isBadge = $(node).hasClass(BDFDB.disCN.badge);
								var serverObj = this.getParentObject(isBadge ? change.target : node, BDFDB.disCN.guild);
								var folderDiv = this.getFolderOfServer(serverObj);
								if (folderDiv) {
									if (isBadge) this.updateCopyInFolderContent(serverObj, folderDiv);
									else $(".foldercontainer [guild='" + serverObj.id + "']").remove();
									this.updateFolderNotifications(folderDiv);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.guilds, {name:"serverListObserver",instance:observer}, {childList: true, attributes: true, subtree: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								document.querySelectorAll(".folder").forEach(folderDiv => {this.updateFolderNotifications(folderDiv);});
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			document.querySelectorAll(BDFDB.dotCN.badge + ":not(.folder):not(.copy)").forEach((badge) => {
				BDFDB.addObserver(this, badge, {name:"badgeObserver",multi:true}, {characterData:true,subtree:true});
			});
			
			$(BDFDB.dotCN.guilds).on("click." + this.getName(), BDFDB.dotCN.guildseparator + " ~ div" + BDFDB.dotCN.guild + ":not(.folder)", () => {
				if (BDFDB.getData("closeAllFolders", this, "settings")) {
					document.querySelectorAll(".folder.open").forEach(openFolder => {this.openCloseFolder(openFolder);});
				}
			});
			
			setTimeout(() => {
				this.addDragListener();
				this.loadAllFolders();
			},5000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			this.resetAllElements();
			
			BDFDB.unloadMessage(this);
		}
	}

	onSwitch () {
		if (typeof BDFDB === "object") {
			if (BDFDB.getData("forceOpenFolder", this, "settings")) {
				var serverObj = BDFDB.getSelectedServer();
				if (!serverObj) return;
				var folderDiv = this.getFolderOfServer(serverObj);
				if (!folderDiv || folderDiv.classList.contains("open")) return;
				this.openCloseFolder(folderDiv);
			}
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
	}
	
	resetAll () {
		if (confirm("Are you sure you want to delete all folders?")) {
			BDFDB.removeAllData(this, "folders");
			
			this.resetAllElements();
		}
	}
	
	removeAllIcons () {
		if (confirm("Are you sure you want to remove all custom icons?")) {
			BDFDB.removeAllData(this, "customicons");
		}
	}
	
	resetAllElements () {
		$(".foldercontainer").remove();
		$(BDFDB.dotCN.guild + ".folder").remove();
		$(".serverFoldersPreview").remove();
		BDFDB.readServerList().forEach(serverObj => $(serverObj.div).removeAttr("folder").show());
		$(".folderopen, .folderclosing").removeClass("folderopen").removeClass("folderclosing");
		BDFDB.removeLocalStyle("ChannelSizeCorrection");
	}

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_servercontext_serverfolders_text", this.labels.servercontext_serverfolders_text);
		
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_serversubmenu_createfolder_text", this.labels.serversubmenu_createfolder_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_serversubmenu_removefromfolder_text", this.labels.serversubmenu_removefromfolder_text);
		
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_unreadfolder_text", this.labels.foldercontext_unreadfolder_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_autounreadfolder_text", this.labels.foldercontext_autounreadfolder_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_foldersettings_text", this.labels.foldercontext_foldersettings_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_createfolder_text", this.labels.serversubmenu_createfolder_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_removefolder_text", this.labels.foldercontext_removefolder_text);
		
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_foldername_text", this.labels.modal_foldername_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader4_text", this.labels.modal_tabheader4_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_iconpicker_text", this.labels.modal_iconpicker_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_customopen_text", this.labels.modal_customopen_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_customclosed_text", this.labels.modal_customclosed_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_custompreview_text", this.labels.modal_custompreview_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".serverfolders-item")) return;
		var info = BDFDB.getKeyInformation({"node":context, "key":"guild"});
		if (info && BDFDB.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"})) {
			$(context).append(this.serverContextEntryMarkup)
				.on("mouseenter." + this.getName(), ".serverfolders-item", (e) => {
					this.createContextSubMenu(info, e, context);
				});
				
			BDFDB.updateContextPosition(context);
		}
	}
	
	createContextSubMenu (info, e, context) {
		var serverObj = BDFDB.getDivOfServer(info.id);
		
		var serverContextSubMenu = $(this.serverContextSubMenuMarkup);
		
		serverContextSubMenu
			.on("click." + this.getName(), ".createfolder-item", () => {
				$(context).hide();
				this.createNewFolder(serverObj.div);
			});
		
		var folderDiv = this.getFolderOfServer(serverObj);
		if (folderDiv) {
			serverContextSubMenu
				.find(".removefromfolder-item")
				.removeClass(BDFDB.disCN.contextmenuitemdisabled)
				.on("click." + this.getName(), () => {
					$(context).hide();
					this.removeServerFromFolder(serverObj, folderDiv);
				});
		}
		
		BDFDB.appendSubMenu(e.currentTarget, serverContextSubMenu);
	}
	
	addDragListener () {
		$(BDFDB.dotCN.guilds)
			.off("mousedown." + this.getName())
			.on("mousedown." + this.getName(), "div" + BDFDB.dotCN.guild + ":not(.folder):not(.copy)", (e) => {
				if (BDFDB.pressedKeys.includes(17)) {
					e.stopPropagation();
					e.preventDefault();
					var serverObj = this.getParentObject(e.target, BDFDB.disCN.guild);
					if (serverObj && serverObj.div) {
						var serverPreview = serverObj.div.cloneNode(true);
						$(serverPreview)
							.appendTo(BDFDB.dotCN.appmount)
							.addClass("serverFoldersPreview")
							.offset({"left":e.clientX + 5,"top":e.clientY + 5});
						
						$(document)
							.off("mouseup." + this.getName()).off("mousemove." + this.getName())
							.on("mouseup." + this.getName(), (e2) => {
								var folderDiv = this.getParentObject(e2.target, "folder").div;
								if (folderDiv) this.addServerToFolder(serverObj, folderDiv);
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
	
	addServerToFolder (serverObj, folderDiv) {
		var data = BDFDB.loadData(folderDiv.id, this, "folders");
		if (serverObj && data && !data.servers.includes(serverObj.id)) {
			data.servers.push(serverObj.id);
			BDFDB.saveData(folderDiv.id, data, this, "folders");
			$(serverObj.div).attr("folder",folderDiv.id).hide();
			var message = this.labels.toast_addserver_text ? 
							this.labels.toast_addserver_text.replace("${servername}", serverObj.name).replace("${foldername}", data.folderName ? " " + data.folderName : "") : "";
			BDFDB.showToast(message, {type:"success"});
			this.updateCopyInFolderContent(serverObj, folderDiv);
			this.updateFolderNotifications(folderDiv);
		}
	}
	
	removeServerFromFolder (serverObj, folderDiv) {
		var data = BDFDB.loadData(folderDiv.id, this, "folders");
		if (serverObj && data) {
			BDFDB.removeFromArray(data.servers, serverObj.id);
			BDFDB.saveData(folderDiv.id, data, this, "folders");
			$(serverObj.div).removeAttr("folder").show();
			var message = this.labels.toast_removeserver_text ? 
				this.labels.toast_removeserver_text.replace("${servername}", serverObj.name).replace("${foldername}", data.folderName ? " " + data.folderName : "") : "";
			BDFDB.showToast(message, {type:"danger"});
			$(".foldercontainer [guild='" + serverObj.id + "']").remove();
			this.updateFolderNotifications(folderDiv);
		}
	}
	
	createNewFolder (ankerDiv) {
		if (!ankerDiv) return;
		
		var folderID = 		this.generateID("folder", "folders");
		var folderName = 	"";
		var position = 		Array.from(document.querySelectorAll("div" + BDFDB.dotCN.guildseparator + " ~ div" + BDFDB.dotCN.guild)).indexOf(ankerDiv);
		var iconID = 		0;
		var icons = 		this.folderIcons[0];
		var autounread = 	false;
		var color1 = 		["0","0","0"];
		var color2 = 		["255","255","255"];
		var color3 = 		null;
		var color4 = 		null;
		var servers = 		[];
		
		var folderDiv = this.createFolderDiv({folderID,folderName,position,iconID,icons,autounread,color1,color2,color3,color4,servers});
		
		this.showFolderSettings(folderDiv);
		
		this.updateFolderPositions();
	}
	
	loadAllFolders () {
		var folders = BDFDB.loadAllData(this, "folders");
		var sortedFolders = [];
		
		for (var id in folders) {
			sortedFolders[folders[id].position] = folders[id];
		}
		
		for (var i = 0; i < sortedFolders.length; i++) {
			var data = sortedFolders[i];
			if (data) {
				var folderDiv = this.createFolderDiv(data);
				this.readIncludedServerList(folderDiv).forEach((serverObj) => {$(serverObj.div).attr("folder",folderDiv.id).hide();});
			}
		}
	}
	
	createFolderDiv (data) {
		var folderDiv = $(this.folderIconMarkup)[0];
		$(folderDiv).insertBefore(document.querySelectorAll("div" + BDFDB.dotCN.guildseparator + " ~ div" + BDFDB.dotCN.guild)[data.position]);
			
		var avatar = folderDiv.querySelector(BDFDB.dotCN.avataricon);
		
		$(folderDiv)
			.addClass("closed")
			.attr("id", data.folderID)
			.on("mouseenter", () => {this.createFolderToolTip(folderDiv);})
			.on("click", () => {
				if (BDFDB.getData("closeOtherFolders", this, "settings")) {
					document.querySelectorAll(".folder.open").forEach(openFolder => {
						if (openFolder != folderDiv) this.openCloseFolder(openFolder);
					});
				}
				this.openCloseFolder(folderDiv);
			})
			.on("contextmenu", (e) => {
				this.createFolderContextMenu(folderDiv, e);
			})
			.on("mousedown." + this.getName(), (e) => {
				var mouseTimeout = null;
				var folderPreview = folderDiv.cloneNode(true);
				var hoveredElement = null;
				var placeholder = $(`<div class="${BDFDB.disCNS.guild + BDFDB.disCN.guildplaceholder} folder folder-placeholder"></div>`)[0];
				var guildswrap = document.querySelector(BDFDB.dotCN.guilds);
				$(folderPreview)
					.hide()
					.appendTo(BDFDB.dotCN.appmount)
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
							guildswrap.insertBefore(folderDiv, hoveredElement.nextSibling);
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
							hoveredElement = this.getParentObject(e2.target, "folder").div;
							if (hoveredElement) guildswrap.insertBefore(placeholder, hoveredElement.nextSibling);
							else {
								hoveredElement = this.getParentObject(e2.target, BDFDB.disCN.guild).div;
								if (hoveredElement) guildswrap.insertBefore(placeholder, hoveredElement.nextSibling);
							}
							
						});
				},100);
			});
		$(avatar)
			.css("background-image", "url(\"" + data.icons.closedicon + "\")");
		
		BDFDB.saveData(data.folderID, data, this, "folders");
		
		this.updateFolderNotifications(folderDiv);
			
		return folderDiv;
	}
	
	generateID (prefix, dataname) {
		var data = BDFDB.loadAllData(this, dataname);
		var id = prefix + "_" + Math.round(Math.random()*10000000000000000);
		return data[id] ? this.generateID(prefix, dataname) : id;
	}
	
	createFolderContextMenu (folderDiv, e) {
		var folderID = folderDiv.id;
		var data = BDFDB.loadData(folderID, this, "folders");
		if (data) {
			var folderContext = $(this.folderContextMarkup);
			folderContext
				.on("click." + this.getName(), ".autounreadfolder-item", (e2) => {
					var checkbox = $(e2.currentTarget).find("input");
					var isChecked = checkbox.prop("checked");
					checkbox.prop("checked", !isChecked)
					data.autounread = !isChecked;
					BDFDB.saveData(folderID, data, this, "folders");
				})
				.on("click." + this.getName(), ".foldersettings-item", () => {
					folderContext.remove();
					this.showFolderSettings(folderDiv);
				})
				.on("click." + this.getName(), ".createfolder-item", () => {
					folderContext.remove();
					this.createNewFolder(folderDiv);
				})
				.on("click." + this.getName(), ".removefolder-item", () => {
					folderContext.remove();
					this.removeFolder(folderDiv);
				})
				.find(".autounreadfolder-item input").prop("checked", data.autounread);
				
			var unreadServers = BDFDB.readUnreadServerList(this.readIncludedServerList(folderDiv));
			if (unreadServers.length > 0) {
				folderContext
					.find(".unreadfolder-item")
					.removeClass(BDFDB.disCN.contextmenuitemdisabled)
					.on("click." + this.getName(), () => {
						folderContext.remove();
						BDFDB.clearReadNotifications(unreadServers);
					});
			}
			
			BDFDB.appendContextMenu(folderContext[0], e);
		}
	}
	
	createFolderToolTip (folderDiv) {
		var data = BDFDB.loadData(folderDiv.id, this, "folders");
		if (data) {
			if (data.folderName) {
				var bgColor = data.color3 ? BDFDB.color2RGB(data.color3) : "";
				var fontColor = data.color4 ? BDFDB.color2RGB(data.color4) : "";
				BDFDB.createTooltip(data.folderName, folderDiv, {type:"right",selector:"guild-folder-tooltip",style:`color: ${fontColor} !important; background-color: ${bgColor} !important; border-color: ${bgColor} !important;`});
			}
		}
	}
	
	createServerToolTip (serverObj, target, e) {
		var data = BDFDB.loadData(serverObj.id, "EditServers", "servers");
		var text = data ? (data.name ? data.name : serverObj.name) : serverObj.name;
		var bgColor = data ? (data.color3 ? BDFDB.color2RGB(data.color3) : "") : "";
		var fontColor = data ? (data.color4 ? BDFDB.color2RGB(data.color4) : "") : "";
			
		BDFDB.createTooltip(text, target, {type:"right",selector:"guild-custom-tooltip",style:`color: ${fontColor} !important; background-color: ${bgColor} !important; border-color: ${bgColor} !important;`});
	}
	
	showFolderSettings (folderDiv) {
		var folderID = folderDiv.id;
		var data = BDFDB.loadData(folderID, this, "folders");
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
			folderSettingsModal.find(BDFDB.dotCN.modalguildname).text(folderName ? folderName : "");
			folderSettingsModal.find("#input-foldername").val(folderName);
			folderSettingsModal.find("#input-foldername").attr("placeholder", folderName);
			this.setIcons(iconID, folderSettingsModal.find(".icons"));
			BDFDB.setColorSwatches(color1, folderSettingsModal.find(".swatches1"), "swatch1");
			BDFDB.setColorSwatches(color2, folderSettingsModal.find(".swatches2"), "swatch2");
			BDFDB.setColorSwatches(color3, folderSettingsModal.find(".swatches3"), "swatch3");
			BDFDB.setColorSwatches(color4, folderSettingsModal.find(".swatches4"), "swatch4");
			BDFDB.appendModal(folderSettingsModal);
			folderSettingsModal
				.on("change", "input[type='file'][option]", (e) => {
					var file = e.currentTarget.files[0];
					if (file) this.fetchCustomIcon(folderSettingsModal[0], e.currentTarget.getAttribute("option"));
				})
				.on("keyup", "input[type='text'][option]", (e) => {
					if (e.which == 13) this.fetchCustomIcon(folderSettingsModal[0], e.currentTarget.getAttribute("option"));
				})
				.on("click", ".btn-addcustom", (e) => {
					this.saveCustomIcon(folderSettingsModal[0]);
				})
				.on("click", ".btn-save", (e) => {
					folderName = null;
					if (folderSettingsModal.find("#input-foldername").val()) {
						if (folderSettingsModal.find("#input-foldername").val().trim().length > 0) {
							folderName = folderSettingsModal.find("#input-foldername").val().trim();
						}
					}
					
					iconID = folderSettingsModal.find(".ui-icon-picker-icon.selected").attr("value");
			
					color1 = BDFDB.getSwatchColor("swatch1");
					color2 = BDFDB.getSwatchColor("swatch2");
					color3 = BDFDB.getSwatchColor("swatch3");
					color4 = BDFDB.getSwatchColor("swatch4");
					
					if (iconID != data.iconID || !BDFDB.equals(color1, data.color1) || !BDFDB.equals(color2, data.color2)) {
						var folderIcons = this.loadAllIcons();
						var isOpen = folderDiv.classList.contains("open");
						if (!folderSettingsModal.find(".ui-icon-picker-icon.selected").hasClass("custom")) {
							this.changeImgColor(color1, color2, folderIcons[iconID].openicon, (openicon) => {
								icons.openicon = openicon;
								this.changeImgColor(color1, color2, folderIcons[iconID].closedicon, (closedicon) => {
									icons.closedicon = closedicon;
									$(folderDiv).find(BDFDB.dotCN.avataricon).css("background-image", isOpen ? "url(\"" + icons.openicon + "\")" : "url(\"" + icons.closedicon + "\")");
									BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,color1,color2,color3,color4,servers}, this, "folders");
								});
							});
						}
						else {
							icons.openicon = folderIcons[iconID].openicon;
							icons.closedicon = folderIcons[iconID].closedicon;
							$(folderDiv).find(BDFDB.dotCN.avataricon).css("background-image", isOpen ? "url(\"" + icons.openicon + "\")" : "url(\"" + icons.closedicon + "\")");
							BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,color1,color2,color3,color4,servers}, this, "folders");
						}
					}
					else {
						BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,color1,color2,color3,color4,servers}, this, "folders");
					}
					
				});
			folderSettingsModal.find("#input-foldername").focus();
		}
	}
	
	setIcons (selection, wrapper) {
		wrapper.find(".ui-icon-picker-icon").remove();
		
		var folderIcons = this.loadAllIcons();
		
		var icons = 
			`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCN.nowrap}" style="flex: 1 1 auto; margin-top: 5px;">
				<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCN.wrap} ui-icon-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">
					${Object.getOwnPropertyNames(folderIcons).map(id => `<div class="ui-icon-picker-icon${folderIcons[id].customID ? ' custom' : ''}" value="${id}"><div class="ui-picker-inner" style="background-image: url(${folderIcons[id].closedicon});"></div>${folderIcons[id].customID ? '<div value="' + id + '" class="' + BDFDB.disCN.hovercardbutton + '"></div>' : ''}</div>`).join("")}
				</div>
			</div>`;
		$(icons).appendTo(wrapper);
		
		if (!folderIcons[selection]) {
			selection = 0;
		}
		wrapper.find(`.ui-icon-picker-icon[value="${selection}"]`)
			.addClass("selected")
			.css("background-color", "grey");
		
		wrapper
			.off("click").off("mouseenter").off("mouseleave")
			.on("click", ".ui-icon-picker-icon", (e) => {
				if (e.target.classList.contains(BDFDB.disCN.hovercardbutton)) return 
				wrapper.find(".ui-icon-picker-icon.selected")
					.removeClass("selected")
					.css("background-color", "transparent");
				
				$(e.currentTarget)
					.addClass("selected")
					.css("background-color", "grey");
			})
			.on("click", BDFDB.dotCN.hovercardbutton, (e) => {
				BDFDB.removeData(e.currentTarget.getAttribute("value"), this, "customicons");
				e.currentTarget.parentElement.remove();
				BDFDB.showToast(`Custom Icon was deleted.`, {type:"success"});
			})
			.on("mouseenter", ".ui-icon-picker-icon", (e) => {
				$(e.currentTarget).find(".ui-picker-inner").css("background-image", "url(" + folderIcons[e.currentTarget.getAttribute("value")].openicon + ")");
			})
			.on("mouseleave", ".ui-icon-picker-icon", (e) => {
				$(e.currentTarget).find(".ui-picker-inner").css("background-image", "url(" + folderIcons[e.currentTarget.getAttribute("value")].closedicon + ")");
			});
	}
	
	loadAllIcons () {
		var icons = {};
		this.folderIcons.forEach((array,i) => {
			icons[i] = {"openicon":array.openicon,"closedicon":array.closedicon,"customID":null};
		});
		Object.assign(icons, BDFDB.loadAllData(this, "customicons"));
		return icons;
	}
	
	fetchCustomIcon (modal, type) {
		var successFetchIcon;
		var url = modal.querySelector("input[type='text'][option='" + type + "']").value;
		if (url.indexOf("http") == 0) {
			let request = require("request");
			request(url, (error, response, result) => {
				if (response) {
					var type = response.headers["content-type"];
					if (type && type.indexOf("image") > -1) {
						successFetchIcon();
						return;
					}
				}
				BDFDB.showToast("Use a valid direct link to an image source. They usually end on something like .png, .jpg or .gif.", {type:"danger"});
			});
		}
		else {
			let fs = require("fs")
			if (fs.existsSync(url)) {
				fs.readFile(url, (error, response) => {
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
			var iconpreview = modal.querySelector(".ui-icon-picker-icon.preview." + type);
			var iconpreviewinner = iconpreview.querySelector(".ui-picker-inner");
			iconpreview.classList.remove("nopic");
			iconpreview.url = url;
			iconpreviewinner.style.backgroundImage = "url(" + url + ")";
			
			var iconpreviewopen = modal.querySelector(".ui-icon-picker-icon.preview.open");
			var iconpreviewclosed = modal.querySelector(".ui-icon-picker-icon.preview.closed");
			if (!iconpreviewopen.classList.contains("nopic") && !iconpreviewclosed.classList.contains("nopic")) {
				var iconpreviewswitching = modal.querySelector(".ui-icon-picker-icon.preview.switching");
				
				var iconpreviewopeninner = iconpreviewopen.querySelector(".ui-picker-inner");
				var iconpreviewclosedinner = iconpreviewclosed.querySelector(".ui-picker-inner");
				var iconpreviewswitchinginner = iconpreviewswitching.querySelector(".ui-picker-inner");
				
				iconpreviewswitching.classList.remove("nopic");
				iconpreviewswitchinginner.style.backgroundImage = iconpreviewopeninner.style.backgroundImage;
				var switching = true;
				iconpreviewswitching.switchInterval = setInterval(() => {
					switching = !switching; 
					iconpreviewswitchinginner.style.backgroundImage = switching ? iconpreviewopeninner.style.backgroundImage : iconpreviewclosedinner.style.backgroundImage;
				},1000);
			}
		};
	}
		
	saveCustomIcon (modal) {
		var iconpreviewopen = modal.querySelector(".ui-icon-picker-icon.preview.open");
		var iconpreviewclosed = modal.querySelector(".ui-icon-picker-icon.preview.closed");
		var iconpreviewswitching = modal.querySelector(".ui-icon-picker-icon.preview.switching");
		if (!iconpreviewopen.classList.contains("nopic") && !iconpreviewclosed.classList.contains("nopic") && !iconpreviewswitching.classList.contains("nopic")) {
			var customID = this.generateID("customicon", "customicons");
			BDFDB.saveData(customID, {"openicon":iconpreviewopen.url,"closedicon":iconpreviewclosed.url,customID}, this, "customicons");
			modal.querySelectorAll("input[type='text'][option]").forEach((input) => {
				input.value = "";
			});
			
			var iconpreviewopeninner = iconpreviewopen.querySelector(".ui-picker-inner");
			var iconpreviewclosedinner = iconpreviewclosed.querySelector(".ui-picker-inner");
			var iconpreviewswitchinginner = iconpreviewswitching.querySelector(".ui-picker-inner");
			
			iconpreviewopen.classList.add("nopic");
			iconpreviewopeninner.style.backgroundImage = "";
			iconpreviewclosed.classList.add("nopic");
			iconpreviewclosedinner.style.backgroundImage = "";
			iconpreviewswitching.classList.add("nopic");
			iconpreviewswitchinginner.style.backgroundImage = "";
			clearInterval(iconpreviewswitching.switchInterval);
			BDFDB.showToast(`Custom Icon was added to selection.`, {type:"success"});
			this.setIcons(modal.querySelector(".ui-icon-picker-icon.selected").getAttribute("value"), $(modal).find(".icons"));
		}
		else {
			BDFDB.showToast(`Add an image for the open and the closed icon.`, {type:"danger"});
		}
	};
	
	removeFolder (folderDiv) {
		this.readIncludedServerList(folderDiv).forEach((serverObj) => {$(serverObj.div).removeAttr("folder").show();});
		
		BDFDB.removeData(folderDiv.id, this, "folders");
		
		this.closeFolderContent(folderDiv);
		
		folderDiv.remove();
		
		this.updateFolderPositions();
	}
	
	openCloseFolder (folderDiv) {
		var data = BDFDB.loadData(folderDiv.id, this, "folders");
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
						document.body.classList.add("folderopen");
						$(BDFDB.dotCN.guildswrapper).addClass("folderopen");
						$(`<div class="foldercontainer"></div>`).insertBefore(BDFDB.dotCNS.guilds + BDFDB.dotCN.guild + ":first");
					}
					
					for (var i = 0; i < includedServers.length; i++) {
						this.updateCopyInFolderContent(includedServers[i], folderDiv);
					}
					
					if (!alreadyOpen) {
						var guildswrapper = $(BDFDB.dotCN.guildswrapper);
						var guildsscroller = guildswrapper.find(BDFDB.dotCN.guilds);
						
						var ChannelSizeCorrectionCSS = `
							.foldercontainer {
								padding: ${guildsscroller.css("padding")};
								margin: ${guildsscroller.css("margin")};
							}`;
							
						if (guildswrapper.outerHeight() > guildswrapper.outerWidth()) {
							var columnamount = Math.floor((guildswrapper.outerWidth() - guildsscroller.css("padding-left").replace("px","")) / $(folderDiv).outerWidth());
							ChannelSizeCorrectionCSS +=	`
								.foldercontainer {
									width: ${guildswrapper.outerWidth() / columnamount}px;
									left: ${guildswrapper.outerWidth()}px;
									overflow-x: hidden !important;
									overflow-y: scroll !important;
								}
								${BDFDB.dotCN.guildswrapper}.folderopen,
								${BDFDB.dotCN.guildswrapper}.folderopen ${BDFDB.dotCN.scrollerwrapold},
								${BDFDB.dotCN.guildswrapper}.folderopen ${BDFDB.dotCN.guilds} {
									width: ${guildswrapper.outerWidth() + (guildswrapper.outerWidth() / columnamount)}px;
									animation: SFwrapperOpen .3s 1 linear;
								}
								${BDFDB.dotCN.guildswrapper}.folderclosing,
								${BDFDB.dotCN.guildswrapper}.folderclosing ${BDFDB.dotCN.scrollerwrapold},
								${BDFDB.dotCN.guildswrapper}.folderclosing ${BDFDB.dotCN.guilds} {
									width: ${guildswrapper.outerWidth()}px;
									animation: SFwrapperClosing .3s 1 linear;
								}
								@keyframes SFwrapperOpen {
									0% {
										width: ${guildswrapper.outerWidth()}px;
									}
									100% {
										width: ${guildswrapper.outerWidth() + (guildswrapper.outerWidth() / columnamount)}px;
									}
								}
								@keyframes SFwrapperClosing {
									0% {
										width: ${guildswrapper.outerWidth() + (guildswrapper.outerWidth() / columnamount)}px;
									}
									100% {
										width: ${guildswrapper.outerWidth()}px;
									}
								}`;
						}
						else {
							var rowamount = Math.floor((guildswrapper.outerHeight() - guildsscroller.css("padding-bottom").replace("px","")) / $(folderDiv).outerHeight());
							ChannelSizeCorrectionCSS +=	`
								.foldercontainer ${BDFDB.dotCN.guild} {
									display: inline-block !important;
								}
								
								.foldercontainer {
									height: ${guildswrapper.outerHeight() / rowamount}px;
									bottom: ${guildswrapper.outerHeight()}px;
									overflow-x: scroll !important;
									overflow-y: hidden !important;
								}
								
								${BDFDB.dotCN.guildswrapper}.folderopen,
								${BDFDB.dotCN.guildswrapper}.folderopen ${BDFDB.dotCN.scrollerwrapold},
								${BDFDB.dotCN.guildswrapper}.folderopen ${BDFDB.dotCN.guilds} {
									height: ${guildswrapper.outerHeight() + (guildswrapper.outerHeight() / rowamount)}px;
									animation: SFwrapperOpen .3s 1 linear;
								}
								${BDFDB.dotCN.guildswrapper}.folderclosing,
								${BDFDB.dotCN.guildswrapper}.folderclosing ${BDFDB.dotCN.scrollerwrapold},
								${BDFDB.dotCN.guildswrapper}.folderclosing ${BDFDB.dotCN.guilds} {
									height: ${guildswrapper.outerHeight()}px;
									animation: SFwrapperClosing .3s 1 linear;
								}
								@keyframes SFwrapperOpen {
									0% {
										height: ${guildswrapper.outerHeight()}px;
									}
									100% {
										height: ${guildswrapper.outerHeight() + (guildswrapper.outerHeight() / rowamount)}px ;
									}
								@keyframes SFwrapperClosing {
									0% {
										height: ${guildswrapper.outerHeight() + (guildswrapper.outerHeight() / rowamount)}px;
									}
									100% {
										height: ${guildswrapper.outerHeight()}px;
									}
								}`;
						}
						
						BDFDB.appendLocalStyle("ChannelSizeCorrection", ChannelSizeCorrectionCSS);
					}
				}
				else return; // nothing to do when closed and empty
			}
			else {
				this.closeFolderContent(folderDiv);
			}
			
			$(folderDiv).find(BDFDB.dotCN.avataricon).css("background-image", !isOpen ? "url(\"" + data.icons.openicon + "\")" : "url(\"" + data.icons.closedicon + "\")");
		}
	}
	
	updateCopyInFolderContent (serverObj, folderDiv) {
		if (!serverObj) return;
		var foldercontainer = document.querySelector(".foldercontainer");
		if (foldercontainer && folderDiv.classList.contains("open")) {
			var oldCopy = foldercontainer.querySelector("[guild='" + serverObj.id + "']");
			if (oldCopy) {
				foldercontainer.insertBefore(this.createCopyOfServer(serverObj, folderDiv), oldCopy);
				oldCopy.remove();
			}
			else {
				var sameFolderCopies = foldercontainer.querySelectorAll("[folder='" + folderDiv.id + "']");
				var insertNode = sameFolderCopies.length > 0 ? sameFolderCopies[sameFolderCopies.length-1].nextSibling : null;
				foldercontainer.insertBefore(this.createCopyOfServer(serverObj, folderDiv), insertNode);
			}
		}
	}
	
	createCopyOfServer (serverObj, folderDiv) {
		var serverDiv = serverObj.div;
		var foldercontainer = document.querySelector(".foldercontainer");
		var serverCopy = serverDiv.cloneNode(true);
		$(serverCopy)
			.attr("guild", serverObj.id)
			.addClass("copy")
			.css("display", "")
			.on("mouseenter." + this.getName(), (e) => {this.createServerToolTip(serverObj, serverCopy, e);})
			.on("click." + this.getName(), (e) => {
				e.preventDefault();
				if (BDFDB.pressedKeys.includes(46)) {
					this.removeServerFromFolder(serverObj, folderDiv);
				}
				else {
					var settings = BDFDB.getAllData(this, "settings");
					if (settings.closeAllFolders) {
						document.querySelectorAll(".folder.open").forEach(openFolder => {
							this.openCloseFolder(openFolder);
						});
					}
					else if (settings.closeTheFolder) {
						this.openCloseFolder(folderDiv);
					}
					serverDiv.querySelector("a").click();
				}
			})
			.on("contextmenu." + this.getName(), (e) => {
				var handleContextMenu = BDFDB.getKeyInformation({"node":serverDiv.firstElementChild, "key":"handleContextMenu"});
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
				var serverPreview = serverDiv.cloneNode(true);
				var hoveredCopy = null;
				var placeholder = $(`<div class="${BDFDB.disCNS.guild + BDFDB.disCN.guildplaceholder} copy copy-placeholder"></div>`)[0];
				$(serverPreview)
					.appendTo(BDFDB.dotCN.appmount)
					.addClass("serverFoldersPreview")
					.offset({"left":e.clientX + 5,"top":e.clientY + 5});
				
				$(document)
					.off("mouseup." + this.getName())
					.on("mouseup." + this.getName(), (e2) => {
						clearTimeout(mouseTimeout);
						placeholder.remove();
						serverPreview.remove();
						$(serverCopy).css("display","");
						var newFolderDiv = this.getParentObject(e2.target, "folder").div;
						if (newFolderDiv && newFolderDiv != folderDiv) {
							this.removeServerFromFolder(serverObj, folderDiv);
							this.addServerToFolder(serverObj, newFolderDiv);
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
								hoveredCopy = this.getParentObject(e2.target, "copy").div;
								if (hoveredCopy && hoveredCopy.getAttribute("folder") == folderDiv.id) {
									foldercontainer.insertBefore(placeholder, hoveredCopy.nextSibling);
								}
								else hoveredCopy = null;
							}
						});
				},100);
			})
			.find("a").attr("draggable","false");
		return serverCopy;
	}
	
	closeFolderContent (folderDiv) {
		$(folderDiv)
			.removeClass("open")
			.addClass("closed");
			
		let servers = $(".foldercontainer [folder='" + folderDiv.id + "']");
		servers.removeAttr("folder");
		var foldercontainer = document.querySelector(".foldercontainer");
		if (foldercontainer && !foldercontainer.querySelector("[folder]")) {
			$(".folderopen").addClass("folderclosing");
			setTimeout(() => {
				$(".folderclosing").removeClass("folderclosing");
				if (!document.querySelector(".folder.open")) {
					$(".folderopen").removeClass("folderopen");
					foldercontainer.remove();
					BDFDB.removeLocalStyle("ChannelSizeCorrection");
				}
				else servers.remove();
			}, 300);
		}
		else servers.remove();
	}
	
	updateFolderPositions () {
		var serverAndFolders = document.querySelectorAll("div" + BDFDB.dotCN.guildseparator + " ~ div" + BDFDB.dotCN.guild);
		for (let i = 0; i < serverAndFolders.length; i++) {
			var folderDiv = this.getParentObject(serverAndFolders[i], "folder").div;
			if (folderDiv) {
				var folderID = folderDiv.id;
				var data = BDFDB.loadData(folderID, this, "folders");
				if (data) {
					data.position = i;
					BDFDB.saveData(folderID, data, this, "folders");
				}
			}
		}
	}	
	
	updateServerPositions (folderDiv) {
		var data = BDFDB.loadData(folderDiv.id, this, "folders");
		if (data) {
			var serversInData = data.servers;
			var serversInFolder = Array.from(document.querySelectorAll(".foldercontainer [folder='" + folderDiv.id + "']")).map(server => {return server.getAttribute("guild");});
			for (var i = 0; i < serversInFolder.length; i++) {
				BDFDB.removeFromArray(serversInData, serversInFolder[i]);
			}
			data.servers = serversInFolder.concat(serversInData);
			BDFDB.saveData(folderDiv.id, data, this, "folders");
		}
	}	
	
	updateFolderNotifications (folderDiv) {
		var data = BDFDB.loadData(folderDiv.id, this, "folders");
		if (data) {
			var includedServers = this.readIncludedServerList(folderDiv);
			var unreadServers = BDFDB.readUnreadServerList(includedServers);
			if (unreadServers.length > 0 && data.autounread) {
				BDFDB.clearReadNotifications(unreadServers);
			}
			else {
				var badgeAmount = 0;
				var audioEnabled = false;
				var videoEnabled = false;
				
				includedServers.forEach((serverObj) => {
					let badge = serverObj.div.querySelector(BDFDB.dotCN.badge);
					if (badge) badgeAmount += parseInt(badge.innerText);
					if (serverObj.div.classList.contains(BDFDB.disCN.guildaudio)) audioEnabled = true;
					if (serverObj.div.classList.contains(BDFDB.disCN.guildvideo)) videoEnabled = true;
				});
				
				$(folderDiv)
					.toggleClass(BDFDB.disCN.guildunread, unreadServers.length > 0)
					.toggleClass(BDFDB.disCN.guildaudio, audioEnabled)
					.toggleClass(BDFDB.disCN.guildvideo, videoEnabled);
				$(folderDiv)
					.find(".folder" + BDFDB.dotCN.badge + ".notifications")
						.toggle(badgeAmount > 0)
						.text(badgeAmount);	
				$(folderDiv)
					.find(".folder" + BDFDB.dotCN.badge + ".count")
						.toggle(includedServers.length > 0 && BDFDB.getData("showCountBadge", this, "settings"))
						.text(includedServers.length);	
			
				if (folderDiv.classList.contains("open") && !document.querySelector(".foldercontainer [folder='" + folderDiv.id + "']")) this.openCloseFolder(folderDiv);
			}
		}
	}
	
	getParentObject (div, type) {
		if (!div) return {div:null};
		if (document.querySelector(BDFDB.dotCN.dms) && document.querySelector(BDFDB.dotCN.dms).contains(div)) return {div:null};
		if (div.tagName && div.querySelector(BDFDB.dotCN.guildserror)) return {div:null};
		if (div.classList && div.classList.length > 0 && (div.classList.contains(BDFDB.disCN.guilds) || div.classList.contains("serverFoldersPreview"))) return {div:null};
		if (div.classList && div.classList.length > 0 && div.classList.contains(BDFDB.disCN.guild) && div.classList.contains(type) && div.querySelector(BDFDB.dotCN.avataricon)) {
			if (type == BDFDB.disCN.guild) {
				var info = BDFDB.getKeyInformation({"node":div, "key":"guild"});
				if (info) return Object.assign({},info,{div:div,data:info});
			}
			else {
				return {div};
			}
		}
		return this.getParentObject(div.parentElement, type);
	}
	
	getFolderOfServer (serverObj) {
		if (!serverObj) return;
		var folders = BDFDB.loadAllData(this, "folders");
		for (var id in folders) {
			var serverIDs = folders[id].servers;
			for (var i = 0; serverIDs.length > i; i++) {
				if (serverIDs[i] == serverObj.id) return document.querySelector("#" + folders[id].folderID);
			}
		}
		return null;
	}
	
	readIncludedServerList (folderDiv) {
		var data = BDFDB.loadData(folderDiv.id, this, "folders");
		var includedServers = [];
		if (data) {
			var serverIDs = data.servers;
			for (var i = 0; serverIDs.length > i; i++) {
				var serverObj = BDFDB.getDivOfServer(serverIDs[i]);
				if (serverObj && serverObj.div) includedServers.push(serverObj);
			}
		}
		return includedServers;
	}
	
	changeImgColor (color1, color2, icon, callback) {
		color1 = BDFDB.color2COMP(color1);
		color2 = BDFDB.color2COMP(color2);
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
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					toast_addserver_text:					"${servername} je dodan u mapu${foldername}.",
					toast_removeserver_text:				"${servername} je uklonjena iz mape${foldername}.",
					servercontext_serverfolders_text:		"Poslužitelj mapu",
					serversubmenu_createfolder_text:		"Izradi mapu",
					serversubmenu_removefromfolder_text:	"Ukloni poslužitelj iz mape",
					foldercontext_unreadfolder_text:		"Označi sve kao pročitano",
					foldercontext_autounreadfolder_text:	"Auto: Označite kao pročitano",
					foldercontext_foldersettings_text:		"Postavke map",
					foldercontext_removefolder_text:		"Izbriši mapu",
					modal_header_text:						"Postavke mapa",
					modal_foldername_text:					"Naziv mape",
					modal_tabheader1_text:					"Mape",
					modal_tabheader2_text:					"Boja mape",
					modal_tabheader3_text:					"Boja tooltip",
					modal_tabheader4_text:					"Prilagođeni ikona",
					modal_iconpicker_text:					"Odabir mape",
					modal_colorpicker1_text:				"Boja primarne mape",
					modal_colorpicker2_text:				"Boja sekundarne mape",
					modal_colorpicker3_text:				"Boja tooltip",
					modal_colorpicker4_text:				"Boja fonta",
					modal_customopen_text:					"Otvori ikona",
					modal_customclosed_text:				"Zatvorena ikona",
					modal_custompreview_text:				"Pregled ikona",
					btn_cancel_text:						"Prekid",
					btn_save_text:							"Uštedjeti"
				};
			case "da":		//danish
				return {
					toast_addserver_text:					"${servername} er blevet tilføjet til mappe${foldername}.",
					toast_removeserver_text:				"${servername} er blevet fjernet fra mappen${foldername}.",
					servercontext_serverfolders_text:		"Servermapper",
					serversubmenu_createfolder_text:		"Opret mappe",
					serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
					foldercontext_unreadfolder_text:		"Markér alle som læst",
					foldercontext_autounreadfolder_text:	"Auto: Markér som læst",
					foldercontext_foldersettings_text:		"Mappeindstillinger",
					foldercontext_removefolder_text:		"Slet mappe",
					modal_header_text:						"Mappindstillinger",
					modal_foldername_text:					"Mappenavn",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarve",
					modal_tabheader3_text:					"Tooltipfarve",
					modal_tabheader4_text:					"Brugerdefinerede ikoner",
					modal_iconpicker_text:					"Mappevalg",
					modal_colorpicker1_text:				"Primær mappefarve",
					modal_colorpicker2_text:				"Sekundær mappefarve",
					modal_colorpicker3_text:				"Tooltipfarve",
					modal_colorpicker4_text:				"Skriftfarve",
					modal_customopen_text:					"Åbn ikon",
					modal_customclosed_text:				"Lukket ikon",
					modal_custompreview_text:				"Ikon forhåndsvisning",
					btn_cancel_text:						"Afbryde",
					btn_save_text:							"Spare"
				};
			case "de":		//german
				return {
					toast_addserver_text:					"${servername} wurde dem Ordner${foldername} hinzugefügt.",
					toast_removeserver_text:				"${servername} wurde aus dem Ordner${foldername} entfernt.",
					servercontext_serverfolders_text:		"Serverordner",
					serversubmenu_createfolder_text:		"Ordner erzeugen",
					serversubmenu_removefromfolder_text:	"Server aus Ordner entfernen",
					foldercontext_unreadfolder_text:		"Alle als gelesen markieren",
					foldercontext_autounreadfolder_text:	"Auto: Als gelesen markieren",
					foldercontext_foldersettings_text:		"Ordnereinstellungen",
					foldercontext_removefolder_text:		"Ordner löschen",
					modal_header_text:						"Ordnereinstellungen",
					modal_foldername_text:					"Ordnername",
					modal_tabheader1_text:					"Ordner",
					modal_tabheader2_text:					"Ordnerfarbe",
					modal_tabheader3_text:					"Tooltipfarbe",
					modal_tabheader4_text:					"Eigene Icons",
					modal_iconpicker_text:					"Ordnerauswahl",
					modal_colorpicker1_text:				"Primäre Ordnerfarbe",
					modal_colorpicker2_text:				"Sekundäre Ordnerfarbe",
					modal_colorpicker3_text:				"Tooltipfarbe",
					modal_colorpicker4_text:				"Schriftfarbe",
					modal_customopen_text:					"Geöffnetes Icon",
					modal_customclosed_text:				"Geschlossenes Icon",
					modal_custompreview_text:				"Iconvorschau",
					btn_cancel_text:						"Abbrechen",
					btn_save_text:							"Speichern"
				};
			case "es":		//spanish
				return {
					toast_addserver_text:					"${servername} ha sido agregado a la carpeta${foldername}.",
					toast_removeserver_text:				"${servername} ha sido eliminado de la carpeta${foldername}.",
					servercontext_serverfolders_text:		"Carpetas de servidor",
					serversubmenu_createfolder_text:		"Crear carpeta",
					serversubmenu_removefromfolder_text:	"Eliminar servidor de la carpeta",
					foldercontext_unreadfolder_text:		"Marcar todo como leido",
					foldercontext_autounreadfolder_text:	"Auto: Marcar como leído",
					foldercontext_foldersettings_text:		"Ajustes de carpeta",
					foldercontext_removefolder_text:		"Eliminar carpeta",
					modal_header_text:						"Ajustes de carpeta",
					modal_foldername_text:					"Nombre de la carpeta",
					modal_tabheader1_text:					"Carpeta",
					modal_tabheader2_text:					"Color de carpeta",
					modal_tabheader3_text:					"Color de tooltip",
					modal_tabheader4_text:					"Iconos personalizados",
					modal_iconpicker_text:					"Selección de carpeta",
					modal_colorpicker1_text:				"Color primaria de carpeta",
					modal_colorpicker2_text:				"Color secundario de la carpeta",
					modal_colorpicker3_text:				"Color de tooltip",
					modal_colorpicker4_text:				"Color de fuente",
					modal_customopen_text:					"Ícono abierto",
					modal_customclosed_text:				"Icono cerrado",
					modal_custompreview_text:				"Vista previa del icono",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Guardar"
				};
			case "fr":		//french
				return {
					toast_addserver_text:					"${servername} a été ajouté au dossier${foldername}.",
					toast_removeserver_text:				"${servername} a été supprimé du dossier${foldername}.",
					servercontext_serverfolders_text:		"Dossiers du serveur",
					serversubmenu_createfolder_text:		"Créer le dossier",
					serversubmenu_removefromfolder_text:	"Supprimer le serveur du dossier",
					foldercontext_unreadfolder_text:		"Tout marquer comme lu",
					foldercontext_autounreadfolder_text:	"Auto: Marquer comme lu",
					foldercontext_foldersettings_text:		"Paramètres du dossier",
					foldercontext_removefolder_text:		"Supprimer le dossier",
					modal_header_text:						"Paramètres du dossier",
					modal_foldername_text:					"Nom de dossier",
					modal_tabheader1_text:					"Dossier",
					modal_tabheader2_text:					"Couleur du dossier",
					modal_tabheader3_text:					"Couleur de tooltip",
					modal_tabheader4_text:					"Icônes personnalisées",
					modal_iconpicker_text:					"Choix du dossier",
					modal_colorpicker1_text:				"Couleur primaire du dossier",
					modal_colorpicker2_text:				"Couleur secondaire du dossier",
					modal_colorpicker3_text:				"Couleur de tooltip",
					modal_colorpicker4_text:				"Couleur de la police",
					modal_customopen_text:					"Icône ouverte",
					modal_customclosed_text:				"Icône fermée",
					modal_custompreview_text:				"Aperçu de l'icône",
					btn_cancel_text:						"Abandonner",
					btn_save_text:							"Enregistrer"
				};
			case "it":		//italian
				return {
					toast_addserver_text:					"${servername} è stato aggiunto alla cartella${foldername}.",
					toast_removeserver_text:				"${servername} è stato rimosso dalla cartella${foldername}.",
					servercontext_serverfolders_text:		"Cartelle del server",
					serversubmenu_createfolder_text:		"Creare una cartella",
					serversubmenu_removefromfolder_text:	"Rimuovere il server dalla cartella",
					foldercontext_unreadfolder_text:		"Segna tutti come letti",
					foldercontext_autounreadfolder_text:	"Auto: Contrassegna come letto",
					foldercontext_foldersettings_text:		"Impostazioni cartella",
					foldercontext_removefolder_text:		"Elimina cartella",
					modal_header_text:						"Impostazioni cartella",
					modal_foldername_text:					"Nome della cartella",
					modal_tabheader1_text:					"Cartella",
					modal_tabheader2_text:					"Colore della cartella",
					modal_tabheader3_text:					"Colore della tooltip",
					modal_tabheader4_text:					"Icone personalizzate",
					modal_iconpicker_text:					"Selezione della cartella",
					modal_colorpicker1_text:				"Colore primaria della cartella",
					modal_colorpicker2_text:				"Colore secondaria della cartella",
					modal_colorpicker3_text:				"Colore della tooltip",
					modal_colorpicker4_text:				"Colore del carattere",
					modal_customopen_text:					"Icona aperta",
					modal_customclosed_text:				"Icona chiusa",
					modal_custompreview_text:				"Icona anteprima",
					btn_cancel_text:						"Cancellare",
					btn_save_text:							"Salvare"
				};
			case "nl":		//dutch
				return {
					toast_addserver_text:					"${servername} is toegevoegd aan de map${foldername}.",
					toast_removeserver_text:				"${servername} is verwijderd uit de map${foldername}.",
					servercontext_serverfolders_text:		"Servermappen",
					serversubmenu_createfolder_text:		"Map aanmaken",
					serversubmenu_removefromfolder_text:	"Server uit map verwijderen",
					foldercontext_unreadfolder_text:		"Alles als gelezen markeren",
					foldercontext_autounreadfolder_text:	"Auto: Markeren als gelezen",
					foldercontext_foldersettings_text:		"Mapinstellingen",
					foldercontext_removefolder_text:		"Verwijder map",
					modal_header_text:						"Mapinstellingen",
					modal_foldername_text:					"Mapnaam",
					modal_tabheader1_text:					"Map",
					modal_tabheader2_text:					"Mapkleur",
					modal_tabheader3_text:					"Tooltipkleur",
					modal_tabheader4_text:					"Aangepaste keuze",
					modal_iconpicker_text:					"Map keuze",
					modal_colorpicker1_text:				"Primaire mapkleur",
					modal_colorpicker2_text:				"Tweede mapkleur",
					modal_colorpicker3_text:				"Tooltipkleur",
					modal_colorpicker4_text:				"Doopvontkleur",
					modal_customopen_text:					"Geopende keuze",
					modal_customclosed_text:				"Gesloten keuze",
					modal_custompreview_text:				"Voorbeeld van keuze",
					btn_cancel_text:						"Afbreken",
					btn_save_text:							"Opslaan"
				};
			case "no":		//norwegian
				return {
					toast_addserver_text:					"${servername} er lagt til i mappe${foldername}.",
					toast_removeserver_text:				"${servername} er fjernet fra mappen${foldername}.",
					servercontext_serverfolders_text:		"Servermapper",
					serversubmenu_createfolder_text:		"Lag mappe",
					serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
					foldercontext_unreadfolder_text:		"Marker alle som lest",
					foldercontext_autounreadfolder_text:	"Auto: Merk som les",
					foldercontext_foldersettings_text:		"Mappinnstillinger",
					foldercontext_removefolder_text:		"Slett mappe",
					modal_header_text:						"Mappinnstillinger",
					modal_foldername_text:					"Mappenavn",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarge",
					modal_tabheader3_text:					"Tooltipfarge",
					modal_tabheader4_text:					"Tilpassede ikoner",
					modal_iconpicker_text:					"Mappevalg",
					modal_colorpicker1_text:				"Primær mappefarge",
					modal_colorpicker2_text:				"Sekundær mappefarge",
					modal_colorpicker3_text:				"Tooltipfarge",
					modal_colorpicker4_text:				"Skriftfarge",
					modal_customopen_text:					"Åpnet ikon",
					modal_customclosed_text:				"Lukket ikon",
					modal_custompreview_text:				"Ikon forhåndsvisning",
					btn_cancel_text:						"Avbryte",
					btn_save_text:							"Lagre"
				};
			case "pl":		//polish
				return {
					toast_addserver_text:					"${servername} został dodany do folderu${foldername}.",
					toast_removeserver_text:				"${servername} został usunięty z folderu${foldername}.",
					servercontext_serverfolders_text:		"Foldery serwera",
					serversubmenu_createfolder_text:		"Utwórz folder",
					serversubmenu_removefromfolder_text:	"Usuń serwer z folderu",
					foldercontext_unreadfolder_text:		"Oznacz wszystkie jako przeczytane",
					foldercontext_autounreadfolder_text:	"Auto: Oznacz jako przeczytane",
					foldercontext_foldersettings_text:		"Ustawienia folderu",
					foldercontext_removefolder_text:		"Usuń folder",
					modal_header_text:						"Ustawienia folderu",
					modal_foldername_text:					"Nazwa folderu",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Kolor folderu",
					modal_tabheader3_text:					"Kolor podpowiedzi",
					modal_tabheader4_text:					"Niestandardowe ikony",
					modal_iconpicker_text:					"Wybór folderu",
					modal_colorpicker1_text:				"Podstawowy kolor folderu",
					modal_colorpicker2_text:				"Drugorzędny kolor folderu",
					modal_colorpicker3_text:				"Kolor podpowiedzi",
					modal_colorpicker4_text:				"Kolor czcionki",
					modal_customopen_text:					"Otwarta ikona",
					modal_customclosed_text:				"Zamknięta ikona",
					modal_custompreview_text:				"Podgląd ikony",
					btn_cancel_text:						"Anuluj",
					btn_save_text:							"Zapisz"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					toast_addserver_text:					"${servername} foi adicionado à pasta${foldername}.",
					toast_removeserver_text:				"${servername} foi removido da pasta${foldername}.",
					servercontext_serverfolders_text:		"Pastas de servidores",
					serversubmenu_createfolder_text:		"Criar pasta",
					serversubmenu_removefromfolder_text:	"Remover servidor da pasta",
					foldercontext_unreadfolder_text:		"Marcar tudo como lido",
					foldercontext_autounreadfolder_text:	"Auto: Marcar como lido",
					foldercontext_foldersettings_text:		"Configurações da pasta",
					foldercontext_removefolder_text:		"Excluir pasta",
					modal_header_text:						"Configurações da pasta",
					modal_foldername_text:					"Nome da pasta",
					modal_tabheader1_text:					"Pasta",
					modal_tabheader2_text:					"Cor da pasta",
					modal_tabheader3_text:					"Cor da tooltip",
					modal_tabheader4_text:					"Ícones personalizados",
					modal_iconpicker_text:					"Escolha da pasta",
					modal_colorpicker1_text:				"Cor primária da pasta",
					modal_colorpicker2_text:				"Cor secundária da pasta",
					modal_colorpicker3_text:				"Cor da tooltip",
					modal_colorpicker4_text:				"Cor da fonte",
					modal_customopen_text:					"Ícone aberto",
					modal_customclosed_text:				"Ícone fechado",
					modal_custompreview_text:				"Pré-visualização de ícones",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Salvar"
				};
			case "fi":		//finnish
				return {
					toast_addserver_text:					"${servername} on lisätty kansioon${foldername}.",
					toast_removeserver_text:				"${servername} on poistettu kansioon${foldername}.",
					servercontext_serverfolders_text:		"Palvelinkansiot",
					serversubmenu_createfolder_text:		"Luo kansio",
					serversubmenu_removefromfolder_text:	"Poista palvelin kansioista",
					foldercontext_unreadfolder_text:		"Merkitse kaikki luetuksi",
					foldercontext_autounreadfolder_text:	"Auto: merkitse luettavaksi",
					foldercontext_foldersettings_text:		"Kansion kansio",
					foldercontext_removefolder_text:		"Poista kansio",
					modal_header_text:						"Kansion kansio",
					modal_foldername_text:					"Kansion nimi",
					modal_tabheader1_text:					"Kansio",
					modal_tabheader2_text:					"Kansionväri",
					modal_tabheader3_text:					"Tooltipväri",
					modal_tabheader4_text:					"Mukautetut kuvakkeet",
					modal_iconpicker_text:					"Kansion valinta",
					modal_colorpicker1_text:				"Ensisijainen kansionväri",
					modal_colorpicker2_text:				"Toissijainen kansionväri",
					modal_colorpicker3_text:				"Tooltipväri",
					modal_colorpicker4_text:				"Fontinväri",
					modal_customopen_text:					"Avattu kuvake",
					modal_customclosed_text:				"Suljettu kuvake",
					modal_custompreview_text:				"Kuvakkeen esikatselu",
					btn_cancel_text:						"Peruuttaa",
					btn_save_text:							"Tallentaa"
				};
			case "sv":		//swedish
				return {
					toast_addserver_text:					"${servername} har lagts till i mapp${foldername}.",
					toast_removeserver_text:				"${servername} har tagits bort från mappen${foldername}.",
					servercontext_serverfolders_text:		"Servermappar",
					serversubmenu_createfolder_text:		"Skapa mapp",
					serversubmenu_removefromfolder_text:	"Ta bort servern från mappen",
					foldercontext_unreadfolder_text:		"Markera allt som läst",
					foldercontext_autounreadfolder_text:	"Auto: Markera som Läs",
					foldercontext_foldersettings_text:		"Mappinställningar",
					foldercontext_removefolder_text:		"Ta bort mapp",
					modal_header_text:						"Mappinställningar",
					modal_foldername_text:					"Mappnamn",
					modal_tabheader1_text:					"Mapp",
					modal_tabheader2_text:					"Mappfärg",
					modal_tabheader3_text:					"Tooltipfärg",
					modal_tabheader4_text:					"Anpassade ikoner",
					modal_iconpicker_text:					"Mappval",
					modal_colorpicker1_text:				"Primär mappfärg",
					modal_colorpicker2_text:				"Sekundär mappfärg",
					modal_colorpicker3_text:				"Tooltipfärg",
					modal_colorpicker4_text:				"Fontfärg",
					modal_customopen_text:					"Öppnad ikon",
					modal_customclosed_text:				"Closed Icon",
					modal_custompreview_text:				"Ikon förhandsvisning",
					btn_cancel_text:						"Avbryta",
					btn_save_text:							"Spara"
				};
			case "tr":		//turkish
				return {
					toast_addserver_text:					"${servername} klasörü${foldername} eklendi.",
					toast_removeserver_text:				"${servername} klasörü${foldername} kaldırıldı",
					servercontext_serverfolders_text:		"Sunucu klasörleri",
					serversubmenu_createfolder_text:		"Klasör oluşturun",
					serversubmenu_removefromfolder_text:	"Sunucuyu klasörden kaldır",
					foldercontext_unreadfolder_text:		"Tümünü Oku olarak işaretle",
					foldercontext_autounreadfolder_text:	"Oto: Okundu Olarak İşaretle",
					foldercontext_foldersettings_text:		"Klasör Ayarları",
					foldercontext_removefolder_text:		"Klasörü sil",
					modal_header_text:						"Klasör Ayarları",
					modal_foldername_text:					"Klasör adı",
					modal_tabheader1_text:					"Klasör",
					modal_tabheader2_text:					"Klasör rengi",
					modal_tabheader3_text:					"Tooltip rengi",
					modal_tabheader4_text:					"Özel simgeler",
					modal_iconpicker_text:					"Klasör seçimi",
					modal_colorpicker1_text:				"Birincil klasör rengi",
					modal_colorpicker2_text:				"İkincil klasör rengi",
					modal_colorpicker3_text:				"Tooltip rengi",
					modal_colorpicker4_text:				"Yazı rengi",
					modal_customopen_text:					"Açılmış simge",
					modal_customclosed_text:				"Kapalı simge",
					modal_custompreview_text:				"Simge önizleme",
					btn_cancel_text:						"Iptal",
					btn_save_text:							"Kayıt"
				};
			case "cs":		//czech
				return {
					toast_addserver_text:					"${servername} byl přidán do složky${foldername}.",
					toast_removeserver_text:				"${servername} byl odstraněn ze složky${foldername}.",
					servercontext_serverfolders_text:		"Složky serveru",
					serversubmenu_createfolder_text:		"Vytvořit složky",
					serversubmenu_removefromfolder_text:	"Odstranit server ze složky",
					foldercontext_unreadfolder_text:		"Označit vše jako přečtené",
					foldercontext_autounreadfolder_text:	"Auto: Označit jako přečtené",
					foldercontext_foldersettings_text:		"Nastavení složky",
					foldercontext_removefolder_text:		"Smazat složky",
					modal_header_text:						"Nastavení složky",
					modal_foldername_text:					"Název složky",
					modal_tabheader1_text:					"Složky",
					modal_tabheader2_text:					"Barva složky",
					modal_tabheader3_text:					"Barva tooltip",
					modal_tabheader4_text:					"Vlastní ikony",
					modal_iconpicker_text:					"Volba složky",
					modal_colorpicker1_text:				"Primární barva složky",
					modal_colorpicker2_text:				"Sekundární barva složky",
					modal_colorpicker3_text:				"Barva tooltip",
					modal_colorpicker4_text:				"Barva fontu",
					modal_customopen_text:					"Otevřená ikona",
					modal_customclosed_text:				"Uzavřená ikona",
					modal_custompreview_text:				"Náhled ikony",
					btn_cancel_text:						"Zrušení",
					btn_save_text:							"Uložit"
				};
			case "bg":		//bulgarian
				return {
					toast_addserver_text:					"${servername} е добавен към папката${foldername}.",
					toast_removeserver_text:				"${servername} е премахнат от папката${foldername}.",
					servercontext_serverfolders_text:		"Сървърни папки",
					serversubmenu_createfolder_text:		"Създай папка",
					serversubmenu_removefromfolder_text:	"Премахване на сървър от папка",
					foldercontext_unreadfolder_text:		"Маркирай всички като прочетени",
					foldercontext_autounreadfolder_text:	"Авто: Маркиране като четене",
					foldercontext_foldersettings_text:		"Настройки папка",
					foldercontext_removefolder_text:		"Изтриване на папка",
					modal_header_text:						"Настройки папка",
					modal_foldername_text:					"Име на папка",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвят на папка",
					modal_tabheader3_text:					"Цвят на подсказка",
					modal_tabheader4_text:					"Персонализирани икони",
					modal_iconpicker_text:					"Избор на папки",
					modal_colorpicker1_text:				"Цвят основнен на папка",
					modal_colorpicker2_text:				"цвят вторичен на папка",
					modal_colorpicker3_text:				"Цвят на подсказка",
					modal_colorpicker4_text:				"Цвят на шрифта",
					modal_customopen_text:					"Отворена икона",
					modal_customclosed_text:				"Затворена икона",
					modal_custompreview_text:				"Икона Преглед",
					btn_cancel_text:						"Зъбести",
					btn_save_text:							"Cпасяване"
				};
			case "ru":		//russian
				return {
					toast_addserver_text:					"${servername} добавлен в папку${foldername}.",
					toast_removeserver_text:				"${servername} был удален из папки${foldername}.",
					servercontext_serverfolders_text:		"Папки сервера",
					serversubmenu_createfolder_text:		"Создать папки",
					serversubmenu_removefromfolder_text:	"Удаление сервера из папки",
					foldercontext_unreadfolder_text:		"Отметить все как прочитанное",
					foldercontext_autounreadfolder_text:	"Авто: Отметить как прочитанное",
					foldercontext_foldersettings_text:		"Настройки папки",
					foldercontext_removefolder_text:		"Удалить папки",
					modal_header_text:						"Настройки папки",
					modal_foldername_text:					"Имя папки",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвет папки",
					modal_tabheader3_text:					"Цвет подсказка",
					modal_tabheader4_text:					"Пользовательские значки",
					modal_iconpicker_text:					"Выбор папки",
					modal_colorpicker1_text:				"Цвет основной папки",
					modal_colorpicker2_text:				"Цвет вторичной папки",
					modal_colorpicker3_text:				"Цвет подсказка",
					modal_colorpicker4_text:				"Цвет шрифта",
					modal_customopen_text:					"Открытая иконка",
					modal_customclosed_text:				"Закрытая иконка",
					modal_custompreview_text:				"Иконка Просмотр",
					btn_cancel_text:						"Отмена",
					btn_save_text:							"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					toast_addserver_text:					"${servername} було додано до папки${foldername}.",
					toast_removeserver_text:				"${servername} був вилучений з папки${foldername}.",
					servercontext_serverfolders_text:		"Папки сервера",
					serversubmenu_createfolder_text:		"Створити папки",
					serversubmenu_removefromfolder_text:	"Видалити сервер із папки",
					foldercontext_unreadfolder_text:		"Позначити як прочитане",
					foldercontext_autounreadfolder_text:	"Авто: Позначити як прочитане",
					foldercontext_foldersettings_text:		"Параметри папки",
					foldercontext_removefolder_text:		"Видалити папки",
					modal_header_text:						"Параметри папки",
					modal_foldername_text:					"Ім'я папки",
					modal_tabheader1_text:					"Папки",
					modal_tabheader2_text:					"Колір папки",
					modal_tabheader3_text:					"Колір підказка",
					modal_tabheader4_text:					"Користувальницькі іконки",
					modal_iconpicker_text:					"Вибір папки",
					modal_colorpicker1_text:				"Колір основної папки",
					modal_colorpicker2_text:				"Колір вторинного папки",
					modal_colorpicker3_text:				"Колір підказка",
					modal_colorpicker4_text:				"Колір шрифту",
					modal_customopen_text:					"Відкрита ікона",
					modal_customclosed_text:				"Закрита ікона",
					modal_custompreview_text:				"Піктограма попереднього перегляду",
					btn_cancel_text:						"Скасувати",
					btn_save_text:							"Зберегти"
				};
			case "ja":		//japanese
				return {
					toast_addserver_text:					"${servername} がフォルダ${foldername} に追加されました。",
					toast_removeserver_text:				"${servername} がフォルダ${foldername} から削除されました。",
					servercontext_serverfolders_text:		"サーバーフォルダ",
					serversubmenu_createfolder_text:		"フォルダーを作る",
					serversubmenu_removefromfolder_text:	"フォルダからサーバーを削除する",
					foldercontext_unreadfolder_text:		"すべてを読むようにマークする",
					foldercontext_autounreadfolder_text:	"自動： 読み取りとしてマークする",
					foldercontext_foldersettings_text:		"フォルダ設定",
					foldercontext_removefolder_text:		"フォルダを削除する",
					modal_header_text:						"フォルダ設定",
					modal_foldername_text:					"フォルダ名",
					modal_tabheader1_text:					"フォルダ",
					modal_tabheader2_text:					"フォルダの色",
					modal_tabheader3_text:					"ツールチップの色",
					modal_tabheader4_text:					"カスタムアイコン",
					modal_iconpicker_text:					"フォルダの選択",
					modal_colorpicker1_text:				"プライマリフォルダの色",
					modal_colorpicker2_text:				"セカンダリフォルダの色",
					modal_colorpicker3_text:				"ツールチップの色",
					modal_colorpicker4_text:				"フォントの色",
					modal_customopen_text:					"開いたアイコン",
					modal_customclosed_text:				"クローズドアイコン",
					modal_custompreview_text:				"アイコンのプレビュー",
					btn_cancel_text:						"キャンセル",
					btn_save_text:							"セーブ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					toast_addserver_text:					"${servername} 已被添加到文件夾${foldername}.",
					toast_removeserver_text:				"${servername} 已從文件夾${foldername} 中刪除.",
					servercontext_serverfolders_text:		"服務器文件夾",
					serversubmenu_createfolder_text:		"創建文件夾",
					serversubmenu_removefromfolder_text:	"從服務器中刪除服務器",
					foldercontext_unreadfolder_text:		"標記為已讀",
					foldercontext_autounreadfolder_text:	"自動： 標記為已讀",
					foldercontext_foldersettings_text:		"文件夾設置",
					foldercontext_removefolder_text:		"刪除文件夾",
					modal_header_text:						"文件夾設置",
					modal_foldername_text:					"文件夾名稱",
					modal_tabheader1_text:					"夾",
					modal_tabheader2_text:					"文件夾顏色",
					modal_tabheader3_text:					"工具提示顏色",
					modal_tabheader4_text:					"自定義圖標",
					modal_iconpicker_text:					"文件夾選擇",
					modal_colorpicker1_text:				"主文件夾顏色",
					modal_colorpicker2_text:				"輔助文件夾顏色",
					modal_colorpicker3_text:				"工具提示顏色",
					modal_colorpicker4_text:				"字體顏色",
					modal_customopen_text:					"打開的圖標",
					modal_customclosed_text:				"封閉的圖標",
					modal_custompreview_text:				"圖標預覽",
					btn_cancel_text:						"取消",
					btn_save_text:							"保存"
				};
			case "ko":		//korean
				return {
					toast_addserver_text:					"${servername} 가 폴더${foldername} 에 추가되었습니다.",
					toast_removeserver_text:				"${servername} 가 폴더${foldername} 에서 제거되었습니다.",
					servercontext_serverfolders_text:		"서버 폴더",
					serversubmenu_createfolder_text:		"폴더 만들기",
					serversubmenu_removefromfolder_text:	"폴더에서 서버 제거",
					foldercontext_unreadfolder_text:		"모두 읽은 상태로 표시",
					foldercontext_autounreadfolder_text:	"자동: 읽은 상태로 표시",
					foldercontext_foldersettings_text:		"폴더 설정",
					foldercontext_removefolder_text:		"폴더 삭제",
					modal_header_text:						"폴더 설정",
					modal_foldername_text:					"폴더 이름",
					modal_tabheader1_text:					"폴더",
					modal_tabheader2_text:					"폴더 색",
					modal_tabheader3_text:					"툴팁 색깔",
					modal_tabheader4_text:					"사용자 정의 아이콘",
					modal_iconpicker_text:					"폴더 선택",
					modal_colorpicker1_text:				"기본 폴더 색",
					modal_colorpicker2_text:				"보조 폴더 색",
					modal_colorpicker3_text:				"툴팁 색깔",
					modal_colorpicker4_text:				"글꼴 색깔",
					modal_customopen_text:					"열린 아이콘",
					modal_customclosed_text:				"닫힌 아이콘",
					modal_custompreview_text:				"아이콘 미리보기",
					btn_cancel_text:						"취소",
					btn_save_text:							"저장"
				};
			default:		//default: english
				return {
					toast_addserver_text:					"${servername} has been added to the folder${foldername}.",
					toast_removeserver_text:				"${servername} has been removed from the folder${foldername}.",
					servercontext_serverfolders_text:		"Serverfolders",
					serversubmenu_createfolder_text:		"Create Folder",
					serversubmenu_removefromfolder_text:	"Remove Server From Folder",
					foldercontext_unreadfolder_text:		"Mark All As Read",
					foldercontext_autounreadfolder_text:	"Auto: Mark As Read",
					foldercontext_foldersettings_text:		"Foldersettings",
					foldercontext_removefolder_text:		"Delete Folder",
					modal_header_text:						"Foldersettings",
					modal_foldername_text:					"Foldername",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Foldercolor",
					modal_tabheader3_text:					"Tooltipcolor",
					modal_tabheader4_text:					"Custom Icons",
					modal_iconpicker_text:					"Folderchoice",
					modal_colorpicker1_text:				"Primary Foldercolor",
					modal_colorpicker2_text:				"Secondary Foldercolor",
					modal_colorpicker3_text:				"Tooltipcolor",
					modal_colorpicker4_text:				"Fontcolor",
					modal_customopen_text:					"Open Icon",
					modal_customclosed_text:				"Closed Icon",
					modal_custompreview_text:				"Iconpreview",
					btn_cancel_text:						"Cancel",
					btn_save_text:							"Save"
				};
		}
	}
}