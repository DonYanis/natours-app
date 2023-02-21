exports.getRoutes =  (req, res,next) =>{
    
    const routes = {
        tours : {
            main : 'api/v1/tours',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                },
                {
                    route : '/top-5-cheap',
                    methods: ['GET']
                },
                {
                    route : '/tour-stats',
                    methods: ['GET']
                },
                {
                    route : '/monthly-plan/:year',
                    methods: ['GET','POST']
                },
                {
                    route : '/tours-within/:distance/center/:latlng/unit/:unit',
                    methods: ['GET']
                },
                {
                    route : '/distances/:latlng/unit/:unit',
                    methods: ['GET','POST']
                },
                {
                    route : '/:tourId/reviews',
                    methods: ['GET','POST']
                },
                {
                    route : '/:tourId/reviews/:id',
                    methods: ['GET','PATCH','DELETE']
                }
            ]
        },
        users : {
            main : 'api/v1/users',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                },
                {
                    route : '/signup',
                    methods: ['POST']
                },
                {
                    route : '/login',
                    methods: ['GET','POST']
                },
                {
                    route : '/forgotPassword',
                    methods: ['POST']
                },
                {
                    route : '/resetPassword/:token',
                    methods: ['PATCH']
                },
                {
                    route : '/updateMyPassword',
                    methods: ['PATCH']
                },
                {
                    route : '/me',
                    methods: ['GET']
                },
                {
                    route : '/updateMe',
                    methods: ['PATCH']
                },
                {
                    route : '/deleteMe',
                    methods: ['DELETE']
                }
            ]
        },
        reviews : {
            main : 'api/v1/reviews',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                }                
            ]
        },
        bookings : {
            main : 'api/v1/bookings',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                }                
            ]
        },
        views : {
            main : '',
            routes : [
                {
                    route : '/',
                    methods: ['GET']
                },
                {
                    route : '/tour/:slug',
                    methods: ['GET']
                },
                {
                    route : '/login',
                    methods: ['GET']
                },
                {
                    route : '/me',
                    methods: ['GET']
                },
                {
                    route : '/my-tours',
                    methods: ['GET']
                },
                {
                    route : '/submit-user-data',
                    methods: ['POST']
                }               
            ]
        }
    } 

    res.status(200).json({ 
        status:'success',
        data : {
            routes 
        }
    });
}
