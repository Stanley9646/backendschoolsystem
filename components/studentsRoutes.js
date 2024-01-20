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

// Get all students
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool.request().query('SELECT * FROM Students');
    const students = result.recordset;
    res.json(students);
  } catch (error) {
    console.error('Error retrieving students', error);
    res.status(500).json({ error: 'An error occurred while retrieving students' });
  }
});

// Get a student by searching
router.get('/search', async (req, res) => {
  const {search} = req.query;
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool
      .request()
      .input('SearchQuery', sql.VarChar, `%${search}%`)
      .query(`SELECT * FROM Students WHERE FirstName LIKE @SearchQuery OR LastName LIKE @SearchQuery OR StudentID LIKE @SearchQuery OR Email LIKE @SearchQuery OR Gender LIKE @SearchQuery`);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = result.recordset[0];
    res.json(student);
  } catch (error) {
    console.error('Error searching student', error);
    res.status(500).json({ error: 'An error occurred while searching the student' });
  }
});

// Add a new student
router.post('/', async (req, res) => {
  const { StudentID, FirstName, LastName,  Email, TelphoneNumber, Gender } = req.body;
  console.log('Received unit data:',StudentID, FirstName, LastName,  Email, TelphoneNumber, Gender  ); // Add this line for debugging
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool
      .request()
      .input('StudentID', sql.BigInt, StudentID)
      .input('FirstName', sql.NVarChar, FirstName)
      .input('LastName', sql.NVarChar, LastName)
      .input('Email', sql.NVarChar, Email)
      .input('TelphoneNumber', sql.NVarChar, TelphoneNumber)
      .input('Gender', sql.NVarChar, Gender)
      .query('INSERT INTO Students (StudentID, FirstName, LastName,  Email, TelphoneNumber , Gender) VALUES (@StudentID, @FirstName, @LastName,  @Email, @TelphoneNumber , @Gender); SELECT SCOPE_IDENTITY() AS Id;');
    const student = {
      id: result.recordset[0].Id,
      StudentID,
      FirstName,
      LastName,
      Email,
      TelphoneNumber,
      Gender
    };
    res.json(student);
  } catch (error) {
    console.error('Error adding student', error);
    res.status(500).json({ error: 'An error occurred while adding the student' });
  }
});



router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await sql.connect(dbSettings);
    await pool
      .request()
      .input('StudentID', sql.Int, id)
      .query('DELETE FROM Students WHERE StudentID = @StudentID');
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student', error);
    res
      .status(500)
      .json({ error: 'An error occurred while deleting the student' });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { StudentID, FirstName, LastName, Gender, Email, TelphoneNumber } = req.body;
  try {
    const pool = await sql.connect(dbSettings);
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('StudentID', sql.Int, StudentID)
      .input('FirstName', sql.NVarChar, FirstName)
      .input('LastName', sql.NVarChar, LastName)
      .input('Gender', sql.NVarChar, Gender)
      .input('Email', sql.NVarChar, Email)
      .input('TelphoneNumber', sql.NVarChar, TelphoneNumber)
    .query('UPDATE Students SET StudentID = @StudentID, FirstName = @FirstName, LastName = @LastName, Gender = @Gender, Email = @Email, TelphoneNumber = @TelphoneNumber WHERE StudentID = @StudentID');
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student', error);
    res.status(500).json({ error: 'An error occurred while updating the student' });
  }
});

// Edit a student
router.get('/:id/edit', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool.request().input('Id', sql.Int, id).query('SELECT * FROM Students WHERE Id = @Id');
    const student = result.recordset[0];
    res.json(student);
  } catch (error) {
    console.error('Error retrieving student', error);
    res.status(500).json({ error: 'An error occurred while retrieving the student' });
  }
});

// Cancel editing
router.get('/cancel', (req, res) => {
  editingStudent = null;
  res.json({ message: 'Editing canceled' });
});

module.exports = router;
