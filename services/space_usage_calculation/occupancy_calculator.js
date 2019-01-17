
const calculateOccupancy = (numberOfPeopleRecorded, occupancyCapacity) => {
  if (numberOfPeopleRecorded > occupancyCapacity) {
    return 1.0;
  }
  return numberOfPeopleRecorded / occupancyCapacity;
};

module.exports = calculateOccupancy;
