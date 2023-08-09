import { httpURL } from "./config";

export default{

    getListUsers: () => {
        return httpURL.get('usuarios')
    },
    getUniqueUser: (iduser) => {
        console.log(iduser) 
        return httpURL.get(`usuario/${iduser}`)
    },
    putUserUpdate: (user) => {
        console.log(user) 
        return httpURL.put('usuario', user)
    },
    postAddUser: (user) => {
        console.log(user)
        return httpURL.post('usuario', user)
    },
    deleteUser: (user) => {
        console.log(user)
        return httpURL.delete('usuario', {data: user})
    }
}