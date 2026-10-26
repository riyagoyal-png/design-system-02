import { CircleDot } from 'lucide-react';
import { useMemo, useState } from 'react';
import { VisionShell } from './Shell';
import { PRODUCTS, asset, type Product } from './data';
import { Button, IconButton } from '../../components/ds/Button';
import { Field, SearchInput, TextInput, Textarea } from '../../components/ds/Field';
import { Select } from '../../components/ds/Select';
import { BinaryToggle } from '../../components/ds/Choice';
import { FileUpload } from '../../components/ds/Inputs2';
import { Badge, CountPill, Illustration } from '../../components/ds/Display';
import { KpiCard } from '../../components/ds/Cards';
import { DataTable, sortRows, type Column, type Sort } from '../../components/ds/Table';
import { Pagination } from '../../components/ds/Nav';
import { ConfirmDialog, SlidePanel } from '../../components/ds/Overlay';
import { ArrowBack, ChevronRight, Edit, Export, Plus, Trash } from '../../components/ds/figmaIcons';
import { toast } from '../../components/ds/Toast';

const PAGE = 8;
const opts = (xs: string[]) => xs.map(v => ({ value: v, label: v }));

/** Frame 8 · Product Master (495:15510) with the "Add Product" slide panel; `adding` opens it as in the frame. */
export function ProductMasterApp({ adding }: { adding?: boolean }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All Status');
  const [cbu, setCbu] = useState('All CBU Codes');
  const [sort, setSort] = useState<Sort>(null);
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState(!!adding);
  const [del, setDel] = useState<Product | null>(null);

  const cols: Column<Product>[] = [
    { key: 'name', header: 'Product name', sortable: true, sortValue: p => p.name, render: p => <span className="ds-cell-stack"><span>{p.name}</span><span className="ds-ts-body-muted">{p.size}</span></span> },
    { key: 'thumb', header: 'Front label', render: p => <img className="ds-cell-thumb" src={asset('product-thumb.png')} alt={`${p.name} front label`} /> },
    { key: 'barcode', header: 'Product barcode', sortable: true, sortValue: p => p.barcode },
    { key: 'cld', header: 'CLD barcode', sortable: true, sortValue: p => p.cld },
    { key: 'cbu', header: 'CBU code', sortable: true, sortValue: p => p.cbu },
    { key: 'status', header: 'Status', sortable: true, sortValue: p => p.status.label, render: p => <Badge tone={p.status.tone} appearance="glass">{p.status.label}</Badge> },
    { key: 'updated', header: 'Last updated', sortable: true, sortValue: p => p.updated },
    { key: 'actions', header: 'Actions', hiddenHeader: true, align: 'end', render: p => (
      <span className="ds-row-actions">
        <IconButton icon={Edit} size="compact" label={`Edit ${p.name} ${p.cbu}`} onClick={() => toast(`Edit form for ${p.cbu} opens here`)} />
        <IconButton icon={Trash} size="compact" label={`Delete ${p.name} ${p.cbu}`} onClick={() => setDel(p)} />
      </span>
    ) },
  ];
  const filtered = useMemo(() => sortRows(products.filter(p => (status === 'All Status' || p.status.label === status) && (cbu === 'All CBU Codes' || p.cbu === cbu)
    && `${p.name} ${p.barcode} ${p.cld} ${p.cbu}`.toLowerCase().includes(q.toLowerCase())), sort, cols), [products, status, cbu, q, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages);

  return (
    <VisionShell current="product-master" withLines={adding} title="Product Master" icon={<Illustration name="illus.catalog-item" size={36} />}
      actions={<>
        <SearchInput width="sm" value={q} onValueChange={v => { setQ(v); setPage(1); }} label="Filter products" placeholder="Filter products..." />
        <Select variant="filter" leadIcon={CircleDot} className="ds-select--180" label="Status" value={status} onChange={v => { setStatus(v); setPage(1); }} options={opts(['All Status', 'Active', 'Inactive'])} searchable={false} />
        <Button leading={Plus} minWidth onClick={() => setPanel(true)}>Add product</Button>
      </>}
      overlays={<>
        <AddProductPanel open={panel} onClose={() => setPanel(false)} onSave={p => { setProducts(ps => [p, ...ps]); setPanel(false); toast(`${p.name} saved`); }} />
        <ConfirmDialog open={!!del} title="Delete product?" message={del ? `${del.name} ${del.size} (${del.cbu}) will no longer be inspected on any line.` : ''} confirmLabel="Delete"
          onCancel={() => setDel(null)} onConfirm={() => { setProducts(ps => ps.filter(p => p.id !== del!.id)); toast('Product deleted'); setDel(null); }} />
      </>}>
      {/* KPI values exactly as in the frame (126 / 118 / 8 / 24); the frame list holds 24 rows — recorded in FIGMA_EXTRACTION.md. */}
      <div className="ds-kpi-row">
        <KpiCard label="Total Products" value={126} icon={<Illustration name="illus.facility-set" crop="factory" size={52} />} />
        <KpiCard label="Active Products" value={118} icon={<Illustration name="illus.facility-set" crop="factory-active" size={52} />} />
        <KpiCard label="Inactive Products" value={8} icon={<Illustration name="illus.conveyor-line" crop="conveyor" size={52} />} />
        <KpiCard label="Unique CBU Codes" value={24} icon={<Illustration name="illus.facility-set" crop="camera-zoom" size={52} />} />
      </div>
      <section className="ds-table-card" aria-labelledby="pl-title">
        <div className="ds-table-card__header">
          <div className="ds-table-card__title"><h2 className="ds-text-group-title" id="pl-title">Product List</h2><CountPill label={`${filtered.length} products`}>{filtered.length}</CountPill></div>
        </div>
        <div className="ds-table-card__toolbar">
          <SearchInput width="full" value={q} onValueChange={v => { setQ(v); setPage(1); }} label="Search products" placeholder="Search by product name, barcode, CLD code or CBU code" />
          <Select variant="filter" className="ds-select--180" label="Status" value={status} onChange={v => { setStatus(v); setPage(1); }} options={opts(['All Status', 'Active', 'Inactive'])} searchable={false} />
          <Select variant="filter" className="ds-select--180" label="CBU code" value={cbu} onChange={v => { setCbu(v); setPage(1); }} options={opts(['All CBU Codes', ...products.map(p => p.cbu)])} />
          <Button variant="secondary" leading={Export} onClick={() => toast(`${filtered.length} products exported`)}>Export</Button>
        </div>
        <DataTable caption="Products" labelledBy="pl-title" columns={cols} rows={filtered.slice((current - 1) * PAGE, current * PAGE)} rowKey={p => p.id} rowHeader="name"
          sort={sort} onSort={setSort} minWidth={1300} empty="No products match your filters." />
        <Pagination page={current} pageSize={PAGE} total={filtered.length} noun="products" onPage={setPage} />
      </section>
    </VisionShell>
  );
}

function AddProductPanel({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (p: Product) => void }) {
  const init = { name: 'Dove Nourishing Bodywash', status: 'active' as 'active' | 'inactive', barcode: '8901030875397', cld: '18901030875394', cbu: 'BWC2404101', notes: '' };
  const [f, setF] = useState(init);
  const [tried, setTried] = useState(false);
  const errs = {
    name: !f.name.trim() ? 'Enter the product name.' : '',
    barcode: !/^\d{8,14}$/.test(f.barcode) ? 'Enter an 8–14 digit barcode.' : '',
    cld: !/^\d{8,14}$/.test(f.cld) ? 'Enter an 8–14 digit CLD barcode.' : '',
    cbu: !f.cbu.trim() ? 'Enter the CBU barcode.' : '',
  };
  const e = (k: keyof typeof errs) => (tried ? errs[k] || undefined : undefined);
  const set = (k: keyof typeof f) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: ev.target.value });
  const save = () => {
    setTried(true);
    if (Object.values(errs).some(Boolean)) { window.setTimeout(() => document.querySelector<HTMLElement>('.ds-panel [aria-invalid="true"]')?.focus(), 0); return; }
    onSave({ id: `p${Date.now()}`, name: f.name.trim(), size: '', barcode: f.barcode, cld: f.cld, cbu: f.cbu.trim(),
      status: f.status === 'active' ? { tone: 'success', label: 'Active' } : { tone: 'error', label: 'Inactive' }, updated: 'Just now' });
    setF(init); setTried(false);
  };
  return (
    <SlidePanel open={open} onClose={onClose} size="xl" title="Add Product" icon={<Illustration name="illus.catalog-item" size={36} />}
      dirty={f.notes !== '' || f.name !== init.name}
      footer={<>
        <Button variant="secondary" leading={ArrowBack} onClick={onClose}>Cancel</Button>
        <Button trailing={ChevronRight} minWidth onClick={save}>Save product</Button>
      </>}>
      <section className="ds-form-section" aria-labelledby="ap-section">
        {/* Figma labels this section "User Details" (copied from the user form); kept as drawn, R-27. */}
        <h3 className="ds-form-section__title" id="ap-section">User Details</h3>
        <div className="ds-form-grid">
          <Field label="Product Name" required error={e('name')}><TextInput value={f.name} onChange={set('name')} placeholder="Enter product name" /></Field>
          <div className="ds-field">
            <span className="ds-field__label" id="ap-status">Status</span>
            <BinaryToggle labelId="ap-status" value={f.status} onChange={v => setF({ ...f, status: v })}
              options={[{ value: 'active', label: 'Active', dot: 'success' }, { value: 'inactive', label: 'Inactive', dot: 'error' }]} />
          </div>
          <div className="ds-span-all ds-form-grid ds-form-grid--3 app-nested-grid">
            <Field label="Product Barcode" required error={e('barcode')}><TextInput value={f.barcode} onChange={set('barcode')} inputMode="numeric" /></Field>
            <Field label="CLD Barcode" required error={e('cld')}><TextInput value={f.cld} onChange={set('cld')} inputMode="numeric" /></Field>
            <Field label="CBU Barcode" required error={e('cbu')}><TextInput value={f.cbu} onChange={set('cbu')} /></Field>
          </div>
          <div className="ds-field ds-span-all">
            <span className="ds-field__label" id="ap-primary">Primary Label Reference<span className="ds-field__req" aria-hidden="true"> *</span></span>
            <FileUpload labelledBy="ap-primary" />
          </div>
          <div className="ds-field ds-span-all">
            <span className="ds-field__label" id="ap-secondary">Secondary Label Reference<span className="ds-field__req" aria-hidden="true"> *</span></span>
            <FileUpload labelledBy="ap-secondary" />
          </div>
          <Field label="Notes (optional)" className="ds-span-all"><Textarea value={f.notes} onChange={set('notes')} placeholder="Enter any note as necessary" /></Field>
        </div>
      </section>
    </SlidePanel>
  );
}
