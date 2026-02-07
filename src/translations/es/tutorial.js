export const tutorial = {
  // Etiquetas de navegación
  nav: {
    overview: 'Resumen',
    concepts: 'Conceptos Financieros',
    grid: 'Leer la Tabla',
    flow: 'Flujo de Rondas',
    tips: 'Consejos Estratégicos',
    glossary: 'Glosario'
  },

  // Sección 1: Resumen del Juego
  overview: {
    title: '¿Qué es StratFi?',
    subtitle: 'Un Juego de Simulación de Estrategia Empresarial',

    objective_title: 'Tu Objetivo',
    objective_text: 'Maximizar el Retorno sobre Patrimonio (ROE) de tu empresa a lo largo de múltiples rondas tomando decisiones inteligentes sobre producción, precios, financiamiento e inversión. El ROE mide qué tan eficientemente conviertes el dinero de los accionistas en ganancias.',

    competition_title: 'Competencia',
    competition_text: 'Compites contra otras empresas en el mismo mercado. Tus decisiones de precios afectan la demanda del mercado, y tus decisiones de producción influyen en tu rentabilidad. ¡Revisa la tabla de clasificación para ver cómo te comparas!',

    winning_title: 'Cómo Ganar',
    winning_text: 'La empresa con el ROE más alto al final de la ronda final gana. Un ROE alto proviene de maximizar la utilidad neta mientras gestionas el patrimonio eficientemente. Esto requiere balancear rentabilidad, crecimiento y apalancamiento financiero.',

    rounds_title: 'Estructura del Juego',
    rounds_text: 'El juego se desarrolla en múltiples rondas (típicamente 3-5). Cada ronda representa un período comercial donde planificas, envías decisiones y ves resultados. Tu instructor controla cuándo cierra cada ronda y se revelan los resultados.'
  },

  // Sección 2: Conceptos Financieros
  concepts: {
    title: 'Conceptos Financieros Clave',
    intro: 'Entender estas métricas financieras es esencial para tomar decisiones inteligentes y ganar el juego.',

    revenue_term: 'Revenue',
    revenue_spanish: 'Ingresos / Ventas',
    revenue_def: 'Dinero total ganado por la venta de productos.',
    revenue_formula: 'Precio × Unidades Vendidas (para cada producto)',
    revenue_example: 'Ejemplo: Vender 100 unidades del Producto A a $50 cada una = $5,000 en ingresos',

    cogs_term: 'COGS (Cost of Goods Sold)',
    cogs_spanish: 'Costo de Bienes Vendidos',
    cogs_def: 'Costos variables de producción incluyendo materiales, horas máquina y mano de obra.',
    cogs_formula: 'Costo variable total de todas las unidades vendidas (método de inventario FIFO)',
    cogs_example: 'Ejemplo: Cada unidad cuesta $30 producir, vender 100 unidades = $3,000 COGS',

    gross_profit_term: 'Gross Profit',
    gross_profit_spanish: 'Margen Bruto / Utilidad Bruta',
    gross_profit_def: 'Ganancia después de deducir los costos variables.',
    gross_profit_formula: 'Ingresos − COGS',
    gross_profit_example: 'Ejemplo: $5,000 ingresos − $3,000 COGS = $2,000 margen bruto',

    ebit_term: 'EBIT (Earnings Before Interest & Taxes)',
    ebit_spanish: 'UAII (Utilidad Antes de Intereses e Impuestos)',
    ebit_def: 'Ganancia operativa antes de considerar los costos de financiamiento.',
    ebit_formula: 'Margen Bruto − Depreciación − Gastos de Capacitación/Desarrollo',
    ebit_example: 'Ejemplo: $2,000 margen bruto − $500 depreciación = $1,500 EBIT',

    net_income_term: 'Net Income',
    net_income_spanish: 'Utilidad Neta / Ganancia Neta',
    net_income_def: 'Ganancia final después de todos los gastos, intereses e impuestos.',
    net_income_formula: 'EBIT − Intereses − Impuestos',
    net_income_example: 'Ejemplo: $1,500 EBIT − $200 intereses − $300 impuestos = $1,000 utilidad neta',

    roe_term: 'ROE (Return on Equity)',
    roe_spanish: 'Retorno sobre Patrimonio',
    roe_def: '🏆 ¡LA MÉTRICA GANADORA! Muestra qué tan eficientemente usas el dinero de los accionistas para generar ganancias.',
    roe_formula: 'Utilidad Neta ÷ Patrimonio',
    roe_example: 'Ejemplo: $1,000 utilidad neta ÷ $10,000 patrimonio = 10% ROE',
    roe_importance: '¡Un ROE más alto significa mejor desempeño. La empresa con el ROE más alto gana!',

    balance_sheet_title: 'Fundamentos del Balance General',
    balance_sheet_equation: 'Activos = Pasivos + Patrimonio',
    balance_sheet_assets: 'Activos: Lo que posees (efectivo, inventario, máquinas)',
    balance_sheet_liabilities: 'Pasivos: Lo que debes (deuda a corto plazo, deuda a largo plazo)',
    balance_sheet_equity: 'Patrimonio: Inversión de accionistas + ganancias retenidas',

    cash_title: 'Gestión del Efectivo',
    cash_importance: '💰 ¡El efectivo es rey! Quedarte sin efectivo puede sacarte del juego.',
    cash_sources: 'El efectivo proviene de: ingresos por ventas, préstamos (deuda)',
    cash_uses: 'El efectivo se usa para: costos de producción, comprar máquinas/mano de obra, pagar deuda, pagar dividendos',
    cash_warning: '¡Siempre proyecta tu saldo de efectivo final. Si se vuelve negativo, necesitas pedir prestado o reducir gastos!'
  },

  // Sección 3: Entendiendo la Tabla del Planificador
  grid_guide: {
    title: 'Entendiendo la Tabla del Planificador',
    intro: 'La tabla del planificador es tu principal herramienta para tomar decisiones. Muestra celdas de entrada (donde ingresas decisiones) y celdas de salida (resultados calculados).',

    operations_title: '📊 Sección de Operaciones',
    operations_desc: 'Planifica la producción y precios para cada producto (A, B, C). Ingresa cuántas unidades producir, establece precios y decide cuántas vender. La simulación calcula ingresos, costos y niveles de inventario.',

    capacity_title: '⚙️ Sección de Capacidad y Utilización',
    capacity_desc: 'Rastrea tus horas máquina y horas de mano de obra. Cada producto requiere diferentes cantidades de estos recursos. ¡Si excedes el 100% de capacidad, no puedes producir todo lo que planeaste!',
    capacity_tip: 'Consejo: Apunta a 80-100% de utilización para distribuir los costos fijos eficientemente.',

    growth_title: '📈 Sección de Crecimiento (CAPEX y Gastos)',
    growth_desc: 'Invierte en expansión comprando más máquinas o capacitando mano de obra. Estas inversiones aumentan tu capacidad para rondas futuras. También puedes invertir en capacitación/desarrollo para mejorar la eficiencia.',
    growth_warning: 'Las inversiones cuestan efectivo por adelantado pero se pagan con el tiempo a través de mayor capacidad y menores costos.',

    finance_title: '💳 Sección de Finanzas',
    finance_desc: 'Gestiona deuda y dividendos. Pide prestado deuda a corto o largo plazo para financiar operaciones o crecimiento. Paga el principal para reducir la deuda. Paga dividendos para devolver efectivo a los accionistas.',
    finance_tip: 'Consejo: La deuda a corto plazo tiene tasas de interés más altas. Usa deuda a largo plazo para inversiones importantes.',

    income_statement_title: '📋 Sección de Estado de Resultados',
    income_statement_desc: 'Muestra tu ganancia proyectada para la ronda. Todas las celdas aquí se calculan automáticamente según tus decisiones. Métrica clave: Utilidad Neta.',

    balance_sheet_title: '🏦 Sección de Posición Financiera (Balance General)',
    balance_sheet_desc: 'Muestra tus activos, pasivos y patrimonio proyectados al final de la ronda. Todas las celdas se calculan automáticamente. Métrica clave: Patrimonio (usado para calcular ROE).',

    input_vs_output: 'Celdas de entrada (fondo blanco): Ingresas valores aquí',
    output_cells: 'Celdas de salida (fondo gris/azul): Se calculan automáticamente',

    tooltips: 'Pasa el cursor sobre las etiquetas de las filas para ver consejos útiles que explican cada métrica.'
  },

  // Sección 4: Cómo Funciona una Ronda
  flow: {
    title: 'Cómo Funciona una Ronda',
    intro: 'Cada ronda sigue un cronograma predecible. Entender el flujo te ayuda a planificar con anticipación.',

    step1_title: 'Paso 1: Revisar Resultados',
    step1_desc: 'Si no es la Ronda 1, revisa tus resultados reales de la ronda anterior. ¿Cómo te fue? ¿Cuál fue tu ROE? Revisa la tabla de clasificación para ver el desempeño de la competencia.',

    step2_title: 'Paso 2: Revisar Datos del Mercado',
    step2_desc: 'Revisa el resumen del mercado para ver pronósticos de demanda y tendencias de precios para cada producto. Esto te ayuda a decidir qué producir y a qué precio.',
    step2_tip: 'Mayor demanda = más unidades vendidas, pero los precios pueden caer si aumenta la oferta.',

    step3_title: 'Paso 3: Planificar Operaciones',
    step3_desc: 'Ingresa cantidades de producción, establece precios y decide volúmenes de ventas. Considera tus límites de capacidad y márgenes de contribución.',

    step4_title: 'Paso 4: Planificar Inversiones',
    step4_desc: 'Decide si quieres expandir capacidad (comprar máquinas, capacitar mano de obra) o mejorar eficiencia (gasto en I+D).',
    step4_consider: 'Considera: ¿Tienes efectivo? ¿La demanda futura justificará la inversión?',

    step5_title: 'Paso 5: Planificar Financiamiento',
    step5_desc: 'Determina si necesitas pedir prestado dinero (nueva deuda) o puedes pagar deuda existente. Considera pagar dividendos si tienes exceso de efectivo.',
    step5_warning: 'Advertencia: Pedir prestado aumenta el gasto de intereses, lo que reduce la utilidad neta.',

    step6_title: 'Paso 6: Enviar Decisiones',
    step6_desc: 'Haz clic en "Enviar Decisiones Ronda X" y genera un ticket de envío. Copia los datos y envíalos a tu instructor (a través de Google Form u otro método).',
    step6_deadline: '¡Presta atención a las fechas límite de envío! Los envíos tardíos pueden no ser aceptados.',

    step7_title: 'Paso 7: Esperar al Instructor',
    step7_desc: 'Después de que todas las empresas envíen, tu instructor "limpiará" la ronda. Esto significa que procesará todas las decisiones y calculará resultados a nivel de mercado.',
    step7_patience: 'Este paso requiere paciencia. El instructor determina cuándo están listos los resultados.',

    step8_title: 'Paso 8: Ver Resultados y Clasificación',
    step8_desc: 'Una vez que se limpia la ronda, tus resultados reales aparecen en la tabla. Compara proyectado vs. real. Revisa la tabla de clasificación para ver rankings por ROE.',
    step8_learn: '¡Aprende de las diferencias: ¿Por qué los resultados reales difirieron de las proyecciones? Ajusta tu estrategia para la siguiente ronda!',

    resubmission: '¿Puedo reenviar? Sí, hasta que cierre la ronda. Tu último envío cuenta.',
    timing: 'Cronograma típico: 1-2 días por ronda, dependiendo del horario de la clase.'
  },

  // Sección 5: Consejos Estratégicos
  tips: {
    title: 'Consejos Estratégicos y Errores Comunes',
    intro: 'Aprende de estos patrones comunes para mejorar tu desempeño.',

    cash_warning_title: '🚨 ¡No Te Quedes Sin Efectivo!',
    cash_warning_desc: 'El error #1 que cometen los principiantes. Si tu saldo de efectivo proyectado se vuelve negativo, estás en modo crisis.',
    cash_warning_solution: 'Soluciones: Pide deuda a corto plazo, reduce producción, posterga inversiones o recorta dividendos.',
    cash_warning_prevention: 'Prevención: Siempre proyecta tu flujo de efectivo antes de enviar. Construye un colchón de efectivo (5-10% de los ingresos).',

    capacity_title: '⚙️ Optimiza la Utilización de Capacidad',
    capacity_desc: 'Operar al 80-100% de capacidad distribuye los costos fijos (como la depreciación de máquinas) sobre más unidades, reduciendo el costo por unidad.',
    capacity_too_low: 'Muy bajo (<60%): Estás desperdiciando capacidad. Produce más o reduce capacidad.',
    capacity_too_high: '(>100%): ¡Imposible! No puedes exceder el 100%. Reduce producción o invierte en más máquinas/mano de obra.',
    capacity_sweet_spot: 'Punto ideal: 85-95% te da flexibilidad mientras te mantienes eficiente.',

    contribution_margin_title: '💡 Enfócate en el Margen de Contribución',
    contribution_margin_desc: 'No todas las ventas son igualmente rentables. Margen de contribución = Precio − Costo Variable por Unidad.',
    contribution_margin_formula: 'Calcula: (Precio − Costo de Material − Costo de Hora Máquina − Costo de Hora de Mano de Obra) por unidad',
    contribution_margin_strategy: 'Si la capacidad es limitada, prioriza productos con el mayor margen de contribución por hora de cuello de botella (usualmente horas máquina).',
    contribution_margin_example: 'Ejemplo: Producto A gana $20 por hora máquina, Producto B gana $15. ¡Enfócate en A!',

    debt_title: '📊 Usa la Deuda Estratégicamente',
    debt_good: '¡La deuda no es inherentemente mala! Puede aumentar el ROE si ganas más que la tasa de interés.',
    debt_leverage: 'Efecto de apalancamiento: Pides prestado al 8%, ganas 15% ROE → te quedas con el diferencial del 7% por dólar prestado.',
    debt_danger: 'Peligro: Demasiada deuda aumenta el gasto de intereses y el riesgo financiero. Si las ganancias caen, aún debes intereses.',
    debt_types: 'Deuda a corto plazo: Tasa alta (~10%), pagar rápido. Deuda a largo plazo: Tasa más baja (~6%), pagar con el tiempo.',

    competitors_title: '👀 Observa a tus Competidores',
    competitors_leaderboard: 'Revisa la tabla de clasificación cada ronda. ¿Quién lidera? ¿Por qué?',
    competitors_market: 'Monitorea la dinámica del mercado: Si todos suben precios, la demanda puede cambiar. Si todos sobreproducen, los precios caen.',
    competitors_strategy: 'Adapta tu estrategia: Si estás atrás, toma riesgos calculados. Si estás adelante, protege tu posición.',

    growth_title: '🌱 Balancea Crecimiento vs. Ganancia',
    growth_tradeoff: 'Invertir en máquinas/mano de obra cuesta efectivo ahora pero aumenta la capacidad después.',
    growth_timing: 'Rondas tempranas: Invierte si la demanda está creciendo. Rondas tardías: Enfócate en ganancia (no hay tiempo para recuperar inversiones).',
    growth_roe_impact: 'El crecimiento reduce el ROE a corto plazo (efectivo gastado, sin retorno inmediato) pero puede aumentar el ROE a largo plazo.',

    pricing_title: '💵 Estrategia de Precios',
    pricing_higher: 'Precio muy alto: Menos unidades vendidas, pero mayor margen por unidad.',
    pricing_lower: 'Precio muy bajo: Más unidades vendidas, pero menor margen por unidad.',
    pricing_optimal: 'Precio óptimo: Maximiza el margen de contribución total (unidades vendidas × margen por unidad).',
    pricing_market: 'Considera los pronósticos de demanda del mercado. Si la demanda es alta, puedes cobrar más.',

    fifo_title: '📦 Entiende el Inventario FIFO',
    fifo_desc: 'El juego usa costeo de inventario FIFO (Primero en Entrar, Primero en Salir). El inventario más antiguo se vende primero.',
    fifo_impact: 'Si los costos cambian con el tiempo (ej., invertiste en eficiencia), tu COGS refleja los costos más antiguos y altos primero.',
    fifo_strategy: 'Para reducir COGS rápidamente después de ganancias de eficiencia, vende el inventario antiguo rápido.'
  },

  // Sección 6: Glosario
  glossary: {
    title: 'Glosario de Términos Financieros',
    intro: 'Referencia rápida para toda la terminología financiera usada en el juego.',

    terms: [
      {
        english: 'Assets',
        spanish: 'Activos',
        definition: 'Lo que tu empresa posee: efectivo, inventario, activos fijos (máquinas).'
      },
      {
        english: 'Balance Sheet',
        spanish: 'Balance General / Estado de Situación Financiera',
        definition: 'Instantánea financiera que muestra Activos = Pasivos + Patrimonio en un punto en el tiempo.'
      },
      {
        english: 'COGS (Cost of Goods Sold)',
        spanish: 'Costo de Bienes Vendidos',
        definition: 'Costos variables de las unidades vendidas (materiales, tiempo de máquina, mano de obra).'
      },
      {
        english: 'Contribution Margin',
        spanish: 'Margen de Contribución',
        definition: 'Precio menos costo variable por unidad. Muestra la rentabilidad por unidad vendida.'
      },
      {
        english: 'Depreciation',
        spanish: 'Depreciación',
        definition: 'Los activos fijos pierden valor cada año (5% en este juego). Gasto no monetario.'
      },
      {
        english: 'EBIT (Earnings Before Interest & Taxes)',
        spanish: 'UAII (Utilidad Antes de Intereses e Impuestos)',
        definition: 'Ganancia operativa antes de considerar los costos de deuda e impuestos.'
      },
      {
        english: 'Equity',
        spanish: 'Patrimonio / Capital Contable',
        definition: 'Inversión de accionistas más ganancias retenidas. Lo que los dueños tienen en la empresa.'
      },
      {
        english: 'Fixed Assets',
        spanish: 'Activos Fijos',
        definition: 'Activos a largo plazo como máquinas. El valor disminuye por depreciación.'
      },
      {
        english: 'Gross Profit',
        spanish: 'Margen Bruto / Utilidad Bruta',
        definition: 'Ingresos menos COGS. Ganancia antes de gastos operativos.'
      },
      {
        english: 'Income Statement',
        spanish: 'Estado de Resultados / Estado de Pérdidas y Ganancias',
        definition: 'Muestra ingresos, gastos y ganancias durante un período (una ronda).'
      },
      {
        english: 'Interest',
        spanish: 'Intereses',
        definition: 'Costo de pedir prestado dinero. Se calcula como deuda × tasa de interés.'
      },
      {
        english: 'Inventory',
        spanish: 'Inventario',
        definition: 'Productos terminados que aún no se han vendido. Almacenados para ventas futuras.'
      },
      {
        english: 'Liabilities',
        spanish: 'Pasivos',
        definition: 'Lo que tu empresa debe: deuda a corto plazo, deuda a largo plazo.'
      },
      {
        english: 'LT Debt (Long-Term Debt)',
        spanish: 'Deuda a Largo Plazo',
        definition: 'Préstamos con tasas de interés más bajas, pagados en múltiples rondas.'
      },
      {
        english: 'Net Income',
        spanish: 'Utilidad Neta / Ganancia Neta',
        definition: 'Ganancia final después de todos los gastos. Usado para calcular ROE.'
      },
      {
        english: 'Revenue',
        spanish: 'Ingresos / Ventas',
        definition: 'Dinero total ganado por la venta de productos. Precio × Cantidad para cada producto.'
      },
      {
        english: 'ROE (Return on Equity)',
        spanish: 'Retorno sobre Patrimonio / ROE',
        definition: 'Utilidad Neta ÷ Patrimonio. LA MÉTRICA GANADORA. Mide ganancia por dólar de patrimonio.'
      },
      {
        english: 'ST Debt (Short-Term Debt)',
        spanish: 'Deuda a Corto Plazo',
        definition: 'Préstamos con tasas de interés más altas, típicamente pagados dentro de una ronda.'
      },
      {
        english: 'Taxes',
        spanish: 'Impuestos',
        definition: 'Impuesto corporativo sobre la renta sobre EBIT menos intereses. Porcentaje establecido por el instructor.'
      },
      {
        english: 'Utilization',
        spanish: 'Utilización de Capacidad',
        definition: 'Porcentaje de capacidad usada. (Horas Usadas ÷ Horas Disponibles) × 100%.'
      }
    ],

    footer: 'Recuerda: ¡No necesitas memorizar esto! Usa este glosario como referencia en cualquier momento.'
  },

  // Elementos comunes de UI
  close: 'Cerrar',
  back: 'Atrás',
  next: 'Siguiente',
  got_it: '¡Entendido!',
  learn_more: 'Aprende Más'
};
