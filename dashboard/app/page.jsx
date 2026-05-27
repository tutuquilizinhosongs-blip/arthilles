'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ArthillesDashboard() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('admin@arthilles.local');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('status');
  const [data, setData] = useState({ clients: [], messages: [], appointments: [], unknown: [], status: null });
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.token) {
        setToken(json.token);
        await loadAll(json.token);
      } else {
        alert('Login falhou: ' + (json.error || 'Credenciais inválidas'));
      }
    } catch (e) {
      alert('Erro de conexão: ' + e.message);
    }
    setLoading(false);
  }

  async function loadAll(currentToken = token) {
    const headers = { Authorization: `Bearer ${currentToken}` };
    const [clients, messages, appointments, unknown, status] = await Promise.all([
      fetch(`${API}/clients`, { headers }).then(r => r.json()),
      fetch(`${API}/messages`, { headers }).then(r => r.json()),
      fetch(`${API}/appointments`, { headers }).then(r => r.json()),
      fetch(`${API}/faq/unknown`, { headers }).then(r => r.json()),
      fetch(`${API}/status`).then(r => r.json())
    ]);
    setData({ clients, messages, appointments, unknown, status });
  }

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
        <h1>Arthilles - Login</h1>
        <div className="card">
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 16 }} />
          <button onClick={login} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p style={{ fontSize: 12, color: '#666', marginTop: 12 }}>
            Use as credenciais definidas em ADMIN_EMAIL / ADMIN_PASSWORD no backend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'white' }}>Arthilles Bot</h2>
          <button onClick={() => { setToken(''); setData({ clients: [], messages: [], appointments: [], unknown: [], status: null }); }}>Sair</button>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['status', 'clients', 'messages', 'appointments', 'unknown'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'status' && 'Status'}
              {tab === 'clients' && 'Clientes'}
              {tab === 'messages' && 'Mensagens'}
              {tab === 'appointments' && 'Agendamentos'}
              {tab === 'unknown' && 'Dúvidas Pendentes'}
            </button>
          ))}
          <button onClick={() => loadAll()} style={{ marginLeft: 'auto' }}>Atualizar</button>
        </div>

        {activeTab === 'status' && (
          <div className="card">
            <h3>Status do Sistema</h3>
            <pre style={{ background: '#f4f4f4', padding: 16, borderRadius: 6, overflow: 'auto' }}>
              {JSON.stringify(data.status, null, 2)}
            </pre>
            <p><strong>Dica:</strong> Se Google Sheets estiver com erro, verifique a variável GOOGLE_SHEETS_CSV_URL.</p>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="card">
            <h3>Clientes ({data.clients.length})</h3>
            <table>
              <thead><tr><th>Nome</th><th>Telefone</th><th>Data</th></tr></thead>
              <tbody>
                {data.clients.map(c => (
                  <tr key={c.id}><td>{c.full_name || '-'}</td><td>{c.phone}</td><td>{new Date(c.created_at).toLocaleString('pt-BR')}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="card">
            <h3>Últimas Mensagens</h3>
            <table>
              <thead><tr><th>Direção</th><th>Telefone</th><th>Mensagem</th><th>Data</th></tr></thead>
              <tbody>
                {data.messages.map(m => (
                  <tr key={m.id}>
                    <td>{m.direction}</td>
                    <td>{m.phone}</td>
                    <td style={{ maxWidth: 400 }}>{m.body}</td>
                    <td>{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="card">
            <h3>Agendamentos</h3>
            <table>
              <thead><tr><th>Cliente</th><th>Serviço</th><th>Data</th><th>Horário</th></tr></thead>
              <tbody>
                {data.appointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.clients?.full_name || a.clients?.phone || '-'}</td>
                    <td>{a.service}</td>
                    <td>{a.preferred_date}</td>
                    <td>{a.preferred_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'unknown' && (
          <div className="card">
            <h3>Dúvidas não respondidas (encaminhadas para equipe)</h3>
            <table>
              <thead><tr><th>Telefone</th><th>Pergunta</th><th>Data</th><th>Status</th></tr></thead>
              <tbody>
                {data.unknown.map(u => (
                  <tr key={u.id}>
                    <td>{u.phone}</td>
                    <td>{u.question}</td>
                    <td>{new Date(u.created_at).toLocaleString('pt-BR')}</td>
                    <td>{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: 16, color: '#666' }}>Essas perguntas não tiveram resposta automática e foram salvas para atendimento humano.</p>
          </div>
        )}
      </div>
    </div>
  );
}
