import { httpURL } from "./config";

export default{

    getlistMostRented: () => {
        return httpURL.get('maisalugados')
    },    
    putRentUpdate: (rent) => {
        console.log(rent) 
        return httpURL.put('aluguel', rent)
    },
    deleteRent: (rent) => {
        console.log(rent)
        return httpURL.delete('aluguel', {data: rent})
    },
    getListRents: () => {
        return httpURL.get('alugueis')
    },
    getlistbooks: () => {
        return httpURL.get('livros')
    },

    
}