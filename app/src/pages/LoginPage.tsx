import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, LockKeyhole, UserRound } from 'lucide-react'
import { STAFF_OPTIONS } from '@/lib/constants'
import { useAdviserStore } from '@/stores/adviserStore'

export function LoginPage() {
  const [staffName, setStaffName] = useState('')
  const selectAdviser = useAdviserStore((state) => state.selectAdviser)
  const navigate = useNavigate()

  const enterWorkspace = (event: React.FormEvent) => {
    event.preventDefault()
    if (selectAdviser(staffName)) navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4efe5] p-4 text-[#10233d] sm:p-8">
      <div className="grid w-full max-w-[75rem] overflow-hidden rounded-[1.4rem] border border-[#bd8f32] bg-[#f8f3e9] shadow-[0_26px_70px_rgba(16,35,61,0.17)] lg:min-h-[46rem] lg:grid-cols-[40%_60%]">
        <aside className="relative isolate flex min-h-[18rem] overflow-hidden bg-[#071b36] px-8 py-9 text-white sm:px-12 lg:min-h-full lg:px-16 lg:py-16">
          <div className="absolute inset-0 -z-10 opacity-50" aria-hidden="true">
            <div className="absolute left-[-18%] top-[18%] h-px w-[135%] rotate-[-1deg] bg-[#bc943f]/20" />
            <div className="absolute left-[-12%] top-[26%] h-px w-[125%] rotate-[1deg] bg-[#bc943f]/15" />
            <div className="absolute left-[-20%] top-[36%] h-px w-[135%] rotate-[-2deg] bg-[#bc943f]/20" />
            <div className="absolute left-[-10%] top-[48%] h-px w-[130%] rotate-[2deg] bg-[#bc943f]/15" />
            <div className="absolute left-[-18%] top-[62%] h-px w-[140%] rotate-[-1deg] bg-[#bc943f]/20" />
            <div className="absolute left-[-12%] top-[76%] h-px w-[130%] rotate-[2deg] bg-[#bc943f]/15" />
          </div>
          <div className="absolute -right-[13.5rem] -top-24 h-[60rem] w-[25rem] rounded-[50%] border-2 border-[#c89d43]" aria-hidden="true" />

          <div className="relative flex w-full flex-col">
            <div className="flex items-center gap-4 border-b border-[#c89d43]/30 pb-7">
              <span className="font-serif text-5xl leading-none text-[#d7ad5b] sm:text-6xl">ASG</span>
              <span className="h-14 w-px bg-[#d7ad5b]/50" aria-hidden="true" />
              <span className="text-[0.65rem] font-semibold uppercase leading-[1.65] tracking-[0.28em] text-white/90">Amplify<br />Solutions<br />Group</span>
            </div>

            <div className="my-auto py-10 text-center lg:py-16">
              <h1 aria-label="SMSF Growth Comparison" className="font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-[3.75rem]">
                <span className="block">SMSF Growth</span>
                <span className="block">Comparison</span>
              </h1>
              <p className="mx-auto mt-7 max-w-xs font-serif text-xl italic leading-7 text-[#d7ad5b]">Compare. Clarify.<br className="hidden lg:block" /> Plan with confidence.</p>
              <p className="mx-auto mt-7 max-w-sm text-sm leading-6 text-white/70">A clear, adviser-led view of long-term superannuation outcomes.</p>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="w-full max-w-[35rem] text-center">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.38em] text-[#926a22]">SMSF comparison</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Start Your Comparison</h2>

            <div className="mx-auto my-7 flex max-w-[17rem] items-center gap-4 text-[#b48935]" aria-hidden="true">
              <span className="h-px flex-1 bg-[#d8c79f]" />
              <LockKeyhole className="h-4 w-4" />
              <span className="h-px flex-1 bg-[#d8c79f]" />
            </div>

            <p className="text-sm leading-6 text-[#42536a]">Select your name, then enter the workspace to begin a new comparison.</p>

            <form onSubmit={enterWorkspace} className="mt-7">
              <div className="rounded-2xl border border-[#ded4c2] bg-[#fffdf9] p-5 text-left shadow-[0_12px_28px_rgba(16,35,61,0.08)] sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10233d] text-white">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="staff-name" className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#167a5a]">Adviser name</label>
                    <div className="relative">
                      <select id="staff-name" value={staffName} onChange={(event) => setStaffName(event.target.value)} className="min-h-12 w-full appearance-none rounded-lg border border-[#d8cdb9] bg-white px-4 pr-10 text-sm font-semibold text-[#10233d] shadow-sm transition hover:border-[#b58b38] focus:border-[#b58b38]">
                        {STAFF_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#10233d]" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={!staffName} className="group mt-10 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#b98b32] bg-gradient-to-r from-[#b88b36] to-[#d4ad61] px-5 text-xs font-bold uppercase tracking-[0.2em] text-[#071b36] shadow-[0_13px_28px_rgba(151,108,31,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(151,108,31,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">
                Enter Workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
