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
    baseURL: "https://back-taller4-vf-t357ujhuea-uc.a.run.app/:8000",
    headers: createHeaders(),
  });
};
