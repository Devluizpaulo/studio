"use server"

import { z } from "zod"
import { db, auth } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateEmail } from "firebase/auth";


const updateProfileSchema = z.object({
  uid: z.string(),
  fullName: z.string().min(3, "O nome completo é obrigatório."),
  oab: z.string().min(2, "O número da OAB é obrigatório.").optional(),
  legalSpecialty: z.array(z.string()).optional(),
  office: z.string().min(2, "O nome do escritório é obrigatório.").optional(),
  bio: z.string().optional(),
})

type Result =
  | { success: true }
  | { success: false; error: string }

export async function updateProfileAction(
  input: z.infer<typeof updateProfileSchema>
): Promise<Result> {
  const parsedInput = updateProfileSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    const { uid, ...profileData } = parsedInput.data
    
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
        ...profileData
    });

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return { success: false, error: "Falha ao atualizar o perfil. Tente novamente." }
  }
}

// --- Action to update just the photo URL ---
const updateProfilePhotoSchema = z.object({
    uid: z.string(),
    photoUrl: z.string().url("A URL da foto é inválida."),
});

export async function updateProfilePhotoAction(
    input: z.infer<typeof updateProfilePhotoSchema>
): Promise<Result> {
    const parsedInput = updateProfilePhotoSchema.safeParse(input);
    if (!parsedInput.success) {
        return { success: false, error: "Input de foto inválido." };
    }
    try {
        const { uid, photoUrl } = parsedInput.data;
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, { photoUrl: photoUrl });
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar a foto do perfil:", error);
        return { success: false, error: "Falha ao atualizar a foto." };
    }
}


// --- Action to change password ---
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

export async function changePasswordAction(
  input: z.infer<typeof changePasswordSchema>
): Promise<Result> {
  const parsedInput = changePasswordSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Input de senha inválido." };
  }

  const user = auth.currentUser;
  if (!user || !user.email) {
    return { success: false, error: "Usuário não autenticado." };
  }

  try {
    const { currentPassword, newPassword } = parsedInput.data;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    // Re-authenticate the user
    await reauthenticateWithCredential(user, credential);
    
    // Update the password
    await updatePassword(user, newPassword);

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { success: false, error: "A senha atual está incorreta." };
    }
    return { success: false, error: "Falha ao alterar a senha. Tente novamente." };
  }
}

// --- Action to change email ---
const changeEmailSchema = z.object({
  newEmail: z.string().email(),
  currentPassword: z.string(),
});

export async function changeEmailAction(
  input: z.infer<typeof changeEmailSchema>
): Promise<Result> {
  const parsedInput = changeEmailSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Input de e-mail inválido." };
  }

  const user = auth.currentUser;
  if (!user || !user.email) {
    return { success: false, error: "Usuário não autenticado." };
  }

  try {
    const { newEmail, currentPassword } = parsedInput.data;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    // Re-authenticate user
    await reauthenticateWithCredential(user, credential);

    // Update email in Auth
    await updateEmail(user, newEmail);

    // Update email in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { email: newEmail });

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao alterar e-mail:", error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { success: false, error: "A senha atual está incorreta." };
    }
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: "Este e-mail já está em uso por outra conta." };
    }
    return { success: false, error: "Falha ao alterar o e-mail. Tente novamente." };
  }
}
