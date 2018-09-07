
const { expect } = require('chai');
const stampit = require('stampit');

const EventEmittableStamp = require('./event_emittable_stamp.js');


describe('event_emittable_stamp', () => {
  it('should create a stamp that enables stamps composed with it to use event emitter', function (done) {
    this.timeout(10);
    const dataToBeEmitted = 'data';
    const TestStamp = stampit({
      props: {
        dataToBeEmitted,
      },
    });
    const EmittableTestStamp = TestStamp.compose(EventEmittableStamp);
    const emittableTest = EmittableTestStamp();

    emittableTest.on('testevent', (eventdata) => {
      expect(eventdata).to.equal(dataToBeEmitted);
      done();
    });
    emittableTest.emit('testevent', emittableTest.dataToBeEmitted);
  });
});

