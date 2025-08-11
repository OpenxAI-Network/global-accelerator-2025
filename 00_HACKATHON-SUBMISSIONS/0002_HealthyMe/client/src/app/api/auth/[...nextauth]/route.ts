import NextAuth from "next-auth/next"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import apolloClient from "@/app/components/apollo-client";
import { gql } from "@apollo/client";
interface User{
    id:String,
    email:String,
    name:String,
}
const authoptions={
    providers:[
        CredentialsProvider({
            name:"credentials",
            credentials:{
                email:{label:"username",type:"text"},
                mobile:{label:"username",type:"text"},
                password:{label:"password",type:"password"},
            },
            async authorize(credentials){
                
                console.log(process .env.NEXTAUTH_SECRET);
                
                console.log("credentials on backend is:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::",credentials);
                const client=await apolloClient();
                const {loading,data,error}=await client.query({
                    query:gql`
                    query AddStory_graph($phone: String) {
                            detailUserGraph(phone: $phone) {
                                _id
                                email
                                phone
                                name
                            }
                            }
                    `  
            ,variables:{phone:credentials?.mobile}})
            console.log("my Data Fetched From Backend in route file is::::",data);

            // if (data.detailUserGraph._id.length<=0) {
            //     const user={id:"",name:"",email:data.detailUserGraph.email,mobile:credentials?.mobile}
            //     return user
            // }
                const user={id:data.detailUserGraph._id,name:[{"name":data.detailUserGraph.name,
                    "mobile":credentials?.mobile,
                    "id":data.detailUserGraph._id
                }],email:data.detailUserGraph.email}
                console.log("user is::::",user);
                
                return user
            }
        }),
    ],
    session:{
        strategy:"jwt" as any
    },
    secret:process.env.NEXTAUTH_SECRET,
    pages:{
        signIn:"/verify"
    }
}
const handler=NextAuth(authoptions);
export {handler as GET,handler as POST} 
