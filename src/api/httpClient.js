import axios from 'axios'

export function createHttpClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: 15000,
  })

  return client
}
