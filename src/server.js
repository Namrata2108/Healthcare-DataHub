
const express = require('express');
const redis = require('redis');
const auth = require('./auth-token');

const schema = require('./schema');
const port_no = 8080;
const app = express();

const bodyParser = require("body-parser"); 
const db = require('./dbConnection');


app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.json());
app.use(bodyParser.json()); 
app.use(express.json({ limit: "30mb", extended: true })); 
app.use(express.urlencoded({ limit: "30mb", extended: true }));


const versionMiddleware = (req, res, next) => {
    const version = req.params.version || req.headers['x-api-version'];
    req.apiVersion = version || 'v1'; 
    next();
  };
  
app.use(versionMiddleware);

app.get('/getToken', async(req, res) => {
    const token = auth.keygen();
    res.status(200).json({
        'message': 'Created token!',
        'token' : token
    });
});

app.post('/validateToken', async(req, res) => {
    validity = auth.validateToken(req);
    if(validity){
        res.status(200).json({message: "this token is valid"});
        return;
    }
    else{
        res.status(400).json({message:"invalid token or format"});
        return;
    }
});

app.post('/plans', async (req, res) => {
    console.log("Object created successfully ");
    console.log(req.body);
    
    if(!auth.validateToken(req)){
        res.status(401).json({message:"invalid token or format"});
        return;
    }

    console.log(schema.validate(req.body));

    if(!schema.validate(req.body)){
        // console.log(schema.validator);
        // console.log(schema.validate(req.body));
        // console.log(schema);
        console.log(schema.validateValue(req.body));

        const returnValue = schema.validateValue(req.body);

        const jsonMessage = {
            "message": "This item isn't valid ",
            "errors": returnValue.errors[0].stack
            // "errors": returnValue.errors
            
        }

        res.status(400).json(jsonMessage);
        console.log("This item isn't valid ");
        return;
    }
    else{
        const value = await db.findId(req.body.objectId);
        const temp=req.body.objectId;
        if(value){
            res.setHeader("ETag", value.ETag).status(409).json({"message":"This item already exists "});
            console.log("This item already exists ");
            return;
        }
        else{
            const ETag = (await db.addIdFromBodyReq(req.body)).ETag;
            res.setHeader("ETag", ETag).status(201).json({
                "message":"item added successfully ",
                "objectID": temp});
            console.log("item added successfully ");
            return;
        }
    }
    
});


app.put('/plans/:objectId', async (req, res) => {
    console.log("Object update successfully");
    console.log(req.params);
    
    if(!auth.validateToken(req)){
        res.status(401).json({message:"invalid token or format"});
        return;
    }

    if(req.params.objectId == null && req.params.objectId == "" && req.params == {}){
        res.status(400).json({"message":"invalid plan ID"});
        console.log("invalid plan ID");
        return;
    }
    
    // if(!schema.validate(req.body)){
    //     res.status(400).json({"message":"item isn't valid"});
    //     console.log("item isn't valid");
    //     return;
    // }
    if(!schema.validate(req.body)){
        // console.log(schema.validator);
        // console.log(schema.validate(req.body));
        // console.log(schema);
        console.log(schema.validateValue(req.body));

        const returnValue = schema.validateValue(req.body);

        const jsonMessage = {
            "message": "This item isn't valid ",
            "errors": returnValue.errors[0].stack
            // "errors": returnValue.errors
            
        }

        res.status(400).json(jsonMessage);
        console.log("This item isn't valid ");
        return;
    }
    const value = await db.findId(req.params.objectId);
    if(value.objectId == req.params.objectId){
        const ETag = value.ETag;
        if((!req.headers['if-match'] || ETag != req.headers['if-match']) || (schema.hash(req.body) == ETag)){
            // res.setHeader("ETag", ETag).status(412).json(JSON.parse(value.plan));
            res.setHeader("ETag", ETag).status(412).json({"message":"get latest ETag or plan received is unmodified"});
            console.log("get updated ETag/plan received is unmodified");
            console.log(JSON.parse(value.plan));
            return;
        }
        else{
            const value = await db.addIdFromBodyReq(req.body);
            // console.log(value);
            res.setHeader("ETag", value.ETag).status(201).json(JSON.parse(value.plan));
        }
    }
    else{
        res.status(404).json({"message":"plan not found"});
        console.log("plan not found");
        return;
    }
});


