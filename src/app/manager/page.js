"use client";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { FileIcon, TrashIcon } from "@radix-ui/react-icons";
import { BarLoader } from "react-spinners";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CardContent, Card } from "@/components/ui/card";

// Constants
import { TOKEN, USER_ID, USER_EMAIL } from "@/constants/auth";

// Services
import {
  enqueueFileToConvert,
  getAllUserFiles,
  getFileStatus,
  getFileBlob,
  deleteFile,
} from "@/services/file";

// Utils
import { downloadFile } from "@/lib/file";

const Manager = () => {
  const router = useRouter();
  const fileInput = useRef();

  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await getAllUserFiles();
        const filesWithAttempts = response.map((file) => ({
          ...file,
          attempts: 0,
        }));
        setFiles(filesWithAttempts);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchFiles();
  }, [revision]);

  useEffect(() => {
    const checkFileStatus = async () => {
      const updatedFiles = [...files]; // Create a copy of the files array
      for (let i = 0; i < updatedFiles.length; i++) {
        if (
          updatedFiles[i].status === "uploaded" &&
          updatedFiles[i].attempts < 10
        ) {
          try {
            const status = await getFileStatus(updatedFiles[i].celery_task_id);
            if (status !== "uploaded") {
              updatedFiles[i] = status; // Replace the file with the new status
            } else {
              updatedFiles[i].attempts += 1; // Increment attempts
            }
          } catch (error) {
            console.error("Error:", error);
          }
        }
      }
      setFiles(updatedFiles); // Update the files state
    };

    // Start polling
    const intervalId = setInterval(checkFileStatus, 5000); // Poll every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [files, revision]);

  useLayoutEffect(() => {
    const isAuth = secureLocalStorage.getItem(TOKEN);
    if (!isAuth) {
      redirect("/");
    }
  }, []);

  const handleLogout = () => {
    secureLocalStorage.removeItem(TOKEN);
    secureLocalStorage.removeItem(USER_ID);
    secureLocalStorage.removeItem(USER_EMAIL);
    router.push("/");
  };

  const handleUploadFile = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await enqueueFileToConvert(formData, file.type);
        console.log("Response:", response);
        setRevision(revision + 1);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fileInput.current.value = "";
  };

  const handleDownload = async (fileName) => {
    try {
      const blob = await getFileBlob(fileName);
      downloadFile(blob, fileName);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFile(id);
      setRevision(revision + 1);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderFile = (file) => {
    const isProcessed = file.status === "processed";
    return (
      <div className="flex items-center gap-4">
        <FileIcon className="h-6 w-6" />
        <div className="flex flex-1 items-center justify-between">
          <span className="text-sm font-medium">{`${file.filename}.${file.original_extension}`}</span>
          {isProcessed ? (
            <div className="flex gap-4">
              <Button
                size="sm"
                onClick={() =>
                  handleDownload(`${file.filename}.${file.new_extension}`)
                }
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(file.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <BarLoader color="#36d7b7" />
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-10 gap-4 lg:gap-8 xl:gap-12">
      <div className="grid max-w-3xl w-full gap-4 lg:gap-8">
        <div className="grid grid-cols-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Document Conversion</h1>
            <p className="text-gray-500">
              Convert your DOCX, PPTX, XLSX, and ODT files to PDF
            </p>
          </div>
          <div className="flex justify-end items-center">
            <Button onClick={handleLogout} className="w-40">
              Salir
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <div className="flex flex-col gap-2">
              <Label className="text-base">Select file to convert</Label>
              <small className="text-sm text-gray-500">
                Supported file types: DOCX, PPTX, XLSX, ODT
              </small>
            </div>
            <Input
              accept=".docx,.pptx,.xlsx,.odt"
              id="file"
              type="file"
              ref={fileInput}
              onChange={handleUploadFile}
              className="cursor-pointer"
            />
            {loading && (
              <div className="w-full flex justify-center my-10">
                <BarLoader color="#36d7b7" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <div className="flex flex-col gap-2">
              <Label className="text-base">Conversion progress</Label>
            </div>
            <div className="flex flex-col gap-6 mt-5">
              {files.map((file) => (
                <div key={file.id}>{renderFile(file)}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Manager;
