import { Mongo } from "meteor/mongo";

const defaults = require("../local.config.js");
const request = require('request-promise');





function getEnv() {
  if(['production', 'staging', 'test', 'dev'].includes(process.env.NODE_ENV)){
    return process.env.NODE_ENV;
  }
  return "dev";
}

function getDatabase() {
    const a  = process.env.MONGO_URL;
    if(!a){
        return "admin";
    }

    if(a.indexOf("?replica") === -1 ){
        return "admin"
    }

    const db = a.substring(a.lastIndexOf("/")+1, a.lastIndexOf("?replica"));
    if(!db){
        return "admin";
    }
    return db;
}

function getMongoConnectionString() {

    return process.env.MONGO_URL;

    if(['production'].includes(process.env.NODE_ENV) || process.env.ENTERPRISE){
      return process.env.MONGO_URL;
    }

    const database = getDatabase();
    if(!process.env.MONGO_URL.includes(database)){
      return `${process.env.MONGO_URL}/${database}`;
    }

    return `mongodb://${q.host}/admin`;
}

module.exports = {
  sendgridAPIKey: process.env.SENDGRID_API_KEY || defaults.sendgridApi,
  database: getDatabase(),
  mongoConnectionString: getMongoConnectionString(),
  
  env: getEnv(),
};
