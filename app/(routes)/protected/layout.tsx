// layoutProtected.tsx

import { auth } from "@/auth";
import BackGround from "@/src/components/UI/BackGround";
import ProtectedHeaderWrapper from "@/src/components/protectedHeader/ProtectedHeaderWrapper";
import ProfileInitializer from "@/src/components/welcomePageNavBar/ProfileInitializer/ProfileInitializer";
import { redirect } from "next/navigation";

const layoutProtected = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // On met la vérif de session dans le layout pour que la vérif s'effectue sur toutes les pages routées (protected)
  const session = await auth(); // Vérifie si l'utilisateur est authentifié

  if (!session) {
    redirect("/"); // Redirige vers la page d'acceuil si l'utilisateur n'est pas authentifié
  }

  return (
    <main className="relative flex flex-col items px-1 md:px-2 lg:px-7 xl:px-20 gap-8 min-h-screen w-full max-w-screen-2xl text-textBlack ">
      <ProfileInitializer session={session} />
      <BackGround />
      <ProtectedHeaderWrapper />
      <div>{children}</div>
    </main>
  );
};

export default layoutProtected;
