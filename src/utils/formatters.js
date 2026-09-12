export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarData = (timestamp) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(timestamp));
};

export const formatarHora = (timestamp) => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
};

export const formatarDuracao = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins}min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
};

export const formatarNumero = (valor) => new Intl.NumberFormat('pt-BR').format(valor);

export const calcularMinutosPausados = (jornada, ateAgora = new Date()) => {
  if (!jornada?.pausas?.length) return 0;
  return jornada.pausas.reduce((acc, p) => {
    const fim = p.fim ? new Date(p.fim) : ateAgora;
    return acc + Math.max(0, Math.floor((fim - new Date(p.inicio)) / 60000));
  }, 0);
};

export const calcularDuracao = (inicio, fim) => {
  const diff = new Date(fim) - new Date(inicio);
  return Math.floor(diff / 60000);
};

export const paraNumero = (valor, fallback = 0) => {
  const numero = parseFloat(valor);
  return Number.isFinite(numero) ? numero : fallback;
};

export const digitosParaMoeda = (digitos) => {
  const numeros = String(digitos).replace(/\D/g, '');
  if (!numeros) return '';
  const inteiro = numeros.slice(0, -2) || '0';
  const centavos = numeros.slice(-2).padStart(2, '0');
  const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${inteiroFormatado},${centavos}`;
};
