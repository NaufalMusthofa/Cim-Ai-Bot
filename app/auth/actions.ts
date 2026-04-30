"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/env";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function toAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek inbox lalu klik link konfirmasi dari Supabase, atau matikan Email Confirmations di dashboard Supabase untuk mode development.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Email atau password salah, atau akun belum bisa dipakai karena email belum dikonfirmasi.";
  }

  if (normalized.includes("user already registered")) {
    return "Email ini sudah terdaftar. Coba langsung login atau reset password.";
  }

  if (normalized.includes("email rate limit exceeded")) {
    return "Batas kirim email Supabase sedang tercapai. Ini biasanya terjadi karena Email Confirmations masih aktif dan Anda sudah terlalu sering mencoba daftar. Matikan Confirm Email untuk development, atau tunggu quota email Supabase reset lalu coba lagi.";
  }

  return message;
}

function isDevelopmentMode() {
  return process.env.NODE_ENV !== "production";
}

async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function autoConfirmExistingUser(email: string) {
  const admin = createAdminClient();
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    return false;
  }

  const { error } = await admin.auth.admin.updateUserById(existingUser.id, {
    email_confirm: true
  });

  if (error) {
    throw error;
  }

  return true;
}

async function createOrUpdateDevelopmentUser(input: {
  email: string;
  password: string;
  businessName: string;
}) {
  const admin = createAdminClient();
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    const { error } = await admin.auth.admin.updateUserById(existingUser.id, {
      email_confirm: true,
      password: input.password,
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        business_name: input.businessName
      }
    });

    if (error) {
      throw error;
    }

    return existingUser;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      business_name: input.businessName
    }
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient();

  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (isDevelopmentMode() && error.message.toLowerCase().includes("email not confirmed")) {
      try {
        const updated = await autoConfirmExistingUser(email);

        if (updated) {
          const retry = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (!retry.error) {
            redirect("/dashboard");
          }
        }
      } catch (adminError) {
        const message = adminError instanceof Error ? adminError.message : error.message;
        redirect(`/auth?error=${encodeURIComponent(toAuthErrorMessage(message))}`);
      }
    }

    redirect(`/auth?error=${encodeURIComponent(toAuthErrorMessage(error.message))}`);
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();

  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");
  const businessName = getFormValue(formData, "businessName");

  if (isDevelopmentMode()) {
    try {
      await createOrUpdateDevelopmentUser({
        email,
        password,
        businessName
      });

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        redirect(`/auth?error=${encodeURIComponent(toAuthErrorMessage(signInError.message))}`);
      }

      redirect("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown signup error";
      redirect(`/auth?error=${encodeURIComponent(toAuthErrorMessage(message))}`);
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}/dashboard`,
      data: {
        business_name: businessName
      }
    }
  });

  if (error) {
    redirect(`/auth?error=${encodeURIComponent(toAuthErrorMessage(error.message))}`);
  }

  if (!data.session) {
    redirect(
      "/auth?message=Akun berhasil dibuat, tetapi email harus dikonfirmasi dulu. Cek inbox email Anda untuk link verifikasi dari Supabase."
    );
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
