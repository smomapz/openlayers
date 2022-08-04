import Geolocate from '../src/ol/mapz/control/Geolocatecontrol.js';
import Map from '../src/ol/Map.js';
import Tile from '../src/ol/layer/Tile.js';
import View from '../src/ol/View.js';
import XYZ from '../src/ol/source/XYZ.js';
import {Attribution} from '../src/ol/control.js';
import {transform} from '../src/ol/proj.js';

const baseLayer = new Tile({
  source: new XYZ({
    attributions: [
      new Attribution({
        html: '© 2022 <a target="_blank" href="http://www.mapz.com">mapz.com </a>\
            - Map Data: <a target="_blank" href="http://openstreetmap.org" >OpenStreetMap</a>\
            (<a href="http://opendatacommons.org/licenses/odbl/1.0/" target="_blank">ODbL</a>)',
      }),
    ],
    tilePixelRatio: 2,
    url: 'https://tiles.mapz.com/mapproxy/v1/demo-817ca352/tiles/1.0.0/mapz_multicolor_base_hq/EPSG3857/{z}/{x}/{-y}.jpeg',
  }),
});

const map = new Map({
  target: document.getElementById('map'),
  logo: false,
  layers: [baseLayer],
  view: new View({
    center: transform([6.955445, 50.919104], 'EPSG:4326', 'EPSG:3857'),
    zoom: 16,
  }),
});

const geolocateControl = new Geolocate({
  autoLocate: true,
});

map.addControl(geolocateControl);
