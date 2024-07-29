import mongoose from 'mongoose';

const connection = () => {
    mongoose
        .connect(process.env.DB_URL, {
            dbName: "Main"
        })
        .then(() => {
            console.log("connected to the DB succesully");
        })
        .catch((err) => {
            console.log(err);
        });
};

export default connection