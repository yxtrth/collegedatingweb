// Test script to verify the setup
console.log('Testing CampusCrush setup...');

try {
    const express = require('express');
    console.log('✅ Express loaded successfully');
    
    const mongoose = require('mongoose');
    console.log('✅ Mongoose loaded successfully');
    
    const cors = require('cors');
    console.log('✅ CORS loaded successfully');
    
    const bcrypt = require('bcryptjs');
    console.log('✅ bcryptjs loaded successfully');
    
    const jwt = require('jsonwebtoken');
    console.log('✅ JWT loaded successfully');
    
    console.log('\n🎉 All dependencies are working correctly!');
    console.log('\nTo start the server:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Run: node app.js');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTry running: npm install');
}
