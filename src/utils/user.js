export const getNomeConta = (user) => {
  const meta = user?.user_metadata;
  return meta?.full_name || meta?.name || null;
};

export const getNomeExibicao = (user) =>
  getNomeConta(user) || user?.email?.split('@')[0] || 'Usuário';
