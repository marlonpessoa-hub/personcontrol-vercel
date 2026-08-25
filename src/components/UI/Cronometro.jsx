import { useState, useEffect } from 'react';
import { formatarHora } from '../../utils/formatters';

const Cronometro = ({ inicio }) => {
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const diff = agora - new Date(inicio);
  const horas = Math.floor(diff / 3600000);
  const minutos = Math.floor((diff % 3600000) / 60000);
  const segundos = Math.floor((diff % 60000) / 1000);

  const formatar = (n) => String(n).padStart(2, '0');

  return (
    <div className="cronometro" data-od-id="cronometro">
      <div className="cronometro-label">TEMPO DE JORNADA</div>
      <div className="cronometro-value" data-od-id="cronometro-value">
        {formatar(horas)}:{formatar(minutos)}:{formatar(segundos)}
      </div>
      <div className="cronometro-start">
        Início às {formatarHora(inicio)}
      </div>
    </div>
  );
};

export default Cronometro;
