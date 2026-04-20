'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal,
  Activity,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { showAlert } from '@/lib/alerts';
import { clsx } from 'clsx';

export default function ApiAccessPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/keys');
      if (res.ok) {
        setKeys(await res.json());
      }
    } catch (err) {
      console.error(err);
      showAlert.error('Error', 'Failed to fetch API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      if (res.ok) {
        const data = await res.json();
        setRevealedKey(data.key);
        setNewKeyName('');
        fetchKeys();
      } else {
        showAlert.error('Error', 'Failed to generate key.');
      }
    } catch (err) {
      showAlert.error('Error', 'Network error.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    const confirmation = await showAlert.confirm('Revoke Key?', 'This will immediately disconnect any apps using this key. This action cannot be undone.');
    if (!confirmation.isConfirmed) return;

    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert.success('Revoked', 'The API key has been invalidated.');
        fetchKeys();
      }
    } catch (err) {
      showAlert.error('Error', 'Failed to revoke key.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    showAlert.toast('Copied to clipboard');
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-primary" /> API Access
          </h1>
          <p className="text-sm text-muted mt-1">Harness the power of our AI content engine in your own applications.</p>
        </div>
        <Button onClick={() => {
          setRevealedKey(null);
          setIsModalOpen(true);
        }}>
          <Plus size={18} className="mr-2" /> 
          Generate New Key
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Keys Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card variant="glass" padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-surface/50 flex items-center justify-between">
              <h2 className="text-lg font-bold">Active Tokens</h2>
              <span className="text-xs text-muted">{keys.length} keys active</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-black tracking-wider text-muted">
                    <th className="px-6 py-4">Key Name</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Last Used</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted">Loading tokens...</td>
                    </tr>
                  ) : keys.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted">
                        <Key size={32} className="mx-auto opacity-10 mb-4" />
                        No API keys generated yet.
                      </td>
                    </tr>
                  ) : (
                    keys.map((k) => (
                      <tr key={k.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-sm">{k.name}</td>
                        <td className="px-6 py-4 text-xs text-muted">{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-xs">
                          {k.lastUsed ? (
                            <span className="flex items-center gap-2 text-emerald-400">
                              <Activity size={12} /> {new Date(k.lastUsed).toLocaleTimeString()}
                            </span>
                          ) : (
                            <span className="text-muted">Never used</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRevokeKey(k.id)}
                            className="text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Start Docs */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Code2 size={20} className="text-primary" /> Quick Start Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="glass" className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-primary">Content Engine</span>
                  <Terminal size={14} className="text-muted" />
                </div>
                <p className="text-xs text-muted">Generate brand-aligned posts via external HTTP requests.</p>
                <div className="p-3 rounded-xl bg-black/40 font-mono text-[10px] text-white/70 border border-white/10 leading-relaxed">
                  POST /api/v1/generate-content<br/>
                  x-api-key: your_key_here
                </div>
              </Card>

              <Card variant="glass" className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-400">Direct Scheduling</span>
                  <Terminal size={14} className="text-muted" />
                </div>
                <p className="text-xs text-muted">Push posts directly into the background publisher queue.</p>
                <div className="p-3 rounded-xl bg-black/40 font-mono text-[10px] text-white/70 border border-white/10 leading-relaxed">
                  POST /api/v1/schedule-post<br/>
                  x-api-key: your_key_here
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Sidebar help */}
        <div className="flex flex-col gap-6">
          <Card variant="glass" className="p-6 bg-primary/5 border-primary/10">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-primary" /> Security Best Practices
            </h3>
            <ul className="text-xs space-y-4 text-muted">
              <li>• Never reveal your API keys in public code repositories.</li>
              <li>• Use environment variables to store keys in your server-side code.</li>
              <li>• If a key is compromised, revoke it immediately from this dashboard.</li>
              <li>• Keys grant administrative access to your company's content strategy.</li>
            </ul>
            <Button variant="ghost" className="w-full mt-6 text-xs border border-primary/20 hover:bg-primary/10">
              <ExternalLink size={14} className="mr-2" /> Full Documentation
            </Button>
          </Card>
        </div>
      </div>

      {/* Key Generation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={revealedKey ? "Key Generated Successfully" : "Generate New API Key"}
      >
        {!revealedKey ? (
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Token Name</label>
              <input 
                type="text"
                placeholder="e.g. My Website Bot"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <p className="text-xs text-muted">Give your key a name so you can identify its usage later.</p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <Button 
                className="flex-1" 
                onClick={handleCreateKey}
                isLoading={isCreating}
              >
                Create Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex gap-3">
              <ShieldCheck className="shrink-0" />
              <p>For security, this key will only be shown <strong>once</strong>. Copy it now and store it safely.</p>
            </div>

            <div className="relative group">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-sm break-all pr-12 min-h-[60px] flex items-center">
                {revealedKey}
              </div>
              <button 
                onClick={() => copyToClipboard(revealedKey, 'new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all"
              >
                {copied === 'new' ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-muted" />}
              </button>
            </div>

            <Button onClick={() => setIsModalOpen(false)} className="w-full">
              I've saved my key
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
