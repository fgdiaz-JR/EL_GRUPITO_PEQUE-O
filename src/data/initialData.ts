import { Message, Series } from "../types";

export const initialSeries: Series[] = [
  {
    id: "gomez-2026",
    titulo: "Pastor Daniel Gómez - 2026",
    descripcion: "Sermones y reflexiones inspiradoras del Pastor Daniel Gómez durante el año 2026.",
    color: "from-amber-500 to-orange-600",
    icon: "BookOpen",
  },
  {
    id: "gomez-2025",
    titulo: "Pastor Daniel Gómez - 2025",
    descripcion: "Mensajes doctrinales expuestos por el Pastor Daniel Gómez en el año 2025.",
    color: "from-yellow-600 to-amber-700",
    icon: "BookOpen",
  },
  {
    id: "elena-2026",
    titulo: "Misionera Elena Castro - 2026",
    descripcion: "Estudios bíblicos y devocionales guiados por la Misionera Elena Castro en 2026.",
    color: "from-emerald-500 to-teal-600",
    icon: "Users",
  },
  {
    id: "benitez-2024",
    titulo: "Pastor Marcos Benítez - 2024",
    descripcion: "Enseñanzas prácticas y sermones del Pastor Marcos Benítez durante el año 2024.",
    color: "from-teal-600 to-emerald-700",
    icon: "Users",
  },
];

