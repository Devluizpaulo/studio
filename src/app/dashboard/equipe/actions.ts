"use server"

import { z } from "zod"
import { db, auth } from "@/lib/firebase-admin" // Using Admin SDK for user creation
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore"

const inviteMemberSchema = z.object({
  fullName: z.string().min(3, "O nome completo é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  role: z.enum(['lawyer', 'secretary'], { required_error: "O cargo é obrigatório."}),
  officeId: z.string(),
  invitingUserId: z.string()
})

type Result =
  | { success: true; data: { userId: string } }
  | { success: false; error: string }

export async function inviteMemberAction(
  input: z.infer<typeof inviteMemberSchema>
): Promise<Result> {
  const parsedInput = inviteMemberSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  const { email, fullName, role, officeId, invitingUserId } = parsedInput.data

  try {
    // 1. Check if the inviting user is a master
    const invitingUserDoc = await db.collection('users').doc(invitingUserId).get();
    if (!invitingUserDoc.exists || invitingUserDoc.data()?.role !== 'master') {
        return { success: false, error: "Apenas administradores podem convidar membros."}
    }

    // 2. Check if email is already in use in Firebase Auth
    try {
        await auth.getUserByEmail(email);
        return { success: false, error: "Este e-mail já está em uso na plataforma." };
    } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
            throw error; // Re-throw unexpected errors
        }
        // This is expected, the user does not exist, so we can proceed.
    }
    
    // 3. Create the user in Firebase Auth with a temporary random password
    // The user will need to reset it.
    const tempPassword = Math.random().toString(36).slice(-10);
    const userRecord = await auth.createUser({
      email: email,
      emailVerified: true, // We can set this to true as the invite comes from a trusted source (admin)
      password: tempPassword,
      displayName: fullName,
      disabled: false,
    });

    // 4. Create the user document in Firestore
    const newUserDoc = {
      uid: userRecord.uid,
      fullName,
      email,
      role,
      officeId,
      oab: role === 'lawyer' ? 'Pendente' : '',
      legalSpecialty: role === 'lawyer' ? 'A definir' : '',
      office: invitingUserDoc.data()?.office, // Inherit office name
      createdAt: new Date(),
    };
    
    await db.collection('users').doc(userRecord.uid).set(newUserDoc);
    
    // TODO: Integrate an email sending service (e.g., SendGrid, Resend) here.
    // Send an email to the new user with their login credentials.
    // For now, the password is logged to the server console for development purposes.
    console.log(`Usuário criado: ${email} com senha temporária: ${tempPassword}.`);
    console.log("Instrua o novo usuário a usar o link 'Esqueci minha senha' na tela de login para definir uma senha segura, ou envie a senha temporária para ele por um canal seguro.");

    // To improve security, you can also send a password reset link instead of a temporary password.
    // const passwordResetLink = await auth.generatePasswordResetLink(email);
    // Then, email this link to the user.

    return { success: true, data: { userId: userRecord.uid } }
  } catch (error) {
    console.error("Erro ao convidar membro:", error)
    // If user creation in Auth succeeded but Firestore failed, we should probably delete the Auth user.
    // This is a more complex transactional logic that can be added later.
    return { success: false, error: "Falha ao convidar membro. Verifique se o e-mail já existe ou tente novamente." }
  }
}
