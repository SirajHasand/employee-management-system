-- Create database
CREATE DATABASE employee_db;

-- Connect to database
\c employee_db;

-- Create Department table
CREATE TABLE Department (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Position table
CREATE TABLE Position (
    Id SERIAL PRIMARY KEY,
    Title VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employee table
CREATE TABLE Employee (
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
CREATE TABLE EmployeeAddress (
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
CREATE TABLE EmployeeSalary (
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
CREATE TABLE EmployeeDocument (
    Id SERIAL PRIMARY KEY,
    EmployeeId INTEGER NOT NULL,
    DocumentName VARCHAR(200) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EmployeeId) REFERENCES Employee(Id) ON DELETE CASCADE
);

-- Create EmployeeAttendance table
CREATE TABLE EmployeeAttendance (
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

-- Create indexes for better performance
CREATE INDEX idx_employee_department ON Employee(DepartmentId);
CREATE INDEX idx_employee_position ON Employee(PositionId);
CREATE INDEX idx_address_employee ON EmployeeAddress(EmployeeId);
CREATE INDEX idx_salary_employee ON EmployeeSalary(EmployeeId);
CREATE INDEX idx_document_employee ON EmployeeDocument(EmployeeId);
CREATE INDEX idx_attendance_employee ON EmployeeAttendance(EmployeeId);
CREATE INDEX idx_attendance_date ON EmployeeAttendance(Date);