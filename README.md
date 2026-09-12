# Wallpaper Generator

Каталог из **105 алгоритмов-генераторов абстрактных обоев** в браузере. Vanilla JS, без зависимостей, без сборщика. Canvas 2D, реальное время, экспорт PNG + WebM, шаринг через URL-параметры.

![Domain Warp](./docs/preview-domainwarp.png)

## Что внутри

**105 стилей** в **7 категориях**:

- **Поток** (1) — частицы в векторных полях.
- **Шум** (10) — fBM, домен-варп, туманности, пески.
- **Геометрия** (29) — параметрические кривые, тесселяции, симметрии, узлы.
- **Алгоритмы** (25) — фракталы, L-системы, аттракторы, цепи, графы.
- **Точки** (10) — фибоначчи, пуантилизм, руны, пыльца.
- **Текстуры** (17) — мрамор, дерево, ткани, штриховка, кольчуга.
- **Органические** (19) — огонь, вода, лава, молнии, дым.

12 курируемых палитр, переключение режима «static / animated», запись в WebM.

## Каталог стилей

### Поток

- **Curl Flow** (`id=curlflow`) — Частицы в divergence-free поле — настоящие вихри, без слипания.

### Шум

- **Domain Warp** (`id=domainwarp`) — Шум, искажённый другим шумом — течения и инцепшен-узоры.
- **Topographic** (`id=topography`) — Изолинии по шумовому полю — географическая карта рельефа.
- **Log-Polar Spiral** (`id=logpolar`) — Шум, развернутый в лог-полярные координаты — галактики и воронки.
- **Billow Noise** (`id=billow`) — «Пухлый» fBM на основе |noise| — облака, вата.
- **Ridged Multifractal** (`id=ridged`) — «Горные хребты»: 1 - |noise| на октавах.
- **Nebula** (`id=nebula`) — Туманность: fBM-облака + точечные звёзды разной яркости.
- **Gradient Mesh** (`id=gradient_mesh`) — Mesh gradient: радиальные градиенты в случайных точках с накоплением.
- **Sand Dunes** (`id=sandhills`) — Песчаные дюны: силуэт из шумовых слоёв.

### Геометрия

- **Voronoi Cells** (`id=voronoi`) — Клеточные диаграммы Worley — трещины, кораллы, стёкла.
- **Truchet Tiles** (`id=truchet`) — Случайные изогнутые дуги на сетке — мозаика Escher-стиля.
- **Spirograph** (`id=spirograph`) — Гипотрохоиды — математические узоры, классическая игрушка.
- **Concentric Rings** (`id=concentric`) — Концентрические кольца с шумовой деформацией — Tunnel-стиль.
- **Hex Grid** (`id=hexgrid`) — Шестиугольные соты с шумовым смещением центров и заливкой.
- **Barcode** (`id=barcode`) — Штрих-код: случайные полосы разной ширины.
- **Brick Wall** (`id=brick`) — Кирпичная кладка с шумовыми вариациями каждого кирпича.
- **Lissajous** (`id=lissajous`) — Кривые Лиссажу — параметрические фигуры из двух синусов.
- **Polar Rose** (`id=polarrose`) — Полярная роза: r = cos(k·θ), параметрические лепестки.
- **Archimedean Spiral** (`id=archimedes`) — Спираль Архимеда r = a + b·θ с несколькими лопастями.
- **Clover Grid** (`id=clover`) — Сетка из 4 сцепленных окружностей (квадратный клевер).
- **Hyperbolic Tessellation** (`id=tessellation`) — Гиперболическая тесселяция в круге Пуанкаре.
- **Celtic Knot** (`id=celtic`) — Кельтский узор: переплетающиеся ленты вокруг кругов.
- **Triangulation** (`id=triangles`) — Триангуляция случайных точек с раскраской треугольников.
- **Diamond Grid** (`id=diamonds`) — Сетка из ромбов с шумовыми вариациями.
- **Compass Rose** (`id=compass`) — Роза ветров: N стрелок, кольца и метки.
- **Spring** (`id=spring`) — Пружина: синусоидальная лента между двумя точками.
- **Gears** (`id=gears`) — Сцепленные шестерни с зубцами.
- **Shards** (`id=shards`) — Осколки: случайные многоугольники с острыми углами.
- **Azulejo** (`id=azulejo`) — Азулежу: квадратная плитка с крестообразным узором в центре.
- **Neon** (`id=neon`) — Неон: кривые линии с сильным glow.
- **Curved Stripes** (`id=stripes_curved`) — Изогнутые полосы по шумовой топологии.
- **Diagonal Stripes** (`id=stripesdiag`) — Диагональные полосы с шумовым смещением.
- **Waves Grid** (`id=waves_grid`) — Синусоидальные волны по двум осям.
- **Rings Stack** (`id=rings3`) — Стопка толстых колец разного размера.
- **Strings** (`id=strings`) — Струны: нити между опорами, провисающие под гравитацией.
- **Squiggles** (`id=squiggles`) — Случайные закорючки из кривых Безье.

