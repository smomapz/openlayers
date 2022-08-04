import Geolocate from '../../../../../../src/ol/mapz/control/Geolocatecontrol.js';
import Map from '../../../../../../src/ol/Map.js';
import View from '../../../../../../src/ol/View.js';

describe('ol/mapz/control/Geolocate', function () {
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

  it('loads Geolocate control', function () {
    map.renderSync();
    const control = new Geolocate({
      autoLocate: true,
    });
    map.getControls().clear();
    map.addControl(control);
    expect(map.getControls().getLength()).to.be(1);
  });
});
