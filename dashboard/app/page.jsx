'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ArthillesDashboard() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('admin@arthilles.local');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('status');
  const [data, setData] = useState({ clients: [], messages: [], appointments: [], unknown: [], status: null, whatsapp: null });
  const [loading, setLoading] = useState(false);

  // WhatsApp form state (Opção A)
  const [waForm, setWaForm] = useState({ api_url: '', api_key: '', instance_name: '' });
  const [waSaving, setWaSaving] = useState(false);
  const [waMessage, setWaMessage] = useState('');

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
    const [clients, messages, appointments, unknown, status, whatsapp] = await Promise.all([
      fetch(`${API}/clients`, { headers }).then(r => r.json()),
      fetch(`${API}/messages`, { headers }).then(r => r.json()),
      fetch(`${API}/appointments`, { headers }).then(r => r.json()),
      fetch(`${API}/faq/unknown`, { headers }).then(r => r.json()),
      fetch(`${API}/status`).then(r => r.json()),
      fetch(`${API}/evolution/settings`, { headers }).then(r => r.json()).catch(() => null)
    ]);
    setData({ clients, messages, appointments, unknown, status, whatsapp });

    // Preenche o formulário com dados salvos
    if (whatsapp) {
      setWaForm({
        api_url: whatsapp.api_url || '',
        api_key: '', // nunca preenchemos a key por segurança
        instance_name: whatsapp.instance_name || ''
      });
    }
  }

  async function saveWhatsAppSettings() {
    setWaSaving(true);
    setWaMessage('');
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const res = await fetch(`${API}/evolution/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(waForm)
      });
      const json = await res.json();

      if (json.success || json.api_url) {
        setWaMessage('Configurações salvas com sucesso!');
        await loadAll();
      } else {
        setWaMessage('Erro: ' + (json.error || 'Não foi possível salvar'));
      }
    } catch (e) {
      setWaMessage('Erro de conexão ao salvar');
    }
    setWaSaving(false);
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
          {['status', 'clients', 'messages', 'appointments', 'unknown', 'whatsapp'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'status' && 'Status'}
              {tab === 'clients' && 'Clientes'}
              {tab === 'messages' && 'Mensagens'}
              {tab === 'appointments' && 'Agendamentos'}
              {tab === 'unknown' && 'Dúvidas Pendentes'}
              {tab === 'whatsapp' && 'WhatsApp'}
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

        {/* === NOVA ABA WHATSAPP (Opção A) === */}
        {activeTab === 'whatsapp' && (
          <div className="card">
            <h3>Conexão com WhatsApp (Evolution API)</h3>
            <p style={{ color: '#555', marginBottom: 16 }}>
              Preencha as credenciais da sua Evolution API abaixo. As configurações ficam salvas no banco e o sistema continua funcionando com variáveis de ambiente como fallback.
            </p>

            <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Evolution API URL</label>
                <input
                  value={waForm.api_url}
                  onChange={e => setWaForm({ ...waForm, api_url: e.target.value })}
                  placeholder="https://sua-evolution.com"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Evolution API Key</label>
                <input
                  type="password"
                  value={waForm.api_key}
                  onChange={e => setWaForm({ ...waForm, api_key: e.target.value })}
                  placeholder="Deixe em branco para manter a key atual"
                  style={{ width: '100%' }}
                />
              />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Nome da Instância</label>
                <input
                  value={waForm.instance_name}
                  onChange={e => setWaForm({ ...waForm, instance_name: e.target.value })}
                  placeholder="arthilles-demo"
                  style={{ width: '100%' }}
                />
              </div>

              <button onClick={saveWhatsAppSettings} disabled={waSaving} style={{ marginTop: 8 }}>
                {waSaving ? 'Salvando...' : 'Salvar Configurações do WhatsApp'}
              </button>

              {waMessage && <p style={{ color: waMessage.includes('sucesso') ? 'green' : 'red' }}>{waMessage}</p>}
            </div>

            <hr style={{ margin: '24px 0' }} />

            <div>
              <strong>Status atual:</strong>
              <pre style={{ background: '#f8f8f8', padding: 12, marginTop: 8, fontSize: 13 }}>
                {JSON.stringify(data.status?.evolution, null, 2)}
              </pre>
              <p style={{ fontSize: 12, color: '#666' }}>
                O sistema usa primeiro as credenciais salvas aqui. Se não houver, usa as variáveis de ambiente do Railway.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
