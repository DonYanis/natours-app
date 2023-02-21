/* eslint-disable*/
import axios from 'axios'
import {showAlert} from './alerts'
const stripe = Stirpe('pk_test_51McxCJB9iodhyabI0jQrIbQHRosBkk8j2kesMimOmq5vOm0lTW1UAd4TV7OVsSLXhy8bFNky11sUKDYOFLKajdkh00nMxFZBbm')

export const bookTour = async tourId =>{
    try{
        //get checkoutSession
        const session = await axios(`/api/bookings/checkout-session/${tourId}`)
        //create ckeckout session
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    }catch(err){
        showAlert('error',err)
    }
}