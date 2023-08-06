import axios from 'axios'

export const httpURL = axios.create({
    baseURL:'http://wdaw.hopto.org:8185/api/'
})