import { useState } from 'react'
import { ArrowRight, BriefcaseBusiness, LockKeyhole, UserRound } from 'lucide-react'
import { STAFF_OPTIONS } from '@/lib/constants'

export function LoginPage() {
  const [staffName, setStaffName] = useState('')

  return (
    <div className="min-h-screen bg-[#f5f1e9] p-4 text-[#10233d] sm:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#c8a34f]/60 bg-[#fffdf8] shadow-[0_24px_70px_rgba(16,35,61,0.16)]">
        <aside className="relative hidden w-[43%] overflow-hidden bg-[#10233d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-44 -top-32 h-[34rem] w-[34rem] rounded-full border border-[#c8a34f]/50" />
          <div className="absolute -bottom-64 -left-24 h-[34rem] w-[34rem] rounded-full border border-[#c8a34f]/20" />
          <div className="relative">
            <div className="mb-24 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c8a34f] text-[#e2bd68]">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif text-2xl tracking-wide text-[#e2bd68]">ASG</p>
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/70">Partners</p>
              </div>
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#e2bd68]">SMSF comparison</p>
            <h1 className="max-w-sm font-serif text-5xl leading-[1.05] sm:text-6xl">A clearer view of their future.</h1>
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/65">Compare superannuation strategies with confidence, clarity and a conversation-led client experience.</p>
          </div>
          <div className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/65">
            <div><LockKeyhole className="mx-auto mb-2 h-4 w-4 text-[#e2bd68]" /><span>Secure</span></div>
            <div><BriefcaseBusiness className="mx-auto mb-2 h-4 w-4 text-[#e2bd68]" /><span>Professional</span></div>
            <div><ArrowRight className="mx-auto mb-2 h-4 w-4 text-[#e2bd68]" /><span>Simple</span></div>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center p-7 sm:p-14">
          <div className="w-full max-w-md">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10233d] text-[#e2bd68]"><BriefcaseBusiness className="h-4 w-4" /></div>
              <p className="font-serif text-2xl text-[#10233d]">ASG Partners</p>
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#a77b21]">Welcome back</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">Start your comparison</h2>
            <div className="my-7 h-px w-24 bg-[#c8a34f]" />
            <p className="mb-10 text-sm leading-6 text-slate-500">Select your name to open the SMSF comparison workspace.</p>

            <label htmlFor="staff-name" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#10233d]">Your name</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                id="staff-name"
                value={staffName}
                onChange={(event) => setStaffName(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-11 py-4 text-sm text-[#10233d] shadow-sm outline-none transition focus:border-[#c8a34f] focus:ring-2 focus:ring-[#c8a34f]/20"
              >
                {STAFF_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <p className="mt-3 text-xs text-slate-400">All client meetings are conducted in person.</p>

            <button type="button" disabled={!staffName} className="mt-9 flex w-full items-center justify-center gap-3 rounded-xl bg-[#d8bb7b] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#10233d] transition hover:bg-[#c8a34f] disabled:cursor-not-allowed disabled:opacity-50">
              Enter workspace <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-8 text-center text-xs text-slate-400">Authorised adviser access only</p>
          </div>
        </main>
      </div>
    </div>
  )
}
