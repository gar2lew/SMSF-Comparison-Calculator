// Supabase Edge Function: generate-pdf
// Deploy: npx supabase functions deploy generate-pdf
// 
// Generates professional adviser-quality PDF reports from projection data.
// Deploys: supabase functions deploy generate-pdf

import { createClient } from 'npm:@supabase/supabase-js@2'

// --- Handlebars is lightweight and works well in Deno ---
// @deno-types="npm:@types/handlebars@4"
import Handlebars from 'npm:handlebars@4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ---------------------------------------------------------------------------
// HTML Template (inline — in production, load from Storage or import)
// ---------------------------------------------------------------------------
const reportTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{title}}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1a202c;
      font-size: 12px;
      line-height: 1.5;
      padding: 48px;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 3px solid {{accentColor}};
    }
    .header h1 { color: {{accentColor}}; font-size: 24px; margin-bottom: 4px; }
    .header p { color: #64748b; font-size: 13px; }
    .meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      font-size: 11px;
    }
    .meta div span { color: #64748b; }
    .meta div strong { display: block; font-size: 13px; }
    .section { margin-bottom: 24px; }
    .section h2 {
      font-size: 16px;
      color: {{accentColor}};
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e2e8f0;
    }
    .comparison-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .comparison-card {
      flex: 1;
      padding: 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .comparison-card.left { border-left: 3px solid #3498db; }
    .comparison-card.right { border-left: 3px solid {{accentColor}}; }
    .comparison-card h3 { font-size: 14px; margin-bottom: 8px; }
    .stat-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
    .stat-row .label { color: #64748b; }
    .stat-row .value { font-weight: 600; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th {
      background: #f1f5f9;
      padding: 8px 6px;
      text-align: right;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
    }
    th:first-child { text-align: left; }
    td {
      padding: 6px;
      text-align: right;
      border-bottom: 1px solid #f1f5f9;
    }
    td:first-child { text-align: left; font-weight: 500; }
    .winner-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .winner-badge.win { background: #ecfdf5; color: #065f46; }
    .winner-badge.lose { background: #fef2f2; color: #7f1d1d; }
    .notes { background: #fefce8; padding: 12px 16px; border-radius: 8px; font-size: 11px; margin-top: 12px; }
    .disclaimer {
      margin-top: 32px;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 6px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      padding: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{firmName}}</h1>
    <p>{{reportType}} — Prepared for {{clientName}}</p>
  </div>

  <div class="meta">
    <div>
      <span>Client</span>
      <strong>{{clientName}}</strong>
    </div>
    <div>
      <span>Date</span>
      <strong>{{reportDate}}</strong>
    </div>
    <div>
      <span>Prepared by</span>
      <strong>{{adviserName}}</strong>
    </div>
    <div>
      <span>Projection</span>
      <strong>{{projectionName}}</strong>
    </div>
  </div>

  <div class="section">
    <h2>Comparison Summary</h2>
    <div class="winner-badge {{winnerClass}}">{{winnerText}}</div>
    <div class="comparison-grid">
      <div class="comparison-card left">
        <h3>{{scenarioAName}} ({{scenarioAFundType}})</h3>
        <div class="stat-row"><span class="label">Final Balance</span><span class="value">{{scenarioAFinal}}</span></div>
        <div class="stat-row"><span class="label">Growth</span><span class="value">{{scenarioAGrowth}}</span></div>
        <div class="stat-row"><span class="label">Growth %</span><span class="value">{{scenarioAGrowthPct}}</span></div>
        <div class="stat-row"><span class="label">Years</span><span class="value">{{scenarioAYears}}</span></div>
        <div class="stat-row"><span class="label">Growth Rate</span><span class="value">{{scenarioAGrowthRate}}</span></div>
      </div>
      <div class="comparison-card right">
        <h3>{{scenarioBName}} ({{scenarioBFundType}})</h3>
        <div class="stat-row"><span class="label">Final Balance</span><span class="value">{{scenarioBFinal}}</span></div>
        <div class="stat-row"><span class="label">Growth</span><span class="value">{{scenarioBGrowth}}</span></div>
        <div class="stat-row"><span class="label">Growth %</span><span class="value">{{scenarioBGrowthPct}}</span></div>
        <div class="stat-row"><span class="label">Years</span><span class="value">{{scenarioBYears}}</span></div>
        <div class="stat-row"><span class="label">Growth Rate</span><span class="value">{{scenarioBGrowthRate}}</span></div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Year-by-Year Projection</h2>
    <p style="color:#64748b; font-size:11px; margin-bottom:8px">
      Comparison period: {{yearsCompared}} years
    </p>
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>{{scenarioAName}} Balance</th>
          <th>{{scenarioBName}} Balance</th>
          <th>Difference</th>
          <th>Employer Contrib (A)</th>
          <th>Employer Contrib (B)</th>
        </tr>
      </thead>
      <tbody>
        {{#each yearlyRows}}
        <tr>
          <td>{{year}}</td>
          <td>{{balanceA}}</td>
          <td>{{balanceB}}</td>
          <td style="font-weight:600; color:{{diffColor}}">{{diff}}</td>
          <td>{{empA}}</td>
          <td>{{empB}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  {{#if notes}}
  <div class="notes">
    <strong>Adviser Notes:</strong><br />
    {{notes}}
  </div>
  {{/if}}

  <div class="disclaimer">
    {{disclaimerText}}
  </div>

  <div class="footer">
    {{firmName}} — SMSF Projection Workspace — Page 1 of 1
  </div>
</body>
</html>`

const template = Handlebars.compile(reportTemplate)

// ---------------------------------------------------------------------------
// Utility: Format AUD
// ---------------------------------------------------------------------------
function fmtAUD(n: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(n)
}

function fmtPct(n: number): string {
  return `${new Intl.NumberFormat('en-AU', { maximumFractionDigits: 2 }).format(n)}%`
}

// ---------------------------------------------------------------------------
// Helper: Run calculation (server-side mirror of calculator.ts)
// ---------------------------------------------------------------------------
interface ScenarioData {
  current_balance: number
  salary: number
  employer_rate: number
  growth_rate: number
  projection_years: number
  salary_sacrifice_enabled: boolean
  salary_sacrifice_percent: number
  fund_type: string
  name: string
}

function projectSeries(s: ScenarioData) {
  const ssRate = s.salary_sacrifice_enabled ? Math.min(Math.max((s.salary_sacrifice_percent || 0) / 100, 0), 1) : 0
  const emp = s.salary * s.employer_rate
  const ss = s.salary * ssRate
  const annual = emp + ss

  let bal = s.current_balance
  const series: number[] = [bal]
  const empSeries: number[] = [0]
  let runningEmp = 0

  for (let y = 1; y <= s.projection_years; y++) {
    bal += annual
    bal = bal * (1 + s.growth_rate)
    series.push(bal)
    runningEmp += emp
    empSeries.push(emp)
  }

  return {
    finalBalance: bal,
    growthAmount: bal - s.current_balance,
    growthPercent: s.current_balance > 0 ? ((bal - s.current_balance) / s.current_balance) * 100 : 0,
    series,
    empSeries,
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { projection_id, scenario_a_id, scenario_b_id } = body

    if (!projection_id || !scenario_a_id || !scenario_b_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create report record
    const { data: report, error: reportErr } = await supabase
      .from('reports')
      .insert({
        projection_id,
        adviser_id: user.id,
        report_type: 'comparison',
        status: 'generating',
      })
      .select()
      .single()

    if (reportErr) throw new Error(`Failed to create report: ${reportErr.message}`)

    // Fetch all data
    const [{ data: projection }, { data: scenarioA }, { data: scenarioB }, { data: client }, { data: profile }, { data: settings }] = await Promise.all([
      supabase.from('projections').select('*').eq('id', projection_id).single(),
      supabase.from('scenarios').select('*').eq('id', scenario_a_id).single(),
      supabase.from('scenarios').select('*').eq('id', scenario_b_id).single(),
      supabase.from('clients').select('*').eq('id', (await supabase.from('projections').select('client_id').eq('id', projection_id).single()).data?.client_id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('company_settings').select('*').eq('adviser_id', user.id).single(),
    ])

    if (!projection || !scenarioA || !scenarioB) {
      throw new Error('Projection or scenarios not found')
    }

    const clientData = client as { first_name: string; last_name: string } | null
    const profileData = profile as { full_name: string } | null
    const settingsData = settings as { firm_name?: string; primary_color?: string; disclaimer_text?: string } | null

    const sa = scenarioA as ScenarioData
    const sb = scenarioB as ScenarioData

    const resA = projectSeries(sa)
    const resB = projectSeries(sb)
    const years = Math.min(sa.projection_years, sb.projection_years)

    const winner = resA.finalBalance > resB.finalBalance ? 'a' : resA.finalBalance < resB.finalBalance ? 'b' : 'tie'
    const deltaFinal = resB.finalBalance - resA.finalBalance

    const yearlyRows = Array.from({ length: years + 1 }, (_, i) => {
      const balA = resA.series[i] || 0
      const balB = resB.series[i] || 0
      const diff = balB - balA
      return {
        year: i === 0 ? 'Start' : `Year ${i}`,
        balanceA: fmtAUD(balA),
        balanceB: fmtAUD(balB),
        diff: i === 0 ? '—' : `${diff >= 0 ? '+' : ''}${fmtAUD(diff)}`,
        diffColor: i === 0 ? '#94a3b8' : diff >= 0 ? '#059669' : '#e53e3e',
        empA: i === 0 ? '—' : fmtAUD(resA.empSeries[i] || 0),
        empB: i === 0 ? '—' : fmtAUD(resB.empSeries[i] || 0),
      }
    })

    const clientName = clientData ? `${clientData.first_name} ${clientData.last_name}` : 'Unknown Client'
    const firmName = settingsData?.firm_name || profileData?.full_name || 'ASG Partners'
    const accentColor = settingsData?.primary_color || '#10b981'

    const winnerText = winner === 'tie'
      ? 'No difference at final year'
      : `${winner === 'a' ? sa.name : sb.name} leads by ${fmtAUD(Math.abs(deltaFinal))}`

    const html = template({
      title: `Projection Report — ${clientName}`,
      firmName,
      accentColor,
      reportType: 'Comparison Report',
      reportDate: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
      clientName,
      adviserName: profileData?.full_name || 'Adviser',
      projectionName: projection.name,
      scenarioAName: sa.name,
      scenarioBName: sb.name,
      scenarioAFundType: sa.fund_type === 'smsf' ? 'SMSF' : 'Current Fund',
      scenarioBFundType: sb.fund_type === 'smsf' ? 'SMSF' : 'Current Fund',
      scenarioAFinal: fmtAUD(resA.finalBalance),
      scenarioBFinal: fmtAUD(resB.finalBalance),
      scenarioAGrowth: fmtAUD(resA.growthAmount),
      scenarioBGrowth: fmtAUD(resB.growthAmount),
      scenarioAGrowthPct: fmtPct(resA.growthPercent),
      scenarioBGrowthPct: fmtPct(resB.growthPercent),
      scenarioAYears: String(sa.projection_years),
      scenarioBYears: String(sb.projection_years),
      scenarioAGrowthRate: fmtPct(sa.growth_rate * 100),
      scenarioBGrowthRate: fmtPct(sb.growth_rate * 100),
      winnerClass: winner === 'a' ? 'win' : winner === 'b' ? 'win' : 'lose',
      winnerText,
      yearsCompared: years,
      yearlyRows,
      notes: (projection as { notes?: string }).notes || null,
      disclaimerText: settingsData?.disclaimer_text || 'This report is illustrative only and does not constitute financial advice.',
    })

    // For now, generate HTML-to-PDF using a simple approach (in production, use Playwright/Gotenberg)
    // Store the HTML report in Storage and return it
    const fileName = `projection-${projection_id}-${Date.now()}.html`
    const filePath = `${user.id}/${projection_id}/${fileName}`

    const { error: uploadErr } = await supabase.storage
      .from('reports')
      .upload(filePath, html, { contentType: 'text/html', upsert: true })

    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`)

    const { data: publicUrlData } = supabase.storage.from('reports').getPublicUrl(filePath)

    await supabase.from('reports').update({
      status: 'generated',
      file_path: filePath,
      file_name: fileName,
      file_size: new Blob([html]).size,
    }).eq('id', (report as { id: string }).id)

    await supabase.from('activity_log').insert({
      entity_type: 'projection',
      entity_id: projection_id,
      adviser_id: user.id,
      activity_type: 'exported',
      description: 'Comparison report generated',
    })

    return new Response(JSON.stringify({
      reportId: (report as { id: string }).id,
      fileUrl: publicUrlData?.publicUrl || '',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('PDF generation error:', err)
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