### Алгоритмы

- **Reaction-Diffusion** (`id=reactiondiffusion`) — Gray-Scott: A и B диффундируют и взаимодействуют. Кораллы, лабиринты, митозы.
- **Mandelbrot / Julia** (`id=mandelbrot`) — Escape-time фрактал: классический Mandelbrot или Julia-вариация.
- **L-System Trees** (`id=lsystem`) — Фрактальные деревья через L-system — turtle-графика.
- **Maze** (`id=maze`) — Рекурсивный backtracker: каждый кадр — новый лабиринт.
- **Hilbert Curve** (`id=hilbert`) — Рекурсивная space-filling кривая Гильберта.
- **Dragon Curve** (`id=dragon`) — Фрактальная драконья кривая (Harter–Heighway).
- **Sierpinski Triangle** (`id=sierpinski`) — Рекурсивный фрактал Серпинского (треугольник).
- **Frost** (`id=frost`) — Иней: ветвящиеся кристаллы с 6-лучевой симметрией.
- **Julia Set** (`id=julia`) — Множество Жюлиа для комплексной квадратичной формы.
- **Newton Fractal** (`id=newton`) — Фрактал Ньютона для z³ - 1 = 0: три цвета притяжения.
- **Burning Ship** (`id=burning`) — Burning Ship: |Re|+|Im|, искажённый родственник Мандельброта.
- **Metaballs** (`id=metaballs`) — Метаболы: marching squares по изоповерхности суммы полей.
- **Fractal Tree** (`id=tree`) — Рекурсивное фрактальное дерево с настраиваемым ветвлением.
- **Barnsley Fern** (`id=fern`) — Папоротник Барнсли: IFS-точки с четырьмя аффинными преобразованиями.
- **Wire Net** (`id=wire`) — Связный граф с ближайшими соседями: рёбра + узлы.
- **Cantor Dust** (`id=cantor`) — Канторовская пыль: квадрантное деление с вероятностью.
- **Chains** (`id=chains`) — Цепи: соединённые эллиптические звенья.
- **Sorting Art** (`id=sorting`) — Сортировка: каждый кадр — состояние массива при сортировке.
- **Circuit Board** (`id=circuit`) — Печатная плата: ортогональные проводники и чипы.
- **Lorenz Attractor** (`id=lorenz`) — Странный аттрактор Лоренца в 3D-проекции.
- **Flowsnake** (`id=flowsnake`) — L-system фрактал Gosper (flowsnake).
- **Flowsnake 2** (`id=flowsnake2`) — Peano-Gosper кривая с раскраской по глубине.
- **Branches** (`id=branches`) — Ветви с листьями: рекурсивные разветвления.
- **Net Graph** (`id=netgraph`) — Сетевой граф: связи с рандомными узлами и подсветкой по числу рёбер.
- **Messy Hair** (`id=messyhair`) — Путаница: случайные Безье-кривые между точками.

### Точки

- **Stippling** (`id=stippling`) — Тысячи точек, плотность которых следует за noise-полем.
- **Phyllotaxis** (`id=phyllotaxis`) — Спираль Фибоначчи по золотому углу — подсолнух / шишка.
- **Glyphs** (`id=glyphs`) — Сетка разнообразных глифов и символов.
- **Pulse** (`id=pulse`) — Случайные центры с расширяющимися кольцами-волнами.
- **Scatter** (`id=scatter`) — Точки, разбросанные по шумовой плотности.
- **Sparkling Stars** (`id=stars`) — Звёзды с лучами: случайный размер, яркость и ориентация.
- **Orbital Trails** (`id=orbital`) — Орбитальные трассы: следы из частиц, летящих по гладким петлям.
- **Dot Grid** (`id=dotgrid`) — Точечная сетка с яркостью по шуму.
- **Pollen** (`id=pollen`) — Пыльца: кольца из точек вокруг центров.
- **Runic** (`id=runic`) — Магические руны: символы Unicode на «пергаменте».

### Текстуры