app.patch('/plans/:objectId', async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
  
    if (!auth.validateToken(req)) {
      res.status(401).json({ message: "invalid bearer token/format" });
      return;
    }
    if (req.params.objectId == null && req.params.objectId == "" && req.params == {}) {
      res.status(400).json({ message: "invalid plan ID" });
      console.log("invalid plan ID");
      return;
    }
    const value = await db.findId(req.params.objectId);
    console.log(value);
    const resource = JSON.parse(value.plan);
    // console.log(value);
    console.log(resource);
    console.log("********");
  
    if (value.objectId == req.params.objectId) {
        const ETag = value.ETag;
        if((!req.headers['if-match'] || ETag != req.headers['if-match']) || (schema.hash(req.body) == ETag)){
            // res.setHeader("ETag", ETag).status(412).json(JSON.parse(value.plan));
            res.setHeader("ETag", ETag).status(412).json({"message":"get latest ETag or plan received is unmodified"});
            console.log("get updated ETag/plan received is unmodified");
            console.log(JSON.parse(value.plan));
            return;
        }
      else {
          
        deepMerge(resource, updates);
        console.log("here's the resource");
        console.log(resource);
        // if(!schema.validate(resource)){
        //             res.status(400).json({"message":"item isn't valid"});
        //             console.log("item isn't valid");
        //             return;
        //         }
                if(!schema.validate(resource)){
                    // console.log(schema.validator);
                    // console.log(schema.validate(req.body));
                    // console.log(schema);
                    console.log(schema.validateValue(req.body));
            
                    const returnValue = schema.validateValue(req.body);
            
                    const jsonMessage = {
                        "message": "This item isn't valid ",
                        "errors": returnValue.errors[0].stack
                        // "errors": returnValue.errors
                        
                    }
            
                    res.status(400).json(jsonMessage);
                    console.log("This item isn't valid ");
                    return;
                }
                
                const value1 = await db.addIdFromBodyReq(resource);
                // const updatedObject = Object.assign(JSON.parse(value.plan), updates);
                
                            // console.log(value);
                res.setHeader("ETag", value.ETag).status(201).json(JSON.parse(value1.plan));
                // res.setHeader("ETag", value.ETag).status(201).json(updatedObject.plan);
                    

      }
    } else {
      res.status(404).json({ message: "plan not found" });
      console.log("plan not found");
      return;
    }
  
  });
  
  function deepMerge(target, source) {
    for (let key in source) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        console.log(target[key]);
        console.log(source[key]);
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }


app.get('/plans/:objectId', async (req, res) => {
    console.log("Fetching detail of object successfully");
    if(!auth.validateToken(req)){
        res.status(401).json({message:"invalid token or format"});
        return;
    }

    console.log(req.headers['if-none-match']);
    if(req.params.objectId == null && req.params.objectId == "" && req.params == {}){
        res.status(400).json({"message":"Enter valid object ID"});
        console.log("Enter valid object ID");
        return;
    }
    const value = await db.findId(req.params.objectId);
    if(value.objectId == req.params.objectId){
        if(req.headers['if-none-match'] && value.ETag == req.headers['if-none-match']){
            res.setHeader("ETag", value.ETag).status(304).json({
                "message" : "plan unchanged",
                "plan" : JSON.parse(value.plan)
            });
            console.log("provided plan found is not changed:");
            console.log(JSON.parse(value.plan));
            return;
        }
        else{
            res.setHeader("ETag", value.ETag).status(200).json({
                "message" : "plan changed",
                "plan":JSON.parse(value.plan)});
            console.log("provided plan found is changed:");
            console.log(JSON.parse(value.plan));
            return;
        }
    }
    else{
        res.status(404).json({"message":"provided plan not found"});
        console.log("provided plan not found");
        return;
    }
});


