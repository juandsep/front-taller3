import { createRequest } from "@/lib/axios";

export const signup = async (data) => {
  try {
    const res = await createRequest().post(
      "/auth/signup",
      { username: data.email, password: data.password },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const signin = async (data) => {
  try {
    const res = await createRequest().post(
      "/auth/signin",
      { username: data.email, password: data.password },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};