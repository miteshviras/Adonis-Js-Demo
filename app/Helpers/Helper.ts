
  // global function to check the satisfiable conditions
  function isEmpty(value) {
    return (
      value === undefined ||
      value === null ||
      value === '' ||
      (typeof value === 'boolean' && !value) ||
      (typeof value === 'number' && value === 0) ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }


  // Export the specific function you want to import in other files
  module.exports = {
    isEmpty
  };
