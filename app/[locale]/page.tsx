// Landing page - redirects to dashboard or sign in
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(`/${locale}/dashboard`)
  } else {
    redirect(`/${locale}/auth/signin`)
  }
}
