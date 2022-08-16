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

    const baseLayersContainer = document.createElement('div');
    baseLayersContainer.className = 'layers-container';

    const headingContainer = document.createElement('div');
    headingContainer.className = 'heading-container';

    const baseLayersTitle = document.createElement('div');
    baseLayersTitle.className = 'title';
    baseLayersTitle.innerHTML = baselayersLabel;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';
    toggleButton.type = 'button';
    toggleButton.title = tipLabel;

    const cssClasses =
      className + ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    const element = document.createElement('div');
    element.className = cssClasses;

    element.appendChild(headingContainer);
    element.appendChild(baseLayersContainer);

    headingContainer.appendChild(baseLayersTitle);
    headingContainer.appendChild(toggleButton);

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
    this._baseLayersTitle = baseLayersTitle;

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
      _this.baseLayers.push(addedLayer);
      _this.updateElement_();
    });
    map.getLayers().on('remove', (event) => {
      const removedLayer = event.element;
      _this.baseLayers.splice(_this.baseLayers.indexOf(removedLayer), 1);
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
    this._toggleButton.classList.toggle('closed');
    this._baseLayersContainer.classList.toggle('closed');
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
      if (layer.getVisible()) {
        visibleBaseLayersIdx.push(_this.baseLayers.length);
      }
      layer.setVisible(false);
      _this.baseLayers.push(layer);
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
    if (this.baseLayers.length < 1) {
      return;
    }
    this.baseLayers.forEach((layer) => {
      this._baseLayersContainer.appendChild(
        this.createLayerElement_('radio', layer)
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
      input.name = 'baselayers-radiogroup';
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
