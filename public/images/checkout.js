const { response } = require("express");

Stripe.setPublishableKey('pk_test_51ICkQ3Koy0nW0rNuHrLUZfbvh3eFsFrUUTVgGGavttDTvEhYPzEgXmrAyXPKk1F3lkcOARhpO3W3o9H35e2miMCY00FbaM4Jha');

var $form = ('checkout-form');

$form.submit(function(event) {
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('.cardNumber').val(),
    }, stripeResponseHandler);
})

function stripeResponseHandler() {
    if (response.error) {
        $form.
    }
}