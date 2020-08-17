const co = require("zco");
const request = require("request");
const consts = require("../../constants");
//const schedule = require('node-schedule');

function register(app){

    const feature = {
        name:"nnijob",
        author:"pengfang",
        description:"stop nni job if tasks stopped or failed",
        enabled: true,
        jobSelector:{
            conditions:[
            ],
            expression:"*"
    
        },
        plugins:[
            {
                key:"bindlifehook",
                pluginType:"LifeHook",
                callAddress:app.config.address.nnijob.lifehookAddr,
                description:"nnijob lifehook",
                jobSelector:{
                    conditions:[],
                    expression:"",
                    states:["*"]
                }
            }
    
        ]
    }

    co.brief(function*(resume){
         let opt = {
             url:app.config.pipeline.address+"/v1/features/",
             method:"post",
             headers:{
                 token:app.config.pipeline.token
             },
             body:feature,
             json:true
         };

         let [err,res,body] = yield request(opt,resume);

         if(err){
             throw err;
         }

         if (body.code != consts.OPERATION_SUCCEEDED){
             throw new Error(body.code +":"+body.msg)
         }
    })(err=>{
        if(err){
            console.log(err);
            process.exit(1);
        }
    })
}


exports.register = register;