- **Halftone** (`id=halftone`) — Растровая полутоновая сетка в стиле газетной печати.
- **Cracked Earth** (`id=cracked`) — Ломаная земля — Voronoï с заливкой в землистых тонах и трещинами.
- **Weave** (`id=weave`) — Переплетение горизонтальных и вертикальных нитей.
- **Plaid** (`id=plaid`) — Шотландская клетка: полосы разной ширины с пересечениями.
- **Portholes** (`id=porthole`) — Сетка иллюминаторов: концентрические круги с бликом.
- **Mosaic** (`id=mosaic`) — Мозаика: Вороной с шумовыми краями и палитрой по тайлам.
- **Stained Glass** (`id=stainedglass`) — Витраж: Вороной с толстым тёмным контуром.
- **Wood** (`id=wood`) — Дерево: волокна из деформированного шума.
- **Marble** (`id=marble`) — Мрамор: sin-полосы, деформированные шумом.
- **Rock** (`id=rock`) — Камень: неровные куски с шумовыми трещинами.
- **Bubblewrap** (`id=bubblewrap`) — Пузырчатая плёнка: гекс-сетка пузырей с градиентами.
- **Hatching** (`id=hatching`) — Штриховка: параллельные линии с шумовой плотностью.
- **Sand** (`id=sand`) — Песок: мелкое зерно с шумовыми областями разной яркости.
- **Bars** (`id=bars`) — Горизонтальные полосы со случайной толщиной.
- **Spectrum** (`id=spectrum`) — Спектр: столбцы разной высоты по шуму.
- **Honeycomb 3D** (`id=honeycomb3d`) — Псевдо-3D соты: каждый шестиугольник с градиентом и тенью.
- **Chainmail** (`id=chainmail`) — Кольчуга: кольца в шахматном порядке с градиентами.

### Органические

- **Caustics** (`id=caustics`) — Сумма бегущих волн — лучи света под водой.
- **Asemic Writing** (`id=asemic`) — Генеративная каллиграфия — плавные нечитаемые штрихи.
- **Inkblot** (`id=inkblot`) — Симметричные чернильные кляксы (тест Роршаха).
- **Waves** (`id=waves`) — Сетка пересекающихся синусоид разных частот.
- **Water** (`id=water`) — Водная поверхность: перлин + синусы с зеркальным бликом.
- **Fire** (`id=fire`) — Огонь: восходящие шумовые колонны с цветовым градиентом.
- **Kaleidoscope** (`id=kaleidoscope`) — Калейдоскоп: N-секторов симметрии с шумовым заполнением.
- **Lightning** (`id=lightning`) — Молнии: ветвящиеся разряды от верхней кромки.
- **Cloud Puff** (`id=cloudpuff`) — Объёмные облака: двухуровневое осветление через шум.
- **Ripples** (`id=ripples`) — Круги на воде: пересекающиеся волновые фронты.
- **Vortex** (`id=vortex`) — Вихрь: спираль с втягивающимися в центр траекториями.
- **Tentacles** (`id=tentacles`) — Щупальца: случайные кривые Безье с затуханием толщины.
- **Wave Field** (`id=wave_field`) — Поле волн: top + bottom края из двух разных синусоид.
- **Echo Rings** (`id=echo`) — Эхо: исходная кривая и её затухающие копии, повёрнутые по кругу.
- **Lava** (`id=lava`) — Лава: трещины в темноте с раскалёнными краями.
- **Bubbles** (`id=bubbles`) — Пузыри с перекрытиями и реалистичными бликами.
- **Calligraphy** (`id=calligraphy`) — Каллиграфические завитки с переменной толщиной.

## Палитры

12 курируемых палитр доступны в боковой панели: `lava`, `aurora`, `sunset`, `ink`, `ocean`, `botanic`, `bubblegum`, `desert`, `cyber`, `pastel`, `sapphire`, `coral`. Каждая — линейная интерполяция от 0 до 1 по 5 опорным цветам, при необходимости используется и для фона.

## Запуск

```bash
cd wallpaper-generator
python3 -m http.server 8765
# открыть http://localhost:8765/
```

Любой статический сервер подойдёт (`npx serve .`, `npx http-server`, `php -S`).

## URL-параметры

