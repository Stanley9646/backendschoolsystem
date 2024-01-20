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

// Get all units
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool.request().query('SELECT * FROM Units');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error getting units', error);
    res.status(500).json({ error: 'An error occurred while getting units' });
  }
});

// Add a new unit
router.post('/', async (req, res) => {
  const { UnitName, Department } = req.body;
  console.log('Received unit data:', UnitName, Department); // Add this line for debugging
  try {
    const pool = await sql.connect(dbSettings);
    const result = await pool
      .request()
      .input('UnitName', sql.VarChar, UnitName)
      .input('Department', sql.VarChar, Department)
      .query('INSERT INTO Units (UnitName, Department) VALUES (@UnitName, @Department); SELECT SCOPE_IDENTITY() AS UnitId;');
    const unit = {
      UnitId: result.recordset[0].UnitId,
      UnitName,
      Department
    };
    res.json(unit);
  } catch (error) {
    console.error('Error adding unit', error);
    res.status(500).json({ error: 'An error occurred while adding the unit' });
  }
});



// router.get('/', async (req, res) => {
//   const { search, field } = req.query;
//   let query = '';
//   let inputName = '';

//   try {
//     const pool = await sql.connect(dbSettings);
//     switch (field) {
//       case 'UnitName':
//         query = 'SELECT * FROM Units WHERE UnitName LIKE @SearchQuery';
//         inputName = 'SearchQuery';
//         break;
//       case 'Department':
//         query = 'SELECT * FROM Units WHERE Department LIKE @SearchQuery';
//         inputName = 'SearchQuery';
//         break;
//       default:
//         return res.status(400).json({ error: 'Invalid field' });
//     }

router.get('/', async (req, res) => {
  const { search, field } = req.query;
  let query = '';
  let inputName = '';

  try {
    const pool = await sql.connect(dbSettings);
    switch (field) {
      case 'UnitName':
        query = 'SELECT * FROM Units WHERE UnitName LIKE @SearchQuery';
        inputName = 'SearchQuery';
        break;
      case 'Department':
        query = 'SELECT * FROM Units WHERE Department LIKE @SearchQuery';
        inputName = 'SearchQuery';
        break;
      default:
        return res.status(400).json({ error: 'Invalid field' });
    }

    // Check if the search query is empty
    if (!search) {
      return res.status(400).json({ error: 'Search query cannot be empty' });
    }

    const result = await pool
      .request()
      .input(inputName, sql.VarChar, `%${search}%`) // Specify the input type as sql.VarChar
      .query(query);

    const units = result.recordset;
    res.json(units);
  } catch (error) {
    console.error('Error searching unit', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete a unit
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await sql.connect(dbSettings);
    await pool.request().input('UnitId', sql.Int, id).query('DELETE FROM Units WHERE UnitId = @UnitId');
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit', error);
    res.status(500).json({ error: 'An error occurred while deleting the unit' });
  }
});

// Update a unit
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { UnitName, Department } = req.body;
  try {
    const pool = await sql.connect(dbSettings);
    await pool
      .request()
      .input('UnitId', sql.Int, id)
      .input('UnitName', sql.VarChar, UnitName)
      .input('Department', sql.VarChar, Department)
      .query('UPDATE Units SET UnitName = @UnitName, Department = @Department WHERE UnitId = @UnitId');
    res.json({ message: 'Unit updated successfully' });
  } catch (error) {
    console.error('Error updating unit', error);
    res.status(500).json({ error: 'An error occurred while updating the unit' });
  }
});


// Edit a unit
router.get('/:id/edit', (req, res) => {
  const id = parseInt(req.params.id);
  const editingUnit = units.find((unit) => unit.UnitId === id);
  res.json(editingUnit);
});

// Cancel editing
router.get('/cancel', (req, res) => {
  editingUnit = null;
  res.json({ message: 'Editing canceled' });
});

module.exports = router;

