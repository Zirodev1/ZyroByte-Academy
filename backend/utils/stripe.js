const Stripe = require('stripe');
const stripe = Stripe('stripe secrete key');

module.exports = stripe;