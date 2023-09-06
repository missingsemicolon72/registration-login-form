const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.ATLAS_DB_USERNAME}:${process.env.ATLAS_DB_PASSWORD}@anonymouscluster.8rpthln.mongodb.net/${process.env.ATLAS_DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connection to the database on port 27017 estabilished successfully!');
}).catch((err) => {
    console.log(err);
});

// useCreateIndex: true
// useFindAndModify