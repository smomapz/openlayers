/**
 * @module ol/mapz/Popup
 */

import Overlay from '../Overlay.js';

/**
 * @typedef {Object} PopupOptions
 * @property {boolean} [insertFirst=true] Whether the overlay is inserted first
 * in the overlay container, or appended. If the overlay is placed in the same
 * container as that of the controls (see the `stopEvent` option) you will
 * probably set `insertFirst` to `true` so the overlay is displayed below the
 * controls.
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-layerswitcher'.
 * @property {boolean|undefined} [panView] If true, the map will be panned to the popup's position. Default is true.
 * @property {import('../Overlay.js').PanOptions|undefined} [panOptions] The options for the pan animation. Default is {'duration': 250}.
 */

/**
 * @classdesc
 * Create an own Popup
 *
 * @api
 */

class Popup extends Overlay {
  /**
   * @param {PopupOptions} opt_options Popup options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const panView = options.panView !== undefined ? options.panView : true;

    const panOptions =
      options.panOptions !== undefined ? options.panOptions : {'duration': 250};

    const container = document.createElement('div');
    container.className = 'ol-popup';

    const closer = document.createElement('a');
    closer.className = 'ol-popup-closer';
    closer.href = '#';
    container.appendChild(closer);

    const content = document.createElement('div');
    content.className = 'ol-popup-content';
    container.appendChild(content);

    super({
      element: container,
      stopEvent: true,
      insertFirst: options.hasOwnProperty('insertFirst')
        ? options.insertFirst
        : true,
    });

    /**
     * The HTML Element for the container of the popup.
     * @type {HTMLDivElement}
     */
    this.container = container;
    /**
     * The HTML Element for the content of the popup.
     * @type {HTMLDivElement}
     */
    this.content = content;
    /**
     * Pan to the target when showing the popup.
     * @type {boolean}
     */
    this.panView = panView;
    /**
     * The options for the pan animation.
     * @type {import('../Overlay.js').PanOptions}
     */
    this.panOptions = panOptions;

    closer.onclick = (evt) => {
      container.style.display = 'none';
      closer.blur();
      evt.preventDefault();
    };

    // Apply workaround to enable scrolling of content div on touch devices
    this.enableTouchScroll_(content);
  }

  /**
   * @private
   * @return {boolean} The result of the hasTouch property of the viewport.
   */
  isTouchDevice_() {
    try {
      document.createEvent('TouchEvent');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * @private
   * @param {HTMLElement} elem An HTML Element.
   */
  enableTouchScroll_(elem) {
    if (this.isTouchDevice_()) {
      let scrollStartPos = 0;
      elem.addEventListener(
        'touchstart',
        function (event) {
          scrollStartPos = this.scrollTop + event.touches[0].pageY;
        },
        false
      );
      elem.addEventListener(
        'touchmove',
        function (event) {
          this.scrollTop = scrollStartPos - event.touches[0].pageY;
        },
        false
      );
    }
  }

  /**
   * Show the popup.
   * @param {import('../Coordinate.js').Coordinate} coord Where to anchor the popup.
   * @param {string} html String of HTML to display within the popup.
   * @return {HTMLDivElement} The content of the popup.
   * @api
   */
  show(coord, html) {
    this.setPosition(coord);
    this.content.innerHTML = html;
    this.container.style.display = 'block';
    if (this.panView) {
      this.panIntoViewPopup_(coord);
    }
    this.content.scrollTop = 0;
    return this.content;
  }

  /**
   * @private
   * @param {import('../Coordinate.js').Coordinate} coord Where to anchor the popup.
   * @return {import('../Coordinate.js').Coordinate} The center for the popup.
   */
  panIntoViewPopup_(coord) {
    const map = this.getMap();

    if (map === undefined) {
      return;
    }

    const popSize = {
      width: this.getElement().clientWidth + 20,
      height: this.getElement().clientHeight + 20,
    };
    const mapSize = map.getSize();

    const tailHeight = 20;
    const tailOffsetLeft = 60;
    const tailOffsetRight = popSize.width - tailOffsetLeft;
    const popOffset = this.getOffset();
    const popPx = map.getPixelFromCoordinate(coord);

    const fromLeft = popPx[0] - tailOffsetLeft;
    const fromRight = mapSize[0] - (popPx[0] + tailOffsetRight);

    const fromTop = popPx[1] - popSize.height + popOffset[1];
    const fromBottom = mapSize[1] - (popPx[1] + tailHeight) - popOffset[1];

    const center = map.getView().getCenter();
    if (center === undefined) {
      throw new Error('center is undefined');
    }
    const curPx = map.getPixelFromCoordinate(center);
    const newPx = curPx.slice();

    if (fromRight < 0) {
      newPx[0] -= fromRight;
    } else if (fromLeft < 0) {
      newPx[0] += fromLeft;
    }

    if (fromTop < 0) {
      newPx[1] += fromTop;
    } else if (fromBottom < 0) {
      newPx[1] -= fromBottom;
    }

    const targetCoords = map.getCoordinateFromPixel(newPx);

    if (this.panView && this.panOptions) {
      map.getView().animate({center: targetCoords, ...this.panOptions});
    } else {
      map.getView().setCenter(targetCoords);
    }

    return map.getView().getCenter();
  }

  /**
   * Hide the popup.
   * @return {HTMLDivElement} The HTML content of the popup.
   * @api
   */
  hide() {
    this.container.style.display = 'none';
    return this.content;
  }

  /**
   * Toggle display of the popup.
   * @return {HTMLDivElement} The HTML content of the popup.
   * @api
   */
  toggle() {
    if (this.container.style.display == 'block') {
      this.container.style.display = 'none';
    } else {
      this.container.style.display = 'block';
    }
    return this.content;
  }
}

export default Popup;
