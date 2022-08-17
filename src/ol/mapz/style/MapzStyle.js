/**
 * @module ol/mapz/style/MapzStyle
 */

import Fill from '../../style/Fill.js';
import Stroke from '../../style/Stroke.js';
import Style from '../../style/Style.js';
import {Icon, Text} from '../../style.js';

/**
 * @typedef {Object} MapzStyleType
 * @property {string|undefined} [strokeColor] The color of the stroke.
 * @property {number|undefined} [strokeWidth] The width of the stroke.
 * @property {number|undefined} [strokeOpacity] The opacity of the stroke.
 * @property {string|undefined} [strokeDashstyle] The style of the stroke.
 * @property {string|undefined} [fillColor] The color of the fill.
 * @property {number|undefined} [fillOpacity] The opacity of the fill.
 * @property {string|undefined} [externalGraphic] The external graphic that is used for rendering icons.
 * @property {number|undefined} [rotation] The rotation of the icon in radians (positive rotation clockwise).
 * @property {number|undefined} [graphicWidth] The width of the icon.
 * @property {number|undefined} [graphicHeight] The height of the icon.
 * @property {string|undefined} [label] The text of the label.
 * @property {string|undefined} [fontSize] The size of the font.
 * @property {string|undefined} [fontFamily] The family of the font.
 * @property {string|undefined} [fontColor] The color of the font.
 */

/**
 * @typedef {Object} MapzStyleOptions
 * @property {string} [baseIconUrl=''] The base url for the icons.
 */

/**
 * @classdesc
 * Read feature's property `style` and create a style object from it.
 *
 * @api
 */

class MapzStyle extends Style {
  /**
   * @param {import('../../Feature').default} feature The feature with a mapz `style` property to extract the style from.
   * @param {MapzStyleOptions} opt_options MapzStyleJson options.
   */
  constructor(feature, opt_options) {
    const options = opt_options || {};

    if (!feature) {
      return;
    }
    const style = feature.get('style') || {};

    const baseIconUrl =
      options.baseIconUrl !== undefined ? options.baseIconUrl : '';

    super();

    /**
     * The base url for the icons.
     * @type {string}
     * @api
     */
    this.baseIconUrl = baseIconUrl;

    this.setText(this.createTextStyle(style));
    this.setImage(this.createIconStyle(style));
    this.setFill(this.createFillStyle(style));
    this.setStroke(this.createStrokeStyle(style));
  }

  /**
   * Set the stroke color.
   *
   * @param {MapzStyleType} style Mapz feature style.
   * @return {Stroke} Stroke style.
   */
  createStrokeStyle(style) {
    if (!style.strokeColor) {
      return null;
    }

    return new Stroke({
      color: this.createRGBA(style.strokeColor, style.strokeOpacity),
      width: style.strokeWidth,
      lineDash: this.createDashStyle(style),
      lineJoin: 'round',
    });
  }

  /**
   * Create an array for the stroke dash styles
   *
   * @param {MapzStyleType} style Mapz feature style.
   * @return {Array<number>} StrokeDashArray
   */
  createDashStyle(style) {
    const w = style.strokeWidth;
    const str = style.strokeDashstyle;
    switch (str) {
      case 'solid':
        return null;
      case 'dot':
        return [1, 4 * w];
      case 'dash':
        return [4 * w, 4 * w];
      case 'dashdot':
        return [4 * w, 4 * w, 1, 4 * w];
      case 'longdash':
        return [8 * w, 4 * w];
      case 'longdashdot':
        return [8 * w, 4 * w, 1, 4 * w];
      default:
        return null;
    }
  }

  /**
   * Set the fill color.
   *
   * @param {MapzStyleType} style Mapz feature style.
   * @return {Fill} Fill style.
   */
  createFillStyle(style) {
    if (!style.fillColor) {
      return null;
    }
    const color = this.createRGBA(style.fillColor, style.fillOpacity);
    return new Fill({
      color: color,
    });
  }

  /**
   * Set the icon
   *
   * @param {MapzStyleType} style Mapz feature style.
   * @return {Icon} Icon style.
   */
  createIconStyle(style) {
    if (!style.externalGraphic) {
      return null;
    }

    const icon = new Icon({
      src: this.baseIconUrl + style.externalGraphic,
      rotation: style.rotation,
    });
    // get original image size
    const size = icon.getSize();
    if (size !== null) {
      const scale = style.graphicWidth / size[0];
      icon.setScale(scale);
    }

    return icon;
  }

  /**
   * Set the text
   * @param {MapzStyleType} style Mapz feature style.
   * @return {Text} Text style.
   */
  createTextStyle(style) {
    if (style.label) {
      return null;
    }
    return new Text({
      text: style.label,
      font: style.fontSize + ' ' + style.fontFamily,
      fill: new Fill({
        color: style.fontColor,
      }),
    });
  }

  /**
   * Convert HEX2RGB.
   *
   * @param {string|undefined} hex of FeatureStyle.
   * @param {number|undefined} opacity FeatureStyle.
   * @return {Array<number>} RGBA array
   */
  createRGBA(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b, opacity || 1];
  }
}

export default MapzStyle;
