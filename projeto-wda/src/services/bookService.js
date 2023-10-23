import { httpURL } from "./config";

export default{
    
    findAllBooks: () => {
        return httpURL.get('Books')
    },
    findByIdBook: (idbook) => {
        console.log(idbook) 
        return httpURL.get(`Books/${idbook}`)
    },                                                                            
    createNewBook: (book) => {
        console.log(book)
        return httpURL.post('Books/', book)
    },
    updateBook: (book) => {
        console.log(book) 
        return httpURL.put('Books/', book)
    }, 

    deleteBook: (idbook) => {
        console.log(idbook)
        return httpURL.delete(`Books/${idbook}`)
    }
}