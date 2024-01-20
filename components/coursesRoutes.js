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

// Get all courses
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool.request().query('SELECT * FROM Courses');
    const courses = result.recordset;
    res.json(courses);
  } catch (error) {
    console.error('Error retrieving courses', error);
    res.status(500).json({ error: 'An error occurred while retrieving courses' });
  }
});

// Get a course by searching
router.get('/search', async (req, res) => {
  const {search} = req.query;
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool
      .request()
      .input('SearchQuery', sql.VarChar, `%${search}%`)
      .query('SELECT TOP 1 * FROM Courses WHERE CourseName LIKE @SearchQuery');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const course = result.recordset[0];
    res.json(course);
  } catch (error) {
    console.error('Error searching course', error);
    res.status(500).json({ error: 'An error occurred while searching the course' });
  }
});

// Add a new course
router.post('/', async (req, res) => {
  const { CourseName, Department, Description } = req.body;
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool
      .request()
      .input('CourseName', sql.VarChar, CourseName)
      .input('Department', sql.VarChar, Department)
      .input('Description', sql.VarChar, Description)
      .query('INSERT INTO Courses (CourseName, Department, Description) VALUES (@CourseName, @Department, @Description); SELECT SCOPE_IDENTITY() AS courseID;');
    const course = {
      id: result.recordset[0].id,
      CourseName,
      Department,
      Description
    };
    res.json(course);
  } catch (error) {
    console.error('Error adding course', error);
    res.status(500).json({ error: 'An error occurred while adding the course' });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await sql.connect(dbSettings);
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Courses WHERE id = @id');
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course', error);
    res.status(500).json({ error: 'An error occurred while deleting the course' });
  }
});

// Update a course
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { CourseName, Department, Description } = req.body;
  try {
    const pool = await sql.connect(dbSettings);
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('CourseName', sql.NVarChar, CourseName)
      .input('Department', sql.NVarChar, Department)
      .input('Description', sql.NVarChar, Description)
      .query('UPDATE Courses SET CourseName = @CourseName, Department = @Department, Description = @Description WHERE id = @id');
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course', error);
    res.status(500).json({ error: 'An error occurred while updating the course' });
  }
});

// Edit a course
router.get('/:id/edit', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Courses WHERE id = @id');
    const course = result.recordset[0];
    res.json(course);
  } catch (error) {
    console.error('Error retrieving course', error);
    res.status(500).json({ error: 'An error occurred while retrieving the course' });
  }
});

// Cancel editing
router.get('/cancel', (req, res) => {
  editingCourse = null;
  res.json({ message: 'Editing canceled' });
});

module.exports = router;
