'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = await auth()

  if (!userId) {
    return { message: 'No Logged In User' }
  }

  const client = await clerkClient()

  const role = formData.get('role') as string
  const plan = formData.get('plan') as string | null


  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        role,
        plan: role === "Creator" ? plan : null,
      },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { error: 'There was an error updating the user metadata.' }
  }
}