# 18games

## Sistema de Cargos

### Promoção Automática
- Usuários são promovidos automaticamente de `membro` para `membro+` após 3 dias de criação da conta
- A promoção acontece de duas formas:
  1. Quando o usuário acessa seu perfil (verificação em tempo real)
  2. Através de uma Cloud Function que roda diariamente (verificação automática)

### Níveis de Cargo

1. **Membro**
   - Cargo inicial
   - Sem permissões de edição de perfil
   - Não pode criar posts
   - Não pode dar avaliações
   - Apenas visualização do conteúdo

2. **Membro+** (após 3 dias)
   - Pode editar nome de exibição
   - Pode mudar foto de perfil (sem GIF)
   - Pode criar posts
   - Pode dar avaliações

3. **VIP**
   - Pode editar nome de exibição
   - Pode mudar foto de perfil (com GIF)
   - Pode mudar banner (sem GIF)
   - Pode criar posts
   - Pode dar avaliações

4. **VIP+**
   - Nome com animação especial
   - Avatar com borda brilhante
   - Pode editar tudo
   - Pode usar GIF em foto e banner
   - Pode criar posts
   - Pode dar avaliações

5. **Admin**
   - Nome com animação arco-íris
   - Avatar com borda brilhante multicolor
   - Todas as permissões do VIP+
   - Animações exclusivas
   - Acesso total ao sistema

## Implementação Técnica

### Cloud Functions
- `autoPromoteMember`: Roda diariamente à meia-noite (horário de Brasília)
- Verifica e promove automaticamente usuários elegíveis

### Frontend
- Verificação em tempo real ao carregar o perfil
- Animações e permissões baseadas no cargo
- Sistema de upload de imagens com restrições por cargo
- Verificações de permissão para:
  - Criação de posts
  - Avaliações
  - Edição de perfil
