import { useState, type FormEvent } from 'react'
import useStudentStore from '../../store/StudentStore'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate();

    const login = useStudentStore((state) => state.login)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(event.currentTarget)
        const response = await login(String(formData.get("email")), String(formData.get("password")));

        if (response) {
            navigate("/home")
        }
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                />
            </div>
            <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password</label>
                    <span className="text-xs text-slate-500">Use your local demo account</span>
                </div>
                <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#47735f] focus:ring-2 focus:ring-[#47735f]/20"
                />
            </div>

            <div className='flex items-center justify-between'>
                <p
                    onClick={() => navigate("/reset-password")}
                    className='font-medium text-red-500 underline cursor-pointer'>Forget Password ?
                </p>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-[#315d4a] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#244b3b] focus:outline-none focus:ring-2 focus:ring-[#47735f] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70">
                {isSubmitting ? 'Signing in...' : 'Log in to your account'}
            </button>
        </form>
    )
}

export default Login;