// Apollo server schema

const typeDefs = `
  type Query {
    users: [user]
    user(id : Int!): user
    allMessagesByUser(recieverId: Int!):[message]
    
  }
  input createUserInput{
    firstName:String!
    lastName: String!
    email: String!
    password: String!
  }
  input userSigninInput{
    email: String!
    password: String!
  }

  type Mutation{
    signup(newUser : createUserInput!) : user
    signin(user : userSigninInput!) : Token
    sendmessage(recieverId:Int!, text: String! ) : message

  }
  type user{
    id: Int!
    firstName:String!
    lastName:String!
    email:String!
    password:String!

  } 
  type Token{
    token:String
  }
  scalar Date
  type message {
    id:Int! 
    text:String!
    recieverId:Int !
    senderId :Int!
    sentAt : Date!
  }
  type Subscription{
    messageAdded: message
  }
`;

export default typeDefs