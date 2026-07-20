# Minha Morada — Web, PWA e aplicativo mobile

Frontend do **Minha Morada**, aplicativo para acompanhar a jornada de compra de um imóvel, da aquisição à entrega das chaves. A mesma base Angular + Ionic atende navegador web, PWA instalável, Android via Capacitor e iOS via Capacitor.

## Stack

- Angular 21 LTS, standalone components e Reactive Forms
- Ionic 8
- Capacitor 7
- TypeScript 5.9 e SCSS
- Vitest e ESLint

Angular 21 e Capacitor 7 foram escolhidos por serem versões estáveis compatíveis com o Node.js 20 usado no projeto. O Capacitor 8 exige Node.js 22.

## Requisitos

- Node.js 20.19 ou superior
- npm 10 ou superior
- API Minha Morada em execução na porta `3000`
- Android Studio e SDK Android apenas para executar o app nativo
- macOS e Xcode apenas para gerar/executar iOS

## Instalação e desenvolvimento

```bash
cd APP
npm install
npm start
```

Abra `http://localhost:4200`. No estado atual, o environment de desenvolvimento chama `http://localhost:3000` diretamente. O projeto também mantém `proxy.conf.json`, que encaminha `/api` para esse backend quando `apiUrl` for configurada como `/api`.

## Configuração da API

- Desenvolvimento: `src/environments/environment.ts` usa `http://localhost:3000`; por ser uma alteração local de ambiente, ajuste conforme sua máquina sem versionar segredos.
- Produção/mobile: altere `apiUrl` em `src/environments/environment.production.ts` para o endereço HTTPS público real antes do build.
- Timeout padrão: 15 segundos, configurado nos environments.

### Atenção: CORS no backend

No estado atual, a API não chama `enableCors()` no bootstrap. Para usar a URL direta em desenvolvimento, um build web publicado ou uma chamada feita pelo WebView do Capacitor, o backend deverá liberar explicitamente as origens confiáveis do aplicativo. Como alternativa local, configure `apiUrl` como `/api` para usar o proxy já associado a `npm start`. O backend não foi modificado nesta entrega.

## Comandos

```bash
npm start              # servidor de desenvolvimento com proxy
npm run lint           # análise estática
npm test               # testes unitários, uma execução
npm run build          # build de produção
npm run cap:sync       # build e sincronização dos projetos nativos
npx cap sync           # sincronização sem executar o build
npx cap open android   # abre o projeto Android no Android Studio
```

Para adicionar uma plataforma em uma nova máquina, caso a pasta nativa ainda não exista:

```bash
npx cap add android
npx cap add ios
```

## Rotas

| Rota        | Acesso    | Finalidade                          |
| ----------- | --------- | ----------------------------------- |
| `/login`    | Pública   | Autenticação                        |
| `/register` | Pública   | Criação de conta e login automático |
| `/home`     | Protegida | Placeholder para validar a sessão   |

Rotas desconhecidas e a raiz redirecionam para `/login`. O `AuthGuard` bloqueia `/home` quando não existe access token.

## Endpoints utilizados

| Endpoint              | Request                     | Response principal                    |
| --------------------- | --------------------------- | ------------------------------------- |
| `POST /auth/register` | `{ name, email, password }` | `{ user, accessToken, refreshToken }` |
| `POST /auth/login`    | `{ email, password }`       | `{ user, accessToken, refreshToken }` |
| `POST /auth/refresh`  | `{ refreshToken }`          | `{ user, accessToken, refreshToken }` |
| `GET /auth/me`        | Bearer access token         | usuário público                       |

Os contratos refletem diretamente os DTOs da API. O cadastro valida nome entre 2 e 120 caracteres, email válido e senha entre 8 e 72 caracteres. `confirmPassword` existe somente no formulário do frontend e não é enviado ao backend.

Como o cadastro já retorna os tokens e o usuário, a aplicação salva a sessão e segue diretamente para `/home`.

## Arquitetura de autenticação

```text
src/app/
├── core/auth/
│   ├── guards/          # proteção de rotas
│   ├── interceptors/    # Bearer e renovação em respostas 401
│   ├── models/          # requests e responses da API
│   └── services/        # AuthService e armazenamento de tokens
├── features/
│   ├── auth/pages/      # Login e Cadastro
│   └── home/pages/      # Home placeholder
└── shared/components/   # Marca e navegação compartilhadas
```

O interceptor inclui `Authorization: Bearer` apenas nas chamadas privadas da API. Em um `401`, usa o refresh token rotativo e repete a requisição uma vez. A operação de refresh é compartilhada (`shareReplay`), evitando várias renovações simultâneas. Se ela falhar, a sessão local é apagada e o usuário volta ao login.

## Gerenciamento de tokens

`TokenStorageService` centraliza todo o acesso aos tokens e usa `@capacitor/preferences`. Isso é melhor que espalhar chamadas a `localStorage` e funciona em web e Capacitor.

