// Guías y preguntas frecuentes por herramienta. Texto plano (sin HTML).
// Se muestran bajo cada herramienta y se incluyen en el HTML estático para buscadores (FAQPage).

export const GUIDES = {
  'farmacias-de-turno': {
    titulo: 'Sobre las farmacias de turno',
    faq: [
      { q: '¿Qué es una farmacia de turno?', a: 'Es la farmacia que, por un sistema de turnos coordinado con la autoridad sanitaria, atiende fuera del horario habitual (de noche, fines de semana y festivos) para que siempre haya una disponible en la zona.' },
      { q: '¿Cada cuánto cambian los turnos?', a: 'Los turnos cambian cada día. Esta página muestra los turnos informados por el Ministerio de Salud para hoy; antes de ir, llama para confirmar.' },
      { q: '¿Qué hago si es una emergencia?', a: 'Si la situación es grave, llama al 131 (SAMU) o acude al servicio de urgencia más cercano.' },
    ],
  },
  'compras-extranjero': {
    titulo: 'Impuestos a las compras en el extranjero',
    pasos: [
      'Suma el precio del producto y el costo del envío en dólares.',
      'Si el total es de hasta USD 500 y la tienda está inscrita en el SII, pagas 19% de IVA al comprar, sin arancel.',
      'Si la tienda no cobra el IVA, lo pagas junto con el arancel cuando el envío llega a Chile.',
      'Si el total supera USD 500, pagas arancel de 6% sobre el valor con envío y 19% de IVA sobre ese total.',
    ],
    faq: [
      { q: '¿Desde cuándo se paga IVA en compras bajo USD 500?', a: 'Desde el 25 de octubre de 2025, por la Ley 21.713.' },
      { q: '¿Qué tiendas cobran el IVA al comprar?', a: 'Las plataformas extranjeras inscritas en el SII, como AliExpress, Temu, Shein y Amazon, cobran el IVA en el carrito. El SII publica la lista de plataformas inscritas.' },
    ],
  },
  'licencia-medica': {
    titulo: 'Cómo se calcula el pago de una licencia médica',
    pasos: [
      'Se suman las remuneraciones imponibles de los 3 meses anteriores al inicio de la licencia y se descuentan las cotizaciones (AFP, salud y seguro de cesantía).',
      'Ese total se divide por 90 para obtener el subsidio diario.',
      'Si la licencia es de hasta 10 días, no se pagan los 3 primeros días. Si es de 11 días o más, se pagan todos.',
      'El subsidio diario se multiplica por los días pagados.',
    ],
    faq: [
      { q: '¿Quién paga la licencia médica?', a: 'Si estás en Fonasa, la paga la COMPIN o tu caja de compensación. Si estás en una Isapre, la paga la Isapre. El empleador sigue pagando tus cotizaciones durante la licencia.' },
      { q: '¿El subsidio paga impuesto?', a: 'No. El subsidio por incapacidad laboral no paga impuesto, pero sí se siguen enterando las cotizaciones previsionales y de salud.' },
    ],
  },
  vacaciones: {
    titulo: 'Cuántas vacaciones te corresponden',
    faq: [
      { q: '¿Cuántos días de vacaciones tengo al año?', a: 'Después de un año de trabajo corresponden 15 días hábiles de feriado anual con goce de remuneración. Para las vacaciones, el sábado siempre se considera día inhábil.' },
      { q: '¿Qué son las vacaciones progresivas?', a: 'Con 10 años cotizados, con uno o más empleadores, se suma un día de vacaciones por cada 3 años nuevos trabajados con el empleador actual. Solo se pueden hacer valer hasta 10 años de trabajo con empleadores anteriores.' },
      { q: '¿Puedo acumular vacaciones?', a: 'Sí, pero solo hasta dos períodos consecutivos. Los días no tomados se pagan en el finiquito al terminar la relación laboral.' },
    ],
  },
  olas: {
    titulo: 'Cómo leer un pronóstico de olas',
    faq: [
      { q: '¿Qué significa la altura de ola?', a: 'Es la altura significativa: el promedio del tercio de olas más altas. Algunas olas individuales pueden ser bastante más grandes.' },
      { q: '¿Qué es el período?', a: 'Son los segundos entre una ola y la siguiente. Un período largo (12 segundos o más) indica olas con más fuerza, típicas de un mar de fondo.' },
      { q: '¿Dónde se informan las marejadas?', a: 'El Servicio Hidrográfico y Oceanográfico de la Armada (SHOA) emite los avisos oficiales de marejadas para la costa de Chile.' },
    ],
  },
  'uf-hoy': {
    titulo: 'Qué es la UF y cómo cambia',
    faq: [
      { q: '¿Por qué cambia la UF todos los días?', a: 'El Banco Central la reajusta a diario para que, entre el 10 de un mes y el 9 del siguiente, acumule la inflación (IPC) del mes anterior.' },
      { q: '¿Para qué se usa la UF?', a: 'Para fijar montos que deben mantener su valor en el tiempo: arriendos, dividendos, seguros, planes de Isapre, multas y contratos.' },
    ],
  },
  'dolar-hoy': {
    titulo: 'Qué es el dólar observado',
    faq: [
      { q: '¿Qué es el dólar observado?', a: 'Es el tipo de cambio que publica el Banco Central cada día hábil, calculado con las operaciones del día hábil anterior. Es la referencia oficial para contratos y declaraciones.' },
      { q: '¿Por qué el banco me cobra otro valor?', a: 'Bancos y casas de cambio fijan sus propios precios de compra y venta, que incluyen su margen. El dólar observado sirve como referencia.' },
    ],
  },
  'sueldo-liquido': {
    titulo: 'Cómo se calcula el sueldo líquido',
    pasos: [
      'Se parte del sueldo bruto imponible: sueldo base, gratificación, horas extra y bonos imponibles.',
      'Se descuenta la AFP: 10% para tu cuenta más la comisión de tu AFP (entre 0,46% y 1,45%).',
      'Se descuenta la salud: 7% en Fonasa o el valor de tu plan si estás en Isapre (mínimo 7%).',
      'Si tienes contrato indefinido, se descuenta 0,6% para el seguro de cesantía.',
      'Con lo que queda (base tributable) se calcula el impuesto único, que solo pagan quienes superan 13,5 UTM mensuales.',
      'Al resultado se suman los haberes no imponibles, como colación y movilización.',
    ],
    faq: [
      { q: '¿Qué diferencia hay entre sueldo bruto y líquido?', a: 'El bruto es el total que acuerdas con tu empleador antes de descuentos. El líquido es lo que realmente llega a tu cuenta después de descontar AFP, salud, seguro de cesantía e impuesto.' },
      { q: '¿Desde qué sueldo se paga impuesto en Chile?', a: 'El impuesto único de segunda categoría se paga cuando la base tributable mensual supera 13,5 UTM. Bajo ese monto el sueldo está exento.' },
      { q: '¿Hay un máximo para los descuentos previsionales?', a: 'Sí. En 2026 la AFP y la salud se calculan con un tope de 90 UF mensuales, y el seguro de cesantía con un tope de 135,2 UF. Lo que ganes por encima no paga cotizaciones.' },
    ],
  },
  finiquito: {
    titulo: 'Qué incluye el finiquito',
    pasos: [
      'Remuneración de los días trabajados en el último mes que aún no se han pagado.',
      'Feriado proporcional: vacaciones acumuladas y no tomadas, a razón de 1,25 días hábiles por mes trabajado.',
      'Indemnización por años de servicio, solo si te despiden por necesidades de la empresa: 30 días de sueldo por año, con tope de 11 años y 90 UF por mes.',
      'Indemnización sustitutiva del aviso previo: un mes de sueldo si no te avisaron con 30 días de anticipación.',
    ],
    faq: [
      { q: '¿Me corresponde indemnización si renuncio?', a: 'No. Al renunciar solo recibes lo adeudado: días trabajados y vacaciones proporcionales o pendientes. La indemnización por años de servicio corresponde principalmente al despido por necesidades de la empresa.' },
      { q: '¿Cuánto tiempo tiene el empleador para pagar el finiquito?', a: 'El Código del Trabajo establece un plazo de 10 días hábiles desde la separación del trabajador para pagar y poner a disposición el finiquito.' },
      { q: '¿El finiquito paga impuestos?', a: 'Las indemnizaciones legales y el pago de vacaciones no constituyen renta para efectos tributarios ni pagan cotizaciones. La remuneración de los días trabajados sí tiene los descuentos normales.' },
    ],
  },
  'boleta-honorarios': {
    titulo: 'Cómo funciona la retención de boletas de honorarios',
    pasos: [
      'Al emitir una boleta de honorarios, se retiene un porcentaje del monto bruto: 15,25% en 2026.',
      'Quien paga la boleta (si es empresa) entera la retención al SII; si el cliente es persona, la pagas tú.',
      'En la Operación Renta de abril, esa retención se usa para pagar tus cotizaciones previsionales y el impuesto a la renta.',
      'Si la retención supera lo que debías, el SII te devuelve la diferencia.',
    ],
    faq: [
      { q: '¿Cuánto sube la retención de honorarios?', a: 'La retención sube gradualmente: 15,25% en 2026, 16% en 2027 y 17% en 2028, según la Ley 21.133.' },
      { q: '¿Cómo calculo cuánto cobrar para recibir un monto líquido?', a: 'Divide el líquido que quieres recibir por 0,8475 (1 menos 15,25%). Por ejemplo, para recibir $500.000 debes emitir una boleta por $589.971.' },
    ],
  },
  'horas-extra': {
    titulo: 'Cómo se calcula la hora extra',
    pasos: [
      'Se toma el sueldo base mensual y se divide por 30 para obtener el valor del día.',
      'Se multiplica por 28 y se divide por 4 veces la jornada semanal (42 horas desde abril de 2026) para obtener el valor de la hora ordinaria.',
      'Se agrega el recargo legal mínimo del 50%.',
      'Con jornada de 42 horas, el valor de la hora extra es el sueldo base multiplicado por 0,0083333.',
    ],
    faq: [
      { q: '¿Cuántas horas extra se pueden trabajar?', a: 'Hasta 2 horas extra por día, y solo si se pactan por escrito para atender necesidades temporales de la empresa. El pacto dura como máximo 3 meses y se puede renovar.' },
      { q: '¿Qué pasa si mi sueldo base es menor al mínimo?', a: 'Las horas extra se calculan sobre el ingreso mínimo mensual (proporcional si tienes jornada parcial), aunque tu sueldo base sea menor.' },
    ],
  },
  gratificacion: {
    titulo: 'Tipos de gratificación legal',
    faq: [
      { q: '¿Qué es la gratificación del artículo 50?', a: 'Es la modalidad más usada: el empleador paga el 25% de lo devengado por el trabajador en el año, con un tope de 4,75 ingresos mínimos mensuales al año. Normalmente se paga en cuotas mensuales.' },
      { q: '¿Y la del artículo 47?', a: 'Consiste en repartir entre los trabajadores al menos el 30% de las utilidades líquidas de la empresa, en proporción a lo que gana cada uno. El empleador elige cuál de las dos modalidades aplicar.' },
      { q: '¿La gratificación es imponible?', a: 'Sí. La gratificación forma parte de la remuneración imponible, por lo que paga AFP, salud, seguro de cesantía e impuesto.' },
    ],
  },
  iva: {
    titulo: 'Cómo calcular el IVA',
    faq: [
      { q: '¿Cómo agrego el IVA a un monto neto?', a: 'Multiplica el monto neto por 1,19. Por ejemplo, $100.000 neto son $119.000 con IVA.' },
      { q: '¿Cómo saco el IVA de un precio total?', a: 'Divide el total por 1,19 para obtener el neto; la diferencia es el IVA. Por ejemplo, de $119.000 el neto es $100.000 y el IVA $19.000.' },
    ],
  },
  indicadores: {
    titulo: 'Qué son la UF y la UTM',
    faq: [
      { q: '¿Qué es la UF?', a: 'La Unidad de Fomento es una unidad de cuenta reajustable según la inflación (IPC). La calcula el Banco Central y cambia todos los días. Se usa en créditos hipotecarios, arriendos, seguros y planes de salud.' },
      { q: '¿Qué es la UTM?', a: 'La Unidad Tributaria Mensual es un monto en pesos que se actualiza cada mes según el IPC. Se usa para calcular impuestos, multas y topes legales.' },
      { q: '¿Qué es el dólar observado?', a: 'Es el tipo de cambio promedio de las operaciones del día anterior que publica el Banco Central. Sirve de referencia, pero bancos y casas de cambio usan sus propios precios de compra y venta.' },
    ],
  },
  rut: {
    titulo: 'Cómo se calcula el dígito verificador del RUT',
    pasos: [
      'Toma los números del RUT sin el dígito verificador y recórrelos de derecha a izquierda.',
      'Multiplica cada dígito por la serie 2, 3, 4, 5, 6, 7, volviendo a 2 después del 7.',
      'Suma los resultados y calcula el resto de dividir por 11.',
      'Resta ese resto a 11. Si da 11, el dígito es 0; si da 10, es K; en otro caso, es el número obtenido.',
    ],
    faq: [
      { q: '¿Validar el RUT confirma que la persona existe?', a: 'No. Solo comprueba que el dígito verificador sea correcto. Para saber a quién pertenece un RUT hay que consultar fuentes oficiales como el Registro Civil o el SII.' },
    ],
  },
  feriados: {
    titulo: 'Preguntas frecuentes sobre feriados',
    faq: [
      { q: '¿Cuáles son los feriados irrenunciables?', a: 'El 1 de enero, el 1 de mayo, el 18 y 19 de septiembre y el 25 de diciembre. En esos días los trabajadores del comercio no pueden trabajar, salvo excepciones legales.' },
      { q: '¿Por qué algunos feriados se mueven al lunes?', a: 'Por ley, San Pedro y San Pablo y el Encuentro de Dos Mundos se trasladan al lunes más cercano cuando caen de martes a viernes, para evitar días sueltos.' },
      { q: '¿Cuándo es el Día de los Pueblos Indígenas?', a: 'Se celebra el día del solsticio de invierno, que puede caer el 20 o el 21 de junio según el año.' },
    ],
  },
  'dias-habiles': {
    titulo: 'Qué se considera día hábil',
    faq: [
      { q: '¿El sábado es día hábil?', a: 'Depende del tipo de plazo. En los trámites administrativos (Ley 19.880) los sábados no son hábiles. En los plazos judiciales del Código de Procedimiento Civil, el sábado sí es hábil. Revisa qué norma rige tu plazo.' },
      { q: '¿Los feriados cuentan como días hábiles?', a: 'No. Los domingos y feriados nunca son días hábiles.' },
    ],
  },
  'credito-consumo': {
    titulo: 'Cómo comparar créditos de consumo',
    faq: [
      { q: '¿Qué es la CAE?', a: 'La Carga Anual Equivalente expresa en un solo porcentaje anual el costo total del crédito: intereses, seguros, comisiones y gastos. Los bancos están obligados a informarla y es el mejor dato para comparar ofertas.' },
      { q: '¿Por qué mi CAE es mayor que la tasa de interés?', a: 'Porque incluye los seguros y gastos asociados. Un crédito con tasa baja pero muchos seguros puede resultar más caro que otro con tasa algo mayor.' },
      { q: '¿Estoy obligado a contratar los seguros?', a: 'Solo el seguro de desgravamen suele ser exigible. Los demás seguros son voluntarios y puedes rechazarlos o contratarlos con otra compañía.' },
    ],
  },
  apv: {
    titulo: 'APV: diferencias entre régimen A y B',
    faq: [
      { q: '¿Qué es el APV?', a: 'El Ahorro Previsional Voluntario permite ahorrar para tu pensión con beneficios tributarios. Puedes hacerlo en AFP, bancos, fondos mutuos o compañías de seguros.' },
      { q: '¿Cómo funciona el régimen A?', a: 'El Estado te bonifica el 15% de lo que ahorras en el año, con un tope de 6 UTM anuales. La bonificación se deposita al año siguiente y solo se puede usar para la pensión.' },
      { q: '¿Cómo funciona el régimen B?', a: 'El monto ahorrado se descuenta de tu base tributable, por lo que pagas menos impuesto. El tope es de 50 UF mensuales (600 UF al año). Conviene a quienes están en tramos de impuesto altos.' },
    ],
  },
  dividendo: {
    titulo: 'Qué considerar al pedir un crédito hipotecario',
    faq: [
      { q: '¿Cuánto pie necesito?', a: 'La mayoría de los bancos financia hasta el 80% o 90% del valor de la propiedad, por lo que se necesita entre 10% y 20% de pie, más los gastos operacionales.' },
      { q: '¿Cuánto debo ganar para un crédito hipotecario?', a: 'Los bancos suelen exigir que el dividendo no supere entre el 25% y el 30% de la renta líquida del hogar.' },
    ],
  },
  'reajuste-arriendo': {
    titulo: 'Cómo se reajusta un arriendo',
    faq: [
      { q: '¿Cada cuánto se puede reajustar el arriendo?', a: 'Lo define el contrato. Lo más común es un reajuste semestral o anual según la variación del IPC o de la UF.' },
      { q: '¿Por qué se usa la UF para calcular el reajuste?', a: 'Porque la UF se reajusta diariamente según el IPC, así que su variación entre dos fechas refleja la inflación del período con un desfase de alrededor de un mes.' },
    ],
  },
  bencinas: {
    titulo: 'Sobre los precios de los combustibles',
    faq: [
      { q: '¿Por qué los precios cambian cada semana?', a: 'Los precios mayoristas se ajustan semanalmente según el mercado internacional, suavizados por el Mecanismo de Estabilización de Precios de los Combustibles (MEPCO). Cada estación fija luego su precio de venta.' },
      { q: '¿Cuál es la diferencia entre autoservicio y asistido?', a: 'En autoservicio cargas tú mismo y suele ser algo más barato. En la atención asistida te atiende un bombero.' },
      { q: '¿De dónde vienen estos precios?', a: 'De Bencina en Línea, el sistema de la Comisión Nacional de Energía donde las estaciones de servicio deben informar sus precios.' },
    ],
  },
  'fines-de-semana-largos': {
    titulo: 'Cómo aprovechar los feriados',
    faq: [
      { q: '¿Qué es un interferiado?', a: 'Es un día hábil entre un feriado y el fin de semana. A veces el Gobierno lo declara feriado para el sector público, pero no es obligatorio para el sector privado, donde normalmente se toma como día de vacaciones.' },
      { q: '¿Cuántos días de vacaciones tengo al año?', a: 'Los trabajadores con más de un año de antigüedad tienen 15 días hábiles de feriado anual, más días adicionales por vacaciones progresivas después de 10 años de trabajo.' },
    ],
  },
  'cambio-de-hora': {
    titulo: 'Horario de invierno y de verano en Chile',
    faq: [
      { q: '¿Cuándo se cambia la hora en Chile?', a: 'En Chile continental el horario de invierno comienza el primer domingo de abril (se atrasa una hora) y el horario de verano el primer domingo de septiembre (se adelanta una hora).' },
      { q: '¿Qué regiones no cambian la hora?', a: 'Magallanes y Aysén mantienen el horario UTC−3 todo el año.' },
    ],
  },
  sismos: {
    titulo: 'Qué hacer durante un sismo',
    faq: [
      { q: '¿Qué debo hacer durante un temblor?', a: 'Mantén la calma, agáchate, cúbrete bajo una mesa firme y afírmate hasta que termine. Aléjate de ventanas y objetos que puedan caer.' },
      { q: '¿Cuándo debo evacuar por tsunami?', a: 'Si estás en la costa y el sismo te impide mantenerte en pie, evacúa de inmediato hacia la zona segura sin esperar alertas. Luego sigue las instrucciones de SENAPRED y el SHOA.' },
      { q: '¿Cuál es la fuente oficial de sismos en Chile?', a: 'El Centro Sismológico Nacional de la Universidad de Chile (sismologia.cl). Esta página usa datos del Servicio Geológico de Estados Unidos, que pueden diferir levemente.' },
    ],
  },
  clima: {
    titulo: 'Índice UV y calidad del aire',
    faq: [
      { q: '¿Qué significa el índice UV?', a: 'Mide la intensidad de la radiación ultravioleta del sol. Desde 3 (moderado) se recomienda protección; desde 8 (muy alto) hay que evitar la exposición en las horas centrales del día.' },
      { q: '¿Qué es el MP2,5?', a: 'Son partículas contaminantes de menos de 2,5 micrones, que llegan a los pulmones. En Chile se declaran episodios críticos (alerta, preemergencia y emergencia) cuando su concentración supera ciertos niveles.' },
    ],
  },
  'comparador-historico': {
    titulo: 'Cómo se mide la inflación',
    faq: [
      { q: '¿Cómo sé cuánto valen hoy los pesos de otro año?', a: 'Se compara el valor de la UF en ambas fechas. Como la UF se reajusta con el IPC, la proporción entre ambas muestra cuánto subieron los precios en ese período.' },
    ],
  },
  'consumo-electrico': {
    titulo: 'Cómo calcular el consumo de un aparato',
    pasos: [
      'Busca la potencia del aparato en watts (W) en su etiqueta o manual.',
      'Multiplica la potencia por las horas de uso al día y por 30 días, y divide por 1.000 para obtener los kWh al mes.',
      'Multiplica los kWh por el precio del kWh de tu boleta para obtener el costo mensual.',
    ],
    faq: [
      { q: '¿Qué aparatos gastan más luz?', a: 'Los que generan calor: estufas eléctricas, termos, hervidores, secadoras y hornos. Una estufa de 1.500 W encendida 4 horas al día consume unos 180 kWh al mes.' },
    ],
  },
}
