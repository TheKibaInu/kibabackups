import * as styles from './MenuDropdown.css'

import {
  BarChartIcon,
  ChevronDownBagIcon,
  ChevronUpIcon,
  DiscordIconMenu,
  EllipsisIcon,
  GithubIconMenu,
  GovernanceIcon,
  MagnifyingGlassIcon,
  ToolsIcon,
  TwitterIconMenu,
} from 'components/AndyComponents/icons'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code,
  List,
  Moon,
  Star,
  Sun,
  Tool,
} from 'react-feather'
import { Column, FlRow } from 'components/AndyComponents/Flex'
import { MenuHoverA, MenuHoverB } from './MenuHover'
import { NavLink, NavLinkProps } from 'react-router-dom'
import { ReactNode, useContext, useReducer, useRef, useState } from 'react'
import { body, bodySmall } from 'components/AndyComponents/common.css'
import styled, { ThemeContext } from 'styled-components/macro'
import { useIsMobileSp, useIsTabletSp } from 'components/AndyComponents/AndyHooks'

import { Box } from 'components/AndyComponents/Box'
import { IconWrapper } from 'theme'
import { NavDropdown } from './NavDropdown'
import { NavIcon } from './NavIcon'
import { Trans } from '@lingui/macro'
import { themeVars } from 'theme/spinkles.css'
import { useDarkModeManager } from 'state/user/hooks'
import { useOnClickOutside } from 'hooks/useOnClickOutside'



const PrimaryMenuRow = ({
  to,
  href,
  close,
  children,
}: {
  to?: NavLinkProps['to']
  href?: string
  close?: () => void
  children: ReactNode
}) => {
  return (
    <>
      {to ? (
        <NavLink to={to} className={styles.MenuRow}>
          <FlRow onClick={close}>{children}</FlRow>
        </NavLink>
      ) : (
        <FlRow as="a" href={href} target={'_blank'} rel={'noopener noreferrer'} className={styles.MenuRow}>
          {children}
        </FlRow>
      )}
    </>
  )
}

const PrimaryMenuRowText = ({ children }: { children: ReactNode }) => {
  return <Box className={`${styles.PrimaryText} ${body}`}>{children}</Box>
}

PrimaryMenuRow.Text = PrimaryMenuRowText

const ModalMenuItem = styled.button`
  background-color: transparent;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0rem 0rem;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
  :hover {
    color: ${({ theme }) => theme.text2};
    transition: ease all 0.2s ;
    cursor: pointer;
    text-decoration: none;
  }
`


const ChevronWrapper = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 0px 0px 0px 0px;

  :hover {  
  }
  :hover,
  :active,
  :focus {
    border: none;
  }
`

interface MenuItemProps {
  isActive?: boolean
  children: ReactNode
}

const ToolsWrapper = ({ isActive, children }: MenuItemProps) => {
  return (
    <Box className={isActive ? styles.activeMenuItem : styles.menuItem}>
      {children}
    </Box>
  )
}
const MenuDivider = styled.div`
 
  margin: 0px;
  width: 2px;
`



const Icon = ({ href, children }: { href?: string; children: ReactNode }) => {
  return (
    <>
      <Box
        as={href ? 'a' : 'div'}
        href={href ?? undefined}
        target={href ? '_blank' : undefined}
        rel={href ? 'noopener noreferrer' : undefined}
        display="flex"
        flexDirection="column"
        color="textPrimary"
        background="none"
        border="none"
        justifyContent="center"
        textAlign="center"
        marginRight="12"
      >
        {children}
      </Box>
    </>
  )
}

export const ToolsDropdown = () => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)
  const isMobile = useIsMobileSp()
  const theme = useContext(ThemeContext)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, isOpen ? toggleOpen : undefined)

  return (
    <>
      
      <Box position="relative" ref={ref} >

      {isMobile? <MenuHoverB isActive={isOpen} onClick={toggleOpen}>
          <ToolsWrapper isActive={isOpen}>
            <ToolsIcon/>
          </ToolsWrapper>
          </MenuHoverB>  
          : null
        }
      
  
        {isMobile? null : <MenuHoverA isActive={isOpen} onClick={toggleOpen}>
           <FlRow><Trans>Tools </Trans><ChevronWrapper>
            <MenuDivider/>
            {isOpen ? <ChevronUp size={24} color={theme.text2}  /> : <ChevronDown size={20} color={theme.text2} />}
          </ChevronWrapper></FlRow>
        </MenuHoverA>}

        {isOpen && (
          <NavDropdown top={{ sm: 'unset', lg: '56' }} bottom={{ sm: '56', lg: 'unset' }} right="0">
            <Column gap="16">
              <Column paddingX="8" gap="4">
                <PrimaryMenuRow to="/fomo" close={toggleOpen}>
                  <Icon>
                  <Star opacity={0.6} size={16} />
                  </Icon>
                  <ModalMenuItem>
                    <Trans>KibaFomo</Trans>
                  </ModalMenuItem>
                </PrimaryMenuRow>
                <PrimaryMenuRow to="/honeypot-checker" close={toggleOpen}>
                  <Icon>
                  <Code opacity={0.6} size={16} />
                  </Icon>
                  <ModalMenuItem>
                    Honeypot Checker
                  </ModalMenuItem>
                </PrimaryMenuRow>
                <PrimaryMenuRow to="/suite" close={toggleOpen}>
                  <Icon>
                  <Tool size={16} opacity={0.6} />
                  </Icon>
                  <ModalMenuItem>
                    <Trans>KibaTools</Trans>
                  </ModalMenuItem>
                </PrimaryMenuRow>
                <PrimaryMenuRow to="/details" close={toggleOpen}>
                  <Icon>
                  <List size={16} opacity={0.6} />
                  </Icon>
                  <ModalMenuItem>
                    <Trans>Transactions</Trans>
                  </ModalMenuItem>
                </PrimaryMenuRow>
              </Column>
              
              
            </Column>
          </NavDropdown>
        )}
      </Box>
     
    
    </>
  )
}