`Preferences` não é um cofre criptográfico. Antes de uma publicação que exija maior proteção contra comprometimento do dispositivo, substitua somente essa implementação por Keychain (iOS) e Keystore/EncryptedSharedPreferences (Android), mantendo os consumidores inalterados. Access e refresh tokens nunca são exibidos em logs ou mensagens.

## PWA

O build de produção inclui o Service Worker oficial do Angular e o manifesto do Minha Morada. A aplicação pode ser instalada em navegadores compatíveis com aparência `standalone`; no runtime Android/iOS do Capacitor, registro, instalação e atualização PWA ficam desabilitados por `Capacitor.isNativePlatform()`, preservando o comportamento nativo.

### Build e teste local

`ng serve`/`npm start` usa a configuração de desenvolvimento e não registra o Service Worker. Para testar o PWA, gere e sirva o build de produção por HTTP em `localhost`:

```bash
npm run build
npx serve -s dist/APP/browser -l 8080
```

`serve` pode ser executado via `npx` sem ser dependência de produção; a opção `-s` fornece o fallback de SPA para `index.html`. Abra `http://localhost:8080` e, no DevTools do navegador:

1. Em **Application > Manifest**, valide nome, modo `standalone`, escopo e ícone.
2. Em **Application > Service Workers**, confirme que `ngsw-worker.js` está ativado.
3. Em **Cache Storage**, confirme os grupos `app-shell` e `static-assets`.
4. Use o menu do navegador ou o ícone da barra de endereços para instalar o aplicativo.
5. Recarregue diretamente `/login`, `/register` e `/home` para validar o fallback de navegação.

O evento `beforeinstallprompt` não existe em todos os navegadores. `PwaInstallService` guarda esse evento quando disponível e expõe `canInstall`/`promptInstall()` para um futuro botão “Instalar Minha Morada”. No iOS, a instalação normalmente é feita pela ação **Adicionar à Tela de Início** do Safari.

### Hospedagem, HTTPS e rotas

Em produção, publique todos os arquivos de `dist/APP/browser` por HTTPS. Service Workers exigem contexto seguro; `localhost` é a exceção aceita pelos navegadores para desenvolvimento.

O servidor/CDN deve redirecionar requisições de rotas que não correspondam a arquivos — por exemplo `/login`, `/register` e `/home` — para `/index.html`, sempre com status adequado. Essa regra é necessária para acesso direto e atualização de página antes de o Service Worker controlar a aplicação. Não redirecione arquivos estáticos nem endpoints da API para `index.html`.

### Cache e funcionamento offline

`ngsw-config.json` usa duas políticas:

- `app-shell`: `index.html`, manifesto, favicon, CSS e JavaScript são baixados antecipadamente (`prefetch`).
- `static-assets`: imagens, ícones, fontes e demais assets são armazenados sob demanda (`lazy`) e atualizados antecipadamente quando uma nova versão é instalada.

Não existem `dataGroups`. Portanto, o Service Worker não armazena respostas da API, chamadas autenticadas, dados pessoais, login, cadastro ou refresh token. Tokens continuam exclusivamente no mecanismo existente baseado em Capacitor Preferences. O PWA abre a estrutura já armazenada quando possível, mas não oferece sincronização offline; operações dependentes da API exibem uma mensagem amigável quando o navegador está sem conexão.

### Atualizações

`PwaUpdateService` acompanha eventos do `SwUpdate` e consulta novas versões após a estabilização da aplicação e, depois, a cada seis horas. Quando uma versão fica pronta, um aviso mostra “Uma nova versão do Minha Morada está disponível.” com as ações **Depois** e **Atualizar**. A versão só é ativada e a página só é recarregada após a confirmação do usuário.

### Ícones

O manifesto usa `public/icons/icon.svg`, derivado do símbolo de casa e das cores já usadas pela interface. Para compatibilidade máxima, quando a identidade visual oficial estiver disponível, adicione também PNGs 192 × 192, 512 × 512 e um 512 × 512 `maskable`, conforme instruções em `public/icons/README.md`, e registre-os no manifesto.

### Capacitor

O diretório web permanece `dist/APP/browser`; `capacitor.config.ts`, Android, plugins e armazenamento de tokens não foram alterados. Para atualizar os projetos nativos:

```bash
npm run cap:sync
# ou, após um build já realizado:
npx cap sync
```

A dependência de iOS está instalada, mas a pasta `ios/` não está versionada neste checkout. Em macOS, ela pode ser adicionada com `npx cap add ios` quando necessário.

## UX mobile

As páginas usam componentes Ionic, safe areas, scroll do `ion-content`, inputs com autocomplete e teclado apropriado, botões com área de toque confortável e estados de loading. O layout foi ajustado para larguras a partir de 320 px, com foco em 360×800, 390×844 e 412×915.
