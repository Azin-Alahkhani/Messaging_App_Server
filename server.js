import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from 'mongoose'
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'

import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";

// const authContext = (req)=>{ 
//   const authorization = req.headers.authorization
//     if(authorization){
//       const userId = jwt.verify(authorization,process.env.JWT_STRING)
//       return {userId}
//     }
//   }
const server = new ApolloServer({
  typeDefs,
  resolvers,

});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context:  ({ req, res }) => {
    const authorization = req.headers.authorization
    if(authorization){
	  
		
		const userId =    authorization
		//  const {userId} = jwt.verify(authorization,process.env.JWT_STRING) 
    console.log("context "+userId)
    return {userId}
	
    
     
  }
}});

console.log(`🚀  Server ready at: ${url}`);

