import { Currency, Token } from '@uniswap/sdk-core'
import React, { useCallback, useEffect, useState } from 'react'
import { useAddUserToken, useIsExpertMode } from 'state/user/hooks'

import { CurrencySearch } from './CurrencySearch'
import { ImportList } from './ImportList'
import { ImportToken } from './ImportToken'
import Manage from './Manage'
import Modal from '../Modal'
import { TokenList } from '@uniswap/token-lists'
import { WrappedTokenInfo } from '../../state/lists/wrappedTokenInfo'
import useLast from '../../hooks/useLast'
import usePrevious from 'hooks/usePrevious'

interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showCurrencyAmount?: boolean
  disableNonToken?: boolean
}

export enum CurrencyModalView {
  search,
  manage,
  importToken,
  importList,
}

export const CurrencySearchModal = React.memo((props: CurrencySearchModalProps) => {
  const {
    isOpen,
    onDismiss,
    onCurrencySelect,
    selectedCurrency,
    otherSelectedCurrency,
    showCommonBases = false,
    showCurrencyAmount = true,
    disableNonToken = false,
  } = props;
  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.manage)
  const lastOpen = useLast(isOpen)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CurrencyModalView.search)
    }
  }, [isOpen, lastOpen])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // for token import view
  const prevView = usePrevious(modalView)

  // used for import token flow
  const [importToken, setImportToken] = useState<Token | undefined>()

  // used for import list
  const [importList, setImportList] = useState<TokenList | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  // change min height if not searching
  const minHeight = modalView === CurrencyModalView.importToken
    || modalView === CurrencyModalView.importList ? 40 : 80

  const showManageView = () =>
    setModalView(CurrencyModalView.manage)

  // if they are on "Expert Mode", we will not show the Import dialog to provide a quicker swapping experience
  const expertMode = useIsExpertMode()
  const addToken = useAddUserToken()

  const showImportView = (token?: Token) => {
    if (!expertMode) {
      setModalView(CurrencyModalView.importToken)
    } else {
      if (importToken || token) {
        const theToken = (token ?? importToken) as Token
        // add the token to the users tokens (stored in localStorage)
        addToken(theToken)
        // select the imported token
        handleCurrencySelect &&
          handleCurrencySelect(theToken)

        // close the search modal
        onDismiss()
      }
    }
  }

  const onBackImportTokenFn = () =>
    setModalView(prevView && prevView !== CurrencyModalView.importToken ?
      prevView : CurrencyModalView.search
    )

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={minHeight}>
      {modalView === CurrencyModalView.search ? (
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showCurrencyAmount={showCurrencyAmount}
          showImportView={showImportView}
          setImportToken={setImportToken}
          showManageView={showManageView}
        />
      ) : modalView === CurrencyModalView.importToken &&
        importToken ? (
        <ImportToken
          tokens={[importToken]}
          onDismiss={onDismiss}
          list={
            importToken instanceof WrappedTokenInfo ?
              importToken.list :
              undefined
          }
          onBack={onBackImportTokenFn}
          handleCurrencySelect={handleCurrencySelect}
        />
      ) : modalView === CurrencyModalView.importList &&
        importList && listURL ? (
        <ImportList list={importList}
          listURL={listURL}
          onDismiss={onDismiss}
          setModalView={setModalView} />
      ) : modalView === CurrencyModalView.manage ? (
        <Manage
          onDismiss={onDismiss}
          setModalView={setModalView}
          setImportToken={setImportToken}
          setImportList={setImportList}
          setListUrl={setListUrl}
        />
      ) : (
        ''
      )
      }
    </Modal>
  )
})
CurrencySearchModal.displayName = 'csm';
export default CurrencySearchModal;