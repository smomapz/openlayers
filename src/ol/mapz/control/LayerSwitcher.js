/**
 * @module ol/mapz/control/LayerSwitcher
 */

import {CLASS_CONTROL, CLASS_UNSELECTABLE} from '../../css.js';
import {Control} from '../../control.js';

/**
 * @typedef {Object} LayerSwitcherOptions
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-layerswitcher'.
 * @property {string|undefined} [tipLabel] The label to use for the tip. Default is 'Toggle Layerswitcher'.
 * @property {string|undefined} [baselayersLabel] Default is 'Baselayers'.
 * @property {string|undefined} [overlaysLabel] Default is 'Overlays'.
 * @property {boolean|undefined} [open] If true, the control is initially open. Default is true.
 * @property {import('../../style/Style.js').StyleLike} [trackStyle] The style to use for the track.
 */

/**
 * @classdesc
 * A custom layer switcher control.
 * To style this control use css selector `.mapz-control-layerswitcher`.
 *
 * @api
 */
class LayerSwitcher extends Control {
  /**
   * @param {LayerSwitcherOptions} opt_options LayerSwitcher options.
   */
  constructor(opt_options) {
    const options = opt_options ? opt_options : {};

    const className = options.className
      ? options.className
      : 'mapz-control-layerswitcher';

    const tipLabel = options.tipLabel
      ? options.tipLabel
      : 'Toggle Layerswitcher';

    const baselayersLabel = options.baselayersLabel
      ? options.baselayersLabel
      : 'Baselayers';

    const overlaysLabel = options.overlaysLabel
      ? options.overlaysLabel
      : 'Overlays';

    const baseLayersContainer = document.createElement('div');
    baseLayersContainer.className = 'layers-container';

    const baseLayersHeadingContainer = document.createElement('div');
    baseLayersHeadingContainer.className = 'heading-container';

    const baseLayersTitle = document.createElement('div');
    baseLayersTitle.className = 'title';
    baseLayersTitle.innerHTML = baselayersLabel;

    const overlaysContainer = document.createElement('div');
    overlaysContainer.className = 'layers-container';

    const overlaysHeadingContainer = document.createElement('div');
    overlaysHeadingContainer.className = 'heading-container';

    const overlaysTitle = document.createElement('div');
    overlaysTitle.className = 'title';
    overlaysTitle.innerHTML = overlaysLabel;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';
    toggleButton.type = 'button';
    toggleButton.title = tipLabel;

    const cssClasses =
      className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    const element = document.createElement('div');
    element.className = cssClasses;

    element.appendChild(baseLayersHeadingContainer);
    element.appendChild(baseLayersContainer);
    element.appendChild(overlaysHeadingContainer);
    element.appendChild(overlaysContainer);

    baseLayersHeadingContainer.appendChild(baseLayersTitle);

    overlaysHeadingContainer.appendChild(overlaysTitle);

    super({
      element: element,
    });

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this._baseLayersContainer = baseLayersContainer;

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this._baseLayersHeadingContainer = baseLayersHeadingContainer;

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this._baseLayersTitle = baseLayersTitle;

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this._overlaysContainer = overlaysContainer;

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this._overlayHeadingContainer = overlaysHeadingContainer;

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this._overlaysTitle = overlaysTitle;

    /**
     * @private
     * @type {HTMLButtonElement}
     */
    this._toggleButton = toggleButton;
    toggleButton.onclick = this.handleToggle_.bind(this);

    /**
     * @private
     * @type {Array<import('../../layer/Base.js').default>}
     */
    this.baseLayers = [];

    /**
     * @private
     * @type {Array<import('../../layer/Base.js').default>}
     */
    this.overlayLayers = [];

    /**
     * The current state of the control visibility.
     * @type {boolean}
     */
    this.open = options.open !== undefined ? options.open : true;
  }

