let db = {}

// import redis from 'redis';
// import hash from 'object-hash';
const redis = require('redis');
const hash = require('object-hash');
// const { promisify } = require('util');






const client = redis.createClient();

client.connect();
client.on('connect', function(){
    console.log('successfully connected to RedisDB');
});
// Promisifying Redis functions
// const getAsync = promisify(client.get).bind(client);
// const setAsync = promisify(client.set).bind(client);


db.findId = async function(key){
    const temp =  await client.hGetAll(key);
    if(temp.objectId == key){
        // console.log(temp+"this is temp");
        return temp;
    }
    else{
        return false;
    }
};

db.findPlanFromReq = async function(params){
    const temp =  await this.findId(params.objectId);
    if(temp.objectId == body.objectId){
        // console.log(temp +"value of plan");
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

// db.updateIdFromBodyReq = async function(id,body){
//     try {
//         // Get the existing data from Redis
        
//         const existingData = await getAsync(id);
    
//         if (!existingData) {
//           throw new Error('Object not found');
//         }
    
//         // Merge the updated data with the existing data
//         const updatedObject = { ...JSON.parse(existingData), ...body };
    
//         // Update the data in Redis
//         await setAsync(id, JSON.stringify(updatedObject));

//         const ETag = hash(body);
//         // await client.hSet(body.objectId, "plan", JSON.stringify(updatedObject));
//         await client.hSet(body.objectId, "ETag", ETag);
//         await client.hSet(body.objectId, "objectId", body.objectId);
    
//         return updatedObject;
//       } catch (error) {
//         // Handle any errors
//         console.error('Error updating object:', error);
//         throw error;
//       }
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