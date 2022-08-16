/**
 * @module ol/mapz/control/Search
 */

import Control from '../../control/Control.js';
import {CLASS_CONTROL, CLASS_UNSELECTABLE} from '../../css.js';
import {GeoJSON} from '../../format.js';

/**
 * @typedef {Object} SearchOptions
 * @property {HTMLElement|string} [target] Specify a target if you want
 * the control to be rendered outside of the map's viewport.
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-search'.
 * @property {string|undefined} [searchUrl] The url to search against.
 * @property {import("../../source/Vector.js").default|undefined} [resultSource] The source to add the results to.
 * @property {number|undefined} [zoomLevel] The zoom level to zoom to.
 * @property {number|undefined} [limit] The limit of results to return.
 * @property {string|undefined} [placeholder] The placeholder text to use.
 * @property {string|undefined} [position] The position of the control. Default is 'topright'.
 * @property {string|undefined} [searchLayer] The name of the layer to search against.
 * @property {string|undefined} [noResultText] The text to display when no results are found.
 * @property {string|undefined} [invalidSearchResultText] The text to display when an invalid search result is found.
 */

/**
 * @classdesc
 * Search against nominatim endpoint
 *
 * @api
 */
class Search extends Control {
  /**
   * @param {SearchOptions} opt_options Search options.
   */
  constructor(opt_options) {
    const options = opt_options ? opt_options : {};

    let className = options.className
      ? options.className
      : 'mapz-control-search';

    if (!options.target) {
      className += ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    }

    const element = document.createElement('div');

    super({
      element: element,
      target: options.target,
    });

    /**
     * The URL to search against.
     * @type {string}
     * @api
     */
    this.searchUrl = options.searchUrl ? options.searchUrl : null;

    /**
     * The vector source to add the results to.
     * @type {import("../../source/Vector.js").default}
     * @api
     */
    this.resultSource = options.resultSource ? options.resultSource : null;

    /**
     * The name of the layer to search against.
     * @type {string}
     * @api
     */
    this.searchLayer = options.searchLayer ? options.searchLayer : 'osm';

    /**
     * The zoom level to zoom to.
     * @type {number}
     * @api
     */
    this.zoomLevel = options.zoomLevel ? options.zoomLevel : 16;

    /**
     * The limit of results to return.
     * @type {number}
     * @api
     */
    this.limit = options.limit ? options.limit : 10;

    /**
     * @private
     * @type {string}
     */
    this.placeholder_ = options.placeholder
      ? options.placeholder
      : 'Street, City';

    const noResultText = options.noResultText
      ? options.noResultText
      : 'Nothing found';

    const invalidSearchResultText = options.invalidSearchResultText
      ? options.invalidSearchResultText
      : 'Can not read search results';

    /**
     * @private
     * @type {Array<import("../../Feature.js").default>}
     */
    this.searchResultFeatures = undefined;

    /**
     * @private
     * @type {HTMLInputElement}
     */
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = this.placeholder_;
    this.input.oninput = this.handleInputChanged_.bind(this);
    this.input.onkeydown = this.handleKeyPressed_.bind(this);

    /**
     * @private
     * @type {HTMLButtonElement}
     */
    this.clearButton = document.createElement('button');
    this.clearButton.type = 'button';
    this.clearButton.className = 'clear-button';
    this.clearButton.onclick = this.reset_.bind(this);
    this.clearButton.style.display = 'none';

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this.requestingElement = document.createElement('div');
    this.requestingElement.className = 'requesting';
    this.requestingElement.style.display = 'none';

    /**
     * @private
     * @type {HTMLDivElement}
     */
    const inputContainer = document.createElement('div');
    inputContainer.className = 'search-input-container nominatim';

    /**
     * @private
     * @type {HTMLDivElement}
     */
    const suffixContainer = document.createElement('div');
    suffixContainer.className = 'search-suffix-container';
    suffixContainer.append(this.clearButton, this.requestingElement);

    inputContainer.append(this.input, suffixContainer);

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this.resultContainer = document.createElement('div');
    this.resultContainer.className = 'search-results';
    this.resultContainer.style.display = 'none';

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this.noResultElement = document.createElement('div');
    this.noResultElement.className = 'no-results';
    this.noResultElement.innerText = noResultText;

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this.invalidSearchResultElement = document.createElement('div');
    this.invalidSearchResultElement.className = 'no-results';
    this.invalidSearchResultElement.innerText = invalidSearchResultText;

    element.className = className;
    this.setControlPosition(options.position);
    element.append(inputContainer, this.resultContainer);
  }

