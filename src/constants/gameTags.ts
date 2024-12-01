// Definição das categorias de tags
export const tagCategories = [
  { 
    id: 'game-engine',
    label: 'Engine do Jogo',
    tags: ['renpy', 'unity', 'unreal', 'rpgmaker', 'godot', 'html5', 'custom-engine']
  },
  { 
    id: 'visual-novel',
    label: 'Visual Novel',
    tags: ['multiple-routes', 'choices-matter', 'branching-story', 'stat-based', 'time-management', 
           'dating-sim', 'life-sim', 'story-rich', 'character-customization', 'romance-focused']
  },
  { 
    id: 'game-type',
    label: 'Tipo de Jogo',
    tags: ['3d-game', '3dcg', '2d-game', '2dcg', 'ai-cg', 'animated', 'censored', 'character-creation', 'kinetic-novel', 'japanese-game']
  },
  {
    id: 'protagonist',
    label: 'Protagonista',
    tags: ['male-protagonist', 'female-protagonist', 'futa-trans-protagonist', 'multiple-protagonist']
  },
  {
    id: 'game-features',
    label: 'Características do Jogo',
    tags: ['mobile-game', 'multiple-endings', 'real-porn', 'text-based', 'virtual-reality', 'voiced']
  },
  {
    id: 'basic-sexual',
    label: 'Conteúdo Sexual Básico',
    tags: ['anal-sex', 'ahegao', 'bdsm', 'big-ass', 'big-tits']
  },
  {
    id: 'advanced-sexual',
    label: 'Conteúdo Sexual Avançado',
    tags: ['blackmail', 'bukkake', 'cheating', 'corruption', 'creampie', 'dilf', 'drugs', 'exhibitionism', 
           'female-domination', 'footjob', 'furry', 'futa-trans', 'gay', 'group-sex', 'groping', 'handjob', 
           'harem', 'humiliation', 'incest', 'internal-view', 'interracial', 'lactation', 'lesbian', 'loli', 
           'male-domination']
  },
  {
    id: 'additional-sexual',
    label: 'Conteúdo Sexual Adicional',
    tags: ['masturbation', 'milf', 'multiple-penetration', 'necrophilia', 'netorare', 'oral-sex', 'pregnancy',
           'prostitution', 'rape', 'scat', 'sex-toys', 'sexual-harassment', 'shota', 'sissification', 'slave',
           'sleep-sex', 'spanking', 'stripping', 'swinging', 'tentacles', 'teasing', 'titfuck', 'transformation',
           'trap', 'urination', 'vaginal-sex', 'virgin', 'vore', 'voyeurism']
  },
  {
    id: 'gameplay',
    label: 'Elementos de Jogabilidade',
    tags: ['adventure', 'combat', 'cosplay', 'dating-sim', 'dystopian', 'fantasy', 'graphic-violence', 'horror',
           'humor', 'management', 'mind-control', 'monster', 'monster-girl', 'no-sexual-content', 'paranormal',
           'parody', 'platformer', 'point-and-click', 'possession', 'pov', 'puzzle', 'religion', 'romance',
           'rpg', 'sandbox', 'school-setting', 'sci-fi', 'shooter', 'side-scroller', 'simulator', 'strategy',
           'superpowers', 'trainer', 'turn-based-combat', 'twins']
  }
];

