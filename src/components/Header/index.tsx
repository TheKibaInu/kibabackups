import { Trans } from '@lingui/macro'
import useScrollPosition from '@react-hook/window-scroll'
import Card from 'components/Card'
import { GreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Tooltip from 'components/Tooltip'
import { CHAIN_INFO, SupportedChainId } from 'constants/chains'
import useCopyClipboard from 'hooks/useCopyClipboard'
import { darken } from 'polished'
import React, { useState } from 'react'
import { AlertOctagon, CheckCircle, ChevronDown, ChevronUp, Circle, Clipboard, Info, Link, Settings } from 'react-feather'
import { NavLink } from 'react-router-dom'
import { Text } from 'rebass'
import { useShowClaimPopup, useToggleSelfClaimModal } from 'state/application/hooks'
import { useUserHasAvailableClaim } from 'state/claim/hooks'
import { useUserHasSubmittedClaim } from 'state/transactions/hooks'
import { useDarkModeManager } from 'state/user/hooks'
import { useETHBalances } from 'state/wallet/hooks'
import styled from 'styled-components/macro'
import { CloseIcon } from 'theme/components'
import { StyledInternalLink } from 'theme/components'
import { IconWrapper } from 'theme/components'
import Logo from '../../assets/svg/logo.svg'
import LogoDark from '../../assets/svg/logo_white.svg'
import { useActiveWeb3React } from '../../hooks/web3'
import { ExternalLink, TYPE } from '../../theme'
import ClaimModal from '../claim/ClaimModal'
import { CardNoise } from '../earn/styled'
import Menu from '../Menu'
import Modal from '../Modal'
import Row from '../Row'
import { Dots } from '../swap/styleds'
import Web3Status from '../Web3Status'
import NetworkCard from './NetworkCard'
import UniBalanceContent from './UniBalanceContent'
import logo from '../../assets/images/squeeze.png'
import Swal from 'sweetalert2'

const HeaderFrame = styled.div<{ showBackground: boolean }>`
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem;
  z-index: 21;
  position: relative;
  /* Background slide effect on scroll. */
  background-image: ${({ theme }) => `linear-gradient(to bottom, transparent 50%, ${theme.bg0} 50% )}}`};
  background-position: ${({ showBackground }) => (showBackground ? '0 -100%' : '0 0')};
  background-size: 100% 200%;
  box-shadow: 0px 0px 0px 1px ${({ theme, showBackground }) => (showBackground ? theme.bg2 : 'transparent;')};
  transition: background-position 0.1s, box-shadow 0.1s;
  background-blend-mode: hard-light;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 48px 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding:  1rem;
    grid-template-columns: 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding:  1rem;
    grid-template-columns: 36px 1fr;
  `};
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`

const HeaderLinks = styled(Row)`
  justify-self: center;
  background-color: ${({ theme }) => theme.bg0};
  width: fit-content;
  padding: 4px;
  border-radius: 16px;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
  overflow: auto;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    justify-self: start;  
    `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.bg0};
    border: 1px solid ${({ theme }) => theme.bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
  `};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg1)};
  border-radius: 12px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }

  :active {
    opacity: 0.9;
  }
`

const BalanceText = styled(Text)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  :hover {
    cursor: pointer;
  }
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  font-weight: 500;
  padding: 8px 12px;
  word-break: break-word;
  overflow: hidden;
  white-space: nowrap;
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    justify-content: center;
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg2};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledInput = styled.input`
  * {
    display: flex;
    max-width: 275px;
    width: 100%;
    cursor: pointer;
    background-color: #eaeaeb;
    border: none;
    color: #222;
    font-size: 14px;
    border-radius: 5px;
    padding: 15px 45px 15px 15px;
    font-family: 'Montserrat', sans-serif;
    box-shadow: 0 3px 15px #b8c6db;
    -moz-box-shadow: 0 3px 15px #b8c6db;
    -webkit-box-shadow: 0 3px 15px #b8c6db;
  }
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName,
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text2};
  font-size: 1rem;
  width: fit-content;
  margin: 0 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    text-decoration: none;
  }
