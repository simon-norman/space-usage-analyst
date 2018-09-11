
const parseFunctionArgs = require('parse-fn-args');
const stampit = require('stampit');

module.exports = (DiContainerStamp) => {
  const DiContainerInclStampsStamp = stampit({
    methods: {
      registerDependencyFromStamp(name, stamp) {
        const dependenciesOfStamp = this.getDependenciesOfStamp(stamp);
        const dependencyFromStamp = stamp(dependenciesOfStamp);

        this.registerDependency(name, dependencyFromStamp);
      },

      getDependenciesOfStamp(stamp) {
        const stampDependencyNames = [];
        for (const initializer of stamp.compose.initializers) {
          const stampDependencyNamesForThisInitializer = parseFunctionArgs(initializer);
          stampDependencyNamesForThisInitializer.forEach((dependencyName) => {
            stampDependencyNames.push(dependencyName);
          });
        }

        return this.getDependencies(stampDependencyNames);
      },
    },
  });

  return DiContainerInclStampsStamp.compose(DiContainerStamp);
};

