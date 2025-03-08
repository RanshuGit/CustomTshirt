require('dotenv').config();
Stripe.setPublishableKey(process.env.STRIPE_PUB_API_KEY);

var $form = $('#checkout-form');

$form.submit(function(event) {
    $('#charge-error').addClass('d-none');
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#cc-number').val(),
        cvc: $('#cc-cvv').val(),
        exp_month: $('#cc-exp-month').val(),
        exp_year: $('#cc-exp-year').val(),
        name: $('#cc-name').val()
    }, stripeResponseHandler);
    return false;
});

function stripeResponseHandler(status, response) {
    if (response.error) { // Problem!

        // Show the errors on the form
        $('#charge-error').text(response.error.message);
        $('#charge-error').removeClass('d-none');
        $form.find('button').prop('disabled', false); // Re-enable submission
    
      } else { // Token was created!
    
        // Get the token ID:
        var token = response.id;
    
        // Insert the token into the form so it gets submitted to the server:
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    
        // Submit the form:
        $form.get(0).submit();
    
      }
}