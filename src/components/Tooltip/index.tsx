import Popover, { PopoverProps } from '../Popover'
import { ReactNode, useCallback, useState } from 'react'

import styled from 'styled-components/macro'

const TooltipContainer = styled.div<{width?:number}>`
  width: ${props => props.width ? props.width : 256}px;
  padding: 0.6rem 1rem;
  font-weight: 400;
  font-family: Open Sans;
  word-break: break-word;


`

interface TooltipProps extends Omit<PopoverProps, 'content'> {
  text: ReactNode
  width?:number
}

interface TooltipContentProps extends Omit<PopoverProps, 'content'> {
  content: ReactNode
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer width={rest.width}>{text}</TooltipContainer>} {...rest} />
}

function TooltipContent({ content, ...rest }: TooltipContentProps) {
  return <Popover content={<TooltipContainer >{content}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <Tooltip {...rest} show={show}>
      <div onMouseEnter={open} onMouseLeave={close}>
        {children}
      </div>
    </Tooltip>
  )
}

export function MouseoverTooltipContent({ content, children, ...rest }: Omit<TooltipContentProps, 'show'>) {
  const [show, setShow] = useState(false)
  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])
  return (
    <TooltipContent {...rest} show={show} content={content}>
      <div
        style={{ display: 'inline-block', lineHeight: 0, padding: '0.25rem' }}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        {children}
      </div>
    </TooltipContent>
  )
}