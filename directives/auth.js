const { SchemaDirectiveVisitor } = require("apollo-server");

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const [, , context] = args;
      if (!context.token || context.token !== "valid-token") {
        return {
          errorMessage: "User isn't authenticated",
          type: "UNAUTHENTICATED",
        };
      }
      return resolve.apply(this, args);
    };
  }
}

module.exports = { AuthDirective };
