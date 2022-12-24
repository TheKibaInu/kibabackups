import { style } from '@vanilla-extract/css'
import { lightGrayOverlayOnHover } from 'components/AndyComponents/common.css'

import { sprinkles } from 'theme/spinkles.css'

export const ChainSelector = style([
  lightGrayOverlayOnHover,
  sprinkles({
    borderRadius: '8',
    height: '40',
    cursor: 'pointer',
    border: 'none',
    color: 'textPrimary',
    background: 'none',
  }),
])

export const Image = style([
  sprinkles({
    width: '20',
    height: '20',
  }),
])
