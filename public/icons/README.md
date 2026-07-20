# Ícones do PWA

`icon.svg` reutiliza o símbolo de casa e as cores já presentes na interface do Minha Morada. O manifesto usa esse vetor escalável sem introduzir uma marca genérica.

Quando os arquivos oficiais da identidade visual estiverem disponíveis, exporte também:

- `icon-192.png` — 192 × 192 px;
- `icon-512.png` — 512 × 512 px;
- `icon-maskable-512.png` — 512 × 512 px, com o conteúdo principal dentro da área segura central.

Depois, inclua esses arquivos em `manifest.webmanifest`, mantendo o SVG como fallback. PNG em 192 e 512 px oferece a compatibilidade mais ampla entre navegadores e sistemas operacionais.
