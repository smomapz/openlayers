import Map from '../src/ol/Map.js';
import Search from '../src/ol/mapz/control/Search.js';
import Style from '../src/ol/style/Style.js';
import Tile from '../src/ol/layer/Tile.js';
import Vector from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import View from '../src/ol/View.js';
import XYZ from '../src/ol/source/XYZ.js';
import {Icon} from '../src/ol/style.js';
import {defaults} from '../src/ol/control.js';
import {transform} from '../src/ol/proj.js';

const resultSource = new VectorSource();

const searchControl = new Search({
  resultSource: resultSource,
  searchUrl: 'https://www.mapz.com:8080/wine/api/search/wineyard',
  // Text for the placeholder
  placeholder: 'Wineyard name',
  // Zoomlevel to load result
  zoomLevel: 15,
  // Text if nothing was found
  noResultText: 'No results found',
});

const map = new Map({
  target: document.getElementById('map'),
  logo: false,
  controls: defaults().extend([searchControl]),
  layers: [
    new Tile({
      source: new XYZ({
        attributions: [
          '© 2022 <a target="_blank" href="http://www.mapz.com">mapz.com </a>\
                          - Map Data: <a target="_blank" href="http://openstreetmap.org" >OpenStreetMap</a>\
                          (<a href="http://opendatacommons.org/licenses/odbl/1.0/" target="_blank">ODbL</a>)',
        ],
        tilePixelRatio: 2,
        url: 'https://tiles.mapz.com/mapproxy/v1/demo-817ca352/tiles/1.0.0/mapz_multicolor_base_hq/EPSG3857/{z}/{x}/{-y}.jpeg',
      }),
    }),
    new Vector({
      source: resultSource,
      style: new Style({
        image: new Icon({
          src: 'https://www.mapz.com/mapz/mapz_redaktion/map/marker/svg/M_marker_heart_150910.svg',
          imgSize: [39.69, 39.69],
          scale: 2,
        }),
      }),
    }),
  ],
  view: new View({
    center: transform([7.86237, 49.87629], 'EPSG:4326', 'EPSG:3857'),
    zoom: 11,
    maxZoom: 18,
  }),
});
