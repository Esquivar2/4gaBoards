import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import TextAreaStyle from './TextAreaStyle';

import * as gs from '../../../global.module.scss';
import * as s from './TextArea.module.scss';

const TextArea = React.forwardRef(({ disableSpellcheck, style, className, isError, ...props }, ref) => {
  const styles = Array.isArray(style) ? style.map((st) => s[st]) : style && s[style];
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TextareaAutosize ref={ref} spellCheck={!disableSpellcheck} className={clsx(s.textarea, gs.scrollableY, styles, className, isError && s.textareaError)} {...props} />
  );
});

TextArea.propTypes = {
  disableSpellcheck: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.oneOf(Object.values(TextAreaStyle)), PropTypes.arrayOf(PropTypes.oneOf(Object.values(TextAreaStyle)))]),
  className: PropTypes.string,
  isError: PropTypes.bool,
};

TextArea.defaultProps = {
  disableSpellcheck: false,
  style: undefined,
  className: undefined,
  isError: false,
};

export default React.memo(TextArea);
