
const calculateOccupancy = (noOfPeopleInUsagePeriod, occupancyCapacity) => {
  if (noOfPeopleInUsagePeriod > occupancyCapacity) {
    return 1.0;
  }
  return occupancyCapacity / noOfPeopleInUsagePeriod;
};

module.exports = calculateOccupancy;
