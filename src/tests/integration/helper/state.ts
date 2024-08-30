import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { Agent } from "http"

const PROVIDER_URL = "http://localhost:5000"

const options = (state, consumer): AxiosRequestConfig => {
  return {
    url: "/api/contract/states",
    baseURL: PROVIDER_URL,
    method: "POST",
    data: {
      consumer,
      state,
    },
    headers: {
      "Content-Type": "application/json",
    },
    httpAgent: new Agent({ keepAlive: false }),
  }
}

export const stateSetup = (state, consumer = "integration-tests") => {
  return axios(options(state, consumer))
}


export const userSetup = (): Promise<AxiosResponse> => {
  return axios({
    url: "/api/contract/test-user",
    baseURL: PROVIDER_URL,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export const apiTokenSetup = (): Promise<AxiosResponse> => {
  return axios({
    url: "/api/contract/api-token",
    baseURL: PROVIDER_URL,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
}
