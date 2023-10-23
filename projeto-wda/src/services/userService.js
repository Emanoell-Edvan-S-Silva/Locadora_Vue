import { httpURL } from "./config";

export default{

    findAllUsers: () => {
        return httpURL.get('Users/')
    },

    findByIdUser: (idUser) => {
        console.log(idUser) 
        return httpURL.get(`Users/${idUser}`)
    },

    createNewUser: (user) => {
        console.log(user)
        return httpURL.post('Users/', user)
    },

    updateUser: (user) => {
        console.log(user) 
        return httpURL.put('Users/', user)
    },

    deleteUser: (idUser) => {
        console.log(idUser)
        return httpURL.delete(`Users/${idUser}`)
    }
}