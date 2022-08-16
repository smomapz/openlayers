/**
 * @module ol/mapz/control/Geotracker
 */

import Feature from '../../Feature.js';
import Geolocation from '../../Geolocation.js';
import Overlay from '../../Overlay.js';
import VectorSource from '../../source/Vector.js';
import {CLASS_CONTROL, CLASS_UNSELECTABLE} from '../../css.js';
import {Control} from '../../control.js';
import {LineString} from '../../geom.js';
import {Vector} from '../../layer.js';

/**
 * @typedef {Object} GeotrackerOptions
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-geotracker'.
 * @property {string|undefined} [tipLabel] The label to use for the tip. Default is 'Geolocate'.
 * @property {number|undefined} [maximumAge] The maximumAge member indicates that the web application is willing to accept a cached position whose age is no greater than the specified time in milliseconds. Default is 0.
 * @property {number|undefined} [timeout] The timeout member denotes the maximum length of time, expressed in milliseconds, before acquiring a position expires. Default is 0.
 * @property {boolean|undefined} [enableHighAccuracy] The enableHighAccuracy member provides a hint that the application would like to receive the most accurate location data. Default is false.
 * @property {HTMLImageElement} [marker] The marker to use for the geotracker.
 * @property {boolean|undefined} [autostart] If true, tracking is automatically activated when the map is loaded. Default is false.
 * @property {boolean|undefined} [rotate] If true, the map will rotate to the user's current direction. Default is false.
 * @property {import('../../style/Style.js').StyleLike} [trackStyle] The style to use for the track.
 */

/**
 * @classdesc
 * A button control to center map on current position.
 * To style this control use css selector `.mapz-control-geolocate`.
 *
 * @api
 */
class Geotracker extends Control {
  /**
   * @param {GeotrackerOptions} opt_options Geotracker options.
   */
  constructor(opt_options) {
    const options = opt_options ? opt_options : {};

    const className = options.className
      ? options.className
      : 'mapz-control-geotracker';

    const tipLabel = options.tipLabel ? options.tipLabel : 'Geolocate';

    const maximumAge = options.maximumAge ? options.maximumAge : 10000;

    const enableHighAccuracy =
      options.enableHighAccuracy !== undefined
        ? options.enableHighAccuracy
        : true;

    const timeout = options.timeout ? options.timeout : 600000;

    const button = document.createElement('button');
    button.setAttribute('class', className + '-button');
    button.type = 'button';
    button.title = tipLabel;
    button.onclick = () => {
      this.startTracking_();
    };

    const cssClasses =
      className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    const element = document.createElement('div');
    element.setAttribute('class', cssClasses);
    element.appendChild(button);

    super({
      element: element,
    });

    /**
     * @private
     * @type {Overlay}
     */
    this.marker_ = undefined;
    if (options.marker && options.marker.src) {
      const marker = new Image();
      marker.src = options.marker.src;
      if (options.marker.width) {
        marker.width = options.marker.width;
      }
      if (options.marker.height) {
        marker.height = options.marker.height;
      }
      this.marker_ = new Overlay({
        positioning: 'center-center',
        element: marker,
        stopEvent: false,
      });
    }

    /**
     * @private
     * @type {boolean}
     */
    this.autostart_ =
      options.autostart !== undefined ? options.autostart : false;

    /**
     * @private
     * @type {boolean}
     */
    this.rotate_ = options.rotate !== undefined ? options.rotate : false;

    /**
     * @private
     * @type {number}
     */
    this.deltaMean_ = 500;
    /**
     * @private
     * @type {number}
     */
    this.previousMean_ = 0;

    /**
     * @private
     * @type {PositionOptions}
     */
    this.trackingOptions_ = {
      maximumAge: maximumAge,
      enableHighAccuracy: enableHighAccuracy,
      timeout: timeout,
    };

    /**
     * @private
     * @type {LineString}
     */
    this.positions_ = new LineString([], 'XYZM');

    if (options.trackStyle) {
      this.trackSource_ = new VectorSource({
        features: [
          new Feature({
            geometry: this.positions_,
          }),
        ],
      });
      this.trackStyle_ = options.trackStyle;
    }
    this.geolocation_ = null;
  }

