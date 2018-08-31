
const parseFunctionArgs = require('parse-fn-args');
const stampit = require('stampit');

module.exports = (DependencyNotFoundError, DependencyAlreadyRegisteredError) => stampit({
  props: {
    DependencyNotFoundError,
    DependencyAlreadyRegisteredError,
  },

  init() {
    this.dependencies = {};
  },

  methods: {
    registerDependency(name, dependency) {
      if (this.dependencies[name]) {
        throw new DependencyAlreadyRegisteredError(`A dependency with the name ${name} has already been registered`);
      }
      this.dependencies[name] = dependency;
    },

    registerDependencyFromFactory(name, factory) {
      try {
        const dependenciesOfFactory = this.getDependenciesOfFactory(factory);
        const dependencyFromFactory = factory(...dependenciesOfFactory);

        this.registerDependency(name, dependencyFromFactory);
      } catch (error) {
        if (error instanceof DependencyNotFoundError) {
          throw new Error(`Dependency ${name} cannot be registered as one or more of its dependencies have not been registered`);
        } else {
          throw error;
        }
      }
    },

    getDependenciesOfFactory(factory) {
      const dependencyNamesOfFactory = parseFunctionArgs(factory);
      const dependenciesOfFactory =
          dependencyNamesOfFactory.map(dependencyName => this.getDependency(dependencyName));
      return dependenciesOfFactory;
    },

    getDependency(name) {
      if (this.dependencies[name]) {
        return this.dependencies[name];
      }
      throw new DependencyNotFoundError('The requested dependency could not be found');
    },
  },
});

