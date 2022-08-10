import LayerSwitcher from '../src/ol/mapz/control/LayerSwitcher.js';
import Map from '../src/ol/Map.js';
import Tile from '../src/ol/layer/Tile.js';
import View from '../src/ol/View.js';
import XYZ from '../src/ol/source/XYZ.js';
import {defaults} from '../src/ol/control.js';
import {transform} from '../src/ol/proj.js';

const attribution =
  '© 2022 <a target="_blank" href="http://www.mapz.com">mapz.com </a>\
  - Map Data: <a target="_blank" href="http://openstreetmap.org" >OpenStreetMap</a>\
  (<a href="http://opendatacommons.org/licenses/odbl/1.0/" target="_blank">ODbL</a>)';

// Create background layer
const baseLayer = new Tile({
  source: new XYZ({
    attributions: attribution,
    tilePixelRatio: 2,
    url: 'https://tiles.mapz.com/mapproxy/v1/demo-817ca352/tiles/1.0.0/mapz_multicolor_poi_hq/EPSG3857/{z}/{x}/{-y}.jpeg',
  }),
  title: 'Multicolor',
  name: 'mapz_multicolor_poi',
  visible: false,
});

// Create background with gray styling layer
const baseLayerGray = new Tile({
  source: new XYZ({
    attributions: attribution,
    tilePixelRatio: 2,
    url: 'https://tiles.mapz.com/mapproxy/v1/demo-817ca352/tiles/1.0.0/mapz_shades_of_gray_hq/EPSG3857/{z}/{x}/{-y}.jpeg',
  }),
  title: 'Shades of Gray',
  name: 'mapz_shades_of_gray',
});

const map = new Map({
  target: document.getElementById('map'),
  logo: false,
  layers: [baseLayer, baseLayerGray],
  controls: defaults().extend([new LayerSwitcher()]),
  view: new View({
    center: transform([11.57231, 48.13689], 'EPSG:4326', 'EPSG:3857'),
    zoom: 14,
  }),
});
