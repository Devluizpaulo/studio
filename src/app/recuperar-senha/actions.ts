
"use server"

import { z } from "zod";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const emailSchema = z.string().email("Por favor, insira um e-mail válido.");

type Result =
  | { success: true }
  | { success: false; error: string };

export async function sendPasswordResetEmailAction(email: string): Promise<Result> {
  const parsedEmail = emailSchema.safeParse(email);

  if (!parsedEmail.success) {
    return { success: false, error: "Formato de e-mail inválido." };
  }

  try {
    await sendPasswordResetEmail(auth, parsedEmail.data);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao enviar e-mail de recuperação:", error.code);
    let userFriendlyError = "Ocorreu uma falha. Tente novamente mais tarde.";

    if (error.code === 'auth/user-not-found') {
      userFriendlyError = "Nenhum usuário encontrado com este e-mail. Verifique o e-mail digitado.";
    } else if (error.code === 'auth/too-many-requests') {
        userFriendlyError = "Muitas tentativas foram feitas. Tente novamente mais tarde.";
    }

    return { success: false, error: userFriendlyError };
  }
}
