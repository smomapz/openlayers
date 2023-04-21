/**
 * @module ol/mapz/control/Geolocate
 */

import Control from '../../control/Control.js';
import Geolocation from '../../Geolocation.js';
import Modal from './Modal.js';
import {CLASS_CONTROL, CLASS_UNSELECTABLE} from '../../css.js';

/**
 * @typedef {Object} GeolocateOptions
 * @property {HTMLElement|string} [target] Specify a target if you want
 * the control to be rendered outside of the map's viewport.
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-geolocate'.
 * @property {boolean|undefined} [autoLocate] If true, the control is automatically activated when the map is loaded. Default is false.
 * @property {number|undefined} [zoomToLevel] The zoom level to use when the control is clicked. Default is 16.
 * @property {string|undefined} [tipLabel] The label to use for the tip. Default is 'Click to locate'.
 */

/**
 * @classdesc
 * A button control to center map on current position.
 * To style this control use css selector `.mapz-control-geolocate`.
 *
 * @api
 */
class Geolocate extends Control {
  /**
   * @param {GeolocateOptions} opt_options Geolocate options.
   */
  constructor(opt_options) {
    let className = opt_options.className
      ? opt_options.className
      : 'mapz-control-geolocate';
    className = CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL + ' ' + className;

    const element = document.createElement('div');
    element.setAttribute('class', className);

    super({
      element: element,
    });

    const options = opt_options ? opt_options : {};

    /**
     * @private
     * @type {Geolocation}
     */
    this.geolocation_ = null;

    /**
     * @private
     * @type {Modal}
     */
    this.errorModal_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.autoLocate =
      options.autoLocate !== undefined ? options.autoLocate : false;

    /**
     * @private
     * @type {number}
     */
    this.zoomToLevel = options.zoomToLevel ? options.zoomToLevel : 16;

    /**
     * @private
     * @type {string}
     */
    const tipLabel = options.tipLabel ? options.tipLabel : 'Geolocate';

    const button = document.createElement('button');
    button.setAttribute('class', className + '-button');
    button.type = 'button';
    button.title = tipLabel;
    button.onclick = (event) => {
      this.handleClick_(event);
    };

    element.appendChild(button);
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
    this.setGeolocation_(this.autoLocate);
  }

  /**
   * @param {boolean} startTracking Start tracking right away.
   * @private
   */
  setGeolocation_(startTracking) {
    this.geolocation_ = new Geolocation({
      projection: this.map.getView().getProjection(),
      tracking: startTracking,
    });
    this.geolocation_.on('change:position', () => {
      const position = this.geolocation_.getPosition();
      const view = this.map.getView();
      view.setCenter(position);
      view.setZoom(this.zoomToLevel);
      this.geolocation_.setTracking(false);

      if (this.errorModal_) {
        this.map.removeControl(this.errorModal_);
      }
    });
    this.geolocation_.on('error', (error) => {
      if (!this.errorModal_) {
        this.errorModal_ = new Modal({
          contentText:
            'Your system refuses geolocation, please check your system settings.',
        });
      }
      this.map.addControl(this.errorModal_);
    });
  }

  /**
   * @param {MouseEvent} event The event to handle.
   * @private
   */
  handleClick_(event) {
    event.preventDefault();
    if (!this.errorModal_ && this.geolocation_) {
      this.geolocation_.setTracking(true);
    } else {
      this.setGeolocation_(true);
    }
  }
}

export default Geolocate;
