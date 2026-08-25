export const getNomeConta = (user) => {
  const meta = user?.user_metadata;
  return meta?.full_name || meta?.name || null;
};

export const getNomeExibicao = (user) =>
  getNomeConta(user) || user?.email?.split('@')[0] || 'Usuário';

export const getFotoGoogle = (user) =>
  user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

export const getFotoExibicao = (user, fotoSalva, fotoRemovida) => {
  if (fotoSalva) return fotoSalva;
  return fotoRemovida ? null : getFotoGoogle(user);
};
