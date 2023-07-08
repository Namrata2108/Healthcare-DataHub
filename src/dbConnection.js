let db = {}

// import redis from 'redis';
// import hash from 'object-hash';
const redis = require('redis');
const hash = require('object-hash');


const client = redis.createClient();
client.connect();
client.on('connect', function(){
    console.log('successfully connected to RedisDB');
});


db.findId = async function(key){
    const temp =  await client.hGetAll(key);
    if(temp.objectId == key){
        console.log(temp+"this is temp");
        return temp;
    }
    else{
        return false;
    }
};

db.findPlanFromReq = async function(params){
    const temp =  await this.findId(params.objectId);
    if(temp.objectId == body.objectId){
        return temp;
    }
    else{
        return false;
    }
}

db.addIdFromBodyReq = async function(body){
    const ETag = hash(body);
    await client.hSet(body.objectId, "plan", JSON.stringify(body));
    await client.hSet(body.objectId, "ETag", ETag);
    await client.hSet(body.objectId, "objectId", body.objectId);
    return await this.findId(body.objectId);
};
// db.updateIdFromBodyReq = async function(body){
//     const ETag = hash(body);
//     await client.hSet(body.objectId, "plan", JSON.stringify(body));
//     await client.
//     await client.hSet(body.objectId, "ETag", ETag);
//     await client.hSet(body.objectId, "objectId", body.objectId);
//     // return await this.findId(body.objectId);
//     return await this.
// };

db.deleteID = async function(params){
    if(await client.del(params.objectId)){
        return true;
    }
    else{
        return false;
    }
}
module.exports = db;
// export default db;