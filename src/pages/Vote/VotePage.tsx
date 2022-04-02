import {
  Currency,
  CurrencyAmount,
  Price,
  Rounding,
  Token,
  WETH9,
} from "@uniswap/sdk-core";
import { BigNumber } from "ethers";
import useCurrentBlockTimestamp from "hooks/useCurrentBlockTimestamp";
import JSBI from "jsbi";
import { DateTime } from "luxon";
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  Clock,
  DollarSign,
  Info,
  Type,
} from "react-feather";
import ReactMarkdown from "react-markdown";
import { Link, RouteComponentProps } from "react-router-dom";
import styled from "styled-components/macro";
import { ButtonPrimary } from "../../components/Button";
import { GreyCard } from "../../components/Card";
import { AutoColumn } from "../../components/Column";
import {
  CardBGImage,
  CardBGImageSmaller,
  CardSection,
  DataCard,
} from "../../components/earn/styled";
import { RowBetween, RowFixed } from "../../components/Row";
import { SwitchLocaleLink } from "../../components/SwitchLocaleLink";
import DelegateModal from "../../components/vote/DelegateModal";
import VoteModal from "../../components/vote/VoteModal";
import {
  AVERAGE_BLOCK_TIME_IN_SECS,
  COMMON_CONTRACT_NAMES,
  DEFAULT_AVERAGE_BLOCK_TIME_IN_SECS,
} from "../../constants/governance";
import { ZERO_ADDRESS } from "../../constants/misc";
import { UNI, USDC, USDT } from "../../constants/tokens";
import { useActiveWeb3React } from "../../hooks/web3";
import { ApplicationModal } from "../../state/application/actions";
import {
  useBlockNumber,
  useModalOpen,
  useToggleDelegateModal,
  useToggleVoteModal,
} from "../../state/application/hooks";
import {
  ProposalData,
  ProposalState,
  useProposalData,
  useUserDelegatee,
  useUserVotesAsOfBlock,
} from "../../state/governance/hooks";
import { useCurrencyBalance, useTokenBalance } from "../../state/wallet/hooks";
import { ExternalLink, StyledInternalLink, TYPE } from "../../theme";
import { isAddress } from "../../utils";
import { ExplorerDataType, getExplorerLink } from "../../utils/getExplorerLink";
import { ProposalStatus } from "./styled";
import { t, Trans } from "@lingui/macro";
import { useTokenComparator } from "components/SearchModal/sorting";
import Card from "components/Card";
import { useAllTokens, useToken } from "hooks/Tokens";
import { computeFiatValuePriceImpact } from "utils/computeFiatValuePriceImpact";
import Header from "components/Header";
import { relative } from "path";
import { DialogOverlay } from "@reach/dialog";
import Badge from "components/Badge";
import { mnemonicToEntropy } from "ethers/lib/utils";
import moment from "moment";
import { BlueCard } from "components/Card";
import Tooltip from "components/Tooltip";
import { FiatValue } from "components/CurrencyInputPanel/FiatValue";
import useUSDCPrice, { useUSDCValue } from "hooks/useUSDCPrice";
import { gql } from "graphql-request";
import { formatCurrencyAmount, formatPrice } from "utils/formatCurrencyAmount";
import FormattedCurrencyAmount from "components/FormattedCurrencyAmount";
import { tryParsePrice } from "state/mint/v3/utils";
import { useV2TradeExactIn, useV2TradeExactOut } from "hooks/useV2Trade";
import { usePool } from "hooks/usePools";
import { usePoolActiveLiquidity } from "hooks/usePoolTickData";
import Web3 from "web3";
import { abi } from "./abi";
import { routerAbi, routerAddress } from "./routerAbi";
import Column from "components/Column";
import Row from "components/Row";
import { stackOrderInsideOut } from "d3";
import { isMobile } from "react-device-detect";
import { useTrumpGoldBalance } from "./AddProposal";
import { walletconnect } from "connectors";
import squeezeLogo from '../../assets/images/squeeze.png'
import { useDarkModeManager } from "state/user/hooks";
const PageWrapper = styled(AutoColumn)`
  width: 100%;
`;

