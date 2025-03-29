import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import api from '../../services/api';
import Header from "../Header";
import Footer from "../Footer";
import './Subscription.css';

// Replace with your actual Stripe public key when in production
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (!error) {
            try {
                // Use the paymentMethod.id in your request payload
                const { data } = await api.post('/payment/create-checkout-session', { 
                    paymentMethodId: paymentMethod.id,
                    priceId: 'price_1234567890' // Replace with your actual price ID
                });
                
                // Redirect to Stripe Checkout page
                window.location.href = data.sessionUrl;
            } catch (error) {
                console.error('Error creating checkout session', error);
            }
        } else {
            console.error('Payment error:', error);
        }
    };

    return (
        <div className="checkout-form">
            <div className="card-element-container">
                <CardElement className="card-element" />
            </div>
            <button 
                className="subscribe-button" 
                type="submit" 
                disabled={!stripe}
                onClick={handleSubmit}
            >
                Subscribe Now
            </button>
        </div>
    );
};

const Subscription = () => (
    <div className="subscription-container">
        <Header />
        <main className="subscription-content">
            <div className="subscription-header">
                <h1>Upgrade to Premium</h1>
                <p>Get unlimited access to all courses and features</p>
            </div>
            
            <div className="pricing-container">
                <div className="pricing-card">
                    <h2 className="plan-name">Premium Membership</h2>
                    <div className="plan-price">$19.99<span>/month</span></div>
                    <ul className="plan-features">
                        <li>Unlimited access to all courses</li>
                        <li>Certificate upon completion</li>
                        <li>Priority support</li>
                        <li>Downloadable resources</li>
                        <li>Access to exclusive webinars</li>
                    </ul>
                    
                    <div className="payment-container">
                        <h3>Payment Details</h3>
                        <Elements stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </div>
);

export default Subscription;