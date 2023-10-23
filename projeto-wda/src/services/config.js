import axios from 'axios'

export const httpURL = axios.create({
    baseURL:'http://localhost:8080/api/'
})