  /**
   * @param {KeyboardEvent} event The event to handle.
   * @private
   */
  handleKeyPressed_(event) {
    if (event.key === 'Enter') {
      this.startSearch_();
    }
  }

  /**
   * @param {InputEvent} event The event to handle.
   * @private
   */
  handleInputChanged_(event) {
    const target = /** @type {HTMLInputElement} */ (event.target);
    if (target.value.length > 0) {
      this.clearButton.style.display = 'block';
      this.requestingElement.style.display = 'none';
    } else {
      this.clearButton.style.display = 'none';
      this.requestingElement.style.display = 'none';
    }
  }

  /**
   * @private
   */
  startSearch_() {
    this.resultContainer.innerHTML = '';
    this.resultContainer.style.display = 'none';
    this.clearButton.style.display = 'none';
    this.requestingElement.style.display = 'block';

    this.resultSource.clear();

    const formData = new FormData();
    formData.append('query', this.input.value);
    formData.append('limit', this.limit.toString());
    formData.append('layer', this.searchLayer);

    if (this.searchUrl) {
      fetch(this.searchUrl, {method: 'POST', body: formData})
        .then((response) => response.json())
        .then((data) => {
          this.handleResponse_(data);
        })
        .catch((err) => {
          this.resultContainer.appendChild(this.invalidSearchResultElement);
        })
        .finally(() => {
          this.clearButton.style.display = 'block';
          this.requestingElement.style.display = 'none';
        });
    }
  }

  /**
   * @param {Object} json The json request result
   * @private
   */
  handleResponse_(json) {
    this.resultContainer.style.display = 'block';

    if (json['success'] === false) {
      this.resultContainer.appendChild(this.noResultElement);
      return;
    }

    this.searchResultFeatures = new GeoJSON().readFeatures(
      json['featureCollection'],
      {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }
    );

    this.searchResultFeatures.forEach((feature) => {
      const name = document.createElement('span');
      name.className = 'name';
      name.innerText = feature.get('name');

      const description = document.createElement('span');
      description.className = 'description';
      description.innerText = feature.get('description');

      const searchResult = document.createElement('div');
      searchResult.append(name, description);

      searchResult.onclick = () => {
        this.selectSearchResult_(feature);
      };

      this.resultContainer.appendChild(searchResult);
    });
  }

  /**
   * @private
   */
  reset_() {
    this.resultContainer.style.display = 'none';
    this.input.value = '';
    this.clearButton.style.display = 'none';
    this.requestingElement.style.display = 'none';
  }

  /**
   * @param {import('../../Feature').default} feature Selected search result feature
   * @private
   */
  selectSearchResult_(feature) {
    this.resultContainer.style.display = 'none';
    this.resultSource.addFeature(feature);

    const map = this.getMap();
    const view = map.getView();
    view.fit(this.resultSource.getExtent());
    view.setZoom(this.zoomLevel);
  }

  /**
   * Set the position of the control.
   * @param {string|undefined} positionName The position to add the control to.
   * @api
   */
  setControlPosition(positionName) {
    if (!positionName) {
      this.element.style.top = '0px';
      this.element.style.right = '0px';
      return;
    }
    if (positionName.match('top')) {
      this.element.style.top = '0px';
    }
    if (positionName.match('bottom')) {
      this.element.style.bottom = '0px';
    }
    if (positionName.match('left')) {
      this.element.style.left = '0px';
    }
    if (positionName.match('right')) {
      this.element.style.right = '0px';
    }
  }
}

export default Search;
