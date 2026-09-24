import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:8080/api/inventory';

const emptyItem = {
  itemName: '',
  type: 'Laptop',
  brand: '',
  model: '',
  serialNumber: '',
  processor: '',
  ram: '',
  storage: '',
  quantity: 1,
  price: '',
  condition: 'New',
  status: 'In Stock',
  supplier: ''
};

export default function Display({ user, role, onLogout }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadInventory() {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Unable to load inventory.');
      setItems(await response.json());
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const searchable = [
        item.itemName,
        item.brand,
        item.model,
        item.serialNumber,
        item.processor
      ].join(' ').toLowerCase();

      return (
        searchable.includes(query) &&
        (typeFilter === 'All' || item.type === typeFilter)
      );
    });
  }, [items, search, typeFilter]);

  const stats = useMemo(() => ({
    total: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    laptops: items
      .filter((item) => item.type === 'Laptop')
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    desktops: items
      .filter((item) => item.type === 'Desktop PC')
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    lowStock: items.filter((item) => Number(item.quantity || 0) <= 2).length
  }), [items]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveItem(event) {
    event.preventDefault();
    setMessage('');

    const payload = {
      ...form,
      quantity: Number(form.quantity || 0),
      price: Number(form.price || 0)
    };

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Unable to save inventory item.');
      }

      setMessage(editingId ? 'Inventory item updated.' : 'Inventory item added.');
      setForm(emptyItem);
      setEditingId(null);
      await loadInventory();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editItem(item) {
    setEditingId(item.id);
    setForm({
      itemName: item.itemName || '',
      type: item.type || 'Laptop',
      brand: item.brand || '',
      model: item.model || '',
      serialNumber: item.serialNumber || '',
      processor: item.processor || '',
      ram: item.ram || '',
      storage: item.storage || '',
      quantity: item.quantity ?? 1,
      price: item.price ?? '',
      condition: item.condition || 'New',
      status: item.status || 'In Stock',
      supplier: item.supplier || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function adjustQuantity(id, amount) {
    try {
      const response = await fetch(`${API_URL}/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error('Unable to update quantity.');
      await loadInventory();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteItem(id) {
    if (role !== 'superadmin') return;
    if (!window.confirm('Delete this inventory item?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete inventory item.');
      setMessage('Inventory item deleted.');
      await loadInventory();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar p-3">
        <div className="brand text-white mb-4">
          <i className="bi bi-pc-display-horizontal me-2" />
          PC Inventory
        </div>

        <div className="small text-secondary mb-2">MENU</div>
        <nav className="nav flex-column">
          <a className="nav-link active" href="#dashboard">
            <i className="bi bi-speedometer2 me-2" />Dashboard
          </a>
          <a className="nav-link" href="#inventory">
            <i className="bi bi-box-seam me-2" />Inventory
          </a>
          <a className="nav-link" href="#add-item">
            <i className="bi bi-plus-circle me-2" />Add Item
          </a>
        </nav>

        <div className="sidebar-user">
          <div className="text-white small fw-semibold">
            {user.displayName || user.email}
          </div>
          <div className="text-secondary small text-capitalize mb-2">
            {role}
          </div>
          <button className="btn btn-outline-light btn-sm w-100" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-1" />Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <nav className="navbar bg-white border-bottom px-4">
          <span className="navbar-brand fw-bold">Inventory Dashboard</span>
          <span className="badge text-bg-dark text-capitalize">{role}</span>
        </nav>

        <div className="container-fluid p-4">
          <section id="dashboard" className="mb-4">
            <h2 className="fw-bold mb-1">PC & Laptop Inventory</h2>
            <p className="text-muted mb-0">
              Manage computers, laptops, hardware details, and stock quantities.
            </p>
          </section>

          <div className="row g-3 mb-4">
            <StatCard title="Total Units" value={stats.total} />
            <StatCard title="Laptops" value={stats.laptops} />
            <StatCard title="Desktop PCs" value={stats.desktops} />
            <StatCard title="Low Stock Items" value={stats.lowStock} />
          </div>

          <section id="add-item" className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white fw-bold">
              {editingId ? 'Edit PC / Laptop' : 'Add PC / Laptop'}
            </div>

            <form className="card-body" onSubmit={saveItem}>
              <div className="row g-3">
                <InputField name="itemName" label="Item Name" value={form.itemName} onChange={handleChange} placeholder="e.g. Office Laptop" required />
                <InputField name="brand" label="Brand" value={form.brand} onChange={handleChange} placeholder="e.g. Dell, HP, Lenovo" required />
                <InputField name="model" label="Model" value={form.model} onChange={handleChange} placeholder="e.g. ThinkPad E14" />
                <InputField name="serialNumber" label="Serial Number" value={form.serialNumber} onChange={handleChange} placeholder="Unique serial number" />
                <InputField name="processor" label="Processor" value={form.processor} onChange={handleChange} placeholder="e.g. Intel Core i5" />
                <InputField name="ram" label="RAM" value={form.ram} onChange={handleChange} placeholder="e.g. 16GB" />
                <InputField name="storage" label="Storage" value={form.storage} onChange={handleChange} placeholder="e.g. 512GB SSD" />
                <InputField name="supplier" label="Supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier name" />

                <SelectField name="type" label="Type" value={form.type} onChange={handleChange} options={['Laptop', 'Desktop PC', 'All-in-One', 'Monitor', 'Accessory']} />
                <InputField name="quantity" label="Quantity" type="number" value={form.quantity} onChange={handleChange} min="0" required />
                <InputField name="price" label="Price" type="number" value={form.price} onChange={handleChange} min="0" step="0.01" />
                <SelectField name="condition" label="Condition" value={form.condition} onChange={handleChange} options={['New', 'Used', 'Refurbished']} />
                <SelectField name="status" label="Status" value={form.status} onChange={handleChange} options={['In Stock', 'Reserved', 'Sold', 'For Repair']} />
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-dark" type="submit">
                  <i className="bi bi-save me-1" />
                  {editingId ? 'Update Item' : 'Add Item'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyItem);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {message && <div className="alert alert-info mt-3 mb-0">{message}</div>}
            </form>
          </section>

          <section id="inventory" className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <strong>Inventory List</strong>
              <div className="d-flex gap-2 inventory-filters">
                <input
                  className="form-control form-control-sm"
                  placeholder="Search..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  className="form-select form-select-sm"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option>All</option>
                  <option>Laptop</option>
                  <option>Desktop PC</option>
                  <option>All-in-One</option>
                  <option>Monitor</option>
                  <option>Accessory</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Hardware</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-4">Loading inventory...</td></tr>
                  ) : filteredItems.length === 0 ? (
                    <tr><td colSpan="8" className="text-center text-muted py-4">No inventory items found.</td></tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.itemName}</strong>
                          <div className="small text-muted">
                            {item.brand} {item.model}
                            <br />SN: {item.serialNumber || 'N/A'}
                          </div>
                        </td>
                        <td>{item.type}</td>
                        <td className="small">
                          {item.processor || '—'}
                          <br />
                          {item.ram || '—'} / {item.storage || '—'}
                        </td>
                        <td>
                          <span className={`badge ${Number(item.quantity || 0) <= 2 ? 'text-bg-warning' : 'text-bg-success'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td>₱{Number(item.price || 0).toLocaleString()}</td>
                        <td>{item.condition}</td>
                        <td>{item.status}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-success" onClick={() => adjustQuantity(item.id, 1)}>+</button>
                            <button className="btn btn-sm btn-outline-warning" onClick={() => adjustQuantity(item.id, -1)}>-</button>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => editItem(item)}>
                              <i className="bi bi-pencil" />
                            </button>
                            {role === 'superadmin' && (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item.id)}>
                                <i className="bi bi-trash" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="text-center text-muted small py-4">
            PC & Laptop Inventory System • React + Firebase + Express
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="col-6 col-xl-3">
      <div className="card stat-card shadow-sm p-3">
        <small className="text-muted">{title}</small>
        <h3 className="fw-bold mb-0">{value}</h3>
      </div>
    </div>
  );
}

function InputField({ name, label, value, onChange, placeholder = '', type = 'text', ...props }) {
  return (
    <div className="col-md-6 col-lg-3">
      <label className="form-label fw-semibold">{label}</label>
      <input
        className="form-control"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

function SelectField({ name, label, value, onChange, options }) {
  return (
    <div className="col-md-6 col-lg-3">
      <label className="form-label fw-semibold">{label}</label>
      <select className="form-select" name={name} value={value} onChange={onChange}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
