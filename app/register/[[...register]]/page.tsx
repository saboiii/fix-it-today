import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'

function SignUpPage() {
  return (
    <div className='flex w-screen h-screen items-center justify-center'>
        <SignUp.Root>
            <Clerk.Loading>
                {(isGlobalLoading) => (
                    <>
                     <SignUp.Step name="start">
                        <div className='flex flex-col items-center p-4 bg-text/5 rounded-lg border-[0.5px] border-text/10'>

                        </div>
                     </SignUp.Step>
                    </>
                )}
            </Clerk.Loading>
        </SignUp.Root>
    </div>
  )
}

export default SignUpPage