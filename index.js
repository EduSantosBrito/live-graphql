const { ApolloServer, gql } = require("apollo-server");
const { AuthDirective } = require("./directives/auth");

const typeDefs = gql`
  directive @auth on FIELD_DEFINITION

  type User {
    username: String
  }

  type Book {
    id: ID
    title: String
    author: String
  }

  type ReservedBook {
    id: ID
    title: String
    author: String
    reservedBy: User
  }

  type NotFound {
    notFoundMessage: String
  }

  type Unauthorized {
    unauthorizedMessage: String
  }

  enum ErrorType {
    NOTFOUND
    UNAUTHENTICATED
  }

  type Error {
    errorMessage: String
    type: ErrorType
  }

  union BookResult = Book | ReservedBook | Error

  type Query {
    book(id: ID!): BookResult @auth
  }
`;

const books = [
  {
    id: 1,
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    reservedBy: {
      username: "@brito",
    },
  },
  {
    id: 2,
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

const resolvers = {
  BookResult: {
    __resolveType(book) {
      if (book.errorMessage) {
        return "Error";
      }
      if (book.reservedBy) {
        return "ReservedBook";
      }
      return "Book";
    },
  },
  Query: {
    book: (parent, { id }) => {
      const foundBook = books.find((book) => book.id === Number(id));
      if (!foundBook) {
        return {
          errorMessage: "Book not found!",
          type: "NOTFOUND",
        };
      }
      return foundBook;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
  },
  context: ({ req }) => ({
    token: req.headers.authorization,
  }),
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
