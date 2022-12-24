import { AccountPage, AccountPageWithAccount } from './Account/AccountPage'
import { FomoPage, LimitOrders } from 'state/transactions/hooks'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Header, { EmbedModel, useIsEmbedMode } from 'components/Header';
import React, { useState } from 'react'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects';
import { SelectiveChartWithPair, useIsMobile } from './Swap/SelectiveChartingPair';
import Swap, { CardWrapper, FixedContainer, ScrollableRow } from './Swap'
import { bscClient, client } from 'state/logs/utils'

import AddLiquidity from './AddLiquidity'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import {
  ApolloProvider
} from "@apollo/client";
import AppBody from './AppBody'
import Badge from 'components/Badge';
import { Bridge } from 'components/AccountDetails/Bridge';
import { ChartPage } from 'components/swap/ChartPage'
import CreateProposal from './CreateProposal'
import { DarkGreyCard } from 'components/Card'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import { DonationTracker } from 'components/LiquidityChartRangeInput/DonationTracker'
import ErrorBoundary from '../components/ErrorBoundary'
import { Flex } from 'rebass'
import { GainsTracker } from './GainsTracker/GainsTracker'
import { GelatoProvider } from "@gelatonetwork/limit-orders-react";
import { HoneyPotDetector } from './HoneyPotDetector'
import { KibaNftAlert } from 'components/NetworkAlert/AddLiquidityNetworkAlert';
import { LifetimeReflections } from './Swap/LifetimeReflections'
import Marquee from 'react-marquee-slider'
import MigrateV2 from './MigrateV2'
import MigrateV2Pair from './MigrateV2/MigrateV2Pair'
import { Mint } from 'components/Nft/mint';
import Polling from '../components/Header/Polling'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import PoolV2 from './Pool/v2'
import Popups from '../components/Popups'
import { PositionPage } from './Pool/PositionPage'
import { RedirectDuplicateTokenIds } from './AddLiquidity/redirects'
import { RedirectDuplicateTokenIdsV2 } from './AddLiquidityV2/redirects'
import RemoveLiquidity from './RemoveLiquidity'
import RemoveLiquidityV3 from './RemoveLiquidity/V3'
import { SelectiveChart } from './Swap/SelectiveCharting';
import { Suite } from './Suite/Suite';
import { SwapTokenForTokenComponent } from 'components/ChartSidebar/SwapTokenForTokenModal';
import SwapVolume from 'components/SwapVolume'
import { SwapVolumeContextProvider } from 'context/SwapVolumeContext';
import { TYPE } from 'theme'
import { TokenBalanceContextProvider } from 'utils/binance.utils'
import { TopTokenMovers } from 'components/swap/TopMovers'
import { Transactions } from './Vote/TransactionsPage'
import Vote from './Vote'
import VotePage from './Vote/VotePage'
import VotePageV2 from './Vote/VotePageV2'
import Web3ReactManager from '../components/Web3ReactManager'
import styled from 'styled-components/macro'
import { useDarkModeManager } from 'state/user/hooks'
import useTheme from 'hooks/useTheme'
import { useWalletModalToggle } from 'state/application/hooks'
import { useWeb3React } from '@web3-react/core'
import  Snowfall  from 'react-snowfall'

const AppWrapper = styled.div<{ embedModel: EmbedModel }>`
  display: flex;
  flex-flow: column;
  background-repeat: no-repeat;
  position: absolute;
  height: ${props => props.embedModel.embedMode ? 'auto' : '150vh'}; 
  background: ${({ theme }) => theme.bg7};
  background-size: 100% 200%;
  width:100%;
  height: 100vh;
  position: relative;
  animation: flow 3s ease-in-out alternate infinite;
  overflow: auto;
}


@keyframes flow{
  from{
    background-position: 0% 50%;
  }
  to{
    background-position: 100 50%;
  }
}

  align-items: flex-start;
  > * {
    font-family: 'Open Sans' !important;
  }
`

