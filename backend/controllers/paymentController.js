const stripe = require('../utils/stripe');
const User = require('../models/User');

exports.createCheckoutSession = async (req, res) => {
    const { priceId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            success_url: 'http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000',
            client_reference_id: req.user.id,
        });

        res.json({ sessionUrl: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            if (session.client_reference_id) {
                const user = await User.findById(session.client_reference_id);
                if (user) {
                    user.subscribed = true;
                    await user.save();
                    console.log(`User ${user.email} is now subscribed`);
                } else {
                    console.error(`User not found for client_reference_id: ${session.client_reference_id}`);
                }
            } else {
                console.error('No client_reference_id found in session');
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ message: `Webhook error: ${error.message}` });
    }
};