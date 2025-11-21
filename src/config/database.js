const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // No options needed - useNewUrlParser and useUnifiedTopology are deprecated
    // and enabled by default in MongoDB driver v4.0.0+
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
