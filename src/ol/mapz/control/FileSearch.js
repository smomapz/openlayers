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
   * @param {FileSearchOptions} opt_options FileSearch options.
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
    element.setAttribute('class', className);

    super({
      element: element,
      target: options.target,
    });

    /**
     * @private
     * @type {string}
     */
    this.searchType_ = options.searchType ? options.searchType : null;

    /**
     * @private
     * @type {string}
     */
    this.searchUrl_ = options.searchUrl ? options.searchUrl : null;

    /**
     * @private
     * @type {Array<string>}
     */
    this.searchProperties_ = options.searchProperties
      ? options.searchProperties
      : ['name'];

    /**
     * @private
     * @type {string}
     */
    this.displayResult_ = options.displayResult
      ? options.displayResult
      : 'name';

    /**
     * The vector source to add the results to.
     * @type {import("../../source/Vector.js").default}
     * @api
     */
    this.resultSource = options.resultSource ? options.resultSource : null;

    /**
     * The zoom level to zoom to.
     * @type {number}
     * @api
     */
    this.zoomLevel = options.zoomLevel ? options.zoomLevel : 16;

    /**
     * @private
     * @type {number}
     */
    this.limit_ = options.limit ? options.limit : 10;

    /**
     * @private
     * @type {number}
     */
    this.minLength_ = options.minLength ? options.minLength : 3;

    /**
     * @private
     * @type {Function}
     */
    this.resultCallback_ = options.resultCallback
      ? options.resultCallback
      : this.selectSearchResult_;

    /**
     * @private
     * @type {string}
     */
    this.placeholder_ = options.placeholder
      ? options.placeholder
      : 'Street, City';

    /**
     * @private
     * @type {Array<object>}
     */
    this.searchData_ = undefined;

    /**
     * @private
     * @type {HTMLDivElement}
     */
    this.inputContainer_ = document.createElement('div');
    this.inputContainer_.setAttribute('class', 'search-input-container');

    this.setControlPosition(options.position);
    element.appendChild(this.inputContainer_);

    if (this.searchUrl_) {
      fetch(this.searchUrl_)
        .then((response) => response.json())
        .then((data) => {
          this.searchData_ = data.results;
          const fileSearch = this;
          autocomplete({
            container: fileSearch.inputContainer_,
            panelContainer: fileSearch.inputContainer_,
            placeholder: fileSearch.placeholder_,
            detachedMediaQuery: 'none',
            getSources() {
              return [
                {
                  sourceId: 'locations',
                  getItems: function ({query}) {
                    if (query.length < fileSearch.minLength_) {
                      return [];
                    }
                    let results = fileSearch.searchData_;
                    fileSearch.searchProperties_.forEach((property) => {
                      results = results.filter((item) =>
                        item[property]
                          .toLowerCase()
                          .includes(query.toLowerCase())
                      );
                    });
                    return results.slice(0, fileSearch.limit_);
                  },
                  templates: {
                    item({item}) {
                      const result = item[fileSearch.displayResult_];
                      if (typeof result === 'string') {
                        return result;
                      }
                    },
                  },
                  onSelect(event) {
                    fileSearch.resultCallback_(event.item);
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
      this.searchType_ === 'geojson'
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