app.delete('/plans/:objectId', async(req, res) => {
    console.log("Deleting plan ");
    console.log(req.params);
    if(!auth.validateToken(req)){
        res.status(401).json({message:"invalid token or format"});
        return;
    }
    if(req.params.objectId == null && req.params.objectId == "" && req.params == {}){
        res.status(400).json({"message":"Enter valid object ID"});
        return;
    }
    const value = await db.findId(req.params.objectId);
    if(value.objectId == req.params.objectId){
        console.log("provided item found");
        console.log(JSON.parse(value.plan));
        const ETag = value.ETag;
        if((!req.headers['if-match'] || ETag != req.headers['if-match']) || (schema.hash(req.body) == ETag)){
            // res.setHeader("ETag", ETag).status(412).json(JSON.parse(value.plan));
            res.setHeader("ETag", ETag).status(412).json({"message":"get latest ETag or plan received is unmodified"});
            console.log("get updated ETag/plan received is unmodified");
            console.log(JSON.parse(value.plan));
            return;
        }
        
        if(db.deleteID(req.params)){
            console.log("provided item deleted successfully");
            res.sendStatus(204);
            // res.status(204).json(JSON.parse(value.plan));
        }
        else{
            console.log("provided item cannot be deleted");
            res.status(500).json({"message":"provided item cannot be deleted"});
        }
        
        return;
    }
    else{
        res.status(404).json({"message":"Enter valid object ID"});
        console.log("Enter valid object ID");
        return;
    }
});

app.delete('/plans', async(req, res) => {
    console.log("Invalid request for DELETE");

    res.status(400).json({"message":"Enter valid object ID in URL"});
    return;
});

app.get('/plans', async(req, res) => {
    console.log("Invalid request of GET");
    res.status(400).json({"message":"Enter valid object ID in URL"});
    console.log("Enter valid object ID");
    return;
});
app.get('/healthz', async(req, res) => {
    console.log("Invalid request of GET");
    res.status(400).json({"message":"Enter valid URL"});
    console.log("Enter valid URL");
    return;
});

app.get('/v1/healthz', async (req, res) => { 
    console.log("Server is working properly (v1)");
    res.status(200).send();
});
app.get('/v2/healthz', async (req, res) => { 
    console.log("Server is working properly (v2)");
    res.status(200).send();
});


app.listen(port_no, () => {
    console.log('Application starting on port ', port_no);
});

// app.patch('/plans/:objectId', async (req, res) => {
//     console.log("Object update successfully");
//     console.log(req.params);
    
//     if(!auth.validateToken(req)){
//         res.status(400).json({message:"invalid token or format"});
//         return;
//     }

//     if(req.params.objectId == null && req.params.objectId == "" && req.params == {}){
//         res.status(400).json({"message":"invalid plan ID"});
//         console.log("invalid plan ID");
//         return;
//     }
//     if(!schema.validate(req.body)){
//         res.status(400).json({"message":"item isn't valid"});
//         console.log("item isn't valid");
//         return;
//     }
//     const value = await db.findId(req.params.objectId);
//     if(value.objectId == req.params.objectId){
//         const ETag = value.ETag;
//         if((!req.headers['if-match'] || ETag != req.headers['if-match']) || (schema.hash(req.body) == ETag)){
//             // res.setHeader("ETag", ETag).status(412).json(JSON.parse(value.plan));
//             res.setHeader("ETag", ETag).status(400).json({"message":"get latest ETag or plan received is unmodified"});
//             console.log("get updated ETag/plan received is unmodified");
//             console.log(JSON.parse(value.plan));
//             return;
//         }
//         else{
//             // const value = await db.addIdFromBodyReq(req.body);
            
//             const value = await db.updateIdFromBodyReq(req.params.objectId,req.body);
//             // console.log(value);
//             res.setHeader("ETag", value.ETag).status(201).json(JSON.parse(value.plan));
//         }
//     }
//     else{
//         res.status(404).json({"message":"plan not found"});
//         console.log("plan not found");
//         return;
//     }
// });