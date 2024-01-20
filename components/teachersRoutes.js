const express = require('express');
const router = express.Router();
const sql = require('mssql');

const dbSettings = {
  user: process.env.user,
  server: process.env.server,
  database:process.env.database,
  password:process.env.password,
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


// Get all teachers
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool.request().query('SELECT * FROM Teachers');
    const teachers = result.recordset;
    res.json(teachers);
  } catch (error) {
    console.error('Error retrieving teachers', error);
    res.status(500).json({ error: 'An error occurred while retrieving teachers' });
  }
});
// get one teacher by searching

router.get('/seaarch/:id', async  (req,res) => {
  try{
    const pool = await sql.connect(dbSettings)
    const result = await pool 
    .request()
    .input('SearchQuery', sql.VarChar , `@{search}`)
    .query(' SELECT TOP 1 * FROM Teachers WHERE FirstName AND LastName @Searchquery')
    if (result.recordset.length === 0){
      return res.status(404).json({error : 'Teacher not found'});
    }
    const teacher = result.recordset[0];
    res.json(teacher);
   } catch (error){
      console.error('Error searching teacher' , error)
      res.status(500).json({ error: 'An error occurred while searching the unit' });
 }
} );

// Add a new teacher
router.post('/', async (req, res) => {
  const { FirstName, LastName, Gender, Email, ContactNumber } = req.body;
  console.log('Received unit data:', FirstName, LastName,Gender,  Email, ContactNumber, Gender  ); // Add this line for debugging
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool
      .request()
      .input('FirstName', sql.NVarChar, FirstName)
      .input('LastName', sql.NVarChar, LastName)
      .input('Gender', sql.NVarChar, Gender)
      .input('Email', sql.NVarChar, Email)
      .input('ContactNumber', sql.NVarChar, ContactNumber)
      .query('INSERT INTO Teachers (FirstName, LastName, Gender, Email, ContactNumber) OUTPUT inserted.* VALUES (@FirstName, @LastName, @Gender, @Email, @ContactNumber)');
    const teacher = result.recordset[0];
    res.json(teacher);
  } catch (error) {
    console.error('Error adding teacher', error);
    res.status(500).json({ error: 'An error occurred while adding the teacher' });
  }
});

// Delete a teacher
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await sql.connect(dbSettings);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Teachers WHERE id = @id');
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher', error);
    res.status(500).json({ error: 'An error occurred while deleting the teacher' });
  }
});

// Update a teacher
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { FirstName, LastName, Gender, Email, ContactNumber } = req.body;
  try {
    const pool = await sql.connect(dbSettings);
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('FirstName', sql.NVarChar, FirstName)
      .input('LastName', sql.NVarChar, LastName)
      .input('Gender', sql.NVarChar, Gender)
      .input('Email', sql.NVarChar, Email)
      .input('ContactNumber', sql.NVarChar, ContactNumber)
      .query('UPDATE Teachers SET FirstName = @FirstName, LastName = @LastName, Gender = @Gender, Email = @Email, ContactNumber = @ContactNumber WHERE id = @id');
    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Error updating teacher', error);
    res.status(500).json({ error: 'An error occurred while updating the teacher' });
  }
});

// Edit a teacher
router.get('/:id/edit', (req, res) => {
  const id = parseInt(req.params.id);
  editingTeacher = teachers.find((teacher) => teacher.teacherId === id);
  res.json(editingTeacher);
});

// Cancel editing
router.get('/cancel', (req, res) => {
  editingTeacher = null;
  res.json({ message: 'Editing canceled' });
});

module.exports = router;
