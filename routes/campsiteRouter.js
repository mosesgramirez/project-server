const express = require('express');
const campsiteRouter = express.Router()
const Campsite = require('../models/campsite');

// Router() allows for chaining these methods. We can delete "app" on each call and the first path param, which is set in .route. Remove ';' as well.

// /campsites
campsiteRouter.route('/')
// .all((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next(); // statusCode and setHeader are passed by the next() menthod to all subsequent relevant router endpoints.
// })
.get((req, res) => {
    Campsite.find()
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.json(campsites);
    })
    // res.end('Will send all the campsites to you');
    .catch(err => next(err));
})
.post((req, res, next) => {
    Campsite.create(req.body)
    .then(campsite => {
        console.log('Campsite created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);

    })
    // res.end(`Will add the campsite "${req.body.name}" with description "${req.body.description}"`);
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403; // forbidden
    res.end('PUT operation not supported on /campsites');
})
.delete((req, res, next) => {
    // Here's what you *would* do if you were to allow this:
    Campsite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    //res.end('Deleting all campsites');
    .catch(err => next(err));
});


// /campsiteId
campsiteRouter.route('/:campsiteId')
// .all((req, res, next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next(); 
// })
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    //res.end('...');
    .catch(err => next(err));
})
.post((req, res) => {
    res.statusCode = 403; 
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res, next) => {
    // res.write(`Updating the campsite "${req.params.campsiteId}"\n`)
    // res.end(`Will update the campsite "${req.body.name}" 
    //     with the description "${req.body.description}"`);
    Campsite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body
    }, { new: true })
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    //res.end('Deleting all campsites');
    .catch(err => next(err));
});

module.exports = campsiteRouter;