  /**
   * @inheritdoc
   */
  setMap(map) {
    super.setMap(map);
    if (!map) {
      return;
    }
    if (this.marker_) {
      map.addOverlay(this.marker_);
    }
    this.geolocation_ = new Geolocation({
      projection: map.getView().getProjection(),
      trackingOptions: this.trackingOptions_,
    });
    const _this = this;
    this.geolocation_.on('change', function () {
      const position = _this.geolocation_.getPosition();
      const heading = _this.geolocation_.getHeading() || 0;
      // add timestamp
      const m = Date.now();
      _this.addPosition_(position, heading, m);

      const coords = _this.positions_.getCoordinates();
      const len = coords.length;
      if (len >= 2) {
        _this.deltaMean_ = (coords[len - 1][3] - coords[0][3]) / (len - 1);
      }
      _this.mapFollow_();
    });
    if (this.trackSource_) {
      map.addLayer(
        new Vector({
          style: this.trackStyle_,
          source: this.trackSource_,
        })
      );
    }

    if (this.autostart_ === true) {
      this.startTracking_();
    }
  }

  /**
   * Return the current geolocation.
   * @api
   * @return {Geolocation} The current geolocation.
   */
  getGeolocation() {
    return this.geolocation_;
  }

  /**
   * @private
   */
  startTracking_() {
    if (this.trackSource_) {
      // Reset stored track
      this.positions_.setCoordinates([], 'XYZM');
      this.trackSource_.changed();
    }

    const map = this.getMap();
    this.geolocation_.setTracking(true);
    map.on('postcompose', () => {
      map.render();
    });
    map.render();
  }

  /**
   * @param {import('../../coordinate.js').Coordinate} position The position.
   * @param {number} heading The heading.
   * @param {number} m The timestamp.
   * @private
   */
  addPosition_(position, heading, m) {
    const x = position[0];
    const y = position[1];
    const fCoords = this.positions_.getCoordinates();
    const previous = fCoords[fCoords.length - 1];
    const prevHeading = previous && previous[2];
    if (prevHeading) {
      let headingDiff = heading - this.mod_(prevHeading);

      // force the rotation change to be less than 180°
      if (Math.abs(headingDiff) > Math.PI) {
        const sign = headingDiff >= 0 ? 1 : -1;
        headingDiff = -sign * (2 * Math.PI - Math.abs(headingDiff));
      }
      heading = prevHeading + headingDiff;
    }
    this.positions_.appendCoordinate([x, y, heading, m]);

    if (this.trackSource_) {
      // Update source to display track
      this.trackSource_.changed();
    } else {
      // only keep the 20 last coordinates
      this.positions_.setCoordinates(
        this.positions_.getCoordinates().slice(-20)
      );
    }
  }

  /**
   * @private
   */
  mapFollow_() {
    // use sampling period to get a smooth transition
    let m = Date.now() - this.deltaMean_ * 1.5;
    m = Math.max(m, this.previousMean_);
    this.previousMean_ = m;
    // interpolate position along positions LineString
    const c = this.positions_.getCoordinateAtM(m, true);
    const view = this.getMap().getView();
    if (c) {
      view.setCenter(
        this.getCenterWithHeading_(c, -c[2], view.getResolution())
      );
      if (this.rotate_) {
        view.setRotation(-c[2]);
      }
      if (this.marker_) {
        this.marker_.setPosition(c);
      }
    }
  }

  /**
   * Modulo for negative values.
   * @param {number} n The number to modulo.
   * @return {number} The modulo of the number.
   * @private
   */
  mod_(n) {
    return ((n % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  /**
   * @param {import('../../coordinate.js').Coordinate} position The current position.
   * @param {number} rotation The current rotation.
   * @param {number} resolution The current resolution.
   * @return {import('../../coordinate.js').Coordinate} the center with heading.
   * @private
   */
  getCenterWithHeading_(position, rotation, resolution) {
    const size = this.getMap().getSize();
    const height = size[1];

    return [
      position[0] - (Math.sin(rotation) * height * resolution * 1) / 4,
      position[1] + (Math.cos(rotation) * height * resolution * 1) / 4,
    ];
  }
}

export default Geotracker;
