import { httpURL } from "./config";

export default{

    findAllBooks: () => {
        return httpURL.get('/Dashboard/Books')
    },
    
    findAllUsers: () => {
        return httpURL.get('/Dashboard/Users')
    },

    findAllPublishers: () => {
        return httpURL.get('/Dashboard/Publishers')
    },

    findAllRentals: () => {
        return httpURL.get('/Dashboard/Rentals')
    },

    findUserWithMostRentals: () => {
        return httpURL.get('/Dashboard/UserWithMostRentals')
    },

    findMostRentedBooks: () => {
        return httpURL.get('/Dashboard/Top4books')
    }, 

    findOnTimeRentals: () => {
        return httpURL.get('/Dashboard/OnTimeRentals')
    },   

    findLateRentals: () => {
        return httpURL.get('/Dashboard/LateRentals')
    }, 

    findOutsandingRentals: () => {
        return httpURL.get('/Dashboard/OutstandingRentals')
    },   
    
}