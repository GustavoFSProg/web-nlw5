import axios from 'axios'

const api = axios.create({
  // baseURL: 'http://localhost:8000/',
  baseURL: 'https://api-nlw5.herokuapp.com/',
})

export default api
