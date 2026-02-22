const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Generate access token
const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username,
            email: user.email,
            role: user.role,
            employeeId: user.employeeid
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' }
    );
};

// Generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
    );
};

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

        // Insert new user
        const result = await db.query(
            `INSERT INTO Users (Username, Email, Password, EmployeeId, Role) 
             VALUES ($1, $2, $3, $4, $5) RETURNING Id, Username, Email, Role, EmployeeId, CreatedAt`,
            [username, email, password, employeeId || null, role || 'employee']
        );

        const newUser = result.rows[0];

        // Generate tokens
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        // Save refresh token to database
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days from now

        await db.query(
            'UPDATE Users SET RefreshToken = $1, RefreshTokenExpiry = $2 WHERE Id = $3',
            [refreshToken, refreshTokenExpiry, newUser.id]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                employeeId: newUser.employeeid
            },
            accessToken,
            refreshToken
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

        // Generate tokens
        const accessToken = generateAccessToken(userData);
        const refreshToken = generateRefreshToken(userData);

        // Save refresh token to database
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days from now

        await db.query(
            'UPDATE Users SET RefreshToken = $1, RefreshTokenExpiry = $2, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = $3',
            [refreshToken, refreshTokenExpiry, userData.id]
        );

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
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if refresh token exists in database and is not expired
        const user = await db.query(
            'SELECT * FROM Users WHERE Id = $1 AND RefreshToken = $2 AND RefreshTokenExpiry > NOW()',
            [decoded.id, refreshToken]
        );

        if (user.rows.length === 0) {
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }

        const userData = user.rows[0];

        // Generate new access token
        const newAccessToken = generateAccessToken(userData);

        // Optionally generate new refresh token (refresh token rotation)
        const newRefreshToken = generateRefreshToken(userData);
        
        // Update refresh token in database
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

        await db.query(
            'UPDATE Users SET RefreshToken = $1, RefreshTokenExpiry = $2 WHERE Id = $3',
            [newRefreshToken, refreshTokenExpiry, userData.id]
        );

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
};

// Logout (invalidate refresh token)
const logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    try {
        // Remove refresh token from database
        await db.query(
            'UPDATE Users SET RefreshToken = NULL, RefreshTokenExpiry = NULL WHERE RefreshToken = $1',
            [refreshToken]
        );

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error during logout' });
    }
};

// Get current user profile (protected)
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        
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
    refreshToken,
    logout,
    getCurrentUser,
    updateUser,
    getAllUsers
};