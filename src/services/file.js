import { createRequest } from "@/lib/axios";

export const enqueueFileToConvert = async (data, type) => {
  const headers = { "Content-Type": type };
  try {
    const res = await createRequest().post("/api/tasks/pdf", data, {
      headers,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getAllUserFiles = async () => {
  try {
    const res = await createRequest().get("/api/tasks/");
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getFileStatus = async (celeryTaskId) => {
  try {
    const res = await createRequest().get(`/api/tasks/status/${celeryTaskId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const getFileBlob = async (fileName) => {
  try {
    const res = await createRequest().get(`/api/files/${fileName}`, {
      responseType: "blob",
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const deleteFile = async (taskId) => {
  try {
    const res = await createRequest().delete(`/api/tasks/${taskId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
}
