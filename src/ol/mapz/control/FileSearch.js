/**
 * @module ol/mapz/control/FileSearch
 */

import Control from '../../control/Control.js';
import Feature from '../../Feature.js';
import Point from '../../geom/Point.js';
import {CLASS_CONTROL, CLASS_UNSELECTABLE} from '../../css.js';
import {autocomplete} from '@algolia/autocomplete-js';
import {transform} from '../../proj.js';

/**
 * @typedef {Object} FileSearchOptions
 * @property {HTMLElement} [element] The element is the control's
 * container element. This only needs to be specified if you're developing
 * a custom control.
 * @property {function(import("../../MapEvent.js").default):void} [render] Function called when
 * the control should be re-rendered. This is called in a `requestAnimationFrame`
 * callback.
 * @property {HTMLElement|string} [target] Specify a target if you want
 * the control to be rendered outside of the map's viewport.
 * @property {string|undefined} [className] The name of the class to use for the control. Default is 'mapz-control-search'.
 * @property {string|undefined} [searchUrl] The url to search against.
 * @property {import("../../source/Vector.js").default|undefined} [resultSource] The source to add the results to.
 * @property {string|undefined} [searchType] The type of search to perform.
 * @property {number|undefined} [zoomLevel] The zoom level to zoom to.
 * @property {number|undefined} [limit] The limit of results to return.
 * @property {number|undefined} [minLength] The minimum length of the search string.
 * @property {string|undefined} [placeholder] The placeholder text to use.
 * @property {Array<string>|undefined} [searchProperties] The properties to search against.
 * @property {string|undefined} [displayResult] The property to display the result as.
 * @property {function(object):void|undefined} [resultCallback] The callback to use to get the result.
 * @property {string|undefined} [displayKey] The property to display the result as.
 * @property {string|undefined} [position] The position of the control. Default is 'topright'.
 */

/**
 * @classdesc
 * Search against json containing defined results
 *
 * @api
 */
class FileSearch extends Control {
  /**
   * @param {FileSearchOptions} opt_options FilSearch options.
   */
  constructor(opt_options) {
    const className = opt_options.className
      ? opt_options.className
      : 'mapz-control-search';
    let cssClasses = className;

    if (!opt_options.target) {
      cssClasses += ' ' + CLASS_UNSELECTABLE + ' ' + CLASS_CONTROL;
    }

    const element = document.createElement('div');
    element.setAttribute('class', cssClasses);

    super({
      element: element,
      target: opt_options.target,
    });

    const options = opt_options ? opt_options : {};

    /**
     * @private
     * @type {string}
     */
    this.searchType = options.searchType ? options.searchType : null;

    /**
     * @private
     * @type {string}
     */
    this.searchUrl = options.searchUrl ? options.searchUrl : null;

    /**
     * @private
     * @type {Array<string>}
     */
    this.searchProperties = options.searchProperties
      ? options.searchProperties
      : ['name'];

    /**
     * @private
     * @type {string}
     */
    this.displayResult = options.displayResult ? options.displayResult : 'name';

    /**
     * @private
     * @type {import("../../source/Vector.js").default}
     */
    this.resultSource = options.resultSource ? options.resultSource : null;

    /**
     * @private
     * @type {number}
     */
    this.zoomLevel = options.zoomLevel ? options.zoomLevel : 16;

    /**
     * @private
     * @type {number}
     */
    this.limit = options.limit ? options.limit : 10;

    /**
     * @private
     * @type {number}
     */
    this.minLength = options.minLength ? options.minLength : 3;

    /**
     * @private
     * @type {Function}
     */
    this.resultCallback = options.resultCallback
      ? options.resultCallback
      : this.selectSearchResult_;

    /**
     * @private
     * @type {string}
     */
    this.placeholder = options.placeholder
      ? options.placeholder
      : 'Street, City';

    /**
     * @private
     * @type {string}
     */
    this.displayKey = options.displayKey ? options.displayKey : 'name';

    /**
     * @private
     * @type {Array<object>}
     */
    this.searchData = undefined;

    /**
     * @private
     * @type {HTMLElement}
     */
    this.inputContainer = document.createElement('div');
    this.inputContainer.setAttribute('class', 'search-input-container');

    this.setControlPosition(options.position);
    element.appendChild(this.inputContainer);

    if (this.searchUrl) {
      fetch(this.searchUrl)
        .then((response) => response.json())
        .then((data) => {
          this.searchData = data.results;
          const fileSearch = this;
          autocomplete({
            container: fileSearch.inputContainer,
            panelContainer: fileSearch.inputContainer,
            placeholder: fileSearch.placeholder,
            detachedMediaQuery: 'none',
            getSources() {
              return [
                {
                  sourceId: 'locations',
                  getItems: function ({query}) {
                    if (query.length < fileSearch.minLength) {
                      return [];
                    }
                    let results = fileSearch.searchData;
                    fileSearch.searchProperties.forEach((property) => {
                      results = results.filter((item) =>
                        item[property]
                          .toLowerCase()
                          .includes(query.toLowerCase())
                      );
                    });
                    return results.slice(0, fileSearch.limit);
                  },
                  templates: {
                    item({item}) {
                      const result = item[fileSearch.displayResult];
                      if (typeof result === 'string') {
                        return result;
                      }
                    },
                  },
                  onSelect(event) {
                    fileSearch.resultCallback(event.item);
                    event.setQuery('');
                  },
                },
              ];
            },
          });
        });
    }
  }

  /**
   * @inheritDoc
   */
  setMap(map) {
    super.setMap(map);
    this.map = map;
  }

  /**
   * @param {Object} result Create feature from result and add to map
   * @private
   */
  selectSearchResult_(result) {
    if (this.resultSource === null) {
      return;
    }
    this.resultSource.clear();

    const view = this.map.getView();

    let coordinates =
      this.searchType === 'geojson'
        ? result['geometry'].coordinates
        : result['geom'].coordinates;

    coordinates = transform(coordinates, 'EPSG:4326', view.getProjection());

    const feature = new Feature({geometry: new Point(coordinates)});

    this.resultSource.addFeature(feature);

    view.setCenter(coordinates);
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

export default FileSearch;
