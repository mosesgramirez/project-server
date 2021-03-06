const express = require('express');
const campsiteRouter = express.Router();
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');

// Router() allows for chaining these methods. We can delete "app" on each call and the first path param, which is set in .route. Remove ';' as well.

// /campsites
campsiteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
// .all() with res.statusCode / res.setHeader / next() was deleted.
// Noticed on 3/20/21 that I was missing "next". Added it back.
.get(cors.cors, (req, res, next) => {
    Campsite.find()
    .populate('comments.author')
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.json(campsites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.create(req.body)
    .then(campsite => {
        console.log('Campsite created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);

    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; // forbidden
    res.end('PUT operation not supported on /campsites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});


// /campsiteId
campsiteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
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
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403; 
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, { $set: req.body }, { new: true })
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

// /comments
campsiteRouter.route('/:campsiteId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    console.log("req.params", req.params);
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        console.log("campsite function param: ", campsite);
        if(campsite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments);
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log("req.params.campsiteId: ", req.params.campsiteId);
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
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403; // forbidden
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});


// /:commentId
campsiteRouter.route('/:campsiteId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if(campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments.id(req.params.commentId));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`)
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403; 
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log('req.user', req.user);
    console.log('req.params', req.params)
    // console.log('campsite.comments)', campsite.comments)
    // console.log('campsites.comments._id(req.params.commentId).author._id', campsites.comments._id(req.params.commentId).author._id);
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
           
            // Reviewing previous modules. Not sure if we removed this later, so I'm adding it back in.
            if (req.user._id.equals(campsite.comments.id(req.params.commentId).author._id)) {  //new

                if (req.body.rating) {
                    campsite.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.text) {
                    campsite.comments.id(req.params.commentId).text = req.body.text;
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`Comment ID does not match author ID.`)
                err.status = 403;
                return next(err);
            }
        }
         else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`)
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            if (req.user._id.equals(campsite.comments.id(req.params.commentId).author._id)) {  //new
                console.log(campsite.comments);
                campsite.comments.id(req.params.commentId).remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`Comment ID does not match author ID.`)
                err.status = 403;
                return next(err);
            }
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`)
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`)
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;