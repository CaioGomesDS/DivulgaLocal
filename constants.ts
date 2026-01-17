
export const DAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const INITIAL_CATEGORIES: any[] = [
  {
    id: 'fb',
    name: 'Facebook',
    items: [
      { id: 'fb-page', label: 'Postagem da Página', completed: false, text: '', images: '', tags: '' },
      { id: 'fb-market', label: 'Marketplace', completed: false, text: '', images: '', tags: '' },
      { id: 'fb-group', label: 'Grupo', completed: false, text: '', images: '', tags: '' }
    ]
  },
  {
    id: 'ig',
    name: 'Instagram',
    items: [
      { id: 'ig-post', label: 'Postagem', completed: false, text: '', images: '', tags: '' },
      { id: 'ig-story', label: 'Status (Stories)', completed: false, text: '', images: '', tags: '' },
      { id: 'ig-reels', label: 'Reels', completed: false, text: '', images: '', tags: '' }
    ]
  },
  {
    id: 'wa',
    name: 'WhatsApp',
    items: [
      { id: 'wa-status', label: 'Status', completed: false, text: '', images: '', tags: '' }
    ]
  },
  {
    id: 'olx',
    name: 'OLX',
    items: [
      { id: 'olx-ads', label: 'Anúncios', completed: false, text: '', images: '', tags: '' }
    ]
  },
  {
    id: 'tt',
    name: 'TikTok',
    items: [
      { id: 'tt-services', label: 'Serviços', completed: false, text: '', images: '', tags: '' },
      { id: 'tt-auction', label: 'Leilão', completed: false, text: '', images: '', tags: '' }
    ]
  },
  {
    id: 'ge',
    name: 'Google Empresa',
    items: [
      { id: 'ge-post', label: 'Postagem', completed: false, text: '', images: '', tags: '' }
    ]
  }
];