const ProposalInfo = styled(AutoColumn)`
  background: ${({ theme }) => theme.bg0};
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  max-width: 640px;
  width: 100%;
`;

const ArrowWrapper = styled(StyledInternalLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  color: ${({ theme }) => theme.text1};

  a {
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
  }
  :hover {
    text-decoration: none;
  }
`;
const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
`;

const StyledDataCard = styled(DataCard)`
  width: 100%;
  background: none;
  background-color: ${({ theme }) => theme.bg1};
  height: fit-content;
  z-index: 2;
`;

const ProgressWrapper = styled.div`
  width: 100%;
  margin-top: 1rem;
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg3};
  position: relative;
`;

const Progress = styled.div<{
  status: "for" | "against";
  percentageString?: string;
}>`
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme, status }) =>
    status === "for" ? theme.green1 : theme.red1};
  width: ${({ percentageString }) => percentageString};
`;

const MarkDownWrapper = styled.div`
  max-width: 640px;
  overflow: hidden;
`;

const WrapSmall = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
  `};
`;

const DetailText = styled.div`
  word-break: break-all;
`;

const ProposerAddressLink = styled(ExternalLink)`
  word-break: break-all;
`;

export const useTrumpBalance = (account?: string | null) => {
  const trumpCoin = new Token(
    1,
    "0x99d36e97676A68313ffDc627fd6b56382a2a08B6",
    9,
    "BabyTrump",
    "BabyTrump Token"
  );

  const trumpBalance: CurrencyAmount<Token> | undefined = useTokenBalance(
    account ?? undefined,
    trumpCoin
  );

  return React.useMemo(() => {
    return trumpBalance;
  }, [trumpBalance, trumpCoin]);
};

export const useStimulusBalance = (account?: string | null) => {
  const stimulusCoin = new Token(
    1,
    "0x4d7beb770bb1c0ac31c2b3a3d0be447e2bf61013",
    9,
    "StimulusCheck",
    "StimulusCheck Token"
  );

  const stimulusBalance: CurrencyAmount<Token> | undefined = useTokenBalance(
    account ?? undefined,
    stimulusCoin
  );

  return React.useMemo(() => {
    return stimulusBalance ? stimulusBalance : undefined;
  }, [stimulusCoin, stimulusBalance]);
};

export default function VotePage({
  match: {
    params: { governorIndex, id },
  },
}: RouteComponentProps<{ governorIndex: string; id: string }>) {
  const web3 = useActiveWeb3React();
  const { account } = web3;
  // get data for this specific proposal

  // update support based on button interactions
  const [support, setSupport] = useState<boolean>(true);
  // modal for casting votes
  const showVoteModal = useModalOpen(ApplicationModal.VOTE);
  const toggleVoteModal = useToggleVoteModal();
  // toggle for showing delegation modal
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE);
  const toggleDelegateModal = useToggleDelegateModal();
  // only count available votes as of the proposal start block

  const trumpCoin = new Token(
    1,
    "0xabd4dc8fde9848cbc4ff2c0ee81d4a49f4803da4",
    9,
    "Squeeze",
    "Squeeze Token"
  );
  const stimulusCoin = new Token(
    1,
    "0x4d7beb770bb1c0ac31c2b3a3d0be447e2bf61013",
    9,
    "StimulusCheck",
    "StimulusCheck Token"
  );
  const defaultTokens = useAllTokens();

  const trumpBalance: CurrencyAmount<Token> | undefined = useTokenBalance(
    account ?? undefined,
    trumpCoin
  );
  const stimulusBalance = useTokenBalance(account ?? undefined, stimulusCoin);
  const storedSimulusBalance = useMemo(() => {
    return localStorage.getItem("stimulusBalance") || undefined;
  }, [localStorage.getItem("stimulusBalance")]);

  const storedTrumpBalance = useMemo(() => {
    return localStorage.getItem("trumpBalance") || undefined;
  }, [localStorage.getItem("trumpBalance")]);

  const [isTrackingGains, setIsTrackingGains] = useState<boolean>(
    storedTrumpBalance !== undefined && +storedTrumpBalance > 0 && !!account
  );

  const date = new Date();

  const trackingSince = useMemo(() => {
    return moment(
      new Date(localStorage.getItem("trackingSince") as string)
    ).fromNow();
  }, [localStorage.getItem("trackingSince"), date]);

  const stopTrackingGains = () => {
    localStorage.setItem("trumpBalance", "0");
    localStorage.setItem("trackingSince", "");
    setTrumpGainsUSD("");
    setStimGainsUSD("");
    setIsTrackingGains(false);
  };

  const trackGains = () => {
    if (isTrackingGains) {
      localStorage.setItem("trumpBalance", "0");
      localStorage.setItem("trackingSince", "");
      setIsTrackingGains(false);
    } else if (!!trumpBalance || !!stimulusBalance) {
      localStorage.setItem("trumpBalance", (trumpBalance || 0)?.toFixed(2));
      localStorage.setItem(
        "stimulusBalance",
        (stimulusBalance || 0)?.toFixed(2)
      );
      localStorage.setItem("trackingSince", `${new Date()}`);
      setIsTrackingGains(true);
    } else {
      setIsTrackingGains(false);
      alert(`Cannot track gains!
             Sorry, we had an issue with connecting to ${
               account ? account : "your accounts"
             } 
             and retrieving your balance.`);
    }
  };
  const [showTool, setShowTool] = useState<boolean>(false);
  const tiptext = `Holding Stimulus Token and Baby Trump at the same time allow for 16% redistribution`;

  useEffect(() => {
    if (storedTrumpBalance && trumpBalance) {
      if (
        (+storedTrumpBalance - +trumpBalance.toFixed(2)).toFixed(2) ===
        trumpBalance.toFixed(2)
      ) {
      } else if (+storedTrumpBalance - +trumpBalance.toFixed(2) < 0) {
      }
    } else if (storedSimulusBalance && stimulusBalance) {
      if (
        (+storedSimulusBalance - +stimulusBalance.toFixed(2)).toFixed(2) ===
        stimulusBalance.toFixed(2)
      ) {
        stopTrackingGains();
      } else if (+storedSimulusBalance - +stimulusBalance.toFixed(2) < 0) {
      }
    }
  }, []);

  const rawTrumpCurrency = useMemo(() => {
    if (!storedTrumpBalance || !trumpBalance) return null;
    const calc = +Math.round(+trumpBalance?.toFixed(2) - +storedTrumpBalance);
    return calc;
  }, [storedTrumpBalance, trumpBalance, isTrackingGains]);

  const rawStimulusCurrency = useMemo(() => {
    if (!storedSimulusBalance || !stimulusBalance) return null;
    const calc = (+stimulusBalance.toFixed(2) - +storedSimulusBalance).toFixed(
      0
    );
    return calc;
  }, [stimulusBalance, storedSimulusBalance, isTrackingGains]);

  const formattedStim = React.useCallback(() => {
    if (!stimulusBalance) return "-";
    return stimulusBalance.toFixed(2);
  }, [stimulusBalance]);

  const [trumpGainsUSD, setTrumpGainsUSD] = React.useState("-");
  const [stimGainsUSD, setStimGainsUSD] = React.useState("-");

  useEffect(() => {
    try {
      if (rawTrumpCurrency && +rawTrumpCurrency.toFixed(0) < 0) {
        setTrumpGainsUSD("-");
        return;
      }
      if (rawTrumpCurrency && +rawTrumpCurrency.toFixed(0) > 0) {  
        const provider = window.ethereum ? window.ethereum : walletconnect
        const w3 = new Web3(provider as any).eth;
        const routerContr = new w3.Contract(routerAbi as any, routerAddress);
        const ten9 = 10 ** 9;
        const amount = +rawTrumpCurrency.toFixed(0) * ten9;
        const amountsOut = routerContr.methods.getAmountsOut(BigInt(amount), [
          trumpCoin.address,
          WETH9[1].address,
          USDC.address,
        ]);
        amountsOut.call().then((response: any) => {
          const usdc = response[response.length - 1];
          const ten6 = 10 ** 6;
          const usdcValue = usdc / ten6;
          setTrumpGainsUSD(usdcValue.toFixed(2));
        });
        // pseudo code
      }
    } catch (err) {
      console.error(err);
    }
  }, [rawTrumpCurrency, trumpCoin.address, trumpBalance, storedTrumpBalance]);

  useEffect(() => {
    try {
      if (rawStimulusCurrency && +rawStimulusCurrency < 0) {
        setStimGainsUSD("-");
        return;
      }
      if (rawStimulusCurrency && +rawStimulusCurrency > 0) {
        const provider = window.ethereum ? window.ethereum : walletconnect

        const w3 = new Web3(provider as any).eth;
        const routerContr = new w3.Contract(routerAbi as any, routerAddress);
        const ten9 = 10 ** 9;
        const amount = +rawStimulusCurrency * ten9;
        const amountsOut = routerContr.methods.getAmountsOut(BigInt(amount), [
          stimulusCoin.address,
          WETH9[1].address,
          USDC.address,
        ]);
        amountsOut.call().then((response: any) => {
          console.log(response);
          const usdc = response[response.length - 1];
          const ten6 = 10 ** 6;
          const usdcValue = usdc / ten6;
          setStimGainsUSD(usdcValue.toFixed(2));
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [rawStimulusCurrency, stimulusCoin.address, stimulusBalance, storedSimulusBalance]);

  const [trumpBalanceUSD, setTrumpBalanceUSD] = React.useState("");
  React.useEffect(() => {
    try {
      if (trumpBalance && +trumpBalance < 0) {
        setTrumpBalanceUSD("-");
        return;
      }
      if (trumpBalance && +trumpBalance > 0) {
        const provider = window.ethereum ? window.ethereum : walletconnect
        const w3 = new Web3(provider as any).eth;
        const routerContr = new w3.Contract(routerAbi as any, routerAddress);
        const ten9 = 10 ** 9;
        const amount = +trumpBalance.toFixed(0) * ten9;
        const amountsOut = routerContr.methods.getAmountsOut(BigInt(amount), [
          trumpCoin.address,
          WETH9[1].address,
          USDC.address,
        ]);
        amountsOut.call().then((response: any) => {
          console.log(response);
          const usdc = response[response.length - 1];
          const ten6 = 10 ** 6;
          const usdcValue = usdc / ten6;
          setTrumpBalanceUSD(usdcValue.toFixed(2));
        });
      }
    } catch (ex) {
      console.error(ex);
    }
  }, [trumpBalance, trumpCoin.address]);
const [darkMode] = useDarkModeManager()
  const [stimulusBalanceUSD, setStimulusBalanceUSD] = React.useState("");
  React.useEffect(() => {
    try {
      if (stimulusBalance && +stimulusBalance < 0) {
        setStimulusBalanceUSD("-");
        return;
      }
      if (stimulusBalance) {
        const w3 = new Web3(window.ethereum as any).eth;
        const routerContr = new w3.Contract(routerAbi as any, routerAddress);
        const ten9 = 10 ** 9;
        const amount = +stimulusBalance?.toFixed(0) * ten9;
        const amountsOut = routerContr.methods.getAmountsOut(BigInt(amount), [
          stimulusCoin.address,
          WETH9[1].address,
          USDC.address,
        ]);
        amountsOut.call().then((response: any) => {
          console.log(response);
          const usdc = response[response.length - 1];
          const ten6 = 10 ** 6;
          const usdcValue = usdc / ten6;
          setStimulusBalanceUSD(usdcValue.toFixed(2));
        });
      }
    } catch (ex) {
      console.error(ex);
    }
  }, [stimulusBalance, stimulusCoin.address]);

  const goldBalance = useTrumpGoldBalance(account)
  const [goldBalanceUSD, setGoldBalanceUSD] = React.useState("");
  React.useEffect(() => {
    try {
      if (goldBalance && +goldBalance < 0) {
        setGoldBalanceUSD("-");
        return;
      }
      if (goldBalance) {
        const w3 = new Web3(window.ethereum as any).eth;
        const routerContr = new w3.Contract(routerAbi as any, routerAddress);
        const ten9 = 10 ** 9;
        const amount = +goldBalance?.toFixed(0) * ten9;
        const amountsOut = routerContr.methods.getAmountsOut(BigInt(amount), [
          '0x29699C8485302cd2857043FaB8bd885bA08Cf268',
          WETH9[1].address,
          USDC.address,
        ]);
        amountsOut.call().then((response: any) => {
          console.log(response);
          const usdc = response[response.length - 1];
          const ten6 = 10 ** 6;
          const usdcValue = usdc / ten6;
          setGoldBalanceUSD(usdcValue.toFixed(2));
        });
      }
    } catch (ex) {
      console.error(ex);
    }
  }, [goldBalance]);
  const [showTGoldTool, setShowTGoldTool] = useState(false);
  const trumpValue = useUSDCValue(trumpBalance);
  const stimulusValue = useUSDCValue(stimulusBalance);
  const goldValue = useUSDCValue(goldBalance)
  return (
    <>
      <PageWrapper gap="lg" justify="center">
        <ProposalInfo gap="lg" justify="space-between">
          <Card>
            <CardSection>
              <TYPE.black>
                <small>
                  <Info />
                  <Trans>
                    {`NOTE: Squeeze GAINS v1 is meant for holders whom are not transferring / selling tokens, but wanting to track the amount of gains they have obtained from holding.
                     In the future, we plan to build the ability to filter out transactions that are sells / transfers.`}
                  </Trans>
                  &nbsp;
                </small>
              </TYPE.black>
              <br />
              {isTrackingGains && (
                <BlueCard>
                  <TYPE.main>
                    <small>
                      <Clock />
                      &nbsp;{" "}
                      <Trans>Started tracking gains {trackingSince} </Trans>
                    </small>
                  </TYPE.main>
                </BlueCard>
              )}
            </CardSection>
            <AutoColumn gap="50px">
              <GreyCard justifyContent="center">
                <div style={{ display: "flex", flexFlow: "row wrap" }}>
                  {!account && (
                    <TYPE.white>
                      <Trans>
                        Please connect wallet to start tracking gains.
                      </Trans>
                    </TYPE.white>
                  )}
                  <img
                    src={
                     squeezeLogo
                    }
                    width="100px"
                  />
                  <div style={{ marginTop: 40, alignItems: "baseline" }}>
                    <TYPE.white className="d-flex">
                      <Trans>
                        {trumpBalance !== undefined
                          ? `Squeeze Balance ${trumpBalance?.toFixed(
                              2
                            )} (${(+trumpBalanceUSD)?.toFixed(2)} USD)`
                          : null}
                      </Trans>
                    </TYPE.white>
                    {isTrackingGains === true && (
                      <TYPE.main style={{color: darkMode ? '#fff' : '#222'}}  className="d-flex">
                        {storedTrumpBalance !== undefined &&
                          trumpBalance !== undefined &&
                          account !== undefined && (
                            <React.Fragment>
                              <ArrowUp />
                              &nbsp;
                              <Trans>{`SqueezeGains`} </Trans> &nbsp;
                              {(
                                +trumpBalance?.toFixed(2) - +storedTrumpBalance
                              ).toFixed(2)}
                              <br />
                              {isTrackingGains && trumpGainsUSD && (
                                <Badge style={{ paddingTop: 5 }}>
                                  <small>
                                    <Trans>Total GAINS</Trans>
                                  </small>
                                  &nbsp;
                                  {rawTrumpCurrency &&
                                  +rawTrumpCurrency?.toFixed(0) > 0
                                    ? trumpGainsUSD
                                    : "-"}
                                  <small>
                                    &nbsp;<Trans>USD</Trans>
                                  </small>
                                </Badge>
                              )}
                            </React.Fragment>
                          )}
                      </TYPE.main>
                    )}
                  </div>
                </div>
              </GreyCard>
            </AutoColumn>
         
            <AutoColumn gap="50px">
              <ButtonPrimary style={{marginTop:15}} onClick={trackGains}>
                {isTrackingGains && <Trans>Stop tracking Gains</Trans>}
                {!isTrackingGains && <Trans>Start Tracking Gains</Trans>}
              </ButtonPrimary>
            </AutoColumn>
           
          </Card>
        </ProposalInfo>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  );
}
