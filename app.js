const express = require('express');
const axios = require('axios')
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const app = express();
app.use(cors());
app.use(express.json());

app.use(bodyParser.json());


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true, 
  }));

  //for third parties api
  app.get('/serverapi', async (req, res) => {
    try {
      const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

app.post('/submit', (req, res) => {
    console.log(req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {


        return res.status(400).json({ error: 'Invalid data' });
    }


    // Insert the form data into the database
    const insertQuery = 'INSERT INTO admin_form (name, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [name, email, password], (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Assuming the query was successful, you should check the affected rows to verify if the insert worked as expected.
        if (result.affectedRows === 1) {
            res.status(201).json({ message: 'Form data submitted successfully' });
        } else {

            res.status(500).json({ error: 'Form data was not inserted' });
        }
    });

});

// server.js
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM admin_form WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
      if (err) throw err;
      if (results.length === 1) {
        // Successful login, return a token or session information
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.json({ success: false, message: 'Login failed' });
      }
    });
  });
  


app.get('/submit', (req, res) => {
    
    const selectQuery = 'SELECT * FROM admin_form'; 

    db.query(selectQuery, (err, result) => {
        if (err) {
            console.error('Error retrieving data from the database:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

      
        res.status(200).json(result);
        console.log(result);
    });
});


app.delete("/delete/:id", (req, res) => {
    const itemId = req.params.id;

    // Implement the logic to delete the item with the given ID from the database
    const deleteQuery = 'DELETE FROM admin_form WHERE id = ?';
    db.query(deleteQuery, [itemId], (err, result) => {
        if (err) {
            console.error('Error deleting data from the database:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Assuming the query was successful, you should check the affected rows to verify if the delete worked as expected.
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ error: 'Item not found or not deleted' });
        }
    });
});

app.put('/update/:id', (req, res) => {
    const itemId = req.params.id;
    const { name, email, password } = req.body; 

    const updateQuery = 'UPDATE admin_form SET name = ?, email = ?, password = ? WHERE id = ?';
    db.query(updateQuery, [name, email, password, itemId], (err, result) => {
        if (err) {
            console.error('Error updating data in the database:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Assuming the query was successful, you should check the affected rows to verify if the update worked as expected.
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Item updated successfully' });
        } else {
            res.status(404).json({ error: 'Item not found or not updated' });
        }
    });
});


// Define the logout route
app.post('/logout', (req, res) => {
    // Get the user's token from the request body
    const userToken = req.body.token;
  
    if (!userToken) {
      return res.status(401).json({ message: 'Token is required for logout.' });
    }
  
    // Add the token to a blacklist or clear it on the server to invalidate the token
    // You can use a data store (e.g., Redis) to maintain a token blacklist
  
    // Respond with a success message or error
    return res.status(200).json({ message: 'Logged out successfully' });
  });

//for count 
app.get('/studentCount', (req, res) => {
    db.query('SELECT COUNT(*) AS studentCount FROM admin_form', (err, results) => {
      if (err) {
        console.error('Error fetching student count:', err);
        return res.status(500).json({ count: 0 });
      }
      res.json({ count: results[0].studentCount });
    });
  });

  //for admin Count
//   app.get('/api/adminCount', (req, res) => {
//     db.query('SELECT COUNT(*) AS adminCount FROM admin_login', (err, results) => {
//       if (err) {
//         console.error('Error fetching admin count:', err);
//         return res.status(500).json({ count: 0 });
//       }
//       res.json({ count: results[0].adminCount });
//     });
//   });

app.listen(4000, () => {
    console.log("server is running on port 4000")
});