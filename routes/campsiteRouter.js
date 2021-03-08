const express = require('express');
const campsiteRouter = express.Router()

// Router() allows for chaining these methods. We can delete "app" on each call and the first path param, which is set in .route. Remove ';' as well.

// /campsites
campsiteRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next(); // statusCode and setHeader are passed by the next() menthod to all subsequent relevant router endpoints.
})
.get((req, res) => {
    res.end('Will send all the campsites to you');
})
.post((req, res) => {
    res.end(`Will add the campsite "${req.body.name}" with description "${req.body.description}"`);
})
.put((req, res) => {
    res.statusCode = 403; // forbidden
    res.end('PUT operation not supported on /campsites');
})
.delete((req, res) => {
    res.end('Deleting all campsites');
});


// /campsiteId
campsiteRouter.route('/:campsiteId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next(); 
})
.get((req, res) => {
    res.end(`Will send details of the campsite "${req.params.campsiteId}" to you`);
})
.post((req, res) => {
    res.statusCode = 403; 
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res) => {
    res.write(`Updating the campsite "${req.params.campsiteId}"\n`)
    res.end(`Will update the campsite "${req.body.name}" 
        with the description "${req.body.description}"`);
})
.delete((req, res) => {
    res.end(`Deleting the campsite "${req.params.campsiteId}"`);
});

module.exports = campsiteRouter;