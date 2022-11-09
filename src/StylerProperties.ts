export const StylerProperties = `
declare enum ALIGN {
  AROUND = 'around',
  AUTO = 'auto',
  BETWEEN = 'between',
  STRETCH = 'stretch',
  START = 'start',
  CENTER = 'center',
  END = 'end',
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left'
}

declare enum COLOR {
  BASE = 'base',
  CONTENT = 'content',
  ACCENT = 'accent',
  PRIMARY = 'primary',
  ALERT = 'alert',
  INFO = 'info',
  GRAYSCALE_XL = 'grayscaleXL',
  GRAYSCALE_L = 'grayscaleL',
  GRAYSCALE_M = 'grayscaleM',
  GRAYSCALE_S = 'grayscaleS',
  OVERLAY = 'overlay',
  TOUCHABLE = 'touchable'
}

declare enum DISPLAY {
  BLOCK = 'block',
  INLINE = 'inline',
  INLINE_BLOCK = 'inlineBlock',
  FLEX = 'flex',
  NONE = 'none'
}

declare enum COORD {
  
  TOP = 'Top',
  RIGHT = 'Right',
  BOTTOM = 'Bottom',
  LEFT = 'Left'
}

declare enum FLEX_DIRECTION {
  
  COLUMN = 'column',
  ROW = 'row'
}

declare enum POINTER {
  ALL = 'all',
  AUTO = 'auto',
  NONE = 'none'
}

declare enum SIZE {
  XXXS = 'XXXS',
  XXS = 'XXS',
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
  RESET = '0'
}

declare enum LAYOUT {
  XXXS = 'layoutXXXS',
  XXS = 'layoutXXS',
  XS = 'layoutXS',
  S = 'layoutS',
  M = 'layoutM',
  L = 'layoutL',
  XL = 'layoutXL',
  XXL = 'layoutXXL',
  XXXL = 'layoutXXXL'
}

declare enum POSITION {
  ABSOLUTE = 'absolute',
  FIXED = 'fixed',
  RELATIVE = 'relative',
  STICKY = 'sticky'
}

declare enum FLEX_WRAP {
  WRAP = 'wrap'
}

declare enum FONT {
  HEADING = 'heading',
  BODY = 'body',
  ACTION = 'action',
  DETAIL = 'detail',
  BRAND = 'brand'
}

interface BaseProps {
  customStyle?: object | object[], 
  nativeID?: string,
  style?: object | object[],
  testID?: string,
}

interface StylerProperties extends BaseProps {
  alignContent?: ALIGN,
  alignItems?: ALIGN,
  alignSelf?: ALIGN,
  backgroundColor?: COLOR,
  borderColor?: COLOR,
  color?: COLOR,
  display?: DISPLAY,
  flexDirection?: FLEX_DIRECTION,
  justifyContent?: ALIGN,
  layer?: SIZE,
  level?: number,
  margin?: string | object | string[],
  marginHorizontal?: string | object,
  marginVertical?: string | object,
  marginTop?: string | object,
  marginRight?: string | object,
  marginBottom?: string | object,
  padding?: string | object | string[],
  paddingHorizontal?: string | object,
  paddingVertical?: string | object,
  paddingTop?: string | object,
  paddingRight?: string | object,
  paddingBottom?: string | object,
  paddingLeft?: string | object,
  position?: POSITION,
  textAlign?: ALIGN,
  upperCase?: boolean,
  wide?: boolean
}
`;
