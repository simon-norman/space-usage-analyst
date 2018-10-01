
const checkIfSuccessfulGraphqlResponseHasNestedError = (response) => {
  if (response.data.errors && response.data.errors.length > 0) {
    const nestedError = new Error(response.data.errors[0].message);
    nestedError.errorDetail = response;
    throw nestedError;
  }
};

module.exports = checkIfSuccessfulGraphqlResponseHasNestedError;
