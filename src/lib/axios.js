import axios from "axios";
import secureLocalStorage from "react-secure-storage";

export const createHeaders = () => {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${secureLocalStorage.getItem("token")}`,
  };
};

export const createRequest = () => {
  return axios.create({
    baseURL: "http://35.196.188.171:8000",
    headers: createHeaders(),
  });
};
