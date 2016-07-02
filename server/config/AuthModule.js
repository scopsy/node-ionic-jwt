'use strict';
const request   = require('request');
const jwt       = require('jsonwebtoken');
const User      = require('../models/User');

module.exports = {
    facebookAuthentication,
    createOrRetrieveUser
};

/**
 * Facebook authentication using graph api,
 * Here we will receive our code from the ionic app and pass it to the graph api
 * After auth code will be exchanged for accessToken we will fetch profile info
 * @param options
 * @param cb
 */
function facebookAuthentication(options, cb) {
    const fields          = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
    const accessTokenUrl  = 'https://graph.facebook.com/v2.5/oauth/access_token';
    const graphApiUrl     = `https://graph.facebook.com/v2.5/me?fields=${fields.join(',')}`;

    const params = {
        code: options.code,
        client_id: options.clientId,
        redirect_uri: options.redirectUri,
        client_secret: process.env.FACEBOOK_SECRET
    };

    // Step 1. Exchange authorization code for access token.
    request.get({url: accessTokenUrl, qs: params, json: true}, (err, response, accessToken) => {
        if(response.statusCode !== 200) return cb(accessToken.error.message);

        // Step 2. Retrieve profile information about the current user.
        request.get({url: graphApiUrl, qs: accessToken, json: true}, (err, response, profile) => {
            if(response.statusCode !== 200) return cb(accessToken.error.message);

            // Here we will normalize facebook response to our user schema
            // So later we can use multiple providers
            const user = {
                profilePicture: `https://graph.facebook.com/${profile.id}/picture?type=large`,
                firstName: profile.first_name,
                lastName: profile.last_name,
                profiles: {
                    facebook: profile.id
                },
                email: profile.email,
                token: accessToken
            };

            cb(null, {type:'facebook', user});
        });
    });
}

/**
 * This method is responsible for fetching the user object,
 * if no user is found with specified credentials, new user will be created
 * @param options
 * @param cb
 */
function createOrRetrieveUser(options, cb) {
    // select the query object based on the auth type
    const query = {
        [`profiles.${options.type}`]: options.user.profiles[options.type]
    };

    User.findOne(query, (err, user) => {
        if(err) return cb('Error fetching user');

        // User found, return him to the callback
        if(user) return cb(null, user);

        // No user is found, create new user
        createUser(options.user, cb);
    });
}

/**
 * Saves new user with data passed from profiles
 * @param user
 * @param cb
 */
function createUser(user, cb) {
    const newUser = new User(user);

    newUser.save(cb);
}
