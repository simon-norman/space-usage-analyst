
const { expect } = require('chai');

const DiContainerInclStampsStampFactory = require('./di_container_incl_stamps');
const DiContainerStampFactory = require('./di_container');
const stampit = require('stampit');

describe('di_container', () => {
  let dependencyOneData;
  let mockStampOne;
  let dependencyTwoData;
  let mockStampTwo;
  let diContainerInclStamps;

  const setUpDiContainerInclStamps = () => {
    const DiContainerStamp = DiContainerStampFactory();
    const DiContainerInclStampsStamp = DiContainerInclStampsStampFactory(DiContainerStamp);
    diContainerInclStamps = DiContainerInclStampsStamp();
  };

  const setUpMockStampOne = () => {
    dependencyOneData = 'dependency one';

    mockStampOne = stampit({
      init({ dependencyOne }) {
        this.dependencyOne = dependencyOne;
      },
    });
  };

  const setUpMockStampTwo = () => {
    dependencyTwoData = 'dependency two';

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
      diContainerInclStamps.registerDependency('dependencyOne', dependencyOneData);
      diContainerInclStamps.registerDependency('dependencyTwo', dependencyTwoData);
      diContainerInclStamps.registerDependencyFromStamp('mockTwo', mockStampTwo);
      const mockTwo = diContainerInclStamps.getDependency('mockTwo');
      expect(mockTwo.dependencyOne).equals(dependencyOneData);
      expect(mockTwo.dependencyTwo).equals(dependencyTwoData);
    });
  });
});

