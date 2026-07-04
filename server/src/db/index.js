import mongoose from "mongoose";

// Ensure Mongoose virtuals (like id mapping from _id) are serialized automatically
mongoose.plugin((schema) => {
    schema.set('toJSON', {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            if (ret._id) {
                ret.id = ret._id.toString();
            }
            return ret;
        }
    });
    schema.set('toObject', {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            if (ret._id) {
                ret.id = ret._id.toString();
            }
            return ret;
        }
    });
});

const connectDB = async () => {
    try {
        let dbUri = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/smarterp";
        
        // Sanitize URI (trim whitespace and strip surrounding quotes if any)
        dbUri = dbUri.trim().replace(/^["']|["']$/g, '');
        
        const connectionInstance = await mongoose.connect(dbUri);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

export default connectDB;