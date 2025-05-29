'use client'

import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './_actions'

const PLANS = ["Basic", "Hobbyist", "Advanced", "Professional"] as const

export default function OnboardingComponent() {
    const [error, setError] = React.useState('')
    const [role, setRole] = React.useState<'Customer' | 'Creator'>('Customer')
    const [plan, setPlan] = React.useState<typeof PLANS[number] | ''>('')
    const { user, isLoaded } = useUser()
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        // Add role and plan to formData
        formData.set('role', role)
        if (role === 'Creator') {
            formData.set('plan', plan)
        } else {
            formData.set('plan', '')
        }
        const res = await completeOnboarding(formData)
        if (res?.message) {
            await user?.reload()
            router.push('/')
        }
        if (res?.error) {
            setError(res?.error)
        }
    }

    return (
        <div className="flex flex-col w-screen px-6 md:px-12 items-center justify-center">
            <h2 className='flex mt-24'>Hey{isLoaded ? `, ${user?.firstName}` : ""}</h2>
            <form className='flex flex-col' action={handleSubmit}>
                <div className='flex flex-col'>
                    <label>Would you like to be a Creator?</label>
                    <div className="flex gap-4 mt-2">
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="Creator"
                                checked={role === 'Creator'}
                                onChange={() => setRole('Creator')}
                            />
                            Yes, I'm here to create!
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="Customer"
                                checked={role === 'Customer'}
                                onChange={() => setRole('Customer')}
                            />
                            No thanks.
                        </label>
                    </div>
                </div>

                {role === 'Creator' && (
                    <div className="flex flex flex-col mt-4">
                        <label>Choose your Creator Plan:</label>
                        <select
                            name="plan"
                            required={role === 'Creator'}
                            value={plan}
                            onChange={e => setPlan(e.target.value as typeof PLANS[number])}
                        >
                            <option value="" disabled>
                                Select a plan
                            </option>
                            {PLANS.map(p => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* <div className="mt-6">
          <label>Application Name</label>
          <p>Enter the name of your application.</p>
          <input type="text" name="applicationName" required />
        </div>

        <div>
          <label>Application Type</label>
          <p>Describe the type of your application.</p>
          <input type="text" name="applicationType" required />
        </div> */}
                {error && <p className="text-red-600">Error: {error}</p>}
                <button type="submit" className="mt-4">Submit</button>
            </form>
        </div>
    )
}