// const sql = require('mssql');

// const dbSettings = {
//     user:"Stanley",
//     server: "localhost",
//     database:"SchoolSystem",
//     password:"Kizangila@9646",
//     enableArithAbort: true,
//     pool: {
//       max: 10,
//       min: 0,
//       idleTimeoutMillis: 30000
//     },
//     options:{
//         trustedConnection : true,
//         enableArithAbort: true,
//         trustServerCertificate : true
//     },
//    // Port :57430
// }

// async function getConnection (){
//     const pool = await sql.connect(dbSettings);
//     const result = await pool.request().query("SELECT 1");
//     console.log(result)
// }

// getConnection();


const mongoose=require('mongoose')


const connectDB = (url) => {
    return mongoose.connect( url,{ 
        useUnifiedTopology:true,
        useNewUrlParser:true,
    })
}

module.exports= connectDB