export const gameTags = [
  // Engine do Jogo
  { id: 'renpy', label: 'Ren\'Py', color: 'purple' },
  { id: 'unity', label: 'Unity', color: 'gray' },
  { id: 'unreal', label: 'Unreal Engine', color: 'blue' },
  { id: 'rpgmaker', label: 'RPG Maker', color: 'red' },
  { id: 'godot', label: 'Godot', color: 'green' },
  { id: 'html5', label: 'HTML5', color: 'orange' },
  { id: 'custom-engine', label: 'Engine Customizada', color: 'cyan' },
  // Visual Novel
  { id: 'multiple-routes', label: 'Múltiplas Rotas', color: 'pink' },
  { id: 'choices-matter', label: 'Escolhas Importantes', color: 'purple' },
  { id: 'branching-story', label: 'História Ramificada', color: 'blue' },
  { id: 'stat-based', label: 'Baseado em Stats', color: 'green' },
  { id: 'time-management', label: 'Gerenciamento de Tempo', color: 'yellow' },
  { id: 'dating-sim', label: 'Simulador de Encontros', color: 'pink' },
  { id: 'life-sim', label: 'Simulador de Vida', color: 'teal' },
  { id: 'story-rich', label: 'Rico em História', color: 'purple' },
  { id: 'character-customization', label: 'Customização de Personagem', color: 'blue' },
  { id: 'romance-focused', label: 'Focado em Romance', color: 'red' },

  // Tipos de Jogo
  { id: '3d-game', label: 'Jogo 3D', color: 'blue' },
  { id: '3dcg', label: '3DCG', color: 'blue' },
  { id: '2d-game', label: 'Jogo 2D', color: 'green' },
  { id: '2dcg', label: '2DCG', color: 'green' },
  { id: 'ai-cg', label: 'AI CG', color: 'purple' },
  { id: 'animated', label: 'Animado', color: 'orange' },
  { id: 'censored', label: 'Censurado', color: 'red' },
  { id: 'character-creation', label: 'Criação de Personagem', color: 'blue' },
  { id: 'kinetic-novel', label: 'Kinetic Novel', color: 'pink' },
  { id: 'japanese-game', label: 'Jogo Japonês', color: 'red' },
  
  // Protagonista
  { id: 'male-protagonist', label: 'Protagonista Masculino', color: 'blue' },
  { id: 'female-protagonist', label: 'Protagonista Feminino', color: 'pink' },
  { id: 'futa-trans-protagonist', label: 'Protagonista Futa/Trans', color: 'purple' },
  { id: 'multiple-protagonist', label: 'Múltiplos Protagonistas', color: 'teal' },
  
  // Características do Jogo
  { id: 'mobile-game', label: 'Jogo Mobile', color: 'gray' },
  { id: 'multiple-endings', label: 'Múltiplos Finais', color: 'purple' },
  { id: 'real-porn', label: 'Real Porn', color: 'red' },
  { id: 'text-based', label: 'Baseado em Texto', color: 'gray' },
  { id: 'virtual-reality', label: 'Realidade Virtual', color: 'cyan' },
  { id: 'voiced', label: 'Com Vozes', color: 'green' },
  
  // Conteúdo Sexual Básico
  { id: 'anal-sex', label: 'Sexo Anal', color: 'red' },
  { id: 'ahegao', label: 'Ahegao', color: 'pink' },
  { id: 'bdsm', label: 'BDSM', color: 'purple' },
  { id: 'big-ass', label: 'Bumbum Grande', color: 'orange' },
  { id: 'big-tits', label: 'Seios Grandes', color: 'orange' },

  // Conteúdo Sexual Avançado
  { id: 'blackmail', label: 'Chantagem', color: 'red' },
  { id: 'bukkake', label: 'Bukkake', color: 'red' },
  { id: 'cheating', label: 'Traição', color: 'red' },
  { id: 'corruption', label: 'Corrupção', color: 'purple' },
  { id: 'creampie', label: 'Creampie', color: 'red' },
  { id: 'dilf', label: 'DILF', color: 'blue' },
  { id: 'drugs', label: 'Drogas', color: 'red' },
  { id: 'exhibitionism', label: 'Exibicionismo', color: 'orange' },
  { id: 'female-domination', label: 'Dominação Feminina', color: 'pink' },
  { id: 'footjob', label: 'Footjob', color: 'orange' },
  { id: 'furry', label: 'Furry', color: 'orange' },
  { id: 'futa-trans', label: 'Futa/Trans', color: 'purple' },
  { id: 'gay', label: 'Gay', color: 'blue' },
  { id: 'group-sex', label: 'Sexo em Grupo', color: 'red' },
  { id: 'groping', label: 'Apalpar', color: 'orange' },
  { id: 'handjob', label: 'Handjob', color: 'orange' },
  { id: 'harem', label: 'Harém', color: 'pink' },
  { id: 'humiliation', label: 'Humilhação', color: 'red' },
  { id: 'incest', label: 'Incesto', color: 'red' },
  { id: 'internal-view', label: 'Visão Interna', color: 'red' },
  { id: 'interracial', label: 'Interracial', color: 'orange' },
  { id: 'lactation', label: 'Lactação', color: 'orange' },
  { id: 'lesbian', label: 'Lésbica', color: 'pink' },
  { id: 'loli', label: 'Loli', color: 'pink' },
  { id: 'male-domination', label: 'Dominação Masculina', color: 'blue' },

  // Conteúdo Sexual Adicional
  { id: 'masturbation', label: 'Masturbação', color: 'orange' },
  { id: 'milf', label: 'MILF', color: 'pink' },
  { id: 'multiple-penetration', label: 'Penetração Múltipla', color: 'red' },
  { id: 'necrophilia', label: 'Necrofilia', color: 'red' },
  { id: 'netorare', label: 'Netorare', color: 'purple' },
  { id: 'oral-sex', label: 'Sexo Oral', color: 'red' },
  { id: 'pregnancy', label: 'Gravidez', color: 'pink' },
  { id: 'prostitution', label: 'Prostituição', color: 'red' },
  { id: 'rape', label: 'Estupro', color: 'red' },
  { id: 'scat', label: 'Scat', color: 'brown' },
  { id: 'sex-toys', label: 'Brinquedos Sexuais', color: 'pink' },
  { id: 'sexual-harassment', label: 'Assédio Sexual', color: 'red' },
  { id: 'shota', label: 'Shota', color: 'blue' },
  { id: 'sissification', label: 'Sissificação', color: 'pink' },
  { id: 'slave', label: 'Escravidão', color: 'red' },
  { id: 'sleep-sex', label: 'Sexo Durante Sono', color: 'purple' },
  { id: 'spanking', label: 'Spanking', color: 'red' },
  { id: 'stripping', label: 'Strip', color: 'pink' },
  { id: 'swinging', label: 'Swing', color: 'orange' },
  { id: 'tentacles', label: 'Tentáculos', color: 'purple' },
  { id: 'teasing', label: 'Provocação', color: 'pink' },
  { id: 'titfuck', label: 'Titfuck', color: 'orange' },
  { id: 'transformation', label: 'Transformação', color: 'purple' },
  { id: 'trap', label: 'Trap', color: 'pink' },
  { id: 'urination', label: 'Urina', color: 'yellow' },
  { id: 'vaginal-sex', label: 'Sexo Vaginal', color: 'red' },
  { id: 'virgin', label: 'Virgem', color: 'pink' },
  { id: 'vore', label: 'Vore', color: 'red' },
  { id: 'voyeurism', label: 'Voyeurismo', color: 'purple' },

  // Elementos de Jogabilidade
  { id: 'adventure', label: 'Aventura', color: 'green' },
  { id: 'combat', label: 'Combate', color: 'red' },
  { id: 'cosplay', label: 'Cosplay', color: 'pink' },
  { id: 'dating-sim', label: 'Simulador de Encontros', color: 'pink' },
  { id: 'dystopian', label: 'Distópico', color: 'gray' },
  { id: 'fantasy', label: 'Fantasia', color: 'purple' },
  { id: 'graphic-violence', label: 'Violência Gráfica', color: 'red' },
  { id: 'horror', label: 'Horror', color: 'red' },
  { id: 'humor', label: 'Humor', color: 'yellow' },
  { id: 'management', label: 'Gerenciamento', color: 'blue' },
  { id: 'mind-control', label: 'Controle Mental', color: 'purple' },
  { id: 'monster', label: 'Monstro', color: 'red' },
  { id: 'monster-girl', label: 'Monster Girl', color: 'pink' },
  { id: 'no-sexual-content', label: 'Sem Conteúdo Sexual', color: 'gray' },
  { id: 'paranormal', label: 'Paranormal', color: 'purple' },
  { id: 'parody', label: 'Paródia', color: 'yellow' },
  { id: 'platformer', label: 'Plataforma', color: 'green' },
  { id: 'point-and-click', label: 'Point & Click', color: 'blue' },
  { id: 'possession', label: 'Possessão', color: 'purple' },
  { id: 'pov', label: 'POV', color: 'orange' },
  { id: 'puzzle', label: 'Puzzle', color: 'blue' },
  { id: 'religion', label: 'Religião', color: 'yellow' },
  { id: 'romance', label: 'Romance', color: 'pink' },
  { id: 'rpg', label: 'RPG', color: 'blue' },
  { id: 'sandbox', label: 'Sandbox', color: 'green' },

  // Configurações e Mecânicas Adicionais
  { id: 'school-setting', label: 'Ambiente Escolar', color: 'blue' },
  { id: 'sci-fi', label: 'Ficção Científica', color: 'cyan' },
  { id: 'shooter', label: 'Tiro', color: 'red' },
  { id: 'side-scroller', label: 'Side-Scroller', color: 'green' },
  { id: 'simulator', label: 'Simulador', color: 'blue' },
  { id: 'strategy', label: 'Estratégia', color: 'blue' },
  { id: 'superpowers', label: 'Superpoderes', color: 'purple' },
  { id: 'trainer', label: 'Trainer', color: 'blue' },
  { id: 'turn-based-combat', label: 'Combate por Turnos', color: 'red' },
  { id: 'twins', label: 'Gêmeos', color: 'pink' },

  // Assets - Parte 1
  { id: 'asset-addon', label: 'Asset: Addon', color: 'gray' },
  { id: 'asset-ai-shoujo', label: 'Asset: AI Shoujo', color: 'purple' },
  { id: 'asset-animal', label: 'Asset: Animal', color: 'brown' },
  { id: 'asset-animation', label: 'Asset: Animação', color: 'blue' },
  { id: 'asset-audio', label: 'Asset: Áudio', color: 'green' },
  { id: 'asset-bundle', label: 'Asset: Bundle', color: 'blue' },
  { id: 'asset-character', label: 'Asset: Personagem', color: 'pink' },
  { id: 'asset-clothing', label: 'Asset: Roupa', color: 'purple' },
  { id: 'asset-daz-gen1', label: 'Asset: DAZ Gen1', color: 'gray' },
  { id: 'asset-daz-gen2', label: 'Asset: DAZ Gen2', color: 'gray' },
  { id: 'asset-daz-gen3', label: 'Asset: DAZ Gen3', color: 'gray' },
  { id: 'asset-daz-gen8', label: 'Asset: DAZ Gen8', color: 'gray' },
  { id: 'asset-daz-gen81', label: 'Asset: DAZ Gen8.1', color: 'gray' },
  { id: 'asset-daz-gen9', label: 'Asset: DAZ Gen9', color: 'gray' },
  { id: 'asset-daz-m4', label: 'Asset: DAZ M4', color: 'gray' },
];

export const downloadSites = [
  'MEGA',
  'MediaFire',
  'Google Drive',
  'Catbox',
  'Outro'
];
