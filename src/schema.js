const Validator = require("jsonschema").Validator;
const validator = new Validator();
const schemaData = require("fs").readFileSync("Json-Schema.json");
const jsonSchema = JSON.parse(schemaData);

// Custom validation method that handles null values
validator.customFormats.null = (input) => input === null;

const validate = function (reqBody) {
  const validationResult = validator.validate(reqBody, jsonSchema);
  return validationResult.errors.length === 0;
};
// const validate = function(reqBody){
//   if(validator.validate(reqBody, jsonSchema).errors.length<1){
//       return true;
//   }
//   else{
//       return false;
//   }
// }

const validateValue = function (reqBody) {
    const validationResult = validator.validate(reqBody, jsonSchema);
    return validationResult;
  };
const schema = {
  validator,
  validate,
  validateValue,
  hash: require("object-hash"),
};
module.exports = schema;

// let schema = {};
// const Validator = require("jsonschema").Validator;
// var validator = new Validator();
// // const schemaData = require("fs").readFileSync("Json-Schema.json");
// const schemaData = require("fs").readFileSync("Json-Schema.json", "utf8");


// // const jsonSchema = JSON.parse(schemaData);
// // import { Validator } from "jsonschema";
// // const validator = new Validator();
// // import jsonSchema from "./Json-Schema.json"; // Assuming the JSON schema file is in the same directory

// schema.validator = function (reqBody) {
//   const validation = validator.validate(reqBody, jsonSchema);
//   if (validation.errors.length === 0) {
//     return true;
//   } else {
//     return false;
//   }
// };

// const Validator = require("jsonschema").Validator;
// const validator = new Validator();
// const schemaData = require("fs").readFileSync("Json-Schema.json");
// const jsonSchema = JSON.parse(schemaData);

// const validate = function (reqBody) {
//   const validationResult = validator.validate(reqBody, jsonSchema);
//   return validationResult.errors.length === 0;
// };

// const schema = {
//   validator,
//   validate,
//   hash: require("object-hash"),
// };

// module.exports = schema;

// let schema = {}
// const Validator = require('jsonschema').Validator;
// var validator = new Validator();
// const schemaData = require('fs').readFileSync('Json-Schema.json');
// const jsonSchema = JSON.parse(schemaData);

// schema.validator = function(reqBody){
//     if(validator.validate(reqBody, jsonSchema).errors.length == 0){
//         return true;
//     }
//     else{
//         return false;
//     }
// }

// schema.hash = require('object-hash');


// module.exports = schema;


// schema.validator = function (reqBody) {
//   if (validator.validate(reqBody, jsonSchema).errors.length < 1) {
//     return true;
//   } else {
//     return false;
//   }
// };

// schema.hash = require("object-hash");

// // export default schema;
// module.exports = schema;


// let schema = {}

// import { Validator } from 'jsonschema';

// var validator = new Validator();

// import { readFile } from 'fs/promises';

// const schemaData = await readFile('Json-schema.json');

// const jsonSchema = JSON.parse(schemaData);

// schema.validator = function(reqBody){
//     if(validator.validate(reqBody, jsonSchema).errors.length<1){
//         console.log("is there something in validator");
//         return true;
//     }
//     else{
//         console.log("is there not something in validator");
//         return false;
//     }
// }

// import objectHash from 'object-hash';

// schema.hash = objectHash;


// export default schema;