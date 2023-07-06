
const express = require('express');
const redis = require('redis');

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



app.get('/v1/healthz', async (req, res) => { 
    console.log("Server is working properly (v1)");
    res.status(200).send();
});
app.get('/v2/healthz', async (req, res) => { 
    console.log("Server is working properly (v2)");
    res.status(200).send();
});

app.post('/plans', async (req, res) => {
    console.log("POST: /plans");
    // console.log(req.body);
    if(!authe.validateToken(req)){
        res.status(400).json({message:"wrong bearer token/format"});
        return;
    }
    if(schema.validator(req.body)){
        const value = await db.findEntry(req.body.objectId);
        if(value){
            res.setHeader("ETag", value.ETag).status(409).json({"message":"item already exists"});
            console.log("item already exists");
            return;
        }
        else{
            const ETag = (await db.addPlanFromReq(req.body)).ETag;
            await elastic.enter(req.body, req.body.objectId, null, "plan");
            res.setHeader("ETag", ETag).status(201).json({
                "message":"item added",
                "ETag" : ETag});
            console.log("item added");
            return;
        }
    }
    else{
        res.status(400).json({"message":"item isn't valid"});
        console.log("item isn't valid");
        return;
    }
});

app.post('/plans', async (req, res) => {
    console.log("Object created successfully ");
    console.log(req.body);
    


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

// app.post('/v2/plans', async (req, res) => {
//     console.log("Object created successfully (v2)");
//     console.log(req.body);


//     console.log(schema.validate(req.body));

//     if(!schema.validate(req.body)){
//         // console.log(schema.validator);
//         // console.log(schema.validate(req.body));
//         // console.log(schema);
//         console.log(schema.validateValue(req.body));

//         const returnValue = schema.validateValue(req.body);

//         const jsonMessage = {
//             "message": "This item isn't valid (v2)",
//             // "errors": returnValue.errors[0].stack
//             "errors": returnValue.errors
            
//         }

//         res.status(400).json(jsonMessage);
//         console.log("This item isn't valid (v2)");
//         return;
//     }
//     else{
//         const value = await db.findId(req.body.objectId);
//         const temp=req.body.objectId;
//         if(value){
//             res.setHeader("ETag", value.ETag).status(409).json({"message":"This item already exists (v2)"});
//             console.log("This item already exists (v2)");
//             return;
//         }
//         else{
//             const ETag = (await db.addIdFromBodyReq(req.body)).ETag;
//             res.setHeader("ETag", ETag).status(201).json({
//                 "message":"item added successfully (v2)",
//                 "objectID": temp});
//             console.log("item added successfully (v2)");
//             return;
//         }
//     }
    
// });

app.get('/plans/:objectId', async (req, res) => {
    console.log("Fetching detail of object successfully");

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
    if(req.params.objectId == null && req.params.objectId == "" && req.params == {}){
        res.status(400).json({"message":"Enter valid object ID"});
        return;
    }
    const value = await db.findId(req.params.objectId);
    if(value.objectId == req.params.objectId){
        console.log("provided item found");
        console.log(JSON.parse(value.plan));
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
// app.post('/plans', (req, res, next) => {
//     if (req.apiVersion !== 'v1' && req.apiVersion !== 'v2') {
//       next(new InvalidVersionError());
//     } else if (req.apiVersion === 'v2') {
//       next(new UnsupportedVersionError());
//     } else {
//       next();
//     }
//   }, (req, res) => {
//     console.log(`Server is working properly (${req.apiVersion})`);
//     res.status(200).send();
//   });
// app.post('/plans', async(req, res) => {
//     console.log("Invalid request of POST");
//     res.status(400).json({"message":"Enter valid version in URL"});
//     console.log("Enter valid version");
//     return;
// });

app.listen(port_no, () => {
    console.log('Application starting on port ', port_no);
});


// const authe = require('./authe');
// const schema = require('./schema').default;
// import express from 'express';
// import redis from 'redis';
// import schema from './schema.js';
// const schema={};
// const schema = require('./schema.js');
// const Ajv = require('ajv');
// const ajv = new Ajv();
// const validateFunction = ajv.compile(schema);


// const ajv = require('Ajv');
// const validate = ajv.compile(schema);
// import {Ajv} from 'ajv';

// import { readFile } from 'fs/promises';

// const schemaData = await readFile('Json-schema.json');

// const jsonSchema = JSON.parse(schemaData);

// const userSchema = require('./userSchema.json');
//import jsonschema from './userSchema.json';


// const ajv = new Ajv();
// const validateUser = ajv.compile(jsonSchema);

    // const valid = validateUser(req.body);

    // if (!valid) {
    //     const error = validateUser.errors[0].message;
    //     res.status(400).json({"message":"This item isn't valid"});
    //     console.log("This item isn't valid");
    //     return;
    //     }
    
    // const isValid = validate(data);

    // const v1Routes = require('./routes/v1');
// const v2Routes = require('./routes/v2');

// app.use('/plans/v1', v1Routes);
// app.use('/plans/v2', v2Routes);

// class InvalidVersionError extends Error {}
// class UnsupportedVersionError extends Error {}
// const versionErrorMiddleware = (err, req, res, next) => {
//     if (err instanceof InvalidVersionError) {
//       res.status(400).json({ message: 'Invalid API version' });
//     } else if (err instanceof UnsupportedVersionError) {
//       res.status(400).json({ message: 'Unsupported API version' });
//     } else {
      
//       next(err);
//     }
//   };
  
  
//   app.use(versionErrorMiddleware);