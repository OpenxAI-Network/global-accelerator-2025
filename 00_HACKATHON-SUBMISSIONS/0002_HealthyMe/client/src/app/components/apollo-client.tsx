import { ApolloClient, InMemoryCache } from "@apollo/client"

const apolloClient=()=>{
    return (new ApolloClient({
        cache:new InMemoryCache(),
  uri:"http://localhost:4444/graphql/"
    }))
}
export default apolloClient