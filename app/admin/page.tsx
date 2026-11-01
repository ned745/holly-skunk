'use client';

import React, { useState, useEffect } from 'react';
import { PackagePlus, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'fashion',
    description: '',
    stock: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUserRole(localStorage.getItem('hs_role'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name);
      dataPayload.append('price', formData.price);
      dataPayload.append('category', formData.category);
      dataPayload.append('description', formData.description);
      dataPayload.append('stock', formData.stock);
      
      if (imageFile) {
        dataPayload.append('imageFile', imageFile);
      }

      const res = await fetch('http://localhost:5000/api/products/add', {
        method: 'POST',
        // Note: Do not set Content-Type header manually when using FormData
        body: dataPayload
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', msg: 'Product & photo successfully deployed to catalog!' });
        setFormData({ name: '', price: '', category: 'fashion', description: '', stock: '' });
        setImageFile(null);
      } else {
        setStatus({ type: 'error', msg: data.error || 'Failed to add product.' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Could not reach backend API server on Port 5000.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userRole !== 'Admin') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="bg-neutral-900 border border-red-900/50 p-8 rounded-xl max-w-md text-center">
          <h2 className="text-lg font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-xs text-neutral-400 mb-6 font-mono">You need Admin privileges to access this control portal.</p>
          <a href="/" className="inline-block bg-neutral-800 text-xs px-4 py-2 rounded text-neutral-200 font-mono hover:bg-neutral-700">
            Return to Storefront
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 bg-neutral-900 text-neutral-400 rounded hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </a>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-lime-400" size={20} /> HOLLY SKUNK ADMIN PORTAL
              </h1>
              <p className="text-xs font-mono text-neutral-500">Catalog & Product Management</p>
            </div>
          </div>
        </div>

        {status && (
          <div className={`p-4 mb-6 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            status.type === 'success' ? 'bg-lime-950/30 border-lime-900/60 text-lime-400' : 'bg-red-950/30 border-red-900/60 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {status.msg}
          </div>
        )}

        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 md:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-lime-400 mb-6 flex items-center gap-2 font-mono">
            <PackagePlus size={16} /> Ingest New Item & Photo to Database
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">Product Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Heavyweight Tactical Hoodie"
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-lime-400 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="85.00"
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Stock Units</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-lime-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-lime-400 font-mono"
                >
                  <option value="fashion">Fashion / Streetwear</option>
                  <option value="premium">Premium Drop</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1 flex items-center gap-1">
                <ImageIcon size={14} /> Upload Product Image from Device
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs rounded text-neutral-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-lime-400 file:text-black hover:file:bg-lime-300 font-mono cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Details on material, fit, print technique..."
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs rounded text-white focus:outline-none focus:border-lime-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-lime-400 text-black py-2.5 rounded text-xs font-bold uppercase tracking-wider font-mono hover:bg-lime-300 transition-colors disabled:opacity-50 mt-4"
            >
              {isSubmitting ? 'Uploading & Ingesting...' : 'Deploy Product with Image'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}