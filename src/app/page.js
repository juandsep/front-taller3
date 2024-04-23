"use client";

import { useState, useLayoutEffect } from "react";
import { redirect } from "next/navigation";
import secureLocalStorage from "react-secure-storage";

import { Button } from "@/components/ui/button";
import UserForm from "@/components/forms/UserForm";

import { signin, signup } from "@/services/auth";

import { TOKEN, USER_ID, USER_EMAIL } from "@/constants/auth";

export default function Home() {
  const isAuth = secureLocalStorage.getItem(TOKEN);

  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (isCreateMode) {
        await signup(data);
      }
      const result = await signin(data);
      console.log("result: ", result);
      
      secureLocalStorage.setItem(TOKEN, result.access_token);
      secureLocalStorage.setItem(USER_ID, result.user.id);
      secureLocalStorage.setItem(USER_EMAIL, result.user.email);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (isAuth) {
      redirect("/manager");
    }
  }, [isAuth]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          {isCreateMode ? (
            <h1 className="text-2xl font-semibold tracking-tight">
              Crear cuenta
            </h1>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">
                Bienvenido
              </h1>
              <p className="text-sm text-muted-foreground">
                Inicia sesión para continuar
              </p>
            </>
          )}
        </div>
        <UserForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          isCreateMode={isCreateMode}
        />
        {isCreateMode ? (
          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿Tienes cuenta?
            <Button variant="link" onClick={() => setIsCreateMode(false)}>
              <b className="hover:text-brand underline underline-offset-4">
                Inicia sesión.
              </b>
            </Button>
          </p>
        ) : (
          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?
            <Button variant="link" onClick={() => setIsCreateMode(true)}>
              <b className="hover:text-brand underline underline-offset-4">
                Crea una.
              </b>
            </Button>
          </p>
        )}
      </div>
    </main>
  );
}
