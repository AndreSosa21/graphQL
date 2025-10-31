import { ApolloClient, InMemoryCache } from "@apollo/client";
export default new ApolloClient({
  uri: "https://graphql-backend-andresosa.vercel.app/",
  cache: new InMemoryCache(),
});
