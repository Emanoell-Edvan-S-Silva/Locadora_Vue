import { httpURL } from "./config";

export default{
    
    getlistbooks: () => {
        return httpURL.get('livros')
    },
    getuniquebook: (idbook) => {
        console.log(idbook) 
        return httpURL.get(`livro/${idbook}`)
    },
    putbookupdate: (book) => {
        console.log(book) 
        return httpURL.put('livro', book)
    },                                                                                  
    postaddbook: (book) => {
        console.log(book)
        return httpURL.post('livro', book)
    },
    deletebook: (book) => {
        console.log(book)
        return httpURL.delete('livro', {data: book})
    }
}