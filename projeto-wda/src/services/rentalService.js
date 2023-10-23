import { httpURL } from "./config";

export default{

    findAllOutstandingRentals: () => {
        return httpURL.get('Rentals')
    },

    findByIdRental: (idrental) => {
        console.log(idrental) 
        return httpURL.get(`Rentals/${idrental}`)
    },

    createNewRental: (rental) => {
        console.log(rental)
        return httpURL.post('Rentals', rental)
    },

    finalizeRental: (idrental) => {
        console.log(idrental) 
        return httpURL.put(`Rentals/Finalize/${idrental}`)
    },
    
    deleteRent: (idrental) => {
        console.log(idrental)
        return httpURL.delete(`Rentals/${idrental}`)
    },

    findAllBooksAvailable: () => {
        return httpURL.get('Books/AvailableBooks')
    },

    findAllUsers: () => {
        return httpURL.get('Users')
    }
}