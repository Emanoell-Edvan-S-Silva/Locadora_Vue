import { httpURL } from "./config";

export default{

    getlistMostRented: () => {
        return httpURL.get('maisalugados')
    },
    
    getlistbooks: () => {
        return httpURL.get('livros')
    },

    getListRents: () => {
        return httpURL.get('alugueis')
    },
    putRentUpdate: (rent) => {
        console.log(rent) 
        return httpURL.put('aluguel', rent)
    },
    deleteRent: (rent) => {
        console.log(rent)
        return httpURL.delete('aluguel', {data: rent})
    }
}