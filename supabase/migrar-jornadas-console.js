/**
 * Script de migração das jornadas do localStorage para o Supabase
 * 
 * COMO USAR:
 * 1. Abra o app no navegador (https://personcontrol.vercel.app)
 * 2. Faça login (precisa estar logado)
 * 3. Abra o DevTools (F12) → aba Console
 * 4. Cole este código inteiro e aperte Enter
 * 
 * O script vai:
 * 1. Ler as jornadas do localStorage
 * 2. Enviar para a Edge Function do Supabase
 * 3. Mostrar resultado no console
 */

async function migrarJornadas() {
  const SUPABASE_URL = 'https://dracfrdemkvwqxvevwbl.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYWNmcmRlbWt2d3F4dmV2d2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NjI5MjksImV4cCI6MjEwMzIzODkyOX0.tng89wNbURZvzlt6fhN87F-a785plyxtOVSDHJCqg6I';
  
  // 1. Obter token de acesso do localStorage do Supabase
  const storageKey = Object.keys(localStorage).find(k => k.includes('sb-') && k.endsWith('-auth-token'));
  if (!storageKey) {
    console.error('❌ Nenhuma sessão encontrada no localStorage. Faça login primeiro.');
    return;
  }
  
  const sessao = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (!sessao?.access_token) {
    console.error('❌ Token de acesso não encontrado na sessão.');
    return;
  }
  
  // 2. Ler jornadas do localStorage
  const userId = 'SEU_USER_ID_AQUI'; // O script preenche automaticamente abaixo
  let chaveJornadas;
  
  // Descobre o user_id do localStorage se não estiver definido
  if (userId === 'SEU_USER_ID_AQUI') {
    const todasChaves = Object.keys(localStorage);
    const chaveUser = todasChaves.find(k => k.startsWith('personcontrol_jornadas:'));
    if (chaveUser) {
      const match = chaveUser.match(/personcontrol_jornadas:(.+)/);
      if (match) {
        const userIdEncontrado = match[1];
        console.log(`📋 User ID detectado: ${userIdEncontrado}`);
        chaveJornadas = chaveUser;
      } else {
        console.error('❌ Não foi possível detectar o user_id automaticamente');
        return;
      }
    } else {
      console.error('❌ Nenhuma jornada encontrada no localStorage');
      return;
    }
  } else {
    chaveJornadas = `personcontrol_jornadas:${userId}`;
  }
  
  const jornadasRaw = localStorage.getItem(chaveJornadas);
  if (!jornadasRaw) {
    console.error('❌ Nenhuma jornada encontrada para este usuário');
    return;
  }
  
  let jornadas;
  try {
    jornadas = JSON.parse(jornadasRaw);
  } catch (e) {
    console.error('❌ Erro ao parsear jornadas:', e);
    return;
  }
  
  if (!Array.isArray(jornadas) || jornadas.length === 0) {
    console.log('ℹ️ Nenhuma jornada para migrar');
    return;
  }
  
  console.log(`📦 Encontradas ${jornadas.length} jornadas para migrar`);
  console.table(jornadas.map(j => ({
    id: j.id.substring(0,8) + '...',
    dataInicio: j.dataInicio,
    totalGanho: j.totalGanho,
    totalGastos: j.totalGastos || 0,
    lucroLiquido: j.lucroLiquido,
    duracaoMin: j.duracaoMinutos,
    pausas: (j.pausas||[]).length,
    gastos: (j.gastos||[]).length
  })));
  
  // 3. Enviar para Edge Function
  const response = await fetch(`${SUPABASE_URL}/functions/v1/migrar-jornadas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessao.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ jornadas })
  });
  
  const resultado = await response.json();
  
  if (response.ok && resultado.sucesso) {
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log(resultado.mensagem);
    console.table(resultado.jornadas.map(j => ({
      id: j.id.substring(0,8)+'...',
      data_inicio: j.data_inicio,
      total_ganho: j.total_ganho,
      total_gastos: j.total_gastos,
      lucro_liquido: j.lucro_liquido
    })));
    
    // Opcional: limpar localStorage após confirmação (descomente se quiser)
    // localStorage.removeItem(chaveJornadas);
    // localStorage.removeItem(`personcontrol_jornada_ativa:${userId}`);
    // console.log('🗑️ localStorage limpo (opcional)');
  } else {
    console.error('❌ ERRO NA MIGRAÇÃO:', resultado);
  }
}

// Executa automaticamente
migrarJornadas();