`

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const [darkMode] = useDarkModeManager()

  const toggleClaimModal = useToggleSelfClaimModal()

  const availableClaim: boolean = useUserHasAvailableClaim(account)

  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined)

  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)
  const showClaimPopup = useShowClaimPopup()

  const scrollY = useScrollPosition()
  const { infoLink } = CHAIN_INFO[chainId ? chainId : SupportedChainId.MAINNET]
  const [showContracts, setShowContracts] = useState(false)
  const [clip, setClip] = useCopyClipboard()
  const href = 'https://www.dextools.io/app/ether/pair-explorer/0xac6776d1c8d455ad282c76eb4c2ade2b07170104'
  const [width, setWidth] = useState<number>(window.innerWidth)
  function handleWindowSizeChange() {
    setWidth(window.innerWidth)
  }
  React.useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  const isMobile: boolean = width <= 768
  const [showTip, setShowTip] = useState(false)
  const [darkmode] = useDarkModeManager()
  const [gas, setGas] = React.useState<any>()
  const [showNotify, setShowNotify] = React.useState(!!localStorage.getItem('subscribed') && localStorage.getItem('subscribed') !== 'false');

  let interval = null
  const [isOpen, setIsOpen] = React.useState(false)
  React.useEffect(() => {
    fetch('https://ethgasstation.info/api/ethgasAPI.json?api-key=XXAPI_Key_HereXXX', { method: 'GET' })
      .then((res) => res.json())
      .then((response) => {
        setGas(response)
      }).then(() => {
        interval = setInterval(() => {
    if (!isOpen && showNotify) {

          fetch('https://ethgasstation.info/api/ethgasAPI.json?api-key=XXAPI_Key_HereXXX', { method: 'GET' })
            .then((res) => res.json())
            .then((response) => {
              setGas(response)
              if (!isOpen && showNotify && Math.trunc(response?.fast / 10) >= 85) {
                Swal.fire({
                  toast:true,
                  position: 'bottom-end',
                  timer: 5000,
                  showConfirmButton:false,

                  timerProgressBar: true,
                  icon: 'success',
                  title: 'GWEI is currently at ' + Math.trunc(response?.fast / 10)
                })  
              } 
            })
          }
        }, 300000)
      })
    return () => {
      interval = null;
    }
  }, [isOpen, showNotify])

  const onNotify =  React.useCallback( () => {
    setIsOpen(true);
    Swal.fire({
      title: showNotify ? "Cancel notifications" : 'Subscribe to notifications',
      text: showNotify ? "Cancelling notifications will no longer alert you when GWEI is in optimal conditions ( GWEI < 85 )." : 'Subscribing to notifications will alert you in app when GWEI is in optimal conditions (GWEI < 85).',
      showConfirmButton: true,
      confirmButtonText: showNotify ? 'Unsubscribe' : "Subscribe",
      showCancelButton: true,
      icon: 'question',
    }).then(({isConfirmed}) => {
    setIsOpen(false)
    if (showNotify && isConfirmed) {
      setShowNotify(() => false)
      localStorage.setItem('subscribed', 'false')
    } else if (!showNotify && isConfirmed) {
      setShowNotify(true)
      localStorage.setItem('subscribed', 'true')
    } 
  })
}, [showNotify, isOpen])
  const [showGasTt, setShowGasTt] = React.useState(false)
  return (
    <>
      <HeaderFrame showBackground={scrollY > 45}>
        <ClaimModal />
        <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
          <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
        </Modal>
        <Title href="/">
          <UniIcon>
            <img
              width={isMobile ? '30px' : '100px'}
              src={'https://kibainu.space/wp-content/uploads/2021/10/photo_2021-10-30-06.48.25-204x300.jpeg'}
              alt="logo"
            />
          </UniIcon>
        </Title>
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            <Trans>Swap</Trans>
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/increase') ||
              pathname.startsWith('/find')
            }
          >
            <Trans>Pool</Trans>
          </StyledNavLink>
          {chainId && chainId === SupportedChainId.MAINNET && (
            <StyledNavLink id={`stake-nav-link`} to={'/gains'}>
              <Trans>Gains</Trans>
            </StyledNavLink>
          )}
          <StyledExternalLink id={`stake-nav-link`} href={href}>
            <Trans>Charts</Trans>
            <sup>↗</sup>
          </StyledExternalLink>
          <div
              style={{
                position:'relative',
                top:6,
                marginBottom: 15,
                justifyContent: 'center',
                marginRight: 30,
                padding: 3,
                borderRadius: 12,
                display: 'flex',
                color: 'rgb(168,228,44)',
              }}
            >
              {' '}
                <span  style={{ cursor:'pointer', display: 'flex',  alignItems: 'baseline' }}>
                <img style={{filter:'sepia(1)', maxWidth:20}} src={'https://www.freeiconspng.com/uploads/gas-icon-21.png'}
                  />
                  {gas && (
                    <span style={{ color: '#fff', marginLeft: 5, fontSize: 14, fontWeight: 'bold' }}>
                      {gas?.fast / 10}
                    </span>
                  )}
                 
                </span> 
                      {gas && Math.trunc(gas?.fast / 10) > 85 ? <AlertOctagon fill={showNotify ? 'green' : 'red'} color={'#fff'}onClick={onNotify} style={{cursor:'pointer',marginLeft:5}}
                            onMouseEnter={() => setShowGasTt(true)}
                            onMouseLeave={() => setShowGasTt(false)}
                            /> : <CheckCircle   fill={showNotify ? 'green' : 'red'} color={'#fff'}onClick={onNotify} style={{background:'green',cursor:'pointer',marginLeft:5}} />}


            </div>

        </HeaderLinks>

        <HeaderControls>
          {showContracts && (
            <Card style={{}}>
              {isMobile && (
                <div style={{ position: 'relative', top: 60, left: 130, color: '#222', zIndex: 2 }}>
                  <CloseIcon onClick={() => setShowContracts(false)} />
                </div>
              )}
              {!isMobile && (
                <div style={{ position: 'relative', top: 0, left: 0, color: '#222', zIndex: 2 }}>
                  <CloseIcon  onClick={() => setShowContracts(false)} />
                </div>
              )}
              <Row
                style={{
                  padding: 5,
                  borderRadius: 6,
                  background: darkmode ? '#223569' : '#fff',
                  display: 'flex',
                  flexFlow: 'column wrap',
                  position: 'absolute',
                  width: 'auto',
                  left: isMobile ? '40%' : '69%',
                  top: isMobile ? '100%' : '25%',
                }}
              >
                <div
                  onClick={() => {
                    setClip('0x99d36e97676a68313ffdc627fd6b56382a2a08b6')
                  }}
                  style={{ fontSize: 12, display: 'block', cursor: 'pointer' }}
                >
                  <img width={'40px'} src={'https://babytrumptoken.com/images/Baby_Trump_Transpa.png'} alt="logo" />
                  <Row>
                    <AutoColumn>
                      <TYPE.main>Baby Trump</TYPE.main>
                      <StyledInput value={'0x99d36e97676a68313ffdc627fd6b56382a2a08b6'} />
                    </AutoColumn>
                    <AutoColumn>
                      <Clipboard style={{ marginTop: 13 }} />
                    </AutoColumn>
                  </Row>
                </div>
                <div
                  onClick={() => {
                    setClip('0x4d7beb770bb1c0ac31c2b3a3d0be447e2bf61013')
                  }}
                  style={{ fontSize: 12, paddingTop: 5, cursor: 'pointer' }}
                >
                  <img width={'40px'} src={'https://babytrumptoken.com/images/CoinGecko.png'} alt="logo" />
                  <Row>
                    <AutoColumn>
                      <TYPE.main>Stimulus Check</TYPE.main>
                      <StyledInput value={'0x4d7beb770bb1c0ac31c2b3a3d0be447e2bf61013'} />
                    </AutoColumn>
                    <AutoColumn>
                      <Clipboard style={{ marginTop: 13 }} />
                    </AutoColumn>
                  </Row>
                </div>
                <div
                  onClick={() => {
                    setClip('0x29699C8485302cd2857043FaB8bd885bA08Cf268')
                  }}
                  style={{ fontSize: 12, paddingTop: 5, cursor: 'not-allowed' }}
                >
                  <img width={'40px'} src={'https://babytrumptoken.com/images/Trump_Gold_Coin_Gecko.png'} alt="logo" />
                  <Row>
                    <AutoColumn>
                      <TYPE.main>Trump Gold</TYPE.main>
                      <StyledInput value={'0x29699C8485302cd2857043FaB8bd885bA08Cf268'} />
                    </AutoColumn>
                    <AutoColumn>
                      <Clipboard style={{ marginTop: 13 }} />
                    </AutoColumn>
                  </Row>
                </div>
                <TYPE.main style={{ fontSize: 9, marginTop: 5 }}>
                  <Trans>Click the clipboard to copy</Trans>
                </TYPE.main>
              </Row>
            </Card>
          )}
  
          <NetworkCard />

          <HeaderElement>
            {availableClaim && !showClaimPopup && (
              <UNIWrapper onClick={toggleClaimModal}>
                <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                  <TYPE.white padding="0 2px">
                    {claimTxn && !claimTxn?.receipt ? (
                      <Dots>
                        <Trans>Claiming UNI</Trans>
                      </Dots>
                    ) : (
                      <></>
                    )}
                  </TYPE.white>
                </UNIAmount>
                <CardNoise />
              </UNIWrapper>
            )}
            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                  <Trans>{userEthBalance?.toSignificant(3)} ETH</Trans>
                </BalanceText>
              ) : null}
              <Web3Status />
            </AccountElement>
            <Menu />
          </HeaderElement>
        </HeaderControls>
      </HeaderFrame>
    </>
  )
}
