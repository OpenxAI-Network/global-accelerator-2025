export const schema=`#graphql
type UserExtended {
    _id:String!,
    name:String!,
   phone:String!,
   userBlood:String!,
   userEyeReport:String!,
   gender:String!,
   age:Int!,
   race:String!,
   disease:String!,
   motherName:String!,
   fatherName:String!,
   email:String!,
   userPassword:String!,
   userProfile:String!,
   userGoogleID:String

   
}
type likesArray{
    success:Boolean!,
    data:[String]
}
type Response{
    success:Boolean!,
    message:String
}
type User {
    
     name:String!,
    phone:String!,
    userBlood:String!,
    userEyeReport:String!,
    gender:String!,
    age:Int!,
    race:String!,
    disease:String!,
    motherName:String!,
    fatherName:String!,
    email:String!,
    userPassword:String!,
    userProfile:String!,
    userGoogleID:String

    
}
type CommentDetails{
    userId:String!
    desc:String!
    _id:String!
}
type Response{
    success:Boolean!,
    message:String
}
type newRes{
    weres:Response,
    weDetails:[CommentDetails]
}
type Success{
    response:Boolean!,
    error:String
}
type data{
    success:Boolean!,
    story:[Story]
}

type Camps {
    name:String!,
    imageUrl:String!,
    place:String!,
    time:String!

}
type Story{
    _id:String!,
    userId:String!
    name:String!,
    imageUrl:String!,
    likes:[String],
    ratings:Int,
    date:String
}
type FetchRes{
    success:Boolean,
    userId:String!
    name:String!,
    imageUrl:String!,
    likes:[String],
    ratings:Int,
}
type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
type amount_contributed_resp{
    success:Boolean!,
    payment_id:String
}
type resp{
    success:Boolean!,
    desc:String
}
type Query {
hello:String,

addUser(name:String,phone:String,userBlood:String,
userEyeReport:String,gender:String,age:Int,race:String,disease:String,motherName:String,fatherName:String,email:String,userPassword:String,userProfile:String):resp

detailUserGraph(phone:String,userId:String):UserExtended

listUserGraph:[User]

listCamps:[Camps]
addCampGraph(name:String,imageUrl:String,place:String,time:String):Boolean
addamount_contribute_graph(phone:String,amount:String):amount_contributed_resp
upload_data_graph(image:String):String
addStory_graph(userId:String,name:String,imageUrl:String,ratings:Int):Success
viewStory_graph:data
updateLikes_graph(storyId:String,userId:String):Response
pushComment_graph(userId:String,storyId:String,desc:String):Response
fetchComments_graph(storyId:String):newRes
viewLikes_graph(storyId:String):likesArray
fetchStory_graph(storyId:String):FetchRes
}
`