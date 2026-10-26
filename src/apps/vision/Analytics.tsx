import { Calendar, Factory, Workflow } from 'lucide-react';
import { useState } from 'react';
import { VisionShell } from './Shell';
import {
  CAMERA_STATUS, DEFECT_DIST, DEVICE_STATUS, HEAT_COLS, HEAT_ROWS, HEAT_VALUES, LINE_DEFECTS, LINE_STATUS,
  MATRIX_COLS, MATRIX_POINTS, MATRIX_ROWS, QUALITY, fmtIN, type LineDefect,
} from './data';
import { SearchInput } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { Badge, Illustration } from '../../components/ds/Display';
import { DashCard, KpiCard, StatusCard } from '../../components/ds/Cards';
import { DataTable, type Column } from '../../components/ds/Table';
import { Tabs } from '../../components/ds/Nav';
import { BarChart, BubbleMatrix, Donut, Heatmap, LineChart } from '../../charts/Charts';
import { ChartData, Legend, TipContent } from '../../charts/core';

const opts = (xs: string[]) => xs.map(v => ({ value: v, label: v }));
const pct = (v: number) => (v >= 10 ? `${v}%` : `${v.toFixed(1)}%`);
const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

/** Frame 7 · Analytics (496:16402). Recomputed values keep every chart internally consistent (R-13, R-25). */
export function AnalyticsApp() {
  const [q, setQ] = useState('');
  const [period, setPeriod] = useState('Today');
  const [factory, setFactory] = useState('All Factories');
  const [line, setLine] = useState('All Lines');
  const [category, setCategory] = useState('Primary Back');
  const [view, setView] = useState<'time' | 'factory'>('factory');
  const [weeks, setWeeks] = useState('Last 8 weeks');
  const [ldView, setLdView] = useState<'factory' | 'product' | 'line'>('line');
  const [ldFilter, setLdFilter] = useState('Products');

  const volume = MATRIX_ROWS.map((_, i) => MATRIX_COLS.map((_, j) => MATRIX_POINTS.find(p => p[0] === i && p[1] === j)?.[2] ?? 0));
  const rate = MATRIX_ROWS.map((_, i) => MATRIX_COLS.map((_, j) => MATRIX_POINTS.find(p => p[0] === i && p[1] === j)?.[3] ?? 0));
  const split = (bad: number) => [0.333, 0.306, 0.222, 0.139].map(s => Math.round(bad * s));
  const shares = DEFECT_DIST.map(d => d.label);

  const ldCols: Column<LineDefect & { key: string }>[] = [
    { key: 'line', header: 'Line', minWidth: 140 }, { key: 'product', header: 'Products', minWidth: 280 }, { key: 'factory', header: 'Factory' },
    { key: 'analysed', header: 'Products an.', align: 'num', render: r => fmtIN(r.analysed) },
    { key: 'bad', header: 'Bad products', align: 'num', render: r => fmtIN(Math.round(r.analysed * r.total / 100)) },
    { key: 'front', header: 'Front label', align: 'center', render: r => pct(r.front) }, { key: 'back', header: 'Back label', align: 'center', render: r => pct(r.back) },
    { key: 'carton', header: 'Carton', align: 'center', render: r => pct(r.carton) }, { key: 'cld', header: 'CLD', align: 'center', render: r => pct(r.cld) },
    { key: 'issue', header: 'Main issue', align: 'center', minWidth: 150 }, { key: 'total', header: 'Total defect %', align: 'center', render: r => pct(r.total) },
  ];

  return (
    <VisionShell current="analytics" title="Analytics" icon={<Illustration name="illus.facility-set" crop="factory" size={36} />}
      actions={<>
        <SearchInput width="sm" value={q} onValueChange={setQ} label="Filter factories or units" placeholder="Filter factories or units..." />
        <Select variant="filter" leadIcon={Calendar} className="ds-select--180" label="Period" value={period} onChange={setPeriod} options={opts(['Today', 'Last 7 days', 'Last 30 days'])} searchable={false} />
        <Select variant="filter" leadIcon={Factory} className="ds-select--180" label="Factory" value={factory} onChange={setFactory} options={opts(['All Factories', 'Lotus', 'Herbal', 'RHP'])} searchable={false} />
        <Select variant="filter" leadIcon={Workflow} className="ds-select--180" label="Line" value={line} onChange={setLine} options={opts(['All Lines', 'Bottle Line-1', 'Bottle Line-2', 'Bottle Line-3', 'Norden-1', 'Norden-2'])} searchable={false} />
      </>}>
      <div className="ds-kpi-row app-kpis-6">
        <KpiCard label="Total Factories" value={6} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} />
        <KpiCard label="Lines Running" value="24 / 28" icon={<Illustration name="illus.conveyor-line" crop="conveyor" size={52} />} />
        <KpiCard label="Products an." value={4} icon={<Illustration name="illus.items-analyzed" size={52} fit="cover" />} />
        <KpiCard label="Defect %" value="4%" icon={<Illustration name="illus.defect-rate" size={52} />} />
        <KpiCard label="Cameras Online" value="96 / 112" icon={<Illustration name="illus.facility-set" crop="camera-zoom" size={52} />} />
        <KpiCard label="Devices Online" value="28/28" icon={<Illustration name="illus.facility-set" crop="camera-zoom" size={52} />} />
      </div>

      <DashCard title="Quality Snapshot" right={<>
        <Legend items={[{ label: 'Good Products', color: 'var(--ds-chart-positive)' }, { label: 'Bad Products', color: 'var(--ds-chart-negative)' }]} />
        <Select variant="filter" className="ds-select--180" label="Defect category" value={category} onChange={setCategory} options={opts(['Primary Front', 'Primary Back', 'Carton', 'CLD Packing'])} searchable={false} />
        <Tabs size="sm" label="Quality view" idBase="qv" value={view} onChange={setView} tabs={[{ value: 'time', label: 'Time Series' }, { value: 'factory', label: 'Factory Wise' }]} />
      </>}>
        {view === 'factory'
          ? <BarChart label="Good and bad products by factory with defect rate" height={300}
              series={[{ key: 'good', label: 'Good Products', color: 'var(--ds-chart-positive)' }, { key: 'bad', label: 'Bad Products', color: 'var(--ds-chart-negative)' }]}
              data={QUALITY.map(d => ({ x: d.x, values: { good: d.good, bad: d.bad } }))}
              trend={{ label: 'Defect rate', values: QUALITY.map(d => d.rate), format: v => `${v}%` }} />
          : <LineChart label="Good and bad products per week" height={300} x={WEEKS}
              series={[{ key: 'good', label: 'Good Products', color: 'var(--ds-chart-positive)', values: [218, 224, 230, 226, 231, 228, 236, 234].map(v => v * 1000) },
                { key: 'bad', label: 'Bad Products', color: 'var(--ds-chart-negative)', values: [21, 19, 18, 20, 17, 18, 16, 18].map(v => v * 1000) }]} />}
        <ChartData caption="Quality snapshot" head={['Factory', 'Good products', 'Bad products', 'Defect rate']} rows={QUALITY.map(d => [d.x, d.good, d.bad, `${d.rate}%`])} />
      </DashCard>

      <DashCard title="Line - Product Defect Matrix" subtitle="Weekly defect rate by production line · Herbal Wash 200 ml · Pune Plant" right={<>
        <Badge tone="success">Active</Badge>
        <Select variant="filter" className="ds-select--180" label="Period" value={weeks} onChange={setWeeks} options={opts(['Last 4 weeks', 'Last 8 weeks', 'Last 12 weeks'])} searchable={false} />
      </>}>
        <BubbleMatrix label="Defect rate by line and product" rows={MATRIX_ROWS.map(label => ({ label }))} cols={MATRIX_COLS} volume={volume} rate={rate}
          rateLabel="Overall Defect %" volumeLabel="Total Products Analyzed"
          tipFor={(i, j, color) => {
            const bad = Math.round(volume[i][j] * rate[i][j] / 100);
            return <TipContent title={MATRIX_ROWS[i]} sub={MATRIX_COLS[j]} color={color}
              rows={[['Overall Defect %', `${rate[i][j].toFixed(1)}%`], ['Total Products Analyzed', fmtIN(volume[i][j])], ['Bad Products', fmtIN(bad)]]}
              list={{ title: 'Defect Distribution', items: split(bad).map((n, k) => [shares[k], `${((n / volume[i][j]) * 100).toFixed(1)}% (${fmtIN(n)})`] as [string, string]) }} />;
          }} />
      </DashCard>

      <div className="ds-dash-row app-row">
        <DashCard title="Defect Distribution" className="app-col-donut">
          <Donut label="Defects by category" data={DEFECT_DIST} />
        </DashCard>
        <DashCard title="Defect Rate by Category & Factory" flush className="app-col-grow">
          <Heatmap label="Defect rate by factory and category" rowLabel="Factory" rows={HEAT_ROWS} cols={HEAT_COLS} values={HEAT_VALUES} format={pct}
            tipFor={(i, j, color) => {
              const analysed = [123456, 234567, 345678, 456789, 567890, 345678, 234567][i];
              const bad = Math.round(analysed * HEAT_VALUES[i][j] / 100);
              return <TipContent title={HEAT_ROWS[i]} sub={HEAT_COLS[j]} color={color}
                rows={[['Overall Defect %', pct(HEAT_VALUES[i][j])], ['Total Products Analyzed', fmtIN(analysed)], ['Bad Products', fmtIN(bad)]]}
                list={{ title: 'Product Distribution', items: split(bad).map((n, k) => [['Vim Dishwash 500 ml Pouch', 'Lifebuoy Handwash Refill 185 ml', 'Lifebuoy Handwash Refill 500 ml', 'Comfort After Wash 200 ml'][k], fmtIN(n)] as [string, string]) }} />;
            }} />
        </DashCard>
      </div>

      <DashCard title="Line Wise Defects" flush right={<>
        <Select variant="filter" className="ds-select--180" label="Rows" value={ldFilter} onChange={setLdFilter} options={opts(['Products', 'Lines', 'Factories'])} searchable={false} />
        <Tabs size="sm" label="Grouping" idBase="ld" value={ldView} onChange={setLdView} tabs={[{ value: 'factory', label: 'Factory Wise' }, { value: 'product', label: 'Product Wise' }, { value: 'line', label: 'Line Wise' }]} />
      </>}>
        <DataTable variant="compact" caption="Line wise defects" columns={ldCols} minWidth={1300} rowHeader="line"
          rows={[...LINE_DEFECTS].map((r, i) => ({ ...r, key: `ld${i}` })).sort((a, b) => ldView === 'factory' ? a.factory.localeCompare(b.factory) : ldView === 'product' ? a.product.localeCompare(b.product) : 0)}
          rowKey={r => r.key} />
      </DashCard>

      <div className="ds-dash-row app-row app-status-row">
        <StatusCard title="Line Status" running={LINE_STATUS.running} stopped={LINE_STATUS.stopped}>
          <DataTable variant="grid" caption="Stopped lines" rowHeader="line" rowKey={r => r.line + r.product} rows={LINE_STATUS.rows}
            columns={[{ key: 'line', header: 'Line' }, { key: 'factory', header: 'Factory' }, { key: 'product', header: 'Current product' }, { key: 'since', header: 'Stopped since', align: 'center' }]} />
        </StatusCard>
        <StatusCard title="Camera Status" running={CAMERA_STATUS.running} stopped={CAMERA_STATUS.stopped}>
          <DataTable variant="grid" caption="Offline cameras" rowHeader="camera" rowKey={r => r.camera} rows={CAMERA_STATUS.rows}
            columns={[{ key: 'camera', header: 'Camera ID' }, { key: 'line', header: 'Line' }, { key: 'factory', header: 'Factory' }, { key: 'since', header: 'Offline since', align: 'center' }]} />
        </StatusCard>
        <StatusCard title="Device Status" running={DEVICE_STATUS.running} stopped={DEVICE_STATUS.stopped}>
          <DataTable variant="grid" caption="Stopped devices" rowHeader="device" rowKey={r => r.device} rows={DEVICE_STATUS.rows}
            columns={[{ key: 'device', header: 'Device ID' }, { key: 'factory', header: 'Factory' }, { key: 'since', header: 'Stopped since', align: 'center' }]} />
        </StatusCard>
      </div>
    </VisionShell>
  );
}
