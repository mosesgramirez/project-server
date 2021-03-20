const express = require('express');
const campsiteRouter = express.Router()
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

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
    .populate('comments.author')
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.json(campsites);
    })
    // res.end('Will send all the campsites to you');
    .catch(err => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; // forbidden
    res.end('PUT operation not supported on /campsites');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    .populate('comments.author')
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    //res.end('...');
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; 
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    //res.end('Deleting all campsites');
    .catch(err => next(err));
});

// /comments
campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if(campsite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments);
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 400;
            return next(err);
        }
    })

    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    console.log(req.params.campsiteId)
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if(campsite) {
            req.body.author = req.user._id;
            campsite.comments.push(req.body);
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite)
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 400;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // forbidden
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if(campsite) {
            for (let i = (campsite.comments.length - 1); i >=0; i--) {
                campsite.comments.id(campsite.comments[i]._id).remove();
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite)
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 400;
            return next(err);
        }
    })
    .catch(err => next(err));
});


// /:commentId
campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if(campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments.id(req.params.commentId));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 400;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`)
            err.status = 400;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; 
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    console.log('req.user', req.user);
    console.log('req.user._.id', req.user._id);
    console.log('comments.author._id', comments.author._id)
    console.log('req.params', req.params)
    console.log('req.params.campsiteId', req.params.campsiteId)
    console.log('req.params.commentId', req.params.commentId)
    console.log('campsite.comments._id(req.params.commentId).author._id', campsite.comments._id(req.params.commentId).author._id);
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            if (req.user._id.equals(comments.author._id)) {  //new
                campsite.comments.id(req.params.commentId).remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
        } else if (!req.user._id.equals(comments.author._id)) {
            err = new Error(`This is not your comment.`)
            err.status = 403;
            return next(err);
        }
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 400;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`)
            err.status = 400;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            if (req.user._id.equals(comments.author._id)) {  //new
                campsite.comments.id(req.params.commentId).remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
        } else if (!req.user._id.equals(comments.author._id)) {
            err = new Error(`This is not your comment.`)
            err.status = 403;
            return next(err);
        }
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 400;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`)
            err.status = 400;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;