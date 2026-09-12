import { digitosParaMoeda } from '../../utils/formatters';

const LIMITE_DIGITOS = 11;

const valorParaDigitos = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '';
  const numero = typeof valor === 'number' ? valor : parseFloat(String(valor).replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(numero)) return '';
  return String(Math.round(numero * 100));
};

const MoneyInput = ({ value, onChange, onBlur, ...rest }) => {
  const digitos = valorParaDigitos(value);

  const handleChange = (e) => {
    const digitosDigitados = String(e.target.value).replace(/\D/g, '').slice(0, LIMITE_DIGITOS);
    if (digitosDigitados === '') {
      onChange('');
      return;
    }
    const numero = parseInt(digitosDigitados, 10) / 100;
    onChange(String(numero));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={digitos ? digitosParaMoeda(digitos) : ''}
      onChange={handleChange}
      onBlur={onBlur}
      {...rest}
    />
  );
};

export default MoneyInput;