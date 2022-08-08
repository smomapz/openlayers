import Geotracker from '../../../../../../src/ol/mapz/control/Geotracker.js';
import Map from '../../../../../../src/ol/Map.js';
import View from '../../../../../../src/ol/View.js';
import {Stroke, Style} from '../../../../../../src/ol/style.js';

describe('ol/mapz/control/GeoTracker', function () {
  let map;

  beforeEach(function () {
    const target = document.createElement('div');
    target.style.width = '100px';
    target.style.height = '100px';
    document.body.appendChild(target);
    map = new Map({
      target: target,
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });
  });

  afterEach(function () {
    disposeMap(map);
    map = null;
  });

  it('loads Geotracker control', function () {
    map.renderSync();
    const control = new Geotracker({
      marker: {
        src: 'http://foo.png',
        height: 5,
      },
      trackStyle: new Style({
        stroke: new Stroke({
          width: 5,
          color: 'rgb(0, 0, 0)',
        }),
      }),
      autostart: true,
    });
    map.getControls().clear();
    map.addControl(control);
    expect(map.getControls().getLength()).to.be(1);
  });
});
