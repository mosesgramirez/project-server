const mongoose = require('mongoose');
const Campsite = require('./models/campsite');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// returns Promise
connect.then(() => {
    console.log('Connected correctly to server');

    // Method 1: const newCampsite = new Campsite... newCampsite.save().then...
    // Method 2: see below, using mongoose method create()
    Campsite.create({
        name: 'React Lake Campground',
        description: 'test'
    })
    .then(campsite => {
        console.log(campsite);
        return Campsite.findByIdAndUpdate(campsite._id, {
            $set: {description: 'Updated test document'}
        }, {
            new: true
        });
    })
    .then(campsite => {
        console.log(campsite);

        campsite.comments.push({
           rating: 5,
           text: 'What a magnificient view' ,
           author: 'Tinus Lorvaldes'
        });
        return campsite.save(); // Since we are returning one object and not an array, we can singularize the next then() in the chain.
    })
    .then(campsite => {
        console.log(campsite);
        return Campsite.deleteMany();
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch(err => {
        console.log(err);
        mongoose.connection.close();
    });
});