const BodyWrapper = styled.div<{ embed: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${props => props.embed ? '0px' : '120px 16px 0px 16px'};
  align-items: center;
  flex: 1;
  z-index: 1;

  margin-top:${(props) => props.embed ? '0px' : window.location.href.includes('charts') || window.location.href.includes('charting') ? '1.2rem' : '4rem'};

  ${({ theme, embed }) => theme.mediaWidth.upToSmall`
    padding:${embed ? '1px' : '6rem 16px 16px 16px'};
  `}


  ${({ theme, embed }) => theme.mediaWidth.upToExtraSmall`
  padding:${embed ? '1px' : '6rem 16px 16px 16px'};
  `}
`


const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  flex-flow:column wrap;
  top: 0;
  z-index: 2;
  margin-bottom:2rem;
`

function TopLevelModals() {
  return null
}

const VideoWrapper = styled.div`
`


const StyledDiv = styled.div`
  font-family: 'Open Sans';
  font-size:14px;
`


const GainsPage = (props: any) => <TokenBalanceContextProvider>
  <VotePage {...props} />
</TokenBalanceContextProvider>

export default function App() {
  const theme = useTheme()
  const [darkMode,] = useDarkModeManager()
  const embedModel = useIsEmbedMode()
  const { chainId, account, library } = useWeb3React()
  const noop = () => { return }
  const isMobile = useIsMobile()
  const toggleWalletModal = useWalletModalToggle()

  return (
    <ErrorBoundary>
      <DarkModeQueryParamReader/>
      <ApeModeQueryParamReader/>
      <HashRouter>
        <SwapVolumeContextProvider chainId={chainId}>
          <Web3ReactManager>
            <GelatoProvider
              library={library}
              chainId={chainId}
              toggleWalletModal={toggleWalletModal}
              account={account ?? undefined}
              useDefaultTheme={false}
              useDarkMode={darkMode}
            >
              <ApolloProvider client={(!chainId || chainId && chainId === 1) ? client : chainId && chainId === 56 ? bscClient : client}>
                <AppWrapper embedModel={embedModel}>
                              

                  <HeaderWrapper>
                    {(embedModel.embedMode == false || embedModel.showTrending) && <TopTokenMovers />}
                    {embedModel.embedMode == false && <Header />}
                  </HeaderWrapper>

                  {/* 
                  <div style={{position:'absolute', top:'25%', left:'5%'}}>
                    <img style={{maxWidth:200}} src={'https://kibainu.space/wp-content/uploads/2021/11/photo_2021-11-07-22.25.47.jpeg'} />
                </div>
                  <div style={{position:'absolute', top:'25%', right:'5%'}}>
                      <img style={{maxWidth:200}} src={'https://kibainu.space/wp-content/uploads/2021/11/photo_2021-11-07-22.25.47.jpeg'} />
                  </div> 
                */}
                            

                  <BodyWrapper  embed={embedModel.embedMode}>
                  <Snowfall/>

                    <SwapTokenForTokenComponent />
                    <Popups />
                    {!isMobile && <>
                      <Polling />
                      <SwapVolume />
                    </>}
                    <TopLevelModals />
                    {<KibaNftAlert />}
                    <Routes>
                      <Route path="/nfts" element={Mint} />
                      <Route path="/nfts/mint/:referrer" element={Mint} />
                      <Route path="/reflections" element={LifetimeReflections} />
                      <Route path="/details" element={AccountPage} />
                      <Route path="/details/:account" element={AccountPageWithAccount} />
                      <Route path="/limit" element={LimitOrders} />

                      {/* Chart Pages Routes */}

                      {/* Entry page routes, this will show the search / select and recently viewed. All uses same element */}
                      <Route path="/selective-charting" element={SelectiveChartWithPair} />
                      <Route path="/selective-charts" element={SelectiveChartWithPair} />

                      {/* Longer routes, with more parameters, kind of bad for users to have to share. Working on removing these */}
                      <Route path="/selective-charting/:tokenAddress/:tokenSymbol/:name/:decimals" element={SelectiveChart} />
                      <Route path="/selective-charting/:tokenAddress/:tokenSymbol/:name/:decimals/:pairAddress" element={SelectiveChart} />
                      <Route path="/selective-charts/:tokenAddress/:tokenSymbol/:name" element={SelectiveChart} />
                      <Route path="/selective-charts/:tokenAddress/:tokenSymbol/:name/:decimals" element={SelectiveChart} />
                      <Route path="/selective-charts/:tokenAddress/:tokenSymbol/:name/:decimals/:pairAddress" element={SelectiveChart} />

                      {/* Simpler route, takes only the pair address, the rest is computed from that */}
                      <Route path="/selective-charting/:network/:pairAddress" element={SelectiveChartWithPair} />
                      <Route path="/selective-charts/:network/:pairAddress" element={SelectiveChartWithPair} />
                      <Route path="/charts/:network/:pairAddress" element={SelectiveChartWithPair} />
                      <Route path="/charts" element={SelectiveChartWithPair} />

                      <Route path="/bridge" element={Bridge} />
                      {/* End Chart Pages Routes */}

                      <Route path="/fomo" element={FomoPage} />
                      <Route path="/donation-tracker" element={DonationTracker} />
                      <Route path="/tracker" element={GainsTracker} />
                      <Route path="/suite" element={Suite} />
                      <Route path="/transactions" element={Transactions} />
                      <Route path="/gains" element={GainsPage} />
                      <Route path="/honeypot-checker" element={HoneyPotDetector} />
                      <Route path="/dashboard" element={VotePage} />
                      <Route path="/vote" element={Vote} />
                      <Route path="/vote/:id" element={VotePageV2} />
                      <Route path="/send" element={RedirectPathToSwapOnly} />
                      <Route path="/swap/:outputCurrency" element={RedirectToSwap} />
                      <Route path="/swap" element={Swap} />
                      <Route path="/pool/v2/find" element={PoolFinder} />
                      <Route path="/pool/v2" element={PoolV2} />
                      <Route path="/pool" element={Pool} />
                      <Route path="/pool/:tokenId" element={PositionPage} />
                      <Route path="/add/v2/:currencyIdA?/:currencyIdB?" element={RedirectDuplicateTokenIdsV2} />
                      <Route
        
                        path="/add/:currencyIdA?/:currencyIdB?/:feeAmount?"
                        element={RedirectDuplicateTokenIds}
                      />

                      <Route
                       
                        path="/increase/:currencyIdA?/:currencyIdB?/:feeAmount?/:tokenId?"
                        element={AddLiquidity}
                      />

                      <Route path="/remove/v2/:currencyIdA/:currencyIdB" element={RemoveLiquidity} />
                      <Route path="/remove/:tokenId" element={RemoveLiquidityV3} />

                      <Route path="/migrate/v2" element={MigrateV2} />
                      <Route path="/migrate/v2/:address" element={MigrateV2Pair} />

                      <Route path="/proposals" element={CreateProposal} />
                      <Route path="/charts" element={ChartPage} />

                      <Route element={RedirectPathToSwapOnly} />
                    </Routes>
                    {/* {embedModel.embedMode == false && (
                       <AppBody style={{
                        boxShadow:
                          'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                        position: 'relative',
                        padding: '10px 0',
                        justifyContent: 'end',
                        backgroundColor: theme.bg0,
                        color: theme.text1,
                        height: 'flex',
                        width: 'flex',
                        minWidth: '45%'
                      }}>
                        <StyledDiv style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', fontFamily: 'Poppins', fontWeight: 500 }}>Kibaswap Featured Sponsors
                        </StyledDiv>
                        <Marquee direction={'ltr'}
                          resetAfterTries={200}
                          scatterRandomly={false}
                          onInit={noop}
                          onFinish={noop}
                          velocity={10}>
                          <></>
                          <FixedContainer style={{ backgroundColor: 'transparent', width: '100%' }} gap="xs">
                            <ScrollableRow style={{ padding: 10, background: 'transparent' }}>
                              {[
                                {
                                  title: "Kiba Inu",
                                  img: logo,
                                  text: "Kiba Inu is a token infused with Kiba Swap",
                                  link: '#',
                                  style: { maxHeight: '100px' }
                                },
                                {
                                  title: "CryptoCart",
                                  img: cart,
                                  text: "Learn more about Crypto Cart",
                                  link: 'https://cryptocart.cc/',
                                  style: {}
                                },
                                {
                                  title: "Kiba NFTs",
                                  img: `https://openseauserdata.com/files/260d4d4d0ee4a561f25d2d61a4bc25c9.png`,
                                  text: "View the Genesis NFT page",
                                  link: '/#/nfts',
                                  style: { borderRadius: '60px' }
                                },
                                {
                                  title: "Btok",
                                  img: btok,
                                  text: "Learn more about BTok",
                                  link: 'https://www.btok.com/',
                                  style: {}
                                }].map((sponsor) => (
                                  <CardWrapper title={sponsor.text} key={sponsor.title} href={sponsor.link}>
                                    <DarkGreyCard style={{ height: 90, padding: 0, background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgb(37, 38, 50)' }}>
                                      <Flex height={'100%'} flexDirection="column" alignItems={'center'} justifyContent={'center'}>
                                        <img style={{ maxHeight: 70, ...sponsor?.style }} src={sponsor.img} />
                                      </Flex>
                                    </DarkGreyCard>
                                  </CardWrapper>
                                ))}
                            </ScrollableRow>
                          </FixedContainer>
                        </Marquee>
                      </AppBody>)} */}
                      

                    {embedModel.embedMode == true && (
                      <Badge style={{ borderRadius: 0, width: '100%', background: embedModel?.theme == 'dark' ? "#222" : '#fff' }}>
                        <a href={'https://kibainu.com'}>
                          <div style={{ display: 'flex', columnGap: 2.5, alignItems: 'center', justifyContent: "center", flexFlow: 'row wrap' }}>
                            <TYPE.italic>Tracked by </TYPE.italic>
                            <img src={'https://kibainu.com/static/media/download.e893807d.png'} style={{ maxWidth: 40 }} />
                            <TYPE.main>KIBA</TYPE.main>
                            <TYPE.italic style={{ color: theme.text1 }}>CHARTS</TYPE.italic>
                          </div>
                        </a>
                      </Badge>
                    )}


                  </BodyWrapper>
                  
                </AppWrapper>
               
              </ApolloProvider>
            </GelatoProvider>

          </Web3ReactManager>
        </SwapVolumeContextProvider>
      </HashRouter>
    </ErrorBoundary>
  )
}