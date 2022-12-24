import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from 'constants/chains'
import { SupportedChainId } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useSelectChain from 'hooks/useSelectChain'
import useSyncChainQuery from 'hooks/useSyncChainQuery'
import { Box } from 'components/AndyComponents/Box'
import { Portal } from 'components/AndyComponents/Portal'
import { Column, FlRow } from 'components/AndyComponents/Flex'
import { TokenWarningRedIcon } from 'components/AndyComponents/icons'
import { subhead } from 'components/AndyComponents/common.css'
import { themeVars } from 'theme/spinkles.css'
import { useIsMobileSp } from 'components/AndyComponents/AndyHooks'
import { useCallback, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useTheme } from 'styled-components/macro'

import * as styles from './ChainSelector.css'
import ChainSelectorRow from './ChainSelectorRow'
import { NavDropdown } from './NavDropdown'

const NETWORK_SELECTOR_CHAINS = [
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.BINANCE,
]

interface ChainSelectorProps {
  leftAlign?: boolean
}

export const ChainSelector = ({ leftAlign }: ChainSelectorProps) => {
  const { chainId } = useWeb3React()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isMobile = useIsMobileSp()

  const theme = useTheme()

  const ref = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setIsOpen(false))

  const info = chainId ? getChainInfo(chainId) : undefined

  const selectChain = useSelectChain()
  useSyncChainQuery()

  const [pendingChainId, setPendingChainId] = useState<SupportedChainId | undefined>(undefined)

  const onSelectChain = useCallback(
    async (targetChainId: SupportedChainId) => {
      setPendingChainId(targetChainId)
      await selectChain(targetChainId)
      setPendingChainId(undefined)
      setIsOpen(false)
    },
    [selectChain, setIsOpen]
  )

  if (!chainId) {
    return null
  }

  const isSupported = !!info

  const dropdown = (
    <NavDropdown top="56" left={leftAlign ? '0' : 'auto'} right={leftAlign ? 'auto' : '0'} ref={modalRef}>
      <Column paddingX="8">
        {NETWORK_SELECTOR_CHAINS.map((chainId: SupportedChainId) => (
          <ChainSelectorRow
            onSelectChain={onSelectChain}
            targetChain={chainId}
            key={chainId}
            isPending={chainId === pendingChainId}
          />
        ))}
      </Column>
    </NavDropdown>
  )

  const chevronProps = {
    height: 20,
    width: 20,
    color: theme.textSecondary,
  }

  return (
    <Box position="relative" ref={ref}>
      <FlRow
        as="button"
        gap="8"
        className={styles.ChainSelector}
        background={isOpen ? 'accentActiveSoft' : 'none'}
        onClick={() => setIsOpen(!isOpen)}
      >
        {!isSupported ? (
          <>
            <TokenWarningRedIcon fill={themeVars.colors.textSecondary} width={24} height={24} />
            <Box as="span" className={subhead} display={{ sm: 'none', xxl: 'flex' }} style={{ lineHeight: '20px' }}>
              Unsupported
            </Box>
          </>
        ) : (
          <>
            <img src={info.logoUrl} alt={info.label} className={styles.Image} />
            <Box as="span" className={subhead} display={{ sm: 'none', xxl: 'flex' }} style={{ lineHeight: '20px' }}>
              {info.label}
            </Box>
          </>
        )}
        {isOpen ? <ChevronUp {...chevronProps} /> : <ChevronDown {...chevronProps} />}
      </FlRow>
      {isOpen && (isMobile ? <Portal>{dropdown}</Portal> : <>{dropdown}</>)}
    </Box>
  )
}
