import Map from '../../../../../../src/ol/Map.js';
import Modal from '../../../../../../src/ol/mapz/control/Modal.js';
import View from '../../../../../../src/ol/View.js';

describe('ol/mapz/control/Modal', function () {
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

  it('loads Modal control', function () {
    map.renderSync();
    const control = new Modal({
      contentText: 'Test',
    });
    map.getControls().clear();
    map.addControl(control);
    expect(map.getControls().getLength()).to.be(1);
  });
  it('loads only one Modal at a time', function () {
    map.renderSync();
    const control1 = new Modal({
      contentText: 'First',
    });
    const control2 = new Modal({
      contentText: 'Second',
    });
    map.getControls().clear();
    map.addControl(control1);
    map.addControl(control2);
    expect(map.getControls().getLength()).to.be(1);
  });
});
