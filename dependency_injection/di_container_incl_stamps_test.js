
const { expect } = require('chai');

const DiContainerInclStampsStampFactory = require('./di_container_incl_stamps');
const DiContainerStampFactory = require('./di_container');
const stampit = require('stampit');

describe('di_container', () => {
  let dependencyOne;
  let mockStampOne;
  let dependencyTwo;
  let mockStampTwo;
  let diContainerInclStamps;

  const setUpDiContainerInclStamps = () => {
    const DiContainerStamp = DiContainerStampFactory();
    const DiContainerInclStampsStamp = DiContainerInclStampsStampFactory(DiContainerStamp);
    diContainerInclStamps = DiContainerInclStampsStamp();
  };

  const setUpMockStampOne = () => {
    dependencyOne = 'dependency one';

    mockStampOne = stampit({
      init({ dependencyOne }) {
        this.dependencyOne = dependencyOne;
      },
    });
  };

  const setUpMockStampTwo = () => {
    dependencyTwo = 'dependency two';

    mockStampTwo = stampit({
      init({ dependencyTwo }) {
        this.dependencyTwo = dependencyTwo;
      },
    });

    mockStampTwo = mockStampTwo.compose(mockStampOne);
  };

  beforeEach(() => {
    setUpMockStampOne();

    setUpMockStampTwo();

    setUpDiContainerInclStamps();
  });

  describe('successfully register and return dependencies', () => {
    it('should generate dependency from stamp, injecting it with its required dependencies, then register it', () => {
      diContainerInclStamps.registerDependency('dependencyOne', dependencyOne);
      diContainerInclStamps.registerDependency('dependencyTwo', dependencyTwo);
      diContainerInclStamps.registerDependencyFromStamp('mockTwo', mockStampTwo);
      const mockTwo = diContainerInclStamps.getDependency('mockTwo');
      expect(mockTwo.dependencyOne).equals(dependencyOne);
      expect(mockTwo.dependencyTwo).equals(dependencyTwo);
    });
  });
});

