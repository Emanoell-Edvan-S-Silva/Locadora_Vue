import { httpURL } from "./config";

export default{

    findAllPublishers: () => {
        return httpURL.get('Publishers')
    },

    findByIdPublisher: (publisherId) => {
        console.log(publisherId) 
        return httpURL.get(`Publishers/${publisherId}`)
    },

    createNewPublisher: (publisher) => {
        console.log(publisher)
        return httpURL.post('Publishers', publisher)
    },

    updatePublisher: (publisher) => {
        console.log(publisher) 
        return httpURL.put('Publishers', publisher)
    },
   
    deletePublisher: (publisherId) => {
        console.log(publisherId)
        return httpURL.delete(`Publishers/${publisherId}`)
    }
}