import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elments, useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import api from '../../services/api';
import Header from "../Header";
import Footer from "../Footer";

const stripePromise = loadStripe('stripe public key');

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (!error){
            const { id } = paymentMethod;
            try {
                const { data } = await api.post('/payment/create-checkout-session', { priceId: 'your price id'})
                window.location.href = data.sessionId;
            } catch (error){
                console.error('Error creating checkout session', error);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement/>
            <button type="submit" disabled={!stripe}>
                Subscribe
            </button>
        </form>
    );
};

const Subscription = () => (
    <div>
        <Header/>
        <main>
            <h2>Subscription</h2>
            <Elments stripe={stripePromise}>
                <CheckoutForm />
            </Elments>
        </main>
        <Footer />
    </div>
);

export default Subscription