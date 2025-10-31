import { ApolloProvider } from "@apollo/client";
import client from "./apollo/client";
import QueryForm from "./components/QueryForm";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <QueryForm />
    </ApolloProvider>
  );
}