```
?style=curlflow|domainwarp|topography|logpolar|billow|ridged|nebula|gradient_mesh|
       sandhills|voronoi|truchet|spirograph|concentric|hexgrid|barcode|brick|
       lissajous|polarrose|archimedes|clover|tessellation|celtic|triangles|diamonds|
       compass|spring|gears|shards|azulejo|neon|stripes_curved|stripesdiag|
       waves_grid|rings3|strings|reactiondiffusion|mandelbrot|lsystem|maze|hilbert|
       dragon|sierpinski|frost|julia|newton|burning|metaballs|tree|
       fern|wire|cantor|chains|sorting|circuit|lorenz|flowsnake|
       flowsnake2|branches|netgraph|messyhair|stippling|phyllotaxis|glyphs|pulse|
       scatter|stars|orbital|dotgrid|pollen|runic|halftone|cracked|
       weave|plaid|porthole|mosaic|stainedglass|wood|marble|rock|
       bubblewrap|hatching|sand|bars|spectrum|honeycomb3d|chainmail|caustics|
       asemic|inkblot|waves|water|fire|kaleidoscope|lightning|cloudpuff|
       ripples|squiggles|vortex|tentacles|wave_field|echo|lava|bubbles|
       calligraphy
&palette=lava|aurora|sunset|ink|ocean|botanic|bubblegum|desert|cyber|pastel|sapphire|coral
&seed=42
&resolution=1920x1080|2560x1440|3840x2160|1080x1920|1280x720
&mode=static|animated
&lite=1   # спрятать UI, отдать весь экран под обоину
```

Примеры:

```
http://localhost:8765/?style=domainwarp&palette=aurora&seed=42&lite=1
http://localhost:8765/?style=lsystem&seed=7&lite=1
http://localhost:8765/?style=julia&palette=cyber&seed=99&lite=1
```

## Стек

- Чистые ES Modules, без сборщика.
- Canvas 2D для всего рендера.
- 2D Simplex-шум собственной реализации (Public Domain по Stefan Gustavson).
- Mulberry32 для детерминированного сида.
- FNV-1a хэширование для деривации сидов дочерних стилей.
- `MediaRecorder` + `canvas.captureStream` для записи WebM.
- Web Worker для Reaction-Diffusion (тяжёлый warmup не блокирует UI).

## Структура

```
.
├── index.html                # панель + canvas + overlay + toast
├── styles.css                # UI + спиннер
├── docs/                     # preview-скриншоты (105 шт.)
└── js/
    ├── app.js                # оркестратор, UI, loader
    ├── noise.js              # Simplex + fBM/ridge
    ├── rng.js                # Mulberry32, утилиты
    ├── palettes.js           # 12 палитр + интерполяция цвета
    ├── utils.js              # resizeCanvas, скачивание канваса
    ├── styles.js             # реестр из 105 стилей и группировка по категориям
    └── styles/               # по файлу на стиль + rd-worker.js
```

## Добавить свой стиль

1. Создай `js/styles/mystyle.js` и экспортируй объект:

```js
export const mystyle = {
  id: "mystyle",
  name: "My Style",
  category: "Геометрия",   // попадёт в соответствующую секцию UI
  blurb: "Краткое описание.",
  defaults: { /* значения параметров */ },
  params: [
    { key: "density", label: "Плотность", min: 0.0001, max: 0.001, step: 0.00002 },
    { key: "shape",   label: "Фигура",    enum: ["circle", "line"] },
  ],
  createState(opts, w, h) {
    // Возвращай кэш, переживающий анимацию.
    return { /* ... */ };
  },
  paint(ctx, opts, state) {
    // Один кадр.
  },
  animate?(ctx, opts, state, t) {
    // Опционально. t — миллисекунды с начала анимации.
  },
};
```

2. Зарегистрируй в `js/styles.js`:

```js
import { mystyle } from "./styles/mystyle.js";
export const STYLES = [/* ..., */ mystyle];
```

3. Готово — стиль появится в соответствующей категории в UI. Поиск сверху помогает быстро найти по имени.

## Заметки по производительности

### Архитектура рендера

В `js/app.js`:

- `scheduleRender({heavy})` — единая точка входа.
  - **`heavy: true`** (смена стиля/палитры/сида/разрешения) — показывает full-screen overlay со спиннером.
  - Без `heavy` (drag слайдера, change селекта) — рисует в следующем RAF без overlay, без мерцания UI.
- `renderBusy` / `renderToken` — пока `style.paint` идёт, новые запросы не запускают второй render сразу. После окончания текущего рендера проверяется `renderPending` и, если приехали новые параметры, инициируется ещё один RAF.
- Опциональный **`paintChunked(ctx, opts, state)`** — async-вариант для тяжёлых стилей. Между чанками вызывается `opts._yield` (по умолчанию rAF), поэтому main thread не блокируется, и браузер успевает обработать клики, hover, и т.д. Включён для **Cloud Puff** (самого медленного стиля, 1.4 с/кадр на 1280×720).

### Профиль на 1280×720 (sync paint)

