-- Adiciona coluna valor_por_hora na tabela jornadas
ALTER TABLE jornadas ADD COLUMN IF NOT EXISTS valor_por_hora NUMERIC DEFAULT 0;

-- Preenche valor_por_hora para jornadas já finalizadas
UPDATE jornadas
SET valor_por_hora = CASE
  WHEN duracao_minutos > 0 THEN ROUND(total_ganho / (duracao_minutos::NUMERIC / 60), 2)
  ELSE 0
END
WHERE data_fim IS NOT NULL;
