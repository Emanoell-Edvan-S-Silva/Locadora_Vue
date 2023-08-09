import { httpURL } from "./config";

export default{

    getListRents: () => {
        return httpURL.get('alugueis')
    },
    getUniqueRent: (idrent) => {
        console.log(idrent) 
        return httpURL.get(`aluguel/${idrent}`)
    },
    putRentUpdate: (rent) => {
        console.log(rent) 
        return httpURL.put('aluguel', rent)
    },
    postAddRent: (rent) => {
        console.log(rent)
        return httpURL.post('aluguel', rent)
    },
    deleteRent: (rent) => {
        console.log(rent)
        return httpURL.delete('aluguel', {data: rent})
    },
    getBooksAvailable: () => {
        return httpURL.get('disponiveis')
    },
    getListUsers: () => {
        return httpURL.get('usuarios')
    }
}