import { useState, useEffect } from 'react';
import { formatarHora, calcularMinutosPausados } from '../../utils/formatters';

const Cronometro = ({ inicio, pausado = false, pausas = [] }) => {
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const diffBruto = agora - new Date(inicio);
  const minutosPausados = calcularMinutosPausados({ pausas }, agora);
  const liquidoMs = Math.max(0, diffBruto - minutosPausados * 60000);

  const horas = Math.floor(liquidoMs / 3600000);
  const minutos = Math.floor((liquidoMs % 3600000) / 60000);
  const segundos = Math.floor((liquidoMs % 60000) / 1000);

  const formatar = (n) => String(n).padStart(2, '0');

  return (
    <div className="cronometro" data-od-id="cronometro">
      <div className="cronometro-label">
        {pausado ? 'JORNADA EM PAUSA' : 'TEMPO DE JORNADA'}
      </div>
      <div
        className="cronometro-value"
        style={pausado ? { color: '#f59e0b' } : undefined}
        data-od-id="cronometro-value"
      >
        {formatar(horas)}:{formatar(minutos)}:{formatar(segundos)}
      </div>
      {pausas.length > 0 && (
        <div className="cronometro-start" data-od-id="cronometro-pausa-total">
          Pausado: {formatarNumeroMinutos(minutosPausados)}
        </div>
      )}
      <div className="cronometro-start">
        Início às {formatarHora(inicio)}
      </div>
    </div>
  );
};

const formatarNumeroMinutos = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

export default Cronometro;