| Стиль | Paint, мс |
|---|---|
| Cloud Puff | **1378** (chunked: ~1400 мс, но UI отзывчив) |
| Kaleidoscope | 858 |
| Ridged | 770 |
| Billow | 740 |
| Wood | 716 |
| Marble | 653 |
| Concentric | 586 |
| Water | 479 |
| Domain Warp / Topography | 200–400 |
| Julia / Mandelbrot / Newton | 130–155 |
| Простые геометрии (Voronoi, Truchet, Spirograph, Phyllotaxis, …) | <50 |

21 стиль из 105 рисуется дольше 100 мс. Остальные — практически мгновенно.

### UI-отзывчивость

- **Drag слайдера**: до правок — overlay переключался на каждый input-event (50 events → 50 показов спиннера). После правок — **0 показов overlay** во время drag, рендер запускается через RAF без overlay.
- **Смена стиля**: overlay показывается 2 раза (show + hide) — корректно для тяжёлой смены.
- **Chunked paint (Cloud Puff)**: во время длинного render другие стили/панель реагируют; после окончания текущего chunked-paint запустится RAF для нового render с обновлёнными параметрами.

### Тяжёлые стили

- **Curl Flow** — основная работа тратится на интегрирование траекторий. На 4К с дефолтной плотностью — 1–3 с.
- **Domain Warp / Topography / Log-Polar** — попиксельный fBM, есть `sampleStep` для downsampling.
- **Reaction-Diffusion** — самый тяжёлый. Warmup 4000 шагов в Web Worker. `simResolution` и `stepsPerFrame` задают качество. В `?lite=1` Worker отключается, идёт sync warmup.
- **Field-массивы (RD, Voronoi)** — grid-индексированные, быстрые.
- **Barnsley Fern, Hash-based** стили (Cantor, Branches) — на 4К занимают доли секунды.
- **Изображения через `createImageData`** (Mandelbrot, Julia, Newton, Burning, Wood, Marble, Nebulae, Fire, Water, Lorenz) — на 1920×1080 ~50–500 мс в зависимости от итераций.
- **На 4К** некоторые фракталы могут занимать несколько секунд. Используйте `?lite=1` или уменьшите `maxIter`.

## Мобильная версия (mobile drawer pattern)

На экранах <820px UI превращается в **bottom-sheet drawer**:

- **Default state**: снизу видна только широкая ручка-«таб» (64px) с тонким indicator bar; весь остальной экран занимает canvas (полноэкранные обои).
- **Tap handle**: drawer разворачивается до 84vh, показывая все настройки.
- **Swipe вверх по handle**: открыть.
- **Tap canvas** при открытом drawer: закрыть.
- **Tap × в углу drawer**: закрыть.
- **Горизонтальный chip-scroll** для 105 стилей (вместо длинного вертикального списка).
- **Tap-targets ≥44px** для всех кнопок/полей.
- Используется `?lite=1` — для шеринга готового wallpaper'а (скрывает панель совсем).

Технически: `#panel` это `position: fixed; bottom: 0; height: 64px; max-height: 84vh` с переключателем `is-open` для открытия; canvas растягивается на 100% через CSS `align-items: stretch; justify-content: stretch` в `#stage`.



`?lite=1` включает «обойный режим»: вся ширина/высота канваса отдаётся обоине, панель скрывается.

Для **Reaction-Diffusion** в `?lite=1` Worker отключается (sync warmup) — Worker не получает CPU под headless-скриншотами.

## Ссылки по алгоритмам

- Curl noise: [Bridson 2007](https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph2007-curlnoise.pdf).
- Domain warping: [Inigo Quilez](https://iquilezles.org/articles/warp/).
- Reaction-Diffusion: [Robert Munafo's catalog](http://mrob.com/pub/comp/xmorphia/) — пресеты feed/kill.
- Voronoi / Worley noise: оригинальная [статья Steven Worley, 1996](https://www.worley.com.au/worley/papers.html).
- Truchet tiles: классическая идея из [Sébastien Truchet (1704)](https://en.wikipedia.org/wiki/Truchet_tiles).
- Phyllotaxis / Fibonacci spiral: [Numberphile](https://www.youtube.com/watch?v=14-NdQw-uMQ).
- Caustics: классический шейдер [ShaderToy caustic](https://www.shadertoy.com/view/MdlXz8).
- L-System: [Wikipedia](https://en.wikipedia.org/wiki/L-system), Lindenmayer 1968.
- Gosper / Flowsnake: [Wikipedia](https://en.wikipedia.org/wiki/Gosper_curve).

## Лицензия

MIT.
