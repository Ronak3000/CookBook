import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection : ConnectionObject = {}

export default async function dbConnect(){
    if(connection.isConnected){
        console.log("Db connected Aleady");
        return
    }

    try {
        
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState

        console.log('db connected');
    } catch (error) {
        console.log("DB did not connect due to :",error)
        process.exit(1)
    }
}
