// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// check database connection
mongoose.connection.once('open', () => {
	console.log('MongoDB is connected');
});
mongoose.connection.on('error', (err) => {
	console.error(err);
});

 export async function mongoConnect() {
	await mongoose.connect(process.env.MONGO_URL!);
}

 export async function mongoDisconnect() {
	await mongoose.disconnect();
}

