# Независимый дизайн-аудит прототипа VK Видео и MAX

Дата: 2026-10-04, Москва. Проверена актуальная локальная рабочая папка, включая незакоммиченные и untracked файлы, по адресу [локального прототипа](http://127.0.0.1:5173/vk-max-stela-prototype/). Состояние GitHub/main, старый ZIP и прежние заключения D-059–D-062 не приняты за проверяемую версию или доказательство.

В приложении ничего не исправлялось. Единственный новый итоговый документ этого аудита – этот отчёт. Исходники клиента, тексты, метаданные, механика, изображения, шрифты, CSS и остальные рабочие документы не изменены. Коммит, публикация и установка плагинов не выполнялись.

После завершения аудита пользователь поручил исправления. Разделы ниже до «Исправления после аудита» сохраняют исходный снимок проверки; актуальные статусы находятся в заключительном разделе.

## Найденные ошибки

P2 означает заметный дефект чтения или визуального переноса; P3 – небольшое геометрическое расхождение. Приоритет не является разрешением на исправление.

| ID | Приоритет | Расхождение | Статус |
| --- | --- | --- | --- |
| M-02 | P2 | Начала и окончания реальных метаданных MAX уходят за границы холста | Ошибка, подтверждена также в нормальной анимации |
| M-01 | P2 | «Начать» MAX имеет плоскую непрозрачную заливку вместо стеклянного материала native кадра | Ошибка переноса сохранённого native |
| VK-D03 | P3 | CSS radius54 вместо native60 создаёт лишнюю синюю кайму карточки | Ошибка, подтверждена пикселями браузера |
| M-03 | P3 | Первые две строки описания Цифрового ID правее native примерно на 4–5 px | Малое геометрическое несоответствие сохранённому native |

Отдельно обнаружены более яркий фон выбранного ответа VK, универсальная композиция бабблов и потеря tracking0,01em в трёх слотах активации. Их статус отличается от четырёх ошибок выше: актуальность selected кадра требует live-подтверждения, а динамические бабблы и активационные теги являются адаптациями. Остаток alpha gamma относительно геометрии измерен, но не доказывает неправильный вес или несовпадение исходного сглаживания Figma.

## Источники и границы достоверности

Прочитаны AGENTS, PROJECT_RULES, README, PROJECT_STATE, OPEN_QUESTIONS, NAVIGATION, SOURCE_REGISTER, FIGMA_UI_REFERENCE, журнал согласованных исключений и предыдущий AUDIT_REPORT. Последний относится к механике и текстам; данный отчёт его не заменяет.

Три независимые зоны проверки: VK, MAX, шрифты/масштаб. У MAX и шрифтов были отдельные IAB-сессии. У агента VK браузерный transport оказался недоступен; он самостоятельно исследовал native-файлы и повторно просмотрел новые снимки root. Основной исполнитель сопоставил выводы с DOM, пикселями и исходным кодом. Ни один агент не редактировал приложение.

Основной файл Figma: [VK и MAX](https://www.figma.com/design/KuU33vfscUuniv4QW5TsdL/VK?node-id=4514-130150), страница MAX4114:7224. Свежие обращения к Figma 2026-10-04 завершались timeout/crash до полноценного чтения актуальных слоёв. Поэтому проверка ниже использует первичные сохранённые SVG/PNG и отдельно зарегистрированные параметры панели Design. Она не выдаётся за свежую проверку всех слоёв серверного файла.

Корень первичных сохранённых экспортов: C:/Users/UKOLZLA/.codex/visualizations/2026/09/27/01a0e249-2c8f-7c11-95e3-f23ea6e91e9c/. Дата каталога сессии не равна дате каждого экспорта. Файлы исследованы заново; прежнее утверждение «совпадает» не использовалось как доказательство.

| Область | Кадр / источник | Что действительно доступно |
| --- | --- | --- |
| Общий вход | Старый файл I9st…,2388:2744; исходный фон/логотипы | Сохранённые ресурсы и параметры; свежая полная layer-проверка отсутствует |
| Короткие интро | MAX4435:55165/logo4435:63572; VK4435:97280/logo4435:105680 | Сохранённые измерения логотипов и браузер, самостоятельные полные native кадры не получены |
| VK onboarding | [4350:26514](https://www.figma.com/design/KuU33vfscUuniv4QW5TsdL/VK?node-id=4350-26514) | Это правильный вариант с play/heart. Имеющийся STELLA.svg/PNG соответствует соседнему4514:18806 без play/heart; полным эталоном правильного экрана он не является |
| VK Q1/Q2/Q3 | Группа02/10,4514:130150 | Два доступных SVG содержат только один видимый selected Q2drive, crop x5854/y820/1080×1920 в поле15268×7234. Они не содержат все обычные и выбранные экраны |
| VK activation | [4788:10640](https://www.figma.com/design/KuU33vfscUuniv4QW5TsdL/VK?node-id=4788-10640) | Настоящий reference PNG, live-text SVG и clean background во внешнем архиве |
| VK scan | Три сценарных исходных PNG | Полные исходные кадры1080×1920; возможна попиксельная browser-сверка |
| VK QR | Согласованный прежний финал Polina,6118:4785/6118:101294 | Исходный QR-background2160×3840. Новый финал основного Figma не является текущим требованием |
| MAX onboarding | [4435:63573](https://www.figma.com/design/KuU33vfscUuniv4QW5TsdL/VK?node-id=4435-63573) | current-max-onboarding-svg/Стела UX/STELLA.svg и PNG с соответствующими clip/paint IDs |
| MAX audience | [4435:248505](https://www.figma.com/design/KuU33vfscUuniv4QW5TsdL/VK?node-id=4435-248505) | current-max-audience-live-svg/Стела UX/STELLA.svg и PNG, живые параметры текста |
| MAX goals | [4435:80421](https://www.figma.com/design/KuU33vfscUuniv4QW5TsdL/VK?node-id=4435-80421) | current-max-goal-live-svg/Стела UX/STELLA.svg и PNG |
| MAX digital ID | [4435:38343](https://www.figma.com/design/KuU33vfscUuniv4QW5TsdL/VK?node-id=4435-38343) | current-max-final-live-svg/Стела UX/STELLA.svg и PNG |
| MAX остальные три финала | Общий согласованный шаблон | Самостоятельные native кадры не найдены; это адаптации, полное1:1 не заявляется |
| MAX bubbles |4683:108536 | В этом аудите исходный графический export не найден. Семейство/градиент дополнены зарегистрированными сведениями, реальные слова и обрезка проверены в браузере |
| Панель условий | Демонстрационный макет по указанию пользователя | Клиентского native эталона нет; проверены открытие, прокрутка, закрытие и геометрия |

Доказательства хранятся вне проекта в C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/. Подкаталоги root, vk, max, fonts-scale содержат новые снимки, измерения, парные сравнения и рабочие передачи агентов. Это материалы проверки, а не дополнительные файлы клиентской передачи.

## Подробные расхождения

### M-02. MAX обрезает реальные метаданные

Маршрут: вход → MAX → «Начать» → «Для бизнеса». В нормальной анимации при currentTime1300ms и opacity1 слово «коммуникация» имеет видимый текстовый span x787,67..1114,85: за правую границу1080 уходят34,85px. В reduced состоянии диапазон x823,36..1166,64, выход86,64px. Проверены именно глифы, а не прозрачные поля плашки.

Причина: фиксированные target x100/x995 и scale1,15/1,3 не учитывают длину слова. [MetadataBubbles.tsx](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/components/MetadataBubbles.tsx:3>), применение координат на строке16; размеры и padding в [max-flow.css](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/styles/max-flow.css:413>). Адаптация должна оставлять реальные надписи читаемыми; это не требование копировать расположение каждого слова неподвижного Figma.

Другие подтверждённые выходы: бизнес/access «идентификация» x−61,9..261,9; бизнес/visibility «узнаваемость» x−46,1..246,1; бизнес/connection «аудитория» x869,4..1120,6; личное/connection «стикеры» x898..1092. На mobile390×844 «Цифровой ID» начинается на x−11,8 при левой границе холста0,2, «стабильность» заканчивается416,9 при правой границе390,2. Mobile числа не смешаны с native1080.

Доказательства: [normal1300ms](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/max/business-reveal-normal-1300ms-full.png>), [измерения](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/max/business-reveal-bounds.json>), остальные шесть наборов goal в файлах *-bounds.json каталога max. Последствие – посетитель видит обрезанные начала или окончания. Метаданные для проверки не сокращались и не заменялись.

### M-01. MAX «Начать»: иной материал и цвет

Источник – native4435:63573. Ожидаемая геометрия x360/y1084,46,360×140,radius70. Native содержит стеклянную плашку с верхним/левым бликом, fill#A067DA opacity0,5 и градиентный слой opacity0,3.

В браузере start.webp720×280 уменьшен до360×140: плоская непрозрачная cyan-purple заливка без native кромки. Геометрия и живая надпись совпадают. Ресурс подключён в [MaxFlowScreen.tsx](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/components/MaxFlowScreen.tsx:8>), выбран на строке29 и выведен на строке32; рамка в [max-flow.css](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/styles/max-flow.css:201>).

Слева native, справа browser; одинаковый ROI x350/y1074..x730/y1234:

![Кнопка Начать, native и браузер](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/max/onboarding-start-paired-native-browser.png>)

В точке405/1110 nativeRGB51/50/184, browser22/156/254;400/1175 native55/49/196, browser20/160/254. Измеренные точки находятся вне декоративного курсора native. [Пиксели сравнения](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/max/onboarding-start-colors.json>). Заметно на полном и уменьшенном размерах. Согласованного исключения для этого материала не найдено. Свежая серверная версия Figma остаётся ограничением источника.

### VK-D03. Лишний синий край карточки

Source clip selected Q2drive имеет rx60; общий .vk-flow-card в [global.css](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/styles/global.css:676>) задаёт54px и собственную заливку#0850f4. Прозрачные углы native artwork из-за этого заполняются синим между двумя радиусами.

В новых full browser пикселях относительно карточки (15,17),(17,15),(25,8),(8,25) RGB8/80/244, соответствующие sourcePNG пиксели полностью прозрачны. Это видимая узкая кайма, а не только различие CSS. [Пиксельное доказательство](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/vk/card-radius-pixels.json>), [угол, nearest8× без ретуши](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/vk/browser-card-corner-8x.png>). Общий стиль применяется ко всем12 обычным и12 выбранным карточкам; пиксельно подтверждён конкретный loaded selected drive.

### M-03. Описание Цифрового ID: первые две строки правее

Native4435:38343: Max Sans Bold36, baseline744,465/788,465/832,465, интервал44. Ink bounds первой строки native290..776, browser295..780; второй316..753 против320..756; третья335..742 совпадает. Вертикальные границы, размер и настоящее начертание совпали.

Native live SVG содержит завершающий пробел первых двух строк. Согласованный текст приложения и white-space:pre-line центрируют видимые буквы иначе: [max-flow.css](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/styles/max-flow.css:355>), [max.ts](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/content/max.ts:66>). [Парный снимок](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/max/final-digital-id-paired-type.png>), [ink bounds](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/max/final-description-ink-bounds.json>), порог minRGB200. Отклонение4–5px на полном холсте, менее2px в обычном окне. Это не основание менять слова клиента или добавлять пробелы в пользовательский текст.

## Расхождения со специальным статусом

### VK-D01. Выбранный ответ: существенно более яркий фон

В сохранённом selected Q2drive native base#020316, dots opacity0,06; приложение сохраняет яркий .experience--vk без аналогичного затемнения: [global.css](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/styles/global.css:152>). Пары source/browser: точка100/1000 –2/3/22 против1/31/148;500/1500 –3/4/25 против1/42/174;540/1800 –3/4/40 против2/18/96.

[Стабильная пара](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/vk/native-browser-selected-stable-pair.png>), [пиксели](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/vk/selected-background-comparison.json>), дополнительный нормальный кадр1300ms в root/vk-q2-selected-drive-normal-animation-1300ms.png. Различие подтверждено и не является reduced-motion артефактом. Статус: заметное расхождение с сохранённым native, приоритетP2 при подтверждении его актуальности. Live серверный selected кадр сегодня не прочитан, поэтому это не безусловная ошибка последней согласованной Figma.

### VK-D02. Бабблы selected: общий шаблон вместо native композиции

Native sample содержит game148×76 около156/438, азарт392×190 около711/634, драйв216×111 около260/805,5, авто169×88 около558,5/928. Приложение задаёт всем тегам35px700, min-width180,padding18/34 и общую текстуру373×198 через cover; короткие слова получаются примерно180×84. [global.css](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/styles/global.css:976>).

Статус: динамическая адаптация, визуально не1:1 по масштабу, blur/частицам и композиции. Реальные теги, их порядок и повторы сохранены; нельзя подменять их словами native sample. Временная фаза нормальной анимации не сравнивается с Figma как ошибка тайминга.

### VK-D04. Tracking активации

Live SVG4788:10640 задаёт0,01em в трёх слотах sample «азарт»57,0048px, «драйв»26,5691px, «тренды»57,3448px; остальные0em. Приложение задаёт0 всем тегам: [global.css](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/styles/global.css:1244>).

Статус: небольшое параметрическое расхождениеP3 внутри динамической адаптации. Слова приложения распределяются по длине и отличаются от sample; одинаковая геометрия всех native тегов не заявляется. Заголовок75/Bold/83 и описание30/Medium/39/opacity0,72 сверены отдельно, [парный crop](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/vk/activation-heading-native-browser-pair.png>).

## Покрытие экранов и состояний

F = CSS1080×1920, W =1280×720, M =390×844. «Просмотрен» означает browser/DOM-проверку, а не полное source1:1. Непригодные растровые захваты явно выделены. Вопросы Q1/Q2/Q3 ниже относятся к VK.

| Экран / состояние | Покрытие | Результат и доказательство |
| --- | --- | --- |
| Вход, два продукта | F/W/M | Заголовок, обе кнопки, фон и центрирование просмотрены; root/home-*-verified.png |
| Короткое интро VK/MAX | F/W/M | Оба временных экрана зафиксированы; logoMAX336,3/680,58/407,67×130, VK140,04/664,2/783,93×168,23 согласуются с регистрацией. root/*-intro-*-verified |
| VK onboarding с play/heart | F/W/M | Правильная графическая версия видна, заголовок/оба шага/voice/start внутри холста; native правильного полного кадра отсутствует. root/vk-onboarding-*-verified |
| Q1 normal, четыре карточки | F/W/M | Все artwork и подписи просмотрены. Финальный F повторён после paint: vk-q1-full-repaint-verified.png |
| Q2 normal, четыре карточки | F/W/M | Полный F повторён; прежние captures без картинок не приняты за дефект. vk-q2-full-repaint-verified.png |
| Q3 normal, четыре карточки | F/W/M | Включая hero/пару на синем диване. vk-q3-full-repaint-verified.png |
| Q1/Q2/Q3 hover | Все12 DOM,11 пригодных F raster | Целевая карточка brightness1,13, white outline3px/offset3; рамка468×280 не смещается. Q1hover2 partial paint исключён из raster parity; root/hover-census.json |
| Q1 selected | Все4, F/W/M | Все16 тегов и подписи сверены с живыми данными; в F selected1/2 были пропуски raster logo, их не оценивали как sitebug |
| Q2 selected | Все4, F/W/M | Все16 тегов, включая двойную «культура»; drive additionally native pair и normal1300ms. VK-D01/D02/D03 |
| Q3 selected | Все4, F/W/M | Все16 тегов; варианты1/2/4 повторены в *-verified, hero отдельно stable |
| Фото normal | F/W/M | Заголовок, описание, оба действия, уведомление/ссылка; vk-photo-verified-1080 и ordinary/mobile |
| Фото согласие | F/W/M | Живая «Да, давайте», selected и четыре metadata; vk-photo-selected-accept-* |
| Фото пропуск | F отдельно | vk-photo-skip-1080; отдельные W/M selected skip не получены. Следующая активация skip проверена на трёх размерах |
| Условия open/scroll/close | F/W/M DOM, открытие full raster | Скролл только body; close не двигается. Mobile scrollTop1783,38 из2601/client818, document[0,0]. W scrollTop1783,47. Частичный full scroll header repaint не доказывает дефект интерфейса |
| Камера | F/W/M | Инструкция, рамка, кнопка; stable F, ordinary/mobile. Реальная камера не входит в прототип |
| Scan blue/contour/particles | Все3 F/W/M | Три F PNG совпали с исходными RGB во всех пикселях, mean0/max0; vk/scan-browser-comparison.json |
| Активация после фото | F/W/M | Полный F sharp, title/description source-параметры, все10 реальных тегов внутри frames |
| Активация без фото / длинные теги | F/W/M | Проверены «документальное кино»2строки36,3448px и «лёгкий контент»1строка36,8579px; vk/activation-fit-ten-tags.json. Растр skip не используется для плотности шрифта |
| Прежний QR-финал | F, W/M DOM и обзор | Новый full-last-verified полностью содержит QR/фон/logo. W/M итоговые captures имеют compositor ограничения, полной raster parity на них не заявляется |
| MAX onboarding | F/W/M | Все3 шага/номера/voice/touch/start; M-01. M дополнительно recovery и root повтор после default reset |
| MAX audience normal | F/W/M | Бизнес/личное artwork, подписи, badge, logo, back; обе карточки просмотрены |
| MAX audience hover | Обе W | business-hover-window/personal-hover-window: brightness1,12, без геометрического сдвига; собственного native hover нет |
| MAX business/personal selected | Оба набора8 | Все16 реальных тегов, normal бизнес1300ms дополнительно; M-02 |
| MAX goals normal | F/W/M | Все3 карточки/access/connection/visibility; M повторён в recovery и root |
| MAX goals hover | Все3 W | access-hover-window/connection-hover-window/visibility-hover-window |
| MAX access selected | Personal8 + business8 | Оба реальных набора показаны; clipping «Цифровой ID»/«идентификация» |
| MAX connection selected | Personal8 + business8 | Оба набора, clipping «стикеры»/«аудитория» |
| MAX visibility selected | Personal8 + business8 | Оба набора, «мини-приложение» включено; clipping «узнаваемость» |
| MAX back audience/goals | Normal F/W/M, hover W, переходы | Native crop exactRGBA, fractional offsets сохранены. Возвраты к onboarding/аудитории подтверждены |
| MAX digital ID final | F/W/M | Живые заголовок/описание/direction/thanks; native полная проверка, M-03 |
| MAX communication final | F/W/M | Общий шаблон, самостоятельного native нет; полное1:1 не заявляется |
| MAX business final | F/W/M | Все3 business goals пройдены, общий шаблон; отдельного native нет |
| MAX blogger final | F/W, M тексты/DOM | M повторён recovery/root, тексты/CTA помещаются, raster logo всё ещё пропадает в capture. Это не sitebug и не полная mobile raster-проверка |
| MAX thanks / возврат | Все4 финала | «Спасибо» возвращает к двум продуктам, direction одной строкой, нет timer. Отдельный достоверный hover raster Спасибо не получен; root mobile pointer probe hover=false, не выдан за проверенный hover |

Selected VK дополнительно сверены независимо:12/12 подписей и48/48 тегов с текущими массивами, включая повтор «культура»: [all-twelve-selected-data-comparison.json](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/vk/all-twelve-selected-data-comparison.json>). Это проверка сохранения живых данных в визуальном состоянии, не новая свежая сверка Google Sheets.

Для воспроизводимости соответствие индексов: Q1 – сериал, стендап, интервью, документалка/научпоп; Q2 – драйв/азарт, герои, новое, отдых; Q3 – похожее, новое по интересам, герой VK, популярное. Файлы root/vk-qN-selected-I-* используют эти индексы1–4. Длинная подпись Q2heroes выходит за собственный span на несколько пикселей, но overflow visible и все буквы находятся внутри карточки; ошибка обрезки по одному scrollWidth не заявляется.

## Типографика

Проверка включает document.fonts.ready, прямой CSS.getPlatformFontsForNode с PostScript name/isCustomFont, computed size/weight/line-height/tracking/opacity, исследование самих файлов через fontTools и независимые native контуры. Одного font-family для вывода об отсутствии fallback недостаточно.

Во всех перечисленных фактически опрошенных ролях isCustomFont=true; системный fallback не обнаружен. Font-synthesis:none подтверждён. Все четыре Max Sans WOFF2 совпадают с TTF пользователя по cmap, hmtx и полной геометрии глифов; веса OS/2=400/500/600/700. VK Display также имеет настоящие400/500/600/700. SHA-256 и метрики в fonts-scale/font-files.json.

| Роль | Фактическое начертание | Размер / line-height | Существенные параметры |
| --- | --- | --- | --- |
| Общий вход | VKDisplay Bold |80/96 | Tracking normal, без gamma |
| VK onboarding heading / шаг1 | VKDisplay Bold |75/80;36/46 | Без gamma |
| VK onboarding шаг2 | MaxSans Bold |36/45 | Настоящие700, gamma2,2 |
| VK voice / ПОЕХАЛИ | VKDisplay Medium / Bold |30/39 | Opacity0,72; выделение настоящим700 |
| VK Q1/Q2 heading | VKDisplay Bold |48/52,8 | Рамка85,96/340/908,09×119 |
| VK все12 normal card labels / selected Q1 sample | VKDisplay Bold |34/44 | Настоящие700, gamma2,2, переносы индивидуальные |
| VK фото heading / accept | VKDisplay Bold |75/82,5;50/50 | Без gamma |
| VK фото description / camera | MaxSans Bold |36/45 | Gamma2,2, рамка518,99×120,06 |
| Условия h2/h3 | VKDisplay DemiBold |54/61,02;42/50,4 | Настоящие600, без gamma |
| Условия p/li | VKText Regular |34/49,3 | Настоящие400, без gamma |
| Активация title / description | VKDisplay Bold / Medium |75/83;30/39 | Description opacity0,72, без gamma |
| Активация tag sample | VKDisplay Bold |Динамический fit | Все10 Range fit проверены; direct font census только sample, tracking см. VK-D04 |
| QR direction / caption | VKDisplay Bold / Regular |Параметры в details; caption30/39 | Реальные custom fonts, caption opacity0,72 |
| MAX три шага / номера | MaxSans DemiBold / VKDisplay Bold |36/43,2;100/128 | Шаги600/gamma2,2, номера700 |
| MAX voice / touch / ПОЕХАЛИ | MaxSans Medium / Bold |30/39 | Opacity0,72, выделение700 |
| MAX start | VKDisplay Bold |50/64 | Живой текст |
| MAX audience title / labels | MaxSans Bold / DemiBold |75/80;36/46 | Labels600/gamma2,2 |
| MAX goals title / labels | MaxSans DemiBold |75/80;36/43,2 | Labels gamma2,2 |
| MAX back | MaxSans DemiBold |34/normal | Текстовая рамка108×44, без gamma |
| MAX восемь business bubbles | MaxSans DemiBold |CSS36/normal |8/8 direct census, без fallback |
| MAX digital ID title / description | MaxSans DemiBold / Bold |75/80;36/44 | Description gamma2,2, три строки |
| MAX direction / thanks | MaxSans Medium / VKDisplay DemiBold |30/39;34/44 | Direction одна строка/opacity0,72, thanks без gamma |

Native MAX onboarding outlines трёх подписей совпадают по площади с настоящим MaxSans DemiBold36 с погрешностью менее0,002%; Bold дал бы+14,4–15,1%, Medium около−13%. Поэтому подмена веса700/500 ради субъективной плотности не обоснована.

Прямой census всех символов/состояний не выполнен: обычные VK metadata bubbles, Q3heading, notice фото и все activation slots отдельно не опрошены. Для остальных трёх MAX finals применяются общие стили, но нет собственной native проверки. Эти пробелы не скрыты выводом «все шрифты1:1». [Основной census и метод](<C:/Users/UKOLZLA/Documents/ChatGPT/design-audit-2026-10-04/fonts-scale/FONT_SCALE_FINDINGS.md>), дополнительный root/font-roles-actual.json.

### Alpha gamma на разных размерах

Рабочий фильтр feFuncA exponent2,2 в sRGB: [TextRenderingFilters.tsx](<C:/Users/UKOLZLA/Documents/ChatGPT/New folder/05_Веб-прототип/src/components/TextRenderingFilters.tsx:8>). Он не меняет файл, семейство или настоящий weight.

Независимый опыт на трёх MAX onboarding подписях: native площадь AreaPen; browser покрытие восстановлено из парных PNG «рабочий фильтр / без фильтра / точная подложка». Перед каждым кадром document.fonts.ready, decode и два RAF. Все временные стили удалены.

| CSS viewport / scale | Gamma, отклонение трёх подписей от native геометрической площади | Без фильтра |
| --- | --- | --- |
|1080×1920 /1 |+2,80%,+1,74%,+2,13% |+12,44%,+12,46%,+12,10% |
|1280×720 /0,375 |−11,82%,−9,75%,−11,25% |+13,04%,+17,38%,+14,20% |
|390×844 /0,361111 |−4,74%,−2,59%,−4,23% |+21,90%,+26,17%,+22,99% |

Это измерение относительно геометрии SVG, не исходного antialiasing native PNG Figma. Native маски заново растеризованы; смешивать их с исходным AA нельзя. Gamma приближает full покрытие, но один фильтр не гарантирует одинаковую плотность на всех scale/DPR. Показатель обычного окна обнаруживает остаточный недобор около10–12%; достаточного основания назвать это ошибкой native AA или менять weight нет. Отдельного согласованного допуска нет.

Доказательства: fonts-scale/alpha-results.json, alpha-audit.py, gamma-comparison-full/reduced/mobile.png. Попытка восстановить alpha старого native PNG на другой подложке признана невалидной и исключена. VK gamma-роли независимо raster-методом относительно актуального native не проверены; MAX проценты на VK не переносятся.

## Геометрия, изображения и качество захвата

Холст сохраняет1080×1920, масштабируется целиком: full1; W0,375, stage405×720 на x437,5/y0; M0,361111, stage390×693,325 на x0,2/y75,3375 в измеренной IAB-системе. Дробное физическое округление до0,2px само по себе не принято за баг. Текстовые размеры native не уменьшаются отдельными CSS font-size ради мобильного окна.

При emulation evalDPR был1,0000000149, хотя backing metrics полного кадра1350×2400 указывают на физическую систему1,25. Поздние default кадры root имеют DPR1,25 и могут быть488×1055 при CSS390×844. CSS viewport, PNG IHDR и физическая raster density фиксировались отдельно; координаты не сравнивались без учёта масштаба.

Image-decode и font-ready необходимы, но IAB иногда сохранял partial paint даже после них. Обычный API мог дать квадрат1080×1080 или1080×608 вместо полного холста; full reference captures делались через Page.captureScreenshot/fromSurface:true с явным clip и проверкой IHDR. Early файлы с пропавшими logo/back/card/QR, чёрными областями, фазой enter translateY10 или неверным названием состояния исключены. Значения DOM/source остаются отдельными доказательствами и не превращают неполный PNG в full raster QA.

У MAX обе кнопки «Назад» и «Спасибо» независимо совпали RGBA с обрезками полного native без текста:264×121,263×121,580×121. Placement offsets−0,84/−0,664,−0,051/−0,08,y−0,41 сохраняют границы без растяжения. На проверенных вопросах/четырёх full finals непрозрачного прямоугольника вокруг них не найдено. Back audience DOM408,8375/864,6625 противnative408,84/864,664; direction251,725/986,225 против251,73/986,23; thanks y1051,400 против1051,41. Разницы менее0,02px являются округлением.

Активационный clean, три scan и QR background независимо сравнены с исходными PNG: пять пар RGBA совпали полностью, включая размеры. Это подтверждает сохранность WebP-ресурсов, а не всех browser placement. Три full scan прошли также полное RGB сравнение самого browser кадра с source: нулевой mean/max.

Панель условий: open и scroll имеют одинаковые close/frame, body скролл до конца, document scroll[0,0]; после закрытия холст сохраняет положение. В mobile close x322,975/y414,125/43,325×43,325; body x1/y473,4125/388,4×295,25. Открытие/прокрутка/закрытие не создают дополнительного скролла страницы. Полный scroll PNG частично потерял header raster, поэтому его вид не объявлен source1:1.

## Согласованные исключения, которые не отменяются

- VK «Чтобы был драйв и азарт» и пара на синем диване вместо старого native sample; фото «Сделаем фото?»/«Да, давайте», форма «вы» в уведомлении и «ты» в остальных обращениях.
- Действующая ссылка на демонстрационные условия, sliding panel с filler; клиентского юридического/native текста нет.
- Нет выбора пола и фотографии девушки, реальные камера/голос/генерация не добавлены.
- Прежний VK QR-финал, «левая панель» без точки, без отдельного большого нового заголовка и без «Спасибо».
- MAX onboarding без заголовка, шаги подняты47,41px; общий текущий фон вопросов вместо яркого native круга целей.
- MAX direction к правой панели одной строкой, «Спасибо» возвращает к двум продуктам, автоматического таймера нет.
- Другие три MAX finals, реальные метаданные и набор10 activation tags являются согласованными адаптациями шаблонов; sample Figma не подменяет их данные.

## Непроверенное и открытые вопросы

- Свежие server-side параметры всех Figma слоёв; полный правильный VK onboarding4350:26514; полные native Q1/Q2/Q3 normal/selected, кроме сохранённого Q2drive.
- Самостоятельные native три MAX finals, графический export MAXbubble4683:108536, отдельные native hover состояния и клиентский макет условий.
- Полная raster parity mobile blogger MAX и W/M QR VK; отдельный W/M selected skip фото; достоверный hover raster «Спасибо»; Q1hover2 full raster.
- Исходное Figma antialiasing1:1 на всех DPR; VK raster gamma, direct platformFonts всех отдельных символов/динамических ролей.
- QR destination, реальные внешние операции/камера/голос, физическая стела и доставка не входят в этот визуальный аудит. Q-002,Q-010,Q-012,Q-014,Q-017,Q-018 сохраняют прежний статус; решений за клиента не добавлено.

### Временные настройки и восстановление

Для устойчивого чтения некоторых временных экранов использованы только браузерные QA overrides: reduced-motion, удержание существующих timeout callbacks и пауза animation currentTime. Нормальная анимация метаданных проверена отдельно. Файлы реализации не менялись, новые animations/mechanics не добавлялись.

Root восстановил mediafeatures[], virtual time advance, удалил временные timer/styles через reload, выполнил viewport.reset и вернулся на общий вход. Финальный readback: default390×844,DPR1,25,zoom0,361111,scroll[0,0],reduced=false,timerOverride undefined. Reset возвращает размер текущего IAB-панеля, а не обязательно тестовый1280×720. Агент fonts подтвердил reset на своём default1280×720. Агент MAX очистил recovery metrics/media и закрыл recovery/Figma; его более ранняя crashed temporary вкладка недоступна для CDP из-за data:origin, обход не выполнялся, она закрывается при окончании turn. Сохранённые пользовательские настройки не изменялись.

## Проверки рабочей папки

Проверки запускаются на текущей локальной версии, без изменения тестов под выводы аудита. Они показывают техническую целостность, но не заменяют визуальных доказательств и ограничений выше.

- Typecheck: пройден.
- Tests:152/152,16 файлов.
- Lint: пройден.
- Build: пройден.
- Check:deliverable: пройден,124 source files,55 assets,118 local references.
- Git diff --check: пройден, ошибок whitespace нет. Предупреждения LF/CRLF относятся к прежним изменённым файлам. Новый untracked отчёт отдельно проверен на отсутствующие ссылки, trailing whitespace и запрещённые U+00B7/U+2014.

В рамках аудита добавлен только docs/DESIGN_AUDIT_REPORT.md. Предшествующий большой dirty/untracked набор сохранён; вывод Git не интерпретирован как список изменений этого аудита. Временные рендеры, технические выгрузки и передачи агентов оставлены вне проекта.

## Исправления после аудита, 2026-10-04, D-063

Основание – последующий прямой запрос пользователя исправить найденное. Исторические находки выше не удалены. Исправления выполнены в локальном прототипе; слова сценария, метаданные, веса и переходы сохранены.

| Находка | Актуальный статус | Повторная проверка |
| --- | --- | --- |
| M-01 | Исправлена | Свежий PNG целого MAX native кадра, lossless crop 360 × 141 без текста и курсора; все RGBA-пиксели совпали. [Полный экран](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/max-start-1080.png>), [телефон](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/max-start-390.png>) |
| M-02 | Исправлена | 36 показов метаданных при прохождении шести маршрутов на трёх размерах: все восемь действительных массивов, плашки и текст внутри холста. Пять фаз обычной анимации проверены отдельно. [Реальные теги](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/max-business-metadata-1080.png>) |
| VK-D03 | Исправлена | Радиус60 у normal/selected карточок всех трёх вопросов. В прежних четырёх проблемных пикселях исчез `#0850F4`, виден фон за карточкой. [Карточка и фон](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/vk-drive-radius-1080.png>) |
| M-03 | Исправлена | Первые две строки x−4,5 px. Ink bounds 290..776, 316..752, 335..742; третья строка сохранена, отличие второй от native в пределах1px. [Цифровой ID](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/max-digital-id-1080.png>) |
| VK-D04 | Исправлена | Tracking0,01em возвращён в три рамки и включён в fit; десять реальных тегов, включая длинное «документальное кино», не обрезаются на F/W/M. [Телефон](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/vk-activation-390.png>) |
| VK-D01 | Подтверждена текущей Figma и исправлена в проверенном кадре | `4527:141278`, base `#020316`, native фоновые слои. RGB в100/1000 и500/1500 совпал; в540/1800 отличается на1. Фон назначен только выбранному «Чтобы был драйв и азарт». [Текущая Figma](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/figma-vk-selected-frame.png>) |

Новая Figma-проверка ограничена указанными MAX CTA и VK selected кадром. SVG-фон VK извлечён из сохранённого native после подтверждения текущей применимости; это не новый экспорт каждого состояния. Текст и декоративный курсор MAX после получения clean PNG восстановлены до100%, проверены отдельно. Клиентские оригиналы в файловом архиве не редактировались. Прежний start.webp сохранён вне проекта с SHA-256.

VK-D02 сохраняется как согласованная динамическая адаптация. Её фактические теги и порядок не подменены sample Figma. Различие alpha gamma не доказывает ошибку начертания и не исправлялось сменой веса. У остальных selected VK и трёх адаптированных финалов MAX нет нового самостоятельного native-подтверждения; совпадение всех экранов1:1 не заявляется.

Полные измерения: [MAX](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/max-geometry.json>), [обычная анимация](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/max-normal-animation.json>), [карточки и активация VK](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/vk-geometry.json>), [пиксели фона](<C:/Users/UKOLZLA/Documents/ChatGPT/design-fixes-2026-10-04/vk-background-pixels.json>). Размеры screenshot PNG отдельно проверены: F1080 × 1920, W1280 × 720, M390 × 844.

Проверки после исправлений: typecheck,152/152 теста в16 файлах, lint, build, check:deliverable и git diff --check пройдены. Существующие проверки уточнены для точного дробного y и поиска изображения внутри карточки, отдельно от фонового слоя; проверка видимого описания сохраняет все слова и переносы при добавленных span. Временные настройки QA удалены перезагрузкой, media/viewport возвращены к обычным значениям. Коммита, отправки на GitHub и публикации нет.
