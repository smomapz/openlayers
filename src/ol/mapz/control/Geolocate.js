/**
 * @module ol/mapz/control/Geolocate
 */

import Control from '../../control/Control.js';
import Geolocation from '../../Geolocation.js';
import {CLASS_CONTROL, CLASS_UNSELECTABLE} from '../../css.js';

/**
 * @typedef {Object} GeolocateOptionsType
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-geolocate'.
 * @property {boolean|undefined} [autoLocate] If true, the control is automatically activated when the map is loaded. Default is false.
 * @property {number|undefined} [zoomToLevel] The zoom level to use when the control is clicked. Default is 16.
 * @property {string|undefined} [tipLabel] The label to use for the tip. Default is 'Click to locate'.
 * @typedef {import('../../control/Control.js').Options & GeolocateOptionsType} GeolocateOptions
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
    const className = opt_options.className
      ? opt_options.className
      : 'mapz-control-geolocate';
    let cssClasses = className;

    if (!opt_options.target) {
      cssClasses += ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    }

    const element = document.createElement('div');
    element.setAttribute('class', cssClasses);

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
   * @param {import("../../PluggableMap.js").default} map The map.
   */
  setMap(map) {
    super.setMap(map);
    this.map = map;
    if (map === null) {
      return;
    }
    this.geolocation_ = new Geolocation({
      projection: map.getView().getProjection(),
      tracking: this.autoLocate,
    });
    this.geolocation_.on('change:position', () => {
      const position = this.geolocation_.getPosition();
      const view = map.getView();
      view.setCenter(position);
      view.setZoom(this.zoomToLevel);
      this.geolocation_.setTracking(false);
    });
  }

  /**
   * @param {MouseEvent} event The event to handle.
   * @private
   */
  handleClick_(event) {
    event.preventDefault();
    if (this.geolocation_) {
      this.geolocation_.setTracking(true);
    }
  }
}

export default Geolocate;
