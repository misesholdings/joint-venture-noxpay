# Joint Venture Intention — Mises Pagamentos

Documento web (single-page) de **intenção de Joint Venture** da
**MISES PAGAMENTOS LTDA** (CNPJ 63.215.684/0001-69), construído sobre o
**Mises Design System**.

A página é navegável no browser e foi otimizada para exportação em **PDF (A4)**
diretamente do navegador.

---

## Estrutura de arquivos

```
Joint-Venture/
├── index.html                 # Página principal (10 seções)
├── styles.css                 # Overrides e estilos específicos da página
├── mises-design-system.css    # Design system base (tokens, componentes, utilitários)
├── script.js                  # Theme toggle, scroll spy, fade in, datas
└── README.md
```

## Seções

1. **Nav** — links âncora + toggle dark/light + botão "Exportar PDF"
2. **Hero / Capa** — título editorial, eyebrow "Intenção de Joint Venture", metadados (destinatário, data, CNPJ)
3. **Sumário Executivo** — racional da proposta + 3 pilares (objetivo, horizonte, aporte)
4. **A Empresa** — razão social, CNPJ, IE/IM, endereço, quadro societário, CNAEs
5. **O Time** — comparação **atual vs antigo** (cargos/funções), com banner de **corte de gastos** (redução mensal, %, anualizada e nº de posições)
6. **O Produto** — descrição do produto em operação hoje + features + status, segmento, stack e regulação
7. **Financeiro** — KPIs (saldo da empresa, saldo dos clientes, custo mensal) + detalhamento em 3 cards
8. **Receita** — KPIs (atual, M+3, crescimento, acumulado 3m) + gráfico CSS de evolução (atual + 3 meses projetados) + premissas
9. **Proposta de Parceria** — modelo, contribuições, governança e cronograma em 4 etapas
10. **CTA / Contato** — card escuro com call-to-action e contatos
11. **Footer** — dados legais e versão do documento

## Como usar

### 1. Abrir localmente

Como é HTML estático, basta abrir `index.html` no navegador:

```bash
open index.html
```

Ou subir um servidor local (recomendado para evitar problemas de CORS com fontes):

```bash
# Python 3
python3 -m http.server 8080
# Node (npx)
npx serve .
```

E acessar `http://localhost:8080`.

### 2. Editar conteúdo

Todos os campos editáveis estão marcados com `[colchetes]` ou `—` no `index.html`.
Procure por `[` para encontrá-los rapidamente.

Campos principais a preencher:

- **Hero**: destinatário, data preenchida automaticamente
- **Empresa**: nome fantasia, IE/IM, data de constituição, regime tributário, capital social, endereço, CNAEs, sócios
- **Time**: cargos/função/custo do time antigo e do atual; valores do banner de redução (mensal, %, anualizada, nº de posições)
- **Produto**: nome, descrição, features, status, segmento, stack, regulação
- **Financeiro**: saldo da empresa (conta movimento + aplicações), saldo dos clientes (custodiado), custo mensal (folha + infra + administrativo)
- **Receita**: receita atual, projeção M+1/M+2/M+3, crescimento, premissas; ajuste a altura das barras alterando o `style="--val: XX%;"` em cada `.jv-chart-bar`
- **Proposta**: contribuições do parceiro
- **Contato**: e-mail e telefone

### 3. Exportar como PDF

Três formas de exportar:

1. **Botão "Exportar PDF"** no canto superior direito da página
2. **Atalho** `Cmd/Ctrl + P` → "Salvar como PDF"
3. **Menu Arquivo → Imprimir → Salvar como PDF**

A folha de estilo possui `@media print` configurado para **A4** com:

- Margens de `14mm × 12mm`
- Tema forçado para claro (mesmo se estiver em dark mode)
- Nav, toast e botões ocultos
- Quebras de página evitadas dentro de cards e tabelas
- Tipografia reduzida proporcionalmente
- CTA final mantido com inversão de cor para destaque

## Personalização

### Cores e tipografia

Todos os tokens do design system estão em `mises-design-system.css` como CSS
custom properties em `:root`. Para customizar a marca, edite por exemplo:

```css
:root {
  --brand: #111111;        /* cor primária */
  --accent: #10b981;       /* cor de acento */
  --font-serif: "DM Serif Display", Georgia, serif;
  --font-sans: "Inter", -apple-system, sans-serif;
}
```

### Dark mode

Toggle no canto superior direito. A preferência é persistida em `localStorage`
sob a chave `jv-theme`. Atalho de teclado: tecla `T`.

### Adicionar/remover seções

Cada seção é um `<section class="jv-section" id="...">` dentro de `<main>`.
Para adicionar uma nova:

1. Duplique um bloco `<section>` em `index.html`
2. Adicione um link na nav (`<a class="ds-tab" href="#nova-secao">…</a>`)
3. Pronto — o scroll-spy e o fade-in cuidarão do resto automaticamente

## Notas

- Documento **confidencial** — uso restrito ao destinatário
- Indicadores **não auditados**; dados detalhados ficam em data room sob NDA
- Versão atual: **1.0**