export const initialMessages: Message[] = [
  {
    id: "1",
    codigo: "GOM-2026-01",
    titulo: "El Clamor de la Oración en Tiempos de Cambio",
    fecha: "2026-01-10",
    serie_id: "gomez-2026",
    autor: "Pastor Daniel Gómez",
    contenido: `# El Clamor de la Oración en Tiempos de Cambio

La verdadera fuerza de una comunidad reside en su capacidad para detenerse y unirse en un solo clamor. La **oración** no es el último recurso ante la dificultad, sino el fundamento de cada paso que damos.

## 1. El poder de la quietud
En una sociedad acelerada que valora la acción inmediata, la quietud se percibe como debilidad. Sin embargo, en el silencio de la oración secreta es donde se tejen las mayores victorias de la fe.

> "El hombre que dobla sus rodillas ante el Creador puede mantenerse en pie ante cualquier tempestad."

## 2. La Oración comunitaria
Cuando la comunidad de **EL GRUPITO PEQUEÑO** se reúne con un mismo sentir, se activa un lazo invisible que sostiene al caído y anima al cansado. Esta comunión es nuestro mayor tesoro.

### Aspectos clave de la oración compartida:
* **Intercesión mutua:** Llevar las cargas de los otros en fe.
* **Gratitud constante:** Reconocer las bendiciones diarias, incluso en las pruebas.
* **Propósito común:** Alinear los proyectos locales con la sabiduría suprema.

Que este año 2026 sea una temporada donde nuestro altar de oración nunca permanezca apagado.`,
  },
  {
    id: "2",
    codigo: "GOM-2026-02",
    titulo: "Edificando un Hogar sobre la Roca Abundante",
    fecha: "2026-02-05",
    serie_id: "gomez-2026",
    autor: "Pastor Daniel Gómez",
    contenido: `# Edificando un Hogar sobre la Roca Abundante

La **familia** es la primera escuela del alma. Los cimientos de un hogar no se miden por el cemento o sus ladrillos, sino por la fortaleza de los valores que dentro de él se transmiten día tras día.

## Cimientos de Sabiduría
Para construir un hogar duradero, debemos consolidar pilares inamovibles:
1. **El Respeto Continuo:** Valorar la individualidad de cada miembro de la casa.
2. **La Escucha Activa:** Reservar tiempo sin dispositivos móviles para hablar de corazón a corazón.
3. **El Perdón Práctico:** No dejar que se ponga el sol sobre nuestros enojos.

## El Rol de los Padres
Transmitir fe y civismo no se hace con discursos largos, sino con el ejemplo diario. Los hijos no siempre escuchan lo que decimos, pero jamás olvidan lo que nos ven hacer en los momentos cotidianos.

> "Un hogar edificado con amor y fe es un refugio seguro contra cualquier viento doctrinal."`,
  },
  {
    id: "3",
    codigo: "GOM-2026-03",
    titulo: "Nuestra Identidad en el Servicio Mutuo de EL GRUPITO PEQUEÑO",
    fecha: "2026-03-14",
    serie_id: "gomez-2026",
    autor: "Pastor Daniel Gómez",
    contenido: `# Nuestra Identidad en el Servicio Mutuo

Nuestra comunidad en **EL GRUPITO PEQUEÑO** se caracteriza por un espíritu inquebrantable de ayuda mutua. Servir no es una tarea obligada, sino la expresión física del amor que profesamos.

## El Altruismo es Conectarse
Cuando ayudamos al vecino, cuando tendemos una mano en la limpieza del pueblo, o cuando cocinamos para alguien enfermo, estamos tejiendo el tejido de nuestra **identidad**. No somos individuos aislados; formamos un cuerpo vigoroso.

### Características del servicio verdadero:
* **Desinteresado:** Sin esperar aplausos ni reconocimientos públicos.
* **Inmediato:** Respondiendo ante la necesidad del prójimo sin dilaciones.
* **Afectuoso:** Con una sonrisa que devuelva la dignidad a quien recibe el favor.

Recuerda que el que no vive para servir, no sirve para vivir. Busquemos esta semana una oportunidad real para demostrar nuestra fraternidad.`,
  },
  {
    id: "4",
    codigo: "CAS-2026-01",
    titulo: "El Estudio de las Escrituras y la Sabiduría Diaria",
    fecha: "2026-04-02",
    serie_id: "elena-2026",
    autor: "Misionera Elena Castro",
    contenido: `# El Estudio de las Escrituras y la Sabiduría Diaria

Sumergirse en los textos antiguos no es una actividad puramente intelectual. Es una búsqueda del mapa del alma que nos guía para habitar de manera armoniosa en este mundo.

## Una Lámpara para el Camino
El conocimiento intelectual sin aplicación práctica conduce al orgullo. En cambio, cuando el estudio se traduce en **sabiduría** cotidiana, nos volvemos pacificadores en nuestro entorno.

### Beneficios del estudio sistemático:
* **Claridad Mental:** En medio de la confusión de opiniones de internet, los principios sólidos nos anclan.
* **Restauración Interior:** Palabras que traen consuelo directo a la aflicción.
* **Dirección Clara:** Decisiones laborales y familiares tomadas con prudencia.

Proponeos leer un capítulo con detenimiento cada mañana. Anotad vuestro pasaje favorito y meditad en él mientras camináis por el campo o trabajáis en vuestro taller.`,
  },
  {
    id: "5",
    codigo: "GOM-2026-04",
    titulo: "La Esperanza en la Incertidumbre: Una Luz que No se Apaga",
    fecha: "2026-05-18",
    serie_id: "gomez-2026",
    autor: "Pastor Daniel Gómez",
    contenido: `# La Esperanza en la Incertidumbre: Una Luz que No se Apaga

¿Cómo mantener la **esperanza** cuando las circunstancias a nuestro alrededor parecen confusas y las nubes de la incertidumbre cubren el horizonte? 

## La Esperanza no es Optimismo Vacío
El optimismo cree que todo saldrá mágicamente bien. La esperanza, sin embargo, es mucho más profunda: es la convicción de que Dios tiene el control supremo, sin importar cuán ruda sea la tormenta actual.

> "Aun cuando las higueras no florezcan, la fe nos desafía a cantar y a trabajar."

## Prácticas para custodiar la fe en la prueba:
1. **Recordar las Victorias Pasadas:** Hacer memoria de cómo superamos obstáculos en años anteriores en **EL GRUPITO PEQUEÑO**.
2. **Evitar los Mensajes Alarmistas:** Moderar el consumo de noticias negativas.
3. **Compartir Palabras de Aliento:** Convertirse en el mensajero de esperanza que otros necesitan escuchar hoy.

Mantén tu mirada alta, porque tu redención está cerca. No estás solo en el camino.`,
  },
  {
    id: "6",
    codigo: "BEN-2024-01",
    titulo: "La Paciencia en la Siembra y la Cosecha Espiritual",
    fecha: "2024-11-20",
    serie_id: "benitez-2024",
    autor: "Pastor Marcos Benítez",
    contenido: `# La Paciencia en la Siembra y la Cosecha Espiritual

En la agricultura de **EL GRUPITO PEQUEÑO**, todos sabemos que no puedes plantar una semilla hoy y cosechar sus frutos mañana. Se requiere tiempo, riego, cuidado y, por encima de todo, una profunda **paciencia**.

## El Misterio del Crecimiento Silencioso
Ocurre lo mismo en nuestro espíritu y en la educación de nuestros hijos. Muchas veces oramos por cambios o sembramos buenas acciones y nos frustramos al no ver resultados inmediatos. Pero bajo la tierra, en lo secreto, la vida está abriéndose paso.

### Pasos en el ciclo espiritual:
* **Preparación de la Tierra:** Limpiar el corazón de rencores y amarguras.
* **Siembra Semanal:** Exponer nuestra mente a mensajes de edificación y verdad.
* **La Espera Activa:** Seguir trabajando duro mientras confiamos en que el crecimiento vendrá a su debido tiempo.

No te canses de hacer el bien, porque a su debido tiempo cosecharemos si no desmayamos.`,
  },
  {
    id: "7",
    codigo: "GOM-2025-01",
    titulo: "El Diálogo Intergeneracional en la Familia Moderna",
    fecha: "2025-12-05",
    serie_id: "gomez-2025",
    autor: "Pastor Daniel Gómez",
    contenido: `# El Diálogo Intergeneracional en la Familia Moderna

Uno de los mayores desafíos del siglo XXI es el abismo que se abre entre abuelos, padres e hijos. Los rápidos cambios tecnológicos amenazan con cortar la transmisión de la sabiduría ancestral.

## Un Puente de Amor
La **familia** fuerte es aquella que sabe crear puentes. Los jóvenes traen vitalidad y nuevas perspectivas; los mayores poseen el tesoro de la experiencia sufrida y superada.

### Cómo incentivar la unión en casa:
* **Escuchar Historias:** Organizar una cena a la semana destinada a preguntar a los abuelos cómo era la vida en el campo hace 50 años.
* **Paciencia Tecnológica:** Que los jóvenes enseñen con ternura y sin burlas a usar las nuevas tecnologías a los mayores.
* **Oración Familiar Conjunta:** Unir las manos de tres generaciones es el espectáculo más bello del mundo.

No permitamos que el ruido del televisor silencie las benditas voces de la experiencia en nuestros hogares.`,
  },
  {
    id: "8",
    codigo: "GOM-2025-02",
    titulo: "El Valor de la Unidad Comunitaria ante los Retos",
    fecha: "2025-12-25",
    serie_id: "gomez-2025",
    autor: "Pastor Daniel Gómez",
    contenido: `# El Valor de la Unidad Comunitaria ante los Retos

En este frío mes de diciembre, recordamos que el calor no solo proviene de la leña, sino de nuestros corazones unidos. El verdadero sentido de la **comunidad** en **EL GRUPITO PEQUEÑO** se revela cuando el clima se endurece.

## Ninguno es una Isla
Las mayores dificultades de nuestro pueblo se han superado siempre remando todos en la misma dirección. La división carcome los cimientos de la paz; la unión los consolida.

* **Soportar las flaquezas:** Nadie es perfecto. Tolerar con amor los defectos de nuestros hermanos es el verdadero amor.
* **Priorizar el bien común:** Poner las necesidades de la comunidad por encima de nuestras preferencias personales.

Mantengámonos firmes en un solo espíritu, luchando unánimes por la fe y la prosperidad de nuestra querida comunidad.`,
  }
];
