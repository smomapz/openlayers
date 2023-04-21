/**
 * @module ol/mapz/control/Modal
 */

import Control from '../../control/Control.js';
import {CLASS_CONTROL, CLASS_UNSELECTABLE} from '../../css.js';

/**
 * @typedef {Object} ModalOptions
 * @property {HTMLElement|string} [target] Specify a target if you want
 * the control to be rendered outside of the map's viewport.
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-modal'.
 * @property {string|undefined} [contentText] The text to display in the modal.
 */

/**
 * @classdesc
 * A control to display a modal.
 * To style this control use css selector `.mapz-control-modal`.
 *
 * @api
 */
class Modal extends Control {
  /**
   * @param {ModalOptions} opt_options Modal options.
   */
  constructor(opt_options) {
    const className = opt_options.className
      ? opt_options.className
      : 'mapz-control-modal';
    const combinedClassName =
      CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL + ' ' + className;

    const element = document.createElement('div');
    element.setAttribute('class', combinedClassName);

    super({
      element: element,
    });

    const options = opt_options ? opt_options : {};

    /**
     * @private
     * @type {string}
     */
    const contentText = options.contentText ? options.contentText : '';

    const content = document.createElement('div');
    content.setAttribute('class', className + '-content');

    const message = document.createElement('div');
    message.setAttribute('class', className + '-message');
    message.innerText = contentText;

    content.appendChild(message);
    element.appendChild(content);
  }

  /**
   * @inheritDoc
   */
  setMap(map) {
    super.setMap(map);
    this.map = map;
    if (map === null) {
      return;
    }
    map.getControls().on('add', ({element, target}) => {
      if (!(element instanceof Modal)) {
        return;
      }
      for (const control of target.getArray()) {
        if (control instanceof Modal && control !== element) {
          map.removeControl(control);
        }
      }
    });
  }
}

export default Modal;
