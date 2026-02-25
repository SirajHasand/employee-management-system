-- Create Department table
CREATE TABLE IF NOT EXISTS Department (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Position table
CREATE TABLE IF NOT EXISTS Position (
    Id SERIAL PRIMARY KEY,
    Title VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employee table
CREATE TABLE IF NOT EXISTS Employee (
    Id SERIAL PRIMARY KEY,
    FullName VARCHAR(200) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    DateOfBirth DATE NOT NULL,
    HireDate DATE NOT NULL,
    DepartmentId INTEGER NOT NULL,
    PositionId INTEGER NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (DepartmentId) REFERENCES Department(Id),
    FOREIGN KEY (PositionId) REFERENCES Position(Id)
);

-- Create EmployeeAddress table
CREATE TABLE IF NOT EXISTS EmployeeAddress (
    Id SERIAL PRIMARY KEY,
    EmployeeId INTEGER NOT NULL,
    Street VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Country VARCHAR(100) NOT NULL,
    IsPrimary BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmployeeId) REFERENCES Employee(Id) ON DELETE CASCADE
);

-- Create EmployeeSalary table
CREATE TABLE IF NOT EXISTS EmployeeSalary (
    Id SERIAL PRIMARY KEY,
    EmployeeId INTEGER NOT NULL,
    BasicSalary DECIMAL(10, 2) NOT NULL,
    Allowance DECIMAL(10, 2) DEFAULT 0,
    EffectiveFrom DATE NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmployeeId) REFERENCES Employee(Id) ON DELETE CASCADE
);

-- Create EmployeeDocument table
CREATE TABLE IF NOT EXISTS EmployeeDocument (
    Id SERIAL PRIMARY KEY,
    EmployeeId INTEGER NOT NULL,
    DocumentName VARCHAR(200) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmployeeId) REFERENCES Employee(Id) ON DELETE CASCADE
);

-- Create EmployeeAttendance table
CREATE TABLE IF NOT EXISTS EmployeeAttendance (
    Id SERIAL PRIMARY KEY,
    EmployeeId INTEGER NOT NULL,
    Date DATE NOT NULL,
    CheckIn TIME,
    CheckOut TIME,
    IsPresent BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmployeeId) REFERENCES Employee(Id) ON DELETE CASCADE,
    UNIQUE(EmployeeId, Date)
);

-- Add Users table for authentication (simplified)
CREATE TABLE IF NOT EXISTS Users (
    Id SERIAL PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    EmployeeId INTEGER NULL,
    Role VARCHAR(20) DEFAULT 'employee',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmployeeId) REFERENCES Employee(Id) ON DELETE SET NULL
);

-- Create index for faster login queries
CREATE INDEX IF NOT EXISTS idx_users_username ON Users(Username);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(Email);

-- Add refresh token column to Users table
ALTER TABLE Users 
ADD COLUMN IF NOT EXISTS RefreshToken VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS RefreshTokenExpiry TIMESTAMP NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_department ON Employee(DepartmentId);
CREATE INDEX IF NOT EXISTS idx_employee_position ON Employee(PositionId);
CREATE INDEX IF NOT EXISTS idx_address_employee ON EmployeeAddress(EmployeeId);
CREATE INDEX IF NOT EXISTS idx_salary_employee ON EmployeeSalary(EmployeeId);
CREATE INDEX IF NOT EXISTS idx_document_employee ON EmployeeDocument(EmployeeId);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON EmployeeAttendance(EmployeeId);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON EmployeeAttendance(Date);