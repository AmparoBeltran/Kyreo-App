"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { signIn, signUp } from "@/lib/auth";

/** Firebase error codes surfaced in Spanish instead of a raw code string. */
function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Correo o contraseña incorrectos.";
      case "auth/invalid-email":
        return "El correo electrónico no es válido.";
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con este correo.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Inténtalo de nuevo en unos minutos.";
      case "auth/network-request-failed":
        return "Sin conexión. Comprueba tu red e inténtalo de nuevo.";
    }
  }
  return "No se ha podido completar la operación. Inténtalo de nuevo.";
}

export function LoginScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (isRegister && nombre.trim().length < 2) {
      setError("Escribe tu nombre.");
      return;
    }

    setBusy(true);
    try {
      if (isRegister) {
        await signUp(email.trim(), password, nombre.trim());
        toast.success("Cuenta creada. ¡Bienvenido/a!");
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      // Every failure is surfaced. The old forms swallowed errors entirely.
      const message = authErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-svh flex-col justify-center px-4 py-10 pb-safe pt-safe md:grid md:min-h-svh md:grid-cols-2 md:gap-0 md:px-0 md:py-0">
      {/* Brand panel: decorative only, hidden on mobile where space is precious. */}
      <aside className="hidden bg-primary md:flex md:flex-col md:justify-center md:px-12">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={72}
          height={72}
          className="rounded-2xl"
          priority
        />
        <h1 className="mt-8 text-4xl font-semibold text-white">Kyreo</h1>
        <p className="mt-3 max-w-sm text-navy-100">
          La base de datos de diagnósticos y la biblioteca de la escuela, en un solo sitio.
        </p>
      </aside>

      <div className="mx-auto w-full max-w-sm md:flex md:max-w-md md:flex-col md:justify-center md:px-12">
        <div className="md:hidden">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={56}
            height={56}
            className="rounded-xl"
            priority
          />
        </div>

        <h2 className="mt-6 text-2xl font-semibold text-foreground md:mt-0">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRegister
            ? "Regístrate para compartir tus diagnósticos con la clase."
            : "Accede con tu correo y contraseña."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          {isRegister && (
            <Field label="Nombre" required>
              {({ id, describedBy }) => (
                <TextInput
                  id={id}
                  aria-describedby={describedBy}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="name"
                  required
                />
              )}
            </Field>
          )}

          <Field label="Correo electrónico" required>
            {({ id, describedBy }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            )}
          </Field>

          <Field
            label="Contraseña"
            required
            hint={isRegister ? "Mínimo 6 caracteres." : undefined}
            error={error ?? undefined}
          >
            {({ id, describedBy }) => (
              <TextInput
                id={id}
                aria-describedby={describedBy}
                aria-invalid={error ? true : undefined}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
              />
            )}
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Un momento…" : isRegister ? "Crear cuenta" : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              setError(null);
            }}
            className="font-medium text-primary underline underline-offset-4"
          >
            {isRegister ? "Iniciar sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </main>
  );
}
