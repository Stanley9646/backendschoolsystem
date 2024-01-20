const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app=express();
require('dotenv').config()
app.use(cors());

const teachersRoute = require('./components/teachersRoutes');
const unitsRoute = require('./components/unitRoutes');
const coursesRoute = require('./components/coursesRoutes');
const studentsRoute = require('./components/studentsRoutes');


app.use(express.json())
app.use('/teachers', teachersRoute);
app.use('/students', studentsRoute);
app.use('/units', unitsRoute);
app.use('/courses', coursesRoute);



app.get('/',(req, res) => {
    res.send("heyyjjjjjjjj")
})


const port = process.env.PORT || 8000

app.listen(port, console.log(`server is listening on port ${port}...`))


const dbSettings = {
  user:"Stanley",
  server: "DESKTOP-8NI5HF5",
  database:"SchoolSystem",
  password:"Kizangila@9646",
  enableArithAbort: true,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options:{
      trustedConnection : true,
      enableArithAbort: true,
      trustServerCertificate : true
  },
  Port :1433
}

// async function getConnection (){
//   const pool = await sql.connect(dbSettings);
//   const result = await pool.request().query("SELECT * FROM Units");
//   console.log(result)
// }

// getConnection();

async function getConnection() {
  try {
    await sql.connect(dbSettings);
    const result = await sql.query`SELECT * FROM Courses`;
    // const result = await sql.query`
    //   INSERT INTO Units (unitName, Department)
    //   OUTPUT inserted.UnitId, inserted.unitName, inserted.Department
    //   VALUES ('IT', 'COMP')
    // `;

    console.log(result);
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
}

getConnection();









   
