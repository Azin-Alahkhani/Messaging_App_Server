import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebToken";
import { AuthenticationError, ForbiddenError } from "apollo-server-express";
import bcrypt from "bcryptjs";
import {PubSub} from 'graphql-subscriptions'

const pubsub = new PubSub()
const MESSAGE_ADDED = "MESSAGE_ADDED"

const prismaClient = new PrismaClient();

const resolvers = {
  Query: {
    // queryName: (parent,args,context)=>{return something}
    users: async (_, args, { userId }) => {
      console.log("userId: " + userId)
      if (!userId)
        throw new ForbiddenError(
          "unauthorized request! you must be logged in."
        );
        const uId = parseInt(userId)
      const users = await prismaClient.user.findMany({
        orderBy:{
          createdAt: "desc"
        },
        where:{
          NOT:{
            id: uId
          }
        }
      
      });
      return users;
    },
    allMessagesByUser:async (_,{recieverId},{userId})=>{
      const uId = parseInt(userId)
      console.log(uId+ ""+ typeof(uId))
      if (uId == "")
      throw new ForbiddenError(
        "unauthorized request! you must be logged in."
      );
      const exchangedMessages = await prismaClient.message.findMany({
        where:{
          OR :[
            { senderId:uId, recieverId },
            { senderId:recieverId, recieverId:uId }
          ]
        },
        orderBy:{
          sentAt:"asc"
        }
      });
      return exchangedMessages

    },
    user: async (_, {id}, { userId }) => {
      const uId = parseInt(userId)
      if (uId == "")throw new ForbiddenError( "unauthorized request! you must be logged in.");

      const reqUser = await prismaClient.user.findUnique({where:{id:id}})
      return reqUser;
      }
  },  
  Mutation: {
    signup: async (_, { newUser }) => {
      const sameUser = await prismaClient.user.findUnique({
        where: { email: newUser.email },
      });
      if (sameUser) {
        console.log(sameUser);
        throw new AuthenticationError("a user already exists with this email!");
      }
      const hashedPass = await bcrypt.hash(newUser.password, 10);
      const newUserCreated = await prismaClient.user.create({
        data: {
          ...newUser,
          password: hashedPass,
        },
      });
      return newUserCreated;
    },
    signin: async (_, { user }) => {
     
      const foundUser = await prismaClient.user.findUnique({
        where: { email: user.email },
      });
      if (!foundUser)
        throw new AuthenticationError("user with this email doesn't exist!");
      const passCheck = await bcrypt.compare(user.password, foundUser.password);
      if (!passCheck) throw new AuthenticationError("incorrect email or password!");
     
      // ............
      const token = foundUser.id
      
      //  const token = jwt.sign({ userId: foundUser.id }, process.env.JWT_STRING ,{
      //   algorithm: "HS256",
      //   expiresIn: 300,
      // });
      // ............
      return { token };
    },
    sendmessage:async (_,{recieverId,text},{userId})=>{
      const uId = parseInt(userId)
      if (!uId)
      throw new ForbiddenError(
        "unauthorized request! you must be logged in."
      );
      const message = await prismaClient.message.create({
        data:{
          senderId: uId,
          recieverId ,
          text,
        }
      })
      pubsub.publish(MESSAGE_ADDED,{messageAdded:message})
      return message
    },
  },
  Subscription:{
    messageAdded:{
      subscribe: ()=> pubsub.asyncIterator(MESSAGE_ADDED)
    }
  }
};

export default resolvers;