  /**
   * @inheritDoc
   */
  setMap(map) {
    super.setMap(map);

    if (!map) {
      return;
    }

    // TODO add event listener to register programmatically visibility change of layer
    const _this = this;
    map.getLayers().on('add', (event) => {
      const addedLayer = event.element;
      if (addedLayer.get('type') === 'overlay') {
        _this.overlayLayers.push(addedLayer);
      } else {
        _this.baseLayers.push(addedLayer);
      }
      _this.updateElement_();
    });
    map.getLayers().on('remove', (event) => {
      const removedLayer = event.element;
      if (removedLayer.get('type') === 'overlay') {
        _this.overlayLayers.splice(
          _this.overlayLayers.indexOf(removedLayer),
          1
        );
      } else {
        _this.baseLayers.splice(_this.baseLayers.indexOf(removedLayer), 1);
      }
      _this.updateElement_();
    });

    this.updateLayers_();
    this.updateElement_();
  }

  /**
   * @param {MouseEvent} event The event to handle.
   * @private
   */
  handleToggle_(event) {
    event.preventDefault();
    this._baseLayersTitle.classList.toggle('closed');
    this._overlaysTitle.classList.toggle('closed');
    this._toggleButton.classList.toggle('closed');
    this._baseLayersContainer.classList.toggle('closed');
    this._overlaysContainer.classList.toggle('closed');
    this.open = !this.open;
  }

  /**
   * @private
   */
  updateLayers_() {
    const map = this.getMap();
    if (!map) {
      return;
    }

    const visibleBaseLayersIdx = [];
    const _this = this;
    map.getLayers().forEach((layer) => {
      if (layer.get('displayInLayerSwitcher') === false) {
        return;
      }
      if (layer.get('type') === 'overlay') {
        _this.overlayLayers.push(layer);
      } else {
        if (layer.getVisible()) {
          visibleBaseLayersIdx.push(_this.baseLayers.length);
        }
        layer.setVisible(false);
        _this.baseLayers.push(layer);
      }
    });
    if (this.baseLayers.length > 0) {
      if (visibleBaseLayersIdx.length > 0) {
        this.baseLayers[0].setVisible(true);
      } else {
        const idx = visibleBaseLayersIdx[0];
        this.baseLayers[idx].setVisible(true);
      }
    }
  }

  /**
   * @private
   */
  updateElement_() {
    this._baseLayersContainer.innerHTML = '';
    this._overlaysContainer.innerHTML = '';
    if (this.baseLayers.length < 1) {
      this._baseLayersHeadingContainer.style.display = 'none';
      this._baseLayersContainer.style.display = 'none';
      this._overlayHeadingContainer.appendChild(this._toggleButton);
    } else {
      this._baseLayersHeadingContainer.style.display = '';
      this._baseLayersContainer.style.display = '';
      this._baseLayersHeadingContainer.appendChild(this._toggleButton);
    }
    if (this.overlayLayers.length < 1) {
      this._overlayHeadingContainer.style.display = 'none';
      this._overlaysContainer.style.display = 'none';
    } else {
      this._overlayHeadingContainer.style.display = '';
      this._overlaysContainer.style.display = '';
    }
    this.baseLayers.forEach((layer) => {
      this._baseLayersContainer.appendChild(
        this.createLayerElement_('radio', layer)
      );
    });
    this.overlayLayers.forEach((layer) => {
      this._overlaysContainer.appendChild(
        this.createLayerElement_('checkbox', layer)
      );
    });
  }

  /**
   * @private
   * @param {string} type The type of layer element to create.
   * @param {import('../../layer/Base.js').default} layer The layer to be added to the element.
   * @return {HTMLElement} The layer element.
   */
  createLayerElement_(type, layer) {
    const layerId = 'layer_' + layer.get('name');

    const input = document.createElement('input');
    input.id = layerId;
    input.type = type;
    input.checked = layer.getVisible();
    if (type === 'radio') {
      input.name =
        'baselayers-radiogroup-' + Math.random().toString(16).slice(2);
    }

    let handleChange_ = undefined;
    if (type === 'radio') {
      handleChange_ = () => {
        this.baseLayers.forEach((baseLayer) => {
          baseLayer.setVisible(baseLayer === layer);
        });
      };
    }
    if (type === 'checkbox') {
      handleChange_ = () => {
        layer.setVisible(!layer.getVisible());
      };
    }
    input.addEventListener('change', handleChange_);
    const title = document.createElement('span');
    title.innerHTML = layer.get('title');

    const label = document.createElement('label');
    label.htmlFor = layerId;
    label.appendChild(input);
    label.appendChild(title);

    const container = document.createElement('div');
    container.appendChild(label);
    return container;
  }
}

export default LayerSwitcher;
