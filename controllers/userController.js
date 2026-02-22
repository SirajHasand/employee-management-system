const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Register new user
const register = async (req, res) => {
    const { username, email, password, employeeId, role } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await db.query(
            'SELECT Id FROM Users WHERE Username = $1 OR Email = $2',
            [username, email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                error: 'User with this username or email already exists' 
            });
        }

        // Insert new user (storing plain password as requested)
        const result = await db.query(
            `INSERT INTO Users (Username, Email, Password, EmployeeId, Role) 
             VALUES ($1, $2, $3, $4, $5) RETURNING Id, Username, Email, Role, EmployeeId, CreatedAt`,
            [username, email, password, employeeId || null, role || 'employee']
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: result.rows[0].id, 
                username: result.rows[0].username,
                email: result.rows[0].email,
                role: result.rows[0].role,
                employeeId: result.rows[0].employeeid
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: result.rows[0],
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login user
const login = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Find user by username or email
        let user;
        if (username) {
            user = await db.query(
                'SELECT * FROM Users WHERE Username = $1',
                [username]
            );
        } else if (email) {
            user = await db.query(
                'SELECT * FROM Users WHERE Email = $1',
                [email]
            );
        } else {
            return res.status(400).json({ error: 'Username or email is required' });
        }

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userData = user.rows[0];

        // Verify password (plain text comparison as requested)
        if (userData.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Get employee details if linked
        let employeeDetails = null;
        if (userData.employeeid) {
            const employee = await db.query(
                `SELECT e.*, d.Name as DepartmentName, p.Title as PositionTitle 
                 FROM Employee e
                 LEFT JOIN Department d ON e.DepartmentId = d.Id
                 LEFT JOIN Position p ON e.PositionId = p.Id
                 WHERE e.Id = $1 AND e.IsDeleted = false`,
                [userData.employeeid]
            );
            if (employee.rows.length > 0) {
                employeeDetails = employee.rows[0];
            }
        }

        // Update updated_at timestamp
        await db.query(
            'UPDATE Users SET UpdatedAt = CURRENT_TIMESTAMP WHERE Id = $1',
            [userData.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: userData.id, 
                username: userData.username,
                email: userData.email,
                role: userData.role,
                employeeId: userData.employeeid
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                employeeId: userData.employeeid,
                employee: employeeDetails
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        
        const result = await db.query(
            `SELECT u.Id, u.Username, u.Email, u.Role, u.EmployeeId, u.CreatedAt,
                    e.FullName as EmployeeName
             FROM Users u
             LEFT JOIN Employee e ON u.EmployeeId = e.Id
             WHERE u.Id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password, role, employeeId } = req.body;
    
    try {
        // Check if user exists
        const userExists = await db.query('SELECT Id FROM Users WHERE Id = $1', [id]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Build update query dynamically
        let updateQuery = 'UPDATE Users SET ';
        const updateValues = [];
        let paramCounter = 1;

        if (username) {
            updateQuery += `Username = $${paramCounter}, `;
            updateValues.push(username);
            paramCounter++;
        }
        if (email) {
            updateQuery += `Email = $${paramCounter}, `;
            updateValues.push(email);
            paramCounter++;
        }
        if (password) {
            updateQuery += `Password = $${paramCounter}, `;
            updateValues.push(password);
            paramCounter++;
        }
        if (role) {
            updateQuery += `Role = $${paramCounter}, `;
            updateValues.push(role);
            paramCounter++;
        }
        if (employeeId !== undefined) {
            updateQuery += `EmployeeId = $${paramCounter}, `;
            updateValues.push(employeeId);
            paramCounter++;
        }

        updateQuery += `UpdatedAt = CURRENT_TIMESTAMP WHERE Id = $${paramCounter} RETURNING Id, Username, Email, Role, EmployeeId, CreatedAt, UpdatedAt`;
        updateValues.push(id);

        const result = await db.query(updateQuery, updateValues);
        
        res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Update user error:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.Id, u.Username, u.Email, u.Role, u.EmployeeId, u.CreatedAt, u.UpdatedAt,
                    e.FullName as EmployeeName
             FROM Users u
             LEFT JOIN Employee e ON u.EmployeeId = e.Id
             ORDER BY u.Id`
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    updateUser,
    getAllUsers
};