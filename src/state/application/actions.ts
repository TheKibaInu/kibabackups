import { createAction } from '@reduxjs/toolkit'
import { SupportedChainId } from 'constants/chains'

export type PopupContent =
  | {
    txn: {
      hash: string
      success: boolean
      summary?: string
    }
  }
  | {
    failedSwitchNetwork: SupportedChainId
  }

export enum ApplicationModal {
  WALLET,
  SETTINGS,
  SELF_CLAIM,
  ADDRESS_CLAIM,
  CLAIM_POPUP,
  MENU,
  GAINS,
  DELEGATE,
  VOTE,
  POOL_OVERVIEW_OPTIONS,
  ARBITRUM_OPTIONS,
}

export const updateChainId = createAction<{ chainId: number | null }>('application/updateChainId')
export const updateBlockNumber = createAction<{ chainId: number; blockNumber: number }>('application/updateBlockNumber')
export const setOpenModal = createAction<ApplicationModal | null>('application/setOpenModal')
export const addPopup =
  createAction<{ key?: string; removeAfterMs?: number | null; content: PopupContent }>('application/addPopup')
export const removePopup = createAction<{ key: string }>('application/removePopup')
